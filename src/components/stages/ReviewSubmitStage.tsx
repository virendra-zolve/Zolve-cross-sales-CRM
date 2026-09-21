import React from 'react';
import { CheckCircle, AlertCircle } from 'lucide-react';

interface ReviewSubmitStageProps {
  formData: Record<string, any>;
  onConfirmSubmit?: () => void;
}

/**
 * ReviewSubmitStage - Final review stage showing summary of all entered data
 * Displays read-only summary of all stages and allows user to confirm submission
 */
const ReviewSubmitStage: React.FC<ReviewSubmitStageProps> = ({
  formData,
  onConfirmSubmit,
}) => {
  const formatValue = (value: any): string => {
    if (Array.isArray(value)) {
      return value.join(', ');
    }
    if (value === null || value === undefined) {
      return 'Not provided';
    }
    return String(value);
  };

  const sectionData = [
    {
      title: 'Applicant Profile',
      items: [
        { label: 'Full Name', key: 'fullName' },
        { label: 'Email', key: 'email' },
        { label: 'Phone', key: 'phoneNumber' },
        { label: 'Date of Birth', key: 'dateOfBirth' },
        { label: 'Gender', key: 'gender' },
        { label: 'Nationality', key: 'nationality' },
        { label: 'PAN', key: 'pan' },
      ],
    },
    {
      title: 'Residence & Destination',
      items: [
        { label: 'Current Country', key: 'currentCountryOfResidence' },
        { label: 'Current Visa Status', key: 'currentVisaStatus' },
        { label: 'Destination Country', key: 'plannedDestinationCountry' },
        { label: 'Visa Application Date', key: 'expectedVisaApplicationDate' },
      ],
    },
    {
      title: 'Education Details',
      items: [
        { label: 'Degree Type', key: 'degreeType' },
        { label: 'Field of Study', key: 'fieldOfStudy' },
        { label: 'Intake Type', key: 'intakeType' },
        { label: 'Intake Year', key: 'intakeYear' },
        { label: 'Universities', key: 'universitiesOfInterest' },
        { label: 'Admission Status', key: 'admissionStatus' },
      ],
    },
    {
      title: 'Loan Application Details',
      items: [
        { label: 'Loan Type', key: 'loanType' },
        { label: 'Requested Amount', key: 'requestedLoanAmount' },
        { label: 'Currency', key: 'loanAmountCurrency' },
        { label: 'Purpose of Loan', key: 'purposeOfLoan' },
        { label: 'Repayment Preference', key: 'repaymentPreference' },
      ],
    },
  ];

  return (
    <div className="space-y-6">
      <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <p className="text-sm text-blue-900">
          Please review your application details below before submitting. Once submitted, you will not be able to make changes.
        </p>
      </div>

      <div className="space-y-6">
        {sectionData.map(section => (
          <div key={section.title} className="border border-slate-200 rounded-lg overflow-hidden">
            <div className="bg-slate-100 px-4 py-3 border-b border-slate-200">
              <h3 className="text-sm font-bold text-slate-900">{section.title}</h3>
            </div>

            <div className="divide-y divide-slate-200">
              {section.items.map(item => {
                const value = formData[item.key];
                const isEmpty = !value || (Array.isArray(value) && value.length === 0);

                return (
                  <div key={item.key} className="px-4 py-3 flex items-start justify-between gap-4">
                    <span className="text-sm font-semibold text-slate-600">{item.label}</span>
                    <span className={`text-sm text-right ${isEmpty ? 'text-slate-400 italic' : 'text-slate-900'}`}>
                      {formatValue(value)}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      <div className="bg-green-50 border border-green-200 rounded-lg p-4 flex items-start gap-3">
        <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
        <div>
          <p className="text-sm font-semibold text-green-900">Ready to submit?</p>
          <p className="text-xs text-green-800 mt-1">
            Your application is complete and ready for submission. Click the Submit button below to proceed.
          </p>
        </div>
      </div>

      <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 flex items-start gap-3">
        <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
        <div>
          <p className="text-sm font-semibold text-amber-900">Important</p>
          <p className="text-xs text-amber-800 mt-1">
            Ensure all information is accurate and complete. Providing false information may result in application rejection.
          </p>
        </div>
      </div>
    </div>
  );
};

export default ReviewSubmitStage;
