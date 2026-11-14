'use client';

import React from 'react';
import Link from 'next/link';
import { Sparkles, ArrowRight, ShieldCheck, Factory, Truck } from 'lucide-react';
import { COPY } from '@/lib/constants';

/* Pure-CSS animations — no framer-motion, no JS-gated opacity-0 initial state */
const HERO_CSS = `
@keyframes hero-fade-up {
  from { opacity: 0; transform: translateY(20px); }
  to   { opacity: 1; transform: translateY(0); }
}
@keyframes hero-scale-in {
  from { opacity: 0; transform: scale(0.95); }
  to   { opacity: 1; transform: scale(1); }
}
@keyframes hero-float {
  0%, 100% { transform: translateY(0px); }
  50%       { transform: translateY(-6px); }
}
.hero-badge   { animation: hero-fade-up 0.5s cubic-bezier(0.16,1,0.3,1) 0.05s both; }
.hero-h1      { animation: hero-fade-up 0.6s cubic-bezier(0.16,1,0.3,1) 0.12s both; }
.hero-sub     { animation: hero-fade-up 0.6s cubic-bezier(0.16,1,0.3,1) 0.20s both; }
.hero-ctas    { animation: hero-fade-up 0.6s cubic-bezier(0.16,1,0.3,1) 0.28s both; }
.hero-trust   { animation: hero-fade-up 0.5s cubic-bezier(0.16,1,0.3,1) 0.36s both; }
.hero-visual  { animation: hero-scale-in 0.7s cubic-bezier(0.16,1,0.3,1) 0.18s both; }
.hero-float   { animation: hero-float 5s ease-in-out 1.2s infinite; }
`;

