import React, { useMemo, useState } from 'react';
import {
  ArrowLeft,
  Mail,
  Phone,
  Building2,
  MapPin,
  Copy,
  UserCog,
  FileText,
  Edit2,
  CheckCircle2,
  XCircle,
  Clock,
  Plus,
} from 'lucide-react';
import { Partner, StudentLead } from '../types';
import { LeadTable } from './LeadTable';

interface BdOption {
  id: string;
  name: string;
}

interface PartnerDetailViewProps {
  partner: Partner;
  partnerLeads?: StudentLead[];
  onBack: () => void;
  onEdit?: (partner: Partner) => void;
  onApprove?: (partnerId: string) => void;
  onReject?: (partnerId: string, reason: string) => void;
  availableBds?: BdOption[];
  onReassignBd?: (partnerId: string, bdId: string, bdName: string) => void;
  onEditCommissions?: (partner: Partner) => void;
  userRole?: 'head' | 'maker';
  onReviewCommissionRequest?: (partnerId: string, requestId: string, decision: 'approve' | 'reject', comment?: string) => void;
  onSelectLead?: (lead: StudentLead) => void;
}

type TabKey = 'details' | 'documents' | 'commissions' | 'leads' | 'activity';

const TABS: { key: TabKey; label: string }[] = [
  { key: 'details', label: 'Partner Details' },
  { key: 'documents', label: 'Documents' },
  { key: 'commissions', label: 'Commission & Products' },
  { key: 'leads', label: 'Leads' },
  { key: 'activity', label: 'Activity' },
];

function statusPillClasses(status: string): string {
  if (status === 'Active') return 'bg-emerald-50 text-emerald-700 border-emerald-200';
  if (status.startsWith('Pending') || status === 'Review Required')
    return 'bg-amber-50 text-amber-700 border-amber-200';
  if (status.startsWith('Rejected')) return 'bg-red-50 text-red-700 border-red-200';
  return 'bg-slate-100 text-slate-600 border-slate-200';
}

