import {
  PortalState,
  StudentLead,
} from '../types';

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

const getClaimOwner = (lead: StudentLead): string | undefined =>
  lead.acquireLifecycle?.owner || lead.acquireLifecycle?.qualificationOwner;

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

  return 'Acquire History';
};

export const isSignupConfirmed = (lead: StudentLead): boolean => {
  const lifecycle = lead.acquireLifecycle;
  if (lifecycle?.signup?.status === 'Confirmed') {
    const signup = lifecycle.signup;
    return Boolean(
      isRealIdentifier(signup.customerId) &&
        hasAccountContact(signup.accountMobile, signup.accountEmail) &&
        Boolean(signup.consentAcceptedAt && signup.consentAcceptedAt.trim())
    );
  }

  // Legacy mock leads may have a signed-up snapshot without lifecycle details.
  // Claiming a lead must not make an already signed-up lead disappear.
  return lead.signupStatus === 'Signed Up' && isRealIdentifier(lead.customerId);
};

export const isHandoffEligible = (lead: StudentLead): boolean =>
  lead.qualificationStatus === 'Qualified' &&
  isSignupConfirmed(lead) &&
  lead.acquireLifecycle?.handoff?.status !== 'Completed';

export const isMonetizationEligible = (lead: StudentLead): boolean => {
  if (lead.qualificationStatus !== 'Qualified' || !isSignupConfirmed(lead)) return false;

  const lifecycle = lead.acquireLifecycle;
  if (!lifecycle) return getEffectivePortalState(lead) === 'Monetization';
  if (lifecycle.handoff?.status === 'Failed') return false;

  return getEffectivePortalState(lead) === 'Monetization' || lifecycle.handoff?.status === 'Completed';
};

export const getQualificationQueueLeads = (leads: StudentLead[]): StudentLead[] =>
  uniqueLeads(leads).filter(
    (lead) =>
      lead.qualificationStatus === 'Pending' &&
      getEffectivePortalState(lead) === 'Qualification Queue' &&
      !getClaimOwner(lead)
  );

/** Leads claimed by the current RM that still need qualification or signup follow-up. */
export const getMyClaimedLeads = (leads: StudentLead[], owner: string): StudentLead[] =>
  uniqueLeads(leads).filter(
    (lead) =>
      getClaimOwner(lead) === owner &&
      ((lead.qualificationStatus === 'Pending' && getEffectivePortalState(lead) === 'Qualification Queue') ||
        (lead.qualificationStatus === 'Qualified' && getEffectivePortalState(lead) === 'Signup Pending'))
  );

/** The shared pending-signup claim pool. Claimed leads are visible in My Claimed Leads instead. */
export const getSignupPendingLeads = (leads: StudentLead[]): StudentLead[] =>
  uniqueLeads(leads).filter(
    (lead) =>
      lead.qualificationStatus === 'Qualified' &&
      getEffectivePortalState(lead) === 'Signup Pending' &&
      lead.acquireLifecycle?.handoff?.status !== 'Completed' &&
      !getClaimOwner(lead)
  );

export const getHandoffHistoryLeads = (leads: StudentLead[]): StudentLead[] =>
  uniqueLeads(leads).filter(
    (lead) =>
      getEffectivePortalState(lead) === 'Handoff History' &&
      lead.acquireLifecycle?.handoff?.status === 'Completed'
  );
