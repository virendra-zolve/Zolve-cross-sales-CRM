# Requirements Document: Education Loan Journey

## Introduction

The Education Loan Journey feature provides a comprehensive, dedicated application experience for leads pursuing education loans through the RM Dashboard. This feature integrates with the existing lead management system by providing a dedicated entry point, multi-stage application flow, bi-directional data synchronization with lead profiles, document management, and support for multiple loan product types with provider selection.

The education loan journey is product-specific: when an RM clicks "Education Loan" within a LeadProductOpportunity, they access a full-featured journey page where applicants provide detailed information across multiple stages. The feature supports 4 distinct product flows (INR Unsecured, INR Secured, US Cosigner, USD No-Cosigner with 2 sub-flows), each with unique stage definitions and data collection requirements per the Education Loans PRD.

## Glossary

- **EducationLoanApplication**: Database table storing complete education loan application state, one per lead per product instance
- **ApplicationStage**: Discrete step in the education loan journey with specific data collection and validation rules
- **LeadProductOpportunity**: Record linking a lead to a master product (e.g., "Education Loan"); entry point to journey
- **EducationLoanJourneyPage**: Full-screen dedicated page (not modal) for the education loan application
- **Bi-directional_Sync**: When shared fields (name, email, phone, DOB, address, etc.) are updated in either Lead Profile or Education Loan Journey, both locations reflect the change
- **Shared_Field**: Profile data that exists in both LeadProfile and EducationLoanApplication (e.g., applicantName, email, phoneNumber, dateOfBirth, address)
- **Loan_Provider**: Financial institution offering education loans (bank or non-bank, e.g., Credila, InCred, Earnest, Prodigy Finance)
- **Product_Flow**: Complete loan application path defined by loan type and currency (e.g., INR Unsecured Loan has 10 stages)
- **Document_Category**: Classifier for documents including 'general' (default), 'educationLoan', and future categories like 'personalLoan'
- **Draft_Mode**: Application saved with incomplete stages; user can resume later
- **Stage_Progression**: User advances sequentially through application stages with validation at each stage
- **Co-applicant**: Secondary applicant (typically parent/spouse) required for certain loan types
- **Reference**: Non-financial third party providing information about applicant (minimum 2 required)

## Requirements

### Requirement 1: EducationLoanApplication Data Model & Schema

**User Story:** As a system architect, I need a dedicated EducationLoanApplication table to store education loan application data separately from the Lead master record, so that multiple loan applications per lead are supported and changes to shared fields sync bi-directionally.

#### Acceptance Criteria

1. THE System SHALL create an EducationLoanApplication table with the following fields:
   - `applicationId` (string, UUID, primary key)
   - `leadId` (string, foreign key to LeadMaster)
   - `opportunityId` (string, foreign key to LeadProductOpportunity)
   - `loanProductFlow` (enum: 'INR_Unsecured', 'INR_Secured', 'US_Cosigner', 'USD_NoCoSigner_Prodigy', 'USD_NoCoSigner_MPower')
   - `selectedLoanProvider` (string, name of selected provider)
   - `currentStage` (string, name of current stage in flow)
   - `stageCompletionStatus` (object with completion status per stage)
   - `applicationStatus` (enum: 'Draft', 'In Progress', 'Submitted', 'Under Review', 'Approved', 'Rejected', 'Closed')
   - `createdAt` (ISO timestamp)
   - `updatedAt` (ISO timestamp)
   - `submittedAt` (ISO timestamp, nullable)
   - `draftSavedAt` (ISO timestamp, nullable)

2. THE System SHALL create the following indexed queries:
   - Find all applications for a lead: `SELECT * FROM EducationLoanApplication WHERE leadId = ?`
   - Find active application for opportunity: `SELECT * FROM EducationLoanApplication WHERE opportunityId = ?`

3. THE Normalized_Schema SHALL define EducationLoanApplicationType interface in src/types/normalized.ts with all required fields

4. WHEN a lead is created, THE System SHALL NOT auto-create EducationLoanApplication records; creation happens only when user enters the education loan journey

### Requirement 2: Entry Point from LeadProductOpportunity

**User Story:** As an RM, I want to access the education loan journey from the LeadProductOpportunity card in the lead detail view, so that I can guide applicants through the complete loan application process without leaving the dashboard context.

