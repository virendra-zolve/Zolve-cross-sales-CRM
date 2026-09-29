import React, { useState } from 'react';
import { Check, Circle, ChevronRight, History } from 'lucide-react';
import { LoanStage } from '../types/normalized';
import {
  STAGE_DISPLAY_INFO,
  getValidNextStages,
  isTerminalStage,
  calculateProgressPercentage,
} from '../utils/loanProgressionHelpers';

interface StageHistoryEntry {
  from: LoanStage;
  to: LoanStage;
  timestamp: string;
  reason?: string;
}

interface StageProgressionTimelineProps {
  currentStage: LoanStage;
  stageHistory: StageHistoryEntry[];
  onAdvanceStage?: (toStage: LoanStage, reason?: string) => void;
  compact?: boolean;
}

// Ordered display sequence (LOST is terminal branch, shown separately)
const STAGE_ORDER: LoanStage[] = [
  LoanStage.STARTED,
  LoanStage.DOCS_PENDING,
  LoanStage.DOCS_RECEIVED,
  LoanStage.CALL_SCHEDULED,
  LoanStage.SANCTIONED,
  LoanStage.DISBURSED,
];

/**
 * StageProgressionTimeline
 *
 * Visual 7-stage loan progression tracker. Shows the current stage, completed
 * stages, upcoming stages, and full transition history. Optionally exposes
 * manual advance controls for RMs.
 */
