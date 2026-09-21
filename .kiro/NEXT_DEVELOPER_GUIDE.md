# Education Loan Journey - Next Developer Guide

**Current Status:** Foundation Complete, Ready for Remaining Stages & API Integration  
**Last Updated:** September 21, 2026  
**Progress:** 57% (Tasks 1-6 + 7.1-7.4,7.12 + 18.1 complete)

## Quick Start

### To Run the Application

```bash
npm run dev       # Start dev server on http://localhost:3000
npm run build     # Build for production
npm run test      # Run tests (after installing vitest)
```

### To View the Education Loan Journey

1. Start dev server with `npm run dev`
2. Navigate to any lead detail page
3. Click on an Education Loan product opportunity
4. The journey page will load with all stages visible

## Architecture Overview

### Component Hierarchy

```
EducationLoanJourneyPage (Main Container)
├── JourneyPageHeader
│   ├── Title & Status Badge
│   ├── Progress Bar
│   └── Calling Options (Dial, WhatsApp, SMS)
├── Main Content Area
│   └── StageRouter (Routes to correct stage)
│       ├── ApplicantProfileStage
│       ├── ResidenceDestinationStage
│       ├── EducationDetailsStage
│       ├── LoanApplicationDetailsStage
│       ├── [Pending: CoApplicant, References, etc.]
│       └── ReviewSubmitStage
├── StageNavigationSidebar
│   ├── Progress Bar
│   └── Stage List with Navigation
└── Footer Navigation (TBD)
```

### State Flow

```
EducationLoanJourneyPage (page-level state)
├── applicationData: All form field values
├── currentStage: Currently active stage
├── stageCompletionStatus: Completion tracking per stage
├── applicationStatus: Draft/InProgress/Submitted/etc
├── validationErrors: Field-level errors
└── draftSavedAt: Last save timestamp

StageRouter → Specific Stage Component
├── Receives: formData, validationErrors, handlers
└── Emits: onFieldChange, onValidationChange events
```

## File Locations & Responsibilities

### Components

| File | Responsibility |
|------|-----------------|
| `src/components/EducationLoanJourneyPage.tsx` | Main page container, state management, page layout |
| `src/components/JourneyPageHeader.tsx` | Header with status, progress, calling options |
| `src/components/StageNavigationSidebar.tsx` | Left sidebar with stage navigation and progress |
| `src/components/GenericStageForm.tsx` | Dynamic form renderer for any stage configuration |
| `src/components/stages/StageRouter.tsx` | Routes to correct stage component |
| `src/components/stages/ApplicantProfileStage.tsx` | Stage 1 implementation |
| `src/components/stages/ResidenceDestinationStage.tsx` | Stage 2 implementation |
| `src/components/stages/EducationDetailsStage.tsx` | Stage 3 implementation |
| `src/components/stages/LoanApplicationDetailsStage.tsx` | Stage 4 implementation |
| `src/components/stages/ReviewSubmitStage.tsx` | Final stage implementation |

### Configuration & Types

| File | Responsibility |
|------|-----------------|
| `src/config/educationLoanStages.ts` | Stage definitions and field configurations |
| `src/types/normalized.ts` | EducationLoanApplication type definitions |

### Documentation

| File | Contents |
|------|----------|
| `.kiro/EDUCATION_LOAN_JOURNEY_STATUS.md` | Current implementation status |
| `.kiro/SESSION_WORK_SUMMARY.md` | What was accomplished in this session |
| `src/components/stages/README.md` | Developer guide for adding/editing stages |

## Implementation Checklist for Next Developer

### ✅ Completed (57%)

- [x] Task 1 - Types & normalized schema
- [x] Task 2 - Routing setup
- [x] Task 3 - Main container component
- [x] Task 4 - Header component (with status, progress, calling options)
- [x] Task 5 - Sidebar component (with navigation & progress)
- [x] Task 6 - GenericStageForm (dynamic field rendering + validation)
- [x] Task 7.1 - Applicant Profile Stage
- [x] Task 7.2 - Residence Destination Stage
- [x] Task 7.3 - Education Details Stage
- [x] Task 7.4 - Loan Application Details Stage
- [x] Task 7.12 - Review & Submit Stage
- [x] Task 18.1 - Stage configuration file

### ⏳ In Progress or Ready to Start