#### Acceptance Criteria

1. WHEN the user is viewing a Lead Detail page AND a LeadProductOpportunity with masterProduct='Education Loan' exists, THE System SHALL display an "Enter Journey" button on the product opportunity card

2. WHEN the user clicks "Enter Journey", THE System SHALL:
   - Check if an active EducationLoanApplication exists for this opportunity
   - If exists: navigate to the journey page and load the existing application
   - If not exists: show a loan product selection flow to let user choose which loan type (INR Unsecured, INR Secured, etc.)

3. THE EducationLoanJourneyPage SHALL be a full-screen dedicated page (not modal) with its own route: `/lead/:leadId/education-loan-journey/:opportunityId`

4. WHEN the user navigates to the journey page, THE System SHALL load all shared field data from LeadProfile (name, email, phone, DOB, address) and pre-populate corresponding fields in EducationLoanApplication

5. THE System SHALL display a visual indicator showing which loan product flow is active (e.g., "INR Unsecured - 10 Stages") at the top of the journey page

### Requirement 3: Support Multiple Loan Product Flows

**User Story:** As a system maintainer, I need the architecture to support all 4 product flows from the Education Loans PRD, so that the system can handle diverse loan types and applicant requirements.

#### Acceptance Criteria

1. THE System SHALL support the following loan product flows, each with distinct stage definitions per the Education Loans PRD:
   - Flow 1: INR Unsecured Loan (10 stages: Applicant Profile, Residence & Destination, Education, Loan Application Details, Co-applicant, References, Academic History, Financial, Document Checklist, Review & Submit)
   - Flow 2: INR Secured Loan (15 stages: all above + Collateral Details, Valuation, Legal Documents, Verification, Final Approval)
   - Flow 3: US Cosigner Loan / Earnest (6 stages: Basic Info, Education, Financial, Co-Signer, Documents, Submit)
   - Flow 4: No Cosigner USD Loan with 2 sub-flows:
     - Sub-flow 4a: Prodigy Finance (15 stages: as specified in PRD)
     - Sub-flow 4b: MPower Finance (14 stages: as specified in PRD)

2. WHEN initializing the journey, THE System SHALL:
   - Present the user with loan flow selection (if application not yet created)
   - Store the selected flow in EducationLoanApplication.loanProductFlow
   - Display only stages relevant to the selected flow
   - Store stage definitions in a configuration file or database for easy updates

3. WHILE in an active journey, THE System SHALL NOT allow changing the loan product flow mid-application

4. THE Architecture SHALL be designed to support adding new flows without code changes (configuration-based)

### Requirement 4: Auto-populate Lead Data on Journey Entry

**User Story:** As an RM, I want the education loan application to be pre-populated with existing lead information, so that I don't need to re-enter data the applicant already provided.

#### Acceptance Criteria

1. WHEN a user enters the education loan journey for a lead, THE System SHALL auto-populate the following shared fields from LeadProfile:
   - Applicant Name → from LeadMaster.studentName
   - Email → from LeadMaster.email
   - Phone Number → from LeadMaster.mobileNumber
   - Mobile Country Code → from LeadMaster.mobileCountryCode
   - Date of Birth → from LeadProfile (if available)
   - Current Address → from LeadProfile.currentAddress (if available)
   - Destination Countries → from LeadProfile.destinationCountries
   - Degree Type → from LeadProfile.degreeType (if available)
   - Course → from LeadProfile.course (if available)
   - Target Intake → from LeadProfile.targetIntake (if available)
   - Universities of Interest → from LeadProfile.universitiesOfInterest
   - Co-applicant Details → from LeadFinancial (coApplicantName, coApplicantMobile, coApplicantEmail, coApplicantRelationship)
   - Annual Income → from LeadFinancial.coApplicantIncomeAnnual (if available)

2. THE System SHALL clearly indicate which fields were auto-populated vs. manually entered by showing a subtle badge or background color

3. IF a field in LeadProfile is empty, THE System SHALL leave the corresponding journey field empty and treat it as required for that application stage

### Requirement 5: Bi-directional Field Sync Between Lead Profile and Education Loan Journey

**User Story:** As an RM working across multiple tabs or returning to an application, I want changes made in either the Lead Profile or Education Loan Journey to automatically reflect in both places, so that data remains consistent without manual synchronization.

