import React, { useState } from 'react';
import { X, Plus, Trash2 } from 'lucide-react';
import { Partner, MasterProduct, PartnerProductCommission, PartnerCommissionSlab } from '../types';

interface CommissionEditorModalProps {
  isOpen: boolean;
  onClose: () => void;
  partner: Partner | null;
  /** 'head' applies directly; makers submit a change request for Head approval. */
  userRole: 'head' | 'maker';
  /** True when a pending change request already exists (blocks new submissions). */
  hasPendingRequest?: boolean;
  onSave: (partnerId: string, commissions: PartnerProductCommission[]) => void;
}

const PRODUCT_OPTIONS: MasterProduct[] = [
  'Education Loan',
  'eSIM',
  'Accommodation',
  'Insurance',
  'Bank Account',
  'Credit Card',
];

const TIER_METRICS = [
  'Sanctioned Loan Amount',
  'Number of SIMs',
  'Number of Accounts',
  'Number of Bookings',
  'Booking Value',
  'Transfer Volume',
];

const MAX_SLABS = 5;
const inputCls =
  'px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent';

function fromExisting(partner: Partner): PartnerProductCommission[] {
  // Prefer the richer slab structure if present; otherwise derive from the flat commissions.
  if (partner.commissionSlabs && partner.commissionSlabs.length > 0) {
    return JSON.parse(JSON.stringify(partner.commissionSlabs));
  }
  return (partner.commissions || []).map((c) => ({
    product: c.product,
    commissionType: c.type === 'Fixed' ? 'Fixed' : 'Percentage',
    tierMetric: 'Sanctioned Loan Amount',
    slabs: [{ from: 0, to: null, value: c.value }],
  }));
}

