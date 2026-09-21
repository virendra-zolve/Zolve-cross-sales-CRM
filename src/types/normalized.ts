// Lead Management System - Normalized Database Schema Types
// Based on LMS Restructuring Specification

import { JourneyStage, MasterProduct, ProductOpportunityStatus, QualificationStatus, FundingPlan, ClosureReason, LastCallOutcome } from '../types';

// ============================================================================
// ENUMS & CONSTANTS
// ============================================================================

export enum NewLeadStatus {
  New = 'New',
  YetToBeQualified = 'Yet to be Qualified',
  Qualified = 'Qualified',
  InProgress = 'In Progress',
  OnHold = 'On Hold',
  Closed = 'Closed',
  Archived = 'Archived',
}

export enum CallStatus {
  NotAttempted = 'Not Attempted',
  Connected = 'Connected',
  RNR = 'RNR',
  SwitchOff = 'Switch Off',
  Busy = 'Busy',
  CallbackScheduled = 'Callback Scheduled',
  NotInterested = 'Not Interested',
  InvalidNumber = 'Invalid Number',
}

export enum QualificationOutcome {
  Qualified = 'Qualified',
  NotQualified = 'Not Qualified',
  Pending = 'Pending',
  NotRequired = 'Not Required',
}

export enum NotQualifiedReason {
  WrongNumber = 'Wrong Number',
  NotAnswering = 'Not Answering',
  WrongInformation = 'Wrong Information',
  NotAStudent = 'Not a Student',
  NotPlanningToStudyAbroad = 'Not Planning to Study Abroad',
  DuplicateExistingLead = 'Duplicate / Existing Lead',
  InvalidFakeLead = 'Invalid/Fake Lead',
  Other = 'Other',
}

export enum LeadPriority {
  Hot = 'Hot',
  Warm = 'Warm',
  Cold = 'Cold',
}

export enum DocumentCategory {
  Passport = 'Passport',
  PAN = 'PAN',
  Aadhaar = 'Aadhaar',
  Academic = 'Academic',
  Financial = 'Financial',
  TestScore = 'Test Score',
  University = 'University',
  Visa = 'Visa',
  VisaApproved = 'Visa Approved',
  AcceptanceLetter = 'Acceptance Letter',
  CoApplicantKYC = 'Co-Applicant KYC',
  Other = 'Other',
}

export enum ActivityType {
  Call = 'call',
  StageChange = 'stage_change',
  ProductUpdate = 'product_update',
  Assignment = 'assignment',
  Qualification = 'qualification',
  ProfileUpdate = 'profile_update',
  DocumentUpload = 'document_upload',
  System = 'system',
  NoteAdded = 'note_added',
}

export enum DocumentSharingStatus {
  Shared = 'Shared',
  NotShared = 'Not Shared',
  Draft = 'Draft',
  Archived = 'Archived',
}

// ============================================================================
// LEAD MASTER TABLE
// ============================================================================

export interface LeadMaster {
  leadId: string; // Primary key, format L000123
  studentName: string;
  mobileNumber: string; // Normalized (digits only)
  mobileCountryCode: string; // e.g., "91"
  email?: string;
  sourceCode: string;
  partnerCode?: string;
  bdeCode?: string;
  
  // Current lead snapshot
  currentLeadStatus: NewLeadStatus;
  currentLeadOwner?: string; // RM assigned
  currentLeadOwnerTeam?: string;
  leadAssignedAt?: string;
  leadAssignedBy?: string;
  
  // Qualification snapshot
  qualificationStatus: QualificationOutcome;
  qualifiedBy?: string;
  qualificationCompletedAt?: string;
  
  // Calling snapshot
  noOfAttempts: number;
  lastCallAt?: string;
  lastCallOutcome?: LastCallOutcome;
  nextCallAt?: string;
  callingStatus: CallStatus;
  
  // KPI & SLA
  lastActionAt: string;
  lastActionBy?: string;
  noActionSince: string;
  slaStatus: 'Within SLA' | 'Breached';
  escalationStatus: 'Not Escalated' | 'Escalated';
  escalatedTo?: string;
  kpiStatus: 'On Track' | 'Overdue';
  
  // Lifecycle
  closureReason?: ClosureReason;
  closedAt?: string;
  closedBy?: string;
  closureNotes?: string;
  
  // Metadata
  createdAt: string;
  updatedAt: string;
  signupStatus: 'Signed Up' | 'Not Signed Up';
  customerId?: string;
}

// ============================================================================
// LEAD PROFILE TABLE - Study Plan & Education Journey
// ============================================================================

