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

const PARTNER_TYPES: PartnerType[] = [
  'Education Loan',
  'eSIM',
  'Accommodation',
  'Insurance',
  'Bank Account',
  'Credit Card',
];
const PARTNER_SCALES: PartnerScale[] = ['Single Branch', 'Multi Branch', 'Franchise'];
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

  // A branch linked to a parent Head Office inherits legal identity (PAN/GST/CIN)
  // and owner from the parent, so those fields are not required here.
  const isLinkedBranch = p.officeType === 'Branch' && !!p.parentPartnerId;

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

  // PAN (inherited from parent for linked branches)
  if (!isLinkedBranch) {
    if (!p.panNumber?.trim()) {
      errors.push({ field: 'panNumber', message: 'PAN number is required' });
    } else if (!isValidPan(p.panNumber)) {
      errors.push({ field: 'panNumber', message: 'Invalid PAN format' });
    }
  }

  // Owner (inherited from parent for linked branches)
  if (!isLinkedBranch) {
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
  }

  // Contact person(s)
  // When the owner is also the contact (single-person shop), no contact rows are required.
  if (!p.contactSameAsOwner) {
    const contacts = p.contacts || [];
    if (contacts.length === 0) {
      errors.push({ field: 'contacts', message: 'At least one contact person is required' });
    }
    contacts.forEach((c, i) => {
      if (!c.name?.trim()) {
        errors.push({ field: `contacts[${i}].name`, message: 'Contact name is required' });
      }
      if (!c.designation?.trim()) {
        errors.push({ field: `contacts[${i}].designation`, message: 'Contact designation is required' });
      }
      if (!c.email?.trim()) {
        errors.push({ field: `contacts[${i}].email`, message: 'Contact email is required' });
      } else if (!isValidEmail(c.email)) {
        errors.push({ field: `contacts[${i}].email`, message: 'Invalid contact email' });
      }
      if (!c.phone?.trim()) {
        errors.push({ field: `contacts[${i}].phone`, message: 'Contact phone is required' });
      } else if (!isValidPhone(c.phone)) {
        errors.push({ field: `contacts[${i}].phone`, message: 'Invalid contact phone' });
      }
    });
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
