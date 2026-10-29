import {
  PortalState,
  StudentLead,
} from '../types';

/**
 * A read-only view of the attribution fields recorded on a lead. The raw
 * values are intentionally copied, never normalized or inferred.
 */
export interface SourceContextProjection {
  leadId: string;
  sourceCode?: string;
  partnerCode?: string;
  bdeCode?: string;
  referrerCode?: string;
  referrerName?: string;
  intake?: string;
  isInboundRaw?: boolean;
  inboundCompletionPct?: number;
  warnings: string[];
}

const isRealIdentifier = (value?: string): boolean => {
  if (!value || !value.trim()) return false;
  const normalized = value.trim().toLowerCase();
  return !['na', 'n/a', 'none', 'unknown', 'null', 'undefined', '-'].includes(normalized);
};

const hasValidEmail = (value?: string): boolean =>
  Boolean(value && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim()));

const hasValidMobile = (value?: string): boolean => {
  if (!value || !value.trim()) return false;
  const digits = value.replace(/\D/g, '');
  return digits.length >= 7;
};

const hasAccountContact = (mobile?: string, email?: string): boolean =>
  hasValidMobile(mobile) || hasValidEmail(email);

const uniqueLeads = (leads: StudentLead[]): StudentLead[] => {
  const seen = new Set<string>();
  return leads.filter((lead) => {
    if (seen.has(lead.id)) return false;
    seen.add(lead.id);
    return true;
  });
};

/** Explicit lifecycle state wins; legacy records use safe compatibility defaults. */
export const getEffectivePortalState = (lead: StudentLead): PortalState => {
  const explicitState = lead.acquireLifecycle?.portalState;
  if (explicitState) return explicitState;

  if (lead.qualificationStatus === 'Pending') return 'Qualification Queue';
  if (lead.qualificationStatus === 'Not Qualified') return 'Acquire History';
  if (lead.qualificationStatus === 'Qualified') {
    if (lead.signupStatus === 'Signed Up' && isRealIdentifier(lead.customerId)) {
      return 'Monetization';
    }
    return 'Signup Pending';
  }

  // Not Required and malformed legacy records have no active qualification work.
  return 'Acquire History';
};

/**
 * Explicit lifecycle records must carry the complete signup verification
 * aggregate. Legacy records retain the old Signed Up + customer ID contract.
 */
export const isSignupConfirmed = (lead: StudentLead): boolean => {
  const lifecycle = lead.acquireLifecycle;
  if (lifecycle) {
    const signup = lifecycle.signup;
    return Boolean(
      signup &&
        signup.status === 'Confirmed' &&
        isRealIdentifier(signup.customerId) &&
        hasAccountContact(signup.accountMobile, signup.accountEmail) &&
        Boolean(signup.consentAcceptedAt && signup.consentAcceptedAt.trim())
    );
  }

  return lead.signupStatus === 'Signed Up' && isRealIdentifier(lead.customerId);
};

/** Qualified, verified leads may be handed off until a handoff completes. */
export const isHandoffEligible = (lead: StudentLead): boolean =>
  lead.qualificationStatus === 'Qualified' &&
  isSignupConfirmed(lead) &&
  lead.acquireLifecycle?.handoff?.status !== 'Completed';

/**
 * Shared Monetization gate. Completed handoffs are eligible in the receiving
 * system even while Acquire retains the read-only Handoff History state.
 */
export const isMonetizationEligible = (lead: StudentLead): boolean => {
  if (lead.qualificationStatus !== 'Qualified' || !isSignupConfirmed(lead)) return false;

  const lifecycle = lead.acquireLifecycle;
  if (!lifecycle) return getEffectivePortalState(lead) === 'Monetization';
  if (lifecycle.handoff?.status === 'Failed') return false;

  return getEffectivePortalState(lead) === 'Monetization' || lifecycle.handoff?.status === 'Completed';
};

export const getQualificationQueueLeads = (leads: StudentLead[]): StudentLead[] =>
  uniqueLeads(leads).filter(
    (lead) => lead.qualificationStatus === 'Pending' && getEffectivePortalState(lead) === 'Qualification Queue'
  );

export const getMyClaimedLeads = (leads: StudentLead[], owner: string): StudentLead[] =>
  uniqueLeads(leads).filter(
    (lead) =>
      lead.qualificationStatus === 'Qualified' &&
      getEffectivePortalState(lead) === 'Signup Pending' &&
      lead.acquireLifecycle?.qualificationOwner === owner
  );

export const getSignupPendingLeads = (leads: StudentLead[]): StudentLead[] =>
  uniqueLeads(leads).filter(
    (lead) =>
      lead.qualificationStatus === 'Qualified' &&
      getEffectivePortalState(lead) === 'Signup Pending' &&
      lead.acquireLifecycle?.handoff?.status !== 'Completed'
  );

export const getHandoffHistoryLeads = (leads: StudentLead[]): StudentLead[] =>
  uniqueLeads(leads).filter(
    (lead) =>
      getEffectivePortalState(lead) === 'Handoff History' &&
      lead.acquireLifecycle?.handoff?.status === 'Completed'
  );

export const getAttributionWarnings = (lead: StudentLead): string[] => {
  const warnings: string[] = [];
  const sourceMissing = !isRealIdentifier(lead.sourceCode);
  const partnerPresent = isRealIdentifier(lead.partnerCode);
  const bde = lead.bdeCode?.trim();
  const referrer = lead.referrerCode?.trim();

  if (sourceMissing) warnings.push('Source is missing or not recorded.');
  if (sourceMissing && partnerPresent) warnings.push('Partner attribution is present without a source.');
  if (bde && referrer && bde.toLowerCase() !== referrer.toLowerCase()) {
    warnings.push('Referrer and BDE attribution are inconsistent.');
  }

  return warnings;
};

export const getSourceContextProjection = (lead: StudentLead): SourceContextProjection => ({
  leadId: lead.id,
  sourceCode: lead.sourceCode,
  partnerCode: lead.partnerCode,
  bdeCode: lead.bdeCode,
  referrerCode: lead.referrerCode,
  referrerName: lead.referrerName,
  intake: lead.intake,
  isInboundRaw: lead.isInboundRaw,
  inboundCompletionPct: lead.inboundCompletionPct,
  warnings: getAttributionWarnings(lead),
});

// Descriptive aliases for callers that refer to this as the lead context view.
export const getLeadSourceContext = getSourceContextProjection;
export const getSourceContextWarnings = getAttributionWarnings;
