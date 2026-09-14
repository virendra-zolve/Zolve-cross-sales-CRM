// Lead Management System - API Implementation
// Phase 2 & 3: Core CRUD endpoints and advanced features

import {
  LeadMaster,
  LeadProfile,
  LeadAcademic,
  LeadFinancial,
  LeadAssignment,
  LeadQualification,
  LeadCall,
  LeadProductOpportunity,
  LeadTransaction,
  LeadDocument,
  LeadActivity,
  LeadPriorityRecord,
  LeadStatusHistory,
  ApiResponse,
  PaginatedResponse,
  NewLeadStatus,
  CallStatus,
  QualificationOutcome,
  ActivityType,
  NotQualifiedReason,
  LeadPriority,
} from '../types/normalized';
import { MasterProduct, ProductOpportunityStatus, FundingPlan, ClosureReason, LastCallOutcome } from '../types';

// ============================================================================
// SIMULATED DATABASE - In production, this would be a real database
// ============================================================================

class LeadsDatabase {
  private leadMasters: Map<string, LeadMaster> = new Map();
  private leadProfiles: Map<string, LeadProfile> = new Map();
  private leadAcademics: Map<string, LeadAcademic> = new Map();
  private leadFinancials: Map<string, LeadFinancial> = new Map();
  private leadAssignments: Map<string, LeadAssignment> = new Map();
  private leadQualifications: Map<string, LeadQualification> = new Map();
  private leadCalls: Map<string, LeadCall> = new Map();
  private leadProductOpportunities: Map<string, LeadProductOpportunity> = new Map();
  private leadTransactions: Map<string, LeadTransaction> = new Map();
  private leadDocuments: Map<string, LeadDocument> = new Map();
  private leadActivities: Map<string, LeadActivity> = new Map();
  private leadPriorities: Map<string, LeadPriorityRecord> = new Map();
  private leadStatusHistories: Map<string, LeadStatusHistory> = new Map();
  
  private leadIdCounter = 1000;
  private entityIdCounters: Record<string, number> = {};

  private generateId(prefix: string): string {
    if (!this.entityIdCounters[prefix]) {
      this.entityIdCounters[prefix] = 1;
    }
    return `${prefix}${this.entityIdCounters[prefix]++}`;
  }

  private generateLeadId(): string {
    return `L${String(this.leadIdCounter++).padStart(6, '0')}`;
  }

  // Normalize mobile number (digits only)
  private normalizeMobileNumber(mobile: string): string {
    return mobile.replace(/[^\d]/g, '');
  }

  // Check for duplicate by mobile number
  private findDuplicateLeadByMobile(mobile: string): LeadMaster | null {
    const normalized = this.normalizeMobileNumber(mobile);
    for (const lead of this.leadMasters.values()) {
      if (this.normalizeMobileNumber(lead.mobileNumber) === normalized) {
        return lead;
      }
    }
    return null;
  }

  // ========== PHASE 2: CORE CRUD ENDPOINTS ==========

