import React from 'react';
import { notFound } from 'next/navigation';
import ProductsPage from '@/app/(storefront)/products/page';
import { createClient } from '@/lib/supabase/server';

interface CategoryPageProps {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ sort?: string; page?: string }>;
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