#### Acceptance Criteria

1. THE System SHALL treat the following fields as "shared" with bi-directional sync:
   - studentName ↔ applicantName
   - email ↔ email
   - mobileNumber ↔ phoneNumber
   - mobileCountryCode ↔ mobileCountryCode
   - dateOfBirth ↔ dateOfBirth
   - currentAddress ↔ address
   - destinationCountries (from LeadProfile array) ↔ countriesOfInterest
   - degreeType ↔ degreeType
   - course ↔ course
   - targetIntake ↔ targetIntake
   - universitiesOfInterest ↔ universitiesOfInterest
   - coApplicantName (from LeadFinancial) ↔ coApplicantName
   - coApplicantMobile ↔ coApplicantPhoneNumber
   - coApplicantEmail ↔ coApplicantEmail
   - coApplicantRelationship ↔ coApplicantRelationship

2. WHEN the user updates a shared field in EducationLoanApplication, THE System SHALL:
   - Save the change to EducationLoanApplication
   - Immediately update the corresponding field in LeadMaster or LeadFinancial
   - Create an activity record in LeadActivity indicating the field was updated from the education loan journey
   - NOT prompt the user for confirmation

3. WHEN the user updates a shared field in LeadProfile (from the main lead detail view), THE System SHALL:
   - Save the change to LeadMaster/LeadProfile/LeadFinancial
   - Check if an active EducationLoanApplication exists
   - If exists: immediately update the corresponding field in EducationLoanApplication
   - Create an activity record indicating the sync

4. IF a value is changed in both locations before sync completes, THE System SHALL resolve conflicts using "last-write-wins" strategy with timestamp comparison

5. THE System SHALL log all bi-directional updates in the LeadActivity table with activityType='BiDirectionalSync' for audit purposes

### Requirement 6: Document Management with Category Filtering

**User Story:** As an RM, I want to collect education loan-specific documents during the journey and see them alongside general lead documents in a unified view, so that all loan-related evidence is available in one place.

#### Acceptance Criteria

1. THE System SHALL extend the LeadDocument table with a new field:
   - `documentCategory` (enum: 'general', 'educationLoan', future: 'personalLoan', etc.)

2. WHEN a document is uploaded during the education loan journey, THE System SHALL:
   - Store the document in the unified LeadDocument table
   - Set documentCategory='educationLoan'
   - Link the document to the EducationLoanApplication via a reference
   - Create an activity record with activityType='DocumentUpload'

3. WHEN a document is uploaded from the general Lead Documents section, THE System SHALL:
   - Store the document in LeadDocument
   - Set documentCategory='general'
   - Do not link to any specific education loan application

4. THE System SHALL provide a document checklist UI in the journey showing:
   - All required documents for the current stage and flow (as defined in Education Loans PRD)
   - Current upload status per document type: 'Not Provided', 'Provided (1 file)', 'Provided (N files)', 'Rejected'
   - Quick upload buttons for each required document type

5. WHEN user uploads a document from the journey checklist, THE System SHALL:
   - Save to LeadDocument with documentCategory='educationLoan'
   - Update the checklist UI to show "Provided"
   - Create activity record
   - Do not remove the document if the application is later closed

6. IN the LeadDocumentsSection (main lead view), THE System SHALL display:
   - All documents (both 'general' and 'educationLoan')
   - Filter/tab options to show: "All Documents", "General", "Education Loan"
   - Document category as a visible label
   - Same upload/share/delete capabilities as before

7. WHEN filtering by "Education Loan", THE System SHALL show only documents with documentCategory='educationLoan'

8. WHERE multiple education loan applications exist for a lead, THE System SHALL show all educationLoan documents regardless of which application they were uploaded for (documents are at lead-level, not application-level)

### Requirement 7: Journey Stage Progression with Validation

**User Story:** As an RM guiding an applicant, I want to ensure each stage is completed and validated before moving forward, so that incomplete data doesn't cause issues later in the loan approval process.

#### Acceptance Criteria

1. WHEN a user is on a journey stage, THE System SHALL:
   - Display all required fields for that stage
   - Display all optional fields (with "optional" label)
   - Show field validation error messages inline
   - Disable the "Next" button until all required fields are valid

