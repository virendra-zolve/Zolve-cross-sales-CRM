# Lead Management System Restructuring Requirements

## Introduction

The current Lead Management System uses a monolithic `StudentLead` type that mixes all student, academic, financial, operational, and product data into a single entity. This causes tight coupling, difficult maintenance, and poor data organization. This document specifies the requirements for restructuring LMS into a normalized database schema with separate logical tables, while maintaining data integrity and enabling cleaner UI organization.

The restructuring will split the monolithic StudentLead into 11 specialized tables with clear separation of concerns, proper historical tracking, and optimized UI sections reflecting business workflows.

---

## Glossary

- **Lead ID**: Unique identifier for a student (e.g., L000123), normalized by mobile number
- **Lead Master**: Current snapshot of lead core data (one record per student)
- **Lead Profile**: Detailed study plan information (countries, universities, courses, degree type)
- **Lead Academic**: Historical academic background including Indian education and tests
- **Lead Financial**: Funding sources, loan requirements, and co-applicant basic information
- **Lead Assignment**: Historical record of team and relationship manager assignments
- **Lead Qualification**: Qualification status, outcomes, and rejection reasons with timestamps
- **Lead Call**: Complete call history including attempts, outcomes, and scheduled follow-ups
- **Lead Product Opportunity**: Products identified and pursued for each student
- **Lead Transaction**: Financial transactions linked to products
- **Lead Document**: Document repository with categorization (not for verification)
- **Lead Activity**: Audit log of all historical actions and state changes
- **Lead Priority**: Student priority classification (Hot, Warm, Cold) with history
- **Lead Status**: Lifecycle state (New, Yet to be Qualified, Qualified, In Progress, On Hold, Closed, Archived)
- **Journey Stage**: Current position in student journey (Pre-Test through Post-Arrival)
- **SLA**: Service Level Agreement with 48-hour rule for lead contacts and escalation logic
- **Relationship Manager (RM)**: Team member responsible for lead management
- **BDE (Business Development Executive)**: Partner-side contact who referred the lead
- **Source Code**: Partner or channel from which lead originated
- **Inbound Raw Lead**: Lead received with only 6 mandatory fields (Name, Phone, Email, Country, Partner, BDE)
- **Completion Percentage**: Calculated metric of how many profile fields are populated

---

## Database Schema Requirements

### Requirement 1: Lead Master Table

**User Story:** As a lead manager, I want a current snapshot of each lead's core identifying information, so that I can quickly access essential lead data and identify duplicates.

#### Acceptance Criteria

1. WHEN a lead is created, THE Lead_Master table SHALL store one record per Lead_ID with the following fields:
   - Lead ID (unique primary key, format L000XXX)
   - Student Name (required)
   - Mobile Number (required, normalized for duplicate detection)
   - Mobile Country Code (required, default: 91 for India)
   - Email (optional)
   - Source Code (required, identifies partner/channel)
   - Partner Code (optional, for partner attribution)
   - BDE Code (optional, BD Executive reference)
   - Created At (timestamp, immutable)
   - Updated At (timestamp, auto-updated on any change)

2. WHEN a lead is duplicated by mobile number, THE System SHALL flag the newer lead as duplicate and maintain a reference to the original Lead_ID

3. WHILE a lead record exists, THE Lead_Master SHALL be readable by all components and updatable only through qualified approval workflows

4. THE Lead_Master SHALL support rapid filtering by Source Code and Partner Code for analytics


### Requirement 2: Lead Profile Table

**User Story:** As a counselor, I want to manage a student's study plan information independently from other lead data, so that I can update university preferences and intake dates without affecting qualification status.

#### Acceptance Criteria

1. WHEN a lead progresses through journey stages, THE Lead_Profile table SHALL store detailed study information:
   - Lead ID (foreign key to Lead_Master)
   - Final Country (destination country selected)
   - Universities of Interest (array/list of universities)
   - Final University (selected university, nullable initially)
   - Degree Type (Bachelor's, Master's, PhD, Diploma, Other)
   - Course / Program Name (field of study)
   - Target Intake (academic term/year: Fall 2024, Spring 2025, etc.)
   - Tests Interested In (array: IELTS, TOEFL, GRE, GMAT, PTE, others)
   - Readiness Checklist items (Passport Valid, Admit Letter Received, Funding Plan Ready, English Test Passed - all boolean)
   - Updated At (timestamp)
   - Updated By (user who made changes)

2. WHEN a counselor updates university or intake information, THE System SHALL timestamp the change and log it to Lead_Activity table

3. WHILE a lead is in Pre-Test through Pre-Departure stages, THE Lead_Profile fields SHALL be editable without workflow approval

4. WHEN a lead moves to Visa stage, THE Lead_Profile SHALL be locked against updates except for Final University and Intake (to reflect actual admission)


### Requirement 3: Lead Academic Table

