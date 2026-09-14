import { RmMember } from '../types';

export const TEAM_MEMBERS: RmMember[] = [
  {
    id: 'rm-1',
    name: 'Virendra (You)',
    avatar: 'V',
    role: 'Senior RM • Team Lead',
    team: 'Education Loan Team',
    status: 'Available',
    activeLeadsCount: 28,
    callsToday: 22,
    connectRatePercent: 81.8,
    qualifiedToday: 4,
    kpiBreachedCount: 1,
    dealsClosedMonth: 6,
    capacityPercent: 78,
    email: 'virendra@zolve.com',
    phone: '+91 98200 44101',
  },
  {
    id: 'rm-vikas',
    name: 'Vikas',
    avatar: 'V',
    role: 'Relationship Manager',
    team: 'Education Loan Team',
    status: 'Available',
    activeLeadsCount: 35,
    callsToday: 28,
    connectRatePercent: 82.1,
    qualifiedToday: 6,
    kpiBreachedCount: 0,
    dealsClosedMonth: 9,
    capacityPercent: 88,
    email: 'vikas@zolve.com',
    phone: '+91 98200 44106',
  },
  {
    id: 'rm-john',
    name: 'John',
    avatar: 'J',
    role: 'Relationship Manager',
    team: 'Footwork Partner Team',
    status: 'In Call',
    activeLeadsCount: 26,
    callsToday: 20,
    connectRatePercent: 85.0,
    qualifiedToday: 4,
    kpiBreachedCount: 0,
    dealsClosedMonth: 5,
    capacityPercent: 72,
    email: 'john@zolve.com',
    phone: '+91 98200 44107',
  },
  {
    id: 'rm-2',
    name: 'Priya Patel',
    avatar: 'P',
    role: 'Relationship Manager',
    team: 'Education Loan Team',
    status: 'In Call',
    activeLeadsCount: 32,
    callsToday: 26,
    connectRatePercent: 88.5,
    qualifiedToday: 5,
    kpiBreachedCount: 0,
    dealsClosedMonth: 8,
    capacityPercent: 89,
    email: 'priya.patel@zolve.com',
    phone: '+91 98200 44102',
  },
  {
    id: 'rm-3',
    name: 'Ankit Verma',
    avatar: 'A',
    role: 'Relationship Manager',
    team: 'Banking & Forex Team',
    status: 'Available',
    activeLeadsCount: 24,
    callsToday: 18,
    connectRatePercent: 72.2,
    qualifiedToday: 3,
    kpiBreachedCount: 0,
    dealsClosedMonth: 4,
    capacityPercent: 67,
    email: 'ankit.verma@zolve.com',
    phone: '+91 98200 44103',
  },
  {
    id: 'rm-4',
    name: 'Sneha Rao',
    avatar: 'S',
    role: 'Relationship Manager',
    team: 'Admissions & Counseling',
    status: 'Break',
    activeLeadsCount: 22,
    callsToday: 19,
    connectRatePercent: 78.9,
    qualifiedToday: 3,
    kpiBreachedCount: 0,
    dealsClosedMonth: 5,
    capacityPercent: 61,
    email: 'sneha.rao@zolve.com',
    phone: '+91 98200 44104',
  },
  {
    id: 'rm-5',
    name: 'Rohan Mehta',
    avatar: 'R',
    role: 'Associate RM',
    team: 'Education Loan Team',
    status: 'Available',
    activeLeadsCount: 18,
    callsToday: 15,
    connectRatePercent: 66.7,
    qualifiedToday: 2,
    kpiBreachedCount: 0,
    dealsClosedMonth: 2,
    capacityPercent: 50,
    email: 'rohan.mehta@zolve.com',
    phone: '+91 98200 44105',
  }
];

export const RM_NAMES = [
  'Virendra (You)',
  'Vikas',
  'John',
  'Priya Patel',
  'Ankit Verma',
  'Sneha Rao',
  'Rohan Mehta',
  'Unassigned'
];

/**
 * Auto-derive the Lead Owner Team from the RM name as configured in the system.
 * Eliminates the need for manual team selection during assignment.
 */
export const getAutoFedOwnerTeam = (ownerName: string): string => {
  if (!ownerName || ownerName === 'Unassigned') return 'Zolve';
  const clean = ownerName.replace(' (You)', '').trim().toLowerCase();
  
  if (clean === 'john' || clean.includes('footwork')) {
    return 'Footwork';
  }
  
  const member = TEAM_MEMBERS.find(m => 
    m.name.toLowerCase().includes(clean) || clean.includes(m.name.toLowerCase())
  );
  
  if (member) {
    if (member.team.toLowerCase().includes('footwork')) return 'Footwork';
    return 'Zolve';
  }
  
  return 'Zolve';
};


