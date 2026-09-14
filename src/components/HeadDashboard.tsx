import React, { useMemo } from 'react';
import { 
  TrendingUp,
  Zap,
  CheckCircle2,
  AlertTriangle,
  BarChart3,
} from 'lucide-react';
import { StudentLead, Partner, TeamMember } from '../types';

interface HeadDashboardProps {
  leads: StudentLead[];
  partners?: Partner[];
  teamMembers?: TeamMember[];
  onViewAllLeads?: () => void;
  onViewTeamManagement?: () => void;
  onViewPartnerManagement?: () => void;
}

export const HeadDashboard: React.FC<HeadDashboardProps> = ({
  leads,
  partners = [],
  teamMembers = [],
  onViewAllLeads,
  onViewTeamManagement,
  onViewPartnerManagement,
}) => {
  // Executive-level metrics
  const metrics = useMemo(() => {
    const totalLeads = leads.length;
    const activeLeads = leads.filter(l => l.leadStatus === 'Active').length;
    const closedLeads = leads.filter(l => l.leadStatus === 'Closed').length;
    const qualifiedLeads = leads.filter(l => l.qualificationStatus === 'Qualified').length;
    const atRisk = leads.filter(l => l.kpiStatus === 'Overdue' || l.escalationStatus === 'Escalated').length;
    
    const conversionRate = totalLeads > 0 ? Math.round((closedLeads / totalLeads) * 100) : 0;
    const qualificationRate = totalLeads > 0 ? Math.round((qualifiedLeads / totalLeads) * 100) : 0;
    const activeRate = totalLeads > 0 ? Math.round((activeLeads / totalLeads) * 100) : 0;

    // Team metrics
    const activeTeamMembers = teamMembers.filter(m => m.status === 'Active').length;
    const pendingTeamMembers = teamMembers.filter(m => m.status === 'Pending Approval').length;
    const avgTeamCapacity = teamMembers.length > 0 
      ? Math.round(teamMembers.reduce((acc, m) => acc + m.capacityPercent, 0) / teamMembers.length) 
      : 0;

    // Partner metrics
    const activePartners = partners.filter(p => p.status === 'Active').length;
    const pendingPartners = partners.filter(p => p.status === 'Pending Manager' || p.status === 'Pending Head').length;

    // Product breakdown
    const productMetrics: Record<string, { count: number; qualified: number }> = {};
    leads.forEach(lead => {
      lead.productOpportunities.forEach(prod => {
        if (!productMetrics[prod.product]) {
          productMetrics[prod.product] = { count: 0, qualified: 0 };
        }
        productMetrics[prod.product].count++;
        if (lead.qualificationStatus === 'Qualified') {
          productMetrics[prod.product].qualified++;
        }
      });
    });

    return {
      totalLeads,
      activeLeads,
      closedLeads,
      qualifiedLeads,
      atRisk,
      conversionRate,
      qualificationRate,
      activeRate,
      teamCount: teamMembers.length,
      activeTeamMembers,
      pendingTeamMembers,
      avgTeamCapacity,
      partnerCount: partners.length,
      activePartners,
      pendingPartners,
      productMetrics,
    };
  }, [leads, partners, teamMembers]);

  return (
    <div className="space-y-6">
      {/* EXECUTIVE KPI DASHBOARD */}
      <div className="grid grid-cols-4 gap-3">
        {/* Conversion Rate */}
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 border border-blue-200 rounded-lg p-4 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold uppercase text-blue-700">Conversion Rate</span>
            <TrendingUp className="text-blue-600" size={16} />
          </div>
          <div className="text-4xl font-bold text-blue-900">{metrics.conversionRate}%</div>
          <p className="text-xs text-blue-700 mt-2">{metrics.closedLeads} of {metrics.totalLeads} leads closed</p>
        </div>

        {/* Qualification Rate */}
        <div className="bg-gradient-to-br from-purple-50 to-purple-100 border border-purple-200 rounded-lg p-4 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold uppercase text-purple-700">Qualified</span>
            <CheckCircle2 className="text-purple-600" size={16} />
          </div>
          <div className="text-4xl font-bold text-purple-900">{metrics.qualificationRate}%</div>
          <p className="text-xs text-purple-700 mt-2">{metrics.qualifiedLeads} qualified leads</p>
        </div>

        {/* Active Pipeline */}
        <div className="bg-gradient-to-br from-emerald-50 to-emerald-100 border border-emerald-200 rounded-lg p-4 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold uppercase text-emerald-700">Active Pipeline</span>
            <Zap className="text-emerald-600" size={16} />
          </div>
          <div className="text-4xl font-bold text-emerald-900">{metrics.activeRate}%</div>
          <p className="text-xs text-emerald-700 mt-2">{metrics.activeLeads} leads active</p>
        </div>

        {/* At Risk */}
        <div className="bg-gradient-to-br from-red-50 to-red-100 border border-red-200 rounded-lg p-4 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold uppercase text-red-700">At Risk</span>
            <AlertTriangle className="text-red-600" size={16} />
          </div>
          <div className="text-4xl font-bold text-red-900">{metrics.atRisk}</div>
          <p className="text-xs text-red-700 mt-2">SLA breached / escalated</p>
        </div>
      </div>

      {/* MANAGEMENT SHORTCUTS */}
      <div className="grid grid-cols-3 gap-3">
        {/* Lead Management */}
        <button
          onClick={onViewAllLeads}
          className="bg-white border border-slate-200 rounded-lg p-4 shadow-sm hover:shadow-md hover:border-blue-300 transition-all text-left"
        >
          <div>
            <h3 className="font-bold text-slate-900 text-sm">Lead Management</h3>
            <p className="text-xs text-slate-600 mt-1">View all leads, filter, search, bulk assign</p>
            <div className="mt-3 inline-flex items-center gap-1 text-xs font-semibold text-blue-600">
              <span>Manage Leads</span>
              <span>→</span>
            </div>
          </div>
        </button>

        {/* Team Management */}
        <button
          onClick={onViewTeamManagement}
          className="bg-white border border-slate-200 rounded-lg p-4 shadow-sm hover:shadow-md hover:border-emerald-300 transition-all text-left"
        >
          <div>
            <h3 className="font-bold text-slate-900 text-sm">Team Management</h3>
            <p className="text-xs text-slate-600 mt-1">View team members, performance, capacity</p>
            <div className="mt-3 inline-flex items-center gap-1 text-xs font-semibold text-emerald-600">
              <span>{metrics.teamCount} Members</span>
              <span>→</span>
            </div>
          </div>
        </button>

        {/* Partner Management */}
        <button
          onClick={onViewPartnerManagement}
          className="bg-white border border-slate-200 rounded-lg p-4 shadow-sm hover:shadow-md hover:border-amber-300 transition-all text-left"
        >
          <div>
            <h3 className="font-bold text-slate-900 text-sm">Partner Management</h3>
            <p className="text-xs text-slate-600 mt-1">View partners, approvals, commissions</p>
            <div className="mt-3 inline-flex items-center gap-1 text-xs font-semibold text-amber-600">
              <span>{metrics.partnerCount} Partners</span>
              <span>→</span>
            </div>
          </div>
        </button>
      </div>

      {/* TEAM LEVEL PERFORMANCE */}
      <div className="bg-white border border-slate-200 rounded-lg p-4 shadow-sm">
        <h3 className="font-bold text-slate-900 mb-4">Team Performance Overview</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="p-3 font-semibold text-slate-700">Team Member</th>
                <th className="p-3 font-semibold text-slate-700 text-center">Leads Assigned</th>
                <th className="p-3 font-semibold text-slate-700 text-center">Converted</th>
                <th className="p-3 font-semibold text-slate-700 text-center">Conversion %</th>
                <th className="p-3 font-semibold text-slate-700 text-center">Capacity Used</th>
                <th className="p-3 font-semibold text-slate-700 text-center">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {teamMembers.slice(0, 5).map((member) => {
                const memberLeads = leads.filter(l => l.leadOwner === member.id);
                const converted = memberLeads.filter(l => l.leadStatus === 'Closed').length;
                const conversionRate = memberLeads.length > 0 ? Math.round((converted / memberLeads.length) * 100) : 0;
                return (
                  <tr key={member.id} className="hover:bg-slate-50">
                    <td className="p-3 font-medium text-slate-900">{member.name}</td>
                    <td className="p-3 text-center text-slate-700">{memberLeads.length}</td>
                    <td className="p-3 text-center font-semibold text-emerald-600">{converted}</td>
                    <td className="p-3 text-center font-semibold text-blue-600">{conversionRate}%</td>
                    <td className="p-3 text-center">
                      <div className="flex items-center justify-center gap-2">
                        <div className="w-16 h-1.5 rounded-full bg-slate-200">
                          <div
                            className={`h-full rounded-full ${member.capacityPercent > 90 ? 'bg-red-500' : member.capacityPercent > 70 ? 'bg-amber-500' : 'bg-emerald-500'}`}
                            style={{ width: `${Math.min(member.capacityPercent, 100)}%` }}
                          />
                        </div>
                        <span className="w-10 text-right">{member.capacityPercent}%</span>
                      </div>
                    </td>
                    <td className="p-3 text-center">
                      <span className={`inline-block px-2 py-0.5 rounded text-[11px] font-semibold ${
                        member.status === 'Active' 
                          ? 'bg-emerald-100 text-emerald-700' 
                          : 'bg-amber-100 text-amber-700'
                      }`}>
                        {member.status === 'Active' ? 'Active' : 'Pending'}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* PRODUCT LEVEL BUSINESS METRICS */}
      <div className="bg-white border border-slate-200 rounded-lg p-4 shadow-sm">
        <h3 className="font-bold text-slate-900 mb-4">Product-Level Business Metrics</h3>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {/* Education Loan */}
          <div className="border border-slate-200 rounded-lg p-3">
            <div className="text-xs font-semibold text-slate-600 uppercase mb-2">Education Loan</div>
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-xs text-slate-600">Disbursed</span>
                <span className="font-bold text-slate-900">₹2.4 Cr</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-xs text-slate-600">Commission</span>
                <span className="font-bold text-emerald-600">₹18.2L</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-xs text-slate-600">Pipeline</span>
                <span className="font-bold text-blue-600">₹95L</span>
              </div>
              <div className="text-[11px] text-slate-500 mt-2 pt-2 border-t border-slate-200">
                24 active leads
              </div>
            </div>
          </div>

          {/* Bank Account */}
          <div className="border border-slate-200 rounded-lg p-3">
            <div className="text-xs font-semibold text-slate-600 uppercase mb-2">Bank Account</div>
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-xs text-slate-600">Activated</span>
                <span className="font-bold text-slate-900">₹1.8 Cr</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-xs text-slate-600">Commission</span>
                <span className="font-bold text-emerald-600">₹8.1L</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-xs text-slate-600">Pipeline</span>
                <span className="font-bold text-blue-600">₹52L</span>
              </div>
              <div className="text-[11px] text-slate-500 mt-2 pt-2 border-t border-slate-200">
                18 active leads
              </div>
            </div>
          </div>

          {/* Credit Card */}
          <div className="border border-slate-200 rounded-lg p-3">
            <div className="text-xs font-semibold text-slate-600 uppercase mb-2">Credit Card</div>
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-xs text-slate-600">Issued</span>
                <span className="font-bold text-slate-900">₹87L</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-xs text-slate-600">Commission</span>
                <span className="font-bold text-emerald-600">₹12.5L</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-xs text-slate-600">Pipeline</span>
                <span className="font-bold text-blue-600">₹34L</span>
              </div>
              <div className="text-[11px] text-slate-500 mt-2 pt-2 border-t border-slate-200">
                15 active leads
              </div>
            </div>
          </div>

          {/* Insurance */}
          <div className="border border-slate-200 rounded-lg p-3">
            <div className="text-xs font-semibold text-slate-600 uppercase mb-2">Insurance</div>
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-xs text-slate-600">Premium Collected</span>
                <span className="font-bold text-slate-900">₹45L</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-xs text-slate-600">Commission</span>
                <span className="font-bold text-emerald-600">₹5.4L</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-xs text-slate-600">Pipeline</span>
                <span className="font-bold text-blue-600">₹28L</span>
              </div>
              <div className="text-[11px] text-slate-500 mt-2 pt-2 border-t border-slate-200">
                12 active leads
              </div>
            </div>
          </div>
        </div>

        {/* Summary Metrics */}
        <div className="mt-4 pt-4 border-t border-slate-200 grid grid-cols-3 gap-3">
          <div className="p-3 bg-gradient-to-br from-emerald-50 to-emerald-100 rounded-lg">
            <div className="text-xs font-semibold text-emerald-700 uppercase">Total Commission</div>
            <div className="text-2xl font-bold text-emerald-900 mt-1">₹44.2L</div>
          </div>
          <div className="p-3 bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg">
            <div className="text-xs font-semibold text-blue-700 uppercase">Total Pipeline</div>
            <div className="text-2xl font-bold text-blue-900 mt-1">₹2.09 Cr</div>
          </div>
          <div className="p-3 bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg">
            <div className="text-xs font-semibold text-purple-700 uppercase">Pending to Partners</div>
            <div className="text-2xl font-bold text-purple-900 mt-1">₹15.8L</div>
          </div>
        </div>
      </div>



      {/* PRODUCT PERFORMANCE BREAKDOWN */}
      <div className="bg-white border border-slate-200 rounded-lg p-4 shadow-sm">
        <div className="flex items-center gap-2 mb-4">
          <BarChart3 className="text-slate-600" size={18} />
          <h3 className="font-bold text-slate-900">Product Performance</h3>
        </div>

        <div className="space-y-2">
          {Object.entries(metrics.productMetrics).length > 0 ? (
            Object.entries(metrics.productMetrics)
              .sort(([, a], [, b]) => b.count - a.count)
              .map(([product, data]) => {
                const qualRate = data.count > 0 ? Math.round((data.qualified / data.count) * 100) : 0;
                return (
                  <div key={product} className="flex items-center justify-between p-2 bg-slate-50 rounded hover:bg-slate-100 transition-colors">
                    <div className="flex-1">
                      <div className="text-xs font-semibold text-slate-900">{product}</div>
                      <div className="text-[11px] text-slate-500">{data.count} leads • {qualRate}% qualified</div>
                    </div>
                    <div className="w-24 h-1.5 rounded-full bg-slate-200">
                      <div
                        className="h-full rounded-full bg-blue-500"
                        style={{ width: `${Math.min((data.qualified / Math.max(data.count, 1)) * 100, 100)}%` }}
                      />
                    </div>
                  </div>
                );
              })
          ) : (
            <div className="text-center py-4 text-slate-500 text-xs">No product data available</div>
          )}
        </div>
      </div>

      {/* QUICK STATS */}
      <div className="grid grid-cols-3 gap-3">
        <div className="bg-slate-50 border border-slate-200 rounded-lg p-3 text-center">
          <div className="text-2xl font-bold text-slate-900">{metrics.totalLeads}</div>
          <div className="text-xs text-slate-600 mt-1">Total Pipeline</div>
        </div>
        <div className="bg-slate-50 border border-slate-200 rounded-lg p-3 text-center">
          <div className="text-2xl font-bold text-emerald-600">{metrics.teamCount}</div>
          <div className="text-xs text-slate-600 mt-1">Team Members</div>
        </div>
        <div className="bg-slate-50 border border-slate-200 rounded-lg p-3 text-center">
          <div className="text-2xl font-bold text-amber-600">{metrics.partnerCount}</div>
          <div className="text-xs text-slate-600 mt-1">Partners</div>
        </div>
      </div>
    </div>
  );
};

