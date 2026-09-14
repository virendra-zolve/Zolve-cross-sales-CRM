import React, { useState, useMemo } from 'react';
import { 
  PhoneForwarded, 
  Clock, 
  CheckCircle2, 
  UserPlus, 
  Upload, 
  ArrowRight, 
  Phone,
  Layers,
  Sparkles,
} from 'lucide-react';
import { StudentLead } from '../types';
import { calculateLeadSlaInfo, SlaInfo } from '../utils/slaHelpers';
import { calculateDashboardMetrics } from '../utils/metricsHelpers';
import { LeadTable } from './LeadTable';

interface RmDashboardProps {
  leads: StudentLead[];
  onSelectLead: (lead: StudentLead) => void;
  onInitiateCall: (lead: StudentLead) => void;
  onQuickLogOutcome: (lead: StudentLead) => void;
  onOpenNewLead: () => void;
  onOpenBulkUpload: () => void;
  onViewAllLeads: (filter?: string) => void;
  onStartDiscovery?: (lead: StudentLead) => void;
  onSimulateInboundLead?: () => void;
}

// Re-export for backward compatibility
export const getLeadSlaInfo = (lead: StudentLead): SlaInfo => {
  return calculateLeadSlaInfo(lead);
};

export const RmDashboard: React.FC<RmDashboardProps> = ({
  leads,
  onSelectLead,
  onInitiateCall,
  onQuickLogOutcome,
  onOpenNewLead,
  onOpenBulkUpload,
  onViewAllLeads,
  onStartDiscovery,
  onSimulateInboundLead,
}) => {
  const [actionFilter, setActionFilter] = useState<'all' | 'breached' | 'callbacks' | 'pending'>('all');

  // Calculate metrics once - single source of truth
  const metrics = useMemo(() => {
    return calculateDashboardMetrics(leads);
  }, [leads]);

  const totalActiveLeadsCount = metrics.totalActiveLeads;
  const newLeadsCount = metrics.newLeads;
  const callsDueTodayCount = metrics.callsDueToday;
  const pendingActionsCount = metrics.pendingActions;

  // Leads Requiring Action: Filtered & sorted by priority
  const actionableLeads = useMemo(() => {
    let scored: Array<{ lead: StudentLead; slaInfo: ReturnType<typeof calculateLeadSlaInfo>; score: number }> = leads.map(lead => {
      const slaInfo = calculateLeadSlaInfo(lead);
      let score = 0;
      if (slaInfo.slaStatus === 'Breached') score = 400;
      else if (slaInfo.slaStatus === 'Due') score = 300;
      else if (lead.callingStatus === 'Callback Scheduled') score = 200;
      else if (lead.callingStatus === 'Not Attempted') score = 100;
      else score = 50;

      return { lead, slaInfo, score };
    });

    // Filter if active tab is chosen
    const filtered = scored.filter(item => {
      if (actionFilter === 'breached') return item.slaInfo.slaStatus === 'Breached' || item.slaInfo.slaStatus === 'Due';
      if (actionFilter === 'callbacks') return item.lead.callingStatus === 'Callback Scheduled';
      if (actionFilter === 'pending') return item.lead.qualificationStatus === 'Pending' || item.lead.callingStatus === 'Not Attempted';
      return true; // 'all'
    });

    // Sort descending by score
    return filtered.sort((a, b) => b.score - a.score);
  }, [leads, actionFilter]);

  // Recent activity logs as specified in PRD V1
  const recentActivities = [
    { time: '10:42 AM', title: 'Call completed', studentName: 'Rahul Sharma', leadId: 'L000101', type: 'call' },
    { time: '10:35 AM', title: 'Lead assigned', studentName: 'Neha Patel', leadId: 'L000105', type: 'assignment' },
    { time: '10:20 AM', title: 'Education Loan status → Documents Pending', studentName: 'Rahul Sharma', leadId: 'L000101', type: 'product' },
    { time: '10:12 AM', title: 'Next call scheduled', studentName: 'Aman Gupta', leadId: 'L000104', type: 'schedule' },
    { time: '09:55 AM', title: 'Lead stage → Application', studentName: 'Arjun Mehta', leadId: 'L000106', type: 'stage' },
  ];

  return (
    <div className="space-y-6">
      {/* KPI CARDS */}
      <div className="grid grid-cols-4 gap-4">
        {/* Card 1: My Active Leads */}
        <div 
          onClick={() => onViewAllLeads('all')}
          className="bg-white border border-slate-200 rounded-lg p-4 shadow-sm hover:border-slate-300 transition-all cursor-pointer group"
          id="kpi-card-my-active-leads"
        >
          <div className="inline-block px-2 py-1 bg-blue-100 text-blue-700 text-xs font-bold rounded-full mb-3">MY ACTIVE</div>
          <div className="text-3xl font-bold text-slate-900 group-hover:text-blue-600 transition-colors">
            {totalActiveLeadsCount}
          </div>
          <div className="text-xs text-slate-600 mt-2">Assigned to me</div>
        </div>

        {/* Card 2: New Leads */}
        <div 
          onClick={() => onViewAllLeads('new_leads')}
          className="bg-white border border-slate-200 rounded-lg p-4 shadow-sm hover:border-slate-300 transition-all cursor-pointer group"
          id="kpi-card-new-leads"
        >
          <div className="inline-block px-2 py-1 bg-purple-100 text-purple-700 text-xs font-bold rounded-full mb-3">NEW LEADS</div>
          <div className="text-3xl font-bold text-slate-900 group-hover:text-purple-600 transition-colors">
            {newLeadsCount}
          </div>
          <div className="text-xs text-slate-600 mt-2">Assigned today</div>
        </div>

        {/* Card 3: Calls Due Today */}
        <div 
          onClick={() => setActionFilter('all')}
          className="bg-white border border-slate-200 rounded-lg p-4 shadow-sm hover:border-slate-300 transition-all cursor-pointer group"
          id="kpi-card-calls-due"
        >
          <div className="inline-block px-2 py-1 bg-orange-100 text-orange-700 text-xs font-bold rounded-full mb-3">CALLS DUE</div>
          <div className="text-3xl font-bold text-slate-900 group-hover:text-orange-600 transition-colors">
            {callsDueTodayCount}
          </div>
          <div className="text-xs text-slate-600 mt-2">Today</div>
        </div>

        {/* Card 4: Needs Action */}
        <div 
          onClick={() => setActionFilter('pending')}
          className="bg-white border border-slate-200 rounded-lg p-4 shadow-sm hover:border-slate-300 transition-all cursor-pointer group"
          id="kpi-card-needs-action"
        >
          <div className="inline-block px-2 py-1 bg-red-100 text-red-700 text-xs font-bold rounded-full mb-3">NEEDS ACTION</div>
          <div className="text-3xl font-bold text-slate-900 group-hover:text-red-600 transition-colors">
            {pendingActionsCount}
          </div>
          <div className="text-xs text-slate-600 mt-2">Requires action</div>
        </div>
      </div>



      {/* Leads Table */}
      <LeadTable
        leads={actionableLeads.slice(0, 7).map(({ lead }) => lead)}
        onSelectLead={onSelectLead}
        onInitiateCall={onInitiateCall}
        onQuickLogOutcome={onQuickLogOutcome}
        enableColumnFilter={false}
      />



      {/* ───────────────────────────────────────────────────────────
          RECENT ACTIVITY
      ─────────────────────────────────────────────────────────── */}
      <section className="bg-white border border-slate-200/90 rounded-xl p-4 shadow-xs">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-3">
          <div>
            <h3 className="text-base font-bold text-slate-900 tracking-wide uppercase">
              Recent Activity
            </h3>
            <p className="text-[11px] text-slate-600 mt-0.5">
              Real-time operational audit log of RM actions
            </p>
          </div>
          <span className="inline-flex items-center gap-1 text-[11px] font-medium text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
            Live Sync
          </span>
        </div>

        <div className="space-y-2.5">
          {recentActivities.map((act, index) => (
            <div 
              key={index} 
              className="flex items-start gap-3 p-2 rounded-lg hover:bg-slate-50 transition-colors"
            >
              <div className="text-[11px] font-mono text-slate-600 shrink-0 mt-0.5 font-medium">
                {act.time}
              </div>
              <div className="flex-1 text-xs">
                <div className="text-slate-800">
                  <span className="font-semibold text-slate-900">{act.title}</span>
                  <span> – </span>
                  <span className="font-semibold text-[#D91C24] hover:underline cursor-pointer"
                    onClick={() => {
                      const l = leads.find(lead => lead.id === act.leadId);
                      if (l) onSelectLead(l);
                    }}
                  >
                    {act.studentName}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};
