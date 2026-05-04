'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import ProtectedRoute from '@/components/ProtectedRoute';
import API from '@/services/api';

function AdminResultsPageContent() {
  const [attempts, setAttempts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionId, setActionId] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    const fetchAttempts = async () => {
      try {
        const { data } = await API.get('/api/attempts');
        setAttempts(data.data || []);
      } catch (err) {
        console.error('Failed to load attempts:', err);
        setError('Failed to load release data');
      } finally {
        setLoading(false);
      }
    };

    fetchAttempts();
  }, []);

  const examGroups = useMemo(() => {
    const groups = new Map();

    for (const attempt of attempts) {
      const exam = attempt.exam;
      if (!exam?._id) continue;

      const examId = exam._id.toString();
      const current = groups.get(examId) || {
        examId,
        title: exam.title || 'Untitled Exam',
        totalAttempts: 0,
        pendingCount: 0,
        releasedCount: 0,
      };

      current.totalAttempts += 1;
      if (attempt.resultReleased) {
        current.releasedCount += 1;
      } else {
        current.pendingCount += 1;
      }

      groups.set(examId, current);
    }

    return Array.from(groups.values()).sort((a, b) => a.title.localeCompare(b.title));
  }, [attempts]);

  const handleReleaseAll = async (examId, title) => {
    try {
      setActionId(examId);
      setError('');
      setSuccess('');

      const { data } = await API.patch(`/api/attempts/release-all/${examId}`);

      setAttempts((prev) =>
        prev.map((attempt) =>
          attempt.exam?._id?.toString() === examId
            ? { ...attempt, resultReleased: true, releasedAt: new Date().toISOString() }
            : attempt
        )
      );

      setSuccess(data.message || `Released all results for ${title}`);
    } catch (err) {
      console.error('Failed to release results:', err);
      setError(err.response?.data?.message || 'Failed to release results');
    } finally {
      setActionId('');
    }
  };

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-base)' }}>
      <div
        style={{
          background: 'var(--bg-surface)',
          borderBottom: '1px solid var(--border)',
          padding: '16px 24px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          gap: '16px',
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
          >
            ← Back to Admin
          </button>
        </Link>
      </div>

      <div style={{ padding: '32px 24px', maxWidth: '1100px', margin: '0 auto' }}>
        <div style={{ marginBottom: '28px' }}>
          <div style={{ fontSize: '1.75rem', fontWeight: '700', marginBottom: '8px', color: 'var(--text-primary)' }}>
            📊 Release Results
          </div>
          <div style={{ fontSize: '0.95rem', color: 'var(--text-secondary)' }}>
            Publish submitted exam results to all students in one click
          </div>
        </div>

        {error && (
          <div
            style={{
              background: 'rgba(255,90,90,0.12)',
              border: '1px solid rgba(255,90,90,0.3)',
              borderRadius: 'var(--radius-md)',
              color: 'var(--danger)',
              padding: '12px 16px',
              marginBottom: '20px',
            }}
          >
            ❌ {error}
          </div>
        )}

        {success && (
          <div
            style={{
              background: 'rgba(34,216,122,0.12)',
              border: '1px solid rgba(34,216,122,0.3)',
              borderRadius: 'var(--radius-md)',
              color: '#4ade80',
              padding: '12px 16px',
              marginBottom: '20px',
            }}
          >
            ✅ {success}
          </div>
        )}

        {loading ? (
          <div style={{ textAlign: 'center', color: 'var(--text-secondary)', padding: '40px 20px' }}>
            Loading release data...
          </div>
        ) : examGroups.length === 0 ? (
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
            <div style={{ color: 'var(--text-secondary)' }}>No submitted attempts found yet</div>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px' }}>
            {examGroups.map((exam) => (
              <div
                key={exam.examId}
                style={{
                  background: 'var(--bg-card)',
                  border: '1px solid var(--border)',
                  borderRadius: 'var(--radius-lg)',
                  padding: '20px',
                }}
              >
                <div style={{ marginBottom: '10px' }}>
                  <div style={{ fontSize: '1.05rem', fontWeight: '700', color: 'var(--text-primary)' }}>
                    {exam.title}
                  </div>
                  <div style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
                    {exam.pendingCount} pending, {exam.releasedCount} released
                  </div>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', gap: '12px', marginBottom: '16px' }}>
                  <span style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Total submissions</span>
                  <span style={{ fontWeight: '700', color: 'var(--text-primary)' }}>{exam.totalAttempts}</span>
                </div>

                <button
                  onClick={() => handleReleaseAll(exam.examId, exam.title)}
                  disabled={exam.pendingCount === 0 || actionId === exam.examId}
                  style={{
                    width: '100%',
                    background: exam.pendingCount === 0 ? 'rgba(148,163,184,0.12)' : 'var(--accent)',
                    color: exam.pendingCount === 0 ? 'var(--text-secondary)' : '#fff',
                    border: 'none',
                    padding: '12px 16px',
                    borderRadius: 'var(--radius-md)',
                    cursor: exam.pendingCount === 0 ? 'not-allowed' : 'pointer',
                    fontSize: '0.9rem',
                    fontWeight: '700',
                    transition: 'all 0.2s',
                    opacity: actionId === exam.examId ? 0.75 : 1,
                  }}
                >
                  {actionId === exam.examId
                    ? 'Releasing...'
                    : exam.pendingCount === 0
                      ? 'All Released'
                      : 'Release All Results'}
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default function AdminResultsPage() {
  return (
    <ProtectedRoute requiredRole="admin">
      <AdminResultsPageContent />
    </ProtectedRoute>
  );
}

export default function ResultsPage() {
  return (
    <ProtectedRoute requiredRole="admin">
      <ResultsPageContent />
    </ProtectedRoute>
  );
}
