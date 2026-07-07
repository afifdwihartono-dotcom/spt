export function PageHeader({ eyebrow, title, sub }) {
  return (
    <div className="page-header">
      <div className="eyebrow">{eyebrow}</div>
      <div className="page-title">{title}</div>
      <div className="page-sub">{sub}</div>
    </div>
  );
}

export function StatCard({ value, label, small }) {
  return (
    <div className="stat-card">
      <div className="stat-num" style={small ? { fontSize: 20 } : undefined}>
        {value}
      </div>
      <div className="stat-label">{label}</div>
    </div>
  );
}

export function Loading({ text = 'Memuat data...' }) {
  return (
    <div style={{ padding: '60px 20px', textAlign: 'center', color: 'var(--slate)' }}>
      {text}
    </div>
  );
}

export function ErrorNotice({ message, onRetry }) {
  return (
    <div className="panel" style={{ borderColor: '#EFD2CC' }}>
      <p style={{ color: 'var(--red)', fontWeight: 600, marginBottom: 8 }}>Terjadi kesalahan</p>
      <p style={{ color: 'var(--slate)', fontSize: 13.5, marginBottom: onRetry ? 14 : 0 }}>{message}</p>
      {onRetry && (
        <button className="btn secondary" onClick={onRetry}>
          Coba lagi
        </button>
      )}
    </div>
  );
}

export function EmptyState({ message }) {
  return (
    <div className="empty">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <rect x="3" y="4" width="18" height="16" rx="2" />
        <path d="M3 9h18" />
      </svg>
      <p>{message}</p>
    </div>
  );
}
