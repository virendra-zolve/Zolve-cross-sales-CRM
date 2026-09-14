import React, { useState, useMemo } from 'react';
import { Building2, FileText, Clock, CheckCircle2, X, Edit2 } from 'lucide-react';
import { Partner } from '../types';

interface PartnerApprovalTabProps {
  partners: Partner[];
  userRole: 'manager' | 'head';
  locationId?: string; // for manager to filter by location
  onApprovePartner: (partnerId: string, commissionUpdates?: Record<string, number>) => void;
  onRejectPartner: (partnerId: string, reason: string) => void;
}

export const PartnerApprovalTab: React.FC<PartnerApprovalTabProps> = ({
  partners,
  userRole,
  locationId,
  onApprovePartner,
  onRejectPartner,
}) => {
  const [selectedPartnerId, setSelectedPartnerId] = useState<string | null>(null);
  const [editingCommissions, setEditingCommissions] = useState<Record<string, number>>({});
  const [rejectionReason, setRejectionReason] = useState('');
  const [showRejectForm, setShowRejectForm] = useState(false);

  // Filter partners based on role and status
  const pendingPartners = useMemo(() => {
    let filtered = partners;

    // Filter by role
    if (userRole === 'manager') {
      filtered = filtered.filter(
        p => p.status === 'Pending Manager' && p.locationId === locationId
      );
    } else {
      // Head sees pending head and agreement pending
      filtered = filtered.filter(
        p => p.status === 'Pending Head' || p.status === 'Agreement Pending'
      );
    }

    return filtered;
  }, [partners, userRole, locationId]);

  const selectedPartner = selectedPartnerId 
    ? partners.find(p => p.id === selectedPartnerId)
    : null;

  const handleApprove = () => {
    if (!selectedPartnerId) return;
    onApprovePartner(selectedPartnerId, editingCommissions);
    setSelectedPartnerId(null);
    setEditingCommissions({});
  };

  const handleReject = () => {
    if (!selectedPartnerId || !rejectionReason.trim()) return;
    onRejectPartner(selectedPartnerId, rejectionReason);
    setSelectedPartnerId(null);
    setRejectionReason('');
    setShowRejectForm(false);
  };

  const handleCommissionChange = (product: string, value: number) => {
    setEditingCommissions(prev => ({
      ...prev,
      [product]: value,
    }));
  };

  if (pendingPartners.length === 0) {
    return (
      <div className="bg-white border border-slate-200 rounded-lg p-8 text-center">
        <Building2 size={32} className="mx-auto text-slate-300 mb-2" />
        <p className="text-slate-600 text-sm">No pending partner approvals</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-3 gap-4">
      {/* Partners List */}
      <div className="col-span-1 space-y-2">
        <h3 className="font-semibold text-sm text-slate-900 mb-3">
          {userRole === 'manager' ? 'My Location Partners' : 'All Pending Approvals'}
        </h3>
        {pendingPartners.map(partner => (
          <button
            key={partner.id}
            onClick={() => {
              setSelectedPartnerId(partner.id);
              setEditingCommissions({});
              setShowRejectForm(false);
            }}
            className={`w-full text-left p-3 rounded-lg border transition-all ${
              selectedPartnerId === partner.id
                ? 'bg-blue-50 border-blue-300'
                : 'bg-white border-slate-200 hover:border-slate-300'
            }`}
          >
            <div className="font-medium text-sm text-slate-900">{partner.businessName}</div>
            <div className="text-xs text-slate-600 mt-1">{partner.partnerType}</div>
            <div className="flex items-center gap-1 mt-1">
              <span className={`text-xs px-2 py-0.5 rounded-full ${
                partner.status === 'Pending Manager'
                  ? 'bg-yellow-100 text-yellow-700'
                  : 'bg-blue-100 text-blue-700'
              }`}>
                {partner.status}
              </span>
            </div>
          </button>
        ))}
      </div>

      {/* Partner Details & Actions */}
      {selectedPartner && (
        <div className="col-span-2 space-y-4">
          {/* Header */}
          <div className="bg-white border border-slate-200 rounded-lg p-4">
            <div className="flex items-start justify-between mb-2">
              <div>
                <h3 className="text-lg font-bold text-slate-900">{selectedPartner.businessName}</h3>
                <p className="text-xs text-slate-600 mt-1">{selectedPartner.partnerCode}</p>
              </div>
              <span className={`text-xs px-3 py-1 rounded-full font-medium ${
                selectedPartner.status === 'Pending Manager'
                  ? 'bg-yellow-100 text-yellow-700'
                  : 'bg-blue-100 text-blue-700'
              }`}>
                {selectedPartner.status}
              </span>
            </div>

            {/* Business Info */}
            <div className="grid grid-cols-2 gap-3 mt-4 pt-4 border-t border-slate-200">
              <div>
                <div className="text-xs text-slate-600">PAN</div>
                <div className="font-medium text-sm text-slate-900">{selectedPartner.pan}</div>
                {selectedPartner.panNumber && (
                  <div className="text-xs text-slate-600 mt-1">#{selectedPartner.panNumber}</div>
                )}
              </div>
              <div>
                <div className="text-xs text-slate-600">GST</div>
                <div className="font-medium text-sm text-slate-900">{selectedPartner.gst || '-'}</div>
                {selectedPartner.gstNumber && (
                  <div className="text-xs text-slate-600 mt-1">#{selectedPartner.gstNumber}</div>
                )}
              </div>
              <div>
                <div className="text-xs text-slate-600">Type</div>
                <div className="font-medium text-sm text-slate-900">{selectedPartner.partnerType}</div>
              </div>
              <div>
                <div className="text-xs text-slate-600">Owner</div>
                <div className="font-medium text-sm text-slate-900">{selectedPartner.ownerName}</div>
              </div>
            </div>
          </div>

          {/* Documents */}
          {selectedPartner.documents.length > 0 && (
            <div className="bg-white border border-slate-200 rounded-lg p-4">
              <h4 className="font-semibold text-sm text-slate-900 mb-2 flex items-center gap-2">
                <FileText size={16} />
                Documents
              </h4>
              <div className="space-y-2">
                {selectedPartner.documents.map((doc, idx) => (
                  <a
                    key={idx}
                    href={doc.fileUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs text-blue-600 hover:text-blue-700 flex items-center gap-2 p-2 hover:bg-blue-50 rounded"
                  >
                    <FileText size={14} />
                    {doc.type}: {doc.fileName}
                  </a>
                ))}
              </div>
            </div>
          )}

          {/* Commission Editing */}
          {!showRejectForm && selectedPartner.commissions.length > 0 && (
            <div className="bg-white border border-slate-200 rounded-lg p-4">
              <h4 className="font-semibold text-sm text-slate-900 mb-3 flex items-center gap-2">
                <Edit2 size={16} />
                Commission Structure
              </h4>
              <div className="space-y-2">
                {selectedPartner.commissions.map(comm => (
                  <div key={comm.product} className="flex items-center justify-between p-2 border border-slate-200 rounded-lg">
                    <span className="text-sm font-medium text-slate-900">{comm.product}</span>
                    <div className="flex items-center gap-2">
                      <input
                        type="number"
                        min="0"
                        max="100"
                        value={editingCommissions[comm.product] || comm.value}
                        onChange={(e) => handleCommissionChange(comm.product, parseFloat(e.target.value))}
                        className="w-16 px-2 py-1 border border-slate-300 rounded text-sm focus:ring-2 focus:ring-blue-500"
                      />
                      <span className="text-sm text-slate-600">%</span>
                    </div>
                  </div>
                ))}
              </div>
              <p className="text-xs text-slate-600 mt-3">
                💡 Tip: Edit commission percentages if needed before approval
              </p>
            </div>
          )}

          {/* Rejection Form */}
          {showRejectForm && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <h4 className="font-semibold text-sm text-red-900 mb-2">Rejection Reason</h4>
              <textarea
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                placeholder="Why are you rejecting this partner?"
                className="w-full px-3 py-2 border border-red-300 rounded-lg text-sm focus:ring-2 focus:ring-red-500"
                rows={3}
              />
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-2">
            {!showRejectForm ? (
              <>
                <button
                  onClick={handleApprove}
                  className="flex-1 px-4 py-2 text-sm font-medium text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg transition-colors flex items-center justify-center gap-2"
                >
                  <CheckCircle2 size={16} />
                  Approve Partner
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
        </div>
      )}
    </div>
  );
};
