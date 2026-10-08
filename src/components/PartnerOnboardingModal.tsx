import React, { useState } from 'react';
import { X, Plus, Trash2 } from 'lucide-react';
import { MasterProduct } from '../types';
import {
  PartnerMaster,
  PartnerType,
  PartnerScale,
  AddressType,
  TierMetric,
  CommissionType,
  CommissionTier,
} from '../types/partner';
import { ALL_MASTER_PRODUCTS } from '../constants';
import { validatePartnerMaster, ValidationError } from '../utils/partnerValidation';
import { validateSlabs } from '../utils/commissionSlabs';

type MasterInput = Omit<PartnerMaster, 'id' | 'partnerCode' | 'status' | 'createdAt' | 'updatedAt'>;

interface CommissionDraft {
  product: MasterProduct;
  tierMetric: TierMetric;
  commissionType: CommissionType;
  effectiveFrom: string;
  tiers: Array<Omit<CommissionTier, 'id' | 'commissionId'>>;
}

interface PartnerOnboardingModalProps {
  isOpen: boolean;
  onClose: () => void;
  bdOwnerId: string;
  bdOwnerName: string;
  onSubmit: (master: MasterInput, commissions: CommissionDraft[]) => void;
}

const PARTNER_TYPES: PartnerType[] = ['Education Consultant', 'FX', 'DSA', 'Other'];
const PARTNER_SCALES: PartnerScale[] = ['Single Branch', 'Multi Branch'];
const ADDRESS_TYPES: AddressType[] = ['Head Office', 'Branch'];
const TIER_METRICS: TierMetric[] = [
  'Sanctioned Loan Amount',
  'Number of SIMs',
  'Number of Accounts',
  'Number of Bookings',
  'Booking Value',
  'Transfer Volume',
];

function emptyMaster(bdOwnerId: string, bdOwnerName: string): MasterInput {
  return {
    legalBusinessName: '',
    partnerType: 'Education Consultant',
    partnerScale: 'Single Branch',
    panNumber: '',
    cin: '',
    gstNumber: '',
    ownerName: '',
    ownerEmail: '',
    ownerPhone: '',
    contactPersonName: '',
    contactPersonEmail: '',
    contactPersonPhone: '',
    registeredAddress: { addressLine1: '', addressLine2: '', city: '', state: '', pincode: '', country: '' },
    operatingSameAsRegistered: true,
    addressType: 'Head Office',
    operatingAddress: undefined,
    bdOwnerId,
    bdOwnerName,
  };
}

