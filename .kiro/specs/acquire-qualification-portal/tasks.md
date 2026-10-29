# Implementation Plan: Acquire Qualification Portal

## Overview

Implement Acquire as a lifecycle-aware React/TypeScript portal over the existing `StudentLead[]` state. Build pure lifecycle rules first, then the shared portal access and shells, then detail actions, signup/handoff, Monetization gating, App wiring, tests, and validation. Preserve all existing non-Nexus role views and the current Monetization product ownership model.

## Tasks

- [ ] 1. Add the legacy-compatible Acquire lifecycle model and pure helpers
  - [x] 1.1 Extend `StudentLead` with optional lifecycle, qualification history, signup verification, handoff state, and referrer fields; keep all existing fixtures valid.
    - Preserve legacy source, partner, BDE, intake, signup, assignment, product, and activity fields without overwriting recorded attribution.
    - Define typed portal states, portal users, operation results, qualification inputs, and minimum signup inputs.
    - _Requirements: 4.1, 6.3, 6.7, 7.2, 8.3, 8.6_
  - [x] 1.2 Implement compatibility state derivation, queue projections, source-context projections/warnings, signup verification, handoff eligibility, and the strict Monetization eligibility predicate.
    - Treat legacy qualified records as Monetization-compatible only when signup is Signed Up with a real customer ID; treat missing or `na` IDs as Unknown.
    - Keep pending, unqualified, unsigned, unknown-signup, Signup Pending, and failed-handoff leads out of Monetization worklists.
    - _Requirements: 3.1, 3.3, 3.4, 3.5, 6.1, 6.2, 6.5, 6.6, 7.7, 8.1_
  - [~] 1.3 Implement immutable lifecycle transitions for qualification, Submit, Submit and Claim, release/reassignment, signup confirmation, and handoff.
    - Require a reason or note for Not Qualified and a release reason where applicable.
    - Append immutable qualification history and activity audit entries with actor, timestamp, previous state, and resulting state.
    - Return typed actionable failures for invalid, stale, missing, unauthorized, or read-only operations without mutating the input lead or unrelated opportunities.
    - _Requirements: 4.1, 4.2, 4.3, 4.5, 5.1, 5.2, 5.3, 5.5, 5.7, 6.3, 6.4, 7.1, 7.5, 7.6, 8.3, 8.4_
  - [ ]* 1.4 Add property-based coverage for queue membership and uniqueness.
    - **Property 3: Qualification queue membership is exact**
    - **Validates: Requirements 3.1, 3.4**
  - [ ]* 1.5 Add property-based coverage for attribution preservation and warnings.
    - **Property 4: Queue context preserves required attribution**
    - **Validates: Requirements 3.2, 3.3, 3.5**
  - [ ]* 1.6 Add property-based coverage for audited qualification decisions and invalid-operation immutability.
    - **Property 5: Qualification decisions are audited and validated**
    - **Validates: Requirements 4.1, 4.3, 4.5, 8.3**
  - [ ]* 1.7 Add property-based coverage for qualification outcome states and available actions.
    - **Property 6: Qualification outcome derives the correct next state**
    - **Validates: Requirements 4.2, 4.4, 5.1**
  - [ ]* 1.8 Add property-based coverage for Submit versus Submit and Claim ownership semantics.
    - **Property 7: Submit modes differ only in continuing qualification ownership**
    - **Validates: Requirements 5.2, 5.3, 5.4, 5.5, 5.6**
  - [ ]* 1.9 Add property-based coverage for failed and invalid submit operations.
    - **Property 8: Submit failures are non-mutating**
    - **Validates: Requirements 5.7**
  - [ ]* 1.10 Add property-based coverage for minimum-data signup confirmation and rejected inputs.
    - **Property 9: Signup confirmation is minimum-data gated**
    - **Validates: Requirements 6.3, 6.7**
  - [ ]* 1.11 Add property-based coverage for the qualified-plus-confirmed-signup Monetization gate.
    - **Property 10: Monetization eligibility is a conjunction**
    - **Validates: Requirements 6.1, 6.2, 6.4, 6.5, 6.6**

