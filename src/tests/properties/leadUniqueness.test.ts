/**
 * Property-Based Test: Lead ID Uniqueness
 * 
 * Property: FOR ALL leads created, exactly_one(lead_id per student) = true
 * 
 * This test verifies that:
 * 1. Each lead gets a unique ID
 * 2. Duplicate mobile numbers are detected
 * 3. The system prevents duplicate lead creation
 * 4. Activities are logged for duplicate detection
 */

import { LeadsDatabase } from '../../api/leadsApi';
import { expect } from 'vitest';

describe('Property: Lead ID Uniqueness', () => {
  let db: LeadsDatabase;

  beforeEach(() => {
    db = new LeadsDatabase();
  });

  test('Property 1.1: Each lead created gets a unique lead_id', () => {
    const lead1 = db.createLead({
      studentName: 'Alice Johnson',
      mobileNumber: '9876543210',
      mobileCountryCode: '91',
      email: 'alice@example.com',
      sourceCode: 'PARTNER_001',
    });

    const lead2 = db.createLead({
      studentName: 'Bob Smith',
      mobileNumber: '9876543211',
      mobileCountryCode: '91',
      email: 'bob@example.com',
      sourceCode: 'PARTNER_001',
    });

    expect(lead1.leadId).not.toBe(lead2.leadId);
    expect(lead1.leadId).toMatch(/^L\d{6}$/);
    expect(lead2.leadId).toMatch(/^L\d{6}$/);
  });

  test('Property 1.2: Duplicate mobile number returns existing lead', () => {
    const originalLead = db.createLead({
      studentName: 'Charlie Brown',
      mobileNumber: '9876543220',
      mobileCountryCode: '91',
      email: 'charlie@example.com',
      sourceCode: 'PARTNER_001',
    });

    const originalLeadId = originalLead.leadId;

    // Attempt to create duplicate with exact same mobile
    const duplicateAttempt = db.createLead({
      studentName: 'Charlie Brown Duplicate',
      mobileNumber: '9876543220',
      mobileCountryCode: '91',
      email: 'charlieduplicate@example.com',
      sourceCode: 'PARTNER_001',
    });

    // Should return the original lead, not create a new one
    expect(duplicateAttempt.leadId).toBe(originalLeadId);
    expect(duplicateAttempt.studentName).toBe('Charlie Brown');
  });

  test('Property 1.3: Mobile number normalization handles various formats', () => {
    const lead1 = db.createLead({
      studentName: 'David Lee',
      mobileNumber: '9876543230',
      mobileCountryCode: '91',
      email: 'david@example.com',
      sourceCode: 'PARTNER_001',
    });

    const lead1Id = lead1.leadId;

    // Try different formats of same number
    const variations = [
      '98-765-43230',
      '+91 9876543230',
      '+919876543230',
      '9876543230',
      ' 9876543230 ',
    ];

    variations.forEach(variant => {
      const attempt = db.createLead({
        studentName: 'David Lee Variant',
        mobileNumber: variant,
        mobileCountryCode: '91',
        email: 'david.variant@example.com',
        sourceCode: 'PARTNER_001',
      });

      expect(attempt.leadId).toBe(lead1Id);
    });
  });

  test('Property 1.4: Duplicate detection creates Activity log entry', () => {
    const originalLead = db.createLead({
      studentName: 'Emma Watson',
      mobileNumber: '9876543240',
      mobileCountryCode: '91',
      email: 'emma@example.com',
      sourceCode: 'PARTNER_001',
    });

    const activities1 = db.getLeadActivity(originalLead.leadId);
    const initialActivityCount = activities1.length;

    // Attempt duplicate
    db.createLead({
      studentName: 'Emma Watson Duplicate',
      mobileNumber: '9876543240',
      mobileCountryCode: '91',
      email: 'emma.dup@example.com',
      sourceCode: 'PARTNER_001',
    });

    const activities2 = db.getLeadActivity(originalLead.leadId);
    expect(activities2.length).toBeGreaterThan(initialActivityCount);

    // Last activity should be about duplicate detection
    const latestActivity = activities2[0];
    expect(latestActivity.type).toBe('system');
    expect(latestActivity.title).toContain('duplicate') || expect(latestActivity.description).toContain('duplicate');
  });

  test('Property 1.5: Lead ID format is consistent (L + 6 digits)', () => {
    const leads = [];
    for (let i = 0; i < 10; i++) {
      const lead = db.createLead({
        studentName: `Student ${i}`,
        mobileNumber: `${9876543250 + i}`,
        mobileCountryCode: '91',
        email: `student${i}@example.com`,
        sourceCode: 'PARTNER_001',
      });
      leads.push(lead);
    }

    leads.forEach(lead => {
      expect(lead.leadId).toMatch(/^L\d{6}$/);
      const numPart = parseInt(lead.leadId.substring(1), 10);
      expect(numPart).toBeGreaterThanOrEqual(0);
      expect(numPart).toBeLessThanOrEqual(999999);
    });
  });

  test('Property 1.6: Lead IDs remain immutable after creation', () => {
    const lead = db.createLead({
      studentName: 'Frank Miller',
      mobileNumber: '9876543260',
      mobileCountryCode: '91',
      email: 'frank@example.com',
      sourceCode: 'PARTNER_001',
    });

    const leadId = lead.leadId;

    // Update various lead fields
    db.updateLeadProfile(lead.leadId, {
      destinationCountry: 'USA',
    });

    db.updateLeadAcademic(lead.leadId, {
      ugGpa: 8.5,
    });

    const retrievedLead = db.getLead(lead.leadId);
    expect(retrievedLead?.leadId).toBe(leadId);
  });

  test('Invariant: FOR ALL leads, count(distinct lead_id) = count(leads)', () => {
    const leads = [];
    for (let i = 0; i < 20; i++) {
      const lead = db.createLead({
        studentName: `Bulk Student ${i}`,
        mobileNumber: `${9876544000 + i}`,
        mobileCountryCode: '91',
        email: `bulk${i}@example.com`,
        sourceCode: 'BULK_IMPORT',
      });
      leads.push(lead);
    }

    const uniqueIds = new Set(leads.map(l => l.leadId));
    expect(uniqueIds.size).toBe(leads.length);
  });
});