export interface LeadProfile {
  profileId: string; // Primary key
  leadId: string; // Foreign key to LeadMaster
  
  // Destination
  currentAddress?: string;
  destinationCountries: string[]; // Multiple countries of interest
  finalCountry?: string; // Single selected country
  
  // Education plan
  degreeType?: 'UG' | 'PG' | 'Certificate';
  course?: string;
  targetIntake?: string; // e.g., "Sep 2027"
  journeyStage: JourneyStage;
  
  // Universities
  universitiesOfInterest: string[];
  finalUniversity?: string;
  
  // Tests
  testsInterestedIn: string[]; // IELTS, TOEFL, GRE, etc.
  
  // Readiness
  readinessChecklist: {
    passportValid: boolean;
    admitLetterReceived: boolean;
    fundingPlanReady: boolean;
    englishTestPassed: boolean;
  };
  
  // Metadata
  createdAt: string;
  updatedAt: string;
  updatedBy?: string;
}

// ============================================================================
// LEAD ACADEMIC TABLE - Indian Academic Background
// ============================================================================

export interface LeadAcademic {
  academicId: string; // Primary key
  leadId: string; // Foreign key
  
  // 10th Grade
  tenthBoard?: string;
  tenthSchool?: string;
  tenthYear?: number;
  tenthMarksPercentage?: number;
  
  // 12th Grade
  twelfthBoard?: string;
  twelfthSchool?: string;
  twelfthStream?: string;
  twelfthYear?: number;
  twelfthMarksPercentage?: number;
  
  // UG (Undergraduate)
  ugCollege?: string;
  ugDegree?: string;
  ugMajor?: string;
  ugGPA?: number;
  ugStartYear?: number;
  ugEndYear?: number;
  ugBacklogs?: number;
  
  // PG (Postgraduate)
  pgCollege?: string;
  pgDegree?: string;
  pgMajor?: string;
  pgGPA?: number;
  pgStartYear?: number;
  pgEndYear?: number;
  
  // Work Experience
  workExperience?: string; // Free text: company, role, duration
  
  // English & Aptitude Tests
  englishTest?: string; // IELTS, TOEFL, PTE
  englishTestScore?: number;
  englishTestDate?: string;
  
  aptitudeTest?: string; // GRE, GMAT
  aptitudeTestScore?: number;
  aptitudeTestDate?: string;
  
  // Other tests (array for multiple attempts)
  testAttempts?: Array<{
    testName: string;
    score: number;
    testDate: string;
  }>;
  
  // Achievements
  achievements?: string; // Free text: scholarships, awards, publications
  
  // Metadata
  createdAt: string;
  updatedAt: string;
  updatedBy?: string;
}

// ============================================================================
// LEAD FINANCIAL TABLE - Funding & Co-Applicant Info
// ============================================================================

export interface LeadFinancial {
  financialId: string; // Primary key
  leadId: string; // Foreign key, one-to-one with LeadMaster
  
  // Funding
  fundingPlan: FundingPlan;
  approximateFundingRequirement?: number; // In local currency
  
  // Co-Applicant (basic info)
  coApplicantName?: string;
  coApplicantRelationship?: 'Father' | 'Mother' | 'Spouse' | 'Sibling' | 'Other';
  coApplicantMobile?: string;
  coApplicantEmail?: string;
  coApplicantProfession?: string;
  coApplicantEmployer?: string;
  coApplicantIncomeAnnual?: number;
  
  // Metadata
  createdAt: string;
  updatedAt: string;
  updatedBy?: string;
}

// ============================================================================
// LEAD ASSIGNMENT TABLE - Historical Assignment Records
// ============================================================================

export interface LeadAssignment {
  assignmentId: string; // Primary key
  leadId: string; // Foreign key
  
  assignedTo: string; // RM name/ID
  assignedBy: string; // Manager/System
  team: string;
  
  assignedAt: string; // Timestamp
  reassignedAt?: string; // If reassigned later
  reassignmentReason?: string;
  
  status: 'Active' | 'Superseded' | 'Cancelled';
  
  createdAt: string;
}

// ============================================================================
// LEAD QUALIFICATION TABLE - Qualification History & Outcomes
// ============================================================================

export interface LeadQualification {
  qualificationId: string; // Primary key
  leadId: string; // Foreign key
  
  status: QualificationOutcome;
  notQualifiedReason?: NotQualifiedReason;
  qualificationNotes?: string;
  
  qualifiedBy: string; // User who qualified
  startedAt: string;
  completedAt?: string;
  
