'use client';

import { useEffect, useState, useCallback, useMemo } from 'react';
import { useParams } from 'next/navigation';
import API from '@/services/api';

export default function ExamPage() {
  const params = useParams();
  const examId = params.id;

  const [current, setCurrent] = useState(0);
  const [exam, setExam] = useState(null);
  const [timeLeft, setTimeLeft] = useState(null);
  const [answers, setAnswers] = useState({});
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [alreadySubmitted, setAlreadySubmitted] = useState(false);
  const [error, setError] = useState('');
  const [showSubmitModal, setShowSubmitModal] = useState(false);
  const [showQuestionNav, setShowQuestionNav] = useState(false);
  const [isMobile, setIsMobile] = useState(typeof window !== 'undefined' ? window.innerWidth < 768 : false);

  const questions = useMemo(() => exam?.questions || [], [exam?.questions]);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
      if (window.innerWidth >= 768) {
        setShowQuestionNav(false);
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const handleSubmit = useCallback(async (isAutoSubmit = false) => {
    try {
      setSubmitting(true);
      const answersArray = questions.map((q) => ({
        questionId: q._id,
        selectedOption: answers[q._id] || null,
      }));

      await API.post(`/api/attempts/submit/${examId}`, {
        answers: answersArray,
      });

      setSubmitted(true);
      setTimeout(() => {
        window.location.href = '/dashboard';
      }, 2000);
    } catch (err) {
      console.error('Failed to submit:', err);
      setSubmitting(false);
    }
  }, [answers, examId, questions]);

  useEffect(() => {
    const fetchExam = async () => {
      try {
        const { data } = await API.get(`/api/exams/${examId}/take`);
        setExam(data.data);
        setTimeLeft(data.data.durationMinutes * 60);

        try {
          const attemptRes = await API.post(`/api/attempts/start/${examId}`);
          if (attemptRes.data.data.isSubmitted) {
            setAlreadySubmitted(true);
          }
        } catch (startErr) {
          console.error('Failed to start attempt:', startErr);
        }
      } catch (err) {
        console.error('Failed to load exam:', err);
        setError(err.response?.data?.message || 'Failed to load exam. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchExam();
  }, [examId]);

  useEffect(() => {
    if (timeLeft === null) return;
    if (timeLeft <= 0) {
      const timeoutId = setTimeout(() => {
        handleSubmit(true); // Auto-submit, no popup
      }, 0);

      return () => clearTimeout(timeoutId);
    }

    const timer = setInterval(() => {
      setTimeLeft((prev) => prev - 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [timeLeft, handleSubmit]);

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', minHeight: '100vh', alignItems: 'center', justifyContent: 'center', background: 'var(--bg-base)' }}>
        <div style={{ color: 'var(--text-secondary)' }}>Loading exam...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ minHeight: '100vh', background: 'var(--bg-base)', padding: '32px 24px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', padding: '32px', maxWidth: '500px', textAlign: 'center' }}>
          <div style={{ fontSize: '2.5rem', marginBottom: '16px' }}>⏰</div>
          <h2 style={{ fontSize: '1.5rem', fontWeight: '600', marginBottom: '12px', color: 'var(--text-primary)' }}>Exam Not Available</h2>
          <p style={{ fontSize: '1rem', color: 'var(--text-secondary)', marginBottom: '24px' }}>
            {error}
          </p>
          <a href="/dashboard" style={{ display: 'inline-block', padding: '12px 32px', background: 'var(--accent)', color: '#fff', borderRadius: 'var(--radius-md)', textDecoration: 'none', fontWeight: '600' }}>
            Back to Dashboard
          </a>
        </div>
      </div>
    );
  }

  if (alreadySubmitted) {
    return (
      <div style={{ minHeight: '100vh', background: 'var(--bg-base)', padding: '32px 24px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', padding: '32px', maxWidth: '500px', textAlign: 'center' }}>
          <div style={{ fontSize: '2.5rem', marginBottom: '16px' }}>✅</div>
          <h2 style={{ fontSize: '1.5rem', fontWeight: '600', marginBottom: '12px', color: 'var(--text-primary)' }}>Already Submitted</h2>
          <p style={{ fontSize: '1rem', color: 'var(--text-secondary)', marginBottom: '24px' }}>
            You have already submitted this exam. You can only submit each exam once.
          </p>
          <a href="/dashboard" style={{ display: 'inline-block', padding: '12px 32px', background: 'var(--accent)', color: '#fff', borderRadius: 'var(--radius-md)', textDecoration: 'none', fontWeight: '600' }}>
            Back to Dashboard
          </a>
        </div>
      </div>
    );
  }

  if (submitted) {
    return (
      <div style={{ minHeight: '100vh', background: 'var(--bg-base)', padding: '32px 24px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', padding: '48px 32px', maxWidth: '500px', textAlign: 'center' }}>
          <div style={{ fontSize: '3.5rem', marginBottom: '24px', animation: 'scale-in 0.5s ease-out' }}>✅</div>
          <h2 style={{ fontSize: '1.75rem', fontWeight: '700', marginBottom: '16px', color: 'var(--text-primary)' }}>Submitted Successfully!</h2>
          <p style={{ fontSize: '1.05rem', color: 'var(--text-secondary)', marginBottom: '8px' }}>
            Your exam has been submitted.
          </p>
          <p style={{ fontSize: '0.95rem', color: 'var(--text-secondary)', marginBottom: '32px' }}>
            Redirecting to dashboard in a moment...
          </p>
          <a href="/dashboard" style={{ display: 'inline-block', padding: '12px 32px', background: 'var(--accent)', color: '#fff', borderRadius: 'var(--radius-md)', textDecoration: 'none', fontWeight: '600', cursor: 'pointer' }}>
            Go to Dashboard
          </a>
        </div>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: 'var(--bg-base)', flexDirection: isMobile ? 'column' : 'row' }}>
      {/* Left Sidebar - Questions Navigator (Desktop) or Modal (Mobile) */}
      {!isMobile && (
      <div
        style={{
          width: '280px',
          background: 'var(--bg-surface)',
          borderRight: '1px solid var(--border)',
          padding: '24px 16px',
          overflowY: 'auto',
        }}
      >
        <div style={{ fontSize: '0.82rem', fontWeight: '700', letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: '16px' }}>
          Questions
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px', marginBottom: '24px' }}>
          {questions.map((q, i) => (
            <button
              key={i}
              onClick={() => setCurrent(i)}
              style={{
                width: '40px',
                height: '40px',
                borderRadius: 'var(--radius-md)',
                background: current === i ? 'var(--accent)' : answers[q._id] ? 'var(--success)' : 'var(--bg-hover)',
                color: '#fff',
                fontSize: '0.88rem',
                fontWeight: '600',
                border: 'none',
                cursor: 'pointer',
                transition: 'all 0.2s',
              }}
            >
              {i + 1}
            </button>
          ))}
        </div>

        {/* Legend */}
        <div style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', lineHeight: '1.8' }}>
          <div style={{ color: 'var(--accent)' }}>● Current</div>
          <div style={{ color: 'var(--success)' }}>● Answered</div>
          <div style={{ color: 'var(--text-muted)' }}>● Unanswered</div>
        </div>
      </div>
      )}

      {/* Mobile Question Navigator Modal */}
      {isMobile && showQuestionNav && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0,0,0,0.5)',
            display: 'flex',
            alignItems: 'flex-start',
            justifyContent: 'flex-start',
            zIndex: 999,
          }}
          onClick={() => setShowQuestionNav(false)}
        >
          <div
            style={{
              width: '100%',
              maxWidth: '280px',
              background: 'var(--bg-surface)',
              padding: '24px 16px',
              overflowY: 'auto',
              maxHeight: '100vh',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ fontSize: '0.82rem', fontWeight: '700', letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              Questions
              <button
                onClick={() => setShowQuestionNav(false)}
                style={{
                  background: 'none',
                  border: 'none',
                  fontSize: '1.5rem',
                  cursor: 'pointer',
                  color: 'var(--text-secondary)',
                }}
              >
                ✕
              </button>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px', marginBottom: '24px' }}>
              {questions.map((q, i) => (
                <button
                  key={i}
                  onClick={() => {
                    setCurrent(i);
                    setShowQuestionNav(false);
                  }}
                  style={{
                    width: '40px',
                    height: '40px',
                    borderRadius: 'var(--radius-md)',
                    background: current === i ? 'var(--accent)' : answers[q._id] ? 'var(--success)' : 'var(--bg-hover)',
                    color: '#fff',
                    fontSize: '0.88rem',
                    fontWeight: '600',
                    border: 'none',
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                  }}
                >
                  {i + 1}
                </button>
              ))}
            </div>

            <div style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', lineHeight: '1.8' }}>
              <div style={{ color: 'var(--accent)' }}>● Current</div>
              <div style={{ color: 'var(--success)' }}>● Answered</div>
              <div style={{ color: 'var(--text-muted)' }}>● Unanswered</div>
            </div>
          </div>
        </div>
      )}

      {/* Main Content */}
      <div style={{ flex: 1, padding: isMobile ? '16px 12px' : '24px', display: 'flex', flexDirection: 'column' }}>
        {/* Top Bar */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: isMobile ? 'flex-start' : 'center',
            marginBottom: isMobile ? '20px' : '32px',
            flexDirection: isMobile ? 'column' : 'row',
            gap: isMobile ? '12px' : '0',
          }}
        >
          {isMobile && (
            <button
              onClick={() => setShowQuestionNav(!showQuestionNav)}
              style={{
                padding: '10px 16px',
                borderRadius: 'var(--radius-md)',
                background: 'var(--bg-card)',
                border: '1px solid var(--border)',
                color: 'var(--text-secondary)',
                cursor: 'pointer',
                fontSize: '0.9rem',
                fontWeight: '600',
                marginBottom: '8px',
              }}
            >
              📋 Questions ({current + 1}/{questions.length})
            </button>
          )}
          
          <div>
            <div style={{ fontSize: isMobile ? '0.75rem' : '0.82rem', color: 'var(--text-secondary)', marginBottom: '4px' }}>
              {exam?.title}
            </div>
            <div style={{ fontSize: isMobile ? '1rem' : '1.25rem', fontWeight: '600', color: 'var(--text-primary)' }}>
              Question {current + 1} of {questions.length}
            </div>
          </div>

          <div
            style={{
              background: 'var(--bg-card)',
              border: '1px solid var(--border)',
              borderRadius: 'var(--radius-md)',
              padding: isMobile ? '10px 14px' : '12px 20px',
              display: 'flex',
              gap: isMobile ? '8px' : '12px',
              alignItems: 'center',
              whiteSpace: 'nowrap',
            }}
          >
            <span style={{ fontSize: isMobile ? '0.7rem' : '0.82rem', color: 'var(--text-secondary)' }}>⏱️ Time:</span>
            <span
              style={{
                fontFamily: 'var(--font-mono)',
                fontSize: isMobile ? '1rem' : '1.25rem',
                fontWeight: '700',
                color: timeLeft < 300 ? 'var(--danger)' : 'var(--accent)',
              }}
            >
              {formatTime(timeLeft || 0)}
            </span>
          </div>
        </div>

        {/* Question Card */}
        {questions[current] && (
          <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', padding: isMobile ? '16px' : '24px', flex: 1, maxWidth: isMobile ? 'none' : '800px' }}>
            <h2 style={{ fontSize: isMobile ? '1rem' : '1.15rem', fontWeight: '600', marginBottom: isMobile ? '18px' : '24px', color: 'var(--text-primary)', lineHeight: '1.4' }}>
              {questions[current].questionText || questions[current].text || questions[current].question || `Question ${current + 1}`}
            </h2>

            <div style={{ display: 'flex', flexDirection: 'column', gap: isMobile ? '10px' : '12px' }}>
              {questions[current].options?.map((option, optIdx) => (
                <button
                  key={optIdx}
                  disabled={submitted}
                  onClick={() => {
                    if (!submitted) {
                      setAnswers({ ...answers, [questions[current]._id]: option.label });
                    }
                  }}
                  style={{
                    textAlign: 'left',
                    padding: isMobile ? '14px 14px' : '14px 16px',
                    borderRadius: 'var(--radius-md)',
                    background: submitted 
                      ? 'var(--bg-hover)' 
                      : answers[questions[current]._id] === option.label ? 'var(--accent-soft)' : 'var(--bg-hover)',
                    border: submitted 
                      ? `1px solid var(--border)` 
                      : answers[questions[current]._id] === option.label ? `2px solid var(--accent)` : `1px solid var(--border)`,
                    color: 'var(--text-primary)',
                    cursor: submitted ? 'not-allowed' : 'pointer',
                    opacity: submitted ? 0.6 : 1,
                    transition: 'all 0.2s',
                    fontSize: isMobile ? '0.9rem' : '0.95rem',
                    minHeight: isMobile ? '44px' : 'auto',
                    display: 'flex',
                    alignItems: 'center',
                  }}
                  onMouseEnter={(e) => {
                    if (!submitted && answers[questions[current]._id] !== option.label) {
                      e.target.style.background = 'var(--bg-card)';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!submitted && answers[questions[current]._id] !== option.label) {
                      e.target.style.background = 'var(--bg-hover)';
                    }
                  }}
                >
                  <span style={{ marginRight: '12px', fontWeight: '600', color: 'var(--accent)', flexShrink: 0 }}>
                    {String.fromCharCode(65 + optIdx)}.
                  </span>
                  <span style={{ wordBreak: 'break-word' }}>{option.text}</span>
                </button>
              ))}
            </div>

            {/* Navigation Buttons */}
            <div style={{ display: 'flex', gap: isMobile ? '8px' : '12px', marginTop: isMobile ? '24px' : '32px', paddingTop: isMobile ? '16px' : '24px', borderTop: '1px solid var(--border)', flexWrap: 'wrap' }}>
              <button
                onClick={() => setCurrent(Math.max(0, current - 1))}
                disabled={current === 0}
                style={{
                  padding: isMobile ? '10px 14px' : '12px 24px',
                  borderRadius: 'var(--radius-md)',
                  background: current === 0 ? 'var(--bg-hover)' : 'var(--bg-card)',
                  border: '1px solid var(--border)',
                  color: 'var(--text-secondary)',
                  cursor: current === 0 ? 'not-allowed' : 'pointer',
                  transition: 'all 0.2s',
                  fontSize: isMobile ? '0.85rem' : '0.9rem',
                  fontWeight: '600',
                  minHeight: isMobile ? '44px' : 'auto',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flex: isMobile ? 1 : 'auto',
                }}
              >
                ← Prev
              </button>

              <button
                onClick={() => setCurrent(Math.min(questions.length - 1, current + 1))}
                disabled={current === questions.length - 1}
                style={{
                  padding: isMobile ? '10px 14px' : '12px 24px',
                  borderRadius: 'var(--radius-md)',
                  background: current === questions.length - 1 ? 'var(--bg-hover)' : 'var(--bg-card)',
                  border: '1px solid var(--border)',
                  color: 'var(--text-secondary)',
                  cursor: current === questions.length - 1 ? 'not-allowed' : 'pointer',
                  transition: 'all 0.2s',
                  fontSize: isMobile ? '0.85rem' : '0.9rem',
                  fontWeight: '600',
                  minHeight: isMobile ? '44px' : 'auto',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flex: isMobile ? 1 : 'auto',
                  marginRight: isMobile ? '0' : 'auto',
                }}
              >
                Next →
              </button>

              <button
                onClick={() => setShowSubmitModal(true)}
                disabled={submitting}
                className="btn-primary"
                style={{ padding: isMobile ? '10px 14px' : '12px 32px', opacity: submitting ? 0.7 : 1, cursor: submitting ? 'not-allowed' : 'pointer', fontSize: isMobile ? '0.85rem' : '0.9rem', fontWeight: '600', minHeight: isMobile ? '44px' : 'auto', flex: isMobile ? 1 : 'auto' }}
              >
                {submitting ? 'Submitting...' : '✓ Submit'}
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Submit Confirmation Modal */}
      {showSubmitModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0,0,0,0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
          padding: isMobile ? '16px' : '0',
        }}>
          <div style={{
            background: 'var(--bg-card)',
            border: '1px solid var(--border)',
            borderRadius: 'var(--radius-lg)',
            padding: isMobile ? '24px 16px' : '32px',
            maxWidth: isMobile ? '100%' : '400px',
            textAlign: 'center',
            width: '100%',
          }}>
            <div style={{ fontSize: isMobile ? '2rem' : '2.5rem', marginBottom: '16px' }}>⚠️</div>
            <h2 style={{ fontSize: isMobile ? '1.25rem' : '1.5rem', fontWeight: '700', marginBottom: '12px', color: 'var(--text-primary)' }}>
              Submit Your Exam?
            </h2>
            <p style={{ fontSize: isMobile ? '0.9rem' : '0.95rem', color: 'var(--text-secondary)', marginBottom: '24px', lineHeight: '1.6' }}>
              Once you submit, you will not be able to edit your answers. Are you sure you want to submit now?
            </p>
            <div style={{ display: 'flex', gap: isMobile ? '8px' : '12px', justifyContent: 'center', flexDirection: isMobile ? 'column' : 'row' }}>
              <button
                onClick={() => setShowSubmitModal(false)}
                style={{
                  background: 'var(--bg-hover)',
                  border: '1px solid var(--border)',
                  color: 'var(--text-secondary)',
                  padding: isMobile ? '12px 16px' : '10px 24px',
                  borderRadius: 'var(--radius-md)',
                  cursor: 'pointer',
                  fontSize: '0.9rem',
                  fontWeight: '600',
                  transition: 'all 0.2s',
                  minHeight: isMobile ? '44px' : 'auto',
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
                onClick={() => {
                  setShowSubmitModal(false);
                  handleSubmit(false);
                }}
                disabled={submitting}
                style={{
                  background: 'var(--accent)',
                  color: '#fff',
                  padding: isMobile ? '12px 16px' : '10px 24px',
                  borderRadius: 'var(--radius-md)',
                  cursor: submitting ? 'not-allowed' : 'pointer',
                  fontSize: '0.9rem',
                  fontWeight: '600',
                  border: 'none',
                  opacity: submitting ? 0.7 : 1,
                  transition: 'all 0.2s',
                  minHeight: isMobile ? '44px' : 'auto',
                }}
                onMouseEnter={(e) => {
                  if (!submitting) e.target.style.opacity = '0.9';
                }}
                onMouseLeave={(e) => {
                  if (!submitting) e.target.style.opacity = '1';
                }}
              >
                {submitting ? 'Submitting...' : 'Yes, Submit'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
