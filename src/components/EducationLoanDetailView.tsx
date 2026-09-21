import React, { useState, useMemo } from 'react';
import { 
  ArrowLeft, 
  GraduationCap, 
  DollarSign, 
  Building, 
  UserCheck, 
  CheckCircle2, 
  Clock, 
  AlertCircle, 
  FileText, 
  FileCheck, 
  Download, 
  Edit3, 
  Save, 
  Plus, 
  Check, 
  Calendar, 
  Send, 
  CreditCard,
  Shield,
  Phone,
  Mail,
  ChevronRight
} from 'lucide-react';
import { 
  StudentLead, 
  EducationLoanProfile, 
  LoanStage, 
  LoanTranche, 
  LoanDocument 
} from '../types';

interface EducationLoanDetailViewProps {
  lead: StudentLead;
  onBack: () => void;
  onUpdateLead: (updatedLead: StudentLead) => void;
  onInitiateCall?: (lead: StudentLead) => void;
}

const DEFAULT_DOCUMENTS: LoanDocument[] = [
  { id: 'doc-1', category: 'Student KYC', name: 'Student Passport (First & Last Page)', status: 'Verified', required: true },
  { id: 'doc-2', category: 'Student KYC', name: 'PAN Card & Aadhaar Card', status: 'Verified', required: true },
  { id: 'doc-3', category: 'Academic', name: 'Degree Certificate & All Sem Marksheets', status: 'Verified', required: true },
  { id: 'doc-4', category: 'Academic', name: 'English Test Scorecard (IELTS/TOEFL/GRE)', status: 'Verified', required: true },
  { id: 'doc-5', category: 'University & Visa', name: 'Official Admit Letter / I-20 Form', status: 'Verified', required: true },
  { id: 'doc-6', category: 'Financials / ITR', name: 'Co-Applicant 3 Years ITR with Computation', status: 'Verified', required: true },
  { id: 'doc-7', category: 'Financials / ITR', name: 'Co-Applicant 6 Months Bank Statement', status: 'Verified', required: true },
  { id: 'doc-8', category: 'Financials / ITR', name: 'Co-Applicant Last 3 Months Salary Slips', status: 'Submitted', required: false },
];

const DEFAULT_TRANCHES: LoanTranche[] = [
  {
    id: 'tr-1',
    trancheNumber: 1,
    description: 'Fall 2026 Tuition Fee (Direct to University)',
    amount: '$25,000',
    targetDate: '15/08/2026',
    status: 'Disbursed',
    disbursedDate: '20/08/2026',
    beneficiary: 'Arizona State University Student Accounts',
  },
  {
    id: 'tr-2',
    trancheNumber: 2,
    description: 'Spring 2027 Tuition Fee (Semester 2)',
    amount: '$20,000',
    targetDate: '10/01/2027',
    status: 'Scheduled',
    beneficiary: 'Arizona State University Student Accounts',
  },
  {
    id: 'tr-3',
    trancheNumber: 3,
    description: 'Living Expenses & Health Insurance',
    amount: '$5,000',
    targetDate: '25/08/2026',
    status: 'Disbursed',
    disbursedDate: '25/08/2026',
    beneficiary: 'Student Zolve US Checking Account',
  },
];

const LOAN_STAGES: LoanStage[] = [
  'Draft / Ingestion',
  'Profile & KYC',
  'Credit Underwriting',
  'Sanctioned',
  'Agreement Executed',
  'Partially Disbursed',
  'Fully Disbursed',
];

