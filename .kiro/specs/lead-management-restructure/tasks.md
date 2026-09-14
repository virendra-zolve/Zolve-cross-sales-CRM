# Implementation Plan: Lead Management System Restructuring

## Overview

This plan transforms the Lead Management System from a monolithic StudentLead type into a normalized, 12-table database schema. Implementation progresses through 7 phases: data models, backend APIs, data migration, UI components, feature integration, testing, and finalization. Each task is granular (2-4 hours) with incremental validation. Optional testing tasks are marked with `*`.

---

## Phase 1: Foundation - Data Models & Types

- [x] 1.1 Create normalized TypeScript interfaces for all 12 tables
  - Create `src/types/normalized.ts` with Lead_Master, Lead_Profile, Lead_Academic, Lead_Financial, Lead_Assignment, Lead_Qualification, Lead_Call, Lead_Product_Opportunity, Lead_Transaction, Lead_Document, Lead_Activity, Lead_Priority interfaces
  - Define all fields matching SQL schema from Requirement 27-28
  - Add field-level JSDoc comments for clarity
  - _Requirements: 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12_
  - **COMPLETED:** All interfaces defined in `src/types/normalized.ts`

- [x] 1.2 Create enums and utility types
  - Extend `src/types/normalized.ts` with LeadStatus enum: "New", "Yet to be Qualified", "Qualified", "In Progress", "On Hold", "Closed", "Archived"
  - Add JourneyStage enum (already in types.ts, verify completeness)
  - Create QualificationStatus, ProductOpportunityStatus, CallOutcomeStatus enums
  - Add utility types for API responses: ApiResponse<T>, PaginatedResponse<T>, ErrorResponse
  - _Requirements: 13, 14_
  - **COMPLETED:** All enums and utility types defined

- [x] 1.3 Create API response reconstruction types
  - Add `ReconstructedStudentLead` type to src/types/normalized.ts for backward compatibility (flattened view joining all normalized tables)
  - Document which source fields map to which tables
  - Add helper type for partial updates: `LeadUpdatePayload<T>`
  - _Requirements: 30_
  - **COMPLETED:** ReconstructedStudentLead type defined

---

## Phase 2: Backend API Layer - Core Endpoints

- [x] 2.1 Implement POST /api/leads for lead creation
  - Create `src/api/leads.ts` with POST handler
  - Accept minimal inbound fields (studentName, mobileNumber, email, sourceCode, destinationCountry, partner/BDE codes)
  - Normalize mobile number, check for duplicates (Requirement 23)
  - Generate Lead_ID using format "L" + 6-digit sequence
  - Create Lead_Master record
  - Create initial Lead_Profile, Lead_Academic, Lead_Financial records (empty/default values)
  - Create initial Lead_Assignment record with status "Active"
  - Calculate inboundCompletionPct (Requirement 33)
  - Return created lead with full Lead_Master fields
  - _Requirements: 1, 23, 33_

- [ ] 2.2 Implement GET /api/leads/:id - retrieve single lead
  - Create GET handler accepting leadId parameter
  - Query Lead_Master table
  - Return lead data with current status and assignment info
  - Handle non-existent lead with 404
  - _Requirements: 1_

- [ ] 2.3 Implement GET /api/leads/:id/profile - retrieve study plan
  - Query Lead_Profile table for given leadId
  - Return profile with country, universities, degree, course, intake, tests_interested, readiness_checklist
  - Calculate journey_stage prominence for display (Requirement 14)
  - _Requirements: 2, 14, 17_

- [ ] 2.4 Implement PUT /api/leads/:id/profile - update study plan
  - Update Lead_Profile fields (no Lead_Master changes in this endpoint)
  - Validate journey_stage transitions if changed (Requirement 14)
  - If journey_stage moves to "Visa" or later, make Final_University and Intake read-only (set flag)
  - Create Lead_Activity record with type "stage_change" or "profile_update"
  - Update inboundCompletionPct in Lead_Master
  - Return updated profile
  - _Requirements: 2, 14, 17_

