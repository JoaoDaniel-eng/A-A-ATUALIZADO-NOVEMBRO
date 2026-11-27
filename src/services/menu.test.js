import test from 'node:test';
import assert from 'node:assert/strict';
import { publicProductType } from './menu.js';

test('classifica sorvete legado marcado como tradicional para a aba Sorvetes', () => {
  for (const name of ['Sorvete de Pistache', 'Sorvete de Flocos', 'Sorvete de Ninho Trufado'])
    assert.equal(publicProductType({ type: 'traditional', name }), 'ice_cream');
});

test('não reclassifica produto tradicional que não é sorvete', () => {
  assert.equal(publicProductType({ type: 'traditional', name: 'Açaí Tradicional' }), 'traditional');
});

test('preserva categoria já correta e aceita product_type como formato alternativo', () => {
  assert.equal(publicProductType({ type: 'ice_cream', name: 'Sorvete de Pistache' }), 'ice_cream');
  assert.equal(publicProductType({ product_type: 'ice_cream', name: 'Sorvete de Pistache' }), 'ice_cream');
  assert.equal(publicProductType({ type: 'truffled', name: 'Morango com Chocolate' }), 'truffled');
});

test('mantém só o Açaí tradicional na categoria tradicional e reclassifica os três trufados legados', () => {
  const legacyProducts = [
    { name: 'Açaí tradicional', type: 'traditional' },
    { name: 'Ninho com brigadeiro e Nutella', type: 'traditional' },
    { name: 'Brigadeiro e Nutella com maracujá', type: 'traditional' },
    { name: 'Brigadeiro com Nutella e paçoca', type: 'traditional' }
  ].map(product => ({ ...product, type: publicProductType(product) }));

  assert.deepEqual(
    legacyProducts.filter(product => product.type === 'traditional').map(product => product.name),
    ['Açaí tradicional']
  );
  assert.deepEqual(
    legacyProducts.filter(product => product.type === 'truffled').map(product => product.name),
    ['Ninho com brigadeiro e Nutella', 'Brigadeiro e Nutella com maracujá', 'Brigadeiro com Nutella e paçoca']
  );
});