- [ ] 2. Add role-based Nexus portal access and the Portal Selector
  - [~] 2.1 Map existing role-switcher identities to Qualification Agent, RM, Manager, and Head access maps, with Acquire-only, Monetization-only, or dual-portal permissions as specified.
    - Keep `team_lead`, `bde`, and `partner_mgmt` on their existing role views without granting unintended Nexus portals.
    - _Requirements: 1.1, 1.2, 1.3, 1.4_
  - [~] 2.2 Implement `PortalSelector` using only the permitted portal list; reject disallowed selections and render no unauthorized portal work view.
    - Show both portals for Manager and Head and the single permitted workspace for Qualification Agent and RM.
    - _Requirements: 1.5, 1.6, 1.7_
  - [ ]* 2.3 Add property-based coverage for exact role access and rejected portal changes.
    - **Property 1: Role portal access is exact**
    - **Validates: Requirements 1.1, 1.2, 1.3, 1.4, 1.5, 1.6, 1.7**
  - [ ]* 2.4 Add focused component examples for one-option/two-option selector rendering and existing role-view reachability.
    - Verify Manager Dashboard, Head Dashboard, Team Lead, BDE, Partner Management, and education-loan routes remain available.
    - _Requirements: 1.5, 1.6, 1.7_

- [ ] 3. Build the Acquire shell, navigation, queue projections, and source context
  - [-] 3.1 Implement the Acquire shell with Dashboard, Qualification Queue, My Claimed Leads, Signup Pending, and read-only Handoff History sections.
    - Keep Product Opportunity and monetization actions out of Acquire navigation and work views.
    - Render active-section state, responsive navigation, section empty states, queue state, current owner, signup state, pending reason, and next transition.
    - _Requirements: 2.1, 2.2, 2.3, 3.4, 5.4, 6.6, 7.4, 8.1, 8.5_
  - [~] 3.2 Adapt `QualificationDashboard` and the queue/table projection to use the shared lifecycle helpers and show Lead ID, source, partner, BDE/referrer, intake, raw values, and attribution warnings.
    - Preserve original incomplete or inconsistent values and identify the empty queue as having no current qualification work.
    - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5_
  - [~] 3.3 Add Acquire-section and selected-lead return context to the shared selection flow without resetting the active section on navigation.
    - Preserve the selected lead and originating section when opening detail and restore it when returning.
    - _Requirements: 2.4, 8.4_
  - [ ]* 3.4 Add property-based coverage for exclusive Acquire navigation and return context.
    - **Property 2: Acquire navigation is exclusive and preserves context**
    - **Validates: Requirements 2.2, 2.3, 2.4**
  - [ ]* 3.5 Add property-based coverage for claimed and Signup Pending projections exposing ownership and signup state.
    - **Property 11: Signup Pending and claimed views expose ownership and signup state**
    - **Validates: Requirements 5.4, 6.6, 8.1, 8.5**
  - [ ]* 3.6 Add focused UI examples for Acquire navigation, empty queue, source context, warnings, and absence of Products navigation.
    - _Requirements: 2.1, 2.2, 2.3, 3.2, 3.3, 3.4, 3.5_

