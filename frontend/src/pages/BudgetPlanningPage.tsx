import React, { useEffect, useState } from 'react';
import { useEvent } from '../context/EventContext';
import { useToast } from '../context/ToastContext';
import { ApiService } from '../services/api';
import {
  BudgetCategory,
  BudgetTransaction,
  FoodCateringConfig,
  FoodBudgetSummary
} from '../types';
import {
  Wallet,
  UtensilsCrossed,
  PlusCircle,
  TrendingDown,
  TrendingUp,
  AlertTriangle,
  Download,
  CheckCircle2,
  Sliders,
  DollarSign,
  Tag,
  FileSpreadsheet
} from 'lucide-react';

export const BudgetPlanningPage: React.FC = () => {
  const { activeEvent } = useEvent();
  const { showToast } = useToast();

  const [categories, setCategories] = useState<BudgetCategory[]>([]);
  const [transactions, setTransactions] = useState<BudgetTransaction[]>([]);
  const [foodConfig, setFoodConfig] = useState<FoodCateringConfig | null>(null);
  const [foodSummary, setFoodSummary] = useState<FoodBudgetSummary | null>(null);
  const [loading, setLoading] = useState(true);

  // Modal / Forms
  const [showAddTxModal, setShowAddTxModal] = useState(false);
  const [newTx, setNewTx] = useState<Partial<BudgetTransaction>>({
    category_id: '',
    title: '',
    amount: 10000,
    vendor_name: '',
    status: 'paid',
  });

  const loadData = async () => {
    if (!activeEvent) return;
    setLoading(true);
    try {
      const [cats, txs, fCfg, fSum] = await Promise.all([
        ApiService.getBudgetCategories(activeEvent.id),
        ApiService.getBudgetTransactions(activeEvent.id),
        ApiService.getFoodConfig(activeEvent.id),
        ApiService.getFoodCalculation(activeEvent.id),
      ]);
      setCategories(cats);
      setTransactions(txs);
      setFoodConfig(fCfg);
      setFoodSummary(fSum);
      if (cats.length > 0 && !newTx.category_id) {
        setNewTx((prev) => ({ ...prev, category_id: cats[0].id }));
      }
    } catch {
      showToast('Error loading budget and catering data', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [activeEvent]);

  const handleUpdateFoodConfig = async (field: keyof FoodCateringConfig, value: any) => {
    if (!activeEvent || !foodConfig) return;
    const updated = { ...foodConfig, [field]: value };
    setFoodConfig(updated);
    try {
      await ApiService.updateFoodConfig(activeEvent.id, updated);
      const newSum = await ApiService.getFoodCalculation(activeEvent.id);
      setFoodSummary(newSum);
    } catch {
      showToast('Could not update food parameters', 'error');
    }
  };

  const handleAddTransaction = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeEvent || !newTx.category_id || !newTx.title || !newTx.amount) return;
    try {
      await ApiService.addBudgetTransaction(activeEvent.id, newTx);
      showToast(`Logged ₹${newTx.amount} expense for ${newTx.title}`, 'success');
      setShowAddTxModal(false);
      setNewTx({
        category_id: categories[0]?.id || '',
        title: '',
        amount: 5000,
        vendor_name: '',
        status: 'paid',
      });
      loadData();
    } catch (err: any) {
      showToast(err.message || 'Failed to record expense', 'error');
    }
  };

  if (!activeEvent) {
    return <div className="p-8 text-center text-stone-500">Please select an event.</div>;
  }

  const totalAllocated = categories.reduce((sum, c) => sum + c.allocated_amount, 0);
  const totalSpent = categories.reduce((sum, c) => sum + c.spent_amount, 0);
  const remainingBudget = Math.max(0, (activeEvent.target_budget || totalAllocated) - totalSpent);

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-3xl border border-[#D4AF37]/30 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs uppercase font-bold tracking-wider text-[#800020]">
              Financial Control & Catering
            </span>
            <span className="text-xs text-stone-400">• {activeEvent.title}</span>
          </div>
          <h1 className="text-xl font-bold font-serif text-stone-900 mt-0.5">
            Budget Management & Food Quantity Planning
          </h1>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <a
            href={`/api/v1/reports/events/${activeEvent.id}/catering-sheet.pdf`}
            download
            className="px-3.5 py-2 rounded-xl border border-stone-200 hover:bg-stone-50 text-stone-700 text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer"
          >
            <Download className="w-4 h-4 text-stone-500" /> Caterer PDF Order Sheet
          </a>
          <button
            onClick={() => setShowAddTxModal(true)}
            className="px-4 py-2 rounded-xl bg-[#800020] hover:bg-[#580c1f] text-white text-xs font-bold flex items-center gap-1.5 shadow-md transition cursor-pointer"
          >
            <PlusCircle className="w-4 h-4 text-[#D4AF37]" /> Record Expense
          </button>
        </div>
      </div>

      {/* SECTION 8: FOOD & CATERING PLANNING ENGINE */}
      {foodConfig && foodSummary && (
        <div className="bg-gradient-to-br from-white to-[#FAF7F2] p-6 rounded-3xl border border-[#D4AF37]/40 shadow-sm space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#D4AF37]/20 pb-4">
            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-2xl bg-[#800020]/10 text-[#800020] flex items-center justify-center">
                <UtensilsCrossed className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-lg font-bold font-serif text-stone-900">
                  Intelligent Food Quantity & Catering Calculator
                </h2>
                <p className="text-xs text-stone-500">
                  Transparent formula calculations with buffer % and caterer minimum guarantees
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 text-xs">
              <span className="text-stone-500 font-medium">Applied Buffer:</span>
              <span className="px-2.5 py-1 rounded-full bg-[#800020] text-white font-bold">
                {foodConfig.buffer_percentage}%
              </span>
            </div>
          </div>

          {/* Transparent Calculation Difference Box (Section 8 highlight) */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 rounded-2xl bg-white border border-stone-200 space-y-1">
              <span className="text-[10px] uppercase font-bold text-stone-400">
                Original Invite Projection (100% Turnout)
              </span>
              <p className="text-xl font-bold font-serif text-stone-900">
                ₹{foodSummary.original_invite_estimated_cost.toLocaleString('en-IN')}
              </p>
              <p className="text-[11px] text-stone-500">
                Based on all {foodSummary.total_invited_guests} invited guests attending
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-white border border-emerald-300 space-y-1 bg-gradient-to-br from-white to-emerald-50/20">
              <span className="text-[10px] uppercase font-bold text-emerald-800">
                Response-Based Caterer Estimate
              </span>
              <p className="text-xl font-bold font-serif text-emerald-950">
                ₹{foodSummary.response_based_estimated_cost.toLocaleString('en-IN')}
              </p>
              <p className="text-[11px] text-emerald-700">
                For {foodSummary.confirmed_total_attendees} confirmed guests + {foodConfig.buffer_percentage}% buffer
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-[#FAF7F2] border border-[#D4AF37]/50 space-y-1">
              <span className="text-[10px] uppercase font-bold text-[#800020] flex items-center gap-1">
                <span>Estimated Difference</span>
                <span className="text-[9px] font-normal lowercase text-stone-500">(estimate only)</span>
              </span>
              <p className="text-xl font-bold font-serif text-[#800020]">
                ₹{foodSummary.estimated_potential_saving.toLocaleString('en-IN')}
              </p>
              <p className="text-[10px] text-stone-500 leading-tight">
                *Estimated difference before fixed minimums and vendor charges. Not a guaranteed saving.
              </p>
            </div>
          </div>

          {/* Recommended Food Preparation Breakdown */}
          <div className="bg-white p-5 rounded-2xl border border-stone-200/80 space-y-3">
            <h3 className="font-bold text-xs uppercase tracking-wider text-stone-700">
              Recommended Preparation Plates (To share with Caterer)
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
              <div className="p-3 bg-emerald-50/60 rounded-xl border border-emerald-200">
                <span className="text-xs font-bold text-emerald-900 block">🟢 Vegetarian Plates</span>
                <span className="text-2xl font-bold font-serif text-emerald-950">
                  {foodSummary.recommended_veg_prep}
                </span>
                <p className="text-[10px] text-emerald-700 mt-0.5">
                  Confirmed: {foodSummary.confirmed_veg_meals + foodSummary.confirmed_jain_meals} + buffer
                </p>
              </div>

              <div className="p-3 bg-rose-50/60 rounded-xl border border-rose-200">
                <span className="text-xs font-bold text-rose-900 block">🔴 Non-Veg Plates</span>
                <span className="text-2xl font-bold font-serif text-rose-950">
                  {foodSummary.recommended_non_veg_prep}
                </span>
                <p className="text-[10px] text-rose-700 mt-0.5">
                  Confirmed: {foodSummary.confirmed_non_veg_meals} + buffer
                </p>
              </div>

              <div className="p-3 bg-amber-50/60 rounded-xl border border-amber-200">
                <span className="text-xs font-bold text-amber-900 block">👶 Children Meals</span>
                <span className="text-2xl font-bold font-serif text-amber-950">
                  {foodSummary.recommended_children_prep}
                </span>
                <p className="text-[10px] text-amber-700 mt-0.5">
                  Confirmed: {foodSummary.confirmed_children} + buffer
                </p>
              </div>

              <div className="p-3 bg-[#800020]/10 rounded-xl border border-[#800020]/20">
                <span className="text-xs font-bold text-[#800020] block">🍽️ Total Plates Target</span>
                <span className="text-2xl font-bold font-serif text-[#800020]">
                  {foodSummary.recommended_total_plates}
                </span>
                <p className="text-[10px] text-stone-500 mt-0.5">
                  Min guarantee: {foodConfig.catering_minimum_guarantee} plates
                </p>
              </div>
            </div>
          </div>

          {/* Caterer Pricing Parameters Controls */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-3 pt-2">
            <div>
              <label className="block text-[11px] font-semibold text-stone-700 mb-1">Veg Plate Rate (₹)</label>
              <input
                type="number"
                min={0}
                value={foodConfig.price_per_veg}
                onChange={(e) => handleUpdateFoodConfig('price_per_veg', parseFloat(e.target.value) || 0)}
                className="w-full px-3 py-1.5 rounded-xl border border-stone-200 text-xs font-bold"
              />
            </div>
            <div>
              <label className="block text-[11px] font-semibold text-stone-700 mb-1">Non-Veg Rate (₹)</label>
              <input
                type="number"
                min={0}
                value={foodConfig.price_per_non_veg}
                onChange={(e) => handleUpdateFoodConfig('price_per_non_veg', parseFloat(e.target.value) || 0)}
                className="w-full px-3 py-1.5 rounded-xl border border-stone-200 text-xs font-bold"
              />
            </div>
            <div>
              <label className="block text-[11px] font-semibold text-stone-700 mb-1">Child Rate (₹)</label>
              <input
                type="number"
                min={0}
                value={foodConfig.price_per_child}
                onChange={(e) => handleUpdateFoodConfig('price_per_child', parseFloat(e.target.value) || 0)}
                className="w-full px-3 py-1.5 rounded-xl border border-stone-200 text-xs font-bold"
              />
            </div>
            <div>
              <label className="block text-[11px] font-semibold text-stone-700 mb-1">Buffer %</label>
              <input
                type="number"
                min={0}
                max={50}
                value={foodConfig.buffer_percentage}
                onChange={(e) => handleUpdateFoodConfig('buffer_percentage', parseFloat(e.target.value) || 0)}
                className="w-full px-3 py-1.5 rounded-xl border border-stone-200 text-xs font-bold"
              />
            </div>
            <div>
              <label className="block text-[11px] font-semibold text-stone-700 mb-1">Min. Guarantee Plates</label>
              <input
                type="number"
                min={0}
                value={foodConfig.catering_minimum_guarantee}
                onChange={(e) => handleUpdateFoodConfig('catering_minimum_guarantee', parseInt(e.target.value) || 0)}
                className="w-full px-3 py-1.5 rounded-xl border border-stone-200 text-xs font-bold"
              />
            </div>
          </div>
        </div>
      )}

      {/* GENERAL BUDGET OVERVIEW */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="p-5 rounded-2xl bg-white border border-stone-200 shadow-xs space-y-1">
          <span className="text-xs font-medium text-stone-500">Allocated Across Categories</span>
          <p className="text-2xl font-bold font-serif text-stone-900">₹{totalAllocated.toLocaleString('en-IN')}</p>
          <p className="text-[11px] text-stone-400">Target Budget: ₹{activeEvent.target_budget?.toLocaleString('en-IN') || 0}</p>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-stone-200 shadow-xs space-y-1">
          <span className="text-xs font-medium text-stone-500">Actual Spent to Date</span>
          <p className="text-2xl font-bold font-serif text-[#800020]">₹{totalSpent.toLocaleString('en-IN')}</p>
          <p className="text-[11px] text-stone-400">{transactions.length} verified transactions recorded</p>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-emerald-300 shadow-xs space-y-1 bg-gradient-to-br from-white to-emerald-50/20">
          <span className="text-xs font-medium text-emerald-800">Remaining Cushion</span>
          <p className="text-2xl font-bold font-serif text-emerald-950">₹{remainingBudget.toLocaleString('en-IN')}</p>
          <p className="text-[11px] text-emerald-700">Available under target ceiling</p>
        </div>
      </div>

      {/* Categories Grid */}
      <div className="bg-white rounded-3xl border border-stone-200 p-6 shadow-xs space-y-4">
        <h3 className="font-bold font-serif text-sm text-stone-900">Budget Categories Ledger</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {categories.map((cat) => {
            const isOver = cat.spent_amount > cat.allocated_amount;
            return (
              <div
                key={cat.id}
                className={`p-4 rounded-2xl border transition ${
                  isOver ? 'bg-rose-50/40 border-rose-200' : 'bg-[#FAF7F2] border-stone-200'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="font-bold text-xs text-stone-900 truncate">{cat.name}</span>
                  {isOver && (
                    <span className="text-[10px] font-bold text-rose-700 bg-rose-100 px-2 py-0.5 rounded">
                      Overbudget
                    </span>
                  )}
                </div>

                <div className="space-y-1">
                  <div className="flex justify-between text-xs">
                    <span className="text-stone-500">Allocated:</span>
                    <span className="font-bold">₹{cat.allocated_amount.toLocaleString('en-IN')}</span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-stone-500">Spent:</span>
                    <span className={`font-bold ${isOver ? 'text-rose-600' : 'text-stone-800'}`}>
                      ₹{cat.spent_amount.toLocaleString('en-IN')}
                    </span>
                  </div>
                </div>

                <div className="w-full bg-stone-200 rounded-full h-1.5 mt-3 overflow-hidden">
                  <div
                    className={`h-full rounded-full ${isOver ? 'bg-rose-600' : 'bg-[#800020]'}`}
                    style={{ width: `${Math.min(100, (cat.spent_amount / (cat.allocated_amount || 1)) * 100)}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Transaction History */}
      <div className="bg-white rounded-3xl border border-stone-200 p-6 shadow-xs space-y-4">
        <h3 className="font-bold font-serif text-sm text-stone-900">
          Recorded Vendor Payments ({transactions.length})
        </h3>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-stone-600">
            <thead className="bg-[#FAF7F2] text-stone-800 uppercase font-bold text-[10px] tracking-wider border-b border-stone-200">
              <tr>
                <th className="py-2.5 px-3">Date</th>
                <th className="py-2.5 px-3">Category</th>
                <th className="py-2.5 px-3">Item / Description</th>
                <th className="py-2.5 px-3">Vendor</th>
                <th className="py-2.5 px-3">Amount</th>
                <th className="py-2.5 px-3 text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100">
              {transactions.map((tx) => (
                <tr key={tx.id} className="hover:bg-stone-50/60">
                  <td className="py-2.5 px-3 font-mono text-[11px]">{tx.paid_date}</td>
                  <td className="py-2.5 px-3 font-medium text-stone-800">{tx.category_name}</td>
                  <td className="py-2.5 px-3 font-bold text-stone-900">{tx.title}</td>
                  <td className="py-2.5 px-3">{tx.vendor_name || '—'}</td>
                  <td className="py-2.5 px-3 font-bold text-[#800020]">₹{tx.amount.toLocaleString('en-IN')}</td>
                  <td className="py-2.5 px-3 text-right">
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-emerald-50 text-emerald-800 border border-emerald-200">
                      ✓ {tx.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {transactions.length === 0 && (
            <p className="text-center py-6 text-xs text-stone-400">
              No transactions recorded yet. Click 'Record Expense' to add receipts.
            </p>
          )}
        </div>
      </div>

      {/* Modal: Add Expense Transaction */}
      {showAddTxModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-stone-200 space-y-4">
            <h3 className="font-bold font-serif text-lg text-stone-900">Record Vendor Expense</h3>
            <form onSubmit={handleAddTransaction} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">Expense Title / Item</label>
                <input
                  type="text"
                  required
                  value={newTx.title}
                  onChange={(e) => setNewTx({ ...newTx, title: e.target.value })}
                  placeholder="E.g. Stage Floral Decoration Advance"
                  className="w-full px-3 py-2 rounded-xl border border-stone-200 text-xs focus:outline-none focus:border-[#800020]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">Budget Category</label>
                <select
                  required
                  value={newTx.category_id}
                  onChange={(e) => setNewTx({ ...newTx, category_id: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-stone-200 text-xs focus:outline-none focus:border-[#800020]"
                >
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">Amount (₹)</label>
                <input
                  type="number"
                  required
                  min={1}
                  value={newTx.amount}
                  onChange={(e) => setNewTx({ ...newTx, amount: parseFloat(e.target.value) || 0 })}
                  className="w-full px-3 py-2 rounded-xl border border-stone-200 text-xs font-bold"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">Vendor / Service Provider</label>
                <input
                  type="text"
                  value={newTx.vendor_name || ''}
                  onChange={(e) => setNewTx({ ...newTx, vendor_name: e.target.value })}
                  placeholder="E.g. Royal Florists & Mandap"
                  className="w-full px-3 py-2 rounded-xl border border-stone-200 text-xs"
                />
              </div>

              <div className="pt-3 border-t flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddTxModal(false)}
                  className="px-4 py-2 text-xs font-semibold text-stone-600 hover:text-stone-900"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-[#800020] text-white font-bold text-xs shadow-md hover:bg-[#580c1f] transition cursor-pointer"
                >
                  Save Payment
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

