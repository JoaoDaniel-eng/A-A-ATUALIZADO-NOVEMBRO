// Catálogo visual da referência: abas simples e cards com foto, nome, descrição e ação Montar.
(() => {
  let active = 'all';
  let ready = false;
  const categories = { all: 'Todos', traditional: 'Açaí tradicional', truffled: 'Trufados', ice_cream: 'Sorvete' };
  const escText = value => typeof esc === 'function' ? esc(value) : String(value || '');
  const money = value => typeof brl === 'function' ? brl(value) : `R$ ${(Number(value || 0) / 100).toFixed(2).replace('.', ',')}`;

  function products() {
    if (!menu?.products) return [];
    return active === 'all' ? menu.products : menu.products.filter(product => product.type === active);
  }

  function card(product) {
    const size = product.sizes?.find(item => !item.soldOut) || product.sizes?.[0];
    const type = product.type === 'traditional' ? 'Açaí tradicional' : product.type === 'ice_cream' ? 'Sorvete' : 'Trufado';
    const description = product.description || (product.type === 'traditional' ? 'Monte com seus complementos favoritos.' : 'Uma combinação cremosa e irresistível.');
    return `<article class="catalog-product-card"><div class="catalog-product-photo"><img src="${escText(product.image_url || '/images/acai-hero-flutuando.webp')}" alt="${escText(product.name)}" loading="lazy"><span class="catalog-product-tag">${type}</span><span class="catalog-product-favorite" aria-hidden="true">♡</span></div><div class="catalog-product-body"><h3>${escText(product.name)}</h3><p>${escText(description)}</p><div class="catalog-product-footer"><strong>${size ? `A partir de ${money(size.price)}` : 'Consulte opções'}</strong><button type="button" class="catalog-montar" data-catalog-product="${product.id}">Montar</button></div></div></article>`;
  }

  function render() {
    const grid = document.querySelector('#catalog-cards');
    if (!grid || !menu?.products) return;
    grid.innerHTML = products().map(card).join('') || '<p class="muted">Nenhum produto nesta categoria.</p>';
    document.querySelectorAll('[data-catalog-category]').forEach(button => {
      const selected = button.dataset.catalogCategory === active;
      button.classList.toggle('is-active', selected);
      button.setAttribute('aria-selected', String(selected));
    });
    ready = true;
  }

  function showBuilder(product) {
    const builder = document.querySelector('#builder');
    if (!builder) return;
    builder.classList.remove('hidden');
    if (product.type === 'traditional' && typeof showMenuCategory === 'function') showMenuCategory('traditional');
    if (product.type === 'ice_cream' && typeof showMenuCategory === 'function') showMenuCategory('ice_cream');
    if (product.type === 'truffled') {
      document.querySelector('[data-menu-category="truffled"]')?.click();
      setTimeout(() => document.querySelector(`[data-truffle-flavor="${product.id}"]`)?.click(), 0);
    }
    builder.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  function mount() {
    const tabs = document.querySelector('#menu-category-tabs');
    if (!tabs || document.querySelector('#catalog-cards')) return;
    tabs.insertAdjacentHTML('afterend', '<div class="catalog-cards" id="catalog-cards" aria-live="polite"></div>');
    tabs.insertAdjacentHTML('afterbegin', '<button type="button" class="catalog-tab is-active" data-catalog-category="all" aria-selected="true">Todos</button>');
    tabs.querySelectorAll('[data-menu-category]').forEach(button => {
      button.classList.add('catalog-tab');
      button.dataset.catalogCategory = button.dataset.menuCategory;
      button.removeAttribute('aria-pressed');
    });
    tabs.addEventListener('click', event => {
      const button = event.target.closest('[data-catalog-category]');
      if (!button) return;
      event.preventDefault();
      event.stopPropagation();
      active = button.dataset.catalogCategory;
      render();
      document.querySelector('#builder')?.classList.add('hidden');
    }, true);
    document.querySelector('#builder')?.classList.add('hidden');
    document.addEventListener('click', event => {
      const button = event.target.closest('[data-catalog-product]');
      if (!button) return;
      const product = menu?.products?.find(item => String(item.id) === button.dataset.catalogProduct);
      if (product) showBuilder(product);
    });
    render();
  }

  const timer = setInterval(() => {
    if (typeof menu !== 'undefined' && menu?.products?.length) { mount(); render(); clearInterval(timer); }
  }, 80);
  setTimeout(() => clearInterval(timer), 15000);
})();