**User Story:** As an admissions officer, I want to track a student's academic history including 10th, 12th, undergraduate, postgraduate grades and work experience, so that I can assess qualification and make lending decisions.

#### Acceptance Criteria

1. WHEN a student provides educational background, THE Lead_Academic table SHALL store:
   - Lead ID (foreign key)
   - 10th Board / School (optional)
   - 10th Year (optional)
   - 10th Marks / GPA (optional)
   - 12th Board / School (optional)
   - 12th Year (optional)
   - 12th Marks / GPA (optional)
   - UG College Name (optional)
   - UG Degree (optional)
   - UG Major / Stream (optional)
   - UG GPA / Score (optional)
   - UG Start Year (optional)
   - UG End Year (optional)
   - PG College Name (optional)
   - PG Degree (optional)
   - PG GPA / Score (optional)
   - PG Start Year (optional)
   - PG End Year (optional)
   - Work Experience (text field with company, role, duration)
   - Tests Completed (array of test names with scores: IELTS, TOEFL, GRE, GMAT, etc.)
   - Test Scores (associated scores for each test)
   - Test Dates (date each test was taken)
   - Achievements (text field: scholarships, awards, publications)
   - Co-Applicant Income (annual income of guarantor/co-applicant, optional)
   - Co-Applicant Occupation (job title/field of co-applicant, optional)
   - Updated At (timestamp)
   - Updated By (user)

2. THE Lead_Academic table SHALL allow multiple test attempts with dates for each attempt (round-trip testable: date → score → date roundtrip)

3. WHEN academic records are updated, THE System SHALL create an Activity log entry with "Academic Profile Updated" type and field-level change list

4. WHERE a student has no academic data yet, THE System SHALL populate default empty/null values without blocking lead creation


### Requirement 4: Lead Financial Table

**User Story:** As a credit analyst, I want to track funding requirements and co-applicant information separately from student profile, so that I can assess loan feasibility independently from study plan changes.

#### Acceptance Criteria

1. WHEN a lead is created, THE Lead_Financial table SHALL be initialized with:
   - Lead ID (foreign key)
   - Funding Plan (required: "Will Need Loan", "Self Fund", "Unknown")
   - Approximate Funding Requirement (optional currency amount)
   - Co-Applicant Name (optional)
   - Co-Applicant Relationship (optional: Father, Mother, Spouse, Sibling, Other)
   - Co-Applicant Contact Number (optional)
   - Co-Applicant Email (optional)
   - Updated At (timestamp)
   - Updated By (user)

2. WHEN a lead indicates "Will Need Loan", THE Lead_Financial SHALL trigger availability of Product Opportunities for Education Loan tracking

3. WHILE a lead is in Qualified status, THE Lead_Financial co-applicant fields SHALL be editable without approval

4. THE Lead_Financial table SHALL NOT include detailed loan profiles (those belong in Lead_Product_Opportunity or EducationLoanProfile separately)


### Requirement 5: Lead Assignment Table

**User Story:** As a team manager, I want to maintain a complete history of who has been assigned each lead and when, so that I can audit lead ownership changes and identify accountability gaps.

#### Acceptance Criteria

1. WHEN a lead is assigned or reassigned, THE Lead_Assignment table SHALL create a new record with:
   - Assignment ID (unique)
   - Lead ID (foreign key)
   - Assigned To (Relationship Manager name/ID)
   - Assigned By (Manager or system name/ID)
   - Team Name (team to which RM belongs)
   - Assigned At (timestamp)
   - Reassigned At (nullable, timestamp of reassignment)
   - Reassignment Reason (optional text)
   - Status (Active, Superseded, Cancelled)

2. THE System SHALL maintain exactly one Active assignment per lead at any time; creating a new assignment SHALL mark the previous as Superseded

3. WHERE a lead is auto-assigned by system (e.g., from partner), THE Assigned By field SHALL be "System Auto-Router"

4. WHEN a reassignment occurs, THE System SHALL create an Activity log entry linking to the Assignment ID


### Requirement 6: Lead Qualification Table

**User Story:** As a qualification manager, I want to track qualification attempts, outcomes, and reasons for rejection, so that I can manage lead funnel and identify reasons for qualification failures.

#### Acceptance Criteria

1. WHEN a lead's qualification status changes, THE Lead_Qualification table SHALL record:
   - Qualification ID (unique)
   - Lead ID (foreign key)
   - Status (required: "Pending", "Qualified", "Not Qualified", "Not Required")
   - Qualification Completed At (nullable timestamp)
   - Qualified By (user who made qualification decision, nullable)
   - Rejection Reason (nullable, predefined list: "Not Interested", "Poor Academic Profile", "Insufficient Funds", "Invalid Documentation", "Below Age", "Above Age", "Other")
   - Qualification Notes (optional text explanation)
   - Readiness Checklist Status (snapshot of 4 checklist items at time of qualification)
   - Created At (timestamp)
   - Updated At (timestamp)

2. WHEN status is "Not Qualified", THE Rejection_Reason field SHALL be required and visible in UI

