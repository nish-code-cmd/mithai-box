'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { Sparkles, ArrowRight, ShieldCheck, Factory, Award, Truck } from 'lucide-react';
import { BUSINESS, COPY } from '@/lib/constants';

export function HeroSection() {
  return (
    <section
      className="home-hero relative text-white overflow-hidden"
      style={{
        background: 'linear-gradient(135deg, #2D0B13 0%, #4A1420 40%, #681C2D 80%, #7E2034 100%)',
        display: 'flex',
        alignItems: 'center',
      }}
    >
      {/* Decorative Dot grid */}
      <div
        className="absolute inset-0 opacity-[0.07] pointer-events-none"
        style={{ backgroundImage: 'radial-gradient(#B8955A 1px, transparent 1px)', backgroundSize: '28px 28px' }}
      />
      {/* Radial glows */}
      <div
        className="absolute right-0 top-0 w-[60%] h-full opacity-25 pointer-events-none"
        style={{ background: 'radial-gradient(ellipse at 70% 30%, #B8955A 0%, transparent 65%)' }}
      />
      <div
        className="absolute left-0 bottom-0 w-[40%] h-[60%] opacity-15 pointer-events-none"
        style={{ background: 'radial-gradient(ellipse at 20% 80%, #FAF7F0 0%, transparent 60%)' }}
      />

      <div className="site-container home-hero__inner relative z-10 w-full py-16 sm:py-24">
        <div className="grid grid-cols-1 lg:grid-cols-12 items-center gap-10 lg:gap-12">
          {/* Left: Copy & CTAs */}
          <div className="lg:col-span-7 space-y-6">
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-semibold tracking-wide"
              style={{
                background: 'rgba(184,149,90,0.18)',
                color: '#CBA96E',
                border: '1px solid rgba(184,149,90,0.3)',
              }}
            >
              <Sparkles size={13} className="text-[#CBA96E]" />
              <span>40 Years of Packaging Craftsmanship · Est. 1984</span>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 22 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="font-display text-4xl sm:text-5xl lg:text-6xl font-bold leading-[1.1] tracking-tight"
              style={{ color: '#FAF7F0' }}
            >
              Every Sweet Deserves a{' '}
              <span
                style={{
                  background: 'linear-gradient(135deg, #FAF7F0 20%, #CBA96E 60%, #B8955A 100%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                }}
              >
                Beautiful Beginning.
              </span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 22 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="text-base sm:text-lg max-w-xl leading-relaxed"
              style={{ color: 'rgba(250,247,240,0.85)' }}
            >
              {COPY.heroSubtext} Handcrafted rigid mithai boxes, dry fruit hampers, and custom branded packaging directly from Ajay Packers, Mirzapur.
            </motion.p>

            {/* CTAs */}
            <motion.div
              initial={{ opacity: 0, y: 22 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="flex flex-wrap items-center gap-4 pt-2"
            >
              <Link
                href="/products"
                className="btn btn-gold group"
                style={{
                  padding: '14px 28px',
                  borderRadius: 14,
                  fontSize: 15,
                  fontWeight: 700,
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 8,
                }}
              >
                <span>{COPY.heroPrimaryBtn}</span>
                <ArrowRight size={16} className="transition-transform group-hover:translate-x-1" />
              </Link>

              <Link
                href="/wholesale"
                className="btn btn-ghost"
                style={{
                  padding: '14px 28px',
                  borderRadius: 14,
                  fontSize: 15,
                  fontWeight: 600,
                }}
              >
                <span>{COPY.heroSecondaryBtn}</span>
              </Link>
            </motion.div>

            {/* Trust bullet strip */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.7, delay: 0.4 }}
              className="grid grid-cols-2 sm:grid-cols-3 gap-4 pt-4 border-t border-white/10"
            >
              {[
                { icon: Factory, label: 'Direct Manufacturer' },
                { icon: ShieldCheck, label: 'Food-Grade Certified' },
                { icon: Truck, label: 'Pan-India Dispatch' },
              ].map(({ icon: Icon, label }) => (
                <div key={label} className="flex items-center gap-2">
                  <Icon size={15} className="text-[#CBA96E] flex-shrink-0" />
                  <span className="text-xs text-white/80 font-medium">{label}</span>
                </div>
              ))}
            </motion.div>
          </div>

          {/* Right: Featured Hero Visual Showcase */}
          <motion.div
            initial={{ opacity: 0, scale: 0.94 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.7, delay: 0.2 }}
            className="lg:col-span-5 relative"
          >
            <div
              className="relative rounded-3xl p-3 sm:p-4 overflow-hidden"
              style={{
                background: 'rgba(255,255,255,0.06)',
                backdropFilter: 'blur(16px)',
                border: '1.5px solid rgba(184,149,90,0.35)',
                boxShadow: '0 24px 60px rgba(0,0,0,0.4), 0 0 40px rgba(184,149,90,0.15)',
              }}
            >
              <div
                className="relative rounded-2xl overflow-hidden aspect-[4/3] sm:aspect-[16/11]"
                style={{ background: '#3A0D18' }}
              >
                <img
                  src="/images/editorial/Gemini_Generated_Image_jbsl4ljbsl4ljbsl.png"
                  alt="Luxury Handcrafted Sweet Box by Mithai Box Wala"
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />
                <div
                  className="absolute inset-0"
                  style={{
                    background: 'linear-gradient(to top, rgba(36,33,31,0.85) 0%, rgba(36,33,31,0.1) 50%, transparent 100%)',
                  }}
                />

                {/* Floating Badge in image */}
                <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between text-white">
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-[#CBA96E] block">
                      Signature Collection
                    </span>
                    <h3 className="font-display text-lg font-bold">Royal Festive Rigid Box</h3>
                  </div>
                  <span
                    className="px-3 py-1 rounded-full text-xs font-bold text-white shadow-md"
                    style={{ background: 'linear-gradient(135deg, #681C2D, #8B2B3F)', border: '1px solid rgba(184,149,90,0.4)' }}
                  >
                    Custom Printing
                  </span>
                </div>
              </div>

              {/* Bottom stats ribbon */}
              <div className="grid grid-cols-3 gap-2 mt-3 pt-3 border-t border-white/10 text-center">
                <div>
                  <div className="text-sm font-bold text-[#CBA96E]">40+</div>
                  <div className="text-[10px] text-white/70">Designs</div>
                </div>
                <div className="border-x border-white/10">
                  <div className="text-sm font-bold text-[#CBA96E]">500+</div>
                  <div className="text-[10px] text-white/70">Min Bulk MOQ</div>
                </div>
                <div>
                  <div className="text-sm font-bold text-[#CBA96E]">100%</div>
                  <div className="text-[10px] text-white/70">Food Safe</div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
