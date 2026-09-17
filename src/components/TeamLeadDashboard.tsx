import React, { useState, useMemo } from 'react';
import { AlertTriangle, CheckCircle2, Phone } from 'lucide-react';
import { StudentLead, TeamMember } from '../types';
import { calculateDashboardMetrics } from '../utils/metricsHelpers';
import { LeadTable } from './LeadTable';
import { BulkAssignmentModal } from './BulkAssignmentModal';

interface TeamLeadDashboardProps {
  leads: StudentLead[];
  teamMembers?: TeamMember[];
  onSelectLead: (lead: StudentLead) => void;
  onInitiateCall: (lead: StudentLead) => void;
  onQuickLogOutcome: (lead: StudentLead) => void;
  onBulkAssignLeads?: (leads: StudentLead[], assignment: { agentId?: string }) => void;
  onViewTeamManagement?: () => void;
  onViewPartnerManagement?: () => void;
  onViewLeadManagement?: () => void;
}

export const TeamLeadDashboard: React.FC<TeamLeadDashboardProps> = ({
  leads,
  teamMembers = [],
  onSelectLead,
  onInitiateCall,
  onQuickLogOutcome,
  onBulkAssignLeads,
  onViewTeamManagement,
  onViewPartnerManagement,
  onViewLeadManagement,
}) => {
  const [activeKpiFilter, setActiveKpiFilter] = useState<'all' | 'unassigned' | 'qualified' | 'not_attempted' | 'kpi_breach'>('all');
  const [selectedLeadIds, setSelectedLeadIds] = useState<string[]>([]);
  const [isBulkAssignOpen, setIsBulkAssignOpen] = useState(false);

  const metrics = calculateDashboardMetrics(leads);

  const filteredLeads = useMemo(() => {
    return leads.filter(lead => {
      if (activeKpiFilter === 'unassigned') {
        return !lead.leadOwner || lead.leadOwner === 'Unassigned';
      } else if (activeKpiFilter === 'qualified') {
        return lead.qualificationStatus === 'Qualified';
      } else if (activeKpiFilter === 'not_attempted') {
        return lead.callingStatus === 'Not Attempted';
      } else if (activeKpiFilter === 'kpi_breach') {
        return lead.kpiStatus === 'Overdue' || lead.escalationStatus === 'Escalated';
      }
      return true;
    });
  }, [leads, activeKpiFilter]);

  return (
    <div className="space-y-6">
      {/* Management Navigation */}
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

      {/* KPI CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Unassigned */}
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
          <div className="text-3xl font-bold text-slate-900">{metrics.unassignedLeads || 0}</div>
          <p className="text-xs text-slate-600 mt-2">Leads pending allocation</p>
        </button>

        {/* Qualified */}
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
          <div className="text-3xl font-bold text-slate-900">{metrics.qualifiedLeads || 0}</div>
          <p className="text-xs text-slate-600 mt-2">Ready for processing</p>
        </button>

        {/* Not Attempted */}
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
          <div className="text-3xl font-bold text-slate-900">{metrics.notAttempted || 0}</div>
          <p className="text-xs text-slate-600 mt-2">Pending first contact</p>
        </button>

        {/* KPI Breach */}
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
            <AlertTriangle className="w-4 h-4 text-[#D91C24]" />
          </div>
          <div className="text-3xl font-bold text-[#D91C24]">{metrics.slaBreached || 0}</div>
          <p className="text-xs text-slate-600 mt-2">Immediate action needed</p>
        </button>
      </div>

      {/* LEAD TABLE WITH SELECTION */}
      <LeadTable
        leads={filteredLeads}
        onSelectLead={onSelectLead}
        onInitiateCall={onInitiateCall}
        onQuickLogOutcome={onQuickLogOutcome}
        kpiFilterLabel={activeKpiFilter !== 'all' ? `Filter: ${activeKpiFilter.replace('_', ' ').toUpperCase()}` : undefined}
        onClearKpiFilter={() => setActiveKpiFilter('all')}
        selectedLeadIds={selectedLeadIds}
        onLeadSelectionChange={setSelectedLeadIds}
        onBulkAssign={() => setIsBulkAssignOpen(true)}
      />

      {/* Bulk Assignment Modal */}
      <BulkAssignmentModal
        isOpen={isBulkAssignOpen}
        selectedLeads={selectedLeadIds.map(id => leads.find(l => l.id === id)!).filter(Boolean)}
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