3. THE System SHALL allow only one "Qualified" record per lead, but multiple "Not Qualified" or "Pending" records with timestamps for audit trail

4. WHEN a lead is re-qualified after previous "Not Qualified", THE System SHALL create a new Qualification record and log the change


### Requirement 7: Lead Call Table

**User Story:** As a relationship manager, I want a complete history of every call attempt with outcome and scheduling information, so that I can track follow-up commitments and assess calling effectiveness.

#### Acceptance Criteria

1. WHEN a call is initiated or logged, THE Lead_Call table SHALL record:
   - Call ID (unique)
   - Lead ID (foreign key)
   - Called At (timestamp of call initiation)
   - Call Duration Seconds (numeric, 0 for non-connected)
   - Called By (RM name/ID)
   - Call Status (required: "Not Attempted", "Connected", "RNR", "Switch Off", "Busy", "Callback Scheduled", "Not Interested", "Invalid Number")
   - Call Outcome (required: "Connected", "Converted", "Deferred", "RNR", "Switch Off", "Busy", "Callback Requested", "Not Interested", "Invalid Number", "Other")
   - Call Notes (text: what was discussed, action items)
   - Scheduled Next Call At (nullable timestamp, only if Callback Scheduled)
   - Attempt Number (sequence counter)
   - Created At (timestamp)

2. WHEN a call is created, THE System SHALL increment the lead's noOfAttempts counter in Lead_Master or derived field

3. WHEN Scheduled_Next_Call_At is populated, THE System SHALL check 48-hour SLA and calculate KPI status

4. THE Lead_Call table SHALL support filtering by Call_Status and Date range for call center analytics

5. WHEN a call is marked as "Callback Scheduled", THE System SHALL trigger a calendar/reminder notification to the RM


### Requirement 8: Lead Product Opportunity Table

**User Story:** As a product manager, I want to track which products have been identified for each lead and their progression through sales stages, so that I can measure product penetration and revenue pipeline.

#### Acceptance Criteria

1. WHEN a product is added to a lead's portfolio, THE Lead_Product_Opportunity table SHALL record:
   - Opportunity ID (unique)
   - Lead ID (foreign key)
   - Master Product (required: one of 13 master products: Education Loan, Refinance, Test Prep, Test Voucher, Admissions, Accommodation, eSIM, Travel/Flights, Bank Account, Credit Card, Money Transfer, NRE/NRO Account, Insurance)
   - Status (required: "Not Started", "Interested", "In Progress", "Completed/Sold", "Not Interested", "Failed/Rejected", "Cancelled", "Closed")
   - Product Owner (RM assigned to manage this opportunity)
   - Amount (optional currency value)
   - Partner (optional: partner/lender name)
   - Details / Notes (optional text)
   - Transaction ID (optional foreign key to Lead_Transaction if sold)
   - Created At (timestamp)
   - Completed / Sold At (nullable timestamp)
   - Updated At (timestamp)
   - Updated By (user)

2. WHEN a product is activated for a lead, THE System SHALL create an Opportunity record with Status "Interested" and log an Activity entry

3. WHILE a product opportunity exists with Status "In Progress", THE Product_Owner shall receive weekly reminders to update status

4. WHERE a product opportunity reaches "Completed/Sold", THE System SHALL create a Lead_Transaction record and update overall Lead_Status if all required products sold

5. THE Lead_Product_Opportunity table SHALL support bulk status updates for analytics queries


### Requirement 9: Lead Transaction Table

**User Story:** As a finance officer, I want to track completed product sales linked to leads so that I can reconcile revenue and measure conversion metrics.

#### Acceptance Criteria

1. WHEN a product is sold or completed, THE Lead_Transaction table SHALL store:
   - Transaction ID (unique)
   - Lead ID (foreign key)
   - Product Opportunity ID (foreign key)
   - Product Name (reference to Master Product)
   - Transaction Amount (currency value)
   - Transaction Date (date when product was sold/completed)
   - Transaction Status ("Completed", "Pending Disbursement", "Refunded")
   - Partner / Lender (partner who facilitated transaction)
   - Reference ID (external reference like loan file ID, ticket number)
   - Notes (optional transaction notes)
   - Created At (timestamp)

2. WHEN a transaction is created, THE System SHALL check if Lead_Product_Opportunity Status is "Completed/Sold"; if not, update it

3. THE Lead_Transaction table SHALL support aggregation queries for revenue reporting by product, partner, and date


### Requirement 10: Lead Document Table

**User Story:** As a document coordinator, I want to organize and share documents collected from leads in a centralized repository without managing verification status, so that counselors and RMs can quickly access needed files.

#### Acceptance Criteria

