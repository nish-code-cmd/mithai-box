import React from 'react';
import { redirect, notFound } from 'next/navigation';
import Link from 'next/link';
import { getCustomerSession } from '@/lib/auth/session';
import { getAdminClient } from '@/lib/supabase/admin';
import { ArrowLeft, MapPin, Calendar } from 'lucide-react';
import { ORDER_STATUS_LABELS, ORDER_STATUS_COLORS, BUSINESS } from '@/lib/constants';

export const dynamic = 'force-dynamic';

interface OrderDetailPageProps {
  params: Promise<{ id: string }>;
}

export default async function OrderDetailPage({ params }: OrderDetailPageProps) {
  const { id } = await params;
  const session = await getCustomerSession();
  if (!session) {
    redirect(`/auth/login?returnUrl=/account/orders/${id}`);
  }

  const admin = getAdminClient();
  const { data: order, error } = await admin
    .from('orders')
    .select('*, order_items(*)')
    .eq('id', id)
    .eq('user_id', session.user.id || session.user._id)
    .maybeSingle();

  if (error || !order) {
    notFound();
  }

  const addr = typeof order.shipping_address === 'object' && order.shipping_address !== null
    ? order.shipping_address as any
    : {};

  return (
    <div className="bg-[#FAF7F0] min-h-screen py-10">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <Link href="/account/orders" className="inline-flex items-center gap-1.5 text-xs text-stone-600 hover:text-[#681C2D] mb-6">
          <ArrowLeft size={14} /> Back to All Orders
        </Link>

        {/* Order Header */}
        <div className="bg-white border border-[#EDE4D6] rounded-2xl p-6 sm:p-8 mb-6 shadow-sm">
          <div className="flex flex-col sm:flex-row justify-between sm:items-center pb-6 border-b border-[#EDE4D6] gap-4">
            <div>
              <span className="text-xs font-bold text-[#B8955A] uppercase tracking-wider">
                Order Reference
              </span>
              <h1 className="font-mono text-2xl font-bold text-[#681C2D]">#{order.order_number}</h1>
              <p className="text-xs text-stone-500 mt-1 flex items-center gap-1">
                <Calendar size={13} />
                Placed on {new Date(order.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}
              </p>
            </div>

            <div className="flex sm:flex-col items-center sm:items-end gap-2">
              <span className={`text-xs px-3 py-1 rounded-full font-semibold ${ORDER_STATUS_COLORS[order.status] || 'bg-stone-100 text-stone-700'}`}>
                {ORDER_STATUS_LABELS[order.status] || order.status}
              </span>
              <span className="text-xs text-stone-500">
                Payment: <strong className="text-emerald-700 uppercase">{order.payment_status}</strong>
              </span>
            </div>
          </div>

          {/* Items */}
          <div className="py-6 border-b border-[#EDE4D6]">
            <h2 className="font-display text-lg font-bold text-[#24211F] mb-4">Packaged Items</h2>
            <div className="divide-y divide-stone-100">
              {(order.order_items || []).map((item: any, idx: number) => (
                <div key={idx} className="py-3 flex justify-between items-center text-xs">
                  <div>
                    <p className="font-semibold text-stone-800">{item.product_name}</p>
                    <p className="text-stone-500">SKU: {item.product_sku || '—'} • Qty: {item.quantity} pcs</p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-[#681C2D]">₹{Number(item.total_price).toLocaleString('en-IN')}</p>
                    <p className="text-[11px] text-stone-400">₹{Number(item.unit_price)}/pc</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Financial Breakdown */}
          <div className="py-6 border-b border-[#EDE4D6] space-y-2 text-xs text-stone-600">
            <div className="flex justify-between">
              <span>Subtotal</span>
              <span className="font-semibold text-stone-800">₹{Number(order.subtotal).toLocaleString('en-IN')}</span>
            </div>
            {order.discount_amount > 0 && (
              <div className="flex justify-between text-emerald-700">
                <span>Discount ({order.coupon_code})</span>
                <span>-₹{Number(order.discount_amount).toLocaleString('en-IN')}</span>
              </div>
            )}
            <div className="flex justify-between">
              <span>Shipping & Packaging</span>
              <span className="font-semibold text-stone-800">₹{Number(order.shipping_charge).toLocaleString('en-IN')}</span>
            </div>
            <div className="flex justify-between">
              <span>GST (12% packaging)</span>
              <span className="font-semibold text-stone-800">₹{Number(order.gst_amount).toLocaleString('en-IN')}</span>
            </div>
            <div className="pt-2 flex justify-between text-sm font-bold text-[#24211F]">
              <span>Grand Total</span>
              <span className="font-display text-xl text-[#681C2D]">₹{Number(order.total_amount).toLocaleString('en-IN')}</span>
            </div>
          </div>

          {/* Delivery Destination */}
          <div className="pt-6 grid grid-cols-1 sm:grid-cols-2 gap-6 text-xs text-stone-600">
            <div>
              <h3 className="font-semibold text-stone-800 mb-1 flex items-center gap-1.5">
                <MapPin size={14} className="text-[#681C2D]" /> Shipping Destination
              </h3>
              <p className="font-medium text-stone-700">{addr.fullName || addr.name || 'Customer'}</p>
              <p>{addr.addressLine1 || addr.line1 || ''}</p>
              {addr.line2 && <p>{addr.line2}</p>}
              <p>{addr.city || ''}, {addr.state || ''} – {addr.pincode || ''}</p>
              <p className="mt-1">Phone: {addr.phone || ''}</p>
            </div>

            <div className="bg-[#FAF7F0] p-4 rounded-xl border border-[#EDE4D6]">
              <h3 className="font-semibold text-[#681C2D] mb-1">Manufacturer Details</h3>
              <p className="font-medium text-stone-800">{BUSINESS.brand} ({BUSINESS.manufacturer})</p>
              <p>{BUSINESS.address.full}</p>
              <p>GSTIN: {BUSINESS.gstin}</p>
              <p className="mt-1">Representatives: Ajay Kumar & Sanjay Kumar</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
