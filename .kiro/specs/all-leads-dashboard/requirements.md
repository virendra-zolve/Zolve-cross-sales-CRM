# All Leads Dashboard Requirements

## Introduction

The All Leads Dashboard is a new UI feature that creates a central lead pool where Relationship Managers (RMs) and Agents can discover, view, and claim qualified leads available for management. This dashboard displays all qualified leads in the system that are not yet assigned, allowing eligible users to claim ownership of leads. The feature is UI/UX focused with mock/static data—no backend APIs, database changes, or authentication modifications are required.

The dashboard provides a clear view of the overall lead pool while enabling RMs/Agents to claim leads through a simple, interactive interface. Claimed leads are then associated with the claiming user and appear in their individual lead management views.

---

## Glossary

- **All Leads Pool**: Collection of all leads in "Qualified" status that are available for claiming
- **Available Lead**: A qualified lead that has not been claimed by any RM/Agent
- **Claimed Lead**: A qualified lead that has been assigned to an RM/Agent through the claim action
- **Relationship Manager (RM)**: User role responsible for managing and nurturing leads
- **Agent**: User role similar to RM, capable of claiming and managing leads
- **Lead Claim**: Action taken by an RM/Agent to claim ownership of an available lead (mock UI state only)
- **Unclaimed Lead**: Synonym for available lead; a qualified lead with no current owner
- **SLA (Service Level Agreement)**: Time-based requirement for lead contact (48-hour contact rule for qualified leads)
- **SLA Status**: Indicator of whether a claimed lead is on track or at risk relative to SLA deadlines
- **My Claimed Leads**: Leads that the current user has claimed ownership of
- **Claim Button**: Interactive UI element allowing RM/Agent to claim a lead
- **Lead Table**: Reusable component displaying leads in tabular format with columns, sorting, and filtering
- **Summary Cards**: KPI display cards showing aggregate metrics (Total Leads, Available to Claim, etc.)
- **First Call Pending**: State indicating a claimed lead requires an initial contact attempt
- **Follow-up Pending**: State indicating a claimed lead requires a follow-up contact attempt
- **Mock UI State**: Client-side UI state management simulating claim action without backend persistence

---

## Requirements

### Requirement 1: All Leads Dashboard Page Layout

**User Story:** As an RM/Agent, I want to access an "All Leads" view within my dashboard navigation, so that I can discover and claim available leads from a central location.

#### Acceptance Criteria

1. WHEN user navigates to the All Leads view, THE View SHALL be accessible as a tab/option in the existing dashboard navigation (e.g., alongside "My Leads" in RmDashboard header)

2. THE All_Leads view SHALL reuse the existing dashboard header (no separate header needed)

3. WHEN page loads, THE Dashboard SHALL display a 5-card summary section with metrics (realistic mock data):
   - Total Leads: Count of all qualified leads in the pool
   - Available to Claim: Count of unclaimed qualified leads
   - My Claimed Leads: Count of leads claimed by current user
   - SLA At Risk: Count of claimed leads approaching 48-hour SLA deadline
   - SLA Breached: Count of claimed leads exceeding 48-hour SLA deadline

4. WHEN viewing the page, THE Layout SHALL include:
   - Summary cards section (top)
   - Filters section (positioned above lead table)
   - Lead table section displaying unclaimed leads initially

5. WHERE page layout conflicts with existing dashboard design, THE All_Leads view content SHALL follow the same visual hierarchy and spacing as existing dashboard content areas (e.g., RmDashboard, TeamLeadDashboard)


### Requirement 2: Summary Cards with Mock Data

**User Story:** As an RM, I want to see KPI cards showing available leads and SLA status, so that I can quickly understand the lead pool at a glance.

#### Acceptance Criteria

1. THE Summary_Cards section SHALL display exactly 5 cards arranged horizontally (responsive grid):
   - Total Leads card: Shows total count (e.g., 847)
   - Available to Claim card: Shows count of unclaimed leads (e.g., 312)
   - My Claimed Leads card: Shows count claimed by current user (e.g., 45)
   - SLA At Risk card: Shows count within 24 hours of 48-hour SLA deadline (e.g., 28)
   - SLA Breached card: Shows count exceeding SLA deadline (e.g., 12)