2. WHEN a user clicks "Next", THE System SHALL:
   - Validate all required fields on the current stage against stage-specific rules (per Education Loans PRD)
   - IF validation fails: display error messages and prevent progression
   - IF validation passes: save the stage as completed
   - Move to the next stage
   - Trigger bi-directional sync for any shared fields

3. WHEN a user clicks "Previous", THE System SHALL:
   - Move back to the previous stage
   - Display previously entered data without re-validating
   - Do NOT clear any data

4. WHEN a user clicks "Save Draft", THE System SHALL:
   - Save all data entered so far without validation
   - Set applicationStatus='Draft'
   - Update draftSavedAt timestamp
   - Create an activity record with activityType='DraftSaved'
   - Allow user to close the journey page and return later

5. WHILE in Draft mode, THE System SHALL:
   - Allow resuming from the last completed stage
   - Allow editing any previous stage without re-validating
   - Allow moving forward only if required fields are valid

6. WHEN a user submits the complete application, THE System SHALL:
   - Validate all stages (not just current)
   - IF any stage has missing required fields: show error highlighting which stages are incomplete
   - IF all validation passes: set applicationStatus='Submitted' and submittedAt timestamp
   - Create an activity record with activityType='ApplicationSubmitted'

7. THE System SHALL display a progress indicator showing:
   - Current stage number and name (e.g., "Stage 3 of 10: Education Details")
   - Visual progress bar or circular indicator showing completion percentage
   - List of all stages with completion status (✓ completed, ◯ current, ○ pending)

### Requirement 8: Data Collection Across All Required Fields

**User Story:** As a lender reviewing applications, I need all required data to be collected from applicants in a structured format, so that I can efficiently process and approve loans.

#### Acceptance Criteria

1. THE System SHALL collect the following Applicant Profile data during the journey:
   - Full name, email, phone number, mobile country code
   - Date of birth, gender, nationality
   - Current address (street, city, state, postal code, country)
   - Marital status
   - PAN (India), Tax ID (US), or equivalent identifier

2. THE System SHALL collect Residence & Destination Info:
   - Current country of residence and visa status (if applicable)
   - Planned destination country
   - Visa status in destination (if known)
   - Expected visa application date

3. THE System SHALL collect Education Details:
   - Degree type (UG, PG, Certificate, etc.)
   - Field of study / course name
   - Intake type (Fall, Spring, Summer, etc.)
   - Intake year (e.g., 2025, 2026, 2027)
   - Top 3 university preferences
   - Admission status (Not Applied, Applied, Admitted, Deferred, Rejected)
   - Expected admission decision date

4. THE System SHALL collect Loan Application Details:
   - Loan type (Secured vs. Unsecured, INR vs. USD)
   - Requested loan amount
   - Purpose of loan (tuition, living expenses, both, etc.)
   - Repayment preference (if applicable: Simple Interest, Partial SI, Full EMI)

5. THE System SHALL collect Co-applicant Details (if required for flow):
   - Full name, relationship (parent, spouse, sibling)
   - Mobile number, email
   - Profession, employer, annual income
   - Address (same as applicant or different)
   - Co-applicant consent (checkbox confirmation)

6. THE System SHALL collect Reference Details (minimum 2 required):
   - Reference 1: Name, relationship (academic, professional, personal), phone, email
   - Reference 2: Name, relationship, phone, email
   - Optional Reference 3 (if required by flow)

7. THE System SHALL collect Academic History:
   - 10th grade: board, school, year, percentage/GPA
   - 12th grade: board, school, stream, year, percentage/GPA
   - UG (if applicable): college, degree, major, GPA, start year, end year, backlogs
   - PG (if applicable): college, degree, major, GPA, start year, end year
   - Work experience: company names, roles, years, total years
   - English test scores (IELTS, TOEFL, PTE): test name, score, test date
   - Aptitude tests (GRE, GMAT): test name, score, date

8. THE System SHALL collect Financial Details:
   - Applicant: annual gross income, monthly income, savings account balance, investments, liabilities, credit score (if available)
   - Co-applicant: same financial details
   - Family annual income (sum of applicant + co-applicant)
   - Debt-to-income ratio (calculated)
   - Bank statement proof (yes/no)

9. WHEN loanProductFlow='INR_Secured' OR 'INR_Secured', THE System SHALL also collect Collateral Details:
   - Collateral type (property, vehicle, gold, other)
   - Collateral value (estimated)
   - Collateral location
   - Existing liens or mortgages

