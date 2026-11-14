import React from 'react';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { getAdminSession } from '@/lib/auth/session';
import { getAdminClient } from '@/lib/supabase/admin';
import { Plus, Edit2, Trash2, GripVertical, Eye, EyeOff } from 'lucide-react';

export const dynamic = 'force-dynamic';

export default async function AdminCategoriesPage() {
  const session = await getAdminSession();
  if (!session) {
    redirect('/admin/login');
  }

  const adminClient = getAdminClient();

  const [categoriesRes, productsCountRes] = await Promise.all([
    adminClient
      .from('categories')
      .select('*')
      .order('sort_order', { ascending: true }),
    adminClient
      .from('products')
      .select('category_id', { count: 'exact', head: false }),
  ]);

  const categories = categoriesRes.data || [];

  // Count products per category
  const productCounts: Record<string, number> = {};
  (productsCountRes.data || []).forEach((p: any) => {
    if (p.category_id) {
      productCounts[p.category_id] = (productCounts[p.category_id] || 0) + 1;
    }
  });

  return (
    <div className="p-6 sm:p-10 space-y-6 max-w-7xl mx-auto w-full">
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
        <div>
          <h1 className="font-display text-3xl font-bold text-[#24211F]">Category Management</h1>
          <p className="text-xs text-stone-500 mt-1">Organise packaging categories, slugs, and display order</p>
        </div>
        <Link
          href="/admin/categories/new"
          className="bg-[#681C2D] hover:bg-[#8B2B3F] text-white px-4 py-2.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors self-start"
        >
          <Plus size={16} /> Add Category
        </Link>
      </div>

      <div className="bg-white border border-[#EDE4D6] rounded-2xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="bg-[#FAF7F0] border-b border-[#EDE4D6] text-stone-600 font-semibold">
                <th className="p-4 w-10">Order</th>
                <th className="p-4">Category Name</th>
                <th className="p-4">Slug</th>
                <th className="p-4">Products</th>
                <th className="p-4">Status</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#EDE4D6]">
              {categories.map((cat: any) => (
                <tr key={cat.id} className="hover:bg-[#FAF7F0] transition-colors">
                  <td className="p-4 text-stone-400">
                    <span className="font-mono font-bold">{cat.sort_order ?? '—'}</span>
                  </td>
                  <td className="p-4">
                    <div className="font-bold text-stone-900 flex items-center gap-2">
                      {cat.image_url && (
                        <img src={cat.image_url} alt={cat.name} className="w-8 h-8 rounded-lg object-cover border border-[#EDE4D6]" />
                      )}
                      {cat.name}
                    </div>
                    {cat.description && (
                      <div className="text-stone-400 mt-0.5 line-clamp-1 max-w-[260px]">{cat.description}</div>
                    )}
                  </td>
                  <td className="p-4">
                    <code className="text-[11px] bg-stone-100 px-2 py-1 rounded font-mono text-stone-600">{cat.slug}</code>
                  </td>
                  <td className="p-4">
                    <span className="font-bold text-stone-700">{productCounts[cat.id] ?? 0}</span>
                    <span className="text-stone-400 ml-1">products</span>
                  </td>
                  <td className="p-4">
                    {cat.is_active !== false ? (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-emerald-50 text-emerald-700 rounded-full text-[10px] font-semibold">
                        <Eye size={10} /> Active
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-stone-100 text-stone-500 rounded-full text-[10px] font-semibold">
                        <EyeOff size={10} /> Hidden
                      </span>
                    )}
                  </td>
                  <td className="p-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Link
                        href={`/admin/categories/${cat.id}/edit`}
                        className="p-1.5 hover:bg-[#EDE4D6] rounded-lg transition-colors text-stone-600"
                        title="Edit"
                      >
                        <Edit2 size={14} />
                      </Link>
                    </div>
                  </td>
                </tr>
              ))}
              {categories.length === 0 && (
                <tr>
                  <td colSpan={6} className="p-10 text-center text-stone-400">
                    No categories yet. Add your first category to get started.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 text-xs text-amber-800">
        <strong>Tip:</strong> Categories are shown in ascending sort_order on the storefront. Update the sort_order in Supabase SQL editor or via the edit form to reorder them.
      </div>
    </div>
  );
}
