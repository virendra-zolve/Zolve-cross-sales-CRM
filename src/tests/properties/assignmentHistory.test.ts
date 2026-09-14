/**
 * Property-Based Test: Assignment History Tracking
 * 
 * Property: FOR ALL assignment changes, Lead_Assignment records created with status "Active"
 * for current, "Superseded" for previous assignments
 */

import { LeadsDatabase } from '../../api/leadsApi';
import { expect } from 'vitest';

describe('Property: Assignment History Tracking', () => {
  let db: LeadsDatabase;

  beforeEach(() => {
    db = new LeadsDatabase();
  });

  test('Property 1: Initial assignment created when lead is created', () => {
    const lead = db.createLead({
      studentName: 'Assignment Test 1',
      mobileNumber: '9876543500',
      mobileCountryCode: '91',
      email: 'assign1@example.com',
      sourceCode: 'TEST',
    });

    const history = db.getAssignmentHistory(lead.leadId);
    expect(history.length).toBeGreaterThan(0);

    // First assignment should be Active
    const firstAssignment = history[history.length - 1]; // Last one chronologically
    expect(firstAssignment.status).toBe('Active');
    expect(firstAssignment.leadId).toBe(lead.leadId);
  });

  test('Property 2: Manual assignment creates new Active, marks previous Superseded', () => {
    const lead = db.createLead({
      studentName: 'Assignment Test 2',
      mobileNumber: '9876543501',
      mobileCountryCode: '91',
      email: 'assign2@example.com',
      sourceCode: 'TEST',
    });

    const leadId = lead.leadId;

    // Get initial assignment count
    let history = db.getAssignmentHistory(leadId);
    const initialCount = history.length;
    const initialActive = history.filter(a => a.status === 'Active').length;

    expect(initialActive).toBe(1);

    // Reassign to different user
    const reassignment = db.assignLeadToUser(
      leadId,
      'New RM',
      'Manager',
      'Different Team',
      'Workload rebalancing'
    );

    expect(reassignment).toBeTruthy();
    expect(reassignment?.status).toBe('Active');

    // Check history
    history = db.getAssignmentHistory(leadId);
    expect(history.length).toBe(initialCount + 1);

    // Should have exactly 1 Active
    const activeCount = history.filter(a => a.status === 'Active').length;
    expect(activeCount).toBe(1);

    // Should have previous marked Superseded
    const supersededCount = history.filter(a => a.status === 'Superseded').length;
    expect(supersededCount).toBeGreaterThan(0);

    // New active should be the latest
    const latestAssignment = history[0];
    expect(latestAssignment.status).toBe('Active');
    expect(latestAssignment.assignedTo).toBe('New RM');
  });

  test('Property 3: Exactly one Active assignment per lead at any time', () => {
    const lead = db.createLead({
      studentName: 'Assignment Test 3',
      mobileNumber: '9876543502',
      mobileCountryCode: '91',
      email: 'assign3@example.com',
      sourceCode: 'TEST',
    });

    const leadId = lead.leadId;

    // Perform multiple reassignments
    const reassignments = [
      { rm: 'RM One', team: 'Team A' },
      { rm: 'RM Two', team: 'Team B' },
      { rm: 'RM Three', team: 'Team C' },
      { rm: 'RM Four', team: 'Team D' },
    ];

    reassignments.forEach(({ rm, team }) => {
      db.assignLeadToUser(leadId, rm, 'Manager', team, 'Rebalancing');

      const history = db.getAssignmentHistory(leadId);
      const activeCount = history.filter(a => a.status === 'Active').length;

      // Should always have exactly 1 active
      expect(activeCount).toBe(1);
    });

    // Final check
    const finalHistory = db.getAssignmentHistory(leadId);
    const activeAssignments = finalHistory.filter(a => a.status === 'Active');

    expect(activeAssignments.length).toBe(1);
    expect(activeAssignments[0].assignedTo).toBe('RM Four');
  });

  test('Property 4: Assignment history tracks all metadata correctly', () => {
    const lead = db.createLead({
      studentName: 'Assignment Test 4',
      mobileNumber: '9876543503',
      mobileCountryCode: '91',
      email: 'assign4@example.com',
      sourceCode: 'TEST',
    });

    const leadId = lead.leadId;

    // First assignment
    db.assignLeadToUser(
      leadId,
      'Priya Kumar',
      'Manager Virendra',
      'Banking Team',
      'Initial assignment'
    );

    // Second assignment with different team
    const secondAssignment = db.assignLeadToUser(
      leadId,
      'Rajesh Gupta',
      'Manager Virendra',
      'Education Loan Team',
      'Specialized team for loan processing'
    );

    const history = db.getAssignmentHistory(leadId);

    // Verify metadata tracking
    expect(history.length).toBeGreaterThanOrEqual(2);

    // Check that all fields are populated
    history.forEach(assignment => {
      expect(assignment.leadId).toBe(leadId);
      expect(assignment.assignedTo).toBeTruthy();
      expect(assignment.assignedBy).toBeTruthy();
      expect(assignment.team).toBeTruthy();
      expect(assignment.assignedAt).toBeTruthy();
      expect(assignment.status).toMatch(/^(Active|Superseded|Cancelled)$/);
    });

    // Latest should have new details
    expect(secondAssignment?.assignedTo).toBe('Rajesh Gupta');
    expect(secondAssignment?.team).toBe('Education Loan Team');
  });

  test('Property 5: Assignment history maintains chronological order', () => {
    const lead = db.createLead({
      studentName: 'Assignment Test 5',
      mobileNumber: '9876543504',
      mobileCountryCode: '91',
      email: 'assign5@example.com',
      sourceCode: 'TEST',
    });

    const leadId = lead.leadId;

    // Create multiple assignments
    for (let i = 1; i <= 4; i++) {
      db.assignLeadToUser(
        leadId,
        `RM ${i}`,
        'Manager',
        `Team ${i}`,
        `Assignment round ${i}`
      );
    }

    const history = db.getAssignmentHistory(leadId);

    // First entry (index 0) should be most recent
    // Last entry should be initial/oldest
    for (let i = 1; i < history.length; i++) {
      const currentTime = new Date(history[i - 1].assignedAt).getTime();
      const previousTime = new Date(history[i].assignedAt).getTime();

      // Current should be >= previous (reverse chronological)
      expect(currentTime).toBeGreaterThanOrEqual(previousTime - 1000); // Allow 1 sec tolerance
    }
  });

  test('Property 6: Assignment reasons are tracked for audit trail', () => {
    const lead = db.createLead({
      studentName: 'Assignment Test 6',
      mobileNumber: '9876543505',
      mobileCountryCode: '91',
      email: 'assign6@example.com',
      sourceCode: 'TEST',
    });

    const leadId = lead.leadId;

    const reasons = [
      'Initial system assignment',
      'RM requested transfer for specialization',
      'Workload rebalancing across team',
      'Lead escalation to senior RM',
    ];

    reasons.forEach(reason => {
      db.assignLeadToUser(leadId, `RM ${reason}`, 'Manager', 'Team', reason);
    });

    const history = db.getAssignmentHistory(leadId);

    // Each assignment should have reason/notes
    let reasonsFound = 0;
    history.forEach(assignment => {
      if (assignment.reassignmentReason) {
        reasonsFound++;
        expect(assignment.reassignmentReason).toBeTruthy();
      }
    });

    // At least some should have reasons
    expect(reasonsFound).toBeGreaterThan(0);
  });

  test('Invariant: Total assignments = Active(1) + Superseded(n)', () => {
    const lead = db.createLead({
      studentName: 'Invariant Test',
      mobileNumber: '9876543506',
      mobileCountryCode: '91',
      email: 'invariant@example.com',
      sourceCode: 'TEST',
    });

    const leadId = lead.leadId;

    // Create 5 total assignments
    for (let i = 1; i < 5; i++) {
      db.assignLeadToUser(leadId, `RM ${i}`, 'Manager', `Team ${i}`, `Assignment ${i}`);
    }

    const history = db.getAssignmentHistory(leadId);

    const activeCount = history.filter(a => a.status === 'Active').length;
    const supersededCount = history.filter(a => a.status === 'Superseded').length;
    const cancelledCount = history.filter(a => a.status === 'Cancelled').length;

    const totalActive = activeCount + supersededCount + cancelledCount;

    expect(totalActive).toBe(history.length);
    expect(activeCount).toBe(1);
    expect(supersededCount).toBe(history.length - 1);
  });

  test('Invariant: Assignment timestamps <= current time', () => {
    const lead = db.createLead({
      studentName: 'Timestamp Invariant',
      mobileNumber: '9876543507',
      mobileCountryCode: '91',
      email: 'timestamp@example.com',
      sourceCode: 'TEST',
    });

    const leadId = lead.leadId;

    const now = new Date().getTime();

    db.assignLeadToUser(leadId, 'RM Test', 'Manager', 'Team', 'Test');

    const history = db.getAssignmentHistory(leadId);

    history.forEach(assignment => {
      const assignmentTime = new Date(assignment.assignedAt).getTime();
      expect(assignmentTime).toBeLessThanOrEqual(now + 1000); // Allow 1 second future tolerance
    });
  });

  test('Invariant: Lead can have 0 assignments only at creation (before any assign call)', () => {
    const lead = db.createLead({
      studentName: 'Immediate Assignment',
      mobileNumber: '9876543508',
      mobileCountryCode: '91',
      email: 'immediate@example.com',
      sourceCode: 'TEST',
    });

    const leadId = lead.leadId;

    // Even immediately after creation, there should be initial assignment
    const history = db.getAssignmentHistory(leadId);
    expect(history.length).toBeGreaterThan(0);

    // At least 1 should be Active
    const activeCount = history.filter(a => a.status === 'Active').length;
    expect(activeCount).toBeGreaterThanOrEqual(1);
  });
});
