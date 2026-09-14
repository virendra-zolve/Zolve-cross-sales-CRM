import React, { useState, useEffect } from 'react';
import { 
  Phone, 
  PhoneOff, 
  Mic, 
  MicOff, 
  Clock, 
  CheckCircle2, 
  Calendar, 
  FileText
} from 'lucide-react';
import { StudentLead, LastCallOutcome, LeadStatus } from '../types';

interface QuickCallModalProps {
  lead: StudentLead | null;
  isOpen: boolean;
  isLiveCallMode: boolean;
  onClose: () => void;
  onSaveOutcome: (
    leadId: string,
    outcome: string,
    notes: string,
    nextCallIso: string,
    newStatus: LeadStatus,
    durationSeconds: number
  ) => void;
}

const CALL_OUTCOMES: LastCallOutcome[] = [
  'Connected',
  'Callback Requested',
  'RNR',
  'Busy',
  'Switch Off',
  'Not Interested',
  'Invalid Number',
  'Other',
];

export const QuickCallModal: React.FC<QuickCallModalProps> = ({
  lead,
  isOpen,
  isLiveCallMode,
  onClose,
  onSaveOutcome,
}) => {
  const [callActive, setCallActive] = useState(false);
  const [seconds, setSeconds] = useState(0);
  const [isMuted, setIsMuted] = useState(false);

  // Form State
  const [outcome, setOutcome] = useState<LastCallOutcome>('Connected');
  const [notes, setNotes] = useState('');
  const [nextCallTime, setNextCallTime] = useState('Tomorrow 11:00 AM');
  const [newLeadStatus, setNewLeadStatus] = useState<LeadStatus>('Active');

  useEffect(() => {
    if (!isOpen) {
      setCallActive(false);
      setSeconds(0);
      return;
    }

    if (isLiveCallMode) {
      setCallActive(true);
      setSeconds(0);
    } else {
      setCallActive(false);
      setSeconds(90);
    }
  }, [isOpen, isLiveCallMode]);

  useEffect(() => {
    let interval: any = null;
    if (callActive) {
      interval = setInterval(() => {
        setSeconds((s) => s + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [callActive]);

  if (!isOpen || !lead) return null;

  const handleEndCall = () => {
    setCallActive(false);
  };

  const formatTimer = (sec: number) => {
    const mins = Math.floor(sec / 60);
    const remainingSec = sec % 60;
    return `${mins.toString().padStart(2, '0')}:${remainingSec.toString().padStart(2, '0')}`;
  };

  const handleSave = () => {
    const targetDate = new Date();
    if (nextCallTime.includes('Tomorrow')) {
      targetDate.setDate(targetDate.getDate() + 1);
    } else if (nextCallTime.includes('3 Days')) {
      targetDate.setDate(targetDate.getDate() + 3);
    } else {
      targetDate.setHours(targetDate.getHours() + 2);
    }
    targetDate.setMinutes(0);

    onSaveOutcome(
      lead.id,
      outcome,
      notes,
      targetDate.toISOString(),
      newLeadStatus,
      seconds
    );
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
      <div 
        id="quick-call-modal-dialog"
        className="bg-white rounded-xl max-w-lg w-full shadow-xl border border-slate-200 overflow-hidden"
      >
        {/* Header / Active Call Status Banner */}
        <div className={`p-4 transition-colors ${callActive ? 'bg-slate-900 text-white' : 'bg-slate-50 text-slate-800 border-b border-slate-200'}`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${callActive ? 'bg-[#D91C24] text-white' : 'bg-slate-200 text-slate-700'}`}>
                <Phone className="w-4 h-4 fill-current" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-sm font-bold leading-none">
                    {lead.studentName}
                  </h3>
                  <span className="text-[11px] font-mono font-medium text-slate-400">
                    {lead.id}
                  </span>
                </div>
                <p className="text-xs text-slate-400 mt-1 font-mono">
                  +{lead.mobileCountryCode} {lead.mobileNumber}
                </p>
              </div>
            </div>

            {callActive ? (
              <div className="flex items-center gap-2 bg-white/10 px-2.5 py-1 rounded-full border border-white/20">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <span className="font-mono text-xs font-bold text-emerald-300">
                  {formatTimer(seconds)}
                </span>
              </div>
            ) : (
              <span className="text-xs font-medium text-slate-500 bg-slate-200 px-2 py-0.5 rounded">
                Call Completed ({formatTimer(seconds)})
              </span>
            )}
          </div>
        </div>

        {/* Student Quick Context */}
        <div className="bg-slate-50 p-3 border-b border-slate-200 flex items-center justify-between text-xs text-slate-700">
          <div>
            <span className="text-[10px] text-slate-400 block">Intake & Country</span>
            <span className="font-semibold text-slate-800">{lead.destinationCountry} • {lead.intake}</span>
          </div>
          <div>
            <span className="text-[10px] text-slate-400 block">Institution</span>
            <span className="font-semibold text-slate-800 truncate max-w-[170px] block">{lead.finalUniversity || lead.universitiesOfInterest[0]}</span>
          </div>
          <div>
            <span className="text-[10px] text-slate-400 block">Funding Plan</span>
            <span className="font-semibold text-[#D91C24] block">{lead.fundingPlan}</span>
          </div>
        </div>

        {/* In-Call Controls */}
        {callActive && (
          <div className="p-4 bg-slate-900 flex items-center justify-center gap-3 border-t border-slate-800">
            <button
              onClick={() => setIsMuted(!isMuted)}
              className={`p-2.5 rounded-lg border cursor-pointer transition-colors ${
                isMuted ? 'bg-rose-600 text-white border-rose-600' : 'bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700'
              }`}
              title={isMuted ? 'Unmute' : 'Mute'}
            >
              {isMuted ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
            </button>

            <button
              onClick={handleEndCall}
              id="hang-up-call-btn"
              className="px-5 py-2.5 rounded-lg bg-[#D91C24] hover:bg-[#B30018] text-white font-semibold text-xs flex items-center gap-2 cursor-pointer transition-colors"
            >
              <PhoneOff className="w-3.5 h-3.5 fill-white" />
              <span>Hang Up & Log Outcome</span>
            </button>
          </div>
        )}

        {/* Outcome Logging Form */}
        <div className="p-5 space-y-3.5 text-xs">
          <div>
            <label className="block font-semibold text-slate-700 mb-1.5 uppercase tracking-wider text-[10px]">
              Call Outcome
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5">
              {CALL_OUTCOMES.map((oc) => (
                <button
                  key={oc}
                  type="button"
                  onClick={() => setOutcome(oc)}
                  className={`p-2 rounded-lg text-center font-medium border transition-colors cursor-pointer ${
                    outcome === oc
                      ? 'bg-slate-900 text-white border-slate-900 font-semibold'
                      : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                  }`}
                >
                  <span className="truncate block">{oc}</span>
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1 uppercase tracking-wider text-[10px]">
              Call Notes
            </label>
            <textarea
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g. Student confirmed I-20 received, requested call with co-signer..."
              className="w-full p-2 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-800 focus:bg-white focus:outline-hidden focus:border-slate-400"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1 uppercase tracking-wider text-[10px]">
                Schedule Next Follow-up
              </label>
              <select
                value={nextCallTime}
                onChange={(e) => setNextCallTime(e.target.value)}
                className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg font-medium text-slate-800"
              >
                <option value="Today (In 2 Hours)">Today (In 2 Hours)</option>
                <option value="Tomorrow 11:00 AM">Tomorrow 11:00 AM</option>
                <option value="Tomorrow 03:00 PM">Tomorrow 03:00 PM</option>
                <option value="In 3 Days">In 3 Days</option>
              </select>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1 uppercase tracking-wider text-[10px]">
                Lead Status
              </label>
              <select
                value={newLeadStatus}
                onChange={(e) => setNewLeadStatus(e.target.value as LeadStatus)}
                className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg font-medium text-slate-800"
              >
                <option value="Active">Active</option>
                <option value="Closed">Closed</option>
                <option value="Archived">Archived</option>
              </select>
            </div>
          </div>

          <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
            <button
              type="button"
              onClick={onClose}
              className="px-3 py-1.5 font-medium text-slate-600 hover:bg-slate-100 rounded-lg cursor-pointer"
            >
              Cancel
            </button>

            <button
              id="save-call-outcome-btn"
              type="button"
              onClick={handleSave}
              className="px-4 py-2 font-semibold text-white bg-[#D91C24] hover:bg-[#B30018] rounded-lg flex items-center gap-1.5 cursor-pointer transition-colors"
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Save & Reset KPI</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
