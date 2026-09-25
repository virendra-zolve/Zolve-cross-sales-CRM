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
import { AllLeadsView } from './AllLeadsView';
import { ProductPerformancePage } from './ProductPerformancePage';
import { generateMockAllLeads } from '../data/mockAllLeads';

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
  const [tableView, setTableView] = useState<'my-active' | 'needs-action' | 'claim-leads' | 'target'>('my-active');
  const [actionFilter, setActionFilter] = useState<'all' | 'breached' | 'callbacks' | 'pending'>('all');
  const [selectedProduct, setSelectedProduct] = useState<string | null>(null);
  const mockAllLeads = useMemo(() => generateMockAllLeads(), []);

  // Handle inline lead updates (status, journey stage, calling status)
  const handleUpdateLead = (updatedLead: StudentLead) => {
    console.log('Lead updated:', updatedLead);
    // Parent component should handle the actual state update
    // For now, this triggers the parent to refresh/update the lead
  };

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

  // Calculate product performance
  const productMetrics = useMemo(() => {
    const products: Record<string, { count: number; sold: number; value: number }> = {
      'Education Loan': { count: 0, sold: 0, value: 0 },
      'Bank Account': { count: 0, sold: 0, value: 0 },
      'Credit Card': { count: 0, sold: 0, value: 0 },
      'Forex': { count: 0, sold: 0, value: 0 },
    };

    leads.forEach(lead => {
      Object.entries(lead.masterProducts || {}).forEach(([product, active]) => {
        if (active && products[product as keyof typeof products]) {
          products[product as keyof typeof products].count++;
          
          const opp = lead.productOpportunities?.find(p => p.product === product);
          if (opp?.status === 'Completed / Sold') {
            products[product as keyof typeof products].sold++;
            // Mock value for display
            if (product === 'Education Loan') {
              products[product as keyof typeof products].value += 50000;
            } else if (product === 'Bank Account') {
              products[product as keyof typeof products].value += 0;
            } else if (product === 'Credit Card') {
              products[product as keyof typeof products].value += 5000;
            } else if (product === 'Forex') {
              products[product as keyof typeof products].value += 10000;
            }
          }
        }
      });
    });

    return products;
  }, [leads]);

  return (
    <>
      {selectedProduct ? (
        <ProductPerformancePage
          product={selectedProduct}
          leads={leads}
          onBack={() => setSelectedProduct(null)}
        />
      ) : (
        <div className="space-y-6">
      {/* PRODUCT BUSINESS CARDS */}
      <div>
        <h3 className="text-sm font-bold text-slate-900 mb-3 uppercase tracking-wide">Product Performance</h3>
        <div className="grid grid-cols-4 gap-3">
          {Object.entries(productMetrics).map(([product, metrics]) => (
            <div
              key={product}
              onClick={() => setSelectedProduct(product)}
              className="bg-white border border-slate-200 rounded-lg p-4 shadow-xs hover:shadow-md hover:border-slate-300 transition-all cursor-pointer"
            >
              <div className="text-xs font-semibold text-slate-600 uppercase tracking-wider mb-2">{product}</div>
              <div className="space-y-1.5">
                <div className="flex justify-between items-center">
                  <span className="text-xs text-slate-600">Opportunities</span>
                  <span className="text-lg font-bold text-slate-900">{metrics.count}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-xs text-slate-600">Sold</span>
                  <span className="text-lg font-bold text-emerald-600">{metrics.sold}</span>
                </div>
                {metrics.value > 0 && (
                  <div className="flex justify-between items-center pt-1 border-t border-slate-100">
                    <span className="text-xs text-slate-600">Business Value</span>
                    <span className="text-sm font-bold text-slate-900">${(metrics.value / 1000).toFixed(0)}K</span>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* KPI CARDS */}
      <div className="grid grid-cols-4 gap-4">
        {/* Card 1: My Active Leads */}
        <div 
          onClick={() => setTableView('my-active')}
          className={`border rounded-lg p-4 shadow-sm transition-all cursor-pointer group ${
            tableView === 'my-active'
              ? 'bg-blue-50 border-blue-300'
              : 'bg-white border-slate-200 hover:border-slate-300'
          }`}
        >
          <div className="inline-block px-2 py-1 bg-blue-100 text-blue-700 text-xs font-bold rounded-full mb-3">MY ACTIVE</div>
          <div className={`text-3xl font-bold transition-colors ${tableView === 'my-active' ? 'text-blue-600' : 'text-slate-900 group-hover:text-blue-600'}`}>
            {totalActiveLeadsCount}
          </div>
          <div className="text-xs text-slate-600 mt-2">Assigned to me</div>
        </div>

        {/* Card 2: Needs Action */}
        <div 
          onClick={() => setTableView('needs-action')}
          className={`border rounded-lg p-4 shadow-sm transition-all cursor-pointer group ${
            tableView === 'needs-action'
              ? 'bg-red-50 border-red-300'
              : 'bg-white border-slate-200 hover:border-slate-300'
          }`}
        >
          <div className="inline-block px-2 py-1 bg-red-100 text-red-700 text-xs font-bold rounded-full mb-3">NEEDS ACTION</div>
          <div className={`text-3xl font-bold transition-colors ${tableView === 'needs-action' ? 'text-red-600' : 'text-slate-900 group-hover:text-red-600'}`}>
            {pendingActionsCount}
          </div>
          <div className="text-xs text-slate-600 mt-2">Requires action</div>
        </div>

        {/* Card 3: Claim Leads */}
        <div 
          onClick={() => setTableView('claim-leads')}
          className={`border rounded-lg p-4 shadow-sm transition-all cursor-pointer group ${
            tableView === 'claim-leads'
              ? 'bg-emerald-50 border-emerald-300'
              : 'bg-white border-slate-200 hover:border-slate-300'
          }`}
        >
          <div className="inline-block px-2 py-1 bg-emerald-100 text-emerald-700 text-xs font-bold rounded-full mb-3">CLAIM</div>
          <div className={`text-3xl font-bold transition-colors ${tableView === 'claim-leads' ? 'text-emerald-600' : 'text-slate-900 group-hover:text-emerald-600'}`}>
            {mockAllLeads.filter(l => !l.leadOwner || l.leadOwner === 'Unassigned').length}
          </div>
          <div className="text-xs text-slate-600 mt-2">Available to claim</div>
        </div>

        {/* Card 4: Target Achievement */}
        <div 
          onClick={() => setTableView('target')}
          className={`border rounded-lg p-4 shadow-sm transition-all cursor-pointer group ${
            tableView === 'target'
              ? 'bg-purple-50 border-purple-300'
              : 'bg-white border-slate-200 hover:border-slate-300'
          }`}
        >
          <div className="inline-block px-2 py-1 bg-purple-100 text-purple-700 text-xs font-bold rounded-full mb-3">TARGET</div>
          <div className={`text-3xl font-bold transition-colors ${tableView === 'target' ? 'text-purple-600' : 'text-slate-900 group-hover:text-purple-600'}`}>
            85%
          </div>
          <div className="text-xs text-slate-600 mt-2">Achievement</div>
        </div>
      </div>


      {/* Leads Table - shows different content based on selected view */}
      {tableView === 'claim-leads' ? (
        <AllLeadsView
          leads={mockAllLeads}
          onSelectLead={onSelectLead}
          onInitiateCall={onInitiateCall}
          onQuickLogOutcome={onQuickLogOutcome}
        />
      ) : (
        <LeadTable
          leads={
            tableView === 'needs-action'
              ? actionableLeads.slice(0, 7).map(({ lead }) => lead)
              : leads.slice(0, 7)
          }
          onSelectLead={onSelectLead}
          onInitiateCall={onInitiateCall}
          onQuickLogOutcome={onQuickLogOutcome}
          onUpdateLead={handleUpdateLead}
          enableColumnFilter={false}
        />
      )}




        </div>
      )}
    </>
  );
};
