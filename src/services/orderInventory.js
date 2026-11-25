import { convertConsumptionToStockUnit } from './inventory.js';

const EPS = 1e-9;
const reservationKey = (orderId, itemId) => `order-${orderId}-reserve-${itemId}`;
const returnKey = (orderId, itemId) => `order-${orderId}-return-${itemId}`;

export function calculateInventoryNeeds(items, recipes, simpleItems) {
  const needs = new Map();
  for (const item of items) {
    const quantity = Number(item.quantity || 1);
    for (const recipe of recipes) {
      const bySize = recipe.size_id != null && Number(recipe.size_id) === Number(item.sizeId);
      const layers = recipe.option_id == null ? 0 : Math.max(0, ...(item.options || []).filter(option => Number(option.id) === Number(recipe.option_id)).map(option => Number(option.layers) || 1));
      const multiplier = bySize ? 1 : layers;
      if (multiplier > 0) {
        const id = Number(recipe.inventory_item_id);
        needs.set(id, (needs.get(id) || 0) + Number(recipe.quantity) * quantity * multiplier);
      }
    }
  }

  for (const product of simpleItems) {
    if (recipes.some(recipe => Number(recipe.inventory_item_id) === Number(product.id))) continue;
    let count = 0;
    for (const item of items) {
      const quantity = Number(item.quantity || 1);
      if (product.option_id) {
        const matched = (item.options || []).filter(option => Number(option.id) === Number(product.option_id));
        if (matched.length) count += quantity * Math.max(...matched.map(option => Number(option.layers) || 1));
      } else {
        count += quantity;
      }
    }
    if (count > 0) {
      const amount = convertConsumptionToStockUnit(Number(product.consumption_quantity), product.consumption_unit, product.unit) * count;
      needs.set(Number(product.id), (needs.get(Number(product.id)) || 0) + amount);
    }
  }
  return needs;
}

async function readNeeds(db, items) {
  const [recipeResult, simpleResult] = await Promise.all([
    db.query('SELECT r.inventory_item_id,r.size_id,r.option_id,r.quantity,i.name,i.unit,i.quantity AS stock FROM inventory_recipes r JOIN inventory_items i ON i.id=r.inventory_item_id WHERE i.active=true'),
    db.query('SELECT id,name,unit,quantity,consumption_quantity,consumption_unit,option_id FROM inventory_items WHERE active=true AND consumption_quantity>0')
  ]);
  const needs = calculateInventoryNeeds(items, recipeResult.rows, simpleResult.rows);
  const names = new Map([...recipeResult.rows, ...simpleResult.rows].map(row => [Number(row.inventory_item_id ?? row.id), row.name]));
  return { needs, names };
}

