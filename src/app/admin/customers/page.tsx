import React from 'react';
import { redirect } from 'next/navigation';
import { getAdminClient } from '@/lib/supabase/admin';
import { getAdminSession } from '@/lib/auth/session';

export const dynamic = 'force-dynamic';

export default async function AdminCustomersPage() {
  const session = await getAdminSession();
  if (!session) {
    redirect('/admin/login');
  }

  const adminClient = getAdminClient();
  const { data: customersData } = await adminClient
    .from('profiles')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(50);

  const customers = customersData || [];

  return (
    <div className="p-6 sm:p-10 space-y-6 max-w-7xl mx-auto w-full">
      <div>
        <h1 className="font-display text-3xl font-bold text-[#24211F]">Customer Directory</h1>
        <p className="text-xs text-stone-500 mt-1">Review registered customers, accounts, and contact information</p>
      </div>

      <div className="bg-white border border-[#EDE4D6] rounded-2xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="bg-[#FAF7F0] border-b border-[#EDE4D6] text-stone-600 font-semibold">
                <th className="p-4">Customer Name</th>
                <th className="p-4">Phone</th>
                <th className="p-4">Company</th>
                <th className="p-4">Role</th>
                <th className="p-4">Registered Date</th>
                <th className="p-4">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#EDE4D6]">
              {customers.map((c: any) => (
                <tr key={c.id} className="hover:bg-[#FAF7F0] transition-colors">
                  <td className="p-4 font-bold text-stone-900">{c.name || 'Packaging Customer'}</td>
                  <td className="p-4 text-stone-600">{c.phone || '—'}</td>
                  <td className="p-4 text-stone-600 font-medium">{c.company || '—'}</td>
                  <td className="p-4 uppercase text-[10px] font-bold text-[#681C2D]">
                    {c.role}
                  </td>
                  <td className="p-4 text-stone-500">
                    {new Date(c.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                  </td>
                  <td className="p-4">
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${c.is_active ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-rose-700'}`}>
                      {c.is_active ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                </tr>
              ))}
              {customers.length === 0 && (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-stone-400">
                    No customers registered yet.
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
