// Cardápio, montagem, sacola e checkout no visual do modelo personalizado, integrado ao meu-acai-main.
(() => {
  const root = () => document.querySelector('#model-order');
  const state = { store: null, menu: null, products: [], zones: [], schedule: [], scheduleValue: '', cartRevision: 0, category: 'Todos', active: null, cart: [], draft: null, drawer: false, checkout: false, step: 0, customerName: '', phone: '', address: '', notes: '', payment: 'Pix', spoons: 0, coupon: '', couponData: null, delivery: 'delivery', zoneId: '', toast: '', submitting: false };
  const money = cents => (Number(cents || 0) / 100).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  const esc = value => String(value ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const typeName = type => type === 'traditional' ? 'Açaí Tradicional' : type === 'ice_cream' ? 'Sorvetes' : 'Açaís Trufados';
  const imageFor = product => {
    const source = product?.image_url || (product?.type === 'traditional' ? '/images/acai-tradicional.webp' : '/images/ninho-trufado-chocolate.webp');
    const normalizedName = String(product?.name || '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').trim().toLocaleLowerCase('pt-BR');
    const galleryPhotos = [
      { match: 'acai tradicional', image: '/images/acai-tradicional-cliente.webp' },
      { match: 'ninho com brigadeiro e nutella', image: '/images/acai-ninho-brigadeiro.webp' },
      { match: 'brigadeiro e nutella com maracuja', image: '/images/acai-ninho-tropical.webp' },
      { match: 'brigadeiro com nutella e pacoca', image: '/images/acai-ninho-dourado.webp' },
      { match: 'pistache', image: '/images/sorvete-pistache-copo-card.webp' },
      { match: 'flocos', image: '/images/sorvete-flocos-copo-card.webp' },
      { match: 'ninho trufado', image: '/images/sorvete-ninho-trufado-copo-card.webp' },
      { match: 'morango com chocolate', image: '/images/acai-morango-proibido.webp' },
      { match: 'ninho com morango', image: '/images/acai-doce-tentacao.webp' },
      { match: 'ninho com amendoim', image: '/images/acai-pecado-de-amendoim.webp' },
      { match: 'ninho com pacoca', image: '/images/acai-ninho-dourado.webp' },
      { match: 'maracuja', image: '/images/acai-ninho-tropical.webp' },
      { match: 'pacoca', image: '/images/acai-ninho-dourado.webp' },
      { match: 'brigadeiro e nutella', image: '/images/acai-ninho-brigadeiro.webp' },
      { match: 'brigadeiro com nutella', image: '/images/acai-ninho-brigadeiro.webp' }
    ];
    const galleryPhoto = galleryPhotos.find(item => normalizedName.includes(item.match));
    if (galleryPhoto)
      return galleryPhoto.image;
    if (product?.type === 'traditional')
      return '/images/acai-tradicional-cliente.webp';
    try {
      const url = new URL(source, window.location.origin);
      if (normalizedName === 'ninho com chocolate' && url.origin === window.location.origin && ['/images/ninho-trufado-chocolate.webp', '/images/ninho-trufado-chocolate-640.webp'].includes(url.pathname))
        return '/images/acai-ninho-brigadeiro.webp';
      if (url.origin === window.location.origin && url.pathname === '/images/ninho-trufado-chocolate.webp') {
        url.pathname = '/images/ninho-trufado-chocolate-640.webp';
        return `${url.pathname}${url.search}${url.hash}`;
      }
    } catch {}
    return source;
  };
  const optionsBy = category => state.menu?.options?.filter(o => o.category === category) || [];
  const productSize = (p, id) => p?.sizes?.find(s => Number(s.id) === Number(id));
  const selectedProduct = () => state.products.find(p => String(p.id) === String(state.active?.productId));
  const cartCount = () => state.cart.reduce((n, i) => n + i.quantity, 0);
  const itemTotal = item => Number(item.unitPriceCents || 0) * item.quantity;
  function persistCart() {
    state.cartRevision++;
    state.coupon = '';
    state.couponData = null;
    try { if (state.cart.length) localStorage.setItem('acaiModelCart', JSON.stringify(state.cart)); else localStorage.removeItem('acaiModelCart'); } catch {}
  }
  const subtotal = () => state.cart.reduce((n, i) => n + itemTotal(i), 0);
  const selectedZone = () => state.zones.find(z => String(z.id) === String(state.zoneId));
  const deliveryFee = () => state.delivery === 'pickup' || !state.cart.length ? 0 : Number(selectedZone()?.fee || 0);
  const total = () => Math.max(0, subtotal() - Number(state.couponData?.discountCents || 0) + deliveryFee() + Number(state.spoons || 0) * Number(state.store?.spoonPriceCents || 10));
  const visibleProducts = () => state.category === 'Todos' ? state.products : state.products.filter(p => typeName(p.type) === state.category);

  function shell() { return `<div class="model-order-head"><div><span class="model-eyebrow">FEITO PRA SUA VONTADE</span><h2>Nosso cardápio</h2><p>Escolha, monte e peça do seu jeito.</p></div></div><div class="model-tabs" role="tablist">${['Todos','Açaí Tradicional','Açaís Trufados','Sorvetes'].map(c => `<button type="button" role="tab" data-model-category="${c}">${c}</button>`).join('')}</div><div class="model-grid" id="model-grid"><p class="model-empty" role="status">Carregando cardápio…</p></div><div class="model-overlay" id="model-overlay"></div><div class="model-sticky hidden" id="model-sticky"></div><div class="model-toast" id="model-toast" role="status" aria-live="polite"></div>`; }
  function productCard(p) { const size = p.sizes.find(s => !s.soldOut) || p.sizes[0]; return `<article class="model-product-card ${p.type === 'ice_cream' ? 'model-ice-cream-card' : ''}"><div class="model-product-photo"><img src="${esc(imageFor(p))}" alt="${esc(p.name)}" loading="lazy" decoding="async"><span>${esc(typeName(p.type))}</span><button type="button" class="model-heart" aria-label="Favoritar">♡</button></div><div class="model-product-info"><h3>${esc(p.name)}</h3><p>${esc(p.description || 'Uma combinação cremosa e irresistível.')}</p><div class="model-product-bottom"><strong>A partir de<br>${money(size?.price)}</strong><button type="button" class="model-add" data-model-open="${p.id}">Montar <b>›</b></button></div></div></article>`; }
  function renderCatalog() { const r = root(); if (!r) return; r.querySelectorAll('[data-model-category]').forEach(b => b.classList.toggle('selected', b.dataset.modelCategory === state.category)); const grid = r.querySelector('#model-grid'); grid.innerHTML = visibleProducts().map(productCard).join('') || '<p class="model-empty">Nenhum produto nesta categoria.</p>'; renderSticky(); }
  function builder() { const p = selectedProduct(); if (!p) return ''; const d = state.draft || { sizeId: p.sizes.find(s => !s.soldOut)?.id || p.sizes[0]?.id, optionIds: [], quantity: 1, note: '', sauceId: null }; const opt = id => state.menu.options.find(o => Number(o.id) === Number(id)); const selected = id => d.optionIds.includes(Number(id)); const sizes = p.sizes.map(s => `<button type="button" class="model-size ${Number(d.sizeId) === Number(s.id) ? 'chosen' : ''}" data-model-size="${s.id}" ${s.soldOut ? 'disabled' : ''}><span>${esc(s.name)}</span><b>${s.soldOut ? 'Esgotado' : money(s.price)}</b></button>`).join(''); const toppings = optionsBy('topping').map(o => `<button type="button" class="model-chip ${selected(o.id) ? 'on' : ''}" data-model-option="${o.id}">${selected(o.id) ? '✓ ' : ''}${esc(o.name)} <small>grátis</small></button>`).join(''); const syrups = optionsBy('syrup').map(o => `<button type="button" class="model-chip ${Number(d.sauceId) === Number(o.id) ? 'on' : ''}" data-model-sauce="${o.id}">${esc(o.name)}</button>`).join(''); const extras = [...optionsBy('extra'), ...optionsBy('mousse')].map(o => `<button type="button" class="model-extra ${selected(o.id) ? 'on' : ''}" data-model-option="${o.id}"><span>${selected(o.id) ? '✓' : '+'}</span><b>${esc(o.name)}</b><small>+${money(o.price)}</small></button>`).join(''); const size = productSize(p, d.sizeId); const price = Number(size?.price || 0) + d.optionIds.reduce((n, id) => n + Number(opt(id)?.price || 0), 0); return `<div class="model-modal model-builder" role="dialog" aria-modal="true"><div class="model-modal-head"><button type="button" data-model-close>← Cardápio</button><button type="button" class="model-x" data-model-close aria-label="Fechar">×</button></div><div class="model-builder-content"><div class="model-builder-image"><img src="${esc(imageFor(p))}" alt=""><span class="model-eyebrow">MONTE DO SEU JEITO</span><h2>${esc(p.name)}</h2><p>${esc(p.description || '')}</p></div><div class="model-builder-form"><div class="model-step"><b>01</b><div><h3>Escolha o tamanho</h3><p>O preço é atualizado na hora.</p></div></div><div class="model-sizes">${sizes}</div>${p.type === 'traditional' ? `<div class="model-step"><b>02</b><div><h3>Acompanhamentos <i>até ${state.store?.maxFreeToppings || 5} grátis</i></h3><p>Escolha suas opções favoritas.</p></div></div><div class="model-chips">${toppings}</div><div class="model-step"><b>03</b><div><h3>Escolha 1 calda <i>grátis</i></h3></div></div><div class="model-chips">${syrups}</div><div class="model-step"><b>04</b><div><h3>Adicionais e mousses <i>pagos</i></h3></div></div><div class="model-extras">${extras}</div>` : ''}<label class="model-field">Observação<textarea data-model-note rows="2" maxlength="1000" placeholder="Ex.: banana à parte">${esc(d.note)}</textarea></label><div class="model-builder-foot"><div class="model-stepper"><button type="button" data-model-qty="-">−</button><b>${d.quantity}</b><button type="button" data-model-qty="+">+</button></div><button type="button" class="model-primary" data-model-add>Adicionar · ${money(price * d.quantity)} 🛍</button></div></div></div></div>`; }
  function cartDrawer() { const items = state.cart.map(i => `<article class="model-cart-item"><img src="${esc(imageFor(i.product))}" alt="" loading="lazy" decoding="async"><div><div class="model-cart-top"><div><h3>${esc(i.product.name)}</h3><small>${esc(productSize(i.product, i.sizeId)?.name || '')}${i.optionNames?.length ? ' · ' + esc(i.optionNames.join(', ')) : ''}</small>${i.note ? `<small>Obs.: ${esc(i.note)}</small>` : ''}</div><button type="button" data-model-remove="${i.id}" aria-label="Remover">×</button></div><div class="model-cart-bottom"><div class="model-stepper mini"><button type="button" data-model-cart-qty="${i.id}:-">−</button><b>${i.quantity}</b><button type="button" data-model-cart-qty="${i.id}:+">+</button></div><strong>${money(itemTotal(i))}</strong></div></div></article>`).join(''); return `<div class="model-modal model-drawer" role="dialog" aria-modal="true"><div class="model-modal-head"><div><span class="model-eyebrow">SEU PEDIDO</span><h2>${state.checkout ? 'Quase lá' : 'Sacola da Roça'}</h2></div><button type="button" class="model-x" data-model-close aria-label="Fechar">×</button></div>${state.checkout ? checkoutView() : `<div class="model-cart-scroll">${items || `<div class="model-empty"><h3>Sua sacola está esperando</h3><p>Escolha um açaí gostoso no cardápio.</p><button type="button" class="model-primary" data-model-close>Voltar ao cardápio</button></div>`}${items ? '<button type="button" class="model-more" data-model-close>＋ Adicionar mais produtos</button>' : ''}</div><div class="model-drawer-bottom"><div class="model-coupon"><input id="model-coupon" value="${esc(state.coupon)}" placeholder="Código do cupom"><button type="button" data-model-coupon>${state.couponData ? 'Validado' : 'Aplicar'}</button></div><div class="model-sum"><span>Subtotal</span><span>${money(subtotal())}</span></div>${state.couponData ? `<div class="model-sum discount"><span>Desconto do cupom</span><span>−${money(state.couponData.discountCents)}</span></div>` : ''}<div class="model-sum"><span>${state.delivery === 'pickup' ? 'Retirada' : 'Taxa de entrega'}</span><span>${state.delivery === 'pickup' ? '—' : deliveryFee() ? money(deliveryFee()) : 'Escolha o bairro'}</span></div><div class="model-sum total"><b>Total</b><b>${money(total())}</b></div><button type="button" class="model-primary full" data-model-checkout ${state.cart.length ? '' : 'disabled'}>Prosseguir para identificação →</button><button type="button" class="model-link" data-model-close>Continuar escolhendo</button></div>`}</div>`; }
  function checkoutView() { const s = state.step; return `<div class="model-checkout-steps">${['Identificação','Entrega','Pagamento'].map((x, i) => `<span class="${s === i ? 'current' : ''}">${i + 1} <small>${x}</small></span>`).join('')}</div><div class="model-checkout-body">${s === 0 ? `<h3>Como podemos te chamar?</h3><label class="model-field">Nome<input id="model-name" value="${esc(state.customerName)}" placeholder="Seu nome"></label><label class="model-field">WhatsApp<input id="model-phone" value="${esc(state.phone)}" placeholder="(00) 00000-0000" inputmode="tel"></label>` : s === 1 ? `<h3>Como quer receber?</h3><div class="model-choice"><button type="button" class="${state.delivery === 'delivery' ? 'chosen' : ''}" data-model-delivery="delivery">Entrega</button><button type="button" class="${state.delivery === 'pickup' ? 'chosen' : ''}" data-model-delivery="pickup">Retirada</button></div>${state.delivery === 'delivery' ? `<label class="model-field">Endereço<input id="model-address" value="${esc(state.address)}" placeholder="Rua, número, complemento"></label><label class="model-field">Bairro<select id="model-zone"><option value="">Selecione seu bairro</option>${state.zones.map(z => `<option value="${z.id}" ${String(state.zoneId) === String(z.id) ? 'selected' : ''}>${esc(z.name)} — ${money(z.fee)}</option>`).join('')}</select></label>` : ''}<label class="model-field">Agendamento<select id="model-schedule"><option value="">Assim que possível</option>${state.schedule.flatMap(d => d.slots.map(x => `<option value="${x.value}" ${state.scheduleValue === x.value ? 'selected' : ''}>${esc(d.label)} · ${esc(x.time)}</option>`)).join('')}</select></label><label class="model-field">Observações<textarea id="model-notes" rows="3" placeholder="Alguma observação para o pedido?">${esc(state.notes)}</textarea></label>` : `<h3>Forma de pagamento</h3>${['Pix','Cartão de crédito','Cartão de débito','Dinheiro'].map(x => `<button type="button" class="model-pay ${state.payment === x ? 'chosen' : ''}" data-model-payment="${x}">${x}<span>${state.payment === x ? '✓' : '○'}</span></button>`).join('')}<label class="model-field">Colheres descartáveis (${money(state.store?.spoonPriceCents || 10)} cada)<input id="model-spoons" type="number" min="0" max="${state.store?.maxSpoons || 10}" value="${state.spoons || 0}"></label><p class="model-warning">O pedido será registrado e a loja confirmará o pagamento.</p>`}</div><div class="model-drawer-bottom"><div class="model-sum total"><b>Total estimado</b><b>${money(total())}</b></div><button type="button" class="model-primary full" data-model-next>${state.step < 2 ? 'Continuar →' : state.submitting ? 'Enviando pedido…' : 'Enviar pedido'}</button>${state.step > 0 ? '<button type="button" class="model-link" data-model-back>Voltar</button>' : ''}</div>`; }
  function renderOverlay() {
    const r = root(), o = r.querySelector('#model-overlay');
    const scrollTargets = ['.model-modal', '.model-cart-scroll'];
    const savedScroll = scrollTargets.map(selector => o.querySelector(selector)?.scrollTop ?? null);
    const pageX = window.scrollX, pageY = window.scrollY;
    o.innerHTML = state.active ? builder() : state.drawer ? cartDrawer() : '';
    r.classList.toggle('model-locked', Boolean(state.active || state.drawer));
    const restoreScroll = () => {
      scrollTargets.forEach((selector, index) => {
        const element = o.querySelector(selector);
        if (element && savedScroll[index] !== null) element.scrollTop = savedScroll[index];
      });
      if (window.scrollX !== pageX || window.scrollY !== pageY) window.scrollTo(pageX, pageY);
    };
    requestAnimationFrame(restoreScroll);
  }
  function renderSticky() { const count = document.querySelector('#cart-count'); if (count) count.textContent = String(cartCount()); const s = root()?.querySelector('#model-sticky'); if (!s) return; s.classList.toggle('hidden', !state.cart.length); s.innerHTML = `<span>🛍 <b>${cartCount()} ${cartCount() === 1 ? 'item' : 'itens'}</b></span><strong>${money(total())}</strong><button type="button" data-model-open-drawer>Finalizar pedido →</button>`; }
  function toast(text) { const t = root()?.querySelector('#model-toast'); if (!t) return; t.textContent = text; t.classList.add('on'); setTimeout(() => t.classList.remove('on'), 3000); }
  function openBuilder(id) { const p = state.products.find(x => Number(x.id) === Number(id)); if (!p) return; state.active = { productId: p.id }; state.draft = { sizeId: p.sizes.find(s => !s.soldOut)?.id || p.sizes[0]?.id, optionIds: [], quantity: 1, note: '', sauceId: null }; renderOverlay(); }
  function addDraft(openDrawer = false) { const p = selectedProduct(), d = state.draft, size = productSize(p, d.sizeId); if (!p || !size) return; const ids = [...new Set(d.optionIds.concat(d.sauceId ? [Number(d.sauceId)] : []))]; const names = ids.map(id => state.menu.options.find(o => Number(o.id) === id)?.name).filter(Boolean); const unit = Number(size.price) + ids.reduce((n, id) => n + Number(state.menu.options.find(o => Number(o.id) === id)?.price || 0), 0); state.cart.push({ id: `${Date.now()}-${Math.random()}`, product: p, sizeId: size.id, optionIds: ids, optionNames: names, quantity: d.quantity, note: d.note, unitPriceCents: unit }); persistCart(); state.active = null; state.drawer = openDrawer; state.checkout = false; toast('Adicionado à sacola!'); renderCatalog(); renderOverlay(); }
  function validateCoupon() { const code = root().querySelector('#model-coupon')?.value.trim(); if (!code) return; const revision = state.cartRevision; const q = new URLSearchParams({ code, subtotalCents: String(subtotal()), itemCount: String(cartCount()) }); api(`/coupons/validate?${q}`).then(v => { if (revision !== state.cartRevision) return; state.coupon = code; state.couponData = v; state.drawer = true; renderOverlay(); toast('Cupom validado.'); }).catch(e => toast(e.message)); }
  function syncCheckoutFields() {
    const r = root();
    const name = r.querySelector('#model-name');
    const phone = r.querySelector('#model-phone');
    const address = r.querySelector('#model-address');
    const zone = r.querySelector('#model-zone');
    if (name) state.customerName = name.value.trim();
    if (phone) state.phone = phone.value.trim();
    if (address) state.address = address.value.trim();
    if (zone) state.zoneId = zone.value;
    const notes = r.querySelector('#model-notes');
    if (notes) state.notes = notes.value.trim();
  }

  async function sendOrder() {
    if (state.submitting || !state.cart.length) return;
    syncCheckoutFields();
    const name = String(state.customerName || '').trim();
    const phone = String(state.phone || '').trim();
    const address = String(state.address || (state.delivery === 'pickup' ? 'Retirada na loja' : '')).trim();
    const payment = state.payment || 'Pix';
    const notes = state.notes || state.cart.map(i => i.note).filter(Boolean).join(' | ');
    if (!name) return toast('Informe seu nome para continuar.');
    if (!phone) return toast('Informe seu WhatsApp para continuar.');
    if (state.delivery === 'delivery' && !address) return toast('Informe o endereço de entrega.');
    if (state.delivery === 'delivery' && !state.zoneId) return toast('Selecione seu bairro para calcular a entrega.');
    state.submitting = true;
    renderOverlay();
    try {
      const result = await api('/orders', { method: 'POST', body: JSON.stringify({ customerName: name, phone, address, zoneId: state.delivery === 'delivery' ? Number(state.zoneId) : undefined, fulfillment: state.delivery, paymentMethod: payment, spoonQuantity: Number(state.spoons || 0), couponCode: state.coupon, notes, scheduledFor: state.scheduleValue || undefined, items: state.cart.map(i => ({ sizeId: i.sizeId, optionIds: i.optionIds, quantity: i.quantity })) }) });
      state.cart = [];
      state.drawer = false;
      state.checkout = false;
      state.step = 0;
      state.submitting = false;
      state.scheduleValue = '';
      state.spoons = 0;
      persistCart();
      toast(`Pedido ${result.orderCode || ''} registrado!`);
      renderCatalog();
      renderOverlay();
    } catch (e) {
      state.submitting = false;
      renderOverlay();
      toast(e.message);
    }
  }
  function bind() { const r = root(); r.addEventListener('click', e => { const cat = e.target.closest('[data-model-category]'); if (cat) { state.category = cat.dataset.modelCategory; state.active = null; state.draft = null; renderCatalog(); renderOverlay(); return; } const open = e.target.closest('[data-model-open]'); if (open) return openBuilder(open.dataset.modelOpen); if (e.target.closest('[data-model-open-drawer]')) { state.drawer = true; state.checkout = false; renderOverlay(); return; } if (e.target.closest('[data-model-close]')) { state.active = null; state.drawer = false; renderOverlay(); return; } if (e.target.closest('[data-model-size]')) { state.draft.sizeId = Number(e.target.closest('[data-model-size]').dataset.modelSize); renderOverlay(); return; } if (e.target.closest('[data-model-option]')) { const id = Number(e.target.closest('[data-model-option]').dataset.modelOption); const ix = state.draft.optionIds.indexOf(id); if (ix >= 0) state.draft.optionIds.splice(ix, 1); else if (state.draft.optionIds.filter(x => state.menu.options.find(o => Number(o.id) === x)?.category === 'topping').length < Number(state.store?.maxFreeToppings || 5) || state.menu.options.find(o => Number(o.id) === id)?.category !== 'topping') state.draft.optionIds.push(id); renderOverlay(); return; } if (e.target.closest('[data-model-sauce]')) { state.draft.sauceId = Number(e.target.closest('[data-model-sauce]').dataset.modelSauce); renderOverlay(); return; } if (e.target.closest('[data-model-qty]')) { state.draft.quantity = Math.min(20, Math.max(1, state.draft.quantity + (e.target.closest('[data-model-qty]').dataset.modelQty === '+' ? 1 : -1))); renderOverlay(); return; } if (e.target.closest('[data-model-add]')) { state.draft.note = r.querySelector('[data-model-note]')?.value || ''; addDraft(); return; } if (e.target.closest('[data-model-remove]')) { state.cart = state.cart.filter(i => i.id !== e.target.closest('[data-model-remove]').dataset.modelRemove); persistCart(); renderOverlay(); renderSticky(); return; } if (e.target.closest('[data-model-cart-qty]')) { const [id, dir] = e.target.closest('[data-model-cart-qty]').dataset.modelCartQty.split(':'); const item = state.cart.find(i => i.id === id); if (item) item.quantity = Math.min(20, Math.max(1, item.quantity + (dir === '+' ? 1 : -1))); persistCart(); renderOverlay(); renderSticky(); return; } if (e.target.closest('[data-model-checkout]')) { state.checkout = true; state.step = 0; renderOverlay(); return; } if (e.target.closest('[data-model-coupon]')) return validateCoupon(); if (e.target.closest('[data-model-delivery]')) { state.delivery = e.target.closest('[data-model-delivery]').dataset.modelDelivery; renderOverlay(); return; } if (e.target.closest('[data-model-payment]')) { state.payment = e.target.closest('[data-model-payment]').dataset.modelPayment; renderOverlay(); return; } if (e.target.closest('[data-model-next]')) { syncCheckoutFields(); if (state.step === 0 && !state.customerName) return toast('Informe seu nome para continuar.'); if (state.step === 0 && !state.phone) return toast('Informe seu WhatsApp para continuar.'); if (state.step === 1 && state.delivery === 'delivery' && !state.address) return toast('Informe o endereço de entrega.'); if (state.step === 1 && state.delivery === 'delivery' && !state.zoneId) return toast('Selecione seu bairro para calcular a entrega.'); if (state.step < 2) { state.step++; renderOverlay(); } else sendOrder(); return; } if (e.target.closest('[data-model-back]')) { state.step--; renderOverlay(); } }); r.addEventListener('change', e => { if (e.target.id === 'model-zone') state.zoneId = e.target.value; if (e.target.id === 'model-schedule') state.scheduleValue = e.target.value; if (e.target.id === 'model-spoons') state.spoons = Math.max(0, Number(e.target.value) || 0); }); }
  async function init() {
    const r = root();
    if (!r) return;
    r.innerHTML = shell();
    bind();
    const headerCart = document.querySelector('.header-cta[href="#pedido"]');
    if (headerCart) headerCart.addEventListener('click', e => {
      e.preventDefault();
      e.stopPropagation();
      state.drawer = true;
      state.checkout = false;
      renderOverlay();
    });

    // O catálogo não depende dos horários nem dos dados da loja: não deixe uma chamada lenta escondê-lo.
    void api('/menu').then(menu => {
      state.menu = menu;
      state.zones = menu.zones || [];
      state.products = (menu.products || []).filter(p => p.sizes?.length);
      try {
        state.cart = JSON.parse(localStorage.getItem('acaiModelCart') || '[]').filter(i => i?.product && Number.isInteger(Number(i.quantity)) && Number(i.quantity) > 0 && Number(i.quantity) <= 20 && productSize(i.product, i.sizeId));
      } catch {
        state.cart = [];
      }
      renderCatalog();
      if (typeof loadReviews === 'function') loadReviews();
    }).catch(e => {
      const grid = r.querySelector('#model-grid');
      if (grid) grid.innerHTML = `<p class="model-empty" role="alert">${esc(e.message || 'Não foi possível carregar o cardápio. Tente novamente.')}</p>`;
    });

    // Dados auxiliares chegam em paralelo e nunca bloqueiam a primeira renderização do cardápio.
    void api('/store').then(storeData => {
      state.store = storeData;
      if (typeof store !== 'undefined') store = storeData;
      if (typeof paintStoreBanner === 'function') paintStoreBanner();
    }).catch(e => console.warn('Não foi possível carregar as configurações da loja.', e));
    void api('/schedule-slots').then(schedule => {
      state.schedule = schedule.days || [];
      const select = r.querySelector('#model-schedule');
      if (select) {
        const selected = select.value || state.scheduleValue;
        select.innerHTML = `<option value="">Assim que possível</option>${state.schedule.flatMap(d => d.slots.map(x => `<option value="${esc(x.value)}">${esc(d.label)} · ${esc(x.time)}</option>`)).join('')}`;
        select.value = selected;
      }
    }).catch(e => console.warn('Não foi possível carregar os horários de entrega.', e));
  }
  window.initModelOrderUI = init;
})();
