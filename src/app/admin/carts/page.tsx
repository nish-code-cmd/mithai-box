import React from 'react';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { getAdminSession } from '@/lib/auth/session';
import { getAdminClient } from '@/lib/supabase/admin';
import { Users, ShoppingCart, Package, TrendingUp, ArrowLeft } from 'lucide-react';

export const dynamic = 'force-dynamic';

export default async function AdminCartsPage() {
  const session = await getAdminSession();
  if (!session) {
    redirect('/admin/login');
  }

  const adminClient = getAdminClient();

  // Fetch cart items with related profile and product data
  const { data: cartItems } = await adminClient
    .from('cart_items')
    .select('*, profiles(id, name, email, phone), products(id, name, sku, base_price, images)')
    .order('created_at', { ascending: false })
    .limit(100);

  const items = cartItems || [];

  // Group by user_id
  const cartsByUser: Record<string, { profile: any; items: any[]; total: number }> = {};
  for (const item of items) {
    if (!cartsByUser[item.user_id]) {
      cartsByUser[item.user_id] = {
        profile: item.profiles,
        items: [],
        total: 0,
      };
    }
    const price = item.unit_price ?? item.products?.base_price ?? 0;
    cartsByUser[item.user_id].items.push(item);
    cartsByUser[item.user_id].total += price * (item.quantity ?? 1);
  }

  const carts = Object.entries(cartsByUser).map(([userId, v]) => ({ userId, ...v }));
  const totalCartValue = carts.reduce((s, c) => s + c.total, 0);
  const avgCartValue = carts.length > 0 ? totalCartValue / carts.length : 0;
  const totalItems = items.length;

  return (
    <div className="p-6 sm:p-10 space-y-6 max-w-7xl mx-auto w-full">
      <div>
        <h1 className="font-display text-3xl font-bold text-[#24211F]">Active Carts</h1>
        <p className="text-xs text-stone-500 mt-1">Live snapshot of customer shopping carts and pending purchase intent</p>
      </div>

      {/* KPI Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        {[
          { label: 'Active Carts', value: carts.length.toString(), icon: ShoppingCart, color: 'text-blue-700 bg-blue-50' },
          { label: 'Total Cart Items', value: totalItems.toString(), icon: Package, color: 'text-purple-700 bg-purple-50' },
          { label: 'Total Cart Value', value: `₹${totalCartValue.toLocaleString('en-IN')}`, icon: TrendingUp, color: 'text-emerald-700 bg-emerald-50' },
          { label: 'Avg Cart Value', value: `₹${Math.round(avgCartValue).toLocaleString('en-IN')}`, icon: Users, color: 'text-amber-700 bg-amber-50' },
        ].map(({ label, value, icon: Icon, color }) => (
          <div key={label} className="bg-white border border-[#EDE4D6] rounded-2xl p-5 shadow-sm flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-stone-500 uppercase tracking-wider">{label}</p>
              <p className="font-display text-2xl font-bold text-[#24211F] mt-1">{value}</p>
            </div>
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${color}`}>
              <Icon size={20} />
            </div>
          </div>
        ))}
      </div>

      {/* Cart Table */}
      <div className="bg-white border border-[#EDE4D6] rounded-2xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="bg-[#FAF7F0] border-b border-[#EDE4D6] text-stone-600 font-semibold">
                <th className="p-4">Customer</th>
                <th className="p-4">Items</th>
                <th className="p-4">Cart Value</th>
                <th className="p-4">Top Item</th>
                <th className="p-4">Last Updated</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#EDE4D6]">
              {carts.map((cart) => (
                <tr key={cart.userId} className="hover:bg-[#FAF7F0] transition-colors">
                  <td className="p-4">
                    <div className="font-bold text-stone-900">{cart.profile?.name || 'Guest Customer'}</div>
                    <div className="text-stone-400 mt-0.5">{cart.profile?.email || '—'}</div>
                    {cart.profile?.phone && (
                      <div className="text-stone-400">{cart.profile.phone}</div>
                    )}
                  </td>
                  <td className="p-4">
                    <span className="font-bold text-stone-700">{cart.items.length}</span>
                    <span className="text-stone-400 ml-1">item{cart.items.length !== 1 ? 's' : ''}</span>
                  </td>
                  <td className="p-4 font-bold text-[#681C2D]">
                    ₹{cart.total.toLocaleString('en-IN')}
                  </td>
                  <td className="p-4 text-stone-600 max-w-[180px] truncate">
                    {cart.items[0]?.products?.name || '—'}
                  </td>
                  <td className="p-4 text-stone-400">
                    {cart.items[0]?.updated_at
                      ? new Date(cart.items[0].updated_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })
                      : '—'}
                  </td>
                </tr>
              ))}
              {carts.length === 0 && (
                <tr>
                  <td colSpan={5} className="p-10 text-center text-stone-400">
                    No active carts found. All customers are browsing!
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
