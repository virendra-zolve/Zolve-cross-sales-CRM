# Education Loan Journey Stage Components

## Overview

This directory contains all stage-specific form components for the Education Loan Journey feature. Each stage collects specific information from the applicant following a progressive disclosure pattern.

## Architecture

### Pattern: GenericStageForm

Most stages use the **GenericStageForm** component with a configuration object:

```typescript
import GenericStageForm, { StageFormConfig } from '../GenericStageForm';

interface MyStageProps {
  formData: Record<string, any>;
  validationErrors: Record<string, string>;
  onFieldChange: (fieldName: string, value: any) => void;
  onValidationChange?: (isValid: boolean) => void;
}

const MyStage: React.FC<MyStageProps> = ({
  formData,
  validationErrors,
  onFieldChange,
  onValidationChange,
}) => {
  const config: StageFormConfig = {
    stageName: 'My Stage',
    description: 'A brief description...',
    fields: [
      {
        name: 'fieldName',
        label: 'Field Label',
        type: 'text',  // or email, phone, number, date, select, checkbox, textarea, multi-select
        required: true,
        placeholder: 'Enter...',
        hint: 'Optional helper text',
        options: [],  // For select/multi-select
        validation: (value) => { /* return error or null */ },
        autoPopulated: false,  // Set true for fields synced from LeadProfile
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

export default MyStage;
```

### Pattern: Custom Component

For stages with complex layouts (like ReviewSubmit), create a custom component:

```typescript
const MyCustomStage: React.FC<MyProps> = ({ formData, ... }) => {
  return (
    <div className="space-y-6">
      {/* Custom layout and rendering */}
    </div>
  );
};

export default MyCustomStage;
```

## Field Types

### Supported Field Types

```typescript
type: 'text'           // Plain text input
type: 'email'          // Email input with format validation
type: 'phone'          // Phone input (numeric)
type: 'number'         // Number input
type: 'date'           // Date picker (HTML5)
type: 'select'         // Dropdown select
type: 'checkbox'       // Single checkbox (for boolean fields)
type: 'textarea'       // Multi-line text area
type: 'multi-select'   // Multiple checkboxes or tags
```

### Field Configuration Properties

```typescript
interface StageFieldConfig {
  name: string;                          // Unique field identifier
  label: string;                         // Display label
  type: FieldType;                       // Input type
  required: boolean;                     // Is required?
  placeholder?: string;                  // Placeholder text
  hint?: string;                         // Helper text
  options?: Array<{                      // For select/multi-select
    value: string;
    label: string;
  }>;
  validation?: (value: any) => string | null;  // Custom validator
  minValue?: number;                     // For number fields
  maxValue?: number;                     // For number fields
  minLength?: number;                    // For text fields
  maxLength?: number;                    // For text fields
  pattern?: RegExp;                      // For text fields
  autoPopulated?: boolean;               // From LeadProfile?
}
```

## Implemented Stages

### ✅ Stage 1: Applicant Profile (ApplicantProfileStage.tsx)

**Fields:**
- Full Name (text, required, auto-populated)
- Email (email, required, auto-populated)
- Phone Number (phone, required, auto-populated)
- Date of Birth (date, required, validated for age >= 18, auto-populated)
- Gender (select, required)
- Nationality (select, required)
- PAN (text, optional, custom format validation)

**Validations:**
- Email format validation
- Phone format validation (10+ digits)
- Age validation (must be 18+)
- PAN format validation (AAAAA9999A)

### ✅ Stage 2: Residence & Destination (ResidenceDestinationStage.tsx)

**Fields:**
- Current Country of Residence (select, required)
- Current Visa Status (select, required)
- Planned Destination Country (select, required, auto-populated)
- Expected Visa Application Date (date, required)

**Validations:**
- Basic required field validation

### ✅ Stage 3: Education Details (EducationDetailsStage.tsx)

**Fields:**
- Degree Type (select, required, auto-populated)
- Field of Study (text, required, auto-populated)
- Intake Type (select, required, auto-populated)
- Intake Year (number, required, auto-populated)
- Universities of Interest (multi-select, required, auto-populated)
- Admission Status (select, required)

**Validations:**
- Intake year >= current year
- At least one university selected

### ✅ Stage 4: Loan Application Details (LoanApplicationDetailsStage.tsx)

**Fields:**
- Loan Type (select, required)
- Requested Loan Amount (number, required)
- Currency (select, required)
- Purpose of Loan (multi-select, required)
- Repayment Preference (select, required)

**Validations:**
- Amount > 0
- At least one purpose selected

### ✅ Stage 12: Review & Submit (ReviewSubmitStage.tsx)

**Layout:**
- Read-only summary of all entered data
- Organized by section
- Confirmation message
- No form inputs

## TODO: Stages to Implement

### Stage 5: Co-Applicant Details (7.5)

**Fields:**
- Full Name (text, required, conditional)
- Relationship (select, required)
- Phone Number (phone, required)
- Email (email, required)
- Profession (text, required)
- Employer (text, required)
- Annual Income (number, required)
- Address (text, required)
- Same as Applicant checkbox
- Consent Given checkbox (required)

**Conditional:**
- Show for INR_Secured and US_Cosigner flows only
- Hide for INR_Unsecured and USD flows

### Stage 6: Reference Details (7.6)

**Fields:**
- Reference 1 (required)
  - Name (text, required)
  - Relationship (select, required)
  - Phone (phone, required)
  - Email (email, required)
- Reference 2 (required, same as above)
- Reference 3 (optional, same as above)

**Validations:**
- Minimum 2 references required
- Email format per reference

### Stage 7: Academic History (7.7)

