import React from 'react';
import GenericStageForm, { StageFormConfig } from '../GenericStageForm';

interface EducationDetailsStageProps {
  formData: Record<string, any>;
  validationErrors: Record<string, string>;
  onFieldChange: (fieldName: string, value: any) => void;
  onValidationChange?: (isValid: boolean) => void;
}

/**
 * EducationDetailsStage - Collects course and university information
 * Auto-populated fields: degreeType, fieldOfStudy, intakeYear, universitiesOfInterest
 */
const EducationDetailsStage: React.FC<EducationDetailsStageProps> = ({
  formData,
  validationErrors,
  onFieldChange,
  onValidationChange,
}) => {
  const config: StageFormConfig = {
    stageName: 'Education Details',
    description: 'Tell us about your course and university plans.',
    fields: [
      {
        name: 'degreeType',
        label: 'Degree Type',
        type: 'select',
        required: true,
        options: [
          { value: 'bachelors', label: "Bachelor's Degree" },
          { value: 'masters', label: "Master's Degree" },
          { value: 'phd', label: 'PhD' },
          { value: 'diploma', label: 'Diploma' },
          { value: 'certificate', label: 'Certificate' },
        ],
        autoPopulated: true,
      },
      {
        name: 'fieldOfStudy',
        label: 'Field of Study',
        type: 'text',
        required: true,
        placeholder: 'e.g., Computer Science, Business Administration',
        autoPopulated: true,
      },
      {
        name: 'intakeType',
        label: 'Intake Type',
        type: 'select',
        required: true,
        options: [
          { value: 'fall', label: 'Fall' },
          { value: 'spring', label: 'Spring' },
          { value: 'summer', label: 'Summer' },
          { value: 'winter', label: 'Winter' },
        ],
        autoPopulated: true,
      },
      {
        name: 'intakeYear',
        label: 'Intake Year',
        type: 'number',
        required: true,
        minValue: new Date().getFullYear(),
        placeholder: new Date().getFullYear().toString(),
        autoPopulated: true,
      },
      {
        name: 'universitiesOfInterest',
        label: 'Universities of Interest',
        type: 'multi-select',
        required: true,
        options: [
          { value: 'stanford', label: 'Stanford University' },
          { value: 'mit', label: 'Massachusetts Institute of Technology' },
          { value: 'harvard', label: 'Harvard University' },
          { value: 'oxford', label: 'University of Oxford' },
          { value: 'cambridge', label: 'University of Cambridge' },
          { value: 'berkeley', label: 'UC Berkeley' },
          { value: 'caltech', label: 'Caltech' },
          { value: 'other', label: 'Other' },
        ],
        autoPopulated: true,
      },
      {
        name: 'admissionStatus',
        label: 'Admission Status',
        type: 'select',
        required: true,
        options: [
          { value: 'pending', label: 'Pending' },
          { value: 'accepted', label: 'Accepted' },
          { value: 'conditional', label: 'Conditional' },
          { value: 'waitlisted', label: 'Waitlisted' },
          { value: 'rejected', label: 'Rejected' },
        ],
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

export default EducationDetailsStage;
