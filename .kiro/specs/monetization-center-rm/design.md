# Technical Design: RM Monetization Center

## Overview

The Monetization Center is an RM-only workspace layered into the existing React/TypeScript dashboard. It provides a persistent left navigation shell for Dashboard, Lead Pool, My Leads, Education Loan, and Credit Card while preserving the existing RM dashboard metrics, lead tables, lead detail actions, and product journeys.

The first release is intentionally mock/in-memory. `App.tsx` remains the source of truth for the legacy `StudentLead[]` state initialized from `INITIAL_LEADS`. The new workspace derives product-opportunity rows from that state and updates only the selected opportunity when it is claimed. The existing normalized `leadsApi` remains an integration seam, but it is not used as the primary store because its singleton is separate from and not seeded with `INITIAL_LEADS`.

Research findings that inform this design:

- `StudentLead.productOpportunities` already supports independent `productOwner` values, but the field is optional (`src/types.ts`).
- Many legacy opportunities omit `productOwner`; those records must be treated as unowned rather than inheriting `StudentLead.leadOwner`.
- `AllLeadsView` and `LeadTable` currently claim an entire lead in local component state, which conflicts with product-level ownership and will be bypassed for Monetization Center claims.
- `RmDashboard` already owns the RM KPI and product-performance behavior and should be reused with an RM-scoped lead projection (`src/components/RmDashboard.tsx`).
- `LeadDetailViewRefactored` accepts a legacy `StudentLead` and preserves existing lead actions and Education Loan navigation (`src/components/LeadDetailViewRefactored.tsx`).
- `leadsApi` exposes product updates and lead assignments, but its normalized records and status spellings are not directly connected to the legacy mock array (`src/api/leadsApi.ts`).

The supplied Nexus screenshot is a layout reference only. The implementation uses the existing Tailwind design language and does not attempt pixel-perfect reproduction.

## Architecture

```mermaid
flowchart LR
  App[App.tsx\nlegacy StudentLead[] state] --> Shell[MonetizationCenter\npersistent shell]
  Shell --> Nav[Primary navigation]
  Shell --> Projection[Opportunity adapter\nlegacy -> view rows]
  Projection --> Pool[Lead Pool]
  Projection --> Mine[My Leads]
  Projection --> Products[Product tabs]
  Shell --> Dashboard[RmDashboard\nRM-scoped projection]
  Pool --> Claim[Opportunity claim handler]
  Claim --> App
  Mine --> Detail[LeadDetailViewRefactored]
  Products --> Detail
  Detail --> Journey[EducationLoanJourneyPage\nwhen supported]
  App -. future normalized integration .-> API[leadsApi]
```

### Integration boundary

`App.tsx` continues to own the canonical `leads` state and the existing global detail/journey handlers. The Monetization Center is added as a composition boundary for the RM experience rather than introducing a second database or changing the normalized schema. Its callbacks are:

- `onUpdateLead(updatedLead)`: forwards compatible detail edits to the existing App handler.
- `onClaimOpportunity(leadId, opportunityId)`: performs an opportunity-level immutable update in App state and returns success or failure to the shell.
- `onSelectLead(lead)`: uses the existing detail flow, while retaining the shell section as return context.
- `onOpenEducationLoan(lead)`: forwards the current Education Loan journey handler.

When the active user is the mock RM role, App renders the shell in place of the direct RM dashboard branch. Team Lead, Manager, Head, BDE, qualification, partner, and existing non-RM routes remain unchanged.

## Components and Interfaces

### `MonetizationCenter`

New shell component responsible for:

- Rendering the persistent left sidebar.
- Keeping `activeSection` in local state with values `dashboard | lead-pool | my-leads | education-loan | credit-card`.
- Rendering the active content area without replacing the shell when a lead detail is opened.
- Preserving section and selected lead context in memory. On return from detail, the previously active section and its filtered list remain visible.
- Showing a compact error banner when a claim fails; errors do not clear or mutate the last known rows.

