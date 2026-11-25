export type ApiError = Error & { status?: number };

export async function api<T>(path: string, init: RequestInit = {}, token?: string | null): Promise<T> {
  const headers = new Headers(init.headers);
  if (init.body && !headers.has('Content-Type')) headers.set('Content-Type', 'application/json');
  if (token) headers.set('Authorization', `Bearer ${token}`);
  let response: Response;
  try {
    response = await fetch(path, { ...init, headers, credentials: 'same-origin' });
  } catch {
    throw Object.assign(new Error('Não foi possível conectar à loja. Verifique sua internet e tente novamente.'), { status: 0 });
  }
  if (response.status === 204) return undefined as T;
  const payload = await response.json().catch(() => ({}));
  if (!response.ok) throw Object.assign(new Error(payload.error || `Falha ao consultar o servidor (${response.status}).`), { status: response.status });
  return payload as T;
}

export const CUSTOMER_TOKEN_KEY = 'roca-customer-token';
