import React, { useMemo } from 'react';
import { ArrowLeft, TrendingUp, Users, CheckCircle2, DollarSign, BarChart3 } from 'lucide-react';
import { StudentLead } from '../types';

interface ProductPerformancePageProps {
  product: string;
  leads: StudentLead[];
  onBack: () => void;
  onSelectLead?: (lead: StudentLead) => void;
}

export const ProductPerformancePage: React.FC<ProductPerformancePageProps> = ({
  product,
  leads,
  onBack,
  onSelectLead,
}) => {
  const metrics = useMemo(() => {
    const opportunities = leads
      .flatMap(lead => 
        (lead.productOpportunities || [])
          .filter(opp => opp.product === product)
          .map(opp => ({ ...opp, leadId: lead.id, leadName: lead.studentName }))
      );

    const sold = opportunities.filter(opp => opp.status === 'Completed / Sold');
    const inProgress = opportunities.filter(opp => opp.status === 'In Progress');
    const interested = opportunities.filter(opp => opp.status === 'Interested');
    const notInterested = opportunities.filter(opp => opp.status === 'Not Interested');
    const failed = opportunities.filter(opp => opp.status === 'Failed / Rejected');

    const conversionRate = opportunities.length > 0 ? ((sold.length / opportunities.length) * 100).toFixed(1) : '0';
    
    // Calculate business value
    let totalValue = 0;
    sold.forEach(opp => {
      if (product === 'Education Loan') {
        totalValue += parseFloat(opp.amount || '50000') || 50000;
      } else if (product === 'Credit Card') {
        totalValue += 5000;
      } else if (product === 'Forex') {
        totalValue += 10000;
      }
    });

    return {
      totalOpportunities: opportunities.length,
      sold: sold.length,
      inProgress: inProgress.length,
      interested: interested.length,
      notInterested: notInterested.length,
      failed: failed.length,
      conversionRate,
      totalValue,
      opportunities,
      soldDetails: sold,
      inProgressDetails: inProgress,
    };
  }, [leads, product]);

  const productIcons: Record<string, { color: string; icon: string }> = {
    'Education Loan': { color: 'text-blue-600', icon: '🎓' },
    'Bank Account': { color: 'text-emerald-600', icon: '🏦' },
    'Credit Card': { color: 'text-purple-600', icon: '💳' },
    'Forex': { color: 'text-orange-600', icon: '💱' },
  };

  const config = productIcons[product] || { color: 'text-slate-600', icon: '📊' };

  return (
    <div className="min-h-screen bg-slate-50 p-6">
      {/* HEADER */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <button
              onClick={onBack}
              className="inline-flex items-center gap-2 px-3 py-2 text-sm font-semibold text-slate-700 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4" />
              Back
            </button>
            <div className={`text-4xl ${config.color}`}>{config.icon}</div>
            <div>
              <h1 className="text-3xl font-bold text-slate-900">{product} Performance</h1>
              <p className="text-slate-600 mt-1">Detailed metrics and opportunity tracking</p>
            </div>
          </div>
        </div>
      </div>

      {/* KEY METRICS GRID */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {/* Total Opportunities */}
        <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-xs">
          <div className="mb-3">
            <span className="text-xs font-semibold text-slate-600 uppercase">Total Opportunities</span>
          </div>
          <div className="text-3xl font-bold text-slate-900">{metrics.totalOpportunities}</div>
          <p className="text-xs text-slate-600 mt-2">Active opportunities</p>
        </div>

        {/* Sold */}
        <div className="bg-white border border-emerald-200 rounded-xl p-6 shadow-xs bg-emerald-50/30">
          <div className="mb-3">
            <span className="text-xs font-semibold text-emerald-700 uppercase">Completed & Sold</span>
          </div>
          <div className="text-3xl font-bold text-emerald-600">{metrics.sold}</div>
          <p className="text-xs text-emerald-700 mt-2">Successfully closed</p>
        </div>

        {/* Conversion Rate */}
        <div className="bg-white border border-blue-200 rounded-xl p-6 shadow-xs bg-blue-50/30">
          <div className="mb-3">
            <span className="text-xs font-semibold text-blue-700 uppercase">Conversion Rate</span>
          </div>
          <div className="text-3xl font-bold text-blue-600">{metrics.conversionRate}%</div>
          <p className="text-xs text-blue-700 mt-2">Of opportunities sold</p>
        </div>

        {/* Business Value */}
        <div className="bg-white border border-purple-200 rounded-xl p-6 shadow-xs bg-purple-50/30">
          <div className="mb-3">
            <span className="text-xs font-semibold text-purple-700 uppercase">Business Value</span>
          </div>
          <div className="text-3xl font-bold text-purple-600">${(metrics.totalValue / 1000).toFixed(0)}K</div>
          <p className="text-xs text-purple-700 mt-2">From closed deals</p>
        </div>
      </div>

      {/* STATUS BREAKDOWN */}
      <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-xs mb-8">
        <h3 className="text-lg font-bold text-slate-900 mb-6">Opportunity Status Breakdown</h3>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          {[
            { label: 'Interested', count: metrics.interested, color: 'bg-purple-100 text-purple-700' },
            { label: 'In Progress', count: metrics.inProgress, color: 'bg-blue-100 text-blue-700' },
            { label: 'Sold', count: metrics.sold, color: 'bg-emerald-100 text-emerald-700' },
            { label: 'Not Interested', count: metrics.notInterested, color: 'bg-slate-100 text-slate-700' },
            { label: 'Failed', count: metrics.failed, color: 'bg-rose-100 text-rose-700' },
          ].map(status => (
            <div key={status.label} className={`p-4 rounded-lg ${status.color} text-center`}>
              <div className="text-2xl font-bold">{status.count}</div>
              <div className="text-xs font-semibold mt-1">{status.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* OPPORTUNITIES TABLE */}
      {metrics.opportunities.length > 0 && (
        <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-xs">
          <h3 className="text-lg font-bold text-slate-900 mb-4">All Opportunities ({metrics.totalOpportunities})</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-200">
                  <th className="text-left py-3 px-4 font-semibold text-slate-900">Student Name</th>
                  <th className="text-left py-3 px-4 font-semibold text-slate-900">Status</th>
                  <th className="text-left py-3 px-4 font-semibold text-slate-900">Amount</th>
                  <th className="text-left py-3 px-4 font-semibold text-slate-900">Partner</th>
                  <th className="text-left py-3 px-4 font-semibold text-slate-900">Owner</th>
                </tr>
              </thead>
              <tbody>
                {metrics.opportunities.map((opp, idx) => {
                  const statusColors: Record<string, string> = {
                    'Interested': 'bg-purple-100 text-purple-700',
                    'In Progress': 'bg-blue-100 text-blue-700',
                    'Completed / Sold': 'bg-emerald-100 text-emerald-700',
                    'Not Interested': 'bg-slate-100 text-slate-700',
                    'Failed / Rejected': 'bg-rose-100 text-rose-700',
                  };
                  return (
                    <tr 
                      key={idx} 
                      className="border-b border-slate-100 hover:bg-slate-50 cursor-pointer transition-colors"
                      onClick={() => {
                        const lead = leads.find(l => l.id === opp.leadId);
                        if (lead && onSelectLead) onSelectLead(lead);
                      }}
                    >
                      <td className="py-3 px-4 font-semibold text-blue-600 hover:underline">{opp.leadName}</td>
                      <td className="py-3 px-4">
                        <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${statusColors[opp.status] || 'bg-slate-100'}`}>
                          {opp.status}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-slate-600">${(parseFloat(opp.amount || '0') || 0).toLocaleString()}</td>
                      <td className="py-3 px-4 text-slate-600">{opp.partner || '-'}</td>
                      <td className="py-3 px-4 text-slate-600">{opp.productOwner || '-'}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
