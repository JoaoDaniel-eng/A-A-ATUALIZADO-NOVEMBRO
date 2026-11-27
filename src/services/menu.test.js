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
