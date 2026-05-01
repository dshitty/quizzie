'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import API from '@/services/api';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';

export default function ResultPage() {
  const params = useParams();
  const resultId = params.id;
  const { user } = useAuth();
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchResult = async () => {
      try {
        const { data } = await API.get(`/api/attempts/result/${resultId}`);
        console.log('📊 Result data:', data.data);
        setResult(data.data);
      } catch (err) {
        console.error('Failed to load result:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchResult();
  }, [resultId]);

  if (loading) {
    return (
      <div style={{ display: 'flex', minHeight: '100vh', alignItems: 'center', justifyContent: 'center', background: 'var(--bg-base)' }}>
        <div style={{ color: 'var(--text-secondary)' }}>Loading results...</div>
      </div>
    );
  }

  const score = result?.percentage || 0;
  const correctAnswers = result?.answers?.filter(a => a.isCorrect).length || 0;
  const totalQuestions = result?.answers?.length || 0;
  const totalScore = result?.totalScore || 0;
  const totalMarks = result?.totalMarks || 0;
  
  // Determine back button path based on user role
  const backLink = user?.role === 'admin' ? '/admin/attempts' : '/dashboard';

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-base)', padding: '32px 24px' }}>
      {/* Top bar */}
      <div
        style={{
          background: 'var(--bg-surface)',
          borderBottom: '1px solid var(--border)',
          padding: '16px 24px',
          marginBottom: '32px',
          borderRadius: 'var(--radius-lg)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
      >
        <div style={{ fontSize: '1.35rem', fontWeight: '800' }}>
          Exam<span style={{ color: 'var(--accent)' }}>Pulse</span>
        </div>
        <Link href={backLink}>
          <button
            style={{
              background: 'var(--accent)',
              color: '#fff',
              padding: '8px 16px',
              borderRadius: 'var(--radius-md)',
              cursor: 'pointer',
              fontSize: '0.88rem',
              fontWeight: '600',
              border: 'none',
            }}
          >
            Back to {user?.role === 'admin' ? 'Attempts' : 'Dashboard'}
          </button>
        </Link>
      </div>

      {/* Main Results Card */}
      <div style={{ maxWidth: '600px', margin: '0 auto' }}>
        {/* Score Circle */}
        <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', textAlign: 'center', padding: '48px 32px', marginBottom: '24px' }}>
          <div style={{ marginBottom: '16px', fontSize: '0.82rem', fontWeight: '500', color: 'var(--text-secondary)' }}>
            Test Completed Successfully
          </div>

          <div
            style={{
              width: '200px',
              height: '200px',
              borderRadius: '50%',
              background: `conic-gradient(var(--accent) ${(score / 100) * 360}deg, var(--bg-hover) 0deg)`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 24px',
              boxShadow: '0 0 40px rgba(108, 99, 255, 0.2)',
            }}
          >
            <div
              style={{
                width: '180px',
                height: '180px',
                borderRadius: '50%',
                background: 'var(--bg-card)',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <div style={{ fontSize: '3rem', fontWeight: '800', color: 'var(--accent)' }}>
                {score}%
              </div>
              <div style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
                Your Score
              </div>
            </div>
          </div>


        </div>

        {/* Stats Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px', marginBottom: '24px' }}>
          <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', textAlign: 'center', padding: '16px' }}>
            <div style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', marginBottom: '8px' }}>
              Correct
            </div>
            <div style={{ fontSize: '1.75rem', fontWeight: '700', color: 'var(--success)' }}>
              {correctAnswers}
            </div>
          </div>

          <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', textAlign: 'center', padding: '16px' }}>
            <div style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', marginBottom: '8px' }}>
              Total
            </div>
            <div style={{ fontSize: '1.75rem', fontWeight: '700', color: 'var(--accent)' }}>
              {totalQuestions}
            </div>
          </div>

          <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', textAlign: 'center', padding: '16px' }}>
            <div style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', marginBottom: '8px' }}>
              Accuracy
            </div>
            <div style={{ fontSize: '1.75rem', fontWeight: '700', color: 'var(--accent)' }}>
              {totalQuestions > 0 ? Math.round((correctAnswers / totalQuestions) * 100) : 0}%
            </div>
          </div>
        </div>

        {/* Details */}
        <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', padding: '24px', marginBottom: '24px' }}>
          <div style={{ fontSize: '0.95rem', fontWeight: '600', marginBottom: '16px', color: 'var(--text-primary)' }}>
            Test Details
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '12px', borderBottom: '1px solid var(--border)', marginBottom: '12px' }}>
            <span style={{ color: 'var(--text-secondary)' }}>Score:</span>
            <span style={{ color: 'var(--text-primary)' }}>{totalScore} / {totalMarks}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '12px', borderBottom: '1px solid var(--border)', marginBottom: '12px' }}>
            <span style={{ color: 'var(--text-secondary)' }}>Time Taken:</span>
            <span style={{ color: 'var(--text-primary)' }}>{result?.timeTakenMinutes || 0} minutes</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span style={{ color: 'var(--text-secondary)' }}>Questions:</span>
            <span style={{ color: 'var(--text-primary)' }}>{correctAnswers} / {totalQuestions}</span>
          </div>
        </div>

        {/* Action Buttons */}
        <div style={{ display: 'flex', gap: '12px' }}>
          <Link href={backLink} style={{ flex: 1 }}>
            <button className="btn-primary" style={{ width: '100%' }}>
              Back to {user?.role === 'admin' ? 'Attempts' : 'Dashboard'}
            </button>
          </Link>
        </div>
      </div>
    </div>
  );
}