import React, { useState, useMemo } from 'react';
import {
  Users,
  TrendingUp,
  Target,
  Zap,
  ChevronRight,
  Edit2,
  Power,
  Share2,
  Plus,
  Filter,
  Download,
  ChevronDown,
} from 'lucide-react';
import { TeamMember } from '../types';

interface TeamManagementPageProps {
  teamMembers: TeamMember[];
  onSelectTeamMember?: (member: TeamMember) => void;
  onEditTeamMember?: (member: TeamMember) => void;
  onDeactivateTeamMember?: (memberId: string) => void;
  onReassignTeamMember?: (memberId: string, newManagerId: string) => void;
  onOpenTeamOnboarding?: () => void;
}

export const TeamManagementPage: React.FC<TeamManagementPageProps> = ({
  teamMembers = [],
  onSelectTeamMember,
  onEditTeamMember,
  onDeactivateTeamMember,
  onReassignTeamMember,
  onOpenTeamOnboarding,
}) => {
  const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'pending'>('all');
  const [sortBy, setSortBy] = useState<'name' | 'capacity' | 'target'>('name');
  const [searchTerm, setSearchTerm] = useState('');
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);

  // Team metrics
  const metrics = useMemo(() => {
    const activeMembers = teamMembers.filter(m => m.status === 'Active').length;
    const pendingMembers = teamMembers.filter(m => m.status === 'Pending Approval').length;
    const totalCapacity = teamMembers.reduce((sum, m) => sum + m.capacityPercent, 0);
    const avgCapacity = teamMembers.length > 0 ? Math.round(totalCapacity / teamMembers.length) : 0;
    const totalTarget = teamMembers.reduce((sum, m) => sum + m.monthlyTarget, 0);
    
    return {
      activeMembers,
      pendingMembers,
      avgCapacity,
      totalTarget,
      teamSize: teamMembers.length,
    };
  }, [teamMembers]);

  // Filter and sort
  const filteredTeamMembers = useMemo(() => {
    let filtered = teamMembers;

    // Status filter
    if (filterStatus === 'active') {
      filtered = filtered.filter(m => m.status === 'Active');
    } else if (filterStatus === 'pending') {
      filtered = filtered.filter(m => m.status === 'Pending Approval');
    }

    // Search filter
    if (searchTerm.trim()) {
      const q = searchTerm.toLowerCase();
      filtered = filtered.filter(
        m =>
          m.name.toLowerCase().includes(q) ||
          m.email.toLowerCase().includes(q) ||
          m.role.toLowerCase().includes(q)
      );
    }

    // Sorting
    return filtered.sort((a, b) => {
      if (sortBy === 'name') {
        return a.name.localeCompare(b.name);
      } else if (sortBy === 'capacity') {
        return b.capacityPercent - a.capacityPercent;
      } else {
        return b.monthlyTarget - a.monthlyTarget;
      }
    });
  }, [teamMembers, filterStatus, searchTerm, sortBy]);

  return (
    <div className="space-y-6">
      {/* TEAM METRICS */}
      <div className="grid grid-cols-4 gap-3">
        {/* Total Team Members */}
        <div className="bg-white border border-slate-200 rounded-lg p-4 shadow-sm">
          <div className="inline-block px-2 py-1 bg-blue-100 text-blue-700 text-xs font-bold rounded-full mb-3">
            TEAM SIZE
          </div>
          <div className="text-3xl font-bold text-slate-900">{metrics.teamSize}</div>
          <div className="text-xs text-slate-600 mt-2">Total team members</div>
        </div>

        {/* Active Members */}
        <div className="bg-white border border-slate-200 rounded-lg p-4 shadow-sm">
          <div className="inline-block px-2 py-1 bg-emerald-100 text-emerald-700 text-xs font-bold rounded-full mb-3">
            ACTIVE
          </div>
          <div className="text-3xl font-bold text-slate-900">{metrics.activeMembers}</div>
          <div className="text-xs text-slate-600 mt-2">Active members</div>
        </div>

        {/* Avg Capacity */}
        <div className="bg-white border border-slate-200 rounded-lg p-4 shadow-sm">
          <div className="inline-block px-2 py-1 bg-purple-100 text-purple-700 text-xs font-bold rounded-full mb-3">
            CAPACITY
          </div>
          <div className="text-3xl font-bold text-slate-900">{metrics.avgCapacity}%</div>
          <div className="text-xs text-slate-600 mt-2">Average capacity</div>
        </div>

        {/* Total Target */}
        <div className="bg-white border border-slate-200 rounded-lg p-4 shadow-sm">
          <div className="inline-block px-2 py-1 bg-orange-100 text-orange-700 text-xs font-bold rounded-full mb-3">
            TARGET
          </div>
          <div className="text-3xl font-bold text-slate-900">{metrics.totalTarget}</div>
          <div className="text-xs text-slate-600 mt-2">Combined monthly target</div>
        </div>
      </div>

      {/* FILTERS & SEARCH */}
      <div className="flex items-center justify-between gap-4">
        <div className="flex gap-2 flex-1">
          <div className="relative flex-1 max-w-md">
            <input
              type="text"
              placeholder="Search by name, email, role..."
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
            All ({metrics.teamSize})
          </button>
          <button
            onClick={() => setFilterStatus('active')}
            className={`px-3 py-2 text-xs font-medium rounded-lg transition-all ${
              filterStatus === 'active'
                ? 'bg-emerald-600 text-white'
                : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
            }`}
          >
            Active ({metrics.activeMembers})
          </button>
          <button
            onClick={() => setFilterStatus('pending')}
            className={`px-3 py-2 text-xs font-medium rounded-lg transition-all ${
              filterStatus === 'pending'
                ? 'bg-blue-600 text-white'
                : 'bg-blue-50 text-blue-700 hover:bg-blue-100'
            }`}
          >
            Pending ({metrics.pendingMembers})
          </button>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2">
          <button
            onClick={onOpenTeamOnboarding}
            className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-all"
          >
            <Plus size={14} />
            Add Member
          </button>
        </div>
      </div>

      {/* TEAM TABLE */}
      <section className="bg-white border border-slate-200 rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-200/70 text-[11px] font-semibold text-slate-400 uppercase tracking-wider bg-slate-50/50">
                <th className="py-3 px-4 min-w-[200px]">Team Member</th>
                <th className="py-3 px-4 min-w-[120px]">Role</th>
                <th className="py-3 px-4 min-w-[100px]">Location</th>
                <th className="py-3 px-4 min-w-[100px] text-center">Target</th>
                <th className="py-3 px-4 min-w-[100px] text-center">Capacity</th>
                <th className="py-3 px-4 min-w-[120px]">Manager</th>
                <th className="py-3 px-4 min-w-[100px]">Status</th>
                <th className="py-3 px-4 text-right min-w-[150px]">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredTeamMembers.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-400">
                    No team members found
                  </td>
                </tr>
              ) : (
                filteredTeamMembers.map((member) => (
                  <tr
                    key={member.id}
                    onClick={() => onSelectTeamMember?.(member)}
                    className="hover:bg-slate-50/70 transition-colors group cursor-pointer"
                  >
                    {/* Member Name & Email */}
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-3">
                        {member.avatar ? (
                          <img
                            src={member.avatar}
                            alt={member.name}
                            className="w-8 h-8 rounded-full"
                          />
                        ) : (
                          <div className="w-8 h-8 rounded-full bg-slate-300" />
                        )}
                        <div>
                          <div className="font-medium text-sm text-slate-900">
                            {member.name}
                          </div>
                          <div className="text-xs text-slate-500">{member.email}</div>
                        </div>
                      </div>
                    </td>

                    {/* Role */}
                    <td className="py-3 px-4">
                      <span className="inline-block px-2 py-0.5 rounded text-[11px] font-medium bg-slate-100 text-slate-700">
                        {member.role}
                      </span>
                    </td>

                    {/* Location */}
                    <td className="py-3 px-4 text-sm text-slate-700">{member.location}</td>

                    {/* Monthly Target */}
                    <td className="py-3 px-4 text-center">
                      <div className="font-semibold text-slate-900">{member.monthlyTarget}</div>
                      <div className="text-xs text-slate-500">leads/month</div>
                    </td>

                    {/* Capacity */}
                    <td className="py-3 px-4 text-center">
                      <div className="flex items-center justify-center gap-2">
                        <div className="w-12 h-1.5 rounded-full bg-slate-200">
                          <div
                            className={`h-full rounded-full ${
                              member.capacityPercent >= 80
                                ? 'bg-red-500'
                                : member.capacityPercent >= 60
                                ? 'bg-amber-500'
                                : 'bg-emerald-500'
                            }`}
                            style={{ width: `${Math.min(member.capacityPercent, 100)}%` }}
                          />
                        </div>
                        <span className="font-semibold text-xs text-slate-900 w-8 text-right">
                          {member.capacityPercent}%
                        </span>
                      </div>
                    </td>

                    {/* Manager */}
                    <td className="py-3 px-4 text-sm text-slate-700">
                      {member.managerName || '—'}
                    </td>

                    {/* Status */}
                    <td className="py-3 px-4">
                      <span
                        className={`inline-flex items-center text-[11px] font-semibold px-2 py-0.5 rounded-md border ${
                          member.status === 'Active'
                            ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                            : 'bg-blue-50 text-blue-800 border-blue-200'
                        }`}
                      >
                        {member.status}
                      </span>
                    </td>

                    {/* Actions */}
                    <td className="py-3 px-4 text-right" onClick={(e) => e.stopPropagation()}>
                      <div className="relative">
                        <button
                          onClick={() => setOpenDropdown(openDropdown === member.id ? null : member.id)}
                          className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-all opacity-0 group-hover:opacity-100"
                        >
                          Actions
                          <ChevronDown size={12} />
                        </button>

                        {openDropdown === member.id && (
                          <div className="absolute right-0 top-full mt-1 w-44 bg-white border border-slate-200 rounded-lg shadow-lg z-50 py-1">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                onEditTeamMember?.(member);
                                setOpenDropdown(null);
                              }}
                              className="w-full text-left px-4 py-2 text-xs hover:bg-slate-50 flex items-center gap-2 text-slate-700"
                            >
                              <Edit2 size={12} />
                              Edit Target & Details
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                onDeactivateTeamMember?.(member.id);
                                setOpenDropdown(null);
                              }}
                              className="w-full text-left px-4 py-2 text-xs hover:bg-slate-50 flex items-center gap-2 text-red-600"
                            >
                              <Power size={12} />
                              {member.status === 'Active' ? 'Deactivate' : 'Activate'}
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                onReassignTeamMember?.(member.id, '');
                                setOpenDropdown(null);
                              }}
                              className="w-full text-left px-4 py-2 text-xs hover:bg-slate-50 flex items-center gap-2 text-purple-600"
                            >
                              <Share2 size={12} />
                              Reassign Manager
                            </button>
                          </div>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>

      {/* TEAM PERFORMANCE SUMMARY */}
      <section className="bg-white border border-slate-200 rounded-xl p-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
          <h3 className="text-base font-bold text-slate-900">Performance Overview</h3>
          <button className="text-xs font-medium text-slate-700 hover:text-slate-900 flex items-center gap-1">
            <Download size={12} />
            Export Report
          </button>
        </div>

        <div className="grid grid-cols-2 gap-4">
          {/* Top Performers */}
          <div>
            <h4 className="text-xs font-bold text-slate-900 mb-3 uppercase">Top Performers</h4>
            <div className="space-y-2">
              {filteredTeamMembers.slice(0, 3).map((member) => (
                <div key={member.id} className="flex items-center justify-between p-2 bg-slate-50 rounded-lg">
                  <div className="text-xs font-medium text-slate-900">{member.name}</div>
                  <span className="text-xs font-semibold text-emerald-600">
                    {member.capacityPercent}% capacity
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Highest Targets */}
          <div>
            <h4 className="text-xs font-bold text-slate-900 mb-3 uppercase">Highest Targets</h4>
            <div className="space-y-2">
              {[...filteredTeamMembers]
                .sort((a, b) => b.monthlyTarget - a.monthlyTarget)
                .slice(0, 3)
                .map((member) => (
                  <div key={member.id} className="flex items-center justify-between p-2 bg-slate-50 rounded-lg">
                    <div className="text-xs font-medium text-slate-900">{member.name}</div>
                    <span className="text-xs font-semibold text-blue-600">{member.monthlyTarget} leads</span>
                  </div>
                ))}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
