'use client';

import { useEffect, useState } from 'react';
import API from '@/services/api';
import { useAuth } from '@/context/AuthContext';
import ProtectedRoute from '@/components/ProtectedRoute';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

function DashboardContent() {
  const [exams, setExams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const { user, logout, loading: authLoading } = useAuth();
  const now = new Date();
  const ongoingExams = exams.filter((exam) => new Date(exam.scheduledAt) <= now && new Date(exam.expiresAt) >= now);
  const upcomingExams = exams.filter((exam) => new Date(exam.scheduledAt) > now);

  const [stats, setStats] = useState({
    total: 0,
    completed: 0,
    avgScore: 0,
  });
  const router = useRouter();

  useEffect(() => {
    const fetchExams = async () => {
      try {
        const { data: examsData } = await API.get('/api/exams/available');
        const exams = examsData.data || [];
        console.log('📚 Available exams:', exams.length);
        setExams(exams);

        // Fetch student's attempts to calculate stats
        try {
          const now = new Date();
          const { data: attemptsData } = await API.get('/api/attempts/my');
          const attempts = attemptsData.data || [];
          console.log('📋 Total attempts:', attempts.length);
          const ongoingExamsForStats = exams.filter((exam) => new Date(exam.scheduledAt) <= now && new Date(exam.expiresAt) >= now);
          
          // Count completed exams by unique exam id, not by total attempts
          const completedExamIds = new Set(
            attempts
              .filter((a) => a.isSubmitted && a.exam?._id)
              .map((a) => a.exam._id.toString())
          );
          const completed = completedExamIds.size;
          console.log('✅ Completed exams:', completed);
          
          // Calculate average score - ONLY from released results
          const releasedAttempts = attempts.filter(a => a.isSubmitted && a.resultReleased && a.percentage !== undefined);
          const avgScore = releasedAttempts.length > 0
            ? Math.round(releasedAttempts.reduce((sum, a) => sum + a.percentage, 0) / releasedAttempts.length)
            : 0;
          
          // Available tests = ongoing exams that this student has not already submitted
                    const availableTests = ongoingExamsForStats.filter((exam) => !completedExamIds.has(exam._id.toString())).length;
                    console.log('🎯 Available tests:', availableTests, '(', ongoingExamsForStats.length, 'ongoing,', completed, 'completed exams)');

          setStats({
            total: availableTests,
            completed: completed,
            avgScore: avgScore,
          });
        } catch (err) {
          console.error('❌ Failed to fetch attempts:', err);
          setStats({
            total: Math.max(0, exams.length),
            completed: 0,
            avgScore: 0,
          });
        }
      } catch (err) {
        setError('Failed to load exams');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchExams();
  }, []);

  const handleLogout = () => {
    logout();
    router.push('/login');
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
        <div>
          <div style={{ fontSize: '1.35rem', fontWeight: '800' }}>
            Exam<span style={{ color: 'var(--accent)' }}>Pulse</span>
          </div>
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
      <div style={{ padding: '32px 24px', maxWidth: '1200px', margin: '0 auto' }}>
        {/* Page header with greeting */}
        <div style={{ marginBottom: '32px' }}>
          <div style={{ fontSize: '2rem', fontWeight: '800', marginBottom: '8px', color: 'var(--text-primary)' }}>
            👋 Welcome back, {authLoading ? '...' : user?.name || 'Student'}!
          </div>
          <div style={{ fontSize: '0.95rem', color: 'var(--text-secondary)' }}>
            Here&apos;s what&apos;s happening today
          </div>
        </div>

        {/* Stats grid */}
        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-icon">📝</div>
            <div className="stat-value">{stats.total}</div>
            <div className="stat-label">Available Tests</div>
          </div>
          <div className="stat-card">
            <div className="stat-icon">✅</div>
            <div className="stat-value">{stats.completed}</div>
            <div className="stat-label">Tests Completed</div>
          </div>
          <div className="stat-card">
            <div className="stat-icon">📈</div>
            <div className="stat-value">{stats.avgScore}%</div>
            <div className="stat-label">Average Score</div>
          </div>
        </div>

        {/* Quick access */}
        <div style={{ marginBottom: '18px' }}>
          <Link href="/attempts">
            <button className="btn-primary" style={{ padding: '10px 14px', fontWeight: 700 }}>
              📋 My Attempts
            </button>
          </Link>
        </div>

        {/* Error message */}
        {error && (
          <div style={{ background: 'rgba(255,90,90,0.12)', border: '1px solid rgba(255,90,90,0.3)', borderRadius: 'var(--radius-md)', color: 'var(--danger)', padding: '12px 16px', marginBottom: '24px' }}>
            {error}
          </div>
        )}

        {/* Exams section */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>
          <div>
            <div style={{ fontSize: '1.25rem', fontWeight: '700', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              🟢 Ongoing Exams
            </div>

            {loading ? (
              <div style={{ textAlign: 'center', color: 'var(--text-secondary)', padding: '40px 20px' }}>
                Loading exams...
              </div>
            ) : ongoingExams.length === 0 ? (
              <div className="card" style={{ textAlign: 'center', padding: '32px 20px' }}>
                <div style={{ fontSize: '2rem', marginBottom: '12px' }}>🕒</div>
                <div style={{ color: 'var(--text-primary)', fontWeight: '600', marginBottom: '6px' }}>
                  No ongoing exams right now
                </div>
                <div style={{ color: 'var(--text-secondary)', lineHeight: '1.6' }}>
                  Exams appear here once their scheduled start time begins.
                </div>
              </div>
            ) : (
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
                  gap: '16px',
                }}
              >
                {ongoingExams.map((exam) => (
                  <div key={exam._id} className="card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', transition: 'all 0.2s' }}>
                    <div>
                      <h3 style={{ fontSize: '1.1rem', fontWeight: '600', marginBottom: '8px', color: 'var(--text-primary)' }}>
                        {exam.title}
                      </h3>
                      <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', marginBottom: '12px' }}>
                        {exam.subject || 'General'}
                      </p>
                      <div style={{ display: 'flex', gap: '12px', fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
                        <span>⏱️ {exam.durationMinutes || 60} min</span>
                        <span>❓ {exam.questions?.length || 0} Q&apos;s</span>
                      </div>
                      <div style={{ marginTop: '10px', fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
                        Available now
                      </div>
                    </div>

                    <Link href={`/exam/${exam._id}/instructions`}>
                      <button className="btn-primary" style={{ marginTop: '16px' }}>
                        Start Exam →
                      </button>
                    </Link>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div>
            <div style={{ fontSize: '1.25rem', fontWeight: '700', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              🔵 Upcoming Exams
            </div>

            {loading ? (
              <div style={{ textAlign: 'center', color: 'var(--text-secondary)', padding: '40px 20px' }}>
                Loading exams...
              </div>
            ) : upcomingExams.length === 0 ? (
              <div className="card" style={{ textAlign: 'center', padding: '32px 20px' }}>
                <div style={{ fontSize: '2rem', marginBottom: '12px' }}>📭</div>
                <div style={{ color: 'var(--text-primary)', fontWeight: '600', marginBottom: '6px' }}>
                  No upcoming exams
                </div>
                <div style={{ color: 'var(--text-secondary)', lineHeight: '1.6' }}>
                  Future published exams will show here before they start.
                </div>
              </div>
            ) : (
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
                  gap: '16px',
                }}
              >
                {upcomingExams.map((exam) => (
                  <div key={exam._id} className="card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', transition: 'all 0.2s' }}>
                    <div>
                      <h3 style={{ fontSize: '1.1rem', fontWeight: '600', marginBottom: '8px', color: 'var(--text-primary)' }}>
                        {exam.title}
                      </h3>
                      <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', marginBottom: '12px' }}>
                        {exam.subject || 'General'}
                      </p>
                      <div style={{ display: 'flex', gap: '12px', fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
                        <span>⏱️ {exam.durationMinutes || 60} min</span>
                        <span>❓ {exam.questions?.length || 0} Q&apos;s</span>
                      </div>
                      <div style={{ marginTop: '10px', fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
                        Starts {new Date(exam.scheduledAt).toLocaleString()}
                      </div>
                    </div>

                    <button
                      className="btn-primary"
                      style={{ marginTop: '16px', opacity: 0.55, cursor: 'not-allowed' }}
                      disabled
                    >
                      Starts Later
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function Dashboard() {
  return (
    <ProtectedRoute requiredRole="student">
      <DashboardContent />
    </ProtectedRoute>
  );
}