- [ ] 2.5 Implement GET /api/leads/:id/academic - retrieve academic history
  - Query Lead_Academic table
  - Return all academic fields including 10th/12th/UG/PG details, tests_completed with scores, work_experience, achievements
  - Format test scores as array with dates (Requirement 3)
  - _Requirements: 3, 18_

- [ ] 2.6 Implement PUT /api/leads/:id/academic - update academic profile
  - Update Lead_Academic fields
  - Support multiple test attempts with dates
  - Create Activity record with type "profile_update" including field-level changes list
  - Update inboundCompletionPct
  - Return updated academic data
  - _Requirements: 3, 18_

- [ ] 2.7 Implement GET /api/leads/:id/financial - retrieve financial info
  - Query Lead_Financial table
  - Return funding_plan, funding_requirement, co_applicant fields
  - _Requirements: 4, 19_

- [ ] 2.8 Implement PUT /api/leads/:id/financial - update financial profile
  - Update Lead_Financial fields
  - If funding_plan changes to "Will Need Loan", enable Education Loan product tracking (check in product endpoint)
  - Create Activity record with type "profile_update"
  - Update inboundCompletionPct
  - Return updated financial data
  - _Requirements: 4, 19_

- [ ] 2.9 Implement GET /api/leads/:id/calls - retrieve call history
  - Query Lead_Call table ordered by called_at DESC
  - Return call records with called_at, duration, called_by, status, outcome, notes, scheduled_next_call_at
  - Include total attempt count and last call details
  - _Requirements: 7, 21_

- [ ] 2.10 Implement POST /api/leads/:id/calls - log new call
  - Create Lead_Call record with called_at, duration, called_by, status, outcome, notes
  - If scheduled_next_call_at provided, set it
  - Increment noOfAttempts in Lead_Master
  - Check SLA: if no previous call, calculate SLA_due_at (current_time + 48 hours); if call Connected, reset SLA_due_at
  - Check if SLA breached (current_time > SLA_due_at and not Connected): set KPI_Status "Overdue" and escalation_status "Escalated"
  - Create Activity record with type "call"
  - Create escalation Activity if KPI breached
  - Return created call record
  - _Requirements: 7, 15, 21_

- [ ] 2.11 Implement GET /api/leads/:id/products - retrieve product opportunities
  - Query Lead_Product_Opportunity table for leadId
  - Return all product opportunities with status, amount, partner, product_owner
  - Include transaction_id if product sold
  - _Requirements: 8, 22_

- [ ] 2.12 Implement POST /api/leads/:id/products - add product opportunity
  - Create Lead_Product_Opportunity record with master_product, status "Interested", product_owner
  - Create Activity record with type "product_update"
  - For Education Loan product, check if EducationLoanProfile exists and link via transaction_id reference (Requirement 34)
  - Return created opportunity
  - _Requirements: 8, 22, 34_

- [ ] 2.13 Implement PUT /api/leads/:id/products/:opportunityId - update product status
  - Update Lead_Product_Opportunity status
  - If status reaches "Completed/Sold":
    - Create Lead_Transaction record with product_opportunity_id reference
    - Update opportunity's transaction_id to link the transaction
    - Create Activity record with type "product_update" and details "Product Sold"
  - Return updated opportunity
  - _Requirements: 8, 9, 22_

- [ ] 2.14 Implement GET /api/leads/:id/documents - retrieve documents
  - Query Lead_Document table
  - Return documents with file_name, category, upload_date, uploaded_by, sharing_status
  - Support filtering by category
  - _Requirements: 10, 20_

- [ ] 2.15 Implement POST /api/leads/:id/documents - upload document
  - Create Lead_Document record with file metadata
  - Validate document_type is in predefined list (Passport, Academic, Financial, Test Score, University, Visa, etc.)
  - Store file reference/path (assume file storage handled separately)
  - Create Activity record with type "document_upload"
  - Return created document record
  - _Requirements: 10, 20_

- [ ] 2.16 Implement PUT /api/leads/:id/documents/:documentId - mark shared
  - Update Lead_Document sharing_status to "Shared"
  - Update sharing audit trail (timestamp shared, who shared)
  - Return updated document
  - _Requirements: 10, 20_

