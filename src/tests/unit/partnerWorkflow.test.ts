/**
 * Unit Tests: Partner workflow state machine
 * Requirements: 5.3, 5.4, 5.5, 5.6, 5.9
 */

import { describe, test, expect } from 'vitest';
import {
  nextStatusForDecision,
  mandatoryDocsApproved,
  canSubmit,
  canResubmit,
} from '../../utils/partnerWorkflow';
import { PartnerDocument } from '../../types/partner';

function doc(partial: Partial<PartnerDocument>): PartnerDocument {
  return {
    id: 'd',
    partnerId: 'p',
    documentType: 'PAN',
    fileName: 'f.pdf',
    fileUrl: 'blob:x',
    status: 'Uploaded',
    uploadedBy: 'U1',
    uploadedAt: new Date().toISOString(),
    ...partial,
  };
}

describe('mandatoryDocsApproved', () => {
  test('true only when PAN and Agreement are both Approved', () => {
    const docs = [
      doc({ documentType: 'PAN', status: 'Approved' }),
      doc({ documentType: 'Agreement', status: 'Approved' }),
    ];
    expect(mandatoryDocsApproved(docs)).toBe(true);
  });
  test('false when agreement missing', () => {
    expect(mandatoryDocsApproved([doc({ documentType: 'PAN', status: 'Approved' })])).toBe(false);
  });
});

describe('nextStatusForDecision', () => {
  test('approve blocked without mandatory docs', () => {
    const res = nextStatusForDecision('Pending Head Approval', 'approve', false);
    expect(res.nextStatus).toBe('Pending Head Approval');
    expect(res.error).toBeDefined();
  });

  test('approve with docs yields Active', () => {
    expect(nextStatusForDecision('Pending Head Approval', 'approve', true).nextStatus).toBe('Active');
  });

  test('reject yields Rejected', () => {
    expect(nextStatusForDecision('Pending Head Approval', 'reject', true).nextStatus).toBe('Rejected');
  });

  test('review_required yields Review Required', () => {
    expect(nextStatusForDecision('Pending Head Approval', 'review_required', false).nextStatus).toBe(
      'Review Required'
    );
  });

  test('decisions invalid from non-pending status', () => {
    const res = nextStatusForDecision('Draft', 'approve', true);
    expect(res.error).toBeDefined();
    expect(res.nextStatus).toBe('Draft');
  });
});

describe('submit / resubmit guards', () => {
  test('canSubmit only from Draft', () => {
    expect(canSubmit('Draft')).toBe(true);
    expect(canSubmit('Active')).toBe(false);
  });
  test('canResubmit only from Review Required', () => {
    expect(canResubmit('Review Required')).toBe(true);
    expect(canResubmit('Draft')).toBe(false);
  });
});
