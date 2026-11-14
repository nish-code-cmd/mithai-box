'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Lock, Mail, ShieldAlert, ArrowRight, AlertCircle, Eye, EyeOff, CheckCircle2, Shield } from 'lucide-react';

const CSS = `
@keyframes adminFadeUp {
  from { opacity: 0; transform: translateY(24px) scale(0.98); }
  to   { opacity: 1; transform: translateY(0) scale(1); }
}
@keyframes adminSpin { to { transform: rotate(360deg); } }
@keyframes adminPulseGlow {
  0%, 100% { box-shadow: 0 0 0 0 rgba(184,149,90,0.35); }
  50%       { box-shadow: 0 0 0 10px rgba(184,149,90,0); }
}

.admin-card { animation: adminFadeUp 0.45s cubic-bezier(0.16, 1, 0.3, 1) both; }
.admin-spinner { animation: adminSpin 0.85s linear infinite; }
.admin-logo-pulse { animation: adminPulseGlow 3s ease-in-out infinite; }

.admin-input {
  width: 100%;
  padding: 13px 44px 13px 42px;
  background: rgba(255,255,255,0.06);
  border: 1px solid rgba(255,255,255,0.12);
  border-radius: 12px;
  color: #FAF7F0;
  font-size: 14px;
  outline: none;
  transition: border-color 0.2s ease, box-shadow 0.2s ease;
  box-sizing: border-box;
}
.admin-input:focus {
  border-color: #B8955A;
  box-shadow: 0 0 0 3px rgba(184,149,90,0.15);
  background: rgba(255,255,255,0.09);
}
`;

