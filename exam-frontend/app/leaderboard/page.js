'use client';

import { useEffect, useState } from 'react';
import API from '@/services/api';
import Link from 'next/link';

export default function LeaderboardPage() {
  const [leaderboard, setLeaderboard] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [timeframe, setTimeframe] = useState('all'); // 'all', 'month', 'week'

  useEffect(() => {
    const fetchLeaderboard = async () => {
      try {
        const { data } = await API.get('/api/attempts/leaderboard');
        const attempts = data.data || [];

        // Process leaderboard data
        const scores = {};
        attempts.forEach((attempt) => {
          const studentId = attempt.student?._id;
          const studentName = attempt.student?.name || 'Unknown';
          if (!scores[studentId]) {
            scores[studentId] = {
              name: studentName,
              totalAttempts: 0,
              passedAttempts: 0,
              averageScore: 0,
              highestScore: 0,
              attempts: [],
            };
          }
          scores[studentId].totalAttempts += 1;
          scores[studentId].attempts.push(attempt.percentage || 0);
          if (attempt.isPassed) scores[studentId].passedAttempts += 1;
          scores[studentId].highestScore = Math.max(scores[studentId].highestScore, attempt.percentage || 0);
        });

        // Calculate averages
        const processed = Object.values(scores).map((s) => ({
          ...s,
          averageScore: s.attempts.length > 0 ? Math.round(s.attempts.reduce((a, b) => a + b, 0) / s.attempts.length) : 0,
          passRate: s.totalAttempts > 0 ? Math.round((s.passedAttempts / s.totalAttempts) * 100) : 0,
        }));

        // Sort by average score
        processed.sort((a, b) => b.averageScore - a.averageScore);

        setLeaderboard(processed);
      } catch (err) {
        setError('Failed to load leaderboard');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchLeaderboard();
  }, [timeframe]);

  const getMedalEmoji = (rank) => {
    if (rank === 1) return '🥇';
    if (rank === 2) return '🥈';
    if (rank === 3) return '🥉';
    return `#${rank}`;
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
            ← Back to Dashboard
          </button>
        </Link>
      </div>

      {/* Main content */}
      <div style={{ padding: '32px 24px', maxWidth: '1000px', margin: '0 auto' }}>
        {/* Page header */}
        <div style={{ marginBottom: '32px' }}>
          <div style={{ fontSize: '1.75rem', fontWeight: '700', marginBottom: '8px', color: 'var(--text-primary)' }}>
            🏆 Leaderboard
          </div>
          <div style={{ fontSize: '0.95rem', color: 'var(--text-secondary)' }}>
            Top performers across all exams
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

        {/* Loading state */}
        {loading ? (
          <div style={{ textAlign: 'center', color: 'var(--text-secondary)', padding: '40px 20px' }}>
            Loading leaderboard...
          </div>
        ) : leaderboard.length === 0 ? (
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
              No attempts recorded yet
            </div>
          </div>
        ) : (
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
                    <th style={{ padding: '16px 20px', textAlign: 'left', color: 'var(--text-secondary)', fontWeight: '600', width: '80px' }}>
                      Rank
                    </th>
                    <th style={{ padding: '16px 20px', textAlign: 'left', color: 'var(--text-secondary)', fontWeight: '600' }}>
                      Student
                    </th>
                    <th style={{ padding: '16px 20px', textAlign: 'center', color: 'var(--text-secondary)', fontWeight: '600' }}>
                      Avg Score
                    </th>
                    <th style={{ padding: '16px 20px', textAlign: 'center', color: 'var(--text-secondary)', fontWeight: '600' }}>
                      Pass Rate
                    </th>
                    <th style={{ padding: '16px 20px', textAlign: 'center', color: 'var(--text-secondary)', fontWeight: '600' }}>
                      Best Score
                    </th>
                    <th style={{ padding: '16px 20px', textAlign: 'center', color: 'var(--text-secondary)', fontWeight: '600' }}>
                      Attempts
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {leaderboard.map((entry, idx) => (
                    <tr
                      key={idx}
                      style={{
                        borderBottom: idx !== leaderboard.length - 1 ? '1px solid var(--border)' : 'none',
                        transition: 'background 0.2s',
                        background: idx < 3 ? 'rgba(108, 99, 255, 0.05)' : 'transparent',
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.background = 'var(--bg-hover)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.background = idx < 3 ? 'rgba(108, 99, 255, 0.05)' : 'transparent';
                      }}
                    >
                      <td style={{ padding: '16px 20px', color: 'var(--text-primary)', fontWeight: '700', fontSize: '1.1rem' }}>
                        {getMedalEmoji(idx + 1)}
                      </td>
                      <td style={{ padding: '16px 20px', color: 'var(--text-primary)', fontWeight: '500' }}>
                        {entry.name}
                      </td>
                      <td
                        style={{
                          padding: '16px 20px',
                          textAlign: 'center',
                          color: 'var(--text-primary)',
                          fontWeight: '600',
                          fontSize: '1.05rem',
                        }}
                      >
                        <span style={{ color: 'var(--accent)' }}>{entry.averageScore}%</span>
                      </td>
                      <td style={{ padding: '16px 20px', textAlign: 'center', color: 'var(--text-secondary)' }}>
                        <span
                          style={{
                            display: 'inline-block',
                            fontSize: '0.8rem',
                            fontWeight: '600',
                            padding: '4px 10px',
                            borderRadius: 'var(--radius-sm)',
                            background: entry.passRate >= 70 ? 'rgba(34, 216, 122, 0.12)' : 'rgba(255, 179, 71, 0.12)',
                            color: entry.passRate >= 70 ? '#4ade80' : 'var(--warning)',
                          }}
                        >
                          {entry.passRate}%
                        </span>
                      </td>
                      <td style={{ padding: '16px 20px', textAlign: 'center', color: 'var(--success)', fontWeight: '600' }}>
                        {entry.highestScore}%
                      </td>
                      <td style={{ padding: '16px 20px', textAlign: 'center', color: 'var(--text-secondary)' }}>
                        {entry.totalAttempts}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Top 3 Highlight */}
        {leaderboard.length > 0 && (
          <div style={{ marginTop: '32px' }}>
            <div style={{ fontSize: '1.25rem', fontWeight: '700', marginBottom: '16px', color: 'var(--text-primary)' }}>
              🌟 Top Performers
            </div>
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
                gap: '16px',
              }}
            >
              {leaderboard.slice(0, 3).map((entry, idx) => (
                <div
                  key={idx}
                  style={{
                    background: 'var(--bg-card)',
                    border: '1px solid var(--border)',
                    borderRadius: 'var(--radius-lg)',
                    padding: '24px',
                    textAlign: 'center',
                    borderTopWidth: '3px',
                    borderTopColor:
                      idx === 0 ? '#FFD700' : idx === 1 ? '#C0C0C0' : '#CD7F32',
                  }}
                >
                  <div style={{ fontSize: '2.5rem', marginBottom: '12px' }}>
                    {getMedalEmoji(idx + 1)}
                  </div>
                  <div style={{ fontSize: '1.1rem', fontWeight: '700', marginBottom: '4px', color: 'var(--text-primary)' }}>
                    {entry.name}
                  </div>
                  <div style={{ fontSize: '1.75rem', fontWeight: '800', color: 'var(--accent)', marginBottom: '8px' }}>
                    {entry.averageScore}%
                  </div>
                  <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                    Average Score
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
