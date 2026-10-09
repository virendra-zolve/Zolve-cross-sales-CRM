// Partner Management - Normalized data model
// Based on Partner Management PRD

import { MasterProduct } from '../types';

// ============================================================================
// PARTNER MASTER
// ============================================================================

export type PartnerStatus =
  | 'Draft'
  | 'Pending Head Approval'
  | 'Review Required'
  | 'Rejected'
  | 'Active';

export type PartnerType =
  | 'Education Loan'
  | 'eSIM'
  | 'Accommodation'
  | 'Insurance'
  | 'Bank Account'
  | 'Credit Card';
export type PartnerScale = 'Single Branch' | 'Multi Branch' | 'Franchise';
export type AddressType = 'Head Office' | 'Branch';

// Products a partner can be onboarded for / earn commission on.
export const PARTNER_PRODUCTS = [
  'Education Loan',
  'eSIM',
  'Accommodation',
  'Insurance',
  'Bank Account',
  'Credit Card',
] as const;

export interface PartnerAddress {
  addressLine1: string;
  addressLine2?: string;
  city: string;
  state: string;
  pincode: string;
  country: string;
}

export interface PartnerContact {
  name: string;
  designation: string;
  email: string;
  phone: string;
}

export interface PartnerMaster {
  // Identity
  id: string; // internal, P#####
  partnerCode?: string; // commercial, generated on activation
  status: PartnerStatus;

  // Business legal
  legalBusinessName: string;
  partnerType: PartnerType;
  partnerScale: PartnerScale;
  panNumber: string;
  cin?: string;
  gstNumber?: string;

  // Owner
  ownerName: string;
  ownerEmail: string;
  ownerPhone: string;

  // Contact person(s)
  // When contactSameAsOwner is true, the owner is the sole contact and `contacts` may be empty.
  contactSameAsOwner: boolean;
  contacts: PartnerContact[];

  // Legacy single-contact fields (kept optional for backward compatibility)
  contactPersonName?: string;
  contactPersonEmail?: string;
  contactPersonPhone?: string;

  // Office classification & multi-branch linking
  officeType: AddressType; // 'Head Office' | 'Branch'
  parentPartnerId?: string; // set when officeType === 'Branch' and linked to a Head Office partner

  // Addresses
  registeredAddress: PartnerAddress;
  addressType: AddressType; // type of the registered address
  operatingSameAsRegistered: boolean;
  operatingAddress?: PartnerAddress; // required when operatingSameAsRegistered === false

  // Ownership
  bdOwnerId: string; // active BD user id, e.g. U1001
  bdOwnerName?: string;

  // Country-wise business potential (students per year by destination country)
  countryPotential?: CountryPotential[];

  // Timestamps
  createdAt: string;
  updatedAt: string;
}

export interface CountryPotential {
  country: string;
  studentsPerYear: number;
}

// ============================================================================
// COMMISSION
// ============================================================================

export type TierMetric =
  | 'Sanctioned Loan Amount'
  | 'Number of SIMs'
  | 'Number of Accounts'
  | 'Number of Bookings'
  | 'Booking Value'
  | 'Transfer Volume';

export type CommissionType = 'Percentage' | 'Flat';

export interface CommissionTier {
  id: string;
  commissionId: string; // FK -> PartnerCommission.id
  slabIndex: number; // 0-based order
  fromValue: number; // inclusive lower bound (absolute quantity)
  toValue: number | null; // upper bound; null = No Limit (last slab)
  commissionType: CommissionType;
  commissionValue: number; // percent (e.g. 0.5 => 0.5%) or flat amount per unit
}

export interface PartnerCommissionConfig {
  id: string;
  partnerId: string; // FK -> PartnerMaster.id
  product: MasterProduct;
  tierMetric: TierMetric;
  commissionType: CommissionType; // default type for the config
  effectiveFrom: string;
  effectiveTo?: string;
  status: 'Active' | 'Inactive';
  tiers: CommissionTier[];
}

// ============================================================================
// DOCUMENTS
// ============================================================================

export type PartnerDocumentType = 'PAN' | 'GST' | 'CIN' | 'Agreement' | 'Other';
export type PartnerDocumentStatus = 'Pending' | 'Uploaded' | 'Approved' | 'Rejected';

export interface PartnerDocument {
  id: string;
  partnerId: string;
  documentType: PartnerDocumentType;
  fileName: string;
  fileUrl: string;
  status: PartnerDocumentStatus;
  uploadedBy: string;
  uploadedAt: string;
  reviewedBy?: string;
  reviewedAt?: string;
  rejectionReason?: string;
}

// ============================================================================
// APPROVAL WORKFLOW
// ============================================================================

export type PartnerApprovalActionType =
  | 'submitted'
  | 'approved'
  | 'rejected'
  | 'review_required'
  | 'resubmitted'
  | 'migrated';

export interface PartnerApprovalAction {
  id: string;
  partnerId: string;
  timestamp: string;
  action: PartnerApprovalActionType;
  actor: string;
  actorRole: 'BD' | 'Head' | 'System';
  comment?: string;
}

// ============================================================================
// PERFORMANCE METRICS (derived)
// ============================================================================

export interface PartnerPerformance {
  partnerId: string;
  totalLeads: number;
  qualifiedLeads: number;
  activeLeads: number;
  convertedLeads: number;
  conversionRate: number; // 0 when totalLeads === 0
  productWiseLeads: Record<string, number>;
  productWiseConversion: Record<string, number>;
  loanSanctionedAmount: number;
  loanDisbursedAmount: number;
  commissionEarned: number;
  commissionPaid: number;
  pendingCommission: number; // earned - paid
}

export interface BdPartnerMetrics {
  bdOwnerId: string;
  partnersOnboarded: number;
  activePartners: number;
  activePartnerRate: number; // 0 when onboarded === 0
  partnersGeneratingLeads: number;
  leadsGenerated: number;
  partnerLogins: number;
}
