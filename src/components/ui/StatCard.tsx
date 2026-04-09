interface StatCardProps {
  label: string;
  value: string;
  sub?: string;
  highlight?: boolean;
}

export function StatCard({ label, value, sub, highlight }: StatCardProps) {
  return (
    <div
      style={{
        background: 'var(--surface-elevated)',
        border: `1px solid ${highlight ? 'var(--accent-border)' : 'var(--border)'}`,
        borderRadius: 16,
        padding: '20px 24px',
        display: 'flex',
        flexDirection: 'column',
        gap: 6,
        flex: 1,
        minWidth: 160,
      }}
    >
      <span style={{ fontSize: 10, fontWeight: 500, color: 'var(--text-tertiary)', letterSpacing: 1.4, textTransform: 'uppercase' }}>
        {label}
      </span>
      <span style={{
        fontSize: 26,
        fontWeight: 700,
        color: highlight ? 'var(--accent-bright)' : 'var(--text-primary)',
        letterSpacing: -1,
        fontVariantNumeric: 'tabular-nums',
        lineHeight: 1.1,
      }}>
        {value}
      </span>
      {sub && (
        <span style={{ fontSize: 12, color: 'var(--text-tertiary)' }}>{sub}</span>
      )}
    </div>
  );
}
