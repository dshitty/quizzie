'use client';

import { useEffect, useState } from 'react';
import API from '@/services/api';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import ProtectedRoute from '@/components/ProtectedRoute';

function AdminDashboardContent() {
  const [stats, setStats] = useState({
    totalExams: 0,
    totalStudents: 0,
    totalAttempts: 0,
    pendingResults: 0,
  });
  const [recentAttempts, setRecentAttempts] = useState([]);
  const [exams, setExams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const router = useRouter();
  const { logout } = useAuth();

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch exams, attempts, and total students count
        const [examsRes, attemptsRes, studentsCountRes] = await Promise.all([
          API.get('/api/exams'),
          API.get('/api/attempts'),
          API.get('/api/auth/students/count'),
        ]);

        setExams(examsRes.data.data || []);

        const allAttempts = attemptsRes.data.data || [];
        const totalStudents = studentsCountRes.data.count || 0;

        setRecentAttempts(allAttempts.slice(0, 5));

        // Calculate stats
        const pendingCount = allAttempts.filter(a => !a.resultReleased).length;
        
        // Count unique exams that have unreleased results
        const examsWithUnreleasedResults = new Set(
          allAttempts.filter(a => !a.resultReleased && a.exam?._id).map(a => a.exam._id.toString())
        ).size;

        setStats({
          totalExams: examsRes.data.data?.length || 0,
          totalStudents,
          totalAttempts: examsWithUnreleasedResults,
          pendingResults: pendingCount,
        });
      } catch (err) {
        setError('Failed to load dashboard data');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleLogout = () => {
    logout();
    router.push('/login');
  };

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
          Exam<span style={{ color: 'var(--accent)' }}>Pulse</span> <span style={{ fontSize: '0.75rem', background: 'var(--accent)', color: '#fff', padding: '4px 8px', borderRadius: 'var(--radius-sm)', marginLeft: '8px' }}>ADMIN</span>
        </div>
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

      {/* Main content */}
      <div style={{ padding: '32px 24px', maxWidth: '1400px', margin: '0 auto' }}>
        {/* Page header */}
        <div style={{ marginBottom: '32px' }}>
          <div style={{ fontSize: '1.75rem', fontWeight: '700', marginBottom: '8px', color: 'var(--text-primary)' }}>
            🎛️ Admin Dashboard
          </div>
          <div style={{ fontSize: '0.95rem', color: 'var(--text-secondary)' }}>
            Manage exams, students, and monitor attempts
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

        {loading ? (
          <div style={{ textAlign: 'center', color: 'var(--text-secondary)', padding: '40px 20px' }}>
            Loading dashboard data...
          </div>
        ) : (
          <>
            {/* Stats Grid */}
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
                gap: '16px',
                marginBottom: '32px',
              }}
            >
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
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                  <div style={{ fontSize: '2rem' }}>📚</div>
                </div>
                <div style={{ fontSize: '2rem', fontWeight: '700', marginBottom: '4px', color: 'var(--text-primary)' }}>
                  {stats.totalExams}
                </div>
                <div style={{ fontSize: '0.88rem', color: 'var(--text-secondary)' }}>
                  Total Exams
                </div>
              </div>

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
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                  <div style={{ fontSize: '2rem' }}>👥</div>
                </div>
                <div style={{ fontSize: '2rem', fontWeight: '700', marginBottom: '4px', color: 'var(--text-primary)' }}>
                  {stats.totalStudents}
                </div>
                <div style={{ fontSize: '0.88rem', color: 'var(--text-secondary)' }}>
                  Total Students
                </div>
              </div>

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
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                  <div style={{ fontSize: '2rem' }}>📋</div>
                </div>
                <div style={{ fontSize: '2rem', fontWeight: '700', marginBottom: '4px', color: 'var(--text-primary)' }}>
                  {stats.totalAttempts}
                </div>
                <div style={{ fontSize: '0.88rem', color: 'var(--text-secondary)' }}>
                  Exams with Unreleased Results
                </div>
              </div>

              <div
                style={{
                  background: 'var(--bg-card)',
                  border: '1px solid rgba(255, 179, 71, 0.3)',
                  borderRadius: 'var(--radius-lg)',
                  padding: '24px',
                  transition: 'all 0.2s',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = 'var(--warning)';
                  e.currentTarget.style.boxShadow = '0 4px 12px rgba(255, 179, 71, 0.1)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = 'rgba(255, 179, 71, 0.3)';
                  e.currentTarget.style.boxShadow = 'none';
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                  <div style={{ fontSize: '2rem' }}>⏳</div>
                </div>
                <div style={{ fontSize: '2rem', fontWeight: '700', marginBottom: '4px', color: 'var(--warning)' }}>
                  {stats.pendingResults}
                </div>
                <div style={{ fontSize: '0.88rem', color: 'var(--text-secondary)' }}>
                  Pending Results
                </div>
              </div>
            </div>

            {/* Recent Attempts Section */}
            <div style={{ marginBottom: '32px' }}>
              <div style={{ fontSize: '1.25rem', fontWeight: '700', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-primary)' }}>
                📋 Recent Attempts
              </div>

              {recentAttempts.length === 0 ? (
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
                  No attempts yet
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
                        <tr style={{ borderBottom: '1px solid var(--border)' }}>
                          <th style={{ padding: '16px 20px', textAlign: 'left', color: 'var(--text-secondary)', fontWeight: '600' }}>
                            Student
                          </th>
                          <th style={{ padding: '16px 20px', textAlign: 'left', color: 'var(--text-secondary)', fontWeight: '600' }}>
                            Exam
                          </th>
                          <th style={{ padding: '16px 20px', textAlign: 'center', color: 'var(--text-secondary)', fontWeight: '600' }}>
                            Score
                          </th>
                          <th style={{ padding: '16px 20px', textAlign: 'left', color: 'var(--text-secondary)', fontWeight: '600' }}>
                            Status
                          </th>
                          <th style={{ padding: '16px 20px', textAlign: 'left', color: 'var(--text-secondary)', fontWeight: '600' }}>
                            Date
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {recentAttempts.map((attempt, idx) => (
                          <tr
                            key={attempt._id}
                            style={{
                              borderBottom: idx !== recentAttempts.length - 1 ? '1px solid var(--border)' : 'none',
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
                            <td style={{ padding: '16px 20px', color: 'var(--text-secondary)' }}>
                              {attempt.exam?.title || 'Unknown'}
                            </td>
                            <td style={{ padding: '16px 20px', textAlign: 'center', color: 'var(--text-primary)', fontWeight: '600' }}>
                              {attempt.percentage !== undefined ? `${attempt.percentage}%` : '-'}
                            </td>
                            <td style={{ padding: '16px 20px' }}>
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
                                {attempt.resultReleased ? '✅ Released' : '⏳ Pending'}
                              </span>
                            </td>
                            <td style={{ padding: '16px 20px', color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
                              {formatDate(attempt.submittedAt || attempt.createdAt)}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>

            {/* Quick Actions */}
            <div style={{ marginBottom: '32px' }}>
              <div style={{ fontSize: '1.25rem', fontWeight: '700', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-primary)' }}>
                ⚡ Quick Actions
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '12px' }}>
                <Link href="/admin/exams">
                  <button
                    style={{
                      width: '100%',
                      background: 'var(--accent)',
                      color: '#fff',
                      padding: '14px 16px',
                      borderRadius: 'var(--radius-md)',
                      cursor: 'pointer',
                      fontSize: '0.9rem',
                      fontWeight: '600',
                      border: 'none',
                      transition: 'all 0.2s',
                      textAlign: 'center',
                    }}
                    onMouseEnter={(e) => {
                      e.target.style.opacity = '0.9';
                    }}
                    onMouseLeave={(e) => {
                      e.target.style.opacity = '1';
                    }}
                  >
                    📚 Manage Exams
                  </button>
                </Link>

                <Link href="/admin/attempts">
                  <button
                    style={{
                      width: '100%',
                      background: 'var(--bg-card)',
                      border: '1px solid var(--border)',
                      color: 'var(--text-primary)',
                      padding: '14px 16px',
                      borderRadius: 'var(--radius-md)',
                      cursor: 'pointer',
                      fontSize: '0.9rem',
                      fontWeight: '600',
                      transition: 'all 0.2s',
                      textAlign: 'center',
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.borderColor = 'var(--border-accent)';
                      e.currentTarget.style.color = 'var(--accent)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.borderColor = 'var(--border)';
                      e.currentTarget.style.color = 'var(--text-primary)';
                    }}
                  >
                    ✍️ Review Attempts
                  </button>
                </Link>

                <Link href="/admin/results">
                  <button
                    style={{
                      width: '100%',
                      background: 'var(--bg-card)',
                      border: '1px solid var(--border)',
                      color: 'var(--text-primary)',
                      padding: '14px 16px',
                      borderRadius: 'var(--radius-md)',
                      cursor: 'pointer',
                      fontSize: '0.9rem',
                      fontWeight: '600',
                      transition: 'all 0.2s',
                      textAlign: 'center',
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.borderColor = 'var(--border-accent)';
                      e.currentTarget.style.color = 'var(--accent)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.borderColor = 'var(--border)';
                      e.currentTarget.style.color = 'var(--text-primary)';
                    }}
                  >
                    📊 Release Results
                  </button>
                </Link>

                <Link href="/admin/students">
                  <button
                    style={{
                      width: '100%',
                      background: 'var(--bg-card)',
                      border: '1px solid var(--border)',
                      color: 'var(--text-primary)',
                      padding: '14px 16px',
                      borderRadius: 'var(--radius-md)',
                      cursor: 'pointer',
                      fontSize: '0.9rem',
                      fontWeight: '600',
                      transition: 'all 0.2s',
                      textAlign: 'center',
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.borderColor = 'var(--border-accent)';
                      e.currentTarget.style.color = 'var(--accent)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.borderColor = 'var(--border)';
                      e.currentTarget.style.color = 'var(--text-primary)';
                    }}
                  >
                    👥 Manage Students
                  </button>
                </Link>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default function AdminDashboard() {
  return (
    <ProtectedRoute requiredRole="admin">
      <AdminDashboardContent />
    </ProtectedRoute>
  );
}
