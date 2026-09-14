import React, { useMemo } from 'react';
import {
  ArrowLeft,
  Mail,
  Phone,
  MapPin,
  Briefcase,
  Target,
  TrendingUp,
  Calendar,
  Power,
  Edit2,
  Share2,
} from 'lucide-react';
import { TeamMember, StudentLead } from '../types';

interface TeamMemberDetailViewProps {
  member: TeamMember;
  memberLeads?: StudentLead[];
  onBack: () => void;
  onEdit?: (member: TeamMember) => void;
  onDeactivate?: (memberId: string) => void;
  onReassign?: (memberId: string) => void;
}

export const TeamMemberDetailView: React.FC<TeamMemberDetailViewProps> = ({
  member,
  memberLeads = [],
  onBack,
  onEdit,
  onDeactivate,
  onReassign,
}) => {
  // Calculate performance metrics
  const metrics = useMemo(() => {
    const activeLeads = memberLeads.filter(l => l.leadStatus === 'Active').length;
    const closedLeads = memberLeads.filter(l => l.leadStatus === 'Closed').length;
    const qualifiedLeads = memberLeads.filter(l => l.qualificationStatus === 'Qualified').length;
    const overdueLeads = memberLeads.filter(l => l.kpiStatus === 'Overdue').length;

    // Product breakdown
    const productBreakdown = memberLeads.reduce((acc: Record<string, number>, lead) => {
      lead.productOpportunities.forEach(prod => {
        acc[prod.product] = (acc[prod.product] || 0) + 1;
      });
      return acc;
    }, {});

    return {
      totalLeads: memberLeads.length,
      activeLeads,
      closedLeads,
      qualifiedLeads,
      overdueLeads,
      conversionRate: memberLeads.length > 0 ? Math.round((closedLeads / memberLeads.length) * 100) : 0,
      productBreakdown,
    };
  }, [memberLeads]);

  const joiningDate = new Date(member.joiningDate);
  const daysActive = Math.floor((Date.now() - joiningDate.getTime()) / (1000 * 60 * 60 * 24));

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
              {member.avatar ? (
                <img
                  src={member.avatar}
                  alt={member.name}
                  className="w-12 h-12 rounded-full"
                />
              ) : (
                <div className="w-12 h-12 rounded-full bg-slate-300" />
              )}
              <div>
                <h1 className="text-2xl font-bold text-slate-900">{member.name}</h1>
                <p className="text-sm text-slate-600">{member.role}</p>
              </div>
            </div>
            <span
              className={`inline-flex items-center text-xs font-semibold px-2.5 py-1 rounded-full border ${
                member.status === 'Active'
                  ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                  : 'bg-blue-50 text-blue-800 border-blue-200'
              }`}
            >
              {member.status}
            </span>
          </div>
        </div>

        {/* ACTION BUTTONS */}
        <div className="flex gap-2">
          <button
            onClick={() => onEdit?.(member)}
            className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-lg transition-all border border-blue-200"
          >
            <Edit2 size={14} />
            Edit
          </button>
          <button
            onClick={() => onReassign?.(member.id)}
            className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-purple-600 bg-purple-50 hover:bg-purple-100 rounded-lg transition-all border border-purple-200"
          >
            <Share2 size={14} />
            Reassign
          </button>
          <button
            onClick={() => onDeactivate?.(member.id)}
            className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-red-600 bg-red-50 hover:bg-red-100 rounded-lg transition-all border border-red-200"
          >
            <Power size={14} />
            {member.status === 'Active' ? 'Deactivate' : 'Activate'}
          </button>
        </div>
      </div>

      {/* BASIC INFO GRID */}
      <div className="grid grid-cols-4 gap-3">
        <div className="bg-white border border-slate-200 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2 text-slate-600">
            <Mail size={14} />
            <span className="text-xs font-semibold uppercase">Email</span>
          </div>
          <p className="text-sm font-medium text-slate-900">{member.email}</p>
        </div>

        <div className="bg-white border border-slate-200 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2 text-slate-600">
            <Phone size={14} />
            <span className="text-xs font-semibold uppercase">Phone</span>
          </div>
          <p className="text-sm font-medium text-slate-900">{member.phone}</p>
        </div>

        <div className="bg-white border border-slate-200 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2 text-slate-600">
            <MapPin size={14} />
            <span className="text-xs font-semibold uppercase">Location</span>
          </div>
          <p className="text-sm font-medium text-slate-900">{member.location}</p>
        </div>

        <div className="bg-white border border-slate-200 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2 text-slate-600">
            <Briefcase size={14} />
            <span className="text-xs font-semibold uppercase">Manager</span>
          </div>
          <p className="text-sm font-medium text-slate-900">{member.managerName || '—'}</p>
        </div>
      </div>

      {/* DETAILS GRID */}
      <div className="grid grid-cols-5 gap-3">
        <div className="bg-white border border-slate-200 rounded-lg p-4">
          <div className="text-xs font-semibold text-slate-600 mb-2 uppercase">Product</div>
          <p className="text-sm font-medium text-slate-900">{member.product}</p>
        </div>

        <div className="bg-white border border-slate-200 rounded-lg p-4">
          <div className="text-xs font-semibold text-slate-600 mb-2 uppercase">Experience</div>
          <p className="text-sm font-medium text-slate-900">{member.experienceLevel}</p>
        </div>

        <div className="bg-white border border-slate-200 rounded-lg p-4">
          <div className="text-xs font-semibold text-slate-600 mb-2 uppercase">Active Days</div>
          <p className="text-sm font-medium text-slate-900">{daysActive} days</p>
        </div>

        <div className="bg-white border border-slate-200 rounded-lg p-4">
          <div className="text-xs font-semibold text-slate-600 mb-2 uppercase">Employment</div>
          <p className="text-sm font-medium text-slate-900">{member.employmentType}</p>
        </div>

        <div className="bg-white border border-slate-200 rounded-lg p-4">
          <div className="text-xs font-semibold text-slate-600 mb-2 uppercase">Joining Date</div>
          <p className="text-sm font-medium text-slate-900">{joiningDate.toLocaleDateString()}</p>
        </div>
      </div>

      {/* PERFORMANCE METRICS */}
      <div className="grid grid-cols-3 gap-3">
        <div className="bg-white border border-slate-200 rounded-lg p-4">
          <div className="inline-block px-2 py-1 bg-blue-100 text-blue-700 text-xs font-bold rounded-full mb-3">
            TARGET
          </div>
          <div className="text-3xl font-bold text-slate-900">{member.monthlyTarget}</div>
          <div className="text-xs text-slate-600 mt-2">leads per month</div>
        </div>

        <div className="bg-white border border-slate-200 rounded-lg p-4">
          <div className="inline-block px-2 py-1 bg-purple-100 text-purple-700 text-xs font-bold rounded-full mb-3">
            CAPACITY
          </div>
          <div className="flex items-center gap-2">
            <div className="text-3xl font-bold text-slate-900">{member.capacityPercent}%</div>
            <div className="w-16 h-2 rounded-full bg-slate-200">
              <div
                className={`h-full rounded-full ${
                  member.capacityPercent >= 80
                    ? 'bg-red-500'
                    : member.capacityPercent >= 60
                    ? 'bg-amber-500'
                    : 'bg-emerald-500'
                }`}
                style={{ width: `${Math.min(member.capacityPercent, 100)}%` }}
              />
            </div>
          </div>
          <div className="text-xs text-slate-600 mt-2">Current workload</div>
        </div>

        <div className="bg-white border border-slate-200 rounded-lg p-4">
          <div className="inline-block px-2 py-1 bg-emerald-100 text-emerald-700 text-xs font-bold rounded-full mb-3">
            CONVERSION
          </div>
          <div className="text-3xl font-bold text-slate-900">{metrics.conversionRate}%</div>
          <div className="text-xs text-slate-600 mt-2">Lead conversion rate</div>
        </div>
      </div>

      {/* LEAD PERFORMANCE */}
      <div className="grid grid-cols-2 gap-3">
        {/* Lead Metrics */}
        <div className="bg-white border border-slate-200 rounded-lg p-4">
          <h3 className="text-base font-bold text-slate-900 mb-4 flex items-center gap-2">
            <TrendingUp size={18} />
            Lead Performance
          </h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between p-2 bg-slate-50 rounded">
              <span className="text-sm text-slate-700">Total Leads</span>
              <span className="font-semibold text-slate-900">{metrics.totalLeads}</span>
            </div>
            <div className="flex items-center justify-between p-2 bg-slate-50 rounded">
              <span className="text-sm text-slate-700">Active</span>
              <span className="font-semibold text-blue-600">{metrics.activeLeads}</span>
            </div>
            <div className="flex items-center justify-between p-2 bg-slate-50 rounded">
              <span className="text-sm text-slate-700">Closed</span>
              <span className="font-semibold text-emerald-600">{metrics.closedLeads}</span>
            </div>
            <div className="flex items-center justify-between p-2 bg-slate-50 rounded">
              <span className="text-sm text-slate-700">Qualified</span>
              <span className="font-semibold text-purple-600">{metrics.qualifiedLeads}</span>
            </div>
            <div className="flex items-center justify-between p-2 bg-slate-50 rounded border border-red-200">
              <span className="text-sm text-slate-700">Overdue</span>
              <span className="font-semibold text-red-600">{metrics.overdueLeads}</span>
            </div>
          </div>
        </div>

        {/* Product Breakdown */}
        <div className="bg-white border border-slate-200 rounded-lg p-4">
          <h3 className="text-base font-bold text-slate-900 mb-4 flex items-center gap-2">
            <Target size={18} />
            Product Distribution
          </h3>
          <div className="space-y-2">
            {Object.entries(metrics.productBreakdown).length > 0 ? (
              Object.entries(metrics.productBreakdown)
                .sort(([, a], [, b]) => b - a)
                .map(([product, count]) => (
                  <div key={product} className="flex items-center justify-between p-2 bg-slate-50 rounded">
                    <span className="text-sm text-slate-700">{product}</span>
                    <div className="flex items-center gap-2">
                      <div className="w-24 h-1.5 rounded-full bg-slate-200">
                        <div
                          className="h-full rounded-full bg-blue-500"
                          style={{
                            width: `${(count / metrics.totalLeads) * 100}%`,
                          }}
                        />
                      </div>
                      <span className="font-semibold text-slate-900 w-8 text-right">{count}</span>
                    </div>
                  </div>
                ))
            ) : (
              <div className="text-center py-4 text-slate-500 text-sm">No products assigned</div>
            )}
          </div>
        </div>
      </div>

      {/* RECENT LEADS */}
      {memberLeads.length > 0 && (
        <div className="bg-white border border-slate-200 rounded-lg p-4">
          <h3 className="text-base font-bold text-slate-900 mb-4">Recent Leads (Last 5)</h3>
          <div className="space-y-2">
            {memberLeads.slice(0, 5).map((lead) => (
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
