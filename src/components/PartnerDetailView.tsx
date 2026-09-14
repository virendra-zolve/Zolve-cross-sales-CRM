import React, { useMemo } from 'react';
import {
  ArrowLeft,
  Mail,
  Phone,
  Building2,
  User,
  MapPin,
  TrendingUp,
  BarChart3,
  CheckCircle2,
  XCircle,
  Edit2,
} from 'lucide-react';
import { Partner, StudentLead } from '../types';

interface PartnerDetailViewProps {
  partner: Partner;
  partnerLeads?: StudentLead[];
  onBack: () => void;
  onEdit?: (partner: Partner) => void;
  onApprove?: (partnerId: string) => void;
  onReject?: (partnerId: string, reason: string) => void;
}

export const PartnerDetailView: React.FC<PartnerDetailViewProps> = ({
  partner,
  partnerLeads = [],
  onBack,
  onEdit,
  onApprove,
  onReject,
}) => {
  // Calculate performance metrics
  const metrics = useMemo(() => {
    const activeLeads = partnerLeads.filter(l => l.leadStatus === 'Active').length;
    const closedLeads = partnerLeads.filter(l => l.leadStatus === 'Closed').length;
    const qualifiedLeads = partnerLeads.filter(l => l.qualificationStatus === 'Qualified').length;
    const conversionRate =
      partner.totalLeadsGenerated > 0
        ? Math.round((partner.leadsConverted / partner.totalLeadsGenerated) * 100)
        : 0;

    // Product breakdown from commissions
    const productBreakdown = partner.commissions.reduce(
      (acc: Record<string, number>, comm) => {
        acc[comm.product] = (acc[comm.product] || 0) + 1;
        return acc;
      },
      {}
    );

    return {
      totalLeads: partner.totalLeadsGenerated,
      activeLeads,
      closedLeads,
      qualifiedLeads,
      converted: partner.leadsConverted,
      conversionRate,
      productBreakdown,
    };
  }, [partner, partnerLeads]);

  const createdDate = new Date(partner.createdAt);
  const daysActive = Math.floor((Date.now() - createdDate.getTime()) / (1000 * 60 * 60 * 24));

  return (
    <div className="space-y-6">
      {/* HEADER */}
      <div className="flex items-start justify-between">
        <div className="flex items-start gap-4">
          <button
            onClick={onBack}
            className="p-2 hover:bg-slate-100 rounded-lg transition-all"
          >
            <ArrowLeft className="w-5 h-5 text-slate-600" />
          </button>
          <div>
            <div className="flex items-center gap-3 mb-2">
              <Building2 className="w-12 h-12 text-slate-400" />
              <div>
                <h1 className="text-2xl font-bold text-slate-900">{partner.businessName}</h1>
                <p className="text-sm text-slate-600">{partner.partnerCode}</p>
              </div>
            </div>
            <span
              className={`inline-flex items-center text-xs font-semibold px-2.5 py-1 rounded-full border ${
                partner.status === 'Active'
                  ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                  : partner.status === 'Pending Manager' || partner.status === 'Pending Head'
                  ? 'bg-amber-50 text-amber-800 border-amber-200'
                  : 'bg-red-50 text-red-800 border-red-200'
              }`}
            >
              {partner.status}
            </span>
          </div>
        </div>

        {/* ACTION BUTTONS */}
        <div className="flex gap-2">
          <button
            onClick={() => onEdit?.(partner)}
            className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-lg transition-all border border-blue-200"
          >
            <Edit2 size={14} />
            Edit
          </button>

          {(partner.status === 'Pending Manager' || partner.status === 'Pending Head') && (
            <>
              <button
                onClick={() => onApprove?.(partner.id)}
                className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-emerald-600 bg-emerald-50 hover:bg-emerald-100 rounded-lg transition-all border border-emerald-200"
              >
                <CheckCircle2 size={14} />
                Approve
              </button>
              <button
                onClick={() => onReject?.(partner.id, 'Rejected')}
                className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-red-600 bg-red-50 hover:bg-red-100 rounded-lg transition-all border border-red-200"
              >
                <XCircle size={14} />
                Reject
              </button>
            </>
          )}
        </div>
      </div>

      {/* BUSINESS INFO GRID */}
      <div className="grid grid-cols-4 gap-3">
        <div className="bg-white border border-slate-200 rounded-lg p-4">
          <div className="text-xs font-semibold text-slate-600 mb-2 uppercase">Type</div>
          <p className="text-sm font-medium text-slate-900">{partner.partnerType}</p>
        </div>

        <div className="bg-white border border-slate-200 rounded-lg p-4">
          <div className="text-xs font-semibold text-slate-600 mb-2 uppercase">Location</div>
          <p className="text-sm font-medium text-slate-900">{partner.locationName || '—'}</p>
        </div>

        <div className="bg-white border border-slate-200 rounded-lg p-4">
          <div className="text-xs font-semibold text-slate-600 mb-2 uppercase">Active For</div>
          <p className="text-sm font-medium text-slate-900">{daysActive} days</p>
        </div>

        <div className="bg-white border border-slate-200 rounded-lg p-4">
          <div className="text-xs font-semibold text-slate-600 mb-2 uppercase">Date Created</div>
          <p className="text-sm font-medium text-slate-900">{createdDate.toLocaleDateString()}</p>
        </div>
      </div>

      {/* OWNER & CONTACT INFO */}
      <div className="grid grid-cols-2 gap-3">
        <div className="bg-white border border-slate-200 rounded-lg p-4">
          <h3 className="text-sm font-bold text-slate-900 mb-3 flex items-center gap-2">
            <User size={16} />
            Owner
          </h3>
          <div className="space-y-2">
            <div>
              <div className="text-xs text-slate-600">Name</div>
              <p className="text-sm font-medium text-slate-900">{partner.ownerName}</p>
            </div>
            <div>
              <div className="text-xs text-slate-600">Email</div>
              <p className="text-sm font-medium text-slate-900">{partner.ownerEmail}</p>
            </div>
            <div>
              <div className="text-xs text-slate-600">Phone</div>
              <p className="text-sm font-medium text-slate-900">{partner.ownerPhone}</p>
            </div>
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-lg p-4">
          <h3 className="text-sm font-bold text-slate-900 mb-3 flex items-center gap-2">
            <Mail size={16} />
            Contact Person
          </h3>
          <div className="space-y-2">
            <div>
              <div className="text-xs text-slate-600">Name</div>
              <p className="text-sm font-medium text-slate-900">{partner.contactPersonName}</p>
            </div>
            <div>
              <div className="text-xs text-slate-600">Email</div>
              <p className="text-sm font-medium text-slate-900">{partner.contactPersonEmail}</p>
            </div>
            <div>
              <div className="text-xs text-slate-600">Phone</div>
              <p className="text-sm font-medium text-slate-900">{partner.contactPersonPhone}</p>
            </div>
          </div>
        </div>
      </div>

      {/* LEGAL & COMPLIANCE */}
      <div className="grid grid-cols-3 gap-3">
        <div className="bg-white border border-slate-200 rounded-lg p-4">
          <div className="text-xs font-semibold text-slate-600 mb-2 uppercase">PAN</div>
          <p className="text-sm font-medium text-slate-900">{partner.pan || partner.panNumber || '—'}</p>
        </div>

        <div className="bg-white border border-slate-200 rounded-lg p-4">
          <div className="text-xs font-semibold text-slate-600 mb-2 uppercase">GST</div>
          <p className="text-sm font-medium text-slate-900">{partner.gst || partner.gstNumber || '—'}</p>
        </div>

        <div className="bg-white border border-slate-200 rounded-lg p-4">
          <div className="text-xs font-semibold text-slate-600 mb-2 uppercase">CIN</div>
          <p className="text-sm font-medium text-slate-900">{partner.cin || '—'}</p>
        </div>
      </div>

      {/* PERFORMANCE METRICS */}
      <div className="grid grid-cols-4 gap-3">
        <div className="bg-white border border-slate-200 rounded-lg p-4">
          <div className="inline-block px-2 py-1 bg-blue-100 text-blue-700 text-xs font-bold rounded-full mb-3">
            LEADS
          </div>
          <div className="text-3xl font-bold text-slate-900">{metrics.totalLeads}</div>
          <div className="text-xs text-slate-600 mt-2">Total generated</div>
        </div>

        <div className="bg-white border border-slate-200 rounded-lg p-4">
          <div className="inline-block px-2 py-1 bg-emerald-100 text-emerald-700 text-xs font-bold rounded-full mb-3">
            CONVERTED
          </div>
          <div className="text-3xl font-bold text-slate-900">{metrics.converted}</div>
          <div className="text-xs text-slate-600 mt-2">Leads qualified</div>
        </div>

        <div className="bg-white border border-slate-200 rounded-lg p-4">
          <div className="inline-block px-2 py-1 bg-purple-100 text-purple-700 text-xs font-bold rounded-full mb-3">
            RATE
          </div>
          <div className="text-3xl font-bold text-slate-900">{metrics.conversionRate}%</div>
          <div className="text-xs text-slate-600 mt-2">Conversion rate</div>
        </div>

        <div className="bg-white border border-slate-200 rounded-lg p-4">
          <div className="inline-block px-2 py-1 bg-orange-100 text-orange-700 text-xs font-bold rounded-full mb-3">
            ACTIVE
          </div>
          <div className="text-3xl font-bold text-slate-900">{partner.activeLeads}</div>
          <div className="text-xs text-slate-600 mt-2">Active leads</div>
        </div>
      </div>

      {/* COMMISSIONS & PRODUCTS */}
      {partner.commissions.length > 0 && (
        <div className="bg-white border border-slate-200 rounded-lg p-4">
          <h3 className="text-base font-bold text-slate-900 mb-4 flex items-center gap-2">
            <TrendingUp size={18} />
            Commission Structure
          </h3>
          <div className="grid grid-cols-2 gap-2">
            {partner.commissions.map((comm, idx) => (
              <div
                key={idx}
                className="flex items-center justify-between p-3 border border-slate-200 rounded-lg bg-slate-50"
              >
                <div>
                  <div className="text-xs text-slate-600">Product</div>
                  <div className="font-medium text-slate-900">{comm.product}</div>
                </div>
                <div className="text-right">
                  <div className="text-xs text-slate-600">{comm.type}</div>
                  <div className="text-lg font-bold text-blue-600">{comm.value}%</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* LEAD PERFORMANCE */}
      {partnerLeads.length > 0 && (
        <div className="grid grid-cols-2 gap-3">
          {/* Summary */}
          <div className="bg-white border border-slate-200 rounded-lg p-4">
            <h3 className="text-base font-bold text-slate-900 mb-4 flex items-center gap-2">
              <BarChart3 size={18} />
              Lead Performance
            </h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between p-2 bg-slate-50 rounded">
                <span className="text-sm text-slate-700">Active Leads</span>
                <span className="font-semibold text-blue-600">{metrics.activeLeads}</span>
              </div>
              <div className="flex items-center justify-between p-2 bg-slate-50 rounded">
                <span className="text-sm text-slate-700">Closed Deals</span>
                <span className="font-semibold text-emerald-600">{metrics.closedLeads}</span>
              </div>
              <div className="flex items-center justify-between p-2 bg-slate-50 rounded">
                <span className="text-sm text-slate-700">Qualified</span>
                <span className="font-semibold text-purple-600">{metrics.qualifiedLeads}</span>
              </div>
            </div>
          </div>

          {/* Journey Stage Distribution */}
          <div className="bg-white border border-slate-200 rounded-lg p-4">
            <h3 className="text-base font-bold text-slate-900 mb-4">Journey Stage Distribution</h3>
            <div className="space-y-2">
              {['Counseling', 'Application', 'Admission Confirmed', 'Visa', 'Pre-Departure', 'Travel']
                .map((stage) => {
                  const count = partnerLeads.filter(l => l.journeyStage === stage).length;
                  return (
                    <div key={stage} className="flex items-center justify-between p-2 bg-slate-50 rounded">
                      <span className="text-sm text-slate-700">{stage}</span>
                      <div className="flex items-center gap-2">
                        <div className="w-16 h-1.5 rounded-full bg-slate-200">
                          <div
                            className="h-full rounded-full bg-blue-500"
                            style={{
                              width: `${
                                partnerLeads.length > 0
                                  ? (count / partnerLeads.length) * 100
                                  : 0
                              }%`,
                            }}
                          />
                        </div>
                        <span className="text-xs font-semibold text-slate-900 w-6 text-right">{count}</span>
                      </div>
                    </div>
                  );
                })}
            </div>
          </div>
        </div>
      )}

      {/* RECENT LEADS */}
      {partnerLeads.length > 0 && (
        <div className="bg-white border border-slate-200 rounded-lg p-4">
          <h3 className="text-base font-bold text-slate-900 mb-4">Recent Leads (Last 5)</h3>
          <div className="space-y-2">
            {partnerLeads.slice(0, 5).map((lead) => (
              <div
                key={lead.id}
                className="flex items-center justify-between p-3 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors"
              >
                <div className="flex-1">
                  <div className="font-medium text-sm text-slate-900">{lead.studentName}</div>
                  <div className="text-xs text-slate-500">
                    {lead.finalUniversity || lead.universitiesOfInterest[0]}
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <span className="inline-block px-2 py-0.5 rounded text-[11px] font-medium bg-slate-100 text-slate-700">
                    {lead.journeyStage}
                  </span>
                  <span
                    className={`inline-flex items-center text-[11px] font-semibold px-2 py-0.5 rounded-md border ${
                      lead.kpiStatus === 'Overdue'
                        ? 'bg-rose-100 text-rose-800 border-rose-200'
                        : 'bg-emerald-50 text-emerald-800 border-emerald-200'
                    }`}
                  >
                    {lead.kpiStatus}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
