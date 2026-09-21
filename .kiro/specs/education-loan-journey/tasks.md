# Implementation Plan: Education Loan Journey - Frontend Only

## Overview

This task list covers the complete frontend implementation of the Education Loan Journey feature, a dedicated full-screen UI for guiding applicants through multi-stage education loan applications. All backend API methods (LeadsDatabase) are assumed to be fully implemented and working. This is purely UI/component work with routing, forms, validation feedback, and state management.

**Key Constraint:** No backend/API development. All tasks are React/TypeScript component development, routing, form handling, and UI integration.

---

## Tasks

- [x] 1. Create types and integrate types into src/types/normalized.ts
  - Add EducationLoanApplication, LoanProductFlow, ApplicationStatus, and all stage-specific interfaces to src/types/normalized.ts
  - Add DocumentCategoryExtended enum and update LeadDocument interface
  - Validate types compile without errors
  - _Requirements: 1.1, 1.2, 1.3_

- [x] 2. Set up routing for education loan journey page
  - Add new route `/lead/:leadId/education-loan-journey/:opportunityId` in src/App.tsx
  - Create route handler state management for journey page navigation
  - Implement back navigation to lead detail view
  - Test route transitions with multiple leads
  - _Requirements: 2.3_

- [x] 3. Create EducationLoanJourneyPage main container component
  - [x] 3.1 Build EducationLoanJourneyPage component shell with header, sidebar, main content, footer layout
    - Create file src/components/EducationLoanJourneyPage.tsx
    - Set up page state management (currentStage, applicationData, validationErrors)
    - Implement sticky header with back button, lead ID, applicant name
    - _Requirements: 14.1, 2.3_

  - [x] 3.2 Implement page-level state for application data and stage management
    - State: currentStage, stageCompletionStatus, applicationStatus, draftSavedAt
    - State: form data for all stages (nested objects per stage)
    - State: validation errors per field and per stage
    - Implement handlers: handlePreviousStage, handleNextStage, handleSaveField, handleSaveDraft
    - _Requirements: 7.4, 7.5_

  - [x] 3.3 Add auto-save logic on page unload and 30-second inactivity timer
    - Implement useEffect to detect page unload (beforeunload)
    - Implement inactivity timer with 30-second reset on user interaction
    - Call handleSaveDraft on unload and timer expiry
    - Update draftSavedAt timestamp and show "Draft saved" toast
    - _Requirements: 13.2, 13.6_

- [x] 4. Create JourneyPageHeader component with status display and calling options
  - [x] 4.1 Build header structure with applicant name, status badge, progress indicator
    - Display "Education Loan Application | [Loan Flow] | [Applicant Name]" title
    - Display status badge (Draft, In Progress, Submitted, etc.)
    - Display progress: "Stage X of Y (XX% complete)" with progress bar
    - Add back button to return to lead detail
    - _Requirements: 14.1, 2.5_

  - [x] 4.2 Integrate calling options (Dial, WhatsApp, SMS) from existing LeadCallingSection
    - Import existing calling system handlers
    - Display [Dial] [WhatsApp] [SMS] buttons in header (never removed)
    - Connect buttons to handlers for initiating calls/messages
    - Keep calling options visible and accessible at all times
    - _Requirements: 14.1, 17_

- [x] 5. Create StageNavigationSidebar component with completion indicators
  - [x] 5.1 Build sidebar showing all stages for current loan product flow
    - Render list of all stages with stage names
    - Show completion icons: ✓ (completed), ● (current), ○ (pending)
    - Display stage number and name
    - Add click handler for navigating to stage (if previousStages all completed or in draft mode)
    - _Requirements: 7.1, 14.1_

  - [x] 5.2 Add visual progress bar and completion percentage
    - Calculate completion percentage based on stageCompletionStatus
    - Render progress bar showing X of Y stages complete
    - Display percentage text
    - Highlight current stage visually
    - _Requirements: 7.7, 14.1_

  - [x] 5.3 Implement stage highlighting and clickable navigation
    - Highlight current stage with background color or border
    - Make completed/current stages clickable for navigation
    - Disable clicking pending stages (unless in Draft mode)
    - Show visual feedback on hover
    - _Requirements: 7.1, 7.3_

