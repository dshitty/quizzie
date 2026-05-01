'use client';

import { useState } from 'react';
import API from '@/services/api';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function CreateExamPage() {
  const [formData, setFormData] = useState({
    title: '',
    subject: '',
    durationMinutes: 60,
    passingMarks: 60,
    scheduledAt: '',
    expiresAt: '',
  });

  const [questions, setQuestions] = useState([]);
  const [newQuestion, setNewQuestion] = useState({
    questionText: '',
    options: ['', '', '', ''],
    correctOption: 'A',
    marks: 1,
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const router = useRouter();

  const [durationInput, setDurationInput] = useState(String(60));

  const handleChange = (e) => {
    const { name, value, type } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'number' ? parseInt(value) : value,
    }));
  };

  const scheduledDate = formData.scheduledAt ? new Date(formData.scheduledAt) : null;
  const expiresDate = formData.expiresAt ? new Date(formData.expiresAt) : null;
  const windowMinutes = scheduledDate && expiresDate ? Math.max(0, Math.round((expiresDate - scheduledDate) / 60000)) : null;

  const handleCreate = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    const duration = parseInt(durationInput) || 0;

    // Validation
    if (!formData.title.trim()) {
      setError('Exam title is required');
      return;
    }
    if (!formData.subject.trim()) {
      setError('Subject is required');
      return;
    }
    if (duration < 1) {
      setError('Duration must be at least 1 minute');
      return;
    }
    if (formData.passingMarks < 0 || formData.passingMarks > 100) {
      setError('Passing marks must be between 0-100');
      return;
    }
    if (!formData.scheduledAt) {
      setError('Scheduled date is required');
      return;
    }
    if (!formData.expiresAt) {
      setError('Expiration date is required');
      return;
    }

    const scheduledDate = new Date(formData.scheduledAt);
    const expiresDate = new Date(formData.expiresAt);

    if (expiresDate <= scheduledDate) {
      setError('Expiration date must be after scheduled date');
      return;
    }
    // Ensure duration does not exceed scheduled window
    const windowMinutes = Math.round((expiresDate - scheduledDate) / 60000);
    if (duration > windowMinutes) {
      setError(`Duration (${duration}m) cannot exceed scheduled window (${windowMinutes}m)`);
      return;
    }

    try {
      setLoading(true);
      const { data } = await API.post('/api/exams', {
        title: formData.title.trim(),
        subject: formData.subject.trim(),
        durationMinutes: duration,
        passingMarks: formData.passingMarks,
        scheduledAt: scheduledDate.toISOString(),
        expiresAt: expiresDate.toISOString(),
        questions: questions,
      });

      setSuccess('Exam created successfully! Redirecting...');
      setTimeout(() => {
        router.push(`/admin/exams/${data.data._id}/edit`);
      }, 1500);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create exam');
    } finally {
      setLoading(false);
    }
  };

  const addQuestion = () => {
    if (!newQuestion.questionText.trim()) {
      setError('Question text is required');
      return;
    }
    if (newQuestion.options.some(opt => !opt.trim())) {
      setError('All options must be filled');
      return;
    }

    // Transform options to the correct format: { label, text }
    const formattedQuestion = {
      questionText: newQuestion.questionText,
      options: newQuestion.options.map((text, idx) => ({
        label: ['A', 'B', 'C', 'D'][idx],
        text: text
      })),
      correctOption: newQuestion.correctOption,
      marks: newQuestion.marks,
    };

    setQuestions([...questions, formattedQuestion]);
    setNewQuestion({
      questionText: '',
      options: ['', '', '', ''],
      correctOption: 'A',
      marks: 1,
    });
    setError('');
  };

  const removeQuestion = (index) => {
    setQuestions(questions.filter((_, i) => i !== index));
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
      <div style={{ padding: '32px 24px', maxWidth: '700px', margin: '0 auto' }}>
        {/* Page header */}
        <div style={{ marginBottom: '32px' }}>
          <div style={{ fontSize: '1.75rem', fontWeight: '700', marginBottom: '8px', color: 'var(--text-primary)' }}>
            📝 Create New Exam
          </div>
          <div style={{ fontSize: '0.95rem', color: 'var(--text-secondary)' }}>
            Fill in exam details and add questions below.
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

        {/* Form */}
        <form onSubmit={handleCreate}>
          <div
            style={{
              background: 'var(--bg-card)',
              border: '1px solid var(--border)',
              borderRadius: 'var(--radius-lg)',
              padding: '28px',
            }}
          >
            {/* Title */}
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
                Exam Title *
              </label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleChange}
                placeholder="e.g., Advanced JavaScript Fundamentals"
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

            {/* Subject */}
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
                Subject *
              </label>
              <input
                type="text"
                name="subject"
                value={formData.subject}
                onChange={handleChange}
                placeholder="e.g., JavaScript, Python, Mathematics"
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

            {/* Duration */}
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
                Duration (minutes) *
              </label>
              <input
                type="text"
                inputMode="numeric"
                pattern="\d*"
                name="durationMinutes"
                value={durationInput}
                onChange={(e) => setDurationInput(e.target.value.replace(/\D/g, ''))}
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
                  setFormData(prev => ({ ...prev, durationMinutes: parseInt(durationInput) || 0 }));
                }}
              />
              <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
                Recommended: 30-120 minutes
              </div>
              {windowMinutes !== null && (
                <div style={{ fontSize: '0.8rem', color: (Number(durationInput) > windowMinutes) ? 'var(--danger)' : 'var(--text-secondary)', marginTop: '4px' }}>
                  Max allowed: {windowMinutes} minute{windowMinutes !== 1 ? 's' : ''}
                </div>
              )}
            </div>

            {/* Passing Marks */}
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
                Passing Marks (%) *
              </label>
              <input
                type="number"
                name="passingMarks"
                value={formData.passingMarks}
                onChange={handleChange}
                min="0"
                max="100"
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
              <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
                Typical: 40-70%
              </div>
            </div>

            {/* Scheduled At */}
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
                Scheduled Date & Time *
              </label>
              <input
                type="datetime-local"
                name="scheduledAt"
                value={formData.scheduledAt}
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
              <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
                When the exam becomes available
              </div>
            </div>

            {/* Expires At */}
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
                Expiration Date & Time *
              </label>
              <input
                type="datetime-local"
                name="expiresAt"
                value={formData.expiresAt}
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
              <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
                When the exam closes and is no longer available
              </div>
            </div>

            {/* Questions Section */}
            <div style={{ marginTop: '32px', paddingTop: '24px', borderTop: '1px solid var(--border)' }}>
              <div style={{ fontSize: '1.1rem', fontWeight: '700', marginBottom: '20px', color: 'var(--text-primary)' }}>
                📋 Questions ({questions.length})
              </div>

              {/* Add Question Form */}
              <div style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', padding: '20px', marginBottom: '20px' }}>
                <div style={{ fontSize: '0.95rem', fontWeight: '600', marginBottom: '16px', color: 'var(--text-primary)' }}>
                  Add New Question
                </div>

                {/* Question Text */}
                <div style={{ marginBottom: '16px' }}>
                  <textarea
                    placeholder="Enter question text"
                    value={newQuestion.questionText}
                    onChange={(e) => setNewQuestion({ ...newQuestion, questionText: e.target.value })}
                    style={{
                      width: '100%',
                      background: 'var(--bg-input)',
                      border: '1px solid var(--border)',
                      color: 'var(--text-primary)',
                      padding: '10px 14px',
                      borderRadius: 'var(--radius-sm)',
                      fontSize: '0.9rem',
                      minHeight: '80px',
                      resize: 'vertical',
                      boxSizing: 'border-box',
                      fontFamily: 'inherit',
                    }}
                  />
                </div>

                {/* Options Grid */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '16px' }}>
                  {['A', 'B', 'C', 'D'].map((label, idx) => (
                    <div key={label}>
                      <label style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '4px', display: 'block' }}>
                        Option {label}
                      </label>
                      <input
                        type="text"
                        placeholder={`Option ${label}`}
                        value={newQuestion.options[idx]}
                        onChange={(e) => {
                          const opts = [...newQuestion.options];
                          opts[idx] = e.target.value;
                          setNewQuestion({ ...newQuestion, options: opts });
                        }}
                        style={{
                          width: '100%',
                          background: 'var(--bg-input)',
                          border: '1px solid var(--border)',
                          color: 'var(--text-primary)',
                          padding: '8px 12px',
                          borderRadius: 'var(--radius-sm)',
                          fontSize: '0.9rem',
                          boxSizing: 'border-box',
                        }}
                      />
                    </div>
                  ))}
                </div>

                {/* Correct Answer & Marks */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '16px' }}>
                  <div>
                    <label style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '4px', display: 'block' }}>
                      Correct Answer
                    </label>
                    <select
                      value={newQuestion.correctOption}
                      onChange={(e) => setNewQuestion({ ...newQuestion, correctOption: e.target.value })}
                      style={{
                        width: '100%',
                        background: 'var(--bg-input)',
                        border: '1px solid var(--border)',
                        color: 'var(--text-primary)',
                        padding: '8px 12px',
                        borderRadius: 'var(--radius-sm)',
                        fontSize: '0.9rem',
                        cursor: 'pointer',
                      }}
                    >
                      {['A', 'B', 'C', 'D'].map(opt => <option key={opt} value={opt}>{opt}</option>)}
                    </select>
                  </div>
                  <div>
                    <label style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '4px', display: 'block' }}>
                      Marks
                    </label>
                    <input
                      type="number"
                      min="1"
                      value={newQuestion.marks}
                      onChange={(e) => setNewQuestion({ ...newQuestion, marks: parseInt(e.target.value) || 1 })}
                      style={{
                        width: '100%',
                        background: 'var(--bg-input)',
                        border: '1px solid var(--border)',
                        color: 'var(--text-primary)',
                        padding: '8px 12px',
                        borderRadius: 'var(--radius-sm)',
                        fontSize: '0.9rem',
                        boxSizing: 'border-box',
                      }}
                    />
                  </div>
                </div>

                <button
                  type="button"
                  onClick={addQuestion}
                  style={{
                    width: '100%',
                    background: 'var(--accent)',
                    color: '#fff',
                    padding: '10px 16px',
                    borderRadius: 'var(--radius-md)',
                    border: 'none',
                    cursor: 'pointer',
                    fontSize: '0.9rem',
                    fontWeight: '600',
                  }}
                >
                  + Add Question
                </button>
              </div>

              {/* Questions List */}
              {questions.length > 0 && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {questions.map((q, idx) => (
                    <div key={idx} style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-accent)', borderRadius: 'var(--radius-md)', padding: '16px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '12px' }}>
                        <div style={{ fontSize: '0.95rem', fontWeight: '600', color: 'var(--text-primary)' }}>
                          Q{idx + 1}. {q.questionText}
                        </div>
                        <button
                          type="button"
                          onClick={() => removeQuestion(idx)}
                          style={{
                            background: 'rgba(255,90,90,0.2)',
                            color: 'var(--danger)',
                            border: 'none',
                            padding: '4px 12px',
                            borderRadius: 'var(--radius-sm)',
                            cursor: 'pointer',
                            fontSize: '0.8rem',
                            fontWeight: '600',
                          }}
                        >
                          Remove
                        </button>
                      </div>
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                        {q.options.map((opt, i) => (
                          <div key={i}>
                            <span style={{ fontWeight: '600', color: q.correctOption === opt.label ? 'var(--success)' : 'inherit' }}>
                              {opt.label}:
                            </span>{' '}
                            {opt.text}
                          </div>
                        ))}
                      </div>
                      <div style={{ marginTop: '8px', fontSize: '0.8rem', color: 'var(--accent)' }}>
                        ✓ Correct: {q.correctOption} | Marks: {q.marks}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Buttons */}
            <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end', marginTop: '28px' }}>
              <Link href="/admin">
                <button
                  type="button"
                  style={{
                    background: 'var(--bg-surface)',
                    border: '1px solid var(--border)',
                    color: 'var(--text-secondary)',
                    padding: '10px 18px',
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
              </Link>
              <button
                type="submit"
                disabled={loading}
                style={{
                  background: loading ? 'var(--text-muted)' : 'var(--accent)',
                  color: '#fff',
                  padding: '10px 24px',
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
                {loading ? '⏳ Creating...' : '✓ Create Exam'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
