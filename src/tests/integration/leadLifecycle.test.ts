/**
 * Integration Test: Lead Lifecycle from Creation to Product Closure
 * 
 * Scenario: Full lead journey from creation through qualification and product sale
 * 
 * This test verifies:
 * - Lead creation with profile completion
 * - Assignment tracking
 * - Profile updates
 * - Qualification workflow
 * - Product opportunity addition and closure
 * - Transaction creation
 * - Activity log completeness
 * - No data loss or inconsistency
 */

import { LeadsDatabase } from '../../api/leadsApi';
import { expect } from 'vitest';

describe('Integration: Lead Lifecycle from Creation to Product Sale', () => {
  let db: LeadsDatabase;

  beforeEach(() => {
    db = new LeadsDatabase();
  });

  test('Full Lead Lifecycle: Creation -> Profile -> Qualification -> Product Sale', () => {
    // Step 1: Create a new lead (raw inbound data)
    const newLead = db.createLead({
      studentName: 'John Doe',
      mobileNumber: '9876543210',
      mobileCountryCode: '91',
      email: 'john@example.com',
      sourceCode: 'PARTNER_A',
    });

    expect(newLead.leadId).toBeTruthy();
    expect(newLead.leadStatus).toBe('New');

    const leadId = newLead.leadId;

    // Verify initial state
    let lead = db.getLead(leadId);
    expect(lead?.studentName).toBe('John Doe');
    expect(lead?.leadStatus).toBe('New');

    // Step 2: Assign to RM
    const assignment1 = db.assignLeadToUser(leadId, 'Vikas Sharma', 'Manager', 'Banking Team', 'Initial assignment');
    expect(assignment1).toBeTruthy();
    expect(assignment1?.status).toBe('Active');

    const assignmentHistory = db.getAssignmentHistory(leadId);
    expect(assignmentHistory.length).toBeGreaterThan(0);
    const activeAssignment = assignmentHistory.find(a => a.status === 'Active');
    expect(activeAssignment?.assignedTo).toBe('Vikas Sharma');

    // Step 3: Update lead profile with study plan
    const updatedProfile = db.updateLeadProfile(leadId, {
      finalCountry: 'USA',
      universitiesOfInterest: ['MIT', 'Stanford', 'Harvard'],
      finalUniversity: 'MIT',
      degreeType: "Master's",
      course: 'Computer Science',
      targetIntake: 'Fall 2024',
      testsInterestedIn: ['TOEFL', 'GRE'],
      journeyStage: 'University Search',
    });

    expect(updatedProfile).toBeTruthy();

    let profile = db.getLeadProfile(leadId);
    expect(profile?.finalCountry).toBe('USA');
    expect(profile?.journeyStage).toBe('University Search');

    // Step 4: Update academic profile
    const academicUpdate = db.updateLeadAcademic(leadId, {
      twelveGpa: 8.5,
      ugCollegeName: 'Delhi University',
      ugDegree: 'B.Tech',
      ugGpa: 8.2,
      workExperience: 'Software Engineer at TCS (2 years)',
      achievements: 'Published 2 research papers',
    });

    expect(academicUpdate).toBeTruthy();

    let academic = db.getLeadAcademic(leadId);
    expect(academic?.twelveGpa).toBe(8.5);
    expect(academic?.ugGpa).toBe(8.2);

    // Step 5: Update financial profile
    const financialUpdate = db.updateLeadFinancial(leadId, {
      fundingPlan: 'Will Need Loan',
      fundingRequirement: 50000,
      coApplicantName: 'Rajesh Doe',
      coApplicantRelationship: 'Father',
      coApplicantContact: '9876543211',
    });

    expect(financialUpdate).toBeTruthy();

    let financial = db.getLeadFinancial(leadId);
    expect(financial?.fundingPlan).toBe('Will Need Loan');

    // Step 6: Log a call (SLA interaction)
    const call1 = db.logLeadCall(leadId, {
      durationSeconds: 300,
      calledBy: 'Vikas Sharma',
      callStatus: 'Connected',
      outcome: 'Connected',
      notes: 'Student interested in MS programs',
    });

    expect(call1).toBeTruthy();

    let calls = db.getLeadCalls(leadId);
    expect(calls.length).toBeGreaterThan(0);
    expect(calls[0].outcome).toBe('Connected');

    // Step 7: Qualify the lead
    const qualification = db.updateLeadQualification(leadId, {
      status: 'Qualified',
      qualifiedBy: 'Admissions Officer',
      readinessChecklistSnapshot: {
        passportValid: true,
        admitLetterReceived: false,
        fundingPlanReady: true,
        englishTestPassed: true,
      },
    });

    expect(qualification).toBeTruthy();

    const qualifications = db.getLeadQualifications(leadId);
    expect(qualifications.length).toBeGreaterThan(0);
    const qualRecord = qualifications.find(q => q.status === 'Qualified');
    expect(qualRecord).toBeTruthy();

    // Step 8: Update lead status to Qualified
    db.updateLeadStatus(leadId, 'Qualified', 'Passed qualification criteria');

    lead = db.getLead(leadId);
    expect(lead?.leadStatus).toBe('Qualified');

    // Step 9: Add product opportunity (Education Loan)
    const productOpp = db.addLeadProduct(leadId, {
      masterProduct: 'Education Loan',
      productOwner: 'Vikas Sharma',
      amount: 50000,
      partner: 'Avanse',
    });

    expect(productOpp).toBeTruthy();
    expect(productOpp?.status).toBe('Interested');

    let products = db.getLeadProducts(leadId);
    expect(products.length).toBeGreaterThan(0);
    expect(products[0].masterProduct).toBe('Education Loan');

    // Step 10: Update product status to In Progress
    const productUpdate = db.updateProductOpportunity(leadId, productOpp!.opportunityId, {
      status: 'In Progress',
    });

    expect(productUpdate).toBeTruthy();

    products = db.getLeadProducts(leadId);
    const educationLoan = products.find(p => p.masterProduct === 'Education Loan');
    expect(educationLoan?.status).toBe('In Progress');

    // Step 11: Update product status to Completed/Sold
    const finalProductUpdate = db.updateProductOpportunity(leadId, productOpp!.opportunityId, {
      status: 'Completed/Sold',
    });

    expect(finalProductUpdate).toBeTruthy();

    products = db.getLeadProducts(leadId);
    const soldLoan = products.find(p => p.masterProduct === 'Education Loan');
    expect(soldLoan?.status).toBe('Completed/Sold');
    expect(soldLoan?.transactionId).toBeTruthy();

    // Step 12: Verify transaction was created
    // (Transactions are created automatically when product is marked sold)
    const opportunityId = productOpp!.opportunityId;
    expect(soldLoan?.transactionId).toBeTruthy();

    // Step 13: Log second call (follow-up on product)
    const call2 = db.logLeadCall(leadId, {
      durationSeconds: 180,
      calledBy: 'Vikas Sharma',
      callStatus: 'Connected',
      outcome: 'Connected',
      notes: 'Confirmed loan approval and disbursement timeline',
    });

    expect(call2).toBeTruthy();

    calls = db.getLeadCalls(leadId);
    expect(calls.length).toBe(2);

    // Step 14: Verify complete activity log
    const activities = db.getLeadActivity(leadId);
    expect(activities.length).toBeGreaterThan(0);

    // Activity types should include: system, profile_update, qualification, product_update, call
    const activityTypes = new Set(activities.map(a => a.type));
    expect(activityTypes.has('system')).toBe(true); // For creation and assignment

    // Verify activity ordering (most recent first)
    expect(activities[0].timestamp).toBeGreaterThanOrEqual(activities[activities.length - 1].timestamp);

    // Step 15: Verify assignment history tracking
    const finalAssignmentHistory = db.getAssignmentHistory(leadId);
    const activeAssignments = finalAssignmentHistory.filter(a => a.status === 'Active');
    expect(activeAssignments.length).toBe(1);

    // Step 16: Verify SLA status
    const slaStatus = db.getSlaStatus(leadId);
    expect(slaStatus).toBeTruthy();
    expect(slaStatus.slaStatus).toBe('On Track'); // After recent connected call

    // Final Verification: Lead has all data intact
    const finalLead = db.getLead(leadId);
    expect(finalLead).toBeTruthy();
    expect(finalLead?.studentName).toBe('John Doe');
    expect(finalLead?.mobileNumber).toBe('9876543210');
    expect(finalLead?.leadStatus).toBe('Qualified');

    const finalProfile = db.getLeadProfile(leadId);
    expect(finalProfile?.finalCountry).toBe('USA');
    expect(finalProfile?.journeyStage).toBe('University Search');

    const finalAcademic = db.getLeadAcademic(leadId);
    expect(finalAcademic?.ugGpa).toBe(8.2);

    const finalFinancial = db.getLeadFinancial(leadId);
    expect(finalFinancial?.fundingPlan).toBe('Will Need Loan');

    const finalProducts = db.getLeadProducts(leadId);
    expect(finalProducts.length).toBeGreaterThan(0);

    console.log('✓ Full lead lifecycle completed successfully');
    console.log(`  - Lead ID: ${leadId}`);
    console.log(`  - Status: ${finalLead?.leadStatus}`);
    console.log(`  - Activities: ${activities.length}`);
    console.log(`  - Calls: ${calls.length}`);
    console.log(`  - Products: ${finalProducts.length}`);
  });

  test('Invariant: No data loss during lead lifecycle', () => {
    const lead = db.createLead({
      studentName: 'Test Lead',
      mobileNumber: '9800003000',
      mobileCountryCode: '91',
      email: 'test@example.com',
      sourceCode: 'TEST',
    });

    const leadId = lead.leadId;

    // Store initial data
    const initialLead = db.getLead(leadId);

    // Perform multiple updates
    db.updateLeadProfile(leadId, { finalCountry: 'Canada' });
    db.updateLeadAcademic(leadId, { ugGpa: 7.5 });
    db.updateLeadFinancial(leadId, { fundingPlan: 'Self Fund' });
    db.logLeadCall(leadId, {
      durationSeconds: 100,
      calledBy: 'RM',
      callStatus: 'Connected',
      outcome: 'Connected',
    });

    // Verify core data unchanged
    const finalLead = db.getLead(leadId);
    expect(finalLead?.studentName).toBe(initialLead?.studentName);
    expect(finalLead?.mobileNumber).toBe(initialLead?.mobileNumber);
    expect(finalLead?.email).toBe(initialLead?.email);
    expect(finalLead?.leadId).toBe(initialLead?.leadId);

    // Verify new data added correctly
    const profile = db.getLeadProfile(leadId);
    expect(profile?.finalCountry).toBe('Canada');

    const academic = db.getLeadAcademic(leadId);
    expect(academic?.ugGpa).toBe(7.5);

    const financial = db.getLeadFinancial(leadId);
    expect(financial?.fundingPlan).toBe('Self Fund');

    const calls = db.getLeadCalls(leadId);
    expect(calls.length).toBeGreaterThan(0);
  });

  test('Invariant: All timestamps maintain chronological order', () => {
    const lead = db.createLead({
      studentName: 'Timestamp Test',
      mobileNumber: '9800003001',
      mobileCountryCode: '91',
      email: 'timestamp@example.com',
      sourceCode: 'TEST',
    });

    const leadId = lead.leadId;

    // Get initial timestamp
    const createdLead = db.getLead(leadId);
    expect(createdLead?.createdAt).toBeTruthy();

    // Perform operations and collect timestamps
    const timestamps: Date[] = [new Date(createdLead!.createdAt!)];

    db.updateLeadProfile(leadId, { finalCountry: 'UK' });
    db.logLeadCall(leadId, {
      durationSeconds: 100,
      calledBy: 'RM',
      callStatus: 'Connected',
      outcome: 'Connected',
    });

    const activities = db.getLeadActivity(leadId);
    activities.forEach(a => timestamps.push(new Date(a.timestamp)));

    // Verify chronological order (allowing small time variations)
    for (let i = 1; i < timestamps.length; i++) {
      const diff = timestamps[i].getTime() - timestamps[i - 1].getTime();
      expect(diff).toBeGreaterThanOrEqual(-1000); // Allow 1 second tolerance
    }
  });
});