  // Snapshot of readiness at time of qualification
  readinessChecklistSnapshot?: {
    passportValid: boolean;
    admitLetterReceived: boolean;
    fundingPlanReady: boolean;
    englishTestPassed: boolean;
  };
  
  createdAt: string;
}

// ============================================================================
// LEAD CALL TABLE - Complete Call History
// ============================================================================

export interface LeadCall {
  callId: string; // Primary key
  leadId: string; // Foreign key
  assignmentId: string; // Foreign key to Lead_Assignment
  
  calledBy: string; // RM user ID
  calledAt: string; // Timestamp of call initiation
  callEndedAt?: string;
  durationSeconds: number;
  
  attemptNumber: number; // Sequence counter for this assignment
  
  callStatus: CallStatus;
  callOutcome: LastCallOutcome | string;
  callNotes?: string;
  
  scheduledNextCallAt?: string; // If callback scheduled
  
  createdAt: string;
}

// ============================================================================
// LEAD PRODUCT OPPORTUNITY TABLE
// ============================================================================

export interface LeadProductOpportunity {
  opportunityId: string; // Primary key
  leadId: string; // Foreign key
  
  masterProduct: MasterProduct;
  status: ProductOpportunityStatus;
  
  productOwner?: string; // RM assigned
  amount?: string;
  partner?: string;
  details?: string;
  
  transactionId?: string; // Links to Lead_Transaction if sold
  
  createdAt: string;
  completedSoldAt?: string;
  updatedAt: string;
  updatedBy?: string;
}

// ============================================================================
// LEAD TRANSACTION TABLE
// ============================================================================

export interface LeadTransaction {
  transactionId: string; // Primary key
  leadId: string; // Foreign key
  opportunityId: string; // Foreign key to Lead_Product_Opportunity
  
  masterProduct: MasterProduct;
  transactionAmount?: number;
  transactionDate?: string;
  transactionStatus: 'Completed' | 'Pending Disbursement' | 'Refunded';
  
  partner?: string; // Lender/vendor name
  externalTransactionId?: string; // Reference ID from product system
  transactionNotes?: string;
  
  createdAt: string;
}

// ============================================================================
// LEAD DOCUMENT TABLE
// ============================================================================

export interface LeadDocument {
  documentId: string; // Primary key
  leadId: string; // Foreign key
  
  fileName: string;
  fileSize?: number; // In bytes
  fileFormat: string; // .pdf, .jpg, etc.
  
  documentType: DocumentCategory;
  documentSubcategory?: string;
  
  documentCategory?: DocumentCategoryExtended; // 'general' | 'educationLoan' | 'personalLoan'
  educationLoanApplicationId?: string; // Optional link to specific education loan app
  
  filePath: string; // Reference to file storage
  
  uploadedBy: string; // User ID
  uploadedAt: string;
  
  sharingStatus: DocumentSharingStatus;
  sharedWith?: string; // Recipient/vendor/system
  sharedAt?: string;
  
  notes?: string;
  
  createdAt: string;
  updatedAt: string;
}

// ============================================================================
// LEAD ACTIVITY TABLE - Immutable Audit Log
// ============================================================================

export interface LeadActivity {
  activityId: string; // Primary key
  leadId: string; // Foreign key
  
  timestamp: string; // Immutable creation time
  actor: string; // User or "System"
  
  activityType: ActivityType;
  title: string; // Short description
  description?: string; // Longer details
  
  relatedId?: string; // Links to Call ID, Assignment ID, Opportunity ID, Document ID
  previousValue?: string;
  newValue?: string;
  
  createdAt: string;
}

// ============================================================================
// LEAD PRIORITY TABLE - Priority History
// ============================================================================

export interface LeadPriorityRecord {
  priorityId: string; // Primary key
  leadId: string; // Foreign key
  
  priorityLevel: LeadPriority;
  reason?: string;
  
  setBy: string;
  setAt: string;
  
  status: 'Active' | 'Superseded';
  
  createdAt: string;
}

// ============================================================================
// LEAD STATUS HISTORY TABLE - Immutable Status Transitions
// ============================================================================

export interface LeadStatusHistory {
  historyId: string; // Primary key
  leadId: string; // Foreign key
  
  previousStatus?: NewLeadStatus;
  newStatus: NewLeadStatus;
  
  changedBy: string;
  changedAt: string;
  reason?: string;
  
  createdAt: string;
}

// ============================================================================
// API RESPONSE TYPES
// ============================================================================

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
  };
  timestamp: string;
}