1. WHEN a document is uploaded for a lead, THE Lead_Document table SHALL store:
   - Document ID (unique)
   - Lead ID (foreign key)
   - File Name (original filename)
   - File Size (bytes, optional)
   - Document Type / Category (required: "Passport", "Academic", "Financial", "Test Score", "University", "Visa", "Visa Approved", "Acceptance Letter", "Co-Applicant KYC", "Other")
   - Document Subcategory (optional: for organizing within category)
   - Upload Date (timestamp)
   - Uploaded By (user)
   - File URL / Path (reference to actual file storage)
   - File Format (.pdf, .jpg, .xlsx, etc.)
   - Sharing Status (Shared, Not Shared, Draft, Archived)
   - Notes (optional: description or context)
   - Created At (timestamp)
   - Updated At (timestamp)

2. THE Lead_Document table SHALL NOT include verification status, approval flags, or validation rules (document management only, not document verification workflow)

3. WHERE a document is shared, THE System SHALL log the sharing date and recipient in a separate sharing audit table

4. WHEN a document is uploaded, THE System SHALL automatically trigger virus/malware scanning before storage

5. THE Lead_Document table SHALL support filtering by Document_Type and Date range for bulk retrieval


### Requirement 11: Lead Activity Table

**User Story:** As an audit manager, I want a complete immutable log of all lead actions and state changes, so that I can track accountability and debug issues.

#### Acceptance Criteria

1. WHEN any lead operation occurs, THE Lead_Activity table SHALL record:
   - Activity ID (unique)
   - Lead ID (foreign key)
   - Timestamp (immutable creation time)
   - Actor (user or system name)
   - Activity Type (required enum: "call", "stage_change", "product_update", "assignment", "qualification", "profile_update", "document_upload", "system", "note_added")
   - Title (short description of what happened)
   - Description (longer details, may include field-level changes)
   - Related ID (optional: links to Call ID, Assignment ID, Product Opportunity ID, Document ID as appropriate)
   - Created At (timestamp, immutable)

2. WHEN a field is updated in Lead_Master, Lead_Profile, or Lead_Academic, THE System SHALL create an Activity record with type "profile_update" and include change details

3. THE Lead_Activity table SHALL have immutable records (no updates after creation, deletions only with audit logging)

4. WHEN querying lead history, THE System SHALL retrieve Activity records in reverse chronological order (most recent first)

5. WHEN generating audit reports, THE System SHALL include Timestamp, Actor, Activity_Type, and Description


### Requirement 12: Lead Priority Table

**User Story:** As a sales leader, I want to track lead priority assignments and changes over time, so that I can manage portfolio hotness and identify deprioritized opportunities.

#### Acceptance Criteria

1. WHEN a lead's priority is assigned or changed, THE Lead_Priority table SHALL record:
   - Priority ID (unique)
   - Lead ID (foreign key)
   - Priority Level (required: "Hot", "Warm", "Cold")
   - Reason (optional text explaining priority)
   - Set At (timestamp)
   - Set By (user)
   - Status (Active, Superseded - maintains history)

2. THE System SHALL maintain exactly one Active priority per lead at any time

3. WHEN priority changes, THE System SHALL create an Activity log entry with type "system"

4. WHERE a lead is Hot priority, THE System SHALL apply SLA 48-hour rule strictly and escalate if breached


---

## Lead Status & Lifecycle Requirements

### Requirement 13: Lead Status Enum and Transitions

**User Story:** As a lead manager, I want leads to progress through defined statuses reflecting their lifecycle stage, so that I can understand at a glance whether a lead is new, qualified, or closed.

#### Acceptance Criteria

1. WHEN a lead is created, THE Lead_Status SHALL be set to "New"

2. WHEN qualification is attempted but pending, THE Lead_Status SHALL transition to "Yet to be Qualified"

3. WHEN a lead completes qualification successfully, THE Lead_Status SHALL transition to "Qualified"

4. WHEN a qualified lead has active product opportunities, THE Lead_Status SHALL be "In Progress"

5. WHEN a lead engagement is paused but may resume, THE Lead_Status SHALL be "On Hold"

6. WHEN a lead is permanently concluded (not interested, unreachable, duplicate), THE Lead_Status SHALL be "Closed" with a closure reason captured

7. WHEN a lead has been closed for 90+ days or marked for removal, THE Lead_Status SHALL be "Archived" (read-only)

8. THE System SHALL NOT allow direct manual Lead_Status updates; status shall only change through business logic transitions


---

## Journey Stage & SLA Requirements

### Requirement 14: Journey Stage as Prominent Lead Indicator

**User Story:** As an RM, I want to see the student's current journey stage prominently at the top of the lead view, so that I understand where they are in their international education journey.

#### Acceptance Criteria

1. WHEN displaying a lead detail view, THE UI SHALL show Journey_Stage prominently (header section, high contrast)

2. WHEN a journey stage is updated via Lead_Profile, THE System SHALL timestamp the change and log an Activity entry with type "stage_change"

3. THE Journey_Stage field SHALL be editable only by RMs and managers (not auto-set by system)

4. WHERE a student progresses to Visa stage, THE System SHALL lock further Lead_Profile updates except Final_University and Intake