2. WHEN a card is viewed, THE Card SHALL display:
   - Card title/label (e.g., "Available to Claim")
   - Large numeric value
   - Optional icon or color-coding (green for on-track, amber for at-risk, red for breached)

3. WHEN page is loaded, THE Mock_Data values SHALL be realistic and consistent:
   - Total Leads ≥ Available to Claim
   - (My Claimed Leads + Available to Claim) ≤ Total Leads
   - SLA At Risk + SLA Breached ≤ My Claimed Leads

4. WHERE actual backend integration occurs in future, THE Card VALUES SHALL be replaced with dynamic API calls while maintaining layout and styling


### Requirement 3: Filter Section

**User Story:** As an RM, I want to filter available leads by various criteria, so that I can find leads matching my interest or capacity.

#### Acceptance Criteria

1. WHEN user views the Filters section, THE UI SHALL display filter controls similar to existing lead table filters:
   - Filter by Country (multi-select dropdown)
   - Filter by Product (multi-select dropdown)
   - Filter by Priority (multi-select: Hot, Warm, Cold)
   - Filter by SLA Status (multi-select: On Track, At Risk, Breached)
   - Search by Lead Name or Phone Number (text input)
   - Clear Filters button to reset all filters

2. WHEN user selects filter criteria, THE Lead_Table below SHALL update in real-time to show only matching leads

3. WHEN filters are applied, THE Available_to_Claim summary card SHALL update to reflect filtered count (optional; if complex, keep as total count)

4. WHERE multiple filters are active, THE System SHALL apply AND logic (e.g., Country=USA AND Product=Education Loan)

5. THE Filter section styling and layout SHALL match existing dashboard filter patterns


### Requirement 4: Lead Table - Display Unclaimed Leads

**User Story:** As an RM, I want to see a table of available leads with key information, so that I can review leads before claiming.

#### Acceptance Criteria

1. WHEN page loads, THE Lead_Table SHALL display all unclaimed qualified leads using the existing LeadTable component

2. THE Table SHALL display columns:
   - Lead ID (e.g., L000123)
   - Student Name
   - Phone Number
   - Email
   - Country
   - Product Interested In (primary product)
   - Priority (Hot, Warm, Cold)
   - SLA Status (On Track, At Risk, Breached, or N/A if newly qualified)
   - Action column: "Claim" button

3. WHEN table initially loads, THE Table SHALL show only unclaimed leads (leads not yet claimed by any user)

4. WHERE existing LeadTable component is reused, THE Component_Props SHALL include:
   - leads: Array of unclaimed lead objects
   - columns: Configuration for columns listed above
   - onRowClick: Handler to potentially open lead detail (optional)
   - showClaimButton: Flag to display Claim action button

5. THE Table SHALL support sorting by any column (ascending/descending toggle)

6. THE Table SHALL include pagination if > 50 unclaimed leads (show 25/50/100 per page option)

7. WHEN table displays, THE Mock_Data SHALL include realistic coverage:
   - Multiple countries (USA, UK, Canada, Australia, etc.)
   - Multiple products (Education Loan, Test Prep, Admissions, etc.)
   - Mix of priorities (Hot, Warm, Cold)
   - Mix of SLA statuses (some newly claimed with "On Track", some at risk)


### Requirement 5: Claim Lead Action - UI State Only

**User Story:** As an RM, I want to click a "Claim" button to claim ownership of an available lead, so that I can manage it in my personal lead queue.

#### Acceptance Criteria

1. WHEN user views the Lead_Table, THE "Claim" button SHALL be present in the Action column for each unclaimed lead

2. WHEN user clicks the "Claim" button, THE System SHALL:
   - Update local UI state to mark the lead as claimed by current user (mock UI state only)
   - Change the button text from "Claim" to "View"
   - Optionally show a brief success notification (toast/alert)
   - Remove the lead from the "Available to Claim" view OR move it to a "My Claimed Leads" section

3. WHEN a lead is claimed, THE lead SHALL be associated with the current user in mock client-side state (no backend call required)

