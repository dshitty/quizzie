'use client';

import { useState, useEffect } from 'react';
import API from '@/services/api';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function RegisterPage() {
  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();

  // Redirect if already logged in
  useEffect(() => {
    if (!authLoading && user) {
      const redirectPath = user.role === 'admin' ? '/admin' : '/dashboard';
      router.push(redirectPath);
    }
  }, [user, authLoading, router]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    if (form.password !== form.confirmPassword) {
      setError('Passwords do not match');
      setLoading(false);
      return;
    }

    try {
      const { data } = await API.post('/api/auth/register', {
        name: form.name,
        email: form.email,
        password: form.password,
      });
      setSuccess(data.message || 'Account created! Please wait for admin approval.');
      setForm({ name: '', email: '', password: '', confirmPassword: '' });
      // Redirect to login after 3 seconds
      setTimeout(() => router.push('/login'), 3000);
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-body">
      {/* Background circles */}
      <div className="auth-bg-circle c1"></div>
      <div className="auth-bg-circle c2"></div>

      {/* Auth Card */}
      <div className="auth-card">
        {/* Logo */}
        <div className="auth-logo">
          <div className="logo-text">
            Exam<span>Pulse</span>
          </div>
          <div className="tagline">Assessment Platform</div>
        </div>

        {/* Error Message */}
        {error && <div className="auth-error" style={{ display: 'block', marginBottom: '24px' }}>{error}</div>}

        {/* Success Message */}
        {success && (
          <div style={{
            display: 'block',
            marginBottom: '24px',
            background: 'rgba(74, 222, 128, 0.12)',
            border: '1px solid rgba(74, 222, 128, 0.3)',
            borderRadius: 'var(--radius-md)',
            color: '#4ade80',
            padding: '12px 16px',
            textAlign: 'center',
            fontSize: '0.95rem',
          }}>
            ✅ {success}
            <div style={{ fontSize: '0.8rem', marginTop: '8px', opacity: 0.8 }}>Redirecting to login...</div>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Full Name</label>
            <input
              className="form-input"
              type="text"
              placeholder="John Doe"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Email Address</label>
            <input
              className="form-input"
              type="email"
              placeholder="you@example.com"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Password</label>
            <input
              className="form-input"
              type="password"
              placeholder="••••••••"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Confirm Password</label>
            <input
              className="form-input"
              type="password"
              placeholder="••••••••"
              value={form.confirmPassword}
              onChange={(e) => setForm({ ...form, confirmPassword: e.target.value })}
              required
            />
          </div>

          <button
            type="submit"
            className="btn-primary"
            disabled={loading}
            style={{ marginTop: '8px' }}
          >
            {loading ? 'Creating Account...' : 'Create Account'}
          </button>
        </form>

        {/* Login Link */}
        <div style={{ marginTop: '28px', textAlign: 'center', fontSize: '0.95rem', color: 'var(--text-secondary)' }}>
          Already have an account?{' '}
          <Link href="/login" style={{ color: 'var(--accent)', fontWeight: '700', textDecoration: 'none' }}>
            Sign in
          </Link>
        </div>
      </div>
    </div>
  );
}