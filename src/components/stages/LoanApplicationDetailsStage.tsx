import React from 'react';
import GenericStageForm, { StageFormConfig } from '../GenericStageForm';

interface LoanApplicationDetailsStageProps {
  formData: Record<string, any>;
  validationErrors: Record<string, string>;
  onFieldChange: (fieldName: string, value: any) => void;
  onValidationChange?: (isValid: boolean) => void;
}

/**
 * LoanApplicationDetailsStage - Collects loan amount, purpose, and repayment preferences
 */
const LoanApplicationDetailsStage: React.FC<LoanApplicationDetailsStageProps> = ({
  formData,
  validationErrors,
  onFieldChange,
  onValidationChange,
}) => {
  const config: StageFormConfig = {
    stageName: 'Loan Application Details',
    description: 'Specify your loan requirements.',
    fields: [
      {
        name: 'loanType',
        label: 'Loan Type',
        type: 'select',
        required: true,
        options: [
          { value: 'education_only', label: 'Education Expenses Only' },
          { value: 'education_plus_living', label: 'Education + Living Expenses' },
          { value: 'travel_education', label: 'Travel + Education' },
        ],
      },
      {
        name: 'requestedLoanAmount',
        label: 'Requested Loan Amount',
        type: 'number',
        required: true,
        minValue: 0,
        placeholder: 'Enter amount',
        hint: 'In the currency of the destination country',
      },
      {
        name: 'loanAmountCurrency',
        label: 'Currency',
        type: 'select',
        required: true,
        options: [
          { value: 'usd', label: 'USD ($)' },
          { value: 'gbp', label: 'GBP (£)' },
          { value: 'aud', label: 'AUD ($)' },
          { value: 'cad', label: 'CAD ($)' },
          { value: 'inr', label: 'INR (₹)' },
        ],
      },
      {
        name: 'purposeOfLoan',
        label: 'Purpose of Loan',
        type: 'multi-select',
        required: true,
        options: [
          { value: 'tuition', label: 'Tuition Fees' },
          { value: 'accommodation', label: 'Accommodation' },
          { value: 'living_expenses', label: 'Living Expenses' },
          { value: 'travel', label: 'Travel' },
          { value: 'books_materials', label: 'Books & Materials' },
          { value: 'technology', label: 'Technology & Equipment' },
        ],
      },
      {
        name: 'repaymentPreference',
        label: 'Repayment Preference',
        type: 'select',
        required: true,
        options: [
          { value: 'after_graduation', label: 'After Graduation' },
          { value: 'during_studies', label: 'During Studies' },
          { value: 'flexible', label: 'Flexible' },
        ],
        hint: 'When would you prefer to start repaying your loan?',
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

export default LoanApplicationDetailsStage;
