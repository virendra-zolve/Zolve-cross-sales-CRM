import React, { useState } from 'react';
import { Phone, Clock, MessageSquare, Plus, CheckCircle, XCircle } from 'lucide-react';
import { CallLogItem } from '../../types';

interface LeadCallingSectionProps {
  lead: any;
  callLogs?: CallLogItem[];
  onLogCall?: (outcome: string, notes: string, nextCallDate?: string, duration?: number) => void;
  onScheduleCallback?: (date: string, time: string) => void;
}

export const LeadCallingSection: React.FC<LeadCallingSectionProps> = ({
  lead,
  callLogs = [],
  onLogCall,
  onScheduleCallback,
}) => {
  const [showLogCallModal, setShowLogCallModal] = useState(false);
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [callOutcome, setCallOutcome] = useState('Connected');
  const [callNotes, setCallNotes] = useState('');
  const [callDuration, setCallDuration] = useState(0);
  const [nextCallDate, setNextCallDate] = useState('');
  const [scheduleDate, setScheduleDate] = useState('');
  const [scheduleTime, setScheduleTime] = useState('');

  const handleLogCall = () => {
    onLogCall?.(callOutcome, callNotes, nextCallDate, callDuration);
    setShowLogCallModal(false);
    setCallOutcome('Connected');
    setCallNotes('');
    setCallDuration(0);
    setNextCallDate('');
  };

  const handleScheduleCallback = () => {
    if (scheduleDate && scheduleTime) {
      onScheduleCallback?.(`${scheduleDate}T${scheduleTime}`);
      setShowScheduleModal(false);
      setScheduleDate('');
      setScheduleTime('');
    }
  };

  const getOutcomeBadgeClass = (outcome: string) => {
    switch (outcome) {
      case 'Connected':
        return 'bg-emerald-100 text-emerald-700';
      case 'RNR':
      case 'Busy':
        return 'bg-amber-100 text-amber-700';
      case 'Callback Scheduled':
        return 'bg-blue-100 text-blue-700';
      case 'Not Interested':
        return 'bg-red-100 text-red-700';
      default:
        return 'bg-slate-100 text-slate-600';
    }
  };

  const lastCall = callLogs.length > 0 ? callLogs[0] : null;
  const callsThisWeek = callLogs.filter(c => {
    const callDate = new Date(c.timestamp);
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);
    return callDate > weekAgo;
  }).length;

  return (
    <div className="space-y-4">
      <div className="bg-gradient-to-r from-purple-50 to-slate-50 rounded-xl border border-purple-200 p-4">
        <p className="text-xs text-purple-700 font-semibold">
          📞 Calling & Interaction - Track all calling attempts, follow-ups, and outcomes
        </p>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-4 gap-3">
        <div className="bg-white rounded-xl border border-slate-200 p-3 shadow-xs text-center">
          <div className="text-lg font-bold text-[#D91C24]">{lead.noOfAttempts || 0}</div>
          <div className="text-[10px] text-slate-500 font-semibold mt-1">Total Attempts</div>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 p-3 shadow-xs text-center">
          <div className="text-lg font-bold text-blue-600">{callsThisWeek}</div>
          <div className="text-[10px] text-slate-500 font-semibold mt-1">This Week</div>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 p-3 shadow-xs text-center">
          <div className="text-lg font-bold text-slate-900">{lead.callingStatus || 'Not Attempted'}</div>
          <div className="text-[10px] text-slate-500 font-semibold mt-1">Current Status</div>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 p-3 shadow-xs text-center">
          <div className={`text-lg font-bold ${lead.kpiStatus === 'On Track' ? 'text-emerald-600' : 'text-red-600'}`}>
            {lead.kpiStatus || 'On Track'}
          </div>
          <div className="text-[10px] text-slate-500 font-semibold mt-1">KPI Status</div>
        </div>
      </div>

      {/* Last Call & Next Call */}
      <div className="grid grid-cols-2 gap-3">
        <div className="bg-white rounded-xl border border-slate-200 p-3 shadow-xs">
          <div className="flex items-center gap-2 mb-2">
            <Clock className="w-4 h-4 text-slate-600" />
            <span className="text-xs font-bold text-slate-700">Last Call</span>
          </div>
          {lastCall ? (
            <div className="space-y-1">
              <div className="text-xs text-slate-600">
                {new Date(lastCall.timestamp).toLocaleString()}
              </div>
              <div className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold ${getOutcomeBadgeClass(lastCall.outcome)}`}>
                {lastCall.outcome}
              </div>
              <div className="text-xs text-slate-600 mt-1">Duration: {lastCall.durationSeconds}s</div>
            </div>
          ) : (
            <p className="text-xs text-slate-500">No calls yet</p>
          )}
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-3 shadow-xs">
          <div className="flex items-center gap-2 mb-2">
            <Calendar className="w-4 h-4 text-slate-600" />
            <span className="text-xs font-bold text-slate-700">Next Call</span>
          </div>
          {lead.nextCallAt ? (
            <div>
              <div className="text-xs text-slate-600">
                {new Date(lead.nextCallAt).toLocaleString()}
              </div>
              <div className="text-xs text-blue-600 font-semibold mt-1">
                {(() => {
                  const nextDate = new Date(lead.nextCallAt);
                  const now = new Date();
                  const diff = Math.ceil((nextDate.getTime() - now.getTime()) / (1000 * 60 * 60));
                  return diff > 0 ? `in ${diff} hours` : 'overdue';
                })()}
              </div>
            </div>
          ) : (
            <p className="text-xs text-slate-500">No scheduled call</p>
          )}
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-2">
        <button
          onClick={() => setShowLogCallModal(true)}
          className="flex-1 inline-flex items-center justify-center gap-2 px-3 py-2 bg-[#D91C24] text-white rounded-lg text-xs font-bold hover:bg-[#B30018] cursor-pointer transition-colors shadow-xs"
        >
          <Phone className="w-4 h-4" />
          Log Call
        </button>
        <button
          onClick={() => setShowScheduleModal(true)}
          className="flex-1 inline-flex items-center justify-center gap-2 px-3 py-2 bg-slate-800 text-white rounded-lg text-xs font-bold hover:bg-slate-900 cursor-pointer transition-colors shadow-xs"
        >
          <Clock className="w-4 h-4" />
          Schedule Callback
        </button>
      </div>

      {/* Call History */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="bg-slate-50 border-b border-slate-200 px-4 py-2">
          <h3 className="text-xs font-bold text-slate-900">Call History</h3>
        </div>
        <div className="divide-y divide-slate-200 max-h-96 overflow-y-auto">
          {callLogs.length === 0 ? (
            <div className="px-4 py-6 text-center text-slate-500">
              <Phone className="w-6 h-6 text-slate-300 mx-auto mb-2" />
              <p className="text-xs">No calls logged yet</p>
            </div>
          ) : (
            callLogs.map((call, idx) => (
              <div key={idx} className="p-3 hover:bg-slate-50 transition-colors">
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <div className="text-xs font-semibold text-slate-900">
                      {new Date(call.timestamp).toLocaleString()}
                    </div>
                    <div className="text-[10px] text-slate-500 mt-0.5">by {call.rmName}</div>
                  </div>
                  <div className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold ${getOutcomeBadgeClass(call.outcome)}`}>
                    {call.outcome}
                  </div>
                </div>
                <div className="text-xs text-slate-600 mb-1">
                  Duration: {call.durationSeconds}s
                </div>
                {call.notes && (
                  <div className="text-xs text-slate-600 bg-slate-50 p-2 rounded mt-1 border-l-2 border-[#D91C24]">
                    <span className="font-semibold">Notes: </span>{call.notes}
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </div>

      {/* Log Call Modal */}
      {showLogCallModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-lg max-w-md w-full p-4 space-y-3">
            <h3 className="text-sm font-bold text-slate-900">Log Call Outcome</h3>

            <div>
              <label className="text-[11px] text-slate-500 font-medium block mb-1">Outcome</label>
              <select
                value={callOutcome}
                onChange={e => setCallOutcome(e.target.value)}
                className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-sm"
              >
                <option>Connected</option>
                <option>Callback Requested</option>
                <option>RNR</option>
                <option>Busy</option>
                <option>Switch Off</option>
                <option>Not Interested</option>
                <option>Invalid Number</option>
              </select>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-[11px] text-slate-500 font-medium block mb-1">Duration (seconds)</label>
                <input
                  type="number"
                  value={callDuration}
                  onChange={e => setCallDuration(Number(e.target.value))}
                  className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-sm"
                />
              </div>
              {callOutcome === 'Callback Requested' && (
                <div>
                  <label className="text-[11px] text-slate-500 font-medium block mb-1">Next Call Date</label>
                  <input
                    type="date"
                    value={nextCallDate}
                    onChange={e => setNextCallDate(e.target.value)}
                    className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-sm"
                  />
                </div>
              )}
            </div>

            <div>
              <label className="text-[11px] text-slate-500 font-medium block mb-1">Notes</label>
              <textarea
                value={callNotes}
                onChange={e => setCallNotes(e.target.value)}
                placeholder="What did you discuss?"
                rows={3}
                className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-sm"
              />
            </div>

            <div className="flex gap-2 pt-2">
              <button
                onClick={() => setShowLogCallModal(false)}
                className="flex-1 px-3 py-1.5 bg-slate-200 text-slate-900 rounded-lg text-xs font-semibold hover:bg-slate-300 cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleLogCall}
                className="flex-1 px-3 py-1.5 bg-[#D91C24] text-white rounded-lg text-xs font-semibold hover:bg-[#B30018] cursor-pointer"
              >
                Save Call
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Schedule Callback Modal */}
      {showScheduleModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-lg max-w-md w-full p-4 space-y-3">
            <h3 className="text-sm font-bold text-slate-900">Schedule Callback</h3>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-[11px] text-slate-500 font-medium block mb-1">Date</label>
                <input
                  type="date"
                  value={scheduleDate}
                  onChange={e => setScheduleDate(e.target.value)}
                  className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-sm"
                />
              </div>
              <div>
                <label className="text-[11px] text-slate-500 font-medium block mb-1">Time</label>
                <input
                  type="time"
                  value={scheduleTime}
                  onChange={e => setScheduleTime(e.target.value)}
                  className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-sm"
                />
              </div>
            </div>

            <div className="flex gap-2 pt-2">
              <button
                onClick={() => setShowScheduleModal(false)}
                className="flex-1 px-3 py-1.5 bg-slate-200 text-slate-900 rounded-lg text-xs font-semibold hover:bg-slate-300 cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleScheduleCallback}
                className="flex-1 px-3 py-1.5 bg-[#D91C24] text-white rounded-lg text-xs font-semibold hover:bg-[#B30018] cursor-pointer"
              >
                Schedule
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// Icon placeholder
const Calendar = ({ className }: { className: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
  </svg>
);