- [ ] 6. Create GenericStageForm component renderer with dynamic field rendering
  - [x] 6.1 Build component that dynamically renders fields based on stage configuration
    - Accept stageConfig object with required/optional fields
    - Render different field types: text, email, phone, number, date, select, checkbox, multi-select
    - Display field labels with * for required, "(optional)" for optional
    - Show helpful hints/examples below field labels
    - _Requirements: 8.1-8.9, 14.2_

  - [x] 6.2 Implement real-time field validation with inline error display
    - Add onBlur handler for field-level validation
    - Display error message in red text below field
    - Highlight field with red border if invalid
    - Clear error on valid input
    - Disable Next button if any required field is invalid
    - _Requirements: 10.1-10.7, 14.3_

  - [x] 6.3 Implement form field handlers and state binding
    - Bind each field to application data via handleSaveField
    - Track field values in component state
    - Implement onChange handlers for form state management
    - Support nested data objects (e.g., applicantProfile.email, address.city)
    - _Requirements: 7.2, 8.1-8.9_

- [ ] 7. Create stage-specific form components (or use GenericStageForm with config)
  - [x] 7.1 Create ApplicantProfileStage form (email, phone, DOB, name, address, PAN)
    - Render fields: fullName, email, phoneNumber, mobileCountryCode, dateOfBirth, gender, nationality, currentAddress (nested), PAN
    - Implement validation: email format, phone format, age >= 18, address fields required
    - Show auto-populated indicators for shared fields (name, email, phone, DOB, address)
    - _Requirements: 4.2, 8.1, 10.1, 10.2_

  - [x] 7.2 Create ResidenceDestinationStage form (current country, visa status, destination, visa date)
    - Render fields: currentCountryOfResidence, currentVisaStatus, plannedDestinationCountry, visaStatusInDestination, expectedVisaApplicationDate
    - Implement validation per stage requirements
    - _Requirements: 8.2_

  - [x] 7.3 Create EducationDetailsStage form (degree, course, intake, universities, admission status)
    - Render fields: degreeType, fieldOfStudy, intakeType, intakeYear, universitiesOfInterest (multi-select), admissionStatus, expectedAdmissionDecisionDate
    - Implement validation: at least 1 university, intake year >= current year
    - Show auto-populated indicators for shared fields (degreeType, course, intakeYear, universitiesOfInterest)
    - _Requirements: 4.2, 8.3, 10.2_

  - [x] 7.4 Create LoanApplicationDetailsStage form (loan type, amount, purpose, repayment preference)
    - Render fields: loanType, requestedLoanAmount, loanAmountCurrency, purposeOfLoan (multi-select), repaymentPreference
    - Implement validation: loan amount within provider range
    - _Requirements: 8.4, 10.3_

  - [ ] 7.5 Create CoApplicantStage form (conditional for some flows)
    - Render fields: fullName, relationship, phoneNumber, email, profession, employer, annualIncome, address, sameAsApplicant checkbox, consentGiven checkbox
    - Show/hide based on loanProductFlow (required for INR_Secured, US_Cosigner)
    - Implement validation: income positive, relationship valid, consent checked
    - Show auto-populated indicators from LeadFinancial
    - _Requirements: 5.1, 8.5, 10.4_

  - [ ] 7.6 Create ReferenceDetailsStage form (minimum 2 references, up to 3)
    - Render fields: reference 1 & 2 (required), reference 3 (optional)
    - Each reference: name, relationship (Academic/Professional/Personal), phoneNumber, email
    - Implement validation: minimum 2 references, email format per reference
    - _Requirements: 8.6_

  - [ ] 7.7 Create AcademicHistoryStage form (10th, 12th, UG, PG, work experience, test scores)
    - Render collapsible sections for each education level and work experience
    - Render fields: board/school/year/percentage for 10th, 12th, UG, PG
    - Render work experience as repeatable entries (company, role, yearsWorked)
    - Render test scores (IELTS, TOEFL, PTE, GRE, GMAT) as repeatable entries
    - _Requirements: 8.7_

  - [ ] 7.8 Create FinancialDetailsStage form (income, savings, investments, liabilities, credit score)
    - Render fields: applicantAnnualGrossIncome, monthlyIncome, savingsAccountBalance, investments, liabilities, creditScore
    - Render co-applicant financial fields if co-applicant exists
    - Render: familyAnnualIncome, debtToIncomeRatio, bankStatementProofProvided checkbox
    - Implement validation: positive amounts, realistic debt-to-income ratio
    - _Requirements: 8.8_

  - [ ] 7.9 Create CollateralDetailsStage form (conditional for INR_Secured only)
    - Render fields: collateralType, estimatedValue, location, existingLiensOrMortgages
    - Show/hide based on loanProductFlow === 'INR_Secured'
    - _Requirements: 8.9_

  - [ ] 7.10 Create DocumentChecklistStage form with upload UI
    - Display required documents per stage and flow (from stage config)
    - Show upload status per document: "Not Provided", "Provided (N files)", "Rejected"
    - Implement file upload buttons with drag-and-drop support
    - Display file preview after upload confirmation
    - Call uploadEducationLoanDocument API method
    - _Requirements: 6.4, 6.5_

  - [ ] 7.11 Create ProviderSelectionStage form showing eligible providers as cards
    - Filter eligible providers based on loanProductFlow and applicant profile
    - Render provider cards with: name, logo, rate, fee, features, processing time
    - Implement radio button selection for provider choice
    - Store selectedLoanProvider in application data
    - Update document checklist for provider-specific documents
    - _Requirements: 9.1, 9.2, 9.3_

  - [x] 7.12 Create ReviewSubmitStage form showing summary of all entered data
    - Display read-only summary of all stages with data entered
    - Show application status and loan provider selected
    - Render "Submit" button (final stage only)
    - Show confirmation dialog before submit
    - _Requirements: 14.6, 6.6_