export interface PaginatedResponse<T> {
  success: boolean;
  data: T[];
  pagination: {
    page: number;
    pageSize: number;
    totalCount: number;
    totalPages: number;
  };
  timestamp: string;
}

// ============================================================================
// BACKWARD COMPATIBILITY - Reconstructed StudentLead
// ============================================================================

export interface ReconstructedStudentLead {
  // All StudentLead fields reconstructed from normalized tables
  id: string;
  sourceCode: string;
  partnerCode?: string;
  bdeCode?: string;
  studentName: string;
  mobileNumber: string;
  mobileCountryCode: string;
  email?: string;
  destinationCountry: string;
  finalCountry?: string;
  universitiesOfInterest: string[];
  finalUniversity?: string;
  course?: string;
  intake?: string;
  journeyStage: JourneyStage;
  testsInterestedIn: string[];
  fundingPlan: FundingPlan;
  isInboundRaw?: boolean;
  inboundCompletionPct?: number;
  
  createdAt: string;
  signupStatus: 'Not Signed Up' | 'Signed Up';
  customerId?: string;
  
  leadOwnerTeam?: string;
  leadOwner?: string;
  leadAssignedAt?: string;
  leadAssignedBy?: string;
  assignmentHistory: Array<{
    id: string;
    assignedAt: string;
    assignedBy: string;
    team: string;
    owner: string;
  }>;
  
  qualificationStatus: QualificationStatus;
  qualifiedBy?: string;
  qualificationCompletedAt?: string;
  
  callingStatus: CallStatus;
  noOfAttempts: number;
  lastCallAt?: string;
  lastCallOutcome?: LastCallOutcome;
  nextCallAt?: string;
  callLogs: Array<{
    id: string;
    timestamp: string;
    rmName: string;
    durationSeconds: number;
    outcome: LastCallOutcome;
    notes: string;
    scheduledNextCall?: string;
  }>;
  
  masterProducts: Record<MasterProduct, boolean>;
  productOpportunities: Array<{
    id: string;
    product: MasterProduct;
    status: ProductOpportunityStatus;
    productOwner?: string;
    amount?: string;
    partner?: string;
    details?: string;
    transactionId?: string;
    createdAt: string;
    completedSoldAt?: string;
  }>;
  
  leadStatus: 'Active' | 'Closed' | 'Archived';
  closureReason?: ClosureReason;
  closedAt?: string;
  closedBy?: string;
  
  kpiStatus: 'On Track' | 'Overdue';
  lastActionAt: string;
  lastActionBy?: string;
  escalationStatus: 'Not Escalated' | 'Escalated';
  escalatedTo?: string;
  
  activities: Array<{
    id: string;
    timestamp: string;
    actor: string;
    type: string;
    title: string;
    description: string;
  }>;
  notes: string[];
}

// ============================================================================
// EDUCATION LOAN JOURNEY TYPES
// ============================================================================

export enum LoanProductFlow {
  INR_Unsecured = 'INR_Unsecured',
  INR_Secured = 'INR_Secured',
  US_Cosigner = 'US_Cosigner',
  USD_NoCoSigner_Prodigy = 'USD_NoCoSigner_Prodigy',
  USD_NoCoSigner_MPower = 'USD_NoCoSigner_MPower',
}

export enum ApplicationStatus {
  Draft = 'Draft',
  InProgress = 'In Progress',
  Submitted = 'Submitted',
  UnderReview = 'Under Review',
  Approved = 'Approved',
  Rejected = 'Rejected',
  Closed = 'Closed',
}

export enum DocumentCategoryExtended {
  General = 'general',
  EducationLoan = 'educationLoan',
  PersonalLoan = 'personalLoan',
}

export interface ApplicantProfile {
  fullName: string;
  email: string;
  phoneNumber: string;
  mobileCountryCode: string;
  dateOfBirth: string; // ISO date
  gender?: 'Male' | 'Female' | 'Other';
  nationality: string;
  currentAddress: {
    street: string;
    city: string;
    state: string;
    postalCode: string;
    country: string;
  };
  maritalStatus?: 'Single' | 'Married' | 'Divorced' | 'Widowed';
  pan?: string; // India
  taxId?: string; // US
}

export interface ResidenceDestinationInfo {
  currentCountryOfResidence: string;
  currentVisaStatus?: string;
  plannedDestinationCountry: string;
  visaStatusInDestination?: string;
  expectedVisaApplicationDate?: string;
}

