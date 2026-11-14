'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Lock, Mail, ShieldAlert, ArrowRight, AlertCircle, Eye, EyeOff } from 'lucide-react';

const CSS = `
@keyframes fadeSlideUp {
  from { opacity: 0; transform: translateY(32px); }
  to   { opacity: 1; transform: translateY(0); }
}
@keyframes spin { to { transform: rotate(360deg); } }
@keyframes gradientShift {
  0%   { background-position: 0% 50%; }
  50%  { background-position: 100% 50%; }
  100% { background-position: 0% 50%; }
}
@keyframes pulseGlow {
  0%, 100% { box-shadow: 0 0 0 0 rgba(184,149,90,0.3); }
  50%       { box-shadow: 0 0 0 8px rgba(184,149,90,0); }
}
.admin-card { animation: fadeSlideUp 0.5s cubic-bezier(0.16,1,0.3,1) both; }
.spinner { animation: spin 0.9s linear infinite; }
.gradient-bg {
  background: linear-gradient(-45deg, #0D0806, #1A100D, #24211F, #1A100D);
  background-size: 400% 400%;
  animation: gradientShift 10s ease infinite;
}
.logo-pulse { animation: pulseGlow 2.5s ease-in-out infinite; }
`;

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail]       = useState('');
  const [password, setPassword] = useState('');
  const [showPw, setShowPw]     = useState(false);
  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState('');
  const [attempts, setAttempts] = useState(0);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true); setError('');
    try {
      const r = await fetch('/api/admin/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim().toLowerCase(), password }),
      });
      const d = await r.json();
      if (!d.success) {
        setAttempts(a => a + 1);
        throw new Error(d.error || 'Invalid credentials');
      }
      router.push('/admin');
      router.refresh();
    } catch (err: any) { setError(err.message); }
    finally { setLoading(false); }
  };

  const C = {
    burgundy: '#681C2D', gold: '#B8955A', goldLight: '#CBA96E',
    ivory: '#FAF7F0', beige: '#EDE4D6', charcoal: '#24211F',
    border: 'rgba(255,255,255,0.1)',
  };

  return (
    <>
      <style>{CSS}</style>
      <div className="gradient-bg" style={{
        minHeight: '100vh', display: 'flex', alignItems: 'center',
        justifyContent: 'center', padding: '24px 16px', position: 'relative', overflow: 'hidden',
      }}>
        {/* Grid pattern */}
        <div style={{
          position: 'absolute', inset: 0, opacity: 0.04,
          backgroundImage: `
            linear-gradient(rgba(184,149,90,0.5) 1px, transparent 1px),
            linear-gradient(90deg, rgba(184,149,90,0.5) 1px, transparent 1px)
          `,
          backgroundSize: '40px 40px',
        }} />
        {/* Top glow */}
        <div style={{
          position: 'absolute', top: '-20%', left: '50%', transform: 'translateX(-50%)',
          width: 500, height: 300,
          background: 'radial-gradient(ellipse, rgba(104,28,45,0.3) 0%, transparent 70%)',
          pointerEvents: 'none',
        }} />

        <div className="admin-card" style={{ width: '100%', maxWidth: 420, position: 'relative', zIndex: 1 }}>

          {/* Logo area */}
          <div style={{ textAlign: 'center', marginBottom: 28 }}>
            <div
              className="logo-pulse"
              style={{
                width: 72, height: 72, borderRadius: 20, margin: '0 auto 16px',
                background: `linear-gradient(135deg, ${C.burgundy} 0%, #4A1420 100%)`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                border: `1px solid rgba(184,149,90,0.35)`,
              }}
            >
              <span style={{
                fontFamily: "'Cormorant Garamond', Georgia, serif",
                fontSize: 26, fontWeight: 800, color: C.gold, letterSpacing: '-0.02em',
              }}>MB</span>
            </div>
            <h1 style={{
              fontFamily: "'Cormorant Garamond', Georgia, serif",
              fontSize: 24, fontWeight: 700, color: '#fff', margin: '0 0 6px',
            }}>
              Admin Dashboard
            </h1>
            <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.45)', margin: 0 }}>
              Mithai Box Wala · Ajay Packers, Mirzapur
            </p>
          </div>

          {/* Card */}
          <div style={{
            background: 'rgba(255,255,255,0.03)',
            backdropFilter: 'blur(20px)',
            border: '1px solid rgba(255,255,255,0.08)',
            borderRadius: 24,
            overflow: 'hidden',
            boxShadow: '0 32px 80px rgba(0,0,0,0.5)',
          }}>
            <div style={{ padding: '32px 32px 28px' }}>

              {error && (
                <div style={{
                  display: 'flex', alignItems: 'flex-start', gap: 10, padding: '12px 14px',
                  background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)',
                  borderRadius: 10, marginBottom: 20, fontSize: 13, color: '#FCA5A5',
                }}>
                  <AlertCircle size={15} style={{ marginTop: 1, flexShrink: 0 }} />
                  <div>
                    {error}
                    {attempts >= 3 && (
                      <div style={{ marginTop: 4, fontSize: 11.5, color: 'rgba(252,165,165,0.7)' }}>
                        Too many attempts? Contact the system administrator.
                      </div>
                    )}
                  </div>
                </div>
              )}

              <form onSubmit={handleLogin}>
                {/* Email */}
                <div style={{ marginBottom: 16 }}>
                  <label style={{
                    display: 'block', fontSize: 11, fontWeight: 700,
                    color: 'rgba(255,255,255,0.5)', marginBottom: 7,
                    letterSpacing: '.08em', textTransform: 'uppercase',
                  }}>
                    Admin Email
                  </label>
                  <div style={{ position: 'relative' }}>
                    <Mail size={15} color="rgba(255,255,255,0.3)"
                      style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)' }} />
                    <input
                      type="email" required value={email}
                      onChange={e => setEmail(e.target.value)}
                      placeholder="admin@mithaiboxes.com"
                      style={{
                        width: '100%', padding: '13px 14px 13px 42px',
                        background: 'rgba(255,255,255,0.05)',
                        border: '1px solid rgba(255,255,255,0.1)',
                        borderRadius: 10, color: '#fff', fontSize: 14, outline: 'none',
                        transition: 'border 0.2s, box-shadow 0.2s',
                      }}
                      onFocus={e => { e.target.style.borderColor = `rgba(184,149,90,0.6)`; e.target.style.boxShadow = `0 0 0 3px rgba(184,149,90,0.1)`; }}
                      onBlur={e => { e.target.style.borderColor = 'rgba(255,255,255,0.1)'; e.target.style.boxShadow = 'none'; }}
                    />
                  </div>
                </div>

                {/* Password */}
                <div style={{ marginBottom: 24 }}>
                  <label style={{
                    display: 'block', fontSize: 11, fontWeight: 700,
                    color: 'rgba(255,255,255,0.5)', marginBottom: 7,
                    letterSpacing: '.08em', textTransform: 'uppercase',
                  }}>
                    Password
                  </label>
                  <div style={{ position: 'relative' }}>
                    <Lock size={15} color="rgba(255,255,255,0.3)"
                      style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)' }} />
                    <input
                      type={showPw ? 'text' : 'password'} required value={password}
                      onChange={e => setPassword(e.target.value)}
                      placeholder="Enter admin password"
                      style={{
                        width: '100%', padding: '13px 44px 13px 42px',
                        background: 'rgba(255,255,255,0.05)',
                        border: '1px solid rgba(255,255,255,0.1)',
                        borderRadius: 10, color: '#fff', fontSize: 14, outline: 'none',
                        transition: 'border 0.2s, box-shadow 0.2s',
                      }}
                      onFocus={e => { e.target.style.borderColor = `rgba(184,149,90,0.6)`; e.target.style.boxShadow = `0 0 0 3px rgba(184,149,90,0.1)`; }}
                      onBlur={e => { e.target.style.borderColor = 'rgba(255,255,255,0.1)'; e.target.style.boxShadow = 'none'; }}
                    />
                    <button type="button" onClick={() => setShowPw(p => !p)} style={{
                      position: 'absolute', right: 14, top: '50%', transform: 'translateY(-50%)',
                      background: 'none', border: 'none', cursor: 'pointer', padding: 0,
                      color: 'rgba(255,255,255,0.4)',
                    }}>
                      {showPw ? <EyeOff size={15} /> : <Eye size={15} />}
                    </button>
                  </div>
                </div>

                <button type="submit" disabled={loading} style={{
                  width: '100%', padding: '14px', borderRadius: 12, border: 'none',
                  background: loading ? 'rgba(255,255,255,0.1)' : `linear-gradient(135deg, #4A1420 0%, ${C.burgundy} 60%, #8B2B3F 100%)`,
                  color: loading ? 'rgba(255,255,255,0.4)' : '#fff',
                  fontSize: 14.5, fontWeight: 700, cursor: loading ? 'not-allowed' : 'pointer',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                  boxShadow: loading ? 'none' : '0 6px 24px rgba(104,28,45,0.4)',
                  transition: 'all 0.3s ease', letterSpacing: '.02em',
                }}>
                  {loading
                    ? <><div className="spinner" style={{ width: 18, height: 18, border: '2.5px solid rgba(255,255,255,0.2)', borderTopColor: '#fff', borderRadius: '50%' }} /> Authenticating…</>
                    : <>Sign In to Dashboard <ArrowRight size={16} /></>
                  }
                </button>
              </form>
            </div>

            {/* Footer */}
            <div style={{
              padding: '14px 32px', borderTop: '1px solid rgba(255,255,255,0.06)',
              background: 'rgba(0,0,0,0.2)',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
              fontSize: 11, color: 'rgba(255,255,255,0.3)',
            }}>
              <ShieldAlert size={13} color="#B8955A" />
              Restricted access · All actions logged in audit trail
            </div>
          </div>

          <p style={{ textAlign: 'center', marginTop: 24, fontSize: 11.5, color: 'rgba(255,255,255,0.3)' }}>
            Customer store?{' '}
            <a href="/" style={{ color: 'rgba(184,149,90,0.7)', textDecoration: 'none' }}>
              Go to Mithai Box Wala →
            </a>
          </p>
        </div>
      </div>
    </>
  );
}
