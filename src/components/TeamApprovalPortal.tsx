import React, { useState, useMemo } from 'react';
import { Users, CheckCircle2, X } from 'lucide-react';
import { TeamMember } from '../types';

interface TeamApprovalPortalProps {
  teamMembers: TeamMember[];
  onApproveTeamMember: (memberId: string) => void;
  onRejectTeamMember: (memberId: string, reason: string) => void;
}

export const TeamApprovalPortal: React.FC<TeamApprovalPortalProps> = ({
  teamMembers,
  onApproveTeamMember,
  onRejectTeamMember,
}) => {
  const [selectedMemberId, setSelectedMemberId] = useState<string | null>(null);
  const [rejectionReason, setRejectionReason] = useState('');
  const [showRejectForm, setShowRejectForm] = useState(false);

  // Filter pending team members
  const pendingMembers = useMemo(() => {
    return teamMembers.filter(m => m.status === 'Pending Approval');
  }, [teamMembers]);

  const activeMembers = useMemo(() => {
    return teamMembers.filter(m => m.status === 'Active');
  }, [teamMembers]);

  const rejectedMembers = useMemo(() => {
    return teamMembers.filter(m => m.status === 'Inactive' && m.headRejectionReason);
  }, [teamMembers]);

  const selectedMember = selectedMemberId 
    ? teamMembers.find(m => m.id === selectedMemberId)
    : null;

  const handleApprove = () => {
    if (!selectedMemberId) return;
    onApproveTeamMember(selectedMemberId);
    setSelectedMemberId(null);
    setShowRejectForm(false);
    setRejectionReason('');
  };

  const handleReject = () => {
    if (!selectedMemberId || !rejectionReason.trim()) return;
    onRejectTeamMember(selectedMemberId, rejectionReason);
    setSelectedMemberId(null);
    setRejectionReason('');
    setShowRejectForm(false);
  };

  if (pendingMembers.length === 0 && activeMembers.length === 0 && rejectedMembers.length === 0) {
    return (
      <div className="bg-white border border-slate-200 rounded-lg p-8 text-center">
        <Users size={32} className="mx-auto text-slate-300 mb-2" />
        <p className="text-slate-600 text-sm">No team members</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-4 gap-4">
      {/* Tabs */}
      <div className="col-span-1 space-y-3">
        <div className="space-y-2">
          {/* Pending Tab */}
          <div>
            <h3 className="font-semibold text-xs text-slate-900 uppercase tracking-wide mb-2">
              Pending Approvals
              {pendingMembers.length > 0 && (
                <span className="ml-2 inline-block bg-blue-600 text-white text-xs font-bold px-2 py-0.5 rounded-full">
                  {pendingMembers.length}
                </span>
              )}
            </h3>
            {pendingMembers.length === 0 ? (
              <div className="text-xs text-slate-500 p-2">No pending approvals</div>
            ) : (
              <div className="space-y-1">
                {pendingMembers.map(member => (
                  <button
                    key={member.id}
                    onClick={() => {
                      setSelectedMemberId(member.id);
                      setShowRejectForm(false);
                      setRejectionReason('');
                    }}
                    className={`w-full text-left p-2 rounded-lg border text-xs transition-all ${
                      selectedMemberId === member.id
                        ? 'bg-blue-50 border-blue-300'
                        : 'bg-white border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    <div className="font-medium text-slate-900">{member.name}</div>
                    <div className="text-slate-600 truncate">{member.role}</div>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Active Tab */}
          <div className="pt-3 border-t border-slate-200">
            <h3 className="font-semibold text-xs text-slate-900 uppercase tracking-wide mb-2">
              Active Members
              {activeMembers.length > 0 && (
                <span className="ml-2 inline-block bg-emerald-600 text-white text-xs font-bold px-2 py-0.5 rounded-full">
                  {activeMembers.length}
                </span>
              )}
            </h3>
            {activeMembers.length === 0 ? (
              <div className="text-xs text-slate-500 p-2">No active members</div>
            ) : (
              <div className="space-y-1">
                {activeMembers.map(member => (
                  <button
                    key={member.id}
                    onClick={() => {
                      setSelectedMemberId(member.id);
                      setShowRejectForm(false);
                    }}
                    className={`w-full text-left p-2 rounded-lg border text-xs transition-all ${
                      selectedMemberId === member.id
                        ? 'bg-emerald-50 border-emerald-300'
                        : 'bg-white border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    <div className="font-medium text-slate-900">{member.name}</div>
                    <div className="text-slate-600 truncate">{member.role}</div>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Rejected Tab */}
          {rejectedMembers.length > 0 && (
            <div className="pt-3 border-t border-slate-200">
              <h3 className="font-semibold text-xs text-slate-900 uppercase tracking-wide mb-2">
                Rejected
                <span className="ml-2 inline-block bg-red-600 text-white text-xs font-bold px-2 py-0.5 rounded-full">
                  {rejectedMembers.length}
                </span>
              </h3>
              <div className="space-y-1">
                {rejectedMembers.map(member => (
                  <button
                    key={member.id}
                    onClick={() => {
                      setSelectedMemberId(member.id);
                      setShowRejectForm(false);
                    }}
                    className={`w-full text-left p-2 rounded-lg border text-xs transition-all ${
                      selectedMemberId === member.id
                        ? 'bg-red-50 border-red-300'
                        : 'bg-white border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    <div className="font-medium text-slate-900">{member.name}</div>
                    <div className="text-slate-600 text-xs truncate">Rejected</div>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Details Panel */}
      {selectedMember && (
        <div className="col-span-3 space-y-4">
          {/* Header */}
          <div className="bg-white border border-slate-200 rounded-lg p-4">
            <div className="flex items-start justify-between mb-2">
              <div>
                <h3 className="text-lg font-bold text-slate-900">{selectedMember.name}</h3>
                <p className="text-xs text-slate-600 mt-1">User ID: {selectedMember.userId}</p>
              </div>
              <span
                className={`text-xs px-3 py-1 rounded-full font-medium ${
                  selectedMember.status === 'Pending Approval'
                    ? 'bg-blue-100 text-blue-700'
                    : selectedMember.status === 'Active'
                    ? 'bg-emerald-100 text-emerald-700'
                    : 'bg-red-100 text-red-700'
                }`}
              >
                {selectedMember.status}
              </span>
            </div>
          </div>

          {/* Basic Information */}
          <div className="bg-white border border-slate-200 rounded-lg p-4">
            <h4 className="font-semibold text-sm text-slate-900 mb-3">Basic Information</h4>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <div className="text-xs text-slate-600">Email</div>
                <div className="font-medium text-sm text-slate-900">{selectedMember.email}</div>
              </div>
              <div>
                <div className="text-xs text-slate-600">Phone</div>
                <div className="font-medium text-sm text-slate-900">{selectedMember.phone}</div>
              </div>
              <div>
                <div className="text-xs text-slate-600">Role</div>
                <div className="font-medium text-sm text-slate-900">{selectedMember.role}</div>
              </div>
              <div>
                <div className="text-xs text-slate-600">Experience Level</div>
                <div className="font-medium text-sm text-slate-900">{selectedMember.experienceLevel}</div>
              </div>
            </div>
          </div>

          {/* Location & Management */}
          <div className="bg-white border border-slate-200 rounded-lg p-4">
            <h4 className="font-semibold text-sm text-slate-900 mb-3">Location & Management</h4>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <div className="text-xs text-slate-600">Location</div>
                <div className="font-medium text-sm text-slate-900">{selectedMember.location}</div>
              </div>
              <div>
                <div className="text-xs text-slate-600">Manager</div>
                <div className="font-medium text-sm text-slate-900">{selectedMember.managerName || '-'}</div>
              </div>
            </div>
          </div>

          {/* Product & Target */}
          <div className="bg-white border border-slate-200 rounded-lg p-4">
            <h4 className="font-semibold text-sm text-slate-900 mb-3">Product & Target</h4>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <div className="text-xs text-slate-600">Product</div>
                <div className="font-medium text-sm text-slate-900">{selectedMember.product}</div>
              </div>
              <div>
                <div className="text-xs text-slate-600">Monthly Target</div>
                <div className="font-medium text-sm text-slate-900">{selectedMember.monthlyTarget}</div>
              </div>
              <div>
                <div className="text-xs text-slate-600">Capacity</div>
                <div className="font-medium text-sm text-slate-900">{selectedMember.capacityPercent}%</div>
              </div>
            </div>
          </div>

          {/* Employment Details */}
          <div className="bg-white border border-slate-200 rounded-lg p-4">
            <h4 className="font-semibold text-sm text-slate-900 mb-3">Employment Details</h4>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <div className="text-xs text-slate-600">Employment Type</div>
                <div className="font-medium text-sm text-slate-900">{selectedMember.employmentType}</div>
              </div>
              <div>
                <div className="text-xs text-slate-600">Joining Date</div>
                <div className="font-medium text-sm text-slate-900">
                  {new Date(selectedMember.joiningDate).toLocaleDateString()}
                </div>
              </div>
            </div>
          </div>

          {/* Rejection Reason (if rejected) */}
          {selectedMember.headRejectionReason && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <h4 className="font-semibold text-sm text-red-900 mb-2">Rejection Reason</h4>
              <p className="text-sm text-red-800">{selectedMember.headRejectionReason}</p>
            </div>
          )}

          {/* Rejection Form (for pending) */}
          {selectedMember.status === 'Pending Approval' && showRejectForm && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <h4 className="font-semibold text-sm text-red-900 mb-2">Rejection Reason</h4>
              <textarea
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                placeholder="Why are you rejecting this team member?"
                className="w-full px-3 py-2 border border-red-300 rounded-lg text-sm focus:ring-2 focus:ring-red-500"
                rows={3}
              />
            </div>
          )}

          {/* Action Buttons */}
          {selectedMember.status === 'Pending Approval' && (
            <div className="flex gap-2">
              {!showRejectForm ? (
                <>
                  <button
                    onClick={handleApprove}
                    className="flex-1 px-4 py-2 text-sm font-medium text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg transition-colors flex items-center justify-center gap-2"
                  >
                    <CheckCircle2 size={16} />
                    Approve Member
                  </button>
                  <button
                    onClick={() => setShowRejectForm(true)}
                    className="flex-1 px-4 py-2 text-sm font-medium text-red-700 bg-red-50 hover:bg-red-100 rounded-lg transition-colors flex items-center justify-center gap-2 border border-red-200"
                  >
                    <X size={16} />
                    Reject
                  </button>
                </>
              ) : (
                <>
                  <button
                    onClick={() => setShowRejectForm(false)}
                    className="flex-1 px-4 py-2 text-sm font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleReject}
                    disabled={!rejectionReason.trim()}
                    className="flex-1 px-4 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 disabled:bg-red-300 rounded-lg transition-colors"
                  >
                    Confirm Rejection
                  </button>
                </>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
