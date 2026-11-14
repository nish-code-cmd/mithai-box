import React from 'react';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { getAdminSession } from '@/lib/auth/session';
import { getAdminClient } from '@/lib/supabase/admin';
import { ArrowLeft, User, Phone, Mail, MapPin, ShoppingCart, Calendar, ShieldCheck } from 'lucide-react';
import { ORDER_STATUS_LABELS, ORDER_STATUS_COLORS } from '@/lib/constants';

export const dynamic = 'force-dynamic';

export default async function CustomerDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await getAdminSession();
  if (!session) {
    redirect('/admin/login');
  }

  const { id } = await params;
  const adminClient = getAdminClient();

  const [profileRes, ordersRes, addressesRes] = await Promise.all([
    adminClient.from('profiles').select('*').eq('id', id).single(),
    adminClient.from('orders').select('*').eq('user_id', id).order('created_at', { ascending: false }),
    adminClient.from('addresses').select('*').eq('user_id', id).order('is_default', { ascending: false }),
  ]);

  const customer = profileRes.data;
  if (!customer) {
    return (
      <div className="p-10 max-w-4xl mx-auto space-y-4">
        <Link href="/admin/customers" className="text-xs text-stone-500 hover:text-stone-800 flex items-center gap-1">
          <ArrowLeft size={14} /> Back to Customers
        </Link>
        <div className="bg-white p-8 rounded-2xl border border-[#EDE4D6] text-center text-stone-500 text-xs">
          Customer not found
        </div>
      </div>
    );
  }

  const orders = ordersRes.data || [];
  const addresses = addressesRes.data || [];

  const totalSpent = orders
    .filter((o: any) => o.payment_status === 'paid')
    .reduce((sum: number, o: any) => sum + (o.total_amount || 0), 0);

  return (
    <div className="p-6 sm:p-10 space-y-6 max-w-7xl mx-auto w-full">
      <Link href="/admin/customers" className="inline-flex items-center gap-1.5 text-xs text-stone-600 hover:text-[#681C2D]">
        <ArrowLeft size={14} /> Back to Customer Directory
      </Link>

      {/* Header Profile Card */}
      <div className="bg-white border border-[#EDE4D6] rounded-2xl p-6 sm:p-8 shadow-sm flex flex-col sm:flex-row justify-between sm:items-center gap-6">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-[#681C2D] text-white flex items-center justify-center font-display text-2xl font-bold flex-shrink-0">
            {customer.name ? customer.name.charAt(0).toUpperCase() : 'C'}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="font-display text-2xl font-bold text-[#24211F]">
                {customer.name || 'Registered Customer'}
              </h1>
              <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${customer.is_active ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-rose-700'}`}>
                {customer.is_active ? 'Active' : 'Inactive'}
              </span>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-stone-100 text-stone-700 uppercase">
                {customer.role}
              </span>
            </div>
            <div className="flex flex-wrap gap-4 text-xs text-stone-500 mt-2">
              <span className="flex items-center gap-1.5"><Mail size={13} /> {customer.email || '—'}</span>
              <span className="flex items-center gap-1.5"><Phone size={13} /> {customer.phone || '—'}</span>
              <span className="flex items-center gap-1.5">
                <Calendar size={13} /> Member since {new Date(customer.created_at).toLocaleDateString('en-IN', { month: 'short', year: 'numeric' })}
              </span>
            </div>
          </div>
        </div>

        {/* Stats badge */}
        <div className="flex gap-4 sm:border-l sm:border-[#EDE4D6] sm:pl-6">
          <div>
            <p className="text-[10px] uppercase font-bold text-stone-400">Total Orders</p>
            <p className="text-xl font-display font-bold text-[#24211F]">{orders.length}</p>
          </div>
          <div>
            <p className="text-[10px] uppercase font-bold text-stone-400">Total Spent</p>
            <p className="text-xl font-display font-bold text-[#681C2D]">₹{totalSpent.toLocaleString('en-IN')}</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Order History */}
        <div className="lg:col-span-2 space-y-4">
          <div className="bg-white border border-[#EDE4D6] rounded-2xl shadow-sm overflow-hidden">
            <div className="p-5 border-b border-[#EDE4D6] flex justify-between items-center">
              <h2 className="font-display text-base font-bold text-[#24211F]">Order History</h2>
              <span className="text-xs text-stone-500">{orders.length} orders</span>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="bg-[#FAF7F0] border-b border-[#EDE4D6] text-stone-600 font-semibold">
                    <th className="p-4">Order #</th>
                    <th className="p-4">Date</th>
                    <th className="p-4">Amount</th>
                    <th className="p-4">Payment</th>
                    <th className="p-4">Status</th>
                    <th className="p-4 text-right">View</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#EDE4D6]">
                  {orders.map((o: any) => (
                    <tr key={o.id} className="hover:bg-[#FAF7F0] transition-colors">
                      <td className="p-4 font-mono font-bold text-[#681C2D]">{o.order_number}</td>
                      <td className="p-4 text-stone-500">
                        {new Date(o.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                      </td>
                      <td className="p-4 font-bold text-stone-900">₹{(o.total_amount || 0).toLocaleString('en-IN')}</td>
                      <td className="p-4">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${o.payment_status === 'paid' ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-700'}`}>
                          {o.payment_status}
                        </span>
                      </td>
                      <td className="p-4">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${ORDER_STATUS_COLORS[o.status] || 'bg-stone-100 text-stone-700'}`}>
                          {ORDER_STATUS_LABELS[o.status] || o.status}
                        </span>
                      </td>
                      <td className="p-4 text-right">
                        <Link href={`/admin/orders/${o.id}`} className="text-[#681C2D] hover:underline font-semibold">
                          Details →
                        </Link>
                      </td>
                    </tr>
                  ))}
                  {orders.length === 0 && (
                    <tr>
                      <td colSpan={6} className="p-8 text-center text-stone-400">
                        No orders placed by this customer yet.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Right Column: Addresses */}
        <div className="space-y-4">
          <div className="bg-white border border-[#EDE4D6] rounded-2xl p-6 shadow-sm space-y-4">
            <h2 className="font-display text-base font-bold text-[#24211F] flex items-center gap-2">
              <MapPin size={16} className="text-[#681C2D]" /> Saved Addresses
            </h2>
            {addresses.map((addr: any) => (
              <div key={addr.id} className="p-4 rounded-xl border border-[#EDE4D6] bg-[#FAF7F0] text-xs space-y-1">
                <div className="flex justify-between items-center">
                  <span className="font-bold text-stone-900">{addr.full_name}</span>
                  {addr.is_default && (
                    <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 text-[10px] font-semibold rounded">
                      Default
                    </span>
                  )}
                </div>
                <p className="text-stone-600">{addr.address_line1}</p>
                {addr.address_line2 && <p className="text-stone-600">{addr.address_line2}</p>}
                <p className="text-stone-600">{addr.city}, {addr.state} - {addr.postal_code}</p>
                {addr.phone && <p className="text-stone-500 font-mono mt-1">📞 {addr.phone}</p>}
              </div>
            ))}
            {addresses.length === 0 && (
              <p className="text-xs text-stone-400 text-center py-4">No saved addresses</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
