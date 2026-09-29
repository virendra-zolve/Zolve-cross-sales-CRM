import React, { useMemo, useState } from 'react';
import { Plus, Users, TrendingUp } from 'lucide-react';
import { LenderApplicationProgress, LenderStatus } from '../types/normalized';
import { LenderManagementCard } from './LenderManagementCard';

interface LenderManagementPanelProps {
  loanId: string;
  lenders: LenderApplicationProgress[];
  onAddLender: (lender: LenderApplicationProgress) => void;
  onUpdateStatus: (lenderId: string, newStatus: LenderStatus, details?: any) => void;
  onRemoveLender: (lenderId: string) => void;
}

/**
 * LenderManagementPanel
 *
 * Wraps LenderManagementCard for multi-lender coordination. Sorts lenders by
 * match score (highest first), surfaces summary metrics, and provides an
 * add-lender flow.
 */
const LenderManagementPanel: React.FC<LenderManagementPanelProps> = ({
  loanId,
  lenders,
  onAddLender,
  onUpdateStatus,
  onRemoveLender,
}) => {
  const [showAddForm, setShowAddForm] = useState(false);
  const [newLender, setNewLender] = useState({
    lenderName: '',
    matchScore: 75,
    recommendationSource: 'MANUAL' as 'AUTO_RECOMMENDED' | 'MANUAL',
  });

  // Sort by match score (highest first)
  const sortedLenders = useMemo(() => {
    return [...lenders].sort((a, b) => b.matchScore - a.matchScore);
  }, [lenders]);

  // Summary stats
  const stats = useMemo(() => {
    const approved = lenders.filter(l => l.lenderStatus === LenderStatus.APPROVED).length;
    const disbursed = lenders.filter(l => l.lenderStatus === LenderStatus.DISBURSED).length;
    const active = lenders.filter(
      l =>
        l.lenderStatus !== LenderStatus.REJECTED &&
        l.lenderStatus !== LenderStatus.WITHDRAWN
    ).length;
    const topScore = lenders.length > 0
      ? Math.max(...lenders.map(l => l.matchScore))
      : 0;
    return { approved, disbursed, active, topScore };
  }, [lenders]);

  const handleAddLender = () => {
    if (!newLender.lenderName.trim()) return;

    const now = new Date().toISOString();
    const lender: LenderApplicationProgress = {
      lenderId: `lender-${Date.now()}`,
      loanId,
      lenderName: newLender.lenderName.trim(),
      lenderStatus: LenderStatus.INTERESTED,
      matchScore: Math.max(0, Math.min(100, newLender.matchScore)),
      recommendationSource: newLender.recommendationSource,
      statusHistory: [],
      createdAt: now,
      updatedAt: now,
    };

    onAddLender(lender);
    setNewLender({ lenderName: '', matchScore: 75, recommendationSource: 'MANUAL' });
    setShowAddForm(false);
  };

  return (
    <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
      {/* Header */}
      <div className="px-4 py-3 border-b border-slate-200 bg-gradient-to-r from-slate-50 to-white flex items-center justify-between gap-3">
        <div className="flex items-center gap-2 min-w-0">
          <div className="w-8 h-8 rounded-lg bg-blue-100 flex items-center justify-center flex-shrink-0">
            <Users className="w-4 h-4 text-blue-600" />
          </div>
          <div className="min-w-0">
            <h3 className="text-sm font-bold text-slate-900">Lender Coordination</h3>
            <p className="text-xs text-slate-500 mt-0.5">
              {lenders.length === 0
                ? 'No lenders yet'
                : `${stats.active} active, ${stats.approved} approved, ${stats.disbursed} disbursed`}
            </p>
          </div>
        </div>
        <button
          onClick={() => setShowAddForm(v => !v)}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors flex-shrink-0"
        >
          <Plus className="w-3.5 h-3.5" />
          Add Lender
        </button>
      </div>

      {/* Stats summary */}
      {lenders.length > 0 && (
        <div className="grid grid-cols-4 gap-2 px-4 py-3 border-b border-slate-200 bg-slate-50/50">
          <StatCell label="Total" value={lenders.length} />
          <StatCell label="Active" value={stats.active} accent="blue" />
          <StatCell label="Approved" value={stats.approved} accent="green" />
          <StatCell
            label="Top Match"
            value={stats.topScore > 0 ? `${stats.topScore}%` : '—'}
            accent="purple"
            icon={<TrendingUp className="w-3 h-3" />}
          />
        </div>
      )}

      {/* Add lender form */}
      {showAddForm && (
        <div className="p-4 border-b border-slate-200 bg-blue-50/40 space-y-3">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Lender Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={newLender.lenderName}
              onChange={e => setNewLender({ ...newLender, lenderName: e.target.value })}
              placeholder="e.g., HDFC Credila, Prodigy Finance"
              className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Match Score (0-100)
              </label>
              <input
                type="number"
                min={0}
                max={100}
                value={newLender.matchScore}
                onChange={e =>
                  setNewLender({ ...newLender, matchScore: Number(e.target.value) })
                }
                className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Source
              </label>
              <select
                value={newLender.recommendationSource}
                onChange={e =>
                  setNewLender({
                    ...newLender,
                    recommendationSource: e.target.value as 'AUTO_RECOMMENDED' | 'MANUAL',
                  })
                }
                className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="MANUAL">Manual</option>
                <option value="AUTO_RECOMMENDED">Auto Recommended</option>
              </select>
            </div>
          </div>
          <div className="flex gap-2 pt-1">
            <button
              onClick={handleAddLender}
              disabled={!newLender.lenderName.trim()}
              className="flex-1 px-3 py-1.5 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg transition-colors"
            >
              Add Lender
            </button>
            <button
              onClick={() => setShowAddForm(false)}
              className="flex-1 px-3 py-1.5 text-xs font-semibold text-slate-700 bg-white hover:bg-slate-50 border border-slate-200 rounded-lg transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Lender list */}
      <div className="p-4 space-y-3">
        {sortedLenders.length === 0 ? (
          <div className="p-6 rounded-lg border-2 border-dashed border-slate-300 bg-slate-50 text-center">
            <Users className="w-8 h-8 text-slate-400 mx-auto mb-2" />
            <p className="text-sm font-semibold text-slate-700">No lenders added yet</p>
            <p className="text-xs text-slate-500 mt-1">
              Add lenders to coordinate applications across multiple providers.
            </p>
          </div>
        ) : (
          sortedLenders.map((lender, idx) => (
            <div key={lender.lenderId} className="relative">
              {idx === 0 && sortedLenders.length > 1 && (
                <div className="absolute -top-2 left-3 z-10">
                  <span className="px-2 py-0.5 bg-amber-100 text-amber-800 rounded text-xs font-bold border border-amber-200">
                    ⭐ Top Match
                  </span>
                </div>
              )}
              <LenderManagementCard
                lender={lender}
                onUpdateStatus={onUpdateStatus}
                onRemove={onRemoveLender}
              />
            </div>
          ))
        )}
      </div>
    </div>
  );
};

interface StatCellProps {
  label: string;
  value: number | string;
  accent?: 'blue' | 'green' | 'purple';
  icon?: React.ReactNode;
}

const StatCell: React.FC<StatCellProps> = ({ label, value, accent, icon }) => {
  const accentClasses = {
    blue: 'text-blue-600',
    green: 'text-emerald-600',
    purple: 'text-purple-600',
  };
  return (
    <div className="text-center">
      <div className="flex items-center justify-center gap-1">
        {icon}
        <span
          className={`text-base font-bold ${
            accent ? accentClasses[accent] : 'text-slate-900'
          }`}
        >
          {value}
        </span>
      </div>
      <p className="text-xs text-slate-500 mt-0.5">{label}</p>
    </div>
  );
};

export default LenderManagementPanel;
