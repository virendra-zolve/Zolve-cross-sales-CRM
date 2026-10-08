// Partner onboarding workflow state machine (pure, side-effect free)

import { PartnerStatus, PartnerDocument } from '../types/partner';

export type WorkflowDecision = 'approve' | 'review_required' | 'reject';

export interface TransitionResult {
  nextStatus: PartnerStatus;
  error?: string;
}

/**
 * Mandatory documents for activation: PAN + Agreement, both Approved.
 */
export function mandatoryDocsApproved(docs: PartnerDocument[]): boolean {
  const panApproved = docs.some(
    (d) => d.documentType === 'PAN' && d.status === 'Approved'
  );
  const agreementApproved = docs.some(
    (d) => d.documentType === 'Agreement' && d.status === 'Approved'
  );
  return panApproved && agreementApproved;
}

export function canSubmit(current: PartnerStatus): boolean {
  return current === 'Draft';
}

export function canResubmit(current: PartnerStatus): boolean {
  return current === 'Review Required';
}

/**
 * Head decision transition. Only valid from 'Pending Head Approval'.
 * Approve requires mandatory documents to be approved, otherwise it is blocked.
 */
export function nextStatusForDecision(
  current: PartnerStatus,
  decision: WorkflowDecision,
  mandatoryDocsApprovedFlag: boolean
): TransitionResult {
  if (current !== 'Pending Head Approval') {
    return {
      nextStatus: current,
      error: `Cannot take a decision on a partner in status "${current}"`,
    };
  }

  switch (decision) {
    case 'approve':
      if (!mandatoryDocsApprovedFlag) {
        return {
          nextStatus: current,
          error: 'Cannot approve: PAN and Agreement documents must be approved first',
        };
      }
      return { nextStatus: 'Active' };
    case 'reject':
      return { nextStatus: 'Rejected' };
    case 'review_required':
      return { nextStatus: 'Review Required' };
    default:
      return { nextStatus: current, error: 'Unknown decision' };
  }
}
