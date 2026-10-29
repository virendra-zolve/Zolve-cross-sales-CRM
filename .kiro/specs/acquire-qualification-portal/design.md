# Technical Design: Acquire Qualification Portal

## Overview

Acquire is a qualification workspace inside the existing Nexus-style React/TypeScript app. The first implementation keeps `App.tsx` as the single source of truth for the legacy `StudentLead[]` state initialized from `INITIAL_LEADS`. It adds a small, optional lifecycle aggregate to `StudentLead`, derives Acquire and Monetization views with pure helpers, and preserves all unrelated role views.

The implementation does not replace `StudentLead`, migrate the existing normalized API, or create a second store. The existing `leadsApi` remains a future integration seam because its singleton is not seeded from `INITIAL_LEADS`, while the current UI and `MonetizationCenter` operate on the legacy array.

Research findings that inform this design:

- `App.tsx` owns lead state, role switching, selected-lead navigation, and synchronous update callbacks.
- The current role switcher maps `agent` to Monetization Center and `qualification` to the existing `QualificationDashboard`; Manager and Head currently land on their existing dashboards.
- `QualificationDashboard` already supplies qualification KPIs and a pending queue, but it has no portal shell, signup gating, submit actions, or source-context validation.
- `MonetizationCenter` already supplies a reusable left-navigation shell and product-opportunity views. Its current helpers must be changed so every Monetization view first applies qualified-plus-confirmed-signup handoff eligibility.
- `StudentLead` already contains source, partner, BDE, intake, qualification, signup, assignment, product-opportunity, and activity fields. New lifecycle information can therefore be isolated in one optional field rather than spread across unrelated legacy fields.
- `LeadDetailViewRefactored` is the shared lead-detail experience. It currently edits qualification and exposes product actions, so Acquire must use a constrained portal mode that hides monetization actions while preserving the default Monetization/legacy mode.

The supplied Nexus reference is a layout direction only. The implementation uses the existing Tailwind visual language and does not require pixel-perfect reproduction.

## Architecture

```mermaid
flowchart LR
  Role[Current role switcher] --> Access[Portal access map]
  Access --> Selector[Nexus Workspace portal selector]
  Selector --> Acquire[AcquirePortal]
  Selector --> Monetization[MonetizationCenter]

  App[App.tsx\nStudentLead[] state] --> Acquire
  App --> Monetization
  App --> Detail[LeadDetailViewRefactored\nportal mode]

  Acquire --> AQ[Acquire lifecycle helpers]
  Monetization --> MQ[Monetization helpers]
  AQ --> App
  MQ --> App
  App -. future adapter .-> API[leadsApi / normalized model]
```

### State ownership and boundaries

`App.tsx` remains the canonical owner of:

- `leads: StudentLead[]` and immutable replacement of one lead at a time.
- Current role and its permitted portal set.
- Active portal, active Acquire section, active Monetization section, and selected lead return context.
- Qualification, submit, claim, release, signup confirmation, reassignment, and handoff callbacks.
- Existing Manager, Head, Team Lead, BDE, Partner Management, education-loan, and legacy lead-management routes.

Pure helper modules own lifecycle rules and projections. Components do not infer eligibility independently. The same helper predicates must feed queue counts, table rows, detail banners, empty states, and Monetization filters.

The first release is synchronous/in-memory, matching the existing App callback pattern. A future API implementation may replace callback internals, but the view-model and transition contracts remain unchanged.

### Portal access model

Add a small access map, preferably in `src/utils/portalAccessHelpers.ts`:

```ts
export type WorkspaceRole =
  | 'qualification_agent'
  | 'rm'
  | 'manager'
  | 'head';

export type PortalId = 'acquire' | 'monetization';

export interface PortalAccess {
  portals: PortalId[];
  canManageAcquire: boolean;
  canViewMonetization: boolean;
}

export const PORTAL_ACCESS: Record<WorkspaceRole, PortalAccess> = {
  qualification_agent: {
    portals: ['acquire'],
    canManageAcquire: true,
    canViewMonetization: false,
  },
  rm: {
    portals: ['monetization'],
    canManageAcquire: false,
    canViewMonetization: true,
  },
  manager: {
    portals: ['acquire', 'monetization'],
    canManageAcquire: true,
    canViewMonetization: true,
  },
  head: {
    portals: ['acquire', 'monetization'],
    canManageAcquire: true,
    canViewMonetization: true,
  },
};
```

