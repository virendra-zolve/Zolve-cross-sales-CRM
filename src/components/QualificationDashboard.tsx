import React, { useMemo } from 'react';
import {
  Clock,
  LockKeyhole,
  PhoneCall,
  Percent,
  UserCheck,
} from 'lucide-react';
import { StudentLead } from '../types';
import {
  getHandoffHistoryLeads,
  getMyClaimedLeads,
  getQualificationQueueLeads,
  getSignupPendingLeads,
} from '../utils/acquireHelpers';
import { LeadTable } from './LeadTable';

export type AcquisitionSection =
  | 'dashboard'
  | 'qualification-queue'
  | 'my-claimed-leads'
  | 'signup-pending'
  | 'handoff-history';

interface QualificationDashboardProps {
  leads: StudentLead[];
  onSelectLead: (lead: StudentLead) => void;
  activeSection?: AcquisitionSection;
  qualificationOwner?: string;
  onClaimLead?: (lead: StudentLead) => void;
  onReleaseLead?: (lead: StudentLead) => void;
  onMarkSignup?: (lead: StudentLead) => void;
  embedded?: boolean;
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

const sectionCopy: Record<
  AcquisitionSection,
  { title: string; description: string; empty: string }
> = {
  dashboard: {
    title: 'Qualification Queue',
    description: 'Review leads waiting for a qualification decision.',
    empty: 'There is no current qualification work in the queue.',
  },
  'qualification-queue': {
    title: 'Qualification Queue',
    description: 'Shared leads available for qualification review.',
    empty: 'There is no current qualification work in the queue.',
  },
  'my-claimed-leads': {
    title: 'My Claimed Leads',
    description: 'Leads claimed by you across Qualification and Pending Signup.',
    empty: 'You have no claimed leads awaiting follow-up.',
  },
  'signup-pending': {
    title: 'Signup Pending',
    description: 'Qualified leads awaiting confirmed signup before handoff.',
    empty: 'There are no qualified leads currently awaiting signup.',
  },
  'handoff-history': {
    title: 'Handoff History',
    description: 'Read-only history of leads transferred to Monetization Center.',
    empty: 'No leads have been handed off to Monetization Center yet.',
  },
};

export const QualificationDashboard: React.FC<QualificationDashboardProps> = ({
  leads,
  onSelectLead,
  activeSection: controlledSection,
  qualificationOwner = 'Qualification Agent',
  onClaimLead,
  onReleaseLead,
  onMarkSignup,
  embedded = false,
}) => {
  const activeSection = controlledSection ?? 'dashboard';

  const metrics = useMemo(() => {
    const pending = getQualificationQueueLeads(leads);
    const qualifiedToday = leads.filter(
      (lead) => lead.qualificationStatus === 'Qualified' && isSameDay(lead.qualificationCompletedAt)
    );
    const qualified = leads.filter((lead) => lead.qualificationStatus === 'Qualified');
    const signupConfirmed = leads.filter(
      (lead) => lead.qualificationStatus === 'Qualified' && lead.signupStatus === 'Signed Up'
    );
    const connectedCalls = leads.flatMap((lead) =>
      lead.callLogs.filter((call) => call.outcome === 'Connected')
    );
    const activeCallDays = new Set(
      connectedCalls
        .map((call) => new Date(call.timestamp))
        .filter((date) => !Number.isNaN(date.getTime()))
        .map((date) => date.toISOString().slice(0, 10))
    ).size;

    return {
      pendingCount: pending.length,
      qualifiedTodayCount: qualifiedToday.length,
      qualifiedCount: qualified.length,
      signupConversionRate: qualified.length ? Math.round((signupConfirmed.length / qualified.length) * 100) : 0,
      averageConnectedCallsPerDay: activeCallDays ? (connectedCalls.length / activeCallDays).toFixed(1) : '0.0',
    };
  }, [leads]);

  const sectionLeads = useMemo(() => {
    switch (activeSection) {
      case 'my-claimed-leads':
        return getMyClaimedLeads(leads, qualificationOwner);
      case 'signup-pending':
        return getSignupPendingLeads(leads);
      case 'handoff-history':
        return getHandoffHistoryLeads(leads);
      case 'dashboard':
      case 'qualification-queue':
      default:
        return getQualificationQueueLeads(leads);
    }
  }, [activeSection, leads, qualificationOwner]);

  const copy = sectionCopy[activeSection];
  const isHistory = activeSection === 'handoff-history';

  return (
    <div className="space-y-5">
      <div className={`${embedded ? 'hidden' : 'flex'} flex-col gap-1`}>
        <span className="text-xs font-semibold uppercase tracking-[0.18em] text-blue-600">
          Qualification Center
        </span>
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900">Qualification Center</h1>
            <p className="mt-1 text-sm text-slate-600">
              Qualification work from intake through signup handoff.
            </p>
          </div>
          {isHistory && (
            <span className="inline-flex items-center gap-1.5 rounded-md border border-slate-200 bg-slate-50 px-2.5 py-1.5 text-xs font-semibold text-slate-600">
              <LockKeyhole className="h-3.5 w-3.5" />
              Read-only history
            </span>
          )}
        </div>
      </div>

      {activeSection === 'dashboard' ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <MetricCard label="Pending Qualification" value={metrics.pendingCount} detail="Leads awaiting review" icon={Clock} tone="amber" />
          <MetricCard label="Qualified Leads" value={metrics.qualifiedCount} detail={`${metrics.qualifiedTodayCount} qualified today`} icon={UserCheck} tone="emerald" />
          <MetricCard label="Qualified to Signup" value={`${metrics.signupConversionRate}%`} detail="Conversion rate" icon={Percent} tone="blue" />
          <MetricCard label="Avg Connected Calls / Day" value={metrics.averageConnectedCallsPerDay} detail={`${connectedCallCount(leads)} connected calls tracked`} icon={PhoneCall} tone="purple" />
        </div>
      ) : (
        <section className="rounded-xl border border-slate-200/90 bg-white p-4 shadow-xs">
          <div className="mb-3 flex flex-wrap items-start justify-between gap-3 border-b border-slate-100 pb-3">
            <div>
              <h2 className="text-base font-bold uppercase tracking-wide text-slate-900">{copy.title}</h2>
              <p className="mt-0.5 text-[11px] text-slate-600">{copy.description}</p>
            </div>
            <span className="rounded-md bg-slate-50 px-2 py-1 text-[11px] font-semibold text-slate-600">
              {sectionLeads.length} {sectionLeads.length === 1 ? 'lead' : 'leads'}
            </span>
          </div>

          {sectionLeads.length === 0 && (
            <div className="mb-3 rounded-lg border border-dashed border-slate-200 bg-slate-50 px-4 py-5 text-center">
              <p className="text-sm font-semibold text-slate-700">{copy.empty}</p>
              <p className="mt-1 text-xs text-slate-500">Select another Qualification Center section to review a different lead collection.</p>
            </div>
          )}

          <LeadTable
            leads={sectionLeads}
            onSelectLead={onSelectLead}
            enableColumnFilter={false}
            showClaimButton={activeSection === 'qualification-queue' || activeSection === 'signup-pending'}
            onClaimLead={onClaimLead}
            showReleaseButton={activeSection === 'my-claimed-leads'}
            onReleaseLead={onReleaseLead}
            showSignupButton={activeSection === 'my-claimed-leads'}
            onMarkSignup={onMarkSignup}
            showClaimOwnership
          />
        </section>
      )}
    </div>
  );
};

const connectedCallCount = (leads: StudentLead[]) =>
  leads.reduce((count, lead) => count + lead.callLogs.filter((call) => call.outcome === 'Connected').length, 0);

const toneClasses = {
  amber: 'bg-amber-50 text-amber-600',
  emerald: 'bg-emerald-50 text-emerald-600',
  blue: 'bg-blue-50 text-blue-600',
  purple: 'bg-purple-50 text-purple-600',
};

const MetricCard: React.FC<{
  label: string;
  value: string | number;
  detail: string;
  icon: React.ComponentType<{ className?: string }>;
  tone: keyof typeof toneClasses;
}> = ({ label, value, detail, icon: Icon, tone }) => (
  <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
    <div className="mb-3 flex items-center justify-between">
      <span className="text-xs font-semibold uppercase text-slate-500">{label}</span>
      <span className={`rounded-lg p-2 ${toneClasses[tone]}`}><Icon className="h-4 w-4" /></span>
    </div>
    <div className="text-3xl font-bold text-slate-900">{value}</div>
    <p className="mt-2 text-xs text-slate-600">{detail}</p>
  </div>
);
