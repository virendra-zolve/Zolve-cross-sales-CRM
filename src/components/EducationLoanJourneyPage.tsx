import React, { useCallback, useRef, useState } from 'react';
import { AlertCircle } from 'lucide-react';
import { StudentLead } from '../types';
import {
  LoanProductFlow,
  ApplicationStatus,
  StageCompletionStatus,
} from '../types/normalized';
import JourneyPageHeader from './JourneyPageHeader';
import StageNavigationSidebar from './StageNavigationSidebar';
import StageRouter from './stages/StageRouter';

// Get stages based on loan product flow
const getStages = (flow: LoanProductFlow): string[] => {
  const stageNames: Record<LoanProductFlow, string[]> = {
    [LoanProductFlow.INR_Unsecured]: [
      'Applicant Profile',
      'Residence & Destination',
      'Education Details',
      'Loan Application Details',
      'References',
      'Academic History',
      'Financial Details',
      'Document Checklist',
      'Provider Selection',
      'Review & Submit',
    ],
    [LoanProductFlow.INR_Secured]: [
      'Applicant Profile',
      'Residence & Destination',
      'Education Details',
      'Loan Application Details',
      'Co-Applicant Details',
      'References',
      'Academic History',
      'Financial Details',
      'Collateral Details',
      'Document Checklist',
      'Provider Selection',
      'Review & Submit',
    ],
    [LoanProductFlow.US_Cosigner]: [
      'Applicant Profile',
      'Residence & Destination',
      'Education Details',
      'Loan Application Details',
      'Co-Applicant Details',
      'References',
      'Academic History',
      'Financial Details',
      'Document Checklist',
      'Provider Selection',
      'Review & Submit',
    ],
    [LoanProductFlow.USD_NoCoSigner_Prodigy]: [
      'Applicant Profile',
      'Residence & Destination',
      'Education Details',
      'Loan Application Details',
      'References',
      'Academic History',
      'Financial Details',
      'Document Checklist',
      'Provider Selection',
      'Review & Submit',
    ],
    [LoanProductFlow.USD_NoCoSigner_MPower]: [
      'Applicant Profile',
      'Residence & Destination',
      'Education Details',
      'Loan Application Details',
      'References',
      'Academic History',
      'Financial Details',
      'Document Checklist',
      'Provider Selection',
      'Review & Submit',
    ],
  };
  return stageNames[flow];
};

interface EducationLoanJourneyPageProps {
  lead: StudentLead;
  opportunityId: string;
  applicationId?: string;
  loanProductFlow?: LoanProductFlow;
  onBack: () => void;
}

/**
 * EducationLoanJourneyPage
 * 
 * Main container component for the education loan journey - a full-screen,
 * multi-stage application form experience. Handles page-level state management,
 * auto-save, stage progression, and integration with the API.
 */