The sidebar has two labeled groups:

- Primary: Dashboard, Lead Pool, My Leads.
- Products: Education Loan, Credit Card.

Each item has an accessible button, a stable label, and an active visual state. No new router or URL state is required for this mock release.

### `OpportunityListView`

A minimal reusable list/table wrapper for the Lead Pool and product tabs. It receives normalized view rows rather than raw opportunities:

```ts
interface OpportunityRow {
  lead: StudentLead;
  opportunity: ProductOpportunity;
  ownerLabel: string;
  isAvailable: boolean;
}

interface OpportunityListViewProps {
  rows: OpportunityRow[];
  mode: 'pool' | 'owned';
  emptyTitle: string;
  emptyDescription: string;
  onSelect: (row: OpportunityRow) => void;
  onClaim?: (row: OpportunityRow) => void;
}
```

The pool row action is `Claim`. The owned/product row action opens lead detail. Rows should show student name, lead ID, product, opportunity status, owner, and relevant lead context (destination, intake, next call, or current stage). Existing `LeadTable` may be reused for a lead-level view, but it should not be forced to represent multiple opportunity rows or product-specific claim actions. The minimal implementation can use a purpose-built table that delegates row detail selection to the existing handlers.

### Opportunity adapter and ownership helpers

Add a small pure adapter module, preferably `src/utils/monetizationHelpers.ts`, with no React dependencies:

```ts
export const CURRENT_RM = 'Virendra (You)';
export const MONETIZATION_PRODUCTS: MasterProduct[] = ['Education Loan', 'Credit Card'];

export interface OpportunityRow {
  lead: StudentLead;
  opportunity: ProductOpportunity;
  ownerLabel: string;
  isAvailable: boolean;
}

export const getOpportunityRows = (
  leads: StudentLead[],
  product?: MasterProduct,
): OpportunityRow[] => ...;

export const getAvailableOpportunityRows = (
  leads: StudentLead[],
): OpportunityRow[] => ...;

export const getOwnedOpportunityRows = (
  leads: StudentLead[],
  owner: string,
  product?: MasterProduct,
): OpportunityRow[] => ...;

export const claimOpportunity = (
  lead: StudentLead,
  opportunityId: string,
  owner: string,
): StudentLead | null => ...;
```

Adapter rules:

1. Flatten every `lead.productOpportunities` entry into one row. Product identity is `opportunity.id`; lead identity is `lead.id`.
2. Filter the two product tabs by exact product values `Education Loan` and `Credit Card`.
3. An opportunity is available when `productOwner` is absent or an empty string. Do not infer ownership from `lead.leadOwner`, because lead ownership and product ownership are intentionally independent.
4. An opportunity is owned by the current RM only when `productOwner === CURRENT_RM`.
5. Any non-empty owner, including `Unassigned`, is treated as not available for the pool. Legacy records with a missing owner are the only records eligible to claim.
6. Claiming returns a new `StudentLead` with only the matching opportunity changed to `{ ...opp, productOwner: CURRENT_RM }`. All other opportunities and all lead-level fields remain unchanged.
7. The adapter retains existing opportunity status values, including `Completed / Sold`, `In Progress`, `Interested`, and `Not Started`. Product tabs do not silently translate or remove those states.
8. `masterProducts` is not used to manufacture opportunities. It is only a legacy capability indicator; the rendered opportunity lists contain actual `productOpportunities` entries.

### `RmDashboard` integration

The shell renders the existing `RmDashboard` and passes an RM-context lead projection. To avoid changing its metric definitions, the projection includes leads that have either a current-RM-owned opportunity or legacy lead-level ownership equal to `CURRENT_RM` where the dashboard itself requires lead assignment semantics. Product opportunity rows and product tabs use only opportunity ownership. The design should prefer the smallest compatible projection and avoid rewriting `RmDashboard` metrics in this feature.

Existing dashboard callbacks map as follows:

