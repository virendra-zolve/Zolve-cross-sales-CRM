import React, { useState, useMemo } from 'react';
import { 
  UserPlus, 
  TrendingUp,
  CheckCircle2,
  Clock,
  Building2,
} from 'lucide-react';
import { StudentLead, Partner } from '../types';
import { LeadTable } from './LeadTable';

interface BdeDashboardProps {
  leads: StudentLead[];
  partners: Partner[];
  onSelectLead: (lead: StudentLead) => void;
  onCreateNewPartner?: () => void;
  onViewPartnerDetails?: (partnerId: string) => void;
  onApprovePartner?: (partnerId: string) => void;
}

export const BdeDashboard: React.FC<BdeDashboardProps> = ({
  leads,
  partners = [],
  onSelectLead,
  onCreateNewPartner,
  onViewPartnerDetails,
  onApprovePartner,
}) => {
  const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'pending'>('all');

  // BDE metrics
  const metrics = useMemo(() => {
    const activePartners = partners.filter(p => p.status === 'Active').length;
    const pendingApproval = partners.filter(p => p.status === 'Pending Manager' || p.status === 'Pending Head').length;
    const totalLeadsGenerated = partners.reduce((sum, p) => sum + p.totalLeadsGenerated, 0);
    const totalConverted = partners.reduce((sum, p) => sum + p.leadsConverted, 0);
    
    return {
      activePartners,
      pendingApproval,
      totalLeadsGenerated,
      totalConverted,
      conversionRate: totalLeadsGenerated > 0 ? Math.round((totalConverted / totalLeadsGenerated) * 100) : 0,
    };
  }, [partners]);

  // Filter partners
  const filteredPartners = useMemo(() => {
    if (filterStatus === 'active') return partners.filter(p => p.status === 'Active');
    if (filterStatus === 'pending') return partners.filter(p => p.status === 'Pending Manager' || p.status === 'Pending Head');
    return partners;
  }, [partners, filterStatus]);

  // Get leads from BDE's partners
  const partnerLeads = useMemo(() => {
    return leads.filter(l => l.partnerCode && partners.some(p => p.partnerCode === l.partnerCode));
  }, [leads, partners]);

  return (
    <div className="space-y-6">
      {/* KPI CARDS */}
      <div className="grid grid-cols-5 gap-3">
        {/* Card 1: Active Partners */}
        <div className="bg-white border border-slate-200 rounded-lg p-4 shadow-sm hover:border-slate-300 transition-all cursor-pointer group">
          <div className="inline-block px-2 py-1 bg-emerald-100 text-emerald-700 text-xs font-bold rounded-full mb-3">ACTIVE</div>
          <div className="text-3xl font-bold text-slate-900 group-hover:text-emerald-600 transition-colors">
            {metrics.activePartners}
          </div>
          <div className="text-xs text-slate-600 mt-2">Active partners</div>
        </div>

        {/* Card 2: Pending Approval */}
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 shadow-sm hover:border-yellow-300 transition-all cursor-pointer group">
          <div className="inline-block px-2 py-1 bg-yellow-100 text-yellow-700 text-xs font-bold rounded-full mb-3">PENDING</div>
          <div className="text-3xl font-bold text-slate-900 group-hover:text-yellow-600 transition-colors">
            {metrics.pendingApproval}
          </div>
          <div className="text-xs text-slate-600 mt-2">Awaiting approval</div>
        </div>

        {/* Card 3: Total Leads Generated */}
        <div className="bg-white border border-slate-200 rounded-lg p-4 shadow-sm hover:border-slate-300 transition-all cursor-pointer group">
          <div className="inline-block px-2 py-1 bg-blue-100 text-blue-700 text-xs font-bold rounded-full mb-3">GENERATED</div>
          <div className="text-3xl font-bold text-slate-900 group-hover:text-blue-600 transition-colors">
            {metrics.totalLeadsGenerated}
          </div>
          <div className="text-xs text-slate-600 mt-2">Leads generated</div>
        </div>

        {/* Card 4: Leads Converted */}
        <div className="bg-white border border-slate-200 rounded-lg p-4 shadow-sm hover:border-slate-300 transition-all cursor-pointer group">
          <div className="inline-block px-2 py-1 bg-purple-100 text-purple-700 text-xs font-bold rounded-full mb-3">CONVERTED</div>
          <div className="text-3xl font-bold text-slate-900 group-hover:text-purple-600 transition-colors">
            {metrics.totalConverted}
          </div>
          <div className="text-xs text-slate-600 mt-2">Qualified leads</div>
        </div>

        {/* Card 5: Conversion Rate */}
        <div className="bg-white border border-slate-200 rounded-lg p-4 shadow-sm hover:border-slate-300 transition-all cursor-pointer group">
          <div className="inline-block px-2 py-1 bg-orange-100 text-orange-700 text-xs font-bold rounded-full mb-3">CONVERSION</div>
          <div className="text-3xl font-bold text-slate-900 group-hover:text-orange-600 transition-colors">
            {metrics.conversionRate}%
          </div>
          <div className="text-xs text-slate-600 mt-2">Conversion rate</div>
        </div>
      </div>

      {/* Partner Status Filter */}
      <div className="flex gap-2">
        <button
          onClick={() => setFilterStatus('all')}
          className={`px-3 py-2 text-xs font-medium rounded-lg transition-all ${
            filterStatus === 'all'
              ? 'bg-slate-900 text-white'
              : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
          }`}
        >
          All Partners
        </button>
        <button
          onClick={() => setFilterStatus('active')}
          className={`px-3 py-2 text-xs font-medium rounded-lg transition-all ${
            filterStatus === 'active'
              ? 'bg-emerald-600 text-white'
              : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
          }`}
        >
          Active ({metrics.activePartners})
        </button>
        <button
          onClick={() => setFilterStatus('pending')}
          className={`px-3 py-2 text-xs font-medium rounded-lg transition-all ${
            filterStatus === 'pending'
              ? 'bg-yellow-600 text-white'
              : 'bg-yellow-50 text-yellow-700 hover:bg-yellow-100'
          }`}
        >
          Pending Approval ({metrics.pendingApproval})
        </button>
      </div>

      {/* Partners Table */}
      <section className="bg-white border border-slate-200/90 rounded-xl p-4 shadow-xs">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-3">
          <div>
            <h3 className="text-base font-bold text-slate-900 tracking-wide uppercase">
              Partner Network
            </h3>
            <p className="text-[11px] text-slate-600 mt-0.5">
              {filteredPartners.length} partners with performance metrics
            </p>
          </div>
          <button
            onClick={onCreateNewPartner}
            className="inline-flex items-center gap-1.5 text-xs font-medium text-white bg-slate-900 hover:bg-slate-800 px-3 py-1.5 rounded-lg transition-all"
          >
            <UserPlus size={14} />
            Onboard New Partner
          </button>
        </div>

        <LeadTable
          leads={[]}
          mode="partner"
          partners={filteredPartners}
          onSelectPartner={(partner) => onViewPartnerDetails?.(partner.id)}
          onSelectLead={() => {}}
          onInitiateCall={() => {}}
          onQuickLogOutcome={() => {}}
          enableColumnFilter={false}
        />
      </section>

      {/* Partner's Leads */}
      <section className="bg-white border border-slate-200/90 rounded-xl p-4 shadow-xs">
        <div className="border-b border-slate-100 pb-3 mb-3">
          <h3 className="text-base font-bold text-slate-900 tracking-wide uppercase">
            Leads from My Partners
          </h3>
          <p className="text-[11px] text-slate-600 mt-0.5">
            {partnerLeads.length} leads with assigned RMs
          </p>
        </div>

        <LeadTable
          leads={partnerLeads.slice(0, 8)}
          onSelectLead={onSelectLead}
          enableColumnFilter={false}
          onInitiateCall={() => {}}
          onQuickLogOutcome={() => {}}
        />
      </section>
    </div>
  );
};