The existing role values map as follows:

| Existing role switcher value | Workspace role | Portal availability | Default behavior |
|---|---|---|---|
| `qualification` | Qualification Agent | Acquire only | Opens Acquire |
| `agent` | RM | Monetization Center only | Opens Monetization Center |
| `manager` | Manager | Acquire and Monetization Center | Preserves Manager Dashboard as default; selector opens either portal |
| `head` | Head | Acquire and Monetization Center | Preserves Head Dashboard as default; selector opens either portal |
| `team_lead`, `bde`, `partner_mgmt` | Existing non-Nexus role view | Unchanged | Existing view remains intact |

The role switcher is a development/demo identity control, not an authorization boundary. `PortalSelector` must still reject a portal not in the current access map. Manager and Head retain their existing dashboards and oversight routes; adding the selector must not replace those views.

## Components and Interfaces

### `PortalSelector`

A small shared control rendered in the Nexus workspace chrome, near the existing role switcher/header. It receives only permitted portals and never hard-codes role checks:

```ts
interface PortalSelectorProps {
  availablePortals: PortalId[];
  activePortal: PortalId | null;
  onSelect: (portal: PortalId) => void;
}
```

It displays only `availablePortals`, marks `activePortal`, and ignores/rejects an attempted selection not present in the list. For Manager and Head, both options are visible. For Qualification Agent and RM, the single permitted portal remains visible as the current workspace without exposing the other portal’s work views.

### `AcquirePortal`

New shell component, preferably `src/components/AcquirePortal.tsx`, responsible for:

- Acquire title and persistent navigation.
- Sections: Dashboard, Qualification Queue, My Claimed Leads, Signup Pending, Handoff History.
- Active-section state, mobile navigation, section-specific empty states, and view-model rendering.
- Passing selected leads to the existing App detail flow while retaining `AcquireSection` as return context.
- Excluding product-opportunity and monetization actions from all Acquire work views.

```ts
export type AcquireSection =
  | 'dashboard'
  | 'qualification-queue'
  | 'my-claimed-leads'
  | 'signup-pending'
  | 'handoff-history';

interface AcquirePortalProps {
  leads: StudentLead[];
  activeSection: AcquireSection;
  onSectionChange: (section: AcquireSection) => void;
  onSelectLead: (lead: StudentLead, section: AcquireSection) => void;
  onRecordQualification: (leadId: string, input: QualificationInput) => OperationResult;
  onSubmitLead: (leadId: string, mode: 'submit' | 'submit-and-claim') => OperationResult;
  onReleaseLead?: (leadId: string, reason: string) => OperationResult;
  onConfirmSignup: (leadId: string, input: SignupConfirmationInput) => OperationResult;
  onHandoff: (leadId: string) => OperationResult;
  currentUser: PortalUser;
}
```

`Dashboard` reuses the existing `QualificationDashboard` KPI concepts with Acquire-specific counts. `Qualification Queue` adapts `QualificationDashboard`/`LeadTable` to show source context, queue state, and an explicit qualification action. `My Claimed Leads` and `Signup Pending` use the same lead-detail selection pattern. `Handoff History` is read-only and uses the audit/history projection.

### Adapted qualification detail

`LeadDetailViewRefactored` remains the shared detail component and receives a portal mode:

```ts
type LeadDetailMode = 'legacy' | 'monetization' | 'acquire';

interface LeadDetailViewRefactoredProps {
  lead: StudentLead;
  mode?: LeadDetailMode;
  onBack: () => void;
  onUpdateLead: (updatedLead: StudentLead) => void;
  onOpenEducationLoan?: (lead: StudentLead) => void;
  onAcquireAction?: (action: AcquireDetailAction) => OperationResult;
}
```

In `acquire` mode it:

- Shows identity, Lead ID, contact/study context, attribution, qualification state, signup state, Portal State, owner, next transition, and reverse-chronological audit history.
- Allows qualification decision, Submit, Submit and Claim, signup confirmation, and eligible Handoff through callbacks.
- Hides or disables the Products tab, product toggles, product status changes, Education Loan actions, and other monetization operations.
- Preserves read-only qualification and audit history after handoff.