### Requirement 15: SLA 48-Hour Rule and Escalation Logic

**User Story:** As a sales operations manager, I want a consistent SLA rule that any uncontacted lead must have contact attempted within 48 hours, so that I can track escalations and breaches.

#### Acceptance Criteria

1. WHEN a lead is assigned to an RM, THE System SHALL calculate SLA_Due_At = Created_At + 48 hours

2. WHEN Current_Time > SLA_Due_At and no call has been completed, THE System SHALL set KPI_Status to "Overdue"

3. WHEN KPI_Status is "Overdue", THE System SHALL flag Escalation_Status as "Escalated" and notify the lead's manager

4. WHEN an RM connects with a lead (call_status = "Connected"), THE SLA_Due_At SHALL reset to Current_Time + 48 hours for next contact

5. WHERE an escalation is triggered, THE System SHALL create an Activity log entry with actor "System Escalation" and notify manager email


---

## Lead Priority Requirements

### Requirement 16: Lead Priority Assignment

**User Story:** As a portfolio manager, I want to categorize leads as Hot, Warm, or Cold based on engagement likelihood, so that I can allocate RM capacity efficiently.

#### Acceptance Criteria

1. WHEN a lead shows strong signals (Qualified + In Progress + Hot product opportunities), THE System MAY auto-assign Priority "Hot"

2. WHERE an RM manually assigns priority, THE Lead_Priority table SHALL record the change with timestamp and reason

3. WHILE a lead has Priority "Hot", THE SLA and escalation rules SHALL apply strictest enforcement

4. WHERE a lead has Priority "Cold", THE SLA enforcement MAY be relaxed (informational, not required)

5. WHEN priority changes, THE System SHALL create an audit trail in Lead_Priority history


---

## UI Section Reorganization Requirements

### Requirement 17: Lead Profile / Study Plan Section

**User Story:** As a counselor, I want to view and edit all study plan information in one organized section, so that I can manage course, university, and intake decisions efficiently.

#### Acceptance Criteria

1. THE UI "Profile / Study Plan" section SHALL display and allow editing of:
   - Student Name (from Lead_Master)
   - Phone & Email (from Lead_Master)
   - Destination Countries of Interest (from Lead_Profile, array)
   - Final Selected Country (from Lead_Profile)
   - Universities of Interest (from Lead_Profile, array)
   - Final Selected University (from Lead_Profile)
   - Degree Type (Bachelor's, Master's, PhD, Diploma, Other)
   - Course Name / Program (from Lead_Profile)
   - Target Intake (from Lead_Profile)
   - Journey Stage (prominently displayed, from Lead_Profile)

2. WHEN user updates any field in this section, THE System SHALL draft the changes and show "Unsaved" indicator

3. WHEN user saves, THE System SHALL update corresponding Lead_Master or Lead_Profile records and create Activity logs

4. WHERE Journey_Stage is "Visa" or later, THE System SHALL make University and Intake read-only


### Requirement 18: Indian Academic Background Section

**User Story:** As an admissions officer, I want to view detailed academic history of students in India, so that I can assess eligibility for programs and loans.

#### Acceptance Criteria

1. THE UI "Indian Academic Background" section SHALL organize and display:
   - 10th Grade: Board, School, Year, Marks/GPA
   - 12th Grade: Board, School, Year, Marks/GPA
   - UG (Undergraduate): College, Degree, Major, GPA, Start/End Years
   - PG (Postgraduate): College, Degree, GPA, Start/End Years
   - Work Experience: Company, Role, Duration (text field)
   - Tests Taken: Array of tests with scores, dates
   - Achievements: Scholarships, awards, publications (text field)

2. WHEN viewing this section, THE System SHALL populate fields from Lead_Academic table

3. WHEN editing, THE System SHALL allow optional fields to remain empty (students may not have all history)

4. WHEN test results are updated, THE System SHALL allow entry of multiple test attempts with different dates


### Requirement 19: Financial Profile Section

**User Story:** As a credit analyst, I want to view funding and co-applicant information in a dedicated section, so that I can assess loan feasibility.

#### Acceptance Criteria

1. THE UI "Financial Profile" section SHALL display:
   - Funding Plan (dropdown: "Will Need Loan", "Self Fund", "Unknown")
   - Approximate Funding Requirement (currency input)
   - Co-Applicant Name (text)
   - Co-Applicant Relationship (dropdown)
   - Co-Applicant Contact (phone number)
   - Co-Applicant Email (email)

2. WHEN Funding_Plan is "Will Need Loan", THE System SHALL enable Education Loan product opportunity tracking

3. WHEN co-applicant fields are populated, THE System SHALL create Activity log entry with "Financial Profile Updated"

4. WHEN Financial_Profile section opens, THE System SHALL display any linked EducationLoanProfile in expanded view (if exists)


### Requirement 20: Documents & Files Section

