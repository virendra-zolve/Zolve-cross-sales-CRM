import { LoanStage, LenderStatus } from '../types/normalized';

/**
 * Loan Stage Progression Helpers
 * Handles 7-stage loan progression logic with auto-transitions
 */

// Valid stage transitions
const VALID_TRANSITIONS: Record<LoanStage, LoanStage[]> = {
  [LoanStage.STARTED]: [LoanStage.DOCS_PENDING, LoanStage.LOST],
  [LoanStage.DOCS_PENDING]: [LoanStage.DOCS_RECEIVED, LoanStage.LOST],
  [LoanStage.DOCS_RECEIVED]: [LoanStage.CALL_SCHEDULED, LoanStage.LOST],
  [LoanStage.CALL_SCHEDULED]: [LoanStage.SANCTIONED, LoanStage.LOST],
  [LoanStage.SANCTIONED]: [LoanStage.DISBURSED, LoanStage.LOST],
  [LoanStage.DISBURSED]: [LoanStage.LOST],
  [LoanStage.LOST]: [],
};

// Valid lender status transitions
const VALID_LENDER_TRANSITIONS: Record<LenderStatus, LenderStatus[]> = {
  [LenderStatus.INTERESTED]: [LenderStatus.APPLIED, LenderStatus.WITHDRAWN],
  [LenderStatus.APPLIED]: [LenderStatus.UNDER_REVIEW, LenderStatus.WITHDRAWN],
  [LenderStatus.UNDER_REVIEW]: [LenderStatus.APPROVED, LenderStatus.REJECTED, LenderStatus.WITHDRAWN],
  [LenderStatus.APPROVED]: [LenderStatus.DISBURSED, LenderStatus.WITHDRAWN],
  [LenderStatus.REJECTED]: [LenderStatus.WITHDRAWN],
  [LenderStatus.DISBURSED]: [LenderStatus.WITHDRAWN],
  [LenderStatus.WITHDRAWN]: [],
};

/**
 * Check if stage transition is valid
 */
export const isValidStageTransition = (fromStage: LoanStage, toStage: LoanStage): boolean => {
  return VALID_TRANSITIONS[fromStage]?.includes(toStage) ?? false;
};

/**
 * Check if lender status transition is valid
 */
export const isValidLenderTransition = (fromStatus: LenderStatus, toStatus: LenderStatus): boolean => {
  return VALID_LENDER_TRANSITIONS[fromStatus]?.includes(toStatus) ?? false;
};

/**
 * Get valid next stages for current stage
 */
export const getValidNextStages = (currentStage: LoanStage): LoanStage[] => {
  return VALID_TRANSITIONS[currentStage] || [];
};

/**
 * Get valid next statuses for lender
 */
export const getValidLenderNextStatuses = (currentStatus: LenderStatus): LenderStatus[] => {
  return VALID_LENDER_TRANSITIONS[currentStatus] || [];
};

/**
 * Stage display names and descriptions
 */
export const STAGE_DISPLAY_INFO: Record<LoanStage, { label: string; description: string; color: string }> = {
  [LoanStage.STARTED]: {
    label: 'Started',
    description: 'Application created and in progress',
    color: 'bg-blue-100 text-blue-800',
  },
  [LoanStage.DOCS_PENDING]: {
    label: 'Documents Pending',
    description: 'Waiting for documents from applicant',
    color: 'bg-yellow-100 text-yellow-800',
  },
  [LoanStage.DOCS_RECEIVED]: {
    label: 'Documents Received',
    description: 'All documents received and verified',
    color: 'bg-green-100 text-green-800',
  },
  [LoanStage.CALL_SCHEDULED]: {
    label: 'Call Scheduled',
    description: 'Call with applicant scheduled',
    color: 'bg-purple-100 text-purple-800',
  },
  [LoanStage.SANCTIONED]: {
    label: 'Sanctioned',
    description: 'Loan approved by lender',
    color: 'bg-indigo-100 text-indigo-800',
  },
  [LoanStage.DISBURSED]: {
    label: 'Disbursed',
    description: 'Loan funds disbursed',
    color: 'bg-emerald-100 text-emerald-800',
  },
  [LoanStage.LOST]: {
    label: 'Lost',
    description: 'Application lost or abandoned',
    color: 'bg-red-100 text-red-800',
  },
};

/**
 * Lender status display info
 */
export const LENDER_STATUS_DISPLAY_INFO: Record<LenderStatus, { label: string; color: string }> = {
  [LenderStatus.INTERESTED]: { label: 'Interested', color: 'bg-blue-100 text-blue-800' },
  [LenderStatus.APPLIED]: { label: 'Applied', color: 'bg-yellow-100 text-yellow-800' },
  [LenderStatus.UNDER_REVIEW]: { label: 'Under Review', color: 'bg-orange-100 text-orange-800' },
  [LenderStatus.APPROVED]: { label: 'Approved', color: 'bg-green-100 text-green-800' },
  [LenderStatus.REJECTED]: { label: 'Rejected', color: 'bg-red-100 text-red-800' },
  [LenderStatus.DISBURSED]: { label: 'Disbursed', color: 'bg-emerald-100 text-emerald-800' },
  [LenderStatus.WITHDRAWN]: { label: 'Withdrawn', color: 'bg-gray-100 text-gray-800' },
};

/**
 * Check if loan is in terminal state
 */
export const isTerminalStage = (stage: LoanStage): boolean => {
  return stage === LoanStage.DISBURSED || stage === LoanStage.LOST;
};

/**
 * Check if lender is in terminal status
 */
export const isTerminalLenderStatus = (status: LenderStatus): boolean => {
  return status === LenderStatus.WITHDRAWN || status === LenderStatus.REJECTED;
};

/**
 * Calculate progress percentage based on stage
 */
export const calculateProgressPercentage = (stage: LoanStage): number => {
  const progressMap: Record<LoanStage, number> = {
    [LoanStage.STARTED]: 15,
    [LoanStage.DOCS_PENDING]: 30,
    [LoanStage.DOCS_RECEIVED]: 45,
    [LoanStage.CALL_SCHEDULED]: 60,
    [LoanStage.SANCTIONED]: 80,
    [LoanStage.DISBURSED]: 100,
    [LoanStage.LOST]: 0,
  };
  return progressMap[stage] || 0;
};
