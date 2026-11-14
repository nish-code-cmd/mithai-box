'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Heart, ShoppingBag, Eye, Package, Star } from 'lucide-react';
import { useCartStore } from '@/features/cart/store';

export interface ProductCardProps {
  product: {
    _id?: string;
    id?: string;
    name: string;
    slug: string;
    sku?: string;
    basePrice?: number;
    base_price?: number;
    salePrice?: number;
    mrp?: number;
    wholesale_price?: number;
    moq?: number;
    min_order_qty?: number;
    unit?: string;
    images?: (string | { url: string; altText?: string })[];
    category?: { name: string; slug: string } | any;
    categories?: { name: string; slug: string } | any;
    isCustomizable?: boolean;
    isFeatured?: boolean;
    is_featured?: boolean;
    is_bestseller?: boolean;
  };
  animationDelay?: number;
}

export function ProductCard({ product, animationDelay = 0 }: ProductCardProps) {
  const { addItem } = useCartStore();
  const [wishlisted, setWishlisted] = useState(false);
  const [addingToCart, setAddingToCart] = useState(false);

  const productId = product.id || product._id || '';
  const basePrice = Number(product.basePrice ?? product.base_price ?? 0);
  const salePrice = product.salePrice ?? product.wholesale_price;
  const moq = Number(product.moq ?? product.min_order_qty ?? 1);
  const isFeatured = Boolean(product.isFeatured ?? product.is_featured);

  // Extract first image url
  let mainImage: string | undefined;
  let altText = product.name;
  if (Array.isArray(product.images) && product.images.length > 0) {
    const firstImg = product.images[0];
    if (typeof firstImg === 'string') {
      mainImage = firstImg;
    } else if (firstImg && typeof firstImg === 'object') {
      mainImage = firstImg.url;
      altText = firstImg.altText || product.name;
    }
  }

  const categoryObj = product.category || product.categories;
  const categoryName = typeof categoryObj === 'object' ? categoryObj?.name : undefined;

  const price = salePrice ?? basePrice;

  const handleAddToCart = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setAddingToCart(true);
    addItem({
      productId,
      name: product.name,
      sku: product.sku || '',
      slug: product.slug,
      imageUrl: mainImage,
      quantity: moq,
      unitPrice: price,
      totalPrice: price * moq,
      moq,
    });
    setTimeout(() => setAddingToCart(false), 900);
  };

  const handleWishlist = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setWishlisted((w) => !w);
    try {
      await fetch('/api/wishlist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ productId }),
      });
    } catch { /* noop */ }
  };

  const discountPct =
    salePrice && salePrice < basePrice
      ? Math.round(((basePrice - salePrice) / basePrice) * 100)
      : null;

  return (
    <div
      className="product-card group relative bg-white border border-[#EDE4D6] rounded-2xl overflow-hidden flex flex-col animate-fade-up"
      style={{
        animationDelay: `${animationDelay}ms`,
      }}
    >
      {/* ── Image ── */}
      <Link href={`/products/${product.slug}`} className="product-card__image relative aspect-square overflow-hidden bg-gradient-to-br from-[#FAF7F0] to-[#EDE4D6] block">
        {mainImage ? (
          <img
            src={mainImage}
            alt={altText}
            className="w-full h-full object-cover object-center transition-transform duration-700 group-hover:scale-105"
            style={{ transition: 'transform 0.6s cubic-bezier(0.22,1,0.36,1)' }}
          />
        ) : (
          /* Placeholder */
          <div className="w-full h-full flex flex-col items-center justify-center gap-3">
            <div
              className="w-16 h-16 rounded-2xl flex items-center justify-center"
              style={{ background: 'linear-gradient(135deg,#EDE4D6,#FAF7F0)' }}
            >
              <Package size={28} className="text-[#B8955A]" />
            </div>
            <div className="text-center">
              <p className="font-display text-sm text-[#681C2D] font-semibold">Mithai Box Wala</p>
              <p className="text-xs text-stone-400">by Ajay Packers</p>
            </div>
          </div>
        )}

        {/* Badges */}
        <div className="absolute top-3 left-3 flex flex-col gap-1.5">
          {isFeatured && (
            <span
              className="flex items-center gap-1 text-white text-[10px] font-bold px-2 py-0.5 rounded-full shadow-sm"
              style={{ background: 'linear-gradient(90deg,#681C2D,#8B2B3F)' }}
            >
              <Star size={9} fill="currentColor" />
              Featured
            </span>
          )}
          {discountPct && (
            <span className="bg-emerald-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-full shadow-sm">
              -{discountPct}%
            </span>
          )}
          {product.isCustomizable && (
            <span
              className="text-white text-[10px] font-bold px-2 py-0.5 rounded-full shadow-sm"
              style={{ background: 'linear-gradient(90deg,#B8955A,#9A7A45)' }}
            >
              Custom
            </span>
          )}
        </div>

        {/* Wishlist button */}
        <button
          onClick={handleWishlist}
          className="absolute top-3 right-3 p-2 bg-white/90 backdrop-blur-sm rounded-full shadow-md transition-all duration-200 hover:scale-110"
          style={{
            color: wishlisted ? '#681C2D' : '#8C8885',
          }}
          aria-label={wishlisted ? 'Remove from wishlist' : 'Add to wishlist'}
        >
          <Heart size={15} fill={wishlisted ? 'currentColor' : 'none'} />
        </button>

        {/* Quick-view overlay */}
        <div
          className="product-card__quick-view absolute inset-0 z-10 flex items-end justify-center pb-4 opacity-0 group-hover:opacity-100"
          style={{ background: 'linear-gradient(to top, rgba(36,33,31,0.3) 0%, transparent 50%)' }}
        >
          <span className="flex items-center gap-1.5 text-white text-xs font-semibold bg-white/20 backdrop-blur-sm px-3 py-1.5 rounded-full border border-white/30">
            <Eye size={12} />
            Quick View
          </span>
        </div>
      </Link>

      {/* ── Details ── */}
      <div className="p-4 sm:p-5 flex-1 flex flex-col justify-between">
        <div>
          {categoryName && (
            <p className="text-[10px] font-bold tracking-widest text-[#B8955A] uppercase mb-1">
              {categoryName}
            </p>
          )}
          <Link href={`/products/${product.slug}`}>
            <h3
              className="product-card__title font-display text-[15px] font-semibold leading-snug transition-colors duration-200 line-clamp-2"
              style={{ color: '#24211F' }}
              onMouseEnter={(e) => { (e.currentTarget as HTMLHeadingElement).style.color = '#681C2D'; }}
              onMouseLeave={(e) => { (e.currentTarget as HTMLHeadingElement).style.color = '#24211F'; }}
            >
              {product.name}
            </h3>
          </Link>
          <p className="text-[11px] text-stone-400 mt-1 font-medium">
            MOQ: {moq} {product.unit || 'pcs'}
          </p>
        </div>

        {/* Price + Cart row */}
        <div className="mt-4 pt-3 border-t border-[#EDE4D6] flex items-center justify-between gap-2">
          <div>
            <div className="flex items-baseline gap-1.5">
              <span className="text-base font-bold" style={{ color: '#681C2D' }}>
                ₹{price.toLocaleString('en-IN')}
              </span>
              {salePrice && salePrice < basePrice && (
                <span className="text-xs text-stone-400 line-through">
                  ₹{basePrice.toLocaleString('en-IN')}
                </span>
              )}
            </div>
            <span className="text-[10px] text-stone-400">per piece</span>
          </div>

          <button
            onClick={handleAddToCart}
            disabled={addingToCart}
            className="product-card__add flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all duration-250"
            style={{
              background: addingToCart
                ? '#681C2D'
                : 'linear-gradient(135deg,#FAF7F0,#EDE4D6)',
              color: addingToCart ? '#fff' : '#681C2D',
              border: `1px solid ${addingToCart ? '#681C2D' : '#DDD5C8'}`,
              transform: addingToCart ? 'scale(0.96)' : 'scale(1)',
            }}
          >
            <ShoppingBag size={13} />
            <span>{addingToCart ? 'Added!' : 'Add'}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