- `onSelectLead` opens the detail view and remembers `activeSection`.
- `onViewAllLeads` is not used to escape the shell for Monetization Center navigation; dashboard cards that need a list should navigate to the corresponding shell section where possible.
- New-lead and bulk-upload callbacks remain available only if the existing dashboard displays those actions; they do not expand this feature’s scope.

### Lead detail and product journeys

My Leads and product tabs select a `StudentLead` from the row and delegate to `handleSelectLead`. The detail view remains `LeadDetailViewRefactored`, with the existing `onUpdateLead` and `onOpenEducationLoan` callbacks. The shell records the originating section, so `onBack` returns to that section rather than always returning to Dashboard.

Education Loan detail/journey access remains the existing App behavior. Credit Card has no new journey implementation in this feature; it uses the compatible lead detail view and preserves any existing product actions exposed there.

### Claim state flow

```mermaid
sequenceDiagram
  participant RM
  participant Pool as Lead Pool
  participant Shell as Monetization Center
  participant App as App state

  RM->>Pool: Select Claim on opportunity row
  Pool->>Shell: claim(leadId, opportunityId)
  Shell->>App: onClaimOpportunity(...)
  App->>App: verify opportunity still unowned
  App->>App: update only matching productOwner
  App-->>Shell: success(updatedLead)
  Shell-->>Pool: derived rows recompute
  Shell-->>RM: row disappears; owned lead appears in My Leads
```

There is no confirmation modal. The update is immediate and optimistic only from the user’s perspective after a synchronous mock-state success. If the opportunity is missing or already owned, the handler returns a descriptive failure, leaves state untouched, and keeps the row visible only if it remains available.

## Data Models

The feature does not add a persisted database table in the first release. It uses the existing legacy type:

```ts
interface ProductOpportunity {
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
```

### Ownership interpretation

`productOwner` is the only ownership field used by Monetization Center product views. The current mock RM identity is the exact existing data value `Virendra (You)`, matching seeded opportunities such as `p1`. The detail component separately uses `Virendra` for audit text; that display difference is legacy behavior and is not normalized in this feature.

Legacy conversion assumptions:

- `productOwner === undefined`, `null` from untyped data, or `''` means unowned and claimable.
- `productOwner === 'Unassigned'` is a non-empty owner label and is not claimable under the strict opportunity ownership rule. If product data later standardizes `Unassigned` as an availability marker, only the adapter rule changes.
- `leadOwner` is never copied into `productOwner` during read transformation. This prevents a lead owned by one RM from implicitly owning every product.
- Existing duplicate or malformed opportunity IDs are not repaired in the UI; the claim handler must update the first exact ID match and tests should identify duplicate IDs as invalid fixture data.
- A lead can appear once in My Leads even when it owns multiple current-RM opportunities. The row model groups by lead ID and carries the owned opportunity list or derives it from the flattened rows.

Suggested grouped model:

```ts
interface MyLeadGroup {
  lead: StudentLead;
  opportunities: ProductOpportunity[];
}
```

Derived views:

- Lead Pool: all rows where `isAvailable` is true, across all products, including products outside the two product tabs if they exist in legacy data. The first-release navigation only offers the two named product tabs.
- My Leads: groups all rows owned by `CURRENT_RM` by `lead.id`, one lead card/table row per group.
- Education Loan: owned rows where `opportunity.product === 'Education Loan'`.
- Credit Card: owned rows where `opportunity.product === 'Credit Card'`.

The first release keeps updates in `App`’s `setLeads` state. If a future normalized API becomes authoritative, the adapter can accept `LeadProductOpportunity[]` and the claim callback can call `leadsApi.updateProductOpportunity`, but this design does not mix both stores in one render path.

## Correctness Properties

*A property is a characteristic or behavior that should hold true across all valid executions of a system-essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.*

### Property reflection

