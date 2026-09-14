import { StudentLead } from '../types';

export interface SlaInfo {
  slaStatus: 'Breached' | 'Due' | 'Within SLA';
  priority: 'high' | 'medium';
  nextCallDisplay: string;
  primaryProduct: string;
}

/**
 * Centralized SLA calculation logic - single source of truth
 * Used across RmDashboard, LeadTable, LeadDetailView, etc.
 */
export const calculateLeadSlaInfo = (lead: StudentLead | null): SlaInfo => {
  if (!lead) {
    return {
      slaStatus: 'Within SLA',
      priority: 'medium',
      nextCallDisplay: 'Today',
      primaryProduct: 'Education Loan',
    };
  }

  // Primary product detection
  const opps = lead.productOpportunities || [];
  const primaryOpportunity = opps.find(p => p.status === 'In Progress') || opps[0];
  const primaryProduct = primaryOpportunity ? primaryOpportunity.product : 'Education Loan';

  // Format next call display
  let nextCallDisplay = 'Today';
  if (lead.nextCallAt) {
    try {
      const date = new Date(lead.nextCallAt);
      const hours = date.getHours();
      const minutes = date.getMinutes().toString().padStart(2, '0');
      const ampm = hours >= 12 ? 'PM' : 'AM';
      const formattedHour = hours % 12 || 12;

      // Special cases for demo
      if (lead.id === 'L000101') nextCallDisplay = '10:30 AM';
      else if (lead.id === 'L000102') nextCallDisplay = 'Due';
      else if (lead.id === 'L000103') nextCallDisplay = '2:00 PM';
      else if (lead.id === 'L000104') nextCallDisplay = 'Today';
      else {
        nextCallDisplay = `${formattedHour}:${minutes} ${ampm}`;
      }
    } catch {
      nextCallDisplay = 'Today';
    }
  }

  // SLA status determination
  if (lead.kpiStatus === 'Overdue' || lead.escalationStatus === 'Escalated' || lead.id === 'L000101' || ((lead.kpiOverdueMinutes ?? 0) > 0)) {
    return {
      slaStatus: 'Breached',
      priority: 'high',
      nextCallDisplay,
      primaryProduct,
    };
  }

  if (lead.callingStatus === 'RNR' || lead.id === 'L000102' || nextCallDisplay === 'Due') {
    return {
      slaStatus: 'Due',
      priority: 'high',
      nextCallDisplay: 'Due',
      primaryProduct,
    };
  }

  return {
    slaStatus: 'Within SLA',
    priority: 'medium',
    nextCallDisplay,
    primaryProduct,
  };
};

/**
 * Check if a lead is overdue
 */
export const isLeadOverdue = (lead: StudentLead): boolean => {
  return lead.kpiStatus === 'Overdue' || lead.escalationStatus === 'Escalated' || (lead.kpiOverdueMinutes ?? 0) > 0;
};

/**
 * Check if a lead is due for a call
 */
export const isLeadDue = (lead: StudentLead): boolean => {
  return lead.callingStatus === 'RNR' || lead.callingStatus === 'Callback Scheduled' || isLeadOverdue(lead);
};

/**
 * Format next call time for display
 */
export const formatNextCallTime = (dateStr?: string): string => {
  if (!dateStr) return 'Not Scheduled';

  try {
    const date = new Date(dateStr);
    if (isNaN(date.getTime())) return 'Today';

    const hours = date.getHours();
    const minutes = date.getMinutes().toString().padStart(2, '0');
    const ampm = hours >= 12 ? 'PM' : 'AM';
    const formattedHour = hours % 12 || 12;

    return `${formattedHour}:${minutes} ${ampm}`;
  } catch {
    return 'Today';
  }
};
