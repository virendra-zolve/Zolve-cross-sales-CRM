/**
 * Unit Tests: PartnersDatabase API
 * Requirements: 2.5, 5.3, 5.4, 5.9, 6.5, 9.3
 */

import { describe, test, expect, beforeEach } from 'vitest';
import { PartnersDatabase } from '../../api/partnersApi';
import { PartnerMaster } from '../../types/partner';

function masterInput(): Omit<PartnerMaster, 'id' | 'partnerCode' | 'status' | 'createdAt' | 'updatedAt'> {
  return {
    legalBusinessName: 'Test Partner Pvt Ltd',
    partnerType: 'Education Loan',
    partnerScale: 'Multi Branch',
    panNumber: 'ABCDE1234F',
    ownerName: 'Gaurav Test',
    ownerEmail: 'owner@partner.com',
    ownerPhone: '9876543210',
    contactSameAsOwner: false,
    contacts: [
      { name: 'Gaurav Test', designation: 'Director', email: 'contact@partner.com', phone: '9876543210' },
    ],
    officeType: 'Head Office',
    addressType: 'Head Office',
    bdOwnerId: 'U1001',
    bdOwnerName: 'Arun',
    operatingSameAsRegistered: true,
    registeredAddress: {
      addressLine1: 'Shop No. 12',
      city: 'Chandigarh',
      state: 'Punjab',
      pincode: '160017',
      country: 'India',
    },
  };
}

function approveMandatoryDocs(db: PartnersDatabase, partnerId: string) {
  const pan = db.addDocument(partnerId, { documentType: 'PAN', fileName: 'pan.pdf', fileUrl: 'blob:x', uploadedBy: 'U1001' });
  const agr = db.addDocument(partnerId, { documentType: 'Agreement', fileName: 'agr.pdf', fileUrl: 'blob:y', uploadedBy: 'U1001' });
  db.reviewDocument(pan.data!.id, 'Approved', 'Head');
  db.reviewDocument(agr.data!.id, 'Approved', 'Head');
}

describe('PartnersDatabase workflow', () => {
  let db: PartnersDatabase;
  beforeEach(() => {
    db = new PartnersDatabase();
  });

  test('create generates Partner ID but no Partner Code', () => {
    const res = db.createPartner(masterInput());
    expect(res.success).toBe(true);
    expect(res.data!.id).toMatch(/^P\d{5}$/);
    expect(res.data!.partnerCode).toBeUndefined();
    expect(res.data!.status).toBe('Draft');
  });

  test('approve blocked until mandatory docs approved', () => {
    const p = db.createPartner({ ...masterInput(), submit: true }).data!;
    const blocked = db.reviewPartner(p.id, 'approve', 'Head');
    expect(blocked.success).toBe(false);
    expect(blocked.error!.code).toBe('MANDATORY_DOCS_MISSING');

    approveMandatoryDocs(db, p.id);
    const approved = db.reviewPartner(p.id, 'approve', 'Head');
    expect(approved.success).toBe(true);
    expect(approved.data!.status).toBe('Active');
    expect(approved.data!.partnerCode).toMatch(/^PC\d{5}$/); // code only on activation
  });

  test('reject sets Rejected; review_required then resubmit returns to pending', () => {
    const p = db.createPartner({ ...masterInput(), submit: true }).data!;
    const review = db.reviewPartner(p.id, 'review_required', 'Head', 'Fix PAN');
    expect(review.data!.status).toBe('Review Required');
    const resub = db.resubmitPartner(p.id);
    expect(resub.data!.status).toBe('Pending Head Approval');
    const rej = db.reviewPartner(p.id, 'reject', 'Head', 'Not eligible');
    expect(rej.data!.status).toBe('Rejected');
  });

  test('commission cascade delete removes tiers', () => {
    const p = db.createPartner(masterInput()).data!;
    const comm = db.setCommission(p.id, {
      partnerId: p.id, product: 'Education Loan', tierMetric: 'Sanctioned Loan Amount',
      commissionType: 'Percentage', effectiveFrom: '2026-01-01', status: 'Active',
      tiers: [
        { slabIndex: 0, fromValue: 0, toValue: 100, commissionType: 'Percentage', commissionValue: 0.5 },
        { slabIndex: 1, fromValue: 100, toValue: null, commissionType: 'Percentage', commissionValue: 1 },
      ],
    });
    expect(comm.success).toBe(true);
    db.deleteCommission(comm.data!.id);
    expect(db.getCommissions(p.id).data!).toHaveLength(0);
  });

  test('invalid slabs rejected', () => {
    const p = db.createPartner(masterInput()).data!;
    const bad = db.setCommission(p.id, {
      partnerId: p.id, product: 'eSIM', tierMetric: 'Number of SIMs',
      commissionType: 'Flat', effectiveFrom: '2026-01-01', status: 'Active',
      tiers: [
        { slabIndex: 0, fromValue: 0, toValue: 100, commissionType: 'Flat', commissionValue: 50 },
        { slabIndex: 1, fromValue: 200, toValue: null, commissionType: 'Flat', commissionValue: 70 },
      ],
    });
    expect(bad.success).toBe(false);
    expect(bad.error!.code).toBe('SLAB_INVALID');
  });

  test('migration bypasses approval and activates with code', () => {
    const res = db.bulkCreatePartners([{ master: masterInput() }]);
    expect(res.success).toBe(true);
    const p = res.data![0];
    expect(p.status).toBe('Active');
    expect(p.partnerCode).toMatch(/^PC\d{5}$/);
  });

  test('document reference requires existing partner', () => {
    const res = db.addDocument('P99999', { documentType: 'PAN', fileName: 'x', fileUrl: 'y', uploadedBy: 'U1' });
    expect(res.success).toBe(false);
    expect(res.error!.code).toBe('NOT_FOUND');
  });
});
