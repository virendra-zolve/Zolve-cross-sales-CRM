import React, { useState, useEffect } from 'react';
import { 
  Phone, 
  PhoneCall, 
  PhoneOff, 
  Clock, 
  CheckCircle2, 
  Calendar, 
  FileText, 
  Sparkles, 
  GraduationCap, 
  Building2, 
  UserCheck, 
  DollarSign, 
  ShieldCheck, 
  ArrowRight, 
  Check, 
  X, 
  Layers, 
  Compass, 
  Award,
  AlertCircle
} from 'lucide-react';
import { StudentLead, JourneyStage, MasterProduct, LastCallOutcome, CallingStatus, QualificationStatus, FundingPlan } from '../types';

interface InboundDiscoveryModalProps {
  lead: StudentLead | null;
  isOpen: boolean;
  onClose: () => void;
  onSaveDiscovery: (updatedLead: StudentLead) => void;
}

export const InboundDiscoveryModal: React.FC<InboundDiscoveryModalProps> = ({
  lead,
  isOpen,
  onClose,
  onSaveDiscovery,
}) => {
  if (!isOpen || !lead) return null;

  // Staged Discovery Form State
  const [studentName, setStudentName] = useState(lead.studentName);
  const [mobileCountryCode, setMobileCountryCode] = useState(lead.mobileCountryCode || '91');
  const [mobileNumber, setMobileNumber] = useState(lead.mobileNumber);
  const [sourceCode, setSourceCode] = useState(lead.sourceCode || 'PARTNER_01');
  const [bdeCode, setBdeCode] = useState(lead.bdeCode || 'BDE_PRIYA');
  const [destinationCountry, setDestinationCountry] = useState(lead.destinationCountry || 'USA');

  // Fields to be captured by RM during call
  const [email, setEmail] = useState(lead.email || '');
  const [alternatePhone, setAlternatePhone] = useState('');
  const [city, setCity] = useState('');
  
  // Academic & Destination
  const [intake, setIntake] = useState(lead.intake || 'Fall 2025');
  const [course, setCourse] = useState(lead.course || '');
  const [journeyStage, setJourneyStage] = useState<JourneyStage>(
    lead.journeyStage === 'Unknown' ? 'Counseling' : lead.journeyStage
  );
  const [targetUniversities, setTargetUniversities] = useState(
    lead.universitiesOfInterest?.join(', ') || ''
  );
  const [finalUniversity, setFinalUniversity] = useState(lead.finalUniversity || '');
  const [testScores, setTestScores] = useState(lead.academicScore || '');
  
  // Products & Financing
  const [fundingPlan, setFundingPlan] = useState<FundingPlan>(lead.fundingPlan || 'Will Need Loan');
  const [needsEducationLoan, setNeedsEducationLoan] = useState<boolean>(
    lead.educationLoan === 'Yes' || !!lead.masterProducts?.['Education Loan'] || true
  );
  const [loanAmount, setLoanAmount] = useState('$50,000');
  const [coApplicantName, setCoApplicantName] = useState('Rajesh (Father)');
  const [coApplicantIncome, setCoApplicantIncome] = useState(lead.coSignerIncome || '₹18 LPA');
  const [collateralPreference, setCollateralPreference] = useState<'Unsecured (No Collateral)' | 'Secured (Property/FD)'>('Unsecured (No Collateral)');
  
  // Cross-sell interest
  const [bankAccountInterest, setBankAccountInterest] = useState(true);
  const [forexInterest, setForexInterest] = useState(true);
  const [accommodationInterest, setAccommodationInterest] = useState(false);
  const [esimInterest, setEsimInterest] = useState(true);

  // Call management
  const [callTimerSeconds, setCallTimerSeconds] = useState(45);
  const [callActive, setCallActive] = useState(true);
  const [callOutcome, setCallOutcome] = useState<LastCallOutcome>('Connected');
  const [callNotes, setCallNotes] = useState(
    'Initial discovery call connected. Student confirmed interest in Fall 2025 intake. Discussed university shortlist and loan requirement.'
  );
  const [qualificationStatus, setQualificationStatus] = useState<QualificationStatus>('Qualified');
  const [nextCallDateTime, setNextCallDateTime] = useState('Tomorrow at 3:30 PM');

  // Active sub-tab inside discovery modal
  const [activeTab, setActiveTab] = useState<'all' | 'contact' | 'academics' | 'financials' | 'outcome'>('all');

  // Timer loop
  useEffect(() => {
    let interval: any = null;
    if (callActive) {
      interval = setInterval(() => {
        setCallTimerSeconds((s) => s + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [callActive]);

  // Dynamic Profile Completion Calculation
  const completionStats = React.useMemo(() => {
    let total = 6; // Initial 6 inbound fields
    const maxFields = 24;

    if (email.trim().length > 3 && email.includes('@')) total += 2;
    if (alternatePhone.trim().length > 5) total += 1;
    if (city.trim().length > 2) total += 1;
    if (course.trim().length > 2) total += 2;
    if (intake.trim().length > 2) total += 1;
    if (journeyStage !== 'Unknown') total += 2;
    if (targetUniversities.trim().length > 2) total += 2;
    if (finalUniversity.trim().length > 2) total += 1;
    if (testScores.trim().length > 2) total += 1;
    if (fundingPlan !== 'Unknown') total += 1;
    if (needsEducationLoan) total += 2;
    if (loanAmount.trim().length > 2) total += 1;
    if (coApplicantIncome.trim().length > 2) total += 1;
    if (bankAccountInterest || forexInterest) total += 1;
    if (callNotes.trim().length > 10) total += 2;
    if (qualificationStatus !== 'Pending') total += 1;

    const pct = Math.min(100, Math.round((total / maxFields) * 100));
    return { filled: total, max: maxFields, pct };
  }, [
    email,
    alternatePhone,
    city,
    course,
    intake,
    journeyStage,
    targetUniversities,
    finalUniversity,
    testScores,
    fundingPlan,
    needsEducationLoan,
    loanAmount,
    coApplicantIncome,
    bankAccountInterest,
    forexInterest,
    callNotes,
    qualificationStatus,
  ]);

  // One-click Auto Fill Demo Discovery Data
  const handleAutoFillSampleDiscovery = () => {
    setEmail('rohan.sengupta@gmail.com');
    setAlternatePhone('9811223344');
    setCity('Bengaluru, Karnataka');
    setCourse('MS in Computer Science');
    setIntake('Fall 2025');
    setJourneyStage('Admission Confirmed');
    setTargetUniversities('Arizona State University, Northeastern University, UT Dallas');
    setFinalUniversity('Arizona State University (ASU)');
    setTestScores('GRE 322 (Q:168, V:154) • IELTS 7.5');
    setFundingPlan('Will Need Loan');
    setNeedsEducationLoan(true);
    setLoanAmount('$50,000 (₹42 Lakhs)');
    setCoApplicantName('Rajesh Sengupta (Father)');
    setCoApplicantIncome('₹22 LPA (ITR verified)');
    setCollateralPreference('Unsecured (No Collateral)');
    setBankAccountInterest(true);
    setForexInterest(true);
    setAccommodationInterest(true);
    setEsimInterest(true);
    setCallOutcome('Connected');
    setCallNotes(
      'Student has confirmed admit for MS CS at ASU for Fall 2025! Looking for $50,000 unsecured loan. Father is co-signer with 22 LPA ITR. Also interested in Zolve US Bank Account and Forex remittance. Scheduled next call for document checklist review.'
    );
    setQualificationStatus('Qualified');
    setNextCallDateTime('Friday at 11:00 AM');
  };

  // Commit and Save
  const handleSaveAndEnrich = () => {
    const now = new Date().toISOString();
    const universities = targetUniversities
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);

    // Build Master Products map
    const newMasterProducts = { ...lead.masterProducts };
    if (needsEducationLoan) newMasterProducts['Education Loan'] = true;
    if (bankAccountInterest) newMasterProducts['Bank Account'] = true;
    if (forexInterest) newMasterProducts['Money Transfer'] = true;
    if (accommodationInterest) newMasterProducts['Accommodation'] = true;
    if (esimInterest) newMasterProducts['eSIM'] = true;

    // Build Product Opportunities
    const existingOpps = [...lead.productOpportunities];
    if (needsEducationLoan && !existingOpps.some((p) => p.product === 'Education Loan')) {
      existingOpps.push({
        id: `p_loan_${Date.now()}`,
        product: 'Education Loan',
        status: 'In Progress',
        amount: loanAmount,
        partner: 'Avanse / InCred',
        details: `Requested ${loanAmount} for ${finalUniversity || destinationCountry}`,
        createdAt: now,
      });
    }

    if (bankAccountInterest && !existingOpps.some((p) => p.product === 'Bank Account')) {
      existingOpps.push({
        id: `p_bank_${Date.now()}`,
        product: 'Bank Account',
        status: 'Interested',
        details: 'Pre-departure US Account setup',
        createdAt: now,
      });
    }

    if (forexInterest && !existingOpps.some((p) => p.product === 'Money Transfer')) {
      existingOpps.push({
        id: `p_forex_${Date.now()}`,
        product: 'Money Transfer',
        status: 'Interested',
        details: 'Tuition remittance inquiry',
        createdAt: now,
      });
    }

    // Call Log Entry
    const newCallLog = {
      id: `call_${Date.now()}`,
      timestamp: now,
      rmName: lead.leadOwner || 'Vikas',
      durationSeconds: callTimerSeconds,
      outcome: callOutcome,
      notes: callNotes,
      scheduledNextCall: nextCallDateTime,
    };

    // Activity log entry
    const newActivity = {
      id: `act_${Date.now()}`,
      timestamp: now,
      actor: `${lead.leadOwner || 'RM'} (Discovery Call)`,
      type: 'call' as const,
      title: 'First Discovery Call Completed & Profile Enriched',
      description: `Captured email (${email || 'pending'}), course (${course || 'General'}), stage (${journeyStage}), and initiated loan discovery.`,
    };

    const updatedLead: StudentLead = {
      ...lead,
      studentName,
      mobileCountryCode,
      mobileNumber,
      sourceCode,
      bdeCode,
      destinationCountry,
      finalCountry: destinationCountry,
      email: email.trim(),
      course: course.trim() || 'Undecided Course',
      intake: intake.trim(),
      journeyStage,
      universitiesOfInterest: universities.length > 0 ? universities : [destinationCountry],
      finalUniversity: finalUniversity.trim() || undefined,
      academicScore: testScores.trim() || undefined,
      fundingPlan,
      educationLoan: needsEducationLoan ? 'Yes' : 'No',
      coSignerIncome: coApplicantIncome.trim() || undefined,
      callingStatus: callOutcome === 'Connected' ? 'Connected' : callOutcome === 'Callback Requested' ? 'Callback Scheduled' : (callOutcome as CallingStatus),
      noOfAttempts: (lead.noOfAttempts || 0) + 1,
      lastCallAt: now,
      lastCallOutcome: callOutcome,
      nextCallAt: nextCallDateTime,
      qualificationStatus,
      qualifiedBy: qualificationStatus === 'Qualified' ? lead.leadOwner || 'Vikas' : undefined,
      qualificationCompletedAt: qualificationStatus === 'Qualified' ? now : undefined,
      masterProducts: newMasterProducts,
      productOpportunities: existingOpps,
      callLogs: [newCallLog, ...lead.callLogs],
      activities: [newActivity, ...lead.activities],
      notes: callNotes ? [callNotes, ...lead.notes] : lead.notes,
      isInboundRaw: false, // Transitioned out of raw state!
      inboundCompletionPct: completionStats.pct,
      lastActionAt: now,
      lastActionBy: lead.leadOwner || 'Vikas',
      kpiStatus: 'On Track',
      readinessChecklist: {
        ...lead.readinessChecklist,
        fundingPlanReady: fundingPlan !== 'Unknown',
        admitLetterReceived: journeyStage === 'Admission Confirmed' || journeyStage === 'Visa',
      },
    };

    onSaveDiscovery(updatedLead);
    onClose();
  };

  const formatTimer = (sec: number) => {
    const mins = Math.floor(sec / 60);
    const remainder = sec % 60;
    return `${mins}:${remainder < 10 ? '0' : ''}${remainder}`;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-slate-900/60 backdrop-blur-xs animate-in fade-in overflow-y-auto">
      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl w-full max-w-4xl max-h-[94vh] flex flex-col overflow-hidden my-auto">
        
        {/* ========================================================= */}
        {/* HEADER: INBOUND ORIGIN & LIVE CALL MONITOR                */}
        {/* ========================================================= */}
        <div className="p-4 bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 text-white border-b border-slate-700">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#D91C24] flex items-center justify-center shadow-md">
                <PhoneCall className="w-5 h-5 text-white animate-pulse" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-base font-bold tracking-tight text-white">
                    First Call Discovery & Profile Enrichment
                  </h2>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-500/20 text-rose-300 border border-rose-400/30">
                    Raw Inbound Intake
                  </span>
                </div>
                <p className="text-xs text-slate-300 mt-0.5">
                  Referred by Partner <span className="font-mono text-amber-300 font-bold">{sourceCode}</span> • Linked BDE: <span className="font-semibold text-sky-300">{bdeCode}</span>
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2.5">
              {/* Call Timer pill */}
              <div className="flex items-center gap-1.5 px-3 py-1 bg-white/10 rounded-lg text-xs font-mono border border-white/15">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                <span className="text-emerald-300 font-semibold">{callActive ? 'Call Connected:' : 'Call Ended:'}</span>
                <span className="font-bold">{formatTimer(callTimerSeconds)}</span>
              </div>

              {/* Toggle Call End / Restart */}
              <button
                type="button"
                onClick={() => setCallActive(!callActive)}
                className={`px-2.5 py-1 rounded-lg text-xs font-semibold cursor-pointer transition-colors ${
                  callActive
                    ? 'bg-rose-600 hover:bg-rose-700 text-white'
                    : 'bg-emerald-600 hover:bg-emerald-700 text-white'
                }`}
                title={callActive ? 'End Call Timer' : 'Resume Call'}
              >
                {callActive ? <PhoneOff className="w-3.5 h-3.5" /> : <Phone className="w-3.5 h-3.5" />}
              </button>

              <button
                type="button"
                onClick={onClose}
                className="w-7 h-7 rounded-lg bg-white/10 hover:bg-white/20 text-slate-300 hover:text-white flex items-center justify-center transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Dynamic Completion Score Bar */}
          <div className="mt-3.5 pt-3 border-t border-slate-700/80 flex flex-wrap items-center justify-between gap-3">
            <div className="flex-1 min-w-[240px]">
              <div className="flex items-center justify-between text-xs mb-1.5">
                <span className="text-slate-300 font-medium flex items-center gap-1.5">
                  <Compass className="w-3.5 h-3.5 text-rose-400" />
                  <span>Profile Completion Progress</span>
                </span>
                <span className="font-bold text-white">
                  {completionStats.pct}% <span className="text-slate-400 font-normal">({completionStats.filled} / {completionStats.max} fields captured)</span>
                </span>
              </div>
              <div className="w-full h-2 bg-slate-700 rounded-full overflow-hidden">
                <div 
                  className={`h-full transition-all duration-500 rounded-full ${
                    completionStats.pct > 75 
                      ? 'bg-gradient-to-r from-emerald-500 to-teal-400' 
                      : completionStats.pct > 40 
                      ? 'bg-gradient-to-r from-amber-500 to-emerald-400' 
                      : 'bg-gradient-to-r from-rose-500 to-amber-500'
                  }`}
                  style={{ width: `${completionStats.pct}%` }}
                />
              </div>
            </div>

            {/* Quick Demo Helper Button */}
            <button
              type="button"
              onClick={handleAutoFillSampleDiscovery}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold text-slate-900 bg-amber-400 hover:bg-amber-300 shadow-xs transition-colors cursor-pointer"
              title="One-click simulate realistic student discovery answers"
            >
              <Sparkles className="w-3.5 h-3.5 text-slate-900" />
              <span>Auto-Fill Sample Discovery</span>
            </button>
          </div>
        </div>

        {/* ========================================================= */}
        {/* SUB-NAV FILTER TABS                                       */}
        {/* ========================================================= */}
        <div className="px-5 py-2 bg-slate-100 border-b border-slate-200 flex items-center justify-between gap-2 overflow-x-auto text-xs">
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={() => setActiveTab('all')}
              className={`px-3 py-1 rounded-md font-semibold cursor-pointer transition-colors ${
                activeTab === 'all' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              All Sections
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('contact')}
              className={`px-3 py-1 rounded-md font-semibold cursor-pointer transition-colors ${
                activeTab === 'contact' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              1. Contact & Identity
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('academics')}
              className={`px-3 py-1 rounded-md font-semibold cursor-pointer transition-colors ${
                activeTab === 'academics' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              2. Academic & Study Plan
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('financials')}
              className={`px-3 py-1 rounded-md font-semibold cursor-pointer transition-colors ${
                activeTab === 'financials' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              3. Loan & Cross-Sell
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('outcome')}
              className={`px-3 py-1 rounded-md font-semibold cursor-pointer transition-colors ${
                activeTab === 'outcome' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              4. Call Outcome & Schedule
            </button>
          </div>

          <div className="text-[11px] text-slate-500 hidden sm:block">
            Fill fields during call with student
          </div>
        </div>

        {/* ========================================================= */}
        {/* BODY: DISCOVERY SECTIONS                                  */}
        {/* ========================================================= */}
        <div className="flex-1 overflow-y-auto p-5 space-y-6">
          
          {/* BANNER: THE 6 INBOUND FIELDS (VERIFIED FROM PARTNER) */}
          <div className="bg-sky-50/70 border border-sky-200 rounded-xl p-3.5">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-sky-900 uppercase tracking-wider flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-sky-600" />
                <span>Original Inbound Data (Ingested from Partner System)</span>
              </span>
              <span className="text-[11px] font-semibold text-sky-700 bg-sky-100/70 px-2 py-0.5 rounded">
                6 Verified Fields
              </span>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5 text-xs">
              <div className="bg-white p-2 rounded-lg border border-sky-100">
                <span className="text-[10px] text-slate-500 block">Partner / Source</span>
                <span className="font-mono font-bold text-slate-900">{sourceCode}</span>
              </div>
              <div className="bg-white p-2 rounded-lg border border-sky-100">
                <span className="text-[10px] text-slate-500 block">BDE Code</span>
                <span className="font-mono font-bold text-sky-800">{bdeCode}</span>
              </div>
              <div className="bg-white p-2 rounded-lg border border-sky-100">
                <span className="text-[10px] text-slate-500 block">Student Name</span>
                <span className="font-bold text-slate-900 truncate block">{studentName}</span>
              </div>
              <div className="bg-white p-2 rounded-lg border border-sky-100">
                <span className="text-[10px] text-slate-500 block">Primary Mobile</span>
                <span className="font-mono font-bold text-slate-900">+{mobileCountryCode} {mobileNumber}</span>
              </div>
              <div className="bg-white p-2 rounded-lg border border-sky-100">
                <span className="text-[10px] text-slate-500 block">Destination</span>
                <span className="font-bold text-slate-900">{destinationCountry}</span>
              </div>
              <div className="bg-white p-2 rounded-lg border border-sky-100">
                <span className="text-[10px] text-slate-500 block">Current Status</span>
                <span className="font-semibold text-amber-600">Pending Discovery</span>
              </div>
            </div>
          </div>

          {/* SECTION 1: CONTACT & IDENTITY ENRICHMENT */}
          {(activeTab === 'all' || activeTab === 'contact') && (
            <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs space-y-3">
              <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                  <span className="w-5 h-5 rounded-full bg-slate-900 text-white flex items-center justify-center text-[10px]">1</span>
                  <span>Contact & Identity Verification</span>
                </h3>
                <span className="text-[11px] text-slate-500">Ask: "What is your best email for loan & university updates?"</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">
                    Student Email Address <span className="text-rose-500 font-bold">*</span>
                  </label>
                  <input
                    type="email"
                    placeholder="e.g. student@gmail.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 font-medium focus:bg-white focus:outline-hidden focus:border-slate-400"
                  />
                  {email && email.includes('@') && (
                    <span className="text-[10px] text-emerald-600 font-semibold mt-0.5 flex items-center gap-1">
                      <Check className="w-3 h-3" /> Valid email captured
                    </span>
                  )}
                </div>

                <div>
                  <label className="font-semibold text-slate-700 block mb-1">
                    Alternate / WhatsApp Number
                  </label>
                  <input
                    type="tel"
                    placeholder="e.g. 9811223344"
                    value={alternatePhone}
                    onChange={(e) => setAlternatePhone(e.target.value)}
                    className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 font-mono focus:bg-white focus:outline-hidden focus:border-slate-400"
                  />
                </div>

                <div>
                  <label className="font-semibold text-slate-700 block mb-1">
                    City & State
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Pune, Maharashtra"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 font-medium focus:bg-white focus:outline-hidden focus:border-slate-400"
                  />
                </div>
              </div>
            </div>
          )}

          {/* SECTION 2: ACADEMIC & DESTINATION DISCOVERY */}
          {(activeTab === 'all' || activeTab === 'academics') && (
            <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs space-y-3">
              <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                  <span className="w-5 h-5 rounded-full bg-slate-900 text-white flex items-center justify-center text-[10px]">2</span>
                  <span>Academic Profile & Study Plans</span>
                </h3>
                <span className="text-[11px] text-slate-500">Ask: "Which term are you applying for and do you have admits?"</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">
                    Target Intake Season & Year
                  </label>
                  <select
                    value={intake}
                    onChange={(e) => setIntake(e.target.value)}
                    className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 font-semibold focus:bg-white focus:outline-hidden focus:border-slate-400"
                  >
                    <option value="Fall 2025">Fall 2025 (Aug/Sep 2025)</option>
                    <option value="Spring 2026">Spring 2026 (Jan 2026)</option>
                    <option value="Fall 2026">Fall 2026</option>
                    <option value="Spring 2025">Spring 2025</option>
                  </select>
                </div>

                <div>
                  <label className="font-semibold text-slate-700 block mb-1">
                    Degree / Course Planned <span className="text-rose-500 font-bold">*</span>
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. MS in Computer Science"
                    value={course}
                    onChange={(e) => setCourse(e.target.value)}
                    className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 font-medium focus:bg-white focus:outline-hidden focus:border-slate-400"
                  />
                </div>

                <div>
                  <label className="font-semibold text-slate-700 block mb-1">
                    Current Journey Stage
                  </label>
                  <select
                    value={journeyStage}
                    onChange={(e) => setJourneyStage(e.target.value as JourneyStage)}
                    className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 font-semibold focus:bg-white focus:outline-hidden focus:border-slate-400"
                  >
                    <option value="Counseling">Counseling / Researching</option>
                    <option value="Test Preparation">Test Preparation</option>
                    <option value="Application">Applications Submitted</option>
                    <option value="Admission Confirmed">Admission Confirmed (Admits In Hand)</option>
                    <option value="Visa">Visa Stage</option>
                    <option value="Pre-Departure">Pre-Departure</option>
                  </select>
                </div>

                <div className="sm:col-span-2">
                  <label className="font-semibold text-slate-700 block mb-1">
                    Target Universities / Admits In Hand
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Arizona State University, Northeastern, UT Dallas"
                    value={targetUniversities}
                    onChange={(e) => setTargetUniversities(e.target.value)}
                    className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 font-medium focus:bg-white focus:outline-hidden focus:border-slate-400"
                  />
                </div>

                <div>
                  <label className="font-semibold text-slate-700 block mb-1">
                    Final Confirmed University (If decided)
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Arizona State University"
                    value={finalUniversity}
                    onChange={(e) => setFinalUniversity(e.target.value)}
                    className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 font-semibold focus:bg-white focus:outline-hidden focus:border-slate-400"
                  />
                </div>

                <div className="sm:col-span-3">
                  <label className="font-semibold text-slate-700 block mb-1">
                    Standardized Tests & Academic Scores
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. GRE 322, IELTS 7.5, B.Tech 8.4 CGPA"
                    value={testScores}
                    onChange={(e) => setTestScores(e.target.value)}
                    className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 font-medium focus:bg-white focus:outline-hidden focus:border-slate-400"
                  />
                </div>
              </div>
            </div>
          )}

          {/* SECTION 3: FINANCIALS & PRODUCT DISCOVERY */}
          {(activeTab === 'all' || activeTab === 'financials') && (
            <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs space-y-3">
              <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                  <span className="w-5 h-5 rounded-full bg-[#D91C24] text-white flex items-center justify-center text-[10px]">3</span>
                  <span>Financial & Product Opportunities (Zolve Cross-Sell)</span>
                </h3>
                <span className="text-[11px] text-slate-500">Ask: "Will you require an education loan for tuition/living?"</span>
              </div>

              {/* Education Loan Discovery Box */}
              <div className="p-3.5 rounded-xl border border-rose-200 bg-rose-50/40 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id="needs-education-loan-chk"
                      checked={needsEducationLoan}
                      onChange={(e) => setNeedsEducationLoan(e.target.checked)}
                      className="w-4 h-4 text-[#D91C24] rounded border-slate-300 focus:ring-rose-500"
                    />
                    <label htmlFor="needs-education-loan-chk" className="font-bold text-slate-900 text-xs cursor-pointer flex items-center gap-1">
                      <GraduationCap className="w-4 h-4 text-[#D91C24]" />
                      <span>Student Requires Education Loan</span>
                    </label>
                  </div>
                  <span className="text-[11px] font-bold text-[#D91C24] bg-white px-2 py-0.5 rounded border border-rose-200">
                    High Priority Deal
                  </span>
                </div>

                {needsEducationLoan && (
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs pt-2 border-t border-rose-100">
                    <div>
                      <label className="font-semibold text-slate-700 block mb-1">Estimated Loan Amount</label>
                      <input
                        type="text"
                        value={loanAmount}
                        onChange={(e) => setLoanAmount(e.target.value)}
                        placeholder="e.g. $50,000 / ₹42 Lakhs"
                        className="w-full p-2 bg-white border border-rose-200 rounded-lg font-bold text-slate-900"
                      />
                    </div>

                    <div>
                      <label className="font-semibold text-slate-700 block mb-1">Co-Signer & Annual Income</label>
                      <input
                        type="text"
                        value={coApplicantIncome}
                        onChange={(e) => setCoApplicantIncome(e.target.value)}
                        placeholder="e.g. Father (₹18 LPA)"
                        className="w-full p-2 bg-white border border-rose-200 rounded-lg font-medium text-slate-900"
                      />
                    </div>

                    <div>
                      <label className="font-semibold text-slate-700 block mb-1">Collateral Preference</label>
                      <select
                        value={collateralPreference}
                        onChange={(e) => setCollateralPreference(e.target.value as any)}
                        className="w-full p-2 bg-white border border-rose-200 rounded-lg font-medium text-slate-900"
                      >
                        <option value="Unsecured (No Collateral)">Unsecured (No Collateral)</option>
                        <option value="Secured (Property/FD)">Secured (Property / FD)</option>
                      </select>
                    </div>
                  </div>
                )}
              </div>

              {/* Additional Zolve Products */}
              <div>
                <label className="font-semibold text-slate-700 block mb-2 text-xs">
                  Cross-Sell Product Interests:
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                  <label className={`p-2.5 rounded-lg border flex items-center gap-2 cursor-pointer transition-colors ${
                    bankAccountInterest ? 'bg-emerald-50 border-emerald-300 text-emerald-900' : 'bg-slate-50 border-slate-200 text-slate-700'
                  }`}>
                    <input
                      type="checkbox"
                      checked={bankAccountInterest}
                      onChange={(e) => setBankAccountInterest(e.target.checked)}
                      className="w-3.5 h-3.5 text-emerald-600 rounded"
                    />
                    <span className="font-semibold">US Bank Account</span>
                  </label>

                  <label className={`p-2.5 rounded-lg border flex items-center gap-2 cursor-pointer transition-colors ${
                    forexInterest ? 'bg-blue-50 border-blue-300 text-blue-900' : 'bg-slate-50 border-slate-200 text-slate-700'
                  }`}>
                    <input
                      type="checkbox"
                      checked={forexInterest}
                      onChange={(e) => setForexInterest(e.target.checked)}
                      className="w-3.5 h-3.5 text-blue-600 rounded"
                    />
                    <span className="font-semibold">Forex / Remittance</span>
                  </label>

                  <label className={`p-2.5 rounded-lg border flex items-center gap-2 cursor-pointer transition-colors ${
                    accommodationInterest ? 'bg-amber-50 border-amber-300 text-amber-900' : 'bg-slate-50 border-slate-200 text-slate-700'
                  }`}>
                    <input
                      type="checkbox"
                      checked={accommodationInterest}
                      onChange={(e) => setAccommodationInterest(e.target.checked)}
                      className="w-3.5 h-3.5 text-amber-600 rounded"
                    />
                    <span className="font-semibold">Accommodation</span>
                  </label>

                  <label className={`p-2.5 rounded-lg border flex items-center gap-2 cursor-pointer transition-colors ${
                    esimInterest ? 'bg-purple-50 border-purple-300 text-purple-900' : 'bg-slate-50 border-slate-200 text-slate-700'
                  }`}>
                    <input
                      type="checkbox"
                      checked={esimInterest}
                      onChange={(e) => setEsimInterest(e.target.checked)}
                      className="w-3.5 h-3.5 text-purple-600 rounded"
                    />
                    <span className="font-semibold">US eSIM Plan</span>
                  </label>
                </div>
              </div>
            </div>
          )}

          {/* SECTION 4: CALL OUTCOME & NEXT ACTION */}
          {(activeTab === 'all' || activeTab === 'outcome') && (
            <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs space-y-3">
              <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                  <span className="w-5 h-5 rounded-full bg-slate-900 text-white flex items-center justify-center text-[10px]">4</span>
                  <span>Call Outcome, Notes & Follow-Up Schedule</span>
                </h3>
                <span className="text-[11px] text-slate-500">Record conversation summary & next step</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">
                    Call Outcome Status
                  </label>
                  <select
                    value={callOutcome}
                    onChange={(e) => setCallOutcome(e.target.value as LastCallOutcome)}
                    className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg font-bold text-slate-900"
                  >
                    <option value="Connected">🟢 Connected & Qualified</option>
                    <option value="Callback Requested">🟡 Callback Requested</option>
                    <option value="RNR">🟠 RNR (Ringing No Response)</option>
                    <option value="Busy">🔴 Busy / Call Waiting</option>
                    <option value="Not Interested">⚪ Not Interested</option>
                  </select>
                </div>

                <div>
                  <label className="font-semibold text-slate-700 block mb-1">
                    Lead Qualification
                  </label>
                  <select
                    value={qualificationStatus}
                    onChange={(e) => setQualificationStatus(e.target.value as QualificationStatus)}
                    className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg font-bold text-slate-900"
                  >
                    <option value="Qualified">Qualified (Ready for Products)</option>
                    <option value="Pending">Pending Evaluation</option>
                    <option value="Not Qualified">Not Qualified</option>
                  </select>
                </div>

                <div>
                  <label className="font-semibold text-slate-700 block mb-1">
                    Next Follow-Up Call
                  </label>
                  <input
                    type="text"
                    value={nextCallDateTime}
                    onChange={(e) => setNextCallDateTime(e.target.value)}
                    placeholder="e.g. Tomorrow at 3:30 PM"
                    className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg font-semibold text-slate-900"
                  />
                </div>

                <div className="sm:col-span-3">
                  <label className="font-semibold text-slate-700 block mb-1">
                    RM Discovery Notes & Key Highlights
                  </label>
                  <textarea
                    rows={3}
                    value={callNotes}
                    onChange={(e) => setCallNotes(e.target.value)}
                    placeholder="Document student's loan requirements, admit status, co-signer details, and agreed next steps..."
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 font-medium focus:bg-white focus:outline-hidden focus:border-slate-400"
                  />
                </div>
              </div>
            </div>
          )}
        </div>

        {/* ========================================================= */}
        {/* FOOTER: ACTIONS & SAVE COMMIT                              */}
        {/* ========================================================= */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex flex-wrap items-center justify-between gap-3">
          <div className="text-xs text-slate-600">
            Committing will update <span className="font-semibold text-slate-900">{completionStats.filled} fields</span>, log call activity, and advance lead stage.
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-700 hover:text-slate-900 hover:bg-slate-200/70 rounded-lg transition-colors cursor-pointer"
            >
              Cancel / Discard
            </button>
            <button
              type="button"
              onClick={handleSaveAndEnrich}
              className="inline-flex items-center gap-1.5 px-5 py-2 text-xs font-bold text-white bg-[#D91C24] hover:bg-[#B30018] rounded-lg shadow-md transition-colors cursor-pointer"
              id="btn-confirm-save-discovery"
            >
              <Check className="w-4 h-4" />
              <span>Save & Enrich Lead Profile ({completionStats.pct}%)</span>
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
