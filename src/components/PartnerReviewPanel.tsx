import React, { useState } from 'react';
import { CheckCircle2, XCircle, RotateCcw, FileText, Building2 } from 'lucide-react';
import { PartnerMaster, PartnerCommissionConfig, PartnerDocument } from '../types/partner';
import { WorkflowDecision, mandatoryDocsApproved } from '../utils/partnerWorkflow';

interface PartnerReviewPanelProps {
  partner: PartnerMaster;
  commissions: PartnerCommissionConfig[];
  documents: PartnerDocument[];
  onDecision: (partnerId: string, decision: WorkflowDecision, comment?: string) => void;
}

export const PartnerReviewPanel: React.FC<PartnerReviewPanelProps> = ({
  partner,
  commissions,
  documents,
  onDecision,
}) => {
  const [comment, setComment] = useState('');
  const docsReady = mandatoryDocsApproved(documents);

  return (
    <div className="space-y-4">
      <div className="bg-white border border-slate-200 rounded-lg p-4">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-2">
            <Building2 size={20} className="text-slate-400" />
            <div>
              <h3 className="text-lg font-bold text-slate-900">{partner.legalBusinessName}</h3>
              <p className="text-xs text-slate-600">{partner.id} • {partner.partnerType} • {partner.partnerScale}</p>
            </div>
          </div>
          <span className="text-xs px-3 py-1 rounded-full bg-amber-50 text-amber-800 border border-amber-200 font-medium">
            {partner.status}
          </span>
        </div>
        <div className="grid grid-cols-2 gap-3 mt-4 pt-4 border-t border-slate-200 text-sm">
          <div><span className="text-xs text-slate-500">PAN</span><div>{partner.panNumber}</div></div>
          <div><span className="text-xs text-slate-500">GST</span><div>{partner.gstNumber || '—'}</div></div>
          <div><span className="text-xs text-slate-500">Owner</span><div>{partner.ownerName} ({partner.ownerEmail})</div></div>
          <div><span className="text-xs text-slate-500">BD Owner</span><div>{partner.bdOwnerName || partner.bdOwnerId}</div></div>
        </div>
      </div>

      <div className="bg-white border border-slate-200 rounded-lg p-4">
        <h4 className="font-semibold text-sm text-slate-900 mb-2">Commission</h4>
        {commissions.length === 0 ? (
          <p className="text-xs text-slate-500">No commission configured</p>
        ) : (
          commissions.map((c) => (
            <div key={c.id} className="text-xs text-slate-700 border border-slate-100 rounded p-2 mb-2">
              <div className="font-medium">{c.product} — {c.tierMetric} ({c.commissionType})</div>
              {c.tiers.map((t) => (
                <div key={t.id} className="text-slate-500">
                  {t.fromValue} – {t.toValue ?? '∞'}: {t.commissionValue}{t.commissionType === 'Percentage' ? '%' : ' flat'}
                </div>
              ))}
            </div>
          ))
        )}
      </div>

      <div className="bg-white border border-slate-200 rounded-lg p-4">
        <h4 className="font-semibold text-sm text-slate-900 mb-2 flex items-center gap-2">
          <FileText size={16} /> Documents
        </h4>
        {documents.length === 0 ? (
          <p className="text-xs text-slate-500">No documents uploaded</p>
        ) : (
          documents.map((d) => (
            <div key={d.id} className="flex items-center justify-between text-xs py-1">
              <span>{d.documentType}: {d.fileName}</span>
              <span className={`px-2 py-0.5 rounded-full ${
                d.status === 'Approved' ? 'bg-emerald-100 text-emerald-700'
                : d.status === 'Rejected' ? 'bg-red-100 text-red-700'
                : 'bg-slate-100 text-slate-600'
              }`}>{d.status}</span>
            </div>
          ))
        )}
        {!docsReady && (
          <p className="text-[11px] text-amber-600 mt-2">PAN and Agreement must be Approved before this partner can be activated.</p>
        )}
      </div>

      <textarea
        value={comment}
        onChange={(e) => setComment(e.target.value)}
        placeholder="Review comment (required for Reject / Review Required)"
        className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500"
        rows={2}
      />

      <div className="flex gap-2">
        <button
          disabled={!docsReady}
          onClick={() => onDecision(partner.id, 'approve', comment || undefined)}
          className="flex-1 inline-flex items-center justify-center gap-1.5 px-4 py-2 text-sm font-medium text-white bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-300 rounded-lg"
        >
          <CheckCircle2 size={16} /> Approve
        </button>
        <button
          disabled={!comment.trim()}
          onClick={() => onDecision(partner.id, 'review_required', comment)}
          className="flex-1 inline-flex items-center justify-center gap-1.5 px-4 py-2 text-sm font-medium text-amber-700 bg-amber-50 hover:bg-amber-100 disabled:opacity-50 rounded-lg border border-amber-200"
        >
          <RotateCcw size={16} /> Review Required
        </button>
        <button
          disabled={!comment.trim()}
          onClick={() => onDecision(partner.id, 'reject', comment)}
          className="flex-1 inline-flex items-center justify-center gap-1.5 px-4 py-2 text-sm font-medium text-red-700 bg-red-50 hover:bg-red-100 disabled:opacity-50 rounded-lg border border-red-200"
        >
          <XCircle size={16} /> Reject
        </button>
      </div>
    </div>
  );
};