10. ALL collected data SHALL be stored in EducationLoanApplication with nested objects for grouped data (e.g., applicantProfile: {...}, educationDetails: {...}, etc.)

### Requirement 9: Loan Provider Selection Based on Applicant Profile

**User Story:** As an applicant, I want to see which loan providers can serve me based on my loan type and profile, so that I understand the available options and can make an informed choice.

#### Acceptance Criteria

1. WHEN the user reaches the loan provider selection stage, THE System SHALL:
   - Retrieve all available loan providers from the Education Loans PRD (16 providers listed including Credila, InCred, SBI, PNB, Earnest, Prodigy Finance, MPower Finance, etc.)
   - Filter providers based on the applicant's profile:
     - IF loanProductFlow='INR_Unsecured': show INR unsecured providers
     - IF loanProductFlow='INR_Secured': show INR secured providers
     - IF loanProductFlow='US_Cosigner' or 'USD_NoCoSigner_*': show USD providers

2. FOR each provider shown, THE System SHALL display:
   - Provider name and logo (if available)
   - Loan amount range supported
   - Interest rate (if known)
   - Processing fee (if known)
   - Key features / differentiators
   - Application processing time estimate

3. WHEN the user selects a provider, THE System SHALL:
   - Store selectedLoanProvider in EducationLoanApplication
   - Create an activity record with activityType='ProviderSelected'
   - Update the application status display to show "Applying with [Provider Name]"

4. WHEN a provider is selected, THE System SHALL:
   - Load provider-specific required documents and display them in the document checklist
   - Adjust validation rules if the provider has unique requirements

5. WHERE multiple providers are eligible for the applicant's profile, THE System SHALL allow the user to change the selected provider by returning to the provider selection stage

### Requirement 10: Stage-Specific Validation Rules

**User Story:** As a lender, I need validation rules tailored to each stage and loan type, so that applicant data quality is ensured and reduces back-and-forth corrections.

#### Acceptance Criteria

1. WHEN validating Applicant Profile stage, THE System SHALL enforce:
   - Email: valid email format (RFC 5322)
   - Phone number: minimum 10 digits, numeric plus optional +/- characters
   - Date of birth: must be at least 18 years old
   - PAN (India) or Tax ID: valid format and not previously used for different applicant

2. WHEN validating Education Details stage, THE System SHALL enforce:
   - Intake year: must be current year or future (not past)
   - At least 1 university preference selected
   - IF admission status='Admitted': admission decision date must be in past

3. WHEN validating Loan Application Details stage, THE System SHALL enforce:
   - Requested loan amount: minimum USD 5,000 or INR 200,000 (depending on currency)
   - Requested loan amount: not exceeding provider's maximum

4. WHEN validating Co-applicant Details (if required), THE System SHALL enforce:
   - Co-applicant relationship: valid relationship value
   - Co-applicant annual income: positive number
   - Co-applicant consent: checkbox must be checked

5. WHEN validating Financial Details stage, THE System SHALL enforce:
   - Annual income: positive number
   - Debt-to-income ratio: provider typically requires < 50% or < 60% (per provider rules)
   - Bank statement or supporting document: upload required

6. WHEN validating Document Checklist stage, THE System SHALL enforce:
   - All required documents for flow and provider: at least 1 file uploaded per type
   - Document file format: must be PDF, JPG, JPEG, PNG (not more than 10MB per file)

7. THE System SHALL store validation rule definitions in a configuration so rules can be updated without code changes

### Requirement 11: Immutable Audit Trail for All Application Changes

**User Story:** As a compliance officer, I need to audit all changes made to education loan applications, so that I can verify data integrity and track who made changes and when.

#### Acceptance Criteria

1. FOR every change to EducationLoanApplication data, THE System SHALL create an immutable activity record in LeadActivity with:
   - activityType: 'EducationLoanUpdate', 'DocumentUpload', 'ProviderSelected', 'StageCompleted', 'ApplicationSubmitted', etc.
   - title: human-readable description (e.g., "Applicant Profile Updated")
   - description: details of the change (e.g., "Email updated from old@email.com to new@email.com")
   - previousValue: previous value (if applicable)
   - newValue: new value (if applicable)
   - timestamp: ISO timestamp of change
   - actor: user who made the change (e.g., "RM123", "System Auto-Populate")

