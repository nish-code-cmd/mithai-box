'use client';

import React, { useState, useEffect } from 'react';
import { Warehouse, AlertTriangle, RefreshCw, History, Plus, Minus, X, CheckCircle2 } from 'lucide-react';

export default function AdminInventoryPage() {
  const [inventories, setInventories] = useState<any[]>([]);
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [logsLoading, setLogsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'stock' | 'logs'>('stock');

  // Adjustment modal state
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<any>(null);
  const [adjustQty, setAdjustQty] = useState<number>(50);
  const [adjustType, setAdjustType] = useState<'add' | 'subtract'>('add');
  const [adjustReason, setAdjustReason] = useState<string>('Received factory shipment');
  const [adjusting, setAdjusting] = useState(false);

  const fetchInventory = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/inventory');
      const data = await res.json();
      if (data.success && data.data) {
        setInventories(data.data);
      }
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  };

  const fetchLogs = async () => {
    setLogsLoading(true);
    try {
      const res = await fetch('/api/admin/inventory/logs');
      const data = await res.json();
      if (data.success && data.data) {
        setLogs(data.data);
      }
    } catch {
      // ignore
    } finally {
      setLogsLoading(false);
    }
  };

  useEffect(() => {
    fetchInventory();
  }, []);

  const openAdjustModal = (inv: any, defaultType: 'add' | 'subtract' = 'add') => {
    setSelectedProduct(inv);
    setAdjustType(defaultType);
    setAdjustQty(defaultType === 'add' ? 100 : 25);
    setAdjustReason(defaultType === 'add' ? 'Received factory shipment' : 'Damaged / rejected boxes');
    setModalOpen(true);
  };

  const handleAdjustSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProduct) return;
    setAdjusting(true);

    const delta = adjustType === 'add' ? Number(adjustQty) : -Number(adjustQty);

    try {
      const res = await fetch(`/api/admin/inventory/${selectedProduct._id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          adjustment: delta,
          reason: adjustReason.trim(),
        }),
      });
      const data = await res.json();
      if (data.success) {
        setModalOpen(false);
        fetchInventory();
        if (activeTab === 'logs') fetchLogs();
      }
    } catch {
      // ignore
    } finally {
      setAdjusting(false);
    }
  };

  return (
    <div className="p-6 sm:p-10 space-y-6 max-w-7xl mx-auto w-full">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
        <div>
          <h1 className="font-display text-3xl font-bold text-[#24211F]">Inventory Management</h1>
          <p className="text-xs text-stone-500 mt-1">Real-time stock on hand, low-stock threshold triggers, and audit logs</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => {
              if (activeTab === 'logs') {
                setActiveTab('stock');
              } else {
                setActiveTab('logs');
                fetchLogs();
              }
            }}
            className="bg-white border border-[#EDE4D6] text-stone-700 hover:bg-[#FAF7F0] px-4 py-2 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors"
          >
            <History size={14} /> {activeTab === 'logs' ? 'View Stock Grid' : 'Audit Logs'}
          </button>
          <button
            onClick={() => {
              fetchInventory();
              if (activeTab === 'logs') fetchLogs();
            }}
            className="bg-white border border-[#EDE4D6] text-stone-700 hover:bg-[#FAF7F0] px-4 py-2 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors"
          >
            <RefreshCw size={14} className={loading || logsLoading ? 'animate-spin' : ''} /> Refresh
          </button>
        </div>
      </div>

      {activeTab === 'stock' ? (
        /* Stock Table */
        <div className="bg-white border border-[#EDE4D6] rounded-2xl shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="bg-[#FAF7F0] border-b border-[#EDE4D6] text-stone-600 font-semibold">
                  <th className="p-4">Box Product</th>
                  <th className="p-4">SKU</th>
                  <th className="p-4">Stock on Hand</th>
                  <th className="p-4">Reserved</th>
                  <th className="p-4">Available</th>
                  <th className="p-4">Threshold</th>
                  <th className="p-4 text-right">Quick Adjust</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#EDE4D6]">
                {inventories.map((inv: any) => {
                  const available = inv.quantityOnHand - inv.quantityReserved;
                  const isLow = available <= inv.lowStockThreshold;

                  return (
                    <tr key={inv._id} className="hover:bg-[#FAF7F0] transition-colors">
                      <td className="p-4">
                        <div className="font-semibold text-stone-900">{inv.product?.name || 'Unknown Product'}</div>
                        <div className="text-stone-400 text-[11px]">{inv.product?.category?.name || 'Packaging'}</div>
                      </td>
                      <td className="p-4 font-mono text-stone-600">{inv.product?.sku || '—'}</td>
                      <td className="p-4 font-bold text-stone-900">{inv.quantityOnHand} pcs</td>
                      <td className="p-4 text-stone-500">{inv.quantityReserved} pcs</td>
                      <td className="p-4">
                        <span className={`font-bold ${isLow ? 'text-amber-600 flex items-center gap-1' : 'text-emerald-700'}`}>
                          {available} pcs {isLow && <AlertTriangle size={12} />}
                        </span>
                      </td>
                      <td className="p-4 text-stone-500">{inv.lowStockThreshold} pcs</td>
                      <td className="p-4 text-right space-x-2">
                        <button
                          onClick={() => openAdjustModal(inv, 'add')}
                          className="px-2.5 py-1 bg-emerald-50 text-emerald-800 hover:bg-emerald-100 rounded text-xs font-semibold inline-flex items-center gap-1"
                          title="Add Stock"
                        >
                          <Plus size={12} /> Add
                        </button>
                        <button
                          onClick={() => openAdjustModal(inv, 'subtract')}
                          className="px-2.5 py-1 bg-rose-50 text-rose-800 hover:bg-rose-100 rounded text-xs font-semibold inline-flex items-center gap-1"
                          title="Deduct Stock"
                        >
                          <Minus size={12} /> Deduct
                        </button>
                      </td>
                    </tr>
                  );
                })}
                {inventories.length === 0 && !loading && (
                  <tr>
                    <td colSpan={7} className="p-8 text-center text-stone-400">
                      No tracked inventory records yet.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        /* Audit Logs Table */
        <div className="bg-white border border-[#EDE4D6] rounded-2xl shadow-sm overflow-hidden">
          <div className="p-5 border-b border-[#EDE4D6] flex justify-between items-center">
            <h2 className="font-display text-base font-bold text-[#24211F]">Inventory Audit Trail</h2>
            <span className="text-xs text-stone-500">{logs.length} logged events</span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="bg-[#FAF7F0] border-b border-[#EDE4D6] text-stone-600 font-semibold">
                  <th className="p-4">Date & Time</th>
                  <th className="p-4">Product</th>
                  <th className="p-4">Change</th>
                  <th className="p-4">Previous → New</th>
                  <th className="p-4">Reason</th>
                  <th className="p-4">Adjusted By</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#EDE4D6]">
                {logs.map((log: any) => (
                  <tr key={log.id} className="hover:bg-[#FAF7F0] transition-colors">
                    <td className="p-4 text-stone-500 whitespace-nowrap">
                      {new Date(log.created_at).toLocaleDateString('en-IN', {
                        day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit',
                      })}
                    </td>
                    <td className="p-4 font-semibold text-stone-900">
                      {log.products?.name || 'Product'}
                    </td>
                    <td className="p-4 font-bold">
                      <span className={log.change_qty > 0 ? 'text-emerald-700' : 'text-rose-700'}>
                        {log.change_qty > 0 ? `+${log.change_qty}` : log.change_qty} pcs
                      </span>
                    </td>
                    <td className="p-4 font-mono text-stone-600">
                      {log.previous_stock} → {log.new_stock} pcs
                    </td>
                    <td className="p-4 text-stone-700 font-medium">
                      {log.reason}
                    </td>
                    <td className="p-4 text-stone-400 capitalize">
                      {log.created_by || 'admin'}
                    </td>
                  </tr>
                ))}
                {logs.length === 0 && !logsLoading && (
                  <tr>
                    <td colSpan={6} className="p-8 text-center text-stone-400">
                      No stock adjustment logs recorded yet. Adjust stock to generate logs.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Adjust Modal */}
      {modalOpen && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl space-y-4 border border-[#EDE4D6]">
            <div className="flex justify-between items-center pb-2 border-b border-[#EDE4D6]">
              <h3 className="font-display text-lg font-bold text-[#24211F]">
                {adjustType === 'add' ? 'Add Stock' : 'Deduct Stock'}
              </h3>
              <button onClick={() => setModalOpen(false)} className="text-stone-400 hover:text-stone-700">
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleAdjustSubmit} className="space-y-4 text-xs">
              <div>
                <span className="text-stone-500 block mb-1">Product:</span>
                <span className="font-bold text-stone-900 text-sm">{selectedProduct?.product?.name}</span>
                <span className="text-stone-400 block font-mono text-[11px] mt-0.5">
                  Current Stock: {selectedProduct?.quantityOnHand} pcs
                </span>
              </div>

              <div>
                <label className="block font-semibold text-stone-700 mb-1">Adjustment Type</label>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setAdjustType('add')}
                    className={`flex-1 py-2 rounded-lg font-semibold ${adjustType === 'add' ? 'bg-emerald-700 text-white' : 'bg-stone-100 text-stone-600'}`}
                  >
                    + Add Units
                  </button>
                  <button
                    type="button"
                    onClick={() => setAdjustType('subtract')}
                    className={`flex-1 py-2 rounded-lg font-semibold ${adjustType === 'subtract' ? 'bg-rose-700 text-white' : 'bg-stone-100 text-stone-600'}`}
                  >
                    - Deduct Units
                  </button>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-stone-700 mb-1">Quantity (pcs) *</label>
                <input
                  type="number"
                  min="1"
                  required
                  value={adjustQty}
                  onChange={(e) => setAdjustQty(parseInt(e.target.value, 10) || 0)}
                  className="w-full px-3 py-2 border border-[#EDE4D6] rounded-lg text-sm font-semibold"
                />
              </div>

              <div>
                <label className="block font-semibold text-stone-700 mb-1">Reason for Adjustment *</label>
                <input
                  type="text"
                  required
                  value={adjustReason}
                  onChange={(e) => setAdjustReason(e.target.value)}
                  placeholder="e.g. Received batch #402, physical stock recount..."
                  className="w-full px-3 py-2 border border-[#EDE4D6] rounded-lg text-xs"
                />
              </div>

              <div className="pt-4 border-t border-[#EDE4D6] flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2 border border-[#EDE4D6] rounded-lg text-stone-600 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={adjusting}
                  className="px-4 py-2 bg-[#681C2D] hover:bg-[#8B2B3F] text-white rounded-lg font-semibold disabled:opacity-50"
                >
                  {adjusting ? 'Saving...' : 'Confirm Adjustment'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
