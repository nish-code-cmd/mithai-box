'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createBrowserClient } from '@supabase/ssr';
import { Lock, Eye, EyeOff, CheckCircle2, AlertCircle } from 'lucide-react';

function getPasswordStrength(password: string): { score: number; label: string; color: string } {
  if (!password) return { score: 0, label: '', color: '' };
  let score = 0;
  if (password.length >= 8) score++;
  if (password.length >= 12) score++;
  if (/[A-Z]/.test(password)) score++;
  if (/[0-9]/.test(password)) score++;
  if (/[^A-Za-z0-9]/.test(password)) score++;
  if (score <= 1) return { score, label: 'Very Weak', color: '#ef4444' };
  if (score === 2) return { score, label: 'Weak', color: '#f97316' };
  if (score === 3) return { score, label: 'Fair', color: '#eab308' };
  if (score === 4) return { score, label: 'Strong', color: '#22c55e' };
  return { score, label: 'Very Strong', color: '#16a34a' };
}

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

export default function ResetPasswordPage() {
  const router = useRouter();
  const [password, setPassword] = useState('');
  const [confirm, setConfirm]   = useState('');
  const [showPw, setShowPw]     = useState(false);
  const [showCf, setShowCf]     = useState(false);
  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState('');
  const [done, setDone]         = useState(false);
  const [hasSession, setHasSession] = useState<boolean | null>(null);

  const strength = getPasswordStrength(password);

  const C = {
    burgundy: '#681C2D', charcoal: '#24211F', muted: '#6B6663', border: '#DDD5C8',
  };

  useEffect(() => {
    const supabase = createBrowserClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!
    );
    supabase.auth.getSession().then(({ data }) => {
      setHasSession(!!data.session);
    });
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password.length < 8) { setError('Password must be at least 8 characters'); return; }
    if (password !== confirm) { setError('Passwords do not match'); return; }

    setLoading(true); setError('');
    try {
      const supabase = createBrowserClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!
      );
      const { error: err } = await supabase.auth.updateUser({ password });
      if (err) throw err;
      setDone(true);
      setTimeout(() => router.push('/auth/login'), 2500);
    } catch (err: any) {
      setError(err.message || 'Failed to reset password. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const inputStyle: React.CSSProperties = {
    width: '100%', padding: '13px 14px 13px 44px',
    border: `1.5px solid ${C.border}`, borderRadius: 12,
    background: '#fff', fontSize: 14, color: C.charcoal,
    outline: 'none', fontFamily: 'Inter, sans-serif', boxSizing: 'border-box',
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
          {done ? (
            <div style={{ textAlign: 'center' }}>
              <div style={{
                width: 72, height: 72, borderRadius: '50%',
                background: '#f0fdf4', display: 'flex', alignItems: 'center', justifyContent: 'center',
                margin: '0 auto 20px',
              }}>
                <CheckCircle2 size={36} color="#16a34a" />
              </div>
              <h2 style={{ fontSize: 22, fontWeight: 700, color: C.charcoal, marginBottom: 10 }}>
                Password Updated!
              </h2>
              <p style={{ fontSize: 14, color: C.muted, lineHeight: 1.6 }}>
                Your password has been successfully updated. Redirecting you to sign in…
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
                  Set New Password
                </h2>
                <p style={{ fontSize: 14, color: C.muted, lineHeight: 1.6 }}>
                  Choose a strong password for your Mithai Box Wala account.
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
                    New Password *
                  </label>
                  <div style={{ position: 'relative' }}>
                    <Lock size={16} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: '#9CA3AF' }} />
                    <input
                      type={showPw ? 'text' : 'password'}
                      placeholder="Min 8 characters"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      style={{ ...inputStyle, paddingRight: 44 }}
                    />
                    <button type="button" onClick={() => setShowPw(!showPw)}
                      style={{ position: 'absolute', right: 14, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#9CA3AF' }}>
                      {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                  {password && (
                    <div style={{ marginTop: 8 }}>
                      <div style={{ display: 'flex', gap: 4, marginBottom: 4 }}>
                        {[1,2,3,4,5].map((i) => (
                          <div key={i} style={{
                            flex: 1, height: 3, borderRadius: 99,
                            background: i <= strength.score ? strength.color : '#E5E7EB',
                            transition: 'background 0.3s',
                          }} />
                        ))}
                      </div>
                      <div style={{ fontSize: 11, color: strength.color, fontWeight: 600 }}>{strength.label}</div>
                    </div>
                  )}
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: C.charcoal, marginBottom: 6 }}>
                    Confirm New Password *
                  </label>
                  <div style={{ position: 'relative' }}>
                    <Lock size={16} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: '#9CA3AF' }} />
                    <input
                      type={showCf ? 'text' : 'password'}
                      placeholder="Re-enter password"
                      value={confirm}
                      onChange={(e) => setConfirm(e.target.value)}
                      required
                      style={{ ...inputStyle, paddingRight: 44, borderColor: confirm && confirm !== password ? '#fca5a5' : C.border }}
                    />
                    <button type="button" onClick={() => setShowCf(!showCf)}
                      style={{ position: 'absolute', right: 14, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#9CA3AF' }}>
                      {showCf ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                  {confirm && confirm !== password && (
                    <p style={{ fontSize: 11, color: '#dc2626', marginTop: 4 }}>Passwords do not match</p>
                  )}
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
                    transition: 'background 0.2s', marginTop: 4,
                  }}
                >
                  {loading ? (
                    <><div className="spinner" style={{ width: 18, height: 18, border: '2px solid rgba(255,255,255,0.3)', borderTopColor: '#fff', borderRadius: '50%' }} /> Updating...</>
                  ) : 'Update Password'}
                </button>
              </form>
            </>
          )}
        </div>
      </div>
    </>
  );
}
