import React from 'react';
import { redirect } from 'next/navigation';
import { getAdminClient } from '@/lib/supabase/admin';
import { getAdminSession } from '@/lib/auth/session';

export const dynamic = 'force-dynamic';

export default async function AdminEnquiriesPage() {
  const session = await getAdminSession();
  if (!session) {
    redirect('/admin/login');
  }

  const adminClient = getAdminClient();
  const { data: enquiriesData } = await adminClient
    .from('wholesale_enquiries')
    .select('*')
    .order('created_at', { ascending: false });

  const enquiries = enquiriesData || [];

  return (
    <div className="p-6 sm:p-10 space-y-6 max-w-7xl mx-auto w-full">
      <div>
        <h1 className="font-display text-3xl font-bold text-[#24211F]">Wholesale Enquiries CRM</h1>
        <p className="text-xs text-stone-500 mt-1">
          Review incoming bulk-order requirements, custom foil printing requests, and track quotations
        </p>
      </div>

      <div className="bg-white border border-[#EDE4D6] rounded-2xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="bg-[#FAF7F0] border-b border-[#EDE4D6] text-stone-600 font-semibold">
                <th className="p-4">Date</th>
                <th className="p-4">Contact</th>
                <th className="p-4">Company</th>
                <th className="p-4">Message</th>
                <th className="p-4">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#EDE4D6]">
              {enquiries.map((e: any) => (
                <tr key={e.id} className="hover:bg-[#FAF7F0] transition-colors">
                  <td className="p-4 text-stone-500">
                    {new Date(e.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                  </td>
                  <td className="p-4">
                    <p className="font-bold text-stone-900">{e.name}</p>
                    <p className="text-[10px] text-stone-400">{e.phone ? `${e.phone} • ` : ''}{e.email}</p>
                  </td>
                  <td className="p-4 text-stone-700 font-medium">{e.company || '—'}</td>
                  <td className="p-4 text-stone-600 max-w-xs truncate">{e.message || '—'}</td>
                  <td className="p-4">
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-amber-50 text-amber-700 capitalize">
                      {e.status}
                    </span>
                  </td>
                </tr>
              ))}
              {enquiries.length === 0 && (
                <tr>
                  <td colSpan={5} className="p-8 text-center text-stone-400">
                    No wholesale enquiries received yet.
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