**User Story:** As a document coordinator, I want to organize documents by type and manage sharing, so that I can ensure all necessary files are collected and accessible.

#### Acceptance Criteria

1. THE UI "Documents & Files" section SHALL display a table with columns:
   - File Name (clickable to preview/download)
   - Document Type (category)
   - Upload Date
   - Uploaded By
   - Sharing Status (Shared, Not Shared, Draft, Archived)

2. WHEN user clicks "Upload Document", THE System SHALL open file picker and allow selection of Document_Type

3. WHEN file is uploaded, THE System SHALL create Lead_Document record and show success confirmation

4. WHEN user marks document as "Shared", THE System SHALL log sharing date and create audit trail

5. THE Documents section SHALL NOT include verification status, validation rules, or approval workflows (document storage only)


### Requirement 21: Calling / Interaction Section

**User Story:** As an RM, I want to view all call attempts and schedule follow-ups in one place, so that I can manage contact cadence and track conversation progress.

#### Acceptance Criteria

1. THE UI "Calling / Interaction" section SHALL display:
   - Recent Call History table with columns: Date/Time, Duration, RM Name, Status (Connected/RNR/etc), Outcome, Notes
   - Total Attempts counter
   - Last Call timestamp and outcome
   - Next Scheduled Call (if any) with countdown timer
   - "Log Call" button to quickly add new call record
   - "Schedule Callback" button to set next call time

2. WHEN user clicks "Log Call", THE System SHALL open quick-entry form with fields: Duration, Outcome, Notes, Schedule Next Call (optional)

3. WHEN call is logged, THE System SHALL:
   - Create Lead_Call record
   - Increment call attempt counter
   - Update lastCallAt and lastCallOutcome in Lead_Master
   - Create Activity log entry
   - Check SLA and update KPI_Status if needed

4. WHERE a callback is scheduled, THE System SHALL set Scheduled_Next_Call_At and trigger RM reminder notification


### Requirement 22: Product Opportunities Section

**User Story:** As a product manager, I want to see all product opportunities for a lead and their progression stages, so that I can identify cross-sell potential and track revenue pipeline.

#### Acceptance Criteria

1. THE UI "Product Opportunities" section SHALL display:
   - List of products with product icon, name, status badge
   - "Add Product" button showing all 13 master products with quick-add toggles
   - For each active product, expandable card showing:
     - Status (dropdown to change)
     - Amount (if applicable)
     - Partner / Lender
     - Product Owner (RM assigned)
     - Notes / Details
     - For Education Loan: "Open Full Loan Profile" button linking to EducationLoanProfile

2. WHEN user toggles product ON, THE System SHALL create Lead_Product_Opportunity record with Status "Interested" and log Activity

3. WHEN user updates product Status, THE System SHALL update Lead_Product_Opportunity and create Activity log

4. WHEN product reaches "Completed/Sold", THE System SHALL:
   - Create Lead_Transaction record
   - Link Transaction_ID to Opportunity
   - Log Activity with "Product Sold"

5. WHERE product is Education Loan, THE System SHALL display special section linking to full EducationLoanProfile for loan underwriting


---

## Data Rules & Constraints Requirements

### Requirement 23: Lead ID Uniqueness and Mobile Normalization

**User Story:** As a data quality manager, I want to ensure each student has exactly one lead record using normalized mobile numbers, so that I can prevent duplicate lead creation.

#### Acceptance Criteria

1. WHEN a new lead is created, THE System SHALL normalize mobile number (remove +, spaces, dashes, leaving only digits)

2. WHEN normalized mobile number already exists in Lead_Master, THE System SHALL:
   - Flag the incoming lead as DUPLICATE
   - Return reference to existing Lead_ID
   - Prevent creation of new Lead_Master record
   - Create an Activity log entry noting the duplicate detection

3. THE Lead_ID format SHALL be L + 6-digit sequence (e.g., L000123, L001500)

4. WHERE a lead record is very old (90+ days with no activity), THE System MAY consolidate duplicates if new high-confidence match found


### Requirement 24: One Lead Status Per Lead (Current Snapshot)

**User Story:** As a lead manager, I want exactly one current Lead_Status per lead at any time, so that reporting is unambiguous.

#### Acceptance Criteria

1. THE Lead_Master table SHALL include current_lead_status field that reflects the lead's current lifecycle stage

2. WHEN Lead_Status is updated, THE System SHALL create a new record in a separate Lead_Status_History table (immutable audit trail)

3. WHERE Lead_Status would change, THE System SHALL validate the transition is allowed (e.g., New → Yet to be Qualified → Qualified → In Progress or Closed or On Hold)


### Requirement 25: Product Opportunity Independent of Lead Status

**User Story:** As a product manager, I want product progression to be independent from lead status, so that I can track product sales even if lead lifecycle status changes.

#### Acceptance Criteria

1. WHEN a lead's Lead_Status changes to Closed, ANY active Lead_Product_Opportunity SHALL NOT be auto-closed (product opportunity lives on)

