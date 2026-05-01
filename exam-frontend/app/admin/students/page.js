'use client';

import { useEffect, useState } from 'react';
import API from '@/services/api';
import Link from 'next/link';

export default function StudentsPage() {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const fetchStudents = async () => {
      try {
        const { data } = await API.get('/api/users?role=student');
        setStudents(data.data || []);
      } catch (err) {
        setError('Failed to load students');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchStudents();
  }, []);

  const filteredStudents = students.filter(
    (s) =>
      s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

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
            👥 All Students
          </div>
          <div style={{ fontSize: '0.95rem', color: 'var(--text-secondary)' }}>
            Manage and view all registered students
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

        {/* Search */}
        <div style={{ marginBottom: '24px' }}>
          <input
            type="text"
            placeholder="Search by name or email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{
              width: '100%',
              maxWidth: '400px',
              background: 'var(--bg-card)',
              border: '1px solid var(--border)',
              color: 'var(--text-primary)',
              padding: '10px 14px',
              borderRadius: 'var(--radius-md)',
              fontSize: '0.9rem',
              transition: 'all 0.2s',
              boxSizing: 'border-box',
            }}
            onFocus={(e) => {
              e.target.style.borderColor = 'var(--border-accent)';
              e.target.style.boxShadow = '0 0 0 3px rgba(108, 99, 255, 0.1)';
            }}
            onBlur={(e) => {
              e.target.style.borderColor = 'var(--border)';
              e.target.style.boxShadow = 'none';
            }}
          />
        </div>

        {/* Loading state */}
        {loading ? (
          <div style={{ textAlign: 'center', color: 'var(--text-secondary)', padding: '40px 20px' }}>
            Loading students...
          </div>
        ) : filteredStudents.length === 0 ? (
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
              {searchTerm ? 'No students found' : 'No students registered yet'}
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
                    <th style={{ padding: '16px 20px', textAlign: 'left', color: 'var(--text-secondary)', fontWeight: '600' }}>
                      Name
                    </th>
                    <th style={{ padding: '16px 20px', textAlign: 'left', color: 'var(--text-secondary)', fontWeight: '600' }}>
                      Email
                    </th>
                    <th style={{ padding: '16px 20px', textAlign: 'left', color: 'var(--text-secondary)', fontWeight: '600' }}>
                      Phone
                    </th>
                    <th style={{ padding: '16px 20px', textAlign: 'left', color: 'var(--text-secondary)', fontWeight: '600' }}>
                      Joined
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {filteredStudents.map((student, idx) => (
                    <tr
                      key={student._id}
                      style={{
                        borderBottom: idx !== filteredStudents.length - 1 ? '1px solid var(--border)' : 'none',
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
                      <td style={{ padding: '16px 20px', color: 'var(--text-secondary)' }}>
                        {student.email}
                      </td>
                      <td style={{ padding: '16px 20px', color: 'var(--text-secondary)' }}>
                        {student.phone || '-'}
                      </td>
                      <td style={{ padding: '16px 20px', color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
                        {new Date(student.createdAt).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric',
                        })}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Stats */}
        {students.length > 0 && (
          <div style={{ marginTop: '24px', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
            <div
              style={{
                background: 'var(--bg-card)',
                border: '1px solid var(--border)',
                borderRadius: 'var(--radius-lg)',
                padding: '20px',
                textAlign: 'center',
              }}
            >
              <div style={{ fontSize: '1.75rem', fontWeight: '700', marginBottom: '4px', color: 'var(--accent)' }}>
                {students.length}
              </div>
              <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                Total Students
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