- [ ] 2.17 Implement GET /api/leads/:id/activity - retrieve activity log
  - Query Lead_Activity table ordered by timestamp DESC
  - Return activities with timestamp, actor, type, title, description, related_id
  - _Requirements: 11, 26_

---

## Phase 3: Backend API Layer - Advanced Features

- [ ] 3.1 Implement POST /api/leads/:id/assign - assignment management
  - Create Lead_Assignment record with assigned_to, assigned_by, team, status "Active"
  - Mark previous assignment as "Superseded"
  - Maintain exactly one Active assignment (Requirement 5)
  - Create Activity record with type "assignment" linking to assignment_id
  - Return assignment record with history
  - _Requirements: 5, 24_

- [ ] 3.2 Implement GET /api/leads/:id/assignment-history - full assignment history
  - Query Lead_Assignment table for leadId with all statuses
  - Return full history with assigned_at, assigned_by, team, assigned_to, status for audit trail
  - _Requirements: 5_

- [ ] 3.3 Implement PUT /api/leads/:id/qualification - update qualification status
  - Create or update Lead_Qualification record
  - Only allow one "Qualified" record per lead (Requirement 6)
  - If status "Not Qualified", require rejection_reason from predefined list (Requirement 6)
  - Record qualified_by, qualification_completed_at, readiness_checklist snapshot
  - Update Lead_Master lead_status based on qualification transition logic (Requirement 13)
  - Create Activity record with type "qualification"
  - Return qualification record
  - _Requirements: 6, 13, 24_

- [ ] 3.4 Implement GET /api/leads/:id/qualification - retrieve qualification records
  - Query Lead_Qualification table for leadId (may be multiple for audit trail)
  - Return records ordered by created_at DESC
  - Include all fields: status, rejection_reason, qualified_by, completed_at, readiness_checklist_snapshot
  - _Requirements: 6_

- [ ] 3.5 Implement POST /api/leads/:id/priority - set lead priority
  - Create Lead_Priority record with priority_level ("Hot", "Warm", "Cold"), reason, set_by
  - Mark previous active priority as "Superseded"
  - Maintain exactly one Active priority per lead (Requirement 12)
  - Create Activity record with type "system"
  - If priority "Hot", enforce stricter SLA in subsequent calls (track for escalation)
  - Return priority record
  - _Requirements: 12, 15, 16_

- [ ] 3.6 Implement GET /api/leads/:id/priority-history - priority audit trail
  - Query Lead_Priority table with all records (Active and Superseded)
  - Return history ordered by set_at DESC
  - _Requirements: 12_

- [ ] 3.7 Implement PUT /api/leads/:id/status - lead status transitions
  - Validate status transition is allowed: New → Yet to be Qualified → Qualified → In Progress/On Hold/Closed/Archived
  - Update Lead_Master current_lead_status
  - Create Lead_Status_History record (immutable audit trail, Requirement 24)
  - If status "Closed", require closure_reason from predefined list
  - Product opportunities SHALL NOT auto-close (Requirement 25)
  - Create Activity record with type "stage_change"
  - Return updated lead status
  - _Requirements: 13, 24, 25_

- [ ] 3.8 Implement GET /api/leads/:id/status-history - status transitions audit
  - Query Lead_Status_History table (read-only immutable)
  - Return all transitions ordered by created_at DESC
  - _Requirements: 24_

- [ ] 3.9 Implement POST /api/leads/check-duplicate - duplicate detection
  - Accept mobile_number and mobile_country_code
  - Normalize mobile number
  - Query Lead_Master for existing record with same normalized mobile
  - Return duplicate_lead_id if found, else null
  - Create Activity record in found lead's activity log noting duplicate attempt
  - _Requirements: 1, 23_

- [ ] 3.10 Implement GET /api/leads/:id/sla-status - SLA calculation endpoint
  - Query most recent Lead_Call with "Connected" outcome
  - Calculate SLA_due_at = last_connected_at + 48 hours (or created_at + 48 hours if no calls)
  - Calculate time_remaining or time_overdue
  - Check if priority is "Hot" for stricter enforcement
  - Return sla_status: "On Track" or "Overdue", time_remaining_hours, escalation_required
  - _Requirements: 15_