- [-] 8. Implement form validation logic engine
  - [ ] 8.1 Create validation rules configuration for each stage
    - Define required fields per stage and flow
    - Define validation functions for each field (email format, phone format, age, etc.)
    - Define error messages per validation rule
    - _Requirements: 10.1-10.7_

  - [ ] 8.2 Implement field-level validation on blur/change
    - Validate field against its rules when user exits field (blur) or after input (change)
    - Display error message inline below field
    - Mark field with red border if invalid
    - Track validation state in component
    - _Requirements: 10.1, 14.3_

  - [ ] 8.3 Implement stage-level validation before allowing Next button
    - Check all required fields in current stage are valid before enabling Next
    - Disable Next button if any required field invalid
    - Allow Next button only if: all required fields present AND all fields pass validation
    - _Requirements: 7.1, 7.2, 14.5_

  - [ ] 8.4 Implement application-level validation before Submit
    - Validate all stages before allowing submit
    - If validation fails: highlight incomplete stages in sidebar
    - Show error message listing which stages are incomplete
    - _Requirements: 7.6_

- [x] 9. Create footer navigation component with Previous/Next/Save/Submit buttons
  - [ ] 9.1 Build FooterNavigation component with button layout
    - Previous button (always visible, always enabled except on first stage)
    - Save Draft button (always visible, always enabled)
    - Next button (visible unless on final stage, conditional on validation)
    - Submit button (visible only on final stage, conditional on full validation)
    - _Requirements: 14.4_

  - [ ] 9.2 Implement button click handlers for stage progression
    - handlePreviousStage: move to previous stage, don't validate
    - handleNextStage: validate current stage, then move to next or show errors
    - handleSaveDraft: save all data, set applicationStatus='Draft', show "Draft saved" toast
    - handleSubmit: validate all stages, submit or show errors
    - _Requirements: 7.2, 7.3, 7.4, 7.6_

  - [ ] 9.3 Add confirmation dialog for Submit button
    - Show modal: "Confirm submission? Once submitted, you cannot edit this application. [Cancel] [Submit]"
    - On confirm: validate all stages and submit
    - On cancel: dismiss modal and stay on page
    - _Requirements: 14.6_

