import React, { useCallback } from 'react';
import { ArrowLeft, Clock, CheckCircle2, Phone, MessageCircle, Mail } from 'lucide-react';
import { ApplicationStatus, LoanProductFlow } from '../types/normalized';

interface JourneyPageHeaderProps {
  applicantName: string;
  loanProductFlow: LoanProductFlow;
  applicationStatus: ApplicationStatus;
  currentStageIndex: number;
  totalStages: number;
  onBack: () => void;
  onCall: (type: 'dial' | 'whatsapp' | 'sms') => void;
}

/**
 * JourneyPageHeader - Header component for Education Loan Journey page
 * 
 * Displays:
 * - Back button and applicant information
 * - Application status badge
 * - Progress bar showing current stage
 * - Always-visible calling options (Dial, WhatsApp, SMS)
 */
const JourneyPageHeader: React.FC<JourneyPageHeaderProps> = ({
  applicantName,
  loanProductFlow,
  applicationStatus,
  currentStageIndex,
  totalStages,
  onBack,
  onCall,
}) => {
  const progressPercent = ((currentStageIndex + 1) / totalStages) * 100;

  // Format loan product flow for display
  const formatLoanFlow = (flow: LoanProductFlow): string => {
    const flowMap: Record<LoanProductFlow, string> = {
      [LoanProductFlow.INR_Unsecured]: 'INR Unsecured',
      [LoanProductFlow.INR_Secured]: 'INR Secured',
      [LoanProductFlow.US_Cosigner]: 'US with Co-signer',
      [LoanProductFlow.USD_NoCoSigner_Prodigy]: 'USD - Prodigy',
      [LoanProductFlow.USD_NoCoSigner_MPower]: 'USD - mPower',
    };
    return flowMap[flow] || flow;
  };

  // Get status badge styling
  const getStatusStyles = (status: ApplicationStatus) => {
    const statusMap = {
      [ApplicationStatus.Draft]: { bg: 'bg-yellow-50', text: 'text-yellow-700', icon: Clock },
      [ApplicationStatus.InProgress]: { bg: 'bg-blue-50', text: 'text-blue-700', icon: Clock },
      [ApplicationStatus.Submitted]: { bg: 'bg-green-50', text: 'text-green-700', icon: CheckCircle2 },
      [ApplicationStatus.UnderReview]: { bg: 'bg-purple-50', text: 'text-purple-700', icon: Clock },
      [ApplicationStatus.Approved]: { bg: 'bg-emerald-50', text: 'text-emerald-700', icon: CheckCircle2 },
      [ApplicationStatus.Rejected]: { bg: 'bg-red-50', text: 'text-red-700', icon: Clock },
      [ApplicationStatus.Closed]: { bg: 'bg-slate-50', text: 'text-slate-700', icon: CheckCircle2 },
    };
    return statusMap[status];
  };

  const statusStyle = getStatusStyles(applicationStatus);
  const StatusIcon = statusStyle.icon;

  return (
    <div className="sticky top-0 z-30 bg-white border-b border-slate-200 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 py-3 sm:px-6 sm:py-4">
        {/* Top row: Back button, title, status badge */}
        <div className="flex items-center justify-between mb-3 gap-4">
          <button
            onClick={onBack}
            className="flex items-center gap-2 px-3 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
            title="Back to lead detail"
          >
            <ArrowLeft className="w-4 h-4" />
            Back
          </button>

          <div className="flex-1 min-w-0">
            <h1 className="text-sm font-bold text-slate-900 truncate">
              Education Loan Application
            </h1>
            <p className="text-xs text-slate-500 mt-0.5 truncate">
              {applicantName} • {formatLoanFlow(loanProductFlow)}
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 ${statusStyle.bg} ${statusStyle.text} rounded-full text-xs font-semibold whitespace-nowrap`}>
              <StatusIcon className="w-3.5 h-3.5" />
              {applicationStatus}
            </span>
          </div>
        </div>

        {/* Bottom row: Progress bar and calling options */}
        <div className="flex items-center justify-between gap-4">
          {/* Progress section */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-3">
              <div className="text-xs font-semibold text-slate-600 whitespace-nowrap">
                Stage {currentStageIndex + 1}/{totalStages}
              </div>
              <div className="flex-1 h-2 bg-slate-200 rounded-full overflow-hidden">
                <div
                  className="h-full bg-blue-500 transition-all duration-300"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
              <div className="text-xs text-slate-500 whitespace-nowrap">
                {Math.round(progressPercent)}%
              </div>
            </div>
          </div>

          {/* Calling options - always visible */}
          <div className="flex items-center gap-2 flex-shrink-0" title="Communication options">
            <button
              onClick={() => onCall('dial')}
              className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded transition-colors"
              title="Dial applicant"
            >
              <Phone className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Dial</span>
            </button>
            <button
              onClick={() => onCall('whatsapp')}
              className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded transition-colors"
              title="Send WhatsApp message"
            >
              <MessageCircle className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">WhatsApp</span>
            </button>
            <button
              onClick={() => onCall('sms')}
              className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded transition-colors"
              title="Send SMS"
            >
              <Mail className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">SMS</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default JourneyPageHeader;
