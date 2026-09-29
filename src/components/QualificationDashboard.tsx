import React, { useMemo } from 'react';
import { Clock, CheckCircle2, XCircle } from 'lucide-react';
import { StudentLead } from '../types';
import { LeadTable } from './LeadTable';

interface QualificationDashboardProps {
  leads: StudentLead[];
  onSelectLead: (lead: StudentLead) => void;
}

const isSameDay = (iso?: string) => {
  if (!iso) return false;
  const d = new Date(iso);
  const now = new Date();
  return (
    d.getFullYear() === now.getFullYear() &&
    d.getMonth() === now.getMonth() &&
    d.getDate() === now.getDate()
  );
};

export const QualificationDashboard: React.FC<QualificationDashboardProps> = ({
  leads,
  onSelectLead,
}) => {
  const metrics = useMemo(() => {
    const pending = leads.filter((l) => l.qualificationStatus === 'Pending');
    const qualifiedToday = leads.filter(
      (l) => l.qualificationStatus === 'Qualified' && isSameDay(l.qualificationCompletedAt)
    );
    const notQualifiedToday = leads.filter(
      (l) => l.qualificationStatus === 'Not Qualified' && isSameDay(l.qualificationCompletedAt)
    );
    return {
      pendingCount: pending.length,
      qualifiedTodayCount: qualifiedToday.length,
      notQualifiedTodayCount: notQualifiedToday.length,
      pending,
    };
  }, [leads]);

  return (
    <div className="space-y-6">
      {/* KPI CARDS */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-white border border-slate-200 rounded-lg p-4 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-slate-500 uppercase">Pending Qualification</span>
            <Clock className="w-4 h-4 text-amber-500" />
          </div>
          <div className="text-3xl font-bold text-slate-900">{metrics.pendingCount}</div>
          <p className="text-xs text-slate-600 mt-2">Leads awaiting qualification</p>
        </div>

        <div className="bg-white border border-slate-200 rounded-lg p-4 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-slate-500 uppercase">Qualified Today</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="text-3xl font-bold text-emerald-700">{metrics.qualifiedTodayCount}</div>
          <p className="text-xs text-slate-600 mt-2">Ready for RM claim</p>
        </div>

        <div className="bg-white border border-slate-200 rounded-lg p-4 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-slate-500 uppercase">Not Qualified Today</span>
            <XCircle className="w-4 h-4 text-rose-500" />
          </div>
          <div className="text-3xl font-bold text-rose-700">{metrics.notQualifiedTodayCount}</div>
          <p className="text-xs text-slate-600 mt-2">Closed with reason</p>
        </div>
      </div>

      {/* Pending queue */}
      <section className="bg-white border border-slate-200/90 rounded-xl p-4 shadow-xs">
        <div className="border-b border-slate-100 pb-3 mb-3">
          <h3 className="text-base font-bold text-slate-900 tracking-wide uppercase">
            Qualification Queue
          </h3>
          <p className="text-[11px] text-slate-600 mt-0.5">
            {metrics.pendingCount} leads waiting to be qualified. Open a lead to set its qualification status.
          </p>
        </div>

        <LeadTable
          leads={metrics.pending}
          onSelectLead={onSelectLead}
          enableColumnFilter={false}
        />
      </section>
    </div>
  );
};
