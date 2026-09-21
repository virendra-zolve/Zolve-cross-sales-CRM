import React, { useState, useEffect, useCallback, useRef } from 'react';
import { LeadMaster, EducationLoanApplication, LoanProductFlow, ApplicationStatus, StageCompletionStatus } from '../types/normalized';
import { LeadsDatabase } from '../api/leadsApi';
import { ArrowLeft, AlertCircle, CheckCircle2, Clock } from 'lucide-react';

interface EducationLoanJourneyPageProps {
  lead: LeadMaster;
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
 * auto-save, stage progression, and integration with the LeadsDatabase API.
 * 
 * Layout:
 * - Sticky header with back button, applicant info, status, progress, calling options
 * - Sidebar navigation showing all stages with completion indicators
 * - Main content area showing current stage form
 * - Footer with Previous/Next/Save/Submit buttons
 * 
 * State Management:
 * - currentStage: which stage user is on
 * - applicationData: form data for all stages
 * - validationErrors: per-field validation state
 * - applicationStatus: Draft/InProgress/Submitted/etc
 * - loading/error states
 * - auto-save timer and draft tracking
 */
export const EducationLoanJourneyPage: React.FC<EducationLoanJourneyPageProps> = ({
  lead,
  opportunityId,
  applicationId,
  loanProductFlow,
  onBack,
}) => {
  // ============================================================================
  // STATE MANAGEMENT
  // ============================================================================

  // Application data
  const [application, setApplication] = useState<EducationLoanApplication | null>(null);
  const [applicationData, setApplicationData] = useState<Partial<EducationLoanApplication>>({});
  const [currentStage, setCurrentStage] = useState<string>('');
  const [stageCompletionStatus, setStageCompletionStatus] = useState<StageCompletionStatus>({});
  const [applicationStatus, setApplicationStatus] = useState<ApplicationStatus>(ApplicationStatus.Draft);

  // Validation & errors
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});
  const [stageErrors, setStageErrors] = useState<string[]>([]);

  // Loading & error states
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');

  // Draft tracking
  const [draftSavedAt, setDraftSavedAt] = useState<string | null>(null);
  const autoSaveTimerRef = useRef<NodeJS.Timeout | null>(null);
  const inactivityTimerRef = useRef<NodeJS.Timeout | null>(null);
  const lastInteractionRef = useRef<number>(Date.now());

  // ============================================================================
  // INITIALIZATION
  // ============================================================================

  /**
   * Load application on mount or when applicationId changes
   * If no application exists, create a new one
   */
  useEffect(() => {
    const loadApplication = async () => {
      try {
        setIsLoading(true);
        setError(null);

        let app: EducationLoanApplication | null = null;

        if (applicationId) {
          // Load existing application
          app = LeadsDatabase.getEducationLoanApplication(applicationId);
          if (!app) {
            setError('Application not found');
            setIsLoading(false);
            return;
          }
        } else if (loanProductFlow) {
          // Create new application with specified flow
          const result = LeadsDatabase.createEducationLoanApplication(
            lead.leadId,
            opportunityId,
            loanProductFlow
          );
          if (!result.success || !result.application) {
            setError(result.error || 'Failed to create application');
            setIsLoading(false);
            return;
          }
          app = result.application;
        } else {
          // No application ID or flow specified - error
          setError('No application context provided');
          setIsLoading(false);
          return;
        }

        // Populate state from loaded/created application
        setApplication(app);
        setApplicationData(app);
        setCurrentStage(app.currentStage || getFirstStage(app.loanProductFlow));
        setStageCompletionStatus(app.stageCompletionStatus || {});
        setApplicationStatus(app.applicationStatus);
        setDraftSavedAt(app.draftSavedAt || null);

        setIsLoading(false);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load application');
        setIsLoading(false);
      }
    };

    loadApplication();
  }, [applicationId, loanProductFlow, lead.leadId, opportunityId]);

  // ============================================================================
  // AUTO-SAVE & INACTIVITY LOGIC
  // ============================================================================

  /**
   * Auto-save on page unload
   */
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (applicationStatus === ApplicationStatus.Draft && applicationData) {
        handleSaveDraft();
        // Show warning to user
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
  useEffect(() => {
    const resetInactivityTimer = () => {
      lastInteractionRef.current = Date.now();

      // Clear existing timer
      if (inactivityTimerRef.current) {
        clearTimeout(inactivityTimerRef.current);
      }

      // Set new 30-second timer
      inactivityTimerRef.current = setTimeout(() => {
        if (applicationStatus === ApplicationStatus.Draft) {
          handleSaveDraft();
        }
      }, 30000); // 30 seconds
    };

    // Listen for user interaction
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
   * Triggers auto-save mechanism
   */
  const handleSaveField = useCallback((fieldPath: string, value: any) => {
    setApplicationData(prev => {
      const updated = { ...prev };
      const keys = fieldPath.split('.');
      let current: any = updated;

      // Navigate to nested object
      for (let i = 0; i < keys.length - 1; i++) {
        if (!current[keys[i]]) {
          current[keys[i]] = {};
        }
        current = current[keys[i]];
      }

      // Set value
      current[keys[keys.length - 1]] = value;
      return updated;
    });

    // Update application status if still Draft
    if (applicationStatus === ApplicationStatus.Draft) {
      setApplicationStatus(ApplicationStatus.InProgress);
    }

    // Reset last interaction time for inactivity timer
    lastInteractionRef.current = Date.now();
  }, [applicationStatus]);

  /**
   * Move to next stage with validation
   */
  const handleNextStage = useCallback(async () => {
    try {
      // Validate current stage before moving
      const validation = await validateCurrentStage(currentStage);
      if (!validation.isValid) {
        setStageErrors(validation.errors);
        return;
      }

      // Update stage completion status
      const updated = {
        ...stageCompletionStatus,
        [currentStage]: {
          completed: true,
          completedAt: new Date().toISOString(),
          validationErrors: [],
        },
      };
      setStageCompletionStatus(updated);

      // Move to next stage
      const nextStage = getNextStage(currentStage, application?.loanProductFlow || LoanProductFlow.INR_Unsecured);
      if (nextStage) {
        setCurrentStage(nextStage);
        setStageErrors([]);
      }

      // Save progress
      await handleSaveDraft();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to proceed to next stage');
    }
  }, [currentStage, stageCompletionStatus, application, applicationData]);

  /**
   * Move to previous stage (always allowed, no validation)
   */
  const handlePreviousStage = useCallback(() => {
    const prevStage = getPreviousStage(currentStage, application?.loanProductFlow || LoanProductFlow.INR_Unsecured);
    if (prevStage) {
      setCurrentStage(prevStage);
      setStageErrors([]);
    }
  }, [currentStage, application]);

  /**
   * Save current draft
   * Updates draftSavedAt timestamp and shows feedback
   */
  const handleSaveDraft = useCallback(async () => {
    if (!application) return;

    try {
      setIsSaving(true);
      setSaveStatus('saving');

      // Prepare update with current data
      const updatePayload: Partial<EducationLoanApplication> = {
        ...applicationData,
        applicationStatus: ApplicationStatus.Draft,
        draftSavedAt: new Date().toISOString(),
        currentStage,
        stageCompletionStatus,
      };

      // Call API to update
      const result = LeadsDatabase.updateEducationLoanApplication(application.applicationId, updatePayload);

      if (!result.success) {
        setSaveStatus('error');
        setError(result.error || 'Failed to save draft');
        return;
      }

      // Update local state
      setDraftSavedAt(new Date().toISOString());
      setSaveStatus('saved');

      // Clear saved status after 2 seconds
      setTimeout(() => setSaveStatus('idle'), 2000);
    } catch (err) {
      setSaveStatus('error');
      setError(err instanceof Error ? err.message : 'Failed to save draft');
    } finally {
      setIsSaving(false);
    }
  }, [application, applicationData, currentStage, stageCompletionStatus]);

  /**
   * Submit application
   * Validates all stages and submits
   */
  const handleSubmit = useCallback(async () => {
    if (!application) return;

    try {
      setIsSaving(true);

      // Validate all stages
      const allValid = await validateAllStages();
      if (!allValid.isValid) {
        setStageErrors(allValid.errors);
        setError('Please complete all required fields before submitting');
        setIsSaving(false);
        return;
      }

      // Submit via API
      const result = LeadsDatabase.submitEducationLoanApplication(application.applicationId);

      if (!result.success) {
        setError(result.error || 'Failed to submit application');
        setIsSaving(false);
        return;
      }

      // Update state
      setApplicationStatus(ApplicationStatus.Submitted);
      setApplication(result.application || application);

      // Show success - would trigger success modal in real implementation
      console.log('Application submitted successfully');

      // Could navigate back after delay
      // setTimeout(onBack, 2000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to submit application');
    } finally {
      setIsSaving(false);
    }
  }, [application, applicationData]);

  // ============================================================================
  // VALIDATION HELPERS
  // ============================================================================

  const validateCurrentStage = async (stage: string): Promise<{ isValid: boolean; errors: string[] }> => {
    // TODO: Implement stage-specific validation
    // For now, return success
    return { isValid: true, errors: [] };
  };

  const validateAllStages = async (): Promise<{ isValid: boolean; errors: string[] }> => {
    // TODO: Implement full application validation
    // For now, return success
    return { isValid: true, errors: [] };
  };

  // ============================================================================
  // STAGE HELPER FUNCTIONS
  // ============================================================================

  const getFirstStage = (flow: LoanProductFlow): string => {
    // TODO: Get from stage config
    return 'Applicant Profile';
  };

  const getNextStage = (current: string, flow: LoanProductFlow): string | null => {
    // TODO: Get from stage config for this flow
    // For now, simple increment
    const stageIndex = getAllStages(flow).indexOf(current);
    const nextIndex = stageIndex + 1;
    return nextIndex < getAllStages(flow).length ? getAllStages(flow)[nextIndex] : null;
  };

  const getPreviousStage = (current: string, flow: LoanProductFlow): string | null => {
    // TODO: Get from stage config for this flow
    const stageIndex = getAllStages(flow).indexOf(current);
    const prevIndex = stageIndex - 1;
    return prevIndex >= 0 ? getAllStages(flow)[prevIndex] : null;
  };

  const getAllStages = (flow: LoanProductFlow): string[] => {
    // TODO: Get from stage config
    // Placeholder for all possible stages
    return [
      'Applicant Profile',
      'Education Details',
      'Residence & Destination',
      'Loan Application Details',
      'Co-Applicant Details',
      'References',
      'Academic History',
      'Financial Details',
      'Collateral Details',
      'Document Checklist',
      'Provider Selection',
      'Review & Submit',
    ];
  };

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

  if (error && !application) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="max-w-md w-full bg-white rounded-xl border border-slate-200 p-6 text-center space-y-4">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto" />
          <h2 className="text-lg font-semibold text-slate-900">Error Loading Application</h2>
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

  if (!application) {
    return null;
  }

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      {/* ========================================================================
          HEADER - Sticky, always visible
          ======================================================================== */}
      <div className="sticky top-0 z-30 bg-white border-b border-slate-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-3 sm:px-6 sm:py-4">
          {/* Header top row: Back button, Title, Status */}
          <div className="flex items-center justify-between mb-2 gap-4">
            <button
              onClick={onBack}
              className="flex items-center gap-2 px-3 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              Back
            </button>

            <div className="flex-1">
              <h1 className="text-sm font-bold text-slate-900">
                Education Loan Application
              </h1>
              <p className="text-xs text-slate-500 mt-0.5">
                Lead: {lead.studentName} | {application.loanProductFlow}
              </p>
            </div>

            {/* Status badge */}
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold rounded-full">
                {applicationStatus === ApplicationStatus.Draft && (
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-yellow-50 text-yellow-700 rounded-full text-xs font-semibold">
                    <Clock className="w-3.5 h-3.5" />
                    Draft
                  </span>
                )}
                {applicationStatus === ApplicationStatus.InProgress && (
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-blue-50 text-blue-700 rounded-full text-xs font-semibold">
                    <Clock className="w-3.5 h-3.5" />
                    In Progress
                  </span>
                )}
                {applicationStatus === ApplicationStatus.Submitted && (
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-green-50 text-green-700 rounded-full text-xs font-semibold">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    Submitted
                  </span>
                )}
              </span>
            </div>
          </div>

          {/* Header bottom row: Progress & Calling Options */}
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-3">
                <div className="text-xs font-semibold text-slate-600">
                  Stage {Object.keys(stageCompletionStatus).filter(s => stageCompletionStatus[s].completed).length + 1} of {getAllStages(application.loanProductFlow).length}
                </div>
                <div className="flex-1 max-w-xs h-2 bg-slate-200 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-blue-500 transition-all duration-300"
                    style={{
                      width: `${
                        (Object.keys(stageCompletionStatus).filter(s => stageCompletionStatus[s].completed).length /
                          getAllStages(application.loanProductFlow).length) *
                        100
                      }%`,
                    }}
                  />
                </div>
                <div className="text-xs text-slate-500">
                  {Math.round(
                    (Object.keys(stageCompletionStatus).filter(s => stageCompletionStatus[s].completed).length /
                      getAllStages(application.loanProductFlow).length) *
                      100
                  )}
                  %
                </div>
              </div>
            </div>

            {/* Calling Options Placeholder - TODO: Integrate LeadCallingSection */}
            <div className="flex items-center gap-2 ml-6">
              <button className="px-2 py-1.5 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded transition-colors">
                📞 Dial
              </button>
              <button className="px-2 py-1.5 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded transition-colors">
                💬 WhatsApp
              </button>
              <button className="px-2 py-1.5 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded transition-colors">
                ✉️ SMS
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ========================================================================
          ERROR MESSAGE
          ======================================================================== */}
      {error && (
        <div className="mx-4 mt-4 p-3 bg-red-50 border border-red-200 rounded-lg flex gap-3">
          <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-semibold text-red-900">{error}</p>
          </div>
        </div>
      )}

      {/* ========================================================================
          MAIN CONTENT AREA
          ======================================================================== */}
      <div className="flex-1 flex gap-4 max-w-7xl mx-auto w-full px-4 py-4 sm:px-6">
        {/* ====================================================================
            LEFT SIDEBAR - Stage Navigation
            ==================================================================== */}
        <div className="w-48 hidden lg:block flex-shrink-0">
          <div className="bg-white border border-slate-200 rounded-xl p-4 sticky top-20">
            <h3 className="text-xs font-bold text-slate-900 mb-3 uppercase tracking-wider">
              Application Stages
            </h3>

            <nav className="space-y-1">
              {getAllStages(application.loanProductFlow).map((stage, index) => {
                const isCompleted = stageCompletionStatus[stage]?.completed || false;
                const isCurrent = currentStage === stage;
                const canNavigate = isCompleted || isCurrent;

                return (
                  <button
                    key={stage}
                    onClick={() => canNavigate && setCurrentStage(stage)}
                    disabled={!canNavigate}
                    className={`w-full text-left px-3 py-2 text-xs rounded-lg font-medium transition-all ${
                      isCurrent
                        ? 'bg-blue-50 text-blue-700 border-l-2 border-blue-600'
                        : isCompleted
                        ? 'text-slate-700 hover:bg-slate-50'
                        : 'text-slate-400 cursor-not-allowed'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold">{isCompleted ? '✓' : isCurrent ? '●' : '○'}</span>
                      <span className="truncate">{stage}</span>
                    </div>
                  </button>
                );
              })}
            </nav>
          </div>
        </div>

        {/* ====================================================================
            CENTER - Main Content (Stage Form)
            ==================================================================== */}
        <div className="flex-1 min-w-0">
          <div className="bg-white border border-slate-200 rounded-xl p-6 sm:p-8">
            <h2 className="text-lg font-bold text-slate-900 mb-4">
              {currentStage}
            </h2>

            {/* Placeholder for stage form - TODO: Replace with GenericStageForm or stage-specific components */}
            <div className="p-8 bg-slate-50 border-2 border-dashed border-slate-300 rounded-lg text-center">
              <p className="text-sm text-slate-600">
                Stage form component will be rendered here
              </p>
              <p className="text-xs text-slate-500 mt-1">
                Current stage: {currentStage}
              </p>
            </div>

            {/* Stage errors */}
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

        {/* ====================================================================
            RIGHT SIDEBAR - Supporting Info (Future)
            ==================================================================== */}
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

      {/* ========================================================================
          FOOTER - Navigation Buttons
          ======================================================================== */}
      <div className="sticky bottom-0 z-20 bg-white border-t border-slate-200 shadow-lg">
        <div className="max-w-7xl mx-auto px-4 py-3 sm:px-6 flex items-center justify-between gap-3">
          {/* Previous button */}
          <button
            onClick={handlePreviousStage}
            disabled={currentStage === getAllStages(application.loanProductFlow)[0]}
            className="px-4 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg transition-colors"
          >
            ← Previous
          </button>

          <div className="flex-1" />

          {/* Save Draft button */}
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

          {/* Next button */}
          {currentStage !== getAllStages(application.loanProductFlow)[getAllStages(application.loanProductFlow).length - 1] && (
            <button
              onClick={handleNextStage}
              disabled={isSaving}
              className="px-4 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg transition-colors"
            >
              Next →
            </button>
          )}

          {/* Submit button (final stage only) */}
          {currentStage === getAllStages(application.loanProductFlow)[getAllStages(application.loanProductFlow).length - 1] && (
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
