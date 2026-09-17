// Based on Zolve Lead Management System V1 PRD

export type JourneyStage = 
  | 'Pre-Test'
  | 'Test Preparation'
  | 'Counseling'
  | 'Application'
  | 'Admission Confirmed'
  | 'Pre-Departure'
  | 'Visa'
  | 'Travel'
  | 'Post-Arrival'
  | 'Other'
  | 'Unknown';

export type MasterProduct = 
  | 'Education Loan'
  | 'Refinance'
  | 'Test Prep'
  | 'Test Voucher'
  | 'Admissions'
  | 'Accommodation'
  | 'eSIM'
  | 'Travel / Flights'
  | 'Bank Account'
  | 'Credit Card'
  | 'Money Transfer'
  | 'NRE/NRO Account'
  | 'Insurance';

export type ProductOpportunityStatus = 
  | 'Not Started'
  | 'Interested'
  | 'In Progress'
  | 'Completed / Sold'
  | 'Not Interested'
  | 'Failed / Rejected'
  | 'Cancelled'
  | 'Closed';

export interface ProductOpportunity {
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
}

export type CallingStatus = 
  | 'Not Attempted'
  | 'Connected'
  | 'RNR'
  | 'Switch Off'
  | 'Busy'
  | 'Callback Scheduled'
  | 'Not Interested'
  | 'Invalid Number';

export type LastCallOutcome = 
  | 'Connected'
  | 'Converted'
  | 'Deferred'
  | 'RNR'
  | 'Switch Off'
  | 'Busy'
  | 'Callback Requested'
  | 'Not Interested'
  | 'Invalid Number'
  | 'Other';

export type QualificationStatus = 
  | 'Pending'
  | 'Qualified'
  | 'Not Qualified'
  | 'Not Required';

export type FundingPlan = 'Will Need Loan' | 'Self Fund' | 'Unknown';

export type LeadStatus = 'Active' | 'Closed' | 'Archived';

export type ClosureReason = 
  | 'Not Interested'
  | 'Not Qualified'
  | 'Invalid Contact'
  | 'Wrong Number'
  | 'Unreachable'
  | 'Duplicate'
  | 'Journey Completed'
  | 'Other';

export type KPIStatus = 'On Track' | 'Overdue';
export type EscalationStatus = 'Not Escalated' | 'Escalated';

export interface CallLogItem {
  id: string;
  timestamp: string;
  rmName: string;
  durationSeconds: number;
  outcome: LastCallOutcome | string;
  notes: string;
  scheduledNextCall?: string;
}

export interface ActivityItem {
  id: string;
  timestamp: string;
  actor: string;
  type: 'call' | 'stage_change' | 'product_update' | 'assignment' | 'qualification' | 'system';
  title: string;
  description: string;
}

export interface AssignmentHistory {
  id: string;
  assignedAt: string;
  assignedBy: string;
  team: string;
  owner: string;
}

export type LoanStage = 
  | 'Draft / Ingestion'
  | 'Profile & KYC'
  | 'Credit Underwriting'
  | 'Sanctioned'
  | 'Agreement Executed'
  | 'Partially Disbursed'
  | 'Fully Disbursed'
  | 'Rejected'
  | 'On Hold';

export interface LoanTranche {
  id: string;
  trancheNumber: number;
  description: string;
  amount: string;
  targetDate: string;
  status: 'Pending' | 'Scheduled' | 'Disbursed';
  disbursedDate?: string;
  beneficiary: string;
}

export interface LoanDocument {
  id: string;
  category: 'Student KYC' | 'Academic' | 'Financials / ITR' | 'Collateral / Property' | 'University & Visa';
  name: string;
  status: 'Verified' | 'Submitted' | 'Pending' | 'Rejected';
  verifiedAt?: string;
  required: boolean;
  fileName?: string;
}

export interface EducationLoanProfile {
  loanFileId: string;
  lender: string;
  lenderBranch?: string;
  lenderRmName?: string;
  lenderRmContact?: string;
  loanType: 'Unsecured (No Collateral)' | 'Secured (Collateral)';
  loanStage: LoanStage;
  requestedAmount: string;
  loanAmount?: string;
  sanctionedAmount?: string;
  disbursedAmount?: string;
  interestRate?: string;
  interestType?: 'Floating' | 'Fixed';
  tenureYears?: number;
  moratoriumPeriod?: string;
  repaymentType?: 'Simple Interest' | 'Partial Simple Interest' | 'Full EMI';
  processingFee?: string;
  marginMoney?: string;
  