- [ ] 10. Integrate auto-population of shared fields from LeadProfile on journey entry
  - [ ] 10.1 Load lead profile data when journey page mounts
    - Fetch LeadMaster and LeadProfile for the lead
    - Auto-populate shared fields: name, email, phone, DOB, address, destination countries, degree type, course, intake year, universities, co-applicant details
    - Display badge "Auto-populated from Lead Profile" on each shared field
    - _Requirements: 4.1, 4.2, 10_

  - [ ] 10.2 Implement auto-populated field badge/styling
    - Add visual indicator (badge or background color) on auto-populated fields
    - Show tooltip: "Auto-populated from Lead Profile"
    - Make fields editable (changes sync bi-directionally)
    - _Requirements: 4.2_

- [ ] 11. Implement bi-directional field sync between Lead Profile and Education Loan
  - [ ] 11.1 Create sync handler for shared field updates
    - When applicant updates a shared field in journey: update LeadMaster/LeadProfile
    - When RM updates a shared field in lead detail view: update EducationLoanApplication
    - Use "last-write-wins" strategy with timestamp comparison
    - Create activity record for each sync operation
    - _Requirements: 5.1, 5.2, 5.3, 5.4, 5.5_

  - [ ] 11.2 Add sync status UI feedback (spinner, success message, error message)
    - Show spinner on field while syncing
    - Show "Synced" checkmark after successful sync
    - Show error message if sync fails
    - _Requirements: 12_

- [ ] 12. Integrate document management with category filtering
  - [ ] 12.1 Create DocumentChecklistComponent showing required documents
    - Display all required documents for current stage and selected provider
    - Show upload status per document: "Not Provided", "Provided (1 file)", "Provided (N files)", "Rejected"
    - Quick upload button for each document type
    - _Requirements: 6.1, 6.4_

  - [ ] 12.2 Implement file upload UI and integration
    - Implement drag-and-drop or file input for document uploads
    - Support file types: PDF, JPG, JPEG, PNG (max 10MB)
    - Call uploadEducationLoanDocument API method
    - Store document with documentCategory='educationLoan'
    - Display file preview/confirmation after upload
    - _Requirements: 6.2, 6.5_

  - [ ] 12.3 Update LeadDocumentsSection to show document category tabs
    - Add filter tabs: "All Documents", "General", "Education Loan"
    - Display documentCategory label on each document
    - Filter documents by category when tab clicked
    - Show all documents with both categories
    - _Requirements: 6.6, 6.7, 6.8_

- [ ] 13. Create entry point integration in LeadProductsSection
  - [ ] 13.1 Add "Enter Journey" button to Education Loan product opportunity card
    - Modify LeadProductsSection component to show "Enter Journey" button for Education Loan products
    - Replace or supplement "Open Full Loan Profile" button
    - Navigate to journey page on button click
    - Pass lead ID and opportunity ID to journey page route
    - _Requirements: 2.1, 2.2_

  - [ ] 13.2 Implement product selection modal for new applications
    - If no active EducationLoanApplication exists: show loan product flow selection modal
    - Display 4 loan product flow options (INR Unsecured, INR Secured, US Cosigner, USD No-Cosigner with sub-flows)
    - Allow user selection and confirmation
    - Create EducationLoanApplication with selected flow
    - Navigate to journey page after creation
    - _Requirements: 2.2_

- [ ] 14. Implement application status display and tracking
  - [ ] 14.1 Display application status prominently in header
    - Show current status (Draft, In Progress, Submitted, etc.) in header badge
    - Update status dynamically as user progresses
    - Show status-specific hints (e.g., "Draft - save before leaving")
    - _Requirements: 12.6_

  - [ ] 14.2 Update status as user progresses through stages
    - When user starts editing: set status='In Progress'
    - When user saves draft: keep status='Draft'
    - When user submits: set status='Submitted'
    - Create activity record for each status change
    - _Requirements: 12.2, 12.3, 12.4_

  - [ ] 14.3 Display application status in lead detail view product opportunities
    - Show status badge next to each education loan application
    - Show all applications if multiple exist for lead
    - Update in real-time as journey page saves
    - _Requirements: 12.6, 12.7_

