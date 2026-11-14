import React from 'react';
import Link from 'next/link';
import { ArrowLeft, Package, Home, ShoppingBag, PhoneCall } from 'lucide-react';
import { BUSINESS } from '@/lib/constants';

export default function NotFound() {
  return (
    <div
      style={{
        minHeight: '80vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '60px 20px',
        background: '#FAF7F0',
        textAlign: 'center',
      }}
    >
      <div
        style={{
          maxWidth: 580,
          background: '#ffffff',
          borderRadius: 24,
          padding: '48px 36px',
          boxShadow: '0 20px 50px rgba(36,33,31,0.08)',
          border: '1px solid #EDE4D6',
        }}
      >
        <div
          style={{
            width: 64,
            height: 64,
            borderRadius: 18,
            overflow: 'hidden',
            margin: '0 auto 20px',
            background: '#681C2D',
            border: '2px solid rgba(184,149,90,0.5)',
            boxShadow: '0 8px 24px rgba(104,28,45,0.25)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <img
            src="/images/editorial/Gemini_Generated_Image_3w4lsp3w4lsp3w4l.png"
            alt="Mithai Box Wala"
            style={{ width: '100%', height: '100%', objectFit: 'contain' }}
          />
        </div>

        <span
          style={{
            fontSize: 12,
            fontWeight: 700,
            color: '#B8955A',
            letterSpacing: '.14em',
            textTransform: 'uppercase',
          }}
        >
          Error 404
        </span>

        <h1
          style={{
            fontFamily: "'Cormorant Garamond', Georgia, serif",
            fontSize: 'clamp(32px, 5vw, 44px)',
            fontWeight: 700,
            color: '#681C2D',
            margin: '8px 0 16px',
            lineHeight: 1.15,
          }}
        >
          Packaging Destination Not Found
        </h1>

        <p
          style={{
            fontSize: 14.5,
            color: '#6B6663',
            lineHeight: 1.6,
            margin: '0 0 32px',
          }}
        >
          The page you are looking for may have been moved, redesigned, or is temporarily unavailable.
          Explore our signature handcrafted sweet boxes and wholesale packaging collections below.
        </p>

        <div
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: 12,
            justifyContent: 'center',
          }}
        >
          <Link
            href="/"
            className="btn btn-primary"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 8,
              padding: '12px 24px',
              borderRadius: 12,
              fontWeight: 600,
              fontSize: 14,
            }}
          >
            <Home size={16} /> Return to Home
          </Link>

          <Link
            href="/products"
            className="btn btn-gold"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 8,
              padding: '12px 24px',
              borderRadius: 12,
              fontWeight: 600,
              fontSize: 14,
            }}
          >
            <ShoppingBag size={16} /> Explore Collections
          </Link>

          <Link
            href="/contact"
            className="btn btn-outline"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 8,
              padding: '12px 24px',
              borderRadius: 12,
              fontWeight: 600,
              fontSize: 14,
            }}
          >
            <PhoneCall size={16} /> Contact Support
          </Link>
        </div>

        <div
          style={{
            marginTop: 36,
            paddingTop: 20,
            borderTop: '1px solid #EDE4D6',
            fontSize: 12,
            color: '#9A7A45',
            fontWeight: 500,
          }}
        >
          {BUSINESS.brand} · by {BUSINESS.manufacturer} · Mirzapur (Est. 1984)
        </div>
      </div>
    </div>
  );
}