  // Task 2.1: POST /api/leads - Create new lead
  createLead(data: {
    studentName: string;
    mobileNumber: string;
    mobileCountryCode: string;
    email?: string;
    sourceCode: string;
    partnerCode?: string;
    bdeCode?: string;
    destinationCountry: string;
    assignToSelf?: boolean;
    assignToUser?: string;
    assignToTeam?: string;
  }): { success: boolean; lead?: LeadMaster; duplicate?: LeadMaster; error?: string } {
    // Check for duplicates
    const existingLead = this.findDuplicateLeadByMobile(data.mobileNumber);
    if (existingLead) {
      // Create activity noting duplicate detection
      const activity: LeadActivity = {
        activityId: this.generateId('ACT'),
        leadId: existingLead.leadId,
        timestamp: new Date().toISOString(),
        actor: 'System',
        activityType: ActivityType.System,
        title: 'Duplicate Lead Detection',
        description: `Duplicate submission detected with mobile: ${data.mobileNumber}`,
        createdAt: new Date().toISOString(),
      };
      this.leadActivities.set(activity.activityId, activity);
      return { success: false, duplicate: existingLead };
    }

    const leadId = this.generateLeadId();
    const now = new Date().toISOString();

    // Create Lead_Master
    const leadMaster: LeadMaster = {
      leadId,
      studentName: data.studentName,
      mobileNumber: this.normalizeMobileNumber(data.mobileNumber),
      mobileCountryCode: data.mobileCountryCode || '91',
      email: data.email,
      sourceCode: data.sourceCode,
      partnerCode: data.partnerCode,
      bdeCode: data.bdeCode,
      currentLeadStatus: NewLeadStatus.New,
      qualificationStatus: QualificationOutcome.Pending,
      noOfAttempts: 0,
      callingStatus: CallStatus.NotAttempted,
      lastActionAt: now,
      noActionSince: now,
      slaStatus: 'Within SLA',
      escalationStatus: 'Not Escalated',
      kpiStatus: 'On Track',
      createdAt: now,
      updatedAt: now,
      signupStatus: 'Not Signed Up',
    };

    // Create Lead_Profile
    const leadProfile: LeadProfile = {
      profileId: this.generateId('PROF'),
      leadId,
      destinationCountries: [data.destinationCountry],
      finalCountry: undefined,
      journeyStage: 'Unknown',
      universitiesOfInterest: [],
      testsInterestedIn: [],
      readinessChecklist: {
        passportValid: false,
        admitLetterReceived: false,
        fundingPlanReady: false,
        englishTestPassed: false,
      },
      createdAt: now,
      updatedAt: now,
      updatedBy: 'System',
    };

    // Create Lead_Academic
    const leadAcademic: LeadAcademic = {
      academicId: this.generateId('ACAD'),
      leadId,
      createdAt: now,
      updatedAt: now,
    };

    // Create Lead_Financial
    const leadFinancial: LeadFinancial = {
      financialId: this.generateId('FIN'),
      leadId,
      fundingPlan: 'Unknown',
      createdAt: now,
      updatedAt: now,
    };

    // Create initial assignment
    const assignment: LeadAssignment = {
      assignmentId: this.generateId('AS'),
      leadId,
      assignedTo: data.assignToUser || 'Unassigned',
      assignedBy: data.assignToUser ? 'System Auto-Router' : 'Manual',
      team: data.assignToTeam || 'Unassigned',
      assignedAt: now,
      status: 'Active',
      createdAt: now,
    };

    // Store all records
    this.leadMasters.set(leadId, leadMaster);
    this.leadProfiles.set(leadProfile.profileId, leadProfile);
    this.leadAcademics.set(leadAcademic.academicId, leadAcademic);
    this.leadFinancials.set(leadFinancial.financialId, leadFinancial);
    this.leadAssignments.set(assignment.assignmentId, assignment);
    leadMaster.currentLeadOwner = assignment.assignedTo;
    leadMaster.currentLeadOwnerTeam = assignment.team;
    leadMaster.leadAssignedAt = now;
    leadMaster.leadAssignedBy = 'System';

    // Create activity
    const activity: LeadActivity = {
      activityId: this.generateId('ACT'),
      leadId,
      timestamp: now,
      actor: 'System',
      activityType: ActivityType.System,
      title: 'Lead Created',
      description: `New lead created: ${data.studentName} from ${data.sourceCode}`,
      createdAt: now,
    };
    this.leadActivities.set(activity.activityId, activity);

    return { success: true, lead: leadMaster };
  }

  // Task 2.2: GET /api/leads/:id
  getLead(leadId: string): LeadMaster | null {
    return this.leadMasters.get(leadId) || null;
  }

  // Task 2.3: GET /api/leads/:id/profile
  getLeadProfile(leadId: string): LeadProfile | null {
    for (const profile of this.leadProfiles.values()) {
      if (profile.leadId === leadId) return profile;
    }
    return null;
  }

  // Task 2.4: PUT /api/leads/:id/profile
  updateLeadProfile(leadId: string, updates: Partial<LeadProfile>): LeadProfile | null {
    const profile = this.getLeadProfile(leadId);
    if (!profile) return null;

    const updated: LeadProfile = { ...profile, ...updates, updatedAt: new Date().toISOString() };
    this.leadProfiles.set(profile.profileId, updated);

    // Create activity
    const activity: LeadActivity = {
      activityId: this.generateId('ACT'),
      leadId,
      timestamp: new Date().toISOString(),
      actor: updates.updatedBy || 'User',
      activityType: ActivityType.ProfileUpdate,
      title: 'Profile Updated',
      description: `Study plan updated for lead ${leadId}`,
      createdAt: new Date().toISOString(),
    };
    this.leadActivities.set(activity.activityId, activity);

    return updated;
  }

