import React, { useState } from 'react';
import { Upload, FileSpreadsheet, CheckCircle2, ArrowRight, Table, AlertTriangle } from 'lucide-react';
import { StudentLead, JourneyStage, KPIStatus, MasterProduct } from '../types';

interface BulkUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onImportLeads: (leads: StudentLead[]) => void;
}

const defaultMasterProducts = (): Record<MasterProduct, boolean> => {
  const all: MasterProduct[] = [
    'Education Loan', 'Refinance', 'Test Prep', 'Test Voucher',
    'Admissions', 'Accommodation', 'eSIM', 'Travel / Flights',
    'Bank Account', 'Credit Card', 'Money Transfer', 'NRE/NRO Account', 'Insurance'
  ];
  const map: Partial<Record<MasterProduct, boolean>> = {};
  all.forEach(k => { map[k] = false; });
  return map as Record<MasterProduct, boolean>;
};

const SAMPLE_CSV_ROWS = [
  { student_name: 'Aditya Sen', phone_num: '9830077123', email: 'aditya.sen@gmail.com', country: 'USA', university: 'Stanford University', degree: 'M.S. Management Science', intake: 'Fall 2026', source: 'PARTNER_GLOBAL_02', status: 'Valid' },
  { student_name: 'Priyanka Ghosh', phone_num: '9748822345', email: 'priyanka.ghosh@outlook.com', country: 'USA', university: 'Cornell Tech, NYC', degree: 'M.S. in Computer Science', intake: 'Fall 2026', source: 'PARTNER_GLOBAL_02', status: 'Valid' },
  { student_name: 'Aarav Sharma', phone_num: '9820144521', email: 'aarav.sharma99@gmail.com', country: 'USA', university: 'Columbia University', degree: 'M.S. Computer Science', intake: 'Fall 2026', source: 'PARTNER_GLOBAL_02', status: 'Duplicate' },
  { student_name: 'Nikhil Bansal', phone_num: '9811165432', email: 'nikhil.bansal@gmail.com', country: 'UK', university: 'London School of Economics (LSE)', degree: 'M.Sc. Finance', intake: 'Fall 2026', source: 'PARTNER_GLOBAL_02', status: 'Valid' },
];

