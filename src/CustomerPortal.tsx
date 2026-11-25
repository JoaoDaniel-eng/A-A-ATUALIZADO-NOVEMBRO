import { useEffect, useState } from 'react';
import { api, CUSTOMER_TOKEN_KEY } from './api';
import { Check, Heart, LogOut, PackageCheck, UserRound, X } from 'lucide-react';

type Customer = { name: string; phone: string };
type Order = { order_code: string; status: string; items: Array<Record<string, any>>; total_cents: number; created_at: string; fulfillment: string; address: string; neighborhood: string };
type Favorite = { id: number; name: string; sizeId: number; optionIds: number[] };
type Props = { token: string | null; customer: Customer | null; onAuth: (token: string, customer: Customer) => void; onLogout: () => void; onRepeat: (items: Array<Record<string, any>>) => void; onRepeatFavorite: (favorite: Favorite) => void; storePhone?: string };
const money = (cents: number) => (Number(cents || 0) / 100).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
const humanStatus: Record<string, string> = { new: 'Recebido', preparing: 'Em preparo', out_for_delivery: 'Saiu para entrega', delivered: 'Entregue', cancelled: 'Cancelado' };

export default function CustomerPortal({ token, customer, onAuth, onLogout, onRepeat, onRepeatFavorite, storePhone = '' }: Props) {
  const [open, setOpen] = useState(false), [mode, setMode] = useState<'login' | 'register' | 'account' | 'track' | 'review'>(token ? 'account' : 'login');
  const [name, setName] = useState(''), [phone, setPhone] = useState(''), [password, setPassword] = useState(''), [error, setError] = useState(''), [message, setMessage] = useState(''), [busy, setBusy] = useState(false);
  const [orders, setOrders] = useState<Order[]>([]), [favorites, setFavorites] = useState<Favorite[]>([]), [coupons, setCoupons] = useState<Array<{code:string;discount_value:number;active:boolean;used_at:string|null}>>([]), [points, setPoints] = useState(0);
  const [trackCode, setTrackCode] = useState(''), [trackPhone, setTrackPhone] = useState(''), [tracked, setTracked] = useState<any>(null);
  const [reviewRating, setReviewRating] = useState(5), [reviewComment, setReviewComment] = useState('');

  useEffect(() => { if (token) setMode('account'); else if (mode === 'account') setMode('login'); }, [token]);
  useEffect(() => { if (open && token && mode === 'account') void loadAccount(); }, [open, token, mode]);
  async function loadAccount() {
    if (!token) return;
    setError('');
    try {
      const [me, history, fav, couponsData] = await Promise.all([
        api<{loyaltyBalance:number}>('/api/customers/me', {}, token),
        api<{orders:Order[]}>('/api/customers/me/orders', {}, token),
        api<{favorites:Favorite[]}>('/api/customers/me/favorites', {}, token),
        api<{coupons:Array<{code:string;discount_value:number;active:boolean;used_at:string|null}>}>('/api/customers/me/coupons', {}, token)
      ]);
      setPoints(me.loyaltyBalance || 0); setOrders(history.orders); setFavorites(fav.favorites); setCoupons(couponsData.coupons);
    } catch (e) { setError(e instanceof Error ? e.message : 'Não foi possível carregar sua conta.'); }
  }
  async function authenticate(event: React.FormEvent) {
    event.preventDefault(); setBusy(true); setError(''); setMessage('');
    try {
      const route = mode === 'register' ? '/api/customers/register' : '/api/customers/login';
      const result = await api<{token:string;customer:Customer;welcomeCoupon?:{code:string}}>(route, { method: 'POST', body: JSON.stringify({ name, phone, password }) });
      localStorage.setItem(CUSTOMER_TOKEN_KEY, result.token); onAuth(result.token, result.customer); setMode('account');
      if (result.welcomeCoupon) setMessage(`Conta criada. Seu cupom de boas-vindas é ${result.welcomeCoupon.code}.`);
    } catch (e) { setError(e instanceof Error ? e.message : 'Não foi possível entrar.'); }
    finally { setBusy(false); }
  }
  async function track(event: React.FormEvent) {
    event.preventDefault(); setBusy(true); setError(''); setTracked(null);
    try { setTracked(await api<any>(`/api/orders/track?${new URLSearchParams({ code: trackCode, phone: trackPhone })}`)); }
    catch (e) { setError(e instanceof Error ? e.message : 'Não foi possível localizar o pedido.'); }
    finally { setBusy(false); }
  }
  async function cancelOrder(code: string, phoneValue: string) {
    if (!window.confirm(`Cancelar o pedido ${code}?`)) return;
    setBusy(true); setError('');
    try { await api(`/api/orders/${encodeURIComponent(code)}/cancel`, { method: 'POST', body: JSON.stringify({ phone: phoneValue }) }); setMessage('Pedido cancelado. O estoque reservado foi liberado.'); setTracked(null); await loadAccount(); }
    catch (e) { setError(e instanceof Error ? e.message : 'Não foi possível cancelar o pedido.'); }
    finally { setBusy(false); }
  }
  async function deleteFavorite(id: number) {
    setBusy(true); setError('');
    try { await api(`/api/customers/me/favorites/${id}`, { method: 'DELETE' }, token); setFavorites(rows => rows.filter(row => row.id !== id)); }
    catch (e) { setError(e instanceof Error ? e.message : 'Não foi possível remover o favorito.'); }
    finally { setBusy(false); }
  }
  async function submitReview(event: React.FormEvent) {
    event.preventDefault(); setBusy(true); setError(''); setMessage('');
    try { const result = await api<{message:string}>('/api/reviews', { method: 'POST', body: JSON.stringify({ name: customer?.name || name, rating: reviewRating, comment: reviewComment }) }); setMessage(result.message); setReviewComment(''); }
    catch (e) { setError(e instanceof Error ? e.message : 'Não foi possível enviar a avaliação.'); }
    finally { setBusy(false); }
  }
  function logout() { localStorage.removeItem(CUSTOMER_TOKEN_KEY); onLogout(); setMode('login'); setOpen(false); setPassword(''); }

  return <>
    <button className="portal-trigger" onClick={() => { setMode(token ? 'account' : 'login'); setOpen(true); }} aria-label={customer ? 'Abrir minha conta' : 'Entrar ou criar conta'}>
      {customer ? <UserRound size={17}/> : <PackageCheck size={17}/>}<span>{customer ? 'Minha conta' : 'Entrar'}</span>
    </button>
    {open && <div className="overlay portal-overlay" onMouseDown={event => event.target === event.currentTarget && setOpen(false)}>
      <section className="drawer portal-drawer" role="dialog" aria-modal="true" aria-label="Área do cliente">
        <div className="drawer-head"><div><span className="eyebrow">AÇAÍ DA ROÇA</span><h2>{mode === 'account' ? `Olá, ${customer?.name || 'cliente'}` : mode === 'track' ? 'Acompanhe seu pedido' : mode === 'review' ? 'Conte pra gente' : mode === 'register' ? 'Criar conta' : 'Acesse sua conta'}</h2></div><button className="icon-btn" onClick={() => setOpen(false)} aria-label="Fechar"><X/></button></div>
        {error && <p className="portal-alert error" role="alert">{error}</p>}{message && <p className="portal-alert success" role="status"><Check size={15}/>{message}</p>}
        {mode === 'login' || mode === 'register' ? <form className="portal-content" onSubmit={authenticate}>
          {mode === 'register' && <label className="field-label">Nome completo<input required minLength={2} maxLength={120} value={name} onChange={e => setName(e.target.value)} autoComplete="name"/></label>}
          <label className="field-label">WhatsApp com DDD<input required minLength={10} value={phone} onChange={e => setPhone(e.target.value)} inputMode="tel" autoComplete="tel" placeholder="(00) 00000-0000"/></label>
          <label className="field-label">Senha<input required minLength={8} maxLength={72} type="password" value={password} onChange={e => setPassword(e.target.value)} autoComplete={mode === 'register' ? 'new-password' : 'current-password'}/></label>
          <button className="primary full" disabled={busy}>{busy ? 'Aguarde…' : mode === 'register' ? 'Criar minha conta' : 'Entrar'} <Check size={16}/></button>
          <button type="button" className="text-btn" onClick={() => { setError(''); setMessage(''); setMode(mode === 'register' ? 'login' : 'register'); }}>{mode === 'register' ? 'Já tenho conta — fazer login' : 'Ainda não tenho conta — cadastrar'}</button>
          {mode === 'login' && <div className="portal-recovery"><b>Esqueceu a senha?</b><p>Por segurança, a loja não redefine senha usando apenas o número de telefone. Fale com a equipe pelo WhatsApp para confirmar sua identidade.</p>{storePhone && <a className="text-btn" href={`https://wa.me/${storePhone}?text=${encodeURIComponent(`Olá, preciso de ajuda para recuperar o acesso à minha conta. Meu telefone é ${phone || '__________'}.`)}`} target="_blank" rel="noreferrer">Solicitar ajuda no WhatsApp</a>}</div>}
        </form> : mode === 'track' ? <div className="portal-content">
          <form onSubmit={track}><label className="field-label">Código do pedido<input required value={trackCode} onChange={e => setTrackCode(e.target.value.toUpperCase())} placeholder="Ex.: AR-123456"/></label><label className="field-label">Telefone usado na compra<input required value={trackPhone} onChange={e => setTrackPhone(e.target.value)} inputMode="tel"/></label><button className="primary full" disabled={busy}>{busy ? 'Buscando…' : 'Consultar pedido'}</button></form>
          {tracked && <article className="portal-order"><div className="portal-order-head"><b>{tracked.orderCode}</b><span>{humanStatus[tracked.status] || tracked.status}</span></div><p>{tracked.items?.map((item:any) => `${item.quantity}× ${item.product} ${item.size}`).join(' · ')}</p><p>{tracked.fulfillment === 'pickup' ? 'Retirada na loja' : `${tracked.address}, ${tracked.neighborhood}`}</p><b>{money(tracked.totalCents)}</b>{tracked.canCancel && <button className="text-btn danger" disabled={busy} onClick={() => cancelOrder(tracked.orderCode, trackPhone)}>Cancelar pedido</button>}</article>}
        </div> : mode === 'review' ? <form className="portal-content" onSubmit={submitReview}><label className="field-label">Sua nota<select value={reviewRating} onChange={e => setReviewRating(Number(e.target.value))}>{[5,4,3,2,1].map(n => <option value={n} key={n}>{n} de 5</option>)}</select></label><label className="field-label">Comentário<textarea minLength={5} maxLength={800} required value={reviewComment} onChange={e => setReviewComment(e.target.value)} rows={4}/></label><button className="primary full" disabled={busy}>{busy ? 'Enviando…' : 'Enviar avaliação'}</button><p className="portal-hint">Sua avaliação será publicada após análise da equipe.</p></form> : <>
          <div className="portal-tabs"><button onClick={() => { setError(''); setMessage(''); setMode('account'); }}>Minha conta</button><button onClick={() => { setError(''); setMessage(''); setMode('track'); }}>Rastrear pedido</button><button onClick={() => { setError(''); setMessage(''); setMode('review'); }}>Avaliar</button></div>
          <div className="portal-content">
            <section className="portal-stat"><strong>{points}</strong><span>pontos de fidelidade</span><small>Pontos acumulados em pedidos entregues.</small></section>
            <h3>Cupons da sua conta</h3>{coupons.length ? coupons.map(c => <div className="portal-row" key={c.code}><b>{c.code}</b><span>{c.used_at ? 'Utilizado' : c.active ? `R$ ${(c.discount_value/100).toFixed(2)} disponível` : 'Indisponível'}</span></div>) : <p className="portal-hint">Nenhum cupom disponível no momento.</p>}
            <h3>Pedidos recentes</h3>{orders.length ? orders.map(order => <article className="portal-order" key={order.order_code}><div className="portal-order-head"><b>{order.order_code}</b><span>{humanStatus[order.status] || order.status}</span></div><small>{new Date(order.created_at).toLocaleString('pt-BR')}</small><p>{order.items?.map(item => `${item.quantity}× ${item.product} ${item.size}`).join(' · ')}</p><div className="portal-order-actions"><b>{money(order.total_cents)}</b><button className="text-btn" onClick={() => onRepeat(order.items)}>Pedir novamente</button></div>{order.status === 'new' && <button className="text-btn danger" disabled={busy} onClick={() => cancelOrder(order.order_code, customer?.phone || '')}>Cancelar pedido</button>}</article>) : <p className="portal-hint">Seus pedidos registrados aparecerão aqui.</p>}
            <h3>Combinações favoritas</h3>{favorites.length ? favorites.map(f => <div className="portal-row" key={f.id}><span><Heart size={14}/>{f.name}</span><span className="portal-favorite-actions"><button className="text-btn" onClick={() => onRepeatFavorite(f)}>Pedir</button><button className="text-btn danger" disabled={busy} onClick={() => deleteFavorite(f.id)}>Remover</button></span></div>) : <p className="portal-hint">Salve uma combinação durante a montagem do seu açaí.</p>}
          </div>
          <div className="drawer-bottom"><button className="text-btn" onClick={loadAccount}>Atualizar informações</button><button className="text-btn portal-logout" onClick={logout}><LogOut size={14}/> Sair da conta</button></div>
        </>}
      </section>
    </div>}
  </>;
}
