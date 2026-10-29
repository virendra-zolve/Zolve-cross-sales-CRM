# Requirements Document

## Introduction

Acquire is the qualification portal in the shared Nexus Workspace. Qualification Agents use Acquire to review leads, record qualification decisions, and move qualified leads through signup gating. After confirmed signup, Monetization Center becomes the system of record for product opportunity and monetization work. Acquire retains qualification context and audit history as read-only history.

The Acquire shell may use the supplied Nexus reference for visual direction. The reference does not require an exact reproduction.

## Glossary

- **Nexus Workspace**: The shared CRM workspace containing Acquire and Monetization Center.
- **Portal Selector**: The workspace control used to switch between portals available to the current user.
- **Acquire**: The portal for lead qualification and pre-signup follow-up.
- **Monetization Center**: The portal for post-signup product opportunity and monetization work.
- **Qualification Agent**: A user with Acquire access who reviews and qualifies leads.
- **RM**: A user with Monetization Center access who performs monetization work.
- **Manager**: A user with access to both portals and cross-portal oversight.
- **Head**: A user with access to both portals and cross-portal oversight.
- **Qualification Queue**: Acquire's shared worklist of leads available for qualification review.
- **My Claimed Leads**: Acquire's worklist of qualified leads retained by the signed-in Qualification Agent for follow-up.
- **Signup Pending**: Acquire's shared worklist of qualified leads awaiting confirmed signup.
- **Handoff History**: Acquire's read-only record of leads transferred to Monetization Center.
- **Qualification Decision**: The recorded qualified or unqualified outcome for a lead.
- **Submit**: The action that moves a qualified lead to Signup Pending without retaining the acting Qualification Agent as continuing owner.
- **Submit and Claim**: The action that moves a qualified lead to Signup Pending while retaining the acting Qualification Agent as qualification owner for follow-up.
- **Signup**: Creation of a Zolve account with the minimum required details and accepted consent.
- **Signup-Gated Lead**: A qualified lead awaiting confirmed Signup before entering Monetization Center.
- **Handoff**: The transfer of a qualified lead with confirmed Signup into Monetization Center.
- **Portal State**: The lead's current lifecycle location across Acquire and Monetization Center.
- **Product Opportunity**: A post-signup opportunity for a Zolve product managed in Monetization Center.

## Requirements

### Requirement 1: Portal Selection and Role Access

**User Story:** As a CRM user, I want to switch only to portals permitted for my role, so that qualification and monetization responsibilities remain separated.

#### Acceptance Criteria

1. THE Nexus Workspace SHALL grant a Qualification Agent access to Acquire only.
2. THE Nexus Workspace SHALL grant an RM access to Monetization Center only.
3. THE Nexus Workspace SHALL grant a Manager access to Acquire and Monetization Center, including cross-portal oversight.
4. THE Nexus Workspace SHALL grant a Head access to Acquire and Monetization Center, including cross-portal oversight.
5. WHEN an authorized user opens the Portal Selector, THE Nexus Workspace SHALL display only the portals permitted for the user's role.
6. WHEN a user selects a permitted portal, THE Nexus Workspace SHALL open that portal and exclude work views from the other portal.
7. WHEN a user lacks access to a portal, THE Nexus Workspace SHALL prevent the user from opening that portal and its work views.

### Requirement 2: Acquire Navigation

**User Story:** As a Qualification Agent, I want focused navigation, so that I can manage qualification work without entering monetization workflows.

#### Acceptance Criteria

1. WHEN a user opens Acquire, THE Acquire portal SHALL display Dashboard, Qualification Queue, My Claimed Leads, Signup Pending, and Handoff History as the first-release navigation items.
2. WHEN a user selects an Acquire navigation item, THE Acquire portal SHALL show the selected item as active and display only that item's work view.
3. THE Acquire portal SHALL keep Product Opportunity and monetization actions outside Acquire navigation and work views.
4. WHEN a user switches between Acquire navigation items, THE Acquire portal SHALL preserve the selected lead context needed to return to the prior view.

### Requirement 3: Qualification Queue and Lead Context

**User Story:** As a Qualification Agent, I want a shared queue with complete source context, so that I can review the right lead and understand its origin.

#### Acceptance Criteria

1. WHEN a lead enters the qualification process, THE Qualification Queue SHALL display the lead as available for qualification review.
2. WHEN a Qualification Agent opens a queue item, THE Acquire portal SHALL display the lead information required to make a Qualification Decision.
3. THE Acquire portal SHALL display the original source, partner, referrer or BDE when available, intake context, and Lead ID for every in-scope lead.
4. WHEN the Qualification Queue has no leads available for review, THE Acquire portal SHALL display an empty state that identifies the queue as having no current qualification work.
5. WHEN a lead's source context is incomplete or inconsistent, THE Acquire portal SHALL flag the issue while preserving the original recorded values.

### Requirement 4: Qualification Decision and Queue States

**User Story:** As a Qualification Agent, I want a clear qualification outcome, so that every lead has an explicit next state.

#### Acceptance Criteria

