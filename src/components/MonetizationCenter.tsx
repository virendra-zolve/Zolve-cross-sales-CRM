import React, { useMemo, useState } from 'react';
import {
  BriefcaseBusiness,
  ChevronRight,
  CreditCard,
  Inbox,
  Landmark,
  LayoutDashboard,
  Menu,
  PackageOpen,
  X,
} from 'lucide-react';
import { MasterProduct, StudentLead } from '../types';
import { LeadTable, LeadOpportunityRow } from './LeadTable';
import { RmDashboard } from './RmDashboard';
import {
  CURRENT_RM,
  MONETIZATION_PRODUCTS,
  OpportunityRow,
  getAvailableOpportunityRows,
  getOwnedOpportunityRows,
} from '../utils/monetizationHelpers';
import { isMonetizationEligible } from '../utils/acquireHelpers';

export type MonetizationSection = 'dashboard' | 'lead-pool' | 'my-leads' | MasterProduct;

interface MonetizationCenterProps {
  leads: StudentLead[];
  activeSection?: MonetizationSection;
  onSectionChange?: (section: MonetizationSection) => void;
  onSelectLead: (lead: StudentLead) => void;
  onClaimOpportunity: (leadId: string, opportunityId: string) => { success: boolean; error?: string };
  onOpenNewLead: () => void;
  onOpenBulkUpload: () => void;
  onViewAllLeads: (filter?: string) => void;
}

const primaryItems: Array<{ id: MonetizationSection; label: string; icon: React.ElementType }> = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'lead-pool', label: 'Lead Pool', icon: Inbox },
  { id: 'my-leads', label: 'My Leads', icon: BriefcaseBusiness },
];

const productIcons: Record<string, React.ElementType> = {
  'Education Loan': Landmark,
  'Credit Card': CreditCard,
};

const pageTitles: Record<string, string> = {
  dashboard: 'Dashboard',
  'lead-pool': 'Lead Pool',
  'my-leads': 'My Leads',
  'Education Loan': 'Education Loan',
  'Credit Card': 'Credit Card',
};

const toOpportunityRows = (rows: OpportunityRow[]): LeadOpportunityRow[] =>
  rows.map(({ lead, opportunity, ownerLabel, isAvailable }) => ({
    lead,
    opportunity,
    ownerLabel,
    isAvailable,
  }));