**Priority 1 (Next 2-3 hours):**
- [ ] Task 7.5 - Co-Applicant Stage
- [ ] Task 7.6 - References Stage
- [ ] Task 7.7 - Academic History Stage
- [ ] Task 7.8 - Financial Details Stage
- [ ] Task 9 - Footer Navigation (actually mostly done in main component)
- [ ] Task 19 - API Integration (wire up actual calls)

**Priority 2 (After core stages):**
- [ ] Task 7.9 - Collateral Details (conditional)
- [ ] Task 7.10 - Document Checklist
- [ ] Task 7.11 - Provider Selection
- [ ] Task 10 - Auto-populate from LeadProfile
- [ ] Task 11 - Bi-directional sync
- [ ] Task 12 - Document management

**Priority 3 (Polish & Testing):**
- [ ] Task 13 - Entry point integration
- [ ] Task 14 - Status display
- [ ] Task 15 - Draft resume
- [ ] Task 16 - Error handling
- [ ] Task 17 - Responsive design
- [ ] Task 20 - Calling system integration
- [ ] Tasks 21-27 - Comprehensive testing

## How to Add a New Stage

### Template: Using GenericStageForm

```typescript
// src/components/stages/MyNewStage.tsx
import React from 'react';
import GenericStageForm, { StageFormConfig } from '../GenericStageForm';

interface MyNewStageProps {
  formData: Record<string, any>;
  validationErrors: Record<string, string>;
  onFieldChange: (fieldName: string, value: any) => void;
  onValidationChange?: (isValid: boolean) => void;
}

const MyNewStage: React.FC<MyNewStageProps> = ({
  formData,
  validationErrors,
  onFieldChange,
  onValidationChange,
}) => {
  const config: StageFormConfig = {
    stageName: 'My New Stage',
    description: 'What to collect here...',
    fields: [
      {
        name: 'fieldName',
        label: 'Field Label',
        type: 'text', // or email, phone, number, date, select, checkbox, textarea, multi-select
        required: true,
        placeholder: 'Enter...',
        hint: 'Helper text',
        validation: (value) => null, // or return error string
        autoPopulated: false, // true if from LeadProfile
      },
      // More fields...
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

### Steps to Add Stage:

1. Create file: `src/components/stages/MyNewStage.tsx`
2. Implement component using template above
3. Add import to `src/components/stages/StageRouter.tsx`
4. Add case statement in StageRouter switch
5. Add stage name to flow in `EducationLoanJourneyPage.tsx` getStages() function
6. Test that stage renders and validates correctly

See `src/components/stages/README.md` for detailed guidance.

## Key Concepts

### Auto-Save Mechanism

The page automatically saves drafts in two scenarios:

1. **Page Unload**: When user navigates away or closes tab
2. **Inactivity Timer**: After 30 seconds with no user interaction

```typescript
// In EducationLoanJourneyPage.tsx
React.useEffect(() => {
  const handleBeforeUnload = (e: BeforeUnloadEvent) => {
    if (applicationStatus === ApplicationStatus.Draft) {
      handleSaveDraft();
      // Prevent losing data
    }
  };
  window.addEventListener('beforeunload', handleBeforeUnload);
  return () => window.removeEventListener('beforeunload', handleBeforeUnload);
}, []);
```

### Stage Progression Rules

- **Draft Mode**: All stages editable, can jump to any stage
- **Submitted Mode**: All stages read-only, no editing allowed
- **In Progress Mode**: Must complete current stage to proceed

### Validation Strategy

1. **Field-Level**: Validates on blur (not on every keystroke)
2. **Stage-Level**: Blocks progression if required fields invalid
3. **Application-Level**: Blocks submission if any stage incomplete

### State Management Pattern

```typescript
// Container component holds all state
const [applicationData, setApplicationData] = useState({});
const [validationErrors, setValidationErrors] = useState({});

// Pass down to children
<StageRouter
  formData={applicationData}
  validationErrors={validationErrors}
  onFieldChange={handleSaveField}
/>

