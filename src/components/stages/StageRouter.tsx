import React from 'react';
import GenericStageForm from '../GenericStageForm';
import ApplicantProfileStage from './ApplicantProfileStage';
import ResidenceDestinationStage from './ResidenceDestinationStage';
import EducationDetailsStage from './EducationDetailsStage';
import LoanApplicationDetailsStage from './LoanApplicationDetailsStage';
import ReviewSubmitStage from './ReviewSubmitStage';

interface StageRouterProps {
  stageName: string;
  formData: Record<string, any>;
  validationErrors: Record<string, string>;
  onFieldChange: (fieldName: string, value: any) => void;
  onValidationChange?: (isValid: boolean) => void;
}

/**
 * StageRouter - Routes to the appropriate stage component based on stage name
 * Handles both generic stages and specialized stage components
 */
const StageRouter: React.FC<StageRouterProps> = ({
  stageName,
  formData,
  validationErrors,
  onFieldChange,
  onValidationChange,
}) => {
  switch (stageName) {
    case 'Applicant Profile':
      return (
        <ApplicantProfileStage
          formData={formData}
          validationErrors={validationErrors}
          onFieldChange={onFieldChange}
          onValidationChange={onValidationChange}
        />
      );

    case 'Residence & Destination':
      return (
        <ResidenceDestinationStage
          formData={formData}
          validationErrors={validationErrors}
          onFieldChange={onFieldChange}
          onValidationChange={onValidationChange}
        />
      );

    case 'Education Details':
      return (
        <EducationDetailsStage
          formData={formData}
          validationErrors={validationErrors}
          onFieldChange={onFieldChange}
          onValidationChange={onValidationChange}
        />
      );

    case 'Loan Application Details':
      return (
        <LoanApplicationDetailsStage
          formData={formData}
          validationErrors={validationErrors}
          onFieldChange={onFieldChange}
          onValidationChange={onValidationChange}
        />
      );

    case 'Review & Submit':
      return <ReviewSubmitStage formData={formData} />;

    // For other stages (Co-Applicant, References, Academic History, Financial Details, etc.)
    // Return a placeholder that will be implemented later
    default:
      return (
        <div className="p-8 bg-slate-50 border-2 border-dashed border-slate-300 rounded-lg text-center">
          <p className="text-sm text-slate-600 font-semibold">{stageName}</p>
          <p className="text-xs text-slate-500 mt-1">
            Stage form coming soon
          </p>
        </div>
      );
  }
};

export default StageRouter;
