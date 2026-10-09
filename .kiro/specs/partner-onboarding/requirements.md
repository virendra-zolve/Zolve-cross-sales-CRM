# Requirements Document

## Introduction

This feature reworks Partner Onboarding and Management to match the Partner Management PRD. The current implementation stores commission inside the Partner record, uses a two-step Manager→Head approval, generates the partner code at submission time, and embeds documents in the Partner object. The PRD requires a normalized structure where the Partner Master holds only profile/ownership data, with commission slabs, documents, and performance metrics as separate related entities. Approval becomes a single Head review with three outcomes (Approve / Review Required / Reject), the partner code is generated only on final approval, and existing partners are bulk-created from a migration sheet (bypassing approval).

This spec covers the partner data model restructure, the onboarding/approval workflow, configurable commission slabs, commission change requests, document management, partner ownership & reassignment with history, existing-partner migration, calculated performance metrics (partner-level and BD-level), and display-only financial sections. It aligns with the updated Zolve_Partner_Management_PRD. It does not cover the LMS/Nexus system split, lead qualification changes, or lead-creation forms — those are tracked separately.

### Scope boundaries
- In scope: Partner Master (incl. Source/Source Code, BD owner identity, audit fields), Eligible Products (separate multi-select), multiple Partner Addresses (one Head Office + many Branch), Partner Commission + Commission Tiers, Commission Change Requests, Partner Documents, onboarding/approval workflow (maker–checker), ownership & reassignment history, activity trail, existing-partner migration, partner and BD performance metrics (calculated), and display-only Earnings/Invoices/Payment History + Country-wise Business Potential + Partner Portal Access.
- Out of scope / not inferred (PRD §19): the tier payout calculation method (progressive vs achieved-tier), country-potential units, invoice generation & payment execution workflows, auto-assign internals, partner deactivation/reactivation permissions, DocuSign/e-signature, OCR, lender portal, LMS/Nexus split, multi-user partner portal access.
- Data layer: follows the existing in-memory mock pattern (`LeadsDatabase`-style). No real database or file storage is introduced.
- Maker–checker: BDE and Team Lead are makers; Manager and Head are checkers. New partner onboarding is submitted to the Head for the final decision.

## Requirements

### Requirement 1 — Partner Master profile

**User Story:** As a BD user, I want to capture a partner's core profile and ownership details, so that the partner record holds accurate legal and contact information.

#### Acceptance Criteria
1. WHEN a BD user creates a partner THEN the system SHALL capture the Partner Master fields: Legal Business Name, Partner Type, Partner Scale, PAN Number, CIN, GST Number, Owner Name/Email/Phone, Contact Person Name/Email/Phone, Source, and BD Owner.
2. THE system SHALL require as mandatory: Legal Business Name, Partner Type, Partner Scale, PAN Number, Owner Name/Email/Phone, Contact Person Name/Email/Phone, Source, and BD Owner.
3. THE system SHALL treat CIN and GST Number as optional ("where applicable").
4. THE system SHALL constrain Partner Type to a single-select of `Education Loan`, `eSIM`, `Accommodation`, `Insurance`, `Bank Account`, or `Credit Card`.
5. THE system SHALL constrain Partner Scale to `Single Branch` or `Multi Branch`.
6. THE system SHALL constrain Source to `Channel Partner`, `Referral`, `Direct`, or `Other`.
7. THE system SHALL set BD Owner to an active BD user, and record BD Owner Email and BD Employee Code as system-maintained fields; the UI SHALL display BD owner user name and user ID together.
8. THE system SHALL maintain system audit fields Created By, Created At, Updated By, Updated At.
9. THE system SHALL maintain a system-generated Source Code used for partner source attribution and consumed by Lead Management.
10. THE system SHALL NOT store commission data, document files, eligible products, addresses, or performance metrics inside the Partner Master record (these are separate related entities).
11. WHEN validating PAN, email, and phone THEN the system SHALL enforce basic format checks (PAN pattern, valid email, numeric phone).
12. THE system SHALL treat Partner Type as single-select and SHALL NOT infer Eligible Products from Partner Type.

