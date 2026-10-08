/**
 * Unit Tests: Partner Master validation
 * Requirements: 1.2, 1.4, 1.11
 */

import { describe, test, expect } from 'vitest';
import {
  validatePartnerMaster,
  isValidPan,
  isValidEmail,
  isValidPhone,
  isValidPincode,
} from '../../utils/partnerValidation';
import { PartnerMaster } from '../../types/partner';

function validPartner(): Partial<PartnerMaster> {
  return {
    legalBusinessName: 'Test Partner Pvt Ltd',
    partnerType: 'Education Consultant',
    partnerScale: 'Multi Branch',
    panNumber: 'ABCDE1234F',
    ownerName: 'Gaurav Test',
    ownerEmail: 'owner@partner.com',
    ownerPhone: '9876543210',
    contactPersonName: 'Gaurav Test',
    contactPersonEmail: 'contact@partner.com',
    contactPersonPhone: '9876543210',
    addressType: 'Head Office',
    bdOwnerId: 'U1001',
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

describe('Format validators', () => {
  test('PAN format', () => {
    expect(isValidPan('ABCDE1234F')).toBe(true);
    expect(isValidPan('abcde1234f')).toBe(false);
    expect(isValidPan('ABCD1234F')).toBe(false);
  });
  test('email format', () => {
    expect(isValidEmail('a@b.com')).toBe(true);
    expect(isValidEmail('bad-email')).toBe(false);
  });
  test('phone format', () => {
    expect(isValidPhone('9876543210')).toBe(true);
    expect(isValidPhone('123')).toBe(false);
  });
  test('pincode format', () => {
    expect(isValidPincode('160017')).toBe(true);
    expect(isValidPincode('16A017')).toBe(false);
  });
});

describe('validatePartnerMaster', () => {
  test('valid partner has no errors', () => {
    expect(validatePartnerMaster(validPartner())).toHaveLength(0);
  });

  test('reports every missing mandatory field', () => {
    const errors = validatePartnerMaster({ operatingSameAsRegistered: true });
    const fields = errors.map((e) => e.field);
    expect(fields).toContain('legalBusinessName');
    expect(fields).toContain('partnerType');
    expect(fields).toContain('partnerScale');
    expect(fields).toContain('panNumber');
    expect(fields).toContain('ownerName');
    expect(fields).toContain('bdOwnerId');
    expect(fields).toContain('addressType');
  });

  test('requires operating address when not same as registered', () => {
    const p = { ...validPartner(), operatingSameAsRegistered: false, operatingAddress: undefined };
    const errors = validatePartnerMaster(p);
    expect(errors.some((e) => e.field.startsWith('operatingAddress'))).toBe(true);
  });

  test('does not require operating address when same as registered', () => {
    const p = { ...validPartner(), operatingSameAsRegistered: true };
    const errors = validatePartnerMaster(p);
    expect(errors.some((e) => e.field.startsWith('operatingAddress'))).toBe(false);
  });

  test('rejects invalid PAN and email formats', () => {
    const p = { ...validPartner(), panNumber: 'BADPAN', ownerEmail: 'nope' };
    const errors = validatePartnerMaster(p);
    expect(errors.some((e) => e.field === 'panNumber')).toBe(true);
    expect(errors.some((e) => e.field === 'ownerEmail')).toBe(true);
  });
});