export const BulkUploadModal: React.FC<BulkUploadModalProps> = ({
  isOpen,
  onClose,
  onImportLeads,
}) => {
  const [fileUploaded, setFileUploaded] = useState(false);
  const [fileName, setFileName] = useState('');
  const [dataRows, setDataRows] = useState(SAMPLE_CSV_ROWS);

  if (!isOpen) return null;

  const handleSimulateUpload = (name = 'partner_studyabroad_intake2026.csv') => {
    setFileName(name);
    setFileUploaded(true);
  };

  const validRows = dataRows.filter(r => r.status === 'Valid');
  const duplicateRows = dataRows.filter(r => r.status === 'Duplicate');

  const handleConfirmImport = () => {
    const newLeads: StudentLead[] = validRows.map((row, idx) => {
      const leadId = `L${(9100 + Math.floor(Math.random() * 800)).toString().padStart(6, '0')}`;
      const country = row.country;
      return {
        id: leadId,
        sourceCode: row.source,
        studentName: row.student_name,
        mobileNumber: row.phone_num,
        mobileCountryCode: '91',
        email: row.email,
        destinationCountry: country,
        universitiesOfInterest: [row.university],
        finalUniversity: row.university,
        course: row.degree,
        intake: row.intake,
        journeyStage: 'Application' as JourneyStage,
        testsInterestedIn: ['IELTS'],
        fundingPlan: 'Unknown',
        
        createdAt: new Date().toISOString(),
        signupStatus: 'Not Signed Up',

        leadOwnerTeam: 'Education Loan Team',
        leadOwner: 'Unassigned',
        leadAssignedAt: new Date().toISOString(),
        leadAssignedBy: 'Partner Bulk Upload',
        assignmentHistory: [
          { id: `as_${Date.now()}_${idx}`, assignedAt: new Date().toISOString(), assignedBy: 'Partner System', team: 'Education Loan Team', owner: 'Unassigned' }
        ],

        qualificationStatus: 'Pending',
        qualificationNotes: `Imported via bulk upload file: ${fileName}. Awaiting qualification team review.`,
        readinessChecklist: {
          passportValid: true,
          admitLetterReceived: false,
          fundingPlanReady: false,
          englishTestPassed: false,
        },

        callingStatus: 'Not Attempted',
        noOfAttempts: 0,
        nextCallAt: new Date(Date.now() + (idx + 1) * 3600 * 1000).toISOString(),
        callLogs: [],

        masterProducts: defaultMasterProducts(),
        productOpportunities: [],

        leadStatus: 'Active',
        kpiStatus: 'On Track' as KPIStatus,
        lastActionAt: new Date().toISOString(),
        lastActionBy: 'System',
        noActionSince: new Date().toISOString(),
        escalationStatus: 'Not Escalated',

        activities: [
          {
            id: `act_${Date.now()}_${idx}`,
            timestamp: new Date().toISOString(),
            actor: 'Partner Bulk Upload',
            type: 'system',
            title: 'Lead Ingested (Unassigned)',
            description: `Imported with Qualification Status = Pending. Normalized mobile dedupe passed.`,
          }
        ],
        notes: [`Ingested from partner file ${fileName}`],
      };
    });

    onImportLeads(newLeads);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
      <div 
        id="bulk-upload-modal-dialog"
        className="bg-white rounded-xl max-w-xl w-full shadow-xl border border-slate-200 overflow-hidden"
      >
        {/* Header */}
        <div className="p-4 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-blue-50 text-[#2563EB] flex items-center justify-center font-bold border border-blue-100">
              <FileSpreadsheet className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900">
                Partner / Bulk Lead Upload
              </h3>
              <p className="text-[11px] text-slate-500">
                Automatic mobile number deduplication
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 text-sm font-bold p-1 cursor-pointer"
          >
            ✕
          </button>
        </div>

        {/* Content */}
        <div className="p-5 space-y-4 text-xs">
          {!fileUploaded ? (
            <div 
              onClick={() => handleSimulateUpload('partner_intake_fall2026_leads.csv')}
              className="border-2 border-dashed border-slate-200 hover:border-slate-400 bg-slate-50/50 hover:bg-slate-50 rounded-xl p-8 text-center cursor-pointer transition-colors"
            >
              <Upload className="w-8 h-8 text-slate-400 mx-auto mb-2" />
              <p className="text-xs font-semibold text-slate-800">
                Drop partner CSV file here
              </p>
              <p className="text-[11px] text-slate-400 mt-1">
                Supports .csv, .xlsx
              </p>
              <button
                type="button"
                className="mt-3 px-3 py-1.5 bg-white border border-slate-200 text-slate-700 rounded-lg text-xs font-medium hover:bg-slate-50 cursor-pointer"
              >
                Browse Files or Load Sample CSV
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              <div className="bg-slate-50 border border-slate-200 rounded-lg p-3 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span className="text-xs font-semibold text-slate-800">
                    {fileName} ({validRows.length} valid, {duplicateRows.length} duplicate)
                  </span>
                </div>
                <button
                  onClick={() => setFileUploaded(false)}
                  className="text-xs text-slate-500 hover:underline cursor-pointer"
                >
                  Change
                </button>
              </div>

              {duplicateRows.length > 0 && (
                <div className="bg-amber-50 border border-amber-200 rounded-lg p-2.5 text-xs text-amber-900 flex items-start gap-2">
                  <AlertTriangle className="w-3.5 h-3.5 text-amber-600 shrink-0 mt-0.5" />
                  <div>
                    <strong>Duplicate Detected:</strong> Phone <span className="font-mono font-semibold">9820144521</span> matches existing Lead <span className="font-mono font-semibold">L000123 (Aarav Sharma)</span>. Record will not create a duplicate.
                  </div>
                </div>
              )}

              {/* Data Preview */}
              <div className="border border-slate-200 rounded-lg overflow-hidden text-xs max-h-40 overflow-y-auto">
                <table className="w-full text-left">
                  <thead className="bg-slate-50 text-[10px] uppercase font-semibold text-slate-400">
                    <tr>
                      <th className="p-2">Name</th>
                      <th className="p-2">Phone</th>
                      <th className="p-2">Target Institution</th>
                      <th className="p-2">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {dataRows.map((r, i) => (
                      <tr key={i} className={r.status === 'Duplicate' ? 'bg-amber-50/50' : ''}>
                        <td className="p-2 font-medium text-slate-900">{r.student_name}</td>
                        <td className="p-2 font-mono text-slate-600">{r.phone_num}</td>
                        <td className="p-2 text-slate-600">{r.university}</td>
                        <td className="p-2">
                          <span className={`text-[10px] font-medium px-1.5 py-0.5 rounded ${
                            r.status === 'Valid' ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-100 text-amber-800'
                          }`}>
                            {r.status === 'Valid' ? 'Valid' : 'Duplicate (L000123)'}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
          <button
            onClick={onClose}
            className="px-3 py-1.5 text-xs text-slate-600 hover:bg-slate-200 rounded-lg cursor-pointer"
          >
            Cancel
          </button>

          <button
            id="btn-confirm-import-csv"
            onClick={handleConfirmImport}
            disabled={!fileUploaded || validRows.length === 0}
            className="px-4 py-2 text-xs font-semibold text-white bg-[#2563EB] hover:bg-[#1E40AF] disabled:opacity-40 rounded-lg flex items-center gap-1.5 cursor-pointer transition-colors"
          >
            <span>Import ({validRows.length} Leads)</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};