### Requirement 2 — System-generated identity and status

**User Story:** As a system, I want to manage partner identity and lifecycle status, so that partner codes and states are consistent and auditable.

#### Acceptance Criteria
1. THE system SHALL assign a unique system-generated Partner ID in the format `P#####` (e.g. `P00123`) when a partner record is first created.
2. THE system SHALL support Partner Status values: `Draft`, `Pending Head Approval`, `Review Required`, `Rejected`, `Active`.
3. WHEN a BD user creates but has not yet submitted a partner THEN the status SHALL be `Draft`.
4. WHEN a BD user submits a partner THEN the status SHALL become `Pending Head Approval`.
5. THE system SHALL generate the partner's commercial Partner Code ONLY after final Head approval (i.e. when status transitions to `Active`), and SHALL NOT generate it at submission time.
6. THE system SHALL keep Partner ID (internal) distinct from Partner Code (commercial, generated on activation).
7. THE system SHALL generate the Source Code only on final approval (together with the Partner Code), and SHALL NOT generate it at submission time.

### Requirement 3 — Partner commission slabs

**User Story:** As a BD user, I want to configure product-specific tiered commission slabs, so that each partner can earn commission according to volume-based thresholds.

#### Acceptance Criteria
1. THE system SHALL store commission configuration separately from the Partner Master, linked by Partner ID.
2. THE system SHALL allow each partner to have a distinct commission configuration per product.
3. WHEN configuring commission for a product THEN the system SHALL capture: Product, Tier Metric, Commission Type, Number of Slabs, Effective From, Effective To (optional), and Status.
4. THE system SHALL support a configurable number of slabs per product with NO hardcoded slab count.
5. WHEN defining a slab THEN the system SHALL capture From, To (where `To` may be unbounded / "No Limit"), Commission Type, and Commission value.
6. THE system SHALL support Commission Type `Percentage` (e.g. 1% of sanctioned amount) and `Flat` (e.g. ₹500 per unit).
7. THE system SHALL allow different products to use different Tier Metrics, slab counts, thresholds, and payout types.
8. THE system SHALL support per-product Tier Metrics as an absolute quantity appropriate to the product (e.g. sanctioned loan amount, number of cards/accounts, bookings, or another configured product metric).
9. WHEN slab ranges are defined THEN the system SHALL validate that ranges are contiguous and non-overlapping within a product's commission config, and that the last slab may be unbounded.
10. THE system SHALL default a commission config's Status to `Active` on creation and support `Inactive`.
11. THE system SHALL capture a Currency for fixed-amount commissions where applicable.
12. THE system SHALL preserve historical commission terms and their effective dates; a commission change SHALL NOT silently overwrite prior approved terms (prior terms remain available for audit).
13. THE system SHALL apply commission strictly per the configured product metric, slab thresholds, and payout type; the tier payout calculation method (progressive vs achieved-tier) is NOT defined by the PRD and SHALL NOT be inferred — it is flagged as a known open item.

### Requirement 4 — Partner documents

**User Story:** As a BD user and Head reviewer, I want to upload and review partner documents separately from the profile, so that compliance documents are tracked with their own review lifecycle.

#### Acceptance Criteria
1. THE system SHALL store documents separately from the Partner Master, linked by Partner ID, and SHALL NOT duplicate document files into the Partner Master.
2. THE system SHALL support Document Types: `PAN`, `GST`, `CIN`, `Agreement`, `Other`.
3. THE system SHALL treat PAN Card as mandatory for all partners and Signed Partner Agreement as mandatory before activation; CIN and GST SHALL be optional (where applicable).
4. THE system SHALL support uploading additional documents beyond the standard types.
5. WHEN a document is stored THEN the system SHALL capture: Partner Document ID, Partner ID, Document Type, File, Document Status, Uploaded By, Uploaded At, Reviewed By, Reviewed At, Rejection Reason.
6. THE system SHALL support Document Status values: `Pending`, `Uploaded`, `Approved`, `Rejected`.
7. WHEN a document is rejected THEN the system SHALL require and record a Rejection Reason, Reviewed By, and Reviewed At.
8. THE system SHALL NOT allow a partner to become `Active` unless the mandatory PAN and Signed Partner Agreement documents exist and are in `Approved` status.
9. THE system SHALL treat the Signed Partner Agreement as part of the application reviewed by the Head; there SHALL be NO separate post-approval agreement-upload stage.
10. WHEN a document is rejected or requires correction THEN the system SHALL retain comments/rejection reason.

