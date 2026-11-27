// Corrige dados legados na resposta pública sem alterar o banco.
// Algumas versões antigas cadastraram os sabores de sorvete com product_type='traditional'.
const legacyTruffledNames = new Set([
  'ninho com brigadeiro e nutella',
  'brigadeiro e nutella com maracuja',
  'brigadeiro com nutella e pacoca'
]);

export function publicProductType(product) {
  const type = String(product?.type ?? product?.product_type ?? '').trim().toLowerCase();
  const name = String(product?.name ?? '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim()
    .toLocaleLowerCase('pt-BR');

  if (type === 'traditional') {
    if (/^sorvete\s+de\b/.test(name))
      return 'ice_cream';
    if (legacyTruffledNames.has(name))
      return 'truffled';
  }

  return type;
}
