'use client';

import { useEffect, useState } from 'react';
import API from '@/services/api';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function ManageExamsPage() {
  const [exams, setExams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const router = useRouter();

  const showError = (message) => {
    setError(message);
    setTimeout(() => setError(''), 4000);
  };

  const showSuccess = (message) => {
    setSuccess(message);
    setTimeout(() => setSuccess(''), 3000);
  };

  useEffect(() => {
    const fetchExams = async () => {
      try {
        const { data } = await API.get('/api/exams');
        setExams(data.data || []);
      } catch (err) {
        showError('Failed to load exams');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchExams();
  }, []);

  const handleDeleteExam = async (examId, currentStatus) => {
    if (currentStatus === 'active') {
      showError('Cannot delete a published exam. Unpublish it first.');
      return;
    }

    if (!window.confirm('Are you sure you want to delete this exam? This cannot be undone.')) return;

    try {
      await API.delete(`/api/exams/${examId}`);
      setExams((prev) => prev.filter((e) => e._id !== examId));
      showSuccess('Exam deleted successfully');
    } catch (err) {
      showError(err.response?.data?.message || 'Failed to delete exam');
    }
  };

  const handleToggleStatus = async (examId, currentStatus) => {
    try {
      const newStatus = currentStatus === 'active' ? 'draft' : 'active';
      await API.patch(`/api/exams/${examId}/status`, { status: newStatus });
      
      // Update local state
      setExams((prev) =>
        prev.map((e) =>
          e._id === examId ? { ...e, status: newStatus } : e
        )
      );
      
      showSuccess(`Exam ${newStatus === 'active' ? 'published' : 'unpublished'} successfully`);
    } catch (err) {
      showError(`Failed to ${currentStatus === 'active' ? 'unpublish' : 'publish'} exam`);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'active':
        return { bg: 'rgba(34, 216, 122, 0.12)', color: '#4ade80', label: '🟢 Active' };
      case 'scheduled':
        return { bg: 'rgba(168, 162, 255, 0.12)', color: 'var(--accent)', label: '🔵 Scheduled' };
      case 'closed':
        return { bg: 'rgba(255, 90, 90, 0.12)', color: 'var(--danger)', label: '🔴 Closed' };
      default:
        return { bg: 'rgba(136, 136, 176, 0.12)', color: 'var(--text-secondary)', label: '⚪ Draft' };
    }
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
        <div style={{ marginBottom: '32px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <div style={{ fontSize: '1.75rem', fontWeight: '700', marginBottom: '8px', color: 'var(--text-primary)' }}>
              📚 Manage Exams
            </div>
            <div style={{ fontSize: '0.95rem', color: 'var(--text-secondary)' }}>
              View, edit, and manage all exams
            </div>
          </div>
          <Link href="/admin/exams/create">
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
                whiteSpace: 'nowrap',
              }}
              onMouseEnter={(e) => {
                e.target.style.opacity = '0.9';
              }}
              onMouseLeave={(e) => {
                e.target.style.opacity = '1';
              }}
            >
              ➕ Create New Exam
            </button>
          </Link>
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

        {/* Loading state */}
        {loading ? (
          <div style={{ textAlign: 'center', color: 'var(--text-secondary)', padding: '40px 20px' }}>
            Loading exams...
          </div>
        ) : exams.length === 0 ? (
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
              No exams yet
            </div>
            <div style={{ color: 'var(--text-secondary)', marginBottom: '20px' }}>
              Create your first exam to get started
            </div>
            <Link href="/admin/exams/create">
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
                Create First Exam
              </button>
            </Link>
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
                    <th style={{ padding: '16px 20px', textAlign: 'left', color: 'var(--text-secondary)', fontWeight: '600' }}>
                      Title
                    </th>
                    <th style={{ padding: '16px 20px', textAlign: 'left', color: 'var(--text-secondary)', fontWeight: '600' }}>
                      Subject
                    </th>
                    <th style={{ padding: '16px 20px', textAlign: 'center', color: 'var(--text-secondary)', fontWeight: '600' }}>
                      Questions
                    </th>
                    <th style={{ padding: '16px 20px', textAlign: 'center', color: 'var(--text-secondary)', fontWeight: '600' }}>
                      Total Marks
                    </th>
                    <th style={{ padding: '16px 20px', textAlign: 'center', color: 'var(--text-secondary)', fontWeight: '600' }}>
                      Duration
                    </th>
                    <th style={{ padding: '16px 20px', textAlign: 'left', color: 'var(--text-secondary)', fontWeight: '600' }}>
                      Status
                    </th>
                    <th style={{ padding: '16px 20px', textAlign: 'right', color: 'var(--text-secondary)', fontWeight: '600' }}>
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {exams.map((exam, idx) => {
                    const statusInfo = getStatusColor(exam.status);
                    return (
                      <tr
                        key={exam._id}
                        style={{
                          borderBottom: idx !== exams.length - 1 ? '1px solid var(--border)' : 'none',
                          transition: 'background 0.2s',
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.background = 'var(--bg-hover)';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.background = 'transparent';
                        }}
                      >
                        <td style={{ padding: '16px 20px', color: 'var(--text-primary)', fontWeight: '500' }}>
                          {exam.title}
                        </td>
                        <td style={{ padding: '16px 20px', color: 'var(--text-secondary)' }}>
                          {exam.subject || '-'}
                        </td>
                        <td style={{ padding: '16px 20px', textAlign: 'center', color: 'var(--text-primary)' }}>
                          {exam.questions?.length || 0}
                        </td>
                        <td style={{ padding: '16px 20px', textAlign: 'center', color: 'var(--text-primary)' }}>
                          {exam.totalMarks || 0}
                        </td>
                        <td style={{ padding: '16px 20px', textAlign: 'center', color: 'var(--text-secondary)' }}>
                          {exam.durationMinutes}m
                        </td>
                        <td style={{ padding: '16px 20px' }}>
                          <span
                            style={{
                              display: 'inline-block',
                              fontSize: '0.8rem',
                              fontWeight: '600',
                              padding: '4px 10px',
                              borderRadius: 'var(--radius-sm)',
                              background: statusInfo.bg,
                              color: statusInfo.color,
                            }}
                          >
                            {statusInfo.label}
                          </span>
                        </td>
                        <td style={{ padding: '16px 20px' }}>
                          <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end', flexWrap: 'wrap' }}>
                            <Link href={`/admin/exams/${exam._id}/edit`}>
                              <button
                                style={{
                                  background: 'var(--accent-soft)',
                                  border: 'none',
                                  color: 'var(--accent)',
                                  padding: '6px 12px',
                                  borderRadius: 'var(--radius-sm)',
                                  cursor: 'pointer',
                                  fontSize: '0.8rem',
                                  fontWeight: '600',
                                  transition: 'all 0.2s',
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
                                ✏️ Edit
                              </button>
                            </Link>

                            <button
                              onClick={() => handleToggleStatus(exam._id, exam.status)}
                              style={{
                                background: exam.status === 'active' ? 'rgba(255,90,90,0.12)' : 'rgba(34,216,122,0.12)',
                                border: 'none',
                                color: exam.status === 'active' ? 'var(--danger)' : '#4ade80',
                                padding: '6px 12px',
                                borderRadius: 'var(--radius-sm)',
                                cursor: 'pointer',
                                fontSize: '0.8rem',
                                fontWeight: '600',
                                transition: 'all 0.2s',
                                whiteSpace: 'nowrap',
                              }}
                              onMouseEnter={(e) => {
                                e.target.style.opacity = '0.8';
                              }}
                              onMouseLeave={(e) => {
                                e.target.style.opacity = '1';
                              }}
                              title={exam.status === 'active' ? 'Unpublish exam (hide from students)' : 'Publish exam (show to students)'}
                            >
                              {exam.status === 'active' ? '📴 Unpublish' : '📢 Publish'}
                            </button>

                            <button
                              onClick={() => handleDeleteExam(exam._id, exam.status)}
                              style={{
                                background: 'rgba(255,90,90,0.12)',
                                border: 'none',
                                color: 'var(--danger)',
                                padding: '6px 12px',
                                borderRadius: 'var(--radius-sm)',
                                cursor: 'pointer',
                                fontSize: '0.8rem',
                                fontWeight: '600',
                                transition: 'all 0.2s',
                              }}
                              onMouseEnter={(e) => {
                                e.target.style.background = 'rgba(255,90,90,0.25)';
                              }}
                              onMouseLeave={(e) => {
                                e.target.style.background = 'rgba(255,90,90,0.12)';
                              }}
                            >
                              🗑️ Delete
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
