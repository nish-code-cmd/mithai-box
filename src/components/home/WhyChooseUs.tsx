'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Award, ShieldCheck, Sparkles, Truck, Factory, HeartHandshake } from 'lucide-react';
import { BUSINESS } from '@/lib/constants';

const PILLARS = [
  {
    icon: Award,
    title: '40 Years Heritage',
    description: `Manufactured by Ajay Packers in Mirzapur since 1984. Four decades of trusted box crafting expertise for premier sweet shops across India.`,
  },
  {
    icon: ShieldCheck,
    title: 'Food-Grade Certified',
    description: 'Constructed strictly with food-grade virgin boards, grease-resistant barriers, and odorless eco-friendly inks to keep your sweets fresh.',
  },
  {
    icon: Sparkles,
    title: 'Bespoke Customization',
    description: 'Precision hot-foil stamping, embossed brand logos, customized partition cavities, and luxury magnetic closures for your brand.',
  },
  {
    icon: Truck,
    title: 'Reliable Pan-India Dispatch',
    description: 'Reinforced master cartons and transport packaging ensure flawless delivery to sweet makers and retailers in all Indian states.',
  },
];

export function WhyChooseUs() {
  return (
    <section className="section-py" style={{ background: '#FAF7F0', borderTop: '1px solid #EDE4D6' }}>
      <div className="site-container">
        <div className="section-heading text-center max-w-2xl mx-auto mb-12">
          <div
            className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-semibold mb-4"
            style={{ background: 'rgba(104,28,45,0.08)', color: '#681C2D' }}
          >
            <Factory size={13} />
            <span>The Manufacturer Advantage</span>
          </div>
          <h2 className="font-display text-3xl sm:text-4xl font-bold" style={{ color: '#681C2D' }}>
            Why Leading Sweet Brands Partner With Us
          </h2>
          <p className="text-sm sm:text-base mt-3" style={{ color: '#5C5855' }}>
            Direct manufacturer accountability, no trading middlemen, and unmatched quality control from raw board to finished luxury packaging.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {PILLARS.map((p, i) => {
            const Icon = p.icon;
            return (
              <motion.div
                key={p.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.45, delay: i * 0.08 }}
                className="bg-white rounded-2xl p-6 sm:p-7 border border-[#EDE4D6] hover:border-[#B8955A] hover:shadow-xl transition-all duration-300 flex flex-col justify-between"
              >
                <div>
                  <div
                    className="w-12 h-12 rounded-xl flex items-center justify-center mb-5"
                    style={{ background: 'linear-gradient(135deg, #FAF7F0 0%, #EDE4D6 100%)', border: '1px solid rgba(184,149,90,0.25)' }}
                  >
                    <Icon size={22} className="text-[#681C2D]" />
                  </div>
                  <h3 className="font-display text-lg font-bold mb-2.5" style={{ color: '#24211F' }}>
                    {p.title}
                  </h3>
                  <p className="text-xs sm:text-sm leading-relaxed" style={{ color: '#5C5855' }}>
                    {p.description}
                  </p>
                </div>

                <div className="mt-6 pt-4 border-t border-[#EDE4D6] flex items-center gap-2 text-[11px] font-semibold text-[#B8955A]">
                  <Sparkles size={11} />
                  <span>Guaranteed Standard</span>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
