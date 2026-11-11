import { MasterProduct, StudentLead } from '../types';
import { getEffectivePortalState, isMonetizationEligible } from './acquireHelpers';

export const CURRENT_RM = 'Virendra (You)';
export const MONETIZATION_PRODUCTS: MasterProduct[] = ['Education Loan', 'Credit Card'];

/** One owner is shared by every queue in the acquire-to-monetization lifecycle. */
export const getLeadClaimOwner = (lead: StudentLead): string | undefined =>
  lead.acquireLifecycle?.owner || lead.acquireLifecycle?.qualificationOwner;

export const isLeadClaimed = (lead: StudentLead): boolean => Boolean(getLeadClaimOwner(lead)?.trim());

const isClaimableLifecycleState = (lead: StudentLead): boolean => {
  const state = getEffectivePortalState(lead);
  return state === 'Qualification Queue' || state === 'Signup Pending' || state === 'Monetization';
};

/** All monetization projections contain one row per lead, never one row per opportunity. */
export const getMonetizationLeads = (leads: StudentLead[]): StudentLead[] =>
  leads.filter(isMonetizationEligible);

export const getAvailableLeads = (leads: StudentLead[]): StudentLead[] =>
  getMonetizationLeads(leads).filter((lead) => !isLeadClaimed(lead));

export const getOwnedLeads = (
  leads: StudentLead[],
  owner = CURRENT_RM,
  product?: MasterProduct,
): StudentLead[] =>
  getMonetizationLeads(leads).filter(
    (lead) =>
      getLeadClaimOwner(lead) === owner &&
      (!product || lead.productOpportunities.some((opportunity) => opportunity.product === product)),
  );

export const getRmScopedLeads = (leads: StudentLead[], owner = CURRENT_RM): StudentLead[] =>
  getOwnedLeads(leads, owner);

export const claimLead = (
  lead: StudentLead,
  owner = CURRENT_RM,
): StudentLead | null => {
  if (!isClaimableLifecycleState(lead) || isLeadClaimed(lead)) return null;

  const claimedAt = new Date().toISOString();
  const lifecycle = lead.acquireLifecycle ?? {
    portalState: getEffectivePortalState(lead),
    qualificationHistory: [],
    signup: { status: 'Not Started' as const },
    handoff: { status: 'Not Eligible' as const },
  };

  return {
    ...lead,
    acquireLifecycle: {
      ...lifecycle,
      owner,
      ownerAssignedAt: claimedAt,
      // Keep legacy readers in sync while all new behavior uses owner.
      qualificationOwner: owner,
      qualificationOwnerAssignedAt: claimedAt,
    },
  };
};

export const releaseLead = (
  lead: StudentLead,
  owner = CURRENT_RM,
): StudentLead | null => {
  if (getLeadClaimOwner(lead) !== owner) return null;
  if (!lead.acquireLifecycle) return null;

  return {
    ...lead,
    acquireLifecycle: {
      ...lead.acquireLifecycle,
      owner: undefined,
      ownerAssignedAt: undefined,
      qualificationOwner: undefined,
      qualificationOwnerAssignedAt: undefined,
    },
  };
};