The prework identified several overlaps. The two product-tab requirements are one parameterized filtering rule. Successful claim visibility and single-opportunity mutation are tested together as a claim transition. The separate “owned leads excluded” criterion is subsumed by the grouped My Leads membership rule. The four empty-state criteria are represented by three focused edge-case tests: pool, grouped My Leads, and a parameterized product tab. LeadTable/AllLeadsView reuse is not treated as a correctness property because the existing lead-level claim model is intentionally not reused for opportunity claims.

### Property 1: Navigation selection is exclusive and stable

For all supported Monetization Center sections, selecting a navigation item should make that item the active section, make no other item active, and preserve the selected section when content is revisited.

**Validates: Requirements 1.1, 1.2, 1.3, 1.5**

### Property 2: Pool contains exactly claimable opportunities

For all legacy lead collections, Lead Pool rows should be exactly the product opportunities whose `productOwner` is absent or empty; every opportunity with a non-empty owner should be excluded.

**Validates: Requirements 2.1, 2.2**

### Property 3: Claim mutates only the selected opportunity

For all leads containing an available opportunity, claiming an opportunity should set that opportunity’s `productOwner` to `CURRENT_RM`, preserve every other opportunity and every unrelated lead field, and associate no other opportunity with the Current RM as a side effect.

**Validates: Requirements 3.1, 3.2, 3.3, 7.4**

### Property 4: Successful claim updates all derived views immediately

For all available opportunities, after a successful claim the selected opportunity should no longer appear in Lead Pool, its lead should appear in My Leads exactly once, and the selected opportunity should appear in the appropriate Current-RM-owned product tab.

**Validates: Requirements 2.4, 3.4, 4.1, 4.3, 5.1, 5.2**

### Property 5: My Leads groups by lead without losing owned opportunities

For all legacy lead collections, My Leads should contain one group for each lead with at least one opportunity owned by `CURRENT_RM`; each group should contain all and only that lead’s opportunities owned by `CURRENT_RM`, including multiple products on the same lead.

**Validates: Requirements 4.1, 4.2, 4.3**

### Property 6: Product tabs apply exact product and owner predicates

For all legacy lead collections and for each supported product tab, every returned row should have the requested exact product and `productOwner === CURRENT_RM`, and every source opportunity satisfying both predicates should be returned.

**Validates: Requirements 5.1, 5.2, 5.5**

### Property 7: Opportunity statuses are preserved in owned views

For all owned opportunities and all existing product-opportunity statuses, the derived My Leads and product-tab rows should retain the source status without translation, dropping, or reassignment.

**Validates: Requirements 4.6, 5.5**

### Property 8: Failed claims are non-mutating

For all leads and opportunity IDs where the selected opportunity is missing or already has a non-empty owner, a claim attempt should return a descriptive failure and leave the complete input ownership state unchanged.

**Validates: Requirements 3.5, 8.5**

### Property 9: Product ownership remains separate from lead ownership

For all leads and opportunity collections, deriving Monetization Center ownership must not copy, overwrite, or infer `productOwner` from `leadOwner`; changing one product owner must not change the lead-level owner or any other product owner.

**Validates: Requirements 3.1, 3.2, 3.3, 7.4**

### Property 10: Detail selection preserves the legacy lead context

For all opportunity rows selected from My Leads or a product tab, the detail callback should receive the original `StudentLead` identified by the row, and returning from detail should restore the originating Monetization Center section.

**Validates: Requirements 2.3, 4.4, 5.3, 7.3**

### Property 11: RM dashboard projection does not redefine metrics

For all lead collections, applying the Monetization Center’s Current RM projection should only change the input scope; the existing `RmDashboard` metric calculation and behavior should remain the source of truth for the projected collection.

**Validates: Requirements 6.1, 6.2, 6.4**

## Error Handling

