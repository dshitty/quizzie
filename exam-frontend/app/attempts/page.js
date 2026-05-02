'use client';

import { useEffect, useState } from 'react';
import API from '@/services/api';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';

export default function AttemptsPage() {
  const [attempts, setAttempts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const router = useRouter();
  const { logout } = useAuth();

  useEffect(() => {
    const fetchAttempts = async () => {
      try {
        const { data } = await API.get('/api/attempts/my');
        setAttempts(data.data || []);
      } catch (err) {
        setError('Failed to load attempts');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchAttempts();
  }, []);

  const handleLogout = () => {
    logout();
    router.push('/login');
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-base)' }}>
      {/* Top bar */}
      <div
        style={{
          background: 'var(--bg-surface)',
          borderBottom: '1px solid var(--border)',
          padding: '16px 24px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
      >
        <div style={{ fontSize: '1.35rem', fontWeight: '800' }}>
          Exam<span style={{ color: 'var(--accent)' }}>Pulse</span>
        </div>
        <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
          <Link href="/dashboard">
            <button
              style={{
                background: 'var(--bg-card)',
                border: '1px solid var(--border)',
                color: 'var(--text-secondary)',
                padding: '8px 16px',
                borderRadius: 'var(--radius-md)',
                cursor: 'pointer',
                fontSize: '0.88rem',
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
              Dashboard
            </button>
          </Link>
          <button
            onClick={handleLogout}
            style={{
              background: 'var(--bg-card)',
              border: '1px solid var(--border)',
              color: 'var(--text-secondary)',
              padding: '8px 16px',
              borderRadius: 'var(--radius-md)',
              cursor: 'pointer',
              fontSize: '0.88rem',
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
            Logout
          </button>
        </div>
      </div>

      {/* Main content */}
      <div style={{ padding: '32px 24px', maxWidth: '1000px', margin: '0 auto' }}>
        {/* Page header */}
        <div style={{ marginBottom: '32px' }}>
          <div style={{ fontSize: '1.75rem', fontWeight: '700', marginBottom: '8px', color: 'var(--text-primary)' }}>
            📋 My Attempts
          </div>
          <div style={{ fontSize: '0.95rem', color: 'var(--text-secondary)' }}>
            View all your exam attempts and results
          </div>
        </div>

        {/* Error message */}
        {error && (
          <div
            style={{
              background: 'rgba(255,90,90,0.12)',
              border: '1px solid rgba(255,90,90,0.3)',
              borderRadius: 'var(--radius-md)',
              color: 'var(--danger)',
              padding: '12px 16px',
              marginBottom: '24px',
            }}
          >
            {error}
          </div>
        )}

        {/* Loading state */}
        {loading ? (
          <div style={{ textAlign: 'center', color: 'var(--text-secondary)', padding: '40px 20px' }}>
            Loading your attempts...
          </div>
        ) : attempts.length === 0 ? (
          <div
            style={{
              background: 'var(--bg-card)',
              border: '1px solid var(--border)',
              borderRadius: 'var(--radius-lg)',
              padding: '40px 20px',
              textAlign: 'center',
            }}
          >
            <div style={{ fontSize: '2.5rem', marginBottom: '12px' }}>📭</div>
            <div style={{ fontSize: '1rem', fontWeight: '500', marginBottom: '8px', color: 'var(--text-primary)' }}>
              No attempts yet
            </div>
            <div style={{ color: 'var(--text-secondary)', marginBottom: '20px' }}>
              Start an exam to see your attempts here
            </div>
            <Link href="/dashboard">
              <button
                style={{
                  background: 'var(--accent)',
                  color: '#fff',
                  padding: '10px 20px',
                  borderRadius: 'var(--radius-md)',
                  cursor: 'pointer',
                  fontSize: '0.9rem',
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
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {attempts.map((attempt) => (
              <div
                key={attempt._id}
                style={{
                  background: 'var(--bg-card)',
                  border: '1px solid var(--border)',
                  borderRadius: 'var(--radius-lg)',
                  padding: '20px 24px',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  transition: 'all 0.2s',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = 'var(--border-accent)';
                  e.currentTarget.style.boxShadow = '0 4px 12px rgba(108, 99, 255, 0.08)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = 'var(--border)';
                  e.currentTarget.style.boxShadow = 'none';
                }}
              >
                {/* Left section - Exam info */}
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: '1.1rem', fontWeight: '600', marginBottom: '8px', color: 'var(--text-primary)' }}>
                    {attempt.exam?.title || 'Unknown Exam'}
                  </div>
                  <div style={{ display: 'flex', gap: '16px', fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '10px' }}>
                    <span>⏱️ {attempt.timeTakenMinutes || 0} min</span>
                    <span>📅 {formatDate(attempt.submittedAt || attempt.createdAt)}</span>
                  </div>

                  {/* Status badge */}
                  <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                    <span
                      style={{
                        display: 'inline-block',
                        fontSize: '0.75rem',
                        fontWeight: '600',
                        padding: '4px 10px',
                        borderRadius: 'var(--radius-sm)',
                        background: attempt.resultReleased
                          ? 'rgba(74, 222, 128, 0.12)'
                          : 'rgba(168, 162, 255, 0.12)',
                        color: attempt.resultReleased ? '#4ade80' : 'var(--accent)',
                      }}
                    >
                      {attempt.resultReleased ? '✅ Result Released' : '⏳ Pending'}
                    </span>

                  </div>
                </div>

                {/* Right section - Score & Action */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                  {attempt.resultReleased && attempt.percentage !== undefined && (
                    <div style={{ textAlign: 'right', minWidth: '80px' }}>
                      <div
                        style={{
                          fontSize: '1.75rem',
                          fontWeight: '700',
                          color: 'var(--accent)',
                        }}
                      >
                        {attempt.percentage}%
                      </div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                        {attempt.totalScore}/{attempt.totalMarks}
                      </div>
                    </div>
                  )}

                  {/* Action buttons */}
                  <div style={{ display: 'flex', gap: '8px' }}>
                    {attempt.resultReleased ? (
                      <Link href={`/result/${attempt._id}`}>
                        <button
                          style={{
                            background: 'var(--accent)',
                            color: '#fff',
                            padding: '8px 16px',
                            borderRadius: 'var(--radius-md)',
                            cursor: 'pointer',
                            fontSize: '0.85rem',
                            fontWeight: '600',
                            border: 'none',
                            transition: 'all 0.2s',
                            whiteSpace: 'nowrap',
                          }}
                          onMouseEnter={(e) => {
                            e.target.style.opacity = '0.9';
                          }}
                          onMouseLeave={(e) => {
                            e.target.style.opacity = '1';
                          }}
                        >
                          View Result →
                        </button>
                      </Link>
                    ) : (
                      <button
                        disabled
                        style={{
                          background: 'var(--bg-hover)',
                          color: 'var(--text-secondary)',
                          padding: '8px 16px',
                          borderRadius: 'var(--radius-md)',
                          cursor: 'not-allowed',
                          fontSize: '0.85rem',
                          fontWeight: '600',
                          border: '1px solid var(--border)',
                          whiteSpace: 'nowrap',
                          opacity: '0.5',
                        }}
                      >
                        Awaiting Review
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
