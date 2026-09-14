import { StudentLead, ActivityItem, AssignmentHistory } from '../types';

/**
 * Centralized lead assignment logic
 */
export interface AssignmentResult {
  updatedLead: StudentLead;
  activity: ActivityItem;
  assignmentHistory: AssignmentHistory;
}

/**
 * Reassign a single lead or multiple leads
 * Returns updated lead object(s) with activity and history entries
 */
export const createLeadAssignment = (
  lead: StudentLead,
  newOwner: string,
  team: string,
  reason: string = 'Manager manual reallocation',
  assignedBy: string = 'Manager'
): AssignmentResult => {
  const historyEntry: AssignmentHistory = {
    id: `as_${Date.now()}`,
    assignedAt: new Date().toISOString(),
    assignedBy,
    team,
    owner: newOwner,
  };

  const activity: ActivityItem = {
    id: `act_${Date.now()}`,
    timestamp: new Date().toISOString(),
    actor: assignedBy,
    type: 'assignment',
    title: `Lead Reassigned → ${newOwner}`,
    description: `Ownership transferred from ${lead.leadOwner} to ${newOwner}. Reason: ${reason}.`,
  };

  const updatedLead: StudentLead = {
    ...lead,
    leadOwner: newOwner,
    leadAssignedAt: new Date().toISOString(),
    leadAssignedBy: assignedBy,
    assignmentHistory: [historyEntry, ...lead.assignmentHistory],
    activities: [activity, ...lead.activities],
  };

  return {
    updatedLead,
    activity,
    assignmentHistory: historyEntry,
  };
};

/**
 * Reassign multiple leads
 */
export const createBulkAssignment = (
  leadIds: string[],
  leads: StudentLead[],
  newOwner: string,
  team: string,
  reason: string = 'Bulk reallocation for workload balance',
  assignedBy: string = 'Manager'
): Map<string, AssignmentResult> => {
  const results = new Map<string, AssignmentResult>();

  leadIds.forEach(leadId => {
    const lead = leads.find(l => l.id === leadId);
    if (!lead) return;

    const result = createLeadAssignment(lead, newOwner, team, reason, assignedBy);
    results.set(leadId, result);
  });

  return results;
};