4. WHERE claim action is triggered, THE System SHALL:
   - Log the claim action locally (no persistent backend logging required)
   - Update "My Claimed Leads" counter in Summary_Cards
   - Decrement "Available to Claim" counter in Summary_Cards

5. WHEN a lead is claimed, THE button SHALL change to "View" to indicate the lead is now owned by current user (optional: clicking View may navigate to lead detail view)

6. AFTER claim, THE lead SHALL appear in the current user's lead view (RmDashboard, or wherever user's claimed leads are displayed) using the mock state


### Requirement 6: SLA Status Display in Table

**User Story:** As an RM, I want to see SLA status for each lead in the table, so that I can prioritize claimed leads requiring urgent contact.

#### Acceptance Criteria

1. THE SLA_Status column SHALL display badges/labels with text and color-coding:
   - "On Track" (green badge) - Lead contacted within 48-hour SLA window
   - "SLA Breached" (red badge) - Lead not contacted within 48 hours of claim/qualification
   - "At Risk" (amber badge) - Lead within 24 hours of SLA deadline (optional, may combine with "On Track")
   - "First Call Pending" (blue badge) - For claimed leads awaiting initial contact attempt
   - "Follow-up Pending" (blue badge) - For claimed leads awaiting follow-up contact attempt
   - "N/A" (gray badge) - For unclaimed leads or newly qualified leads with no SLA yet due

2. WHEN display shows claimed lead, THE SLA_Status SHALL reflect current status based on:
   - Time since lead was claimed
   - Time since last call attempt
   - Whether first call has been completed

3. WHEN displaying unclaimed lead, THE SLA_Status SHOULD show "N/A" or be empty (SLA only applies after claim)

4. WHEN SLA deadline approaches, THE Badge color SHALL shift from green to amber to red for visual urgency

5. WHERE SLA_Status determines dashboard priority, THE Table_Sort function SHALL allow sorting by SLA_Status to surface "At Risk" and "Breached" leads first


### Requirement 7: SLA Timing - 48 Hour Rule

**User Story:** As an operations manager, I want SLA to be calculated from the moment a lead is claimed, so that I can track whether RMs contact leads within the required 48-hour window.

#### Acceptance Criteria

1. WHEN a lead is claimed by an RM, THE System SHALL record claim_time (current timestamp)

2. WHEN SLA is calculated, THE SLA_Due_At SHALL be set to claim_time + 48 hours

3. WHEN Current_Time < SLA_Due_At and no call has been attempted, THE SLA_Status SHALL be "First Call Pending" (green/on track)

4. WHEN Current_Time ≥ SLA_Due_At and no call has been completed, THE SLA_Status SHALL be "SLA Breached" (red badge)

5. WHEN RM logs a call attempt (whether connected or RNR), THE SLA SHALL reset:
   - SLA_Due_At resets to new Current_Time + 48 hours
   - SLA_Status transitions to "Follow-up Pending"

6. WHEN multiple calls have been logged, THE System SHALL track the most recent call and calculate SLA from that timestamp

7. FOR Mock_Data leads, THE Mock_Claim_Timestamp SHALL vary:
   - Some leads claimed today (SLA due in 48 hours, "On Track" with green badge)
   - Some leads claimed 36 hours ago (SLA due soon, "At Risk" with amber badge)
   - Some leads claimed 3+ days ago with no call (SLA breached, "SLA Breached" with red badge)


### Requirement 8: Lead Detail View Access

**User Story:** As an RM, I want to click a lead row to view full lead details, so that I can assess the lead before or after claiming.

#### Acceptance Criteria

1. WHEN user clicks on a lead row in the Lead_Table, THE System MAY navigate to a lead detail view (optional feature; depends on existing component availability)

2. WHEN clicking the lead name or ID, THE Detail_View SHALL display full lead information including:
   - Lead core info (name, contact, source)
   - Study plan (countries, universities, intake)
   - Academic background
   - Financial profile
   - Call history (if any)
   - Product opportunities
   - Assigned RM/owner (if claimed)

3. FROM lead detail view, THE RM MAY take actions such as:
   - Log a call attempt
   - Update profile information
   - Add notes
   - Return to All Leads Dashboard