export function HeroSection() {
  return (
    <section
      className="home-hero relative text-white overflow-hidden"
      style={{
        background: 'linear-gradient(135deg, #2D0B13 0%, #4A1420 40%, #681C2D 80%, #7E2034 100%)',
        display: 'flex',
        alignItems: 'center',
        minHeight: 'min(90vh, 56rem)',
      }}
    >
      <style>{HERO_CSS}</style>

      {/* Dot-grid overlay */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage: 'radial-gradient(#B8955A 1px, transparent 1px)',
          backgroundSize: '28px 28px',
          opacity: 0.07,
        }}
      />
      {/* Gold glow — right */}
      <div
        className="absolute right-0 top-0 pointer-events-none"
        style={{
          width: '60%', height: '100%',
          background: 'radial-gradient(ellipse at 70% 30%, #B8955A 0%, transparent 65%)',
          opacity: 0.22,
        }}
      />
      {/* Ivory glow — bottom-left */}
      <div
        className="absolute left-0 bottom-0 pointer-events-none"
        style={{
          width: '40%', height: '60%',
          background: 'radial-gradient(ellipse at 20% 80%, #FAF7F0 0%, transparent 60%)',
          opacity: 0.12,
        }}
      />

      <div
        className="site-container relative z-10 w-full"
        style={{ paddingBlock: 'clamp(5rem, 10vw, 8rem)' }}
      >
        <div className="grid grid-cols-1 lg:grid-cols-12 items-center gap-10 lg:gap-12">

          {/* ── LEFT: Copy & CTAs ── */}
          <div className="lg:col-span-7 space-y-6">

            <div
              className="hero-badge inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-semibold tracking-wide"
              style={{
                background: 'rgba(184,149,90,0.18)',
                color: '#CBA96E',
                border: '1px solid rgba(184,149,90,0.3)',
              }}
            >
              <Sparkles size={13} style={{ color: '#CBA96E' }} />
              <span>40 Years of Packaging Craftsmanship · Est. 1984</span>
            </div>

            <h1
              className="hero-h1 font-display font-bold leading-[1.1] tracking-tight"
              style={{ fontSize: 'clamp(2.2rem, 5.5vw, 3.75rem)', color: '#FAF7F0' }}
            >
              Every Sweet Deserves a{' '}
              <span
                style={{
                  background: 'linear-gradient(135deg, #FAF7F0 20%, #CBA96E 60%, #B8955A 100%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text',
                }}
              >
                Beautiful Beginning.
              </span>
            </h1>

            <p
              className="hero-sub text-base sm:text-lg max-w-xl leading-relaxed"
              style={{ color: 'rgba(250,247,240,0.85)' }}
            >
              {COPY.heroSubtext} Handcrafted rigid mithai boxes, dry fruit hampers, and custom branded packaging — directly from Ajay Packers, Mirzapur.
            </p>

            <div className="hero-ctas flex flex-wrap items-center gap-4 pt-2">
              <Link
                href="/products"
                className="group inline-flex items-center gap-2 font-bold"
                style={{
                  padding: '14px 28px',
                  borderRadius: 14,
                  fontSize: 15,
                  background: 'linear-gradient(135deg, #B8955A, #CBA96E)',
                  color: '#fff',
                  boxShadow: '0 8px 28px rgba(184,149,90,0.4)',
                  textDecoration: 'none',
                  transition: 'transform 0.2s ease, box-shadow 0.2s ease',
                }}
                onMouseEnter={e => { (e.currentTarget as HTMLElement).style.transform = 'translateY(-2px)'; (e.currentTarget as HTMLElement).style.boxShadow = '0 12px 36px rgba(184,149,90,0.5)'; }}
                onMouseLeave={e => { (e.currentTarget as HTMLElement).style.transform = ''; (e.currentTarget as HTMLElement).style.boxShadow = '0 8px 28px rgba(184,149,90,0.4)'; }}
              >
                <span>{COPY.heroPrimaryBtn}</span>
                <ArrowRight size={16} style={{ transition: 'transform 0.2s ease' }} className="group-hover:translate-x-1" />
              </Link>

              <Link
                href="/wholesale"
                className="inline-flex items-center gap-2 font-semibold"
                style={{
                  padding: '13px 26px',
                  borderRadius: 14,
                  fontSize: 15,
                  background: 'rgba(255,255,255,0.08)',
                  color: '#FAF7F0',
                  border: '1.5px solid rgba(255,255,255,0.22)',
                  textDecoration: 'none',
                  transition: 'background 0.2s ease, border-color 0.2s ease',
                }}
                onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.14)'; }}
                onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.08)'; }}
              >
                <span>{COPY.heroSecondaryBtn}</span>
              </Link>
            </div>

            <div
              className="hero-trust grid grid-cols-2 sm:grid-cols-3 gap-4 pt-4"
              style={{ borderTop: '1px solid rgba(255,255,255,0.1)' }}
            >
              {[
                { icon: Factory, label: 'Direct Manufacturer' },
                { icon: ShieldCheck, label: 'Food-Grade Certified' },
                { icon: Truck, label: 'Pan-India Dispatch' },
              ].map(({ icon: Icon, label }) => (
                <div key={label} className="flex items-center gap-2">
                  <Icon size={15} className="flex-shrink-0" style={{ color: '#CBA96E' }} />
                  <span className="text-xs font-medium" style={{ color: 'rgba(255,255,255,0.80)' }}>{label}</span>
                </div>
              ))}
            </div>
          </div>

          {/* ── RIGHT: Visual ── */}
          <div className="hero-visual lg:col-span-5">
            <div
              className="relative rounded-3xl p-3 sm:p-4 overflow-hidden"
              style={{
                background: 'rgba(255,255,255,0.06)',
                backdropFilter: 'blur(16px)',
                border: '1.5px solid rgba(184,149,90,0.35)',
                boxShadow: '0 24px 60px rgba(0,0,0,0.4), 0 0 40px rgba(184,149,90,0.15)',
              }}
            >
              {/* Floating card animation wrapper */}
              <div className="hero-float">
                <div
                  className="relative rounded-2xl overflow-hidden"
                  style={{ aspectRatio: '4/3', background: '#3A0D18' }}
                >
                  <img
                    src="/images/editorial/Gemini_Generated_Image_jbsl4ljbsl4ljbsl.png"
                    alt="Luxury Handcrafted Sweet Box by Mithai Box Wala"
                    style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
                  />
                  <div
                    className="absolute inset-0"
                    style={{
                      background: 'linear-gradient(to top, rgba(36,33,31,0.85) 0%, rgba(36,33,31,0.1) 50%, transparent 100%)',
                    }}
                  />
                  {/* Badge overlay */}
                  <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between text-white">
                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-wider block" style={{ color: '#CBA96E' }}>
                        Signature Collection
                      </span>
                      <h3 className="font-display text-lg font-bold">Royal Festive Rigid Box</h3>
                    </div>
                    <span
                      className="px-3 py-1 rounded-full text-xs font-bold text-white shadow-md"
                      style={{
                        background: 'linear-gradient(135deg, #681C2D, #8B2B3F)',
                        border: '1px solid rgba(184,149,90,0.4)',
                      }}
                    >
                      Custom Printing
                    </span>
                  </div>
                </div>
              </div>

              {/* Stats ribbon */}
              <div
                className="grid grid-cols-3 gap-2 mt-3 pt-3 text-center"
                style={{ borderTop: '1px solid rgba(255,255,255,0.1)' }}
              >
                {[
                  { val: '40+', label: 'Designs' },
                  { val: '500+', label: 'Min Bulk MOQ' },
                  { val: '100%', label: 'Food Safe' },
                ].map(({ val, label }, i) => (
                  <div key={label} style={{ borderLeft: i > 0 ? '1px solid rgba(255,255,255,0.1)' : 'none' }}>
                    <div className="text-sm font-bold" style={{ color: '#CBA96E' }}>{val}</div>
                    <div className="text-[10px]" style={{ color: 'rgba(255,255,255,0.65)' }}>{label}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}