2. WHEN a lead is re-opened from Closed status, THE System SHALL preserve all historical product opportunity records

3. WHEN a product reaches "Completed/Sold", THE Lead_Status may or may not change depending on remaining opportunities


### Requirement 26: Call History Never Deleted

**User Story:** As an auditor, I want immutable call history, so that I can verify RM compliance and investigate disputes.

#### Acceptance Criteria

1. WHEN a Lead_Call record is created, THE System SHALL mark it immutable (no updates or deletes allowed)

2. IF an error in a call record must be corrected, THE System SHALL create a new corrected record and mark the original "Superseded"

3. THE Lead_Call table SHALL support row-level audit logging with who accessed/viewed the record


---

## Backend Data Structure Requirements

### Requirement 27: SQL Schema for Lead Master Table

**User Story:** As a database architect, I want a well-defined SQL schema for Lead_Master, so that I can ensure data integrity and performance.

#### Acceptance Criteria

1. THE Lead_Master table SHALL have columns:
   ```sql
   CREATE TABLE lead_master (
     lead_id VARCHAR(10) PRIMARY KEY,
     student_name VARCHAR(255) NOT NULL,
     mobile_number VARCHAR(20) NOT NULL UNIQUE,
     mobile_country_code VARCHAR(5) DEFAULT '91' NOT NULL,
     email VARCHAR(255),
     source_code VARCHAR(50) NOT NULL,
     partner_code VARCHAR(50),
     bde_code VARCHAR(50),
     created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
     updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
     lead_status VARCHAR(30) DEFAULT 'New' NOT NULL,
     current_assignment_id VARCHAR(50),
     INDEX idx_mobile (mobile_number),
     INDEX idx_source (source_code),
     INDEX idx_created (created_at)
   );
   ```

2. WHEN a new lead_master record is inserted, THE System SHALL auto-generate lead_id using sequence

3. WHEN any field is updated, THE System SHALL update updated_at to CURRENT_TIMESTAMP automatically


### Requirement 28: SQL Schema for All Normalized Tables

**User Story:** As a database architect, I want SQL schemas for all 11 normalized tables, so that developers can build the backend data layer.

#### Acceptance Criteria

1. THE System SHALL provide CREATE TABLE statements for:
   - lead_master (primary key: lead_id)
   - lead_profile (primary key: profile_id, foreign key: lead_id)
   - lead_academic (primary key: academic_id, foreign key: lead_id)
   - lead_financial (primary key: financial_id, foreign key: lead_id, one-to-one with lead)
   - lead_assignment (primary key: assignment_id, foreign key: lead_id, one-to-many)
   - lead_qualification (primary key: qualification_id, foreign key: lead_id, one-to-many)
   - lead_call (primary key: call_id, foreign key: lead_id, one-to-many)
   - lead_product_opportunity (primary key: opportunity_id, foreign key: lead_id, one-to-many)
   - lead_transaction (primary key: transaction_id, foreign keys: lead_id, opportunity_id, one-to-many)
   - lead_document (primary key: document_id, foreign key: lead_id, one-to-many)
   - lead_activity (primary key: activity_id, foreign key: lead_id, one-to-many)
   - lead_priority (primary key: priority_id, foreign key: lead_id, one-to-many)
   - lead_status_history (primary key: history_id, foreign key: lead_id, one-to-many, immutable)

2. EACH foreign key SHALL reference lead_master.lead_id with referential integrity constraint

3. EACH timestamp column SHALL use TIMESTAMP data type with automatic CURRENT_TIMESTAMP default

4. EACH table SHALL have created_at (immutable) and updated_at (mutable) timestamps except for immutable audit tables


---

## Frontend Data Migration Requirements

### Requirement 29: Migration from Monolithic StudentLead to Normalized Schema

**User Story:** As a development lead, I want a clear migration strategy from the old StudentLead type to new normalized schema, so that I can transition the UI incrementally.

#### Acceptance Criteria

1. WHEN the new normalized schema is deployed, THE System SHALL run a migration script that:
   - Reads all existing StudentLead records
   - Extracts fields and populates lead_master table
   - Populates lead_profile with study plan fields
   - Populates lead_academic with academic fields
   - Populates lead_financial with funding fields
   - Creates initial lead_assignment records
   - Creates initial lead_qualification records
   - Creates lead_activity migration records with type "system"

2. THE migration script SHALL create Lead_ID using existing lead.id field

3. WHERE a StudentLead field doesn't map to the new schema, THE System SHALL log the unmapped field and skip (with warning)

4. AFTER migration, THE System SHALL validate data integrity (all required fields populated, foreign keys valid)


### Requirement 30: Backward Compatibility View for Frontend

**User Story:** As a frontend developer, I want to query normalized data and reconstruct a StudentLead object if needed, so that I can transition UI incrementally without rewriting all components immediately.

#### Acceptance Criteria