  // Task 2.5: GET /api/leads/:id/academic
  getLeadAcademic(leadId: string): LeadAcademic | null {
    for (const academic of this.leadAcademics.values()) {
      if (academic.leadId === leadId) return academic;
    }
    return null;
  }

  // Task 2.6: PUT /api/leads/:id/academic
  updateLeadAcademic(leadId: string, updates: Partial<LeadAcademic>): LeadAcademic | null {
    const academic = this.getLeadAcademic(leadId);
    if (!academic) return null;

    const updated: LeadAcademic = { ...academic, ...updates, updatedAt: new Date().toISOString() };
    this.leadAcademics.set(academic.academicId, updated);

    const activity: LeadActivity = {
      activityId: this.generateId('ACT'),
      leadId,
      timestamp: new Date().toISOString(),
      actor: updates.updatedBy || 'User',
      activityType: ActivityType.ProfileUpdate,
      title: 'Academic Background Updated',
      description: `Academic profile updated`,
      createdAt: new Date().toISOString(),
    };
    this.leadActivities.set(activity.activityId, activity);

    return updated;
  }

  // Task 2.7: GET /api/leads/:id/financial
  getLeadFinancial(leadId: string): LeadFinancial | null {
    for (const financial of this.leadFinancials.values()) {
      if (financial.leadId === leadId) return financial;
    }
    return null;
  }

  // Task 2.8: PUT /api/leads/:id/financial
  updateLeadFinancial(leadId: string, updates: Partial<LeadFinancial>): LeadFinancial | null {
    const financial = this.getLeadFinancial(leadId);
    if (!financial) return null;

    const updated: LeadFinancial = { ...financial, ...updates, updatedAt: new Date().toISOString() };
    this.leadFinancials.set(financial.financialId, updated);

    const activity: LeadActivity = {
      activityId: this.generateId('ACT'),
      leadId,
      timestamp: new Date().toISOString(),
      actor: updates.updatedBy || 'User',
      activityType: ActivityType.ProfileUpdate,
      title: 'Financial Profile Updated',
      description: `Funding and co-applicant info updated`,
      createdAt: new Date().toISOString(),
    };
    this.leadActivities.set(activity.activityId, activity);

    return updated;
  }

  // Task 2.9: GET /api/leads/:id/calls
  getLeadCalls(leadId: string): LeadCall[] {
    const calls: LeadCall[] = [];
    for (const call of this.leadCalls.values()) {
      if (call.leadId === leadId) calls.push(call);
    }
    return calls.sort((a, b) => new Date(b.calledAt).getTime() - new Date(a.calledAt).getTime());
  }

  // Task 2.10: POST /api/leads/:id/calls
  logLeadCall(
    leadId: string,
    data: {
      calledBy: string;
      durationSeconds: number;
      callOutcome: LastCallOutcome | string;
      callNotes?: string;
      scheduledNextCallAt?: string;
    }
  ): { success: boolean; call?: LeadCall; slaBreached?: boolean } {
    const lead = this.getLead(leadId);
    if (!lead) return { success: false };

    // Get current assignment
    let assignmentId = '';
    let attemptNumber = 1;
    for (const assignment of this.leadAssignments.values()) {
      if (assignment.leadId === leadId && assignment.status === 'Active') {
        assignmentId = assignment.assignmentId;
        // Count attempts for this assignment
        let count = 1;
        for (const call of this.leadCalls.values()) {
          if (call.leadId === leadId && call.assignmentId === assignmentId) {
            count++;
          }
        }
        attemptNumber = count;
        break;
      }
    }

    const now = new Date().toISOString();
    const call: LeadCall = {
      callId: this.generateId('CALL'),
      leadId,
      assignmentId: assignmentId || this.generateId('AS'),
      calledBy: data.calledBy,
      calledAt: now,
      durationSeconds: data.durationSeconds,
      attemptNumber,
      callStatus: data.callOutcome === 'Connected' ? CallStatus.Connected : CallStatus.RNR,
      callOutcome: data.callOutcome,
      callNotes: data.callNotes,
      scheduledNextCallAt: data.scheduledNextCallAt,
      createdAt: now,
    };

    this.leadCalls.set(call.callId, call);

    // Update Lead_Master
    lead.noOfAttempts++;
    lead.lastCallAt = now;
    lead.lastCallOutcome = data.callOutcome as LastCallOutcome;
    lead.callingStatus = CallStatus.Connected;
    lead.lastActionAt = now;
    lead.lastActionBy = data.calledBy;
    if (data.scheduledNextCallAt) {
      lead.nextCallAt = data.scheduledNextCallAt;
    }

    // Check SLA: if connected, reset SLA due to 48 hours
    let slaBreached = false;
    if (data.callOutcome === 'Connected') {
      lead.slaStatus = 'Within SLA';
      lead.kpiStatus = 'On Track';
    } else {
      // Check if 48 hours have passed since last meaningful action
      const lastMeaningfulAction = new Date(lead.lastActionAt);
      const now_date = new Date();
      const hoursElapsed = (now_date.getTime() - lastMeaningfulAction.getTime()) / (1000 * 60 * 60);
      if (hoursElapsed > 48) {
        lead.slaStatus = 'Breached';
        lead.kpiStatus = 'Overdue';
        lead.escalationStatus = 'Escalated';
        slaBreached = true;
      }
    }

    // Create activity
    const activity: LeadActivity = {
      activityId: this.generateId('ACT'),
      leadId,
      timestamp: now,
      actor: data.calledBy,
      activityType: ActivityType.Call,
      title: `Call Logged: ${data.callOutcome}`,
      description: `Call outcome: ${data.callOutcome}, Duration: ${data.durationSeconds}s`,
      relatedId: call.callId,
      createdAt: now,
    };
    this.leadActivities.set(activity.activityId, activity);

    if (slaBreached) {
      const escalationActivity: LeadActivity = {
        activityId: this.generateId('ACT'),
        leadId,
        timestamp: now,
        actor: 'System Escalation',
        activityType: ActivityType.System,
        title: 'SLA Breached - Escalated',
        description: `Lead has exceeded 48-hour SLA. Escalated to manager.`,
        createdAt: now,
      };
      this.leadActivities.set(escalationActivity.activityId, escalationActivity);
    }

    return { success: true, call, slaBreached };
  }