The default mode preserves the existing detail behavior for unrelated views and Monetization Center.

### `QualificationDashboard` adaptation

Keep the component name and existing KPI structure. Add optional props for queue projection and actions rather than replacing it:

```ts
interface QualificationDashboardProps {
  leads: StudentLead[];
  onSelectLead: (lead: StudentLead) => void;
  view?: 'dashboard' | 'queue';
  showAcquireContext?: boolean;
}
```

Its pending calculation must use `getQualificationQueueLeads`, not only `qualificationStatus === 'Pending'`, so submitted, unqualified, handed-off, and legacy records do not leak into the active queue.

### Reused `MonetizationCenter`

Keep the existing shell and `MonetizationSection` contract. Add a filtered lead input or a shared eligibility helper rather than duplicating a second Monetization shell:

```ts
interface MonetizationCenterProps {
  leads: StudentLead[]; // already eligible or filtered internally by the shared helper
  activeSection?: MonetizationSection;
  onSectionChange?: (section: MonetizationSection) => void;
  // existing callbacks remain
}
```

`getAvailableOpportunityRows`, `getOwnedOpportunityRows`, `getMyLeadGroups`, and RM dashboard projections must all use the same `isMonetizationEligible` predicate. Product ownership remains `ProductOpportunity.productOwner`; it is not replaced by Acquire qualification ownership.

### Pure helper interfaces

Prefer `src/utils/acquireHelpers.ts` for lifecycle logic:

```ts
export type PortalState =
  | 'Qualification Queue'
  | 'Acquire History'
  | 'Signup Pending'
  | 'Monetization'
  | 'Handoff History';

export interface PortalUser {
  id: string;
  name: string;
  role: WorkspaceRole;
}

export interface QualificationInput {
  status: 'Qualified' | 'Not Qualified';
  reason?: string;
  notes?: string;
}

export interface SignupConfirmationInput {
  customerId: string;
  accountMobile?: string;
  accountEmail?: string;
  consentAccepted: boolean;
}

export interface OperationResult {
  success: boolean;
  lead?: StudentLead;
  error?: string;
}

export const getEffectivePortalState = (lead: StudentLead): PortalState => ...;
export const getQualificationQueueLeads = (leads: StudentLead[]): StudentLead[] => ...;
export const getMyClaimedLeads = (leads: StudentLead[], owner: string): StudentLead[] => ...;
export const getSignupPendingLeads = (leads: StudentLead[]): StudentLead[] => ...;
export const getHandoffHistoryLeads = (leads: StudentLead[]): StudentLead[] => ...;
export const isSignupConfirmed = (lead: StudentLead): boolean => ...;
export const isHandoffEligible = (lead: StudentLead): boolean => ...;
export const isMonetizationEligible = (lead: StudentLead): boolean => ...;
export const getAttributionWarnings = (lead: StudentLead): string[] => ...;
```

Each mutation helper must accept a complete lead and return a new lead or a failure result. It must not mutate the input object or unrelated opportunities.

### App integration and return context

Add `acquireSection` and a shared return context in `App.tsx`:

```ts
interface WorkspaceReturnContext {
  portal: 'acquire' | 'monetization' | 'legacy';
  section?: AcquireSection | MonetizationSection;
}
```

`handleSelectLead` stores the originating portal/section before setting `currentView = 'detail'`. `handleBackToDashboard` restores that context. Lift the active section into App through optional controlled props for both new shells, fixing the current unmount/reset behavior without changing unrelated routes.

## Data Models

### Minimal legacy-compatible lifecycle extension

Add one optional aggregate to `StudentLead`; existing fixtures remain valid without it:

```ts
export interface QualificationHistoryEntry {
  id: string;
  status: 'Qualified' | 'Not Qualified';
  reason?: string;
  notes?: string;
  actor: string;
  timestamp: string;
}

export interface SignupVerification {
  status: 'Not Started' | 'Unknown' | 'Confirmed';
  customerId?: string;
  accountMobile?: string;
  accountEmail?: string;
  consentAcceptedAt?: string;
  confirmedAt?: string;
  confirmedBy?: string;
}

export interface HandoffState {
  status: 'Not Eligible' | 'Eligible' | 'Completed' | 'Failed';
  handedOffAt?: string;
  handedOffBy?: string;
  failureReason?: string;
  monetizationOwnerSnapshot?: string;
}

export interface AcquireLifecycle {
  portalState: PortalState;
  qualificationOwner?: string;
  qualificationOwnerAssignedAt?: string;
  submittedAt?: string;
  qualificationHistory: QualificationHistoryEntry[];
  signup: SignupVerification;
  handoff: HandoffState;
}
```