4. WHERE lead detail component already exists (LeadDetailView, LeadDetailViewRefactored), THE All_Leads_Dashboard SHALL reuse it without modification


### Requirement 9: My Claimed Leads View Option

**User Story:** As an RM, I want to toggle between viewing available leads and my claimed leads, so that I can manage leads I own.

#### Acceptance Criteria

1. WHEN user is on All Leads Dashboard, THE UI MAY display a toggle or tab to switch views:
   - Tab/Toggle Option 1: "Available to Claim" (unclaimed leads, default view)
   - Tab/Toggle Option 2: "My Claimed Leads" (leads claimed by current user)

2. WHEN user clicks "My Claimed Leads" tab, THE Lead_Table SHALL display:
   - Only leads claimed by current user
   - Same columns as Available view
   - "View" button in place of "Claim" button (or "Release" button if release feature is implemented)

3. WHEN viewing "My Claimed Leads", THE Summary_Cards SHALL update to show metrics relevant to claimed leads:
   - My Claimed Leads: Total count
   - SLA At Risk: Count in at-risk category
   - SLA Breached: Count in breached category
   - Next Follow-up Due: (optional) leads requiring follow-up

4. WHEN user switches back to "Available to Claim" tab, THE Table SHALL refresh to show all unclaimed leads

5. WHERE toggling between views, THE Filter selections MAY persist or reset (product decision; default: reset filters for clarity)


### Requirement 10: Responsive Design and Mobile Support

**User Story:** As a user, I want the All Leads Dashboard to work on mobile devices, so that I can access it from my phone or tablet.

#### Acceptance Criteria

1. WHEN viewed on mobile (< 768px width), THE Dashboard SHALL:
   - Stack summary cards vertically (single column)
   - Collapse filter section into collapsible/drawer menu
   - Display lead table in responsive/scrollable format OR convert to card layout

2. WHEN viewed on tablet (768px - 1024px), THE Dashboard SHALL:
   - Display 2-3 summary cards per row
   - Show filters in horizontal scrollable row OR single column

3. WHEN viewed on desktop (> 1024px), THE Dashboard SHALL:
   - Display 5 summary cards in a single row
   - Show filters in horizontal layout with multiple controls visible

4. THE Lead_Table SHALL remain readable and functional on all device sizes with appropriate horizontal scrolling if needed

5. WHEN on mobile, THE "Claim" button SHALL be easily tappable (minimum 44px height per accessibility standards)


### Requirement 11: Consistent Styling with Existing Dashboards

**User Story:** As a designer, I want the All Leads Dashboard to maintain visual consistency with existing dashboards, so that users experience a cohesive product.

#### Acceptance Criteria

1. THE All_Leads_Dashboard color scheme, typography, spacing, and component styling SHALL match existing dashboard components (RmDashboard, TeamLeadDashboard, HeadDashboard)

2. THE Page_Header styling SHALL use the same font sizes, weights, and colors as existing dashboard headers

3. THE Summary_Cards SHALL use the same card component styling, border styles, shadow effects, and hover states as KpiBar or other existing card components

4. THE Lead_Table styling and control buttons SHALL match the existing LeadTable component styling and interaction patterns

5. WHERE new UI elements are introduced (e.g., tabs for view switching), THE Elements SHALL be styled using the existing design system (if available) or closely match existing button and tab component styles

6. WHEN comparing side-by-side with existing dashboards, THE Visual consistency SHALL be immediately apparent


### Requirement 12: No Backend API Changes

**User Story:** As a backend team, I want to ensure no new APIs or database changes are required, so that development scope is limited to UI only.

#### Acceptance Criteria

1. THE All_Leads_Dashboard SHALL NOT require new API endpoints for fetching unclaimed leads (use existing lead data endpoints or mock data)

2. THE All_Leads_Dashboard SHALL NOT modify or introduce new database tables or fields

3. THE All_Leads_Dashboard SHALL NOT require authentication changes or new permission rules (assume current user role is sufficient)

4. THE Claim action SHALL be implemented as mock UI state only, with no backend API call to persist the claim

