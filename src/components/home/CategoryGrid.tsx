'use client';

import React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';

interface CategoryGridProps {
  categories: readonly { name: string; slug: string; emoji: string }[];
}

export function CategoryGrid({ categories }: CategoryGridProps) {
  return (
    <div className="category-grid grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3 sm:gap-4">
      {categories.map((cat, i) => (
        <motion.div
          key={cat.slug}
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.4, delay: i * 0.04 }}
        >
          <Link
            href={`/categories/${cat.slug}`}
            className="category-card group relative bg-white rounded-2xl p-4 sm:p-5 flex flex-col items-center text-center justify-between h-full border border-[#EDE4D6] hover:border-[#B8955A] hover:shadow-lg transition-all duration-300 block"
            style={{
              textDecoration: 'none',
            }}
          >
            <div
              className="w-14 h-14 rounded-2xl flex items-center justify-center text-2xl mb-3 transition-transform duration-300 group-hover:scale-110"
              style={{
                background: 'linear-gradient(135deg, #FAF7F0 0%, #EDE4D6 100%)',
                border: '1px solid rgba(184,149,90,0.2)',
              }}
            >
              {cat.emoji}
            </div>

            <div>
              <h3
                className="font-display text-sm sm:text-base font-semibold leading-tight transition-colors duration-200 group-hover:text-[#681C2D]"
                style={{ color: '#24211F' }}
              >
                {cat.name}
              </h3>
              <span className="text-[11px] font-semibold text-[#B8955A] mt-1 inline-flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                Explore <ArrowRight size={10} />
              </span>
            </div>
          </Link>
        </motion.div>
      ))}
    </div>
  );
}
