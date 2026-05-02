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
  const isPublished = !!(result?.resultPublished || result?.resultReleased || result?.published);
  
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

        {/* Details or Not Published */}
        {!isPublished ? (
          <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', padding: '24px', marginBottom: '24px', textAlign: 'center' }}>
            <div style={{ fontSize: '1.05rem', fontWeight: 700, marginBottom: '8px', color: 'var(--text-primary)' }}>Result is not published yet</div>
            <div style={{ color: 'var(--text-secondary)', marginBottom: '12px' }}>You will be able to view a detailed breakdown once the instructor publishes results.</div>
            <div style={{ color: 'var(--text-secondary)' }}>Score and answers are hidden until publication.</div>
          </div>
        ) : (
          <>
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

            {/* Per-question breakdown */}
            <div style={{ marginBottom: '24px' }}>
              <div style={{ fontSize: '1.05rem', fontWeight: 700, marginBottom: '12px', color: 'var(--text-primary)' }}>Answers Breakdown</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {(result?.answers || []).map((ans, idx) => {
                  const question = ans.question || ans.q || {};
                  const qText = question.text || question.question || ans.questionText || `Question ${idx + 1}`;
                  const options = question.options || ans.options || [];
                  const selected = ans.selectedOption ?? ans.selected ?? ans.selectedIndex ?? ans.answer;
                  const correct = ans.correctOption ?? ans.correct ?? ans.correctIndex ?? ans.correctAnswer;
                  const isCorrect = !!(ans.isCorrect || (selected !== undefined && correct !== undefined && selected === correct));

                  return (
                    <div key={idx} style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', padding: '14px' }}>
                      <div style={{ fontSize: '0.95rem', fontWeight: 700, marginBottom: '8px', color: 'var(--text-primary)' }}>{idx + 1}. {qText}</div>

                      {/* Options list */}
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        {options.length > 0 ? options.map((opt, i) => {
                          const label = typeof opt === 'string' ? opt : (opt.text || opt.label || String(opt));
                          const isThisCorrect = (i === correct) || (String(opt.id) === String(correct)) || (String(opt.value) === String(correct));
                          const isThisSelected = (i === selected) || (String(opt.id) === String(selected)) || (String(opt.value) === String(selected));

                          const background = isThisCorrect ? 'rgba(34,197,94,0.06)' : isThisSelected && !isThisCorrect ? 'rgba(239,68,68,0.04)' : 'var(--bg-card)';

                          return (
                            <div key={i} style={{ padding: '10px 12px', borderRadius: '8px', border: `1px solid ${isThisCorrect ? 'rgba(34,197,94,0.12)' : 'transparent'}`, background }}>
                              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <div style={{ color: 'var(--text-primary)' }}>{label}</div>
                                <div style={{ fontSize: '0.78rem', fontWeight: 700, color: isThisCorrect ? '#16a34a' : isThisSelected ? '#ef4444' : 'var(--text-secondary)' }}>
                                  {isThisCorrect ? 'Correct' : isThisSelected ? 'Your answer' : ''}
                                </div>
                              </div>
                            </div>
                          );
                        }) : (
                          <div style={{ color: 'var(--text-secondary)' }}>No options available</div>
                        )}
                      </div>

                      {/* Verdict */}
                      <div style={{ marginTop: '10px', fontSize: '0.9rem', color: isCorrect ? 'var(--success)' : 'var(--danger)', fontWeight: 700 }}>
                        {isCorrect ? 'Correct' : 'Incorrect'}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </>
        )}

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