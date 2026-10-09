/**
 * Unit Tests: Partner & BD metric calculators
 * Requirements: 7.3, 8.2
 */

import { describe, test, expect } from 'vitest';
import {
  calculatePartnerPerformance,
  calculateBdPartnerMetrics,
  PartnerLeadRecord,
  PartnerTransactionRecord,
} from '../../utils/partnerMetrics';
import { PartnerMaster, PartnerCommissionConfig } from '../../types/partner';

describe('calculatePartnerPerformance', () => {
  test('conversion rate is 0 when no leads', () => {
    const perf = calculatePartnerPerformance('P1', [], [], []);
    expect(perf.conversionRate).toBe(0);
    expect(perf.totalLeads).toBe(0);
  });

  test('computes conversion and commission', () => {
    const leads: PartnerLeadRecord[] = [
      { partnerId: 'P1', product: 'Education Loan', qualified: true, active: true, converted: true },
      { partnerId: 'P1', product: 'Education Loan', qualified: true, active: false, converted: false },
    ];
    const txns: PartnerTransactionRecord[] = [
      { partnerId: 'P1', product: 'Education Loan', sanctionedAmount: 1000, disbursedAmount: 800, metricValue: 1000, payoutBase: 1000 },
    ];
    const commissions: PartnerCommissionConfig[] = [
      {
        id: 'c1', partnerId: 'P1', product: 'Education Loan', tierMetric: 'Sanctioned Loan Amount',
        commissionType: 'Percentage', effectiveFrom: '2026-01-01', status: 'Active',
        tiers: [
          { id: 't1', commissionId: 'c1', slabIndex: 0, fromValue: 0, toValue: null, commissionType: 'Percentage', commissionValue: 1 },
        ],
      },
    ];
    const perf = calculatePartnerPerformance('P1', leads, txns, commissions);
    expect(perf.totalLeads).toBe(2);
    expect(perf.convertedLeads).toBe(1);
    expect(perf.conversionRate).toBeCloseTo(0.5);
    expect(perf.loanSanctionedAmount).toBe(1000);
    expect(perf.commissionEarned).toBeCloseTo(10); // 1% of 1000
    expect(perf.pendingCommission).toBeCloseTo(10);
  });
});

describe('calculateBdPartnerMetrics', () => {
  function partner(id: string, status: PartnerMaster['status']): PartnerMaster {
    return {
      id, status, legalBusinessName: id, partnerType: 'Credit Card', partnerScale: 'Single Branch',
      panNumber: 'ABCDE1234F', ownerName: 'o', ownerEmail: 'o@x.com', ownerPhone: '9999999999',
      contactSameAsOwner: true, contacts: [], officeType: 'Head Office',
      registeredAddress: { addressLine1: 'a', city: 'c', state: 's', pincode: '1', country: 'in' },
      operatingSameAsRegistered: true, addressType: 'Head Office', bdOwnerId: 'U1001',
      createdAt: '', updatedAt: '',
    };
  }

  test('active partner rate is 0 when none onboarded', () => {
    const m = calculateBdPartnerMetrics('U1001', [], {}, 0);
    expect(m.activePartnerRate).toBe(0);
    expect(m.partnersOnboarded).toBe(0);
  });

  test('computes rates and lead generation', () => {
    const partners = [partner('P1', 'Active'), partner('P2', 'Rejected'), partner('P3', 'Active')];
    const leadsByPartner = { P1: 5, P3: 0 };
    const m = calculateBdPartnerMetrics('U1001', partners, leadsByPartner, 7);
    expect(m.partnersOnboarded).toBe(3);
    expect(m.activePartners).toBe(2);
    expect(m.activePartnerRate).toBeCloseTo(2 / 3);
    expect(m.partnersGeneratingLeads).toBe(1); // only P1 has leads
    expect(m.leadsGenerated).toBe(5);
    expect(m.partnerLogins).toBe(7);
  });
});