- [ ] 4. Add constrained qualification detail and decision actions
  - [~] 4.1 Add an Acquire mode to the shared lead detail view.
    - Show identity, Lead ID, contact/study context, attribution, qualification/signup/Portal State, owner, next transition, and reverse-chronological audit history.
    - Hide or disable Products, product status/toggles, Education Loan actions, and all other monetization operations; make Handoff History read-only.
    - _Requirements: 2.3, 3.2, 4.1, 7.5, 8.1, 8.4_
  - [~] 4.2 Wire qualification decision actions and error handling through App-owned immutable updates.
    - Require a decision; require a reason or note for Not Qualified; show actionable failures while preserving the last confirmed state.
    - Qualified leads become Signup-Gated and expose Submit and Submit and Claim; unqualified leads remain Acquire history and cannot enter Monetization.
    - _Requirements: 4.1, 4.2, 4.3, 4.4, 4.5, 5.1, 5.7_
  - [ ]* 4.3 Add fixed UI and integration tests for qualification decision forms, validation, errors, action availability, and Acquire read-only history.
    - _Requirements: 4.1, 4.2, 4.3, 4.4, 4.5, 7.5, 8.4_

- [ ] 5. Wire Submit, Submit and Claim, signup confirmation, and ownership visibility
  - [~] 5.1 Connect Submit and Submit and Claim actions to the Acquire detail and queue views.
    - Submit moves the lead to shared Signup Pending and clears only the continuing qualification owner; Submit and Claim retains the acting agent.
    - Display resulting queue state, owner state, and next expected transition; preserve legacy assignment history and attribution.
    - _Requirements: 5.1, 5.2, 5.3, 5.4, 5.5, 5.6, 5.7_
  - [~] 5.2 Implement signup confirmation with only a real account identifier, at least one validated account contact, and accepted consent.
    - Store confirmation and consent audit data; do not require full onboarding, documents, education-loan completion, or product selection.
    - Keep missing, unknown, legacy `na`, or invalid signup data outside Monetization and show the unresolved state.
    - _Requirements: 6.3, 6.5, 6.6, 6.7_
  - [ ]* 5.3 Add fixed UI and integration tests for Submit ownership differences, retention/release behavior, signup minimums, consent validation, and failed-operation snapshot preservation.
    - _Requirements: 5.2, 5.3, 5.5, 5.7, 6.3, 6.5, 6.7_

- [ ] 6. Apply handoff and the strict Monetization Center eligibility gate
  - [~] 6.1 Add authorized Handoff from a qualified, confirmed-signup lead and a failure state for receiving-projection errors.
    - On success, preserve Lead ID, source context, qualification decision/notes, signup confirmation, ownership history, and handoff audit data; move Acquire state to Handoff History.
    - On failure, retain confirmed qualification/signup data, keep the lead out of Monetization, record retryable failure state, and prevent unqualified or unconfirmed handoff.
    - _Requirements: 6.4, 7.1, 7.2, 7.4, 7.5, 7.6, 7.7, 8.6_
  - [~] 6.2 Update Monetization helpers and `MonetizationCenter` projections so every dashboard, Lead Pool, My Leads, product view, and RM projection applies `isMonetizationEligible` before product-owner filtering.
    - Preserve `ProductOpportunity.productOwner` as the independent ownership domain and retain compatible legacy qualified/signed-up records.
    - Exclude Signup Pending, unqualified, unsigned, unknown, and failed-handoff leads from every Monetization worklist.
    - _Requirements: 6.1, 6.2, 6.4, 7.3, 8.2_
  - [~] 6.3 Surface Acquire origin, qualification outcome, signup confirmation, handoff state, source context, and handoff history in Monetization detail/read-only context.
    - Ensure Handoff History is not treated as a Monetization worklist and no Acquire product action is exposed after handoff.
    - _Requirements: 7.2, 7.3, 7.5, 8.2_
  - [ ]* 6.4 Add property-based coverage for authorized handoff and aggregate preservation.
    - **Property 12: Handoff is authorized and preserves the aggregate**
    - **Validates: Requirements 6.4, 7.1, 7.2, 7.7, 8.6**
  - [ ]* 6.5 Add property-based coverage for handoff system-of-record boundary changes.
    - **Property 13: Handoff changes system-of-record boundaries**
    - **Validates: Requirements 7.3, 7.4, 7.5**
  - [ ]* 6.6 Add property-based coverage for non-mutating handoff failures.
    - **Property 14: Handoff failures are non-mutating**
    - **Validates: Requirements 7.6**
  - [ ]* 6.7 Add property-based coverage for exact Monetization product-owner projections and preserved per-opportunity ownership.
    - **Property 15: Monetization views apply exact product ownership after gating**
    - **Validates: Requirements 7.3, 8.2**
  - [ ]* 6.8 Add fixed Monetization regression tests for legacy compatibility, strict signup gating, independent product owners, and origin/handoff context.
    - _Requirements: 6.1, 6.2, 6.4, 7.2, 7.3, 8.2_