`StudentLead` gains only:

```ts
acquireLifecycle?: AcquireLifecycle;
referrerCode?: string;
referrerName?: string;
```

`referrerCode`/`referrerName` are optional because the legacy model has `bdeCode` but no explicit referrer field. `sourceCode`, `partnerCode`, `bdeCode`, `referrer*`, `intake`, `isInboundRaw`, and `inboundCompletionPct` are preserved as recorded. No handoff operation overwrites attribution.

### Compatibility defaults for legacy fixtures

`getEffectivePortalState` supplies a non-persisted compatibility state when `acquireLifecycle` is absent:

1. `qualificationStatus === 'Pending'` -> `Qualification Queue`.
2. `qualificationStatus === 'Not Qualified'` -> `Acquire History`.
3. `qualificationStatus === 'Qualified'` and a real signed-up customer (`signupStatus === 'Signed Up'` and `customerId` is present and not `'na'`) -> `Monetization`.
4. `qualificationStatus === 'Qualified'` without confirmed signup -> `Signup Pending`.
5. An explicit lifecycle value always wins over the compatibility default.

This prevents old seeded qualified/signed-up product records from disappearing while ensuring qualified but unsigned, unqualified, and pending records cannot enter Monetization. Existing binary `signupStatus` remains unchanged for compatibility; `SignupVerification` supplies the required verification and consent audit for new flows.

### Signup minimum

Signup confirmation requires:

- A non-empty Zolve `customerId`/account identifier.
- At least one account contact (`accountMobile` or `accountEmail`), validated using the existing lead contact rules where applicable.
- `consentAccepted === true`, stored as `consentAcceptedAt`.

Full onboarding, education-loan application completion, documents, or product selection are not required. A legacy `Signed Up` record without a real customer ID is treated as `Unknown`, not confirmed.

### Lifecycle and ownership semantics

- `portalState` is the cross-portal lifecycle location. `Acquire History` is used for unqualified outcomes; `Handoff History` is reserved for completed handoffs.
- `qualificationOwner` is separate from legacy `leadOwner`. Submit clears only the continuing qualification owner; it does not rewrite historical RM/lead assignment fields.
- Submit sets `portalState = 'Signup Pending'` and clears `qualificationOwner`.
- Submit and Claim sets `portalState = 'Signup Pending'` and retains the acting Qualification Agent in `qualificationOwner`.
- Retained ownership remains until confirmed signup, explicit release, or Manager/Head reassignment. Release and reassignment must append assignment/audit activity; a release reason is required.
- Confirmed signup sets the nested signup status and makes handoff eligible only when qualification is `Qualified`.
- Handoff sets `handoff.status = 'Completed'` and `portalState = 'Handoff History'` in Acquire. Monetization receives a read-only origin snapshot and becomes the source of record for product work. Product opportunities remain attached to the same Lead ID and continue to use `productOwner`.

### Monetization filtering

The existing monetization helper predicates become:

```ts
export const isMonetizationEligible = (lead: StudentLead): boolean =>
  lead.qualificationStatus === 'Qualified' &&
  isSignupConfirmed(lead) &&
  (getEffectivePortalState(lead) === 'Monetization' ||
   !lead.acquireLifecycle?.handoff ||
   lead.acquireLifecycle.handoff.status === 'Completed');
```

For explicit lifecycle records, only `portalState === 'Monetization'` after handoff should be included. The compatibility branch allows old qualified/signed-up records without lifecycle metadata to remain visible. All Monetization Center projections apply this predicate before product-owner filtering. Therefore:

- Pending qualification, unqualified, and Signup Pending leads never appear in Lead Pool, My Leads, product tabs, or RM dashboard product projections.
- A qualified lead with confirmed signup can appear in those views even when no product opportunity has been claimed yet.
- A lead’s product ownership remains independent per opportunity.
- Handoff History is not a Monetization worklist; it is Acquire read-only history. The receiving Monetization projection uses the same Lead ID and handoff snapshot.

