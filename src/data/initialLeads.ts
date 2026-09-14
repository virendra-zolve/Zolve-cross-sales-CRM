import { StudentLead, MasterProduct } from '../types';

const defaultMasterProducts = (activeKeys: MasterProduct[] = []): Record<MasterProduct, boolean> => {
  const all: MasterProduct[] = [
    'Education Loan', 'Refinance', 'Test Prep', 'Test Voucher',
    'Admissions', 'Accommodation', 'eSIM', 'Travel / Flights',
    'Bank Account', 'Credit Card', 'Money Transfer', 'NRE/NRO Account', 'Insurance'
  ];
  const map: Partial<Record<MasterProduct, boolean>> = {};
  all.forEach(k => {
    map[k] = activeKeys.includes(k);
  });
  return map as Record<MasterProduct, boolean>;
};

const defaultAcademicBackground = () => ({
  tenthGrade: { board: '', schoolName: '', passingYear: '', percentage: '' },
  twelfthGrade: { board: '', schoolName: '', stream: '', passingYear: '', percentage: '' },
  undergraduate: { college: '', degree: '', specialisation: '', startYear: '', graduationYear: '', percentage: '' },
  postgraduate: { college: '', degree: '', specialisation: '', startYear: '', graduationYear: '', percentage: '' },
  workExperience: { totalExperience: '', currentEmployer: '', role: '', details: '' },
  tests: {
    english: { testName: '', score: '', testDate: '' },
    aptitude: { testName: '', score: '', testDate: '' }
  },
  achievements: ''
});

// Ensure all leads have academicBackground field
const ensureAcademicBackground = (lead: StudentLead): StudentLead => ({
  ...lead,
  academicBackground: lead.academicBackground || defaultAcademicBackground()
});

