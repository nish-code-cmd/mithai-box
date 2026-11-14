import React from 'react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { ProductDetailClient } from './ProductDetailClient';
import { ProductCard } from '@/components/product/ProductCard';
import { ChevronRight, ShieldCheck, Truck, Clock, PackageCheck } from 'lucide-react';
import { BUSINESS } from '@/lib/constants';

interface ProductPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: ProductPageProps) {
  const { slug } = await params;
  const supabase = await createClient();
  const { data: product } = await supabase
    .from('products')
    .select('name, description, images')
    .eq('slug', slug)
    .eq('is_active', true)
    .maybeSingle();

  if (!product) return {};

  const firstImg = Array.isArray(product.images) && product.images.length > 0 ? product.images[0] : null;

  return {
    title: `${product.name} — ${BUSINESS.brand}`,
    description: product.description || `${product.name} manufactured by Ajay Packers.`,
    openGraph: {
      title: product.name,
      description: product.description || undefined,
      images: firstImg ? [{ url: firstImg }] : [],
    },
  };
}

export default async function ProductDetailPage({ params }: ProductPageProps) {
  const { slug } = await params;
  const supabase = await createClient();

  const { data: product, error } = await supabase
    .from('products')
    .select('*, categories(id, name, slug)')
    .eq('slug', slug)
    .eq('is_active', true)
    .maybeSingle();

  if (error || !product) {
    notFound();
  }

  // Fetch related products from same category
  let relatedProducts: any[] = [];
  if (product.category_id) {
    const { data: related } = await supabase
      .from('products')
      .select('*, categories(id, name, slug)')
      .eq('category_id', product.category_id)
      .neq('id', product.id)
      .eq('is_active', true)
      .limit(4);

    if (related) {
      relatedProducts = related;
    }
  }

  const category = product.categories;

  return (
    <div className="bg-[#FAF7F0] min-h-screen py-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-xs text-stone-500 mb-6">
          <Link href="/" className="hover:text-[#681C2D]">Home</Link>
          <ChevronRight size={12} />
          <Link href="/products" className="hover:text-[#681C2D]">Packaging</Link>
          {category && (
            <>
              <ChevronRight size={12} />
              <Link href={`/products?category=${category.slug}`} className="hover:text-[#681C2D]">
                {category.name}
              </Link>
            </>
          )}
          <ChevronRight size={12} />
          <span className="text-[#24211F] font-medium truncate max-w-xs">{product.name}</span>
        </nav>

        {/* Product Details Section (Client Component) */}
        <ProductDetailClient
          product={product}
          inventory={{ quantity: product.stock }}
        />

        {/* Trust Badges Bar */}
        <div className="my-12 grid grid-cols-2 md:grid-cols-4 gap-4 p-6 bg-white border border-[#EDE4D6] rounded-2xl shadow-sm text-xs text-[#24211F]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-[#FAF7F0] text-[#681C2D] flex items-center justify-center flex-shrink-0">
              <PackageCheck size={20} />
            </div>
            <div>
              <p className="font-bold">40 Years Manufacturing</p>
              <p className="text-stone-500">Ajay Packers, Mirzapur</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-[#FAF7F0] text-[#681C2D] flex items-center justify-center flex-shrink-0">
              <ShieldCheck size={20} />
            </div>
            <div>
              <p className="font-bold">100% Advance Payment</p>
              <p className="text-stone-500">Secured via Razorpay</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-[#FAF7F0] text-[#681C2D] flex items-center justify-center flex-shrink-0">
              <Clock size={20} />
            </div>
            <div>
              <p className="font-bold">2 Business Days Dispatch</p>
              <p className="text-stone-500">Quick factory turnaround</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-[#FAF7F0] text-[#681C2D] flex items-center justify-center flex-shrink-0">
              <Truck size={20} />
            </div>
            <div>
              <p className="font-bold">Pan-India Transport</p>
              <p className="text-stone-500">Reliable logistics partners</p>
            </div>
          </div>
        </div>

        {/* Related Products */}
        {relatedProducts.length > 0 && (
          <div className="mt-16">
            <div className="flex items-center justify-between mb-8">
              <h2 className="font-display text-2xl font-bold text-[#681C2D]">
                Related Packaging Designs
              </h2>
              <Link href="/products" className="text-xs font-semibold text-[#681C2D] hover:text-[#B8955A]">
                View All →
              </Link>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
              {relatedProducts.map((p: any) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