// Must be called inside the same PostgreSQL transaction as the order insert/update.
export async function syncOrderInventoryReservation(db, { orderId, items }) {
  const { needs, names } = await readNeeds(db, items);
  const currentRows = await db.query("SELECT id,inventory_item_id,quantity FROM inventory_movements WHERE order_id=$1 AND movement_type='reserva' ORDER BY inventory_item_id FOR UPDATE", [orderId]);
  const current = new Map(currentRows.rows.map(row => [Number(row.inventory_item_id), Number(row.quantity)]));
  const ids = [...new Set([...current.keys(), ...needs.keys()])].sort((a, b) => a - b);
  if (!ids.length) return { reserved: 0 };
  const stockRows = await db.query('SELECT id,name,quantity,auto_disable,option_id FROM inventory_items WHERE id=ANY($1::bigint[]) ORDER BY id FOR UPDATE', [ids]);
  const stockById = new Map(stockRows.rows.map(row => [Number(row.id), row]));

  for (const id of ids) {
    const row = stockById.get(id);
    if (!row) throw Object.assign(new Error('Um ingrediente do pedido não existe mais no estoque.'), { status: 409 });
    const before = current.get(id) || 0;
    const after = needs.get(id) || 0;
    const delta = after - before;
    if (delta > EPS) {
      const updated = await db.query('UPDATE inventory_items SET quantity=quantity-$1,updated_at=NOW() WHERE id=$2 AND quantity >= $1 RETURNING quantity', [delta, id]);
      if (!updated.rowCount) throw Object.assign(new Error(`Estoque insuficiente de ${row.name}. Atualize o pedido ou escolha outra opção.`), { status: 409 });
      await db.query('UPDATE options o SET active=CASE WHEN i.auto_disable THEN i.quantity>0 ELSE o.active END FROM inventory_items i WHERE i.id=$1 AND o.id=i.option_id', [id]);
    } else if (delta < -EPS) {
      await db.query('UPDATE inventory_items SET quantity=quantity+$1,updated_at=NOW() WHERE id=$2', [-delta, id]);
      await db.query('UPDATE options o SET active=CASE WHEN i.auto_disable THEN i.quantity>0 ELSE o.active END FROM inventory_items i WHERE i.id=$1 AND o.id=i.option_id', [id]);
    }
    if (after <= EPS) {
      if (current.has(id)) await db.query('DELETE FROM inventory_movements WHERE id=$1', [currentRows.rows.find(m => Number(m.inventory_item_id) === id).id]);
    } else if (current.has(id)) {
      await db.query('UPDATE inventory_movements SET quantity=$1 WHERE id=$2', [after, currentRows.rows.find(m => Number(m.inventory_item_id) === id).id]);
    } else {
      await db.query(`INSERT INTO inventory_movements(inventory_item_id,movement_type,quantity,unit_cost,reason,order_id,idempotency_key) VALUES($1,'reserva',$2,0,'Reserva automática do pedido',$3,$4) ON CONFLICT(idempotency_key) DO NOTHING`, [id, after, orderId, reservationKey(orderId, id)]);
    }
  }
  return { reserved: needs.size };
}

// Converts an existing reservation into consumption without subtracting stock twice.
export async function consumeOrderInventoryReservation(db, orderId) {
  const reserved = await db.query("SELECT id,inventory_item_id FROM inventory_movements WHERE order_id=$1 AND movement_type='reserva' ORDER BY inventory_item_id FOR UPDATE", [orderId]);
  if (!reserved.rowCount) return false;
  for (const row of reserved.rows) {
    await db.query("UPDATE inventory_movements SET movement_type='consumo',reason='Baixa automática do pedido',idempotency_key=$1 WHERE id=$2", [`order-${orderId}-consume-${row.inventory_item_id}`, row.id]);
  }
  return true;
}

// Releases either a pending reservation or an already-consumed ingredient exactly once.
export async function releaseOrderInventory(db, orderId, reason = 'Devolução por cancelamento') {
  const held = await db.query("SELECT * FROM inventory_movements WHERE order_id=$1 AND movement_type IN ('reserva','consumo') ORDER BY inventory_item_id FOR UPDATE", [orderId]);
  for (const movement of held.rows) {
    const key = returnKey(orderId, movement.inventory_item_id);
    const already = await db.query('SELECT 1 FROM inventory_movements WHERE idempotency_key=$1', [key]);
    if (already.rowCount) continue;
    await db.query('UPDATE inventory_items SET quantity=quantity+$1,updated_at=NOW() WHERE id=$2', [movement.quantity, movement.inventory_item_id]);
    await db.query('UPDATE options o SET active=CASE WHEN i.auto_disable THEN i.quantity>0 ELSE o.active END FROM inventory_items i WHERE i.id=$1 AND o.id=i.option_id', [movement.inventory_item_id]);
    await db.query("INSERT INTO inventory_movements(inventory_item_id,movement_type,quantity,unit_cost,reason,order_id,idempotency_key) VALUES($1,'devolucao',$2,$3,$4,$5,$6) ON CONFLICT(idempotency_key) DO NOTHING", [movement.inventory_item_id, movement.quantity, movement.unit_cost || 0, reason, orderId, key]);
  }
  return held.rowCount;
}
