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

// Helper to calculate SLA info for mock data
const now = new Date();
const calculateSlaStatus = (claimedAtMinutesAgo: number | null, lastCallAtMinutesAgo: number | null) => {
  if (claimedAtMinutesAgo === null) {
    return 'N/A';
  }
  
  const SLA_HOURS = 48;
  const SLA_MINUTES = SLA_HOURS * 60;
  const AT_RISK_BUFFER = 24 * 60; // 24 hours
  
  if (lastCallAtMinutesAgo === null) {
    // No call made yet
    if (claimedAtMinutesAgo > SLA_MINUTES) {
      return 'SLA Breached';
    } else if (claimedAtMinutesAgo > (SLA_MINUTES - AT_RISK_BUFFER)) {
      return 'At Risk';
    } else {
      return 'First Call Pending';
    }
  } else {
    // Call was made - reset SLA timer
    const timeSinceCall = lastCallAtMinutesAgo;
    if (timeSinceCall > SLA_MINUTES) {
      return 'Follow-up Pending';
    } else {
      return 'On Track';
    }
  }
};

export const generateMockAllLeads = (): StudentLead[] => {
  const countries = ['USA', 'UK', 'Canada', 'Australia', 'Germany', 'Ireland', 'New Zealand', 'Singapore'];
  const products: MasterProduct[] = ['Education Loan', 'Test Prep', 'Admissions', 'eSIM', 'Travel / Flights'];
  const priorities = ['Hot', 'Warm', 'Cold'];
  const firstNames = ['Rahul', 'Neha', 'Aman', 'Priya', 'Arjun', 'Ananya', 'Rohan', 'Deepak', 'Ishita', 'Vikram', 'Sara', 'Amit', 'Sneha', 'Nikhil', 'Pooja', 'Aditya', 'Zara', 'Karan'];
  const lastNames = ['Sharma', 'Patel', 'Gupta', 'Singh', 'Verma', 'Joshi', 'Nair', 'Desai', 'Kapoor', 'Khanna', 'Reddy', 'Mishra', 'Bhat', 'Rao', 'Malhotra'];

  const leads: StudentLead[] = [];
  
  for (let i = 0; i < 95; i++) {
    const firstName = firstNames[Math.floor(Math.random() * firstNames.length)];
    const lastName = lastNames[Math.floor(Math.random() * lastNames.length)];
    const country = countries[Math.floor(Math.random() * countries.length)];
    const product = products[Math.floor(Math.random() * products.length)];
    const priority = priorities[Math.floor(Math.random() * priorities.length)];
    
    // Mock claim timing: vary from unclaimed to claimed at different times
    let claimedAtMinutesAgo: number | null = null;
    let lastCallAtMinutesAgo: number | null = null;
    let leadOwner: string | null = null;
    
    // 65% unclaimed, 35% claimed
    if (Math.random() < 0.35) {
      claimedAtMinutesAgo = Math.floor(Math.random() * (72 * 60)); // 0-72 hours
      leadOwner = ['Vikas', 'Priya', 'Rajesh', 'Anjali'][Math.floor(Math.random() * 4)];
      
      // If claimed, sometimes has a call attempt
      if (Math.random() < 0.4) {
        lastCallAtMinutesAgo = Math.floor(Math.random() * claimedAtMinutesAgo * 0.8);
      }
    }

    const slaStatus = calculateSlaStatus(claimedAtMinutesAgo, lastCallAtMinutesAgo);

    leads.push({
      id: `L${String(10000 + i).slice(-6)}`,
      sourceCode: `SRC_${i}`,
      partnerCode: `PARTNER_${i}`,
      bdeCode: 'BDE_AUTO',
      studentName: `${firstName} ${lastName}`,
      mobileNumber: `${Math.floor(Math.random() * 9000000000 + 1000000000)}`,
      mobileCountryCode: '91',
      destinationCountry: country,
      email: `${firstName.toLowerCase()}.${lastName.toLowerCase()}@email.com`,
      universitiesOfInterest: [],
      course: 'Master\'s',
      intake: Math.random() > 0.5 ? 'Fall 2025' : 'Spring 2025',
      journeyStage: 'Qualified',
      testsInterestedIn: Math.random() > 0.5 ? ['IELTS', 'GMAT'] : ['TOEFL'],
      fundingPlan: 'Education Loan',
      educationLoan: 'Yes',
      isInboundRaw: false,
      inboundCompletionPct: 100,
      createdAt: `${Math.floor(Math.random() * 30)} days ago`,
      signupStatus: 'Signed Up',
      customerId: `CUST_${i}`,
      leadOwnerTeam: 'Education Loan Team',
      leadOwner: leadOwner || 'Unassigned',
      leadAssignedAt: claimedAtMinutesAgo ? `${Math.floor(claimedAtMinutesAgo / 60)} hours ago` : 'Not assigned',
      leadAssignedBy: claimedAtMinutesAgo ? 'Self-Claimed' : 'N/A',
      assignmentHistory: claimedAtMinutesAgo ? [{
        id: `as_${i}`,
        assignedAt: `${Math.floor(claimedAtMinutesAgo / 60)} hours ago`,
        assignedBy: 'Self-Claimed',
        team: 'Education Loan Team',
        owner: leadOwner || 'Unassigned'
      }] : [],
      qualificationStatus: 'Qualified',
      readinessChecklist: {
        passportValid: Math.random() > 0.3,
        admitLetterReceived: Math.random() > 0.6,
        fundingPlanReady: Math.random() > 0.4,
        englishTestPassed: Math.random() > 0.5,
      },
      academicBackground: defaultAcademicBackground(),
      callingStatus: lastCallAtMinutesAgo ? 'Call Completed' : 'Not Attempted',
      noOfAttempts: lastCallAtMinutesAgo ? 1 : 0,
      nextCallAt: lastCallAtMinutesAgo ? `${Math.floor(Math.random() * 48)} hours` : 'Immediate',
      callLogs: lastCallAtMinutesAgo ? [{
        id: `call_${i}`,
        callInitiatedAt: new Date(now.getTime() - lastCallAtMinutesAgo * 60000).toISOString(),
        duration: Math.floor(Math.random() * 20) + 3,
        callOutcome: 'Connected',
        notes: 'Initial discovery call completed',
        nextCallScheduledFor: null,
        callRecordingUrl: '',
        callTranscript: ''
      }] : [],
      masterProducts: defaultMasterProducts([product]),
      productOpportunities: [{
        id: `prod_${i}`,
        product: product,
        status: 'Active' as any,
        productOwner: 'RM',
        amount: String(Math.floor(Math.random() * 50) + 10),
        createdAt: new Date().toISOString()
      }],
      leadStatus: 'Active',
      kpiStatus: slaStatus === 'SLA Breached' ? 'At Risk' : 'On Track',
      escalationStatus: slaStatus === 'SLA Breached' ? 'Escalated' : 'Not Escalated',
      lastActionAt: `${Math.floor(Math.random() * 24)} hours ago`,
      lastActionBy: 'System',
      noActionSince: `${Math.floor(Math.random() * 24)} hours ago`,
      notes: [`Priority: ${priority}`, `SLA Status: ${slaStatus}`],
      activities: []
    });
  }

  return leads;
};