  // Task 2.11: GET /api/leads/:id/products
  getLeadProducts(leadId: string): LeadProductOpportunity[] {
    const products: LeadProductOpportunity[] = [];
    for (const product of this.leadProductOpportunities.values()) {
      if (product.leadId === leadId) products.push(product);
    }
    return products;
  }

  // Task 2.12: POST /api/leads/:id/products
  addLeadProduct(
    leadId: string,
    data: {
      masterProduct: MasterProduct;
      productOwner?: string;
      amount?: string;
      partner?: string;
    }
  ): LeadProductOpportunity | null {
    const lead = this.getLead(leadId);
    if (!lead) return null;

    const now = new Date().toISOString();
    const opportunity: LeadProductOpportunity = {
      opportunityId: this.generateId('PO'),
      leadId,
      masterProduct: data.masterProduct,
      status: 'Interested',
      productOwner: data.productOwner || lead.currentLeadOwner,
      amount: data.amount,
      partner: data.partner,
      createdAt: now,
      updatedAt: now,
    };

    this.leadProductOpportunities.set(opportunity.opportunityId, opportunity);

    const activity: LeadActivity = {
      activityId: this.generateId('ACT'),
      leadId,
      timestamp: now,
      actor: 'System',
      activityType: ActivityType.ProductUpdate,
      title: `Product Added: ${data.masterProduct}`,
      description: `Product opportunity created for ${data.masterProduct}`,
      relatedId: opportunity.opportunityId,
      createdAt: now,
    };
    this.leadActivities.set(activity.activityId, activity);

    return opportunity;
  }

  // Task 2.13: PUT /api/leads/:id/products/:opportunityId
  updateProductOpportunity(
    leadId: string,
    opportunityId: string,
    updates: Partial<LeadProductOpportunity>
  ): LeadProductOpportunity | null {
    const opportunity = this.leadProductOpportunities.get(opportunityId);
    if (!opportunity || opportunity.leadId !== leadId) return null;

    const updated: LeadProductOpportunity = { ...opportunity, ...updates, updatedAt: new Date().toISOString() };
    this.leadProductOpportunities.set(opportunityId, updated);

    // If sold, create transaction
    if (updates.status === 'Completed / Sold') {
      const now = new Date().toISOString();
      const transaction: LeadTransaction = {
        transactionId: this.generateId('TXN'),
        leadId,
        opportunityId,
        masterProduct: opportunity.masterProduct,
        transactionAmount: opportunity.amount ? parseInt(opportunity.amount) : undefined,
        transactionDate: now,
        transactionStatus: 'Completed',
        partner: opportunity.partner,
        createdAt: now,
      };
      this.leadTransactions.set(transaction.transactionId, transaction);
      updated.transactionId = transaction.transactionId;

      const txnActivity: LeadActivity = {
        activityId: this.generateId('ACT'),
        leadId,
        timestamp: now,
        actor: 'System',
        activityType: ActivityType.ProductUpdate,
        title: 'Product Sold',
        description: `${opportunity.masterProduct} marked as sold`,
        relatedId: transaction.transactionId,
        createdAt: now,
      };
      this.leadActivities.set(txnActivity.activityId, txnActivity);
    }

    return updated;
  }

