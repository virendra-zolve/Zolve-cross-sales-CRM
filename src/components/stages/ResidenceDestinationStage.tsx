import React from 'react';
import GenericStageForm, { StageFormConfig } from '../GenericStageForm';

interface ResidenceDestinationStageProps {
  formData: Record<string, any>;
  validationErrors: Record<string, string>;
  onFieldChange: (fieldName: string, value: any) => void;
  onValidationChange?: (isValid: boolean) => void;
}

/**
 * ResidenceDestinationStage - Collects information about where applicant currently lives
 * and where they plan to study
 */
const ResidenceDestinationStage: React.FC<ResidenceDestinationStageProps> = ({
  formData,
  validationErrors,
  onFieldChange,
  onValidationChange,
}) => {
  const config: StageFormConfig = {
    stageName: 'Residence & Destination',
    description: 'Where do you currently live and where are you planning to study?',
    fields: [
      {
        name: 'currentCountryOfResidence',
        label: 'Current Country of Residence',
        type: 'select',
        required: true,
        options: [
          { value: 'india', label: 'India' },
          { value: 'usa', label: 'United States' },
          { value: 'uk', label: 'United Kingdom' },
          { value: 'australia', label: 'Australia' },
          { value: 'canada', label: 'Canada' },
          { value: 'other', label: 'Other' },
        ],
      },
      {
        name: 'currentVisaStatus',
        label: 'Current Visa Status',
        type: 'select',
        required: true,
        options: [
          { value: 'resident', label: 'Permanent Resident' },
          { value: 'citizen', label: 'Citizen' },
          { value: 'work_visa', label: 'Work Visa' },
          { value: 'student_visa', label: 'Student Visa' },
          { value: 'other', label: 'Other' },
        ],
      },
      {
        name: 'plannedDestinationCountry',
        label: 'Planned Destination Country',
        type: 'select',
        required: true,
        options: [
          { value: 'usa', label: 'United States' },
          { value: 'uk', label: 'United Kingdom' },
          { value: 'australia', label: 'Australia' },
          { value: 'canada', label: 'Canada' },
          { value: 'india', label: 'India' },
          { value: 'other', label: 'Other' },
        ],
        autoPopulated: true,
      },
      {
        name: 'expectedVisaApplicationDate',
        label: 'Expected Visa Application Date',
        type: 'date',
        required: true,
        hint: 'When do you plan to apply for your visa?',
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

export default ResidenceDestinationStage;