  // Co-Applicant
  coApplicantName?: string;
  coApplicantRelation?: string;
  coApplicantNumber?: string;
  coApplicantIncomeAnnual?: string;
  coApplicantCreditScore?: number;
  coApplicantOccupation?: string;

  // Lenders Applied
  lendersAppliedTo?: ('Credila' | 'InCred' | 'SBI' | 'PNB')[];
  lenderStatusMap?: Record<'Credila' | 'InCred' | 'SBI' | 'PNB', 'Doc Pending' | 'Logged In' | 'Sanctioned' | 'PF Paid' | 'Disbursed'>;

  // University Cost
  tuitionFee?: string;
  livingExpenses?: string;
  totalCostOfAttendance?: string;

  // Documents & Tranches
  documents: LoanDocument[];
  tranches: LoanTranche[];

  // Lender & RM Notes
  lenderNotes?: string[];
  sanctionLetterIssuedDate?: string;
  expectedDisbursalDate?: string;
  disbursalRemarks?: string;
}

export interface StudentLead {
  // Master Lead Table fields
  id: string; // e.g. L000123 (displayed cleanly without #)
  sourceCode: string;
  partnerCode?: string; // Partner from which lead originated (e.g. KC_OVERSEAS_P01)
  bdeCode?: string; // BD Executive linked to partner (e.g. BDE_PRIYA)
  studentName: string;
  mobileNumber: string;
  mobileCountryCode: string;
  email: string;
  destinationCountry: string;
  finalCountry?: string;
  universitiesOfInterest: string[];
  finalUniversity?: string;
  course: string;
  intake: string;
  journeyStage: JourneyStage;
  testsInterestedIn: string[];
  fundingPlan: FundingPlan;
  isInboundRaw?: boolean; // True when received with only the 6 core inbound fields
  inboundCompletionPct?: number; // Calculated completion % of total fields
  
  // System fields
  createdAt: string;
  signupStatus: 'Not Signed Up' | 'Signed Up';
  customerId?: string;

  // Manager & Ownership
  leadOwnerTeam: string;
  leadOwner: string;
  leadAssignedAt: string;
  leadAssignedBy: string;
  assignmentHistory: AssignmentHistory[];

  // Qualification
  qualificationStatus: QualificationStatus;
  qualifiedBy?: string;
  qualificationCompletedAt?: string;
  qualificationNotes?: string;
  educationLoan?: string;
  claimStatus?: 'Claimed' | 'Not Claimed';
  loanProfile?: EducationLoanProfile;
  readinessChecklist: {
    passportValid: boolean;
    admitLetterReceived: boolean;
    fundingPlanReady: boolean;
    englishTestPassed: boolean;
  };
  coSignerIncome?: string;
  academicScore?: string;
  academicBackground?: {
    tenthGrade: { board: string; schoolName: string; passingYear: string; percentage: string };
    twelfthGrade: { board: string; schoolName: string; stream: string; passingYear: string; percentage: string };
    undergraduate: { college: string; degree: string; specialisation: string; startYear: string; graduationYear: string; percentage: string };
    postgraduate: { college: string; degree: string; specialisation: string; startYear: string; graduationYear: string; percentage: string };
    workExperience: { totalExperience: string; currentEmployer: string; role: string; details: string };
    tests: {
      english: { testName: string; score: string; testDate: string };
      aptitude: { testName: string; score: string; testDate: string };
    };
    achievements: string;
  };

  // Calling Operational Fields
  callingStatus: CallingStatus;
  noOfAttempts: number;
  lastCallAt?: string;
  lastCallOutcome?: LastCallOutcome;
  nextCallAt: string;
  callLogs: CallLogItem[];

  // Product Opportunities
  masterProducts: Record<MasterProduct, boolean>;
  productOpportunities: ProductOpportunity[];

  // Lifecycle & Closure
  leadStatus: LeadStatus;
  closureReason?: ClosureReason;
  closedAt?: string;
  closedBy?: string;
  closureNotes?: string;

  // KPI & Inactivity Monitoring
  kpiStatus: KPIStatus;
  lastActionAt: string;
  lastActionBy: string;
  noActionSince: string;
  escalationStatus: EscalationStatus;
  escalatedTo?: string;
  kpiOverdueMinutes?: number;

  // Activities & Notes
  activities: ActivityItem[];
  notes: string[];
}

export interface RmMember {
  id: string;
  name: string;
  avatar: string;
  role: string;
  team: string;
  status: 'Available' | 'In Call' | 'Break' | 'Offline';
  activeLeadsCount: number;
  callsToday: number;
  connectRatePercent: number;
  qualifiedToday: number;
  kpiBreachedCount: number;
  dealsClosedMonth: number;
  capacityPercent: number;
  email: string;
  phone: string;
}

