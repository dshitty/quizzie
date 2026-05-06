'use client';

import { useRouter, useParams } from 'next/navigation';
import { useState } from 'react';

export default function InstructionsPage() {
  const router = useRouter();
  const { id } = useParams();
  const [agreedToInstructions, setAgreedToInstructions] = useState(false);

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-base)', padding: '32px 24px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
      {/* Background circles */}
      <div style={{ position: 'absolute', width: '400px', height: '400px', borderRadius: '50%', filter: 'blur(80px)', opacity: '0.18', background: 'var(--accent)', top: '-100px', right: '-80px', pointerEvents: 'none' }}></div>
      <div style={{ position: 'absolute', width: '300px', height: '300px', borderRadius: '50%', filter: 'blur(80px)', opacity: '0.18', background: '#ff63b5', bottom: '-80px', left: '-60px', pointerEvents: 'none' }}></div>

      {/* Instructions Card */}
      <div style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius-xl)', padding: '48px 40px', width: '100%', maxWidth: '560px', position: 'relative', zIndex: 1, boxShadow: 'var(--shadow-card)', animation: 'fadeUp 0.5s ease' }}>
        
        {/* Header */}
        <div style={{ marginBottom: '32px' }}>
          <h1 style={{ fontSize: '2rem', fontWeight: '800', marginBottom: '8px', color: 'var(--text-primary)' }}>
            Exam<span style={{ color: 'var(--accent)' }}>Pulse</span>
          </h1>
          <p style={{ fontSize: '0.95rem', color: 'var(--text-secondary)' }}>Read the instructions carefully before starting</p>
        </div>

        {/* Instructions Section */}
        <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', padding: '24px', marginBottom: '32px' }}>
          <h2 style={{ fontSize: '1.15rem', fontWeight: '700', marginBottom: '20px', color: 'var(--text-primary)' }}>
            📋 Important Instructions
          </h2>

          <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <li style={{ display: 'flex', gap: '12px', fontSize: '0.95rem', color: 'var(--text-secondary)', lineHeight: '1.6' }}>
              <span style={{ color: 'var(--accent)', fontWeight: '600', minWidth: '20px' }}>✓</span>
              <span>You have <strong style={{ color: 'var(--text-primary)' }}>limited time</strong> to complete the exam. The timer will start once you begin.</span>
            </li>
            <li style={{ display: 'flex', gap: '12px', fontSize: '0.95rem', color: 'var(--text-secondary)', lineHeight: '1.6' }}>
              <span style={{ color: 'var(--accent)', fontWeight: '600', minWidth: '20px' }}>✓</span>
              <span><strong style={{ color: 'var(--text-primary)' }}>Do not switch tabs</strong> or leave the exam window during the test.</span>
            </li>
            <li style={{ display: 'flex', gap: '12px', fontSize: '0.95rem', color: 'var(--text-secondary)', lineHeight: '1.6' }}>
              <span style={{ color: 'var(--accent)', fontWeight: '600', minWidth: '20px' }}>✓</span>
              <span>The exam will <strong style={{ color: 'var(--text-primary)' }}>auto-submit</strong> when time runs out. Click submit if you finish early.</span>
            </li>
            <li style={{ display: 'flex', gap: '12px', fontSize: '0.95rem', color: 'var(--text-secondary)', lineHeight: '1.6' }}>
              <span style={{ color: 'var(--accent)', fontWeight: '600', minWidth: '20px' }}>✓</span>
              <span>Use the <strong style={{ color: 'var(--text-primary)' }}>question navigator</strong> to move between questions easily.</span>
            </li>
            <li style={{ display: 'flex', gap: '12px', fontSize: '0.95rem', color: 'var(--text-secondary)', lineHeight: '1.6' }}>
              <span style={{ color: 'var(--accent)', fontWeight: '600', minWidth: '20px' }}>✓</span>
              <span><strong style={{ color: 'var(--text-primary)' }}>Cannot go back</strong> to edit answers after submission.</span>
            </li>
          </ul>
        </div>

        {/* Disclaimer */}
        <div style={{ background: 'rgba(255, 179, 71, 0.1)', border: '1px solid rgba(255, 179, 71, 0.3)', borderRadius: 'var(--radius-md)', padding: '16px', marginBottom: '24px' }}>
          <p style={{ fontSize: '0.85rem', color: 'var(--warning)', lineHeight: '1.6' }}>
            <strong>⚠️ Warning:</strong> Any attempt to cheat or violate exam rules may result in disqualification and permanent ban from the platform.
          </p>
        </div>

        {/* Checkbox */}
        <label style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px', cursor: 'pointer', fontSize: '0.95rem', color: 'var(--text-secondary)' }}>
          <input
            type="checkbox"
            checked={agreedToInstructions}
            onChange={(e) => setAgreedToInstructions(e.target.checked)}
            style={{
              width: '20px',
              height: '20px',
              cursor: 'pointer',
              accentColor: 'var(--accent)',
            }}
          />
          <span>I have read and understood all the instructions above</span>
        </label>

        {/* Action Buttons */}
        <div style={{ display: 'flex', gap: '12px' }}>
          <button
            onClick={() => router.back()}
            style={{
              flex: 1,
              background: 'var(--bg-card)',
              border: '1px solid var(--border)',
              color: 'var(--text-secondary)',
              padding: '14px 20px',
              borderRadius: 'var(--radius-md)',
              cursor: 'pointer',
              fontSize: '0.95rem',
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
            Go Back
          </button>

          <button
            onClick={() => router.push(`/exam/${id}`)}
            disabled={!agreedToInstructions}
            className="btn-primary"
            style={{
              flex: 1,
              opacity: agreedToInstructions ? 1 : 0.5,
              cursor: agreedToInstructions ? 'pointer' : 'not-allowed',
              fontSize: '0.95rem',
            }}
          >
            Start Exam →
          </button>
        </div>
      </div>
    </div>
  );
}
