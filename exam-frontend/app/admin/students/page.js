'use client';

import { useEffect, useState } from 'react';
import API from '@/services/api';
import { useRouter } from 'next/navigation';
import ProtectedRoute from '@/components/ProtectedRoute';
import Link from 'next/link';

function ManageStudentsPageContent() {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [search, setSearch] = useState('');
  const [filterActive, setFilterActive] = useState('all');
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
    const fetchStudents = async () => {
      try {
        let url = '/api/users/students';
        const params = new URLSearchParams();

        if (search) params.append('search', search);
        if (filterActive !== 'all') params.append('role', filterActive);

        if (params.toString()) {
          url += `?${params.toString()}`;
        }

        const { data } = await API.get(url);
        setStudents(data.students || []);
      } catch (err) {
        showError('Failed to load students');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    const timer = setTimeout(() => {
      setLoading(true);
      fetchStudents();
    }, 300);

    return () => clearTimeout(timer);
  }, [search, filterActive]);

  const handleDeleteStudent = async (studentId, studentName) => {
    if (!window.confirm(`Are you sure you want to delete ${studentName}? This cannot be undone.`)) return;

    try {
      await API.delete(`/api/users/students/${studentId}`);
      setStudents((prev) => prev.filter((s) => s._id !== studentId));
      showSuccess('Student deleted successfully');
    } catch (err) {
      showError(err.response?.data?.message || 'Failed to delete student');
    }
  };

  const handleToggleActive = async (studentId, currentStatus, studentName) => {
    try {
      const newStatus = !currentStatus;
      await API.patch(`/api/users/students/${studentId}`, { isActive: newStatus });

      setStudents((prev) =>
        prev.map((s) =>
          s._id === studentId ? { ...s, isActive: newStatus } : s
        )
      );

      showSuccess(`${studentName} ${newStatus ? 'activated' : 'deactivated'} successfully`);
    } catch (err) {
      showError(err.response?.data?.message || 'Failed to update student status');
    }
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
              👥 Manage Students
            </div>
            <div style={{ fontSize: '0.95rem', color: 'var(--text-secondary)' }}>
              View, edit, and manage all registered students
            </div>
          </div>
          <Link href="/admin/students/create">
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
              ➕ Add Student
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

        {/* Search and filter */}
        <div
          style={{
            background: 'var(--bg-card)',
            border: '1px solid var(--border)',
            borderRadius: 'var(--radius-lg)',
            padding: '20px',
            marginBottom: '24px',
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
            gap: '16px',
          }}
        >
          <div>
            <label style={{ display: 'block', marginBottom: '8px', color: 'var(--text-secondary)', fontSize: '0.85rem', fontWeight: '600' }}>
              Search by name or email
            </label>
            <input
              type="text"
              placeholder="Type to search..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{
                width: '100%',
                padding: '10px 12px',
                border: '1px solid var(--border)',
                borderRadius: 'var(--radius-md)',
                background: 'var(--bg-base)',
                color: 'var(--text-primary)',
                fontSize: '0.9rem',
                transition: 'all 0.2s',
              }}
              onFocus={(e) => {
                e.target.style.borderColor = 'var(--accent)';
                e.target.style.boxShadow = '0 0 0 3px rgba(138, 92, 255, 0.1)';
              }}
              onBlur={(e) => {
                e.target.style.borderColor = 'var(--border)';
                e.target.style.boxShadow = 'none';
              }}
            />
          </div>

          <div>
            <label style={{ display: 'block', marginBottom: '8px', color: 'var(--text-secondary)', fontSize: '0.85rem', fontWeight: '600' }}>
              Status
            </label>
            <select
              value={filterActive}
              onChange={(e) => setFilterActive(e.target.value)}
              style={{
                width: '100%',
                padding: '10px 12px',
                border: '1px solid var(--border)',
                borderRadius: 'var(--radius-md)',
                background: 'var(--bg-base)',
                color: 'var(--text-primary)',
                fontSize: '0.9rem',
                transition: 'all 0.2s',
              }}
            >
              <option value="all">All Students</option>
              <option value="active">🟢 Active (Approved)</option>
              <option value="inactive">⏳ Pending Approval</option>
            </select>
          </div>
        </div>

        {/* Loading state */}
        {loading ? (
          <div style={{ textAlign: 'center', color: 'var(--text-secondary)', padding: '40px 20px' }}>
            Loading students...
          </div>
        ) : students.length === 0 ? (
          <div
            style={{
              background: 'var(--bg-card)',
              border: '1px solid var(--border)',
              borderRadius: 'var(--radius-lg)',
              padding: '40px 20px',
              textAlign: 'center',
            }}
          >
            <div style={{ fontSize: '2.5rem', marginBottom: '12px' }}>👨‍🎓</div>
            <div style={{ fontSize: '1rem', fontWeight: '500', marginBottom: '8px', color: 'var(--text-primary)' }}>
              No students found
            </div>
            <div style={{ color: 'var(--text-secondary)', marginBottom: '20px' }}>
              {search || filterActive !== 'all' ? 'Try adjusting your filters' : 'Add your first student to get started'}
            </div>
            {!search && filterActive === 'all' && (
              <Link href="/admin/students/create">
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
                  Add First Student
                </button>
              </Link>
            )}
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
                      Name
                    </th>
                    <th style={{ padding: '16px 20px', textAlign: 'left', color: 'var(--text-secondary)', fontWeight: '600' }}>
                      Email
                    </th>
                    <th style={{ padding: '16px 20px', textAlign: 'center', color: 'var(--text-secondary)', fontWeight: '600' }}>
                      Joined
                    </th>
                    <th style={{ padding: '16px 20px', textAlign: 'center', color: 'var(--text-secondary)', fontWeight: '600' }}>
                      Status
                    </th>
                    <th style={{ padding: '16px 20px', textAlign: 'right', color: 'var(--text-secondary)', fontWeight: '600' }}>
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {students.map((student, idx) => (
                    <tr
                      key={student._id}
                      style={{
                        borderBottom: idx !== students.length - 1 ? '1px solid var(--border)' : 'none',
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
                        {student.name}
                      </td>
                      <td style={{ padding: '16px 20px', color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
                        {student.email}
                      </td>
                      <td style={{ padding: '16px 20px', textAlign: 'center', color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
                        {new Date(student.createdAt).toLocaleDateString()}
                      </td>
                      <td style={{ padding: '16px 20px', textAlign: 'center' }}>
                        <span
                          style={{
                            display: 'inline-block',
                            fontSize: '0.8rem',
                            fontWeight: '600',
                            padding: '4px 10px',
                            borderRadius: 'var(--radius-sm)',
                            background: student.isActive ? 'rgba(34, 216, 122, 0.12)' : 'rgba(255, 179, 71, 0.12)',
                            color: student.isActive ? '#4ade80' : 'var(--warning)',
                          }}
                        >
                          {student.isActive ? '✅ Approved' : '⏳ Pending Approval'}
                        </span>
                      </td>
                      <td style={{ padding: '16px 20px' }}>
                        <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end', flexWrap: 'wrap' }}>
                          <Link href={`/admin/students/${student._id}/edit`}>
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
                            onClick={() => handleToggleActive(student._id, student.isActive, student.name)}
                            style={{
                              background: student.isActive ? 'rgba(255,90,90,0.12)' : 'rgba(34,216,122,0.12)',
                              border: 'none',
                              color: student.isActive ? 'var(--danger)' : '#4ade80',
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
                            title={student.isActive ? 'Revoke access' : 'Approve account'}
                          >
                            {student.isActive ? '📅 Revoke' : '✅ Approve'}
                          </button>

                          <button
                            onClick={() => handleDeleteStudent(student._id, student.name)}
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
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default function ManageStudentsPage() {
  return (
    <ProtectedRoute requiredRole="admin">
      <ManageStudentsPageContent />
    </ProtectedRoute>
  );
}