  // Task 2.14: GET /api/leads/:id/documents
  getLeadDocuments(leadId: string): LeadDocument[] {
    const docs: LeadDocument[] = [];
    for (const doc of this.leadDocuments.values()) {
      if (doc.leadId === leadId) docs.push(doc);
    }
    return docs.sort((a, b) => new Date(b.uploadedAt).getTime() - new Date(a.uploadedAt).getTime());
  }

  // Task 2.15: POST /api/leads/:id/documents
  uploadLeadDocument(
    leadId: string,
    data: {
      fileName: string;
      fileSize?: number;
      fileFormat: string;
      documentType: string;
      filePath: string;
      uploadedBy: string;
    }
  ): LeadDocument | null {
    const lead = this.getLead(leadId);
    if (!lead) return null;

    const now = new Date().toISOString();
    const document: LeadDocument = {
      documentId: this.generateId('DOC'),
      leadId,
      fileName: data.fileName,
      fileSize: data.fileSize,
      fileFormat: data.fileFormat,
      documentType: data.documentType,
      filePath: data.filePath,
      uploadedBy: data.uploadedBy,
      uploadedAt: now,
      sharingStatus: 'Not Shared',
      createdAt: now,
      updatedAt: now,
    };

    this.leadDocuments.set(document.documentId, document);

    const activity: LeadActivity = {
      activityId: this.generateId('ACT'),
      leadId,
      timestamp: now,
      actor: data.uploadedBy,
      activityType: ActivityType.DocumentUpload,
      title: 'Document Uploaded',
      description: `${data.fileName} uploaded`,
      relatedId: document.documentId,
      createdAt: now,
    };
    this.leadActivities.set(activity.activityId, activity);

    return document;
  }

  // Task 2.16: PUT /api/leads/:id/documents/:documentId
  shareLeadDocument(leadId: string, documentId: string, sharedWith?: string): LeadDocument | null {
    const doc = this.leadDocuments.get(documentId);
    if (!doc || doc.leadId !== leadId) return null;

    const now = new Date().toISOString();
    doc.sharingStatus = 'Shared';
    doc.sharedWith = sharedWith;
    doc.sharedAt = now;
    doc.updatedAt = now;

    return doc;
  }

  // Task 2.17: GET /api/leads/:id/activity
  getLeadActivity(leadId: string): LeadActivity[] {
    const activities: LeadActivity[] = [];
    for (const activity of this.leadActivities.values()) {
      if (activity.leadId === leadId) activities.push(activity);
    }
    return activities.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  }

  // ========== PHASE 3: ADVANCED FEATURES ==========

  // Task 3.1: POST /api/leads/:id/assign
  assignLeadToUser(
    leadId: string,
    data: {
      assignedTo: string;
      team: string;
      assignedBy: string;
      reason?: string;
    }
  ): LeadAssignment | null {
    const lead = this.getLead(leadId);
    if (!lead) return null;

    const now = new Date().toISOString();

    // Mark previous assignment as superseded
    for (const assignment of this.leadAssignments.values()) {
      if (assignment.leadId === leadId && assignment.status === 'Active') {
        assignment.status = 'Superseded';
        assignment.reassignedAt = now;
      }
    }

    // Create new assignment
    const newAssignment: LeadAssignment = {
      assignmentId: this.generateId('AS'),
      leadId,
      assignedTo: data.assignedTo,
      assignedBy: data.assignedBy,
      team: data.team,
      assignedAt: now,
      reassignmentReason: data.reason,
      status: 'Active',
      createdAt: now,
    };

    this.leadAssignments.set(newAssignment.assignmentId, newAssignment);

    // Update Lead_Master
    lead.currentLeadOwner = data.assignedTo;
    lead.currentLeadOwnerTeam = data.team;
    lead.leadAssignedAt = now;
    lead.leadAssignedBy = data.assignedBy;
    lead.lastActionAt = now;
    lead.lastActionBy = data.assignedBy;

    // Reset calling fields for new RM
    lead.noOfAttempts = 0;
    lead.callingStatus = CallStatus.NotAttempted;
    lead.lastCallAt = undefined;
    lead.lastCallOutcome = undefined;
    lead.nextCallAt = undefined;

    // Create activity
    const activity: LeadActivity = {
      activityId: this.generateId('ACT'),
      leadId,
      timestamp: now,
      actor: data.assignedBy,
      activityType: ActivityType.Assignment,
      title: `Lead Assigned to ${data.assignedTo}`,
      description: `Reassigned from previous owner to ${data.assignedTo} in ${data.team}. Reason: ${data.reason || 'Manual reallocation'}`,
      relatedId: newAssignment.assignmentId,
      createdAt: now,
    };
    this.leadActivities.set(activity.activityId, activity);

    return newAssignment;
  }