5. WHERE claim persistence is needed in future, THE Backend team SHALL add the API endpoint independently without requiring All_Leads_Dashboard changes

6. ALL Lead data displayed SHALL come from existing StudentLead object structure or mock data derived from it


### Requirement 13: Mock Data Structure for Display

**User Story:** As a frontend developer, I want access to realistic mock data for the All Leads Dashboard, so that I can implement and test the UI without backend dependency.

#### Acceptance Criteria

1. THE Mock_Data for unclaimed leads SHALL include realistic coverage:
   - At least 50-100 sample lead records with varied attributes
   - Multiple countries: USA, UK, Canada, Australia, Ireland, Germany, etc.
   - Multiple products: Education Loan, Test Prep, Admissions, eSIM, Travel, etc.
   - Priority mix: 20% Hot, 40% Warm, 40% Cold leads
   - Academic backgrounds: diverse GPA, test scores (some with tests, some without)
   - Contact info: varied phone formats, email domains

2. THE Mock_Data structure SHALL include fields:
   - leadId, studentName, mobileNumber, email, country
   - productInterested, priority, slaStatus
   - createdAt, claimedBy (null for unclaimed), lastCallAt (null if never called)

3. WHEN page loads, THE Mock_Data SHALL be loaded from a JavaScript object or JSON file (e.g., mockLeads.ts or similar)

4. WHEN user claims a lead, THE Mock_Data record SHALL be updated to set claimedBy = currentUser

5. WHEN user toggles "My Claimed Leads" view, THE Mock_Data SHALL be filtered to show only records where claimedBy = currentUser

6. FOR SLA Status calculation in mock data, THE System SHALL compute:
   - Current_Time - claimedAt: If < 48 hours and no call, "First Call Pending"
   - If ≥ 48 hours and no call, "SLA Breached"
   - If last call < 48 hours ago, "On Track"
   - If last call ≥ 48 hours ago, "Follow-up Pending"


### Requirement 14: User Role Access Control

**User Story:** As an admin, I want only RMs and Agents to access the All Leads Dashboard, so that lead claiming is restricted to appropriate roles.

#### Acceptance Criteria

1. WHEN an authenticated user navigates to /all-leads, THE System SHALL check user role

2. IF user role is RM or Agent, THE Dashboard SHALL display normally

3. IF user role is not RM/Agent (e.g., Team Lead, Head, Partner), THE System MAY:
   - Restrict access and show "Not Authorized" message, OR
   - Allow view-only access without claim functionality (product decision)

4. WHEN user lacks permission, THE "Claim" button SHALL be disabled or hidden, and user cannot interact with it

5. FOR current mock implementation, THE User role check MAY be simplified (assume current user is RM)


### Requirement 15: No Modification to Existing Dashboards

**User Story:** As a project manager, I want the All Leads Dashboard to coexist with existing dashboards without affecting them, so that current functionality remains stable.

#### Acceptance Criteria

1. THE All_Leads_Dashboard SHALL be a new, independent page/route (e.g., /dashboard/all-leads)

2. THE Existing RmDashboard, TeamLeadDashboard, HeadDashboard, etc. SHALL NOT be modified or redesigned

3. THE All_Leads_Dashboard SHALL NOT change how leads are displayed or managed in existing dashboard views

4. WHEN user navigates from RmDashboard to All_Leads_Dashboard, THE Previous dashboard state SHALL remain unaffected

5. THE Claim action in All_Leads_Dashboard SHALL NOT automatically remove leads from other dashboard displays (leads remain visible, ownership just changes in UI state)

6. WHERE navigation links to All_Leads_Dashboard are added, THE Links SHALL be added to new locations (e.g., main nav, new menu item) rather than replacing existing navigation


### Requirement 16: Lead Claim State Persistence in Session

**User Story:** As a user, I want my claimed leads to persist during my session, so that I don't lose claim state if I navigate away and back.

#### Acceptance Criteria

1. WHEN user claims a lead, THE Claim_State SHALL be stored in client-side state (React state, Context, or local storage)

2. WHEN user navigates away from All_Leads_Dashboard and returns, THE Claimed_Leads SHALL still show as claimed in the session

