import React, { useState } from 'react';
import { LenderApplicationProgress, LenderStatus } from '../types/normalized';
import { LENDER_STATUS_DISPLAY_INFO, getValidLenderNextStatuses } from '../utils/loanProgressionHelpers';
import { ChevronDown, Plus, Trash2 } from 'lucide-react';

interface LenderManagementCardProps {
  lender: LenderApplicationProgress;
  onUpdateStatus: (lenderId: string, newStatus: LenderStatus, details?: any) => void;
  onRemove: (lenderId: string) => void;
}

export const LenderManagementCard: React.FC<LenderManagementCardProps> = ({
  lender,
  onUpdateStatus,
  onRemove,
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [showStatusForm, setShowStatusForm] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState<LenderStatus | null>(null);
  const [formData, setFormData] = useState<any>({});

  const statusInfo = LENDER_STATUS_DISPLAY_INFO[lender.lenderStatus];
  const validNextStatuses = getValidLenderNextStatuses(lender.lenderStatus);
  const matchScorePercentage = (lender.matchScore / 100) * 100;

  const handleStatusChange = (newStatus: LenderStatus) => {
    setSelectedStatus(newStatus);
    setShowStatusForm(true);
  };

  const handleFormSubmit = () => {
    if (selectedStatus) {
      onUpdateStatus(lender.lenderId, selectedStatus, formData);
      setShowStatusForm(false);
      setFormData({});
    }
  };

  return (
    <div className="border rounded-lg p-4 bg-white shadow-sm hover:shadow-md transition-shadow">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <h3 className="font-semibold text-lg text-gray-900">{lender.lenderName}</h3>
          <div className="flex items-center gap-4 mt-2">
            <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${statusInfo.color}`}>
              {statusInfo.label}
            </span>
            <div className="flex items-center gap-2">
              <div className="w-24 bg-gray-200 rounded-full h-2">
                <div
                  className="bg-blue-600 h-2 rounded-full transition-all"
                  style={{ width: `${matchScorePercentage}%` }}
                />
              </div>
              <span className="text-sm font-semibold text-gray-700">{lender.matchScore}%</span>
            </div>
          </div>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ChevronDown className={`w-5 h-5 transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
          </button>
          <button
            onClick={() => onRemove(lender.lenderId)}
            className="p-2 hover:bg-red-100 rounded-lg transition-colors text-red-600"
          >
            <Trash2 className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Expanded Details */}
      {isExpanded && (
        <div className="mt-4 pt-4 border-t space-y-4">
          {/* Recommendation Source */}
          {lender.recommendationSource && (
            <div className="text-sm">
              <span className="text-gray-600">Source:</span>
              <span className="ml-2 font-medium">
                {lender.recommendationSource === 'AUTO_RECOMMENDED' ? 'Auto Recommended' : 'Manual'}
              </span>
            </div>
          )}

          {/* Sanction Details */}
          {lender.sanctionDetails && (
            <div className="bg-green-50 p-3 rounded-lg border border-green-200">
              <h4 className="font-semibold text-sm text-green-900 mb-2">Sanction Details</h4>
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div>
                  <span className="text-gray-600">Amount:</span>
                  <span className="ml-2 font-medium">₹{lender.sanctionDetails.sanctionAmount.toLocaleString()}</span>
                </div>
                <div>
                  <span className="text-gray-600">ROI:</span>
                  <span className="ml-2 font-medium">{lender.sanctionDetails.roi}%</span>
                </div>
                <div>
                  <span className="text-gray-600">Processing Fee:</span>
                  <span className="ml-2 font-medium">₹{lender.sanctionDetails.processingFee.toLocaleString()}</span>
                </div>
                <div>
                  <span className="text-gray-600">Validity:</span>
                  <span className="ml-2 font-medium">{new Date(lender.sanctionDetails.sanctionValidity).toLocaleDateString()}</span>
                </div>
              </div>
            </div>
          )}

          {/* Disbursement Details */}
          {lender.disbursementDetails && (
            <div className="bg-emerald-50 p-3 rounded-lg border border-emerald-200">
              <h4 className="font-semibold text-sm text-emerald-900 mb-2">Disbursement Details</h4>
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div>
                  <span className="text-gray-600">Amount:</span>
                  <span className="ml-2 font-medium">₹{lender.disbursementDetails.disbursementAmount.toLocaleString()}</span>
                </div>
                <div>
                  <span className="text-gray-600">Date:</span>
                  <span className="ml-2 font-medium">{new Date(lender.disbursementDetails.disbursementDate).toLocaleDateString()}</span>
                </div>
              </div>
            </div>
          )}

          {/* Rejection Reason */}
          {lender.rejectionReason && (
            <div className="bg-red-50 p-3 rounded-lg border border-red-200">
              <h4 className="font-semibold text-sm text-red-900 mb-1">Rejection Reason</h4>
              <p className="text-sm text-red-700">{lender.rejectionReason}</p>
            </div>
          )}

          {/* Status History */}
          {lender.statusHistory.length > 0 && (
            <div className="bg-gray-50 p-3 rounded-lg border border-gray-200">
              <h4 className="font-semibold text-sm text-gray-900 mb-2">Status History</h4>
              <div className="space-y-1 text-xs">
                {lender.statusHistory.slice(-3).map((history, idx) => (
                  <div key={idx} className="text-gray-700">
                    <span className="text-gray-600">{new Date(history.timestamp).toLocaleDateString()}:</span>
                    <span className="ml-2 font-medium">
                      {LENDER_STATUS_DISPLAY_INFO[history.from]?.label} → {LENDER_STATUS_DISPLAY_INFO[history.to]?.label}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Update Status Section */}
          {validNextStatuses.length > 0 && (
            <div className="border-t pt-4">
              <h4 className="font-semibold text-sm text-gray-900 mb-2">Update Status</h4>
              <div className="grid grid-cols-2 gap-2">
                {validNextStatuses.map((status) => (
                  <button
                    key={status}
                    onClick={() => handleStatusChange(status)}
                    className="px-3 py-2 text-sm font-medium rounded-lg border border-blue-300 text-blue-700 hover:bg-blue-50 transition-colors"
                  >
                    {LENDER_STATUS_DISPLAY_INFO[status].label}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Status Update Form */}
          {showStatusForm && selectedStatus && (
            <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
              <h5 className="font-semibold text-sm text-blue-900 mb-3">
                Update to: {LENDER_STATUS_DISPLAY_INFO[selectedStatus].label}
              </h5>

              {selectedStatus === LenderStatus.APPROVED && (
                <div className="space-y-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Sanction Amount (₹)</label>
                    <input
                      type="number"
                      value={formData.sanctionAmount || ''}
                      onChange={(e) => setFormData({ ...formData, sanctionAmount: Number(e.target.value) })}
                      className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-lg"
                      placeholder="Enter sanction amount"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">ROI (%)</label>
                    <input
                      type="number"
                      value={formData.roi || ''}
                      onChange={(e) => setFormData({ ...formData, roi: Number(e.target.value) })}
                      className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-lg"
                      placeholder="Enter ROI percentage"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Processing Fee (₹)</label>
                    <input
                      type="number"
                      value={formData.processingFee || ''}
                      onChange={(e) => setFormData({ ...formData, processingFee: Number(e.target.value) })}
                      className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-lg"
                      placeholder="Enter processing fee"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Sanction Validity Date</label>
                    <input
                      type="date"
                      value={formData.sanctionValidity || ''}
                      onChange={(e) => setFormData({ ...formData, sanctionValidity: e.target.value })}
                      className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-lg"
                    />
                  </div>
                </div>
              )}

              {selectedStatus === LenderStatus.REJECTED && (
                <div>
                  <label className="block text-sm font-medium text-gray-700">Rejection Reason</label>
                  <textarea
                    value={formData.rejectionReason || ''}
                    onChange={(e) => setFormData({ ...formData, rejectionReason: e.target.value })}
                    className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                    placeholder="Enter rejection reason"
                    rows={3}
                  />
                </div>
              )}

              {selectedStatus === LenderStatus.DISBURSED && (
                <div className="space-y-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Disbursement Amount (₹)</label>
                    <input
                      type="number"
                      value={formData.disbursementAmount || ''}
                      onChange={(e) => setFormData({ ...formData, disbursementAmount: Number(e.target.value) })}
                      className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-lg"
                      placeholder="Enter disbursement amount"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Disbursement Date</label>
                    <input
                      type="date"
                      value={formData.disbursementDate || ''}
                      onChange={(e) => setFormData({ ...formData, disbursementDate: e.target.value })}
                      className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-lg"
                    />
                  </div>
                </div>
              )}

              <div className="flex gap-2 mt-4">
                <button
                  onClick={handleFormSubmit}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
                >
                  Confirm Update
                </button>
                <button
                  onClick={() => {
                    setShowStatusForm(false);
                    setSelectedStatus(null);
                  }}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
