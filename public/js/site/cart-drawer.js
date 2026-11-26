// Sacola lateral: mantém o catálogo visível ao fundo e concentra a revisão e os dados do pedido.
(() => {
  const cart = () => document.querySelector('#pedido');
  const headerTrigger = () => document.querySelector('.header-cta');
  let overlay;

  function ensureOverlay() {
    if (overlay) return overlay;
    overlay = document.createElement('button');
    overlay.type = 'button';
    overlay.className = 'cart-drawer-overlay';
    overlay.setAttribute('aria-label', 'Fechar sacola');
    overlay.addEventListener('click', close);
    document.body.append(overlay);
    return overlay;
  }

  function open() {
    const panel = cart();
    if (!panel) return;
    ensureOverlay();
    document.body.classList.add('cart-drawer-open');
    panel.classList.add('cart-drawer-visible');
    panel.setAttribute('aria-hidden', 'false');
    headerTrigger()?.setAttribute('aria-expanded', 'true');
    document.querySelector('#cart-drawer-close')?.focus({ preventScroll: true });
  }

  function close() {
    const panel = cart();
    document.body.classList.remove('cart-drawer-open');
    panel?.classList.remove('cart-drawer-visible');
    panel?.setAttribute('aria-hidden', 'true');
    headerTrigger()?.setAttribute('aria-expanded', 'false');
    headerTrigger()?.focus({ preventScroll: true });
  }

  document.addEventListener('click', (event) => {
    const trigger = event.target.closest('.header-cta, #mobile-cart-bar, #builder-nav-info.is-link, #builder-finish');
    if (trigger) {
      event.preventDefault();
      open();
      return;
    }
    if (event.target.closest('#cart-drawer-close')) {
      event.preventDefault();
      close();
      return;
    }
    if (event.target.closest('#add-more-items')) close();
  });

  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && document.body.classList.contains('cart-drawer-open')) close();
  });

  function addCloseButton() {
    const heading = document.querySelector('#pedido .cart-heading');
    if (!heading || heading.querySelector('#cart-drawer-close')) return;
    const button = document.createElement('button');
    button.type = 'button';
    button.id = 'cart-drawer-close';
    button.className = 'cart-drawer-close';
    button.setAttribute('aria-label', 'Fechar sacola');
    button.textContent = '×';
    heading.append(button);
  }

  addCloseButton();
  document.querySelector('.header-cta')?.setAttribute('aria-expanded', 'false');
})();
