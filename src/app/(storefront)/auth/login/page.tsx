'use client';

import React, { useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import {
  Mail, User, Phone, ArrowRight, ShieldCheck,
  CheckCircle2, AlertCircle, Lock, Eye, EyeOff, Sparkles, Shield,
} from 'lucide-react';
import { createBrowserClient } from '@supabase/ssr';
import { BUSINESS } from '@/lib/constants';

/* ─── GPU-accelerated Smooth CSS Animations ────────────────────────────── */
const CSS = `
@keyframes authCardEnter {
  from { opacity: 0; transform: translateY(18px) scale(0.99); }
  to   { opacity: 1; transform: translateY(0) scale(1); }
}
@keyframes authFormFade {
  from { opacity: 0; transform: translateY(8px); }
  to   { opacity: 1; transform: translateY(0); }
}
@keyframes authSpin { to { transform: rotate(360deg); } }
@keyframes authPopCheck {
  0%   { transform: scale(0) rotate(-15deg); opacity: 0; }
  60%  { transform: scale(1.15) rotate(5deg); opacity: 1; }
  80%  { transform: scale(0.95) rotate(-2deg); }
  100% { transform: scale(1) rotate(0deg); opacity: 1; }
}

.auth-wrapper {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 32px 16px;
  position: relative;
  overflow: hidden;
  background: linear-gradient(135deg, #2D0B13 0%, #4A1420 40%, #380E17 80%, #5C1927 100%);
}
.auth-card {
  animation: authCardEnter 0.45s cubic-bezier(0.16, 1, 0.3, 1) both;
}
.auth-form-animated {
  animation: authFormFade 0.3s cubic-bezier(0.16, 1, 0.3, 1) both;
}
.auth-input {
  width: 100%;
  padding: 12px 14px 12px 42px;
  border: 1.5px solid #DDD5C8;
  border-radius: 12px;
  background: #ffffff;
  font-size: 13.5px;
  color: #24211F;
  outline: none;
  transition: border-color 0.2s ease, box-shadow 0.2s ease;
  font-family: inherit;
  box-sizing: border-box;
}
.auth-input:focus {
  border-color: #B8955A;
  box-shadow: 0 0 0 3px rgba(184, 149, 90, 0.15);
}
.auth-btn-primary {
  width: 100%;
  padding: 13px;
  border-radius: 12px;
  border: none;
  background: linear-gradient(135deg, #4A1420 0%, #681C2D 60%, #8B2B3F 100%);
  color: #ffffff;
  font-size: 14.5px;
  font-weight: 700;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  box-shadow: 0 6px 20px rgba(104, 28, 45, 0.35);
  transition: opacity 0.2s ease, transform 0.2s ease, box-shadow 0.2s ease;
  letter-spacing: .02em;
}
.auth-btn-primary:hover:not(:disabled) {
  opacity: 0.94;
  transform: translateY(-1px);
  box-shadow: 0 8px 24px rgba(104, 28, 45, 0.45);
}
.auth-btn-primary:active:not(:disabled) {
  transform: translateY(0);
}
.auth-btn-primary:disabled {
  background: #9CA3AF;
  box-shadow: none;
  cursor: not-allowed;
  transform: none;
}
.auth-spinner {
  animation: authSpin 0.85s linear infinite;
}
.auth-success-icon {
  animation: authPopCheck 0.65s cubic-bezier(0.16, 1, 0.3, 1) both;
}
.pw-strength-bar {
  height: 3px;
  border-radius: 99px;
  transition: width 0.35s ease, background-color 0.35s ease;
}

@media (max-width: 899px) {
  .auth-left-panel { display: none !important; }
  .auth-right-panel { width: 100% !important; max-width: 480px !important; margin: 0 auto !important; }
}
@media (min-width: 900px) {
  .auth-mobile-header { display: none !important; }
}
`;

function getStrength(pw: string): { score: number; label: string; color: string } {
  if (!pw) return { score: 0, label: '', color: 'transparent' };
  let s = 0;
  if (pw.length >= 8)  s++;
  if (pw.length >= 12) s++;
  if (/[A-Z]/.test(pw)) s++;
  if (/[0-9]/.test(pw)) s++;
  if (/[^A-Za-z0-9]/.test(pw)) s++;
  if (s <= 1) return { score: s, label: 'Weak',   color: '#EF4444' };
  if (s <= 3) return { score: s, label: 'Fair',   color: '#F59E0B' };
  if (s <= 4) return { score: s, label: 'Good',   color: '#10B981' };
  return              { score: s, label: 'Strong', color: '#059669' };
}

function AuthForm() {
  const sp           = useSearchParams();
  const rawReturn    = sp.get('returnUrl') ?? '';
  const returnUrl    = rawReturn.startsWith('/') && !rawReturn.startsWith('//') ? rawReturn : '/account';
  const initMode     = sp.get('mode') === 'signup' ? 'signup' : 'login';

  const [mode, setMode]           = useState<'login' | 'signup'>(initMode);
  const [isSuccess, setIsSuccess] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');

  /* Sign-in fields */
  const [loginEmail,    setLoginEmail]    = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [showLoginPw,   setShowLoginPw]   = useState(false);

  /* Sign-up fields */
  const [signupName,     setSignupName]     = useState('');
  const [signupEmail,    setSignupEmail]    = useState('');
  const [signupPhone,    setSignupPhone]    = useState('');
  const [signupPassword, setSignupPassword] = useState('');
  const [signupConfirm,  setSignupConfirm]  = useState('');
  const [showSignupPw,   setShowSignupPw]   = useState(false);
  const [showSignupCfm,  setShowSignupCfm]  = useState(false);
  const [terms,          setTerms]          = useState(false);

  /* UI state */
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState('');

  const strength = getStrength(signupPassword);

  const switchMode = (newMode: 'login' | 'signup') => {
    setError('');
    setMode(newMode);
  };

  /* ── Sign In ────────────────────────────────────────────────────────── */
  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!loginEmail || !loginPassword) {
      setError('Please enter your email and password.');
      return;
    }
    setLoading(true);
    setError('');

    try {
      const supabase = createBrowserClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!
      );

      const { data, error: signInErr } = await supabase.auth.signInWithPassword({
        email: loginEmail.trim().toLowerCase(),
        password: loginPassword,
      });

      if (signInErr) {
        if (signInErr.message.includes('Invalid login credentials')) {
          throw new Error('Incorrect email or password. Please check your credentials.');
        }
        if (signInErr.message.includes('Email not confirmed')) {
          throw new Error('Please verify your email before signing in.');
        }
        throw signInErr;
      }

      const userName = data.user?.user_metadata?.full_name || data.user?.email?.split('@')[0] || 'Customer';
      setSuccessMsg(`Welcome back, ${userName}!`);
      setIsSuccess(true);
      setTimeout(() => {
        window.location.href = returnUrl;
      }, 1000);
    } catch (err: any) {
      setError(err.message || 'Sign-in failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  /* ── Create Account ──────────────────────────────────────────────────── */
  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!signupName.trim()) {
      setError('Please enter your full name.');
      return;
    }
    if (!signupEmail.trim()) {
      setError('Please enter your email address.');
      return;
    }
    if (signupPassword.length < 8) {
      setError('Password must be at least 8 characters long.');
      return;
    }
    if (signupPassword !== signupConfirm) {
      setError('Passwords do not match. Please re-enter.');
      return;
    }
    if (!terms) {
      setError('Please accept the Terms & Conditions and Privacy Policy.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      // 1. Call server-side registration endpoint
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: signupName.trim(),
          email: signupEmail.trim().toLowerCase(),
          phone: signupPhone.trim() || undefined,
          password: signupPassword,
        }),
      });

      const result = await res.json();
      if (!res.ok || !result.success) {
        throw new Error(result.error || 'Failed to create account. Please try again.');
      }

      // 2. Automatically log the user in via Supabase client
      const supabase = createBrowserClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!
      );

      await supabase.auth.signInWithPassword({
        email: signupEmail.trim().toLowerCase(),
        password: signupPassword,
      });

      setSuccessMsg(`Account created! Welcome to Mithai Box Wala, ${signupName.trim().split(' ')[0]}!`);
      setIsSuccess(true);
      setTimeout(() => {
        window.location.href = returnUrl;
      }, 1200);
    } catch (err: any) {
      setError(err.message || 'Account creation failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const C = {
    burgundy: '#681C2D', dark: '#4A1420', light: '#8B2B3F',
    gold: '#B8955A', goldLight: '#CBA96E',
    ivory: '#FAF7F0', beige: '#EDE4D6',
    charcoal: '#24211F', muted: '#6B6663', border: '#DDD5C8',
  };

  const iconStyle: React.CSSProperties = {
    position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)',
    color: '#8C8885', pointerEvents: 'none',
  };

  return (
    <>
      <style>{CSS}</style>

      <div className="auth-wrapper">
        {/* Background ambient elements */}
        <div style={{
          position: 'absolute', inset: 0, opacity: 0.08,
          backgroundImage: 'radial-gradient(#B8955A 1px, transparent 1px)',
          backgroundSize: '28px 28px', pointerEvents: 'none',
        }} />
        <div style={{
          position: 'absolute', top: '-10%', right: '-8%', width: 440, height: 440,
          borderRadius: '50%', background: 'radial-gradient(circle, rgba(184,149,90,0.12) 0%, transparent 70%)', pointerEvents: 'none',
        }} />
        <div style={{
          position: 'absolute', bottom: '-10%', left: '-8%', width: 380, height: 380,
          borderRadius: '50%', background: 'radial-gradient(circle, rgba(104,28,45,0.25) 0%, transparent 70%)', pointerEvents: 'none',
        }} />

        <div style={{ width: '100%', maxWidth: 960, position: 'relative', zIndex: 1, margin: '0 auto' }}>

          {/* ══════════════════════ MAIN CARD ══════════════════════ */}
          <div
            className="auth-card"
            style={{
              background: '#ffffff',
              borderRadius: 24,
              overflow: 'hidden',
              boxShadow: '0 28px 80px rgba(0,0,0,0.45), 0 0 0 1px rgba(255,255,255,0.08)',
              display: 'flex',
              minHeight: 560,
            }}
          >
            {/* ── LEFT PANEL (Brand Story — Desktop) ── */}
            <div
              className="auth-left-panel"
              style={{
                width: '44%',
                background: 'linear-gradient(145deg, #3A0D18 0%, #681C2D 55%, #4A1420 100%)',
                padding: '40px 32px',
                color: '#FAF7F0',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                position: 'relative',
                overflow: 'hidden',
                borderRight: '1px solid rgba(184,149,90,0.3)',
              }}
            >
              <div style={{
                position: 'absolute', inset: 0, opacity: 0.07,
                backgroundImage: 'radial-gradient(#B8955A 1px, transparent 1px)',
                backgroundSize: '20px 20px', pointerEvents: 'none',
              }} />

              <div style={{ position: 'relative', zIndex: 2 }}>
                {/* Logo & Headline */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 20 }}>
                  <div style={{
                    width: 52, height: 52, borderRadius: 14, overflow: 'hidden',
                    background: '#681C2D', border: '1.5px solid rgba(184,149,90,0.6)',
                    boxShadow: '0 6px 20px rgba(0,0,0,0.3)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                  }}>
                    <img
                      src="/images/editorial/Gemini_Generated_Image_3w4lsp3w4lsp3w4l.png"
                      alt="Mithai Box Wala Official Logo"
                      style={{ width: '100%', height: '100%', objectFit: 'contain' }}
                    />
                  </div>
                  <div>
                    <h2 style={{ fontFamily: "'Cormorant Garamond', Georgia, serif", fontSize: 22, fontWeight: 700, color: '#fff', margin: 0, lineHeight: 1.15 }}>
                      Mithai Box Wala
                    </h2>
                    <p style={{ fontSize: 10, color: '#CBA96E', letterSpacing: '.12em', textTransform: 'uppercase', fontWeight: 600, margin: '3px 0 0' }}>
                      by Ajay Packers · Est. 1984
                    </p>
                  </div>
                </div>

                <p style={{
                  fontSize: 13.5, color: 'rgba(250,247,240,0.88)', lineHeight: 1.6,
                  margin: '0 0 22px', fontStyle: 'italic', borderLeft: '2px solid #B8955A', paddingLeft: 12,
                }}>
                  "The Perfection of Your Sweets, Paired with Our Ultimate Packaging."
                </p>

                {/* Editorial Visual Showcase */}
                <div style={{
                  background: 'rgba(255,255,255,0.06)', borderRadius: 16, padding: 10,
                  border: '1px solid rgba(184,149,90,0.3)', boxShadow: '0 8px 24px rgba(0,0,0,0.2)', marginBottom: 20,
                }}>
                  <div style={{ height: 136, borderRadius: 12, overflow: 'hidden', position: 'relative', background: '#4A1420' }}>
                    <img
                      src="/images/editorial/Gemini_Generated_Image_jbsl4ljbsl4ljbsl.png"
                      alt="Luxury Packaging Collection"
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    />
                    <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(36,33,31,0.82) 0%, transparent 60%)' }} />
                    <span style={{ position: 'absolute', bottom: 8, left: 10, right: 10, fontSize: 10.5, fontWeight: 600, color: '#FAF7F0' }}>
                      ✦ Master-crafted festive collections
                    </span>
                  </div>
                </div>
              </div>

              {/* Manufacturing bullet points */}
              <div style={{ position: 'relative', zIndex: 2 }}>
                {[
                  '40 Years Manufacturing Heritage in Mirzapur',
                  'Direct Wholesale & Custom Logo Foil Stamping',
                  '100% Certified Food-Grade Safe Materials',
                ].map(t => (
                  <div key={t} style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                    <span style={{ color: '#CBA96E', fontSize: 12 }}>✦</span>
                    <span style={{ fontSize: 11.5, color: 'rgba(250,247,240,0.85)' }}>{t}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* ── RIGHT PANEL (Auth Interaction Form) ── */}
            <div
              className="auth-right-panel"
              style={{
                width: '56%',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                background: '#ffffff',
                position: 'relative',
              }}
            >
              <div>
                {/* Mobile Header */}
                <div className="auth-mobile-header" style={{
                  padding: '24px 20px 16px', textAlign: 'center',
                  background: 'linear-gradient(135deg, #4A1420 0%, #681C2D 100%)', color: '#FAF7F0',
                }}>
                  <div style={{
                    width: 48, height: 48, borderRadius: 12, overflow: 'hidden',
                    margin: '0 auto 10px', background: '#681C2D', border: '1.5px solid rgba(184,149,90,0.5)',
                  }}>
                    <img src="/images/editorial/Gemini_Generated_Image_3w4lsp3w4lsp3w4l.png" alt="Logo" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                  </div>
                  <h1 style={{ fontFamily: "'Cormorant Garamond', Georgia, serif", fontSize: 22, fontWeight: 700, margin: 0 }}>{BUSINESS.brand}</h1>
                  <p style={{ fontSize: 10.5, color: '#CBA96E', margin: '2px 0 0', textTransform: 'uppercase' }}>by Ajay Packers · Est. 1984</p>
                </div>

                {/* ── Explicit Clickable Tabs (Always Responsive & Functional) ── */}
                {!isSuccess && (
                  <div style={{ padding: '20px 24px 0' }}>
                    <div style={{
                      display: 'flex',
                      background: '#F5EFE6',
                      borderRadius: 14,
                      padding: 4,
                      border: '1px solid #E5DCCF',
                      gap: 4,
                    }}>
                      <button
                        type="button"
                        onClick={() => switchMode('login')}
                        style={{
                          flex: 1,
                          padding: '11px 0',
                          borderRadius: 10,
                          border: 'none',
                          background: mode === 'login' ? '#ffffff' : 'transparent',
                          boxShadow: mode === 'login' ? '0 2px 8px rgba(36, 33, 31, 0.08)' : 'none',
                          color: mode === 'login' ? C.burgundy : C.muted,
                          fontWeight: 700,
                          fontSize: 13.5,
                          cursor: 'pointer',
                          transition: 'all 0.2s cubic-bezier(0.16, 1, 0.3, 1)',
                        }}
                      >
                        🔑 Sign In
                      </button>

                      <button
                        type="button"
                        onClick={() => switchMode('signup')}
                        style={{
                          flex: 1,
                          padding: '11px 0',
                          borderRadius: 10,
                          border: 'none',
                          background: mode === 'signup' ? '#ffffff' : 'transparent',
                          boxShadow: mode === 'signup' ? '0 2px 8px rgba(36, 33, 31, 0.08)' : 'none',
                          color: mode === 'signup' ? C.burgundy : C.muted,
                          fontWeight: 700,
                          fontSize: 13.5,
                          cursor: 'pointer',
                          transition: 'all 0.2s cubic-bezier(0.16, 1, 0.3, 1)',
                        }}
                      >
                        ✨ Create Account
                      </button>
                    </div>
                  </div>
                )}

                {/* Error Notification */}
                {error && !isSuccess && (
                  <div style={{
                    margin: '16px 24px 0',
                    display: 'flex', alignItems: 'center', gap: 8, padding: '10px 14px',
                    background: '#FFF1F2', border: '1.5px solid #FECDD3', borderRadius: 10,
                    fontSize: 12.5, color: '#9F1239',
                  }}>
                    <AlertCircle size={15} style={{ flexShrink: 0 }} />
                    <span>{error}</span>
                  </div>
                )}

                {/* ── Form View Switcher (Clean, Smooth, Reliable) ── */}
                {!isSuccess ? (
                  mode === 'login' ? (
                    /* ══ SIGN IN FORM ══ */
                    <div key="login" className="auth-form-animated" style={{ padding: '24px 28px 16px' }}>
                      <h2 style={{ fontFamily: "'Cormorant Garamond', Georgia, serif", fontSize: 24, fontWeight: 700, color: C.charcoal, margin: '0 0 4px' }}>
                        Welcome back
                      </h2>
                      <p style={{ fontSize: 13, color: C.muted, margin: '0 0 20px' }}>
                        Sign in to your Mithai Box Wala account
                      </p>

                      <form onSubmit={handleSignIn}>
                        <div style={{ marginBottom: 16 }}>
                          <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: C.charcoal, marginBottom: 6, letterSpacing: '.05em', textTransform: 'uppercase' }}>
                            Email Address
                          </label>
                          <div style={{ position: 'relative' }}>
                            <Mail size={15} style={iconStyle} />
                            <input
                              className="auth-input"
                              type="email"
                              required
                              autoComplete="email"
                              placeholder="you@example.com"
                              value={loginEmail}
                              onChange={e => setLoginEmail(e.target.value)}
                            />
                          </div>
                        </div>

                        <div style={{ marginBottom: 20 }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                            <label style={{ fontSize: 11, fontWeight: 700, color: C.charcoal, letterSpacing: '.05em', textTransform: 'uppercase' }}>
                              Password
                            </label>
                            <Link href="/forgot-password" style={{ fontSize: 11.5, color: C.burgundy, textDecoration: 'none', fontWeight: 600 }}>
                              Forgot password?
                            </Link>
                          </div>
                          <div style={{ position: 'relative' }}>
                            <Lock size={15} style={iconStyle} />
                            <input
                              className="auth-input"
                              type={showLoginPw ? 'text' : 'password'}
                              required
                              autoComplete="current-password"
                              placeholder="Your password"
                              value={loginPassword}
                              onChange={e => setLoginPassword(e.target.value)}
                              style={{ paddingRight: 42 }}
                            />
                            <button
                              type="button"
                              onClick={() => setShowLoginPw(p => !p)}
                              style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: C.muted }}
                            >
                              {showLoginPw ? <EyeOff size={15} /> : <Eye size={15} />}
                            </button>
                          </div>
                        </div>

                        <button type="submit" className="auth-btn-primary" disabled={loading}>
                          {loading ? (
                            <><div className="auth-spinner" style={{ width: 18, height: 18, border: '2.5px solid rgba(255,255,255,0.3)', borderTopColor: '#fff', borderRadius: '50%' }} /> Signing In…</>
                          ) : (
                            <>Sign In <ArrowRight size={16} /></>
                          )}
                        </button>

                        <p style={{ textAlign: 'center', fontSize: 12.5, color: C.muted, marginTop: 18 }}>
                          Don't have an account?{' '}
                          <button
                            type="button"
                            onClick={() => switchMode('signup')}
                            style={{ background: 'none', border: 'none', color: C.burgundy, fontWeight: 700, cursor: 'pointer', fontSize: 12.5 }}
                          >
                            Create a free account →
                          </button>
                        </p>
                      </form>
                    </div>
                  ) : (
                    /* ══ CREATE ACCOUNT FORM ══ */
                    <div key="signup" className="auth-form-animated" style={{ padding: '20px 28px 16px' }}>
                      <h2 style={{ fontFamily: "'Cormorant Garamond', Georgia, serif", fontSize: 24, fontWeight: 700, color: C.charcoal, margin: '0 0 2px' }}>
                        Join Mithai Box Wala
                      </h2>
                      <p style={{ fontSize: 12.5, color: C.muted, margin: '0 0 16px' }}>
                        Create your wholesale customer account
                      </p>

                      <form onSubmit={handleSignUp}>
                        {/* Full Name */}
                        <div style={{ marginBottom: 11 }}>
                          <label style={{ display: 'block', fontSize: 10.5, fontWeight: 700, color: C.charcoal, marginBottom: 4, letterSpacing: '.05em', textTransform: 'uppercase' }}>
                            Full Name *
                          </label>
                          <div style={{ position: 'relative' }}>
                            <User size={15} style={iconStyle} />
                            <input
                              className="auth-input"
                              type="text"
                              required
                              autoComplete="name"
                              placeholder="Ramesh Kumar"
                              value={signupName}
                              onChange={e => setSignupName(e.target.value)}
                            />
                          </div>
                        </div>

                        {/* Email */}
                        <div style={{ marginBottom: 11 }}>
                          <label style={{ display: 'block', fontSize: 10.5, fontWeight: 700, color: C.charcoal, marginBottom: 4, letterSpacing: '.05em', textTransform: 'uppercase' }}>
                            Email Address *
                          </label>
                          <div style={{ position: 'relative' }}>
                            <Mail size={15} style={iconStyle} />
                            <input
                              className="auth-input"
                              type="email"
                              required
                              autoComplete="email"
                              placeholder="you@example.com"
                              value={signupEmail}
                              onChange={e => setSignupEmail(e.target.value)}
                            />
                          </div>
                        </div>

                        {/* Phone */}
                        <div style={{ marginBottom: 11 }}>
                          <label style={{ display: 'block', fontSize: 10.5, fontWeight: 700, color: C.charcoal, marginBottom: 4, letterSpacing: '.05em', textTransform: 'uppercase' }}>
                            Phone Number <span style={{ fontWeight: 400, color: C.muted }}>(optional)</span>
                          </label>
                          <div style={{ position: 'relative' }}>
                            <Phone size={15} style={iconStyle} />
                            <input
                              className="auth-input"
                              type="tel"
                              autoComplete="tel"
                              placeholder="+91 98765 43210"
                              value={signupPhone}
                              onChange={e => setSignupPhone(e.target.value)}
                            />
                          </div>
                        </div>

                        {/* Password */}
                        <div style={{ marginBottom: 6 }}>
                          <label style={{ display: 'block', fontSize: 10.5, fontWeight: 700, color: C.charcoal, marginBottom: 4, letterSpacing: '.05em', textTransform: 'uppercase' }}>
                            Password *
                          </label>
                          <div style={{ position: 'relative' }}>
                            <Lock size={15} style={iconStyle} />
                            <input
                              className="auth-input"
                              type={showSignupPw ? 'text' : 'password'}
                              required
                              autoComplete="new-password"
                              placeholder="Minimum 8 characters"
                              value={signupPassword}
                              onChange={e => setSignupPassword(e.target.value)}
                              style={{ paddingRight: 42 }}
                            />
                            <button
                              type="button"
                              onClick={() => setShowSignupPw(p => !p)}
                              style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: C.muted }}
                            >
                              {showSignupPw ? <EyeOff size={15} /> : <Eye size={15} />}
                            </button>
                          </div>
                        </div>

                        {/* Strength Indicator */}
                        {signupPassword && (
                          <div style={{ marginBottom: 10 }}>
                            <div style={{ display: 'flex', gap: 4, marginBottom: 2 }}>
                              {[1, 2, 3, 4, 5].map(i => (
                                <div key={i} className="pw-strength-bar" style={{ flex: 1, background: i <= strength.score ? strength.color : '#EDE4D6' }} />
                              ))}
                            </div>
                            <span style={{ fontSize: 10.5, color: strength.color, fontWeight: 600 }}>{strength.label}</span>
                          </div>
                        )}

                        {/* Confirm Password */}
                        <div style={{ marginBottom: 12 }}>
                          <label style={{ display: 'block', fontSize: 10.5, fontWeight: 700, color: C.charcoal, marginBottom: 4, letterSpacing: '.05em', textTransform: 'uppercase' }}>
                            Confirm Password *
                          </label>
                          <div style={{ position: 'relative' }}>
                            <Lock size={15} style={iconStyle} />
                            <input
                              className="auth-input"
                              type={showSignupCfm ? 'text' : 'password'}
                              required
                              autoComplete="new-password"
                              placeholder="Re-enter your password"
                              value={signupConfirm}
                              onChange={e => setSignupConfirm(e.target.value)}
                              style={{
                                paddingRight: 42,
                                borderColor: signupConfirm && signupConfirm !== signupPassword ? '#EF4444' : undefined,
                              }}
                            />
                            <button
                              type="button"
                              onClick={() => setShowSignupCfm(p => !p)}
                              style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: C.muted }}
                            >
                              {showSignupCfm ? <EyeOff size={15} /> : <Eye size={15} />}
                            </button>
                          </div>
                          {signupConfirm && signupConfirm !== signupPassword && (
                            <span style={{ fontSize: 10.5, color: '#EF4444', marginTop: 2, display: 'block' }}>
                              Passwords do not match
                            </span>
                          )}
                        </div>

                        {/* Terms Checkbox */}
                        <label style={{ display: 'flex', alignItems: 'flex-start', gap: 8, marginBottom: 14, cursor: 'pointer' }}>
                          <input
                            type="checkbox"
                            checked={terms}
                            onChange={e => setTerms(e.target.checked)}
                            style={{ marginTop: 2, accentColor: C.burgundy, flexShrink: 0 }}
                          />
                          <span style={{ fontSize: 11.5, color: C.muted, lineHeight: 1.4 }}>
                            I accept the{' '}
                            <Link href="/terms" style={{ color: C.burgundy, fontWeight: 600 }} target="_blank">Terms</Link>
                            {' '}and{' '}
                            <Link href="/privacy-policy" style={{ color: C.burgundy, fontWeight: 600 }} target="_blank">Privacy Policy</Link>
                          </span>
                        </label>

                        <button type="submit" className="auth-btn-primary" disabled={loading}>
                          {loading ? (
                            <><div className="auth-spinner" style={{ width: 18, height: 18, border: '2.5px solid rgba(255,255,255,0.3)', borderTopColor: '#fff', borderRadius: '50%' }} /> Creating Account…</>
                          ) : (
                            <>Create Account <ArrowRight size={16} /></>
                          )}
                        </button>

                        <p style={{ textAlign: 'center', fontSize: 12, color: C.muted, marginTop: 14 }}>
                          Already have an account?{' '}
                          <button
                            type="button"
                            onClick={() => switchMode('login')}
                            style={{ background: 'none', border: 'none', color: C.burgundy, fontWeight: 700, cursor: 'pointer', fontSize: 12 }}
                          >
                            Sign In →
                          </button>
                        </p>
                      </form>
                    </div>
                  )
                ) : (
                  /* ── Success State ── */
                  <div style={{ padding: '60px 32px', textAlign: 'center' }}>
                    <div className="auth-success-icon" style={{
                      width: 80, height: 80, borderRadius: '50%',
                      background: 'linear-gradient(135deg, #15803D 0%, #22C55E 100%)',
                      color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center',
                      margin: '0 auto 20px', boxShadow: '0 12px 40px rgba(34,197,94,0.35)',
                    }}>
                      <CheckCircle2 size={44} />
                    </div>
                    <h2 style={{ fontFamily: "'Cormorant Garamond', Georgia, serif", fontSize: 26, fontWeight: 700, color: C.charcoal, margin: '0 0 8px' }}>
                      {successMsg || 'Success!'}
                    </h2>
                    <p style={{ fontSize: 13.5, color: C.muted, margin: '0 0 20px' }}>
                      Redirecting to your account dashboard…
                    </p>
                  </div>
                )}
              </div>

              {/* ── Footer Trust Strip + Admin Portal Link ── */}
              <div>
                <div style={{
                  padding: '8px 20px',
                  background: '#F5EFE6',
                  borderTop: `1px solid ${C.beige}`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  fontSize: 11.5,
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: 4, color: '#166534' }}>
                      <ShieldCheck size={13} /> SSL Encrypted
                    </span>
                    <span style={{ display: 'flex', alignItems: 'center', gap: 4, color: C.gold }}>
                      <Sparkles size={12} /> 40 Yrs Craft
                    </span>
                  </div>
                  {/* Admin Portal link directly near login as requested */}
                  <Link
                    href="/admin/login"
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: 4,
                      color: C.burgundy,
                      fontWeight: 700,
                      textDecoration: 'none',
                    }}
                  >
                    <Shield size={12} /> Admin Portal →
                  </Link>
                </div>
              </div>

            </div>
          </div>

          {/* ── Store Navigation links ── */}
          <div style={{ textAlign: 'center', marginTop: 18, fontSize: 12, color: 'rgba(250,247,240,0.6)' }}>
            <Link href="/" style={{ color: 'rgba(250,247,240,0.7)', textDecoration: 'none' }}>← Back to store</Link>
            {' · '}
            <Link href="/terms" style={{ color: 'rgba(250,247,240,0.7)', textDecoration: 'none' }}>Terms &amp; Conditions</Link>
            {' · '}
            <Link href="/privacy-policy" style={{ color: 'rgba(250,247,240,0.7)', textDecoration: 'none' }}>Privacy Policy</Link>
          </div>
        </div>
      </div>
    </>
  );
}

export default function AuthPage() {
  return (
    <Suspense fallback={
      <div style={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #2D0B13 0%, #4A1420 40%, #380E17 80%, #5C1927 100%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }} />
    }>
      <AuthForm />
    </Suspense>
  );
}
