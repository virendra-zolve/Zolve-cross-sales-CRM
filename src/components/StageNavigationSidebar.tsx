import React, { useMemo } from 'react';
import { StageCompletionStatus } from '../types/normalized';

interface StageNavigationSidebarProps {
  stages: string[];
  currentStage: string;
  stageCompletionStatus: StageCompletionStatus;
  onStageSelect: (stage: string) => void;
  isEditMode: boolean;
}

/**
 * StageNavigationSidebar - Left sidebar for Education Loan Journey page
 * 
 * Displays:
 * - All stages in the current loan flow
 * - Completion status indicators (✓ completed, ● current, ○ pending)
 * - Progress bar showing completion percentage
 * - Clickable stage navigation (with restrictions in non-edit mode)
 */
const StageNavigationSidebar: React.FC<StageNavigationSidebarProps> = ({
  stages,
  currentStage,
  stageCompletionStatus,
  onStageSelect,
  isEditMode,
}) => {
  const currentIndex = stages.indexOf(currentStage);

  // Calculate completion statistics
  const completionStats = useMemo(() => {
    const completed = stages.filter(stage => stageCompletionStatus[stage]?.completed).length;
    const percentage = Math.round((completed / stages.length) * 100);
    return { completed, percentage };
  }, [stages, stageCompletionStatus]);

  // Determine if a stage is navigable
  const isStageNavigable = (stageIndex: number): boolean => {
    // In edit mode (draft), all stages are navigable
    if (isEditMode) {
      return true;
    }

    // In normal mode, only completed stages and current stage are navigable
    return stageIndex <= currentIndex;
  };

  return (
    <div className="w-48 hidden lg:block flex-shrink-0">
      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden sticky top-20 flex flex-col h-fit max-h-[calc(100vh-140px)]">
        {/* Progress header */}
        <div className="bg-gradient-to-r from-blue-50 to-blue-100/50 px-4 py-3 border-b border-slate-200">
          <h3 className="text-xs font-bold text-slate-900 mb-2 uppercase tracking-wider">
            Progress
          </h3>
          <div className="space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-600">
                {completionStats.completed}/{stages.length} completed
              </span>
              <span className="text-xs font-bold text-blue-600">
                {completionStats.percentage}%
              </span>
            </div>
            <div className="h-2 bg-slate-200 rounded-full overflow-hidden">
              <div
                className="h-full bg-blue-500 transition-all duration-300"
                style={{ width: `${completionStats.percentage}%` }}
              />
            </div>
          </div>
        </div>

        {/* Stages list */}
        <nav className="flex-1 overflow-y-auto p-2">
          <div className="space-y-1">
            {stages.map((stage, index) => {
              const isCompleted = stageCompletionStatus[stage]?.completed || false;
              const isCurrent = stage === currentStage;
              const isNavigable = isStageNavigable(index);

              let statusIcon = '○'; // pending
              if (isCompleted) {
                statusIcon = '✓'; // completed
              } else if (isCurrent) {
                statusIcon = '●'; // current
              }

              return (
                <button
                  key={stage}
                  onClick={() => {
                    if (isNavigable) {
                      onStageSelect(stage);
                    }
                  }}
                  disabled={!isNavigable}
                  className={`w-full text-left px-3 py-2.5 text-xs rounded-lg font-medium transition-all ${
                    isCurrent
                      ? 'bg-blue-50 text-blue-700 border-l-2 border-blue-600'
                      : isCompleted
                      ? 'text-slate-700 hover:bg-slate-50'
                      : isNavigable
                      ? 'text-slate-500 hover:bg-slate-50'
                      : 'text-slate-300 cursor-not-allowed'
                  }`}
                  title={
                    !isNavigable && !isCurrent
                      ? `Complete previous stages to access this stage`
                      : stage
                  }
                >
                  <div className="flex items-center gap-2.5">
                    <span
                      className={`inline-flex items-center justify-center w-5 h-5 rounded-full text-xs font-bold ${
                        isCompleted
                          ? 'bg-green-100 text-green-700'
                          : isCurrent
                          ? 'bg-blue-200 text-blue-700'
                          : 'bg-slate-100 text-slate-400'
                      }`}
                    >
                      {statusIcon}
                    </span>
                    <span className="truncate flex-1">{stage}</span>
                  </div>
                </button>
              );
            })}
          </div>
        </nav>

        {/* Footer note */}
        <div className="px-3 py-2 border-t border-slate-200 bg-slate-50">
          <p className="text-xs text-slate-500">
            {isEditMode ? '📝 Draft mode - all stages editable' : '🔒 Complete stages to progress'}
          </p>
        </div>
      </div>
    </div>
  );
};

export default StageNavigationSidebar;