- [ ] 3.11 Implement GET /api/leads/:id/backward-compat - reconstruct StudentLead (legacy view)
  - Query all normalized tables for leadId
  - JOIN and flatten into ReconstructedStudentLead object
  - Map all normalized fields back to StudentLead interface shape
  - Log "Legacy StudentLead fetch" activity
  - Return flattened object for backward compatibility with existing UI
  - _Requirements: 30_

---

## Phase 4: Data Migration & Validation

- [ ] 4.1 Create migration script to populate normalized tables
  - Create `src/migrations/migrateToNormalized.ts`
  - Read all existing StudentLead records from data source
  - For each StudentLead:
    - Create Lead_Master with lead_id (use existing id), student_name, mobile_number, email, source_code, etc.
    - Create Lead_Profile from destination_country, universities_of_interest, final_university, course, intake, tests_interested, readiness_checklist
    - Create Lead_Academic from academic fields (10th/12th/UG/PG grades, tests, work_experience)
    - Create Lead_Financial from funding_plan, co_applicant fields
    - Create initial Lead_Assignment from lead_owner, lead_owner_team, lead_assigned_at
    - Create initial Lead_Qualification from qualification_status, qualified_by, qualification_completed_at, readiness_checklist snapshot
    - Create Lead_Activity migration records for each StudentLead with type "system" describing migration
  - Log all unmapped fields with warnings
  - _Requirements: 29_

- [ ] 4.2 Create data validation script post-migration
  - Create `src/migrations/validateMigration.ts`
  - Verify all Lead_Master records have valid lead_id, student_name, mobile_number
  - Verify all foreign keys reference existing Lead_Master records
  - Verify exactly one Active assignment per lead (Requirement 5)
  - Verify exactly one Active qualification per lead (Requirement 6)
  - Verify exactly one Active priority per lead (Requirement 12)
  - Verify all Lead_Call records have immutable timestamps
  - Report counts and any violations
  - _Requirements: 29_

---

## Phase 5: UI Components - Lead Detail Sections

- [ ] 5.1 Refactor LeadDetailView into section component architecture
  - Modify `src/components/LeadDetailView.tsx` to remove monolithic structure
  - Create wrapper component that loads all normalized data via API
  - Create section component import structure
  - Implement unsaved changes detection at wrapper level (track dirty state per section)
  - Add section navigation sidebar (tabs/menu for each section)
  - Implement save/cancel/reset buttons at wrapper level
  - _Requirements: 17, 18, 19, 20, 21, 22_

- [ ] 5.2 Create LeadProfileSection component (Study Plan)
  - Create `src/components/sections/LeadProfileSection.tsx`
  - Display fields from Lead_Profile: final_country, universities_of_interest, final_university, degree_type, course, target_intake, tests_interested_in, readiness_checklist
  - Show Journey_Stage prominently (Requirement 14)
  - Allow editing of all fields
  - Make Final_University and Intake read-only if journey_stage is "Visa" or later
  - Track dirty state for section
  - _Requirements: 2, 14, 17_

- [ ] 5.3 Create LeadAcademicSection component
  - Create `src/components/sections/LeadAcademicSection.tsx`
  - Display 10th/12th/UG/PG fields from Lead_Academic
  - Display tests_completed with score and date (allow multiple attempts)
  - Display work_experience text field
  - Display achievements text field
  - Allow editing of all fields
  - Track dirty state
  - _Requirements: 3, 18_

- [ ] 5.4 Create LeadFinancialSection component
  - Create `src/components/sections/LeadFinancialSection.tsx`
  - Display funding_plan dropdown (Will Need Loan / Self Fund / Unknown)
  - Display funding_requirement currency input
  - Display co_applicant fields: name, relationship, contact, email
  - Allow editing of all fields
  - Enable Education Loan product tracking section when funding_plan is "Will Need Loan"
  - Link to EducationLoanProfile if exists (Requirement 34)
  - Track dirty state
  - _Requirements: 4, 19, 34_

- [ ] 5.5 Create LeadDocumentsSection component
  - Create `src/components/sections/LeadDocumentsSection.tsx`
  - Display table with File Name, Document Type, Upload Date, Uploaded By, Sharing Status
  - Implement "Upload Document" button with file picker and category selection
  - Implement "Share Document" action button per row
  - Filter by document category (Passport, Academic, Financial, Test Score, etc.)
  - Implement document preview/download (links to file storage)
  - Track section state for upload progress
  - _Requirements: 10, 20_

