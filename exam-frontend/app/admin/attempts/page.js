'use client';

import { useEffect, useState } from 'react';
import API from '@/services/api';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function AttemptsPage() {
  const [attempts, setAttempts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [filter, setFilter] = useState('pending'); // 'pending', 'released', 'all'
  const router = useRouter();

  useEffect(() => {
    const fetchAttempts = async () => {
      try {
        const { data } = await API.get('/api/attempts');
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

  const handleReleaseResult = async (attemptId) => {
    try {
      await API.put(`/api/attempts/${attemptId}/release`);
      setAttempts((prev) =>
        prev.map((a) =>
          a._id === attemptId ? { ...a, resultReleased: true, releasedAt: new Date() } : a
        )
      );
      setSuccess('Result released successfully');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError('Failed to release result');
    }
  };

  const filteredAttempts = attempts.filter((a) => {
    if (filter === 'pending') return !a.resultReleased;
    if (filter === 'released') return a.resultReleased;
    return true;
  });

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
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
        <Link href="/admin">
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
            ← Back to Admin
          </button>
        </Link>
      </div>

      {/* Main content */}
      <div style={{ padding: '32px 24px', maxWidth: '1200px', margin: '0 auto' }}>
        {/* Page header */}
        <div style={{ marginBottom: '32px' }}>
          <div style={{ fontSize: '1.75rem', fontWeight: '700', marginBottom: '8px', color: 'var(--text-primary)' }}>
            ✍️ Review Student Attempts
          </div>
          <div style={{ fontSize: '0.95rem', color: 'var(--text-secondary)' }}>
            Approve and release results to students
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
            ❌ {error}
          </div>
        )}

        {/* Success message */}
        {success && (
          <div
            style={{
              background: 'rgba(34,216,122,0.12)',
              border: '1px solid rgba(34,216,122,0.3)',
              borderRadius: 'var(--radius-md)',
              color: '#4ade80',
              padding: '12px 16px',
              marginBottom: '24px',
            }}
          >
            ✅ {success}
          </div>
        )}

        {/* Filter tabs */}
        <div style={{ display: 'flex', gap: '12px', marginBottom: '24px', borderBottom: '1px solid var(--border)', paddingBottom: '16px' }}>
          {[
            { label: 'Pending', value: 'pending' },
            { label: 'Released', value: 'released' },
            { label: 'All', value: 'all' },
          ].map((tab) => (
            <button
              key={tab.value}
              onClick={() => setFilter(tab.value)}
              style={{
                background: filter === tab.value ? 'var(--accent)' : 'transparent',
                color: filter === tab.value ? '#fff' : 'var(--text-secondary)',
                border: filter === tab.value ? 'none' : '1px solid var(--border)',
                padding: '8px 16px',
                borderRadius: 'var(--radius-md)',
                cursor: 'pointer',
                fontSize: '0.9rem',
                fontWeight: '600',
                transition: 'all 0.2s',
              }}
              onMouseEnter={(e) => {
                if (filter !== tab.value) {
                  e.target.style.borderColor = 'var(--border-accent)';
                }
              }}
              onMouseLeave={(e) => {
                if (filter !== tab.value) {
                  e.target.style.borderColor = 'var(--border)';
                }
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Loading state */}
        {loading ? (
          <div style={{ textAlign: 'center', color: 'var(--text-secondary)', padding: '40px 20px' }}>
            Loading attempts...
          </div>
        ) : filteredAttempts.length === 0 ? (
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
            <div style={{ color: 'var(--text-secondary)' }}>
              No {filter === 'all' ? 'attempts' : `${filter} attempts`} found
            </div>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {filteredAttempts.map((attempt) => (
              <div
                key={attempt._id}
                style={{
                  background: 'var(--bg-card)',
                  border: '1px solid var(--border)',
                  borderRadius: 'var(--radius-lg)',
                  padding: '20px 24px',
                  display: 'grid',
                  gridTemplateColumns: '1fr auto',
                  gap: '20px',
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
                <div>
                  <div style={{ fontSize: '1rem', fontWeight: '600', marginBottom: '8px', color: 'var(--text-primary)' }}>
                    {attempt.student?.name || 'Unknown Student'} - {attempt.exam?.title || 'Unknown Exam'}
                  </div>
                  <div style={{ display: 'flex', gap: '16px', fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '12px' }}>
                    <span>📧 {attempt.student?.email || 'N/A'}</span>
                    <span>📅 {formatDate(attempt.submittedAt || attempt.createdAt)}</span>
                    <span>⏱️ {attempt.timeTakenMinutes || 0} min</span>
                  </div>

                  <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                    <span
                      style={{
                        display: 'inline-block',
                        fontSize: '0.8rem',
                        fontWeight: '600',
                        padding: '4px 10px',
                        borderRadius: 'var(--radius-sm)',
                        background: 'var(--accent-soft)',
                        color: 'var(--accent)',
                      }}
                    >
                      Score: {attempt.percentage || 0}%
                    </span>
                    <span
                      style={{
                        display: 'inline-block',
                        fontSize: '0.8rem',
                        fontWeight: '600',
                        padding: '4px 10px',
                        borderRadius: 'var(--radius-sm)',
                        background: attempt.resultReleased ? 'rgba(34, 216, 122, 0.12)' : 'rgba(168, 162, 255, 0.12)',
                        color: attempt.resultReleased ? '#4ade80' : 'var(--accent)',
                      }}
                    >
                      {attempt.resultReleased ? '✅ Released' : '⏳ Pending'}
                    </span>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '8px', flexDirection: 'column' }}>
                  <Link href={`/result/${attempt._id}`}>
                    <button
                      style={{
                        background: 'var(--accent-soft)',
                        border: 'none',
                        color: 'var(--accent)',
                        padding: '8px 16px',
                        borderRadius: 'var(--radius-md)',
                        cursor: 'pointer',
                        fontSize: '0.85rem',
                        fontWeight: '600',
                        transition: 'all 0.2s',
                        whiteSpace: 'nowrap',
                      }}
                      onMouseEnter={(e) => {
                        e.target.style.background = 'var(--accent)';
                        e.target.style.color = '#fff';
                      }}
                      onMouseLeave={(e) => {
                        e.target.style.background = 'var(--accent-soft)';
                        e.target.style.color = 'var(--accent)';
                      }}
                    >
                      👁️ View Details
                    </button>
                  </Link>

                  {!attempt.resultReleased && (
                    <button
                      onClick={() => handleReleaseResult(attempt._id)}
                      style={{
                        background: 'rgba(34, 216, 122, 0.12)',
                        border: 'none',
                        color: '#4ade80',
                        padding: '8px 16px',
                        borderRadius: 'var(--radius-md)',
                        cursor: 'pointer',
                        fontSize: '0.85rem',
                        fontWeight: '600',
                        transition: 'all 0.2s',
                        whiteSpace: 'nowrap',
                      }}
                      onMouseEnter={(e) => {
                        e.target.style.background = '#4ade80';
                        e.target.style.color = 'var(--bg-base)';
                      }}
                      onMouseLeave={(e) => {
                        e.target.style.background = 'rgba(34, 216, 122, 0.12)';
                        e.target.style.color = '#4ade80';
                      }}
                    >
                      ✓ Release Result
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