### Audit and source context

Every supported lifecycle mutation appends an immutable `ActivityItem` with actor, timestamp, action, Lead ID relationship, and serialized previous/result state in the description. If the implementation extends `ActivityItem`, optional `previousValue` and `newValue` fields should match the normalized `LeadActivity` shape. Qualification decisions also append `QualificationHistoryEntry`; existing `activities` remain the UI audit source and are sorted newest first.

`getAttributionWarnings` flags missing source, partner-without-source, or referrer/BDE inconsistency without replacing any original field. The queue/detail view shows the warning alongside the raw values.

## Correctness Properties

*A property is a characteristic or behavior that should hold true across all valid executions of a system—essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.*

### Prework and property reflection

The acceptance criteria were assessed before property generation. UI copy/layout requirements are covered by focused examples; missing/unverified signup and empty queues are edge cases; unresolved notification and release-policy questions remain design decisions. Redundant criteria were consolidated: signup exclusion is one cross-portal predicate, the two submit actions are one parameterized transition family, product filtering is one exact predicate, and handoff removal/history membership is one projection transition. No property below is retained solely because it repeats another property’s assertion.

### Property 1: Role portal access is exact

For all supported workspace roles, the portal selector options and portal-opening result must equal the access map: Qualification Agent gets Acquire only, RM gets Monetization Center only, and Manager/Head get both; selecting a disallowed portal must not change the active portal.

**Validates: Requirements 1.1, 1.2, 1.3, 1.4, 1.5, 1.6, 1.7**

### Property 2: Acquire navigation is exclusive and preserves context

For all Acquire sections and selected lead contexts, selecting a section marks exactly that section active, exposes no monetization work view, and leaving/returning restores the selected section and lead context.

**Validates: Requirements 2.2, 2.3, 2.4**

### Property 3: Qualification queue membership is exact

For all lead collections, the Qualification Queue contains exactly leads whose effective Portal State is `Qualification Queue` and whose qualification status is `Pending`, with each Lead ID appearing at most once.

**Validates: Requirements 3.1, 3.4**

### Property 4: Queue context preserves required attribution

For all in-scope leads, the Acquire context projection preserves Lead ID, source, partner, BDE/referrer, intake, and original raw values, and any detected attribution inconsistency produces a warning without modifying those values.

**Validates: Requirements 3.2, 3.3, 3.5**

### Property 5: Qualification decisions are audited and validated

For all valid qualification submissions, the resulting lead stores the decision, actor, timestamp, and history entry; every unqualified submission has a non-empty reason or note, while invalid or failed submissions leave the last confirmed lead state unchanged.

**Validates: Requirements 4.1, 4.3, 4.5, 8.3**

### Property 6: Qualification outcome derives the correct next state

For all pending leads, a Qualified decision produces `Signup Pending` eligibility and exposes Submit/Submit and Claim actions, while a Not Qualified decision produces Acquire History membership and never produces Monetization eligibility.

**Validates: Requirements 4.2, 4.4, 5.1**

### Property 7: Submit modes differ only in continuing qualification ownership

For all qualified leads and acting Qualification Agents, Submit moves the lead to shared Signup Pending with no continuing qualification owner, while Submit and Claim moves it to the same queue and retains exactly the acting agent; all source, qualification, assignment-history, and audit context remains preserved.

**Validates: Requirements 5.2, 5.3, 5.4, 5.5, 5.6**

### Property 8: Submit failures are non-mutating

For all leads that are not qualified, already handed off, missing, or otherwise invalid for submission, a submit attempt returns an actionable error and leaves queue state, owner, qualification state, and source context unchanged.

**Validates: Requirements 5.7**

### Property 9: Signup confirmation is minimum-data gated

For all signup inputs, confirmation succeeds exactly when a valid account identifier, at least one account contact, and accepted consent are present; it does not require full onboarding, and invalid inputs do not mutate signup state.

**Validates: Requirements 6.3, 6.7**

### Property 10: Monetization eligibility is a conjunction

For all leads, Monetization Center projections include a lead only when qualification is Qualified, signup is confirmed, and the effective lifecycle state permits Monetization work; every unqualified, unsigned, unknown, or Signup Pending lead is excluded from every product queue, owner view, and worklist.

