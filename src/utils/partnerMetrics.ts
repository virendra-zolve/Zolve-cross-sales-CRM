// Partner performance metric calculators (pure, side-effect free)

import {
  PartnerPerformance,
  BdPartnerMetrics,
  PartnerCommissionConfig,
  PartnerMaster,
} from '../types/partner';
import { computeCommission } from './commissionSlabs';

// Minimal lead/transaction shapes needed for metrics. Kept local so the
// calculators do not depend on the full normalized lead model.
export interface PartnerLeadRecord {
  partnerId: string;
  product: string;
  qualified: boolean;
  active: boolean;
  converted: boolean;
}

export interface PartnerTransactionRecord {
  partnerId: string;
  product: string;
  sanctionedAmount: number;
  disbursedAmount: number;
  // Metric value used to resolve the commission slab (e.g. sanctioned amount, # SIMs).
  metricValue: number;
  // Base the payout applies to (amount for percentage, units for flat).
  payoutBase: number;
}

export function calculatePartnerPerformance(
  partnerId: string,
  leads: PartnerLeadRecord[],
  txns: PartnerTransactionRecord[],
  commissions: PartnerCommissionConfig[],
  commissionPaid = 0
): PartnerPerformance {
  const myLeads = leads.filter((l) => l.partnerId === partnerId);
  const myTxns = txns.filter((t) => t.partnerId === partnerId);

  const totalLeads = myLeads.length;
  const qualifiedLeads = myLeads.filter((l) => l.qualified).length;
  const activeLeads = myLeads.filter((l) => l.active).length;
  const convertedLeads = myLeads.filter((l) => l.converted).length;
  const conversionRate = totalLeads === 0 ? 0 : convertedLeads / totalLeads;

  const productWiseLeads: Record<string, number> = {};
  const productWiseConverted: Record<string, number> = {};
  for (const lead of myLeads) {
    productWiseLeads[lead.product] = (productWiseLeads[lead.product] || 0) + 1;
    if (lead.converted) {
      productWiseConverted[lead.product] = (productWiseConverted[lead.product] || 0) + 1;
    }
  }
  const productWiseConversion: Record<string, number> = {};
  for (const product of Object.keys(productWiseLeads)) {
    const total = productWiseLeads[product];
    const conv = productWiseConverted[product] || 0;
    productWiseConversion[product] = total === 0 ? 0 : conv / total;
  }

  let loanSanctionedAmount = 0;
  let loanDisbursedAmount = 0;
  let commissionEarned = 0;

  const activeCommissionByProduct = new Map<string, PartnerCommissionConfig>();
  for (const c of commissions) {
    if (c.partnerId === partnerId && c.status === 'Active') {
      activeCommissionByProduct.set(c.product, c);
    }
  }

  for (const txn of myTxns) {
    loanSanctionedAmount += txn.sanctionedAmount;
    loanDisbursedAmount += txn.disbursedAmount;
    const config = activeCommissionByProduct.get(txn.product);
    if (config) {
      commissionEarned += computeCommission(config.tiers, txn.metricValue, txn.payoutBase);
    }
  }

  return {
    partnerId,
    totalLeads,
    qualifiedLeads,
    activeLeads,
    convertedLeads,
    conversionRate,
    productWiseLeads,
    productWiseConversion,
    loanSanctionedAmount,
    loanDisbursedAmount,
    commissionEarned,
    commissionPaid,
    pendingCommission: commissionEarned - commissionPaid,
  };
}

export function calculateBdPartnerMetrics(
  bdOwnerId: string,
  partners: PartnerMaster[],
  leadsByPartnerId: Record<string, number>,
  partnerLogins = 0
): BdPartnerMetrics {
  const myPartners = partners.filter((p) => p.bdOwnerId === bdOwnerId);
  const partnersOnboarded = myPartners.length;
  const activePartnersList = myPartners.filter((p) => p.status === 'Active');
  const activePartners = activePartnersList.length;
  const activePartnerRate = partnersOnboarded === 0 ? 0 : activePartners / partnersOnboarded;

  const partnersGeneratingLeads = activePartnersList.filter(
    (p) => (leadsByPartnerId[p.id] || 0) > 0
  ).length;

  const leadsGenerated = myPartners.reduce(
    (sum, p) => sum + (leadsByPartnerId[p.id] || 0),
    0
  );

  return {
    bdOwnerId,
    partnersOnboarded,
    activePartners,
    activePartnerRate,
    partnersGeneratingLeads,
    leadsGenerated,
    partnerLogins,
  };
}
