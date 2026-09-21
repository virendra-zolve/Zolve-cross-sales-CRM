import React, { useState } from 'react';
import { UserPlus } from 'lucide-react';
import { StudentLead, JourneyStage, MasterProduct, KPIStatus } from '../types';

interface NewLeadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreateLead: (lead: StudentLead) => void;
  existingLeads: StudentLead[];
}

const defaultMasterProducts = (activeKeys: MasterProduct[] = []): Record<MasterProduct, boolean> => {
  const all: MasterProduct[] = [
    'Education Loan', 'Refinance', 'Test Prep', 'Test Voucher',
    'Admissions', 'Accommodation', 'eSIM', 'Travel / Flights',
    'Bank Account', 'Credit Card', 'Money Transfer', 'NRE/NRO Account', 'Insurance'
  ];
  const map: Partial<Record<MasterProduct, boolean>> = {};
  all.forEach(k => { map[k] = activeKeys.includes(k); });
  return map as Record<MasterProduct, boolean>;
};

export const NewLeadModal: React.FC<NewLeadModalProps> = ({
  isOpen,
  onClose,
  onCreateLead,
  existingLeads,
}) => {
  const [sourceCode, setSourceCode] = useState('');
  const [bdeCode, setBdeCode] = useState('');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('9876543210');
  const [mobileCountryCode, setMobileCountryCode] = useState('91');
  const [email, setEmail] = useState('');
  const [countriesOfInterest, setCountriesOfInterest] = useState<string[]>([]);
  const [universitiesOfInterest, setUniversitiesOfInterest] = useState<string[]>([]);
  const [course, setCourse] = useState('');
  const [intake, setIntake] = useState('Fall 2026');
  const [stage, setStage] = useState<JourneyStage>('Application');
  const [assignmentChoice, setAssignmentChoice] = useState<'self' | 'unassigned'>('self');
  const [duplicateError, setDuplicateError] = useState<string | null>(null);

  const countryOptions = ['USA', 'UK', 'Canada', 'Germany', 'Australia', 'Ireland', 'Singapore', 'Netherlands'];
  const universityOptions = [
    'University of California, Berkeley',
    'Stanford University',
    'MIT',
    'Harvard University',
    'Oxford University',
    'Cambridge University',
    'Imperial College London',
    'University of Toronto',
    'University of Melbourne',
    'National University of Singapore',
  ];

  const toggleCountry = (country: string) => {
    setCountriesOfInterest(prev =>
      prev.includes(country) ? prev.filter(c => c !== country) : [...prev, country]
    );
  };

  const toggleUniversity = (uni: string) => {
    setUniversitiesOfInterest(prev =>
      prev.includes(uni) ? prev.filter(u => u !== uni) : [...prev, uni]
    );
  };

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setDuplicateError(null);

    const cleanPhone = phone.replace(/\D/g, '');
    if (!name.trim() || !sourceCode.trim() || !bdeCode.trim() || !mobileCountryCode.trim() || cleanPhone.length < 7 || countriesOfInterest.length === 0 || universitiesOfInterest.length === 0) return;

    // Dedupe check
    const duplicate = existingLeads.find(l => l.mobileNumber.replace(/\D/g, '') === cleanPhone);
    if (duplicate) {
      setDuplicateError(`Mobile matches existing Lead ${duplicate.id} (${duplicate.studentName}). Duplicate record prevented.`);
      return;
    }

    const leadId = `L${(9200 + Math.floor(Math.random() * 700)).toString().padStart(6, '0')}`;
    const isSelfAssigned = assignmentChoice === 'self';

    const newLead: StudentLead = {
      id: leadId,
      sourceCode: sourceCode.trim(),
      studentName: name.trim(),
      mobileNumber: cleanPhone,
      mobileCountryCode: mobileCountryCode.trim(),
      email: email.trim() || `${name.toLowerCase().replace(/\s+/g, '.')}@gmail.com`,
      destinationCountry: countriesOfInterest[0] || 'USA',
      universitiesOfInterest: universitiesOfInterest,
      finalUniversity: universitiesOfInterest[0] || 'University of California, Berkeley',
      course: course.trim() || 'M.S. in Computer Science',
      intake,
      journeyStage: stage,
      testsInterestedIn: ['IELTS'],
      fundingPlan: 'Will Need Loan',

      createdAt: new Date().toISOString(),
      signupStatus: 'Not Signed Up',

      leadOwnerTeam: 'Education Loan Team',
      leadOwner: isSelfAssigned ? 'Virendra (You)' : 'Unassigned',
      leadAssignedAt: new Date().toISOString(),
      leadAssignedBy: isSelfAssigned ? 'Self' : 'CRM Manual Ingest',
      assignmentHistory: [
        {
          id: `as_${Date.now()}`,
          assignedAt: new Date().toISOString(),
          assignedBy: isSelfAssigned ? 'Self' : 'CRM System',
          team: 'Education Loan Team',
          owner: isSelfAssigned ? 'Virendra (You)' : 'Unassigned',
        }
      ],

      qualificationStatus: 'Not Required',
      qualificationNotes: 'Directly qualified during RM intake.',
      readinessChecklist: {
        passportValid: true,
        admitLetterReceived: true,
        fundingPlanReady: true,
        englishTestPassed: true,
      },
      academicScore: 'Verified by RM',
      coSignerIncome: 'Verified by RM',

      callingStatus: 'Not Attempted',
      noOfAttempts: 0,
      nextCallAt: new Date(Date.now() + 30 * 60 * 1000).toISOString(),
      callLogs: [],

      masterProducts: defaultMasterProducts(['Education Loan', 'Bank Account', 'Credit Card']),
      productOpportunities: [
        {
          id: `p_${Date.now()}_1`,
          product: 'Education Loan',
          status: 'In Progress',
          amount: '$50,000',
          partner: 'Avanse / Prodigy',
          createdAt: new Date().toISOString(),
          details: 'Direct RM creation',
        }
      ],

      leadStatus: 'Active',
      kpiStatus: 'On Track' as KPIStatus,
      lastActionAt: new Date().toISOString(),
      lastActionBy: 'Virendra',
      noActionSince: new Date().toISOString(),
      escalationStatus: 'Not Escalated',

      activities: [
        {
          id: `act_${Date.now()}`,
          timestamp: new Date().toISOString(),
          actor: 'Virendra (RM)',
          type: 'system',
          title: 'Manual Lead Created',
          description: `Created with Qualification Status = Not Required. Assigned to ${isSelfAssigned ? 'Self (Virendra)' : 'Unassigned'}. Source: ${sourceCode}, BDE: ${bdeCode}`,
        }
      ],
      notes: ['Direct intake recorded by RM.'],
    };

    onCreateLead(newLead);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
      <div 
        id="new-lead-modal-dialog"
        className="bg-white rounded-xl max-w-md w-full shadow-xl border border-slate-200 overflow-hidden"
      >
        <div className="p-4 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-[#2563EB] text-white flex items-center justify-center font-bold">
              <UserPlus className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900">
                Create New Student Lead
              </h3>
              <p className="text-[11px] text-slate-500">Fast CRM lead intake</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 text-sm font-bold p-1 cursor-pointer"
          >
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-3.5 text-xs">
          {duplicateError && (
            <div className="p-2.5 bg-rose-50 border border-rose-200 rounded-lg text-rose-800 text-xs">
              {duplicateError}
            </div>
          )}

          {/* Assignment Choice */}
          <div className="p-3 bg-slate-50 rounded-lg border border-slate-200/80 space-y-2">
            <label className="block font-semibold text-slate-700 text-[11px] uppercase tracking-wider">
              Work Assignment
            </label>
            <div className="grid grid-cols-2 gap-2">
              <label className={`flex items-center gap-2 p-2 rounded-lg border cursor-pointer text-xs ${
                assignmentChoice === 'self' ? 'bg-blue-50/70 border-[#2563EB] text-[#2563EB] font-semibold' : 'bg-white border-slate-200 text-slate-700'
              }`}>
                <input
                  type="radio"
                  name="assignment"
                  checked={assignmentChoice === 'self'}
                  onChange={() => setAssignmentChoice('self')}
                  className="accent-[#2563EB]"
                />
                <span>Assign to Self</span>
              </label>

              <label className={`flex items-center gap-2 p-2 rounded-lg border cursor-pointer text-xs ${
                assignmentChoice === 'unassigned' ? 'bg-blue-50/70 border-[#2563EB] text-[#2563EB] font-semibold' : 'bg-white border-slate-200 text-slate-700'
              }`}>
                <input
                  type="radio"
                  name="assignment"
                  checked={assignmentChoice === 'unassigned'}
                  onChange={() => setAssignmentChoice('unassigned')}
                  className="accent-[#2563EB]"
                />
                <span>Unassigned</span>
              </label>
            </div>
          </div>

          {/* Source & BDE Codes */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-medium text-slate-700 mb-1">
                Source Code / Partner Code *
              </label>
              <input
                type="text"
                required
                value={sourceCode}
                onChange={(e) => setSourceCode(e.target.value)}
                placeholder="e.g. PARTNER_ABC"
                className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 focus:outline-hidden focus:border-slate-400"
              />
            </div>

            <div>
              <label className="block font-medium text-slate-700 mb-1">
                BDE Code *
              </label>
              <input
                type="text"
                required
                value={bdeCode}
                onChange={(e) => setBdeCode(e.target.value)}
                placeholder="e.g. BDE_001"
                className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 focus:outline-hidden focus:border-slate-400"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-medium text-slate-700 mb-1">
                Student Name *
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Sameer Verma"
                className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 focus:outline-hidden focus:border-slate-400"
              />
            </div>

            <div>
              <label className="block font-medium text-slate-700 mb-1">
                Mobile Country Code *
              </label>
              <input
                type="text"
                required
                value={mobileCountryCode}
                onChange={(e) => setMobileCountryCode(e.target.value)}
                placeholder="e.g. 91"
                className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 font-mono focus:outline-hidden focus:border-slate-400"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block font-medium text-slate-700 mb-1">
                Mobile Number *
              </label>
              <input
                type="text"
                required
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="9876543210"
                className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 font-mono focus:outline-hidden focus:border-slate-400"
              />
            </div>

            {/* Countries of Interest - Multi-Select */}
            <div className="sm:col-span-2">
              <label className="block font-medium text-slate-700 mb-2">
                Countries of Interest *
              </label>
              <div className="grid grid-cols-2 gap-2">
                {countryOptions.map(country => (
                  <label key={country} className="flex items-center gap-2 p-2 rounded-lg border border-slate-200 hover:bg-slate-50 cursor-pointer text-xs">
                    <input
                      type="checkbox"
                      checked={countriesOfInterest.includes(country)}
                      onChange={() => toggleCountry(country)}
                      className="accent-[#2563EB]"
                    />
                    <span className="text-slate-700">{country}</span>
                  </label>
                ))}
              </div>
              {countriesOfInterest.length === 0 && (
                <p className="text-[11px] text-rose-600 mt-1">Select at least one country</p>
              )}
            </div>

            {/* Universities of Interest - Multi-Select */}
            <div className="sm:col-span-2">
              <label className="block font-medium text-slate-700 mb-2">
                Universities of Interest *
              </label>
              <div className="space-y-1.5 max-h-40 overflow-y-auto">
                {universityOptions.map(uni => (
                  <label key={uni} className="flex items-start gap-2 p-2 rounded-lg border border-slate-200 hover:bg-slate-50 cursor-pointer text-xs">
                    <input
                      type="checkbox"
                      checked={universitiesOfInterest.includes(uni)}
                      onChange={() => toggleUniversity(uni)}
                      className="accent-[#2563EB] mt-0.5"
                    />
                    <span className="text-slate-700 break-words">{uni}</span>
                  </label>
                ))}
              </div>
              {universitiesOfInterest.length === 0 && (
                <p className="text-[11px] text-rose-600 mt-1">Select at least one university</p>
              )}
            </div>

            <div>
              <label className="block font-medium text-slate-700 mb-1">
                Intake
              </label>
              <select
                value={intake}
                onChange={(e) => setIntake(e.target.value)}
                className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 font-medium"
              >
                <option value="Fall 2026">Fall 2026</option>
                <option value="Spring 2027">Spring 2027</option>
                <option value="Fall 2027">Fall 2027</option>
              </select>
            </div>

            <div className="sm:col-span-2">
              <label className="block font-medium text-slate-700 mb-1">
                Journey Stage
              </label>
              <select
                value={stage}
                onChange={(e) => setStage(e.target.value as JourneyStage)}
                className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 font-medium"
              >
                <option value="Counseling">Counseling</option>
                <option value="Application">Application</option>
                <option value="Admission Confirmed">Admission Confirmed</option>
                <option value="Pre-Departure">Pre-Departure</option>
                <option value="Visa">Visa</option>
                <option value="Travel">Travel</option>
              </select>
            </div>
          </div>

          <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-3 py-1.5 text-xs text-slate-600 hover:bg-slate-100 rounded-lg cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              id="submit-new-lead-btn"
              className="px-4 py-2 text-xs font-semibold text-white bg-[#2563EB] hover:bg-[#1E40AF] rounded-lg cursor-pointer"
            >
              Create Lead
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
