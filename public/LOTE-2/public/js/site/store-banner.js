// Aviso de funcionamento da loja.
// ===== Aviso de funcionamento da loja =====
function storeClock() {
  const tz = store.timezone || 'America/Sao_Paulo';
  const parts = new Intl.DateTimeFormat('en-US', { timeZone: tz, weekday: 'short', hour: '2-digit', minute: '2-digit', hour12: false }).formatToParts(new Date());
  const g = t => parts.find(p => p.type === t)?.value;
  let h = Number(g('hour'));
  if (h === 24)
    h = 0;
  return { dow: { Sun: 0, Mon: 1, Tue: 2, Wed: 3, Thu: 4, Fri: 5, Sat: 6 }[g('weekday')], minutes: h * 60 + Number(g('minute')) };
}
function toMinutes(t) { const [h, m] = String(t || '0:0').split(':').map(Number); return h * 60 + (m || 0); }
function nextOpeningText() {
  const days = store.openingDays || [], { dow, minutes } = storeClock(), names = ['domingo', 'segunda-feira', 'terça-feira', 'quarta-feira', 'quinta-feira', 'sexta-feira', 'sábado'];
  if (days.includes(dow) && minutes < toMinutes(store.openingTime))
    return `hoje às ${store.openingTime}`;
  for (let i = 1; i <= 7; i++) {
    const d = (dow + i) % 7;
    if (days.includes(d))
      return i === 1 ? `amanhã às ${store.openingTime}` : `${names[d]} às ${store.openingTime}`;
  }
  return '';
}
function paintStoreBanner() {
  const el = $('#store-banner');
  if (!store || !el)
    return;
  let title, text, mode;
  try {
    if (store.openNow) {
      mode = 'open';
      title = 'Loja aberta';
      text = `Estamos recebendo pedidos até às ${store.closingTime}. Faça seu pedido agora ou agende para mais tarde.`;
    }
    else if (store.manualClosed) {
      mode = 'closed';
      title = 'Loja fechada';
      text = 'Os pedidos imediatos estão temporariamente pausados. Você ainda pode agendar para o próximo horário disponível.';
    }
    else {
      mode = 'closed';
      const next = nextOpeningText();
      title = 'Loja fechada';
      text = `Não estamos recebendo pedidos imediatos no momento.${next ? ` Reabrimos ${next}.` : ''} Você pode agendar para o próximo horário disponível.`;
    }
  }
  catch {
    return;
  }
  $('#store-banner-title').textContent = title;
  $('#store-banner-text').textContent = text;
  el.classList.toggle('is-open', mode === 'open');
  el.classList.toggle('is-closed', mode === 'closed');
  el.classList.remove('hidden');
  $('#store-banner-schedule').classList.remove('hidden');
  $('#store-status').textContent = store.openNow ? `Pedidos até às ${store.closingTime}.` : 'Agendamento disponível para o próximo horário.';
}
$('#store-banner-schedule').addEventListener('click', () => {
  const menu = $('#cardapio') || $('#model-order');
  if (menu)
    scrollRespectingMotion(menu, { behavior: 'smooth', block: 'start' });
});
setInterval(async () => {
  if (document.hidden || !store)
    return;
  try {
    store = await api('/store');
    paintStoreBanner();
    if (typeof syncOrderTimeOptions === 'function') syncOrderTimeOptions();
  }
  catch { }
}, 120000);
