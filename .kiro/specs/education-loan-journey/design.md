# Design Document: Education Loan Journey Feature

**Feature Name:** education-loan-journey  
**Workflow Type:** Requirements-First  
**Document Version:** 1.0  
**Last Updated:** [Current Date]

---

## Overview

The Education Loan Journey feature provides a comprehensive, dedicated application experience for leads pursuing education loans. This feature integrates with the existing lead management system by offering:

- A full-screen dedicated application interface (not modal)
- Multi-stage application flows supporting 4 distinct product types
- Bi-directional data synchronization with lead profiles
- Document management with categorization
- Support for draft applications with auto-save capability
- Immutable audit trails for compliance
- Provider selection based on applicant profile
- Stage-specific validation and progression

The journey is product-specific and entry point-based: RMs access the journey from LeadProductOpportunity cards in the lead detail view, creating a seamless workflow from lead management to loan application.

---

## Architecture

### High-Level System Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                    RM Dashboard / Lead Detail View               │
│  (Display LeadProductOpportunity cards with "Enter Journey" btn) │
└────────────────┬────────────────────────────────────────────────┘
                 │
                 ▼
        ┌────────────────────┐
        │ Journey Entry Flow │
        │ (Product Selection)│
        └────────┬───────────┘
                 │
                 ▼
    ┌────────────────────────────────┐
    │ EducationLoanJourneyPage       │
    │ ┌──────────────────────────┐   │
    │ │ Header                   │   │
    │ │ • Status Display         │   │
    │ │ • Calling Options        │   │
    │ │ • Applicant Name         │   │
    │ └──────────────────────────┘   │
    │ ┌────────┐ ┌──────────────────┐│
    │ │Sidebar │ │ Main Content     ││
    │ │Stages  │ │ • StageForm      ││
    │ │Progress│ │ • DocumentChk    ││
    │ │        │ │ • ProviderSelect ││
    │ └────────┘ └──────────────────┘│
    │ ┌──────────────────────────┐   │
    │ │ Footer Navigation        │   │
    │ │ Previous | Next | Submit │   │
    │ └──────────────────────────┘   │
    └────┬──────────────────────────┘
         │
         ▼
    ┌─────────────────────────────────┐
    │  API Layer (LeadsDatabase)       │
    │  • createEducationLoanApplication│
    │  • updateEducationLoanApplication│
    │  • updateSharedFieldSync         │
    │  • uploadEducationLoanDocument   │
    └────┬────────────────────────────┘
         │
         ▼
    ┌──────────────────────────────────┐
    │  Data Layer (Normalized Tables)   │
    │  • EducationLoanApplication       │
    │  • LeadDocument (with category)   │
    │  • LeadActivity (immutable audit) │
    │  • LeadMaster, LeadProfile, etc   │
    └──────────────────────────────────┘
```

### Component Hierarchy

```
EducationLoanJourneyPage (full-page container)
├── Header
│   ├── Title & Status Display
│   ├── Progress Indicator (X of Y stages, %)
│   └── Calling Options (Dial, WhatsApp, SMS - always visible)
├── Main Content Area
│   ├── StageNavigationSidebar
│   │   ├── Stage List (all stages with ✓/●/○ icons)
│   │   └── Progress Bar
│   └── StageForm (dynamic, per-stage component)
│       ├── ProviderSelectionStage (if applicable)
│       ├── ApplicantProfileStage
│       ├── EducationDetailsStage
│       ├── LoanApplicationDetailsStage
│       ├── CoApplicantStage (if required)
│       ├── ReferenceDetailsStage
│       ├── AcademicHistoryStage
│       ├── FinancialDetailsStage
│       ├── CollateralStage (if INR Secured)
│       ├── DocumentChecklistStage
│       └── ReviewSubmitStage
└── Footer
    ├── Previous Button
    ├── Next Button
    ├── Save Draft Button
    └── Submit Button (final stage only)
