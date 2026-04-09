'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/api';
import { auth } from '@/lib/auth';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const data = await api.login(email, password);
      auth.setTokens(data.accessToken, data.refreshToken);
      router.replace('/overview');
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Login failed');
    } finally {
      setLoading(false);
    }
  }

  const inp: React.CSSProperties = {
    width: '100%',
    background: 'var(--surface-elevated)',
    border: '1px solid var(--border)',
    borderRadius: 10,
    padding: '10px 14px',
    fontSize: 14,
    color: 'var(--text-primary)',
    outline: 'none',
  };

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'var(--bg)',
    }}>
      <form onSubmit={handleSubmit} style={{
        width: '100%',
        maxWidth: 380,
        padding: 32,
        background: 'var(--surface)',
        border: '1px solid var(--border)',
        borderRadius: 20,
        display: 'flex',
        flexDirection: 'column',
        gap: 20,
      }}>
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 700, color: 'var(--text-primary)', margin: 0, letterSpacing: -0.5 }}>
            Kharchaaa Admin
          </h1>
          <p style={{ fontSize: 13, color: 'var(--text-secondary)', margin: '4px 0 0' }}>
            Sign in to your account
          </p>
        </div>

        {error && (
          <div style={{
            padding: '10px 14px',
            background: 'rgba(255,59,48,0.1)',
            border: '1px solid rgba(255,59,48,0.25)',
            borderRadius: 8,
            fontSize: 13,
            color: 'var(--error)',
          }}>
            {error}
          </div>
        )}

        <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
          <label style={{ fontSize: 12, color: 'var(--text-secondary)', fontWeight: 500 }}>Email</label>
          <input
            type="email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            placeholder="you@example.com"
            required
            style={inp}
          />
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
          <label style={{ fontSize: 12, color: 'var(--text-secondary)', fontWeight: 500 }}>Password</label>
          <input
            type="password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            placeholder="••••••••"
            required
            style={inp}
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          style={{
            background: 'var(--accent)',
            color: '#fff',
            border: 'none',
            borderRadius: 999,
            padding: '12px',
            fontSize: 14,
            fontWeight: 600,
            cursor: loading ? 'not-allowed' : 'pointer',
            opacity: loading ? 0.7 : 1,
          }}
        >
          {loading ? 'Signing in…' : 'Sign in'}
        </button>
      </form>
    </div>
  );
}
