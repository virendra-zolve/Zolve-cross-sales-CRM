import React from 'react';
import { StudentLead } from '../types';

export type KpiFilterType = 'all' | 'new_leads' | 'followups_today' | 'overdue_kpi' | 'active';

interface KpiBarProps {
  leads: StudentLead[];
  activeFilter: KpiFilterType;
  onSelectFilter: (filter: KpiFilterType) => void;
}

export const KpiBar: React.FC<KpiBarProps> = ({
  leads,
  activeFilter,
  onSelectFilter,
}) => {
  const newLeadsCount = leads.filter(l => l.callingStatus === 'Not Attempted' || l.qualificationStatus === 'Pending').length;
  const followupsTodayCount = leads.filter(l => l.callingStatus === 'Callback Scheduled' || l.callingStatus === 'Connected').length;
  const overdueKpiCount = leads.filter(l => l.kpiStatus === 'Overdue').length;
  const activeOpportunitiesCount = leads.filter(l => l.leadStatus === 'Active').length;

  const cards = [
    {
      id: 'new_leads' as KpiFilterType,
      label: 'New Leads',
      sublabel: 'Pending first touch',
      count: newLeadsCount,
      color: 'text-slate-900',
    },
    {
      id: 'followups_today' as KpiFilterType,
      label: 'Follow-ups Today',
      sublabel: 'Scheduled calls',
      count: followupsTodayCount,
      color: 'text-slate-900',
    },
    {
      id: 'overdue_kpi' as KpiFilterType,
      label: 'KPI Overdue',
      sublabel: 'Exceeded response target',
      count: overdueKpiCount,
      color: 'text-[#D91C24]',
      badge: overdueKpiCount > 0 ? 'Urgent' : undefined,
    },
    {
      id: 'active' as KpiFilterType,
      label: 'Active Pipeline',
      sublabel: 'Total ongoing students',
      count: activeOpportunitiesCount,
      color: 'text-slate-900',
    },
  ];

  return (
    <div id="kpi-cards-grid" className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-4">
      {cards.map((card) => {
        const isActive = activeFilter === card.id;
        return (
          <div
            key={card.id}
            id={`kpi-card-${card.id}`}
            onClick={() => onSelectFilter(isActive ? 'all' : card.id)}
            className={`p-4 rounded-xl bg-white border transition-all cursor-pointer select-none ${
              isActive 
                ? 'border-slate-800 ring-1 ring-slate-800 shadow-xs' 
                : 'border-slate-200/80 hover:border-slate-300 hover:shadow-2xs'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-500">
                {card.label}
              </span>
              {card.badge && (
                <span className="text-[10px] font-semibold px-1.5 py-0.2 rounded bg-rose-50 text-[#D91C24] border border-rose-200">
                  {card.badge}
                </span>
              )}
            </div>

            <div className="mt-2 flex items-baseline justify-between">
              <span className={`text-2xl font-bold tracking-tight ${card.color}`}>
                {card.count}
              </span>
              <span className="text-[11px] text-slate-400">
                {isActive ? 'Filtered' : 'Filter'}
              </span>
            </div>

            <p className="text-[11px] text-slate-400 mt-1 truncate">
              {card.sublabel}
            </p>
          </div>
        );
      })}
    </div>
  );
};
