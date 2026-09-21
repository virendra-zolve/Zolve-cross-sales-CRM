import React, { useState, useMemo } from 'react';
import { 
  ArrowLeft, 
  Phone, 
  GraduationCap, 
  DollarSign, 
  FileText, 
  X,
  Save,
  ArrowRightLeft,
  ChevronDown,
  ChevronUp,
  ExternalLink,
  Users,
  BookOpen,
  ShoppingBag,
  LogIn,
  Home,
} from 'lucide-react';
import { 
  StudentLead, 
  JourneyStage, 
  MasterProduct, 
  ProductOpportunity, 
  ProductOpportunityStatus
} from '../types';
import { getAutoFedOwnerTeam } from '../data/teamMembers';

interface LeadDetailViewProps {
  lead: StudentLead;
  onBack: () => void;
  onUpdateLead: (updatedLead: StudentLead) => void;
  onInitiateCall: (lead: StudentLead) => void;
  onReassignLead?: (leadId: string, newOwner: string, reason?: string) => void;
  onOpenEducationLoan?: (lead: StudentLead) => void;
}

type MenuSection = 'all-profile' | 'notes' | 'academic' | 'assignments' | 'documents' | 'products' | 'product-detail';

const JOURNEY_STAGES: JourneyStage[] = [
  'Pre-Test', 'Test Preparation', 'Counseling', 'Application',
  'Admission Confirmed', 'Pre-Departure', 'Visa', 'Travel', 'Post-Arrival',
];

const ALL_MASTER_PRODUCTS: MasterProduct[] = [
  'Education Loan', 'Bank Account', 'Credit Card', 'Money Transfer', 
  'Test Prep', 'Test Voucher', 'Admissions', 'Accommodation', 'eSIM', 
  'Travel / Flights', 'Insurance', 'Refinance', 'NRE/NRO Account'
];