```

---

## Components and Interfaces

### New Types to Add to `src/types/normalized.ts`

```typescript
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
  // Future: PersonalLoan = 'personalLoan', etc.
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
```

### Update LeadDocument Type

Add to existing LeadDocument in `src/types/normalized.ts`:

```typescript
export interface LeadDocument {
  // ... existing fields ...
  documentCategory?: DocumentCategoryExtended; // Add this field
  educationLoanApplicationId?: string; // Optional link to specific app
}
```

### API Layer Methods to Add to LeadsDatabase

```typescript
// Education Loan Application Management

createEducationLoanApplication(
  leadId: string,
  opportunityId: string,
  loanProductFlow: LoanProductFlow,
  initialData?: Partial<EducationLoanApplication>
): { success: boolean; application?: EducationLoanApplication; error?: string }

getEducationLoanApplication(
  applicationId: string
): EducationLoanApplication | null

getEducationLoanApplicationsByLead(
  leadId: string
): EducationLoanApplication[]

updateEducationLoanApplication(
  applicationId: string,
  updates: Partial<EducationLoanApplication>
): { success: boolean; application?: EducationLoanApplication; error?: string }

updateEducationLoanApplicationStage(
  applicationId: string,
  stageName: string,
  stageData: Record<string, any>,
  validate: boolean
): { success: boolean; validationErrors?: string[]; application?: EducationLoanApplication }

submitEducationLoanApplication(
  applicationId: string
): { success: boolean; application?: EducationLoanApplication; error?: string }

// Bi-directional Sync

updateSharedFieldSync(
  leadId: string,
  fieldName: string,
  newValue: any,
  source: 'LeadProfile' | 'EducationLoanApp'
): { success: boolean; synced: boolean }

// Document Management

uploadEducationLoanDocument(
  leadId: string,
  applicationId: string,
  documentData: {
    fileName: string;
    fileFormat: string;
    documentType: string;
    filePath: string;
    uploadedBy: string;
  }
): { success: boolean; document?: LeadDocument }

getEducationLoanDocuments(
  leadId: string,
  applicationId?: string
): LeadDocument[]

// Parsing & Serialization

parseEducationLoanApplication(
  jsonData: any
): { success: boolean; application?: EducationLoanApplication; errors?: string[] }

prettyPrintEducationLoanApplication(
  application: EducationLoanApplication
): string // Formatted JSON or HTML
```

---

## Data Models

### EducationLoanApplication Storage Structure

```
EducationLoanApplication {
  applicationId: UUID
  leadId: string (FK → LeadMaster)
  opportunityId: string (FK → LeadProductOpportunity)
  
  loanProductFlow: enum
  selectedLoanProvider: string
  
  currentStage: string
  stageCompletionStatus: {
    "Stage 1: Applicant Profile": {
      completed: boolean,
      completedAt: ISO timestamp,
      validationErrors: string[]
    },
    "Stage 2: Education Details": { ... }
    ...
  }
  
  applicationStatus: enum (Draft | In Progress | Submitted | ...)
  
  applicantProfile: nested object
  residenceDestinationInfo: nested object
  educationDetails: nested object
  loanApplicationDetails: nested object
  coApplicantDetails: nested object
  references: array of objects
  academicHistory: nested object
  financialDetails: nested object
  collateralDetails: nested object (if INR_Secured)
  
  createdAt: ISO timestamp
  updatedAt: ISO timestamp
  draftSavedAt: ISO timestamp
  submittedAt: ISO timestamp
}
```

### Bi-directional Sync Mapping

| LeadMaster/LeadProfile Field | EducationLoanApplication Field | Sync Direction |
|-----|-----|-----|
| studentName | applicantProfile.fullName | ↔ Bi-directional |
| email | applicantProfile.email | ↔ Bi-directional |
| mobileNumber | applicantProfile.phoneNumber | ↔ Bi-directional |
| mobileCountryCode | applicantProfile.mobileCountryCode | ↔ Bi-directional |
| (from LeadProfile) dateOfBirth | applicantProfile.dateOfBirth | ↔ Bi-directional |
| (from LeadProfile) currentAddress | applicantProfile.currentAddress | ↔ Bi-directional |
| destinationCountries | residenceDestinationInfo.plannedDestinationCountry | ↔ Bi-directional |
| degreeType | educationDetails.degreeType | ↔ Bi-directional |
| course | educationDetails.fieldOfStudy | ↔ Bi-directional |
| targetIntake | educationDetails.intakeYear | ↔ Bi-directional |
| universitiesOfInterest | educationDetails.universitiesOfInterest | ↔ Bi-directional |
| (from LeadFinancial) coApplicantName | coApplicantDetails.fullName | ↔ Bi-directional |
| (from LeadFinancial) coApplicantMobile | coApplicantDetails.phoneNumber | ↔ Bi-directional |
| (from LeadFinancial) coApplicantEmail | coApplicantDetails.email | ↔ Bi-directional |
| (from LeadFinancial) coApplicantRelationship | coApplicantDetails.relationship | ↔ Bi-directional |
| (from LeadFinancial) coApplicantIncomeAnnual | financialDetails.coApplicantAnnualIncome | ↔ Bi-directional |

---

## State Flow Diagram

```
┌──────┐
│Draft │ ◄─────────────────────┐
└───┬──┘                       │
    │ (Save Draft / Auto-save) │
    │                          │
    ▼                          │