export const CommissionEditorModal: React.FC<CommissionEditorModalProps> = ({
  isOpen,
  onClose,
  partner,
  userRole,
  hasPendingRequest = false,
  onSave,
}) => {
  const [rows, setRows] = useState<PartnerProductCommission[]>([]);

  // Re-seed when a new partner is opened
  React.useEffect(() => {
    if (partner) setRows(fromExisting(partner));
  }, [partner]);

  if (!isOpen || !partner) return null;

  const update = (ci: number, patch: Partial<PartnerProductCommission>) =>
    setRows((prev) => prev.map((r, i) => (i === ci ? { ...r, ...patch } : r)));

  const updateSlab = (ci: number, si: number, patch: Partial<PartnerCommissionSlab>) =>
    setRows((prev) =>
      prev.map((r, i) =>
        i === ci ? { ...r, slabs: r.slabs.map((s, j) => (j === si ? { ...s, ...patch } : s)) } : r
      )
    );

  const addSlab = (ci: number) =>
    setRows((prev) =>
      prev.map((r, i) =>
        i === ci && r.slabs.length < MAX_SLABS
          ? { ...r, slabs: [...r.slabs, { from: 0, to: null, value: 0 }] }
          : r
      )
    );

  const removeSlab = (ci: number, si: number) =>
    setRows((prev) =>
      prev.map((r, i) => (i === ci ? { ...r, slabs: r.slabs.filter((_, j) => j !== si) } : r))
    );

  const defaultTierMetric = (product: string): string => {
    switch (product) {
      case 'eSIM': return 'Number of SIMs';
      case 'Bank Account': return 'Number of Accounts';
      case 'Accommodation': return 'Number of Bookings';
      default: return 'Sanctioned Loan Amount';
    }
  };

  const toggleProduct = (product: MasterProduct) =>
    setRows((prev) => {
      const exists = prev.some((r) => r.product === product);
      if (exists) return prev.filter((r) => r.product !== product);
      return [
        ...prev,
        {
          product,
          commissionType: 'Percentage',
          tierMetric: defaultTierMetric(product),
          slabs: [{ from: 0, to: null, value: 0 }],
        },
      ];
    });

  const handleSave = () => {
    // Validation intentionally removed — save/submit freely (matches onboarding).
    onSave(partner.id, rows);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-xl max-w-2xl w-full my-8">
        <div className="flex items-center justify-between border-b border-slate-200 p-4">
          <div>
            <h2 className="text-lg font-bold text-slate-900">
              {userRole === 'head' ? 'Edit Commissions' : 'Request Commission Change'}
            </h2>
            <p className="text-xs text-slate-600 mt-0.5">
              {partner.businessName}
              {userRole === 'maker' && ' · changes require Head approval'}
            </p>
          </div>
          <button onClick={onClose} className="p-1 hover:bg-slate-100 rounded-lg">
            <X size={20} className="text-slate-600" />
          </button>
        </div>

        <div className="p-4 space-y-5 max-h-[calc(100vh-220px)] overflow-y-auto">
          {userRole === 'maker' && hasPendingRequest && (
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-2 text-xs text-amber-700">
              A commission change request is already pending Head approval. You can't submit another until it's resolved.
            </div>
          )}

          {/* Select products — horizontal chip menu */}
          <div>
            <h3 className="text-sm font-semibold text-slate-900">Select Products</h3>
            <p className="text-xs text-slate-500 mt-0.5 mb-2">Choose the products this partner can earn commission on.</p>
            <div className="flex flex-wrap gap-2">
              {PRODUCT_OPTIONS.map((p) => {
                const selected = rows.some((r) => r.product === p);
                return (
                  <button
                    key={p}
                    type="button"
                    onClick={() => toggleProduct(p)}
                    className={`px-3 py-1.5 text-xs font-medium rounded-full border transition-all ${
                      selected
                        ? 'bg-slate-900 text-white border-slate-900'
                        : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    {selected ? '✓ ' : '+ '}{p}
                  </button>
                );
              })}
            </div>
          </div>

          {rows.length === 0 && (
            <p className="text-xs text-slate-400 text-center py-4 border border-dashed border-slate-200 rounded-lg">
              No products selected yet. Pick one above to set commissions.
            </p>
          )}

          {rows.map((r, ci) => (
            <div key={ci} className="border border-slate-200 rounded-lg overflow-hidden">
              {/* Product header row: name + tier metric + commission type */}
              <div className="flex items-center justify-between gap-3 bg-slate-50 px-3 py-2 border-b border-slate-200">
                <div className="flex items-center gap-3">
                  <span className="text-sm font-semibold text-slate-900">{r.product}</span>
                  <select
                    className="px-2 py-1 text-xs border border-slate-200 rounded-md bg-white focus:ring-2 focus:ring-blue-500"
                    value={r.tierMetric}
                    onChange={(e) => update(ci, { tierMetric: e.target.value })}
                  >
                    {TIER_METRICS.map((m) => <option key={m}>{m}</option>)}
                  </select>
                </div>
                <div className="inline-flex items-center p-0.5 bg-white border border-slate-200 rounded-lg">
                  {(['Percentage', 'Fixed'] as const).map((ct) => (
                    <button
                      key={ct}
                      type="button"
                      onClick={() => update(ci, { commissionType: ct })}
                      className={`px-2.5 py-1 text-xs font-medium rounded-md transition-all ${
                        r.commissionType === ct ? 'bg-slate-900 text-white' : 'text-slate-500 hover:text-slate-700'
                      }`}
                    >
                      {ct === 'Percentage' ? '%' : 'Flat'}
                    </button>
                  ))}
                </div>
              </div>

              {/* Slabs table */}
              <div className="p-3">
                <div className="grid grid-cols-[1fr_1fr_1fr_auto] gap-2 text-[11px] font-semibold text-slate-400 uppercase px-1 pb-1">
                  <span>From</span>
                  <span>To</span>
                  <span>{r.commissionType === 'Percentage' ? 'Commission %' : 'Commission ₹/unit'}</span>
                  <span className="w-6" />
                </div>
                <div className="space-y-2">
                  {r.slabs.map((s, si) => {
                    const isLast = si === r.slabs.length - 1;
                    return (
                      <div key={si} className="grid grid-cols-[1fr_1fr_1fr_auto] gap-2 items-center">
                        <input type="number" className={inputCls} placeholder="0"
                          value={s.from === 0 ? '' : s.from} onChange={(e) => updateSlab(ci, si, { from: e.target.value === '' ? 0 : Number(e.target.value) })} />
                        {isLast && s.to === null ? (
                          <div className="flex items-center">
                            <span className="px-3 py-2 text-sm text-slate-500 bg-slate-50 border border-slate-200 rounded-lg w-full">No limit</span>
                          </div>
                        ) : (
                          <input type="number" className={inputCls} placeholder="Upper limit"
                            value={s.to ?? ''} onChange={(e) => updateSlab(ci, si, { to: e.target.value === '' ? null : Number(e.target.value) })} />
                        )}
                        <input type="number" step="0.01" className={inputCls} placeholder="0"
                          value={s.value === 0 ? '' : s.value} onChange={(e) => updateSlab(ci, si, { value: e.target.value === '' ? 0 : Number(e.target.value) })} />
                        {r.slabs.length > 1 ? (
                          <button onClick={() => removeSlab(ci, si)} className="p-1 text-red-400 hover:text-red-600 hover:bg-red-50 rounded">
                            <Trash2 size={14} />
                          </button>
                        ) : <span className="w-6" />}
                      </div>
                    );
                  })}
                </div>
                {r.slabs.length < MAX_SLABS ? (
                  <button onClick={() => addSlab(ci)}
                    className="inline-flex items-center gap-1 text-xs font-medium text-blue-600 hover:underline mt-2">
                    <Plus size={12} /> Add slab ({r.slabs.length}/{MAX_SLABS})
                  </button>
                ) : (
                  <p className="text-[11px] text-slate-400">Maximum of {MAX_SLABS} slabs reached</p>
                )}
              </div>
            </div>
          ))}
        </div>

        <div className="flex justify-end gap-2 p-4 border-t border-slate-200">
          <button onClick={onClose} className="px-4 py-2 text-sm font-medium text-slate-700 bg-slate-100 rounded-lg">
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={userRole === 'maker' && hasPendingRequest}
            className="px-4 py-2 text-sm font-medium text-white bg-slate-900 disabled:bg-slate-300 rounded-lg"
          >
            {userRole === 'head' ? 'Save Commissions' : 'Submit for Approval'}
          </button>
        </div>
      </div>
    </div>
  );
};