### Requirement 5 — Onboarding and approval workflow

**User Story:** As a Head, I want to review a partner's profile, commission, and documents in one place and take a single decision, so that partner activation is controlled and auditable.

#### Acceptance Criteria
1. THE system SHALL allow a maker (BDE or Team Lead) to create and submit a partner application; Manager and Head act as checkers.
2. WHEN a maker submits a partner THEN the system SHALL set status to `Pending Head Approval` and make the partner visible in the Head's review queue.
3. WHEN a Head opens a partner for review THEN the system SHALL present the Partner profile, Eligible Products, Commission configuration, and Documents (including the signed Agreement) together.
4. THE system SHALL provide the Head three actions: `Approve`, `Review Required`, and `Reject`.
5. WHEN the Head selects `Approve` THEN the system SHALL set status to `Active` and generate the Partner Code and Source Code.
6. WHEN the Head selects `Reject` THEN the system SHALL set status to `Rejected` and record the comments.
7. WHEN the Head selects `Review Required` THEN the system SHALL set status to `Review Required`, record the Head's comments, and return the same application to the maker for updates.
8. WHEN a maker updates and resubmits a `Review Required` partner THEN the system SHALL set status back to `Pending Head Approval`.
9. THE system SHALL record each workflow action (submit, approve, reject, review-required, resubmit) with timestamp, actor, actor role, and any comment/reason in an append-only history.
10. THE system SHALL NOT permit `Approve` while mandatory documents (PAN, Agreement) are not `Approved` (per Requirement 4.8).

### Requirement 6 — Existing partner migration

**User Story:** As a BD user, I want existing partners bulk-created from a migration sheet, so that already-approved partners enter the system without re-running onboarding approval.

#### Acceptance Criteria
1. THE system SHALL support bulk creation of partners from a BD-provided migration sheet.
2. WHEN importing an existing partner THEN the system SHALL populate Partner Master data from the sheet.
3. WHEN importing an existing partner THEN the system SHALL construct Commission slabs from product-wise slab columns in the sheet (including Commission Type Flat/Percentage per product).
4. THE system SHALL allow documents for migrated partners to be uploaded separately (not required within the sheet).
5. WHEN a partner is migrated THEN the system SHALL set status directly to `Active` and SHALL NOT route it through the `Pending Head Approval` workflow.
6. WHEN a partner is migrated and activated THEN the system SHALL generate the Partner Code.
7. THE system SHALL derive performance metrics for migrated partners from existing lead/transaction data (not from the sheet).

### Requirement 7 — Partner performance metrics

**User Story:** As a Head or BD user, I want partner performance metrics calculated from system data, so that metrics are accurate and not manually entered.

#### Acceptance Criteria
1. THE system SHALL calculate partner performance metrics from lead/product/transaction data and SHALL NOT accept manually entered values for them.
2. THE system SHALL calculate the following partner metrics: Total Leads, Qualified Leads, Active Leads, Converted Leads, Conversion Rate (Converted / Total), Product-wise Leads, Product-wise Conversion, Loan Sanctioned Amount, Loan Disbursed Amount, Commission Earned (based on applicable slab), Commission Paid, and Pending Commission (Earned − Paid).
3. WHEN Total Leads is zero THEN the system SHALL report Conversion Rate as 0 (no divide-by-zero error).
4. THE system SHALL calculate Commission Earned by applying the partner's active commission slab for the relevant product and tier metric to the partner's attributed volume.

### Requirement 8 — BD-specific partner metrics

**User Story:** As a Head, I want BD-level partner metrics, so that I can measure each BD user's partner-related performance.

