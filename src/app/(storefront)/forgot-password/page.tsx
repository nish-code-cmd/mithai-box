'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { createBrowserClient } from '@supabase/ssr';
import { Mail, ArrowLeft, CheckCircle2, AlertCircle } from 'lucide-react';

const CSS = `
@keyframes fadeSlideUp {
  from { opacity: 0; transform: translateY(28px); }
  to   { opacity: 1; transform: translateY(0); }
}
@keyframes spin { to { transform: rotate(360deg); } }
@keyframes gradientShift {
  0%   { background-position: 0% 50%; }
  50%  { background-position: 100% 50%; }
  100% { background-position: 0% 50%; }
}
.auth-card { animation: fadeSlideUp 0.55s cubic-bezier(0.16,1,0.3,1) both; }
.spinner { animation: spin 0.9s linear infinite; }
.gradient-bg {
  background: linear-gradient(-45deg, #2D0B13, #4A1420, #380E17, #5C1927);
  background-size: 400% 400%;
  animation: gradientShift 12s ease infinite;
}
`;

export default function ForgotPasswordPage() {
  const [email, setEmail]     = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState('');
  const [sent, setSent]       = useState(false);

  const C = {
    burgundy: '#681C2D', gold: '#B8955A',
    ivory: '#FAF7F0', charcoal: '#24211F', muted: '#6B6663', border: '#DDD5C8',
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) { setError('Please enter your email address'); return; }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) { setError('Please enter a valid email address'); return; }

    setLoading(true); setError('');
    try {
      const supabase = createBrowserClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!
      );
      const { error: err } = await supabase.auth.resetPasswordForEmail(
        email.trim().toLowerCase(),
        { redirectTo: `${window.location.origin}/auth/reset-password` }
      );
      if (err) throw err;
      setSent(true);
    } catch (err: any) {
      setError(err.message || 'Failed to send reset email. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <style>{CSS}</style>
      <div className="gradient-bg" style={{
        minHeight: '100vh', display: 'flex', alignItems: 'center',
        justifyContent: 'center', padding: '24px 16px',
      }}>
        <div style={{
          position: 'absolute', inset: 0, opacity: 0.07,
          backgroundImage: 'radial-gradient(#B8955A 1px, transparent 1px)',
          backgroundSize: '30px 30px', pointerEvents: 'none',
        }} />

        <div className="auth-card" style={{
          background: '#fff', borderRadius: 24, padding: '48px 40px',
          maxWidth: 440, width: '100%', position: 'relative', zIndex: 1,
          boxShadow: '0 32px 80px rgba(0,0,0,0.4)',
        }}>
          <Link href="/auth/login" style={{
            display: 'inline-flex', alignItems: 'center', gap: 6,
            fontSize: 13, color: C.muted, textDecoration: 'none', marginBottom: 28,
          }}>
            <ArrowLeft size={14} /> Back to Sign In
          </Link>

          {sent ? (
            <div style={{ textAlign: 'center' }}>
              <div style={{
                width: 72, height: 72, borderRadius: '50%',
                background: '#f0fdf4', display: 'flex', alignItems: 'center', justifyContent: 'center',
                margin: '0 auto 20px',
              }}>
                <CheckCircle2 size={36} color="#16a34a" />
              </div>
              <h2 style={{ fontSize: 22, fontWeight: 700, color: C.charcoal, marginBottom: 10 }}>
                Check your inbox
              </h2>
              <p style={{ fontSize: 14, color: C.muted, lineHeight: 1.6, marginBottom: 24 }}>
                We've sent a password reset link to <strong>{email}</strong>. Click the link in the email to set a new password.
              </p>
              <p style={{ fontSize: 12, color: C.muted }}>
                Didn't receive it?{' '}
                <button
                  onClick={() => { setSent(false); setEmail(''); }}
                  style={{ background: 'none', border: 'none', cursor: 'pointer', color: C.burgundy, fontWeight: 600, fontSize: 12 }}
                >
                  Try again
                </button>
              </p>
            </div>
          ) : (
            <>
              <div style={{ marginBottom: 28 }}>
                <div style={{
                  width: 56, height: 56, borderRadius: 16, overflow: 'hidden',
                  background: C.burgundy, display: 'flex', alignItems: 'center', justifyContent: 'center',
                  marginBottom: 20,
                }}>
                  <img
                    src="/images/editorial/Gemini_Generated_Image_3w4lsp3w4lsp3w4l.png"
                    alt="Mithai Box Wala"
                    style={{ width: '100%', height: '100%', objectFit: 'contain' }}
                  />
                </div>
                <h2 style={{ fontSize: 22, fontWeight: 700, color: C.charcoal, marginBottom: 8 }}>
                  Forgot your password?
                </h2>
                <p style={{ fontSize: 14, color: C.muted, lineHeight: 1.6 }}>
                  Enter your registered email address and we'll send you a link to reset your password.
                </p>
              </div>

              {error && (
                <div style={{
                  padding: '12px 14px', background: '#fef2f2', border: '1px solid #fecaca',
                  borderRadius: 10, marginBottom: 20, display: 'flex', alignItems: 'center', gap: 8,
                  fontSize: 13, color: '#b91c1c',
                }}>
                  <AlertCircle size={15} style={{ flexShrink: 0 }} />
                  <span>{error}</span>
                </div>
              )}

              <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                <div>
                  <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: C.charcoal, marginBottom: 6 }}>
                    Email Address
                  </label>
                  <div style={{ position: 'relative' }}>
                    <Mail size={16} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: '#9CA3AF' }} />
                    <input
                      type="email"
                      placeholder="you@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      style={{
                        width: '100%', padding: '13px 14px 13px 44px',
                        border: `1.5px solid ${C.border}`, borderRadius: 12,
                        background: '#fff', fontSize: 14, color: C.charcoal,
                        outline: 'none', fontFamily: 'Inter, sans-serif', boxSizing: 'border-box' as const,
                      }}
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  style={{
                    width: '100%', padding: '14px',
                    background: loading ? '#9CA3AF' : C.burgundy,
                    color: '#fff', border: 'none', borderRadius: 12,
                    fontSize: 14, fontWeight: 700, cursor: loading ? 'not-allowed' : 'pointer',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                    transition: 'background 0.2s',
                  }}
                >
                  {loading ? (
                    <><div className="spinner" style={{ width: 18, height: 18, border: '2px solid rgba(255,255,255,0.3)', borderTopColor: '#fff', borderRadius: '50%' }} /> Sending...</>
                  ) : 'Send Reset Link'}
                </button>
              </form>
            </>
          )}
        </div>
      </div>
    </>
  );
}
