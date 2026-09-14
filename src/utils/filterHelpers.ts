import { StudentLead } from '../types';

/**
 * Centralized lead search logic - single source of truth
 */
export const searchLeads = (leads: StudentLead[], query: string): StudentLead[] => {
  if (!query.trim()) return leads;

  const q = query.toLowerCase().trim();
  return leads.filter(lead => {
    const matchName = lead.studentName.toLowerCase().includes(q);
    const matchId = lead.id.toLowerCase().includes(q);
    const matchPhone = lead.mobileNumber.includes(q);
    const matchEmail = lead.email.toLowerCase().includes(q);
    const matchUniv = (lead.finalUniversity || '').toLowerCase().includes(q) || 
      lead.universitiesOfInterest.some(u => u.toLowerCase().includes(q));
    const matchCourse = lead.course.toLowerCase().includes(q);
    const matchSource = lead.sourceCode.toLowerCase().includes(q);
    const matchOwner = lead.leadOwner?.toLowerCase().includes(q);

    return matchName || matchId || matchPhone || matchEmail || matchUniv || matchCourse || matchSource || matchOwner;
  });
};

/**
 * Filter leads by KPI/SLA status
 */
export const filterByKpiStatus = (leads: StudentLead[], status: 'all' | 'overdue' | 'on_track'): StudentLead[] => {
  if (status === 'all') return leads;
  if (status === 'overdue') return leads.filter(l => l.kpiStatus === 'Overdue' || l.escalationStatus === 'Escalated');
  if (status === 'on_track') return leads.filter(l => l.kpiStatus === 'On Track' && l.escalationStatus === 'Not Escalated');
  return leads;
};

/**
 * Filter leads by calling status
 */
export const filterByCallingStatus = (leads: StudentLead[], status: string): StudentLead[] => {
  if (status === 'all') return leads;
  return leads.filter(l => l.callingStatus === status);
};

/**
 * Filter leads by journey stage
 */
export const filterByJourneyStage = (leads: StudentLead[], stage: string): StudentLead[] => {
  if (stage === 'all') return leads;
  return leads.filter(l => l.journeyStage === stage);
};

/**
 * Filter leads by product
 */
export const filterByProduct = (leads: StudentLead[], productName: string): StudentLead[] => {
  if (productName === 'all') return leads;
  return leads.filter(l => 
    l.productOpportunities.some(p => p.product === productName)
  );
};

/**
 * Filter leads by qualification status
 */
export const filterByQualificationStatus = (leads: StudentLead[], status: string): StudentLead[] => {
  if (status === 'all') return leads;
  return leads.filter(l => l.qualificationStatus === status);
};

/**
 * Filter leads by assignment status
 */
export const filterByAssignment = (leads: StudentLead[], assignmentType: 'assigned' | 'unassigned' | 'all'): StudentLead[] => {
  if (assignmentType === 'all') return leads;
  if (assignmentType === 'unassigned') {
    return leads.filter(l => !l.leadOwner || l.leadOwner === '' || l.leadOwner === 'Unassigned');
  }
  if (assignmentType === 'assigned') {
    return leads.filter(l => l.leadOwner && l.leadOwner !== '' && l.leadOwner !== 'Unassigned');
  }
  return leads;
};

/**
 * Filter leads by lead status (Active, Closed, Archived)
 */
export const filterByLeadStatus = (leads: StudentLead[], status: string): StudentLead[] => {
  if (status === 'all') return leads;
  return leads.filter(l => l.leadStatus === status);
};

/**
 * Filter fresh inbound leads
 */
export const filterFreshInboundLeads = (leads: StudentLead[]): StudentLead[] => {
  return leads.filter(l => l.isInboundRaw || (l.callingStatus === 'Not Attempted' && (!l.email || l.journeyStage === 'Unknown')));
};

/**
 * Composite filter function that applies multiple filters
 */
export interface LeadFilterOptions {
  search?: string;
  kpiStatus?: 'all' | 'overdue' | 'on_track';
  callingStatus?: string;
  journeyStage?: string;
  product?: string;
  qualificationStatus?: string;
  assignmentStatus?: 'assigned' | 'unassigned' | 'all';
  leadStatus?: string;
}

export const filterLeads = (leads: StudentLead[], options: LeadFilterOptions): StudentLead[] => {
  let filtered = leads;

  if (options.search) {
    filtered = searchLeads(filtered, options.search);
  }
  if (options.kpiStatus && options.kpiStatus !== 'all') {
    filtered = filterByKpiStatus(filtered, options.kpiStatus);
  }
  if (options.callingStatus && options.callingStatus !== 'all') {
    filtered = filterByCallingStatus(filtered, options.callingStatus);
  }
  if (options.journeyStage && options.journeyStage !== 'all') {
    filtered = filterByJourneyStage(filtered, options.journeyStage);
  }
  if (options.product && options.product !== 'all') {
    filtered = filterByProduct(filtered, options.product);
  }
  if (options.qualificationStatus && options.qualificationStatus !== 'all') {
    filtered = filterByQualificationStatus(filtered, options.qualificationStatus);
  }
  if (options.assignmentStatus && options.assignmentStatus !== 'all') {
    filtered = filterByAssignment(filtered, options.assignmentStatus);
  }
  if (options.leadStatus && options.leadStatus !== 'all') {
    filtered = filterByLeadStatus(filtered, options.leadStatus);
  }

  return filtered;
};