export default function AdminLoginPage() {
  const [email, setEmail]       = useState('');
  const [password, setPassword] = useState('');
  const [showPw, setShowPw]     = useState(false);
  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState('');
  const [success, setSuccess]   = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setError('Please enter your admin credentials.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const r = await fetch('/api/admin/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim().toLowerCase(), password }),
      });
      const d = await r.json();

      if (!r.ok || !d.success) {
        throw new Error(d.error || 'Invalid admin credentials. Please verify your email and password.');
      }

      setSuccess(true);
      setTimeout(() => {
        window.location.href = '/admin';
      }, 800);
    } catch (err: any) {
      setError(err.message || 'Authentication failed.');
    } finally {
      setLoading(false);
    }
  };

  const fillMasterCredentials = () => {
    setEmail('mithaiboxwala@gmail.com');
    setPassword('MithaiAdmin2024!');
    setError('');
  };

  return (
    <>
      <style>{CSS}</style>

      <div style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '32px 16px',
        position: 'relative',
        overflow: 'hidden',
        background: 'linear-gradient(135deg, #11080A 0%, #200B11 40%, #2B0D15 70%, #15060A 100%)',
      }}>
        {/* Decorative Grid & Radial Glows */}
        <div style={{
          position: 'absolute', inset: 0, opacity: 0.05,
          backgroundImage: `
            linear-gradient(rgba(184,149,90,0.5) 1px, transparent 1px),
            linear-gradient(90deg, rgba(184,149,90,0.5) 1px, transparent 1px)
          `,
          backgroundSize: '40px 40px', pointerEvents: 'none',
        }} />
        <div style={{
          position: 'absolute', top: '-15%', left: '50%', transform: 'translateX(-50%)',
          width: 600, height: 350,
          background: 'radial-gradient(ellipse, rgba(104,28,45,0.4) 0%, transparent 70%)',
          pointerEvents: 'none',
        }} />

        <div className="admin-card" style={{ width: '100%', maxWidth: 440, position: 'relative', zIndex: 1 }}>

          {/* Logo Area */}
          <div style={{ textAlign: 'center', marginBottom: 24 }}>
            <div
              className="admin-logo-pulse"
              style={{
                width: 72, height: 72, borderRadius: 20, margin: '0 auto 16px',
                overflow: 'hidden',
                background: '#681C2D',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                border: '1.5px solid rgba(184,149,90,0.6)',
                boxShadow: '0 8px 30px rgba(0,0,0,0.4)',
              }}
            >
              <img
                src="/images/editorial/Gemini_Generated_Image_3w4lsp3w4lsp3w4l.png"
                alt="Mithai Box Wala Logo"
                style={{ width: '100%', height: '100%', objectFit: 'contain' }}
              />
            </div>
            <h1 style={{
              fontFamily: "'Cormorant Garamond', Georgia, serif",
              fontSize: 26, fontWeight: 700, color: '#FAF7F0', margin: '0 0 6px',
            }}>
              Super Admin Portal
            </h1>
            <p style={{ fontSize: 12.5, color: '#CBA96E', margin: 0, letterSpacing: '.06em', textTransform: 'uppercase' }}>
              Mithai Box Wala · Ajay Packers
            </p>
          </div>

          {/* Card */}
          <div style={{
            background: 'rgba(255,255,255,0.04)',
            backdropFilter: 'blur(20px)',
            border: '1px solid rgba(184,149,90,0.25)',
            borderRadius: 22,
            overflow: 'hidden',
            boxShadow: '0 32px 80px rgba(0,0,0,0.6), 0 0 40px rgba(104,28,45,0.2)',
          }}>
            <div style={{ padding: '32px 30px 24px' }}>

              {error && (
                <div style={{
                  display: 'flex', alignItems: 'center', gap: 10, padding: '12px 14px',
                  background: 'rgba(239,68,68,0.12)', border: '1px solid rgba(239,68,68,0.3)',
                  borderRadius: 12, marginBottom: 20, fontSize: 13, color: '#FCA5A5',
                }}>
                  <AlertCircle size={16} style={{ flexShrink: 0 }} />
                  <div>{error}</div>
                </div>
              )}

              {success && (
                <div style={{
                  display: 'flex', alignItems: 'center', gap: 10, padding: '12px 14px',
                  background: 'rgba(34,197,94,0.12)', border: '1px solid rgba(34,197,94,0.3)',
                  borderRadius: 12, marginBottom: 20, fontSize: 13, color: '#86EFAC',
                }}>
                  <CheckCircle2 size={16} style={{ flexShrink: 0 }} />
                  <div>Authenticated successfully. Redirecting to dashboard…</div>
                </div>
              )}

              <form onSubmit={handleLogin}>
                {/* Admin Email */}
                <div style={{ marginBottom: 18 }}>
                  <label style={{
                    display: 'block', fontSize: 11, fontWeight: 700,
                    color: '#CBA96E', marginBottom: 7,
                    letterSpacing: '.08em', textTransform: 'uppercase',
                  }}>
                    Admin Email
                  </label>
                  <div style={{ position: 'relative' }}>
                    <Mail size={15} color="rgba(250,247,240,0.4)"
                      style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }} />
                    <input
                      className="admin-input"
                      type="email"
                      required
                      autoComplete="email"
                      value={email}
                      onChange={e => setEmail(e.target.value)}
                      placeholder="mithaiboxwala@gmail.com"
                    />
                  </div>
                </div>

                {/* Password */}
                <div style={{ marginBottom: 22 }}>
                  <label style={{
                    display: 'block', fontSize: 11, fontWeight: 700,
                    color: '#CBA96E', marginBottom: 7,
                    letterSpacing: '.08em', textTransform: 'uppercase',
                  }}>
                    Admin Password
                  </label>
                  <div style={{ position: 'relative' }}>
                    <Lock size={15} color="rgba(250,247,240,0.4)"
                      style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }} />
                    <input
                      className="admin-input"
                      type={showPw ? 'text' : 'password'}
                      required
                      autoComplete="current-password"
                      value={password}
                      onChange={e => setPassword(e.target.value)}
                      placeholder="••••••••••••"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPw(p => !p)}
                      style={{
                        position: 'absolute', right: 14, top: '50%', transform: 'translateY(-50%)',
                        background: 'none', border: 'none', cursor: 'pointer', padding: 0,
                        color: 'rgba(250,247,240,0.5)',
                      }}
                    >
                      {showPw ? <EyeOff size={15} /> : <Eye size={15} />}
                    </button>
                  </div>
                </div>

                {/* Submit button */}
                <button
                  type="submit"
                  disabled={loading || success}
                  style={{
                    width: '100%', padding: '14px', borderRadius: 12, border: 'none',
                    background: loading ? 'rgba(255,255,255,0.1)' : 'linear-gradient(135deg, #681C2D 0%, #8B2B3F 60%, #B8955A 100%)',
                    color: '#FAF7F0',
                    fontSize: 14.5, fontWeight: 700, cursor: loading ? 'not-allowed' : 'pointer',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                    boxShadow: '0 6px 24px rgba(104,28,45,0.5)',
                    transition: 'all 0.25s ease', letterSpacing: '.02em',
                  }}
                >
                  {loading ? (
                    <><div className="admin-spinner" style={{ width: 18, height: 18, border: '2.5px solid rgba(255,255,255,0.2)', borderTopColor: '#fff', borderRadius: '50%' }} /> Authenticating…</>
                  ) : (
                    <>Sign In to Dashboard <ArrowRight size={16} /></>
                  )}
                </button>

                {/* Pre-fill helper shortcut */}
                <div style={{ textAlign: 'center', marginTop: 14 }}>
                  <button
                    type="button"
                    onClick={fillMasterCredentials}
                    style={{
                      background: 'none',
                      border: 'none',
                      color: 'rgba(184,149,90,0.8)',
                      fontSize: 11.5,
                      cursor: 'pointer',
                      textDecoration: 'underline',
                    }}
                  >
                    ⚡ Auto-fill Super Admin credentials
                  </button>
                </div>
              </form>
            </div>

            {/* Footer Notice */}
            <div style={{
              padding: '12px 24px', borderTop: '1px solid rgba(255,255,255,0.06)',
              background: 'rgba(0,0,0,0.3)',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
              fontSize: 11, color: 'rgba(250,247,240,0.45)',
            }}>
              <ShieldAlert size={13} color="#B8955A" />
              Restricted Super Admin Area · Mirzapur Factory Access
            </div>
          </div>

          {/* Quick Links */}
          <div style={{ textAlign: 'center', marginTop: 22, fontSize: 12, color: 'rgba(250,247,240,0.55)' }}>
            <Link href="/auth/login" style={{ color: '#CBA96E', textDecoration: 'none', fontWeight: 600 }}>
              ← Customer Login / Register
            </Link>
            {' · '}
            <Link href="/" style={{ color: 'rgba(250,247,240,0.6)', textDecoration: 'none' }}>
              Storefront
            </Link>
          </div>
        </div>
      </div>
    </>
  );
}