export const INITIAL_LEADS: StudentLead[] = [
  {
    id: 'L000199',
    sourceCode: 'KC_OVERSEAS_P01',
    partnerCode: 'KC_OVERSEAS_P01',
    bdeCode: 'BDE_PRIYA',
    studentName: 'Rohan Sengupta',
    mobileNumber: '9876543210',
    mobileCountryCode: '91',
    destinationCountry: 'USA',
    email: '',
    universitiesOfInterest: [],
    course: '',
    intake: '',
    journeyStage: 'Unknown',
    testsInterestedIn: [],
    fundingPlan: 'Unknown',
    educationLoan: 'No',
    isInboundRaw: true,
    inboundCompletionPct: 21,
    createdAt: 'Just now (12m ago)',
    signupStatus: 'Not Signed Up',
    customerId: 'na',
    leadOwnerTeam: 'Education Loan Team',
    leadOwner: 'Vikas',
    leadAssignedAt: 'Just now',
    leadAssignedBy: 'Automated Partner Router',
    assignmentHistory: [
      { id: 'as_199', assignedAt: 'Just now', assignedBy: 'Automated Partner Router', team: 'Education Loan Team', owner: 'Vikas' }
    ],
    qualificationStatus: 'Pending',
    readinessChecklist: {
      passportValid: false,
      admitLetterReceived: false,
      fundingPlanReady: false,
      englishTestPassed: false,
    },
    academicBackground: defaultAcademicBackground(),
    callingStatus: 'Not Attempted',
    noOfAttempts: 0,
    nextCallAt: 'Immediate (First Contact SLA: 18m)',
    callLogs: [],
    masterProducts: defaultMasterProducts([]),
    productOpportunities: [],
    leadStatus: 'Active',
    kpiStatus: 'On Track',
    escalationStatus: 'Not Escalated',
    lastActionAt: 'Just now',
    lastActionBy: 'Partner Inbound Webhook',
    noActionSince: '12m ago',
    notes: ['Inbound partner intake received with 6 core fields. First discovery call pending.'],
    activities: [
      {
        id: 'act_199_1',
        timestamp: new Date().toISOString(),
        actor: 'Partner Inbound API',
        type: 'system',
        title: 'Fresh Inbound Lead Ingested via KC_OVERSEAS_P01',
        description: 'Received 6 mandatory intake fields (Partner: KC_OVERSEAS_P01, BDE: BDE_PRIYA, Destination: USA). Awaiting first discovery call.'
      }
    ]
  },
  {
    id: 'L000198',
    sourceCode: 'EDWISE_MUM_02',
    partnerCode: 'EDWISE_MUM_02',
    bdeCode: 'BDE_ROHIT',
    studentName: 'Ananya Deshmukh',
    mobileNumber: '9822001122',
    mobileCountryCode: '91',
    destinationCountry: 'Canada',
    email: '',
    universitiesOfInterest: [],
    course: '',
    intake: '',
    journeyStage: 'Unknown',
    testsInterestedIn: [],
    fundingPlan: 'Unknown',
    educationLoan: 'No',
    isInboundRaw: true,
    inboundCompletionPct: 21,
    createdAt: '35m ago',
    signupStatus: 'Not Signed Up',
    customerId: 'na',
    leadOwnerTeam: 'Education Loan Team',
    leadOwner: 'Vikas',
    leadAssignedAt: '35m ago',
    leadAssignedBy: 'Automated Partner Router',
    assignmentHistory: [
      { id: 'as_198', assignedAt: '35m ago', assignedBy: 'Automated Partner Router', team: 'Education Loan Team', owner: 'Vikas' }
    ],
    qualificationStatus: 'Pending',
    readinessChecklist: {
      passportValid: false,
      admitLetterReceived: false,
      fundingPlanReady: false,
      englishTestPassed: false,
    },
    academicBackground: defaultAcademicBackground(),
    callingStatus: 'Not Attempted',
    noOfAttempts: 0,
    nextCallAt: 'Within SLA (25m)',
    callLogs: [],
    masterProducts: defaultMasterProducts([]),
    productOpportunities: [],
    leadStatus: 'Active',
    kpiStatus: 'On Track',
    escalationStatus: 'Not Escalated',
    lastActionAt: '35m ago',
    lastActionBy: 'Partner Inbound Webhook',
    noActionSince: '35m ago',
    notes: ['Inbound partner intake from Edwise. Destination Canada.'],
    activities: [
      {
        id: 'act_198_1',
        timestamp: new Date().toISOString(),
        actor: 'Partner Inbound API',
        type: 'system',
        title: 'Fresh Inbound Lead Ingested via EDWISE_MUM_02',
        description: 'Received 6 mandatory intake fields (Partner: EDWISE_MUM_02, BDE: BDE_ROHIT, Destination: Canada).'
      }
    ]
  },
  {
    id: '123',
    sourceCode: 'a',
    studentName: 'abc',
    mobileNumber: '12',
    mobileCountryCode: '91',
    destinationCountry: 'USA, UK',
    finalCountry: 'USA',
    email: 'xyz.com',
    universitiesOfInterest: ['ASU', 'KYC', 'ABC'],
    finalUniversity: 'ASU',
    course: 'masters',
    intake: 'fall 2026',
    journeyStage: 'Admission Confirmed',
    testsInterestedIn: ['IELTS'],
    fundingPlan: 'Self Fund',
    educationLoan: 'Yes',

    createdAt: '25/04',
    signupStatus: 'Not Signed Up',
    customerId: 'na',

    leadOwnerTeam: 'Zolve',
    leadOwner: 'Vikas',
    leadAssignedAt: '25/08',
    leadAssignedBy: 'Ritik',
    assignmentHistory: [
      { id: 'as_123', assignedAt: '25/08', assignedBy: 'Ritik', team: 'Zolve', owner: 'Vikas' }
    ],

    qualificationStatus: 'Qualified',
    qualifiedBy: 'Saloni',
    qualificationCompletedAt: '25/08',
    readinessChecklist: {
      passportValid: true,
      admitLetterReceived: true,
      fundingPlanReady: true,
      englishTestPassed: true,
    },
    coSignerIncome: '₹22 LPA',
    academicScore: 'IELTS 7.5',

    callingStatus: 'Connected',
    noOfAttempts: 3,
    lastCallAt: '25/08',
    lastCallOutcome: 'Converted',
    nextCallAt: '09/09',
    callLogs: [
      { id: 'c_123', timestamp: '25/08', rmName: 'Vikas', durationSeconds: 320, outcome: 'Converted', notes: 'Converted to active admission application & loan file.' }
    ],

    masterProducts: defaultMasterProducts(['Education Loan', 'Bank Account']),
    productOpportunities: [
      { id: 'p_123_1', product: 'Education Loan', status: 'In Progress', amount: '$55,000', partner: 'Avanse', createdAt: '25/08' }
    ],

    leadStatus: 'Active',
    kpiStatus: 'On Track',
    escalationStatus: 'Not Escalated',
    lastActionAt: '25/08',
    lastActionBy: 'Vikas',
    noActionSince: 'Today',
    notes: ['Converted to active loan & admission file.'],
    activities: [
      { id: 'act_123_1', timestamp: '25/08', actor: 'Vikas', type: 'call', title: 'Call Connected & Converted', description: 'Student enrolled for Fall 2026 masters at ASU.' }
    ]
  },
  {
    id: '1234',
    sourceCode: 'a',
    studentName: 'abc',
    mobileNumber: '12',
    mobileCountryCode: '91',
    destinationCountry: 'USA, UK',
    finalCountry: 'UK',
    email: 'xyz.com',
    universitiesOfInterest: ['NYU', 'ASU', 'KYC', 'ABC'],
    finalUniversity: 'NYU',
    course: 'Masters',
    intake: 'Spring 2027',
    journeyStage: 'Visa',
    testsInterestedIn: ['GRE'],
    fundingPlan: 'Will Need Loan',
    educationLoan: 'Yes',

    createdAt: '09/09',
    signupStatus: 'Not Signed Up',
    customerId: 'na',

    leadOwnerTeam: 'Zolve',
    leadOwner: 'Unassigned',
    leadAssignedAt: '09/09',
    leadAssignedBy: '',
    assignmentHistory: [],

    qualificationStatus: 'Not Qualified',
    qualifiedBy: 'Saloni',
    qualificationCompletedAt: '09/09',
    readinessChecklist: {
      passportValid: true,
      admitLetterReceived: false,
      fundingPlanReady: false,
      englishTestPassed: false,
    },

    callingStatus: 'Connected',
    noOfAttempts: 1,
    lastCallAt: '09/09',
    lastCallOutcome: 'Deferred',
    nextCallAt: '09/09',
    callLogs: [
      { id: 'c_1234', timestamp: '09/09', rmName: 'Saloni', durationSeconds: 150, outcome: 'Deferred', notes: 'Deferred to Spring 2027.' }
    ],

    masterProducts: defaultMasterProducts(['Education Loan']),
    productOpportunities: [
      { id: 'p_1234_1', product: 'Education Loan', status: 'Interested', amount: '$45,000', partner: 'HDFC Credila', createdAt: '09/09' }
    ],

    leadStatus: 'Active',
    kpiStatus: 'On Track',
    escalationStatus: 'Not Escalated',
    lastActionAt: '09/09',
    lastActionBy: 'Saloni',
    noActionSince: 'Today',
    notes: ['Target intake deferred to Spring 2027.'],
    activities: [
      { id: 'act_1234_1', timestamp: '09/09', actor: 'Saloni', type: 'call', title: 'Call Connected – Deferred', description: 'Target intake deferred to Spring 2027.' }
    ]
  },
  {
    id: '12345',
    sourceCode: 'a',
    studentName: 'abc',
    mobileNumber: '12',
    mobileCountryCode: '91',
    destinationCountry: 'Canada',
    finalCountry: 'Canada',
    email: 'abc.canada@footwork.com',
    universitiesOfInterest: ['Seneca College', 'Centennial'],
    finalUniversity: 'Seneca College',
    course: 'Post-Grad Diploma',
    intake: 'Winter 2026',
    journeyStage: 'Counseling',
    testsInterestedIn: ['IELTS'],
    fundingPlan: 'Will Need Loan',
    educationLoan: 'No',

    createdAt: '05/09',
    signupStatus: 'Not Signed Up',
    customerId: 'na',

    leadOwnerTeam: 'Footwork',
    leadOwner: 'Unassigned',
    leadAssignedAt: '05/09',
    leadAssignedBy: '',
    assignmentHistory: [],

    qualificationStatus: 'Pending',
    readinessChecklist: {
      passportValid: true,
      admitLetterReceived: false,
      fundingPlanReady: false,
      englishTestPassed: false,
    },

    callingStatus: 'Not Attempted',
    noOfAttempts: 0,
    nextCallAt: '09/09',
    callLogs: [],

    masterProducts: defaultMasterProducts(['Admissions']),
    productOpportunities: [],

    leadStatus: 'Active',
    kpiStatus: 'Overdue',
    kpiOverdueMinutes: 90,
    escalationStatus: 'Escalated',
    lastActionAt: '05/09',
    lastActionBy: 'System',
    noActionSince: '4 days ago',
    notes: ['Pending first attempt call - breached response KPI.'],
    activities: [
      { id: 'act_12345_1', timestamp: '05/09', actor: 'System', type: 'system', title: 'Lead Ingested from Footwork', description: 'Pending first calling attempt.' }
    ]
  },
  {
    id: '12346',
    sourceCode: 'a',
    studentName: 'abc',
    mobileNumber: '12',
    mobileCountryCode: '91',
    destinationCountry: 'Germany',
    finalCountry: 'Germany',
    email: 'abc.germany@footwork.com',
    universitiesOfInterest: ['TU Munich', 'RWTH Aachen'],
    finalUniversity: 'TU Munich',
    course: 'M.Sc Automotive Engineering',
    intake: 'Winter 2026',
    journeyStage: 'Admission Confirmed',
    testsInterestedIn: ['IELTS', 'TestDaF'],
    fundingPlan: 'Self Fund',
    educationLoan: 'No',

    createdAt: '08/09',
    signupStatus: 'Not Signed Up',
    customerId: 'na',

    leadOwnerTeam: 'Footwork',
    leadOwner: 'John',
    leadAssignedAt: '25/08',
    leadAssignedBy: 'Ritik',
    assignmentHistory: [
      { id: 'as_12346', assignedAt: '25/08', assignedBy: 'Ritik', team: 'Footwork', owner: 'John' }
    ],

    qualificationStatus: 'Qualified',
    qualifiedBy: 'Saloni',
    qualificationCompletedAt: '25/08',
    readinessChecklist: {
      passportValid: true,
      admitLetterReceived: true,
      fundingPlanReady: true,
      englishTestPassed: true,
    },

    callingStatus: 'Connected',
    noOfAttempts: 2,
    lastCallAt: '25/08',
    lastCallOutcome: 'Connected',
    nextCallAt: '10/09',
    callLogs: [
      { id: 'c_12346', timestamp: '25/08', rmName: 'John', durationSeconds: 210, outcome: 'Connected', notes: 'Blocked account requirements discussed.' }
    ],

    masterProducts: defaultMasterProducts(['Bank Account', 'Insurance']),
    productOpportunities: [
      { id: 'p_12346_1', product: 'Bank Account', status: 'In Progress', details: 'German Blocked Account', createdAt: '25/08' }
    ],

    leadStatus: 'Active',
    kpiStatus: 'On Track',
    escalationStatus: 'Not Escalated',
    lastActionAt: '25/08',
    lastActionBy: 'John',
    noActionSince: 'Yesterday',
    notes: ['Blocked account documentation requested.'],
    activities: [
      { id: 'act_12346_1', timestamp: '25/08', actor: 'John', type: 'call', title: 'Call Connected – Blocked Account', description: 'Guided student for German blocked account setup.' }
    ]
  },
  {
    id: 'L000101',
    sourceCode: 'PARTNER001',
    studentName: 'Rahul Sharma',
    mobileNumber: '9820011223',
    mobileCountryCode: '91',
    email: 'rahul.sharma@gmail.com',
    destinationCountry: 'USA',
    finalCountry: 'USA',
    universitiesOfInterest: ['Northeastern University', 'Boston University'],
    finalUniversity: 'Northeastern University',
    course: 'M.S. in Information Systems',
    intake: 'Fall 2026',
    journeyStage: 'Application',
    testsInterestedIn: ['GRE', 'IELTS'],
    fundingPlan: 'Will Need Loan',
    
    createdAt: '2026-09-09T03:00:00Z',
    signupStatus: 'Signed Up',
    customerId: 'C000101',

    leadOwnerTeam: 'Education Loan Team',
    leadOwner: 'Virendra (You)',
    leadAssignedAt: '2026-09-09T03:15:00Z',
    leadAssignedBy: 'System Auto-Route',
    assignmentHistory: [
      { id: 'as_r1', assignedAt: '2026-09-09T03:15:00Z', assignedBy: 'System', team: 'Education Loan Team', owner: 'Virendra (You)' }
    ],

    qualificationStatus: 'Qualified',
    readinessChecklist: {
      passportValid: true,
      admitLetterReceived: true,
      fundingPlanReady: true,
      englishTestPassed: true,
    },
    coSignerIncome: '₹24 LPA',
    academicScore: 'GRE 318 / IELTS 7.5',

    callingStatus: 'Callback Scheduled',
    noOfAttempts: 2,
    lastCallAt: '2026-09-08T18:00:00Z',
    lastCallOutcome: 'Callback Requested',
    nextCallAt: '2026-09-09T10:30:00Z',
    callLogs: [
      { id: 'c_r1', timestamp: '2026-09-08T18:00:00Z', rmName: 'Virendra (You)', durationSeconds: 180, outcome: 'Callback Requested', notes: 'Callback requested at 10:30 AM to discuss Avanse loan sanction terms.', scheduledNextCall: '2026-09-09T10:30:00Z' }
    ],

    masterProducts: defaultMasterProducts(['Education Loan', 'Bank Account', 'Credit Card']),
    productOpportunities: [
      { id: 'p_r1', product: 'Education Loan', status: 'In Progress', amount: '$52,000', partner: 'Avanse', details: 'Avanse co-signer sanction pending', createdAt: '2026-09-09T03:15:00Z' },
      { id: 'p_r2', product: 'Bank Account', status: 'Interested', details: 'US Checking account', createdAt: '2026-09-09T03:15:00Z' },
    ],

    leadStatus: 'Active',
    kpiStatus: 'Overdue',
    kpiOverdueMinutes: 30,
    lastActionAt: '2026-09-08T18:00:00Z',
    lastActionBy: 'Virendra',
    noActionSince: '2026-09-08T18:00:00Z',
    escalationStatus: 'Escalated',
    escalatedTo: 'Manager Rahul',

    activities: [
      { id: 'act_r1', timestamp: '2026-09-09T10:42:00Z', actor: 'Virendra', type: 'call', title: 'Call completed – Rahul Sharma', description: 'Discussed loan sanction letter with student.' },
      { id: 'act_r2', timestamp: '2026-09-09T10:20:00Z', actor: 'Virendra', type: 'product_update', title: 'Education Loan status → Documents Pending', description: 'Awaiting co-signer ITR copy.' }
    ],
    notes: ['Avanse co-signer documents required today.']
  },
  {
    id: 'L000102',
    sourceCode: 'PARTNER004',
    studentName: 'Ankit Kumar',
    mobileNumber: '9819234567',
    mobileCountryCode: '91',
    email: 'ankit.kumar99@gmail.com',
    destinationCountry: 'USA',
    finalCountry: 'USA',
    universitiesOfInterest: ['Arizona State University', 'UT Dallas'],
    finalUniversity: 'Arizona State University',
    course: 'M.S. in Computer Science',
    intake: 'Fall 2026',
    journeyStage: 'Counseling',
    testsInterestedIn: ['IELTS'],
    fundingPlan: 'Will Need Loan',

    createdAt: '2026-09-09T02:30:00Z',
    signupStatus: 'Not Signed Up',

    leadOwnerTeam: 'Education Loan Team',
    leadOwner: 'Virendra (You)',
    leadAssignedAt: '2026-09-09T04:00:00Z',
    leadAssignedBy: 'System Auto-Route',
    assignmentHistory: [
      { id: 'as_ak1', assignedAt: '2026-09-09T04:00:00Z', assignedBy: 'System', team: 'Education Loan Team', owner: 'Virendra (You)' }
    ],

    qualificationStatus: 'Pending',
    readinessChecklist: {
      passportValid: true,
      admitLetterReceived: false,
      fundingPlanReady: false,
      englishTestPassed: true,
    },
    coSignerIncome: '₹18 LPA',

    callingStatus: 'RNR',
    noOfAttempts: 1,
    lastCallAt: '2026-09-09T08:00:00Z',
    lastCallOutcome: 'RNR',
    nextCallAt: '2026-09-09T09:00:00Z',
    callLogs: [
      { id: 'c_ak1', timestamp: '2026-09-09T08:00:00Z', rmName: 'Virendra (You)', durationSeconds: 25, outcome: 'RNR', notes: 'Ringing no response. Scheduled 2nd attempt for today.', scheduledNextCall: '2026-09-09T09:00:00Z' }
    ],

    masterProducts: defaultMasterProducts(['Education Loan']),
    productOpportunities: [
      { id: 'p_ak1', product: 'Education Loan', status: 'In Progress', amount: '$45,000', partner: 'InCred', details: 'Unsecured loan eligibility check', createdAt: '2026-09-09T04:00:00Z' }
    ],

    leadStatus: 'Active',
    kpiStatus: 'Overdue',
    kpiOverdueMinutes: 15,
    lastActionAt: '2026-09-09T08:00:00Z',
    lastActionBy: 'Virendra',
    noActionSince: '2026-09-09T08:00:00Z',
    escalationStatus: 'Not Escalated',

    activities: [
      { id: 'act_ak1', timestamp: '2026-09-09T08:00:00Z', actor: 'Virendra', type: 'call', title: 'Outbound Call - RNR', description: 'No answer on 1st call attempt.' }
    ],
    notes: ['RNR on morning attempt. Due for immediate 2nd try.']
  },
  {
    id: 'L000103',
    sourceCode: 'PARTNER012',
    studentName: 'Priya Singh',
    mobileNumber: '9711894455',
    mobileCountryCode: '91',
    email: 'priya.singh@gmail.com',
    destinationCountry: 'USA',
    finalCountry: 'USA',
    universitiesOfInterest: ['NYU Stern', 'Columbia'],
    finalUniversity: 'NYU Stern',
    course: 'MBA / Business Analytics',
    intake: 'Fall 2026',
    journeyStage: 'Admission Confirmed',
    testsInterestedIn: ['GMAT'],
    fundingPlan: 'Self Fund',

    createdAt: '2026-09-08T14:00:00Z',
    signupStatus: 'Signed Up',
    customerId: 'C000103',

    leadOwnerTeam: 'Education Loan Team',
    leadOwner: 'Virendra (You)',
    leadAssignedAt: '2026-09-08T15:00:00Z',
    leadAssignedBy: 'System Auto-Route',
    assignmentHistory: [
      { id: 'as_ps1', assignedAt: '2026-09-08T15:00:00Z', assignedBy: 'System', team: 'Education Loan Team', owner: 'Virendra (You)' }
    ],

    qualificationStatus: 'Qualified',
    readinessChecklist: {
      passportValid: true,
      admitLetterReceived: true,
      fundingPlanReady: true,
      englishTestPassed: true,
    },
    coSignerIncome: '₹40 LPA',

    callingStatus: 'Connected',
    noOfAttempts: 2,
    lastCallAt: '2026-09-08T16:30:00Z',
    lastCallOutcome: 'Connected',
    nextCallAt: '2026-09-09T14:00:00Z',
    callLogs: [
      { id: 'c_ps1', timestamp: '2026-09-08T16:30:00Z', rmName: 'Virendra (You)', durationSeconds: 210, outcome: 'Connected', notes: 'Discussed tuition remittance rates for NYU Stern deposit.', scheduledNextCall: '2026-09-09T14:00:00Z' }
    ],

    masterProducts: defaultMasterProducts(['Money Transfer', 'Bank Account', 'Credit Card']),
    productOpportunities: [
      { id: 'p_ps1', product: 'Money Transfer', status: 'In Progress', amount: '$35,000', details: 'Remittance for NYU Stern tuition deposit', createdAt: '2026-09-08T16:30:00Z' },
      { id: 'p_ps2', product: 'Bank Account', status: 'Completed / Sold', details: 'US Checking account provisioned', createdAt: '2026-09-08T16:30:00Z' }
    ],

    leadStatus: 'Active',
    kpiStatus: 'On Track',
    lastActionAt: '2026-09-08T16:30:00Z',
    lastActionBy: 'Virendra',
    noActionSince: '2026-09-08T16:30:00Z',
    escalationStatus: 'Not Escalated',

    activities: [
      { id: 'act_ps1', timestamp: '2026-09-08T16:30:00Z', actor: 'Virendra', type: 'call', title: 'Remittance Consultation Call', description: 'Scheduled follow-up at 2:00 PM for wire setup.' }
    ],
    notes: ['High-value remittance client. Call at 2:00 PM.']
  },
  {
    id: 'L000104',
    sourceCode: 'PARTNER019',
    studentName: 'Aman Gupta',
    mobileNumber: '9833019822',
    mobileCountryCode: '91',
    email: 'aman.gupta@gmail.com',
    destinationCountry: 'USA',
    finalCountry: 'USA',
    universitiesOfInterest: ['University of Illinois Urbana-Champaign'],
    finalUniversity: 'University of Illinois Urbana-Champaign',
    course: 'M.S. in Mechanical Engineering',
    intake: 'Fall 2026',
    journeyStage: 'Pre-Departure',
    testsInterestedIn: ['GRE', 'TOEFL'],
    fundingPlan: 'Will Need Loan',

    createdAt: '2026-09-09T01:00:00Z',
    signupStatus: 'Signed Up',
    customerId: 'C000104',

    leadOwnerTeam: 'Education Loan Team',
    leadOwner: 'Virendra (You)',
    leadAssignedAt: '2026-09-09T02:00:00Z',
    leadAssignedBy: 'System Auto-Route',
    assignmentHistory: [
      { id: 'as_ag1', assignedAt: '2026-09-09T02:00:00Z', assignedBy: 'System', team: 'Education Loan Team', owner: 'Virendra (You)' }
    ],

    qualificationStatus: 'Qualified',
    readinessChecklist: {
      passportValid: true,
      admitLetterReceived: true,
      fundingPlanReady: true,
      englishTestPassed: true,
    },

    callingStatus: 'Not Attempted',
    noOfAttempts: 0,
    nextCallAt: '2026-09-09T16:30:00Z',
    callLogs: [],

    masterProducts: defaultMasterProducts(['Accommodation', 'eSIM', 'Insurance']),
    productOpportunities: [
      { id: 'p_ag1', product: 'Accommodation', status: 'In Progress', details: 'Amber student housing booking near UIUC campus', createdAt: '2026-09-09T02:00:00Z' },
      { id: 'p_ag2', product: 'eSIM', status: 'Interested', details: 'US SIM card', createdAt: '2026-09-09T02:00:00Z' }
    ],

    leadStatus: 'Active',
    kpiStatus: 'On Track',
    lastActionAt: '2026-09-09T02:00:00Z',
    lastActionBy: 'System',
    noActionSince: '2026-09-09T02:00:00Z',
    escalationStatus: 'Not Escalated',

    activities: [
      { id: 'act_ag1', timestamp: '2026-09-09T10:12:00Z', actor: 'Virendra', type: 'system', title: 'Next call scheduled – Aman Gupta', description: 'Scheduled accommodation review call for 4:30 PM today.' }
    ],
    notes: ['Looking for 1-bedroom apartment or student dorm near Green Street.']
  },
  {
    id: 'L000105',
    sourceCode: 'PARTNER023',
    studentName: 'Neha Patel',
    mobileNumber: '9722301944',
    mobileCountryCode: '91',
    email: 'neha.patel@gmail.com',
    destinationCountry: 'Canada',
    finalCountry: 'Canada',
    universitiesOfInterest: ['University of British Columbia'],
    finalUniversity: 'University of British Columbia',
    course: 'Master of Data Science',
    intake: 'Fall 2026',
    journeyStage: 'Application',
    testsInterestedIn: ['IELTS'],
    fundingPlan: 'Will Need Loan',

    createdAt: '2026-09-09T09:40:00Z',
    signupStatus: 'Not Signed Up',

    leadOwnerTeam: 'Education Loan Team',
    leadOwner: 'Priya Patel',
    leadAssignedAt: '2026-09-09T10:05:00Z', // 25 min ago
    leadAssignedBy: 'System Auto-Route',
    assignmentHistory: [
      { id: 'as_np1', assignedAt: '2026-09-09T10:05:00Z', assignedBy: 'System', team: 'Education Loan Team', owner: 'Priya Patel' }
    ],

    qualificationStatus: 'Pending',
    readinessChecklist: {
      passportValid: true,
      admitLetterReceived: false,
      fundingPlanReady: false,
      englishTestPassed: true,
    },

    callingStatus: 'Not Attempted',
    noOfAttempts: 0,
    nextCallAt: '2026-09-09T11:00:00Z',
    callLogs: [],

    masterProducts: defaultMasterProducts(['Education Loan', 'Money Transfer']),
    productOpportunities: [
      { id: 'p_np1', product: 'Education Loan', status: 'Interested', details: 'InCred SDS loan for UBC', createdAt: '2026-09-09T10:05:00Z' }
    ],

    leadStatus: 'Active',
    kpiStatus: 'On Track',
    lastActionAt: '2026-09-09T10:05:00Z',
    lastActionBy: 'System',
    noActionSince: '2026-09-09T10:05:00Z',
    escalationStatus: 'Not Escalated',

    activities: [
      { id: 'act_np1', timestamp: '2026-09-09T10:35:00Z', actor: 'System', type: 'assignment', title: 'Lead assigned – Neha Patel', description: 'Assigned to Virendra from PARTNER023.' }
    ],
    notes: ['Assigned 25 min ago from PARTNER023. Canada intake.']
  },
  {
    id: 'L000106',
    sourceCode: 'PARTNER008',
    studentName: 'Arjun Mehta',
    mobileNumber: '9844019283',
    mobileCountryCode: '91',
    email: 'arjun.mehta@gmail.com',
    destinationCountry: 'UK',
    finalCountry: 'UK',
    universitiesOfInterest: ['King\'s College London'],
    finalUniversity: 'King\'s College London',
    course: 'M.Sc. Artificial Intelligence',
    intake: 'Fall 2026',
    journeyStage: 'Unknown',
    testsInterestedIn: ['IELTS'],
    fundingPlan: 'Unknown',

    createdAt: '2026-09-09T09:00:00Z',
    signupStatus: 'Not Signed Up',

    leadOwnerTeam: 'Education Loan Team',
    leadOwner: 'Unassigned',
    leadAssignedAt: '2026-09-09T09:30:00Z', // 1 hr ago
    leadAssignedBy: 'System Auto-Route',
    assignmentHistory: [
      { id: 'as_am1', assignedAt: '2026-09-09T09:30:00Z', assignedBy: 'System', team: 'Education Loan Team', owner: 'Unassigned' }
    ],

    qualificationStatus: 'Pending',
    readinessChecklist: {
      passportValid: false,
      admitLetterReceived: false,
      fundingPlanReady: false,
      englishTestPassed: false,
    },

    callingStatus: 'Not Attempted',
    noOfAttempts: 0,
    nextCallAt: '2026-09-09T11:30:00Z',
    callLogs: [],

    masterProducts: defaultMasterProducts(['Education Loan']),
    productOpportunities: [
      { id: 'p_am1', product: 'Education Loan', status: 'Not Started', details: 'UK study loan intake', createdAt: '2026-09-09T09:30:00Z' }
    ],

    leadStatus: 'Active',
    kpiStatus: 'On Track',
    lastActionAt: '2026-09-09T09:30:00Z',
    lastActionBy: 'System',
    noActionSince: '2026-09-09T09:30:00Z',
    escalationStatus: 'Not Escalated',

    activities: [
      { id: 'act_am1', timestamp: '2026-09-09T09:55:00Z', actor: 'System', type: 'stage_change', title: 'Lead stage → Application', description: 'Updated preliminary stage based on partner data.' }
    ],
    notes: ['New lead from PARTNER008. UK study inquiries.']
  },
  {
    id: 'L000123',
    sourceCode: 'PARTNER_COLL_01',
    studentName: 'Aarav Sharma',
    mobileNumber: '9820144521',
    mobileCountryCode: '91',
    email: 'aarav.sharma99@gmail.com',
    destinationCountry: 'USA',
    finalCountry: 'USA',
    universitiesOfInterest: ['Columbia University, NYC', 'NYU Courant', 'CMU'],
    finalUniversity: 'Columbia University, NYC',
    course: 'M.S. in Computer Science',
    intake: 'Fall 2026',
    journeyStage: 'Admission Confirmed',
    testsInterestedIn: ['GRE', 'IELTS'],
    fundingPlan: 'Will Need Loan',
    
    createdAt: '2026-09-04T10:00:00Z',
    signupStatus: 'Signed Up',
    customerId: 'C000456',

    leadOwnerTeam: 'Education Loan Team',
    leadOwner: 'Priya Patel',
    leadAssignedAt: '2026-09-05T09:00:00Z',
    leadAssignedBy: 'Manager Rahul',
    assignmentHistory: [
      { id: 'as1', assignedAt: '2026-09-05T09:00:00Z', assignedBy: 'Manager Rahul', team: 'Education Loan Team', owner: 'Priya Patel' }
    ],

    qualificationStatus: 'Qualified',
    qualifiedBy: 'User_Pooja_Qual',
    qualificationCompletedAt: '2026-09-05T11:30:00Z',
    qualificationNotes: 'Columbia admit confirmed with $65k loan requirement. Father is primary co-signer.',
    readinessChecklist: {
      passportValid: true,
      admitLetterReceived: true,
      fundingPlanReady: true,
      englishTestPassed: true,
    },
    coSignerIncome: '₹35 LPA (Father - Senior Director)',
    academicScore: 'GPA 3.8 / GRE 328',

    callingStatus: 'Callback Scheduled',
    noOfAttempts: 3,
    lastCallAt: '2026-09-08T15:30:00Z',
    lastCallOutcome: 'Callback Requested',
    nextCallAt: '2026-09-09T09:30:00Z',
    callLogs: [
      { id: 'c1', timestamp: '2026-09-08T15:30:00Z', rmName: 'Virendra (You)', durationSeconds: 240, outcome: 'Callback Requested', notes: 'Discussed Avanse vs Prodigy interest rates. Father will be available for discussion today.', scheduledNextCall: '2026-09-09T09:30:00Z' }
    ],

    masterProducts: defaultMasterProducts(['Education Loan', 'Bank Account', 'Credit Card', 'Insurance', 'eSIM']),
    productOpportunities: [
      { id: 'p1', product: 'Education Loan', status: 'In Progress', productOwner: 'Virendra (You)', amount: '$65,000', partner: 'Avanse / Prodigy', details: 'Sanction letter preparation', createdAt: '2026-09-05T12:00:00Z' },
      { id: 'p2', product: 'Bank Account', status: 'Completed / Sold', productOwner: 'Global Banking RM', details: 'US Checking + Savings provisioned', transactionId: 'TXN-US-8910', createdAt: '2026-09-06T10:00:00Z', completedSoldAt: '2026-09-07T14:00:00Z' },
      { id: 'p3', product: 'Credit Card', status: 'In Progress', productOwner: 'Global Banking RM', details: '$5,000 SSN-free limit card dispatched', createdAt: '2026-09-06T10:00:00Z' },
      { id: 'p4', product: 'Insurance', status: 'Interested', details: 'Columbia university health waiver comparison', createdAt: '2026-09-07T11:00:00Z' },
      { id: 'p5', product: 'eSIM', status: 'Not Started', details: 'T-Mobile 5G student bundle', createdAt: '2026-09-07T11:00:00Z' },
    ],

    leadStatus: 'Active',
    kpiStatus: 'Overdue',
    kpiOverdueMinutes: 45,
    lastActionAt: '2026-09-08T15:30:00Z',
    lastActionBy: 'Virendra',
    noActionSince: '2026-09-08T15:30:00Z',
    escalationStatus: 'Escalated',
    escalatedTo: 'Manager Rahul',

    activities: [
      { id: 'a1', timestamp: '2026-09-09T08:45:00Z', actor: 'System', type: 'system', title: 'KPI Overdue Alert', description: 'Follow-up threshold exceeded by 45m without action.' },
      { id: 'a2', timestamp: '2026-09-08T15:30:00Z', actor: 'Virendra', type: 'call', title: 'Outbound Call - Connected', description: 'Outcome recorded: Callback Requested.' },
    ],
    notes: [
      'Father is reviewing Avanse co-signer documents.',
      'Needs Columbia Health Insurance Waiver submitted by Nov 1.'
    ]
  },
  {
    id: 'L000124',
    sourceCode: 'WEB_INBOUND',
    studentName: 'Ananya Deshmukh',
    mobileNumber: '9765411209',
    mobileCountryCode: '91',
    email: 'ananya.deshmukh@outlook.com',
    destinationCountry: 'USA',
    finalCountry: 'USA',
    universitiesOfInterest: ['New York University (NYU Stern)'],
    finalUniversity: 'New York University (NYU Stern)',
    course: 'M.S. in Business Analytics',
    intake: 'Fall 2026',
    journeyStage: 'Application',
    testsInterestedIn: ['GMAT', 'TOEFL'],
    fundingPlan: 'Will Need Loan',
    
    createdAt: '2026-09-09T08:00:00Z',
    signupStatus: 'Not Signed Up',

    leadOwnerTeam: 'Banking & Forex Team',
    leadOwner: 'Ankit Verma',
    leadAssignedAt: '2026-09-09T08:05:00Z',
    leadAssignedBy: 'Manager Rahul',
    assignmentHistory: [
      { id: 'as2', assignedAt: '2026-09-09T08:05:00Z', assignedBy: 'Manager Rahul', team: 'Banking & Forex Team', owner: 'Ankit Verma' }
    ],

    qualificationStatus: 'Not Required',
    qualificationNotes: 'Direct inbound lead from web calculator.',
    readinessChecklist: {
      passportValid: true,
      admitLetterReceived: true,
      fundingPlanReady: false,
      englishTestPassed: true,
    },
    coSignerIncome: '₹28 LPA (Mother - VP Finance)',
    academicScore: 'GMAT 710 / TOEFL 112',

    callingStatus: 'Not Attempted',
    noOfAttempts: 0,
    nextCallAt: '2026-09-09T10:15:00Z',
    callLogs: [],

    masterProducts: defaultMasterProducts(['Education Loan', 'Bank Account', 'eSIM']),
    productOpportunities: [
      { id: 'p6', product: 'Education Loan', status: 'In Progress', amount: '$55,000', partner: 'InCred / Avanse', details: 'Non-collateral loan option', createdAt: '2026-09-09T08:05:00Z' },
      { id: 'p7', product: 'Bank Account', status: 'Interested', details: 'US zero balance account', createdAt: '2026-09-09T08:05:00Z' },
      { id: 'p8', product: 'eSIM', status: 'Not Started', details: 'USA Unlimited bundle', createdAt: '2026-09-09T08:05:00Z' },
    ],

    leadStatus: 'Active',
    kpiStatus: 'Overdue',
    kpiOverdueMinutes: 18,
    lastActionAt: '2026-09-09T08:05:00Z',
    lastActionBy: 'System',
    noActionSince: '2026-09-09T08:05:00Z',
    escalationStatus: 'Not Escalated',

    activities: [
      { id: 'a3', timestamp: '2026-09-09T08:00:00Z', actor: 'System', type: 'system', title: 'New Web Lead Ingested', description: 'Assigned to self for initial call.' }
    ],
    notes: ['Priority lead from website loan calculator.']
  },
  {
    id: 'L000125',
    sourceCode: 'PARTNER_STUDY_ABROAD',
    studentName: 'Rohan Kulkarni',
    mobileNumber: '9930488712',
    mobileCountryCode: '91',
    email: 'rohan.kulkarni@gmail.com',
    destinationCountry: 'USA',
    finalCountry: 'USA',
    universitiesOfInterest: ['Carnegie Mellon University', 'Purdue University'],
    finalUniversity: 'Carnegie Mellon University',
    course: 'M.S. in Information Systems',
    intake: 'Spring 2027',
    journeyStage: 'Visa',
    testsInterestedIn: ['GRE', 'IELTS'],
    fundingPlan: 'Will Need Loan',
    
    createdAt: '2026-09-01T11:00:00Z',
    signupStatus: 'Signed Up',
    customerId: 'C000789',

    leadOwnerTeam: 'Admissions & Counseling',
    leadOwner: 'Sneha Rao',
    leadAssignedAt: '2026-09-02T10:00:00Z',
    leadAssignedBy: 'Manager Rahul',
    assignmentHistory: [
      { id: 'as3', assignedAt: '2026-09-02T10:00:00Z', assignedBy: 'Manager Rahul', team: 'Admissions & Counseling', owner: 'Sneha Rao' }
    ],

    qualificationStatus: 'Qualified',
    qualifiedBy: 'User_Pooja_Qual',
    qualificationCompletedAt: '2026-09-02T14:00:00Z',
    qualificationNotes: 'Admit confirmed at CMU Heinz. F1 Visa approved.',
    readinessChecklist: {
      passportValid: true,
      admitLetterReceived: true,
      fundingPlanReady: true,
      englishTestPassed: true,
    },
    coSignerIncome: '₹42 LPA',
    academicScore: 'GRE 331 / IELTS 8.0',

    callingStatus: 'Connected',
    noOfAttempts: 2,
    lastCallAt: '2026-09-07T14:00:00Z',
    lastCallOutcome: 'Connected',
    nextCallAt: '2026-09-09T11:45:00Z',
    callLogs: [
      { id: 'c2', timestamp: '2026-09-07T14:00:00Z', rmName: 'Virendra (You)', durationSeconds: 310, outcome: 'Connected', notes: 'Confirmed visa approval. Ready to disburse tuition transfer through Zolve Remit.' }
    ],

    masterProducts: defaultMasterProducts(['Education Loan', 'Bank Account', 'Credit Card', 'Money Transfer', 'eSIM']),
    productOpportunities: [
      { id: 'p9', product: 'Education Loan', status: 'Completed / Sold', amount: '$70,000', partner: 'HDFC Credila', completedSoldAt: '2026-09-05T16:00:00Z', createdAt: '2026-09-02T14:00:00Z' },
      { id: 'p10', product: 'Money Transfer', status: 'In Progress', amount: '$22,500', details: 'Tuition deposit to CMU Bursar', transactionId: 'TXN-REMIT-991', createdAt: '2026-09-07T14:30:00Z' },
      { id: 'p11', product: 'Bank Account', status: 'In Progress', details: 'Checking account set up', createdAt: '2026-09-07T14:30:00Z' },
      { id: 'p12', product: 'eSIM', status: 'Interested', details: 'eSIM for Pittsburgh arrival', createdAt: '2026-09-07T14:30:00Z' },
    ],

    leadStatus: 'Active',
    kpiStatus: 'On Track',
    lastActionAt: '2026-09-08T18:00:00Z',
    lastActionBy: 'Virendra',
    noActionSince: '2026-09-08T18:00:00Z',
    escalationStatus: 'Not Escalated',

    activities: [
      { id: 'a4', timestamp: '2026-09-08T18:00:00Z', actor: 'Virendra', type: 'stage_change', title: 'Journey Stage: Visa Approved', description: 'Updated journey stage to Visa. Initiated tuition remittance.' }
    ],
    notes: ['Flight scheduled for Dec 28. Needs US Credit Card delivered to friend.']
  },
  {
    id: 'L000126',
    sourceCode: 'PARTNER_OVERSEAS',
    studentName: 'Pooja Iyer',
    mobileNumber: '9845067123',
    mobileCountryCode: '91',
    email: 'pooja.iyer.tech@gmail.com',
    destinationCountry: 'UK',
    finalCountry: 'UK',
    universitiesOfInterest: ['Imperial College London', 'UCL'],
    finalUniversity: 'Imperial College London',
    course: 'M.Sc. in Advanced Computing',
    intake: 'Fall 2026',
    journeyStage: 'Admission Confirmed',
    testsInterestedIn: ['IELTS'],
    fundingPlan: 'Will Need Loan',
    
    createdAt: '2026-09-02T10:00:00Z',
    signupStatus: 'Not Signed Up',

    leadOwnerTeam: 'Banking & Forex Team',
    leadOwner: 'Ankit Verma',
    leadAssignedAt: '2026-09-03T10:00:00Z',
    leadAssignedBy: 'Manager Rahul',
    assignmentHistory: [
      { id: 'as4', assignedAt: '2026-09-03T10:00:00Z', assignedBy: 'Manager Rahul', team: 'Banking & Forex Team', owner: 'Ankit Verma' }
    ],

    qualificationStatus: 'Qualified',
    qualifiedBy: 'User_Pooja_Qual',
    qualificationCompletedAt: '2026-09-03T15:00:00Z',
    qualificationNotes: 'Imperial College offer in hand. Looking for £42k unsecured loan.',
    readinessChecklist: {
      passportValid: true,
      admitLetterReceived: true,
      fundingPlanReady: false,
      englishTestPassed: true,
    },
    coSignerIncome: '₹18 LPA',
    academicScore: 'CGPA 9.1 / IELTS 7.5',

    callingStatus: 'Connected',
    noOfAttempts: 2,
    lastCallAt: '2026-09-08T11:00:00Z',
    lastCallOutcome: 'Connected',
    nextCallAt: '2026-09-09T13:00:00Z',
    callLogs: [
      { id: 'c3', timestamp: '2026-09-08T11:00:00Z', rmName: 'Virendra (You)', durationSeconds: 195, outcome: 'Connected', notes: 'Mother agreed to provide 6-month bank statements today for Avanse sanction.' }
    ],

    masterProducts: defaultMasterProducts(['Education Loan', 'Insurance', 'eSIM']),
    productOpportunities: [
      { id: 'p13', product: 'Education Loan', status: 'In Progress', amount: '£42,000', partner: 'Avanse', details: 'Awaiting co-signer bank statement', createdAt: '2026-09-03T15:30:00Z' },
      { id: 'p14', product: 'Insurance', status: 'Interested', details: 'NHS Surcharge + Travel Medical package', createdAt: '2026-09-04T10:00:00Z' },
      { id: 'p15', product: 'eSIM', status: 'Not Started', details: 'UK Vodafone 100GB plan', createdAt: '2026-09-04T10:00:00Z' },
    ],

    leadStatus: 'Active',
    kpiStatus: 'On Track',
    lastActionAt: '2026-09-08T11:00:00Z',
    lastActionBy: 'Virendra',
    noActionSince: '2026-09-08T11:00:00Z',
    escalationStatus: 'Not Escalated',

    activities: [
      { id: 'a5', timestamp: '2026-09-08T11:00:00Z', actor: 'Virendra', type: 'call', title: 'Call Outcome: Connected', description: 'Requested 6-month bank statements of co-signer.' }
    ],
    notes: ['Compare Avanse vs Auxilo quotes for UK master program.']
  },
  {
    id: 'L000127',
    sourceCode: 'PARTNER_EDTECH_09',
    studentName: 'Vikramaditya Rao',
    mobileNumber: '9448033490',
    mobileCountryCode: '91',
    email: 'vikram.rao.eng@gmail.com',
    destinationCountry: 'USA',
    finalCountry: 'USA',
    universitiesOfInterest: ['Georgia Institute of Technology'],
    finalUniversity: 'Georgia Institute of Technology',
    course: 'M.S. in Electrical & Computer Engineering',
    intake: 'Fall 2026',
    journeyStage: 'Pre-Departure',
    testsInterestedIn: ['GRE'],
    fundingPlan: 'Will Need Loan',
    
    createdAt: '2026-08-20T09:00:00Z',
    signupStatus: 'Signed Up',
    customerId: 'C000321',

    leadOwnerTeam: 'Education Loan Team',
    leadOwner: 'Rohan Mehta',
    leadAssignedAt: '2026-08-21T10:00:00Z',
    leadAssignedBy: 'Manager Rahul',
    assignmentHistory: [
      { id: 'as5', assignedAt: '2026-08-21T10:00:00Z', assignedBy: 'Manager Rahul', team: 'Education Loan Team', owner: 'Rohan Mehta' }
    ],

    qualificationStatus: 'Qualified',
    qualifiedBy: 'User_Pooja_Qual',
    qualificationCompletedAt: '2026-08-21T12:00:00Z',
    qualificationNotes: 'Admitted to Georgia Tech. Prodigy loan approved.',
    readinessChecklist: {
      passportValid: true,
      admitLetterReceived: true,
      fundingPlanReady: true,
      englishTestPassed: true,
    },
    coSignerIncome: 'Self-secured / Prodigy',
    academicScore: 'GRE 326',

    callingStatus: 'Connected',
    noOfAttempts: 5,
    lastCallAt: '2026-09-08T16:20:00Z',
    lastCallOutcome: 'Connected',
    nextCallAt: '2026-09-09T14:30:00Z',
    callLogs: [],

    masterProducts: defaultMasterProducts(['Education Loan', 'Bank Account', 'Credit Card', 'Insurance', 'eSIM', 'Money Transfer']),
    productOpportunities: [
      { id: 'p16', product: 'Education Loan', status: 'Completed / Sold', amount: '$58,000', partner: 'Prodigy Finance', completedSoldAt: '2026-09-01T10:00:00Z', createdAt: '2026-08-21T12:00:00Z' },
      { id: 'p17', product: 'Bank Account', status: 'Completed / Sold', details: 'Funded ($2,500)', transactionId: 'TXN-BANK-091', completedSoldAt: '2026-09-07T11:00:00Z', createdAt: '2026-08-25T10:00:00Z' },
      { id: 'p18', product: 'Credit Card', status: 'Completed / Sold', details: 'Zolve Card activated', completedSoldAt: '2026-09-07T11:00:00Z', createdAt: '2026-08-25T10:00:00Z' },
      { id: 'p19', product: 'Insurance', status: 'Completed / Sold', details: 'GT Health Waiver approved', completedSoldAt: '2026-09-06T15:00:00Z', createdAt: '2026-08-28T10:00:00Z' },
      { id: 'p20', product: 'eSIM', status: 'Completed / Sold', details: 'US No: +1 (404) 890-1294', completedSoldAt: '2026-09-08T16:00:00Z', createdAt: '2026-09-02T10:00:00Z' },
    ],

    leadStatus: 'Active',
    kpiStatus: 'On Track',
    lastActionAt: '2026-09-08T16:20:00Z',
    lastActionBy: 'Virendra',
    noActionSince: '2026-09-08T16:20:00Z',
    escalationStatus: 'Not Escalated',

    activities: [
      { id: 'a6', timestamp: '2026-09-08T16:20:00Z', actor: 'Virendra', type: 'product_update', title: 'eSIM Activated', description: 'US number provisioned for Atlanta arrival.' }
    ],
    notes: ['Full product adoption. Pre-departure final check-in call.']
  },
  {
    id: 'L000128',
    sourceCode: 'BULK_UPLOAD_EXCEL',
    studentName: 'Tanvi Saxena',
    mobileNumber: '9987612389',
    mobileCountryCode: '91',
    email: 'tanvi.saxena@outlook.com',
    destinationCountry: 'Canada',
    finalCountry: 'Canada',
    universitiesOfInterest: ['University of Toronto', 'McGill University'],
    finalUniversity: 'University of Toronto',
    course: 'Master of Management Analytics (MMA)',
    intake: 'Fall 2026',
    journeyStage: 'Application',
    testsInterestedIn: ['GMAT', 'IELTS'],
    fundingPlan: 'Will Need Loan',
    
    createdAt: '2026-08-25T11:00:00Z',
    signupStatus: 'Not Signed Up',

    leadOwnerTeam: 'Admissions & Counseling',
    leadOwner: 'Sneha Rao',
    leadAssignedAt: '2026-08-26T10:00:00Z',
    leadAssignedBy: 'Manager Rahul',
    assignmentHistory: [
      { id: 'as6', assignedAt: '2026-08-26T10:00:00Z', assignedBy: 'Manager Rahul', team: 'Admissions & Counseling', owner: 'Sneha Rao' }
    ],

    qualificationStatus: 'Pending',
    qualificationNotes: 'Awaiting review for GIC and study permit eligibility.',
    readinessChecklist: {
      passportValid: true,
      admitLetterReceived: true,
      fundingPlanReady: true,
      englishTestPassed: true,
    },
    coSignerIncome: '₹26 LPA',
    academicScore: 'GMAT 680 / IELTS 8.0',

    callingStatus: 'Callback Scheduled',
    noOfAttempts: 2,
    lastCallAt: '2026-09-08T17:00:00Z',
    lastCallOutcome: 'Callback Requested',
    nextCallAt: '2026-09-09T08:15:00Z',
    callLogs: [],

    masterProducts: defaultMasterProducts(['Education Loan', 'Money Transfer', 'eSIM']),
    productOpportunities: [
      { id: 'p21', product: 'Education Loan', status: 'In Progress', amount: 'CAD $62,000', partner: 'InCred', details: 'SDS loan sanction', createdAt: '2026-08-26T10:00:00Z' },
      { id: 'p22', product: 'Money Transfer', status: 'In Progress', amount: 'CAD $20,635', details: 'Canada GIC account transfer', createdAt: '2026-08-27T10:00:00Z' },
      { id: 'p23', product: 'eSIM', status: 'Not Started', details: 'Bell / Rogers Canada plan', createdAt: '2026-08-27T10:00:00Z' },
    ],

    leadStatus: 'Active',
    kpiStatus: 'Overdue',
    kpiOverdueMinutes: 110,
    lastActionAt: '2026-09-08T17:00:00Z',
    lastActionBy: 'Virendra',
    noActionSince: '2026-09-08T17:00:00Z',
    escalationStatus: 'Escalated',
    escalatedTo: 'Manager Rahul',

    activities: [
      { id: 'a7', timestamp: '2026-09-09T08:15:00Z', actor: 'System', type: 'system', title: 'KPI Overdue Alert', description: 'Overdue callback by 110 minutes.' }
    ],
    notes: ['Needs GIC certificate within 48 hours for SDS visa filing.']
  }
].map(ensureAcademicBackground);
