import React, { useState, useMemo } from 'react';
import { StudentLead } from '../types';
import { LeadTable } from './LeadTable';

interface AllLeadsViewProps {
  leads: StudentLead[];
  onSelectLead: (lead: StudentLead) => void;
  onInitiateCall: (lead: StudentLead) => void;
  onQuickLogOutcome: (lead: StudentLead) => void;
}

interface ClaimedLeadState {
  [leadId: string]: {
    claimedBy: string;
    claimedAt: number;
    lastCallAt?: number;
  };
}

export const AllLeadsView: React.FC<AllLeadsViewProps> = ({
  leads,
  onSelectLead,
  onInitiateCall,
  onQuickLogOutcome,
}) => {
  const [claimedLeads, setClaimedLeads] = useState<ClaimedLeadState>({});

  // Filter leads to show only available (unclaimed) leads
  const filteredLeads = useMemo(() => {
    return leads.filter(lead => !claimedLeads[lead.id]);
  }, [leads, claimedLeads]);

  // Calculate summary metrics
  const metrics = useMemo(() => {
    const totalLeads = leads.length;
    const availableToClaim = leads.filter(l => !claimedLeads[l.id]).length;
    const myClaimedLeads = Object.keys(claimedLeads).length;
    
    // For now, keep SLA counts as 0 since we removed SLA logic
    const slaAtRisk = 0;
    const slaBreached = 0;

    return {
      totalLeads,
      availableToClaim,
      myClaimedLeads,
      slaAtRisk,
      slaBreached
    };
  }, [leads, claimedLeads]);

  // Handle claim action
  const handleClaimLead = (lead: StudentLead) => {
    setClaimedLeads(prev => ({
      ...prev,
      [lead.id]: {
        claimedBy: 'Current User',
        claimedAt: Date.now(),
      }
    }));
  };

  // Handle inline lead updates (status, journey stage, calling status)
  const handleUpdateLead = (updatedLead: StudentLead) => {
    console.log('Lead updated:', updatedLead);
    // Parent component should handle the actual state update
  };

  return (
    <div className="space-y-6">
      {/* Lead Table */}
      <LeadTable
        leads={filteredLeads}
        onSelectLead={onSelectLead}
        onInitiateCall={onInitiateCall}
        onQuickLogOutcome={onQuickLogOutcome}
        onUpdateLead={handleUpdateLead}
        enableColumnFilter={false}
        showClaimButton={true}
        onClaimLead={handleClaimLead}
      />
    </div>
  );
};
