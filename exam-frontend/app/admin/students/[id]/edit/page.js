'use client';

import { useEffect, useState } from 'react';
import API from '@/services/api';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';

export default function EditStudentPage() {
  const router = useRouter();
  const params = useParams();
  const studentId = params.id;

  const [formData, setFormData] = useState({
    name: '',
    email: '',
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [generalError, setGeneralError] = useState('');
  const [loadError, setLoadError] = useState('');

  useEffect(() => {
    const fetchStudent = async () => {
      try {
        const { data } = await API.get(`/api/users/students/${studentId}`);
        if (data.student) {
          setFormData({
            name: data.student.name,
            email: data.student.email,
          });
        }
      } catch (err) {
        setLoadError('Failed to load student details');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    if (studentId) {
      fetchStudent();
    }
  }, [studentId]);

  const validateForm = () => {
    const newErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email must be valid';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: '',
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setGeneralError('');

    if (!validateForm()) return;

    setSaving(true);
    try {
      await API.patch(`/api/users/students/${studentId}`, {
        name: formData.name.trim(),
        email: formData.email.trim(),
      });

      router.push('/admin/students');
    } catch (err) {
      const message = err.response?.data?.message || 'Failed to update student';
      setGeneralError(message);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', background: 'var(--bg-base)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ color: 'var(--text-secondary)' }}>Loading student details...</div>
      </div>
    );
  }

  if (loadError) {
    return (
      <div style={{ minHeight: '100vh', background: 'var(--bg-base)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div
          style={{
            background: 'var(--bg-card)',
            border: '1px solid var(--border)',
            borderRadius: 'var(--radius-lg)',
            padding: '32px',
            maxWidth: '500px',
            textAlign: 'center',
          }}
        >
          <div style={{ fontSize: '2rem', marginBottom: '12px' }}>❌</div>
          <div style={{ color: 'var(--text-primary)', fontWeight: '600', marginBottom: '12px' }}>
            Error Loading Student
          </div>
          <div style={{ color: 'var(--text-secondary)', marginBottom: '24px' }}>
            {loadError}
          </div>
          <Link href="/admin/students">
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
              Back to Students
            </button>
          </Link>
        </div>
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
        <Link href="/admin/students">
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
            ← Back to Students
          </button>
        </Link>
      </div>

      {/* Main content */}
      <div style={{ padding: '32px 24px', maxWidth: '600px', margin: '0 auto' }}>
        {/* Page header */}
        <div style={{ marginBottom: '32px' }}>
          <div style={{ fontSize: '1.75rem', fontWeight: '700', marginBottom: '8px', color: 'var(--text-primary)' }}>
            ✏️ Edit Student
          </div>
          <div style={{ fontSize: '0.95rem', color: 'var(--text-secondary)' }}>
            Update student information
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit}>
          <div
            style={{
              background: 'var(--bg-card)',
              border: '1px solid var(--border)',
              borderRadius: 'var(--radius-lg)',
              padding: '32px',
            }}
          >
            {/* Error message */}
            {generalError && (
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
                ❌ {generalError}
              </div>
            )}

            {/* Name field */}
            <div style={{ marginBottom: '24px' }}>
              <label style={{ display: 'block', marginBottom: '8px', color: 'var(--text-primary)', fontWeight: '600' }}>
                Full Name *
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="Enter student name"
                style={{
                  width: '100%',
                  padding: '10px 12px',
                  border: errors.name ? '1px solid var(--danger)' : '1px solid var(--border)',
                  borderRadius: 'var(--radius-md)',
                  background: 'var(--bg-base)',
                  color: 'var(--text-primary)',
                  fontSize: '0.9rem',
                  transition: 'all 0.2s',
                  boxSizing: 'border-box',
                }}
                onFocus={(e) => {
                  if (!errors.name) {
                    e.target.style.borderColor = 'var(--accent)';
                    e.target.style.boxShadow = '0 0 0 3px rgba(138, 92, 255, 0.1)';
                  }
                }}
                onBlur={(e) => {
                  if (!errors.name) {
                    e.target.style.borderColor = 'var(--border)';
                    e.target.style.boxShadow = 'none';
                  }
                }}
              />
              {errors.name && <div style={{ color: 'var(--danger)', fontSize: '0.8rem', marginTop: '4px' }}>⚠️ {errors.name}</div>}
            </div>

            {/* Email field */}
            <div style={{ marginBottom: '24px' }}>
              <label style={{ display: 'block', marginBottom: '8px', color: 'var(--text-primary)', fontWeight: '600' }}>
                Email Address *
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="student@example.com"
                style={{
                  width: '100%',
                  padding: '10px 12px',
                  border: errors.email ? '1px solid var(--danger)' : '1px solid var(--border)',
                  borderRadius: 'var(--radius-md)',
                  background: 'var(--bg-base)',
                  color: 'var(--text-primary)',
                  fontSize: '0.9rem',
                  transition: 'all 0.2s',
                  boxSizing: 'border-box',
                }}
                onFocus={(e) => {
                  if (!errors.email) {
                    e.target.style.borderColor = 'var(--accent)';
                    e.target.style.boxShadow = '0 0 0 3px rgba(138, 92, 255, 0.1)';
                  }
                }}
                onBlur={(e) => {
                  if (!errors.email) {
                    e.target.style.borderColor = 'var(--border)';
                    e.target.style.boxShadow = 'none';
                  }
                }}
              />
              {errors.email && <div style={{ color: 'var(--danger)', fontSize: '0.8rem', marginTop: '4px' }}>⚠️ {errors.email}</div>}
            </div>

            <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', background: 'var(--bg-hover)', padding: '12px', borderRadius: 'var(--radius-md)', marginBottom: '24px' }}>
              ℹ️ Password can only be changed by the student through their profile settings.
            </div>

            {/* Buttons */}
            <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end', marginTop: '32px' }}>
              <Link href="/admin/students">
                <button
                  type="button"
                  style={{
                    background: 'var(--bg-base)',
                    border: '1px solid var(--border)',
                    color: 'var(--text-secondary)',
                    padding: '10px 20px',
                    borderRadius: 'var(--radius-md)',
                    cursor: 'pointer',
                    fontSize: '0.9rem',
                    fontWeight: '600',
                    transition: 'all 0.2s',
                  }}
                  onMouseEnter={(e) => {
                    e.target.style.borderColor = 'var(--accent)';
                    e.target.style.color = 'var(--accent)';
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.borderColor = 'var(--border)';
                    e.target.style.color = 'var(--text-secondary)';
                  }}
                >
                  Cancel
                </button>
              </Link>
              <button
                type="submit"
                disabled={saving}
                style={{
                  background: 'var(--accent)',
                  color: '#fff',
                  padding: '10px 20px',
                  borderRadius: 'var(--radius-md)',
                  cursor: saving ? 'not-allowed' : 'pointer',
                  fontSize: '0.9rem',
                  fontWeight: '600',
                  border: 'none',
                  transition: 'all 0.2s',
                  opacity: saving ? 0.7 : 1,
                }}
                onMouseEnter={(e) => {
                  if (!saving) e.target.style.opacity = '0.9';
                }}
                onMouseLeave={(e) => {
                  if (!saving) e.target.style.opacity = '1';
                }}
              >
                {saving ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function EditStudentPage() {
  return (
    <ProtectedRoute requiredRole="admin">
      <EditStudentPageContent />
    </ProtectedRoute>
  );
}