const StageProgressionTimeline: React.FC<StageProgressionTimelineProps> = ({
  currentStage,
  stageHistory,
  onAdvanceStage,
  compact = false,
}) => {
  const [showHistory, setShowHistory] = useState(false);
  const [pendingReason, setPendingReason] = useState('');
  const [pendingStage, setPendingStage] = useState<LoanStage | null>(null);

  const currentIndex = STAGE_ORDER.indexOf(currentStage);
  const isLost = currentStage === LoanStage.LOST;
  const progress = calculateProgressPercentage(currentStage);
  const nextStages = getValidNextStages(currentStage);
  const terminal = isTerminalStage(currentStage);

  const stagesReached = new Set(stageHistory.map(h => h.to));
  stagesReached.add(currentStage);

  const handleAdvance = (stage: LoanStage) => {
    if (!onAdvanceStage) return;
    setPendingStage(stage);
  };

  const confirmAdvance = () => {
    if (pendingStage && onAdvanceStage) {
      onAdvanceStage(pendingStage, pendingReason || undefined);
      setPendingStage(null);
      setPendingReason('');
    }
  };

  return (
    <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
      {/* Header */}
      <div className="px-4 py-3 border-b border-slate-200 bg-gradient-to-r from-slate-50 to-white flex items-center justify-between">
        <div>
          <h3 className="text-sm font-bold text-slate-900">Loan Journey</h3>
          <p className="text-xs text-slate-500 mt-0.5">
            {isLost ? 'Application closed' : `${progress}% complete`}
          </p>
        </div>
        <button
          onClick={() => setShowHistory(!showHistory)}
          className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
        >
          <History className="w-3.5 h-3.5" />
          History ({stageHistory.length})
        </button>
      </div>

      {/* Progress bar */}
      {!isLost && (
        <div className="px-4 pt-3">
          <div className="h-2 bg-slate-200 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-blue-500 to-emerald-500 transition-all duration-500"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      )}

      {/* Timeline */}
      <div className="p-4">
        {isLost ? (
          <div className="p-4 rounded-lg bg-red-50 border border-red-200 text-center">
            <p className="text-sm font-semibold text-red-900">Application Lost</p>
            <p className="text-xs text-red-700 mt-1">
              This loan journey has ended without completion.
            </p>
          </div>
        ) : (
          <div className={compact ? 'flex items-center gap-1 overflow-x-auto pb-2' : 'space-y-2'}>
            {STAGE_ORDER.map((stage, idx) => {
              const info = STAGE_DISPLAY_INFO[stage];
              const reached = stagesReached.has(stage);
              const isCurrent = stage === currentStage;
              const isPast = reached && !isCurrent;

              if (compact) {
                return (
                  <React.Fragment key={stage}>
                    <div
                      className={`flex-shrink-0 flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap ${
                        isCurrent
                          ? info.color + ' ring-2 ring-offset-1 ring-blue-400'
                          : isPast
                          ? 'bg-emerald-50 text-emerald-700'
                          : 'bg-slate-50 text-slate-400'
                      }`}
                    >
                      {isPast ? (
                        <Check className="w-3.5 h-3.5" />
                      ) : (
                        <Circle className="w-3.5 h-3.5" />
                      )}
                      {info.label}
                    </div>
                    {idx < STAGE_ORDER.length - 1 && (
                      <ChevronRight className="w-3.5 h-3.5 text-slate-300 flex-shrink-0" />
                    )}
                  </React.Fragment>
                );
              }

              return (
                <div
                  key={stage}
                  className={`flex items-start gap-3 p-3 rounded-lg border ${
                    isCurrent
                      ? 'border-blue-300 bg-blue-50'
                      : isPast
                      ? 'border-emerald-200 bg-emerald-50/40'
                      : 'border-slate-200 bg-white'
                  }`}
                >
                  <div
                    className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${
                      isCurrent
                        ? 'bg-blue-600 text-white'
                        : isPast
                        ? 'bg-emerald-500 text-white'
                        : 'bg-slate-100 text-slate-400'
                    }`}
                  >
                    {isPast ? <Check className="w-4 h-4" /> : idx + 1}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-sm font-semibold text-slate-900">
                        {info.label}
                      </span>
                      {isCurrent && (
                        <span className="px-2 py-0.5 bg-blue-600 text-white rounded text-xs font-bold">
                          Current
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-slate-600 mt-0.5">{info.description}</p>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Advance controls */}
        {!terminal && onAdvanceStage && nextStages.length > 0 && (
          <div className="mt-4 pt-4 border-t border-slate-200">
            <p className="text-xs font-semibold text-slate-600 mb-2">Advance to:</p>
            <div className="flex flex-wrap gap-2">
              {nextStages.map(stage => (
                <button
                  key={stage}
                  onClick={() => handleAdvance(stage)}
                  className={`px-3 py-1.5 text-xs font-semibold rounded-lg border transition-colors ${
                    stage === LoanStage.LOST
                      ? 'border-red-200 text-red-700 hover:bg-red-50'
                      : 'border-blue-200 text-blue-700 hover:bg-blue-50'
                  }`}
                >
                  {STAGE_DISPLAY_INFO[stage].label}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Confirm-advance dialog */}
      {pendingStage && (
        <div className="px-4 pb-4">
          <div className="p-3 border border-blue-200 bg-blue-50 rounded-lg space-y-2">
            <p className="text-xs font-semibold text-blue-900">
              Advance to {STAGE_DISPLAY_INFO[pendingStage].label}?
            </p>
            <input
              type="text"
              value={pendingReason}
              onChange={e => setPendingReason(e.target.value)}
              placeholder="Reason (optional)"
              className="w-full px-2.5 py-1.5 text-xs border border-blue-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <div className="flex gap-2">
              <button
                onClick={confirmAdvance}
                className="flex-1 px-3 py-1.5 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors"
              >
                Confirm
              </button>
              <button
                onClick={() => {
                  setPendingStage(null);
                  setPendingReason('');
                }}
                className="flex-1 px-3 py-1.5 text-xs font-semibold text-slate-700 bg-white hover:bg-slate-50 border border-slate-200 rounded-lg transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* History drawer */}
      {showHistory && (
        <div className="border-t border-slate-200 bg-slate-50 p-4">
          <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
            Transition History
          </h4>
          {stageHistory.length === 0 ? (
            <p className="text-xs text-slate-500">No transitions yet.</p>
          ) : (
            <div className="space-y-2">
              {stageHistory
                .slice()
                .reverse()
                .map((entry, idx) => (
                  <div
                    key={idx}
                    className="flex items-start gap-2 text-xs bg-white p-2 rounded border border-slate-200"
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-1.5 font-semibold text-slate-800">
                        <span>{STAGE_DISPLAY_INFO[entry.from].label}</span>
                        <ChevronRight className="w-3 h-3 text-slate-400" />
                        <span>{STAGE_DISPLAY_INFO[entry.to].label}</span>
                      </div>
                      {entry.reason && (
                        <p className="text-slate-600 mt-0.5">{entry.reason}</p>
                      )}
                    </div>
                    <span className="text-slate-500 whitespace-nowrap">
                      {new Date(entry.timestamp).toLocaleDateString()}
                    </span>
                  </div>
                ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default StageProgressionTimeline;