2. WHEN applicant data is auto-populated from LeadProfile, THE System SHALL create an activity: "Data Auto-populated from Lead Profile"

3. WHEN a shared field is synced from Lead Profile to Education Loan, THE System SHALL create an activity: "Synced from Lead Profile: [field name]"

4. WHEN a stage is completed, THE System SHALL create an activity: "Stage X of Y Completed: [Stage Name]"

5. THE System SHALL NOT allow updating or deleting activity records (immutable audit trail)

6. WHEN an application is submitted, THE System SHALL create an activity: "Application Submitted: All stages completed"

### Requirement 12: Application Status Tracking

**User Story:** As an RM managing multiple applications, I want to see the status of each education loan application at a glance, so that I can prioritize follow-ups and track progress.

#### Acceptance Criteria

1. THE System SHALL define the following applicationStatus enum:
   - 'Draft': Application started, not all stages completed
   - 'In Progress': User actively working on application (e.g., viewing stage)
   - 'Submitted': All stages completed and application submitted
   - 'Under Review': Application submitted to lender
   - 'Approved': Lender approved the application
   - 'Rejected': Lender rejected the application
   - 'Closed': Application completed or abandoned

2. WHEN creating a new EducationLoanApplication, THE System SHALL set initialStatus='Draft'

3. WHEN the user saves a draft, THE System SHALL set applicationStatus='Draft' and update draftSavedAt

4. WHEN the user completes all stages and clicks "Submit", THE System SHALL:
   - Set applicationStatus='Submitted'
   - Set submittedAt=current timestamp
   - Create activity record

5. WHEN an application is submitted, THE System SHALL update the corresponding LeadProductOpportunity:
   - Set status='In Progress' (indicating the loan application is progressing)

6. THE System SHALL display application status in:
   - Education Loan Journey page header (prominent display)
   - Lead detail view (in the product opportunities section)
   - Lead list view (if applicable, as a badge or column)

7. WHERE a lead has multiple EducationLoanApplication records, THE System SHALL show all applications with their statuses in the lead detail view

### Requirement 13: Resumable Draft Applications

**User Story:** As an applicant with a busy schedule, I want to save my application as a draft and return to it later without losing my progress, so that I can complete the application when I have more time.

#### Acceptance Criteria

1. WHEN a user clicks "Save Draft" at any stage, THE System SHALL:
   - Save all data entered so far (including incomplete stages)
   - Set applicationStatus='Draft'
   - Update draftSavedAt timestamp
   - Create activity record
   - Display a confirmation message "Draft saved"

2. WHEN a user closes the education loan journey page (or navigates away), THE System SHALL:
   - Auto-save any changes (similar to "Save Draft" but without requiring explicit click)
   - Set applicationStatus='Draft'
   - Update draftSavedAt timestamp

3. WHEN a user returns to an application in Draft status, THE System SHALL:
   - Load the previously saved data
   - Display the last completed stage + "Resume" button, or show all stages with completion status
   - Allow resuming from the last completed stage (user can click "Next" to continue)
   - Allow editing any previous stage

4. WHILE an application is in Draft status, THE System SHALL:
   - NOT require validating previous stages (only current stage needs validation to proceed)
   - Allow moving backward without restrictions
   - Allow changing the loan provider if the application hasn't been submitted

5. WHEN a draft application has not been edited for 60 days, THE System SHALL:
   - Create an activity record noting the application was dormant
   - Optionally send a notification to the RM or applicant (future enhancement)

6. WHERE a user navigates away during a stage without clicking "Save Draft", THE System SHALL auto-save after a configurable timeout (default 30 seconds of inactivity)

### Requirement 14: Multi-stage Form UI with Progress Tracking

**User Story:** As an RM, I want a clear, intuitive form interface that shows my progress and prevents mistakes, so that I can efficiently guide applicants through the application without confusion.

#### Acceptance Criteria

1. THE EducationLoanJourneyPage UI SHALL display:
   - Page header: "Education Loan Application | [Loan Product Flow] | [Applicant Name]"
   - Progress indicator: "Stage X of Y (60% complete)"
   - Visual stage progress bar or circular indicator
   - Left sidebar or breadcrumb: list of all stages with completion status (✓ ●○)
   - Calling options (dial, WhatsApp, SMS) in the header (always visible, never removed) - allowing users to seamlessly transition from loan journey to calling applicant

