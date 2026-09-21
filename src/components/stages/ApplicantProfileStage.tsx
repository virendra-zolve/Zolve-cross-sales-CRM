import React from 'react';
import GenericStageForm, { StageFormConfig } from '../GenericStageForm';

interface ApplicantProfileStageProps {
  formData: Record<string, any>;
  validationErrors: Record<string, string>;
  onFieldChange: (fieldName: string, value: any) => void;
  onValidationChange?: (isValid: boolean) => void;
}

/**
 * ApplicantProfileStage - First stage form for collecting applicant personal information
 * Includes: name, email, phone, DOB, gender, nationality, address, PAN
 * 
 * Auto-populated fields from LeadProfile:
 * - name, email, phone, DOB, address
 */
const ApplicantProfileStage: React.FC<ApplicantProfileStageProps> = ({
  formData,
  validationErrors,
  onFieldChange,
  onValidationChange,
}) => {
  const validateEmail = (value: string): string | null => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(value)) {
      return 'Please enter a valid email address';
    }
    return null;
  };

  const validatePhone = (value: string): string | null => {
    const phoneRegex = /^[\d\s\-\+\(\)]{10,}$/;
    if (!phoneRegex.test(value.replace(/\D/g, ''))) {
      return 'Please enter a valid phone number (minimum 10 digits)';
    }
    return null;
  };

  const validateAge = (dateString: string): string | null => {
    const birthDate = new Date(dateString);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    if (age < 18) {
      return 'You must be at least 18 years old';
    }
    return null;
  };

  const validatePAN = (value: string): string | null => {
    const panRegex = /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/;
    if (!panRegex.test(value.toUpperCase())) {
      return 'Please enter a valid PAN (format: AAAAA9999A)';
    }
    return null;
  };

  const config: StageFormConfig = {
    stageName: 'Applicant Profile',
    description: 'Tell us about yourself. Fields marked as "Auto-populated" are synced with your Lead Profile.',
    fields: [
      {
        name: 'fullName',
        label: 'Full Name',
        type: 'text',
        required: true,
        placeholder: 'Enter your full name',
        hint: 'As it appears on your passport or national ID',
        autoPopulated: true,
      },
      {
        name: 'email',
        label: 'Email Address',
        type: 'email',
        required: true,
        placeholder: 'your.email@example.com',
        validation: validateEmail,
        autoPopulated: true,
      },
      {
        name: 'phoneNumber',
        label: 'Phone Number',
        type: 'phone',
        required: true,
        placeholder: '+1 (555) 000-0000',
        validation: validatePhone,
        autoPopulated: true,
      },
      {
        name: 'dateOfBirth',
        label: 'Date of Birth',
        type: 'date',
        required: true,
        validation: validateAge,
        autoPopulated: true,
      },
      {
        name: 'gender',
        label: 'Gender',
        type: 'select',
        required: true,
        options: [
          { value: 'male', label: 'Male' },
          { value: 'female', label: 'Female' },
          { value: 'other', label: 'Other' },
          { value: 'prefer_not_to_say', label: 'Prefer not to say' },
        ],
      },
      {
        name: 'nationality',
        label: 'Nationality',
        type: 'select',
        required: true,
        options: [
          { value: 'indian', label: 'Indian' },
          { value: 'other', label: 'Other (please specify)' },
        ],
      },
      {
        name: 'pan',
        label: 'PAN (Permanent Account Number)',
        type: 'text',
        required: false,
        placeholder: 'AAAAA9999A',
        validation: validatePAN,
      },
    ],
  };

  return (
    <GenericStageForm
      config={config}
      formData={formData}
      validationErrors={validationErrors}
      onFieldChange={onFieldChange}
      onValidationChange={onValidationChange}
    />
  );
};

export default ApplicantProfileStage;