export const PartnerDetailView: React.FC<PartnerDetailViewProps> = ({
  partner,
  partnerLeads = [],
  onBack,
  onEdit,
  onApprove,
  onReject,
  availableBds = [],
  onReassignBd,
  onEditCommissions,
  userRole = 'head',
  onReviewCommissionRequest,
  onSelectLead,
}) => {
  const [activeTab, setActiveTab] = useState<TabKey>('details');
  const [showReassign, setShowReassign] = useState(false);

  const pendingRequest = (partner.commissionChangeRequests || []).find((r) => r.status === 'Pending');

  const city = partner.registeredAddress?.city || partner.locationName || '—';
  const isPending = partner.status === 'Pending Head' || partner.status === 'Pending Manager';

  const addresses = useMemo(() => {
    const list: { type: string; addr: typeof partner.registeredAddress }[] = [];
    if (partner.registeredAddress) list.push({ type: 'Head Office', addr: partner.registeredAddress });
    if (partner.operatingAddress) list.push({ type: 'Branch', addr: partner.operatingAddress });
    return list;
  }, [partner]);

  const copy = (text: string) => navigator.clipboard?.writeText(text);

  return (
    <div className="space-y-4">
      {/* BACK + ACTIONS */}
      <div className="flex items-center justify-between">
        <button onClick={onBack} className="inline-flex items-center gap-1.5 text-sm text-slate-600 hover:text-slate-900">
          <ArrowLeft size={16} /> Back to Partners
        </button>
        <div className="flex gap-2">
          <button
            onClick={() => onEdit?.(partner)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-lg border border-blue-200"
          >
            <Edit2 size={14} /> Edit
          </button>
          <div className="relative">
            <button
              onClick={() => setShowReassign((v) => !v)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg border border-slate-200"
            >
              <UserCog size={14} /> Reassign BD
            </button>
            {showReassign && (
              <div className="absolute right-0 top-full mt-1 w-56 bg-white border border-slate-200 rounded-lg shadow-lg z-50 py-1">
                <div className="px-3 py-2 text-[11px] font-semibold text-slate-400 uppercase tracking-wider border-b border-slate-100">
                  Assign to BD
                </div>
                {availableBds.length === 0 ? (
                  <div className="px-3 py-2 text-xs text-slate-500">No BDs available</div>
                ) : (
                  availableBds.map((bd) => {
                    const isCurrent = bd.id === partner.bdeUserId;
                    return (
                      <button
                        key={bd.id}
                        disabled={isCurrent}
                        onClick={() => {
                          onReassignBd?.(partner.id, bd.id, bd.name);
                          setShowReassign(false);
                        }}
                        className={`w-full text-left px-3 py-2 text-xs flex items-center justify-between ${
                          isCurrent ? 'text-slate-400 cursor-default' : 'text-slate-700 hover:bg-slate-50'
                        }`}
                      >
                        {bd.name}
                        {isCurrent && <span className="text-[10px] text-slate-400">current</span>}
                      </button>
                    );
                  })
                )}
              </div>
            )}
          </div>
          {isPending && (
            <>
              <button
                onClick={() => onApprove?.(partner.id)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-emerald-600 bg-emerald-50 hover:bg-emerald-100 rounded-lg border border-emerald-200"
              >
                <CheckCircle2 size={14} /> Approve
              </button>
              <button
                onClick={() => onReject?.(partner.id, 'Rejected')}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-red-600 bg-red-50 hover:bg-red-100 rounded-lg border border-red-200"
              >
                <XCircle size={14} /> Reject
              </button>
            </>
          )}
        </div>
      </div>

      {/* HEADER CARD (Nexus-style) */}
      <div className="bg-white border border-slate-200 rounded-xl p-5">
        <div className="flex items-start justify-between">
          <div className="flex items-start gap-4">
            <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center text-slate-400">
              <Building2 size={28} />
            </div>
            <div>
              <h1 className="text-xl font-bold text-slate-900">{partner.businessName}</h1>
              <div className="mt-2 space-y-1 text-sm text-slate-600">
                <div className="flex items-center gap-2">
                  <span className="font-mono text-xs text-slate-500">{partner.partnerCode}</span>
                  <button onClick={() => copy(partner.partnerCode)} className="text-slate-400 hover:text-slate-600">
                    <Copy size={12} />
                  </button>
                </div>
                <div className="flex items-center gap-2">
                  <Mail size={13} className="text-slate-400" /> {partner.ownerEmail}
                </div>
                <div className="flex items-center gap-2">
                  <Phone size={13} className="text-slate-400" /> {partner.ownerPhone}
                </div>
                <div className="flex items-center gap-2">
                  <MapPin size={13} className="text-slate-400" /> {city}
                </div>
              </div>
            </div>
          </div>
          <div className="flex flex-col items-end gap-2">
            <span className={`inline-flex items-center text-xs font-semibold px-3 py-1 rounded-full border ${statusPillClasses(partner.status)}`}>
              {partner.status}
            </span>
            <div className="text-right text-xs text-slate-500">
              <div>{partner.partnerType} • {(partner as any).partnerScale || '—'}</div>
              <div className="flex items-center gap-1 justify-end mt-1">
                <UserCog size={12} className="text-slate-400" />
                BD: {partner.bdeName || partner.bdeUserId}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* TABS */}
      <div className="bg-white border border-slate-200 rounded-xl">
        <div className="flex gap-0 border-b border-slate-200 px-2">
          {TABS.map((t) => (
            <button
              key={t.key}
              onClick={() => setActiveTab(t.key)}
              className={`px-4 py-3 text-sm font-medium border-b-2 transition-all ${
                activeTab === t.key
                  ? 'border-slate-900 text-slate-900'
                  : 'border-transparent text-slate-500 hover:text-slate-700'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        <div className="p-5">
          {activeTab === 'details' && (
            <div className="space-y-6">
              {/* Business Details */}
              <section>
                <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">Business Details</h3>
                <div className="grid grid-cols-3 gap-4 text-sm">
                  <Field label="PAN" value={partner.pan || partner.panNumber} />
                  <Field label="GST" value={partner.gst || partner.gstNumber} />
                  <Field label="CIN" value={partner.cin} />
                  <Field label="Owner" value={partner.ownerName} />
                  <Field label="Owner Email" value={partner.ownerEmail} />
                  <Field label="Owner Phone" value={partner.ownerPhone} />
                  <Field label="Contact Person" value={partner.contactPersonName} />
                  <Field label="Contact Email" value={partner.contactPersonEmail} />
                  <Field label="Contact Phone" value={partner.contactPersonPhone} />
                </div>
              </section>

              {/* Addresses */}
              <section>
                <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">Addresses</h3>
                <div className="grid grid-cols-2 gap-3">
                  {addresses.length === 0 ? (
                    <p className="text-sm text-slate-400">No addresses on record</p>
                  ) : (
                    addresses.map((a, i) => (
                      <div key={i} className="border border-slate-200 rounded-lg p-3">
                        <div className="text-[11px] font-semibold text-slate-500 uppercase mb-1">{a.type}</div>
                        <div className="text-sm text-slate-800">
                          {a.addr.addressLine1}
                          {a.addr.addressLine2 ? `, ${a.addr.addressLine2}` : ''}
                        </div>
                        <div className="text-sm text-slate-600">
                          {[a.addr.city, a.addr.state, a.addr.pincode].filter(Boolean).join(', ')}
                        </div>
                        <div className="text-sm text-slate-600">{a.addr.country}</div>
                      </div>
                    ))
                  )}
                </div>
              </section>

              {/* Eligible Products */}
              <section>
                <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">Eligible Products</h3>
                <div className="flex flex-wrap gap-2">
                  {partner.eligibleProducts && partner.eligibleProducts.length > 0 ? (
                    partner.eligibleProducts.map((p) => (
                      <span key={p} className="px-2.5 py-1 rounded-full text-xs font-medium bg-slate-100 text-slate-700">
                        {p}
                      </span>
                    ))
                  ) : (
                    <p className="text-sm text-slate-400">No eligible products configured</p>
                  )}
                </div>
              </section>

              {/* Country-wise Business Potential */}
              <section>
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider">Country-wise Business Potential</h3>
                  {partner.countryPotential && partner.countryPotential.length > 0 && (
                    <span className="text-xs text-slate-500">
                      Total:{' '}
                      <span className="font-semibold text-slate-800">
                        {partner.countryPotential.reduce((sum, c) => sum + (c.studentsPerYear || 0), 0).toLocaleString()}
                      </span>{' '}
                      students / year
                    </span>
                  )}
                </div>
                {partner.countryPotential && partner.countryPotential.length > 0 ? (
                  <div className="border border-slate-200 rounded-lg overflow-hidden">
                    <div className="grid grid-cols-2 bg-slate-50 px-4 py-2 text-[11px] font-semibold text-slate-500 uppercase border-b border-slate-200">
                      <span>Country</span>
                      <span className="text-right">No. of students / year</span>
                    </div>
                    {partner.countryPotential.map((c, i) => (
                      <div key={i} className="grid grid-cols-2 px-4 py-2.5 text-sm border-b border-slate-100 last:border-b-0">
                        <span className="text-slate-800">{c.country || '—'}</span>
                        <span className="text-right font-medium text-slate-700">{(c.studentsPerYear || 0).toLocaleString()}</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-slate-400">No business potential data on record</p>
                )}
              </section>
            </div>
          )}

          {activeTab === 'documents' && (
            <div className="space-y-2">
              {partner.documents && partner.documents.length > 0 ? (
                partner.documents.map((doc, i) => (
                  <div key={i} className="flex items-center justify-between border border-slate-200 rounded-lg p-3">
                    <div className="flex items-center gap-2">
                      <FileText size={16} className="text-slate-400" />
                      <div>
                        <div className="text-sm font-medium text-slate-800">{doc.type}</div>
                        <div className="text-xs text-slate-500">{doc.fileName}</div>
                      </div>
                    </div>
                    <a
                      href={doc.fileUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs font-medium text-blue-600 hover:underline"
                    >
                      View
                    </a>
                  </div>
                ))
              ) : (
                <p className="text-sm text-slate-400">No documents uploaded</p>
              )}
            </div>
          )}

          {activeTab === 'commissions' && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider">Products & Commissions</h3>
                <div className="flex gap-2">
                  <button
                    onClick={() => onEditCommissions?.(partner)}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-white bg-slate-900 hover:bg-slate-800 rounded-lg"
                  >
                    <Plus size={14} /> Add Product
                  </button>
                  <button
                    onClick={() => onEditCommissions?.(partner)}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-lg border border-blue-200"
                  >
                    <Edit2 size={14} /> {userRole === 'head' ? 'Edit' : 'Request Change'}
                  </button>
                </div>
              </div>

              {/* Pending change request banner */}
              {pendingRequest && (
                <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="text-xs font-semibold text-amber-800 flex items-center gap-1.5">
                      <Clock size={13} /> Commission change pending Head approval
                    </div>
                    <span className="text-[11px] text-amber-600">
                      requested by {pendingRequest.requestedBy} · {new Date(pendingRequest.requestedAt).toLocaleDateString()}
                    </span>
                  </div>
                  <div className="text-xs text-amber-900">
                    Proposed:{' '}
                    {pendingRequest.proposedTerms
                      .map((t) => `${t.product} (${t.commissionType}, ${t.slabs.length} slab${t.slabs.length > 1 ? 's' : ''})`)
                      .join(', ')}
                  </div>
                  {userRole === 'head' && (
                    <div className="flex gap-2 pt-1">
                      <button
                        onClick={() => onReviewCommissionRequest?.(partner.id, pendingRequest.id, 'approve')}
                        className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg"
                      >
                        <CheckCircle2 size={13} /> Approve
                      </button>
                      <button
                        onClick={() => {
                          const reason = window.prompt('Reason for rejecting this commission change?') || '';
                          if (reason.trim()) onReviewCommissionRequest?.(partner.id, pendingRequest.id, 'reject', reason);
                        }}
                        className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-red-700 bg-red-50 hover:bg-red-100 rounded-lg border border-red-200"
                      >
                        <XCircle size={13} /> Reject
                      </button>
                    </div>
                  )}
                </div>
              )}

              {/* Current commissions — prefer slab structure if present */}
              {partner.commissionSlabs && partner.commissionSlabs.length > 0 ? (
                <div className="space-y-2">
                  {partner.commissionSlabs.map((c, i) => (
                    <div key={i} className="border border-slate-200 rounded-lg p-3">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-semibold text-slate-800">{c.product}</span>
                        <span className="text-xs text-slate-500">{c.commissionType} · {c.tierMetric}</span>
                      </div>
                      <div className="space-y-1">
                        {c.slabs.map((s, j) => (
                          <div key={j} className="flex items-center justify-between text-xs text-slate-600">
                            <span>{s.from} – {s.to ?? '∞'}</span>
                            <span>{c.commissionType === 'Percentage' ? `${s.value}%` : `₹${s.value}/unit`}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              ) : partner.commissions && partner.commissions.length > 0 ? (
                <div className="divide-y divide-slate-100 border border-slate-200 rounded-lg">
                  {partner.commissions.map((c, i) => (
                    <div key={i} className="flex items-center justify-between p-3">
                      <span className="text-sm font-medium text-slate-800">{c.product}</span>
                      <span className="text-sm text-slate-600">
                        {c.type === 'Percentage' ? `${c.value}%` : `₹${c.value}`}
                        <span className="text-xs text-slate-400 ml-1">({c.type})</span>
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-slate-400">No commissions configured</p>
              )}
            </div>
          )}

          {activeTab === 'leads' && (
            <div className="-m-5">
              <LeadTable
                leads={partnerLeads}
                onSelectLead={(lead) => onSelectLead?.(lead)}
              />
            </div>
          )}

          {activeTab === 'activity' && (
            <div className="space-y-3">
              {partner.approvalHistory && partner.approvalHistory.length > 0 ? (
                partner.approvalHistory
                  .slice()
                  .reverse()
                  .map((a, i) => (
                    <div key={i} className="flex items-start gap-3">
                      <div className="mt-0.5 w-7 h-7 rounded-full bg-slate-100 flex items-center justify-center text-slate-400">
                        <Clock size={13} />
                      </div>
                      <div className="flex-1">
                        <div className="text-sm text-slate-800">
                          <span className="font-medium capitalize">{a.action.replace(/_/g, ' ')}</span>
                          {' by '}
                          {a.actor} <span className="text-slate-400">({a.actorRole})</span>
                        </div>
                        {a.reason && <div className="text-xs text-slate-500 mt-0.5">{a.reason}</div>}
                        <div className="text-[11px] text-slate-400 mt-0.5">
                          {new Date(a.timestamp).toLocaleString()}
                        </div>
                      </div>
                    </div>
                  ))
              ) : (
                <p className="text-sm text-slate-400">No activity recorded</p>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const Field: React.FC<{ label: string; value?: string }> = ({ label, value }) => (
  <div>
    <div className="text-[11px] font-semibold text-slate-400 uppercase">{label}</div>
    <div className="text-sm text-slate-800 mt-0.5">{value || '—'}</div>
  </div>
);