const EducationLoanJourneyPage: React.FC<EducationLoanJourneyPageProps> = ({
  lead,
  opportunityId,
  applicationId,
  loanProductFlow = LoanProductFlow.INR_Unsecured,
  onBack,
}) => {
  // ============================================================================
  // STATE MANAGEMENT
  // ============================================================================

  // Application data
  const [applicationData, setApplicationData] = useState<any>({
    loanProductFlow,
    applicationStatus: ApplicationStatus.Draft,
  });
  const stages = getStages(loanProductFlow);
  const [currentStage, setCurrentStage] = useState<string>(stages[0] || 'Applicant Profile');
  const [stageCompletionStatus, setStageCompletionStatus] = useState<StageCompletionStatus>({});
  const [applicationStatus, setApplicationStatus] = useState<ApplicationStatus>(ApplicationStatus.Draft);

  // Validation & errors
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});
  const [stageErrors, setStageErrors] = useState<string[]>([]);
  const [stageIsValid, setStageIsValid] = useState(false);

  // Loading & error states
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');

  // Draft tracking
  const [draftSavedAt, setDraftSavedAt] = useState<string | null>(null);
  const inactivityTimerRef = useRef<NodeJS.Timeout | null>(null);
  const lastInteractionRef = useRef<number>(Date.now());

  // ============================================================================
  // AUTO-SAVE & INACTIVITY LOGIC
  // ============================================================================

  /**
   * Auto-save on page unload
   */
  React.useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (applicationStatus === ApplicationStatus.Draft && applicationData) {
        handleSaveDraft();
        e.preventDefault();
        e.returnValue = '';
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [applicationStatus, applicationData]);

  /**
   * Inactivity timer - auto-save after 30 seconds of no activity
   */
  React.useEffect(() => {
    const resetInactivityTimer = () => {
      lastInteractionRef.current = Date.now();

      if (inactivityTimerRef.current) {
        clearTimeout(inactivityTimerRef.current);
      }

      inactivityTimerRef.current = setTimeout(() => {
        if (applicationStatus === ApplicationStatus.Draft) {
          handleSaveDraft();
        }
      }, 30000);
    };

    const events = ['click', 'keydown', 'scroll', 'change', 'input'];
    events.forEach(event => {
      document.addEventListener(event, resetInactivityTimer);
    });

    return () => {
      events.forEach(event => {
        document.removeEventListener(event, resetInactivityTimer);
      });
      if (inactivityTimerRef.current) {
        clearTimeout(inactivityTimerRef.current);
      }
    };
  }, [applicationStatus]);

  // ============================================================================
  // HANDLERS
  // ============================================================================

  /**
   * Save a single field to application data
   */
  const handleSaveField = useCallback((fieldPath: string, value: any) => {
    setApplicationData(prev => {
      const updated = { ...prev };
      const keys = fieldPath.split('.');
      let current: any = updated;

      for (let i = 0; i < keys.length - 1; i++) {
        if (!current[keys[i]]) {
          current[keys[i]] = {};
        }
        current = current[keys[i]];
      }

      current[keys[keys.length - 1]] = value;
      return updated;
    });

    if (applicationStatus === ApplicationStatus.Draft) {
      setApplicationStatus(ApplicationStatus.InProgress);
    }

    lastInteractionRef.current = Date.now();
  }, [applicationStatus]);

  /**
   * Handle field validation changes
   */
  const handleValidationChange = useCallback((isValid: boolean) => {
    setStageIsValid(isValid);
  }, []);

  /**
   * Move to next stage with validation
   */
  const handleNextStage = useCallback(() => {
    if (!stageIsValid) {
      setStageErrors(['Please complete all required fields before proceeding']);
      return;
    }

    const currentIndex = stages.indexOf(currentStage);
    if (currentIndex < stages.length - 1) {
      const nextStage = stages[currentIndex + 1];
      
      // Mark current stage as completed
      setStageCompletionStatus(prev => ({
        ...prev,
        [currentStage]: {
          ...prev[currentStage],
          completed: true,
          completedAt: new Date().toISOString(),
        },
      }));

      setCurrentStage(nextStage);
      setStageErrors([]);
      lastInteractionRef.current = Date.now();
    }
  }, [stages, currentStage, stageIsValid]);

  /**
   * Move to previous stage
   */
  const handlePreviousStage = useCallback(() => {
    const currentIndex = stages.indexOf(currentStage);
    if (currentIndex > 0) {
      const prevStage = stages[currentIndex - 1];
      setCurrentStage(prevStage);
      setStageErrors([]);
    }
  }, [stages, currentStage]);

  /**
   * Save current draft
   */
  const handleSaveDraft = useCallback(async () => {
    setSaveStatus('saving');

    try {
      // TODO: Call leadsApi to save draft once API methods are implemented
      // For now, simulate with a short delay
      await new Promise(resolve => setTimeout(resolve, 300));
      
      setDraftSavedAt(new Date().toISOString());
      setSaveStatus('saved');
      setTimeout(() => setSaveStatus('idle'), 2000);
    } catch (err) {
      setSaveStatus('error');
      setError(err instanceof Error ? err.message : 'Failed to save draft');
    }
  }, []);

  /**
   * Submit application
   */
  const handleSubmit = useCallback(async () => {
    // Validate all stages before submit
    if (!stages.every(stage => stageCompletionStatus[stage]?.completed)) {
      setStageErrors(['Please complete all stages before submitting']);
      return;
    }

    setSaveStatus('saving');

    try {
      // TODO: Call leadsApi to submit once API methods are implemented
      await new Promise(resolve => setTimeout(resolve, 300));
      
      setApplicationStatus(ApplicationStatus.Submitted);
      setSaveStatus('saved');
    } catch (err) {
      setSaveStatus('error');
      setError(err instanceof Error ? err.message : 'Failed to submit');
    }
  }, [stages, stageCompletionStatus]);

  /**
   * Handle calling options
   */
  const handleCall = useCallback((type: 'dial' | 'whatsapp' | 'sms') => {
    // TODO: Integrate with existing calling system from LeadCallingSection
    console.log(`Call type: ${type}, Lead: ${lead.studentName}`);
  }, [lead.studentName]);

  // ============================================================================
  // RENDER
  // ============================================================================

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="text-center space-y-4">
          <div className="w-12 h-12 border-4 border-slate-200 border-t-blue-500 rounded-full animate-spin mx-auto" />
          <p className="text-sm text-slate-600">Loading education loan application...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="max-w-md w-full bg-white rounded-xl border border-slate-200 p-6 text-center space-y-4">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto" />
          <h2 className="text-lg font-semibold text-slate-900">Error</h2>
          <p className="text-sm text-slate-600">{error}</p>
          <button
            onClick={onBack}
            className="px-4 py-2 bg-blue-600 text-white text-xs font-semibold rounded-lg hover:bg-blue-700 transition-colors"
          >
            Back to Lead Detail
          </button>
        </div>
      </div>
    );
  }

  const currentIndex = stages.indexOf(currentStage);

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      {/* HEADER */}
      <JourneyPageHeader
        applicantName={lead.studentName}
        loanProductFlow={loanProductFlow}
        applicationStatus={applicationStatus}
        currentStageIndex={currentIndex}
        totalStages={stages.length}
        onBack={onBack}
        onCall={handleCall}
      />

      {/* MAIN CONTENT */}
      <div className="flex-1 flex gap-4 max-w-7xl mx-auto w-full px-4 py-4 sm:px-6">
        {/* SIDEBAR */}
        <StageNavigationSidebar
          stages={stages}
          currentStage={currentStage}
          stageCompletionStatus={stageCompletionStatus}
          onStageSelect={setCurrentStage}
          isEditMode={applicationStatus === ApplicationStatus.Draft}
        />

        {/* MAIN CONTENT */}
        <div className="flex-1 min-w-0">
          <div className="bg-white border border-slate-200 rounded-xl p-6 sm:p-8">
            <StageRouter
              stageName={currentStage}
              formData={applicationData}
              validationErrors={validationErrors}
              onFieldChange={handleSaveField}
              onValidationChange={handleValidationChange}
            />

            {stageErrors.length > 0 && (
              <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-xs font-semibold text-red-900 mb-1">Validation Errors:</p>
                <ul className="text-xs text-red-800 space-y-0.5">
                  {stageErrors.map((err, i) => (
                    <li key={i}>• {err}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>

        {/* RIGHT SIDEBAR */}
        <div className="w-48 hidden xl:block flex-shrink-0">
          <div className="bg-white border border-slate-200 rounded-xl p-4 sticky top-20 space-y-3">
            <div>
              <p className="text-xs font-semibold text-slate-600 mb-1">Applicant</p>
              <p className="text-xs font-bold text-slate-900">{lead.studentName}</p>
            </div>
            <div>
              <p className="text-xs font-semibold text-slate-600 mb-1">Email</p>
              <p className="text-xs text-slate-700 truncate">{lead.email || 'N/A'}</p>
            </div>
            <div>
              <p className="text-xs font-semibold text-slate-600 mb-1">Phone</p>
              <p className="text-xs text-slate-700">{lead.mobileNumber}</p>
            </div>
            {draftSavedAt && (
              <div className="pt-3 border-t border-slate-200">
                <p className="text-xs text-slate-500">
                  Last saved: {new Date(draftSavedAt).toLocaleTimeString()}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* FOOTER */}
      <div className="sticky bottom-0 z-20 bg-white border-t border-slate-200 shadow-lg">
        <div className="max-w-7xl mx-auto px-4 py-3 sm:px-6 flex items-center justify-between gap-3">
          <button
            onClick={handlePreviousStage}
            disabled={currentIndex === 0}
            className="px-4 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg transition-colors"
          >
            ← Previous
          </button>

          <div className="flex-1" />

          <button
            onClick={handleSaveDraft}
            disabled={isSaving}
            className={`px-4 py-2 text-xs font-semibold rounded-lg transition-colors ${
              saveStatus === 'saved'
                ? 'bg-green-50 text-green-700'
                : saveStatus === 'error'
                ? 'bg-red-50 text-red-700'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            {saveStatus === 'saving' ? '💾 Saving...' : saveStatus === 'saved' ? '✓ Draft Saved' : '💾 Save Draft'}
          </button>

          {currentIndex < stages.length - 1 && (
            <button
              onClick={handleNextStage}
              disabled={isSaving || !stageIsValid}
              className="px-4 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg transition-colors"
            >
              Next →
            </button>
          )}

          {currentIndex === stages.length - 1 && (
            <button
              onClick={handleSubmit}
              disabled={isSaving || applicationStatus === ApplicationStatus.Submitted}
              className="px-4 py-2 text-xs font-semibold text-white bg-green-600 hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg transition-colors"
            >
              {applicationStatus === ApplicationStatus.Submitted ? '✓ Submitted' : '🚀 Submit Application'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default EducationLoanJourneyPage;
