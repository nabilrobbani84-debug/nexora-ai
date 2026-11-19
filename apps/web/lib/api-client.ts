import type { ApiProblem, ApiSuccess, AuthSession, SessionUser } from '@nexora/shared';

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000/api/v1';

export class ApiClientError extends Error {
  constructor(
    message: string,
    public readonly status: number,
    public readonly code: string,
    public readonly validationErrors?: Record<string, string[]>,
  ) {
    super(message);
    this.name = 'ApiClientError';
  }
}

async function parseResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    const problem = (await response.json().catch(() => null)) as ApiProblem | null;
    throw new ApiClientError(
      problem?.detail ?? 'Layanan tidak dapat memproses permintaan.',
      response.status,
      problem?.code ?? 'REQUEST_FAILED',
      problem?.errors,
    );
  }
  if (response.status === 204) return undefined as T;
  const payload = (await response.json()) as ApiSuccess<T>;
  return payload.data;
}

async function csrfToken(): Promise<string> {
  const response = await fetch(`${API_URL}/auth/csrf`, {
    method: 'GET',
    credentials: 'include',
    cache: 'no-store',
  });
  const data = await parseResponse<{ csrfToken: string }>(response);
  return data.csrfToken;
}

async function mutation<T>(path: string, init: RequestInit = {}): Promise<T> {
  const csrf = await csrfToken();
  const response = await fetch(`${API_URL}${path}`, {
    ...init,
    credentials: 'include',
    headers: {
      ...(init.body ? { 'content-type': 'application/json' } : {}),
      'x-csrf-token': csrf,
      ...init.headers,
    },
  });
  return parseResponse<T>(response);
}

async function get<T>(path: string): Promise<T> {
  const response = await fetch(`${API_URL}${path}`, {
    credentials: 'include',
    cache: 'no-store',
  });
  return parseResponse<T>(response);
}

export const api = {
  login(email: string, password: string): Promise<AuthSession> {
    return mutation<AuthSession>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
  },

  async session(): Promise<{ user: SessionUser }> {
    try {
      return await get<{ user: SessionUser }>('/auth/me');
    } catch (error) {
      if (!(error instanceof ApiClientError) || error.status !== 401) throw error;
      await mutation<AuthSession>('/auth/refresh', { method: 'POST' });
      return get<{ user: SessionUser }>('/auth/me');
    }
  },

  logout(): Promise<void> {
    return mutation<void>('/auth/logout', { method: 'POST' });
  },

  foundationStatus(): Promise<{
    phase: number;
    name: string;
    status: string;
    organizationId: string;
    capabilities: string[];
  }> {
    return get('/foundation/status');
  },
};