export const LeadDetailView: React.FC<LeadDetailViewProps> = ({
  lead,
  onBack,
  onUpdateLead,
  onInitiateCall,
  onReassignLead,
  onOpenEducationLoan,
}) => {
  const [draftLead, setDraftLead] = useState<StudentLead>(() => JSON.parse(JSON.stringify(lead)));
  const [currentSection, setCurrentSection] = useState<MenuSection>('all-profile');
  const [selectedProduct, setSelectedProduct] = useState<MasterProduct | null>(null);
  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
  const [targetAssignee, setTargetAssignee] = useState<string>(lead.leadOwner || 'Vikas');
  const [targetAssigner, setTargetAssigner] = useState<string>('Virendra');
  const [saveSuccessMessage, setSaveSuccessMessage] = useState<string | null>(null);
  const [newNoteText, setNewNoteText] = useState('');
  const [expandedProduct, setExpandedProduct] = useState<MasterProduct | null>(null);
  const [isCallStatusDropdownOpen, setIsCallStatusDropdownOpen] = useState(false);
  const [isAddNotesModalOpen, setIsAddNotesModalOpen] = useState(false);
  const [nextCallDate, setNextCallDate] = useState<string>('');
  const [callStatus, setCallStatus] = useState<string>(lead.callingStatus || 'Not Attempted');

  const isDirty = useMemo(() => {
    return JSON.stringify(draftLead) !== JSON.stringify(lead);
  }, [draftLead, lead]);

  const handleUpdateDraftField = <K extends keyof StudentLead>(field: K, value: StudentLead[K]) => {
    setDraftLead(prev => ({ ...prev, [field]: value }));
  };

  const handleSaveChanges = () => {
    const changesList: string[] = [];
    if (draftLead.studentName !== lead.studentName) changesList.push(`Name: ${draftLead.studentName}`);
    if (draftLead.mobileNumber !== lead.mobileNumber) changesList.push(`Mobile: ${draftLead.mobileNumber}`);
    if (draftLead.email !== lead.email) changesList.push(`Email: ${draftLead.email}`);
    if (draftLead.journeyStage !== lead.journeyStage) changesList.push(`Stage: ${draftLead.journeyStage}`);

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
    setSaveSuccessMessage('Changes saved!');
    setTimeout(() => setSaveSuccessMessage(null), 2500);
  };

  const handleDiscardChanges = () => {
    setDraftLead(JSON.parse(JSON.stringify(lead)));
  };

  const handleStageNote = () => {
    if (!newNoteText.trim()) return;
    setDraftLead(prev => ({
      ...prev,
      notes: [newNoteText.trim(), ...prev.notes]
    }));
    setNewNoteText('');
  };

  const handleConfirmAssignment = () => {
    const now = new Date().toLocaleDateString();
    const autoTeam = getAutoFedOwnerTeam(targetAssignee);
    setDraftLead(prev => ({
      ...prev,
      leadOwner: targetAssignee,
      leadOwnerTeam: autoTeam,
      leadAssignedAt: now,
      leadAssignedBy: targetAssigner,
      assignmentHistory: [
        {
          id: `as_${Date.now()}`,
          assignedAt: now,
          assignedBy: targetAssigner,
          team: autoTeam,
          owner: targetAssignee
        },
        ...prev.assignmentHistory
      ]
    }));
    if (onReassignLead) {
      onReassignLead(lead.id, targetAssignee, `Assigned to ${targetAssignee}`);
    }
    setIsAssignModalOpen(false);
  };

  const handleToggleProductOpportunity = (productName: MasterProduct) => {
    const isCurrentlyActive = !!draftLead.masterProducts[productName];
    const newMasterProducts = { ...draftLead.masterProducts, [productName]: !isCurrentlyActive };
    let newOpportunities = [...draftLead.productOpportunities];

    if (!isCurrentlyActive) {
      newOpportunities.push({
        id: `p_${Date.now()}`,
        product: productName,
        status: 'Interested',
        productOwner: draftLead.leadOwner || 'Vikas',
        createdAt: new Date().toISOString(),
        details: 'Opportunity initiated',
        amount: productName === 'Education Loan' ? '$50,000' : undefined,
        partner: productName === 'Education Loan' ? 'Avanse' : undefined,
      });
    } else {
      newOpportunities = newOpportunities.filter(p => p.product !== productName);
    }

    setDraftLead(prev => ({
      ...prev,
      masterProducts: newMasterProducts,
      productOpportunities: newOpportunities
    }));
  };

  const handleUpdateOpportunityDraft = (productName: MasterProduct, updates: Partial<ProductOpportunity>) => {
    setDraftLead(prev => {
      const updatedOpps = prev.productOpportunities.map(op =>
        op.product === productName ? { ...op, ...updates } : op
      );
      return { ...prev, productOpportunities: updatedOpps };
    });
  };

  const getProductIcon = (product: MasterProduct) => {
    switch (product) {
      case 'Education Loan':
      case 'Refinance':
        return <GraduationCap className="w-4 h-4 text-[#2563EB]" />;
      case 'Bank Account':
      case 'NRE/NRO Account':
        return <Home className="w-4 h-4 text-emerald-600" />;
      case 'Credit Card':
        return <ShoppingBag className="w-4 h-4 text-purple-600" />;
      default:
        return <DollarSign className="w-4 h-4 text-slate-600" />;
    }
  };

  const getStatusBadge = (status: ProductOpportunityStatus) => {
    switch (status) {
      case 'Completed / Sold':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'In Progress':
        return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'Interested':
        return 'bg-purple-50 text-purple-700 border-purple-200';
      default:
        return 'bg-blue-50 text-[#2563EB] border-blue-200';
    }
  };

  const activeProducts = draftLead.productOpportunities.filter(p => draftLead.masterProducts[p.product]);

  return (
    <div id="lead-detail-view" className="flex flex-col h-screen bg-slate-50">
      {/* ===== STICKY HEADER ===== */}
      <div className="sticky top-16 z-30 bg-white border-b border-slate-200 shadow-xs">
        <div className="p-3 space-y-2">
          {/* Top Row: Back button + Lead ID */}
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-3 min-w-0">
              <button
                onClick={onBack}
                className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-500 hover:text-slate-800 transition-colors cursor-pointer flex-shrink-0"
              >
                <ArrowLeft className="w-4 h-4" />
              </button>
              <span className="font-mono text-sm font-bold text-slate-900 truncate">{draftLead.id}</span>
              <span className="text-slate-300 flex-shrink-0">•</span>
              <span className="text-sm font-semibold text-slate-800 truncate">{draftLead.studentName}</span>
            </div>

            <div className="flex items-center gap-2 justify-end">
            </div>
          </div>

          {/* Call Controls Row */}
          <div className="flex items-center gap-2 border-t border-slate-200 pt-2">
            {isDirty && (
              <div className="flex items-center gap-2 bg-amber-50 border border-amber-200 px-2.5 py-1 rounded-lg">
                <span className="text-[11px] font-semibold text-amber-800">Unsaved</span>
                <button
                  onClick={handleDiscardChanges}
                  className="text-[11px] text-slate-600 hover:underline cursor-pointer font-medium"
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
              <span className="text-xs font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-lg">
                ✓ {saveSuccessMessage}
              </span>
            )}
            <button
              onClick={() => setIsAssignModalOpen(true)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 cursor-pointer"
            >
              <ArrowRightLeft className="w-3.5 h-3.5" />
              <span>Assign</span>
            </button>
            <div className="relative">
              <button
                onClick={() => setIsCallStatusDropdownOpen(!isCallStatusDropdownOpen)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 cursor-pointer whitespace-nowrap"
              >
                <span>Call: {callStatus}</span>
                <ChevronDown className="w-3.5 h-3.5" />
              </button>

              {isCallStatusDropdownOpen && (
                <div className="absolute left-0 top-full mt-1 w-56 bg-white border border-slate-200 rounded-lg shadow-xl z-50 p-3 animate-in fade-in zoom-in-95 duration-100">
                  <div className="space-y-2">
                    <div className="px-2 py-1.5 text-[10px] font-bold text-slate-500 uppercase tracking-wider">Call Status</div>
                    {['Not Attempted', 'Connected', 'RNR', 'Switch Off', 'Busy', 'Callback Scheduled', 'Not Interested', 'Invalid Number'].map(status => (
                      <button
                        key={status}
                        onClick={() => {
                          setCallStatus(status);
                          setDraftLead(prev => ({
                            ...prev,
                            callingStatus: status as any,
                            lastCallOutcome: status as any,
                          }));
                          setIsCallStatusDropdownOpen(false);
                        }}
                        className={`w-full text-left px-3 py-2 text-xs font-medium rounded-lg cursor-pointer transition-colors ${
                          callStatus === status
                            ? 'bg-blue-100 text-blue-700 font-semibold'
                            : 'text-slate-700 hover:bg-slate-100'
                        }`}
                      >
                        {status}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
            <input
              type="date"
              value={nextCallDate}
              onChange={(e) => {
                setNextCallDate(e.target.value);
                setDraftLead(prev => ({
                  ...prev,
                  nextCallAt: e.target.value ? new Date(e.target.value).toISOString() : undefined,
                }));
              }}
              className="px-3 py-1.5 text-xs border border-slate-200 rounded-lg bg-white hover:bg-slate-50 cursor-pointer"
              title="Reschedule call date"
            />
            <button
              onClick={() => setIsAddNotesModalOpen(true)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 cursor-pointer"
            >
              <FileText className="w-3.5 h-3.5" />
              <span>Add Note</span>
            </button>
            <button
              onClick={() => onInitiateCall(draftLead)}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-white bg-[#2563EB] hover:bg-[#1E40AF] rounded-lg cursor-pointer ml-auto"
            >
              <Phone className="w-3.5 h-3.5 fill-white" />
              <span>Call</span>
            </button>
          </div>

          {/* Student Basics Row */}
          <div className="flex items-center gap-4 text-xs bg-slate-50 p-2 rounded-lg border border-slate-200/60 overflow-x-auto">
            <div>
              <span className="text-[10px] text-slate-500 font-medium">Name</span>
              <div className="font-semibold text-slate-900">{draftLead.studentName}</div>
            </div>
            <div className="w-px h-8 bg-slate-200"></div>
            <div>
              <span className="text-[10px] text-slate-500 font-medium">Phone</span>
              <div className="font-mono text-slate-800">+{draftLead.mobileCountryCode} {draftLead.mobileNumber}</div>
            </div>
            <div className="w-px h-8 bg-slate-200"></div>
            <div>
              <span className="text-[10px] text-slate-500 font-medium">Email</span>
              <div className="font-mono text-slate-800 truncate max-w-[180px]">{draftLead.email}</div>
            </div>
            <div className="w-px h-8 bg-slate-200"></div>
            <div>
              <span className="text-[10px] text-slate-500 font-medium">Channel</span>
              <div className="font-semibold text-slate-800">{draftLead.sourceCode}</div>
            </div>
            <div className="w-px h-8 bg-slate-200"></div>
            <div>
              <span className="text-[10px] text-slate-500 font-medium">BDE</span>
              <div className="font-semibold text-slate-800">{draftLead.bdeCode || 'N/A'}</div>
            </div>
            <div className="w-px h-8 bg-slate-200"></div>
            <div>
              <span className="text-[10px] text-slate-500 font-medium">Status</span>
              <div className="font-semibold text-emerald-700">{draftLead.signupStatus}</div>
            </div>
            <div className="w-px h-8 bg-slate-200"></div>
            <div>
              <span className="text-[10px] text-slate-500 font-medium">Customer</span>
              <div className="font-semibold text-slate-800">{draftLead.leadStatus}</div>
            </div>
            <div className="w-px h-8 bg-slate-200"></div>
            <div>
              <span className="text-[10px] text-slate-500 font-medium">Intake</span>
              <div className="font-semibold text-slate-800">{draftLead.intake}</div>
            </div>
            <div className="w-px h-8 bg-slate-200"></div>
            <div>
              <span className="text-[10px] text-slate-500 font-medium">Countries</span>
              <div className="font-semibold text-slate-800">{draftLead.destinationCountry}</div>
            </div>
          </div>
        </div>
      </div>

      {/* ===== MAIN CONTENT LAYOUT ===== */}
      <div className="flex flex-1 overflow-hidden">
        {/* LEFT SIDEBAR MENU */}
        <div className="w-48 bg-white border-r border-slate-200 overflow-y-auto flex flex-col">
          <div className="p-3 space-y-1">
            {[
              { id: 'all-profile' as MenuSection, label: 'All Profile', icon: Users },
              { id: 'notes' as MenuSection, label: 'Notes & Activity', icon: FileText },
              { id: 'academic' as MenuSection, label: 'Academic Profile', icon: BookOpen },
              { id: 'assignments' as MenuSection, label: 'Assignment Logs', icon: LogIn },
              { id: 'documents' as MenuSection, label: 'Documents', icon: FileText },
              { id: 'products' as MenuSection, label: 'Product Opportunities', icon: ShoppingBag },
            ].map(item => {
              const Icon = item.icon;
              const isActive = currentSection === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    setCurrentSection(item.id);
                    setSelectedProduct(null);
                  }}
                  className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-xs font-medium transition-colors cursor-pointer ${
                    isActive
                      ? 'bg-[#2563EB] text-white shadow-xs'
                      : 'text-slate-700 hover:bg-slate-100'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{item.label}</span>
                </button>
              );
            })}

            {/* Active Products Sub-Menu */}
            {activeProducts.length > 0 && (
              <div className="pt-3 mt-3 border-t border-slate-200">
                <div className="px-3 py-1.5 text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                  Active Products
                </div>
                <div className="space-y-0.5">
                  {activeProducts.map(product => (
                    <button
                      key={product.product}
                      onClick={() => {
                        setCurrentSection('product-detail');
                        setSelectedProduct(product.product);
                      }}
                      className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg text-xs transition-colors cursor-pointer group ${
                        selectedProduct === product.product
                          ? 'bg-slate-900 text-white shadow-xs'
                          : 'text-slate-600 hover:bg-slate-100'
                      }`}
                    >
                      <div className="w-1.5 h-1.5 rounded-full bg-current"></div>
                      <span className="flex-1 text-left truncate">{product.product}</span>
                      <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                        product.status === 'Completed / Sold'
                          ? 'bg-emerald-100 text-emerald-700'
                          : product.status === 'In Progress'
                          ? 'bg-blue-100 text-blue-700'
                          : 'bg-purple-100 text-purple-700'
                      }`}>
                        {product.status === 'In Progress' ? 'Active' : product.status === 'Interested' ? 'New' : 'Sold'}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* MAIN CONTENT AREA */}
        <div className="flex-1 overflow-y-auto p-5 space-y-5">
          {currentSection === 'all-profile' && (
            <div className="space-y-4">
              {/* Student Profile Card */}
              <div className="bg-white rounded-xl border border-slate-200/80 p-4 shadow-xs space-y-3.5">
                <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <Users className="w-4 h-4 text-slate-600" />
                  Student Profile & Contact
                </h3>

                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div>
                    <label className="text-[11px] text-slate-500 font-medium block mb-1">Student Name</label>
                    <input
                      type="text"
                      value={draftLead.studentName}
                      onChange={e => handleUpdateDraftField('studentName', e.target.value)}
                      className="w-full p-2 bg-slate-50 border border-slate-200 rounded-md font-semibold text-slate-900 focus:bg-white focus:outline-hidden focus:border-slate-400"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] text-slate-500 font-medium block mb-1">Mobile Number</label>
                    <div className="flex">
                      <span className="bg-slate-100 border border-r-0 border-slate-200 px-2 py-2 text-xs text-slate-500 rounded-l-md font-mono">
                        +{draftLead.mobileCountryCode}
                      </span>
                      <input
                        type="text"
                        value={draftLead.mobileNumber}
                        onChange={e => handleUpdateDraftField('mobileNumber', e.target.value)}
                        className="w-full p-2 bg-slate-50 border border-slate-200 rounded-r-md font-mono text-slate-900 focus:bg-white focus:outline-hidden focus:border-slate-400"
                      />
                    </div>
                  </div>
                  <div className="col-span-2">
                    <label className="text-[11px] text-slate-500 font-medium block mb-1">Email</label>
                    <input
                      type="text"
                      value={draftLead.email}
                      onChange={e => handleUpdateDraftField('email', e.target.value)}
                      className="w-full p-2 bg-slate-50 border border-slate-200 rounded-md font-mono text-slate-900 focus:bg-white focus:outline-hidden focus:border-slate-400"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] text-slate-500 font-medium block mb-1">Source Code</label>
                    <input
                      type="text"
                      value={draftLead.sourceCode}
                      onChange={e => handleUpdateDraftField('sourceCode', e.target.value)}
                      className="w-full p-2 bg-slate-50 border border-slate-200 rounded-md font-mono text-slate-900 focus:bg-white focus:outline-hidden focus:border-slate-400"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] text-slate-500 font-medium block mb-1">BDE Code</label>
                    <input
                      type="text"
                      value={draftLead.bdeCode || ''}
                      onChange={e => handleUpdateDraftField('bdeCode', e.target.value)}
                      className="w-full p-2 bg-slate-50 border border-slate-200 rounded-md font-mono text-slate-900 focus:bg-white focus:outline-hidden focus:border-slate-400"
                    />
                  </div>
                </div>
              </div>

              {/* Journey Stage Card */}
              <div className="bg-white rounded-xl border border-slate-200/80 p-4 shadow-xs space-y-3">
                <h3 className="text-sm font-bold text-slate-900">Journey Stage</h3>
                <div className="flex flex-wrap gap-1.5">
                  {JOURNEY_STAGES.map(stage => (
                    <button
                      key={stage}
                      onClick={() => handleUpdateDraftField('journeyStage', stage)}
                      className={`px-2.5 py-1 rounded-md text-xs font-medium cursor-pointer transition-colors ${
                        draftLead.journeyStage === stage
                          ? 'bg-slate-900 text-white font-bold'
                          : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                      }`}
                    >
                      {stage}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {currentSection === 'notes' && (
            <div className="space-y-4">
              <div className="bg-white rounded-xl border border-slate-200/80 p-4 shadow-xs space-y-3 flex flex-col h-96">
                <h3 className="text-sm font-bold text-slate-900 flex-shrink-0">Notes & Activity</h3>
                
                {/* Chat Messages Area */}
                <div className="flex-1 overflow-y-auto space-y-2 mb-3 min-h-0">
                  {draftLead.notes.length === 0 ? (
                    <div className="flex items-center justify-center h-full text-slate-400 text-xs">
                      No notes yet. Start adding notes below.
                    </div>
                  ) : (
                    draftLead.notes.map((note, idx) => (
                      <div key={idx} className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-xs">
                        <div className="text-blue-900 break-words">{note}</div>
                        <div className="text-blue-600 text-[10px] mt-1.5">Virendra</div>
                      </div>
                    ))
                  )}
                </div>

                {/* Input Area */}
                <div className="flex gap-2 flex-shrink-0 border-t border-slate-200 pt-3">
                  <textarea
                    value={newNoteText}
                    onChange={e => setNewNoteText(e.target.value)}
                    onKeyDown={e => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        handleStageNote();
                      }
                    }}
                    placeholder="Add a note... (Enter to send, Shift+Enter for new line)"
                    className="flex-1 p-2 bg-slate-50 border border-slate-200 rounded-lg text-xs focus:bg-white focus:outline-hidden focus:border-slate-400 resize-none"
                    rows={2}
                  />
                  <button
                    onClick={handleStageNote}
                    disabled={!newNoteText.trim()}
                    className="px-4 py-2 text-xs font-semibold bg-[#2563EB] text-white rounded-lg hover:bg-[#1E40AF] disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer flex-shrink-0 h-fit"
                  >
                    Send
                  </button>
                </div>
              </div>
            </div>
          )}

          {currentSection === 'academic' && (
            <div className="space-y-4">
              <div className="bg-white rounded-xl border border-slate-200/80 p-4 shadow-xs space-y-3.5">
                <h3 className="text-sm font-bold text-slate-900">Academic & Study Plans</h3>
                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div>
                    <label className="text-[11px] text-slate-500 font-medium block mb-1">Destination Country</label>
                    <input
                      type="text"
                      value={draftLead.destinationCountry}
                      onChange={e => handleUpdateDraftField('destinationCountry', e.target.value)}
                      className="w-full p-2 bg-slate-50 border border-slate-200 rounded-md font-medium text-slate-900 focus:bg-white focus:outline-hidden focus:border-slate-400"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] text-slate-500 font-medium block mb-1">Course / Degree</label>
                    <input
                      type="text"
                      value={draftLead.course}
                      onChange={e => handleUpdateDraftField('course', e.target.value)}
                      className="w-full p-2 bg-slate-50 border border-slate-200 rounded-md font-medium text-slate-900 focus:bg-white focus:outline-hidden focus:border-slate-400"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] text-slate-500 font-medium block mb-1">Target Intake</label>
                    <input
                      type="text"
                      value={draftLead.intake}
                      onChange={e => handleUpdateDraftField('intake', e.target.value)}
                      className="w-full p-2 bg-slate-50 border border-slate-200 rounded-md font-medium text-slate-900 focus:bg-white focus:outline-hidden focus:border-slate-400"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] text-slate-500 font-medium block mb-1">Final University</label>
                    <input
                      type="text"
                      value={draftLead.finalUniversity || ''}
                      onChange={e => handleUpdateDraftField('finalUniversity', e.target.value)}
                      className="w-full p-2 bg-slate-50 border border-slate-200 rounded-md font-bold text-slate-900 focus:bg-white focus:outline-hidden focus:border-slate-400"
                    />
                  </div>
                  <div className="col-span-2">
                    <label className="text-[11px] text-slate-500 font-medium block mb-1">Universities of Interest</label>
                    <input
                      type="text"
                      value={draftLead.universitiesOfInterest.join(', ')}
                      onChange={e => handleUpdateDraftField('universitiesOfInterest', e.target.value.split(',').map(s => s.trim()).filter(Boolean))}
                      className="w-full p-2 bg-slate-50 border border-slate-200 rounded-md text-slate-800 focus:bg-white focus:outline-hidden focus:border-slate-400"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] text-slate-500 font-medium block mb-1">Tests Interested</label>
                    <input
                      type="text"
                      value={draftLead.testsInterestedIn?.join(', ') || ''}
                      onChange={e => handleUpdateDraftField('testsInterestedIn', e.target.value.split(',').map(s => s.trim()).filter(Boolean))}
                      className="w-full p-2 bg-slate-50 border border-slate-200 rounded-md text-slate-800 focus:bg-white focus:outline-hidden focus:border-slate-400"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {currentSection === 'assignments' && (
            <div className="space-y-4">
              <div className="bg-white rounded-xl border border-slate-200/80 p-4 shadow-xs space-y-3">
                <h3 className="text-sm font-bold text-slate-900">Lead Assignment History</h3>
                <div className="space-y-2">
                  {draftLead.assignmentHistory.map((assignment, idx) => (
                    <div key={idx} className="p-3 bg-slate-50 border border-slate-200 rounded-lg text-xs">
                      <div className="flex items-center justify-between">
                        <div className="font-semibold text-slate-900">{assignment.owner}</div>
                        <span className="text-[10px] text-slate-500">{assignment.assignedAt}</span>
                      </div>
                      <div className="text-slate-600 text-[11px] mt-1">
                        Team: {assignment.team} • Assigned by: {assignment.assignedBy}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {currentSection === 'documents' && (
            <div className="space-y-4">
              <div className="bg-white rounded-xl border border-slate-200/80 p-4 shadow-xs space-y-3">
                <h3 className="text-sm font-bold text-slate-900">Documents</h3>
                <p className="text-xs text-slate-500">Document management coming soon</p>
              </div>
            </div>
          )}

          {currentSection === 'products' && (
            <div className="space-y-4">
              <div className="bg-white rounded-xl border border-slate-200/80 p-4 shadow-xs space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-bold text-slate-900">Active Products ({activeProducts.length})</h3>
                  <div className="flex flex-wrap gap-1.5">
                    {ALL_MASTER_PRODUCTS.map(prod => (
                      <button
                        key={prod}
                        onClick={() => handleToggleProductOpportunity(prod)}
                        className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium transition-all cursor-pointer ${
                          draftLead.masterProducts[prod]
                            ? 'bg-[#2563EB] text-white'
                            : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                        }`}
                      >
                        <span>{draftLead.masterProducts[prod] ? '✓' : '+'}</span>
                        <span className="hidden sm:inline">{prod}</span>
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-3 pt-3 border-t border-slate-100">
                  {activeProducts.map(opp => (
                    <div key={opp.product} className="p-3 border border-slate-200 rounded-lg hover:border-slate-300 transition-colors">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          {getProductIcon(opp.product)}
                          <div>
                            <h4 className="font-semibold text-slate-900 text-sm">{opp.product}</h4>
                            <p className="text-xs text-slate-500">{opp.details || 'No profile'}</p>
                          </div>
                        </div>
                        <button
                          onClick={() => setExpandedProduct(expandedProduct === opp.product ? null : opp.product)}
                          className="p-1.5 hover:bg-slate-100 rounded cursor-pointer"
                        >
                          {expandedProduct === opp.product ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                        </button>
                      </div>

                      {expandedProduct === opp.product && (
                        <div className="mt-3 pt-3 border-t border-slate-100 space-y-2 text-xs">
                          <div className="grid grid-cols-2 gap-3">
                            <div>
                              <span className="text-slate-500 font-medium">Status</span>
                              <select
                                value={opp.status}
                                onChange={e => handleUpdateOpportunityDraft(opp.product, { status: e.target.value as ProductOpportunityStatus })}
                                className="w-full mt-1 p-1.5 bg-slate-50 border border-slate-200 rounded font-medium text-slate-900 text-xs"
                              >
                                <option value="Interested">Interested</option>
                                <option value="In Progress">In Progress</option>
                                <option value="Completed / Sold">Completed / Sold</option>
                                <option value="Not Interested">Not Interested</option>
                                <option value="Failed / Rejected">Failed / Rejected</option>
                              </select>
                            </div>
                            <div>
                              <span className="text-slate-500 font-medium">Amount</span>
                              <input
                                type="text"
                                value={opp.amount || ''}
                                onChange={e => handleUpdateOpportunityDraft(opp.product, { amount: e.target.value })}
                                className="w-full mt-1 p-1.5 bg-slate-50 border border-slate-200 rounded font-mono text-slate-900 text-xs"
                              />
                            </div>
                            <div className="col-span-2">
                              <span className="text-slate-500 font-medium">Partner</span>
                              <input
                                type="text"
                                value={opp.partner || ''}
                                onChange={e => handleUpdateOpportunityDraft(opp.product, { partner: e.target.value })}
                                className="w-full mt-1 p-1.5 bg-slate-50 border border-slate-200 rounded text-slate-900 text-xs"
                              />
                            </div>
                          </div>

                          {opp.product === 'Education Loan' && onOpenEducationLoan && (
                            <button
                              onClick={() => onOpenEducationLoan(draftLead)}
                              className="w-full mt-2 inline-flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-xs font-bold text-white bg-[#2563EB] hover:bg-[#1E40AF] cursor-pointer"
                            >
                              <ExternalLink className="w-3.5 h-3.5" />
                              <span>Open Full Loan Profile</span>
                            </button>
                          )}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {currentSection === 'product-detail' && selectedProduct && (
            <div className="space-y-4">
              {(() => {
                const product = activeProducts.find(p => p.product === selectedProduct);
                if (!product) return <div>Product not found</div>;

                return (
                  <>
                    {/* Product Header */}
                    <div className="bg-white rounded-xl border border-slate-200/80 p-4 shadow-xs">
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-3">
                          {getProductIcon(selectedProduct)}
                          <div>
                            <h2 className="text-lg font-bold text-slate-900">{selectedProduct}</h2>
                            <p className="text-xs text-slate-500">Product Profile & Status Updates</p>
                          </div>
                        </div>
                        <button
                          onClick={() => setCurrentSection('products')}
                          className="p-1.5 hover:bg-slate-100 rounded-lg cursor-pointer text-slate-500 hover:text-slate-700"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>

                      {/* Status Section */}
                      <div className="grid grid-cols-3 gap-3 pt-4 border-t border-slate-100">
                        <div>
                          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1">Status</span>
                          <select
                            value={product.status}
                            onChange={e => handleUpdateOpportunityDraft(selectedProduct, { status: e.target.value as ProductOpportunityStatus })}
                            className={`w-full p-2 rounded-lg font-semibold text-sm border ${getStatusBadge(product.status)}`}
                          >
                            <option value="Interested">Interested</option>
                            <option value="In Progress">In Progress</option>
                            <option value="Completed / Sold">Completed / Sold</option>
                            <option value="Not Interested">Not Interested</option>
                            <option value="Failed / Rejected">Failed / Rejected</option>
                            <option value="Cancelled">Cancelled</option>
                          </select>
                        </div>
                        <div>
                          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1">Amount</span>
                          <input
                            type="text"
                            value={product.amount || ''}
                            onChange={e => handleUpdateOpportunityDraft(selectedProduct, { amount: e.target.value })}
                            className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg font-mono font-bold text-slate-900 text-sm"
                            placeholder="$0"
                          />
                        </div>
                        <div>
                          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1">Partner</span>
                          <input
                            type="text"
                            value={product.partner || ''}
                            onChange={e => handleUpdateOpportunityDraft(selectedProduct, { partner: e.target.value })}
                            className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 text-sm font-medium"
                            placeholder="Partner name"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Product Owner & Profile */}
                    <div className="bg-white rounded-xl border border-slate-200/80 p-4 shadow-xs space-y-3">
                      <h3 className="text-sm font-bold text-slate-900">Product Owner & Profile</h3>
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1">Product Owner</label>
                          <input
                            type="text"
                            value={product.productOwner || draftLead.leadOwner || 'Unassigned'}
                            onChange={e => handleUpdateOpportunityDraft(selectedProduct, { productOwner: e.target.value })}
                            className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900"
                          />
                        </div>
                        <div>
                          <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1">Created Date</label>
                          <input
                            type="text"
                            value={product.createdAt?.split('T')[0] || new Date().toISOString().split('T')[0]}
                            disabled
                            className="w-full p-2 bg-slate-100 border border-slate-200 rounded-lg text-slate-600 font-mono text-sm"
                          />
                        </div>
                        <div className="col-span-2">
                          <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1">Opportunity Notes</label>
                          <textarea
                            value={product.details || ''}
                            onChange={e => handleUpdateOpportunityDraft(selectedProduct, { details: e.target.value })}
                            placeholder="Add notes about this opportunity..."
                            rows={4}
                            className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 text-sm font-mono"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Status Timeline / Updates */}
                    <div className="bg-white rounded-xl border border-slate-200/80 p-4 shadow-xs space-y-3">
                      <h3 className="text-sm font-bold text-slate-900">Status Updates & Timeline</h3>
                      <div className="space-y-2 text-xs">
                        <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                          <div className="font-semibold text-blue-900">Created</div>
                          <div className="text-blue-700 mt-1">{new Date(product.createdAt || '').toLocaleString()}</div>
                          <div className="text-blue-600 text-[11px] mt-1">Product opportunity initiated</div>
                        </div>
                        <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg">
                          <div className="font-semibold text-amber-900">Last Updated</div>
                          <div className="text-amber-700 mt-1">Today at 2:45 PM</div>
                          <div className="text-amber-600 text-[11px] mt-1">Status updated to {product.status}</div>
                        </div>
                        <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg">
                          <div className="font-semibold text-slate-900">Next Steps</div>
                          <div className="text-slate-700 mt-1">
                            {product.status === 'Interested' && 'Schedule initial consultation with student'}
                            {product.status === 'In Progress' && 'Prepare proposal documents and send to student'}
                            {product.status === 'Completed / Sold' && 'Document closing and arrange disbursement'}
                            {product.status === 'Not Interested' && 'Keep in touch for future opportunities'}
                            {product.status === 'Failed / Rejected' && 'Review rejection reason and update records'}
                            {product.status === 'Cancelled' && 'Archive opportunity and log cancellation reason'}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Special Actions for Education Loan */}
                    {selectedProduct === 'Education Loan' && onOpenEducationLoan && (
                      <div className="bg-gradient-to-r from-[#2563EB]/5 to-slate-50 rounded-xl border border-[#2563EB]/30 p-4 shadow-xs">
                        <div className="flex items-center justify-between">
                          <div>
                            <h3 className="font-bold text-slate-900">Education Loan Full Profile</h3>
                            <p className="text-xs text-slate-600 mt-1">Access complete loan application, underwriting, and disbursement information</p>
                          </div>
                          <button
                            onClick={() => onOpenEducationLoan(draftLead)}
                            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold text-white bg-[#2563EB] hover:bg-[#1E40AF] cursor-pointer whitespace-nowrap"
                          >
                            <ExternalLink className="w-4 h-4" />
                            <span>Open Full Profile</span>
                          </button>
                        </div>
                      </div>
                    )}
                  </>
                );
              })()}
            </div>
          )}
        </div>
      </div>

      {/* ASSIGNMENT MODAL */}
      {isAssignModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl border border-slate-200 max-w-md w-full overflow-hidden">
            <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50">
              <h3 className="text-sm font-bold text-slate-900">Assign Lead</h3>
              <button
                onClick={() => setIsAssignModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-5 space-y-4 text-xs">
              <div>
                <label className="font-semibold text-slate-700 block mb-1.5">Target Relationship Manager</label>
                <select
                  value={targetAssignee}
                  onChange={e => {
                    setTargetAssignee(e.target.value);
                  }}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 font-semibold"
                >
                  <option value="Vikas">Vikas (Education Loans)</option>
                  <option value="John">John (Footwork Partner)</option>
                  <option value="Virendra (You)">Virendra (You) (Senior RM)</option>
                  <option value="Priya Patel">Priya Patel (Education Loans)</option>
                  <option value="Ankit Verma">Ankit Verma (Banking & Forex)</option>
                </select>
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1.5">Assigned By</label>
                <select
                  value={targetAssigner}
                  onChange={e => setTargetAssigner(e.target.value)}
                  className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-800"
                >
                  <option value="Virendra">Virendra</option>
                  <option value="Ritik">Ritik</option>
                </select>
              </div>
            </div>

            <div className="p-3 bg-slate-50 border-t border-slate-100 flex items-center justify-end gap-2">
              <button
                onClick={() => setIsAssignModalOpen(false)}
                className="px-3 py-1.5 text-xs font-semibold text-slate-600 hover:text-slate-800 rounded-lg cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmAssignment}
                className="px-4 py-1.5 text-xs font-bold text-white bg-[#2563EB] hover:bg-[#1E40AF] rounded-lg cursor-pointer"
              >
                Assign
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Note Modal */}
      {isAddNotesModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-w-md w-full shadow-xl border border-slate-200 overflow-hidden">
            <div className="p-4 border-b border-slate-200">
              <h3 className="text-sm font-bold text-slate-900">Add Note</h3>
            </div>

            <div className="p-4 space-y-3">
              <textarea
                autoFocus
                value={newNoteText}
                onChange={e => setNewNoteText(e.target.value)}
                placeholder="Type your note here..."
                className="w-full p-3 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:bg-white focus:outline-none focus:border-slate-400 resize-none"
                rows={4}
              />
            </div>

            <div className="p-3 bg-slate-50 border-t border-slate-100 flex items-center justify-end gap-2">
              <button
                onClick={() => {
                  setIsAddNotesModalOpen(false);
                  setNewNoteText('');
                }}
                className="px-3 py-1.5 text-xs font-semibold text-slate-600 hover:text-slate-800 rounded-lg cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  if (newNoteText.trim()) {
                    setDraftLead(prev => ({
                      ...prev,
                      notes: [newNoteText.trim(), ...prev.notes]
                    }));
                    setNewNoteText('');
                    setIsAddNotesModalOpen(false);
                  }
                }}
                disabled={!newNoteText.trim()}
                className="px-4 py-1.5 text-xs font-bold text-white bg-[#2563EB] hover:bg-[#1E40AF] disabled:opacity-50 disabled:cursor-not-allowed rounded-lg cursor-pointer transition-colors"
              >
                Add Note
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
