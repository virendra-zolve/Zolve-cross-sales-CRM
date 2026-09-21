import React, { useState, useMemo } from 'react';
import { ArrowLeft, Save, Phone } from 'lucide-react';
import { StudentLead, MasterProduct, ProductOpportunityStatus } from '../types';
import { LeadProfileSection } from './sections/LeadProfileSection';
import { LeadAcademicSection } from './sections/LeadAcademicSection';
import { LeadFinancialSection } from './sections/LeadFinancialSection';
import { LeadDocumentsSection } from './sections/LeadDocumentsSection';
import { LeadCallingSection } from './sections/LeadCallingSection';
import { LeadProductsSection } from './sections/LeadProductsSection';

interface LeadDetailViewRefactoredProps {
  lead: StudentLead;
  onBack: () => void;
  onUpdateLead: (updatedLead: StudentLead) => void;
  onOpenEducationLoan?: (lead: StudentLead) => void;
}

type MenuSection = 'profile' | 'academic' | 'financial' | 'documents' | 'calling' | 'products' | 'notes';

export const LeadDetailViewRefactored: React.FC<LeadDetailViewRefactoredProps> = ({
  lead,
  onBack,
  onUpdateLead,
  onOpenEducationLoan,
}) => {
  const [draftLead, setDraftLead] = useState<StudentLead>(JSON.parse(JSON.stringify(lead)));
  const [currentSection, setCurrentSection] = useState<MenuSection>('profile');
  const [saveSuccessMessage, setSaveSuccessMessage] = useState<string | null>(null);
  const [isCallModalOpen, setIsCallModalOpen] = useState(false);

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
    { id: 'calling' as MenuSection, label: 'Calling' },
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

            {/* Right side: Call button + Save controls */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => setIsCallModalOpen(true)}
                className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg cursor-pointer transition-colors whitespace-nowrap"
              >
                <Phone className="w-4 h-4" />
                <span>Call</span>
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

          {currentSection === 'calling' && (
            <LeadCallingSection
              lead={draftLead}
              callLogs={draftLead.callLogs}
              onLogCall={(outcome, notes, nextCall, duration) => {
                console.log('Log call:', outcome, notes, nextCall, duration);
              }}
              onScheduleCallback={(date) => {
                console.log('Schedule:', date);
              }}
            />
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
    </div>
  );
};
