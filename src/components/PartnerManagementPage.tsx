import React, { useState, useMemo } from 'react';
import {
  Building2,
  TrendingUp,
  BarChart3,
  DollarSign,
  ChevronRight,
  Edit2,
  CheckCircle2,
  XCircle,
  Plus,
  Download,
  ChevronDown,
} from 'lucide-react';
import { Partner } from '../types';

interface PartnerManagementPageProps {
  partners: Partner[];
  onSelectPartner?: (partner: Partner) => void;
  onEditPartner?: (partner: Partner) => void;
  onApprovePartner?: (partnerId: string) => void;
  onRejectPartner?: (partnerId: string, reason: string) => void;
  onOpenPartnerOnboarding?: () => void;
}

export const PartnerManagementPage: React.FC<PartnerManagementPageProps> = ({
  partners = [],
  onSelectPartner,
  onEditPartner,
  onApprovePartner,
  onRejectPartner,
  onOpenPartnerOnboarding,
}) => {
  const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'pending'>('all');
  const [sortBy, setSortBy] = useState<'name' | 'leads' | 'conversion'>('name');
  const [searchTerm, setSearchTerm] = useState('');
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);

  // Partner metrics
  const metrics = useMemo(() => {
    const activePartners = partners.filter(p => p.status === 'Active').length;
    const pendingPartners = partners.filter(
      p => p.status === 'Pending Manager' || p.status === 'Pending Head'
    ).length;
    const totalLeads = partners.reduce((sum, p) => sum + p.totalLeadsGenerated, 0);
    const totalConverted = partners.reduce((sum, p) => sum + p.leadsConverted, 0);
    const conversionRate = totalLeads > 0 ? Math.round((totalConverted / totalLeads) * 100) : 0;

    return {
      activePartners,
      pendingPartners,
      totalLeads,
      totalConverted,
      conversionRate,
      partnerCount: partners.length,
    };
  }, [partners]);

  // Filter and sort
  const filteredPartners = useMemo(() => {
    let filtered = partners;

    // Status filter
    if (filterStatus === 'active') {
      filtered = filtered.filter(p => p.status === 'Active');
    } else if (filterStatus === 'pending') {
      filtered = filtered.filter(
        p => p.status === 'Pending Manager' || p.status === 'Pending Head'
      );
    }

    // Search filter
    if (searchTerm.trim()) {
      const q = searchTerm.toLowerCase();
      filtered = filtered.filter(
        p =>
          p.businessName.toLowerCase().includes(q) ||
          p.partnerCode.toLowerCase().includes(q) ||
          p.ownerName.toLowerCase().includes(q)
      );
    }

    // Sorting
    return filtered.sort((a, b) => {
      if (sortBy === 'name') {
        return a.businessName.localeCompare(b.businessName);
      } else if (sortBy === 'leads') {
        return b.totalLeadsGenerated - a.totalLeadsGenerated;
      } else {
        const rateA = a.totalLeadsGenerated > 0 ? (a.leadsConverted / a.totalLeadsGenerated) * 100 : 0;
        const rateB = b.totalLeadsGenerated > 0 ? (b.leadsConverted / b.totalLeadsGenerated) * 100 : 0;
        return rateB - rateA;
      }
    });
  }, [partners, filterStatus, searchTerm, sortBy]);

  return (
    <div className="space-y-6">
      {/* PARTNER METRICS */}
      <div className="grid grid-cols-5 gap-3">
        {/* Total Partners */}
        <div className="bg-white border border-slate-200 rounded-lg p-4 shadow-sm">
          <div className="inline-block px-2 py-1 bg-blue-100 text-blue-700 text-xs font-bold rounded-full mb-3">
            TOTAL
          </div>
          <div className="text-3xl font-bold text-slate-900">{metrics.partnerCount}</div>
          <div className="text-xs text-slate-600 mt-2">Total partners</div>
        </div>

        {/* Active Partners */}
        <div className="bg-white border border-slate-200 rounded-lg p-4 shadow-sm">
          <div className="inline-block px-2 py-1 bg-emerald-100 text-emerald-700 text-xs font-bold rounded-full mb-3">
            ACTIVE
          </div>
          <div className="text-3xl font-bold text-slate-900">{metrics.activePartners}</div>
          <div className="text-xs text-slate-600 mt-2">Active partners</div>
        </div>

        {/* Total Leads */}
        <div className="bg-white border border-slate-200 rounded-lg p-4 shadow-sm">
          <div className="inline-block px-2 py-1 bg-purple-100 text-purple-700 text-xs font-bold rounded-full mb-3">
            LEADS
          </div>
          <div className="text-3xl font-bold text-slate-900">{metrics.totalLeads}</div>
          <div className="text-xs text-slate-600 mt-2">Total leads generated</div>
        </div>

        {/* Converted */}
        <div className="bg-white border border-slate-200 rounded-lg p-4 shadow-sm">
          <div className="inline-block px-2 py-1 bg-orange-100 text-orange-700 text-xs font-bold rounded-full mb-3">
            CONVERTED
          </div>
          <div className="text-3xl font-bold text-slate-900">{metrics.totalConverted}</div>
          <div className="text-xs text-slate-600 mt-2">Leads converted</div>
        </div>

        {/* Conversion Rate */}
        <div className="bg-white border border-slate-200 rounded-lg p-4 shadow-sm">
          <div className="inline-block px-2 py-1 bg-indigo-100 text-indigo-700 text-xs font-bold rounded-full mb-3">
            RATE
          </div>
          <div className="text-3xl font-bold text-slate-900">{metrics.conversionRate}%</div>
          <div className="text-xs text-slate-600 mt-2">Conversion rate</div>
        </div>
      </div>

      {/* FILTERS & SEARCH */}
      <div className="flex items-center justify-between gap-4">
        <div className="flex gap-2 flex-1">
          <div className="relative flex-1 max-w-md">
            <input
              type="text"
              placeholder="Search by name, code, owner..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-4 py-2 text-sm border border-slate-200 rounded-lg focus:border-slate-400 focus:outline-none focus:ring-1 focus:ring-slate-200"
            />
          </div>

          {/* Status Filters */}
          <button
            onClick={() => setFilterStatus('all')}
            className={`px-3 py-2 text-xs font-medium rounded-lg transition-all ${
              filterStatus === 'all'
                ? 'bg-slate-900 text-white'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            All ({metrics.partnerCount})
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
                ? 'bg-amber-600 text-white'
                : 'bg-amber-50 text-amber-700 hover:bg-amber-100'
            }`}
          >
            Pending ({metrics.pendingPartners})
          </button>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2">
          <button
            onClick={onOpenPartnerOnboarding}
            className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-white bg-slate-900 hover:bg-slate-800 rounded-lg transition-all"
          >
            <Plus size={14} />
            Onboard Partner
          </button>
        </div>
      </div>

      {/* PARTNER TABLE */}
      <section className="bg-white border border-slate-200 rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-200/70 text-[11px] font-semibold text-slate-400 uppercase tracking-wider bg-slate-50/50">
                <th className="py-3 px-4 min-w-[220px]">Business Name</th>
                <th className="py-3 px-4 min-w-[120px]">Partner Code</th>
                <th className="py-3 px-4 min-w-[100px]">Type</th>
                <th className="py-3 px-4 min-w-[140px]">Owner</th>
                <th className="py-3 px-4 min-w-[100px] text-center">Leads Generated</th>
                <th className="py-3 px-4 min-w-[100px] text-center">Converted</th>
                <th className="py-3 px-4 min-w-[100px] text-center">Conversion</th>
                <th className="py-3 px-4 min-w-[100px]">Status</th>
                <th className="py-3 px-4 text-right min-w-[150px]">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredPartners.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-12 text-center text-slate-400">
                    No partners found
                  </td>
                </tr>
              ) : (
                filteredPartners.map((partner) => {
                  const conversionRate =
                    partner.totalLeadsGenerated > 0
                      ? Math.round((partner.leadsConverted / partner.totalLeadsGenerated) * 100)
                      : 0;

                  return (
                    <tr key={partner.id} onClick={() => onSelectPartner?.(partner)} className="hover:bg-slate-50/70 transition-colors group cursor-pointer">
                      {/* Business Name */}
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          <Building2 size={14} className="text-slate-400" />
                          <div className="font-medium text-sm text-slate-900">
                            {partner.businessName}
                          </div>
                        </div>
                      </td>

                      {/* Partner Code */}
                      <td className="py-3 px-4 font-mono text-xs font-semibold text-slate-700">
                        {partner.partnerCode}
                      </td>

                      {/* Type */}
                      <td className="py-3 px-4">
                        <span className="inline-block px-2 py-0.5 rounded text-[11px] font-medium bg-slate-100 text-slate-700">
                          {partner.partnerType}
                        </span>
                      </td>

                      {/* Owner */}
                      <td className="py-3 px-4">
                        <div className="text-sm text-slate-700">{partner.ownerName}</div>
                        <div className="text-xs text-slate-500">{partner.ownerEmail}</div>
                      </td>

                      {/* Total Leads Generated */}
                      <td className="py-3 px-4 text-center">
                        <div className="font-semibold text-slate-900">{partner.totalLeadsGenerated}</div>
                      </td>

                      {/* Converted */}
                      <td className="py-3 px-4 text-center">
                        <div className="font-semibold text-emerald-600">{partner.leadsConverted}</div>
                      </td>

                      {/* Conversion Rate */}
                      <td className="py-3 px-4 text-center">
                        <div className="font-semibold text-slate-900">{conversionRate}%</div>
                        <div className="text-xs text-slate-500">
                          {conversionRate > 20 ? '📈 Strong' : conversionRate > 10 ? '⚖️ Fair' : '📉 Low'}
                        </div>
                      </td>

                      {/* Status */}
                      <td className="py-3 px-4">
                        <span
                          className={`inline-flex items-center text-[11px] font-semibold px-2 py-0.5 rounded-md border ${
                            partner.status === 'Active'
                              ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                              : partner.status === 'Pending Head' || partner.status === 'Pending Manager'
                              ? 'bg-amber-50 text-amber-800 border-amber-200'
                              : 'bg-red-50 text-red-800 border-red-200'
                          }`}
                        >
                          {partner.status}
                        </span>
                      </td>

                      {/* Actions */}
                      <td className="py-3 px-4 text-right" onClick={(e) => e.stopPropagation()}>
                        <div className="relative">
                          <button
                            onClick={() => setOpenDropdown(openDropdown === partner.id ? null : partner.id)}
                            className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-all opacity-0 group-hover:opacity-100"
                          >
                            Actions
                            <ChevronDown size={12} />
                          </button>

                          {openDropdown === partner.id && (
                            <div className="absolute right-0 top-full mt-1 w-44 bg-white border border-slate-200 rounded-lg shadow-lg z-50 py-1">
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  onEditPartner?.(partner);
                                  setOpenDropdown(null);
                                }}
                                className="w-full text-left px-4 py-2 text-xs hover:bg-slate-50 flex items-center gap-2 text-slate-700"
                              >
                                <Edit2 size={12} />
                                Edit Details
                              </button>

                              {(partner.status === 'Pending Manager' ||
                                partner.status === 'Pending Head') && (
                                <>
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      onApprovePartner?.(partner.id);
                                      setOpenDropdown(null);
                                    }}
                                    className="w-full text-left px-4 py-2 text-xs hover:bg-slate-50 flex items-center gap-2 text-emerald-600"
                                  >
                                    <CheckCircle2 size={12} />
                                    Approve
                                  </button>
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      onRejectPartner?.(partner.id, 'Rejected');
                                      setOpenDropdown(null);
                                    }}
                                    className="w-full text-left px-4 py-2 text-xs hover:bg-slate-50 flex items-center gap-2 text-red-600"
                                  >
                                    <XCircle size={12} />
                                    Reject
                                  </button>
                                </>
                              )}
                            </div>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </section>

      {/* PARTNER PERFORMANCE */}
      <section className="bg-white border border-slate-200 rounded-xl p-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
          <h3 className="text-base font-bold text-slate-900">Performance Insights</h3>
          <button className="text-xs font-medium text-slate-700 hover:text-slate-900 flex items-center gap-1">
            <Download size={12} />
            Export Report
          </button>
        </div>

        <div className="grid grid-cols-3 gap-4">
          {/* Top Partners by Leads */}
          <div>
            <h4 className="text-xs font-bold text-slate-900 mb-3 uppercase flex items-center gap-1">
              <TrendingUp size={12} />
              Top by Leads
            </h4>
            <div className="space-y-2">
              {[...filteredPartners]
                .sort((a, b) => b.totalLeadsGenerated - a.totalLeadsGenerated)
                .slice(0, 3)
                .map((partner) => (
                  <div key={partner.id} className="flex items-center justify-between p-2 bg-slate-50 rounded-lg">
                    <div className="text-xs font-medium text-slate-900 truncate">{partner.businessName}</div>
                    <span className="text-xs font-semibold text-blue-600 whitespace-nowrap ml-2">
                      {partner.totalLeadsGenerated}
                    </span>
                  </div>
                ))}
            </div>
          </div>

          {/* Top Partners by Conversion */}
          <div>
            <h4 className="text-xs font-bold text-slate-900 mb-3 uppercase flex items-center gap-1">
              <BarChart3 size={12} />
              Best Conversion
            </h4>
            <div className="space-y-2">
              {[...filteredPartners]
                .sort((a, b) => {
                  const rateA = a.totalLeadsGenerated > 0 ? (a.leadsConverted / a.totalLeadsGenerated) * 100 : 0;
                  const rateB = b.totalLeadsGenerated > 0 ? (b.leadsConverted / b.totalLeadsGenerated) * 100 : 0;
                  return rateB - rateA;
                })
                .slice(0, 3)
                .map((partner) => {
                  const rate =
                    partner.totalLeadsGenerated > 0
                      ? Math.round((partner.leadsConverted / partner.totalLeadsGenerated) * 100)
                      : 0;
                  return (
                    <div key={partner.id} className="flex items-center justify-between p-2 bg-slate-50 rounded-lg">
                      <div className="text-xs font-medium text-slate-900 truncate">{partner.businessName}</div>
                      <span className="text-xs font-semibold text-emerald-600 whitespace-nowrap ml-2">{rate}%</span>
                    </div>
                  );
                })}
            </div>
          </div>

          {/* Most Valuable Partners */}
          <div>
            <h4 className="text-xs font-bold text-slate-900 mb-3 uppercase flex items-center gap-1">
              <DollarSign size={12} />
              Most Active
            </h4>
            <div className="space-y-2">
              {[...filteredPartners]
                .sort((a, b) => b.leadsConverted - a.leadsConverted)
                .slice(0, 3)
                .map((partner) => (
                  <div key={partner.id} className="flex items-center justify-between p-2 bg-slate-50 rounded-lg">
                    <div className="text-xs font-medium text-slate-900 truncate">{partner.businessName}</div>
                    <span className="text-xs font-semibold text-purple-600 whitespace-nowrap ml-2">
                      {partner.leadsConverted} cvt
                    </span>
                  </div>
                ))}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
