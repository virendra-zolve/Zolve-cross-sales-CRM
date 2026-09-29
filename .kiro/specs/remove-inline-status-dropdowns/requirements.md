# Requirements Document

## Introduction

The Zolve RM Dashboard previously exposed two kinds of inline actions in the lead table (`LeadTable`) that bypassed the Lead Detail View:

1. **Inline status editing** on the Journey Stage, Calling Status, and Lead Status columns, which allowed users to mutate a lead's status directly from a table row.
2. **Inline Call and Log action buttons** in the Actions column, which triggered call and outcome-logging flows without opening the lead.

Both patterns encouraged accidental edits and skipped the richer context and validation available in the Lead Detail View. This feature removes them. Status columns are now display-only. The Call and Log actions are accessible only from the Lead Detail View (which already provides them). The Claim button is preserved because it is how RMs pick up unassigned leads from the queue. The View arrow is preserved for row navigation.

The change applies to every consumer of the shared `LeadTable` component: the RM Dashboard queue, Team Lead Dashboard, All Leads view, and BDE Dashboard's partner-leads panel.

## Glossary

- **Lead_Table**: `src/components/LeadTable.tsx`. Renders a tabular view of leads; previously supported inline status editing and inline Call/Log actions.
- **Lead_Detail_View**: `src/components/LeadDetailView.tsx` and `src/components/LeadDetailViewRefactored.tsx`, plus child section components under `src/components/sections/`. The only place a lead's status fields can be edited and the only in-table place from which the Call and Log flows are initiated.
- **All_Leads_View**: `src/components/AllLeadsView.tsx`, a `Lead_Table` consumer that renders the "claim leads" queue.
- **Status_Field**: One of `journeyStage`, `callingStatus`, `leadStatus` on a lead.
- **Status_Cell**: A rendered table cell in `Lead_Table` that displays a `Status_Field`.
- **Read_Only_Badge**: A non-interactive colored pill that displays a `Status_Field` value without any editing affordance.
- **Row_Navigation**: The user action of clicking a navigational cell or the View arrow to open the `Lead_Detail_View` for that row.
- **Actions_Column**: The rightmost column of `Lead_Table` that renders per-row action buttons.
- **Claim_Action_Button**: The per-row "Claim" button rendered in the `Actions_Column` when `showClaimButton` is true, wired to `onClaimLead`.
- **View_Arrow_Button**: The per-row chevron button in the `Actions_Column` that opens the `Lead_Detail_View` via `onSelectLead`.

## Requirements

### Requirement 1: Status columns are read-only

**User Story:** As an RM, I want status columns in the lead table to be display-only, so that I do not accidentally mutate a lead and I am guided into the detail view for any updates.

#### Acceptance Criteria

1. THE `Lead_Table` SHALL render Journey Stage, Calling Status, and Lead Status as `Read_Only_Badge` cells with no inline edit control.
2. THE `Lead_Table` SHALL NOT render a chevron-down icon, `<select>`, or `<option>` element inside any `Status_Cell`.
3. WHEN a user clicks a `Status_Cell`, THE `Lead_Table` SHALL trigger `Row_Navigation` for that lead.
4. THE `Lead_Table` SHALL NOT apply CSS hover, cursor, or focus styles on the badge element itself that suggest inline editing is available. Hover/cursor styling belongs to the `<td>` wrapper for row navigation only.

### Requirement 2: Preserve read-only presentation

**User Story:** As an RM, I want the status columns to remain visually informative, so I can scan the table at a glance.

#### Acceptance Criteria

1. THE `Lead_Table` SHALL display each `Status_Field` as a colored badge using the same color and label conventions previously used for the non-editing state.
2. THE `Lead_Table` SHALL keep Journey Stage, Calling Status, and Lead Status in the default visible column set for lead mode.
3. THE `Lead_Table` SHALL keep Journey Stage, Calling Status, and Lead Status entries in the show/hide columns configuration panel.
4. THE `Lead_Table` SHALL keep column-header filters for Journey Stage, Calling Status, and Lead Status with the option lists that existed prior to this change.

### Requirement 3: Remove inline Call and Log buttons; preserve Claim and View

**User Story:** As an RM, I want the Call and Log actions to be reached only after opening a lead, but I still need to claim unassigned leads directly from the queue and navigate to a lead from the table.

#### Acceptance Criteria

1. THE `Lead_Table` SHALL NOT render a Call button in the `Actions_Column`. The Call action SHALL be available in the `Lead_Detail_View` only.
2. THE `Lead_Table` SHALL NOT render a Log button in the `Actions_Column`. Outcome logging SHALL be captured through the `Lead_Detail_View`.
3. WHERE `showClaimButton` is true and an `onClaimLead` handler is provided, THE `Lead_Table` SHALL render the `Claim_Action_Button` and SHALL invoke `onClaimLead(lead)` on click.
4. THE `Lead_Table` SHALL render the `View_Arrow_Button` and SHALL invoke `onSelectLead(lead)` on click.
5. THE `Lead_Table` SHALL continue to trigger `Row_Navigation` when the student name, lead ID, priority, next-call, products, KPI status, or view-arrow cell of a row is clicked.
6. THE `Lead_Table` SHALL continue to support row-selection checkboxes, bulk assignment, sorting, search, and column visibility without regression.

### Requirement 4: Remove inline editing state, handlers, and dead prop pass-through

**User Story:** As a developer, I want dead inline-editing state, handlers, and prop plumbing removed so the code cannot be re-enabled by accident.

#### Acceptance Criteria

1. THE `Lead_Table` SHALL NOT retain `editingCell` state or any equivalent inline-editing state.
2. THE `Lead_Table` SHALL NOT retain a `handleInlineEdit` function or any equivalent function that mutates a `Status_Field` from within the table.
3. THE `Lead_Table` SHALL NOT destructure or use `onUpdateLead`, `onInitiateCall`, or `onQuickLogOutcome` inside its implementation. These props MAY remain in the props interface as optional for backwards compatibility with existing call sites during the transition, but SHALL be unused in behavior.
4. THE `All_Leads_View` SHALL NOT define a `handleUpdateLead` handler and SHALL NOT accept `onInitiateCall` or `onQuickLogOutcome` props.
5. THE `Rm_Dashboard`, `Team_Lead_Dashboard`, and `Bde_Dashboard` SHALL NOT define no-op `handleUpdateLead` handlers and SHALL NOT accept or forward `onInitiateCall` or `onQuickLogOutcome` props to `Lead_Table` for the purpose of the removed inline actions.
6. THE `App` SHALL NOT define a `handleQuickLogOutcome` function. THE `App` SHALL retain `handleInitiateCall` because it remains used by `Lead_Detail_View` and `Education_Loan_Detail_View`.

### Requirement 5: Regression-free type safety, imports, and build

**User Story:** As a developer, I want the codebase to compile cleanly after the removal.

#### Acceptance Criteria

1. THE project SHALL compile with no new TypeScript errors introduced by this change.
2. THE `Lead_Table` SHALL not import icons or types that become unused as a result of this change, including `Phone`, `ChevronDown`, `Clock`, `CheckCircle2`, `SlidersHorizontal`, `Plus`, `JourneyStage`, and `isLeadOverdue`.
3. THE `All_Leads_View`, `Rm_Dashboard`, `Team_Lead_Dashboard`, and `Bde_Dashboard` SHALL not retain imports, props, or handler definitions that become unused after this change.
