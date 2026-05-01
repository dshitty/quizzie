'use client';

import { useEffect, useState } from 'react';
import API from '@/services/api';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';

const toLocalDateTimeInputValue = (dateValue) => {
  const d = new Date(dateValue);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  const hours = String(d.getHours()).padStart(2, '0');
  const minutes = String(d.getMinutes()).padStart(2, '0');
  return `${year}-${month}-${day}T${hours}:${minutes}`;
};

export default function EditExamPage() {
  const params = useParams();
  const examId = params.id;
  const router = useRouter();

  const [exam, setExam] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [editingDetails, setEditingDetails] = useState(false);
  const [examDetails, setExamDetails] = useState({
    title: '',
    subject: '',
    durationMinutes: 60,
    passingMarks: 60,
    scheduledAt: '',
    expiresAt: '',
  });

  const [durationInput, setDurationInput] = useState(String(60));

  const [newQuestion, setNewQuestion] = useState({
    questionText: '',
    options: [
      { label: 'A', text: '' },
      { label: 'B', text: '' },
      { label: 'C', text: '' },
      { label: 'D', text: '' },
    ],
    correctOption: 'A',
    marks: 1,
  });

  useEffect(() => {
    const fetchExam = async () => {
      try {
        const { data } = await API.get(`/api/exams/${examId}`);
        setExam(data.data);
        // Initialize exam details form
        setExamDetails({
          title: data.data.title || '',
          subject: data.data.subject || '',
          durationMinutes: data.data.durationMinutes || 60,
          passingMarks: data.data.passingMarks || 60,
          scheduledAt: data.data.scheduledAt ? toLocalDateTimeInputValue(data.data.scheduledAt) : '',
          expiresAt: data.data.expiresAt ? toLocalDateTimeInputValue(data.data.expiresAt) : '',
        });
          setDurationInput(String(data.data.durationMinutes || 60));
      } catch (err) {
        setError('Failed to load exam');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchExam();
  }, [examId]);

  const sched = examDetails.scheduledAt ? new Date(examDetails.scheduledAt) : null;
  const exp = examDetails.expiresAt ? new Date(examDetails.expiresAt) : null;
  const maxWindowMinutes = sched && exp ? Math.max(0, Math.round((exp - sched) / 60000)) : null;

  const handleOptionChange = (index, text) => {
    setNewQuestion((prev) => {
      const updatedOptions = [...prev.options];
      updatedOptions[index].text = text;
      return { ...prev, options: updatedOptions };
    });
  };

  const handleSaveDetails = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    const duration = parseInt(durationInput) || 0;

    if (!examDetails.title.trim()) {
      setError('Title is required');
      return;
    }
    if (!examDetails.subject.trim()) {
      setError('Subject is required');
      return;
    }
    if (examDetails.passingMarks < 0 || examDetails.passingMarks > 100) {
      setError('Passing marks must be 0-100');
      return;
    }
    // Validate scheduled/expires and duration window
    if (!examDetails.scheduledAt || !examDetails.expiresAt) {
      setError('Scheduled and expiration dates are required');
      return;
    }
    const sched = new Date(examDetails.scheduledAt);
    const exp = new Date(examDetails.expiresAt);
    if (exp <= sched) {
      setError('Expiration date must be after scheduled date');
      return;
    }
    const windowMinutes = Math.round((exp - sched) / 60000);
    if (duration > windowMinutes) {
      setError(`Duration (${duration}m) cannot exceed scheduled window (${windowMinutes}m)`);
      return;
    }

    try {
      const { data } = await API.put(`/api/exams/${examId}`, {
        title: examDetails.title.trim(),
        subject: examDetails.subject.trim(),
        durationMinutes: duration,
        passingMarks: examDetails.passingMarks,
        scheduledAt: new Date(examDetails.scheduledAt).toISOString(),
        expiresAt: new Date(examDetails.expiresAt).toISOString(),
        questions: exam.questions,
      });
      setExam(data.data);
      setEditingDetails(false);
      setSuccess('Exam details updated successfully!');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save exam details');
    }
  };

  const handleAddQuestion = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    // Validation
    if (!newQuestion.questionText.trim()) {
      setError('Question text is required');
      return;
    }

    if (newQuestion.options.some((opt) => !opt.text.trim())) {
      setError('All 4 options must be filled');
      return;
    }

    if (newQuestion.marks < 1) {
      setError('Marks must be at least 1');
      return;
    }

    try {
      const { data } = await API.put(`/api/exams/${examId}`, {
        questions: [...(exam.questions || []), newQuestion],
      });

      setExam(data.data);
      setSuccess('Question added successfully!');

      // Reset form
      setNewQuestion({
        questionText: '',
        options: [
          { label: 'A', text: '' },
          { label: 'B', text: '' },
          { label: 'C', text: '' },
          { label: 'D', text: '' },
        ],
        correctOption: 'A',
        marks: 1,
      });

      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to add question');
    }
  };

  const handleDeleteQuestion = async (questionId) => {
    if (!window.confirm('Delete this question?')) return;

    try {
      const updatedQuestions = exam.questions.filter((q) => q._id !== questionId);
      const { data } = await API.put(`/api/exams/${examId}`, {
        questions: updatedQuestions,
      });
      setExam(data.data);
      setSuccess('Question deleted');
      setTimeout(() => setSuccess(''), 2000);
    } catch (err) {
      setError('Failed to delete question');
    }
  };

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', background: 'var(--bg-base)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ color: 'var(--text-secondary)' }}>Loading exam...</div>
      </div>
    );
  }

  if (!exam) {
    return (
      <div style={{ minHeight: '100vh', background: 'var(--bg-base)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ color: 'var(--danger)' }}>Exam not found</div>
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
            ← Back
          </button>
        </Link>
      </div>

      {/* Main content */}
      <div style={{ padding: '32px 24px', maxWidth: '1000px', margin: '0 auto' }}>
        {/* Page header */}
        <div style={{ marginBottom: '32px' }}>
          <div style={{ fontSize: '1.75rem', fontWeight: '700', marginBottom: '8px', color: 'var(--text-primary)' }}>
            ✏️ Edit Exam: {exam.title}
          </div>
          <div style={{ fontSize: '0.95rem', color: 'var(--text-secondary)' }}>
            Subject: <strong>{exam.subject}</strong> | Duration: <strong>{exam.durationMinutes} min</strong> | Total Marks: <strong>{exam.totalMarks || 0}</strong>
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

        {/* Exam Details Section */}
        {editingDetails ? (
          <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', padding: '28px', marginBottom: '32px' }}>
            <div style={{ fontSize: '1.1rem', fontWeight: '700', marginBottom: '20px', color: 'var(--text-primary)' }}>
              ⚙️ Edit Exam Details
            </div>
            <form onSubmit={handleSaveDetails}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
                <div>
                  <label style={{ fontSize: '0.9rem', fontWeight: '600', marginBottom: '8px', display: 'block', color: 'var(--text-primary)' }}>Title</label>
                  <input
                    type="text"
                    value={examDetails.title}
                    onChange={(e) => setExamDetails({ ...examDetails, title: e.target.value })}
                    style={{ width: '100%', background: 'var(--bg-input)', border: '1px solid var(--border)', color: 'var(--text-primary)', padding: '10px 14px', borderRadius: 'var(--radius-md)', fontSize: '0.9rem', boxSizing: 'border-box' }}
                  />
                </div>
                <div>
                  <label style={{ fontSize: '0.9rem', fontWeight: '600', marginBottom: '8px', display: 'block', color: 'var(--text-primary)' }}>Subject</label>
                  <input
                    type="text"
                    value={examDetails.subject}
                    onChange={(e) => setExamDetails({ ...examDetails, subject: e.target.value })}
                    style={{ width: '100%', background: 'var(--bg-input)', border: '1px solid var(--border)', color: 'var(--text-primary)', padding: '10px 14px', borderRadius: 'var(--radius-md)', fontSize: '0.9rem', boxSizing: 'border-box' }}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
                <div>
                  <label style={{ fontSize: '0.9rem', fontWeight: '600', marginBottom: '8px', display: 'block', color: 'var(--text-primary)' }}>Duration (minutes)</label>
                  <input
                    type="text"
                    inputMode="numeric"
                    pattern="\d*"
                    value={durationInput}
                    onChange={(e) => setDurationInput(e.target.value.replace(/\D/g, ''))}
                    onBlur={() => setExamDetails({ ...examDetails, durationMinutes: parseInt(durationInput) || 60 })}
                    style={{ width: '100%', background: 'var(--bg-input)', border: '1px solid var(--border)', color: 'var(--text-primary)', padding: '10px 14px', borderRadius: 'var(--radius-md)', fontSize: '0.9rem', boxSizing: 'border-box' }}
                  />
                  {maxWindowMinutes !== null && (
                    <div style={{ fontSize: '0.8rem', color: (Number(durationInput) > maxWindowMinutes) ? 'var(--danger)' : 'var(--text-secondary)', marginTop: '8px' }}>
                      Max allowed: {maxWindowMinutes} minute{maxWindowMinutes !== 1 ? 's' : ''}
                    </div>
                  )}
                </div>
                <div>
                  <label style={{ fontSize: '0.9rem', fontWeight: '600', marginBottom: '8px', display: 'block', color: 'var(--text-primary)' }}>Passing Marks (%)</label>
                  <input
                    type="number"
                    value={examDetails.passingMarks}
                    onChange={(e) => setExamDetails({ ...examDetails, passingMarks: parseInt(e.target.value) || 60 })}
                    min="0"
                    max="100"
                    style={{ width: '100%', background: 'var(--bg-input)', border: '1px solid var(--border)', color: 'var(--text-primary)', padding: '10px 14px', borderRadius: 'var(--radius-md)', fontSize: '0.9rem', boxSizing: 'border-box' }}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '20px' }}>
                <div>
                  <label style={{ fontSize: '0.9rem', fontWeight: '600', marginBottom: '8px', display: 'block', color: 'var(--text-primary)' }}>Scheduled Date & Time</label>
                  <input
                    type="datetime-local"
                    value={examDetails.scheduledAt}
                    onChange={(e) => setExamDetails({ ...examDetails, scheduledAt: e.target.value })}
                    style={{ width: '100%', background: 'var(--bg-input)', border: '1px solid var(--border)', color: 'var(--text-primary)', padding: '10px 14px', borderRadius: 'var(--radius-md)', fontSize: '0.9rem', boxSizing: 'border-box' }}
                  />
                </div>
                <div>
                  <label style={{ fontSize: '0.9rem', fontWeight: '600', marginBottom: '8px', display: 'block', color: 'var(--text-primary)' }}>Expiration Date & Time</label>
                  <input
                    type="datetime-local"
                    value={examDetails.expiresAt}
                    onChange={(e) => setExamDetails({ ...examDetails, expiresAt: e.target.value })}
                    style={{ width: '100%', background: 'var(--bg-input)', border: '1px solid var(--border)', color: 'var(--text-primary)', padding: '10px 14px', borderRadius: 'var(--radius-md)', fontSize: '0.9rem', boxSizing: 'border-box' }}
                  />
                </div>
              </div>

              <div style={{ display: 'flex', gap: '12px' }}>
                <button
                  type="submit"
                  style={{ background: 'var(--accent)', color: '#fff', padding: '10px 18px', borderRadius: 'var(--radius-md)', border: 'none', cursor: 'pointer', fontSize: '0.9rem', fontWeight: '600' }}
                >
                  💾 Save Details
                </button>
                <button
                  type="button"
                  onClick={() => setEditingDetails(false)}
                  style={{ background: 'var(--bg-surface)', color: 'var(--text-secondary)', padding: '10px 18px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)', cursor: 'pointer', fontSize: '0.9rem', fontWeight: '600' }}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        ) : (
          <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', padding: '20px', marginBottom: '32px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginBottom: '4px' }}>
                <strong>Title:</strong> {exam.title} | <strong>Subject:</strong> {exam.subject}
              </div>
              <div style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
                <strong>Duration:</strong> {exam.durationMinutes} min | <strong>Passing Marks:</strong> {exam.passingMarks}% | <strong>Total Marks:</strong> {exam.totalMarks || 0}
              </div>
            </div>
            <button
              onClick={() => setEditingDetails(true)}
              style={{ background: 'var(--accent-soft)', color: 'var(--accent)', border: 'none', padding: '8px 16px', borderRadius: 'var(--radius-md)', cursor: 'pointer', fontSize: '0.9rem', fontWeight: '600', whiteSpace: 'nowrap' }}
            >
              ✏️ Edit Details
            </button>
          </div>
        )}

        {/* Questions Section */}
        {exam.questions && exam.questions.length > 0 && (
          <div style={{ marginBottom: '40px' }}>
            <div style={{ fontSize: '1.25rem', fontWeight: '700', marginBottom: '16px', color: 'var(--text-primary)' }}>
              📋 Questions ({exam.questions.length})
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {exam.questions.map((question, idx) => (
                <div
                  key={question._id}
                  style={{
                    background: 'var(--bg-card)',
                    border: '1px solid var(--border)',
                    borderRadius: 'var(--radius-lg)',
                    padding: '20px',
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                    <div style={{ fontSize: '0.95rem', fontWeight: '600', color: 'var(--text-primary)' }}>
                      Q{idx + 1}. {question.questionText}
                    </div>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <span
                        style={{
                          fontSize: '0.8rem',
                          background: 'var(--accent-soft)',
                          color: 'var(--accent)',
                          padding: '4px 10px',
                          borderRadius: 'var(--radius-sm)',
                          fontWeight: '600',
                        }}
                      >
                        {question.marks} marks
                      </span>
                      <button
                        onClick={() => handleDeleteQuestion(question._id)}
                        style={{
                          background: 'rgba(255,90,90,0.12)',
                          border: 'none',
                          color: 'var(--danger)',
                          padding: '4px 10px',
                          borderRadius: 'var(--radius-sm)',
                          cursor: 'pointer',
                          fontSize: '0.8rem',
                          fontWeight: '600',
                          transition: 'all 0.2s',
                        }}
                        onMouseEnter={(e) => {
                          e.target.style.background = 'rgba(255,90,90,0.25)';
                        }}
                        onMouseLeave={(e) => {
                          e.target.style.background = 'rgba(255,90,90,0.12)';
                        }}
                      >
                        🗑️ Delete
                      </button>
                    </div>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '10px' }}>
                    {question.options.map((option) => (
                      <div
                        key={option.label}
                        style={{
                          background: 'var(--bg-hover)',
                          border: '1px solid var(--border)',
                          borderRadius: 'var(--radius-md)',
                          padding: '10px 12px',
                          fontSize: '0.85rem',
                          color: question.correctOption === option.label ? 'var(--accent)' : 'var(--text-secondary)',
                          borderLeftWidth: '3px',
                          borderLeftColor: question.correctOption === option.label ? 'var(--accent)' : 'transparent',
                        }}
                      >
                        <strong>{option.label}:</strong> {option.text}
                        {question.correctOption === option.label && (
                          <span style={{ marginLeft: '8px', color: 'var(--accent)', fontWeight: '700' }}>✓</span>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Add New Question Form */}
        <div>
          <div style={{ fontSize: '1.25rem', fontWeight: '700', marginBottom: '16px', color: 'var(--text-primary)' }}>
            ➕ Add New Question
          </div>

          <form onSubmit={handleAddQuestion}>
            <div
              style={{
                background: 'var(--bg-card)',
                border: '1px solid var(--border)',
                borderRadius: 'var(--radius-lg)',
                padding: '24px',
              }}
            >
              {/* Question Text */}
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
                  Question Text *
                </label>
                <textarea
                  value={newQuestion.questionText}
                  onChange={(e) => setNewQuestion((prev) => ({ ...prev, questionText: e.target.value }))}
                  placeholder="Enter the question here..."
                  rows="3"
                  style={{
                    width: '100%',
                    background: 'var(--bg-input)',
                    border: '1px solid var(--border)',
                    color: 'var(--text-primary)',
                    padding: '10px 14px',
                    borderRadius: 'var(--radius-md)',
                    fontSize: '0.9rem',
                    fontFamily: 'var(--font-main)',
                    transition: 'all 0.2s',
                    boxSizing: 'border-box',
                    resize: 'vertical',
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

              {/* Options */}
              <div style={{ marginBottom: '20px' }}>
                <label style={{ fontSize: '0.9rem', fontWeight: '600', color: 'var(--text-primary)', display: 'block', marginBottom: '12px' }}>
                  Options (A, B, C, D) *
                </label>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '12px' }}>
                  {newQuestion.options.map((option, idx) => (
                    <div key={option.label}>
                      <label style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', display: 'block', marginBottom: '4px' }}>
                        Option {option.label}
                      </label>
                      <input
                        type="text"
                        value={option.text}
                        onChange={(e) => handleOptionChange(idx, e.target.value)}
                        placeholder={`Enter option ${option.label}...`}
                        style={{
                          width: '100%',
                          background: 'var(--bg-input)',
                          border: '1px solid var(--border)',
                          color: 'var(--text-primary)',
                          padding: '10px 12px',
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
                  ))}
                </div>
              </div>

              {/* Correct Answer */}
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
                  Correct Answer *
                </label>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '8px' }}>
                  {['A', 'B', 'C', 'D'].map((opt) => (
                    <label
                      key={opt}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        padding: '10px 12px',
                        background: newQuestion.correctOption === opt ? 'var(--accent-soft)' : 'var(--bg-input)',
                        border: '1px solid ' + (newQuestion.correctOption === opt ? 'var(--border-accent)' : 'var(--border)'),
                        borderRadius: 'var(--radius-md)',
                        cursor: 'pointer',
                        transition: 'all 0.2s',
                        color: newQuestion.correctOption === opt ? 'var(--accent)' : 'var(--text-secondary)',
                        fontWeight: newQuestion.correctOption === opt ? '600' : '400',
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.borderColor = 'var(--border-accent)';
                        e.currentTarget.style.background = 'var(--accent-soft)';
                      }}
                      onMouseLeave={(e) => {
                        if (newQuestion.correctOption !== opt) {
                          e.currentTarget.style.background = 'var(--bg-input)';
                          e.currentTarget.style.borderColor = 'var(--border)';
                        }
                      }}
                    >
                      <input
                        type="radio"
                        name="correctAnswer"
                        value={opt}
                        checked={newQuestion.correctOption === opt}
                        onChange={(e) => setNewQuestion((prev) => ({ ...prev, correctOption: e.target.value }))}
                        style={{ cursor: 'pointer' }}
                      />
                      <span>{opt}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Marks */}
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
                  Marks *
                </label>
                <input
                  type="number"
                  value={newQuestion.marks}
                  onChange={(e) => setNewQuestion((prev) => ({ ...prev, marks: parseInt(e.target.value) || 1 }))}
                  min="1"
                  max="100"
                  style={{
                    width: '100%',
                    maxWidth: '150px',
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

              {/* Add Button */}
              <button
                type="submit"
                style={{
                  background: 'var(--accent)',
                  color: '#fff',
                  padding: '12px 24px',
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
                ➕ Add Question
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
