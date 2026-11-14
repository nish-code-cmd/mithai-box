import React from 'react';
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import ProductsPage from '@/app/(storefront)/products/page';
import { createClient } from '@/lib/supabase/server';
import { BUSINESS } from '@/lib/constants';

interface CategoryPageProps {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ sort?: string; page?: string }>;
}

export async function generateMetadata({ params }: CategoryPageProps): Promise<Metadata> {
  const { slug } = await params;
  const supabase = await createClient();
  const { data: category } = await supabase
    .from('categories')
    .select('name, description')
    .eq('slug', slug)
    .eq('is_active', true)
    .maybeSingle();

  if (!category) return {};

  return {
    title: `${category.name} Packaging Collection | ${BUSINESS.brand}`,
    description: category.description || `Browse handcrafted ${category.name} by ${BUSINESS.manufacturer}, Mirzapur. Wholesale supply and custom printing.`,
  };
}

export default async function CategoryPage({ params, searchParams }: CategoryPageProps) {
  const { slug } = await params;
  const sParams = await searchParams;

  const supabase = await createClient();
  const { data: category } = await supabase
    .from('categories')
    .select('id, name, slug')
    .eq('slug', slug)
    .eq('is_active', true)
    .maybeSingle();

  if (!category) {
    notFound();
  }

  return (
    <ProductsPage
      searchParams={Promise.resolve({
        category: slug,
        sort: sParams.sort,
        page: sParams.page,
      })}
    />
  );
}