**Fields:**
- 10th Grade: School, Board, Year, Percentage
- 12th Grade: School, Board, Year, Percentage
- UG: University, Course, Year, Percentage
- PG: University, Course, Year, Percentage
- Work Experience (repeatable): Company, Role, Years Worked
- Test Scores (repeatable): Test Name, Score, Year

**Layout:**
- Collapsible sections for each education level
- Repeatable entries for work experience and test scores

### Stage 8: Financial Details (7.8)

**Fields:**
- Applicant Annual Gross Income (number, required)
- Monthly Income (number, required)
- Savings Account Balance (number, required)
- Investments (number, required)
- Liabilities (number, required)
- Credit Score (number, required)
- Family Annual Income (number, optional)
- Debt to Income Ratio (read-only, calculated)
- Bank Statement Proof (checkbox)

**Co-Applicant Fields (if applicable):**
- Same fields as above

### Stage 9: Collateral Details (7.9)

**Conditional:** INR_Secured flow only

**Fields:**
- Collateral Type (select, required)
- Estimated Value (number, required)
- Location (text, required)
- Existing Liens or Mortgages (text, optional)

### Stage 10: Document Checklist (7.10)

**Layout:**
- List of required documents per flow
- Upload status per document
- File upload UI with drag-and-drop
- Document preview

**Fields:**
- Document upload with file validation
- File type validation (PDF, JPG, JPEG, PNG)
- File size validation (max 10MB)

### Stage 11: Provider Selection (7.11)

**Layout:**
- List of eligible providers as cards
- Provider details: name, logo, rate, fee, features, processing time
- Radio button selection
- Provider-specific document checklist update

**Filtering:**
- Based on loanProductFlow
- Based on applicant profile (income, credit score, etc.)

## Validation Patterns

### Simple Required Field

```typescript
{
  name: 'fieldName',
  label: 'Field Label',
  type: 'text',
  required: true,
}
```

### With Custom Validation

```typescript
{
  name: 'email',
  label: 'Email',
  type: 'email',
  required: true,
  validation: (value) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(value)) {
      return 'Please enter a valid email';
    }
    return null;
  },
}
```

### With Constraints

```typescript
{
  name: 'intakeYear',
  label: 'Intake Year',
  type: 'number',
  required: true,
  minValue: new Date().getFullYear(),
  hint: 'Must be current year or later',
}
```

### Auto-Populated From LeadProfile

```typescript
{
  name: 'fullName',
  label: 'Full Name',
  type: 'text',
  required: true,
  autoPopulated: true,  // Will show blue badge
}
```

## Adding a New Stage

### Step 1: Create Component File

```bash
touch src/components/stages/MyNewStage.tsx
```

### Step 2: Implement Component

```typescript
import React from 'react';
import GenericStageForm, { StageFormConfig } from '../GenericStageForm';

interface MyNewStageProps {
  formData: Record<string, any>;
  validationErrors: Record<string, string>;
  onFieldChange: (fieldName: string, value: any) => void;
  onValidationChange?: (isValid: boolean) => void;
}

const MyNewStage: React.FC<MyNewStageProps> = ({ /* props */ }) => {
  const config: StageFormConfig = {
    stageName: 'My New Stage',
    description: 'Description of what to fill here...',
    fields: [
      // Add fields here
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

export default MyNewStage;
```

### Step 3: Add to StageRouter

Edit `StageRouter.tsx`:

```typescript
case 'My New Stage':
  return (
    <MyNewStage
      formData={formData}
      validationErrors={validationErrors}
      onFieldChange={onFieldChange}
      onValidationChange={onValidationChange}
    />
  );
```

### Step 4: Import Component

```typescript
import MyNewStage from './MyNewStage';
```

### Step 5: Add Stage Name to Flow

Edit `src/components/EducationLoanJourneyPage.tsx` and add the stage to the appropriate `getStages()` flow.

## Best Practices

### ✅ Do

- Use GenericStageForm for consistent UI
- Provide helpful hint text for complex fields
- Mark auto-populated fields with `autoPopulated: true`
- Use multi-select for fields with multiple valid options
- Provide clear placeholder text
- Use appropriate field types (email, phone, date, etc.)
- Group related fields logically
- Add validation for specific formats (email, phone, etc.)

### ❌ Don't

- Create custom form markup when GenericStageForm can be used
- Mix custom components with generic stages without clear reason
- Leave required fields without clear indication
- Use select for fields with only 2 options (use checkbox instead)
- Forget to export default the component
- Hardcode field values (use form data from parent)

## Testing

### Test Coverage

Each stage should be tested for:
- ✅ All fields render correctly
- ✅ Validation works for each field
- ✅ Required fields block progression
- ✅ Optional fields allow progression
- ✅ Auto-populated fields show badge
- ✅ Error messages display on validation failure
- ✅ Form clears errors on valid input

### Example Test

```typescript
describe('ApplicantProfileStage', () => {
  it('should require all required fields', () => {
    // Test required field validation
  });

  it('should validate email format', () => {
    // Test email validation
  });

  it('should display auto-populated badge', () => {
    // Test badge rendering
  });
});
```

## Troubleshooting

### Form not validating?
- Check that `onValidationChange` prop is being called
- Verify field names match between config and formData
- Check validation functions return null for valid, string for errors

### Fields not pre-populating?
- Ensure `autoPopulated: true` is set in config
- Check that formData contains the field value
- Verify field name matches formData key

### Stage not routing?
- Add case to StageRouter switch statement
- Import the component at top of file
- Verify stage name matches exactly (case-sensitive)

## References

- GenericStageForm: `src/components/GenericStageForm.tsx`
- Stage Config: `src/config/educationLoanStages.ts`
- Main Page: `src/components/EducationLoanJourneyPage.tsx`
- Example: `src/components/stages/ApplicantProfileStage.tsx`