- [ ] 15. Implement draft resume functionality
  - [ ] 15.1 Show draft resume UI on journey entry
    - If draft exists: display "Resume" button and "Last saved: [timestamp]"
    - Allow user to click "Resume" to continue from last completed stage
    - Show all stages with completion status
    - _Requirements: 13.1, 13.3_

  - [ ] 15.2 Implement draft data loading and stage resumption
    - Load all previously entered data from EducationLoanApplication
    - Display last completed stage or first incomplete stage
    - Allow editing any previous stage
    - Allow moving forward from last completed stage
    - _Requirements: 13.3, 13.4_

- [ ] 16. Add loading, error, and success states
  - [ ] 16.1 Implement loading spinner while loading application
    - Show full-page loading spinner while fetching EducationLoanApplication
    - Show stage-specific loading spinner while validating/saving
    - Disable all buttons while loading
    - _Requirements: 18_

  - [ ] 16.2 Implement error handling and retry logic
    - Show error message if application load fails
    - Show retry button on error
    - Handle missing lead or opportunity errors with user-friendly messages
    - Show access denied error if user lacks permission
    - _Requirements: 18_

  - [ ] 16.3 Show submission success and next steps
    - After successful submission: show success dialog with checkmark
    - Display success message: "Application submitted successfully"
    - Show next steps or redirect option (e.g., "Return to Lead Detail")
    - Navigate back to lead detail after user confirmation
    - _Requirements: 19_

- [ ] 17. Implement responsive design for mobile and tablet
  - [ ] 17.1 Make forms mobile-friendly
    - Stack form fields vertically on mobile
    - Ensure touch-friendly button sizes
    - Adjust font sizes for mobile readability
    - _Requirements: 20_

  - [ ] 17.2 Implement responsive sidebar and footer layout
    - Collapse sidebar on mobile (show menu icon)
    - Stack Previous/Next/Submit buttons vertically on small screens
    - Adjust spacing and padding for mobile
    - _Requirements: 20_

  - [ ] 17.3 Test responsive layout at multiple breakpoints
    - Test at 320px, 480px, 768px, 1024px, 1440px widths
    - Verify all content readable and accessible
    - _Requirements: 20_

- [ ] 18. Create stage configuration files
  - [x] 18.1 Create src/config/educationLoanStages.ts with all stage definitions
    - Define stage configs for all 4 loan product flows
    - Include required/optional fields per stage
    - Include validation rules per stage
    - Include UI layout preferences
    - _Requirements: 3.2, 10.1-10.7_

  - [ ] 18.2 Create src/config/loanProviders.ts with provider configurations
    - List all 16 loan providers with capabilities
    - Include loan type, currency, amount range support
    - Include provider-specific document requirements
    - Include interest rates, fees, processing times
    - _Requirements: 9.1_

  - [ ] 18.3 Create src/config/validationRules.ts with all validation rule definitions
    - Organize validation rules by field
    - Include error messages
    - Include applicability per flow or universally
    - _Requirements: 10.1-10.7_