**Validates: Requirements 6.1, 6.2, 6.4, 6.5, 6.6**

### Property 11: Signup Pending and claimed views expose ownership and signup state

For all qualified, unhanded-off leads, Signup Pending contains the lead exactly once, My Claimed Leads contains it exactly when its qualification owner matches the current user, and each row exposes signup state, current owner, pending reason, and next transition.

**Validates: Requirements 5.4, 6.6, 8.1, 8.5**

### Property 12: Handoff is authorized and preserves the aggregate

For all leads, handoff succeeds exactly when qualification is Qualified and signup is confirmed; on success, the receiving Monetization context preserves Lead ID, source/partner/BDE/referrer, qualification decision/notes, signup confirmation, ownership history, and handoff audit data. Unqualified or unconfirmed leads are rejected without mutation.

**Validates: Requirements 6.4, 7.1, 7.2, 7.7, 8.6**

### Property 13: Handoff changes system-of-record boundaries

For all successfully handed-off leads, Acquire active queues exclude the lead, Handoff History includes it exactly once, Acquire qualification/audit data is readable but mutation attempts are rejected, and product opportunity mutations are accepted only through Monetization operations.

**Validates: Requirements 7.3, 7.4, 7.5**

### Property 14: Handoff failures are non-mutating

For all eligible leads when a handoff operation fails, the lead remains outside Monetization worklists, confirmed qualification and signup data remain intact, no partial receiving record is created, and authorized users receive a failure state.

**Validates: Requirements 7.6**

### Property 15: Monetization views apply exact product ownership after gating

For all leads and supported Monetization products, every returned row is both Monetization-eligible and owned by the current RM for the exact requested product, and every source opportunity satisfying those predicates is returned without copying `leadOwner` into `productOwner`.

**Validates: Requirements 7.3, 8.2**

### Property 16: Audit history is complete and ordered

For all successful lifecycle transitions, the audit history contains actor, timestamp, previous state, resulting state, and the same Lead ID relationship; authorized history views return all events in reverse chronological order.

**Validates: Requirements 8.3, 8.4, 8.6**

### Property 17: Monetization remains product-work source of record

For all handed-off leads, Monetization context exposes Acquire origin, qualification outcome, signup confirmation, handoff state, source context, and handoff history while Acquire exposes no product-opportunity action.

**Validates: Requirements 7.2, 7.3, 7.5, 8.2**

## Error Handling

- **Unauthorized portal:** reject selection and retain the current portal; do not render the unauthorized shell or its work views.
- **Lead not found:** return a typed failure, retain the current list, and show a return-to-section action rather than invoking detail with a fabricated lead.
- **Invalid qualification:** require a decision and require a reason or note for Not Qualified. Preserve the last confirmed state.
- **Stale submit/claim:** verify the current effective state before mutation. If another operation changed it, return a conflict and leave the local lead unchanged.
- **Invalid release/reassignment:** require an authorized Manager/Head or current owner and a release reason. Preserve the owner on failure.
- **Invalid signup:** reject missing account identifier/contact or consent, show field-level guidance, and leave `signupStatus` unchanged.
- **Handoff not eligible:** reject unqualified, unknown-signup, unsigned, already-handed-off, or missing leads with a descriptive reason.
- **Handoff failure:** perform the lifecycle update atomically from App’s perspective. If the receiving projection cannot be created, retain qualification/signup data, keep the lead out of Monetization worklists, record `handoff.status = 'Failed'`, and show retry guidance.
- **Read-only history:** reject product, qualification, signup, and ownership mutations from Handoff History except explicitly authorized audit-safe actions; the first release provides no edit action there.
- **Malformed legacy data:** tolerate absent optional lifecycle and attribution fields through compatibility defaults, show `Unknown`/`Not recorded`, and never infer a partner, referrer, signup confirmation, or product opportunity that is not present.
- **Existing API boundary:** do not partially update both `StudentLead[]` and the separate `leadsApi` singleton. Until migration is explicit, App state is authoritative for this feature.

## Testing Strategy

Use Vitest and `fast-check` for pure property tests. The repository already has Vitest in `devDependencies`, but the existing tests are mostly example-style despite property filenames. Implementation should add `fast-check` as a pinned dev dependency only if it is not already available; do not implement generators or shrinking manually. Each property-based test must run at least 100 cases and be implemented by one test per design property. Every test includes a comment in this form:

