import React from 'react';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { getCustomerSession } from '@/lib/auth/session';
import { getAdminClient } from '@/lib/supabase/admin';
import { ChevronRight, ArrowLeft } from 'lucide-react';
import { ORDER_STATUS_LABELS, ORDER_STATUS_COLORS } from '@/lib/constants';

export const dynamic = 'force-dynamic';

export default async function CustomerOrdersPage() {
  const session = await getCustomerSession();
  if (!session) {
    redirect('/auth/login?returnUrl=/account/orders');
  }

  const admin = getAdminClient();
  const { data: ordersData } = await admin
    .from('orders')
    .select('*, order_items(*)')
    .eq('user_id', session.user.id || session.user._id)
    .order('created_at', { ascending: false });

  const orders = ordersData || [];

  return (
    <div className="bg-[#FAF7F0] min-h-screen py-10">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <Link href="/account" className="inline-flex items-center gap-1.5 text-xs text-stone-600 hover:text-[#681C2D] mb-6">
          <ArrowLeft size={14} /> Back to Account
        </Link>

        <h1 className="font-display text-3xl font-bold text-[#681C2D] mb-8">
          Your Orders ({orders.length})
        </h1>

        <div className="space-y-4">
          {orders.length > 0 ? (
            orders.map((o: any) => (
              <div key={o.id} className="bg-white border border-[#EDE4D6] rounded-2xl p-6 shadow-sm">
                <div className="flex flex-col sm:flex-row justify-between sm:items-center pb-4 border-b border-[#EDE4D6] gap-2">
                  <div>
                    <span className="font-mono text-sm font-bold text-[#681C2D]">#{o.order_number}</span>
                    <p className="text-xs text-stone-500">
                      Placed on {new Date(o.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className={`text-xs px-2.5 py-1 rounded-full font-semibold ${ORDER_STATUS_COLORS[o.status] || 'bg-stone-100 text-stone-700'}`}>
                      {ORDER_STATUS_LABELS[o.status] || o.status}
                    </span>
                    <span className="font-bold text-sm text-[#24211F]">
                      ₹{Number(o.total_amount).toLocaleString('en-IN')}
                    </span>
                  </div>
                </div>

                <div className="py-4 space-y-2">
                  {(o.order_items || []).map((item: any, idx: number) => (
                    <div key={idx} className="flex justify-between items-center text-xs text-stone-700">
                      <span>{item.product_name} (×{item.quantity})</span>
                      <span className="font-semibold">₹{Number(item.total_price).toLocaleString('en-IN')}</span>
                    </div>
                  ))}
                </div>

                <div className="pt-4 border-t border-[#EDE4D6] flex justify-end">
                  <Link
                    href={`/account/orders/${o.id}`}
                    className="text-xs font-semibold text-[#681C2D] hover:text-[#B8955A] flex items-center gap-1"
                  >
                    View Order Details <ChevronRight size={14} />
                  </Link>
                </div>
              </div>
            ))
          ) : (
            <div className="bg-white border border-[#EDE4D6] rounded-2xl p-12 text-center text-stone-500">
              <p className="text-base font-semibold text-[#24211F]">No orders found</p>
              <p className="text-xs text-stone-400 mt-1 mb-6">
                When you place orders for sweet boxes and packaging, they will be tracked here.
              </p>
              <Link
                href="/products"
                className="bg-[#681C2D] text-white px-5 py-2.5 rounded-lg text-xs font-semibold hover:bg-[#8B2B3F] transition-colors"
              >
                Browse Packaging Catalog
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