  // Task 3.2: GET /api/leads/:id/assignment-history
  getAssignmentHistory(leadId: string): LeadAssignment[] {
    const assignments: LeadAssignment[] = [];
    for (const assignment of this.leadAssignments.values()) {
      if (assignment.leadId === leadId) assignments.push(assignment);
    }
    return assignments.sort((a, b) => new Date(b.assignedAt).getTime() - new Date(a.assignedAt).getTime());
  }

  // Task 3.3: PUT /api/leads/:id/qualification
  updateLeadQualification(
    leadId: string,
    data: {
      status: QualificationOutcome;
      notQualifiedReason?: NotQualifiedReason;
      qualificationNotes?: string;
      qualifiedBy: string;
    }
  ): { success: boolean; qualification?: LeadQualification } {
    const lead = this.getLead(leadId);
    if (!lead) return { success: false };

    if (data.status === 'Not Qualified' && !data.notQualifiedReason) {
      return { success: false };
    }

    const now = new Date().toISOString();
    const qualification: LeadQualification = {
      qualificationId: this.generateId('QUAL'),
      leadId,
      status: data.status,
      notQualifiedReason: data.notQualifiedReason,
      qualificationNotes: data.qualificationNotes,
      qualifiedBy: data.qualifiedBy,
      startedAt: now,
      completedAt: now,
      createdAt: now,
    };

    this.leadQualifications.set(qualification.qualificationId, qualification);

    // Update Lead_Master
    lead.qualificationStatus = data.status;
    lead.qualifiedBy = data.qualifiedBy;
    lead.qualificationCompletedAt = now;
    lead.currentLeadStatus = data.status === 'Qualified' ? NewLeadStatus.Qualified : NewLeadStatus.Closed;
    lead.lastActionAt = now;
    lead.lastActionBy = data.qualifiedBy;

    // Create activity
    const activity: LeadActivity = {
      activityId: this.generateId('ACT'),
      leadId,
      timestamp: now,
      actor: data.qualifiedBy,
      activityType: ActivityType.Qualification,
      title: `Qualification: ${data.status}`,
      description: data.status === 'Not Qualified' 
        ? `Lead not qualified. Reason: ${data.notQualifiedReason}`
        : `Lead qualified successfully`,
      createdAt: now,
    };
    this.leadActivities.set(activity.activityId, activity);

    return { success: true, qualification };
  }

  // Task 3.4: GET /api/leads/:id/qualification
  getLeadQualifications(leadId: string): LeadQualification[] {
    const qualifications: LeadQualification[] = [];
    for (const q of this.leadQualifications.values()) {
      if (q.leadId === leadId) qualifications.push(q);
    }
    return qualifications.sort((a, b) => new Date(b.completedAt || b.createdAt).getTime() - new Date(a.completedAt || a.createdAt).getTime());
  }

