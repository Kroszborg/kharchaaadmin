'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Sidebar } from '@/components/layout/Sidebar';
import { StatCard } from '@/components/ui/StatCard';
import { CategoryPie } from '@/components/charts/CategoryPie';
import { SpendBar } from '@/components/charts/SpendBar';
import { api, formatINR } from '@/lib/api';
import { auth } from '@/lib/auth';

const now = new Date();
const YEAR = now.getFullYear();
const MONTH = now.getMonth() + 1;

type Summary = {
  totalSpend: number;
  totalIncome: number;
  netFlow: number;
  transactionCount: number;
  debitCount: number;
};
type Category = { name: string; total: number; percentage: number; color: string };
type Merchant = { name: string; total: number; count: number };

export default function OverviewPage() {
  const router = useRouter();
  const [summary, setSummary] = useState<Summary | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [merchants, setMerchants] = useState<Merchant[]>([]);
  const [insights, setInsights] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const token = auth.getToken();
    if (!token) { router.replace('/login'); return; }

    Promise.all([
      api.summary(token, YEAR, MONTH),
      api.categories(token, YEAR, MONTH),
      api.merchants(token, YEAR, MONTH, 8),
      api.insights(token, YEAR, MONTH),
    ]).then(([s, c, m, ins]) => {
      setSummary(s);
      setCategories(c);
      setMerchants(m);
      setInsights(ins);
    }).catch(e => {
      if (e.message?.includes('401') || e.message?.includes('Unauthorized')) {
        auth.clear();
        router.replace('/login');
      } else {
        setError(e.message ?? 'Failed to load');
      }
    }).finally(() => setLoading(false));
  }, [router]);

  const monthName = now.toLocaleString('en-IN', { month: 'long', year: 'numeric' });

  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      <Sidebar />
      <main style={{ flex: 1, padding: '32px 40px', overflow: 'auto' }}>
        {/* Header */}
        <div style={{ marginBottom: 32 }}>
          <p style={{ fontSize: 10, color: 'var(--text-tertiary)', letterSpacing: 1.5, textTransform: 'uppercase', margin: 0 }}>
            {monthName.toUpperCase()}
          </p>
          <h1 style={{ fontSize: 26, fontWeight: 700, color: 'var(--text-primary)', margin: '4px 0 0', letterSpacing: -0.6 }}>
            Overview
          </h1>
        </div>

        {loading && (
          <p style={{ color: 'var(--text-secondary)', fontSize: 14 }}>Loading…</p>
        )}
        {error && (
          <p style={{ color: 'var(--error)', fontSize: 14 }}>{error}</p>
        )}

        {summary && (
          <>
            {/* Stat grid */}
            <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', marginBottom: 32 }}>
              <StatCard label="Total Spent" value={formatINR(summary.totalSpend, true)} sub={`${summary.debitCount} expenses`} highlight />
              <StatCard label="Income" value={formatINR(summary.totalIncome, true)} sub="this month" />
              <StatCard label="Net Flow" value={formatINR(Math.abs(summary.netFlow), true)} sub={summary.netFlow >= 0 ? 'surplus' : 'deficit'} />
              <StatCard label="Transactions" value={String(summary.transactionCount)} sub="total this month" />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24, marginBottom: 32 }}>
              {/* Category breakdown */}
              <div style={{ background: 'var(--surface-elevated)', borderRadius: 20, padding: 24, border: '1px solid var(--border)' }}>
                <p style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)', margin: '0 0 16px', letterSpacing: -0.2 }}>
                  Spending by category
                </p>
                <CategoryPie data={categories} />
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginTop: 16 }}>
                  {categories.slice(0, 5).map(c => (
                    <div key={c.name} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <div style={{ width: 8, height: 8, borderRadius: 4, background: c.color, flexShrink: 0 }} />
                      <span style={{ flex: 1, fontSize: 12, color: 'var(--text-secondary)' }}>{c.name}</span>
                      <span style={{ fontSize: 12, color: 'var(--text-tertiary)' }}>{c.percentage}%</span>
                      <span style={{ fontSize: 12, color: 'var(--text-primary)', fontWeight: 500, minWidth: 60, textAlign: 'right' }}>
                        {formatINR(c.total, true)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Top merchants bar */}
              <div style={{ background: 'var(--surface-elevated)', borderRadius: 20, padding: 24, border: '1px solid var(--border)' }}>
                <p style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)', margin: '0 0 16px', letterSpacing: -0.2 }}>
                  Top merchants
                </p>
                <SpendBar data={merchants.slice(0, 6)} />
                <div style={{ marginTop: 16, display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {merchants.slice(0, 5).map(m => (
                    <div key={m.name} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <span style={{ flex: 1, fontSize: 12, color: 'var(--text-secondary)' }}>{m.name}</span>
                      <span style={{ fontSize: 11, color: 'var(--text-tertiary)' }}>{m.count}×</span>
                      <span style={{ fontSize: 12, color: 'var(--text-primary)', fontWeight: 500, minWidth: 70, textAlign: 'right' }}>
                        {formatINR(m.total, true)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Insights */}
            {insights.length > 0 && (
              <div style={{ background: 'var(--surface-elevated)', borderRadius: 20, padding: 24, border: '1px solid var(--border)' }}>
                <p style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)', margin: '0 0 16px', letterSpacing: -0.2 }}>
                  Behavioral insights
                </p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  {insights.map((insight, i) => (
                    <div key={i} style={{
                      display: 'flex',
                      alignItems: 'flex-start',
                      gap: 10,
                      padding: '10px 14px',
                      background: 'var(--surface)',
                      borderRadius: 10,
                      border: '1px solid var(--border)',
                    }}>
                      <span style={{ fontSize: 10, color: 'var(--accent-bright)', marginTop: 2 }}>◆</span>
                      <span style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.5 }}>{insight}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
}