- [ ] 19. Wire up all API method calls to components
  - [ ] 19.1 Implement createEducationLoanApplication call on journey entry
    - Call createEducationLoanApplication when user creates new application
    - Pass lead ID, opportunity ID, loan product flow
    - Store returned application ID in component state
    - Handle errors with user-friendly messages
    - _Requirements: 2.2_

  - [ ] 19.2 Implement getEducationLoanApplication call on page mount
    - Call getEducationLoanApplication to load existing application
    - Handle case where application doesn't exist (show creation flow)
    - Populate page with loaded application data
    - _Requirements: 2.4, 4.1_

  - [ ] 19.3 Implement updateEducationLoanApplication call on each field save
    - Call updateEducationLoanApplication after field changes
    - Debounce rapid updates (max 1 update per 2 seconds)
    - Handle save errors and show error messages
    - _Requirements: 7.2, 11.1_

  - [ ] 19.4 Implement updateEducationLoanApplicationStage call on stage completion
    - Call updateEducationLoanApplicationStage when user clicks Next
    - Pass stage name and stage data
    - Request validation (validate=true)
    - Handle validation errors and show error messages
    - _Requirements: 7.2_

  - [ ] 19.5 Implement submitEducationLoanApplication call on submit
    - Call submitEducationLoanApplication when user confirms submit
    - Set applicationStatus to 'Submitted' on success
    - Update related LeadProductOpportunity status to 'In Progress'
    - Show success dialog and redirect to lead detail
    - _Requirements: 7.6, 12.4, 12.5, 17.4, 17.5_

  - [ ] 19.6 Implement updateSharedFieldSync call for bi-directional sync
    - Call updateSharedFieldSync when applicant updates shared fields
    - Pass field name, new value, source='EducationLoanApp'
    - Handle sync conflicts with last-write-wins logic
    - Create activity records for sync operations
    - _Requirements: 5.2, 5.3, 5.4_

  - [ ] 19.7 Implement uploadEducationLoanDocument call for document uploads
    - Call uploadEducationLoanDocument when user uploads document
    - Pass lead ID, application ID, document data
    - Set documentCategory='educationLoan'
    - Update document checklist after successful upload
    - _Requirements: 6.2, 6.5_

  - [ ] 19.8 Implement getEducationLoanDocuments call to load documents
    - Call getEducationLoanDocuments to load all EL-specific documents
    - Display in document checklist with upload status
    - _Requirements: 6.4_

- [ ] 20. Integrate existing calling system into journey header
  - [ ] 20.1 Import and use LeadCallingSection in journey header
    - Import existing calling handlers from LeadCallingSection.tsx
    - Display Dial, WhatsApp, SMS buttons in header
    - Connect buttons to call/message handlers
    - Allow calling without leaving journey page
    - _Requirements: 14.1, 17_

- [ ] 21. Test all form validations and error states
  - [ ] 21.1 Test field-level validation for all field types
    - Test email validation (valid/invalid formats)
    - Test phone validation (minimum digits, country codes)
    - Test date validation (age >= 18, future dates for intake)
    - Test number validation (positive, within ranges)
    - Test required field validation
    - Verify error messages display correctly
    - _Requirements: 10.1-10.7_

  - [ ] 21.2 Test stage-level validation blocking progression
    - Test that Next button disabled when required fields invalid
    - Test that Next button enabled when all required fields valid
    - Test that Previous button always enabled
    - Test that validation errors clear when field corrected
    - _Requirements: 7.1, 14.5_

  - [ ] 21.3 Test form submission and application state transitions
    - Test submission succeeds when all stages valid
    - Test submission fails with error message when any stage invalid
    - Test that applicationStatus updates correctly through flow
    - Test that activity records created for each major action
    - _Requirements: 7.6, 12.1-12.7_

- [ ] 22. Test draft save and resume flow
  - [ ] 22.1 Test auto-save on page unload
    - Verify draft saves when navigating away
    - Verify draftSavedAt timestamp updates
    - Verify "Draft saved" toast displays
    - _Requirements: 13.2, 13.6_

  - [ ] 22.2 Test draft resume on page return
    - Verify draft data loads when returning to application
    - Verify all previously entered data is present
    - Verify user can resume from last completed stage
    - Verify user can edit any previous stage without re-validating
    - _Requirements: 13.3, 13.4_

- [ ] 23. Test bi-directional sync functionality
  - [ ] 23.1 Test sync from Education Loan to Lead Profile
    - Update name in journey form
    - Verify LeadMaster.studentName updates
    - Verify activity record created
    - Test multiple field syncs
    - _Requirements: 5.2, 5.3_

  - [ ] 23.2 Test sync from Lead Profile to Education Loan
    - Update name in lead detail view
    - Verify EducationLoanApplication.applicantProfile.fullName updates
    - Verify activity record created
    - Test conflict resolution with last-write-wins
    - _Requirements: 5.3, 5.4_

