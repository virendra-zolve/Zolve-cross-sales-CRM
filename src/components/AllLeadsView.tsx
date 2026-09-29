import React, { useState, useMemo } from 'react';
import { StudentLead } from '../types';
import { LeadTable } from './LeadTable';

interface AllLeadsViewProps {
  leads: StudentLead[];
  onSelectLead: (lead: StudentLead) => void;
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
}) => {
  const [claimedLeads, setClaimedLeads] = useState<ClaimedLeadState>({});

  // Filter to available claim leads: qualified, unassigned, and not yet claimed in this session
  const filteredLeads = useMemo(() => {
    return leads.filter(lead => {
      if (claimedLeads[lead.id]) return false;
      if (lead.qualificationStatus !== 'Qualified') return false;
      if (lead.leadOwner && lead.leadOwner !== 'Unassigned') return false;
      return true;
    });
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

  return (
    <div className="space-y-6">
      {/* Lead Table */}
      <LeadTable
        leads={filteredLeads}
        onSelectLead={onSelectLead}
        enableColumnFilter={false}
        showClaimButton={true}
        onClaimLead={handleClaimLead}
      />
    </div>
  );
};