┌──────────────┐               │
│In Progress   │ (Editing)     │
└───┬──────────┘               │
    │ (All stages validated)   │
    ▼                          │
┌─────────────┐                │
│ Submitted   │ ◄──────────────┘
└───┬─────────┘ (Revert to draft - TL only)
    │
    ▼
┌──────────────┐
│ Under Review │ (Lender reviewing)
└───┬──────────┘
    │
    ├─ Approved
    │   ▼
    │  ┌────────┐
    │  │Approved│
    │  └────────┘
    │
    └─ Rejected
        ▼
       ┌────────┐
       │Rejected│
       └────────┘

All statuses can transition to:
    ▼
   ┌──────┐
   │Closed│
   └──────┘
```

---

## Stage Configuration Architecture

### Stage Definition Structure

```typescript
interface StageConfig {
  stageName: string;
  stageNumber: number;
  description: string;
  
  requiredFields: string[]; // e.g., ["applicantProfile.email", "applicantProfile.dateOfBirth"]
  optionalFields: string[];
  
  validationRules: ValidationRule[];
  
  documentRequirements?: {
    documentType: string;
    required: boolean;
    provider?: string; // Provider-specific
  }[];
  
  UI?: {
    componentName: string;
    layout: 'single-column' | 'two-column' | 'multi-panel';
  };
}