1. WHEN a Qualification Agent records a qualification outcome, THE Acquire portal SHALL store the qualified or unqualified decision, acting user, and decision timestamp.
2. WHEN a Qualification Agent marks a lead qualified, THE Acquire portal SHALL set the lead to Signup-Gated and make the lead eligible for Submit or Submit and Claim.
3. WHEN a Qualification Agent marks a lead unqualified, THE Acquire portal SHALL require and store an unqualified reason or note.
4. WHEN a lead is unqualified, THE Acquire portal SHALL keep the lead in Acquire history and SHALL exclude the lead from Monetization Center.
5. WHEN a qualification operation fails, THE Acquire portal SHALL show a descriptive error and preserve the last confirmed qualification state.

### Requirement 5: Submit Actions and Ownership

**User Story:** As a Qualification Agent, I want explicit submit choices, so that I can either release a qualified lead to shared signup follow-up or retain ownership for follow-up.

#### Acceptance Criteria

1. WHEN a lead is qualified, THE Acquire portal SHALL provide Submit and Submit and Claim actions.
2. WHEN a Qualification Agent selects Submit, THE Acquire portal SHALL move the lead to the shared Signup Pending queue and SHALL clear the Qualification Agent as continuing owner.
3. WHEN a Qualification Agent selects Submit and Claim, THE Acquire portal SHALL move the lead to Signup Pending and SHALL retain the acting Qualification Agent as qualification owner.
4. WHEN a Submit and Claim lead is displayed, THE Acquire portal SHALL include the lead in My Claimed Leads for the owning Qualification Agent.
5. WHILE a lead is retained through Submit and Claim, THE Acquire portal SHALL keep the qualification owner until Signup, release, or manager reassignment.
6. WHEN either submit action succeeds, THE Acquire portal SHALL display the resulting queue state, ownership state, and next expected transition.
7. WHEN either submit action fails, THE Acquire portal SHALL show an actionable error and preserve the lead's prior queue, owner, and qualification state.

### Requirement 6: Signup Gating

**User Story:** As a business owner, I want confirmed signup to gate monetization access, so that product work starts only for eligible customers.

#### Acceptance Criteria

1. WHILE Signup is not confirmed, THE CRM Workspace SHALL keep a Signup-Gated Lead outside Monetization Center.
2. WHILE Signup is not confirmed, THE Monetization Center SHALL exclude the lead from product opportunity queues, product ownership views, and monetization worklists.
3. WHEN a user creates a Zolve account with the minimum required details and accepts consent, THE CRM Workspace SHALL mark Signup as confirmed.
4. WHEN Signup is confirmed for a qualified lead, THE CRM Workspace SHALL make the lead eligible for Handoff to Monetization Center.
5. WHEN Signup is unknown or cannot be verified, THE CRM Workspace SHALL keep the lead outside Monetization Center and show the unresolved signup state.
6. THE Acquire portal SHALL display the current signup state for every qualified lead in Signup Pending or My Claimed Leads.
7. THE CRM Workspace SHALL not require full onboarding completion to confirm Signup.

### Requirement 7: Handoff and System of Record

**User Story:** As an RM, I want eligible customers handed off with their qualification context, so that monetization work can begin without losing source or audit history.

#### Acceptance Criteria

1. WHEN a qualified lead has confirmed Signup, THE CRM Workspace SHALL hand off the lead from Acquire to Monetization Center.
2. WHEN Handoff completes, THE Monetization Center SHALL receive the Lead ID, source, partner, referrer or BDE when available, qualification decision, qualification notes, signup confirmation, and ownership history.
3. WHEN Handoff completes, THE Monetization Center SHALL become the system of record for all Product Opportunity and monetization work.
4. WHEN Handoff completes, THE Acquire portal SHALL move the lead to Handoff History and SHALL stop presenting the lead in Qualification Queue, My Claimed Leads, or Signup Pending.
5. WHEN Handoff completes, THE Acquire portal SHALL retain qualification context and audit history as read-only information.
6. WHEN Handoff fails, THE CRM Workspace SHALL keep the lead outside Monetization Center, retain confirmed qualification and Signup data, and show the failure state to authorized users.
7. WHEN a lead is unqualified or lacks confirmed Signup, THE CRM Workspace SHALL prevent Handoff to Monetization Center.

### Requirement 8: Cross-Portal Status and Audit Visibility

**User Story:** As a team member, I want clear cross-portal status, ownership, and history, so that I know which team can act next.

#### Acceptance Criteria

1. THE Acquire portal SHALL display qualification status, signup status, Portal State, current owner when applicable, source context, queue state, and next expected transition for every in-scope lead.
2. THE Monetization Center SHALL display the lead's Acquire origin, qualification outcome, signup confirmation, handoff state, source context, and handoff history after Handoff.
3. WHEN qualification status, signup status, queue state, ownership, or Portal State changes, THE CRM Workspace SHALL record the actor, timestamp, previous state, and resulting state.
4. WHEN an authorized user views a lead, THE CRM Workspace SHALL show status and audit history in reverse chronological order.
5. WHILE a lead is awaiting an action owned by another team, THE relevant portal SHALL display the responsible team and pending reason.
6. THE CRM Workspace SHALL preserve the relationship between the Lead ID, source context, Qualification Decision, Signup, ownership changes, and Handoff records.

## Open Questions for Review

1. Which users may release a Submit and Claim lead, and what validation or reason is required for release?
2. Which notification channels, recipients, and delivery timing are required for new queue items, claims, signup confirmation, Handoff, and failed operations?
3. How should the CRM Workspace handle a customer who confirms Signup without a recorded qualified decision?