- [ ] 7. Integrate the workspace in App while preserving all existing role views
  - [~] 7.1 Add App-owned active portal, Acquire section, workspace return context, current portal user, and typed lifecycle operation callbacks.
    - Route Qualification Agent to Acquire, RM to Monetization Center, and Manager/Head to their existing dashboards by default while allowing the selector to open either authorized portal.
    - Reject unauthorized portal openings and keep non-Nexus roles and legacy routes unchanged.
    - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.6, 1.7, 2.4_
  - [ ] 7.2 Wire Acquire and Monetization shells into App with immutable lead replacement and detail return routing.
    - Connect qualification, submit/claim, release/reassignment, signup, handoff, and product callbacks without partially updating the separate normalized API singleton.
    - _Requirements: 4.5, 5.6, 5.7, 7.1, 7.4, 7.6, 8.3, 8.6_
  - [ ] 7.3 Add cross-portal status and reverse-chronological audit visibility for authorized users.
    - Show responsible team and pending reason when another team owns the next action; preserve relationships among Lead ID, source, qualification, signup, ownership, and handoff records.
    - _Requirements: 8.1, 8.2, 8.3, 8.4, 8.5, 8.6_
  - [ ]* 7.4 Add property-based coverage for audit completeness and reverse chronology.
    - **Property 16: Audit history is complete and ordered**
    - **Validates: Requirements 8.3, 8.4, 8.6**
  - [ ]* 7.5 Add property-based coverage for Monetization source-of-record context.
    - **Property 17: Monetization remains product-work source of record**
    - **Validates: Requirements 7.2, 7.3, 7.5, 8.2**
  - [ ]* 7.6 Add integration/UI tests covering role switching, portal selection, detail return context, lifecycle transitions, and preservation of Team Lead, BDE, Manager, Head, Partner Management, education-loan, and legacy lead-management views.
    - _Requirements: 1.5, 1.6, 1.7, 2.4, 7.4, 8.1, 8.4_

- [ ] 8. Checkpoint - Run targeted Acquire and Monetization tests
  - Ensure lifecycle helper, portal access, Acquire UI, handoff, and Monetization gating tests pass; ask the user if questions arise.

- [ ] 9. Run repository validation and resolve regressions
  - [ ] 9.1 Run the full targeted Vitest suite, including all required Acquire property tests with at least 100 cases each, existing lead lifecycle/assignment/property tests, and relevant Monetization tests.
    - Keep normalized `leadsApi` tests separate unless an explicit migration is added.
    - _Requirements: 4.5, 5.7, 7.6, 8.3_
  - [ ] 9.2 Run `npm run lint` and resolve TypeScript errors without weakening existing role-view contracts.
    - _Requirements: 1.7, 2.2, 7.4_
  - [ ] 9.3 Run `npm run build` and resolve production-build regressions across Acquire, App routing, and Monetization Center.
    - _Requirements: 1.6, 6.1, 6.2, 7.3_

## Notes

- Tasks marked with `*` are optional test tasks and may be skipped for a faster MVP; core implementation tasks are not optional.
- Property tests use Vitest and `fast-check`, run at least 100 cases, and each test maps one-to-one to a numbered design property.
- The implementation remains in the existing React/TypeScript architecture with App-owned `StudentLead[]` state; no code implementation is included in this planning phase.
