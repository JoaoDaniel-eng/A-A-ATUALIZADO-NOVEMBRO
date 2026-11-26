// Pedido em passos: 1 Tamanho → 2 Complementos → 3 Sacola → 4 Finalização.
// Só controla o que aparece. Preço, limites, carrinho e envio do pedido continuam em core.js e checkout.js.
(function () {
  const BAG_STEP = 3;
  const FINAL_STEP = 4;
  const LAST = FINAL_STEP;
  const NAMES = ["Tamanho", "Complementos", "Sacola", "Finalizar"];
  let step = 1;

  const builder = () => $("#builder");
  const main = () => $(".builder-main");
  const pedido = () => $("#pedido");
  const nextBtn = () => $("#builder-next");
  const backBtn = () => $("#builder-back");
  // Aba "Açaís Trufados" ou "Sorvetes" ativa: o montador tradicional fica escondido.
  const traditionalMode = () =>
    !!main() && !main().classList.contains("hidden");
  const itemCount = () => cart.reduce((n, i) => n + i.quantity, 0);
  const plural = (n) => `${n} ${n === 1 ? "item" : "itens"}`;
  // Só adiciona automaticamente um rascunho quando a sacola ainda está vazia.
  // Com itens já adicionados, cada novo produto continua exigindo a ação explícita de adicionar.
  const commitDraft = () =>
    !cart.length && typeof commitPendingDraft === "function"
      ? commitPendingDraft()
      : false;
  const emptyMessage = () =>
    "Sua sacola está vazia. Escolha produtos no cardápio para continuar.";

  function say(text) {
    const m = $("#builder-step-message");
    if (!m) return;
    m.textContent = text || "";
    m.classList.toggle("error-message", !!text);
  }

  // Frete e total visíveis junto ao bairro, sem depender do resumo no topo da página.
  function paintZoneResult() {
    const box = $("#zone-result");
    if (!box) return;
    const id = $("#zone-select")?.value;
    if (isPickup() || !id || !cart.length) {
      box.classList.add("hidden");
      box.textContent = "";
      return;
    }
    const zone = menu?.zones?.find((z) => String(z.id) === String(id));
    box.innerHTML =
      `<span>🛵 Frete${zone ? " para " + esc(zone.name) : ""}: <b>${esc($("#delivery-fee").textContent)}</b></span>` +
      `<span>Total com entrega: <b>${esc($("#cart-final-total").textContent)}</b></span>`;
    box.classList.remove("hidden");
  }

  function paintNav() {
    const next = nextBtn(),
      back = backBtn(),
      traditional = traditionalMode(),
      info = $("#builder-nav-info");
    if (!next || !back) return;
    const count = itemCount();
    $("#builder-nav").classList.toggle(
      "step-off",
      !traditional && step < BAG_STEP && count === 0,
    );
    back.classList.toggle(
      "step-off",
      step === 1 || (!traditional && step < BAG_STEP),
    );
    // Atalho para a sacola a partir da primeira etapa, quando já há itens.
    $("#builder-finish")?.classList.toggle(
      "step-off",
      !(traditional && step === 1 && count > 0),
    );
    $("#view-order")?.classList.toggle("hidden", count === 0);
    $("#bag-checkout").disabled = count === 0;

    if (step >= BAG_STEP) {
      info.disabled = true;
      info.classList.remove("is-link");
      info.removeAttribute("aria-label");
      $("#builder-nav-label").textContent = count
        ? `${plural(count)} na sacola`
        : "Sacola vazia";
      $("#builder-nav-total").textContent = $("#cart-final-total").textContent;
      const submit = $("#submit-order");
      if (step === BAG_STEP) {
        next.disabled = count === 0;
        next.textContent = count ? "Finalizar pedido →" : "Adicione produtos";
      } else {
        next.disabled = count === 0 || !!submit?.disabled;
        next.textContent = !count
          ? "Sacola vazia"
          : submit?.disabled
            ? submit.textContent.trim()
            : "Fazer pedido";
      }
    } else {
      const chosen = traditional && selectedSize,
        total = $("#cart-final-total").textContent;
      // O resumo fixo funciona como atalho para revisar a sacola em qualquer categoria.
      info.disabled = count === 0;
      info.classList.toggle("is-link", count > 0);
      if (count)
        info.setAttribute(
          "aria-label",
          `Abrir sacola: ${plural(count)}, total ${total}`,
        );
      else info.removeAttribute("aria-label");
      if (count)
        $("#builder-nav-label").innerHTML =
          `Sacola · ${plural(count)}<span class="nav-see"> · revisar →</span>`;
      else
        $("#builder-nav-label").textContent = chosen
          ? `Seu ${builderCategory === "ice_cream" ? "sorvete" : "açaí"}: ${selectedSize.name}`
          : "Sua sacola";
      $("#builder-nav-total").textContent = count
        ? total
        : chosen
          ? brl(priceForBuilder())
          : "R$ 0,00";
      next.disabled = !traditional && count === 0;
      next.textContent = !traditional
        ? "Ver sacola →"
        : step === 1
          ? "Continuar"
          : count
            ? "Ver sacola →"
            : "Adicionar à sacola →";
    }
  }

  function paint() {
    const el = main();
    if (!el) return;
    const traditional = traditionalMode();
    if (!traditional && step === 2) step = 1;
    const showingOrder = step >= BAG_STEP;
    builder().classList.add("is-stepped");
    builder().dataset.flowStep = String(step);
    el.querySelectorAll("[data-step]").forEach((n) =>
      n.classList.toggle("step-off", Number(n.dataset.step) !== step),
    );
    el.classList.toggle("step-off", showingOrder);
    pedido().classList.toggle("step-off", !showingOrder);
    $("#checkout-form").classList.toggle("step-off", step === BAG_STEP);
    $("#bag-review-actions").classList.toggle("step-off", step !== BAG_STEP);
    $("#menu-category-tabs")?.classList.toggle("step-off", showingOrder);
    document
      .querySelectorAll(".flavor-menu")
      .forEach((m) => m.classList.toggle("step-off", showingOrder));
    $("#builder-steps").classList.toggle("step-off", !traditional);
    document.querySelectorAll("#builder-steps li").forEach((li, i) => {
      const n = i + 1,
        btn = li.querySelector("button");
      li.classList.toggle("is-active", n === step);
      li.classList.toggle("is-done", n < step);
      li.querySelector(".step-num").textContent = n < step ? "✓" : String(n);
      if (n === step) btn.setAttribute("aria-current", "step");
      else btn.removeAttribute("aria-current");
      btn.disabled = n >= BAG_STEP && itemCount() === 0;
    });
    $("#builder-progress-bar").style.width = `${(step / LAST) * 100}%`;
    if (showingOrder) announceAdded("");
    $("#builder-step-live").textContent =
      traditional || showingOrder
        ? `Etapa ${step} de ${LAST}: ${NAMES[step - 1]}`
        : "";
    paintNav();
  }

  function scrollToTop() {
    const b = builder();
    if (b && b.getBoundingClientRect().top < 70)
      scrollRespectingMotion(b, { behavior: "smooth", block: "start" });
  }

  // Volta para o topo do cardápio, onde ficam as abas Açaí / Trufados / Sorvetes.
  function scrollToMenuTop() {
    const tabs = $("#menu-category-tabs"),
      el = tabs && !tabs.classList.contains("hidden") ? tabs : builder();
    if (el) scrollRespectingMotion(el, { behavior: "smooth", block: "start" });
  }

  // force = true: quem chama já decidiu (atalhos para a sacola); sem validação.
  function goTo(n, force = false) {
    n = Math.min(Math.max(Number(n) || 1, 1), LAST);
    let msg = "";
    if (!force) {
      if (n === 2 && (!selectedSize || halfPending())) {
        msg = needSizeMessage();
        n = 1;
      }
      // Não pula a revisão da sacola ao tentar abrir a etapa final diretamente.
      if (n === FINAL_STEP && step < BAG_STEP) n = BAG_STEP;
      if (n >= BAG_STEP) {
        commitDraft();
        if (!cart.length) {
          msg = emptyMessage();
          n = BAG_STEP;
        }
      }
    }
    say(msg);
    const changed = n !== step;
    step = n;
    paint();
    if (changed) scrollToTop();
  }

  document.addEventListener("click", (e) => {
    const jump = e.target.closest("[data-goto-step]");
    if (jump) {
      goTo(Number(jump.dataset.gotoStep));
      return;
    }
    // Qualquer atalho existente para #pedido abre a sacola, antes dos dados de checkout.
    if (e.target.closest('a[href="#pedido"]')) {
      commitDraft();
      step = BAG_STEP;
      say(cart.length ? "" : emptyMessage());
      paint();
      return;
    }
    if (e.target.closest("#builder-nav-info.is-link")) {
      goTo(BAG_STEP);
      return;
    }
    if (e.target.closest("#bag-checkout")) {
      goTo(FINAL_STEP);
      return;
    }
    // Na sacola ou no checkout, a pessoa pode voltar ao cardápio para escolher mais itens.
    if (e.target.closest("#add-more-items")) {
      step = 1;
      say("");
      paint();
      scrollToMenuTop();
      return;
    }
    if (e.target.closest("#builder-back")) {
      goTo(step === FINAL_STEP ? BAG_STEP : step === BAG_STEP ? 1 : step - 1);
      return;
    }
    if (e.target.closest("#builder-next")) {
      if (step === FINAL_STEP) {
        if (!cart.length) {
          goTo(BAG_STEP, true);
          say(emptyMessage());
          return;
        }
        $("#submit-order").click();
      } else if (step === BAG_STEP) goTo(FINAL_STEP);
      else if (!traditionalMode()) goTo(BAG_STEP);
      else if (step === 1) goTo(2);
      else goTo(BAG_STEP);
    }
    if (e.target.closest("#builder-finish")) goTo(BAG_STEP);
  });

  // Depois de adicionar um produto, volta ao começo do cardápio para escolher o próximo.
  document.addEventListener("acai:item-added", () => {
    step = 1;
    say("");
    paint();
    scrollToMenuTop();
  });

  // Chamadas existentes a #pedido.scrollIntoView (repetir pedido, trufados, aviso de loja fechada) abrem a sacola.
  const nativeScroll = Element.prototype.scrollIntoView;
  pedido().scrollIntoView = function (...args) {
    commitDraft();
    step = BAG_STEP;
    say(cart.length ? "" : emptyMessage());
    paint();
    return nativeScroll.apply(this, args);
  };

  // Trocar de aba (tradicional x trufado) muda o que os passos mostram.
  document.addEventListener("click", (e) => {
    if (e.target.closest("[data-menu-category]")) setTimeout(paint, 0);
  });
  // Mantém frete, total e barra de baixo em dia sempre que o carrinho é redesenhado.
  const baseRenderCart = window.renderCart;
  window.renderCart = function () {
    const result = baseRenderCart.apply(this, arguments);
    if (typeof paintCartNote === "function") paintCartNote();
    paintZoneResult();
    paint();
    return result;
  };
  // O bairro escolhido atualiza o frete na hora.
  $("#zone-select").addEventListener("change", () => {
    paintZoneResult();
    paintNav();
  });
  $("#fulfillment").addEventListener("change", () => {
    paintZoneResult();
    paintNav();
  });
  // A barra acompanha o botão de envio durante o registro do pedido.
  new MutationObserver(paintNav).observe($("#submit-order"), {
    attributes: true,
    childList: true,
    characterData: true,
    subtree: true,
  });
  // Enquanto o montador está na tela, a barra de baixo é a dos passos.
  if ("IntersectionObserver" in window) {
    new IntersectionObserver(
      (entries) =>
        document.body.classList.toggle("in-builder", entries[0].isIntersecting),
      { threshold: 0 },
    ).observe(builder());
  }
  paint();
})();
