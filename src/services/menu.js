// Corrige dados legados na resposta pública sem alterar o banco.
// Algumas versões antigas cadastraram os sabores de sorvete com product_type='traditional'.
export function publicProductType(product) {
  const type = String(product?.type ?? product?.product_type ?? '').trim().toLowerCase();
  const name = String(product?.name ?? '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim()
    .toLocaleLowerCase('pt-BR');

  if (type === 'traditional' && /^sorvete\s+de\b/.test(name))
    return 'ice_cream';

  return type;
}