  // Task 3.5: POST /api/leads/:id/priority
  setLeadPriority(
    leadId: string,
    data: {
      priorityLevel: LeadPriority;
      reason?: string;
      setBy: string;
    }
  ): LeadPriorityRecord | null {
    const lead = this.getLead(leadId);
    if (!lead) return null;

    const now = new Date().toISOString();

    // Mark previous priority as superseded
    for (const priority of this.leadPriorities.values()) {
      if (priority.leadId === leadId && priority.status === 'Active') {
        priority.status = 'Superseded';
      }
    }

    // Create new priority
    const priority: LeadPriorityRecord = {
      priorityId: this.generateId('PRI'),
      leadId,
      priorityLevel: data.priorityLevel,
      reason: data.reason,
      setBy: data.setBy,
      setAt: now,
      status: 'Active',
      createdAt: now,
    };

    this.leadPriorities.set(priority.priorityId, priority);

    // Create activity
    const activity: LeadActivity = {
      activityId: this.generateId('ACT'),
      leadId,
      timestamp: now,
      actor: data.setBy,
      activityType: ActivityType.System,
      title: `Priority Set: ${data.priorityLevel}`,
      description: `Lead priority changed to ${data.priorityLevel}. Reason: ${data.reason || 'Not specified'}`,
      createdAt: now,
    };
    this.leadActivities.set(activity.activityId, activity);

    return priority;
  }

  // Task 3.6: GET /api/leads/:id/priority-history
  getPriorityHistory(leadId: string): LeadPriorityRecord[] {
    const priorities: LeadPriorityRecord[] = [];
    for (const p of this.leadPriorities.values()) {
      if (p.leadId === leadId) priorities.push(p);
    }
    return priorities.sort((a, b) => new Date(b.setAt).getTime() - new Date(a.setAt).getTime());
  }

  // Task 3.7: PUT /api/leads/:id/status
  updateLeadStatus(
    leadId: string,
    data: {
      newStatus: NewLeadStatus;
      closureReason?: ClosureReason;
      closureNotes?: string;
      changedBy: string;
    }
  ): { success: boolean; lead?: LeadMaster } {
    const lead = this.getLead(leadId);
    if (!lead) return { success: false };

    // Validate transition
    const validTransitions: Record<NewLeadStatus, NewLeadStatus[]> = {
      [NewLeadStatus.New]: [NewLeadStatus.YetToBeQualified],
      [NewLeadStatus.YetToBeQualified]: [NewLeadStatus.Qualified, NewLeadStatus.Closed],
      [NewLeadStatus.Qualified]: [NewLeadStatus.InProgress, NewLeadStatus.OnHold, NewLeadStatus.Closed],
      [NewLeadStatus.InProgress]: [NewLeadStatus.OnHold, NewLeadStatus.Closed],
      [NewLeadStatus.OnHold]: [NewLeadStatus.InProgress, NewLeadStatus.Closed],
      [NewLeadStatus.Closed]: [NewLeadStatus.Archived],
      [NewLeadStatus.Archived]: [],
    };

    if (!validTransitions[lead.currentLeadStatus]?.includes(data.newStatus)) {
      return { success: false };
    }

    const now = new Date().toISOString();

    // Update status
    lead.currentLeadStatus = data.newStatus;
    lead.lastActionAt = now;
    lead.lastActionBy = data.changedBy;

    if (data.newStatus === NewLeadStatus.Closed) {
      lead.closureReason = data.closureReason;
      lead.closedAt = now;
      lead.closedBy = data.changedBy;
      lead.closureNotes = data.closureNotes;
    }

    // Create status history
    const history: LeadStatusHistory = {
      historyId: this.generateId('HIST'),
      leadId,
      previousStatus: lead.currentLeadStatus,
      newStatus: data.newStatus,
      changedBy: data.changedBy,
      changedAt: now,
      createdAt: now,
    };
    this.leadStatusHistories.set(history.historyId, history);

    // Create activity
    const activity: LeadActivity = {
      activityId: this.generateId('ACT'),
      leadId,
      timestamp: now,
      actor: data.changedBy,
      activityType: ActivityType.System,
      title: `Status Changed: ${data.newStatus}`,
      description: `Lead status changed to ${data.newStatus}`,
      createdAt: now,
    };
    this.leadActivities.set(activity.activityId, activity);

    return { success: true, lead };
  }

  // Task 3.8: GET /api/leads/:id/status-history
  getStatusHistory(leadId: string): LeadStatusHistory[] {
    const histories: LeadStatusHistory[] = [];
    for (const h of this.leadStatusHistories.values()) {
      if (h.leadId === leadId) histories.push(h);
    }
    return histories.sort((a, b) => new Date(b.changedAt).getTime() - new Date(a.changedAt).getTime());
  }

  // Task 3.9: POST /api/leads/check-duplicate
  checkDuplicate(mobileNumber: string): LeadMaster | null {
    return this.findDuplicateLeadByMobile(mobileNumber);
  }

