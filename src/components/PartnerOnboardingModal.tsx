import React, { useState } from 'react';
import { X, Plus, Trash2, Upload, FileText } from 'lucide-react';
import { MasterProduct } from '../types';
import {
  PartnerMaster,
  PartnerContact,
  PartnerType,
  PartnerScale,
  AddressType,
  TierMetric,
  CommissionType,
  CommissionTier,
  CountryPotential,
  PARTNER_PRODUCTS,
} from '../types/partner';


type MasterInput = Omit<PartnerMaster, 'id' | 'partnerCode' | 'status' | 'createdAt' | 'updatedAt'>;

interface CommissionDraft {
  product: MasterProduct;
  tierMetric: TierMetric;
  commissionType: CommissionType;
  effectiveFrom: string;
  tiers: Array<Omit<CommissionTier, 'id' | 'commissionId'>>;
}

export type DocDraftType = 'PAN' | 'CIN' | 'GST' | 'Agreement' | 'Other';

export interface DocumentDraft {
  type: DocDraftType;
  fileName: string;
}

export interface HeadOfficeOption {
  id: string;
  name: string;
  panNumber: string;
  gstNumber?: string;
  cin?: string;
}

interface PartnerOnboardingModalProps {
  isOpen: boolean;
  onClose: () => void;
  bdOwnerId: string;
  bdOwnerName: string;
  /** Existing Head Office partners a branch can be linked to. */
  headOffices?: HeadOfficeOption[];
  onSubmit: (master: MasterInput, commissions: CommissionDraft[], documents: DocumentDraft[]) => void;
}

const PARTNER_TYPES: PartnerType[] = [
  'Education Loan',
  'eSIM',
  'Accommodation',
  'Insurance',
  'Bank Account',
  'Credit Card',
];
const PRODUCT_OPTIONS = PARTNER_PRODUCTS as readonly string[];
const PARTNER_SCALES: PartnerScale[] = ['Single Branch', 'Multi Branch', 'Franchise'];
const SUGGESTED_COUNTRIES = ['USA', 'UK', 'Canada', 'Australia', 'Germany', 'Others'];
const ADDRESS_TYPES: AddressType[] = ['Head Office', 'Branch'];
const TIER_METRICS: TierMetric[] = [
  'Sanctioned Loan Amount',
  'Number of SIMs',
  'Number of Accounts',
  'Number of Bookings',
  'Booking Value',
  'Transfer Volume',
];

function blankMaster(bdOwnerId: string, bdOwnerName: string): MasterInput {
  return {
    legalBusinessName: '',
    partnerType: '' as PartnerType, // unselected — user must choose
    partnerScale: '' as PartnerScale, // unselected — user must choose
    panNumber: '',
    cin: '',
    gstNumber: '',
    ownerName: '',
    ownerEmail: '',
    ownerPhone: '',
    contactSameAsOwner: false,
    contacts: [{ name: '', designation: '', email: '', phone: '' }],
    officeType: '' as AddressType, // Head Office / Branch — chosen for Multi Branch / Franchise
    parentPartnerId: undefined,
    registeredAddress: { addressLine1: '', addressLine2: '', city: '', state: '', pincode: '', country: '' },
    operatingSameAsRegistered: true,
    addressType: '' as AddressType, // unselected — user must choose
    operatingAddress: undefined,
    bdOwnerId,
    bdOwnerName,
    countryPotential: [],
  };
}