2. FOR each stage, THE UI SHALL show:
   - Stage name and description (if applicable)
   - All required fields (marked with * or red label)
   - All optional fields (marked with "optional")
   - Helpful hints or examples below field labels
   - Inline validation error messages (red text below field)

3. WHEN a field has a validation error, THE System SHALL:
   - Highlight the field with a red border
   - Display error message below the field (e.g., "Email must be valid format")
   - Disable the "Next" button
   - Mark the stage as incomplete in the sidebar

4. THE Navigation buttons SHALL be:
   - "Previous" button (always visible, go to previous stage)
   - "Next" button (visible if validation passes OR in Draft mode)
   - "Save Draft" button (always visible)
   - "Submit" button (visible only on final stage if all data is valid)

5. THE System SHALL disable "Next" button IF:
   - Required fields are empty or invalid
   - AND the application is not in Draft mode (Draft mode allows moving forward with incomplete fields)

6. THE System SHALL display a confirmation dialog before allowing "Submit" with message:
   - "Confirm submission? Once submitted, you cannot edit this application. [Cancel] [Submit]"

7. WHEN user clicks "Submit", THE System SHALL:
   - Show a loading spinner
   - Validate all stages
   - IF validation fails: show error message highlighting incomplete stages
   - IF validation passes: show success message and redirect to lead detail view

### Requirement 15: Parser & Pretty Printer for Education Loan Applications

**User Story:** As a data integration specialist, I need to parse education loan application data from external formats and ensure data round-tripping, so that applications can be imported and exported without data loss.

#### Acceptance Criteria

1. THE System SHALL implement a Parser that converts JSON or CSV education loan application data into EducationLoanApplication objects:
   - Input format: JSON (with schema defined in documentation)
   - Output format: EducationLoanApplication interface instance
   - Error handling: detailed error messages for malformed input (e.g., "Missing required field: applicantProfile.email")

2. WHEN parsing an application, THE Parser SHALL:
   - Validate all required fields are present
   - Convert data types (e.g., string "2025-01-15" to ISO Date)
   - Resolve enum values (e.g., "INR_Unsecured" to loanProductFlow enum)
   - Raise descriptive errors for unknown loan flows or invalid values

3. THE System SHALL implement a Pretty_Printer that converts EducationLoanApplication objects back to a human-readable format:
   - Output format: Formatted JSON with indentation and clear field labels
   - Output format: Optional: formatted PDF or HTML document for printing/archiving

4. FOR ALL valid EducationLoanApplication objects, parsing then pretty-printing then parsing again SHALL produce an equivalent object (round-trip property)
   - `parseApp(prettyPrint(parseApp(jsonInput))) == parseApp(jsonInput)`

5. THE Pretty_Printer SHALL include:
   - All applicant information
   - All stages completed with data entered
   - Loan provider selected
   - Application status
   - Timestamp of creation/submission

6. THE Parser SHALL support partial data (for Draft applications) without raising errors for incomplete stages

### Requirement 16: Access Control & Permissions

**User Story:** As a team lead, I want to ensure RMs can only access and edit education loan applications for leads assigned to them, so that sensitive applicant data is protected.

#### Acceptance Criteria

1. WHEN an RM requests access to an EducationLoanApplication, THE System SHALL:
   - Check if the RM is currently assigned to the lead
   - If assigned: grant read/write access
   - If not assigned: deny access (except for Team Lead and Head roles)

2. WHEN a Team Lead requests access, THE System SHALL:
   - Grant read/write access to all applications for leads in their team

3. WHEN a Head role requests access, THE System SHALL:
   - Grant read/write access to all applications

4. THE System SHALL log all access attempts (including denied attempts) in the activity stream for security audit

5. WHEN an application is submitted, THE System SHALL restrict editing:
   - Only Team Lead and Head roles can edit a submitted application
   - Activity records SHALL note who edited and when

### Requirement 17: Educational Loan Opportunity Linking

**User Story:** As an RM, I want the education loan application to be linked to the LeadProductOpportunity, so that I can track which loan provider opportunity corresponds to which application.

#### Acceptance Criteria

