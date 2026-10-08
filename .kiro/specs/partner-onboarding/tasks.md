# Implementation Plan

- [x] 1. Define partner data model types
  - Create `src/types/partner.ts` with PartnerMaster, PartnerAddress, enums (PartnerStatus, PartnerType, PartnerScale, AddressType), PartnerCommission, CommissionTier, TierMetric, CommissionType, PartnerDocument, DocumentType, DocumentStatus, PartnerApprovalAction, PartnerPerformance, BdPartnerMetrics
  - Export all types; ensure `product` fields reference the existing MasterProduct string union
  - _Requirements: 1, 2, 3, 4, 9_

- [x] 2. Implement partner validation helpers
  - [x] 2.1 Create `src/utils/partnerValidation.ts` with format validators (isValidPan, isValidEmail, isValidPhone, isValidPincode) and `validatePartnerMaster`
    - Enforce mandatory fields, conditional operating-address fields, and enum/format constraints
    - _Requirements: 1.2, 1.4, 1.6, 1.7, 1.8, 1.11_
  - [x] 2.2 Write unit tests for validation covering missing mandatory fields, conditional operating address, and format checks
    - _Requirements: 1.2, 1.4, 1.11_

- [x] 3. Implement commission slab logic
  - [x] 3.1 Create `src/utils/commissionSlabs.ts` with `validateSlabs`, `resolveSlab`, `computeCommission`
    - Enforce contiguous, non-overlapping slabs with optional unbounded last slab
    - _Requirements: 3.4, 3.5, 3.6, 3.9, 7.4_
  - [x] 3.2 Write unit tests for slab coverage/non-overlap, resolution totality, boundary values, and commission non-negativity
    - _Requirements: 3.9, 7.4_

- [x] 4. Implement workflow state machine
  - [x] 4.1 Create `src/utils/partnerWorkflow.ts` with `nextStatusForDecision`, `canSubmit`, `canResubmit`, `mandatoryDocsApproved`
    - Block approve → Active unless PAN + Agreement documents are Approved
    - _Requirements: 2.2, 2.3, 2.4, 5.3, 5.4, 5.5, 5.6, 5.7, 5.9, 4.8_
  - [x] 4.2 Write unit tests for all decision transitions and the mandatory-docs approval gate
    - _Requirements: 5.3, 5.4, 5.5, 5.6, 5.9_

- [x] 5. Implement metrics calculators
  - [x] 5.1 Create `src/utils/partnerMetrics.ts` with `calculatePartnerPerformance` and `calculateBdPartnerMetrics`
    - Guard divide-by-zero for conversion rate and active partner rate; compute commission earned via active slab
    - _Requirements: 7.1, 7.2, 7.3, 7.4, 8.1, 8.2, 8.3_
  - [x] 5.2 Write unit tests including zero-lead and zero-partner cases
    - _Requirements: 7.3, 8.2_

- [x] 6. Implement PartnersDatabase API
  - [x] 6.1 Create `src/api/partnersApi.ts` with Map stores, id/code generators, and CRUD + submit/review/resubmit methods
    - Generate Partner ID on create; generate Partner Code only on activation; ensure uniqueness
    - _Requirements: 2.1, 2.4, 2.5, 2.6, 5.1, 5.4, 5.5, 5.6, 5.7, 5.8, 9.4_
  - [x] 6.2 Add commission ops (setCommission, getCommissions, deleteCommission with tier cascade) and document ops (addDocument, reviewDocument)
    - Validate partner existence; enforce referential integrity and cascade delete
    - _Requirements: 3.1, 3.2, 3.3, 3.10, 4.1, 4.5, 4.6, 4.7, 9.2, 9.3, 9.5_
  - [x] 6.3 Add `bulkCreatePartners` (migration) and metrics queries (getPartnerPerformance, getBdMetrics)
    - Migrated partners set directly to Active with code; bypass approval; build commissions from rows
    - _Requirements: 6.1, 6.2, 6.3, 6.4, 6.5, 6.6, 6.7, 7, 8_
  - [x] 6.4 Write API tests for create→submit→review (all outcomes)→activation, commission cascade, document gating, and migration bypass
    - _Requirements: 2.5, 5.3, 5.4, 5.9, 6.5, 9.3_

- [ ] 7. Update UI to the new model
  - [x] 7.1 Update `OnboardPartnerModal` to new Partner Master fields and per-product slab builder; submit as Pending Head Approval
    - _Requirements: 1, 2.4, 3_
  - [x] 7.2 Update `PartnerApprovalTab` and `PartnerManagementPortal` to single-Head review (profile + commission + documents) with Approve/Review Required/Reject and new status tabs
    - _Requirements: 5.2, 5.3, 5.9_
  - [ ] 7.3 Update `AgreementUploadModal` to create an Agreement PartnerDocument with review lifecycle; update `PartnerDetailView` to read commissions/documents/performance from the new model
    - _Requirements: 4, 7_
  - [ ] 7.4 Add `PartnerMigrationModal` for bulk import and wire `App.tsx` partner state/handlers to `PartnersDatabase`
    - _Requirements: 6_

- [ ]* 8. Deprecate legacy Partner type
  - Remove or alias the old `Partner`/`PartnerCommission` types in `src/types.ts` and update remaining references
  - _Requirements: 9_

- [x] 9. Verify build and tests
  - Run `npm run lint` (tsc --noEmit); fix any type errors across new and updated files
  - Run the test suite if a runner is available; otherwise confirm logic via the type-check gate
  - _Requirements: all_
