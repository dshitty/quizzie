'use client';

import { useState } from 'react';
import API from '@/services/api';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import ProtectedRoute from '@/components/ProtectedRoute';

function CreateStudentPageContent() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [generalError, setGeneralError] = useState('');
  const router = useRouter();

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

    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }

    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
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

    setLoading(true);
    try {
      await API.post('/api/users/students', {
        name: formData.name.trim(),
        email: formData.email.trim(),
        password: formData.password,
      });

      router.push('/admin/students');
    } catch (err) {
      const message = err.response?.data?.message || 'Failed to create student';
      setGeneralError(message);
    } finally {
      setLoading(false);
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
            ➕ Add New Student
          </div>
          <div style={{ fontSize: '0.95rem', color: 'var(--text-secondary)' }}>
            Create a new student account
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

            {/* Password field */}
            <div style={{ marginBottom: '24px' }}>
              <label style={{ display: 'block', marginBottom: '8px', color: 'var(--text-primary)', fontWeight: '600' }}>
                Password *
              </label>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="At least 6 characters"
                style={{
                  width: '100%',
                  padding: '10px 12px',
                  border: errors.password ? '1px solid var(--danger)' : '1px solid var(--border)',
                  borderRadius: 'var(--radius-md)',
                  background: 'var(--bg-base)',
                  color: 'var(--text-primary)',
                  fontSize: '0.9rem',
                  transition: 'all 0.2s',
                  boxSizing: 'border-box',
                }}
                onFocus={(e) => {
                  if (!errors.password) {
                    e.target.style.borderColor = 'var(--accent)';
                    e.target.style.boxShadow = '0 0 0 3px rgba(138, 92, 255, 0.1)';
                  }
                }}
                onBlur={(e) => {
                  if (!errors.password) {
                    e.target.style.borderColor = 'var(--border)';
                    e.target.style.boxShadow = 'none';
                  }
                }}
              />
              {errors.password && <div style={{ color: 'var(--danger)', fontSize: '0.8rem', marginTop: '4px' }}>⚠️ {errors.password}</div>}
            </div>

            {/* Confirm Password field */}
            <div style={{ marginBottom: '24px' }}>
              <label style={{ display: 'block', marginBottom: '8px', color: 'var(--text-primary)', fontWeight: '600' }}>
                Confirm Password *
              </label>
              <input
                type="password"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                placeholder="Confirm password"
                style={{
                  width: '100%',
                  padding: '10px 12px',
                  border: errors.confirmPassword ? '1px solid var(--danger)' : '1px solid var(--border)',
                  borderRadius: 'var(--radius-md)',
                  background: 'var(--bg-base)',
                  color: 'var(--text-primary)',
                  fontSize: '0.9rem',
                  transition: 'all 0.2s',
                  boxSizing: 'border-box',
                }}
                onFocus={(e) => {
                  if (!errors.confirmPassword) {
                    e.target.style.borderColor = 'var(--accent)';
                    e.target.style.boxShadow = '0 0 0 3px rgba(138, 92, 255, 0.1)';
                  }
                }}
                onBlur={(e) => {
                  if (!errors.confirmPassword) {
                    e.target.style.borderColor = 'var(--border)';
                    e.target.style.boxShadow = 'none';
                  }
                }}
              />
              {errors.confirmPassword && (
                <div style={{ color: 'var(--danger)', fontSize: '0.8rem', marginTop: '4px' }}>⚠️ {errors.confirmPassword}</div>
              )}
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
                disabled={loading}
                style={{
                  background: 'var(--accent)',
                  color: '#fff',
                  padding: '10px 20px',
                  borderRadius: 'var(--radius-md)',
                  cursor: loading ? 'not-allowed' : 'pointer',
                  fontSize: '0.9rem',
                  fontWeight: '600',
                  border: 'none',
                  transition: 'all 0.2s',
                  opacity: loading ? 0.7 : 1,
                }}
                onMouseEnter={(e) => {
                  if (!loading) e.target.style.opacity = '0.9';
                }}
                onMouseLeave={(e) => {
                  if (!loading) e.target.style.opacity = '1';
                }}
              >
                {loading ? 'Creating...' : 'Create Student'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function CreateStudentPage() {
  return (
    <ProtectedRoute requiredRole="admin">
      <CreateStudentPageContent />
    </ProtectedRoute>
  );
}
