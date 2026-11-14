'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { createBrowserClient } from '@supabase/ssr';
import {
  User, Mail, Phone, Lock, Eye, EyeOff, CheckCircle2,
  AlertCircle, ArrowRight, ShieldCheck,
} from 'lucide-react';

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
@media (max-width: 899px) {
  .auth-left-panel { display: none !important; }
  .auth-right-panel { width: 100% !important; max-width: 480px !important; margin: 0 auto !important; }
}
@media (min-width: 900px) {
  .auth-mobile-header { display: none !important; }
}
`;

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

export default function SignupPage() {
  const router = useRouter();

  const [name, setName]       = useState('');
  const [email, setEmail]     = useState('');
  const [phone, setPhone]     = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm]   = useState('');
  const [showPw, setShowPw]     = useState(false);
  const [showCf, setShowCf]     = useState(false);
  const [terms, setTerms]       = useState(false);
  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState('');
  const [success, setSuccess]   = useState(false);

  const strength = getPasswordStrength(password);

  const C = {
    burgundy: '#681C2D', dark: '#4A1420',
    gold: '#B8955A', goldLight: '#CBA96E',
    ivory: '#FAF7F0', beige: '#EDE4D6',
    charcoal: '#24211F', muted: '#6B6663', border: '#DDD5C8',
  };

  const inputStyle: React.CSSProperties = {
    width: '100%', padding: '13px 14px 13px 44px',
    border: `1.5px solid ${C.border}`, borderRadius: 12,
    background: '#fff', fontSize: 14, color: C.charcoal,
    outline: 'none', transition: 'border 0.2s',
    fontFamily: 'Inter, sans-serif', boxSizing: 'border-box',
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!name.trim()) { setError('Full name is required'); return; }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) { setError('Please enter a valid email address'); return; }
    if (phone && !/^[6-9]\d{9}$/.test(phone.replace(/\D/g, ''))) {
      setError('Please enter a valid 10-digit Indian mobile number'); return;
    }
    if (password.length < 8) { setError('Password must be at least 8 characters'); return; }
    if (password !== confirm) { setError('Passwords do not match'); return; }
    if (!terms) { setError('Please accept the terms and conditions to continue'); return; }

    setLoading(true);
    try {
      const supabase = createBrowserClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!
      );
      const { error: signUpError } = await supabase.auth.signUp({
        email: email.trim().toLowerCase(),
        password,
        options: {
          data: { name: name.trim(), phone: phone.trim() || null },
        },
      });
      if (signUpError) throw signUpError;
      setSuccess(true);
    } catch (err: any) {
      if (err.message?.includes('already registered')) {
        setError('An account with this email already exists. Please sign in instead.');
      } else {
        setError(err.message || 'Failed to create account. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <>
        <style>{CSS}</style>
        <div className="gradient-bg" style={{
          minHeight: '100vh', display: 'flex', alignItems: 'center',
          justifyContent: 'center', padding: '24px 16px',
        }}>
          <div className="auth-card" style={{
            background: '#fff', borderRadius: 24, padding: '48px 40px',
            textAlign: 'center', maxWidth: 440, width: '100%',
            boxShadow: '0 32px 80px rgba(0,0,0,0.4)',
          }}>
            <div style={{
              width: 72, height: 72, borderRadius: '50%',
              background: '#f0fdf4', display: 'flex', alignItems: 'center', justifyContent: 'center',
              margin: '0 auto 20px',
            }}>
              <CheckCircle2 size={36} color="#16a34a" />
            </div>
            <h2 style={{ fontSize: 24, fontWeight: 700, color: C.charcoal, marginBottom: 12 }}>
              Account Created! 🎉
            </h2>
            <p style={{ fontSize: 14, color: C.muted, lineHeight: 1.6, marginBottom: 28 }}>
              We've sent a verification link to <strong>{email}</strong>. Please verify your email to activate your account.
            </p>
            <Link href="/auth/login" style={{
              display: 'inline-flex', alignItems: 'center', gap: 8,
              background: C.burgundy, color: '#fff', padding: '12px 28px',
              borderRadius: 12, fontWeight: 600, fontSize: 14,
              textDecoration: 'none', transition: 'background 0.2s',
            }}>
              Go to Sign In <ArrowRight size={16} />
            </Link>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <style>{CSS}</style>
      <div className="gradient-bg" style={{
        minHeight: '100vh', display: 'flex', alignItems: 'center',
        justifyContent: 'center', padding: '24px 16px', position: 'relative', overflow: 'hidden',
      }}>
        {/* Dot pattern */}
        <div style={{
          position: 'absolute', inset: 0, opacity: 0.07,
          backgroundImage: 'radial-gradient(#B8955A 1px, transparent 1px)',
          backgroundSize: '30px 30px', pointerEvents: 'none',
        }} />

        <div style={{ width: '100%', maxWidth: 960, position: 'relative', zIndex: 1, margin: '20px auto' }}>
          <div className="auth-card" style={{
            background: '#fff', borderRadius: 24, overflow: 'hidden',
            boxShadow: '0 32px 80px rgba(0,0,0,0.4), 0 0 0 1px rgba(255,255,255,0.1)',
            display: 'flex', minHeight: 620,
          }}>
            {/* Left brand panel */}
            <div className="auth-left-panel" style={{
              width: 380, flexShrink: 0,
              background: `linear-gradient(160deg, ${C.dark} 0%, ${C.burgundy} 60%, #8B2B3F 100%)`,
              padding: '52px 40px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between',
              position: 'relative', overflow: 'hidden',
            }}>
              {/* Top glow */}
              <div style={{
                position: 'absolute', top: -60, right: -60, width: 240, height: 240,
                borderRadius: '50%', background: 'rgba(184,149,90,0.12)', pointerEvents: 'none',
              }} />

              <div>
                <div style={{
                  width: 64, height: 64, borderRadius: 18, overflow: 'hidden',
                  background: 'rgba(255,255,255,0.08)', border: '1.5px solid rgba(255,255,255,0.15)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 24,
                }}>
                  <img
                    src="/images/editorial/Gemini_Generated_Image_3w4lsp3w4lsp3w4l.png"
                    alt="Mithai Box Wala"
                    style={{ width: '100%', height: '100%', objectFit: 'contain' }}
                  />
                </div>
                <h2 style={{ fontSize: 28, fontWeight: 700, color: '#fff', letterSpacing: '-0.02em', marginBottom: 10 }}>
                  Join Mithai Box Wala
                </h2>
                <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.65)', lineHeight: 1.6 }}>
                  Create your account to access wholesale pricing, track orders, and manage your packaging requests.
                </p>
              </div>

              <div style={{ borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: 24 }}>
                {[
                  ['Exclusive wholesale pricing', '🏷️'],
                  ['Order tracking dashboard', '📦'],
                  ['Custom packaging requests', '✏️'],
                ].map(([label, icon]) => (
                  <div key={label} style={{
                    display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12,
                  }}>
                    <span style={{ fontSize: 16 }}>{icon}</span>
                    <span style={{ fontSize: 13, color: 'rgba(255,255,255,0.75)' }}>{label}</span>
                  </div>
                ))}

                <div style={{
                  marginTop: 20, padding: '12px 16px', background: 'rgba(255,255,255,0.06)',
                  borderRadius: 12, border: '1px solid rgba(255,255,255,0.08)',
                }}>
                  <div style={{ fontSize: 10, color: C.gold, letterSpacing: '0.08em', textTransform: 'uppercase', fontWeight: 700, marginBottom: 4 }}>
                    Est. 1984 — 40+ Years
                  </div>
                  <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.65)' }}>
                    Ajay Packers, Mirzapur, U.P.
                  </div>
                </div>
              </div>
            </div>

            {/* Right form panel */}
            <div className="auth-right-panel" style={{
              flex: 1, padding: '48px 48px', display: 'flex', flexDirection: 'column',
              overflowY: 'auto',
            }}>
              <div className="auth-mobile-header" style={{ marginBottom: 28, textAlign: 'center' }}>
                <img
                  src="/images/editorial/Gemini_Generated_Image_3w4lsp3w4lsp3w4l.png"
                  alt="Logo"
                  style={{ width: 52, height: 52, borderRadius: 14, objectFit: 'contain', marginBottom: 12 }}
                />
                <div style={{ fontSize: 20, fontWeight: 700, color: C.charcoal }}>Create Account</div>
              </div>

              <div style={{ marginBottom: 28 }}>
                <div style={{ display: 'flex', gap: 4, background: '#F9F5EF', borderRadius: 12, padding: 4, marginBottom: 24 }}>
                  <Link href="/auth/login" style={{
                    flex: 1, textAlign: 'center', padding: '8px 0',
                    borderRadius: 10, fontSize: 13, fontWeight: 600,
                    textDecoration: 'none', color: C.muted, transition: 'all 0.2s',
                  }}>
                    Sign In
                  </Link>
                  <div style={{
                    flex: 1, textAlign: 'center', padding: '8px 0',
                    background: '#fff', borderRadius: 10, fontSize: 13, fontWeight: 700,
                    color: C.burgundy, boxShadow: '0 1px 4px rgba(0,0,0,0.08)',
                  }}>
                    Create Account
                  </div>
                </div>

                <h3 style={{ fontSize: 20, fontWeight: 700, color: C.charcoal, marginBottom: 4 }}>
                  Create your account
                </h3>
                <p style={{ fontSize: 13, color: C.muted }}>
                  Fill in your details to get started
                </p>
              </div>

              {error && (
                <div style={{
                  padding: '12px 14px', background: '#fef2f2', border: '1px solid #fecaca',
                  borderRadius: 10, marginBottom: 20, display: 'flex', alignItems: 'center', gap: 8,
                  fontSize: 13, color: '#b91c1c',
                }}>
                  <AlertCircle size={16} style={{ flexShrink: 0 }} />
                  <span>{error}</span>
                </div>
              )}

              <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                {/* Full Name */}
                <div>
                  <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: C.charcoal, marginBottom: 6 }}>
                    Full Name *
                  </label>
                  <div style={{ position: 'relative' }}>
                    <User size={16} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: '#9CA3AF' }} />
                    <input
                      type="text"
                      placeholder="Ramesh Kumar"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      required
                      style={inputStyle}
                    />
                  </div>
                </div>

                {/* Email */}
                <div>
                  <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: C.charcoal, marginBottom: 6 }}>
                    Email Address *
                  </label>
                  <div style={{ position: 'relative' }}>
                    <Mail size={16} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: '#9CA3AF' }} />
                    <input
                      type="email"
                      placeholder="you@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      style={inputStyle}
                    />
                  </div>
                </div>

                {/* Phone */}
                <div>
                  <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: C.charcoal, marginBottom: 6 }}>
                    Phone Number <span style={{ color: C.muted, fontWeight: 400 }}>(optional)</span>
                  </label>
                  <div style={{ position: 'relative' }}>
                    <Phone size={16} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: '#9CA3AF' }} />
                    <input
                      type="tel"
                      placeholder="9876543210"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      style={inputStyle}
                    />
                  </div>
                </div>

                {/* Password */}
                <div>
                  <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: C.charcoal, marginBottom: 6 }}>
                    Password *
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
                    <button
                      type="button"
                      onClick={() => setShowPw(!showPw)}
                      style={{ position: 'absolute', right: 14, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#9CA3AF' }}
                    >
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
                      <div style={{ fontSize: 11, color: strength.color, fontWeight: 600 }}>
                        {strength.label}
                      </div>
                    </div>
                  )}
                </div>

                {/* Confirm Password */}
                <div>
                  <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: C.charcoal, marginBottom: 6 }}>
                    Confirm Password *
                  </label>
                  <div style={{ position: 'relative' }}>
                    <Lock size={16} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: '#9CA3AF' }} />
                    <input
                      type={showCf ? 'text' : 'password'}
                      placeholder="Re-enter password"
                      value={confirm}
                      onChange={(e) => setConfirm(e.target.value)}
                      required
                      style={{
                        ...inputStyle, paddingRight: 44,
                        borderColor: confirm && confirm !== password ? '#fca5a5' : C.border,
                      }}
                    />
                    <button
                      type="button"
                      onClick={() => setShowCf(!showCf)}
                      style={{ position: 'absolute', right: 14, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#9CA3AF' }}
                    >
                      {showCf ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                  {confirm && confirm !== password && (
                    <p style={{ fontSize: 11, color: '#dc2626', marginTop: 4 }}>Passwords do not match</p>
                  )}
                </div>

                {/* Terms */}
                <label style={{ display: 'flex', alignItems: 'flex-start', gap: 10, cursor: 'pointer' }}>
                  <input
                    type="checkbox"
                    checked={terms}
                    onChange={(e) => setTerms(e.target.checked)}
                    style={{ marginTop: 2, accentColor: C.burgundy }}
                  />
                  <span style={{ fontSize: 12, color: C.muted, lineHeight: 1.5 }}>
                    I agree to the{' '}
                    <Link href="/terms" style={{ color: C.burgundy, fontWeight: 600 }}>Terms & Conditions</Link>
                    {' '}and{' '}
                    <Link href="/privacy-policy" style={{ color: C.burgundy, fontWeight: 600 }}>Privacy Policy</Link>
                  </span>
                </label>

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
                    <><div className="spinner" style={{ width: 18, height: 18, border: '2px solid rgba(255,255,255,0.3)', borderTopColor: '#fff', borderRadius: '50%' }} /> Creating account...</>
                  ) : (
                    <><ShieldCheck size={16} /> Create Account</>
                  )}
                </button>

                <div style={{ textAlign: 'center', fontSize: 13, color: C.muted }}>
                  Already have an account?{' '}
                  <Link href="/auth/login" style={{ color: C.burgundy, fontWeight: 700, textDecoration: 'none' }}>
                    Sign In
                  </Link>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