export const PartnerOnboardingModal: React.FC<PartnerOnboardingModalProps> = ({
  isOpen,
  onClose,
  bdOwnerId,
  bdOwnerName,
  onSubmit,
}) => {
  const [step, setStep] = useState<'details' | 'commissions'>('details');
  const [master, setMaster] = useState<MasterInput>(emptyMaster(bdOwnerId, bdOwnerName));
  const [commissions, setCommissions] = useState<CommissionDraft[]>([]);
  const [errors, setErrors] = useState<ValidationError[]>([]);

  if (!isOpen) return null;

  const setField = (field: keyof MasterInput, value: unknown) =>
    setMaster((prev) => ({ ...prev, [field]: value }));

  const setRegistered = (field: string, value: string) =>
    setMaster((prev) => ({ ...prev, registeredAddress: { ...prev.registeredAddress, [field]: value } }));

  const setOperating = (field: string, value: string) =>
    setMaster((prev) => ({
      ...prev,
      operatingAddress: {
        addressLine1: '', city: '', state: '', pincode: '', country: '',
        ...prev.operatingAddress,
        [field]: value,
      },
    }));

  const addCommission = () =>
    setCommissions((prev) => [
      ...prev,
      {
        product: ALL_MASTER_PRODUCTS[0],
        tierMetric: 'Sanctioned Loan Amount',
        commissionType: 'Percentage',
        effectiveFrom: new Date().toISOString().slice(0, 10),
        tiers: [{ slabIndex: 0, fromValue: 0, toValue: null, commissionType: 'Percentage', commissionValue: 0 }],
      },
    ]);

  const updateCommission = (idx: number, patch: Partial<CommissionDraft>) =>
    setCommissions((prev) => prev.map((c, i) => (i === idx ? { ...c, ...patch } : c)));

  const addSlab = (ci: number) =>
    setCommissions((prev) =>
      prev.map((c, i) =>
        i === ci
          ? {
              ...c,
              tiers: [
                ...c.tiers,
                {
                  slabIndex: c.tiers.length,
                  fromValue: 0,
                  toValue: null,
                  commissionType: c.commissionType,
                  commissionValue: 0,
                },
              ],
            }
          : c
      )
    );

  const updateSlab = (ci: number, si: number, patch: Partial<CommissionTier>) =>
    setCommissions((prev) =>
      prev.map((c, i) =>
        i === ci ? { ...c, tiers: c.tiers.map((t, j) => (j === si ? { ...t, ...patch } : t)) } : c
      )
    );

  const removeSlab = (ci: number, si: number) =>
    setCommissions((prev) =>
      prev.map((c, i) => (i === ci ? { ...c, tiers: c.tiers.filter((_, j) => j !== si) } : c))
    );

  const handleNext = () => {
    const validationErrors = validatePartnerMaster(master);
    setErrors(validationErrors);
    if (validationErrors.length === 0) setStep('commissions');
  };

  const handleSubmit = () => {
    // Validate commission slabs before submitting
    for (const c of commissions) {
      const tiers = c.tiers.map((t, idx) => ({ ...t, id: 't', commissionId: 'c', slabIndex: idx }));
      const slabErrors = validateSlabs(tiers);
      if (slabErrors.length > 0) {
        setErrors(slabErrors);
        return;
      }
    }
    onSubmit(master, commissions);
    setMaster(emptyMaster(bdOwnerId, bdOwnerName));
    setCommissions([]);
    setErrors([]);
    setStep('details');
    onClose();
  };

  const inputCls =
    'px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent';

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-xl max-w-2xl w-full my-8">
        <div className="flex items-center justify-between border-b border-slate-200 p-4">
          <h2 className="text-lg font-bold text-slate-900">Onboard New Partner</h2>
          <button onClick={onClose} className="p-1 hover:bg-slate-100 rounded-lg">
            <X size={20} className="text-slate-600" />
          </button>
        </div>

        <div className="flex gap-1 border-b border-slate-200 px-4 py-2">
          {(['details', 'commissions'] as const).map((s, idx) => (
            <div
              key={s}
              className={`px-3 py-1.5 text-xs font-medium rounded-lg ${
                step === s ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-700'
              }`}
            >
              {idx + 1}. {s === 'details' ? 'Partner Details' : 'Commission Slabs'}
            </div>
          ))}
        </div>

        <div className="p-4 space-y-4 max-h-[calc(100vh-260px)] overflow-y-auto">
          {errors.length > 0 && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-xs text-red-700">
              {errors.map((e, i) => (
                <div key={i}>{e.field}: {e.message}</div>
              ))}
            </div>
          )}

          {step === 'details' && (
            <>
              <div className="grid grid-cols-2 gap-3">
                <input className={`${inputCls} col-span-2`} placeholder="Legal Business Name *"
                  value={master.legalBusinessName} onChange={(e) => setField('legalBusinessName', e.target.value)} />
                <select className={inputCls} value={master.partnerType}
                  onChange={(e) => setField('partnerType', e.target.value as PartnerType)}>
                  {PARTNER_TYPES.map((t) => <option key={t}>{t}</option>)}
                </select>
                <select className={inputCls} value={master.partnerScale}
                  onChange={(e) => setField('partnerScale', e.target.value as PartnerScale)}>
                  {PARTNER_SCALES.map((t) => <option key={t}>{t}</option>)}
                </select>
                <input className={inputCls} placeholder="PAN Number *"
                  value={master.panNumber} onChange={(e) => setField('panNumber', e.target.value.toUpperCase())} />
                <input className={inputCls} placeholder="CIN"
                  value={master.cin} onChange={(e) => setField('cin', e.target.value)} />
                <input className={`${inputCls} col-span-2`} placeholder="GST Number"
                  value={master.gstNumber} onChange={(e) => setField('gstNumber', e.target.value)} />
              </div>

              <h3 className="font-semibold text-sm text-slate-900 pt-2">Owner</h3>
              <div className="grid grid-cols-2 gap-3">
                <input className={inputCls} placeholder="Owner Name *" value={master.ownerName}
                  onChange={(e) => setField('ownerName', e.target.value)} />
                <input className={inputCls} placeholder="Owner Email *" value={master.ownerEmail}
                  onChange={(e) => setField('ownerEmail', e.target.value)} />
                <input className={`${inputCls} col-span-2`} placeholder="Owner Phone *" value={master.ownerPhone}
                  onChange={(e) => setField('ownerPhone', e.target.value)} />
              </div>

              <h3 className="font-semibold text-sm text-slate-900 pt-2">Contact Person</h3>
              <div className="grid grid-cols-2 gap-3">
                <input className={inputCls} placeholder="Contact Name *" value={master.contactPersonName}
                  onChange={(e) => setField('contactPersonName', e.target.value)} />
                <input className={inputCls} placeholder="Contact Email *" value={master.contactPersonEmail}
                  onChange={(e) => setField('contactPersonEmail', e.target.value)} />
                <input className={`${inputCls} col-span-2`} placeholder="Contact Phone *" value={master.contactPersonPhone}
                  onChange={(e) => setField('contactPersonPhone', e.target.value)} />
              </div>

              <h3 className="font-semibold text-sm text-slate-900 pt-2">Registered Address</h3>
              <div className="grid grid-cols-2 gap-3">
                <input className={`${inputCls} col-span-2`} placeholder="Address Line 1 *"
                  value={master.registeredAddress.addressLine1} onChange={(e) => setRegistered('addressLine1', e.target.value)} />
                <input className={`${inputCls} col-span-2`} placeholder="Address Line 2"
                  value={master.registeredAddress.addressLine2} onChange={(e) => setRegistered('addressLine2', e.target.value)} />
                <input className={inputCls} placeholder="City *" value={master.registeredAddress.city}
                  onChange={(e) => setRegistered('city', e.target.value)} />
                <input className={inputCls} placeholder="State *" value={master.registeredAddress.state}
                  onChange={(e) => setRegistered('state', e.target.value)} />
                <input className={inputCls} placeholder="Pincode *" value={master.registeredAddress.pincode}
                  onChange={(e) => setRegistered('pincode', e.target.value)} />
                <input className={inputCls} placeholder="Country *" value={master.registeredAddress.country}
                  onChange={(e) => setRegistered('country', e.target.value)} />
              </div>

              <div className="flex items-center gap-4 pt-2">
                <select className={inputCls} value={master.addressType}
                  onChange={(e) => setField('addressType', e.target.value as AddressType)}>
                  {ADDRESS_TYPES.map((t) => <option key={t}>{t}</option>)}
                </select>
                <label className="flex items-center gap-2 text-sm text-slate-700">
                  <input type="checkbox" checked={master.operatingSameAsRegistered}
                    onChange={(e) => setField('operatingSameAsRegistered', e.target.checked)} />
                  Operating address same as registered
                </label>
              </div>

              {!master.operatingSameAsRegistered && (
                <>
                  <h3 className="font-semibold text-sm text-slate-900 pt-2">Operating Address</h3>
                  <div className="grid grid-cols-2 gap-3">
                    <input className={`${inputCls} col-span-2`} placeholder="Address Line 1 *"
                      value={master.operatingAddress?.addressLine1 || ''} onChange={(e) => setOperating('addressLine1', e.target.value)} />
                    <input className={inputCls} placeholder="City *" value={master.operatingAddress?.city || ''}
                      onChange={(e) => setOperating('city', e.target.value)} />
                    <input className={inputCls} placeholder="State *" value={master.operatingAddress?.state || ''}
                      onChange={(e) => setOperating('state', e.target.value)} />
                    <input className={inputCls} placeholder="Pincode *" value={master.operatingAddress?.pincode || ''}
                      onChange={(e) => setOperating('pincode', e.target.value)} />
                    <input className={inputCls} placeholder="Country *" value={master.operatingAddress?.country || ''}
                      onChange={(e) => setOperating('country', e.target.value)} />
                  </div>
                </>
              )}
            </>
          )}

          {step === 'commissions' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <p className="text-xs text-slate-600">Configure tiered commission per product (optional at submit).</p>
                <button onClick={addCommission}
                  className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-white bg-slate-900 rounded-lg">
                  <Plus size={14} /> Add Product
                </button>
              </div>

              {commissions.map((c, ci) => (
                <div key={ci} className="border border-slate-200 rounded-lg p-3 space-y-3">
                  <div className="grid grid-cols-3 gap-2">
                    <select className={inputCls} value={c.product}
                      onChange={(e) => updateCommission(ci, { product: e.target.value as MasterProduct })}>
                      {ALL_MASTER_PRODUCTS.map((p) => <option key={p}>{p}</option>)}
                    </select>
                    <select className={inputCls} value={c.tierMetric}
                      onChange={(e) => updateCommission(ci, { tierMetric: e.target.value as TierMetric })}>
                      {TIER_METRICS.map((m) => <option key={m}>{m}</option>)}
                    </select>
                    <select className={inputCls} value={c.commissionType}
                      onChange={(e) => updateCommission(ci, { commissionType: e.target.value as CommissionType })}>
                      <option>Percentage</option>
                      <option>Flat</option>
                    </select>
                  </div>

                  <div className="space-y-2">
                    {c.tiers.map((t, si) => (
                      <div key={si} className="flex items-center gap-2">
                        <input type="number" className={`${inputCls} w-24`} placeholder="From"
                          value={t.fromValue} onChange={(e) => updateSlab(ci, si, { fromValue: Number(e.target.value) })} />
                        <input type="number" className={`${inputCls} w-24`} placeholder="To (blank=∞)"
                          value={t.toValue ?? ''} onChange={(e) => updateSlab(ci, si, { toValue: e.target.value === '' ? null : Number(e.target.value) })} />
                        <input type="number" step="0.01" className={`${inputCls} w-24`} placeholder="Value"
                          value={t.commissionValue} onChange={(e) => updateSlab(ci, si, { commissionValue: Number(e.target.value) })} />
                        <span className="text-xs text-slate-500">{c.commissionType === 'Percentage' ? '%' : '₹/unit'}</span>
                        <button onClick={() => removeSlab(ci, si)} className="p-1 text-red-500 hover:bg-red-50 rounded">
                          <Trash2 size={14} />
                        </button>
                      </div>
                    ))}
                    <button onClick={() => addSlab(ci)} className="text-xs text-blue-600 hover:underline">
                      + Add slab
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="flex justify-between p-4 border-t border-slate-200">
          <button onClick={onClose} className="px-4 py-2 text-sm font-medium text-slate-700 bg-slate-100 rounded-lg">
            Cancel
          </button>
          <div className="flex gap-2">
            {step === 'commissions' && (
              <button onClick={() => setStep('details')} className="px-4 py-2 text-sm font-medium text-slate-700 bg-slate-100 rounded-lg">
                Back
              </button>
            )}
            {step === 'details' ? (
              <button onClick={handleNext} className="px-4 py-2 text-sm font-medium text-white bg-slate-900 rounded-lg">
                Next
              </button>
            ) : (
              <button onClick={handleSubmit} className="px-4 py-2 text-sm font-medium text-white bg-slate-900 rounded-lg">
                Submit for Approval
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