// Partner Onboarding
export type PartnerStatus = 'Pending Manager' | 'Pending Head' | 'Agreement Pending' | 'Active' | 'Rejected by Manager' | 'Rejected by Head';

export interface PartnerDocument {
  type: 'PAN' | 'CIN' | 'GST' | 'Agreement';
  fileName: string;
  fileUrl: string;
  uploadedAt: string;
  uploadedBy: string;
}

export interface PartnerApprovalAction {
  timestamp: string;
  action: 'submitted' | 'approved' | 'rejected' | 'commission_updated';
  actor: string;
  actorRole: 'BDE' | 'Manager' | 'Head';
  reason?: string;
  commissionsChanged?: Array<{ product: MasterProduct; oldValue: number; newValue: number }>;
}

export type PartnerType = 'Agent' | 'School' | 'Coaching Center' | 'Overseas Hub' | 'Other';

export interface PartnerAddress {
  addressLine1: string;
  addressLine2?: string;
  street: string;
  city: string;
  state: string;
  pincode: string;
  country: string;
}

export interface PartnerCommission {
  product: MasterProduct;
  type: 'Percentage' | 'Fixed';
  value: number; // percentage or fixed amount
}

export interface Partner {
  id: string;
  partnerCode: string; // system-generated, e.g., PART_00123
  status: PartnerStatus;
  
  // Business Legal
  businessName: string;
  partnerType: PartnerType;
  pan: string;
  panNumber?: string; // for invoice generation
  cin?: string;
  gst?: string;
  gstNumber?: string; // for invoice generation
  
  // Owner
  ownerName: string;
  ownerEmail: string;
  ownerPhone: string;
  
  // Contact Person
  contactPersonName: string;
  contactPersonEmail: string;
  contactPersonPhone: string;
  
  // Registered Address
  registeredAddress: PartnerAddress;
  
  // Operating Address (optional, if different)
  operatingAddress?: PartnerAddress;
  
  // Ownership & Location
  bdeUserId: string;
  bdeName?: string;
  managerId: string; // Manager of the location
  managerName?: string;
  locationId: string;
  locationName?: string;
  
  // Source & Tracking
  sourceCode: string;
  createdAt: string;
  
  // Products & Commission
  eligibleProducts: MasterProduct[];
  commissions: PartnerCommission[];
  
  // Documents
  documents: PartnerDocument[];
  
  // Performance Metrics
  totalLeadsGenerated: number;
  leadsConverted: number;
  activeLeads: number;
  
  // Approval Workflow
  approvalHistory: PartnerApprovalAction[];
  
  // Approval Details
  managerApprovedAt?: string;
  managerApprovedBy?: string;
  managerRejectionReason?: string;
  
  headApprovedAt?: string;
  headApprovedBy?: string;
  headRejectionReason?: string;
  
  agreementUploadedAt?: string;
  agreementUploadedBy?: string;
}

// Team Onboarding
export type TeamMemberRole = 'Agent' | 'Team Lead' | 'Manager' | 'BDE';
export type TeamMemberStatus = 'Pending Approval' | 'Active' | 'Inactive';
export type EmploymentType = 'Full-time' | 'Part-time' | 'Contract' | 'Freelance';
export type ExperienceLevel = 'Fresher' | 'Junior' | 'Mid' | 'Senior' | 'Lead';

export interface TeamMemberApprovalAction {
  timestamp: string;
  action: 'submitted' | 'approved' | 'rejected';
  actor: string;
  actorRole: 'Manager' | 'Head';
  reason?: string;
}

export interface TeamMember {
  id: string;
  userId: string; // system-generated unique user ID
  status: TeamMemberStatus;
  
  // Basic Info
  name: string;
  email: string;
  phone: string;
  avatar?: string;
  
  // Role & Location
  role: TeamMemberRole;
  location: string;
  locationId: string;
  managerId: string;
  managerName?: string;
  
  // Product & Capacity
  product: MasterProduct;
  monthlyTarget: number;
  capacityPercent: number;
  
  // Employment & Joining
  employmentType: EmploymentType;
  joiningDate: string;
  experienceLevel: ExperienceLevel;
  
  // Bank Details (optional, for commission payouts)
  bankAccountNumber?: string;
  bankIfscCode?: string;
  
  // Metadata
  createdAt: string;
  createdBy: string;
  approvalHistory: TeamMemberApprovalAction[];
  
  // Approval Details
  headApprovedAt?: string;
  headApprovedBy?: string;
  headRejectionReason?: string;
}
