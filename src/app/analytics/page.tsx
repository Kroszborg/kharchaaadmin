'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Sidebar } from '@/components/layout/Sidebar';
import { CategoryPie } from '@/components/charts/CategoryPie';
import { SpendBar } from '@/components/charts/SpendBar';
import { api, formatINR } from '@/lib/api';
import { auth } from '@/lib/auth';

const now = new Date();

type Category = { name: string; total: number; percentage: number; color: string };
type Merchant = { name: string; total: number; count: number };

export default function AnalyticsPage() {
  const router = useRouter();
  const [year, setYear] = useState(now.getFullYear());
  const [month, setMonth] = useState(now.getMonth() + 1);
  const [categories, setCategories] = useState<Category[]>([]);
  const [merchants, setMerchants] = useState<Merchant[]>([]);
  const [insights, setInsights] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = auth.getToken();
    if (!token) { router.replace('/login'); return; }

    setLoading(true);
    Promise.all([
      api.categories(token, year, month),
      api.merchants(token, year, month, 10),
      api.insights(token, year, month),
    ]).then(([c, m, ins]) => {
      setCategories(c);
      setMerchants(m);
      setInsights(ins);
    }).catch(() => router.replace('/login'))
      .finally(() => setLoading(false));
  }, [router, year, month]);

  const monthName = new Date(year, month - 1).toLocaleString('en-IN', { month: 'long', year: 'numeric' });

  const sel: React.CSSProperties = {
    background: 'var(--surface-elevated)',
    border: '1px solid var(--border)',
    borderRadius: 8,
    padding: '6px 12px',
    fontSize: 13,
    color: 'var(--text-primary)',
    outline: 'none',
  };

  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      <Sidebar />
      <main style={{ flex: 1, padding: '32px 40px', overflow: 'auto' }}>
        {/* Header + period picker */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 28 }}>
          <div>
            <h1 style={{ fontSize: 26, fontWeight: 700, color: 'var(--text-primary)', margin: 0, letterSpacing: -0.6 }}>
              Analytics
            </h1>
            <p style={{ fontSize: 13, color: 'var(--text-secondary)', margin: '4px 0 0' }}>{monthName}</p>
          </div>
          <div style={{ display: 'flex', gap: 10 }}>
            <select style={sel} value={month} onChange={e => setMonth(Number(e.target.value))}>
              {Array.from({ length: 12 }, (_, i) => (
                <option key={i + 1} value={i + 1}>
                  {new Date(2024, i).toLocaleString('en-IN', { month: 'long' })}
                </option>
              ))}
            </select>
            <select style={sel} value={year} onChange={e => setYear(Number(e.target.value))}>
              {[2024, 2025, 2026].map(y => <option key={y} value={y}>{y}</option>)}
            </select>
          </div>
        </div>

        {loading && <p style={{ color: 'var(--text-secondary)', fontSize: 14 }}>Loading…</p>}

        {!loading && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
              {/* Category pie */}
              <div style={{ background: 'var(--surface-elevated)', borderRadius: 20, padding: 24, border: '1px solid var(--border)' }}>
                <p style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)', margin: '0 0 16px' }}>Category breakdown</p>
                {categories.length > 0 ? (
                  <>
                    <CategoryPie data={categories} />
                    <table style={{ width: '100%', marginTop: 16, borderCollapse: 'collapse', fontSize: 12 }}>
                      <thead>
                        <tr>
                          {['Category', '%', 'Amount'].map(h => (
                            <th key={h} style={{ textAlign: h === 'Amount' ? 'right' : 'left', padding: '4px 0', color: 'var(--text-tertiary)', fontWeight: 500, fontSize: 10, letterSpacing: 1 }}>
                              {h}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {categories.map(c => (
                          <tr key={c.name}>
                            <td style={{ padding: '5px 0', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: 6 }}>
                              <span style={{ width: 6, height: 6, borderRadius: 3, background: c.color, display: 'inline-block', flexShrink: 0 }} />
                              {c.name}
                            </td>
                            <td style={{ padding: '5px 0', color: 'var(--text-tertiary)' }}>{c.percentage}%</td>
                            <td style={{ padding: '5px 0', color: 'var(--text-primary)', fontWeight: 500, textAlign: 'right' }}>
                              {formatINR(c.total, true)}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </>
                ) : (
                  <p style={{ color: 'var(--text-tertiary)', fontSize: 13 }}>No data for this period</p>
                )}
              </div>

              {/* Merchant bar */}
              <div style={{ background: 'var(--surface-elevated)', borderRadius: 20, padding: 24, border: '1px solid var(--border)' }}>
                <p style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)', margin: '0 0 16px' }}>Top 10 merchants</p>
                {merchants.length > 0 ? (
                  <SpendBar data={merchants} />
                ) : (
                  <p style={{ color: 'var(--text-tertiary)', fontSize: 13 }}>No data for this period</p>
                )}
              </div>
            </div>

            {/* Insights */}
            <div style={{ background: 'var(--surface-elevated)', borderRadius: 20, padding: 24, border: '1px solid var(--border)' }}>
              <p style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)', margin: '0 0 16px' }}>AI insights</p>
              {insights.length > 0 ? (
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10 }}>
                  {insights.map((ins, i) => (
                    <div key={i} style={{
                      padding: '10px 14px',
                      background: 'var(--surface)',
                      border: '1px solid var(--border)',
                      borderRadius: 10,
                      fontSize: 13,
                      color: 'var(--text-secondary)',
                      lineHeight: 1.5,
                      maxWidth: 340,
                    }}>
                      {ins}
                    </div>
                  ))}
                </div>
              ) : (
                <p style={{ color: 'var(--text-tertiary)', fontSize: 13 }}>No insights for this period</p>
              )}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
