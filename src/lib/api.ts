const BASE = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3000';

type RequestOptions = {
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE';
  body?: unknown;
  token?: string;
};

async function request<T>(path: string, opts: RequestOptions = {}): Promise<T> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };
  if (opts.token) headers['Authorization'] = `Bearer ${opts.token}`;

  const res = await fetch(`${BASE}${path}`, {
    method: opts.method ?? 'GET',
    headers,
    body: opts.body ? JSON.stringify(opts.body) : undefined,
    cache: 'no-store',
  });

  const json = await res.json();
  if (!res.ok) throw new Error(json.message ?? `Request failed: ${res.status}`);
  return json.data as T;
}

export type AdminCredentials = { accessToken: string; refreshToken: string };

export const api = {
  // Auth — admin uses the same backend auth endpoints
  login: (email: string, password: string) =>
    request<{ user: { id: string; email: string; name: string }; accessToken: string; refreshToken: string }>(
      '/api/auth/login',
      { method: 'POST', body: { email, password } }
    ),

  // Analytics
  summary: (token: string, year: number, month: number) =>
    request<{
      totalSpend: number;
      totalIncome: number;
      netFlow: number;
      transactionCount: number;
      debitCount: number;
    }>(`/api/analytics/summary?year=${year}&month=${month}`, { token }),

  categories: (token: string, year: number, month: number) =>
    request<{ name: string; total: number; percentage: number; color: string }[]>(
      `/api/analytics/categories?year=${year}&month=${month}`,
      { token }
    ),

  merchants: (token: string, year: number, month: number, limit = 10) =>
    request<{ name: string; total: number; count: number }[]>(
      `/api/analytics/merchants?year=${year}&month=${month}&limit=${limit}`,
      { token }
    ),

  insights: (token: string, year: number, month: number) =>
    request<string[]>(`/api/analytics/insights?year=${year}&month=${month}`, { token }),

  // Transactions
  transactions: (token: string, params: Record<string, string | number> = {}) => {
    const qs = new URLSearchParams(Object.entries(params).map(([k, v]) => [k, String(v)])).toString();
    return request<{
      transactions: {
        id: string;
        amount: number;
        type: 'DEBIT' | 'CREDIT';
        timestamp: string;
        note: string | null;
        merchant: { name: string } | null;
        category: { name: string; color: string } | null;
      }[];
      total: number;
      page: number;
      pages: number;
    }>(`/api/transactions?${qs}`, { token });
  },

  // Categories list
  categoriesList: (token: string) =>
    request<{ id: string; name: string; color: string; icon: string }[]>(
      '/api/categories',
      { token }
    ),
};

export function formatINR(n: number, compact = false) {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: compact ? 0 : 2,
    notation: compact && Math.abs(n) >= 1_00_000 ? 'compact' : 'standard',
  }).format(n);
}