export interface EducationDetails {
  degreeType: 'UG' | 'PG' | 'Certificate' | 'Other';
  fieldOfStudy: string;
  intakeType: 'Fall' | 'Spring' | 'Summer' | 'Other';
  intakeYear: number;
  universitiesOfInterest: string[];
  admissionStatus: 'Not Applied' | 'Applied' | 'Admitted' | 'Deferred' | 'Rejected';
  expectedAdmissionDecisionDate?: string;
}

export interface LoanApplicationDetails {
  loanType: 'Secured' | 'Unsecured';
  requestedLoanAmount: number;
  loanAmountCurrency: 'INR' | 'USD';
  purposeOfLoan: string[];
  repaymentPreference?: 'SimpleInterest' | 'PartialSI' | 'FullEMI';
}

export interface CoApplicantDetails {
  fullName: string;
  relationship: 'Parent' | 'Spouse' | 'Sibling' | 'Other';
  phoneNumber: string;
  email: string;
  profession: string;
  employer: string;
  annualIncome: number;
  address: {
    street: string;
    city: string;
    state: string;
    postalCode: string;
    country: string;
  };
  sameAsApplicant: boolean;
  consentGiven: boolean;
}

export interface ReferenceDetail {
  name: string;
  relationship: 'Academic' | 'Professional' | 'Personal';
  phoneNumber: string;
  email: string;
}

export interface AcademicHistory {
  tenthGrade?: {
    board: string;
    school: string;
    year: number;
    marksPercentage: number;
  };
  twelfthGrade?: {
    board: string;
    school: string;
    stream: string;
    year: number;
    marksPercentage: number;
  };
  underGraduate?: {
    college: string;
    degree: string;
    major: string;
    gpa: number;
    startYear: number;
    endYear: number;
    backlogs: number;
  };
  postGraduate?: {
    college: string;
    degree: string;
    major: string;
    gpa: number;
    startYear: number;
    endYear: number;
  };
  workExperience?: Array<{
    company: string;
    role: string;
    yearsWorked: number;
  }>;
  englishTestScores?: Array<{
    testName: 'IELTS' | 'TOEFL' | 'PTE';
    score: number;
    testDate: string;
  }>;
  aptitudeTestScores?: Array<{
    testName: 'GRE' | 'GMAT';
    score: number;
    testDate: string;
  }>;
}

export interface FinancialDetails {
  applicantAnnualGrossIncome: number;
  applicantMonthlyIncome: number;
  applicantSavingsAccountBalance: number;
  applicantInvestments: number;
  applicantLiabilities: number;
  applicantCreditScore?: number;
  
  coApplicantAnnualIncome?: number;
  coApplicantMonthlyIncome?: number;
  coApplicantSavingsAccountBalance?: number;
  
  familyAnnualIncome: number;
  debtToIncomeRatio: number;
  bankStatementProofProvided: boolean;
}

export interface CollateralDetails {
  collateralType: 'Property' | 'Vehicle' | 'Gold' | 'Other';
  estimatedValue: number;
  location: string;
  existingLiensOrMortgages: string;
}

export interface StageCompletionStatus {
  [stageName: string]: {
    completed: boolean;
    completedAt?: string;
    validationErrors: string[];
  };
}

export interface EducationLoanApplication {
  applicationId: string; // UUID primary key
  leadId: string; // Foreign key to LeadMaster
  opportunityId: string; // Foreign key to LeadProductOpportunity
  
  loanProductFlow: LoanProductFlow;
  selectedLoanProvider?: string;
  
  currentStage: string;
  stageCompletionStatus: StageCompletionStatus;
  
  applicationStatus: ApplicationStatus;
  
  // Application data (all stages combined)
  applicantProfile?: ApplicantProfile;
  residenceDestinationInfo?: ResidenceDestinationInfo;
  educationDetails?: EducationDetails;
  loanApplicationDetails?: LoanApplicationDetails;
  coApplicantDetails?: CoApplicantDetails;
  references?: ReferenceDetail[]; // Minimum 2 required
  academicHistory?: AcademicHistory;
  financialDetails?: FinancialDetails;
  collateralDetails?: CollateralDetails;
  
  // Metadata
  createdAt: string;
  updatedAt: string;
  draftSavedAt?: string;
  submittedAt?: string;
  
  // For audit
  lastModifiedBy?: string;
  lastModifiedAt?: string;
}

// Extend LeadDocument to include education loan category
export interface LeadDocumentExtended extends LeadDocument {
  documentCategory?: DocumentCategoryExtended; // Add category field
  educationLoanApplicationId?: string; // Optional link to specific app
}
