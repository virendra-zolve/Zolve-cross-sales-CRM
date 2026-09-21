import React from 'react';
import { DollarSign, User, Phone, Mail } from 'lucide-react';
import { StudentLead, FundingPlan } from '../../types';

interface LeadFinancialSectionProps {
  lead: StudentLead;
  onUpdate: (field: keyof StudentLead, value: any) => void;
  isDirty: boolean;
}

export const LeadFinancialSection: React.FC<LeadFinancialSectionProps> = ({
  lead,
  onUpdate,
  isDirty,
}) => {
  const fundingPlans: FundingPlan[] = ['Will Need Loan', 'Self Fund', 'Unknown'];

  return (
    <div className="space-y-4">
      <div className="bg-emerald-50 rounded-lg border border-emerald-200 p-4">
        <p className="text-xs text-emerald-700 font-semibold">
          Financial Profile — Basic funding information for qualification and product initiation
        </p>
      </div>

      {/* Funding Plan */}
      <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs space-y-3">
        <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
          <DollarSign className="w-4 h-4 text-emerald-600" />
          Funding Plan
        </h3>
        <div className="space-y-2">
          {fundingPlans.map(plan => (
            <label key={plan} className="flex items-center gap-3 cursor-pointer p-2 rounded-lg hover:bg-slate-50 transition-colors">
              <input
                type="radio"
                name="fundingPlan"
                value={plan}
                checked={lead.fundingPlan === plan}
                onChange={e => onUpdate('fundingPlan', e.target.value as FundingPlan)}
                className="w-4 h-4 text-[#2563EB] cursor-pointer"
              />
              <span className="text-sm font-medium text-slate-700">{plan}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Approximate Funding Requirement */}
      <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs space-y-3">
        <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
          <DollarSign className="w-4 h-4 text-slate-600" />
          Approximate Funding Requirement
        </h3>
        <input
          type="number"
          placeholder="Enter amount (e.g., 3000000 for INR 30 lakhs)"
          className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-sm font-mono text-slate-900 focus:bg-white focus:outline-none focus:border-[#2563EB]"
        />
        <p className="text-xs text-slate-500">Enter the estimated total funding requirement for the entire course</p>
      </div>

      {/* Co-Applicant Information */}
      <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs space-y-4">
        <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
          <User className="w-4 h-4 text-slate-600" />
          Co-Applicant Information — If Loan Required
        </h3>

        <div className="bg-slate-50 border border-slate-200 rounded-lg p-3 space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-[11px] text-slate-500 font-medium block mb-1">Co-Applicant Name</label>
              <input
                type="text"
                placeholder="e.g., Rajesh Sharma"
                className="w-full p-2 bg-white border border-slate-200 rounded-lg text-sm text-slate-900 focus:outline-none focus:border-[#2563EB]"
              />
            </div>
            <div>
              <label className="text-[11px] text-slate-500 font-medium block mb-1">Relationship</label>
              <select className="w-full p-2 bg-white border border-slate-200 rounded-lg text-sm text-slate-900 focus:outline-none focus:border-[#2563EB]">
                <option>Select relationship...</option>
                <option>Father</option>
                <option>Mother</option>
                <option>Spouse</option>
                <option>Sibling</option>
                <option>Other</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-[11px] text-slate-500 font-medium block mb-1 flex items-center gap-1">
                <Phone className="w-3 h-3" />
                Mobile Number
              </label>
              <input
                type="tel"
                placeholder="98765XXXXX"
                className="w-full p-2 bg-white border border-slate-200 rounded-lg text-sm font-mono text-slate-900 focus:outline-none focus:border-[#2563EB]"
              />
            </div>
            <div>
              <label className="text-[11px] text-slate-500 font-medium block mb-1 flex items-center gap-1">
                <Mail className="w-3 h-3" />
                Email
              </label>
              <input
                type="email"
                placeholder="email@example.com"
                className="w-full p-2 bg-white border border-slate-200 rounded-lg text-sm text-slate-900 focus:outline-none focus:border-[#2563EB]"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-[11px] text-slate-500 font-medium block mb-1">Profession / Occupation</label>
              <input
                type="text"
                placeholder="e.g., Salaried / Business"
                className="w-full p-2 bg-white border border-slate-200 rounded-lg text-sm text-slate-900 focus:outline-none focus:border-[#2563EB]"
              />
            </div>
            <div>
              <label className="text-[11px] text-slate-500 font-medium block mb-1">Employer / Business</label>
              <input
                type="text"
                placeholder="Company or business name"
                className="w-full p-2 bg-white border border-slate-200 rounded-lg text-sm text-slate-900 focus:outline-none focus:border-[#2563EB]"
              />
            </div>
          </div>

          <div>
            <label className="text-[11px] text-slate-500 font-medium block mb-1">Annual Income</label>
            <input
              type="number"
              placeholder="e.g., 1200000 for INR 12 lakhs"
              className="w-full p-2 bg-white border border-slate-200 rounded-lg text-sm font-mono text-slate-900 focus:outline-none focus:border-[#2563EB]"
            />
          </div>
        </div>

        <p className="text-xs text-slate-500 bg-blue-50 border border-blue-200 rounded-lg p-2">
          ℹ️ Detailed financial information and loan underwriting happens in the Education Loan product workflow, not here. This captures only the essential information needed for qualification.
        </p>
      </div>

      {/* Summary */}
      <div className="bg-gradient-to-r from-blue-50 to-slate-50 rounded-xl border border-blue-200 p-4">
        <p className="text-xs text-blue-700 font-semibold mb-2">📋 Quick Summary</p>
        <div className="space-y-1 text-xs text-blue-600">
          <div>• <strong>Funding Plan:</strong> {lead.fundingPlan}</div>
          <div>• <strong>Status:</strong> Ready for qualification and product initiation</div>
          {lead.fundingPlan === 'Will Need Loan' && (
            <div>• <strong>Loan tracking:</strong> Education Loan product opportunity can be created</div>
          )}
        </div>
      </div>
    </div>
  );
};
