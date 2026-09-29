import React, { useMemo, useState } from 'react';
import { AlertTriangle, CheckCircle2, Phone, Users } from 'lucide-react';
import { StudentLead, TeamMember } from '../types';
import { calculateDashboardMetrics } from '../utils/metricsHelpers';
import { LeadTable } from './LeadTable';
import { BulkAssignmentModal } from './BulkAssignmentModal';

interface ManagerDashboardProps {
  leads: StudentLead[];
  teamMembers?: TeamMember[];
  locationName?: string;
  onSelectLead: (lead: StudentLead) => void;
  onBulkAssignLeads?: (leads: StudentLead[], assignment: { agentId?: string }) => void;
  onViewTeamManagement?: () => void;
  onViewPartnerManagement?: () => void;
  onViewLeadManagement?: () => void;
}

/**
 * Manager Dashboard.
 *
 * Hierarchy: RM (Agent) -> Team Lead (owns a team) -> Manager (owns a location) -> Head (business head).
 * The Manager sees business KPIs for their location plus Team Lead-level operational KPIs and their own
 * lead queue. This is a middle-ground between the operational TL dashboard and the executive Head dashboard.
 */
export const ManagerDashboard: React.FC<ManagerDashboardProps> = ({
  leads,
  teamMembers = [],
  locationName = 'Delhi NCR',
  onSelectLead,
  onBulkAssignLeads,
  onViewTeamManagement,
  onViewPartnerManagement,
  onViewLeadManagement,
}) => {
  const [activeKpiFilter, setActiveKpiFilter] = useState<
    'all' | 'unassigned' | 'qualified' | 'not_attempted' | 'kpi_breach'
  >('all');
  const [selectedLeadIds, setSelectedLeadIds] = useState<string[]>([]);
  const [isBulkAssignOpen, setIsBulkAssignOpen] = useState(false);

  const opMetrics = calculateDashboardMetrics(leads);

  // Business-level rollups for the location (mocked money figures aligned with Head dashboard)
  const businessMetrics = useMemo(() => {
    const total = leads.length;
    const qualified = leads.filter((l) => l.qualificationStatus === 'Qualified').length;
    const closed = leads.filter((l) => l.leadStatus === 'Closed').length;
    const atRisk = leads.filter((l) => l.kpiStatus === 'Overdue' || l.escalationStatus === 'Escalated').length;
    const qualRate = total > 0 ? Math.round((qualified / total) * 100) : 0;
    const convRate = total > 0 ? Math.round((closed / total) * 100) : 0;
    return { total, qualified, closed, atRisk, qualRate, convRate };
  }, [leads]);

  // Team Lead-level breakdown: aggregate performance for each TL's reports
  const teamLeadRollups = useMemo(() => {
    const tls = teamMembers.filter((m) => m.role === 'Team Lead');
    const agents = teamMembers.filter((m) => m.role === 'Agent');

    return tls.map((tl) => {
      const teamAgents = agents.filter((a) => a.managerId === tl.userId || a.managerName === tl.name);
      // Leads reference their owner by display name (e.g. "Priya Patel"), not by id.
      const ownerNames = new Set<string>([tl.name, ...teamAgents.map((a) => a.name)]);
      const teamLeads = leads.filter((l) => ownerNames.has(l.leadOwner));

      const teamActive = teamLeads.filter((l) => l.leadStatus === 'Active').length;
      const teamClosed = teamLeads.filter((l) => l.leadStatus === 'Closed').length;
      const teamOverdue = teamLeads.filter((l) => l.kpiStatus === 'Overdue').length;
      const teamConv = teamLeads.length > 0 ? Math.round((teamClosed / teamLeads.length) * 100) : 0;

      return {
        tl,
        agentCount: teamAgents.length,
        leadCount: teamLeads.length,
        active: teamActive,
        closed: teamClosed,
        overdue: teamOverdue,
        conv: teamConv,
      };
    });
  }, [teamMembers, leads]);

  const filteredLeads = useMemo(() => {
    return leads.filter((lead) => {
      if (activeKpiFilter === 'unassigned') {
        return !lead.leadOwner || lead.leadOwner === 'Unassigned';
      }
      if (activeKpiFilter === 'qualified') return lead.qualificationStatus === 'Qualified';
      if (activeKpiFilter === 'not_attempted') return lead.callingStatus === 'Not Attempted';
      if (activeKpiFilter === 'kpi_breach') {
        return lead.kpiStatus === 'Overdue' || lead.escalationStatus === 'Escalated';
      }
      return true;
    });
  }, [leads, activeKpiFilter]);

  return (
    <div className="space-y-6">
      {/* BUSINESS METRICS STRIP (from Head dashboard, location-scoped) */}
      <div>
        <div className="flex items-baseline justify-between mb-2">
          <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wide">
            Business Performance — {locationName}
          </h3>
          <span className="text-[11px] text-slate-500">Location-scoped rollup</span>
        </div>
        <div className="grid grid-cols-4 gap-3">
          <div className="p-3 bg-gradient-to-br from-emerald-50 to-emerald-100 border border-emerald-200 rounded-lg">
            <div className="text-[11px] font-semibold text-emerald-700 uppercase">Location Commission</div>
            <div className="text-2xl font-bold text-emerald-900 mt-1">₹14.8L</div>
          </div>
          <div className="p-3 bg-gradient-to-br from-blue-50 to-blue-100 border border-blue-200 rounded-lg">
            <div className="text-[11px] font-semibold text-blue-700 uppercase">Pipeline Value</div>
            <div className="text-2xl font-bold text-blue-900 mt-1">₹72L</div>
          </div>
          <div className="p-3 bg-gradient-to-br from-slate-50 to-slate-100 border border-slate-200 rounded-lg">
            <div className="text-[11px] font-semibold text-slate-700 uppercase">Qualification Rate</div>
            <div className="text-2xl font-bold text-slate-900 mt-1">{businessMetrics.qualRate}%</div>
          </div>
          <div className="p-3 bg-gradient-to-br from-purple-50 to-purple-100 border border-purple-200 rounded-lg">
            <div className="text-[11px] font-semibold text-purple-700 uppercase">Conversion Rate</div>
            <div className="text-2xl font-bold text-purple-900 mt-1">{businessMetrics.convRate}%</div>
          </div>
        </div>
      </div>

      {/* MANAGEMENT NAVIGATION (same as TL) */}
      <div className="flex items-center gap-3">
        <button
          onClick={onViewLeadManagement}
          className="inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
        >
          Lead Management
        </button>
        <button
          onClick={onViewTeamManagement}
          className="inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors cursor-pointer"
        >
          Team Management
        </button>
        <button
          onClick={onViewPartnerManagement}
          className="inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors cursor-pointer"
        >
          Partner Management
        </button>
      </div>

      {/* OPERATIONAL KPI CARDS (from TL dashboard) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <button
          onClick={() => setActiveKpiFilter(activeKpiFilter === 'unassigned' ? 'all' : 'unassigned')}
          className={`p-4 rounded-xl border transition-all text-left cursor-pointer bg-white shadow-xs hover:shadow-md ${
            activeKpiFilter === 'unassigned'
              ? 'ring-2 ring-amber-500 border-amber-300 bg-amber-50/20'
              : 'border-slate-200/80 hover:border-slate-300'
          }`}
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-slate-500 uppercase">Unassigned</span>
            <span className="w-2 h-2 rounded-full bg-amber-500"></span>
          </div>
          <div className="text-3xl font-bold text-slate-900">{opMetrics.unassignedLeads || 0}</div>
          <p className="text-xs text-slate-600 mt-2">Leads pending allocation</p>
        </button>

        <button
          onClick={() => setActiveKpiFilter(activeKpiFilter === 'qualified' ? 'all' : 'qualified')}
          className={`p-4 rounded-xl border transition-all text-left cursor-pointer bg-white shadow-xs hover:shadow-md ${
            activeKpiFilter === 'qualified'
              ? 'ring-2 ring-emerald-500 border-emerald-300 bg-emerald-50/20'
              : 'border-slate-200/80 hover:border-slate-300'
          }`}
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-slate-500 uppercase">Qualified</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="text-3xl font-bold text-slate-900">{opMetrics.qualifiedLeads || 0}</div>
          <p className="text-xs text-slate-600 mt-2">Ready for processing</p>
        </button>

        <button
          onClick={() => setActiveKpiFilter(activeKpiFilter === 'not_attempted' ? 'all' : 'not_attempted')}
          className={`p-4 rounded-xl border transition-all text-left cursor-pointer bg-white shadow-xs hover:shadow-md ${
            activeKpiFilter === 'not_attempted'
              ? 'ring-2 ring-blue-500 border-blue-300 bg-blue-50/20'
              : 'border-slate-200/80 hover:border-slate-300'
          }`}
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-slate-500 uppercase">Not Attempted</span>
            <Phone className="w-4 h-4 text-blue-500" />
          </div>
          <div className="text-3xl font-bold text-slate-900">{opMetrics.notAttempted || 0}</div>
          <p className="text-xs text-slate-600 mt-2">Pending first contact</p>
        </button>

        <button
          onClick={() => setActiveKpiFilter(activeKpiFilter === 'kpi_breach' ? 'all' : 'kpi_breach')}
          className={`p-4 rounded-xl border transition-all text-left cursor-pointer bg-white shadow-xs hover:shadow-md ${
            activeKpiFilter === 'kpi_breach'
              ? 'ring-2 ring-rose-500 border-rose-300 bg-rose-50/20'
              : 'border-slate-200/80 hover:border-slate-300'
          }`}
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-slate-500 uppercase">KPI Breach</span>
            <AlertTriangle className="w-4 h-4 text-[#2563EB]" />
          </div>
          <div className="text-3xl font-bold text-[#2563EB]">{opMetrics.slaBreached || 0}</div>
          <p className="text-xs text-slate-600 mt-2">Immediate action needed</p>
        </button>
      </div>

      {/* TEAM LEAD ROLLUP TABLE */}
      <section className="bg-white border border-slate-200/90 rounded-xl p-4 shadow-xs">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-3">
          <div>
            <h3 className="text-base font-bold text-slate-900 tracking-wide uppercase">
              Team Leads under {locationName}
            </h3>
            <p className="text-[11px] text-slate-600 mt-0.5">
              {teamLeadRollups.length} team leads managing {teamLeadRollups.reduce((s, r) => s + r.agentCount, 0)} agents
            </p>
          </div>
          <Users className="w-5 h-5 text-slate-400" />
        </div>

        {teamLeadRollups.length === 0 ? (
          <div className="text-center py-6 text-xs text-slate-500">
            No team leads found for this location. Onboard team leads via Team Management.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead className="bg-slate-50 border-b border-slate-200">
                <tr>
                  <th className="p-3 font-semibold text-slate-700">Team Lead</th>
                  <th className="p-3 font-semibold text-slate-700 text-center">Agents</th>
                  <th className="p-3 font-semibold text-slate-700 text-center">Leads</th>
                  <th className="p-3 font-semibold text-slate-700 text-center">Active</th>
                  <th className="p-3 font-semibold text-slate-700 text-center">Closed</th>
                  <th className="p-3 font-semibold text-slate-700 text-center">Overdue KPI</th>
                  <th className="p-3 font-semibold text-slate-700 text-center">Conv %</th>
                  <th className="p-3 font-semibold text-slate-700 text-center">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {teamLeadRollups.map((row) => (
                  <tr key={row.tl.id} className="hover:bg-slate-50">
                    <td className="p-3 font-medium text-slate-900">{row.tl.name}</td>
                    <td className="p-3 text-center text-slate-700">{row.agentCount}</td>
                    <td className="p-3 text-center text-slate-700">{row.leadCount}</td>
                    <td className="p-3 text-center text-slate-700">{row.active}</td>
                    <td className="p-3 text-center font-semibold text-emerald-600">{row.closed}</td>
                    <td className="p-3 text-center font-semibold text-rose-600">{row.overdue}</td>
                    <td className="p-3 text-center font-semibold text-blue-600">{row.conv}%</td>
                    <td className="p-3 text-center">
                      <span
                        className={`inline-block px-2 py-0.5 rounded text-[11px] font-semibold ${
                          row.tl.status === 'Active'
                            ? 'bg-emerald-100 text-emerald-700'
                            : 'bg-amber-100 text-amber-700'
                        }`}
                      >
                        {row.tl.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {/* LEAD TABLE WITH BULK ASSIGN */}
      <LeadTable
        leads={filteredLeads}
        onSelectLead={onSelectLead}
        kpiFilterLabel={
          activeKpiFilter !== 'all' ? `Filter: ${activeKpiFilter.replace('_', ' ').toUpperCase()}` : undefined
        }
        onClearKpiFilter={() => setActiveKpiFilter('all')}
        selectedLeadIds={selectedLeadIds}
        onLeadSelectionChange={setSelectedLeadIds}
        onBulkAssign={() => setIsBulkAssignOpen(true)}
      />

      <BulkAssignmentModal
        isOpen={isBulkAssignOpen}
        selectedLeads={selectedLeadIds.map((id) => leads.find((l) => l.id === id)!).filter(Boolean)}
        teamMembers={teamMembers}
        currentUserRole="team_lead"
        onClose={() => {
          setIsBulkAssignOpen(false);
          setSelectedLeadIds([]);
        }}
        onAssign={(leadsToAssign, assignment) => {
          onBulkAssignLeads?.(leadsToAssign, { agentId: assignment.agentId });
          setIsBulkAssignOpen(false);
          setSelectedLeadIds([]);
        }}
      />
    </div>
  );
};
