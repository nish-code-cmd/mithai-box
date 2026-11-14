'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Save, AlertCircle, CheckCircle2, Trash2 } from 'lucide-react';

export default function EditProductPage() {
  const router = useRouter();
  const params = useParams();
  const id = params?.id as string;

  const [categories, setCategories] = useState<{ id?: string; _id?: string; name: string }[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const [form, setForm] = useState({
    name: '',
    slug: '',
    sku: '',
    category_id: '',
    description: '',
    base_price: 50,
    mrp: 70,
    wholesale_price: 45,
    min_order_qty: 50,
    unit: 'piece',
    stock: 100,
    low_stock_threshold: 15,
    is_active: true,
    is_featured: false,
    is_bestseller: false,
    imageUrl: '',
    tags: '',
  });

  useEffect(() => {
    if (!id) return;

    // Fetch product and categories in parallel
    Promise.all([
      fetch(`/api/admin/products/${id}`).then((r) => r.json()),
      fetch('/api/categories').then((r) => r.json()),
    ])
      .then(([prodRes, catRes]) => {
        if (catRes.success && catRes.data) {
          setCategories(catRes.data);
        }
        if (prodRes.product) {
          const p = prodRes.product;
          setForm({
            name: p.name || '',
            slug: p.slug || '',
            sku: p.sku || '',
            category_id: p.category_id || '',
            description: p.description || '',
            base_price: p.base_price || 0,
            mrp: p.mrp || 0,
            wholesale_price: p.wholesale_price || 0,
            min_order_qty: p.min_order_qty || 1,
            unit: p.unit || 'piece',
            stock: p.stock ?? 100,
            low_stock_threshold: p.low_stock_threshold ?? 15,
            is_active: p.is_active !== false,
            is_featured: !!p.is_featured,
            is_bestseller: !!p.is_bestseller,
            imageUrl: Array.isArray(p.images) && p.images[0] ? (typeof p.images[0] === 'string' ? p.images[0] : p.images[0].url) : '',
            tags: Array.isArray(p.tags) ? p.tags.join(', ') : '',
          });
        } else {
          setError(prodRes.error || 'Failed to load product');
        }
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    setSuccess(false);

    try {
      const payload = {
        name: form.name.trim(),
        slug: form.slug.trim(),
        sku: form.sku.trim(),
        category_id: form.category_id || null,
        description: form.description.trim(),
        base_price: Number(form.base_price),
        mrp: Number(form.mrp) || null,
        wholesale_price: Number(form.wholesale_price) || null,
        min_order_qty: Number(form.min_order_qty) || 1,
        unit: form.unit,
        stock: Number(form.stock) || 0,
        low_stock_threshold: Number(form.low_stock_threshold) || 15,
        is_active: form.is_active,
        is_featured: form.is_featured,
        is_bestseller: form.is_bestseller,
        images: form.imageUrl.trim() ? [form.imageUrl.trim()] : [],
        tags: form.tags
          .split(',')
          .map((t) => t.trim())
          .filter(Boolean),
      };

      const res = await fetch(`/api/admin/products/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok || data.error) {
        throw new Error(data.error || 'Failed to update product');
      }

      setSuccess(true);
      setTimeout(() => {
        router.push('/admin/products');
        router.refresh();
      }, 1000);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="p-10 max-w-4xl mx-auto text-center text-stone-500 text-xs">
        Loading product details...
      </div>
    );
  }

  return (
    <div className="p-6 sm:p-10 max-w-5xl mx-auto w-full space-y-8">
      <Link
        href="/admin/products"
        className="inline-flex items-center gap-1.5 text-xs text-stone-600 hover:text-[#681C2D]"
      >
        <ArrowLeft size={14} /> Back to Products
      </Link>

      <div className="flex justify-between items-center">
        <div>
          <h1 className="font-display text-3xl font-bold text-[#24211F]">Edit Product</h1>
          <p className="text-xs text-stone-500 mt-1">Update box specifications, stock, and pricing</p>
        </div>
      </div>

      {error && (
        <div className="p-4 bg-rose-50 border border-rose-200 text-rose-800 rounded-xl text-xs flex items-center gap-2">
          <AlertCircle size={16} className="flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {success && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs flex items-center gap-2">
          <CheckCircle2 size={16} className="flex-shrink-0" />
          <span>Product updated successfully! Returning to catalog...</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-8 bg-white border border-[#EDE4D6] rounded-2xl p-8 shadow-sm">
        {/* Core Details */}
        <div className="space-y-4">
          <h2 className="font-display text-lg font-bold text-[#24211F]">Basic Information</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1">Product Name *</label>
              <input
                type="text"
                required
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                className="w-full px-3 py-2 border border-[#EDE4D6] rounded text-xs"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1">URL Slug *</label>
              <input
                type="text"
                required
                value={form.slug}
                onChange={(e) => setForm({ ...form, slug: e.target.value })}
                className="w-full px-3 py-2 border border-[#EDE4D6] rounded text-xs"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1">SKU Code</label>
              <input
                type="text"
                value={form.sku}
                onChange={(e) => setForm({ ...form, sku: e.target.value })}
                className="w-full px-3 py-2 border border-[#EDE4D6] rounded text-xs font-mono"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1">Category</label>
              <select
                value={form.category_id}
                onChange={(e) => setForm({ ...form, category_id: e.target.value })}
                className="w-full px-3 py-2 border border-[#EDE4D6] rounded text-xs bg-white"
              >
                <option value="">Select Category</option>
                {categories.map((c: any) => (
                  <option key={c.id || c._id} value={c.id || c._id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-stone-700 mb-1">Description</label>
            <textarea
              rows={4}
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              className="w-full px-3 py-2 border border-[#EDE4D6] rounded text-xs"
            />
          </div>
        </div>

        {/* Pricing & Stock */}
        <div className="space-y-4 pt-6 border-t border-[#EDE4D6]">
          <h2 className="font-display text-lg font-bold text-[#24211F]">Pricing & Inventory</h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1">Base Price (₹) *</label>
              <input
                type="number"
                step="0.01"
                required
                value={form.base_price}
                onChange={(e) => setForm({ ...form, base_price: parseFloat(e.target.value) || 0 })}
                className="w-full px-3 py-2 border border-[#EDE4D6] rounded text-xs"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1">MRP (₹)</label>
              <input
                type="number"
                step="0.01"
                value={form.mrp}
                onChange={(e) => setForm({ ...form, mrp: parseFloat(e.target.value) || 0 })}
                className="w-full px-3 py-2 border border-[#EDE4D6] rounded text-xs"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1">Wholesale Price (₹)</label>
              <input
                type="number"
                step="0.01"
                value={form.wholesale_price}
                onChange={(e) => setForm({ ...form, wholesale_price: parseFloat(e.target.value) || 0 })}
                className="w-full px-3 py-2 border border-[#EDE4D6] rounded text-xs"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1">MOQ</label>
              <input
                type="number"
                value={form.min_order_qty}
                onChange={(e) => setForm({ ...form, min_order_qty: parseInt(e.target.value, 10) || 1 })}
                className="w-full px-3 py-2 border border-[#EDE4D6] rounded text-xs"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1">Stock on Hand</label>
              <input
                type="number"
                value={form.stock}
                onChange={(e) => setForm({ ...form, stock: parseInt(e.target.value, 10) || 0 })}
                className="w-full px-3 py-2 border border-[#EDE4D6] rounded text-xs font-semibold"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1">Low Stock Alert At</label>
              <input
                type="number"
                value={form.low_stock_threshold}
                onChange={(e) => setForm({ ...form, low_stock_threshold: parseInt(e.target.value, 10) || 0 })}
                className="w-full px-3 py-2 border border-[#EDE4D6] rounded text-xs"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1">Unit</label>
              <input
                type="text"
                value={form.unit}
                onChange={(e) => setForm({ ...form, unit: e.target.value })}
                className="w-full px-3 py-2 border border-[#EDE4D6] rounded text-xs"
              />
            </div>
          </div>
        </div>

        {/* Media & Tags */}
        <div className="space-y-4 pt-6 border-t border-[#EDE4D6]">
          <h2 className="font-display text-lg font-bold text-[#24211F]">Image & Tags</h2>
          <div>
            <label className="block text-xs font-semibold text-stone-700 mb-1">Main Image URL</label>
            <input
              type="text"
              value={form.imageUrl}
              onChange={(e) => setForm({ ...form, imageUrl: e.target.value })}
              placeholder="/images/products/royal-gold.png or https://..."
              className="w-full px-3 py-2 border border-[#EDE4D6] rounded text-xs"
            />
            {form.imageUrl && (
              <div className="mt-2 flex items-center gap-3">
                <img
                  src={form.imageUrl}
                  alt="Preview"
                  className="w-16 h-16 rounded-lg object-cover border border-[#EDE4D6]"
                />
                <span className="text-xs text-stone-500">Image preview</span>
              </div>
            )}
          </div>

          <div>
            <label className="block text-xs font-semibold text-stone-700 mb-1">Tags (comma-separated)</label>
            <input
              type="text"
              value={form.tags}
              onChange={(e) => setForm({ ...form, tags: e.target.value })}
              placeholder="diwali, luxury, wedding, rigid"
              className="w-full px-3 py-2 border border-[#EDE4D6] rounded text-xs"
            />
          </div>
        </div>

        {/* Toggles */}
        <div className="space-y-3 pt-6 border-t border-[#EDE4D6]">
          <h2 className="font-display text-lg font-bold text-[#24211F]">Visibility & Flags</h2>
          <div className="flex flex-wrap gap-6 text-xs text-stone-700">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={form.is_active}
                onChange={(e) => setForm({ ...form, is_active: e.target.checked })}
                className="rounded accent-[#681C2D]"
              />
              <span className="font-semibold">Active in Store</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={form.is_featured}
                onChange={(e) => setForm({ ...form, is_featured: e.target.checked })}
                className="rounded accent-[#681C2D]"
              />
              <span className="font-semibold">Featured Collection</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={form.is_bestseller}
                onChange={(e) => setForm({ ...form, is_bestseller: e.target.checked })}
                className="rounded accent-[#681C2D]"
              />
              <span className="font-semibold">Bestseller Badge</span>
            </label>
          </div>
        </div>

        {/* Submit */}
        <div className="pt-6 border-t border-[#EDE4D6] flex justify-end gap-3">
          <Link
            href="/admin/products"
            className="px-5 py-2.5 border border-[#EDE4D6] text-stone-600 rounded text-xs font-semibold hover:bg-stone-50"
          >
            Cancel
          </Link>
          <button
            type="submit"
            disabled={saving}
            className="bg-[#681C2D] hover:bg-[#8B2B3F] text-white px-6 py-2.5 rounded text-xs font-semibold flex items-center gap-1.5 transition-colors disabled:opacity-50"
          >
            <Save size={15} />
            <span>{saving ? 'Saving changes...' : 'Save Changes'}</span>
          </button>
        </div>
      </form>
    </div>
  );
}