3. IF user refreshes the page (F5 or reload), THE Claim state MAY be lost (acceptable for mock implementation; note: can be improved with localStorage)

4. WHEN user logs out or closes the browser, THE Claim state SHALL be reset (mock state is session-specific)

5. WHERE localStorage persistence is desired, THE System MAY store claimed leads in browser localStorage with key like "claimedLeads-{userId}" (optional enhancement)


### Requirement 17: No Real SLA Enforcement or Escalation

**User Story:** As a developer, I want to clarify that real SLA enforcement and escalation logic are not implemented, so that implementation scope is clear.

#### Acceptance Criteria

1. THE SLA_Status display in the All_Leads_Dashboard IS MOCK only:
   - SLA Status badges show simulated status based on mock timestamp calculations
   - No real SLA enforcement or automated escalation actions occur

2. WHEN SLA_Breached status is shown, THE System SHALL NOT:
   - Automatically reassign the lead
   - Send escalation notifications to manager
   - Lock the lead or prevent user actions

3. WHEN real SLA enforcement is implemented in future (in backend), THE Mock_Display MAY be replaced with actual SLA calculations from backend data

4. THE SLA Display in All_Leads_Dashboard SHALL be consistent with SLA display in other lead detail views (even if both are currently mock)


### Requirement 18: No Real Lead Reassignment Implementation

**User Story:** As a backend team, I want to confirm that real lead reassignment by Team Leads/Managers is not implemented in this feature, so that scope is limited to mock UI.

#### Acceptance Criteria

1. THE All_Leads_Dashboard SHALL NOT include a "Reassign" button or interface for Team Leads/Managers to reassign claimed leads from other RMs

2. WHILE reassignment is mentioned in feature objectives as a "future" capability, THE Implementation SHALL focus on individual RM lead claiming only

3. WHEN reassignment functionality is desired in future, THE Feature SHALL be added as a separate requirement/spec

4. FOR this MVP release, THE All_Leads_Dashboard focuses on: view available leads, claim lead, manage my claimed leads


### Requirement 19: Acceptance Criteria - Lead Table Display Properties

**User Story:** As a QA tester, I want clear testable acceptance criteria for lead table display, so that I can verify the dashboard displays correct information.

#### Acceptance Criteria

1. WHEN lead table is displayed, THE Round_Trip property SHALL hold: For each lead displayed, the student name displayed in table == student name in underlying mock data (round-trip: display → data match)

2. WHEN table is filtered and refreshed, THE Idempotent property SHALL hold: Applying the same filter twice produces the same result table (filtered result is stable)

3. WHEN sorting table by a column, THE Metamorphic property SHALL hold: Sort order is a strict ordering (if A < B in column and B < C, then A < C; ordering is transitive)

4. WHEN displaying SLA status, THE Invariant SHALL hold: For any lead, SLA_Status value is one of {On Track, At Risk, Breached, First Call Pending, Follow-up Pending, N/A} (valid set constraint)

5. WHEN filtering leads by multiple criteria, THE Confluence property SHALL hold: (Filter A AND Filter B) produces same result regardless of apply order


### Requirement 20: Acceptance Criteria - Claim Action Properties

**User Story:** As a developer, I want property-based test criteria for the claim action, so that I can verify claim correctness.

#### Acceptance Criteria

1. WHEN a lead is claimed, THE Idempotent property SHALL hold: Claiming the same lead twice results in same state as claiming once (claim is idempotent)

2. WHEN a lead is claimed, THE Invariant SHALL hold: Exactly one user can own a lead at any time in mock state (ownership cardinality: 1)

3. WHEN user claims a lead, THE Round_Trip property SHALL hold: Claim action → verify in "My Claimed Leads" → refresh page → lead still appears in "My Claimed Leads" (claim state persists in session round-trip)

4. WHEN multiple users claim different leads, THE Confluence property SHALL hold: User A claiming lead X and User B claiming lead Y produces same result as reverse order (claims are independent/commutative)

5. WHEN switching between "Available" and "My Claimed Leads" views, THE Partition property SHALL hold: A lead appears in exactly one view (Available OR My Claimed, not both), never both and never neither

