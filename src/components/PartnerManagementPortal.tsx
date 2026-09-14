import React, { useState } from 'react';
import { X, Building2 } from 'lucide-react';
import { Partner } from '../types';
import { PartnerApprovalTab } from './PartnerApprovalTab';

interface PartnerManagementPortalProps {
  isOpen: boolean;
  onClose: () => void;
  partners: Partner[];
  userRole: 'manager' | 'head';
  locationId?: string;
  locationName?: string;
  onApprovePartner: (partnerId: string, commissionUpdates?: Record<string, number>) => void;
  onRejectPartner: (partnerId: string, reason: string) => void;
}

export const PartnerManagementPortal: React.FC<PartnerManagementPortalProps> = ({
  isOpen,
  onClose,
  partners,
  userRole,
  locationId,
  locationName,
  onApprovePartner,
  onRejectPartner,
}) => {
  const [activeTab, setActiveTab] = useState<'approvals' | 'approved' | 'rejected'>('approvals');

  const pendingCount = partners.filter(p => 
    userRole === 'manager' 
      ? p.status === 'Pending Manager' && p.locationId === locationId
      : (p.status === 'Pending Head' || p.status === 'Agreement Pending')
  ).length;

  const approvedCount = partners.filter(p => p.status === 'Active').length;
  const rejectedCount = partners.filter(p => 
    p.status === 'Rejected by Manager' || p.status === 'Rejected by Head'
  ).length;

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 z-50 flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-xl max-w-5xl w-full my-8 max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-200 p-4 bg-slate-50">
          <div>
            <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <Building2 size={20} className="text-slate-600" />
              Partner Management Portal
            </h2>
            {locationName && (
              <p className="text-xs text-slate-600 mt-1">Location: {locationName}</p>
            )}
          </div>
          <button
            onClick={onClose}
            className="p-1 hover:bg-slate-200 rounded-lg transition-colors"
          >
            <X size={20} className="text-slate-600" />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex gap-0 border-b border-slate-200 px-4 bg-white">
          <button
            onClick={() => setActiveTab('approvals')}
            className={`px-4 py-3 text-sm font-medium border-b-2 transition-all ${
              activeTab === 'approvals'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            Pending Approvals
            {pendingCount > 0 && (
              <span className="ml-2 inline-flex items-center justify-center w-5 h-5 text-xs font-bold bg-yellow-100 text-yellow-700 rounded-full">
                {pendingCount}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('approved')}
            className={`px-4 py-3 text-sm font-medium border-b-2 transition-all ${
              activeTab === 'approved'
                ? 'border-emerald-600 text-emerald-600'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            Active Partners
            {approvedCount > 0 && (
              <span className="ml-2 inline-flex items-center justify-center w-5 h-5 text-xs font-bold bg-emerald-100 text-emerald-700 rounded-full">
                {approvedCount}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('rejected')}
            className={`px-4 py-3 text-sm font-medium border-b-2 transition-all ${
              activeTab === 'rejected'
                ? 'border-red-600 text-red-600'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            Rejected
            {rejectedCount > 0 && (
              <span className="ml-2 inline-flex items-center justify-center w-5 h-5 text-xs font-bold bg-red-100 text-red-700 rounded-full">
                {rejectedCount}
              </span>
            )}
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4">
          {activeTab === 'approvals' && (
            <PartnerApprovalTab
              partners={partners}
              userRole={userRole}
              locationId={locationId}
              onApprovePartner={onApprovePartner}
              onRejectPartner={onRejectPartner}
            />
          )}

          {activeTab === 'approved' && (
            <div className="space-y-2">
              {partners.filter(p => p.status === 'Active').length === 0 ? (
                <div className="text-center py-8">
                  <Building2 size={32} className="mx-auto text-slate-300 mb-2" />
                  <p className="text-slate-600 text-sm">No active partners yet</p>
                </div>
              ) : (
                partners.filter(p => p.status === 'Active').map(partner => (
                  <div key={partner.id} className="bg-white border border-slate-200 rounded-lg p-3 hover:bg-slate-50">
                    <div className="flex items-start justify-between">
                      <div>
                        <h4 className="font-semibold text-slate-900">{partner.businessName}</h4>
                        <p className="text-xs text-slate-600 mt-1">
                          {partner.partnerType} • {partner.partnerCode}
                        </p>
                        <p className="text-xs text-slate-600 mt-1">
                          Commissions: {partner.commissions.map(c => `${c.product}: ${c.value}%`).join(', ')}
                        </p>
                      </div>
                      <span className="text-xs px-2 py-1 rounded-full bg-emerald-100 text-emerald-700 font-medium">
                        Active
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          {activeTab === 'rejected' && (
            <div className="space-y-2">
              {partners.filter(p => p.status === 'Rejected by Manager' || p.status === 'Rejected by Head').length === 0 ? (
                <div className="text-center py-8">
                  <Building2 size={32} className="mx-auto text-slate-300 mb-2" />
                  <p className="text-slate-600 text-sm">No rejected partners</p>
                </div>
              ) : (
                partners.filter(p => p.status === 'Rejected by Manager' || p.status === 'Rejected by Head').map(partner => (
                  <div key={partner.id} className="bg-red-50 border border-red-200 rounded-lg p-3">
                    <div className="flex items-start justify-between">
                      <div>
                        <h4 className="font-semibold text-slate-900">{partner.businessName}</h4>
                        <p className="text-xs text-slate-600 mt-1">
                          {partner.partnerType} • {partner.partnerCode}
                        </p>
                        {partner.status === 'Rejected by Manager' && partner.managerRejectionReason && (
                          <p className="text-xs text-red-700 mt-1">
                            Reason: {partner.managerRejectionReason}
                          </p>
                        )}
                        {partner.status === 'Rejected by Head' && partner.headRejectionReason && (
                          <p className="text-xs text-red-700 mt-1">
                            Reason: {partner.headRejectionReason}
                          </p>
                        )}
                      </div>
                      <span className="text-xs px-2 py-1 rounded-full bg-red-100 text-red-700 font-medium">
                        Rejected
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="border-t border-slate-200 p-4 bg-slate-50">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-100 transition-colors"
          >
            Close Portal
          </button>
        </div>
      </div>
    </div>
  );
};