1. THE API SHALL provide a /leads/{leadId} endpoint that returns StudentLead-shaped object reconstructed from normalized tables

2. WHEN frontend requests a lead, THE API SHALL JOIN all normalized tables and return flattened StudentLead object for backward compatibility

3. WHEN this compatibility view is used, THE System SHALL log "Legacy StudentLead fetch" for eventual deprecation tracking

4. NEW UI sections SHALL query normalized tables directly via dedicated API endpoints:
   - /leads/{leadId}/profile
   - /leads/{leadId}/academic
   - /leads/{leadId}/financial
   - /leads/{leadId}/calls
   - /leads/{leadId}/products
   - /leads/{leadId}/documents
   - /leads/{leadId}/activity


---

## Acceptance Criteria Testing Patterns

### Requirement 31: Round-Trip Properties for Data Consistency

**User Story:** As a QA engineer, I want to verify data round-trip consistency across system operations, so that I can ensure data integrity.

#### Acceptance Criteria

1. PROPERTY: FOR ALL leads, serializing to JSON then deserializing SHALL produce equivalent lead object (parse → print → parse round-trip)

2. PROPERTY: FOR ALL Call records created, storing then retrieving SHALL return identical Call object with same timestamp and outcome

3. PROPERTY: FOR ALL Academic records, updating then fetching SHALL preserve all entered data without loss

4. WHEN a lead transitions statuses, THE System SHALL verify new_status ≠ old_status AND previous_status → new_status is valid transition


### Requirement 32: Invariant Properties for Data Constraints

**User Story:** As a QA engineer, I want properties that verify system invariants, so that I can detect constraint violations.

#### Acceptance Criteria

1. INVARIANT: FOR ALL leads, exactly_one(lead_id) = true (one active lead per student)

2. INVARIANT: FOR ALL leads, count(active_assignments) ≤ 1 (at most one active assignment per lead)

3. INVARIANT: FOR ALL leads, lead_created_at ≤ first_assignment_at ≤ current_time (temporal ordering)

4. INVARIANT: FOR ALL calls, call_duration ≥ 0 AND call_duration ≤ 7200 (call is 0 to 2 hours)

5. INVARIANT: FOR ALL products, product_created_at ≤ product_sold_at OR product_sold_at IS NULL (sold after created)


---

## Completion Percentage Calculation Requirement

### Requirement 33: Inbound Lead Completion Percentage

**User Story:** As a lead intelligence analyst, I want to know what percentage of profile fields are populated for inbound leads, so that I can identify leads needing profile completion.

#### Acceptance Criteria

1. WHEN a lead is created via inbound intake (isInboundRaw = true), THE System SHALL calculate inboundCompletionPct:
   - Base fields: studentName, mobileNumber, email, destinationCountry, sourceCode (5 mandatory)
   - Extended fields: course, intake, finalUniversity, fundingPlan, journey_stage, tests_interested (6 additional)
   - Academic fields: 12th_marks, UG_GPA, PG_details, work_experience (4 academic)
   - Financial fields: funding_requirement, co_applicant_name (2 financial)
   - Total: 21 fields tracked
   - Formula: (populated_fields / 21) * 100 = completionPct

2. WHERE inboundCompletionPct < 50%, THE System SHALL flag lead as "Needs Profile Completion"

3. WHEN any field is updated via UI, THE System SHALL recalculate inboundCompletionPct and update Lead_Master


---

## References to Existing Features

### Requirement 34: Integration with Existing EducationLoanProfile

**User Story:** As a developer, I want EducationLoanProfile to link cleanly to the new Lead_Product_Opportunity table, so that loan underwriting workflows remain intact.

#### Acceptance Criteria

1. WHEN an Education Loan product opportunity is created, THE System SHALL link to an optional EducationLoanProfile

2. WHERE EducationLoanProfile exists, THE Lead_Product_Opportunity.transactionId MAY reference the loan file

3. WHEN Education Loan product reaches "Completed/Sold", THE System SHALL check if associated EducationLoanProfile.loanStage = "Fully Disbursed"


---

## Summary

This requirements document specifies a complete restructuring of the Lead Management System from a monolithic StudentLead type into 12 specialized normalized tables with clear separation of concerns. The new schema maintains data integrity through:

- **One Lead ID per student** (normalized by mobile number)
- **Immutable audit trails** (Lead_Activity, Lead_Call history never deleted)
- **Clear historical tracking** (Lead_Assignment, Lead_Qualification, Lead_Priority with full history)
- **Independent product progression** (Lead_Product_Opportunity separate from Lead_Status)
- **UI reorganization** into 6 logical sections matching business workflows
- **SLA enforcement** via 48-hour rule with escalation logic
- **Data migration strategy** from existing StudentLead with backward compatibility
- **Testing patterns** for round-trip consistency and invariant verification

The implementation should follow database normalization principles, create proper foreign key relationships, enforce referential integrity, and provide API endpoints for both legacy compatibility and new normalized queries.

