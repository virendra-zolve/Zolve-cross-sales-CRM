# Requirements Document

## Introduction

This feature reworks Partner Onboarding and Management to match the Partner Management PRD. The current implementation stores commission inside the Partner record, uses a two-step Manager→Head approval, generates the partner code at submission time, and embeds documents in the Partner object. The PRD requires a normalized structure where the Partner Master holds only profile/ownership data, with commission slabs, documents, and performance metrics as separate related entities. Approval becomes a single Head review with three outcomes (Approve / Review Required / Reject), the partner code is generated only on final approval, and existing partners are bulk-created from a migration sheet (bypassing approval).

This spec covers the partner data model restructure, the onboarding/approval workflow, configurable commission slabs, document management, existing-partner migration, and calculated performance metrics (partner-level and BD-level). It does not cover the LMS/Nexus system split, lead qualification changes, or lead-creation forms — those are tracked separately.

### Scope boundaries
- In scope: Partner Master, Partner Commission + Commission Tiers, Partner Documents, onboarding/approval workflow, existing-partner migration, partner and BD performance metrics (as calculated values).
- Out of scope: DocuSign/e-signature integration, document OCR/fraud detection, lender portal integration, the LMS/Nexus architecture split.
- Data layer: follows the existing in-memory mock pattern (`LeadsDatabase`-style). No real database or file storage is introduced.

## Requirements

### Requirement 1 — Partner Master profile

**User Story:** As a BD user, I want to capture a partner's core profile and ownership details, so that the partner record holds accurate legal and contact information.

#### Acceptance Criteria
1. WHEN a BD user creates a partner THEN the system SHALL capture the Partner Master fields: Legal Business Name, Partner Type, Partner Scale, PAN Number, CIN, GST Number, Owner Name/Email/Phone, Contact Person Name/Email/Phone, Registered Address (Line 1, Line 2, City, State, Pincode, Country), Operating-address-same-as-registered flag, Address Type, Operating Address (Line 1, Line 2, City, State, Pincode, Country), and BD Owner.
2. THE system SHALL require as mandatory: Legal Business Name, Partner Type, Partner Scale, PAN Number, Owner Name/Email/Phone, Contact Person Name/Email/Phone, Registered Address Line 1/City/State/Pincode/Country, Operating-address-same-as-registered flag, Address Type, and BD Owner.
3. THE system SHALL treat CIN, GST Number, and Registered Address Line 2 as optional.
4. WHEN Operating-address-same-as-registered is "No" THEN the system SHALL require Operating Address Line 1, City, State, Pincode, and Country (conditional mandatory).
5. WHEN Operating-address-same-as-registered is "Yes" THEN the system SHALL NOT require operating address fields and SHALL treat the registered address as the operating address.
6. THE system SHALL constrain Partner Type to `Education Consultant`, `FX`, `DSA`, or `Other`.
7. THE system SHALL constrain Partner Scale to `Single Branch` or `Multi Branch`.
8. THE system SHALL constrain Address Type to `Head Office` or `Branch`.
9. THE system SHALL set BD Owner to an active BD user and record it as a system/ownership field (not freely editable to an arbitrary string).
10. THE system SHALL NOT store commission data or document files inside the Partner Master record.
11. WHEN validating PAN, email, phone, and pincode THEN the system SHALL enforce basic format checks (PAN pattern, valid email, numeric phone, numeric pincode).

### Requirement 2 — System-generated identity and status

**User Story:** As a system, I want to manage partner identity and lifecycle status, so that partner codes and states are consistent and auditable.

#### Acceptance Criteria
1. THE system SHALL assign a unique system-generated Partner ID in the format `P#####` (e.g. `P00123`) when a partner record is first created.
2. THE system SHALL support Partner Status values: `Draft`, `Pending Head Approval`, `Review Required`, `Rejected`, `Active`.
3. WHEN a BD user creates but has not yet submitted a partner THEN the status SHALL be `Draft`.
4. WHEN a BD user submits a partner THEN the status SHALL become `Pending Head Approval`.
5. THE system SHALL generate the partner's commercial Partner Code ONLY after final Head approval (i.e. when status transitions to `Active`), and SHALL NOT generate it at submission time.
6. THE system SHALL keep Partner ID (internal) distinct from Partner Code (commercial, generated on activation).

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
8. THE system SHALL support per-product Tier Metrics including (at minimum): Education Loan → Sanctioned Loan Amount; eSIM → Number of SIMs; Bank Account → Number of Accounts; Accommodation → Number of Bookings / Booking Value; Money Transfer → Transfer Volume.
9. WHEN slab ranges are defined THEN the system SHALL validate that ranges are contiguous and non-overlapping within a product's commission config, and that the last slab may be unbounded.
10. THE system SHALL default a commission config's Status to `Active` on creation.

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

### Requirement 5 — Onboarding and approval workflow

**User Story:** As a Head, I want to review a partner's profile, commission, and documents in one place and take a single decision, so that partner activation is controlled and auditable.

#### Acceptance Criteria
1. WHEN a BD user submits a partner THEN the system SHALL set status to `Pending Head Approval` and make the partner visible in the Head's review queue.
2. WHEN a Head opens a partner for review THEN the system SHALL present the Partner profile, Commission configuration, and Documents (including Agreement) together.
3. THE system SHALL provide the Head three actions: `Approve`, `Review Required`, and `Reject`.
4. WHEN the Head selects `Approve` THEN the system SHALL set status to `Active` and generate the Partner Code.
5. WHEN the Head selects `Reject` THEN the system SHALL set status to `Rejected` and record the reason.
6. WHEN the Head selects `Review Required` THEN the system SHALL set status to `Review Required`, record the Head's comments, and return the partner to the BD for updates.
7. WHEN a BD user updates and resubmits a `Review Required` partner THEN the system SHALL set status back to `Pending Head Approval`.
8. THE system SHALL record each workflow action (submit, approve, reject, review-required, resubmit) with timestamp, actor, actor role, and any comment/reason in an append-only history.
9. THE system SHALL NOT permit `Approve` while mandatory documents (PAN, Agreement) are not `Approved` (per Requirement 4.8).

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

### Requirement 9 — Data relationships and integrity

**User Story:** As a developer, I want a normalized partner data structure, so that profile, commission, documents, and performance are cleanly separated and consistently linked.

#### Acceptance Criteria
1. THE system SHALL model the structure as: Partner (master) → Partner Documents (many), Partner Commission (many, one per product) → Commission Tiers (many per commission), and Partner Performance (derived from Lead/Product/Transaction data).
2. THE system SHALL link every Partner Document, Partner Commission, and Commission Tier to a valid Partner ID.
3. WHEN a Partner Commission is removed THEN the system SHALL remove its associated Commission Tiers (no orphaned tiers).
4. THE system SHALL ensure each generated Partner ID and each generated Partner Code is unique across all partners.
5. THE system SHALL preserve referential integrity such that no Commission Tier, Partner Commission, or Partner Document references a non-existent Partner.
```

