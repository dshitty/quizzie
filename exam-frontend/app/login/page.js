'use client';

import { useState, useEffect } from 'react';
import API from '@/services/api';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login, user, loading: authLoading } = useAuth();
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
    setLoading(true);

    try {
      const { data } = await API.post('/api/auth/login', { email, password });
      login(data);
      // Redirect based on user role
      const redirectPath = data.user.role === 'admin' ? '/admin' : '/dashboard';
      router.push(redirectPath);
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed. Please try again.');
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

        {/* Form */}
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Email Address</label>
            <input
              className="form-input"
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Password</label>
            <input
              className="form-input"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <button
            type="submit"
            className="btn-primary"
            disabled={loading}
            style={{ marginTop: '8px' }}
          >
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>

        {/* Sign Up Link */}
        <div style={{ marginTop: '28px', textAlign: 'center', fontSize: '0.95rem', color: 'var(--text-secondary)' }}>
          Don&apos;t have an account?{' '}
          <Link href="/register" style={{ color: 'var(--accent)', fontWeight: '700', textDecoration: 'none' }}>
            Sign up
          </Link>
        </div>
      </div>
    </div>
  );
}