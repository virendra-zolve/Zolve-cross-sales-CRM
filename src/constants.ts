// Centralized constants for the CRM system

import { JourneyStage, MasterProduct, ProductOpportunityStatus, CallingStatus, LastCallOutcome, QualificationStatus, ClosureReason, LeadStatus } from './types';

export const JOURNEY_STAGES: JourneyStage[] = [
  'Pre-Test',
  'Test Preparation',
  'Counseling',
  'Application',
  'Admission Confirmed',
  'Pre-Departure',
  'Visa',
  'Travel',
  'Post-Arrival',
  'Other',
  'Unknown',
];

export const ALL_MASTER_PRODUCTS: MasterProduct[] = [
  'Education Loan',
  'Refinance',
  'Test Prep',
  'Test Voucher',
  'Admissions',
  'Accommodation',
  'eSIM',
  'Travel / Flights',
  'Bank Account',
  'Credit Card',
  'Money Transfer',
  'NRE/NRO Account',
  'Insurance',
];

export const PRODUCT_OPPORTUNITY_STATUSES: ProductOpportunityStatus[] = [
  'Not Started',
  'Interested',
  'In Progress',
  'Completed / Sold',
  'Not Interested',
  'Failed / Rejected',
  'Cancelled',
  'Closed',
];

export const CALLING_STATUSES: CallingStatus[] = [
  'Not Attempted',
  'Connected',
  'RNR',
  'Switch Off',
  'Busy',
  'Callback Scheduled',
  'Not Interested',
  'Invalid Number',
];

export const LAST_CALL_OUTCOMES: LastCallOutcome[] = [
  'Connected',
  'Converted',
  'Deferred',
  'RNR',
  'Switch Off',
  'Busy',
  'Callback Requested',
  'Not Interested',
  'Invalid Number',
  'Other',
];

export const QUALIFICATION_STATUSES: QualificationStatus[] = [
  'Pending',
  'Qualified',
  'Not Qualified',
  'Not Required',
];

export const CLOSURE_REASONS: ClosureReason[] = [
  'Not Interested',
  'Not Qualified',
  'Invalid Contact',
  'Wrong Number',
  'Unreachable',
  'Duplicate',
  'Journey Completed',
  'Other',
];

export const LEAD_STATUSES: LeadStatus[] = [
  'Active',
  'Closed',
  'Archived',
];

// UI Related Constants
export const ZOLVE_RED = '#D91C24';
export const ZOLVE_RED_DARK = '#B30018';