#### Acceptance Criteria
1. THE system SHALL calculate the following BD metrics: Partners Onboarded (created by the BD), Active Partners, Active Partner Rate (Active / Onboarded), Partners Generating Leads (active partners with at least one lead), Leads Generated (total leads from the BD's partners), and Partner Logins (partner portal login count).
2. WHEN Partners Onboarded is zero THEN the system SHALL report Active Partner Rate as 0 (no divide-by-zero error).
3. THE system SHALL attribute each partner to exactly one BD Owner for the purpose of BD metrics.

### Requirement 9 — Eligible Products (separate multi-select)

**User Story:** As a BD maker, I want to select which products a partner can offer or refer, independent of Partner Type, so that product eligibility is explicit and accurate.

#### Acceptance Criteria
1. THE system SHALL store Eligible Products as a multi-select field separate from the Partner Master, using the six values: Education Loan, eSIM, Accommodation, Insurance, Bank Account, Credit Card.
2. THE system SHALL NOT infer or auto-populate Eligible Products from Partner Type.
3. WHEN a maker changes Eligible Products THEN the system SHALL record the previous and new selection, actor, and timestamp in the activity trail.

### Requirement 10 — Partner addresses (multiple)

**User Story:** As a BD maker, I want to record one Head Office and any number of Branch addresses, so that a multi-branch partner's locations are captured.

#### Acceptance Criteria
1. THE system SHALL store partner addresses separately from the Partner Master, linked by Partner ID.
2. WHEN capturing an address THEN the system SHALL capture Address Type (`Head Office` or `Branch`), Address Line 1, Address Line 2 (optional), City, State, Pincode, Country.
3. THE system SHALL require as mandatory: Address Type, Address Line 1, City, State, Pincode, Country.
4. THE system SHALL allow exactly one Head Office address and zero or more Branch addresses per partner.
5. THE system SHALL treat Partner Scale (Single/Multi Branch) as independent of the address records (descriptive, not derived from them).

### Requirement 11 — Ownership and reassignment with history

**User Story:** As an authorized user, I want to reassign a partner to another BDE and keep a history, so that ownership changes are auditable and non-destructive.

#### Acceptance Criteria
1. THE system SHALL maintain exactly one current BDE owner per partner.
2. WHEN a BDE creates a partner THEN that BDE SHALL be the default owner.
3. WHEN an authorized user reassigns a partner THEN the system SHALL record previous owner, new owner, actor, and timestamp.
4. WHEN a partner is reassigned THEN the system SHALL NOT delete the partner's existing leads, conversions, commission records, invoices, or payment history.
5. THE system SHALL treat partner ownership at the partner level, not the product level.
6. THE system SHALL NOT create a permanent partner-to-RM mapping at onboarding; lead assignment remains governed by Lead Management.

### Requirement 12 — Commission change request and approval

**User Story:** As a BDE, I want to request a change to a partner's commission and have the Head approve it, so that commercial terms change under control with full history.

#### Acceptance Criteria
1. THE system SHALL allow a BDE to request a change to a partner's commission structure.
2. WHEN a change is requested THEN the system SHALL capture the existing commission terms and the proposed changes (product and slab details), the requester, and a timestamp.
3. THE system SHALL submit the request to the Head for approval.
4. THE Head SHALL be able to Approve or Reject the request with comments.
5. WHEN approved THEN the approved commission structure SHALL become the applicable configuration per its effective dates, and prior approved terms SHALL remain available for historical audit.
6. THE system SHALL allow the Head to directly change commission slabs.
7. THE system SHALL retain commission change requests and decisions in the activity trail.

### Requirement 13 — Activity trail

**User Story:** As a Head/auditor, I want a system-generated, immutable activity trail, so that material partner events are retained and cannot be edited.

#### Acceptance Criteria
1. THE system SHALL generate activity entries that portal users cannot edit.
2. THE system SHALL retain these events with the stated details: Partner Created (actor, timestamp); Partner Details Updated (changed field, previous value, new value, actor, timestamp); Partner Submitted (user, timestamp); Partner Approved/Rejected/Review Required (decision, reviewer, timestamp, comments); Partner Reassigned (previous owner, new owner, actor, timestamp); Eligible Products Changed (previous/new selection, actor, timestamp); Commission Change Requested (requester, proposed terms, timestamp); Commission Change Approved/Rejected (decision, reviewer, timestamp, comments); Commission Slabs Changed (previous/new terms, actor, timestamp); Document Uploaded/Updated (type, actor, timestamp); Agreement Uploaded (uploader, timestamp, document reference).

### Requirement 14 — Partner Detail View layout (V1 four-tab structure)

**User Story:** As a Head/BDE, I want the partner page to show a header card and four tabs (Partner Details, Documents, Commissions, Activity), so that I can navigate a partner's full record cleanly.

#### Acceptance Criteria
1. THE Partner Detail View SHALL show a header card (styled like the Nexus profile card) with: avatar/placeholder, Legal Business Name, Partner Status pill, City, Partner ID/Code, Partner Type, Partner Scale, and current BD Owner (name + ID).
2. THE Partner Detail View SHALL present exactly four tabs in V1: `Partner Details`, `Documents`, `Commissions`, `Activity`.
3. THE `Partner Details` tab SHALL display Business Details (PAN, CIN, GST, owner/authorised person, contact person), Addresses (one Head Office + branches), and Eligible Products.
4. THE `Documents` tab SHALL display the partner's compliance documents and signed agreement with their review status.
5. THE `Commissions` tab SHALL display all eligible/listed products with their respective commission configuration (type, metric, slabs, payout, effective dates) and provide an option to edit commissions (subject to the commission change / Head approval rules in Requirement 12).
6. THE `Activity` tab SHALL display the system-generated activity trail (read-only) per Requirement 13.
7. THE V1 Partner Detail View SHALL NOT include Earnings, Invoices, Payment History, Business Performance, or Country-wise Business Potential — these are deferred to V2 (Requirement 14a).

### Requirement 14a — V2 detail sections (deferred)

**User Story:** As a Head/BDE, I want earnings, invoicing, business performance, and country potential in a later version, so that V1 stays focused on the four core tabs.

#### Acceptance Criteria
1. THE system SHALL defer to V2: Business Performance (product-wise business done, leads shared, conversions, conversion rates), Earnings (commission earned/available), Invoices (records and status), Payment History (amounts, dates, references, statuses), and Country-wise Business Potential (USA/UK/Canada/Australia/Germany/Others).
2. WHEN V2 is built THEN Business Performance and financial values SHALL be derived from or linked to underlying lead/product/transaction/financial records (not stored as Partner Master metrics), and Country-wise potential units SHALL be confirmed with business before use in calculations.

### Requirement 15 — Partner portal access

**User Story:** As the system, I want partner portal access to exist only after activation, so that only active partners can log in.

#### Acceptance Criteria
1. THE system SHALL provide one portal access per partner.
2. THE system SHALL make partner portal access available only after the partner is `Active`.
3. THE system SHALL treat multi-user partner portal access as out of scope.

### Requirement 16 — Data relationships and integrity

**User Story:** As a developer, I want a normalized partner data structure, so that profile, products, addresses, commission, documents, and performance are cleanly separated and consistently linked.

#### Acceptance Criteria
1. THE system SHALL model the structure as: Partner (master) → Partner Addresses (one Head Office + many Branch), Eligible Products (multi-select), Partner Documents (many), Partner Commission (many, one active per product) → Commission Tiers (many per commission), Commission Change Requests (many), Activity Trail (many), and Partner Performance (derived from Lead/Product/Transaction/financial records).
2. THE system SHALL link every related entity to a valid Partner ID.
3. WHEN a Partner Commission is removed THEN the system SHALL remove its associated Commission Tiers (no orphaned tiers).
4. THE system SHALL ensure each generated Partner ID, Partner Code, and Source Code is unique across all partners.
5. THE system SHALL preserve referential integrity such that no related entity references a non-existent Partner.
```