- [ ] 24. Test document upload and categorization
  - [ ] 24.1 Test document upload from journey
    - Upload PDF/JPG document from document checklist
    - Verify document stored with documentCategory='educationLoan'
    - Verify document checklist updates to show "Provided"
    - Verify activity record created
    - _Requirements: 6.2, 6.4, 6.5_

  - [ ] 24.2 Test document filtering in LeadDocumentsSection
    - Upload both general and education loan documents
    - Filter by "General" - verify only general docs shown
    - Filter by "Education Loan" - verify only EL docs shown
    - Filter by "All" - verify all docs shown
    - _Requirements: 6.6, 6.7, 6.8_

- [ ] 25. Test provider selection and filtering
  - [ ] 25.1 Test provider filtering based on loan type
    - Select INR Unsecured flow - verify INR unsecured providers shown
    - Select INR Secured flow - verify INR secured providers shown
    - Select US Cosigner flow - verify USD providers shown
    - _Requirements: 9.1, 9.2_

  - [ ] 25.2 Test provider selection flow
    - Select provider in journey
    - Verify selectedLoanProvider stored in application
    - Verify document checklist updates with provider-specific docs
    - Verify activity record created for provider selection
    - _Requirements: 9.3, 9.4_

- [ ] 26. Test responsive design at multiple breakpoints
  - [ ] 26.1 Test mobile layout (320px, 480px)
    - Verify sidebar collapses or hidden on mobile
    - Verify form fields stack vertically
    - Verify buttons remain accessible with touch-friendly sizes
    - Verify text remains readable
    - _Requirements: 20_

  - [ ] 26.2 Test tablet layout (768px)
    - Verify layout adapts appropriately
    - Verify all content visible without excessive scrolling
    - _Requirements: 20_

  - [ ] 26.3 Test desktop layout (1024px+)
    - Verify sidebar visible with proper width
    - Verify form has appropriate spacing and alignment
    - Verify footer buttons properly laid out
    - _Requirements: 20_

- [ ] 27. Final integration checkpoint - Ensure all components wired and functional
  - [ ] 27.1 Test complete journey flow end-to-end
    - Enter journey from lead detail page
    - Create new application or load existing draft
    - Progress through all stages (filling required fields)
    - Save draft at intermediate stage
    - Resume draft and complete all stages
    - Submit application
    - Verify status updated in lead detail view
    - Verify activity records created for all actions
    - Verify no console errors or warnings
    - _Requirements: All_

  - [ ] 27.2 Test edge cases and error scenarios
    - Test accessing journey with invalid lead ID (show error)
    - Test accessing journey without permission (show error)
    - Test submission with incomplete data (show validation errors)
    - Test network errors during save/submit (show retry)
    - Test rapid form changes (verify debounce works)
    - _Requirements: 18, 16_

  - [ ] 27.3 Ask user if they have questions or if feature works as expected
    - Ensure all tasks are complete and integrated
    - Verify feature meets all requirements
    - Get user feedback and approval before completion
    - _Requirements: All_

---

## Notes

- All tasks are frontend-only: no backend API development or database schema changes
- Backend methods in LeadsDatabase are assumed to be fully implemented and working
- Configuration files (stages, providers, validationRules) should be created in src/config/ for maintainability
- All form data should be stored in normalized interfaces defined in src/types/normalized.ts
- Bi-directional sync should use "last-write-wins" strategy with timestamp comparison
- Auto-save should trigger on page unload and after 30 seconds of inactivity
- All major actions (stage completion, application submission, provider selection) should create immutable activity records via LeadsDatabase API
- Validation should prevent progression to next stage if required fields are invalid or missing
- Draft mode allows saving incomplete applications and resuming later
- Component structure is flexible: GenericStageForm with config-driven rendering is preferred over individual stage components for maintainability

