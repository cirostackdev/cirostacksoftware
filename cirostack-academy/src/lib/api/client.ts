import type { ApiError } from '@/types';

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/v1';

function getToken(): string | null {
  if (typeof window === 'undefined') return null;
  try {
    const stored = localStorage.getItem('academy-auth');
    if (!stored) return null;
    const parsed = JSON.parse(stored);
    return parsed?.state?.token ?? null;
  } catch {
    return null;
  }
}

function setToken(token: string): void {
  if (typeof window === 'undefined') return;
  try {
    const stored = localStorage.getItem('academy-auth');
    if (!stored) return;
    const parsed = JSON.parse(stored);
    if (parsed?.state) {
      parsed.state.token = token;
      localStorage.setItem('academy-auth', JSON.stringify(parsed));
    }
  } catch {
    // ignore
  }
}

async function tryRefresh(): Promise<string | null> {
  try {
    const res = await fetch(`${BASE_URL}/auth/refresh`, {
      method: 'POST',
      credentials: 'include',
    });
    if (!res.ok) return null;
    const json = await res.json() as { data?: { accessToken?: string } };
    const token = json?.data?.accessToken ?? null;
    if (token) setToken(token);
    return token;
  } catch {
    return null;
  }
}

async function request<T>(
  method: string,
  path: string,
  body?: unknown,
  options?: RequestInit,
  isRetry = false,
): Promise<T> {
  const token = getToken();

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };

  const doFetch = () =>
    fetch(`${BASE_URL}${path}`, {
      method,
      headers: { ...headers, ...(getToken() ? { Authorization: `Bearer ${getToken()}` } : {}) },
      body: body ? JSON.stringify(body) : undefined,
      credentials: 'include',
      ...options,
    });

  let res = await doFetch();

  // Auto-refresh on 401
  if (res.status === 401 && !isRetry) {
    const newToken = await tryRefresh();
    if (newToken) {
      headers.Authorization = `Bearer ${newToken}`;
      res = await doFetch();
    }
  }

  // Single retry on transient network error (5xx)
  if (res.status >= 500 && !isRetry) {
    await new Promise((r) => setTimeout(r, 800));
    res = await doFetch();
  }

  if (!res.ok) {
    let errorMessage = `Request failed with status ${res.status}`;
    try {
      const err = await res.json() as { error?: string; message?: string };
      errorMessage = err.error || err.message || errorMessage;
    } catch {
      // ignore parse error
    }
    throw new Error(errorMessage);
  }

  if (res.status === 204) return undefined as T;
  const json = await res.json();
  return (json && typeof json === 'object' && 'data' in json ? json.data : json) as T;
}

export const apiGet = <T>(path: string, options?: RequestInit): Promise<T> =>
  request<T>('GET', path, undefined, options);

export const apiPost = <T>(path: string, body?: unknown): Promise<T> =>
  request<T>('POST', path, body);

export const apiPatch = <T>(path: string, body?: unknown): Promise<T> =>
  request<T>('PATCH', path, body);

export const apiDelete = <T>(path: string): Promise<T> =>
  request<T>('DELETE', path);

export const apiPut = <T>(path: string, body?: unknown): Promise<T> =>
  request<T>('PUT', path, body);
