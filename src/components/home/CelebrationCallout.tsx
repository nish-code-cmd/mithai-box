'use client';

import React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Crown, Sparkles, CheckCircle2, ArrowRight } from 'lucide-react';
import { BUSINESS } from '@/lib/constants';

export function CelebrationCallout() {
  return (
    <section className="section-py relative overflow-hidden" style={{ background: '#24211F', color: '#FAF7F0' }}>
      {/* Background radial gold sheen */}
      <div
        className="absolute top-0 right-0 w-[50%] h-full opacity-15 pointer-events-none"
        style={{ background: 'radial-gradient(circle at 80% 20%, #B8955A 0%, transparent 60%)' }}
      />

      <div className="site-container relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-center">
          {/* Visual Showcase (Secondary Reference Image) */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="lg:col-span-6 relative"
          >
            <div
              className="relative rounded-3xl overflow-hidden p-3"
              style={{
                background: 'linear-gradient(145deg, rgba(184,149,90,0.3) 0%, rgba(104,28,45,0.4) 100%)',
                border: '1.5px solid rgba(184,149,90,0.4)',
                boxShadow: '0 24px 60px rgba(0,0,0,0.5)',
              }}
            >
              <div
                className="relative rounded-2xl overflow-hidden aspect-[4/3]"
                style={{ background: '#3A0D18' }}
              >
                <img
                  src="/images/editorial/Gemini_Generated_Image_jbsl4ljbsl4ljbsl.png"
                  alt="Mithai Box Wala Premium Packaging Standard"
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />
                <div
                  className="absolute inset-0"
                  style={{
                    background: 'linear-gradient(to top, rgba(36,33,31,0.7) 0%, transparent 60%)',
                  }}
                />
                <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between">
                  <span className="text-xs font-bold text-[#CBA96E] uppercase tracking-wider flex items-center gap-1.5">
                    <Sparkles size={12} />
                    Artisan Craftsmanship
                  </span>
                  <span className="text-xs text-white/90 font-medium">
                    Ajay Packers, Mirzapur
                  </span>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Editorial Content */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="lg:col-span-6 space-y-6"
          >
            <div
              className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-semibold"
              style={{ background: 'rgba(184,149,90,0.18)', color: '#CBA96E', border: '1px solid rgba(184,149,90,0.3)' }}
            >
              <Crown size={13} />
              <span>Bespoke Luxury &amp; Heritage</span>
            </div>

            <h2 className="font-display text-3xl sm:text-4xl lg:text-5xl font-bold leading-tight" style={{ color: '#FAF7F0' }}>
              Handcrafted Packaging for Every Grand Indian Celebration
            </h2>

            <p className="text-base leading-relaxed" style={{ color: 'rgba(250,247,240,0.8)' }}>
              From weddings and Diwali gifting to luxury hotel hospitality, our boxes are precision-engineered
              with heavy-duty kappa board, embossed gold foiling, velvet trays, and magnetic snap closures.
            </p>

            <div className="space-y-3 pt-2">
              {[
                'Gold & Copper Hot Foil Stamping with Your Custom Logo',
                'Custom Compartments for Kaju Katli, Ladoos, Dry Fruits & Chocolates',
                'Durable Rigid Construction That Protects Delicate Sweets in Transit',
                'Direct Factory Rates with Pan-India Secure Logistics',
              ].map((item) => (
                <div key={item} className="flex items-start gap-3">
                  <CheckCircle2 size={16} className="text-[#CBA96E] mt-0.5 flex-shrink-0" />
                  <span className="text-sm font-medium" style={{ color: 'rgba(250,247,240,0.9)' }}>
                    {item}
                  </span>
                </div>
              ))}
            </div>

            <div className="flex flex-wrap items-center gap-4 pt-4">
              <Link
                href="/custom-packaging"
                className="btn btn-gold"
                style={{
                  padding: '12px 24px',
                  borderRadius: 12,
                  fontSize: 14,
                  fontWeight: 700,
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 8,
                }}
              >
                <span>Customize Your Box</span>
                <ArrowRight size={14} />
              </Link>

              <Link
                href="/categories/wedding-boxes"
                className="btn btn-ghost"
                style={{
                  padding: '12px 24px',
                  borderRadius: 12,
                  fontSize: 14,
                  fontWeight: 600,
                }}
              >
                <span>View Wedding Boxes</span>
              </Link>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
