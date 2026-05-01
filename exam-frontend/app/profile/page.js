'use client';

import { useEffect, useState } from 'react';
import API from '@/services/api';
import { useAuth } from '@/context/AuthContext';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function ProfilePage() {
  const { user, logout } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [editing, setEditing] = useState(false);

  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: user?.phone || '',
  });

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || '',
        email: user.email || '',
        phone: user.phone || '',
      });
    }
  }, [user]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!formData.name.trim()) {
      setError('Name is required');
      return;
    }

    try {
      setLoading(true);
      await API.put('/api/users/profile', {
        name: formData.name.trim(),
        phone: formData.phone.trim(),
      });

      setSuccess('Profile updated successfully');
      setEditing(false);
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

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
        <div style={{ fontSize: '1.35rem', fontWeight: '800' }}>
          Exam<span style={{ color: 'var(--accent)' }}>Pulse</span>
        </div>
        <Link href="/dashboard">
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
            ← Back to Dashboard
          </button>
        </Link>
      </div>

      {/* Main content */}
      <div style={{ padding: '32px 24px', maxWidth: '600px', margin: '0 auto' }}>
        {/* Page header */}
        <div style={{ marginBottom: '32px' }}>
          <div style={{ fontSize: '1.75rem', fontWeight: '700', marginBottom: '8px', color: 'var(--text-primary)' }}>
            👤 My Profile
          </div>
          <div style={{ fontSize: '0.95rem', color: 'var(--text-secondary)' }}>
            View and manage your account information
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

        {/* Profile Card */}
        <div
          style={{
            background: 'var(--bg-card)',
            border: '1px solid var(--border)',
            borderRadius: 'var(--radius-lg)',
            padding: '28px',
            marginBottom: '24px',
          }}
        >
          {/* Avatar */}
          <div style={{ textAlign: 'center', marginBottom: '28px' }}>
            <div
              style={{
                width: '80px',
                height: '80px',
                borderRadius: '50%',
                background: 'var(--accent-soft)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 16px',
                fontSize: '2rem',
              }}
            >
              {user?.name?.charAt(0).toUpperCase() || '?'}
            </div>
            <div style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
              {user?.role === 'admin' ? '🔐 Admin' : '👨‍🎓 Student'}
            </div>
          </div>

          {/* Form */}
          {editing ? (
            <form onSubmit={handleUpdate}>
              {/* Name */}
              <div style={{ marginBottom: '20px' }}>
                <label
                  style={{
                    display: 'block',
                    fontSize: '0.9rem',
                    fontWeight: '600',
                    marginBottom: '8px',
                    color: 'var(--text-primary)',
                  }}
                >
                  Full Name
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  style={{
                    width: '100%',
                    background: 'var(--bg-input)',
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

              {/* Email (read-only) */}
              <div style={{ marginBottom: '20px' }}>
                <label
                  style={{
                    display: 'block',
                    fontSize: '0.9rem',
                    fontWeight: '600',
                    marginBottom: '8px',
                    color: 'var(--text-primary)',
                  }}
                >
                  Email
                </label>
                <input
                  type="email"
                  value={formData.email}
                  disabled
                  style={{
                    width: '100%',
                    background: 'var(--bg-hover)',
                    border: '1px solid var(--border)',
                    color: 'var(--text-secondary)',
                    padding: '10px 14px',
                    borderRadius: 'var(--radius-md)',
                    fontSize: '0.9rem',
                    cursor: 'not-allowed',
                    opacity: '0.6',
                    boxSizing: 'border-box',
                  }}
                />
              </div>

              {/* Phone */}
              <div style={{ marginBottom: '24px' }}>
                <label
                  style={{
                    display: 'block',
                    fontSize: '0.9rem',
                    fontWeight: '600',
                    marginBottom: '8px',
                    color: 'var(--text-primary)',
                  }}
                >
                  Phone (Optional)
                </label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  placeholder="+1 (555) 000-0000"
                  style={{
                    width: '100%',
                    background: 'var(--bg-input)',
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

              {/* Buttons */}
              <div style={{ display: 'flex', gap: '12px' }}>
                <button
                  type="button"
                  onClick={() => setEditing(false)}
                  style={{
                    flex: 1,
                    background: 'var(--bg-surface)',
                    border: '1px solid var(--border)',
                    color: 'var(--text-secondary)',
                    padding: '10px 16px',
                    borderRadius: 'var(--radius-md)',
                    cursor: 'pointer',
                    fontSize: '0.9rem',
                    fontWeight: '600',
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
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  style={{
                    flex: 1,
                    background: loading ? 'var(--text-muted)' : 'var(--accent)',
                    color: '#fff',
                    padding: '10px 16px',
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
                  {loading ? '⏳ Saving...' : '✓ Save Changes'}
                </button>
              </div>
            </form>
          ) : (
            <>
              {/* Display Mode */}
              <div style={{ marginBottom: '16px' }}>
                <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '4px' }}>
                  Full Name
                </div>
                <div style={{ fontSize: '1rem', color: 'var(--text-primary)', fontWeight: '600' }}>
                  {formData.name}
                </div>
              </div>

              <div style={{ marginBottom: '16px' }}>
                <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '4px' }}>
                  Email
                </div>
                <div style={{ fontSize: '1rem', color: 'var(--text-primary)', fontWeight: '600' }}>
                  {formData.email}
                </div>
              </div>

              {formData.phone && (
                <div style={{ marginBottom: '16px' }}>
                  <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '4px' }}>
                    Phone
                  </div>
                  <div style={{ fontSize: '1rem', color: 'var(--text-primary)', fontWeight: '600' }}>
                    {formData.phone}
                  </div>
                </div>
              )}

              {/* Edit Button */}
              <button
                onClick={() => setEditing(true)}
                style={{
                  width: '100%',
                  background: 'var(--accent-soft)',
                  border: 'none',
                  color: 'var(--accent)',
                  padding: '10px 16px',
                  borderRadius: 'var(--radius-md)',
                  cursor: 'pointer',
                  fontSize: '0.9rem',
                  fontWeight: '600',
                  transition: 'all 0.2s',
                  marginTop: '16px',
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
                ✏️ Edit Profile
              </button>
            </>
          )}
        </div>

        {/* Danger Zone */}
        <div
          style={{
            background: 'rgba(255, 90, 90, 0.08)',
            border: '1px solid rgba(255, 90, 90, 0.3)',
            borderRadius: 'var(--radius-lg)',
            padding: '24px',
          }}
        >
          <div style={{ fontSize: '0.95rem', fontWeight: '600', marginBottom: '12px', color: 'var(--danger)' }}>
            ⚠️ Danger Zone
          </div>

          <button
            onClick={handleLogout}
            style={{
              width: '100%',
              background: 'rgba(255, 90, 90, 0.12)',
              border: '1px solid var(--danger)',
              color: 'var(--danger)',
              padding: '10px 16px',
              borderRadius: 'var(--radius-md)',
              cursor: 'pointer',
              fontSize: '0.9rem',
              fontWeight: '600',
              transition: 'all 0.2s',
            }}
            onMouseEnter={(e) => {
              e.target.style.background = 'var(--danger)';
              e.target.style.color = '#fff';
            }}
            onMouseLeave={(e) => {
              e.target.style.background = 'rgba(255, 90, 90, 0.12)';
              e.target.style.color = 'var(--danger)';
            }}
          >
            🚪 Logout
          </button>
        </div>
      </div>
    </div>
  );
}
