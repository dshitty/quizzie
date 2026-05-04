'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import API from '@/services/api';

/**
 * ProtectedRoute component to guard pages based on authentication and role
 * Validates token with backend to prevent unauthorized access
 * @param {ReactNode} children - Page content to render if authorized
 * @param {string} requiredRole - 'admin' | 'student' | 'any' (default: 'any')
 */
export default function ProtectedRoute({ children, requiredRole = 'any' }) {
  const { user, loading, logout } = useAuth();
  const router = useRouter();
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [validating, setValidating] = useState(true);

  useEffect(() => {
    const validateAccess = async () => {
      try {
        setValidating(true);

        // Check if user exists in context
        if (!user) {
          router.push('/login');
          return;
        }

        // Verify token is still valid by making test API call
        const token = localStorage.getItem('token');
        if (!token) {
          logout();
          router.push('/login');
          return;
        }

        // Quick token validation - verify it still works
        try {
          await API.get('/api/auth/me');
        } catch (err) {
          if (err.response?.status === 401 || err.response?.status === 403) {
            // Token invalid or user deactivated
            logout();
            router.push('/login');
            return;
          }
        }

        // Check role authorization if specific role required
        if (requiredRole !== 'any' && user.role !== requiredRole) {
          // Redirect to appropriate page based on actual role
          const redirectPath = user.role === 'admin' ? '/admin' : '/dashboard';
          router.push(redirectPath);
          return;
        }

        // User is authorized
        setIsAuthorized(true);
      } finally {
        setValidating(false);
      }
    };

    if (!loading) {
      validateAccess();
    }
  }, [user, loading, requiredRole, router, logout]);

  // Show loading while checking auth or validating token
  if (loading || validating || !isAuthorized) {
    return (
      <div
        style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          minHeight: '100vh',
          background: 'var(--bg-base)',
        }}
      >
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '1rem', color: 'var(--text-secondary)', marginBottom: '12px' }}>
            {validating ? 'Verifying session...' : 'Verifying access...'}
          </div>
          <div
            style={{
              width: '40px',
              height: '40px',
              border: '3px solid var(--border)',
              borderTop: '3px solid var(--accent)',
              borderRadius: '50%',
              animation: 'spin 0.8s linear infinite',
              margin: '12px auto 0',
            }}
          />
          <style jsx>{`
            @keyframes spin {
              to { transform: rotate(360deg); }
            }
          `}</style>
        </div>
      </div>
    );
  }

  return children;
}