- **Missing opportunity:** `onClaimOpportunity` returns `{ success: false, error: 'Opportunity not found' }`; App state is unchanged.
- **Already owned opportunity:** return a descriptive conflict such as `Opportunity is already owned by [owner]`; do not overwrite the owner and do not remove the row optimistically.
- **Invalid claim result:** if an update callback or future API returns no updated opportunity, preserve the previous state and show the error banner.
- **Unexpected update error:** catch the operation at the shell/App boundary, retain the last successful `leads` array, and show a dismissible, non-technical message such as “This opportunity could not be claimed. It may no longer be available.” Keep the raw error out of the UI.
- **Missing lead for a selected row:** render a not-found state and provide a return-to-section action; do not invoke the detail component with an incomplete `StudentLead`.
- **Empty views:** use distinct copy for Lead Pool, My Leads, Education Loan, and Credit Card. Empty states are normal outcomes, not errors.
- **Legacy malformed data:** tolerate absent optional fields (`productOwner`, amount, partner, details) with neutral labels. Do not synthesize product opportunities from `masterProducts`.
- **API boundary:** do not partially update the legacy state and normalized API state. Until one source is explicitly migrated, use the legacy in-memory state for this feature. If a future API call is introduced, update React state only after a successful response.

## Testing Strategy

Use the existing Vitest setup and `@testing-library/react` only if the project later adds it; do not build a property-testing framework. The current repository already uses Vitest for API and property-style tests, so pure adapter tests can run without a DOM dependency.

### Unit tests

Focus unit tests on concrete examples, edge cases, and integration seams:

- Render the shell and verify the Primary Navigation and separate Products section labels.
- Verify active styling changes when each navigation button is selected.
- Select an available opportunity and verify the associated legacy `StudentLead` is passed to the detail callback.
- Click Claim and verify no confirmation UI is required.
- Verify the current mock identity is `Virendra (You)` and that a seeded opportunity with that owner appears in My Leads/product views.
- Verify a legacy opportunity with no `productOwner` is available, while an opportunity owned by another RM is not.
- Verify a lead with Education Loan and Credit Card opportunities can show different owners.
- Verify empty pool, empty My Leads, and product-specific empty states.
- Verify a failed claim leaves the prior rows and owner unchanged and exposes an error.
- Verify returning from `LeadDetailViewRefactored` restores the originating shell section.
- Verify Education Loan detail/journey callback wiring remains available.

### Property-based tests

Use Vitest with the project’s existing property-test conventions and a generator library such as `fast-check` if it is added as a pinned dev dependency during implementation. Do not implement generators or shrinking manually. Each property must be implemented by one property-based test with at least 100 runs and a comment in this exact form:

```ts
// Feature: monetization-center-rm, Property 4: Successful claim updates all derived views immediately
```

Required property tests:

1. Navigation state machine over the five supported sections (Property 1).
2. Flattened pool equivalence to the unowned-opportunity predicate, including absent and empty owners (Property 2).
3. Deep structural preservation except for the selected opportunity owner after claim (Properties 3 and 9 may be one comprehensive test only if the test asserts both invariants; otherwise keep one test per design property).
4. Post-claim derived-view transition for pool, My Leads, and product tab (Property 4).
5. My Leads grouping uniqueness and owned-opportunity completeness (Property 5).
6. Parameterized exact product/owner filtering for Education Loan and Credit Card (Property 6).
7. Status preservation across all `ProductOpportunityStatus` values (Property 7).
8. Failed claim non-mutation for missing IDs and already-owned opportunities (Property 8).
9. Legacy lead-context preservation through selection and return navigation (Property 10), implemented as a component/integration property if the test harness supports DOM interaction.
10. Dashboard projection/model comparison against `calculateDashboardMetrics` without redefining metrics (Property 11).

Each test should generate leads with multiple opportunities, duplicate product types where valid, missing optional fields, mixed owners, and mixed statuses. Generators should avoid duplicate opportunity IDs unless deliberately testing malformed-data handling. Tests should compare immutable snapshots before and after claims to catch accidental lead-level assignment or mutation of unrelated opportunities.

### Scope and validation

The implementation phase should run targeted adapter/component tests, then `npm run lint`, then `npm run build`. No application code is part of this design phase. The existing API tests are informative for normalized behavior but should not be used as proof of Monetization Center behavior until normalized data is connected to the legacy mock source.