export const MonetizationCenter: React.FC<MonetizationCenterProps> = ({
  leads,
  activeSection: controlledSection,
  onSectionChange,
  onSelectLead,
  onClaimOpportunity,
  onOpenNewLead,
  onOpenBulkUpload,
  onViewAllLeads,
}) => {
  const [internalSection, setInternalSection] = useState<MonetizationSection>('dashboard');
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const activeSection = controlledSection ?? internalSection;

  const availableRows = useMemo(() => getAvailableOpportunityRows(leads), [leads]);
  const productRows = useMemo(
    () => getOwnedOpportunityRows(leads, CURRENT_RM, activeSection as MasterProduct),
    [activeSection, leads]
  );
  const myRows = useMemo(() => getOwnedOpportunityRows(leads, CURRENT_RM), [leads]);

  const selectSection = (section: MonetizationSection) => {
    setInternalSection(section);
    onSectionChange?.(section);
    setError(null);
    setMobileNavOpen(false);
  };

  return (
    <div className="min-h-[calc(100vh-105px)] -mx-3 -my-4 flex bg-[#f8fafc]">
      <button
        type="button"
        aria-label="Open Monetization Center navigation"
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

      <aside className={`fixed inset-y-0 left-0 z-40 w-64 border-r border-slate-200 bg-white px-4 py-5 transition-transform lg:static lg:translate-x-0 ${mobileNavOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="mb-8 flex items-center justify-between px-2">
          <div>
            <p className="text-lg font-bold tracking-tight text-slate-900">Monetization</p>
            <p className="text-[11px] font-medium uppercase tracking-[0.18em] text-slate-400">RM workspace</p>
          </div>
          <button type="button" aria-label="Close navigation" onClick={() => setMobileNavOpen(false)} className="text-slate-400 lg:hidden">
            <X className="h-5 w-5" />
          </button>
        </div>

        <nav aria-label="Monetization Center navigation" className="space-y-6">
          <div>
            <p className="mb-2 px-3 text-[10px] font-bold uppercase tracking-[0.16em] text-slate-400">Workspace</p>
            <div className="space-y-1">
              {primaryItems.map(({ id, label, icon: Icon }) => (
                <NavButton key={id} active={activeSection === id} icon={Icon} label={label} onClick={() => selectSection(id)} />
              ))}
            </div>
          </div>
          <div>
            <p className="mb-2 px-3 text-[10px] font-bold uppercase tracking-[0.16em] text-slate-400">Products</p>
            <div className="space-y-1">
              {MONETIZATION_PRODUCTS.map((product) => {
                const Icon = productIcons[product] || PackageOpen;
                return <NavButton key={product} active={activeSection === product} icon={Icon} label={product} onClick={() => selectSection(product)} />;
              })}
            </div>
          </div>
        </nav>

        <div className="absolute bottom-5 left-4 right-4 rounded-xl bg-slate-50 p-3">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-900 text-xs font-bold text-white">V</div>
            <div className="min-w-0">
              <p className="truncate text-xs font-semibold text-slate-800">{CURRENT_RM}</p>
              <p className="text-[11px] text-slate-500">Relationship Manager</p>
            </div>
          </div>
        </div>
      </aside>

      <section className="min-w-0 flex-1 p-4 sm:p-6 lg:p-8">
        <div className="mx-auto max-w-[1500px]">
          <div className="mb-6 flex items-start justify-between gap-4">
            <div>
              <div className="mb-2 flex items-center gap-2 text-xs font-medium text-slate-400">
                <span>Monetization Center</span><ChevronRight className="h-3.5 w-3.5" /><span className="text-slate-600">{pageTitles[activeSection]}</span>
              </div>
              <h1 className="text-2xl font-bold tracking-tight text-slate-900">{pageTitles[activeSection]}</h1>
              <p className="mt-1 text-sm text-slate-500">{sectionDescription(activeSection)}</p>
            </div>
            {activeSection === 'lead-pool' && <div className="rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-xs font-semibold text-emerald-700">{availableRows.length} opportunities available</div>}
          </div>

          {error && (
            <div role="alert" className="mb-5 flex items-center justify-between rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              <span>{error}</span><button type="button" onClick={() => setError(null)} className="font-semibold">Dismiss</button>
            </div>
          )}

          {activeSection === 'dashboard' && (
            <RmDashboard
              leads={leads.filter(isMonetizationEligible)}
              onSelectLead={onSelectLead}
              onOpenNewLead={onOpenNewLead}
              onOpenBulkUpload={onOpenBulkUpload}
              onViewAllLeads={onViewAllLeads}
              showLeadTable={false}
            />
          )}
          {activeSection === 'lead-pool' && (
            <LeadTable
              opportunityRows={toOpportunityRows(availableRows)}
              opportunityMode
              onSelectLead={onSelectLead}
              onClaimOpportunity={(lead, opportunityId) => {
                const result = onClaimOpportunity(lead.id, opportunityId);
                setError(result.success ? null : result.error || 'This opportunity could not be claimed.');
              }}
            />
          )}
          {activeSection === 'my-leads' && (
            <LeadTable opportunityRows={toOpportunityRows(myRows)} opportunityMode onSelectLead={onSelectLead} />
          )}
          {MONETIZATION_PRODUCTS.includes(activeSection as MasterProduct) && (
            <LeadTable opportunityRows={toOpportunityRows(productRows)} opportunityMode onSelectLead={onSelectLead} />
          )}
        </div>
      </section>
    </div>
  );
};

const NavButton: React.FC<{ active: boolean; icon: React.ElementType; label: string; onClick: () => void }> = ({ active, icon: Icon, label, onClick }) => (
  <button type="button" onClick={onClick} className={`flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm font-medium transition-colors ${active ? 'bg-slate-900 text-white shadow-sm' : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'}`}>
    <Icon className="h-4 w-4 shrink-0" />{label}
  </button>
);

const sectionDescription = (section: MonetizationSection) => {
  if (section === 'lead-pool') return 'Discover product opportunities available for you to claim.';
  if (section === 'my-leads') return 'Manage the leads where you own at least one product opportunity.';
  if (MONETIZATION_PRODUCTS.includes(section as MasterProduct)) return `Your ${section} opportunities and active product work.`;
  return 'Track your RM performance, pipeline, and follow-up priorities.';
};
