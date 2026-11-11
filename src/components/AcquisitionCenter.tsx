import React, { useState } from 'react';
import {
  LayoutDashboard,
  ListChecks,
  Menu,
  UserRound,
  Clock,
  X,
} from 'lucide-react';
import { StudentLead } from '../types';
import { AcquisitionSection, QualificationDashboard } from './QualificationDashboard';

interface AcquisitionCenterProps {
  leads: StudentLead[];
  onSelectLead: (lead: StudentLead) => void;
  activeSection?: AcquisitionSection;
  onSectionChange?: (section: AcquisitionSection) => void;
  qualificationOwner?: string;
  onClaimLead?: (lead: StudentLead) => void;
  onReleaseLead?: (lead: StudentLead) => void;
  onMarkSignup?: (lead: StudentLead) => void;
}

const navigationItems: Array<{
  id: AcquisitionSection;
  label: string;
  icon: React.ElementType;
}> = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'qualification-queue', label: 'Qualification Queue', icon: ListChecks },
  { id: 'signup-pending', label: 'Pending Signup Queue', icon: Clock },
  { id: 'my-claimed-leads', label: 'My Claimed Leads', icon: UserRound },
];

const pageDescriptions: Record<AcquisitionSection, string> = {
  dashboard: 'Track qualification workload and signup handoff priorities.',
  'qualification-queue': 'Review shared leads waiting for a qualification decision.',
  'my-claimed-leads': 'Follow up on qualified leads retained by your team.',
  'signup-pending': 'Monitor qualified leads awaiting confirmed signup.',
  'handoff-history': 'Review read-only leads transferred to Monetization Center.',
};

export const AcquisitionCenter: React.FC<AcquisitionCenterProps> = ({
  leads,
  onSelectLead,
  activeSection: controlledSection,
  onSectionChange,
  qualificationOwner = 'Qualification Agent',
  onClaimLead,
  onReleaseLead,
  onMarkSignup,
}) => {
  const [internalSection, setInternalSection] = useState<AcquisitionSection>('dashboard');
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const activeSection = controlledSection ?? internalSection;

  const selectSection = (section: AcquisitionSection) => {
    setInternalSection(section);
    onSectionChange?.(section);
    setMobileNavOpen(false);
  };

  return (
    <div className="min-h-[calc(100vh-105px)] -mx-3 -my-4 flex bg-[#f8fafc]">
      <button
        type="button"
        aria-label="Open Qualification Center navigation"
        onClick={() => setMobileNavOpen(true)}
        className="fixed bottom-5 left-5 z-30 rounded-full bg-slate-900 p-3 text-white shadow-lg lg:hidden"
      >
        <Menu className="h-5 w-5" />
      </button>

      {mobileNavOpen && (
        <button
          type="button"
          aria-label="Close navigation overlay"
          onClick={() => setMobileNavOpen(false)}
          className="fixed inset-0 z-30 bg-slate-950/30 lg:hidden"
        />
      )}

      <aside
        className={`fixed inset-y-0 left-0 z-40 w-64 border-r border-slate-200 bg-white px-4 py-5 transition-transform lg:static lg:translate-x-0 ${mobileNavOpen ? 'translate-x-0' : '-translate-x-full'}`}
      >
        <div className="mb-8 flex items-center justify-between px-2">
          <div>
            <p className="text-lg font-bold tracking-tight text-slate-900">Qualification Center</p>
            <p className="text-[11px] font-medium uppercase tracking-[0.18em] text-slate-400">Qualification workspace</p>
          </div>
          <button
            type="button"
            aria-label="Close navigation"
            onClick={() => setMobileNavOpen(false)}
            className="text-slate-400 lg:hidden"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <nav aria-label="Qualification Center navigation" className="space-y-1">
          {navigationItems.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              type="button"
              aria-current={activeSection === id ? 'page' : undefined}
              onClick={() => selectSection(id)}
              className={`flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm font-medium transition-colors ${activeSection === id ? 'bg-slate-900 text-white shadow-sm' : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'}`}
            >
              <Icon className="h-4 w-4 shrink-0" />
              {label}
            </button>
          ))}
        </nav>

        <div className="absolute bottom-5 left-4 right-4 rounded-xl bg-slate-50 p-3">
          <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-slate-400">Current workspace</p>
          <p className="mt-1 truncate text-xs font-semibold text-slate-800">Relationship Manager</p>
          <p className="text-[11px] text-slate-500">{qualificationOwner}</p>
        </div>
      </aside>

      <section className="min-w-0 flex-1 p-4 sm:p-6 lg:p-8">
        <div className="mx-auto max-w-[1500px]">
          <div className="mb-6">
            <div className="mb-2 text-xs font-medium text-slate-400">
              <span>Qualification Center</span>
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900">{navigationItems.find((item) => item.id === activeSection)?.label}</h1>
            <p className="mt-1 text-sm text-slate-500">{pageDescriptions[activeSection]}</p>
          </div>

          <QualificationDashboard
            leads={leads}
            onSelectLead={onSelectLead}
            activeSection={activeSection}
            qualificationOwner={qualificationOwner}
            onClaimLead={onClaimLead}
            onReleaseLead={onReleaseLead}
            onMarkSignup={onMarkSignup}
            embedded
          />
        </div>
      </section>
    </div>
  );
};
