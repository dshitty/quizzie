'use client';

import Link from 'next/link';

export default function NotFound() {
  return (
    <div
      style={{
        minHeight: '100vh',
        background: 'var(--bg-base)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '24px',
      }}
    >
      <div style={{ textAlign: 'center', maxWidth: '500px' }}>
        {/* 404 Icon */}
        <div style={{ fontSize: '5rem', marginBottom: '24px', lineHeight: '1' }}>
          🔍
        </div>

        {/* Error Code */}
        <div
          style={{
            fontSize: '4rem',
            fontWeight: '800',
            color: 'var(--accent)',
            marginBottom: '12px',
          }}
        >
          404
        </div>

        {/* Message */}
        <div
          style={{
            fontSize: '1.75rem',
            fontWeight: '700',
            color: 'var(--text-primary)',
            marginBottom: '12px',
          }}
        >
          Page Not Found
        </div>

        <div
          style={{
            fontSize: '1rem',
            color: 'var(--text-secondary)',
            marginBottom: '32px',
            lineHeight: '1.6',
          }}
        >
          The page you're looking for doesn't exist or has been moved. Let's get you back on track!
        </div>

        {/* Navigation */}
        <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap' }}>
          <Link href="/dashboard">
            <button
              style={{
                background: 'var(--accent)',
                color: '#fff',
                padding: '12px 24px',
                borderRadius: 'var(--radius-md)',
                cursor: 'pointer',
                fontSize: '0.95rem',
                fontWeight: '600',
                border: 'none',
                transition: 'all 0.2s',
              }}
              onMouseEnter={(e) => {
                e.target.style.opacity = '0.9';
              }}
              onMouseLeave={(e) => {
                e.target.style.opacity = '1';
              }}
            >
              Go to Dashboard
            </button>
          </Link>

          <Link href="/">
            <button
              style={{
                background: 'var(--bg-card)',
                border: '1px solid var(--border)',
                color: 'var(--text-secondary)',
                padding: '12px 24px',
                borderRadius: 'var(--radius-md)',
                cursor: 'pointer',
                fontSize: '0.95rem',
                fontWeight: '600',
                transition: 'all 0.2s',
              }}
              onMouseEnter={(e) => {
                e.target.style.borderColor = 'var(--border-accent)';
                e.target.style.color = 'var(--accent)';
              }}
              onMouseLeave={(e) => {
                e.target.style.borderColor = 'var(--border)';
                e.target.style.color = 'var(--text-secondary)';
              }}
            >
              Go Home
            </button>
          </Link>
        </div>

        {/* Footer */}
        <div style={{ marginTop: '48px', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
          Need help? Contact support or try the navigation above
        </div>
      </div>
    </div>
  );
}