1. WHEN creating an EducationLoanApplication, THE System SHALL create or update the corresponding LeadProductOpportunity:
   - If product opportunity doesn't exist: create it with masterProduct='Education Loan', status='Interested'
   - If exists: update it to reference the application

2. THE EducationLoanApplication SHALL store:
   - opportunityId: reference to LeadProductOpportunity
   - selectedLoanProvider: partner/lender name (matches the provider stored in LeadProductOpportunity.partner)

3. WHEN a user selects a loan provider in the journey, THE System SHALL update LeadProductOpportunity.partner with the selected provider name

4. WHEN application status changes to 'Submitted', THE System SHALL update LeadProductOpportunity.status='In Progress'

5. WHEN application status changes to 'Approved', THE System SHALL update LeadProductOpportunity.status='Completed / Sold' and create a LeadTransaction record

6. WHEN application status changes to 'Rejected', THE System SHALL update LeadProductOpportunity.status='Failed / Rejected'

## Acceptance Criteria - Testing Properties

### Property 1: Bi-directional Sync Invariant

**Thoughts:** Bi-directional sync must maintain an invariant that shared fields between Lead and EducationLoanApplication remain consistent. This is testable as a property where after any update to either location, both should reflect the same value. The sync must not corrupt or lose data.

**Testable:** yes - property

**Property:** FOR ALL shared fields (email, phone, name, DOB, address, etc.), IF the field is updated in LeadMaster/LeadProfile, THEN EducationLoanApplication reflects the same value within 1 second. Similarly, IF updated in EducationLoanApplication, THEN LeadMaster reflects the same value within 1 second. Syncing the same field multiple times shall result in the same final value (idempotent).

### Property 2: Round-Trip Application Parsing

**Thoughts:** Applications must be parseable and pretty-printable without data loss. This is testable as a round-trip property where parsing, printing, and parsing again should yield an equivalent application. This catches serialization bugs, type conversion issues, and data corruption.

**Testable:** yes - property (round-trip)

**Property:** FOR ALL valid EducationLoanApplication objects generated by the system, `parseApp(prettyPrint(application)) == application` (with reasonable tolerance for timestamp formatting). Running the operation multiple times yields the same result.

### Property 3: Stage Progression Invariant

**Thoughts:** Applications should only move forward through stages if validation passes, and should never skip stages. This is an invariant where the current stage is always either the starting stage or follows a completed previous stage. This is testable by verifying stage sequence.

**Testable:** yes - property

**Property:** For any EducationLoanApplication, `if currentStage is Stage N, then all stages before N must have stageCompletionStatus=completed`. The application cannot progress to Stage N+1 until Stage N validation passes. Moving backward is always allowed.

### Property 4: Document Categorization Consistency

**Thoughts:** All documents in the system must have a valid category ('general', 'educationLoan', or future categories). This is testable by checking that no documents lack a category and that filtering by category returns only documents with that category.

**Testable:** yes - property

**Property:** FOR ALL LeadDocuments in the system, `document.documentCategory ∈ {'general', 'educationLoan', ...}` (never null). FOR ALL documents returned by filterByCategory('educationLoan'), `document.documentCategory == 'educationLoan'`. Filtering is idempotent (filtering twice returns same result as filtering once).

### Property 5: Application Status Progression

**Thoughts:** Application status can only transition through valid state changes (e.g., Draft → Submitted → Under Review, not Draft → Approved). This is testable by defining valid state transitions and verifying no invalid transitions occur.

**Testable:** yes - property

**Property:** FOR ALL EducationLoanApplication status transitions, the transition must be one of: Draft→InProgress, Draft→Submitted, Submitted→UnderReview, UnderReview→Approved|Rejected, Any→Closed. Invalid transitions (e.g., Rejected→Approved) are rejected. Forward transitions in the sequence are always allowed; backward transitions are only allowed under specific conditions (e.g., revert submitted to draft for Team Lead only).

### Property 6: Audit Trail Immutability

**Thoughts:** All activity records created for education loan changes must be immutable - they cannot be modified or deleted after creation. This is testable by verifying that activities cannot be updated and attempting to update yields an error.

**Testable:** yes - property

**Property:** FOR ALL LeadActivity records created with activityType starting with 'EducationLoan' or 'DocumentUpload' (from education loan journey), the record cannot be modified or deleted. Attempting to update or delete returns an error. Querying the same activity twice returns identical data (immutable).