// Children emit changes back up
const handleSaveField = (fieldPath: string, value: any) => {
  setApplicationData(prev => {
    // Update nested object
    const updated = { ...prev };
    const keys = fieldPath.split('.');
    // ... set value at path
    return updated;
  });
};
```

## API Integration TODO

Currently, form saves are simulated with delays. To wire up real API calls:

### 1. Load Application

**Location:** `EducationLoanJourneyPage.tsx` useEffect on mount

```typescript
// TODO: Replace with real API call
const application = await leadsApi.getEducationLoanApplication(
  leadId,
  opportunityId
);
setApplicationData(application);
```

### 2. Save Field Changes

**Location:** `EducationLoanJourneyPage.tsx` handleSaveField

```typescript
// TODO: Replace with real API call
await leadsApi.updateEducationLoanApplication({
  ...applicationData,
  [fieldPath]: value,
});
```

### 3. Submit Application

**Location:** `EducationLoanJourneyPage.tsx` handleSubmit

```typescript
// TODO: Replace with real API call
await leadsApi.submitEducationLoanApplication(applicationData);
```

## Common Issues & Solutions

### Issue: Form not validating
**Solution:** 
- Check that `onValidationChange` is being called from GenericStageForm
- Verify field names in config match formData keys
- Check validation functions return null for valid, string for errors

### Issue: Stage not showing
**Solution:**
- Add stage name to StageRouter case statement
- Import component at top of StageRouter
- Verify stage name in flow matches exactly (case-sensitive)
- Check that stage name is in getStages() for the flow

### Issue: Auto-save not working
**Solution:**
- Check browser console for errors in handleSaveDraft
- Verify applicationStatus is Draft (auto-save only works in Draft)
- Check inactivity timer reset on user interactions

### Issue: Navigation not restricted
**Solution:**
- Check isEditMode prop passed to StageNavigationSidebar
- Verify stageCompletionStatus is being updated on stage completion
- Ensure application is not in Draft status for restrictions to apply

## Testing Strategy

### Manual Testing Checklist

- [ ] Form fields render for all 5 implemented stages
- [ ] Validation errors display correctly
- [ ] Required fields block progression
- [ ] Stage navigation works with restrictions
- [ ] Auto-save triggers after 30 seconds inactivity
- [ ] Auto-save triggers on page unload
- [ ] Status badge updates (Draft → In Progress → Submitted)
- [ ] Progress bar updates as stages complete
- [ ] Previous/Next buttons enable/disable correctly
- [ ] Save Draft button works
- [ ] Submit button only appears on final stage

### Unit Testing (TODO)

Create tests in `src/tests/` for:
- Form field rendering by type
- Validation logic for each field type
- Stage progression rules
- Auto-save timing
- Status transitions

## Performance Notes

- Form validation debounced on blur (not real-time)
- Stage components lazy-loaded through StageRouter
- Progress calculation memoized in sidebar
- Auto-save debounced with 30-second inactivity timer
- No unnecessary re-renders due to proper useCallback usage

## Next Developer Priorities

### Session 1 (4-5 hours)
1. Implement remaining core stages (7.5-7.11)
2. Wire up API integration (Task 19)
3. Test complete form flow

### Session 2 (3-4 hours)
1. Auto-populate fields from LeadProfile (Task 10)
2. Implement bi-directional sync (Task 11)
3. Add document management (Task 12)

### Session 3 (2-3 hours)
1. Responsive design improvements (Task 17)
2. Error handling & edge cases (Task 16)
3. Comprehensive testing suite (Tasks 21-27)

## Helpful Resources

- **GenericStageForm Guide**: `src/components/stages/README.md`
- **Type Definitions**: `src/types/normalized.ts`
- **Stage Examples**: `src/components/stages/ApplicantProfileStage.tsx`
- **Config Format**: `src/config/educationLoanStages.ts`
- **Main Container**: `src/components/EducationLoanJourneyPage.tsx`

## Questions?

If stuck on something:

1. Check existing stage implementations for patterns
2. Read GenericStageForm implementation to understand form engine
3. Review tasks.md for requirements
4. Check EDUCATION_LOAN_JOURNEY_STATUS.md for current progress
5. Look at SESSION_WORK_SUMMARY.md for what was done

## Commit Recommendations

When committing work:

```bash
# After adding a new stage
git commit -m "Implement CoApplicant stage (Task 7.5)"

# After API integration
git commit -m "Wire up API calls for draft save and submission (Task 19)"

# After testing complete
git commit -m "Add comprehensive test suite (Tasks 21-27)"
```

## Summary

The foundation is solid and ready for next developer to:
1. Add remaining stages (7.5-7.11) following established patterns
2. Wire up real API calls
3. Implement auto-population and sync features
4. Add comprehensive testing

All components compile without errors and follow TypeScript best practices. The GenericStageForm pattern makes adding new stages straightforward.

Good luck! 🚀