- [ ] 5.6 Create LeadCallingSection component
  - Create `src/components/sections/LeadCallingSection.tsx`
  - Display Recent Call History table: Date/Time, Duration, RM Name, Status, Outcome, Notes (paginated)
  - Display Total Attempts counter
  - Display Last Call timestamp and outcome
  - Display Next Scheduled Call with countdown timer
  - Implement "Log Call" quick-entry modal with fields: Duration, Outcome, Notes, Schedule Next Call (optional)
  - Implement "Schedule Callback" button
  - On call log, invoke POST /api/leads/:id/calls and refresh history
  - Display SLA_Status indicator and KPI_Status badge (On Track / Overdue)
  - _Requirements: 7, 15, 21_

- [ ] 5.7 Create LeadProductsSection component
  - Create `src/components/sections/LeadProductsSection.tsx`
  - Display list of active products with status badge, amount, partner
  - Implement "Add Product" button showing all 13 master products with quick-toggle
  - For each product, show expandable card with: Status (dropdown), Amount, Partner, Product Owner, Notes
  - For Education Loan product, add "Open Full Loan Profile" button linking to EducationLoanDetailView
  - On product add/status change, invoke POST/PUT /api/leads/:id/products and refresh list
  - _Requirements: 8, 22, 34_

- [ ] 5.8 Create LeadDetailView wrapper with section coordination
  - Modify `src/components/LeadDetailView.tsx` to compose all section components
  - Load leadId from route params
  - On component mount, fetch lead data from GET /api/leads/:id/backward-compat and all normalized endpoints
  - Implement local state for each section's dirty flag
  - Implement global "Unsaved Changes" warning (prevent route navigation if dirty)
  - Implement "Save All", "Reset", "Cancel" buttons at top
  - On Save, validate all sections and invoke their PUT endpoints sequentially
  - Show success/error toast notifications
  - _Requirements: 17, 18, 19, 20, 21, 22_

---

## Phase 6: Feature Integration

- [ ] 6.1 Integrate SLA 48-hour enforcement in call logging
  - When POST /api/leads/:id/calls is invoked (done in Phase 2.10)
  - Check if KPI_Status becomes "Overdue" (no call within 48 hours)
  - Create escalation Activity record with actor "System Escalation"
  - Notify manager via email (assume email service available)
  - Set Escalation_Status "Escalated" in Lead_Master
  - _Requirements: 15_

- [ ] 6.2 Integrate priority-based SLA enforcement
  - When priority is set to "Hot" (Phase 3.5 already creates Activity)
  - Check all subsequent SLA calculations to apply stricter enforcement for Hot leads
  - Mark Hot leads' SLA breaches as critical (higher escalation level)
  - _Requirements: 16_

- [ ] 6.3 Integrate call logging with automatic KPI update
  - POST /api/leads/:id/calls already updates KPI_Status (Phase 2.10)
  - Ensure call outcome "Connected" resets SLA_due_at to 48 hours ahead
  - Ensure every call increments noOfAttempts in Lead_Master
  - _Requirements: 7_

- [ ] 6.4 Integrate product opportunity sales workflow
  - PUT /api/leads/:id/products/:opportunityId status update (Phase 2.13)
  - When status reaches "Completed/Sold":
    - Create Lead_Transaction record
    - Link Transaction_ID back to Opportunity
    - Create Activity record with transaction details
  - If all required products sold for lead, optionally update Lead_Status to "In Progress" or "Closed" (depends on business logic)
  - _Requirements: 8, 9_

- [ ] 6.5 Integrate document upload workflow
  - POST /api/leads/:id/documents already creates record (Phase 2.15)
  - Assume virus/malware scanning happens in file storage layer (not implemented here)
  - On successful upload, emit Activity record with document_id
  - Track sharing status (not shared by default)
  - _Requirements: 10_