  // Task 3.10: GET /api/leads/:id/sla-status
  getSlaStatus(leadId: string): {
    slaStatus: string;
    timeRemainingHours: number;
    escalationRequired: boolean;
    priority: LeadPriority | null;
  } | null {
    const lead = this.getLead(leadId);
    if (!lead) return null;

    // Get current priority
    let currentPriority: LeadPriority | null = null;
    for (const p of this.leadPriorities.values()) {
      if (p.leadId === leadId && p.status === 'Active') {
        currentPriority = p.priorityLevel;
        break;
      }
    }

    // Calculate SLA
    const slaStartTime = lead.lastCallAt ? new Date(lead.lastCallAt) : new Date(lead.createdAt);
    const slaDueTime = new Date(slaStartTime.getTime() + 48 * 60 * 60 * 1000);
    const now = new Date();
    const timeRemainingMs = slaDueTime.getTime() - now.getTime();
    const timeRemainingHours = Math.max(0, timeRemainingMs / (1000 * 60 * 60));

    const escalationRequired = timeRemainingHours <= 0;

    return {
      slaStatus: lead.slaStatus,
      timeRemainingHours: parseFloat(timeRemainingHours.toFixed(2)),
      escalationRequired,
      priority: currentPriority,
    };
  }
}

// ============================================================================
// SINGLETON DATABASE INSTANCE
// ============================================================================

const leadsDb = new LeadsDatabase();

// ============================================================================
// API INTERFACE - Exported for use in components
// ============================================================================

export const leadsApi = {
  // Phase 2: Core CRUD
  createLead: (data: Parameters<typeof leadsDb.createLead>[0]) => leadsDb.createLead(data),
  getLead: (leadId: string) => leadsDb.getLead(leadId),
  getLeadProfile: (leadId: string) => leadsDb.getLeadProfile(leadId),
  updateLeadProfile: (leadId: string, updates: any) => leadsDb.updateLeadProfile(leadId, updates),
  getLeadAcademic: (leadId: string) => leadsDb.getLeadAcademic(leadId),
  updateLeadAcademic: (leadId: string, updates: any) => leadsDb.updateLeadAcademic(leadId, updates),
  getLeadFinancial: (leadId: string) => leadsDb.getLeadFinancial(leadId),
  updateLeadFinancial: (leadId: string, updates: any) => leadsDb.updateLeadFinancial(leadId, updates),
  getLeadCalls: (leadId: string) => leadsDb.getLeadCalls(leadId),
  logLeadCall: (leadId: string, data: any) => leadsDb.logLeadCall(leadId, data),
  getLeadProducts: (leadId: string) => leadsDb.getLeadProducts(leadId),
  addLeadProduct: (leadId: string, data: any) => leadsDb.addLeadProduct(leadId, data),
  updateProductOpportunity: (leadId: string, opportunityId: string, updates: any) => leadsDb.updateProductOpportunity(leadId, opportunityId, updates),
  getLeadDocuments: (leadId: string) => leadsDb.getLeadDocuments(leadId),
  uploadLeadDocument: (leadId: string, data: any) => leadsDb.uploadLeadDocument(leadId, data),
  shareLeadDocument: (leadId: string, documentId: string, sharedWith?: string) => leadsDb.shareLeadDocument(leadId, documentId, sharedWith),
  getLeadActivity: (leadId: string) => leadsDb.getLeadActivity(leadId),

  // Phase 3: Advanced Features
  assignLeadToUser: (leadId: string, data: any) => leadsDb.assignLeadToUser(leadId, data),
  getAssignmentHistory: (leadId: string) => leadsDb.getAssignmentHistory(leadId),
  updateLeadQualification: (leadId: string, data: any) => leadsDb.updateLeadQualification(leadId, data),
  getLeadQualifications: (leadId: string) => leadsDb.getLeadQualifications(leadId),
  setLeadPriority: (leadId: string, data: any) => leadsDb.setLeadPriority(leadId, data),
  getPriorityHistory: (leadId: string) => leadsDb.getPriorityHistory(leadId),
  updateLeadStatus: (leadId: string, data: any) => leadsDb.updateLeadStatus(leadId, data),
  getStatusHistory: (leadId: string) => leadsDb.getStatusHistory(leadId),
  checkDuplicate: (mobileNumber: string) => leadsDb.checkDuplicate(mobileNumber),
  getSlaStatus: (leadId: string) => leadsDb.getSlaStatus(leadId),
};
