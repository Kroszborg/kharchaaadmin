'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Sidebar } from '@/components/layout/Sidebar';
import { api, formatINR } from '@/lib/api';
import { auth } from '@/lib/auth';
import { format } from 'date-fns';

type Tx = {
  id: string;
  amount: number;
  type: 'DEBIT' | 'CREDIT';
  timestamp: string;
  note: string | null;
  merchant: { name: string } | null;
  category: { name: string; color: string } | null;
};

const PAGE_SIZE = 25;

export default function TransactionsPage() {
  const router = useRouter();
  const [txns, setTxns] = useState<Tx[]>([]);
  const [total, setTotal] = useState(0);
  const [pages, setPages] = useState(1);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState<'DEBIT' | 'CREDIT' | ''>('');
  const [loading, setLoading] = useState(true);

  const load = useCallback((pg: number, q: string, type: string) => {
    const token = auth.getToken();
    if (!token) { router.replace('/login'); return; }

    setLoading(true);
    const params: Record<string, string | number> = { page: pg, limit: PAGE_SIZE };
    if (q) params.search = q;
    if (type) params.type = type;

    api.transactions(token, params)
      .then(data => {
        setTxns(data.transactions);
        setTotal(data.total);
        setPages(data.pages);
        setPage(pg);
      })
      .catch(() => router.replace('/login'))
      .finally(() => setLoading(false));
  }, [router]);

  useEffect(() => { load(1, search, typeFilter); }, [load, search, typeFilter]);

  const inp: React.CSSProperties = {
    background: 'var(--surface-elevated)',
    border: '1px solid var(--border)',
    borderRadius: 8,
    padding: '7px 12px',
    fontSize: 13,
    color: 'var(--text-primary)',
    outline: 'none',
  };

  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      <Sidebar />
      <main style={{ flex: 1, padding: '32px 40px', overflow: 'auto' }}>
        <div style={{ marginBottom: 28 }}>
          <h1 style={{ fontSize: 26, fontWeight: 700, color: 'var(--text-primary)', margin: 0, letterSpacing: -0.6 }}>
            Transactions
          </h1>
          <p style={{ fontSize: 13, color: 'var(--text-secondary)', margin: '4px 0 0' }}>
            {total.toLocaleString()} total records
          </p>
        </div>

        {/* Filters */}
        <div style={{ display: 'flex', gap: 12, marginBottom: 20 }}>
          <input
            style={{ ...inp, flex: 1 }}
            placeholder="Search by merchant…"
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
          <select
            style={inp}
            value={typeFilter}
            onChange={e => setTypeFilter(e.target.value as typeof typeFilter)}
          >
            <option value="">All types</option>
            <option value="DEBIT">Debit</option>
            <option value="CREDIT">Credit</option>
          </select>
        </div>

        {/* Table */}
        <div style={{
          background: 'var(--surface-elevated)',
          borderRadius: 16,
          border: '1px solid var(--border)',
          overflow: 'hidden',
        }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border)' }}>
                {['Date', 'Merchant', 'Category', 'Type', 'Amount', 'Note'].map(h => (
                  <th key={h} style={{
                    padding: '12px 16px',
                    textAlign: 'left',
                    fontSize: 10,
                    fontWeight: 500,
                    color: 'var(--text-tertiary)',
                    letterSpacing: 1.2,
                    textTransform: 'uppercase',
                  }}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={6} style={{ padding: 40, textAlign: 'center', color: 'var(--text-secondary)' }}>
                    Loading…
                  </td>
                </tr>
              ) : txns.length === 0 ? (
                <tr>
                  <td colSpan={6} style={{ padding: 40, textAlign: 'center', color: 'var(--text-secondary)' }}>
                    No transactions found
                  </td>
                </tr>
              ) : txns.map((t, i) => (
                <tr
                  key={t.id}
                  style={{
                    borderBottom: i < txns.length - 1 ? '1px solid var(--border)' : 'none',
                    transition: 'background 0.1s',
                  }}
                  onMouseEnter={e => (e.currentTarget.style.background = 'var(--surface-highlight)')}
                  onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                >
                  <td style={{ padding: '12px 16px', color: 'var(--text-secondary)', whiteSpace: 'nowrap' }}>
                    {format(new Date(t.timestamp), 'd MMM yyyy')}
                  </td>
                  <td style={{ padding: '12px 16px', color: 'var(--text-primary)', fontWeight: 500 }}>
                    {t.merchant?.name ?? '—'}
                  </td>
                  <td style={{ padding: '12px 16px' }}>
                    {t.category ? (
                      <span style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: 5,
                        fontSize: 11,
                        color: 'var(--text-secondary)',
                      }}>
                        <span style={{ width: 6, height: 6, borderRadius: 3, background: t.category.color, display: 'inline-block' }} />
                        {t.category.name}
                      </span>
                    ) : '—'}
                  </td>
                  <td style={{ padding: '12px 16px' }}>
                    <span style={{
                      padding: '2px 8px',
                      borderRadius: 6,
                      fontSize: 11,
                      fontWeight: 500,
                      background: t.type === 'DEBIT' ? 'rgba(255,59,48,0.1)' : 'rgba(0,217,126,0.1)',
                      color: t.type === 'DEBIT' ? 'var(--error)' : 'var(--success)',
                    }}>
                      {t.type}
                    </span>
                  </td>
                  <td style={{
                    padding: '12px 16px',
                    color: t.type === 'DEBIT' ? 'var(--text-primary)' : 'var(--success)',
                    fontWeight: 600,
                    fontVariantNumeric: 'tabular-nums',
                  }}>
                    {t.type === 'DEBIT' ? '−' : '+'}{formatINR(t.amount, true)}
                  </td>
                  <td style={{ padding: '12px 16px', color: 'var(--text-tertiary)' }}>
                    {t.note ?? '—'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {pages > 1 && (
          <div style={{ display: 'flex', justifyContent: 'center', gap: 8, marginTop: 20 }}>
            {page > 1 && (
              <button onClick={() => load(page - 1, search, typeFilter)} style={{ ...btnStyle }}>
                ← Prev
              </button>
            )}
            <span style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: '32px' }}>
              Page {page} of {pages}
            </span>
            {page < pages && (
              <button onClick={() => load(page + 1, search, typeFilter)} style={{ ...btnStyle }}>
                Next →
              </button>
            )}
          </div>
        )}
      </main>
    </div>
  );
}

const btnStyle: React.CSSProperties = {
  background: 'var(--surface-elevated)',
  border: '1px solid var(--border)',
  borderRadius: 8,
  padding: '6px 14px',
  fontSize: 13,
  color: 'var(--text-primary)',
  cursor: 'pointer',
};