export const EducationLoanDetailView: React.FC<EducationLoanDetailViewProps> = ({
  lead,
  onBack,
  onUpdateLead,
  onInitiateCall,
}) => {
  // Existing loan opportunity or fallback
  const loanOpportunity = lead.productOpportunities.find(p => p.product === 'Education Loan');

  // Initialize loan profile state
  const initialProfile: EducationLoanProfile = useMemo(() => {
    if (lead.loanProfile) return lead.loanProfile;

    return {
      loanFileId: `LN-${lead.id}`,
      lender: loanOpportunity?.partner || 'Avanse Financial Services',
      lenderBranch: 'Mumbai Central Education Desk',
      lenderRmName: 'Kunal Deshmukh',
      lenderRmContact: '+91 98201 55432',
      loanType: 'Unsecured (No Collateral)',
      loanStage: lead.qualificationStatus === 'Qualified' ? 'Partially Disbursed' : 'Sanctioned',
      requestedAmount: '$55,000',
      sanctionedAmount: loanOpportunity?.amount || '$50,000',
      disbursedAmount: '$25,000',
      interestRate: '10.25% p.a.',
      interestType: 'Floating',
      tenureYears: 10,
      moratoriumPeriod: 'Course Duration (24 mos) + 6 mos grace',
      repaymentType: 'Simple Interest',
      processingFee: '1.0% + GST',
      marginMoney: '$5,000 (Self funded from savings)',

      // Co-Applicant
      coApplicantName: 'Rajesh Sharma',
      coApplicantRelation: 'Father',
      coApplicantIncomeAnnual: '₹18,50,000 / year',
      coApplicantCreditScore: 785,
      coApplicantOccupation: 'Salaried • Senior Manager at Tech Corp',

      // University Costs
      tuitionFee: '$42,000',
      livingExpenses: '$13,000',
      totalCostOfAttendance: '$55,000',

      documents: DEFAULT_DOCUMENTS,
      tranches: DEFAULT_TRANCHES,
      lenderNotes: [
        'Sanction letter approved by Avanse credit committee at 10.25% floating ROI.',
        'First tranche of $25,000 wire transferred directly to University fee portal.',
        'Living expense tranche ($5,000) credited to student Zolve US checking account.',
      ],
      sanctionLetterIssuedDate: '15/08/2026',
      expectedDisbursalDate: '20/08/2026',
    };
  }, [lead, loanOpportunity]);

  // Draft state for staging edits before explicit save
  const [draftProfile, setDraftProfile] = useState<EducationLoanProfile>(() => JSON.parse(JSON.stringify(initialProfile)));
  const [newNoteText, setNewNoteText] = useState('');
  const [activeTab, setActiveTab] = useState<'overview' | 'disbursement' | 'documents' | 'coapplicant'>('overview');
  const [saveSuccessMessage, setSaveSuccessMessage] = useState<string | null>(null);

  // Check if dirty
  const isDirty = useMemo(() => {
    return JSON.stringify(draftProfile) !== JSON.stringify(initialProfile);
  }, [draftProfile, initialProfile]);

  const handleFieldChange = <K extends keyof EducationLoanProfile>(field: K, value: EducationLoanProfile[K]) => {
    setDraftProfile(prev => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleDocumentStatusToggle = (docId: string) => {
    setDraftProfile(prev => ({
      ...prev,
      documents: prev.documents.map(d => {
        if (d.id === docId) {
          const nextStatus = d.status === 'Verified' ? 'Submitted' : d.status === 'Submitted' ? 'Pending' : 'Verified';
          return { ...d, status: nextStatus, verifiedAt: nextStatus === 'Verified' ? new Date().toLocaleDateString() : undefined };
        }
        return d;
      })
    }));
  };

  const handleAddLenderNote = () => {
    if (!newNoteText.trim()) return;
    setDraftProfile(prev => ({
      ...prev,
      lenderNotes: [newNoteText.trim(), ...(prev.lenderNotes || [])]
    }));
    setNewNoteText('');
  };

  const handleDiscardChanges = () => {
    setDraftProfile(JSON.parse(JSON.stringify(initialProfile)));
  };

  const handleSaveLoanProfile = () => {
    const now = new Date().toISOString();
    const updatedOpportunities = lead.productOpportunities.map(p => {
      if (p.product === 'Education Loan') {
        return {
          ...p,
          amount: draftProfile.sanctionedAmount || p.amount,
          partner: draftProfile.lender || p.partner,
          status: draftProfile.loanStage === 'Fully Disbursed' || draftProfile.loanStage === 'Partially Disbursed'
            ? ('Completed / Sold' as const)
            : ('In Progress' as const),
          details: `Loan stage: ${draftProfile.loanStage}. Disbursed: ${draftProfile.disbursedAmount} of ${draftProfile.sanctionedAmount}.`,
        };
      }
      return p;
    });

    const updatedLead: StudentLead = {
      ...lead,
      loanProfile: draftProfile,
      productOpportunities: updatedOpportunities,
      lastActionAt: now,
      lastActionBy: 'Virendra (Manager)',
      activities: [
        {
          id: `act_${Date.now()}`,
          timestamp: now,
          actor: 'Virendra (Manager)',
          type: 'system',
          title: 'Education Loan File Updated',
          description: `Loan File ${draftProfile.loanFileId} (${draftProfile.lender}): Stage updated to "${draftProfile.loanStage}", Sanction: ${draftProfile.sanctionedAmount}, Disbursed: ${draftProfile.disbursedAmount}.`,
        },
        ...lead.activities,
      ],
    };

    onUpdateLead(updatedLead);
    setSaveSuccessMessage('Education loan details committed successfully!');
    setTimeout(() => setSaveSuccessMessage(null), 2500);
  };

  const getStageColor = (stage: LoanStage) => {
    switch (stage) {
      case 'Fully Disbursed':
      case 'Partially Disbursed':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'Sanctioned':
      case 'Agreement Executed':
        return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'Credit Underwriting':
      case 'Profile & KYC':
        return 'bg-purple-50 text-purple-700 border-purple-200';
      case 'Rejected':
        return 'bg-rose-50 text-rose-700 border-rose-200';
      default:
        return 'bg-slate-100 text-slate-700 border-slate-200';
    }
  };

  return (
    <div id="education-loan-detail-view" className="space-y-4 pb-12">
      {/* 1. Sticky Header Bar with Lead Back Button and Commit Controls */}
      <div className="bg-white p-3.5 rounded-xl border border-slate-200/80 shadow-xs flex flex-wrap items-center justify-between gap-3 sticky top-16 z-30 backdrop-blur-md">
        <div className="flex items-center gap-3">
          <button
            onClick={onBack}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors cursor-pointer"
            id="back-to-lead-btn"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Lead ({lead.studentName})</span>
          </button>

          <div className="flex items-center gap-2 border-l border-slate-200 pl-3">
            <div className="w-7 h-7 rounded-lg bg-[#2563EB]/10 text-[#2563EB] flex items-center justify-center font-bold">
              <GraduationCap className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-mono text-sm font-bold text-slate-900">
                  {draftProfile.loanFileId}
                </span>
                <span className="text-slate-300">•</span>
                <span className="text-sm font-bold text-slate-800">
                  {draftProfile.lender}
                </span>
                <span className={`text-xs font-bold px-2 py-0.5 rounded-md border ${getStageColor(draftProfile.loanStage)}`}>
                  {draftProfile.loanStage}
                </span>
              </div>
              <p className="text-[11px] text-slate-500">
                Student: <span className="font-semibold text-slate-800">{lead.studentName}</span> (ID: {lead.id}) • {lead.finalUniversity || lead.destinationCountry} • {lead.course}
              </p>
            </div>
          </div>
        </div>

        {/* Right Side: Save / Discard Controls */}
        <div className="flex items-center gap-2.5">
          {saveSuccessMessage && (
            <span className="text-xs font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded-lg animate-in fade-in flex items-center gap-1">
              <Check className="w-3.5 h-3.5" />
              {saveSuccessMessage}
            </span>
          )}

          {isDirty && (
            <div className="flex items-center gap-2 bg-amber-50 border border-amber-200 px-2.5 py-1 rounded-lg animate-in fade-in">
              <span className="text-[11px] font-semibold text-amber-800 flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse"></span>
                Unsaved loan edits
              </span>
              <button
                onClick={handleDiscardChanges}
                className="text-[11px] text-slate-600 hover:text-slate-900 underline font-medium cursor-pointer"
              >
                Discard
              </button>
              <button
                onClick={handleSaveLoanProfile}
                className="inline-flex items-center gap-1 px-3 py-1 text-xs font-bold text-white bg-[#2563EB] hover:bg-[#1E40AF] rounded-md shadow-xs transition-colors cursor-pointer"
                id="save-loan-profile-btn"
              >
                <Save className="w-3.5 h-3.5" />
                <span>Save Loan Changes</span>
              </button>
            </div>
          )}

          {/* Quick Stage Selector */}
          <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-lg border border-slate-200 text-xs">
            <span className="text-slate-500 text-[11px] px-1 font-medium">Stage:</span>
            <select
              value={draftProfile.loanStage}
              onChange={e => handleFieldChange('loanStage', e.target.value as LoanStage)}
              className="bg-white border border-slate-200 rounded px-2 py-1 font-semibold text-slate-800 text-xs focus:outline-hidden"
            >
              {LOAN_STAGES.map(stg => (
                <option key={stg} value={stg}>{stg}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* 2. Top Metric Cards Strip - REMOVED, fields now in form */}

      {/* 3. Navigation Tabs */}
      <div className="bg-white p-1 rounded-xl border border-slate-200/80 shadow-2xs flex items-center gap-1">
        <button
          onClick={() => setActiveTab('overview')}
          className={`px-4 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
            activeTab === 'overview'
              ? 'bg-[#2563EB] text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          Loan Overview & Terms
        </button>
        <button
          onClick={() => setActiveTab('disbursement')}
          className={`px-4 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
            activeTab === 'disbursement'
              ? 'bg-[#2563EB] text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          Disbursement Tranches ({draftProfile.tranches.length})
        </button>
        <button
          onClick={() => setActiveTab('documents')}
          className={`px-4 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
            activeTab === 'documents'
              ? 'bg-[#2563EB] text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          Documents & KYC ({draftProfile.documents.filter(d => d.status === 'Verified').length}/{draftProfile.documents.length})
        </button>
        <button
          onClick={() => setActiveTab('coapplicant')}
          className={`px-4 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
            activeTab === 'coapplicant'
              ? 'bg-[#2563EB] text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          Co-Applicant & University Expenses
        </button>
      </div>

      {/* 4. Tab Contents */}

      {/* TAB 1: OVERVIEW & TERMS */}
      {activeTab === 'overview' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-start">
          {/* Left 7 Cols: Terms & Configuration */}
          <div className="lg:col-span-7 space-y-4">
            <div className="bg-white rounded-xl border border-slate-200/80 p-4 shadow-xs space-y-3.5">
              <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <CreditCard className="w-4 h-4 text-[#2563EB]" />
                  <h3 className="text-sm font-bold text-slate-900">Loan Details & Lender Status</h3>
                </div>
                <span className="text-xs text-slate-500 font-mono">
                  File: {draftProfile.loanFileId}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-3 text-xs">
                <div>
                  <label className="text-[11px] text-slate-500 font-medium block">Type of Loan</label>
                  <select
                    value={draftProfile.loanType}
                    onChange={e => handleFieldChange('loanType', e.target.value as any)}
                    className="w-full mt-1 p-2 bg-slate-50 border border-slate-200 rounded-lg font-medium text-slate-900 focus:bg-white"
                  >
                    <option value="Unsecured (No Collateral)">Unsecured</option>
                    <option value="Secured (Collateral)">Secured</option>
                  </select>
                </div>

                <div>
                  <label className="text-[11px] text-slate-500 font-medium block">Loan Amount</label>
                  <input
                    type="text"
                    value={draftProfile.loanAmount || ''}
                    onChange={e => handleFieldChange('loanAmount', e.target.value)}
                    className="w-full mt-1 p-2 bg-slate-50 border border-slate-200 rounded-lg font-mono font-bold text-slate-900 focus:bg-white"
                  />
                </div>

                <div className="col-span-2">
                  <label className="text-[11px] text-slate-500 font-medium block">Co-Applicant Name</label>
                  <input
                    type="text"
                    value={draftProfile.coApplicantName || ''}
                    onChange={e => handleFieldChange('coApplicantName', e.target.value)}
                    className="w-full mt-1 p-2 bg-slate-50 border border-slate-200 rounded-lg font-medium text-slate-900 focus:bg-white"
                  />
                </div>

                <div>
                  <label className="text-[11px] text-slate-500 font-medium block">Relation to Student</label>
                  <input
                    type="text"
                    value={draftProfile.coApplicantRelation || ''}
                    onChange={e => handleFieldChange('coApplicantRelation', e.target.value)}
                    className="w-full mt-1 p-2 bg-slate-50 border border-slate-200 rounded-lg font-medium text-slate-900 focus:bg-white"
                    placeholder="Father, Mother, etc."
                  />
                </div>

                <div>
                  <label className="text-[11px] text-slate-500 font-medium block">Co-Applicant Number</label>
                  <input
                    type="text"
                    value={draftProfile.coApplicantNumber || ''}
                    onChange={e => handleFieldChange('coApplicantNumber', e.target.value)}
                    className="w-full mt-1 p-2 bg-slate-50 border border-slate-200 rounded-lg font-mono text-slate-900 focus:bg-white"
                  />
                </div>

                <div className="col-span-2">
                  <label className="text-[11px] text-slate-500 font-medium block">Lenders Applied To</label>
                  <div className="grid grid-cols-4 gap-2 mt-1">
                    {(['Credila', 'InCred', 'SBI', 'PNB'] as const).map(lender => (
                      <label key={lender} className="flex items-center gap-2 p-2 rounded border border-slate-200 bg-slate-50/50 hover:bg-slate-50 cursor-pointer text-xs">
                        <input
                          type="checkbox"
                          checked={(draftProfile.lendersAppliedTo || []).includes(lender)}
                          onChange={e => {
                            const current = draftProfile.lendersAppliedTo || [];
                            const updated = e.target.checked 
                              ? [...current, lender]
                              : current.filter(l => l !== lender);
                            handleFieldChange('lendersAppliedTo', updated as any);
                          }}
                          className="w-3.5 h-3.5 text-[#2563EB] rounded border-slate-300 focus:ring-[#2563EB]"
                        />
                        <span className="font-medium text-slate-700">{lender}</span>
                      </label>
                    ))}
                  </div>
                </div>

                {(draftProfile.lendersAppliedTo || []).map(lender => (
                  <div key={lender}>
                    <label className="text-[11px] text-slate-500 font-medium block">{lender} Status</label>
                    <select
                      value={draftProfile.lenderStatusMap?.[lender] || 'Doc Pending'}
                      onChange={e => {
                        const statusMap = draftProfile.lenderStatusMap || {};
                        handleFieldChange('lenderStatusMap', {
                          ...statusMap,
                          [lender]: e.target.value as any
                        });
                      }}
                      className="w-full mt-1 p-2 bg-slate-50 border border-slate-200 rounded-lg font-semibold text-xs text-slate-900 focus:bg-white"
                    >
                      <option value="Doc Pending">Doc Pending</option>
                      <option value="Logged In">Logged In</option>
                      <option value="Sanctioned">Sanctioned</option>
                      <option value="PF Paid">PF Paid</option>
                      <option value="Disbursed">Disbursed</option>
                    </select>
                  </div>
                ))}
              </div>
            </div>

            {/* Lender RM Contact Card */}
            <div className="bg-white rounded-xl border border-slate-200/80 p-4 shadow-xs space-y-3">
              <h4 className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                <Building className="w-3.5 h-3.5 text-blue-600" />
                <span>Lender Relationship & Operations Contact</span>
              </h4>
              <div className="grid grid-cols-3 gap-3 text-xs">
                <div>
                  <span className="text-[11px] text-slate-400 block">Lender Branch</span>
                  <span className="font-semibold text-slate-800">{draftProfile.lenderBranch}</span>
                </div>
                <div>
                  <span className="text-[11px] text-slate-400 block">Credit RM Name</span>
                  <span className="font-semibold text-slate-800">{draftProfile.lenderRmName}</span>
                </div>
                <div>
                  <span className="text-[11px] text-slate-400 block">Contact Phone</span>
                  <span className="font-mono text-slate-700">{draftProfile.lenderRmContact}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Right 5 Cols: Call Section & Lender Notes */}
          <div className="lg:col-span-5 space-y-4">
            {/* Call Button & Status Options */}
            <div className="bg-white rounded-xl border border-slate-200/80 p-4 shadow-xs space-y-3">
              <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <Phone className="w-4 h-4 text-[#2563EB]" />
                  <span>Call & Status</span>
                </h3>
              </div>

              <button
                onClick={() => onInitiateCall && onInitiateCall(lead)}
                className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 text-xs font-bold text-white bg-[#2563EB] hover:bg-[#1E40AF] rounded-lg shadow-xs transition-colors cursor-pointer"
                id="loan-detail-call-btn"
              >
                <Phone className="w-4 h-4 fill-white" />
                <span>Call Lead</span>
              </button>

              <div className="space-y-2 pt-1 text-xs">
                <span className="text-[11px] font-semibold text-slate-500 block">Call Status:</span>
                <div className="grid grid-cols-2 gap-2">
                  {(['Connected', 'RNR', 'Switch Off', 'Busy', 'Callback Scheduled', 'Not Interested'] as const).map(status => (
                    <button
                      key={status}
                      type="button"
                      onClick={() => {
                        // This would typically log the call status
                        // For now just showing UI option
                      }}
                      className={`px-2 py-1.5 rounded-md text-[11px] font-semibold transition-colors cursor-pointer ${
                        lead.callingStatus === status
                          ? 'bg-[#2563EB] text-white shadow-xs'
                          : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                      }`}
                    >
                      {status}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Lender Notes & Timeline */}
            <div className="bg-white rounded-xl border border-slate-200/80 p-4 shadow-xs space-y-3">
              <div className="flex items-center justify-between pb-1 border-b border-slate-100">
                <h3 className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
                  <FileText className="w-4 h-4 text-amber-600" />
                  <span>Lender Notes & Credit Updates</span>
                </h3>
                <span className="text-[11px] text-slate-400 font-mono">
                  {draftProfile.lenderNotes?.length || 0} updates
                </span>
              </div>

              {/* Add Note Input */}
              <div className="flex gap-2">
                <input
                  type="text"
                  value={newNoteText}
                  onChange={e => setNewNoteText(e.target.value)}
                  onKeyDown={e => {
                    if (e.key === 'Enter') handleAddLenderNote();
                  }}
                  placeholder="Record lender status / disbursal note..."
                  className="flex-1 p-2 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-800 focus:bg-white focus:outline-hidden"
                />
                <button
                  onClick={handleAddLenderNote}
                  disabled={!newNoteText.trim()}
                  className="px-3 py-1.5 text-xs font-semibold bg-slate-800 text-white rounded-lg hover:bg-slate-900 disabled:opacity-50 cursor-pointer"
                >
                  Add
                </button>
              </div>

              {/* Notes list */}
              <div className="space-y-2 pt-1 max-h-60 overflow-y-auto">
                {draftProfile.lenderNotes?.map((note, idx) => (
                  <div key={idx} className="p-2.5 rounded-lg bg-amber-50/60 border border-amber-200/70 text-xs text-slate-800 flex items-start gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-500 mt-1.5 shrink-0"></span>
                    <p className="flex-1 leading-relaxed">{note}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: DISBURSEMENT TRANCHES */}
      {activeTab === 'disbursement' && (
        <div className="bg-white rounded-xl border border-slate-200/80 p-5 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div>
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Send className="w-4 h-4 text-[#2563EB]" />
                <span>Disbursement Tranche Schedule</span>
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Semester-wise tuition remittances to foreign university & living expense wires.
              </p>
            </div>
            <div className="text-right">
              <span className="text-xs text-slate-500 block">Total Sanctioned</span>
              <span className="text-lg font-bold text-slate-900 font-mono">{draftProfile.sanctionedAmount}</span>
            </div>
          </div>

          <div className="overflow-x-auto rounded-lg border border-slate-200">
            <table className="w-full text-left text-xs border-collapse">
              <thead className="bg-slate-100 text-slate-700 font-bold border-b border-slate-200">
                <tr>
                  <th className="p-3">#</th>
                  <th className="p-3">Description & Purpose</th>
                  <th className="p-3">Beneficiary Account</th>
                  <th className="p-3 text-right">Amount</th>
                  <th className="p-3">Target Date</th>
                  <th className="p-3 text-center">Status</th>
                  <th className="p-3">Disbursed Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 bg-white">
                {draftProfile.tranches.map((tranche) => (
                  <tr key={tranche.id} className="hover:bg-slate-50">
                    <td className="p-3 font-mono font-bold text-slate-500">
                      T{tranche.trancheNumber}
                    </td>
                    <td className="p-3 font-semibold text-slate-800">
                      {tranche.description}
                    </td>
                    <td className="p-3 text-slate-600">
                      {tranche.beneficiary}
                    </td>
                    <td className="p-3 text-right font-mono font-bold text-slate-900">
                      {tranche.amount}
                    </td>
                    <td className="p-3 text-slate-600 font-mono">
                      {tranche.targetDate}
                    </td>
                    <td className="p-3 text-center">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-bold ${
                        tranche.status === 'Disbursed'
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          : tranche.status === 'Scheduled'
                          ? 'bg-blue-50 text-blue-700 border border-blue-200'
                          : 'bg-amber-50 text-amber-700 border border-amber-200'
                      }`}>
                        {tranche.status}
                      </span>
                    </td>
                    <td className="p-3 text-slate-600 font-mono">
                      {tranche.disbursedDate || '-'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 3: DOCUMENTS & KYC */}
      {activeTab === 'documents' && (
        <div className="bg-white rounded-xl border border-slate-200/80 p-5 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div>
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <FileCheck className="w-4 h-4 text-emerald-600" />
                <span>Credit Underwriting Document Checklist</span>
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Click any document row to cycle status between Verified, Submitted, and Pending.
              </p>
            </div>
            <div className="text-xs font-semibold text-slate-600 bg-slate-100 px-3 py-1 rounded-lg">
              {draftProfile.documents.filter(d => d.status === 'Verified').length} of {draftProfile.documents.length} Cleared
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {draftProfile.documents.map((doc) => (
              <div 
                key={doc.id}
                onClick={() => handleDocumentStatusToggle(doc.id)}
                className="p-3 rounded-xl border border-slate-200 bg-slate-50/50 hover:bg-slate-50 transition-colors cursor-pointer flex items-center justify-between gap-3"
              >
                <div className="flex items-center gap-2.5">
                  <div className={`w-7 h-7 rounded-lg flex items-center justify-center font-bold text-xs ${
                    doc.status === 'Verified' ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-200 text-slate-600'
                  }`}>
                    {doc.status === 'Verified' ? <Check className="w-4 h-4" /> : <Clock className="w-4 h-4" />}
                  </div>
                  <div>
                    <span className="text-xs font-semibold text-slate-800 block">{doc.name}</span>
                    <span className="text-[10px] text-slate-400">{doc.category} {doc.required && '• Mandatory'}</span>
                  </div>
                </div>

                <span className={`text-[11px] font-bold px-2 py-0.5 rounded border ${
                  doc.status === 'Verified' 
                    ? 'bg-emerald-50 text-emerald-700 border-emerald-200' 
                    : doc.status === 'Submitted'
                    ? 'bg-blue-50 text-blue-700 border-blue-200'
                    : 'bg-amber-50 text-amber-700 border-amber-200'
                }`}>
                  {doc.status}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 4: CO-APPLICANT & EXPENSES */}
      {activeTab === 'coapplicant' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 items-start">
          {/* Co-Applicant Details */}
          <div className="bg-white rounded-xl border border-slate-200/80 p-4 shadow-xs space-y-3.5">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <UserCheck className="w-4 h-4 text-amber-600" />
                <h3 className="text-sm font-bold text-slate-900">Co-Applicant / Financial Guarantor</h3>
              </div>
              <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                Credit Score: {draftProfile.coApplicantCreditScore || 785}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div>
                <label className="text-[11px] text-slate-500 font-medium block">Co-Borrower Name</label>
                <input
                  type="text"
                  value={draftProfile.coApplicantName || ''}
                  onChange={e => handleFieldChange('coApplicantName', e.target.value)}
                  className="w-full mt-1 p-2 bg-slate-50 border border-slate-200 rounded-lg font-semibold text-slate-900 focus:bg-white"
                />
              </div>

              <div>
                <label className="text-[11px] text-slate-500 font-medium block">Relationship to Student</label>
                <input
                  type="text"
                  value={draftProfile.coApplicantRelation || ''}
                  onChange={e => handleFieldChange('coApplicantRelation', e.target.value)}
                  className="w-full mt-1 p-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 focus:bg-white"
                />
              </div>

              <div className="col-span-2">
                <label className="text-[11px] text-slate-500 font-medium block">Employment / Occupation</label>
                <input
                  type="text"
                  value={draftProfile.coApplicantOccupation || ''}
                  onChange={e => handleFieldChange('coApplicantOccupation', e.target.value)}
                  className="w-full mt-1 p-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 focus:bg-white"
                />
              </div>

              <div>
                <label className="text-[11px] text-slate-500 font-medium block">Annual Gross Income (ITR)</label>
                <input
                  type="text"
                  value={draftProfile.coApplicantIncomeAnnual || ''}
                  onChange={e => handleFieldChange('coApplicantIncomeAnnual', e.target.value)}
                  className="w-full mt-1 p-2 bg-slate-50 border border-slate-200 rounded-lg font-mono text-slate-800 focus:bg-white"
                />
              </div>

              <div>
                <label className="text-[11px] text-slate-500 font-medium block">CIBIL / Experian Score</label>
                <input
                  type="number"
                  value={draftProfile.coApplicantCreditScore || 780}
                  onChange={e => handleFieldChange('coApplicantCreditScore', Number(e.target.value))}
                  className="w-full mt-1 p-2 bg-slate-50 border border-slate-200 rounded-lg font-mono font-bold text-slate-800 focus:bg-white"
                />
              </div>
            </div>
          </div>

          {/* University Cost of Attendance */}
          <div className="bg-white rounded-xl border border-slate-200/80 p-4 shadow-xs space-y-3.5">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <GraduationCap className="w-4 h-4 text-blue-600" />
                <h3 className="text-sm font-bold text-slate-900">University Cost Breakdown (I-20 / CAS)</h3>
              </div>
              <span className="text-xs font-semibold text-slate-500">
                {lead.destinationCountry}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="col-span-2">
                <label className="text-[11px] text-slate-500 font-medium block">Admitted University</label>
                <input
                  type="text"
                  value={lead.finalUniversity || lead.universitiesOfInterest[0] || 'Arizona State University'}
                  disabled
                  className="w-full mt-1 p-2 bg-slate-100 border border-slate-200 rounded-lg font-bold text-slate-800"
                />
              </div>

              <div>
                <label className="text-[11px] text-slate-500 font-medium block">Tuition & Academic Fees</label>
                <input
                  type="text"
                  value={draftProfile.tuitionFee || '$42,000'}
                  onChange={e => handleFieldChange('tuitionFee', e.target.value)}
                  className="w-full mt-1 p-2 bg-slate-50 border border-slate-200 rounded-lg font-mono text-slate-800 focus:bg-white"
                />
              </div>

              <div>
                <label className="text-[11px] text-slate-500 font-medium block">Living & Housing Estimates</label>
                <input
                  type="text"
                  value={draftProfile.livingExpenses || '$13,000'}
                  onChange={e => handleFieldChange('livingExpenses', e.target.value)}
                  className="w-full mt-1 p-2 bg-slate-50 border border-slate-200 rounded-lg font-mono text-slate-800 focus:bg-white"
                />
              </div>

              <div className="col-span-2 pt-2 border-t border-slate-100 flex items-center justify-between">
                <div>
                  <span className="text-[11px] text-slate-400 block">Total Certified Cost of Attendance</span>
                  <span className="text-base font-extrabold text-slate-900 font-mono">
                    {draftProfile.totalCostOfAttendance || '$55,000'}
                  </span>
                </div>
                <div className="text-right">
                  <span className="text-[11px] text-slate-400 block">Sanction Coverage</span>
                  <span className="text-sm font-bold text-emerald-700">91% Covered</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