- [ ] 6.6 Integrate activity logging for all lead changes
  - Activity creation already integrated in all Phase 2 and 3 endpoints
  - Ensure Activity records capture: timestamp (immutable), actor, type, title, description, related_id
  - Ensure Activity records are never updated/deleted after creation (immutable, Requirement 26)
  - _Requirements: 11, 26_

- [ ] 6.7 Integrate assignment history tracking
  - Assignment creation already in Phase 2 when lead created
  - Reassignment in Phase 3.1
  - Create Activity record on each assignment linking to assignment_id
  - Maintain audit trail with assigned_at, assigned_by, team, reassignment_reason
  - _Requirements: 5_

---

## Phase 7: Testing & Validation

- [ ] 7.1 Create property-based test for Lead ID uniqueness
  - Create `src/tests/properties/leadUniqueness.test.ts`
  - Property: FOR ALL leads created, exactly_one(lead_id per student) = true
  - Test: Generate random leads with same mobile_number, verify second creation returns duplicate error and references original lead_id
  - **Property 1: Lead ID Uniqueness**
  - **Validates: Requirement 1, 23**

- [ ]* 7.2 Write property test for mobile number duplicate detection
  - Create `src/tests/properties/mobileDuplicateDetection.test.ts`
  - Property: FOR ALL leads, POST /api/leads/check-duplicate with existing mobile_number SHALL return duplicate_lead_id matching that lead
  - Test: Create lead, attempt duplicate with normalized mobile (with +, spaces, dashes), verify detection
  - **Property 2: Mobile Duplicate Detection**
  - **Validates: Requirement 23**

- [ ]* 7.3 Write property test for Lead Profile round-trip consistency
  - Create `src/tests/properties/profileRoundTrip.test.ts`
  - Property: FOR ALL profile updates, storing then fetching SHALL preserve all data without loss (round-trip consistency)
  - Test: Update Lead_Profile with all fields, fetch, verify identical data
  - **Property 3: Profile Round-Trip Consistency**
  - **Validates: Requirement 2, 31_

- [ ]* 7.4 Write property test for Call immutability
  - Create `src/tests/properties/callImmutability.test.ts`
  - Property: FOR ALL Lead_Call records created, immutable (no updates or deletes allowed after creation)
  - Test: Create call record, attempt to update/delete, verify rejection
  - **Property 4: Call Immutability**
  - **Validates: Requirement 7, 26_

- [ ]* 7.5 Write property test for SLA calculation accuracy
  - Create `src/tests/properties/slaCalculation.test.ts`
  - Property: FOR ALL leads, SLA_due_at calculation SHALL follow: (last_connected_at + 48 hours) if call exists, else (created_at + 48 hours)
  - Test: Create lead, verify SLA_due_at = created_at + 48 hours; add connected call, verify SLA_due_at updated to call_time + 48 hours
  - **Property 5: SLA Calculation Accuracy**
  - **Validates: Requirement 15_

- [ ]* 7.6 Write property test for Assignment history tracking
  - Create `src/tests/properties/assignmentHistory.test.ts`
  - Property: FOR ALL assignment changes, Lead_Assignment records created with status "Active" for current, "Superseded" for previous
  - Test: Create lead (initial assignment), reassign 3 times, verify exactly 4 assignment records with correct statuses
  - **Property 6: Assignment History Tracking**
  - **Validates: Requirement 5_

- [ ]* 7.7 Write property test for Product-Transaction linking
  - Create `src/tests/properties/productTransactionLinking.test.ts`
  - Property: FOR ALL products marked "Completed/Sold", exactly_one Lead_Transaction linked via transaction_id
  - Test: Create product opportunity, update status to "Completed/Sold", verify Lead_Transaction created and linked
  - **Property 7: Product-Transaction Linking**
  - **Validates: Requirement 8, 9_

- [ ]* 7.8 Write integration test for lead creation to product closure flow
  - Create `src/tests/integration/leadLifecycle.test.ts`
  - Scenario: Create lead → Assign RM → Update profile → Qualify lead → Add product → Update product to sold → Verify transaction created
  - Verify Activity log records all actions, Assignment history has audit trail, Lead_Status progresses correctly
  - Verify no data loss or inconsistency
  - _Requirements: 1, 2, 5, 6, 8, 9, 11, 13_

