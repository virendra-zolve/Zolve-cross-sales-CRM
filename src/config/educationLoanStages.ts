import { LoanProductFlow, ApplicationStatus } from '../types/normalized';
import { StageFormConfig, StageFieldConfig } from '../components/GenericStageForm';

/**
 * Education Loan Journey Stage Configurations
 * 
 * Defines all stages, fields, validation rules, and UI preferences for each loan product flow.
 * These configurations drive the dynamic form rendering in GenericStageForm.
 */

// ============================================================================
// VALIDATION RULES
// ============================================================================

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

// ============================================================================
// STAGE CONFIGURATIONS BY FLOW
// ============================================================================

// Common fields used across flows
const applicantProfileFields: StageFieldConfig[] = [
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
];

const residenceDestinationFields: StageFieldConfig[] = [
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
  },
  {
    name: 'expectedVisaApplicationDate',
    label: 'Expected Visa Application Date',
    type: 'date',
    required: true,
  },
];

const educationDetailsFields: StageFieldConfig[] = [
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
];

const loanApplicationDetailsFields: StageFieldConfig[] = [
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
];

// ============================================================================
// STAGE DEFINITIONS BY FLOW
// ============================================================================

export const stageConfigsByFlow: Record<LoanProductFlow, StageFormConfig[]> = {
  [LoanProductFlow.INR_Unsecured]: [
    {
      stageName: 'Applicant Profile',
      description: 'Tell us about yourself',
      fields: applicantProfileFields,
    },
    {
      stageName: 'Residence & Destination',
      description: 'Where do you currently live and where are you planning to study?',
      fields: residenceDestinationFields,
    },
    {
      stageName: 'Education Details',
      description: 'Tell us about your course and university plans',
      fields: educationDetailsFields,
    },
    {
      stageName: 'Loan Application Details',
      description: 'Specify your loan requirements',
      fields: loanApplicationDetailsFields,
    },
    {
      stageName: 'References',
      description: 'Provide contact information for references',
      fields: [], // TODO: Reference fields
    },
    {
      stageName: 'Academic History',
      description: 'Your educational background',
      fields: [], // TODO: Academic history fields
    },
    {
      stageName: 'Financial Details',
      description: 'Your financial information',
      fields: [], // TODO: Financial fields
    },
    {
      stageName: 'Document Checklist',
      description: 'Upload required documents',
      fields: [], // TODO: Document fields
    },
    {
      stageName: 'Provider Selection',
      description: 'Choose your preferred loan provider',
      fields: [], // TODO: Provider selection
    },
    {
      stageName: 'Review & Submit',
      description: 'Review your application and submit',
      fields: [], // TODO: Review/submit
    },
  ],
  [LoanProductFlow.INR_Secured]: [],
  [LoanProductFlow.US_Cosigner]: [],
  [LoanProductFlow.USD_NoCoSigner_Prodigy]: [],
  [LoanProductFlow.USD_NoCoSigner_MPower]: [],
};

/**
 * Get stage configuration for a specific flow
 */
export const getStageConfig = (
  flow: LoanProductFlow,
  stageName: string
): StageFormConfig | undefined => {
  const stages = stageConfigsByFlow[flow];
  return stages.find(s => s.stageName === stageName);
};

/**
 * Get all stage names for a flow
 */
export const getStageName = (flow: LoanProductFlow): string[] => {
  return stageConfigsByFlow[flow].map(s => s.stageName);
};
