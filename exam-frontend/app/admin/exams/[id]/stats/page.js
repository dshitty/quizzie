'use client';

import { useEffect, useState } from 'react';
import API from '@/services/api';
import { useParams } from 'next/navigation';
import Link from 'next/link';

export default function ExamStatsPage() {
  const params = useParams();
  const examId = params.id;

  const [exam, setExam] = useState(null);
  const [attempts, setAttempts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [stats, setStats] = useState({
    totalAttempts: 0,
    completedAttempts: 0,
    averageScore: 0,
    highestScore: 0,
    lowestScore: 0,
    averageTime: 0,
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch exam
        const examRes = await API.get(`/api/exams/${examId}`);
        setExam(examRes.data.data);

        // Fetch all attempts for this exam
        const attemptsRes = await API.get(`/api/attempts`);
        const examAttempts = (attemptsRes.data.data || []).filter(
          (a) => a.exam?._id === examId || a.exam === examId
        );
        setAttempts(examAttempts);

        // Calculate stats
        const completed = examAttempts.filter((a) => a.isSubmitted);

        const scores = completed.map((a) => a.percentage || 0);
        const avgScore = scores.length > 0 ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length) : 0;
        const highest = scores.length > 0 ? Math.max(...scores) : 0;
        const lowest = scores.length > 0 ? Math.min(...scores) : 0;
        const avgTime = completed.length > 0 ? Math.round(completed.reduce((sum, a) => sum + (a.timeTakenMinutes || 0), 0) / completed.length) : 0;

        setStats({
          totalAttempts: examAttempts.length,
          completedAttempts: completed.length,
          averageScore: avgScore,
          highestScore: highest,
          lowestScore: lowest,
          averageTime: avgTime,
        });
      } catch (err) {
        setError('Failed to load stats');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [examId]);

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', background: 'var(--bg-base)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ color: 'var(--text-secondary)' }}>Loading stats...</div>
      </div>
    );
  }

  if (!exam) {
    return (
      <div style={{ minHeight: '100vh', background: 'var(--bg-base)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ color: 'var(--danger)' }}>Exam not found</div>
      </div>
    );
  }

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
        <Link href="/admin/exams">
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
            ← Back to Exams
          </button>
        </Link>
      </div>

      {/* Main content */}
      <div style={{ padding: '32px 24px', maxWidth: '1200px', margin: '0 auto' }}>
        {/* Page header */}
        <div style={{ marginBottom: '32px' }}>
          <div style={{ fontSize: '1.75rem', fontWeight: '700', marginBottom: '8px', color: 'var(--text-primary)' }}>
            📊 {exam.title} - Stats
          </div>
          <div style={{ fontSize: '0.95rem', color: 'var(--text-secondary)' }}>
            Subject: <strong>{exam.subject}</strong> | Questions: <strong>{exam.questions?.length || 0}</strong> | Total Marks: <strong>{exam.totalMarks || 0}</strong>
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

        {/* Stats Grid */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
            gap: '16px',
            marginBottom: '32px',
          }}
        >
          {/* Total Attempts */}
          <div
            style={{
              background: 'var(--bg-card)',
              border: '1px solid var(--border)',
              borderRadius: 'var(--radius-lg)',
              padding: '24px',
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
            <div style={{ fontSize: '2rem', marginBottom: '12px' }}>✍️</div>
            <div style={{ fontSize: '2rem', fontWeight: '700', marginBottom: '4px', color: 'var(--text-primary)' }}>
              {stats.totalAttempts}
            </div>
            <div style={{ fontSize: '0.88rem', color: 'var(--text-secondary)' }}>
              Total Attempts
            </div>
          </div>

          {/* Completed */}
          <div
            style={{
              background: 'var(--bg-card)',
              border: '1px solid var(--border)',
              borderRadius: 'var(--radius-lg)',
              padding: '24px',
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
            <div style={{ fontSize: '2rem', marginBottom: '12px' }}>✅</div>
            <div style={{ fontSize: '2rem', fontWeight: '700', marginBottom: '4px', color: 'var(--text-primary)' }}>
              {stats.completedAttempts}
            </div>
            <div style={{ fontSize: '0.88rem', color: 'var(--text-secondary)' }}>
              Completed
            </div>
          </div>


          {/* Average Score */}
          <div
            style={{
              background: 'var(--bg-card)',
              border: '1px solid var(--border)',
              borderRadius: 'var(--radius-lg)',
              padding: '24px',
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
            <div style={{ fontSize: '2rem', marginBottom: '12px' }}>📊</div>
            <div style={{ fontSize: '2rem', fontWeight: '700', marginBottom: '4px', color: 'var(--text-primary)' }}>
              {stats.averageScore}%
            </div>
            <div style={{ fontSize: '0.88rem', color: 'var(--text-secondary)' }}>
              Average Score
            </div>
          </div>

          {/* Highest Score */}
          <div
            style={{
              background: 'var(--bg-card)',
              border: '1px solid var(--border)',
              borderRadius: 'var(--radius-lg)',
              padding: '24px',
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
            <div style={{ fontSize: '2rem', marginBottom: '12px' }}>🏆</div>
            <div style={{ fontSize: '2rem', fontWeight: '700', marginBottom: '4px', color: 'var(--success)' }}>
              {stats.highestScore}%
            </div>
            <div style={{ fontSize: '0.88rem', color: 'var(--text-secondary)' }}>
              Highest Score
            </div>
          </div>

          {/* Lowest Score */}
          <div
            style={{
              background: 'var(--bg-card)',
              border: '1px solid var(--border)',
              borderRadius: 'var(--radius-lg)',
              padding: '24px',
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
            <div style={{ fontSize: '2rem', marginBottom: '12px' }}>📉</div>
            <div style={{ fontSize: '2rem', fontWeight: '700', marginBottom: '4px', color: 'var(--text-primary)' }}>
              {stats.lowestScore}%
            </div>
            <div style={{ fontSize: '0.88rem', color: 'var(--text-secondary)' }}>
              Lowest Score
            </div>
          </div>

          {/* Average Time */}
          <div
            style={{
              background: 'var(--bg-card)',
              border: '1px solid var(--border)',
              borderRadius: 'var(--radius-lg)',
              padding: '24px',
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
            <div style={{ fontSize: '2rem', marginBottom: '12px' }}>⏱️</div>
            <div style={{ fontSize: '2rem', fontWeight: '700', marginBottom: '4px', color: 'var(--text-primary)' }}>
              {stats.averageTime}m
            </div>
            <div style={{ fontSize: '0.88rem', color: 'var(--text-secondary)' }}>
              Average Time
            </div>
          </div>
        </div>

        {/* Score Distribution */}
        {attempts.length > 0 && (
          <div style={{ marginBottom: '32px' }}>
            <div style={{ fontSize: '1.25rem', fontWeight: '700', marginBottom: '16px', color: 'var(--text-primary)' }}>
              📈 Score Distribution
            </div>

            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
                gap: '12px',
              }}
            >
              {[
                { range: '90-100%', color: '#4ade80', count: attempts.filter((a) => a.percentage >= 90).length },
                { range: '80-89%', color: 'var(--accent)', count: attempts.filter((a) => a.percentage >= 80 && a.percentage < 90).length },
                { range: '70-79%', color: 'var(--warning)', count: attempts.filter((a) => a.percentage >= 70 && a.percentage < 80).length },
                { range: '60-69%', color: 'rgba(255, 179, 71, 0.7)', count: attempts.filter((a) => a.percentage >= 60 && a.percentage < 70).length },
                { range: '0-59%', color: 'var(--danger)', count: attempts.filter((a) => a.percentage < 60).length },
              ].map((item) => (
                <div
                  key={item.range}
                  style={{
                    background: 'var(--bg-card)',
                    border: '1px solid var(--border)',
                    borderRadius: 'var(--radius-lg)',
                    padding: '16px',
                    textAlign: 'center',
                  }}
                >
                  <div
                    style={{
                      width: '100%',
                      height: '40px',
                      background: 'var(--bg-hover)',
                      borderRadius: 'var(--radius-md)',
                      marginBottom: '12px',
                      overflow: 'hidden',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <div
                      style={{
                        height: '100%',
                        background: item.color,
                        width: `${attempts.length > 0 ? (item.count / attempts.length) * 100 : 0}%`,
                        transition: 'width 0.3s',
                      }}
                    />
                  </div>
                  <div style={{ fontSize: '0.9rem', fontWeight: '600', color: 'var(--text-primary)', marginBottom: '4px' }}>
                    {item.range}
                  </div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                    {item.count} student{item.count !== 1 ? 's' : ''}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Recent Attempts */}
        {attempts.length > 0 && (
          <div>
            <div style={{ fontSize: '1.25rem', fontWeight: '700', marginBottom: '16px', color: 'var(--text-primary)' }}>
              📋 All Attempts
            </div>

            <div
              style={{
                background: 'var(--bg-card)',
                border: '1px solid var(--border)',
                borderRadius: 'var(--radius-lg)',
                overflow: 'hidden',
              }}
            >
              <div style={{ overflowX: 'auto' }}>
                <table
                  style={{
                    width: '100%',
                    borderCollapse: 'collapse',
                    fontSize: '0.9rem',
                  }}
                >
                  <thead>
                    <tr style={{ borderBottom: '1px solid var(--border)', background: 'var(--bg-hover)' }}>
                      <th style={{ padding: '16px 20px', textAlign: 'left', color: 'var(--text-secondary)', fontWeight: '600' }}>
                        Student
                      </th>
                      <th style={{ padding: '16px 20px', textAlign: 'center', color: 'var(--text-secondary)', fontWeight: '600' }}>
                        Score
                      </th>
                      <th style={{ padding: '16px 20px', textAlign: 'center', color: 'var(--text-secondary)', fontWeight: '600' }}>
                        Time (min)
                      </th>
                      <th style={{ padding: '16px 20px', textAlign: 'left', color: 'var(--text-secondary)', fontWeight: '600' }}>
                        Submitted
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {attempts.slice(0, 10).map((attempt, idx) => (
                      <tr
                        key={attempt._id}
                        style={{
                          borderBottom: idx !== Math.min(9, attempts.length - 1) ? '1px solid var(--border)' : 'none',
                          transition: 'background 0.2s',
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.background = 'var(--bg-hover)';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.background = 'transparent';
                        }}
                      >
                        <td style={{ padding: '16px 20px', color: 'var(--text-primary)' }}>
                          {attempt.student?.name || 'Unknown'}
                        </td>
                        <td style={{ padding: '16px 20px', textAlign: 'center', color: 'var(--text-primary)', fontWeight: '600' }}>
                          {attempt.percentage !== undefined ? `${attempt.percentage}%` : '-'}
                        </td>
                        <td style={{ padding: '16px 20px', textAlign: 'center', color: 'var(--text-secondary)' }}>
                          {attempt.timeTakenMinutes || '-'}
                        </td>
                        <td style={{ padding: '16px 20px', color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
                          {new Date(attempt.submittedAt || attempt.createdAt).toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {attempts.length > 10 && (
              <div style={{ textAlign: 'center', marginTop: '16px', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                Showing 10 of {attempts.length} attempts
              </div>
            )}
          </div>
        )}

        {attempts.length === 0 && (
          <div
            style={{
              background: 'var(--bg-card)',
              border: '1px solid var(--border)',
              borderRadius: 'var(--radius-lg)',
              padding: '40px 20px',
              textAlign: 'center',
              color: 'var(--text-secondary)',
            }}
          >
            No attempts yet for this exam
          </div>
        )}
      </div>
    </div>
  );
}

export default function ExamStatsPage() {
  return (
    <ProtectedRoute requiredRole="admin">
      <ExamStatsPageContent />
    </ProtectedRoute>
  );
}