- [ ] 7.9 Checkpoint - Verify all property tests pass
  - Run all property tests and verify passing
  - Document any edge cases discovered
  - Ensure all properties reflect actual system behavior
  - _All property tests from 7.1-7.7_

- [ ]* 7.10 Write unit tests for API endpoints
  - Create `src/tests/unit/leads.endpoints.test.ts`
  - Test each endpoint: POST /api/leads, GET /api/leads/:id, PUT endpoints for profile/academic/financial
  - Test error cases: invalid lead_id, missing required fields, duplicate lead
  - Test status codes and response shapes
  - _Requirements: 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11_

- [ ]* 7.11 Write unit tests for data validation and constraints
  - Create `src/tests/unit/dataValidation.test.ts`
  - Test mobile_number normalization (removing +, spaces, dashes)
  - Test Lead_ID format generation (L + 6 digits)
  - Test journey_stage transition validation (only valid transitions allowed)
  - Test status transition validation (New → Yet to be Qualified → Qualified, etc.)
  - Test rejection_reason required when qualification status "Not Qualified"
  - _Requirements: 23, 24, 6_

- [ ]* 7.12 Write unit tests for completion percentage calculation
  - Create `src/tests/unit/completionPercentage.test.ts`
  - Test inboundCompletionPct calculation: (populated_fields / 21) * 100
  - Test updates to inboundCompletionPct when fields populated
  - Test Lead_Status flag "Needs Profile Completion" when inboundCompletionPct < 50%
  - _Requirements: 33_

---

## Phase 8: Cleanup & Optimization

- [x] 8.1 Remove legacy StudentLead type where normalized replacement complete
  - Identify all components using old StudentLead type directly (not via backward-compat endpoint)
  - Update components to use new normalized data structures and section components
  - Remove StudentLead interface from `src/types.ts` once fully migrated
  - Keep ReconstructedStudentLead for backward-compat endpoint only
  - _Requirements: 29, 30_

- [ ] 8.2 Update type definitions across codebase
  - Scan for any remaining StudentLead references in `src/components`, `src/utils`, `src/data`
  - Replace with normalized table types where appropriate
  - Update function signatures to accept normalized types
  - _Requirements: 29_

- [ ]* 8.3 Performance testing for normalized queries
  - Create `src/tests/performance/normalizedQueries.test.ts`
  - Benchmark GET /api/leads/:id vs backward-compat endpoint (ensure backward-compat doesn't degrade significantly)
  - Test large result sets (100+ leads) for pagination
  - Test query performance with multiple JOINs
  - Ensure indexes on lead_id, mobile_number, source_code are in place
  - _Requirements: 27, 28_

- [ ]* 8.4 Create API documentation
  - Document all endpoints in `API.md` or Swagger format
  - Specify request/response shapes for each endpoint
  - Document error codes and scenarios
  - Document deprecated /leads/:id/backward-compat endpoint with sunset date
  - _Requirements: 30_

- [ ] 8.5 Deprecation warnings for legacy APIs
  - Add console warnings when backward-compat endpoint is called
  - Add deprecation notices in response headers (Deprecation header)
  - Update UI to log warnings when using legacy StudentLead views
  - Plan for complete removal of legacy API in future release
  - _Requirements: 30_

---

## Summary

- **Phase 1**: 3 tasks establishing type system and data interfaces
- **Phase 2**: 17 tasks implementing core CRUD APIs for all normalized tables
- **Phase 3**: 11 tasks implementing advanced features (assignment, qualification, priority, SLA)
- **Phase 4**: 2 tasks for data migration and validation
- **Phase 5**: 8 tasks refactoring UI into organized section components
- **Phase 6**: 7 tasks integrating business logic and workflows
- **Phase 7**: 12 tasks for comprehensive property-based testing and integration testing
- **Phase 8**: 5 tasks for cleanup, optimization, and documentation

**Total mandatory tasks**: 46
**Total optional testing tasks**: 7
**Estimated effort**: 92-138 hours (46 tasks × 2-3 hours each)

All tasks follow incremental development with frequent validation. Optional testing tasks (marked `*`) can be deferred for MVP but are strongly recommended for production readiness.