export const PartnerOnboardingModal: React.FC<PartnerOnboardingModalProps> = ({
  isOpen,
  onClose,
  bdOwnerId,
  bdOwnerName,
  headOffices = [],
  onSubmit,
}) => {
  const [step, setStep] = useState<'details' | 'potential' | 'commissions' | 'documents'>('details');
  const [master, setMaster] = useState<MasterInput>(blankMaster(bdOwnerId, bdOwnerName));
  const [commissions, setCommissions] = useState<CommissionDraft[]>([]);
  const [documents, setDocuments] = useState<DocumentDraft[]>([]);

  if (!isOpen) return null;

  const setField = (field: keyof MasterInput, value: unknown) =>
    setMaster((prev) => ({ ...prev, [field]: value }));

  // Multi-branch / franchise models can be a Head Office or a Branch.
  const showOfficeType = master.partnerScale === 'Multi Branch' || master.partnerScale === 'Franchise';
  // A linked branch inherits legal identity from its parent Head Office.
  const isLinkedBranch =
    showOfficeType && master.officeType === 'Branch' && !!master.parentPartnerId;

  const setRegistered = (field: string, value: string) =>
    setMaster((prev) => ({ ...prev, registeredAddress: { ...prev.registeredAddress, [field]: value } }));

  const updateContact = (idx: number, patch: Partial<PartnerContact>) =>
    setMaster((prev) => ({
      ...prev,
      contacts: prev.contacts.map((c, i) => (i === idx ? { ...c, ...patch } : c)),
    }));

  const addContact = () =>
    setMaster((prev) => ({
      ...prev,
      contacts: [...prev.contacts, { name: '', designation: '', email: '', phone: '' }],
    }));

  const removeContact = (idx: number) =>
    setMaster((prev) => ({ ...prev, contacts: prev.contacts.filter((_, i) => i !== idx) }));

  const toggleContactSameAsOwner = (same: boolean) =>
    setMaster((prev) => ({
      ...prev,
      contactSameAsOwner: same,
      contacts: same ? [] : (prev.contacts.length ? prev.contacts : [{ name: '', designation: '', email: '', phone: '' }]),
    }));

  // Documents: "upload" simulated by capturing a file name
  const handleDocFile = (type: DocDraftType, file: File | null) => {
    if (!file) return;
    setDocuments((prev) => {
      const rest = prev.filter((d) => !(d.type === type && type !== 'Other'));
      return [...rest, { type, fileName: file.name }];
    });
  };
  const removeDoc = (type: DocDraftType, fileName: string) =>
    setDocuments((prev) => prev.filter((d) => !(d.type === type && d.fileName === fileName)));

  const setOperating = (field: string, value: string) =>
    setMaster((prev) => ({
      ...prev,
      operatingAddress: {
        addressLine1: '', city: '', state: '', pincode: '', country: '',
        ...prev.operatingAddress,
        [field]: value,
      },
    }));

  // Country-wise business potential
  const countryPotential: CountryPotential[] = master.countryPotential || [];
  const addCountry = (country: string) =>
    setMaster((prev) => {
      const list = prev.countryPotential || [];
      // Allow multiple blank rows; only dedupe named countries.
      if (country && list.some((c) => c.country.toLowerCase() === country.toLowerCase())) return prev;
      return { ...prev, countryPotential: [...list, { country, studentsPerYear: 0 }] };
    });
  const updateCountry = (idx: number, patch: Partial<CountryPotential>) =>
    setMaster((prev) => ({
      ...prev,
      countryPotential: (prev.countryPotential || []).map((c, i) => (i === idx ? { ...c, ...patch } : c)),
    }));
  const removeCountry = (idx: number) =>
    setMaster((prev) => ({
      ...prev,
      countryPotential: (prev.countryPotential || []).filter((_, i) => i !== idx),
    }));

  // Sensible default tier metric per product
  const defaultTierMetric = (product: string): TierMetric => {
    switch (product) {
      case 'eSIM': return 'Number of SIMs';
      case 'Bank Account': return 'Number of Accounts';
      case 'Accommodation': return 'Number of Bookings';
      default: return 'Sanctioned Loan Amount';
    }
  };

  const toggleProduct = (product: MasterProduct) =>
    setCommissions((prev) => {
      const exists = prev.some((c) => c.product === product);
      if (exists) return prev.filter((c) => c.product !== product);
      return [
        ...prev,
        {
          product,
          tierMetric: defaultTierMetric(product),
          commissionType: 'Percentage',
          effectiveFrom: new Date().toISOString().slice(0, 10),
          tiers: [{ slabIndex: 0, fromValue: 0, toValue: null, commissionType: 'Percentage', commissionValue: 0 }],
        },
      ];
    });

  const updateCommission = (idx: number, patch: Partial<CommissionDraft>) =>
    setCommissions((prev) => prev.map((c, i) => (i === idx ? { ...c, ...patch } : c)));

  const MAX_SLABS = 5;
  const addSlab = (ci: number) =>
    setCommissions((prev) =>
      prev.map((c, i) =>
        i === ci && c.tiers.length < MAX_SLABS
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

  // Build the master to validate/submit: derive addressType from office type,
  // and inherit legal identity from the parent head office for linked branches.
  const buildEffectiveMaster = (): MasterInput => {
    const addressType: AddressType = showOfficeType
      ? (master.officeType || ('Head Office' as AddressType))
      : ('Head Office' as AddressType);

    if (isLinkedBranch) {
      const parent = headOffices.find((h) => h.id === master.parentPartnerId);
      return {
        ...master,
        addressType,
        panNumber: parent?.panNumber || master.panNumber,
        gstNumber: parent?.gstNumber ?? master.gstNumber,
        cin: parent?.cin ?? master.cin,
        // owner inherited from parent is not surfaced here; keep whatever exists
      };
    }
    return { ...master, addressType };
  };

  const handleSubmit = () => {
    // Validation intentionally removed — submit freely.
    onSubmit(buildEffectiveMaster(), commissions, documents);
    setMaster(blankMaster(bdOwnerId, bdOwnerName));
    setCommissions([]);
    setDocuments([]);
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
          {(['details', 'potential', 'commissions', 'documents'] as const).map((s, idx) => (
            <div
              key={s}
              className={`px-3 py-1.5 text-xs font-medium rounded-lg ${
                step === s ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-700'
              }`}
            >
              {idx + 1}.{' '}
              {s === 'details'
                ? 'Partner Details'
                : s === 'potential'
                ? 'Business Potential'
                : s === 'commissions'
                ? 'Commission & Products'
                : 'Documents'}
            </div>
          ))}
        </div>

        <div className="p-4 space-y-4 max-h-[calc(100vh-260px)] overflow-y-auto">
          {step === 'details' && (
            <>
              <div className="grid grid-cols-2 gap-3">
                <input className={`${inputCls} col-span-2`} placeholder="Legal Business Name *"
                  value={master.legalBusinessName} onChange={(e) => setField('legalBusinessName', e.target.value)} />
                <select
                  className={`${inputCls} ${!master.partnerType ? 'text-slate-400' : ''}`}
                  value={master.partnerType}
                  onChange={(e) => setField('partnerType', e.target.value as PartnerType)}
                >
                  <option value="" disabled>Select partner type</option>
                  {PARTNER_TYPES.map((t) => <option key={t} value={t} className="text-slate-900">{t}</option>)}
                </select>
                <select
                  className={`${inputCls} ${!master.partnerScale ? 'text-slate-400' : ''}`}
                  value={master.partnerScale}
                  onChange={(e) => {
                    const scale = e.target.value as PartnerScale;
                    // Reset office/parent when scale changes
                    setMaster((prev) => ({
                      ...prev,
                      partnerScale: scale,
                      officeType: '' as AddressType,
                      parentPartnerId: undefined,
                    }));
                  }}
                >
                  <option value="" disabled>Select partner scale</option>
                  {PARTNER_SCALES.map((t) => <option key={t} value={t} className="text-slate-900">{t}</option>)}
                </select>
              </div>

              {/* Office Type (only for Multi Branch / Franchise) */}
              {showOfficeType && (
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-[11px] font-semibold text-slate-500 uppercase">Office Type</label>
                    <select
                      className={`${inputCls} w-full mt-1 ${!master.officeType ? 'text-slate-400' : ''}`}
                      value={master.officeType}
                      onChange={(e) =>
                        setMaster((prev) => ({
                          ...prev,
                          officeType: e.target.value as AddressType,
                          parentPartnerId: undefined,
                        }))
                      }
                    >
                      <option value="" disabled>Select office type</option>
                      {ADDRESS_TYPES.map((t) => <option key={t} value={t} className="text-slate-900">{t}</option>)}
                    </select>
                  </div>
                  {master.officeType === 'Branch' && (
                    <div>
                      <label className="text-[11px] font-semibold text-slate-500 uppercase">Parent Head Office</label>
                      <select
                        className={`${inputCls} w-full mt-1 ${!master.parentPartnerId ? 'text-slate-400' : ''}`}
                        value={master.parentPartnerId || ''}
                        onChange={(e) => setField('parentPartnerId', e.target.value || undefined)}
                      >
                        <option value="">Head office not registered yet</option>
                        {headOffices.map((h) => (
                          <option key={h.id} value={h.id} className="text-slate-900">{h.name} ({h.panNumber})</option>
                        ))}
                      </select>
                    </div>
                  )}
                </div>
              )}

              {isLinkedBranch ? (
                <p className="text-xs text-slate-500 bg-slate-50 border border-slate-200 rounded-lg p-3">
                  Legal identity (PAN, GST, CIN) and owner will be inherited from the selected head office. Only enter the branch's contact person and address below.
                </p>
              ) : (
                <>
                  <div className="grid grid-cols-2 gap-3">
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
                </>
              )}

              <div className="flex items-center justify-between pt-2">
                <h3 className="font-semibold text-sm text-slate-900">Contact Person</h3>
                <label className="flex items-center gap-2 text-xs text-slate-600 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={master.contactSameAsOwner}
                    onChange={(e) => toggleContactSameAsOwner(e.target.checked)}
                  />
                  Owner is the contact (single-person shop)
                </label>
              </div>

              {master.contactSameAsOwner ? (
                <p className="text-xs text-slate-500 bg-slate-50 border border-slate-200 rounded-lg p-3">
                  Contact details will use the owner's name, email, and phone. No separate contact person needed.
                </p>
              ) : (
                <div className="space-y-3">
                  {master.contacts.map((c, i) => (
                    <div key={i} className="border border-slate-200 rounded-lg p-3 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-[11px] font-semibold text-slate-500 uppercase">
                          Contact {i + 1}
                        </span>
                        {master.contacts.length > 1 && (
                          <button onClick={() => removeContact(i)} className="p-1 text-red-500 hover:bg-red-50 rounded">
                            <Trash2 size={14} />
                          </button>
                        )}
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <input className={inputCls} placeholder="Contact Name *" value={c.name}
                          onChange={(e) => updateContact(i, { name: e.target.value })} />
                        <input className={inputCls} placeholder="Designation *" value={c.designation}
                          onChange={(e) => updateContact(i, { designation: e.target.value })} />
                        <input className={inputCls} placeholder="Contact Email *" value={c.email}
                          onChange={(e) => updateContact(i, { email: e.target.value })} />
                        <input className={inputCls} placeholder="Contact Phone *" value={c.phone}
                          onChange={(e) => updateContact(i, { phone: e.target.value })} />
                      </div>
                    </div>
                  ))}
                  <button
                    onClick={addContact}
                    className="inline-flex items-center gap-1 text-xs font-medium text-blue-600 hover:underline"
                  >
                    <Plus size={12} /> Add contact person
                  </button>
                </div>
              )}

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

              {/* Branch Address */}
              <div className="flex items-center justify-between pt-2">
                <h3 className="font-semibold text-sm text-slate-900">Branch Address</h3>
                <label className="flex items-center gap-2 text-xs text-slate-600 cursor-pointer">
                  <input type="checkbox" checked={master.operatingSameAsRegistered}
                    onChange={(e) => setField('operatingSameAsRegistered', e.target.checked)} />
                  Same as registered
                </label>
              </div>

              {master.operatingSameAsRegistered ? (
                <p className="text-xs text-slate-500 bg-slate-50 border border-slate-200 rounded-lg p-3">
                  Branch address will use the registered address.
                </p>
              ) : (
                <div className="grid grid-cols-2 gap-3">
                  <input className={`${inputCls} col-span-2`} placeholder="Address Line 1 *"
                    value={master.operatingAddress?.addressLine1 || ''} onChange={(e) => setOperating('addressLine1', e.target.value)} />
                  <input className={`${inputCls} col-span-2`} placeholder="Address Line 2"
                    value={master.operatingAddress?.addressLine2 || ''} onChange={(e) => setOperating('addressLine2', e.target.value)} />
                  <input className={inputCls} placeholder="City *" value={master.operatingAddress?.city || ''}
                    onChange={(e) => setOperating('city', e.target.value)} />
                  <input className={inputCls} placeholder="State *" value={master.operatingAddress?.state || ''}
                    onChange={(e) => setOperating('state', e.target.value)} />
                  <input className={inputCls} placeholder="Pincode *" value={master.operatingAddress?.pincode || ''}
                    onChange={(e) => setOperating('pincode', e.target.value)} />
                  <input className={inputCls} placeholder="Country *" value={master.operatingAddress?.country || ''}
                    onChange={(e) => setOperating('country', e.target.value)} />
                </div>
              )}
            </>
          )}

          {step === 'potential' && (
            <div className="space-y-4">
              <div>
                <h3 className="text-sm font-semibold text-slate-900">Country-wise Business Potential</h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Add each destination country and the estimated number of students per year this partner can send.
                </p>
              </div>

              {countryPotential.length === 0 && (
                <p className="text-xs text-slate-400 text-center py-4 border border-dashed border-slate-200 rounded-lg">
                  No countries added yet. Use "Add country" below to begin.
                </p>
              )}

              {countryPotential.length > 0 && (
                <div className="space-y-2">
                  <div className="grid grid-cols-[1fr_1fr_auto] gap-2 text-[11px] font-semibold text-slate-400 uppercase px-1">
                    <span>Country</span>
                    <span>No. of students / year</span>
                    <span className="w-6" />
                  </div>
                  {countryPotential.map((c, i) => {
                    // Countries already chosen in other rows should be disabled in this row's dropdown.
                    const takenElsewhere = countryPotential
                      .filter((_, j) => j !== i)
                      .map((x) => x.country);
                    return (
                      <div key={i} className="grid grid-cols-[1fr_1fr_auto] gap-2 items-center">
                        <select
                          className={`${inputCls} ${!c.country ? 'text-slate-400' : ''}`}
                          value={c.country}
                          onChange={(e) => updateCountry(i, { country: e.target.value })}
                        >
                          <option value="" disabled>Select country</option>
                          {SUGGESTED_COUNTRIES.map((name) => (
                            <option
                              key={name}
                              value={name}
                              disabled={takenElsewhere.includes(name)}
                              className="text-slate-900"
                            >
                              {name}
                            </option>
                          ))}
                        </select>
                        <input type="number" min={0} className={inputCls} placeholder="0" value={c.studentsPerYear === 0 ? '' : c.studentsPerYear}
                          onChange={(e) => updateCountry(i, { studentsPerYear: e.target.value === '' ? 0 : Number(e.target.value) })} />
                        <button onClick={() => removeCountry(i)} className="p-1 text-red-400 hover:text-red-600 hover:bg-red-50 rounded">
                          <Trash2 size={14} />
                        </button>
                      </div>
                    );
                  })}
                </div>
              )}

              <button
                onClick={() => addCountry('')}
                className="inline-flex items-center gap-1 text-xs font-medium text-blue-600 hover:underline"
              >
                <Plus size={12} /> Add country
              </button>
            </div>
          )}

          {step === 'commissions' && (
            <div className="space-y-5">
              {/* Select products — horizontal chip menu */}
              <div>
                <h3 className="text-sm font-semibold text-slate-900">Select Products</h3>
                <p className="text-xs text-slate-500 mt-0.5 mb-2">Choose the products this partner can earn commission on.</p>
                <div className="flex flex-wrap gap-2">
                  {PRODUCT_OPTIONS.map((p) => {
                    const selected = commissions.some((c) => c.product === p);
                    return (
                      <button
                        key={p}
                        type="button"
                        onClick={() => toggleProduct(p as MasterProduct)}
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

              {commissions.length === 0 && (
                <p className="text-xs text-slate-400 text-center py-4 border border-dashed border-slate-200 rounded-lg">
                  No products selected yet. Pick one above to set commissions.
                </p>
              )}

              {commissions.map((c, ci) => (
                <div key={ci} className="border border-slate-200 rounded-lg overflow-hidden">
                  {/* Product header row: name + tier metric + commission type */}
                  <div className="flex items-center justify-between gap-3 bg-slate-50 px-3 py-2 border-b border-slate-200">
                    <div className="flex items-center gap-3">
                      <span className="text-sm font-semibold text-slate-900">{c.product}</span>
                      <select
                        className="px-2 py-1 text-xs border border-slate-200 rounded-md bg-white focus:ring-2 focus:ring-blue-500"
                        value={c.tierMetric}
                        onChange={(e) => updateCommission(ci, { tierMetric: e.target.value as TierMetric })}
                      >
                        {TIER_METRICS.map((m) => <option key={m}>{m}</option>)}
                      </select>
                    </div>
                    <div className="inline-flex items-center p-0.5 bg-white border border-slate-200 rounded-lg">
                      {(['Percentage', 'Flat'] as CommissionType[]).map((ct) => (
                        <button
                          key={ct}
                          type="button"
                          onClick={() => updateCommission(ci, {
                            commissionType: ct,
                            tiers: c.tiers.map((t) => ({ ...t, commissionType: ct })),
                          })}
                          className={`px-2.5 py-1 text-xs font-medium rounded-md transition-all ${
                            c.commissionType === ct ? 'bg-slate-900 text-white' : 'text-slate-500 hover:text-slate-700'
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
                      <span>{c.commissionType === 'Percentage' ? 'Commission %' : 'Commission ₹/unit'}</span>
                      <span className="w-6" />
                    </div>
                    <div className="space-y-2">
                      {c.tiers.map((t, si) => {
                        const isLast = si === c.tiers.length - 1;
                        return (
                          <div key={si} className="grid grid-cols-[1fr_1fr_1fr_auto] gap-2 items-center">
                            <input type="number" className={inputCls} placeholder="0"
                              value={t.fromValue === 0 ? '' : t.fromValue} onChange={(e) => updateSlab(ci, si, { fromValue: e.target.value === '' ? 0 : Number(e.target.value) })} />
                            {isLast && t.toValue === null ? (
                              <div className="flex items-center">
                                <span className="px-3 py-2 text-sm text-slate-500 bg-slate-50 border border-slate-200 rounded-lg w-full">No limit</span>
                              </div>
                            ) : (
                              <input type="number" className={inputCls} placeholder="Upper limit"
                                value={t.toValue ?? ''} onChange={(e) => updateSlab(ci, si, { toValue: e.target.value === '' ? null : Number(e.target.value) })} />
                            )}
                            <input type="number" step="0.01" className={inputCls} placeholder="0"
                              value={t.commissionValue === 0 ? '' : t.commissionValue} onChange={(e) => updateSlab(ci, si, { commissionValue: e.target.value === '' ? 0 : Number(e.target.value) })} />
                            {c.tiers.length > 1 ? (
                              <button onClick={() => removeSlab(ci, si)} className="p-1 text-red-400 hover:text-red-600 hover:bg-red-50 rounded">
                                <Trash2 size={14} />
                              </button>
                            ) : <span className="w-6" />}
                          </div>
                        );
                      })}
                    </div>
                    {c.tiers.length < 5 ? (
                      <button onClick={() => addSlab(ci)}
                        className="inline-flex items-center gap-1 text-xs font-medium text-blue-600 hover:underline mt-2">
                        <Plus size={12} /> Add slab ({c.tiers.length}/5)
                      </button>
                    ) : (
                      <p className="text-[11px] text-slate-400">Maximum of 5 slabs reached</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}

          {step === 'documents' && (
            <div className="space-y-3">
              <p className="text-xs text-slate-600">
                Upload the partner's documents and the signed agreement. PAN and the signed Agreement are required before activation.
              </p>
              {([
                { type: 'PAN' as DocDraftType, label: 'PAN Card', required: true },
                { type: 'Agreement' as DocDraftType, label: 'Signed Partner Agreement', required: true },
                { type: 'GST' as DocDraftType, label: 'GST Certificate', required: false },
                { type: 'CIN' as DocDraftType, label: 'CIN Certificate', required: false },
                { type: 'Other' as DocDraftType, label: 'Other Document', required: false },
              ]).map((d) => {
                const uploaded = documents.filter((x) => x.type === d.type);
                return (
                  <div key={d.type} className="border border-slate-200 rounded-lg p-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-slate-800">
                        {d.label}
                        {d.required && <span className="text-red-500 ml-1">*</span>}
                      </span>
                      <label className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-lg border border-blue-200 cursor-pointer">
                        <Upload size={13} /> Upload
                        <input
                          type="file"
                          className="hidden"
                          onChange={(e) => handleDocFile(d.type, e.target.files?.[0] || null)}
                        />
                      </label>
                    </div>
                    {uploaded.length > 0 && (
                      <div className="mt-2 space-y-1">
                        {uploaded.map((u) => (
                          <div key={u.fileName} className="flex items-center justify-between text-xs text-slate-600 bg-slate-50 rounded px-2 py-1">
                            <span className="flex items-center gap-1.5"><FileText size={12} /> {u.fileName}</span>
                            <button onClick={() => removeDoc(u.type, u.fileName)} className="text-red-500 hover:text-red-600">
                              <Trash2 size={12} />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        <div className="flex justify-between p-4 border-t border-slate-200">
          <button onClick={onClose} className="px-4 py-2 text-sm font-medium text-slate-700 bg-slate-100 rounded-lg">
            Cancel
          </button>
          <div className="flex gap-2">
            {step !== 'details' && (
              <button
                onClick={() => {
                  const order = ['details', 'potential', 'commissions', 'documents'] as const;
                  const prev = order[order.indexOf(step) - 1];
                  if (prev) setStep(prev);
                }}
                className="px-4 py-2 text-sm font-medium text-slate-700 bg-slate-100 rounded-lg"
              >
                Back
              </button>
            )}
            {step === 'documents' ? (
              <button onClick={handleSubmit} className="px-4 py-2 text-sm font-medium text-white bg-slate-900 rounded-lg">
                Submit for Approval
              </button>
            ) : (
              <button
                onClick={() => {
                  const order = ['details', 'potential', 'commissions', 'documents'] as const;
                  const next = order[order.indexOf(step) + 1];
                  if (next) setStep(next);
                }}
                className="px-4 py-2 text-sm font-medium text-white bg-slate-900 rounded-lg"
              >
                Next
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
