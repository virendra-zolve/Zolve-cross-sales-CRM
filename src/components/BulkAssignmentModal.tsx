import React, { useState, useMemo } from 'react';
import {
  X,
  Users,
  AlertCircle,
  CheckCircle2,
} from 'lucide-react';
import { StudentLead, TeamMember } from '../types';

interface BulkAssignmentModalProps {
  isOpen: boolean;
  selectedLeads: StudentLead[];
  teamMembers: TeamMember[];
  currentUserRole: 'head' | 'team_lead' | 'agent' | 'bde';
  onClose: () => void;
  onAssign: (leads: StudentLead[], assignment: {
    teamLeadId?: string;
    agentId?: string;
  }) => void;
}

export const BulkAssignmentModal: React.FC<BulkAssignmentModalProps> = ({
  isOpen,
  selectedLeads,
  teamMembers,
  currentUserRole,
  onClose,
  onAssign,
}) => {
  const [selectedTeamLead, setSelectedTeamLead] = useState<string>('');
  const [selectedAgent, setSelectedAgent] = useState<string>('');
  const [isAssigning, setIsAssigning] = useState(false);

  // Determine which hierarchy levels to show based on role
  const showLevels = useMemo(() => {
    return {
      teamLead: currentUserRole === 'head' || currentUserRole === 'team_lead',
      agent: currentUserRole !== 'agent',
    };
  }, [currentUserRole]);

  // Get available members for each role
  const teamLeads = useMemo(
    () => teamMembers.filter(m => m.role === 'Team Lead'),
    [teamMembers]
  );

  const agents = useMemo(
    () => teamMembers.filter(m => m.role === 'Agent'),
    [teamMembers]
  );

  const isValid = useMemo(() => {
    // At least Team Lead or Agent must be selected
    return selectedTeamLead || selectedAgent;
  }, [selectedTeamLead, selectedAgent]);

  const handleAssign = () => {
    if (!isValid || selectedLeads.length === 0) return;

    setIsAssigning(true);

    // Simulate API call
    setTimeout(() => {
      onAssign(selectedLeads, {
        teamLeadId: selectedTeamLead || undefined,
        agentId: selectedAgent || undefined,
      });

      // Reset
      setSelectedTeamLead('');
      setSelectedAgent('');
      setIsAssigning(false);
      onClose();
    }, 500);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl max-w-md w-full max-h-[85vh] overflow-auto flex flex-col">
        {/* HEADER */}
        <div className="flex items-center justify-between border-b border-slate-200 p-4 sticky top-0 bg-white">
          <h2 className="text-lg font-bold text-slate-900">Bulk Assign Leads</h2>
          <button
            onClick={onClose}
            disabled={isAssigning}
            className="p-1 hover:bg-slate-100 rounded-lg transition-colors disabled:opacity-50"
          >
            <X size={20} className="text-slate-600" />
          </button>
        </div>

        {/* CONTENT */}
        <div className="flex-1 p-4 space-y-4">
          {/* Selected Leads Count */}
          <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="flex items-center gap-2 text-blue-900">
              <CheckCircle2 size={16} />
              <span className="text-sm font-medium">
                {selectedLeads.length} lead{selectedLeads.length !== 1 ? 's' : ''} selected
              </span>
            </div>
          </div>

          {/* Role-Based Assignment Levels */}

          {/* TEAM LEAD (Head Only) */}
          {showLevels.teamLead && (
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-slate-900">
                Assign to Team Lead
                <span className="text-slate-500 ml-1">(Optional)</span>
              </label>
              <select
                value={selectedTeamLead}
                onChange={(e) => setSelectedTeamLead(e.target.value)}
                disabled={isAssigning}
                className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <option value="">— Skip Team Lead Assignment —</option>
                {teamLeads.map((tl) => (
                  <option key={tl.id} value={tl.id}>
                    {tl.name} ({tl.location}) - Capacity: {tl.capacityPercent}%
                  </option>
                ))}
              </select>
              <p className="text-xs text-slate-500">
                Leave empty to skip. Leads will go directly to agents.
              </p>
            </div>
          )}

          {/* AGENT (Head, Manager, or Team Lead) */}
          {showLevels.agent && (
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-slate-900">
                Assign to Agent
                <span className="text-slate-500 ml-1">(Optional)</span>
              </label>
              <select
                value={selectedAgent}
                onChange={(e) => setSelectedAgent(e.target.value)}
                disabled={isAssigning}
                className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <option value="">— Skip Agent Assignment —</option>
                {agents.map((agent) => (
                  <option key={agent.id} value={agent.id}>
                    {agent.name} ({agent.location}) - Capacity: {agent.capacityPercent}%
                  </option>
                ))}
              </select>
              <p className="text-xs text-slate-500">
                Leave empty to skip. Leads will go to manager or team lead.
              </p>
            </div>
          )}

          {/* Assignment Summary */}
          {(selectedTeamLead || selectedAgent) && (
            <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg space-y-2">
              <div className="text-xs font-semibold text-slate-900 uppercase">Assignment Summary</div>
              <div className="text-xs space-y-1 text-slate-700">
                {selectedTeamLead && (
                  <div className="flex items-center gap-2">
                    <span className="w-6 h-6 rounded-full bg-purple-100 flex items-center justify-center text-xs font-bold text-purple-700">
                      1
                    </span>
                    <span>
                      Team Lead: <span className="font-medium">{teamLeads.find(t => t.id === selectedTeamLead)?.name}</span>
                    </span>
                  </div>
                )}
                {selectedAgent && (
                  <div className="flex items-center gap-2">
                    <span className="w-6 h-6 rounded-full bg-emerald-100 flex items-center justify-center text-xs font-bold text-emerald-700">
                      {selectedTeamLead ? '2' : '1'}
                    </span>
                    <span>
                      Agent: <span className="font-medium">{agents.find(a => a.id === selectedAgent)?.name}</span>
                    </span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Info Box */}
          <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg flex gap-2">
            <AlertCircle size={16} className="text-amber-600 flex-shrink-0 mt-0.5" />
            <div className="text-xs text-amber-800">
              <p className="font-medium mb-1">How it works:</p>
              <p>
                Assign leads to a Team Lead and/or Agent. At least one must be selected.
              </p>
            </div>
          </div>
        </div>

        {/* FOOTER */}
        <div className="border-t border-slate-200 p-4 flex gap-2 sticky bottom-0 bg-white">
          <button
            onClick={onClose}
            disabled={isAssigning}
            className="flex-1 px-4 py-2 text-sm font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Cancel
          </button>
          <button
            onClick={handleAssign}
            disabled={!isValid || selectedLeads.length === 0 || isAssigning}
            className="flex-1 px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {isAssigning ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Assigning...
              </>
            ) : (
              <>
                <Users size={16} />
                Assign {selectedLeads.length} Lead{selectedLeads.length !== 1 ? 's' : ''}
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
