'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import {
  Mail, User, Phone, Building2, ArrowRight,
  ShieldCheck, CheckCircle2, AlertCircle, Package,
  RefreshCw, Lock, Eye, EyeOff, Sparkles,
} from 'lucide-react';

/* ─── Keyframe injection ─────────────────────────────────────────────── */
const CSS = `
@keyframes fadeSlideUp {
  from { opacity: 0; transform: translateY(28px); }
  to   { opacity: 1; transform: translateY(0); }
}
@keyframes fadeIn {
  from { opacity: 0; }
  to   { opacity: 1; }
}
@keyframes scaleIn {
  from { opacity: 0; transform: scale(0.88); }
  to   { opacity: 1; transform: scale(1); }
}
@keyframes shimmer {
  0%   { background-position: -400px 0; }
  100% { background-position: 400px 0; }
}
@keyframes spin { to { transform: rotate(360deg); } }
@keyframes popCheck {
  0%   { transform: scale(0) rotate(-20deg); opacity: 0; }
  60%  { transform: scale(1.18) rotate(6deg); opacity: 1; }
  80%  { transform: scale(0.94) rotate(-3deg); }
  100% { transform: scale(1) rotate(0deg); opacity: 1; }
}
@keyframes float {
  0%, 100% { transform: translateY(0px); }
  50% { transform: translateY(-8px); }
}
@keyframes otpPop {
  0%   { transform: scale(1); }
  50%  { transform: scale(1.12); }
  100% { transform: scale(1); }
}
@keyframes gradientShift {
  0%   { background-position: 0% 50%; }
  50%  { background-position: 100% 50%; }
  100% { background-position: 0% 50%; }
}
.auth-card { animation: fadeSlideUp 0.55s cubic-bezier(0.16,1,0.3,1) both; }
.fade-in   { animation: fadeIn 0.4s ease both; }
.scale-in  { animation: scaleIn 0.4s cubic-bezier(0.16,1,0.3,1) both; }
.float-icon { animation: float 3s ease-in-out infinite; }
.pop-check { animation: popCheck 0.6s cubic-bezier(0.16,1,0.3,1) both; }
.spinner { animation: spin 0.9s linear infinite; }
.otp-pop  { animation: otpPop 0.2s ease both; }
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

export default function AuthPage() {
  const router = useRouter();
  const sp = useSearchParams();
  const rawReturn = sp.get('returnUrl') ?? '';
  const returnUrl = rawReturn.startsWith('/') && !rawReturn.startsWith('//') ? rawReturn : '/account';
  const initMode = sp.get('mode') === 'signup' ? 'signup' : 'login';

  const [mode, setMode]   = useState<'login' | 'signup'>(initMode);
  const [step, setStep]   = useState<'form' | 'otp' | 'success'>('form');
  const [email, setEmail] = useState('');
  const [name, setName]   = useState('');
  const [phone, setPhone] = useState('');
  const [company, setCompany] = useState('');
  const [showEmail, setShowEmail] = useState(false);
  const [digits, setDigits] = useState(['', '', '', '', '', '']);
  const refs = useRef<(HTMLInputElement | null)[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState('');
  const [msg, setMsg]         = useState('');
  const [cooldown, setCooldown] = useState(0);

  useEffect(() => {
    if (cooldown <= 0) return;
    const t = setInterval(() => setCooldown(p => p > 0 ? p - 1 : 0), 1000);
    return () => clearInterval(t);
  }, [cooldown]);

  /* switch tab → reset */
  const switchMode = (m: 'login' | 'signup') => {
    setMode(m); setStep('form'); setError(''); setMsg('');
    setEmail(''); setName(''); setPhone(''); setCompany('');
    setDigits(['', '', '', '', '', '']);
  };

  const sendOtp = async (e?: React.FormEvent) => {
    e?.preventDefault();
    setLoading(true); setError(''); setMsg('');
    try {
      const r = await fetch('/api/auth/otp/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim().toLowerCase() }),
      });
      const d = await r.json();
      if (!d.success) throw new Error(d.error || 'Failed to send code');
      setStep('otp'); setCooldown(60);
      setMsg(`Code sent to ${email}`);
      setTimeout(() => refs.current[0]?.focus(), 150);
    } catch (err: any) { setError(err.message); }
    finally { setLoading(false); }
  };

  const handleDigit = (i: number, val: string) => {
    const clean = val.replace(/\D/g, '');
    const nd = [...digits];
    if (clean.length > 1) {
      const pasted = clean.slice(0, 6).split('');
      pasted.forEach((c, j) => { if (j < 6) nd[j] = c; });
      setDigits(nd);
      refs.current[Math.min(pasted.length, 5)]?.focus();
      if (pasted.length === 6) verifyOtp(pasted.join(''));
      return;
    }
    nd[i] = clean; setDigits(nd);
    if (clean && i < 5) refs.current[i + 1]?.focus();
    if (clean && i === 5 && nd.every(d => d)) verifyOtp(nd.join(''));
  };

  const handleKeyDown = (i: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !digits[i] && i > 0) refs.current[i - 1]?.focus();
  };

  const verifyOtp = async (code?: string) => {
    const otp = code || digits.join('');
    if (otp.length !== 6) { setError('Enter all 6 digits'); return; }
    setLoading(true); setError('');
    try {
      const r = await fetch('/api/auth/otp/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: email.trim().toLowerCase(), otp,
          name: name.trim() || undefined,
          phone: phone.trim() || undefined,
        }),
      });
      const d = await r.json();
      if (!d.success) throw new Error(d.error || 'Invalid code');
      setStep('success');
      setTimeout(() => router.push(returnUrl), 1800);
    } catch (err: any) { setError(err.message); setDigits(['', '', '', '', '', '']); setTimeout(() => refs.current[0]?.focus(), 50); }
    finally { setLoading(false); }
  };

  /* ─── brand colours ───────────────────────────────────────────────── */
  const C = {
    burgundy: '#681C2D', dark: '#4A1420', light: '#8B2B3F',
    gold: '#B8955A', goldLight: '#CBA96E',
    ivory: '#FAF7F0', beige: '#EDE4D6',
    charcoal: '#24211F', muted: '#6B6663', border: '#DDD5C8',
  };

  const inputStyle: React.CSSProperties = {
    width: '100%', padding: '13px 14px 13px 44px',
    border: `1.5px solid ${C.border}`, borderRadius: 12,
    background: '#fff', fontSize: 14, color: C.charcoal,
    outline: 'none', transition: 'border 0.2s, box-shadow 0.2s',
    fontFamily: 'Inter, sans-serif',
  };

  return (
    <>
      <style>{CSS}</style>

      <div style={{
        minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: '24px 16px', position: 'relative', overflow: 'hidden',
      }}
        className="gradient-bg"
      >
        {/* Background decorations */}
        <div style={{
          position: 'absolute', inset: 0, opacity: 0.07,
          backgroundImage: 'radial-gradient(#B8955A 1px, transparent 1px)',
          backgroundSize: '30px 30px', pointerEvents: 'none',
        }} />
        <div style={{
          position: 'absolute', top: '-15%', right: '-10%', width: 480, height: 480,
          borderRadius: '50%', background: 'rgba(184,149,90,0.08)', pointerEvents: 'none',
        }} />
        <div style={{
          position: 'absolute', bottom: '-10%', left: '-8%', width: 360, height: 360,
          borderRadius: '50%', background: 'rgba(184,149,90,0.06)', pointerEvents: 'none',
        }} />

        <div style={{ width: '100%', maxWidth: 960, position: 'relative', zIndex: 1, margin: '20px auto' }}>

          {/* Main Card with Two-Column Split */}
          <div
            className="auth-card"
            style={{
              background: '#fff',
              borderRadius: 24,
              overflow: 'hidden',
              boxShadow: '0 32px 80px rgba(0,0,0,0.4), 0 0 0 1px rgba(255,255,255,0.1)',
              display: 'flex',
              minHeight: 580,
            }}
          >
            {/* ── LEFT PANEL (Desktop Brand Editorial) ── */}
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
              {/* Subtle background ornamentation */}
              <div
                style={{
                  position: 'absolute',
                  inset: 0,
                  opacity: 0.08,
                  backgroundImage: 'radial-gradient(#B8955A 1px, transparent 1px)',
                  backgroundSize: '20px 20px',
                  pointerEvents: 'none',
                }}
              />

              <div style={{ position: 'relative', zIndex: 2 }}>
                {/* Brand Logo & Title */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 20 }}>
                  <div
                    style={{
                      width: 52,
                      height: 52,
                      borderRadius: 14,
                      overflow: 'hidden',
                      background: '#681C2D',
                      border: '1.5px solid rgba(184,149,90,0.6)',
                      boxShadow: '0 6px 20px rgba(0,0,0,0.3)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0,
                    }}
                  >
                    <img
                      src="/images/editorial/Gemini_Generated_Image_3w4lsp3w4lsp3w4l.png"
                      alt="Mithai Box Wala Official Logo"
                      style={{ width: '100%', height: '100%', objectFit: 'contain' }}
                    />
                  </div>
                  <div>
                    <h2
                      style={{
                        fontFamily: "'Cormorant Garamond', Georgia, serif",
                        fontSize: 22,
                        fontWeight: 700,
                        color: '#fff',
                        margin: 0,
                        lineHeight: 1.15,
                      }}
                    >
                      Mithai Box Wala
                    </h2>
                    <p
                      style={{
                        fontSize: 10,
                        color: '#CBA96E',
                        letterSpacing: '.12em',
                        textTransform: 'uppercase',
                        fontWeight: 600,
                        margin: '3px 0 0',
                      }}
                    >
                      by Ajay Packers · Est. 1984
                    </p>
                  </div>
                </div>

                <p
                  style={{
                    fontSize: 13.5,
                    color: 'rgba(250,247,240,0.85)',
                    lineHeight: 1.6,
                    margin: '0 0 24px',
                    fontStyle: 'italic',
                    borderLeft: '2px solid #B8955A',
                    paddingLeft: 12,
                  }}
                >
                  "The Perfection of Your Sweets, Paired with Our Ultimate Packaging."
                </p>

                {/* Secondary Visual Reference Feature Card */}
                <div
                  style={{
                    background: 'rgba(255,255,255,0.06)',
                    borderRadius: 16,
                    padding: 10,
                    border: '1px solid rgba(184,149,90,0.3)',
                    boxShadow: '0 8px 24px rgba(0,0,0,0.2)',
                    marginBottom: 20,
                  }}
                >
                  <div
                    style={{
                      height: 140,
                      borderRadius: 12,
                      overflow: 'hidden',
                      position: 'relative',
                      background: '#4A1420',
                    }}
                  >
                    <img
                      src="/images/editorial/Gemini_Generated_Image_jbsl4ljbsl4ljbsl.png"
                      alt="Luxury Mithai Box Packaging Presentation"
                      style={{
                        width: '100%',
                        height: '100%',
                        objectFit: 'cover',
                      }}
                    />
                    <div
                      style={{
                        position: 'absolute',
                        inset: 0,
                        background: 'linear-gradient(to top, rgba(36,33,31,0.8) 0%, transparent 60%)',
                      }}
                    />
                    <span
                      style={{
                        position: 'absolute',
                        bottom: 8,
                        left: 10,
                        right: 10,
                        fontSize: 10.5,
                        fontWeight: 600,
                        color: '#FAF7F0',
                        letterSpacing: '.04em',
                      }}
                    >
                      ✦ Master-crafted festive collections
                    </span>
                  </div>
                </div>
              </div>

              {/* Trust bullet points */}
              <div style={{ position: 'relative', zIndex: 2 }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  {[
                    '40 Years Manufacturing Heritage in Mirzapur',
                    'Direct Wholesale & Custom Logo Foil Stamping',
                    '100% Certified Food-Grade Safe Materials',
                  ].map((text) => (
                    <div key={text} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <span style={{ color: '#CBA96E', fontSize: 13 }}>✦</span>
                      <span style={{ fontSize: 11.5, color: 'rgba(250,247,240,0.8)' }}>{text}</span>
                    </div>
                  ))}
                </div>
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
              }}
            >
              <div>
                {/* Mobile Header (shown only on small screens) */}
                <div
                  className="auth-mobile-header"
                  style={{
                    padding: '24px 20px 16px',
                    textAlign: 'center',
                    background: 'linear-gradient(135deg, #4A1420 0%, #681C2D 100%)',
                    color: '#FAF7F0',
                  }}
                >
                  <div
                    style={{
                      width: 50,
                      height: 50,
                      borderRadius: 12,
                      overflow: 'hidden',
                      margin: '0 auto 10px',
                      background: '#681C2D',
                      border: '1.5px solid rgba(184,149,90,0.5)',
                    }}
                  >
                    <img
                      src="/images/editorial/Gemini_Generated_Image_3w4lsp3w4lsp3w4l.png"
                      alt="Mithai Box Wala Official Logo"
                      style={{ width: '100%', height: '100%', objectFit: 'contain' }}
                    />
                  </div>
                  <h1
                    style={{
                      fontFamily: "'Cormorant Garamond', Georgia, serif",
                      fontSize: 22,
                      fontWeight: 700,
                      margin: 0,
                    }}
                  >
                    {BUSINESS.brand}
                  </h1>
                  <p style={{ fontSize: 11, color: '#CBA96E', margin: '2px 0 0', textTransform: 'uppercase' }}>
                    by Ajay Packers · Est. 1984
                  </p>
                </div>

                {/* Tab switcher */}
                {step === 'form' && (
                  <div
                    style={{
                      display: 'flex',
                      background: C.ivory,
                      borderBottom: `1px solid ${C.beige}`,
                    }}
                  >
                {(['login', 'signup'] as const).map(t => (
                  <button key={t} onClick={() => switchMode(t)} style={{
                    flex: 1, padding: '16px 0', border: 'none', cursor: 'pointer',
                    fontSize: 13.5, fontWeight: 700, letterSpacing: '.03em',
                    textTransform: 'capitalize',
                    background: mode === t ? '#fff' : 'transparent',
                    color: mode === t ? C.burgundy : C.muted,
                    borderBottom: mode === t ? `2px solid ${C.burgundy}` : '2px solid transparent',
                    transition: 'all 0.25s ease',
                  }}>
                    {t === 'login' ? '🔑 Sign In' : '✨ Create Account'}
                  </button>
                ))}
              </div>
            )}

            {/* ── STEP 1: FORM ── */}
            {step === 'form' && (
              <form onSubmit={sendOtp} className="fade-in" style={{ padding: '28px 28px 20px' }}>
                {mode === 'signup' && (
                  <>
                    <div style={{ marginBottom: 14 }}>
                      <label style={{ display: 'block', fontSize: 11.5, fontWeight: 700, color: C.charcoal, marginBottom: 6, letterSpacing: '.04em', textTransform: 'uppercase' }}>
                        Full Name
                      </label>
                      <div style={{ position: 'relative' }}>
                        <User size={16} color={C.muted} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)' }} />
                        <input
                          type="text" required value={name} onChange={e => setName(e.target.value)}
                          placeholder="Ajay Kumar" style={inputStyle}
                          onFocus={e => { e.target.style.borderColor = C.gold; e.target.style.boxShadow = `0 0 0 3px rgba(184,149,90,0.12)`; }}
                          onBlur={e => { e.target.style.borderColor = C.border; e.target.style.boxShadow = 'none'; }}
                        />
                      </div>
                    </div>
                    <div style={{ marginBottom: 14 }}>
                      <label style={{ display: 'block', fontSize: 11.5, fontWeight: 700, color: C.charcoal, marginBottom: 6, letterSpacing: '.04em', textTransform: 'uppercase' }}>
                        Phone / WhatsApp
                      </label>
                      <div style={{ position: 'relative' }}>
                        <Phone size={16} color={C.muted} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)' }} />
                        <input
                          type="tel" value={phone} onChange={e => setPhone(e.target.value)}
                          placeholder="+91 98765 43210" style={inputStyle}
                          onFocus={e => { e.target.style.borderColor = C.gold; e.target.style.boxShadow = `0 0 0 3px rgba(184,149,90,0.12)`; }}
                          onBlur={e => { e.target.style.borderColor = C.border; e.target.style.boxShadow = 'none'; }}
                        />
                      </div>
                    </div>
                    <div style={{ marginBottom: 14 }}>
                      <label style={{ display: 'block', fontSize: 11.5, fontWeight: 700, color: C.charcoal, marginBottom: 6, letterSpacing: '.04em', textTransform: 'uppercase' }}>
                        Business / Shop Name <span style={{ fontWeight: 400, color: C.muted }}>(optional)</span>
                      </label>
                      <div style={{ position: 'relative' }}>
                        <Building2 size={16} color={C.muted} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)' }} />
                        <input
                          type="text" value={company} onChange={e => setCompany(e.target.value)}
                          placeholder="Sweet House, Mirzapur" style={inputStyle}
                          onFocus={e => { e.target.style.borderColor = C.gold; e.target.style.boxShadow = `0 0 0 3px rgba(184,149,90,0.12)`; }}
                          onBlur={e => { e.target.style.borderColor = C.border; e.target.style.boxShadow = 'none'; }}
                        />
                      </div>
                    </div>
                  </>
                )}

                <div style={{ marginBottom: 20 }}>
                  <label style={{ display: 'block', fontSize: 11.5, fontWeight: 700, color: C.charcoal, marginBottom: 6, letterSpacing: '.04em', textTransform: 'uppercase' }}>
                    Email Address
                  </label>
                  <div style={{ position: 'relative' }}>
                    <Mail size={16} color={C.muted} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)' }} />
                    <input
                      type="email" required value={email} onChange={e => setEmail(e.target.value)}
                      placeholder="you@example.com" style={inputStyle}
                      onFocus={e => { e.target.style.borderColor = C.gold; e.target.style.boxShadow = `0 0 0 3px rgba(184,149,90,0.12)`; }}
                      onBlur={e => { e.target.style.borderColor = C.border; e.target.style.boxShadow = 'none'; }}
                    />
                  </div>
                  <p style={{ fontSize: 11.5, color: C.muted, margin: '6px 0 0' }}>
                    We'll send a one-time code — no password needed.
                  </p>
                </div>

                {error && (
                  <div className="scale-in" style={{
                    display: 'flex', alignItems: 'center', gap: 8, padding: '10px 14px',
                    background: '#FFF1F2', border: '1.5px solid #FECDD3', borderRadius: 10,
                    marginBottom: 16, fontSize: 12.5, color: '#9F1239',
                  }}>
                    <AlertCircle size={15} style={{ flexShrink: 0 }} />
                    {error}
                  </div>
                )}

                <button type="submit" disabled={loading} style={{
                  width: '100%', padding: '14px', borderRadius: 12, border: 'none',
                  background: loading ? '#9CA3AF' : `linear-gradient(135deg, ${C.dark} 0%, ${C.burgundy} 60%, ${C.light} 100%)`,
                  color: '#fff', fontSize: 14.5, fontWeight: 700, cursor: loading ? 'not-allowed' : 'pointer',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                  boxShadow: loading ? 'none' : '0 6px 20px rgba(104,28,45,0.35)',
                  transition: 'all 0.3s ease', letterSpacing: '.02em',
                }}>
                  {loading
                    ? <><div className="spinner" style={{ width: 18, height: 18, border: '2.5px solid rgba(255,255,255,0.3)', borderTopColor: '#fff', borderRadius: '50%' }} /> Sending Code…</>
                    : <>{mode === 'login' ? 'Send OTP to Sign In' : 'Create Account & Get OTP'} <ArrowRight size={16} /></>
                  }
                </button>

                {mode === 'login' && (
                  <p style={{ textAlign: 'center', fontSize: 12, color: C.muted, marginTop: 14 }}>
                    New here?{' '}
                    <button type="button" onClick={() => switchMode('signup')} style={{
                      background: 'none', border: 'none', color: C.burgundy, fontWeight: 700,
                      cursor: 'pointer', fontSize: 12,
                    }}>Create a free account</button>
                  </p>
                )}
              </form>
            )}

            {/* ── STEP 2: OTP ── */}
            {step === 'otp' && (
              <div className="fade-in" style={{ padding: '32px 28px 24px' }}>
                <div style={{ textAlign: 'center', marginBottom: 24 }}>
                  <div style={{
                    width: 52, height: 52, borderRadius: 14,
                    background: `linear-gradient(135deg, ${C.ivory} 0%, ${C.beige} 100%)`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    margin: '0 auto 12px',
                    boxShadow: '0 4px 16px rgba(104,28,45,0.1)',
                    border: `1px solid ${C.beige}`,
                  }}>
                    <Sparkles size={24} color={C.burgundy} />
                  </div>
                  <h2 style={{
                    fontFamily: "'Cormorant Garamond', Georgia, serif",
                    fontSize: 22, fontWeight: 700, color: C.charcoal, margin: '0 0 6px',
                  }}>
                    Check your inbox
                  </h2>
                  <p style={{ fontSize: 13, color: C.muted, margin: 0, lineHeight: 1.5 }}>
                    6-digit code sent to<br />
                    <strong style={{ color: C.charcoal }}>{email}</strong>
                  </p>
                </div>

                {msg && (
                  <div style={{
                    padding: '9px 14px', background: '#F0FDF4', border: '1.5px solid #BBF7D0',
                    borderRadius: 10, fontSize: 12.5, color: '#166534', marginBottom: 18, textAlign: 'center',
                  }}>
                    ✅ {msg}
                  </div>
                )}

                {/* 6 OTP boxes */}
                <div style={{ display: 'flex', gap: 8, justifyContent: 'center', marginBottom: 20 }}>
                  {digits.map((d, i) => (
                    <input
                      key={i}
                      ref={el => { refs.current[i] = el; }}
                      type="text" inputMode="numeric" maxLength={1}
                      value={d}
                      onChange={e => handleDigit(i, e.target.value)}
                      onKeyDown={e => handleKeyDown(i, e)}
                      className={d ? 'otp-pop' : ''}
                      style={{
                        width: 48, height: 56, textAlign: 'center', fontSize: 22, fontWeight: 800,
                        border: d ? `2px solid ${C.burgundy}` : `1.5px solid ${C.border}`,
                        borderRadius: 12,
                        background: d ? '#fff' : C.ivory,
                        color: C.burgundy, outline: 'none',
                        boxShadow: d ? `0 4px 14px rgba(104,28,45,0.15)` : 'none',
                        transition: 'all 0.2s cubic-bezier(0.16,1,0.3,1)',
                        transform: d ? 'scale(1.04)' : 'scale(1)',
                      }}
                    />
                  ))}
                </div>

                {error && (
                  <div className="scale-in" style={{
                    display: 'flex', alignItems: 'center', gap: 8, padding: '10px 14px',
                    background: '#FFF1F2', border: '1.5px solid #FECDD3', borderRadius: 10,
                    marginBottom: 14, fontSize: 12.5, color: '#9F1239',
                  }}>
                    <AlertCircle size={15} style={{ flexShrink: 0 }} /> {error}
                  </div>
                )}

                <button
                  onClick={() => verifyOtp()} disabled={loading || digits.some(d => !d)}
                  style={{
                    width: '100%', padding: '14px', borderRadius: 12, border: 'none',
                    background: (loading || digits.some(d => !d))
                      ? '#E5E7EB'
                      : `linear-gradient(135deg, ${C.dark} 0%, ${C.burgundy} 60%, ${C.light} 100%)`,
                    color: (loading || digits.some(d => !d)) ? '#9CA3AF' : '#fff',
                    fontSize: 14.5, fontWeight: 700,
                    cursor: (loading || digits.some(d => !d)) ? 'not-allowed' : 'pointer',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                    boxShadow: (loading || digits.some(d => !d)) ? 'none' : '0 6px 20px rgba(104,28,45,0.3)',
                    transition: 'all 0.25s ease',
                  }}
                >
                  {loading
                    ? <><div className="spinner" style={{ width: 18, height: 18, border: '2.5px solid rgba(255,255,255,0.3)', borderTopColor: '#fff', borderRadius: '50%' }} /> Verifying…</>
                    : <>Verify & Continue <ArrowRight size={16} /></>
                  }
                </button>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 16 }}>
                  <button onClick={() => { setStep('form'); setError(''); setDigits(['','','','','','']); }} style={{
                    background: 'none', border: 'none', color: C.muted, fontSize: 12.5,
                    cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4,
                  }}>
                    ← Change email
                  </button>
                  {cooldown > 0
                    ? <span style={{ fontSize: 12.5, color: C.muted }}>Resend in <strong style={{ color: C.burgundy }}>{cooldown}s</strong></span>
                    : <button onClick={() => sendOtp()} style={{
                        background: 'none', border: 'none', color: C.gold, fontWeight: 700,
                        cursor: 'pointer', fontSize: 12.5, display: 'flex', alignItems: 'center', gap: 4,
                      }}>
                        <RefreshCw size={13} /> Resend Code
                      </button>
                  }
                </div>
              </div>
            )}

            {/* ── STEP 3: SUCCESS ── */}
            {step === 'success' && (
              <div className="fade-in" style={{ padding: '56px 32px', textAlign: 'center' }}>
                <div className="pop-check" style={{
                  width: 80, height: 80, borderRadius: '50%',
                  background: 'linear-gradient(135deg, #15803D 0%, #22C55E 100%)',
                  color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center',
                  margin: '0 auto 20px',
                  boxShadow: '0 12px 40px rgba(34,197,94,0.35)',
                }}>
                  <CheckCircle2 size={44} />
                </div>
                <h2 style={{
                  fontFamily: "'Cormorant Garamond', Georgia, serif",
                  fontSize: 26, fontWeight: 700, color: C.charcoal, margin: '0 0 8px',
                }}>
                  Welcome {name ? name.split(' ')[0] : 'back'}!
                </h2>
                <p style={{ fontSize: 14, color: C.muted, margin: 0 }}>
                  Signed in successfully. Redirecting…
                </p>
                <div style={{
                  margin: '20px auto 0', width: 40, height: 3, borderRadius: 99,
                  background: `linear-gradient(90deg, ${C.burgundy}, ${C.gold})`,
                  animation: 'shimmer 1.5s ease infinite',
                }} />
              </div>
            )}
              </div>

              {/* Footer trust strip */}
              <div style={{
                padding: '12px 24px', background: C.ivory, borderTop: `1px solid ${C.beige}`,
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 16, flexWrap: 'wrap',
              }}>
                {[
                  { icon: <ShieldCheck size={13} color="#166534" />, text: 'SSL Encrypted' },
                  { icon: <Lock size={12} color={C.gold} />, text: 'HttpOnly Session' },
                ].map(({ icon, text }) => (
                  <div key={text} style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 11, color: C.muted }}>
                    {icon} {text}
                  </div>
                ))}
              </div>
            </div>
          </div>

          <p style={{ textAlign: 'center', marginTop: 20, fontSize: 11.5, color: 'rgba(255,255,255,0.45)' }}>
            <Link href="/" style={{ color: 'rgba(255,255,255,0.5)', textDecoration: 'none' }}>← Back to store</Link>
            {' · '}
            <Link href="/terms" style={{ color: 'rgba(255,255,255,0.5)', textDecoration: 'none' }}>Terms</Link>
            {' · '}
            <Link href="/privacy-policy" style={{ color: 'rgba(255,255,255,0.5)', textDecoration: 'none' }}>Privacy</Link>
          </p>
        </div>
      </div>
    </>
  );
}
