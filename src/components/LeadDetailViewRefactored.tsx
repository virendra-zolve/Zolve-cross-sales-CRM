import React, { useState, useMemo } from 'react';
import { ArrowLeft, Save, Phone, ChevronDown, CheckCircle2, XCircle, Clock } from 'lucide-react';
import { StudentLead, MasterProduct, ProductOpportunityStatus, ActivityItem, QualificationStatus } from '../types';

type DisqualificationReason = 'Not Interested' | 'Invalid Number' | 'Wrong Lead' | 'Other';
const DISQUALIFICATION_REASONS: DisqualificationReason[] = ['Not Interested', 'Invalid Number', 'Wrong Lead', 'Other'];
const CURRENT_USER = 'Virendra';
import { LeadProfileSection } from './sections/LeadProfileSection';
import { LeadAcademicSection } from './sections/LeadAcademicSection';
import { LeadFinancialSection } from './sections/LeadFinancialSection';
import { LeadDocumentsSection } from './sections/LeadDocumentsSection';
import { LeadProductsSection } from './sections/LeadProductsSection';

interface LeadDetailViewRefactoredProps {
  lead: StudentLead;
  onBack: () => void;
  onUpdateLead: (updatedLead: StudentLead) => void;
  onOpenEducationLoan?: (lead: StudentLead) => void;
}

type MenuSection = 'profile' | 'academic' | 'financial' | 'documents' | 'activity' | 'products' | 'notes';

