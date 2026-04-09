'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

const NAV = [
  { href: '/overview',     label: 'Overview',      icon: '◈' },
  { href: '/transactions', label: 'Transactions',   icon: '≡' },
  { href: '/analytics',    label: 'Analytics',      icon: '◉' },
] as const;

export function Sidebar() {
  const path = usePathname();

  return (
    <aside
      style={{
        width: 220,
        background: 'var(--surface)',
        borderRight: '1px solid var(--border)',
        display: 'flex',
        flexDirection: 'column',
        padding: '24px 0',
        flexShrink: 0,
        minHeight: '100vh',
      }}
    >
      {/* Logo */}
      <div style={{ padding: '0 24px 32px' }}>
        <span style={{ fontSize: 18, fontWeight: 700, color: 'var(--accent-bright)', letterSpacing: -0.5 }}>
          kharchaaa
        </span>
        <span style={{ display: 'block', fontSize: 10, color: 'var(--text-tertiary)', letterSpacing: 1.5, marginTop: 2 }}>
          ADMIN
        </span>
      </div>

      {/* Nav */}
      <nav style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 2, padding: '0 12px' }}>
        {NAV.map(item => {
          const active = path.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 10,
                padding: '9px 12px',
                borderRadius: 8,
                fontSize: 13,
                fontWeight: active ? 500 : 400,
                color: active ? 'var(--text-primary)' : 'var(--text-secondary)',
                background: active ? 'var(--accent-muted)' : 'transparent',
                textDecoration: 'none',
                transition: 'background 0.15s',
              }}
            >
              <span style={{ fontSize: 14, opacity: 0.8 }}>{item.icon}</span>
              {item.label}
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      <div style={{ padding: '0 24px', borderTop: '1px solid var(--border)', paddingTop: 16 }}>
        <span style={{ fontSize: 11, color: 'var(--text-tertiary)' }}>v1.0.0 · Kharchaaa</span>
      </div>
    </aside>
  );
}