```ts
// Feature: acquire-qualification-portal, Property 10: Monetization eligibility is a conjunction
```

### Unit and example tests

Keep unit tests focused on fixed examples, component contracts, integration seams, and error/edge behavior:

- Portal selector shows exactly one option for Qualification Agent/RM and both options for Manager/Head.
- Existing `team_lead`, `bde`, `partner_mgmt`, Manager Dashboard, Head Dashboard, and education-loan routes remain reachable.
- Acquire renders exactly Dashboard, Qualification Queue, My Claimed Leads, Signup Pending, and Handoff History, with no Products navigation.
- Qualification queue shows partner-originated data, source/partner/BDE/referrer fields, Lead ID, and an empty state when no pending work exists.
- Not Qualified requires a reason/note and never appears in Monetization.
- Submit clears qualification ownership; Submit and Claim retains it.
- A retained owner remains until release, signup, or Manager/Head reassignment.
- Signup confirmation works with minimum account details and consent but without full onboarding; missing consent and unknown verification remain outside Monetization.
- Handoff moves the lead to Handoff History, preserves origin/audit context, and exposes no Acquire product actions.
- Existing qualified/signed-up legacy fixtures remain visible in Monetization through compatibility defaults; qualified unsigned fixtures do not.
- Existing Monetization product ownership remains independent for two products on the same lead.
- Failed qualification, submit, signup, and handoff operations preserve deep snapshots and show actionable errors.
- Activity/history views are reverse chronological and include actor/timestamp/previous/result state.

### Property-based tests

Generate `StudentLead` aggregates with mixed source context, qualification outcomes, explicit/omitted lifecycle metadata, signup combinations, qualification owners, handoff failures, assignments, activities, and multiple product opportunities. Avoid duplicate IDs except in deliberate malformed-data tests.

Required property tests correspond one-to-one with Properties 1–17. Generators should cover:

- Every supported workspace role and permitted/disallowed portal.
- Every Acquire section and return-context sequence.
- Empty, pending, qualified, unqualified, Signup Pending, Monetization, and Handoff History states.
- Missing source context and inconsistent partner/BDE/referrer combinations.
- Both submit modes, owner release, and Manager/Head reassignment.
- Valid and invalid signup combinations, including real customer IDs versus legacy `'na'`.
- Product opportunities with absent, empty, current-RM, and other-RM owners and all existing statuses.
- Handoff success, stale state conflicts, and failed receiving operations.

Property tests should compare immutable deep snapshots to prove that failed operations and successful operations do not mutate unrelated fields/opportunities. Component properties may use React Testing Library if it is added to the project; pure lifecycle and projection properties should not require a DOM.

### Validation scope

No application code is implemented in this phase. During implementation, run targeted Acquire helper/component tests, the existing lifecycle and assignment tests, `npm run lint`, and `npm run build`. Verify the existing Monetization Center tests/flows after applying the eligibility gate. The normalized `leadsApi` tests remain separate until a deliberate migration connects that store to App state.

## Design Decisions and Deferred Questions

- **Legacy-first storage:** use one optional `acquireLifecycle` aggregate on `StudentLead`; do not migrate unrelated normalized tables in the first release.
- **Separate ownership domains:** retain legacy `leadOwner`, use `qualificationOwner` for Acquire, and use `productOwner` for Monetization product work.
- **Centralized handoff gate:** require Qualified plus confirmed signup before any Monetization projection or handoff.
- **Compatibility defaults:** derive state for old fixtures so the recently built Monetization Center remains usable without manually rewriting `INITIAL_LEADS`.
- **Role-switcher mapping:** treat `agent` as RM and `qualification` as Qualification Agent; Manager/Head get the shared selector while their existing dashboards remain intact.
- **Release policy assumption:** the current qualification owner may release their claim; Manager/Head may release or reassign with a required reason. This should be confirmed before implementation if the business wants a different policy.
- **Notifications:** queue, signup, handoff, and failure notifications are deferred because the approved requirements leave channels, recipients, and timing open.
- **Customer without qualification:** a confirmed signup without a Qualified decision remains outside Monetization and is flagged for authorized Manager/Head review, matching the safe gating rule.