export const LeadDetailViewRefactored: React.FC<LeadDetailViewRefactoredProps> = ({
  lead,
  onBack,
  onUpdateLead,
  onOpenEducationLoan,
}) => {
  const [draftLead, setDraftLead] = useState<StudentLead>(JSON.parse(JSON.stringify(lead)));
  const [currentSection, setCurrentSection] = useState<MenuSection>('profile');
  const [saveSuccessMessage, setSaveSuccessMessage] = useState<string | null>(null);
  const [isCallStatusModalOpen, setIsCallStatusModalOpen] = useState(false);
  const [selectedCallStatus, setSelectedCallStatus] = useState<string>(draftLead.callingStatus || 'Not Attempted');
  const [rescheduleDate, setRescheduleDate] = useState<string>('');
  const [rescheduleTime, setRescheduleTime] = useState<string>('');
  const [callNotes, setCallNotes] = useState<string>('');

  // Qualification banner state
  const [qualifyDecision, setQualifyDecision] = useState<'' | 'Qualified' | 'Not Qualified'>('');
  const [disqualifyReason, setDisqualifyReason] = useState<DisqualificationReason | ''>('');
  const [qualificationNotesDraft, setQualificationNotesDraft] = useState('');
  const [isChangingQualification, setIsChangingQualification] = useState(false);

  const isPendingQualification =
    draftLead.qualificationStatus === 'Pending' || isChangingQualification;

  const handleSaveQualification = () => {
    if (!qualifyDecision) return;
    if (qualifyDecision === 'Not Qualified' && !disqualifyReason) return;

    const now = new Date().toISOString();
    const descriptionParts: string[] = [`Marked as ${qualifyDecision}`];
    if (qualifyDecision === 'Not Qualified' && disqualifyReason) {
      descriptionParts.push(`Reason: ${disqualifyReason}`);
    }
    if (qualificationNotesDraft.trim()) {
      descriptionParts.push(`Notes: ${qualificationNotesDraft.trim()}`);
    }

    const activity: ActivityItem = {
      id: `act_${Date.now()}`,
      timestamp: now,
      actor: `${CURRENT_USER} (RM)`,
      type: 'system',
      title: `Qualification: ${qualifyDecision}`,
      description: descriptionParts.join(' • '),
    };

    const updatedLead: StudentLead = {
      ...draftLead,
      qualificationStatus: qualifyDecision as QualificationStatus,
      qualifiedBy: CURRENT_USER,
      qualificationCompletedAt: now,
      qualificationNotes: qualificationNotesDraft.trim() || draftLead.qualificationNotes,
      leadStatus:
        qualifyDecision === 'Not Qualified' ? 'Closed' : draftLead.leadStatus,
      closureReason:
        qualifyDecision === 'Not Qualified'
          ? (disqualifyReason === 'Invalid Number'
              ? 'Invalid Contact'
              : disqualifyReason === 'Wrong Lead'
              ? 'Wrong Number'
              : disqualifyReason === 'Not Interested'
              ? 'Not Interested'
              : 'Other')
          : draftLead.closureReason,
      lastActionAt: now,
      lastActionBy: CURRENT_USER,
      activities: [activity, ...draftLead.activities],
    };

    setDraftLead(updatedLead);
    onUpdateLead(updatedLead);
    setSaveSuccessMessage(
      `Lead marked as ${qualifyDecision.toLowerCase()} ✓`
    );
    setTimeout(() => setSaveSuccessMessage(null), 2500);

    // Reset banner form state
    setQualifyDecision('');
    setDisqualifyReason('');
    setQualificationNotesDraft('');
    setIsChangingQualification(false);
  };

  const isDirty = useMemo(() => {
    return JSON.stringify(draftLead) !== JSON.stringify(lead);
  }, [draftLead, lead]);

  const handleUpdateDraftField = <K extends keyof StudentLead>(field: K, value: StudentLead[K]) => {
    setDraftLead(prev => ({ ...prev, [field]: value }));
  };

  const handleSaveChanges = () => {
    const changesList: string[] = [];
    
    // Track what changed
    if (draftLead.studentName !== lead.studentName) changesList.push(`Name: ${draftLead.studentName}`);
    if (draftLead.mobileNumber !== lead.mobileNumber) changesList.push(`Mobile: ${draftLead.mobileNumber}`);
    if (draftLead.email !== lead.email) changesList.push(`Email: ${draftLead.email}`);
    if (draftLead.journeyStage !== lead.journeyStage) changesList.push(`Journey Stage: ${draftLead.journeyStage}`);
    if (draftLead.fundingPlan !== lead.fundingPlan) changesList.push(`Funding: ${draftLead.fundingPlan}`);
    if (JSON.stringify(draftLead.universitiesOfInterest) !== JSON.stringify(lead.universitiesOfInterest)) {
      changesList.push(`Universities updated`);
    }

    const now = new Date().toISOString();
    const updatedLead: StudentLead = {
      ...draftLead,
      lastActionAt: now,
      lastActionBy: 'Virendra',
      activities: [
        {
          id: `act_${Date.now()}`,
          timestamp: now,
          actor: 'Virendra (Manager)',
          type: 'system',
          title: 'Lead Profile Updated',
          description: changesList.join(' • ') || 'Profile updated',
        },
        ...draftLead.activities,
      ],
    };

    onUpdateLead(updatedLead);
    setSaveSuccessMessage('Changes saved! ✓');
    setTimeout(() => setSaveSuccessMessage(null), 2500);
  };

  const handleDiscardChanges = () => {
    setDraftLead(JSON.parse(JSON.stringify(lead)));
    setSaveSuccessMessage(null);
  };

  const handleProductToggle = (product: MasterProduct, isActive: boolean) => {
    setDraftLead(prev => {
      const masterProducts = { ...prev.masterProducts, [product]: isActive };
      let productOpportunities = [...prev.productOpportunities];

      if (!isActive) {
        productOpportunities = productOpportunities.filter(p => p.product !== product);
      } else if (!productOpportunities.find(p => p.product === product)) {
        productOpportunities.push({
          id: `p_${Date.now()}`,
          product,
          status: 'Interested',
          productOwner: prev.leadOwner || 'Vikas',
          createdAt: new Date().toISOString(),
          details: 'Opportunity initiated',
          amount: product === 'Education Loan' ? '$50,000' : undefined,
          partner: product === 'Education Loan' ? 'Avanse' : undefined,
        });
      }

      return { ...prev, masterProducts, productOpportunities };
    });
  };

  const handleProductStatusChange = (product: MasterProduct, newStatus: ProductOpportunityStatus) => {
    setDraftLead(prev => {
      const updatedOpps = prev.productOpportunities.map(opp =>
        opp.product === product ? { ...opp, status: newStatus, completedSoldAt: newStatus === 'Completed / Sold' ? new Date().toISOString() : opp.completedSoldAt } : opp
      );
      return { ...prev, productOpportunities: updatedOpps };
    });
  };

  const menuItems = [
    { id: 'profile' as MenuSection, label: 'Study Plan' },
    { id: 'academic' as MenuSection, label: 'Academic' },
    { id: 'financial' as MenuSection, label: 'Financial' },
    { id: 'documents' as MenuSection, label: 'Documents' },
    { id: 'activity' as MenuSection, label: 'Activity' },
    { id: 'products' as MenuSection, label: 'Products' },
    { id: 'notes' as MenuSection, label: 'Notes' },
  ];

  return (
    <div className="w-full bg-slate-50 text-slate-900 flex flex-col">
      {/* Sticky Header */}
      <div className="sticky top-0 z-30 bg-white border-b border-slate-200 shadow-xs">
        <div className="px-4 py-4 space-y-3">
          {/* Top Row: Back button + Student Name/ID + Call button */}
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-start gap-3 flex-1">
              <button
                onClick={onBack}
                className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-500 hover:text-slate-800 transition-colors cursor-pointer mt-1"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              <div className="flex-1">
                <div className="text-2xl font-bold text-slate-900">{draftLead.studentName}</div>
                <div className="text-sm text-slate-500 font-mono">{draftLead.id}</div>
              </div>
            </div>

            {/* Right side: Lead Status + Call button + Save controls */}
            <div className="flex items-center gap-2">
              {/* Lead Status dropdown */}
              <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5">
                <span className="text-[11px] font-semibold text-slate-500 uppercase">Lead Status</span>
                <select
                  value={draftLead.leadStatus}
                  onChange={(e) => handleUpdateDraftField('leadStatus', e.target.value as StudentLead['leadStatus'])}
                  className={`text-xs font-semibold bg-transparent focus:outline-none cursor-pointer ${
                    draftLead.leadStatus === 'Active'
                      ? 'text-emerald-700'
                      : draftLead.leadStatus === 'Closed'
                      ? 'text-rose-700'
                      : 'text-slate-700'
                  }`}
                >
                  <option value="Active">Active</option>
                  <option value="Closed">Closed</option>
                  <option value="Archived">Archived</option>
                </select>
              </div>

              <button
                onClick={() => setIsCallStatusModalOpen(true)}
                className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg cursor-pointer transition-colors whitespace-nowrap"
              >
                <Phone className="w-4 h-4" />
                <span>Update Call Status</span>
              </button>

              {isDirty && (
                <div className="flex items-center gap-2 bg-amber-50 border border-amber-200 px-3 py-1.5 rounded-lg ml-2">
                  <span className="text-xs font-semibold text-amber-800">⚠ Unsaved</span>
                  <button
                    onClick={handleDiscardChanges}
                    className="text-xs text-slate-600 hover:underline cursor-pointer font-medium"
                  >
                    Discard
                  </button>
                  <button
                    onClick={handleSaveChanges}
                    className="inline-flex items-center gap-1 px-3 py-1 text-xs font-bold text-white bg-[#2563EB] hover:bg-[#1E40AF] rounded-md cursor-pointer"
                  >
                    <Save className="w-3.5 h-3.5" />
                    Save
                  </button>
                </div>
              )}
              {saveSuccessMessage && (
                <span className="text-xs font-semibold text-emerald-700 bg-emerald-50 px-3 py-1 rounded-lg">
                  {saveSuccessMessage}
                </span>
              )}
            </div>
          </div>

          {/* Counselor Snapshot: Most Important Info */}
          <div className="flex items-center gap-3 text-xs bg-gradient-to-r from-blue-50 to-slate-50 border border-blue-100 rounded-lg p-2.5 overflow-x-auto">
            <div className="flex items-center gap-1 whitespace-nowrap">
              <span className="text-slate-500 font-medium">📞</span>
              <span className="font-mono text-slate-900">{draftLead.mobileCountryCode}{draftLead.mobileNumber}</span>
            </div>
            <div className="w-px h-5 bg-slate-300"></div>
            <div className="flex items-center gap-1 whitespace-nowrap">
              <span className="text-slate-500 font-medium">🎓</span>
              <span className="font-semibold text-slate-900">{draftLead.course || 'Not set'}</span>
            </div>
            <div className="w-px h-5 bg-slate-300"></div>
            <div className="flex items-center gap-1 whitespace-nowrap">
              <span className="text-slate-500 font-medium">🌍</span>
              <span className="font-semibold text-slate-900">{draftLead.destinationCountry || 'Not set'}</span>
            </div>
            <div className="w-px h-5 bg-slate-300"></div>
            <div className="flex items-center gap-1 whitespace-nowrap">
              <span className="text-slate-500 font-medium">📅</span>
              <span className="font-semibold text-slate-900">{draftLead.intake || 'Not set'}</span>
            </div>
            <div className="w-px h-5 bg-slate-300"></div>
            <div className="flex items-center gap-1 whitespace-nowrap">
              <span className="text-slate-500 font-medium">📍</span>
              <span className={`font-bold ${draftLead.journeyStage === 'Unknown' ? 'text-slate-600' : 'text-blue-700'}`}>
                {draftLead.journeyStage}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Qualification Banner: full editor for Pending, compact pill once decided */}
      {isPendingQualification ? (
        <div className="bg-amber-50 border-b border-amber-200 px-4 py-3">
          <div className="flex flex-wrap items-center gap-3">
            <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-amber-900">
              <Clock className="w-4 h-4" />
              <span>Yet to be Qualified — set the qualification status for this lead</span>
            </div>

            <div className="flex flex-wrap items-center gap-2 ml-auto">
              <label className="text-[11px] font-semibold text-slate-600">Status</label>
              <select
                value={qualifyDecision}
                onChange={(e) => {
                  const v = e.target.value as '' | 'Qualified' | 'Not Qualified';
                  setQualifyDecision(v);
                  if (v !== 'Not Qualified') setDisqualifyReason('');
                }}
                className="px-2.5 py-1.5 text-xs border border-slate-200 rounded-md bg-white focus:outline-none focus:border-slate-400"
              >
                <option value="">Select…</option>
                <option value="Qualified">Qualified</option>
                <option value="Not Qualified">Not Qualified</option>
              </select>

              {qualifyDecision === 'Not Qualified' && (
                <>
                  <label className="text-[11px] font-semibold text-slate-600">Reason</label>
                  <select
                    value={disqualifyReason}
                    onChange={(e) => setDisqualifyReason(e.target.value as DisqualificationReason)}
                    className="px-2.5 py-1.5 text-xs border border-slate-200 rounded-md bg-white focus:outline-none focus:border-slate-400"
                  >
                    <option value="">Select reason…</option>
                    {DISQUALIFICATION_REASONS.map((r) => (
                      <option key={r} value={r}>{r}</option>
                    ))}
                  </select>
                </>
              )}

              <input
                type="text"
                value={qualificationNotesDraft}
                onChange={(e) => setQualificationNotesDraft(e.target.value)}
                placeholder="Notes (optional)"
                className="px-2.5 py-1.5 text-xs border border-slate-200 rounded-md bg-white focus:outline-none focus:border-slate-400 w-56"
              />

              <button
                onClick={handleSaveQualification}
                disabled={
                  !qualifyDecision ||
                  (qualifyDecision === 'Not Qualified' && !disqualifyReason)
                }
                className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-semibold text-white bg-[#2563EB] hover:bg-[#1E40AF] rounded-md cursor-pointer disabled:bg-slate-300 disabled:cursor-not-allowed"
              >
                <Save className="w-3.5 h-3.5" />
                Save Qualification
              </button>

              {isChangingQualification && (
                <button
                  onClick={() => {
                    setIsChangingQualification(false);
                    setQualifyDecision('');
                    setDisqualifyReason('');
                    setQualificationNotesDraft('');
                  }}
                  className="text-xs text-slate-600 hover:underline cursor-pointer"
                >
                  Cancel
                </button>
              )}
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-slate-50 border-b border-slate-200 px-4 py-2">
          <div className="flex flex-wrap items-center gap-3 text-xs">
            <span
              className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md border font-semibold ${
                draftLead.qualificationStatus === 'Qualified'
                  ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                  : draftLead.qualificationStatus === 'Not Qualified'
                  ? 'bg-rose-50 text-rose-800 border-rose-200'
                  : 'bg-slate-100 text-slate-700 border-slate-200'
              }`}
            >
              {draftLead.qualificationStatus === 'Qualified' ? (
                <CheckCircle2 className="w-3.5 h-3.5" />
              ) : draftLead.qualificationStatus === 'Not Qualified' ? (
                <XCircle className="w-3.5 h-3.5" />
              ) : null}
              {draftLead.qualificationStatus}
            </span>
            {draftLead.qualifiedBy && (
              <span className="text-slate-600">
                by <span className="font-semibold text-slate-900">{draftLead.qualifiedBy}</span>
              </span>
            )}
            {draftLead.qualificationCompletedAt && (
              <span className="text-slate-500">
                {new Date(draftLead.qualificationCompletedAt).toLocaleString('en-US', {
                  day: '2-digit',
                  month: 'short',
                  year: 'numeric',
                  hour: 'numeric',
                  minute: '2-digit',
                  hour12: true,
                })}
              </span>
            )}
            {draftLead.qualificationStatus === 'Not Qualified' && draftLead.closureReason && (
              <span className="text-slate-600">
                Reason: <span className="font-semibold text-slate-900">{draftLead.closureReason}</span>
              </span>
            )}
            <button
              onClick={() => {
                setIsChangingQualification(true);
                setQualifyDecision('');
                setDisqualifyReason('');
                setQualificationNotesDraft('');
              }}
              className="ml-auto text-xs font-semibold text-[#2563EB] hover:underline cursor-pointer"
            >
              Change
            </button>
          </div>
        </div>
      )}

      {/* Main Layout - Sidebar + Content */}
      <div className="flex flex-1 overflow-hidden">
        {/* Left Sidebar Menu */}
        <div className="w-44 bg-white border-r border-slate-200 overflow-y-auto p-2 space-y-1">
          {menuItems.map(item => (
            <button
              key={item.id}
              onClick={() => setCurrentSection(item.id)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                currentSection === item.id
                  ? 'bg-[#2563EB] text-white shadow-md'
                  : 'text-slate-700 hover:bg-slate-100'
              }`}
            >
              <span>{item.label}</span>
            </button>
          ))}
        </div>

        {/* Main Content Area */}
        <div className="flex-1 overflow-y-auto p-4">
          {currentSection === 'profile' && (
            <LeadProfileSection
              lead={draftLead}
              onUpdate={handleUpdateDraftField}
              isDirty={isDirty}
            />
          )}

          {currentSection === 'academic' && (
            <LeadAcademicSection
              lead={draftLead}
              onUpdate={handleUpdateDraftField}
              isDirty={isDirty}
            />
          )}

          {currentSection === 'financial' && (
            <LeadFinancialSection
              lead={draftLead}
              onUpdate={handleUpdateDraftField}
              isDirty={isDirty}
            />
          )}

          {currentSection === 'documents' && (
            <LeadDocumentsSection
              documents={[]}
              onUpload={(file, category) => console.log('Upload:', file.name, category)}
              onShare={(docId) => console.log('Share:', docId)}
              onDelete={(docId) => console.log('Delete:', docId)}
            />
          )}

          {currentSection === 'activity' && (
            <div className="bg-white rounded-xl border border-slate-200/80 p-4 shadow-xs">
              <h2 className="text-lg font-bold text-slate-900 mb-4">Activity Timeline</h2>
              
              {draftLead.activities && draftLead.activities.length > 0 ? (
                <div className="space-y-3">
                  {draftLead.activities.map((activity, idx) => (
                    <div key={idx} className="flex gap-3 pb-3 border-b border-slate-100 last:border-0">
                      <div className="text-xs font-semibold text-slate-600 whitespace-nowrap pt-0.5">
                        {new Date(activity.timestamp).toLocaleString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          hour: 'numeric',
                          minute: '2-digit',
                          hour12: true,
                        })}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-semibold text-slate-900">{activity.title}</div>
                        {activity.description && (
                          <div className="text-xs text-slate-600 mt-1 break-words">{activity.description}</div>
                        )}
                        <div className="text-[11px] text-slate-500 mt-1.5">By {activity.actor}</div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <div className="text-slate-400 text-sm">No activities yet</div>
                </div>
              )}
            </div>
          )}

          {currentSection === 'products' && (
            <LeadProductsSection
              lead={draftLead}
              onProductToggle={handleProductToggle}
              onProductStatusChange={handleProductStatusChange}
              onOpenEducationLoan={() => onOpenEducationLoan?.(draftLead)}
            />
          )}

          {currentSection === 'notes' && (
            <div className="bg-white rounded-xl border border-slate-200/80 p-4 shadow-xs flex flex-col h-96">
              <h2 className="text-lg font-bold text-slate-900 mb-4 flex-shrink-0">Notes & Comments</h2>
              
              {/* Chat Messages Area */}
              <div className="flex-1 overflow-y-auto space-y-3 mb-4 min-h-0 pr-2">
                {draftLead.notes.length === 0 ? (
                  <div className="flex items-center justify-center h-full text-slate-400 text-xs">
                    No notes yet. Start adding notes below.
                  </div>
                ) : (
                  draftLead.notes.map((note, idx) => (
                    <div key={idx} className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                      <div className="text-blue-900 break-words text-sm">{note}</div>
                      <div className="text-blue-600 text-[10px] mt-2">Virendra • Just now</div>
                    </div>
                  ))
                )}
              </div>

              {/* Input Area */}
              <div className="flex gap-2 flex-shrink-0 border-t border-slate-200 pt-3">
                <textarea
                  placeholder="Add a note... (Enter to send, Shift+Enter for new line)"
                  className="flex-1 p-2 bg-slate-50 border border-slate-200 rounded-lg text-xs focus:bg-white focus:outline-hidden focus:border-slate-400 resize-none"
                  rows={2}
                  onChange={(e) => {
                    const notes = e.currentTarget.value;
                    setDraftLead(prev => ({ ...prev, _newNote: notes }));
                  }}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      const newNote = (e.currentTarget.value || '').trim();
                      if (newNote) {
                        setDraftLead(prev => ({
                          ...prev,
                          notes: [newNote, ...prev.notes],
                          _newNote: ''
                        }));
                        e.currentTarget.value = '';
                      }
                    }
                  }}
                  value={(draftLead as any)._newNote || ''}
                />
                <button
                  onClick={() => {
                    const textarea = document.querySelector('[placeholder="Add a note..."]') as HTMLTextAreaElement;
                    const newNote = (textarea?.value || '').trim();
                    if (newNote) {
                      setDraftLead(prev => ({
                        ...prev,
                        notes: [newNote, ...prev.notes],
                        _newNote: ''
                      }));
                      if (textarea) textarea.value = '';
                    }
                  }}
                  className="px-4 py-2 text-xs font-semibold bg-[#2563EB] text-white rounded-lg hover:bg-[#1E40AF] cursor-pointer flex-shrink-0 h-fit"
                >
                  Send
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Call Status Modal */}
      {isCallStatusModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-lg p-6 max-w-md w-full mx-4">
            <h2 className="text-lg font-bold text-slate-900 mb-4">Update Call Status</h2>

            <div className="space-y-4">
              {/* Call Status Dropdown */}
              <div>
                <label className="text-xs font-semibold text-slate-600 block mb-2">Call Status</label>
                <select
                  value={selectedCallStatus}
                  onChange={(e) => setSelectedCallStatus(e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:border-emerald-500 focus:outline-none bg-white"
                >
                  <option value="Not Attempted">Not Attempted</option>
                  <option value="Connected">Connected</option>
                  <option value="RNR">RNR (Ring No Response)</option>
                  <option value="Switch Off">Switch Off</option>
                  <option value="Busy">Busy</option>
                  <option value="Callback Scheduled">Callback Scheduled</option>
                  <option value="Not Interested">Not Interested</option>
                  <option value="Invalid Number">Invalid Number</option>
                </select>
              </div>

              {/* Reschedule Date/Time - Only if Callback Scheduled */}
              {selectedCallStatus === 'Callback Scheduled' && (
                <>
                  <div>
                    <label className="text-xs font-semibold text-slate-600 block mb-2">Reschedule Date</label>
                    <input
                      type="date"
                      value={rescheduleDate}
                      onChange={(e) => setRescheduleDate(e.target.value)}
                      className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:border-emerald-500 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-slate-600 block mb-2">Reschedule Time</label>
                    <input
                      type="time"
                      value={rescheduleTime}
                      onChange={(e) => setRescheduleTime(e.target.value)}
                      className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:border-emerald-500 focus:outline-none"
                    />
                  </div>
                </>
              )}

              {/* Notes */}
              <div>
                <label className="text-xs font-semibold text-slate-600 block mb-2">Notes (optional)</label>
                <textarea
                  value={callNotes}
                  onChange={(e) => setCallNotes(e.target.value)}
                  placeholder="Add call notes here..."
                  className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:border-emerald-500 focus:outline-none resize-none"
                  rows={3}
                />
              </div>

              {/* Buttons */}
              <div className="flex gap-2 pt-4 border-t border-slate-200">
                <button
                  onClick={() => setIsCallStatusModalOpen(false)}
                  className="flex-1 px-4 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    if (selectedCallStatus === 'Callback Scheduled') {
                      if (!rescheduleDate || !rescheduleTime) {
                        alert('Please select both date and time for rescheduled call');
                        return;
                      }
                      const scheduledTime = new Date(`${rescheduleDate}T${rescheduleTime}`).toISOString();
                      const newActivity: ActivityItem = {
                        id: `act_${Date.now()}`,
                        timestamp: new Date().toISOString(),
                        actor: 'You',
                        type: 'system',
                        title: 'Call Status Updated',
                        description: `Status: ${selectedCallStatus}. Rescheduled for ${new Date(scheduledTime).toLocaleString()}${callNotes ? `. Notes: ${callNotes}` : ''}`,
                      };
                      setDraftLead(prev => ({
                        ...prev,
                        callingStatus: selectedCallStatus as any,
                        nextCallAt: scheduledTime,
                        lastActionAt: new Date().toISOString(),
                        lastActionBy: 'You',
                        notes: callNotes ? [callNotes, ...prev.notes] : prev.notes,
                        activities: [newActivity, ...prev.activities],
                      }));
                    } else {
                      const newActivity: ActivityItem = {
                        id: `act_${Date.now()}`,
                        timestamp: new Date().toISOString(),
                        actor: 'You',
                        type: 'system',
                        title: 'Call Status Updated',
                        description: `Status changed to: ${selectedCallStatus}${callNotes ? `. Notes: ${callNotes}` : ''}`,
                      };
                      setDraftLead(prev => ({
                        ...prev,
                        callingStatus: selectedCallStatus as any,
                        lastActionAt: new Date().toISOString(),
                        lastActionBy: 'You',
                        notes: callNotes ? [callNotes, ...prev.notes] : prev.notes,
                        activities: [newActivity, ...prev.activities],
                      }));
                    }
                    setRescheduleDate('');
                    setRescheduleTime('');
                    setCallNotes('');
                    setIsCallStatusModalOpen(false);
                  }}
                  className="flex-1 px-4 py-2 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg transition-colors cursor-pointer"
                >
                  Save
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
