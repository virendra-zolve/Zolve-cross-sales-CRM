import { MasterProduct, ProductOpportunity, StudentLead } from '../types';
import { isMonetizationEligible } from './acquireHelpers';

export const CURRENT_RM = 'Virendra (You)';
export const MONETIZATION_PRODUCTS: MasterProduct[] = ['Education Loan', 'Credit Card'];

export interface OpportunityRow {
  lead: StudentLead;
  opportunity: ProductOpportunity;
  ownerLabel: string;
  isAvailable: boolean;
}

export interface MyLeadGroup {
  lead: StudentLead;
  opportunities: ProductOpportunity[];
}

const isAvailable = (opportunity: ProductOpportunity) => !opportunity.productOwner?.trim();

/** All Monetization projections share the strict Acquire handoff gate. */
export const getOpportunityRows = (leads: StudentLead[], product?: MasterProduct): OpportunityRow[] =>
  leads
    .filter(isMonetizationEligible)
    .flatMap((lead) =>
      lead.productOpportunities
        .filter((opportunity) => !product || opportunity.product === product)
        .map((opportunity) => ({
          lead,
          opportunity,
          ownerLabel: opportunity.productOwner || 'Available to claim',
          isAvailable: isAvailable(opportunity),
        }))
    );

export const getAvailableOpportunityRows = (leads: StudentLead[]): OpportunityRow[] =>
  getOpportunityRows(leads).filter((row) => row.isAvailable);

export const getOwnedOpportunityRows = (
  leads: StudentLead[],
  owner = CURRENT_RM,
  product?: MasterProduct,
): OpportunityRow[] => getOpportunityRows(leads, product).filter((row) => row.opportunity.productOwner === owner);

export const getMyLeadGroups = (leads: StudentLead[], owner = CURRENT_RM): MyLeadGroup[] => {
  const groups = new Map<string, MyLeadGroup>();

  getOwnedOpportunityRows(leads, owner).forEach(({ lead, opportunity }) => {
    const existing = groups.get(lead.id);
    if (existing) {
      existing.opportunities.push(opportunity);
    } else {
      groups.set(lead.id, { lead, opportunities: [opportunity] });
    }
  });

  return Array.from(groups.values());
};

export const getRmScopedLeads = (leads: StudentLead[], owner = CURRENT_RM): StudentLead[] =>
  leads.filter(
    (lead) =>
      isMonetizationEligible(lead) &&
      (lead.leadOwner === owner || lead.productOpportunities.some((opportunity) => opportunity.productOwner === owner))
  );

export const claimOpportunity = (
  lead: StudentLead,
  opportunityId: string,
  owner = CURRENT_RM,
): StudentLead | null => {
  if (!isMonetizationEligible(lead)) return null;

  const opportunity = lead.productOpportunities.find((item) => item.id === opportunityId);
  if (!opportunity || !isAvailable(opportunity)) return null;

  return {
    ...lead,
    productOpportunities: lead.productOpportunities.map((item) =>
      item.id === opportunityId ? { ...item, productOwner: owner } : item
    ),
  };
};
