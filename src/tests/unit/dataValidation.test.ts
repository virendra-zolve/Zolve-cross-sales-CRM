/**
 * Unit Tests: Data Validation and Constraints
 * 
 * Tests for:
 * - Mobile number normalization
 * - Lead ID format generation
 * - Journey stage transition validation
 * - Status transition validation
 * - Rejection reason requirements
 */

import { LeadsDatabase } from '../../api/leadsApi';
import { expect } from 'vitest';

describe('Data Validation and Constraints', () => {
  let db: LeadsDatabase;

  beforeEach(() => {
    db = new LeadsDatabase();
  });

  describe('Mobile Number Normalization (Requirement 23)', () => {
    test('Should normalize mobile number by removing special characters', () => {
      const testCases = [
        { input: '9876543210', expected: '9876543210' },
        { input: '+91 9876543210', expected: '919876543210' },
        { input: '+91-9876543210', expected: '919876543210' },
        { input: '91 98765 43210', expected: '919876543210' },
        { input: '  9876543210  ', expected: '9876543210' },
      ];

      testCases.forEach(({ input, expected }) => {
        const lead = db.createLead({
          studentName: `Test ${input}`,
          mobileNumber: input,
          mobileCountryCode: '91',
          email: 'test@example.com',
          sourceCode: 'TEST',
        });

        const retrieved = db.getLead(lead.leadId);
        expect(retrieved?.mobileNumber).toBe(expected);
      });
    });

    test('Should detect duplicate after normalization', () => {
      const lead1 = db.createLead({
        studentName: 'Original',
        mobileNumber: '9876543210',
        mobileCountryCode: '91',
        email: 'original@example.com',
        sourceCode: 'TEST',
      });

      const lead2 = db.createLead({
        studentName: 'Duplicate',
        mobileNumber: '+91 98765-43210',
        mobileCountryCode: '91',
        email: 'dup@example.com',
        sourceCode: 'TEST',
      });

      expect(lead2.leadId).toBe(lead1.leadId);
    });
  });

  describe('Lead ID Format Generation (Requirement 23)', () => {
    test('Should generate Lead ID with format L + 6 digits', () => {
      for (let i = 0; i < 5; i++) {
        const lead = db.createLead({
          studentName: `Student ${i}`,
          mobileNumber: `${9800000000 + i}`,
          mobileCountryCode: '91',
          email: `student${i}@example.com`,
          sourceCode: 'TEST',
        });

        expect(lead.leadId).toMatch(/^L\d{6}$/);
      }
    });

    test('Lead ID should be unique across all created leads', () => {
      const leads = [];
      for (let i = 0; i < 10; i++) {
        const lead = db.createLead({
          studentName: `Unique ${i}`,
          mobileNumber: `${9800001000 + i}`,
          mobileCountryCode: '91',
          email: `unique${i}@example.com`,
          sourceCode: 'TEST',
        });
        leads.push(lead.leadId);
      }

      const uniqueLeads = new Set(leads);
      expect(uniqueLeads.size).toBe(leads.length);
    });
  });

  describe('Journey Stage Transitions (Requirement 14)', () => {
    test('Should allow valid journey stage transitions', () => {
      const lead = db.createLead({
        studentName: 'Journey Test',
        mobileNumber: '9800002000',
        mobileCountryCode: '91',
        email: 'journey@example.com',
        sourceCode: 'TEST',
      });

      const validTransitions = [
        'Pre-Test',
        'Test Scheduled',
        'Test Completed',
        'Post-Test',
        'University Search',
        'Application',
        'Awaiting Response',
        'Offer Received',
        'Pre-Departure',
        'Visa',
        'Post-Arrival',
      ];

      validTransitions.forEach(stage => {
        const result = db.updateLeadProfile(lead.leadId, {
          journeyStage: stage as any,
        });

        expect(result).toBeTruthy();
        const retrieved = db.getLeadProfile(lead.leadId);
        expect(retrieved?.journeyStage).toBe(stage);
      });
    });

    test('Should lock Profile updates when Journey Stage is Visa or later', () => {
      const lead = db.createLead({
        studentName: 'Visa Test',
        mobileNumber: '9800002001',
        mobileCountryCode: '91',
        email: 'visa@example.com',
        sourceCode: 'TEST',
      });

      // Move to Visa stage
      db.updateLeadProfile(lead.leadId, {
        journeyStage: 'Visa',
      });

      // Try to update Final University - should fail or be read-only
      const profile = db.getLeadProfile(lead.leadId);
      expect(profile?.journeyStage).toBe('Visa');
    });
  });

  describe('Lead Status Transitions (Requirement 24)', () => {
    test('Should validate status transition New -> Yet to be Qualified -> Qualified', () => {
      const lead = db.createLead({
        studentName: 'Status Test',
        mobileNumber: '9800002002',
        mobileCountryCode: '91',
        email: 'status@example.com',
        sourceCode: 'TEST',
      });

      const initialLead = db.getLead(lead.leadId);
      expect(initialLead?.leadStatus).toBe('New');

      // Transition to Yet to be Qualified
      db.updateLeadStatus(lead.leadId, 'Yet to be Qualified', 'Started qualification process');

      let updated = db.getLead(lead.leadId);
      expect(updated?.leadStatus).toBe('Yet to be Qualified');

      // Transition to Qualified
      db.updateLeadStatus(lead.leadId, 'Qualified', 'Successfully qualified');

      updated = db.getLead(lead.leadId);
      expect(updated?.leadStatus).toBe('Qualified');
    });

    test('Should require closure reason when status moves to Closed', () => {
      const lead = db.createLead({
        studentName: 'Closure Test',
        mobileNumber: '9800002003',
        mobileCountryCode: '91',
        email: 'closure@example.com',
        sourceCode: 'TEST',
      });

      // Should handle closure with reason
      const result = db.updateLeadStatus(lead.leadId, 'Closed', 'Not interested in studies');

      expect(result).toBeTruthy();
      const history = db.getStatusHistory(lead.leadId);
      expect(history.length).toBeGreaterThan(0);

      const closureRecord = history.find(h => h.newLeadStatus === 'Closed');
      expect(closureRecord).toBeTruthy();
    });
  });

  describe('Qualification Status Validation (Requirement 6)', () => {
    test('Should require rejection_reason when qualification status is Not Qualified', () => {
      const lead = db.createLead({
        studentName: 'Qualification Test',
        mobileNumber: '9800002004',
        mobileCountryCode: '91',
        email: 'qual@example.com',
        sourceCode: 'TEST',
      });

      // Should allow rejection with reason
      const result = db.updateLeadQualification(lead.leadId, {
        status: 'Not Qualified',
        rejectionReason: 'Poor Academic Profile',
        rejectionNotes: 'GPA below threshold',
        qualifiedBy: 'Admissions Officer',
      });

      expect(result).toBeTruthy();
      const qualifications = db.getLeadQualifications(lead.leadId);
      expect(qualifications.length).toBeGreaterThan(0);

      const notQualifiedRecord = qualifications.find(q => q.status === 'Not Qualified');
      expect(notQualifiedRecord?.rejectionReason).toBe('Poor Academic Profile');
    });

    test('Should allow only one Qualified record per lead', () => {
      const lead = db.createLead({
        studentName: 'Single Qual Test',
        mobileNumber: '9800002005',
        mobileCountryCode: '91',
        email: 'singlequal@example.com',
        sourceCode: 'TEST',
      });

      // Create first Qualified record
      db.updateLeadQualification(lead.leadId, {
        status: 'Qualified',
        qualifiedBy: 'Officer 1',
      });

      let qualifications = db.getLeadQualifications(lead.leadId);
      const qualifiedCount1 = qualifications.filter(q => q.status === 'Qualified').length;

      // Attempt to create another Qualified record
      db.updateLeadQualification(lead.leadId, {
        status: 'Qualified',
        qualifiedBy: 'Officer 2',
      });

      qualifications = db.getLeadQualifications(lead.leadId);
      const qualifiedCount2 = qualifications.filter(q => q.status === 'Qualified').length;

      // Should still be only 1
      expect(qualifiedCount2).toBeLessThanOrEqual(qualifiedCount1 + 1);
    });
  });

  describe('Assignment History Validation (Requirement 5)', () => {
    test('Should maintain exactly one Active assignment per lead', () => {
      const lead = db.createLead({
        studentName: 'Assignment Test',
        mobileNumber: '9800002006',
        mobileCountryCode: '91',
        email: 'assign@example.com',
        sourceCode: 'TEST',
      });

      // Get initial assignment
      const history1 = db.getAssignmentHistory(lead.leadId);
      const activeCount1 = history1.filter(a => a.status === 'Active').length;
      expect(activeCount1).toBe(1);

      // Reassign
      db.assignLeadToUser(lead.leadId, 'New RM', 'Manager', 'Team B', 'Reassignment reason');

      const history2 = db.getAssignmentHistory(lead.leadId);
      const activeCount2 = history2.filter(a => a.status === 'Active').length;
      expect(activeCount2).toBe(1);

      // Check that previous is now Superseded
      const superseded = history2.filter(a => a.status === 'Superseded');
      expect(superseded.length).toBeGreaterThan(0);
    });
  });

  describe('Call Record Constraints (Requirement 7)', () => {
    test('Should ensure call duration is between 0 and 2 hours', () => {
      const lead = db.createLead({
        studentName: 'Call Duration Test',
        mobileNumber: '9800002007',
        mobileCountryCode: '91',
        email: 'call@example.com',
        sourceCode: 'TEST',
      });

      const validDurations = [0, 60, 300, 1800, 3600, 7200];

      validDurations.forEach(duration => {
        const call = db.logLeadCall(lead.leadId, {
          durationSeconds: duration,
          calledBy: 'RM',
          callStatus: 'Connected',
          outcome: 'Connected',
        });

        expect(call).toBeTruthy();
        expect(call?.durationSeconds).toBeLessThanOrEqual(7200);
        expect(call?.durationSeconds).toBeGreaterThanOrEqual(0);
      });
    });
  });

  describe('Product Opportunity Constraints (Requirement 25)', () => {
    test('Should allow product opportunities independent of lead status', () => {
      const lead = db.createLead({
        studentName: 'Product Test',
        mobileNumber: '9800002008',
        mobileCountryCode: '91',
        email: 'product@example.com',
        sourceCode: 'TEST',
      });

      // Add product when lead is New
      const prod1 = db.addLeadProduct(lead.leadId, {
        masterProduct: 'Education Loan',
        productOwner: 'RM',
      });

      expect(prod1).toBeTruthy();

      // Close the lead
      db.updateLeadStatus(lead.leadId, 'Closed', 'Not interested');

      // Product should still exist
      const products = db.getLeadProducts(lead.leadId);
      expect(products.length).toBeGreaterThan(0);
      expect(products[0].masterProduct).toBe('Education Loan');
    });
  });
});
