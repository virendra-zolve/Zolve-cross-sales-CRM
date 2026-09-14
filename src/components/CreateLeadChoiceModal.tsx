import React from 'react';
import { UserPlus, Upload, X, FileSpreadsheet, User, ArrowRight } from 'lucide-react';

interface CreateLeadChoiceModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectManual: () => void;
  onSelectBulk: () => void;
}

export const CreateLeadChoiceModal: React.FC<CreateLeadChoiceModalProps> = ({
  isOpen,
  onClose,
  onSelectManual,
  onSelectBulk,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-2xl border border-slate-200 max-w-md w-full overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/70">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-[#D91C24]/10 text-[#D91C24] flex items-center justify-center font-bold">
              <UserPlus className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900">Create Lead</h3>
              <p className="text-xs text-slate-500">Choose how you want to add new leads to Zolve CRM</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 p-1 rounded-lg hover:bg-slate-100 cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-5 space-y-3">
          {/* Option 1: Manual Single Lead Entry */}
          <button
            onClick={() => {
              onClose();
              onSelectManual();
            }}
            className="w-full text-left p-4 rounded-xl border border-slate-200 hover:border-[#D91C24] bg-white hover:bg-rose-50/30 transition-all group flex items-start justify-between gap-3 cursor-pointer shadow-xs hover:shadow-sm"
          >
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-lg bg-slate-100 group-hover:bg-[#D91C24] text-slate-700 group-hover:text-white flex items-center justify-center shrink-0 transition-colors">
                <User className="w-5 h-5" />
              </div>
              <div>
                <span className="text-sm font-bold text-slate-900 block group-hover:text-[#D91C24] transition-colors">
                  Manual Lead Entry
                </span>
                <p className="text-xs text-slate-500 mt-0.5 leading-relaxed">
                  Enter single student details manually, specify journey stage, products, and immediate assignment.
                </p>
              </div>
            </div>
            <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-[#D91C24] mt-1 shrink-0 group-hover:translate-x-0.5 transition-all" />
          </button>

          {/* Option 2: Bulk CSV / Excel Upload */}
          <button
            onClick={() => {
              onClose();
              onSelectBulk();
            }}
            className="w-full text-left p-4 rounded-xl border border-slate-200 hover:border-[#D91C24] bg-white hover:bg-rose-50/30 transition-all group flex items-start justify-between gap-3 cursor-pointer shadow-xs hover:shadow-sm"
          >
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-lg bg-slate-100 group-hover:bg-[#D91C24] text-slate-700 group-hover:text-white flex items-center justify-center shrink-0 transition-colors">
                <FileSpreadsheet className="w-5 h-5" />
              </div>
              <div>
                <span className="text-sm font-bold text-slate-900 block group-hover:text-[#D91C24] transition-colors">
                  Bulk Upload (CSV / Excel)
                </span>
                <p className="text-xs text-slate-500 mt-0.5 leading-relaxed">
                  Import batches of leads from partners, university fairs, or campaign files directly into the unassigned queue.
                </p>
              </div>
            </div>
            <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-[#D91C24] mt-1 shrink-0 group-hover:translate-x-0.5 transition-all" />
          </button>
        </div>

        <div className="p-3 bg-slate-50 border-t border-slate-100 text-right">
          <button
            onClick={onClose}
            className="px-3 py-1.5 text-xs font-semibold text-slate-600 hover:text-slate-800 rounded-lg hover:bg-slate-200/60 cursor-pointer"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};