interface ValidationRule {
  fieldPath: string;
  validator: (value: any) => { valid: boolean; error?: string };
  errorMessage: string;
  appliesTo?: LoanProductFlow[]; // If empty, applies to all
}
```

### Stage Configurations Example

```typescript
const STAGE_CONFIGS: Record<LoanProductFlow, StageConfig[]> = {
  [LoanProductFlow.INR_Unsecured]: [
    {
      stageName: "Applicant Profile",
      stageNumber: 1,
      description: "Tell us about yourself",
      requiredFields: [
        "applicantProfile.fullName",
        "applicantProfile.email",
        "applicantProfile.phoneNumber",
        "applicantProfile.dateOfBirth",
        "applicantProfile.currentAddress",
        "applicantProfile.pan"
      ],
      optionalFields: ["applicantProfile.gender", "applicantProfile.nationality"],
      validationRules: [
        {
          fieldPath: "applicantProfile.email",
          validator: (v) => ({ valid: /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v), error: "Invalid email" }),
          errorMessage: "Email must be valid format"
        },
        {
          fieldPath: "applicantProfile.dateOfBirth",
          validator: (v) => {
            const age = (new Date().getFullYear()) - new Date(v).getFullYear();
            return { valid: age >= 18, error: "Must be 18+" };
          },
          errorMessage: "Must be at least 18 years old"
        }
      ]
    },
    // ... more stages
  ],
  // ... other flows
};
```

---

## Validation Strategy

### Validation Layers

1. **Field-Level Validation** (Real-time, on blur/change)
   - Email format
   - Phone number format
   - Date of birth (minimum 18 years)
   - Numeric ranges
   - Required field presence

2. **Stage-Level Validation** (Before Next button enabled)
   - All required fields in stage are present
   - All required fields pass field-level validation
   - Dependencies between fields (e.g., if income > X, then debt ratio must be < Y)

3. **Application-Level Validation** (Before Submit)
   - All stages completed
   - Cross-stage dependencies
   - Business rules (e.g., loan amount within provider limits)

### Validation Rules Examples

```typescript
validationRules: [
  // Email validation
  {
    fieldPath: "applicantProfile.email",
    validator: (v) => {
      const valid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
      return { valid, error: valid ? undefined : "Invalid email format" };
    },
    errorMessage: "Please enter a valid email address"
  },
  
  // Age validation (minimum 18)
  {
    fieldPath: "applicantProfile.dateOfBirth",
    validator: (v) => {
      const age = (new Date().getFullYear()) - new Date(v).getFullYear();
      return { valid: age >= 18, error: age >= 18 ? undefined : "Must be at least 18" };
    },
    errorMessage: "Applicant must be at least 18 years old"
  },
  
  // Loan amount validation
  {
    fieldPath: "loanApplicationDetails.requestedLoanAmount",
    appliesTo: [LoanProductFlow.INR_Unsecured],
    validator: (v) => {
      const valid = v >= 200000 && v <= 5000000;
      return { valid, error: valid ? undefined : "Amount must be between 2L and 50L INR" };
    },
    errorMessage: "Loan amount out of range"
  },
  
  // References validation
  {
    fieldPath: "references",
    validator: (arr) => {
      const valid = Array.isArray(arr) && arr.length >= 2;
      return { valid, error: valid ? undefined : "Minimum 2 references required" };
    },
    errorMessage: "Please provide at least 2 references"
  }
];
```

---

## Error Handling

### Error Categories

1. **Validation Errors** (User input issues)
   - Missing required fields
   - Invalid field formats
   - Out-of-range values
   - Business rule violations

2. **State Errors** (Application state issues)
   - Cannot submit incomplete application
   - Cannot edit submitted application (except TL/Head)
   - Invalid stage progression
   - Duplicate loan provider selection

3. **Sync Errors** (Bi-directional sync issues)
   - Conflict detection (last-write-wins with timestamp)
   - Sync timeout (auto-retry with exponential backoff)
   - Inconsistency detection (log and notify user)

4. **System Errors** (Infrastructure issues)
   - Database unavailable
   - File upload failed
   - Document storage error

### Error Response Format

```typescript
interface ErrorResponse {
  success: false;
  error: {
    code: string;
    message: string;
    details?: {
      field?: string;
      validationErrors?: string[];
      timestamp: string;
    };
  };
}
```

---

## Testing Strategy

### Dual Testing Approach

This design employs both unit tests and property-based tests to ensure comprehensive coverage:

**Property-Based Tests** (Randomized, universal properties)
- Test correctness properties across all valid inputs
- Catch edge cases and unexpected interactions
- Verify system invariants hold across randomized scenarios

**Unit Tests** (Specific examples and edge cases)
- Test concrete examples and expected behaviors
- Test error conditions and boundary cases
- Test integration points between components

### Test Configuration

- Property tests: Minimum 100 iterations per test
- Each test references its design property
- Tag format: `Feature: education-loan-journey, Property N: [property-text]`

### Testing Framework

- Use industry-standard property-based testing library (e.g., fast-check for JavaScript/TypeScript, Hypothesis for Python)
- Configure with explicit randomness seeds for reproducibility
- Generate inputs using domain-aware generators (valid loan amounts, dates, etc.)

---

## Correctness Properties

*A property is a characteristic or behavior that should hold true across all valid executions of a system—essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.*

[Correctness properties to be written after prework analysis - see below]

---

## Access Control & Permissions

### Access Rules

| Role | Read | Write | Submitted Applications | Notes |
|---|---|---|---|---|
| RM (assigned lead owner) | Yes | Yes | No | Can only edit own assigned leads |
| RM (unassigned) | No | No | No | Denied unless reassigned |
| Team Lead | Yes | Yes | Yes | Can edit submitted apps for team |
| Head | Yes | Yes | Yes | Can edit any application |
| System | Yes | Yes | Yes | Auto-sync actions |

### Audit Logging

- All access attempts (including denied) logged in LeadActivity
- Actor, action, timestamp, result recorded
- Immutable audit trail for compliance

---

## Calling Options Integration

The header displays calling options (Dial, WhatsApp, SMS) that remain always visible and never removed. These allow RMs to seamlessly transition from reviewing loan application data to contacting the applicant without leaving the journey page.

**Implementation:** Integrate with existing calling system in src/components/LeadCallingSection.tsx

---

## UI Layout Description

### EducationLoanJourneyPage Layout

**Header Section (Sticky)**
- Back button, Lead ID, Applicant Name
- Status badge showing current application status
- Progress bar: "Stage X of Y (XX% Complete)"
- Calling options: [Dial] [WhatsApp] [SMS]

**Main Content Area**
- Left Sidebar: Stage navigation with completion indicators
  - All stages listed with ✓ (completed), ● (current), ○ (pending)
  - Clickable for quick navigation between stages
  - Visual progress indication
  
- Center Panel: Current stage form
  - Stage title and description
  - All required fields marked with *
  - All optional fields marked with "(optional)"
  - Field hints/examples below labels
  - Real-time validation with inline error messages
  - Red borders on invalid fields
  
- Document Checklist (embedded or modal)
  - Required documents for current stage
  - Upload status per document type
  - Quick upload buttons

**Footer Section**
- Left: Previous button (always visible)
- Center: Next button (conditional on validation), Save Draft button
- Right: Submit button (final stage only, conditional on all validation)

---

## Provider Selection Logic

### Provider Filtering

Providers (16 total) are filtered based on:
1. Loan product flow (INR Unsecured, INR Secured, US Cosigner, USD No-Cosigner)
2. Currency support (INR vs USD)
3. Loan type (Secured vs Unsecured)
4. Co-signer requirement

### Provider Display

For each eligible provider, show:
- Provider name and logo
- Loan amount range supported
- Interest rate (if available)
- Processing fee (if available)
- Key features/differentiators
- Processing time estimate

### Selection Flow

1. User reaches provider selection stage
2. System filters eligible providers
3. User selects provider
4. Store selectedLoanProvider in EducationLoanApplication
5. Update document checklist with provider-specific documents
6. Create LeadActivity recording provider selection

---

## Draft & Resume Pattern

### Auto-Save Mechanism

- Triggered on page unload
- Triggered after 30 seconds of inactivity
- Triggered on "Save Draft" button click
- Updates draftSavedAt timestamp
- Creates LeadActivity record

### Resume Flow

1. User clicks "Enter Journey" for existing draft application
2. System loads last completed stage
3. Display "Resume" indicator and "Last saved: [timestamp]" message
4. Show all stages with completion status
5. User can click "Next" to continue from last completed stage
6. User can click on previous stage to review/edit data

---

## Correctness Properties

### Property 1: Bi-directional Sync Invariant

*For any* shared field between LeadMaster/LeadProfile and EducationLoanApplication, IF the field is updated in either location, THEN the other location is updated within 1 second with the same value, and subsequent syncs of the same field in either direction produce identical final values (idempotence).

**Validates: Requirements 5.1, 5.2, 5.3, 5.4, 5.5**

### Property 2: Round-Trip Application Serialization

*For any* valid EducationLoanApplication object created by the system, parsing the pretty-printed JSON representation then comparing field-by-field should produce an equivalent object (with reasonable tolerance for timestamp formatting and ISO date strings).

**Validates: Requirements 15.1, 15.2, 15.3, 15.4, 15.5, 15.6**

### Property 3: Stage Progression Invariant

*For any* EducationLoanApplication, IF currentStage is Stage N, THEN all stages before N must have stageCompletionStatus.completed=true. The application cannot progress to Stage N+1 unless Stage N validation passes. Backward stage navigation is always allowed.

**Validates: Requirements 7.1, 7.2, 7.3, 3.2, 3.3**

### Property 4: Document Category Consistency

*For all* LeadDocument records in the system, the documentCategory field must be one of: 'general', 'educationLoan', or future valid categories (never null or invalid). When filtering documents by category (e.g., filterByCategory('educationLoan')), the returned set contains ONLY documents where documentCategory equals the filter value. Filtering twice with the same criteria returns identical results (filtering is idempotent).

**Validates: Requirements 6.1, 6.2, 6.3, 6.6, 6.7, 6.8**

### Property 5: Application Status Progression

*For any* EducationLoanApplication status transition, the transition must follow valid state machine rules. Valid transitions are: Draft→InProgress, Draft→Submitted, InProgress→Submitted, Submitted→UnderReview, UnderReview→Approved, UnderReview→Rejected, and any status→Closed. Invalid transitions (e.g., Rejected→Approved) are rejected with an error. Status can only change through explicit API operations, never spontaneously.

**Validates: Requirements 12.1, 12.2, 12.3, 12.4, 12.5, 12.6, 12.7**

### Property 6: Audit Trail Immutability

*For all* LeadActivity records created with activityType='EducationLoanUpdate', 'BiDirectionalSync', 'DocumentUpload', 'ProviderSelected', 'StageCompleted', or 'ApplicationSubmitted', the record cannot be modified or deleted after creation. Attempting to update or delete returns an error. Querying the same activity record twice returns identical data (immutable and consistent).

**Validates: Requirements 11.1, 11.2, 11.3, 11.4, 11.5, 11.6**

### Property 7: Field Validation Consistency

*For all* defined validation rules across all stages and flows, applying the validation rule to inputs that should pass returns valid=true with no errors, and inputs that should fail return valid=false with a non-empty error message. The same validation rule applied to the same input multiple times produces identical results (deterministic).

**Validates: Requirements 10.1, 10.2, 10.3, 10.4, 10.5, 10.6, 10.7**

### Property 8: Draft Application Resumption

*For any* EducationLoanApplication in Draft status, when resumed later, all previously entered data is present and unmodified. The application can resume from the last completed stage, and backward navigation doesn't clear any data. Saving a draft then resuming produces identical application state (data preservation).

**Validates: Requirements 13.1, 13.2, 13.3, 13.4, 13.5, 13.6**

### Property 9: Provider Filtering Correctness

*For any* applicant profile and loanProductFlow combination, the list of eligible providers returned by the provider selection must include ONLY providers that support that loan type, currency, and co-signer requirements. Filtering providers multiple times for the same profile returns the same provider set (filtering is deterministic and consistent).

**Validates: Requirements 9.1, 9.4, 9.5**

### Property 10: Auto-Population of Shared Fields

*For any* new EducationLoanApplication created for a lead with existing LeadProfile data, the corresponding shared fields in the application are pre-populated with the values from LeadProfile. If a Lead field is empty, the corresponding application field is also empty and marked as required. The auto-populated state persists across saves (data integrity).

**Validates: Requirements 4.1, 4.2, 4.3**

### Property 11: Document Upload Categorization

*For any* document uploaded during the education loan journey, the document's documentCategory is set to 'educationLoan'. For any document uploaded from the general lead documents section, documentCategory is set to 'general'. The category is immutable after creation (cannot be changed to another category).

**Validates: Requirements 6.2, 6.3, 6.5**

### Property 12: Educational Loan Application - Lead Relationship

*For any* EducationLoanApplication, the corresponding LeadProductOpportunity is created/updated with masterProduct='Education Loan'. When the application status changes to 'Submitted', the opportunity status updates to 'In Progress'. When application status becomes 'Approved', the opportunity status becomes 'Completed / Sold' and a LeadTransaction is created. When application status becomes 'Rejected', opportunity status becomes 'Failed / Rejected'.

**Validates: Requirements 17.1, 17.2, 17.3, 17.4, 17.5, 17.6**

### Property 13: Flow Immutability Post-Selection

*For any* EducationLoanApplication after loanProductFlow is initially set, attempting to change the flow to a different value is rejected or results in error. The flow remains constant throughout the application lifecycle (immutable after selection). Only the currently selected flow's stages are displayed (stage consistency).

**Validates: Requirements 3.2, 3.3**

### Property 14: Application Requires Lead Data

*For any* new EducationLoanApplication, the applicationId, leadId, and opportunityId must be non-empty strings that reference valid LeadMaster and LeadProductOpportunity records. Attempting to create an application without valid leadId or opportunityId is rejected.

**Validates: Requirements 1.1, 1.4, 2.4**

### Property 15: Role-Based Access Control

*For any* access request to an EducationLoanApplication by an RM, IF the RM is currently assigned to the lead, THEN grant read/write access; IF not assigned, THEN deny access (except for Team Lead and Head roles who always get access). All access attempts are logged in LeadActivity for audit.

**Validates: Requirements 16.1, 16.2, 16.3, 16.4, 16.5**

---

## Testing Strategy (Detailed)

### Unit Testing Approach

Unit tests focus on concrete examples, edge cases, and specific scenarios:

**Example Test Suites:**
- LeadDocument category examples (verify enum values, storage, retrieval)
- Validation rules for email format, phone number, age, loan amounts
- Status transition examples (Draft → Submitted, Submitted → Approved)
- UI component rendering (button visibility, form field states)
- Error handling for malformed inputs
- Access control edge cases (denied access attempts)
- Provider selection for specific applicant profiles

**Minimum Coverage:**
- At least 1 unit test per validation rule
- Edge cases: empty inputs, boundary values, special characters
- Error paths: missing fields, invalid formats, failed operations

### Property-Based Testing Approach

Property tests verify universal properties across randomized inputs:

**Example Property Test Suites:**

1. **Bi-directional Sync Property Test**
   - Generate random applicant profiles and lead data
   - Update shared field in LeadProfile
   - Assert EducationLoanApplication reflects same value
   - Update field in EL app
   - Assert LeadProfile reflects same value
   - Verify last-write-wins timestamp logic
   - Run 100+ iterations

2. **Round-Trip Serialization Property Test**
   - Generate random valid EducationLoanApplication objects
   - Pretty print to JSON
   - Parse JSON back to object
   - Compare field-by-field (with timestamp tolerance)
   - Verify equivalence
   - Run 100+ iterations

3. **Stage Progression Property Test**
   - Generate random stage sequences
   - For each stage N, generate valid data for stages 0 to N-1
   - Verify currentStage can only be N if all previous stages completed
   - Generate invalid transitions (e.g., skip stage)
   - Verify system rejects invalid transitions
   - Run 100+ iterations

4. **Document Category Property Test**
   - Generate random LeadDocument records with various categories
   - Filter by 'educationLoan' category
   - Assert filtered set contains ONLY educationLoan documents
   - Verify filter returns same results on repeated calls (idempotence)
   - Run 100+ iterations

5. **Field Validation Property Test**
   - Generate random inputs across valid and invalid ranges for each validation rule
   - Apply validation rule
   - Assert valid inputs pass and invalid inputs fail consistently
   - Verify same input always produces same validation result (determinism)
   - Run 100+ iterations per rule

6. **Draft Resumption Property Test**
   - Generate random application data and save as draft
   - Close and reopen application
   - Assert all previously entered data is present and unchanged
   - Modify data and save again
   - Verify modifications persist
   - Run 100+ iterations

7. **Provider Filtering Property Test**
   - Generate random applicant profiles with different loan types, currencies
   - Filter providers for that profile
   - Assert all returned providers support requested loan type/currency
   - Verify filter returns same providers on repeated calls (determinism)
   - Run 100+ iterations

8. **Audit Trail Immutability Property Test**
   - Generate random changes to EducationLoanApplication
   - Verify activity records are created
   - Attempt to modify activity record
   - Assert modification fails or is rejected
   - Run 100+ iterations

### Test Configuration Requirements

**Framework:** Use property-based testing library appropriate to language (e.g., fast-check for JavaScript)

**Generators:** Use domain-aware generators:
- Email: valid email format strings
- Phone numbers: 10+ digit strings with country codes
- Amounts: numbers within realistic loan ranges (5K-5M INR, etc.)
- Dates: ISO date strings within reasonable past/future ranges
- Enums: only valid enum values for flows, statuses, etc.

**Iterations:** Minimum 100 iterations per property test

**Reproducibility:** Log random seed for failed tests to allow reproduction

**Coverage Target:** All 15 correctness properties mapped to at least one property test

---

## Future Enhancements

1. **Integration with External Lenders**
   - Real-time loan eligibility checks
   - Automatic offer generation
   - Webhook notifications for status changes

2. **Advanced Document Management**
   - Document OCR and validation
   - Automatic field extraction from uploaded documents
   - Digital signatures for co-applicant consent

3. **Mobile Application**
   - Progressive Web App (PWA) for applicants
   - Mobile-optimized journey interface
   - Push notifications for status updates

4. **AI-Powered Assistant**
   - Intelligent form filling suggestions
   - Document requirement prediction
   - Real-time eligibility prediction

5. **Reporting & Analytics**
   - Application completion time metrics
   - Stage-wise dropout analysis
   - Provider performance dashboards

---

## Implementation Roadmap

### Phase 1: Core Data Model & API (Weeks 1-2)
- Extend src/types/normalized.ts with EducationLoanApplication and related types
- Update LeadDocument type with documentCategory field
- Implement LeadsDatabase methods for EL application CRUD

### Phase 2: UI Components & Pages (Weeks 3-4)
- Create EducationLoanJourneyPage component
- Implement stage form components
- Build stage navigation sidebar
- Add calling options to header

### Phase 3: Bi-directional Sync & Integration (Weeks 5-6)
- Implement sync logic in updateSharedFieldSync method
- Update LeadDetailView to show "Enter Journey" button
- Integrate journey entry point into LeadProductOpportunity cards
- Wire up auto-population of shared fields

### Phase 4: Document Management & Validation (Weeks 7-8)
- Extend LeadDocumentsSection with category filtering
- Implement document upload in education loan journey
- Build validation rule engine
- Create stage-specific validation rules

### Phase 5: Provider Selection & Submission (Weeks 9-10)
- Build provider selection UI and filtering logic
- Implement application submission workflow
- Create parser and pretty printer for applications
- Wire up activity logging and audit trail

### Phase 6: Testing & Quality Assurance (Weeks 11-12)
- Implement unit test suite
- Implement property-based test suite
- Run comprehensive testing and bug fixes
- Performance optimization and security hardening

---

## Configuration Files

### Stage Configurations File

Create file: `src/config/educationLoanStages.ts`

This file should contain:
- Stage definitions for all 4 loan product flows
- Required and optional fields per stage
- Validation rules per stage
- UI layout preferences per stage

### Provider Configurations File

Create file: `src/config/loanProviders.ts`

This file should contain:
- List of 16 loan providers
- Provider capabilities (loan types, currencies, amount ranges)
- Provider-specific document requirements
- Interest rates, processing fees, processing times

### Validation Rules File

Create file: `src/config/validationRules.ts`

This file should contain:
- All validation rules organized by field
- Error messages
- Applicability per flow or universally

---

## Deployment & Operations

### Environment Variables

```
EDUCATION_LOAN_FEATURE_ENABLED=true
EL_AUTO_SAVE_TIMEOUT_SECONDS=30
EL_DRAFT_DORMANCY_DAYS=60
EL_MAX_FILE_SIZE_MB=10
EL_ALLOWED_FILE_FORMATS=pdf,jpg,jpeg,png
```

### Database Migrations

When moving from in-memory mock to real database:
- Create EducationLoanApplication table
- Add documentCategory column to LeadDocument table
- Create indexes on leadId, opportunityId, applicationStatus
- Migrate mock data if needed

### Monitoring & Alerts

- Track application submission rates per flow type
- Monitor average completion time per stage
- Alert on provider selection failures
- Track bi-directional sync errors and conflicts
- Monitor file upload failures

---

## References & Resources

### Related Specifications
- Lead Management Restructure: `.kiro/specs/lead-management-restructure/design.md`
- All Leads Dashboard: `.kiro/specs/all-leads-dashboard/design.md`

### External Documentation
- Education Loans PRD: [location in company docs]
- Lead Normalized Schema: `src/types/normalized.ts`
- Existing API: `src/api/leadsApi.ts`

---

**Document Status:** Ready for User Review  
**Next Steps:** User approval → Task List Generation (Phase 3) → Implementation

