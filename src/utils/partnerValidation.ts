// Partner Master validation helpers (pure, side-effect free)

import {
  PartnerMaster,
  PartnerType,
  PartnerScale,
  AddressType,
  PartnerAddress,
} from '../types/partner';

export interface ValidationError {
  field: string;
  message: string;
}

const PARTNER_TYPES: PartnerType[] = ['Education Consultant', 'FX', 'DSA', 'Other'];
const PARTNER_SCALES: PartnerScale[] = ['Single Branch', 'Multi Branch'];
const ADDRESS_TYPES: AddressType[] = ['Head Office', 'Branch'];

export function isValidPan(pan: string): boolean {
  return /^[A-Z]{5}[0-9]{4}[A-Z]$/.test(pan);
}

export function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export function isValidPhone(phone: string): boolean {
  const digits = phone.replace(/[^\d]/g, '');
  return digits.length >= 7 && digits.length <= 15;
}

export function isValidPincode(pincode: string): boolean {
  return /^\d+$/.test(pincode);
}

function validateAddress(
  address: PartnerAddress | undefined,
  prefix: string,
  errors: ValidationError[]
): void {
  if (!address) {
    errors.push({ field: prefix, message: `${prefix} is required` });
    return;
  }
  if (!address.addressLine1?.trim()) {
    errors.push({ field: `${prefix}.addressLine1`, message: 'Address line 1 is required' });
  }
  if (!address.city?.trim()) {
    errors.push({ field: `${prefix}.city`, message: 'City is required' });
  }
  if (!address.state?.trim()) {
    errors.push({ field: `${prefix}.state`, message: 'State is required' });
  }
  if (!address.pincode?.trim()) {
    errors.push({ field: `${prefix}.pincode`, message: 'Pincode is required' });
  } else if (!isValidPincode(address.pincode)) {
    errors.push({ field: `${prefix}.pincode`, message: 'Pincode must be numeric' });
  }
  if (!address.country?.trim()) {
    errors.push({ field: `${prefix}.country`, message: 'Country is required' });
  }
}

export function validatePartnerMaster(p: Partial<PartnerMaster>): ValidationError[] {
  const errors: ValidationError[] = [];

  // Mandatory text fields
  if (!p.legalBusinessName?.trim()) {
    errors.push({ field: 'legalBusinessName', message: 'Legal business name is required' });
  }

  // Enums
  if (!p.partnerType) {
    errors.push({ field: 'partnerType', message: 'Partner type is required' });
  } else if (!PARTNER_TYPES.includes(p.partnerType)) {
    errors.push({ field: 'partnerType', message: 'Invalid partner type' });
  }

  if (!p.partnerScale) {
    errors.push({ field: 'partnerScale', message: 'Partner scale is required' });
  } else if (!PARTNER_SCALES.includes(p.partnerScale)) {
    errors.push({ field: 'partnerScale', message: 'Invalid partner scale' });
  }

  if (!p.addressType) {
    errors.push({ field: 'addressType', message: 'Address type is required' });
  } else if (!ADDRESS_TYPES.includes(p.addressType)) {
    errors.push({ field: 'addressType', message: 'Invalid address type' });
  }

  // PAN
  if (!p.panNumber?.trim()) {
    errors.push({ field: 'panNumber', message: 'PAN number is required' });
  } else if (!isValidPan(p.panNumber)) {
    errors.push({ field: 'panNumber', message: 'Invalid PAN format' });
  }

  // Owner
  if (!p.ownerName?.trim()) {
    errors.push({ field: 'ownerName', message: 'Owner name is required' });
  }
  if (!p.ownerEmail?.trim()) {
    errors.push({ field: 'ownerEmail', message: 'Owner email is required' });
  } else if (!isValidEmail(p.ownerEmail)) {
    errors.push({ field: 'ownerEmail', message: 'Invalid owner email' });
  }
  if (!p.ownerPhone?.trim()) {
    errors.push({ field: 'ownerPhone', message: 'Owner phone is required' });
  } else if (!isValidPhone(p.ownerPhone)) {
    errors.push({ field: 'ownerPhone', message: 'Invalid owner phone' });
  }

  // Contact person
  if (!p.contactPersonName?.trim()) {
    errors.push({ field: 'contactPersonName', message: 'Contact person name is required' });
  }
  if (!p.contactPersonEmail?.trim()) {
    errors.push({ field: 'contactPersonEmail', message: 'Contact person email is required' });
  } else if (!isValidEmail(p.contactPersonEmail)) {
    errors.push({ field: 'contactPersonEmail', message: 'Invalid contact person email' });
  }
  if (!p.contactPersonPhone?.trim()) {
    errors.push({ field: 'contactPersonPhone', message: 'Contact person phone is required' });
  } else if (!isValidPhone(p.contactPersonPhone)) {
    errors.push({ field: 'contactPersonPhone', message: 'Invalid contact person phone' });
  }

  // BD Owner
  if (!p.bdOwnerId?.trim()) {
    errors.push({ field: 'bdOwnerId', message: 'BD owner is required' });
  }

  // Registered address (always required)
  validateAddress(p.registeredAddress, 'registeredAddress', errors);

  // Operating address flag + conditional
  if (p.operatingSameAsRegistered === undefined || p.operatingSameAsRegistered === null) {
    errors.push({
      field: 'operatingSameAsRegistered',
      message: 'Operating-address-same-as-registered flag is required',
    });
  } else if (p.operatingSameAsRegistered === false) {
    validateAddress(p.operatingAddress, 'operatingAddress', errors);
  }

  // Optional format checks
  if (p.gstNumber && p.gstNumber.trim().length > 0 && p.gstNumber.trim().length < 5) {
    errors.push({ field: 'gstNumber', message: 'Invalid GST number' });
  }

  return errors;
}
