import React, { useState, useMemo } from 'react';
import { 
  Phone, 
  ChevronRight, 
  Clock, 
  ArrowUpDown, 
  CheckCircle2, 
  SlidersHorizontal,
  Plus,
  Columns,
  X,
  Users,
  Check,
} from 'lucide-react';
import { StudentLead, JourneyStage, KPIStatus, CallingStatus, Partner } from '../types';
import { isLeadOverdue } from '../utils/slaHelpers';

interface ColumnConfig {
  key: string;
  label: string;
  visible: boolean;
  category?: 'core' | 'ownership' | 'qualification' | 'calling' | 'academic' | 'products';
}

interface LeadTableProps {
  leads?: StudentLead[];
  onSelectLead: (lead: StudentLead) => void;
  onInitiateCall: (lead: StudentLead) => void;
  onQuickLogOutcome: (lead: StudentLead) => void;
  kpiFilterLabel?: string;
  onClearKpiFilter?: () => void;
  enableColumnFilter?: boolean;
  mode?: 'lead' | 'partner';
  partners?: Partner[];
  onSelectPartner?: (partner: Partner) => void;
  selectedLeadIds?: string[];
  onLeadSelectionChange?: (selectedIds: string[]) => void;
  onBulkAssign?: (selectedIds: string[]) => void;
  showClaimButton?: boolean;
  onClaimLead?: (lead: StudentLead) => void;
}

export const LeadTable: React.FC<LeadTableProps> = ({
  leads = [],
  onSelectLead,
  onInitiateCall,
  onQuickLogOutcome,
  kpiFilterLabel,
  onClearKpiFilter,
  enableColumnFilter = false,
  mode = 'lead',
  partners = [],
  onSelectPartner,
  selectedLeadIds = [],
  onLeadSelectionChange,
  onBulkAssign,
  showClaimButton = false,
  onClaimLead,
}) => {
  const [sortBy, setSortBy] = useState<'nextCall' | 'name'>('nextCall');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [isColumnFilterOpen, setIsColumnFilterOpen] = useState(false);
  const [columnFilters, setColumnFilters] = useState<Record<string, string>>({});
  const [tableSearch, setTableSearch] = useState('');
  
  // Comprehensive column configuration with 60+ fields
  const defaultLeadColumns: ColumnConfig[] = [
    // Core Identification
    { key: 'checkbox', label: '', visible: true, category: 'core' },
    { key: 'id', label: 'Lead ID', visible: true, category: 'core' },
    { key: 'createdAt', label: 'Created At', visible: false, category: 'core' },
    { key: 'sourceChannel', label: 'Source Channel', visible: false, category: 'core' },
    { key: 'sourceCode', label: 'Source Code', visible: false, category: 'core' },
    { key: 'bdeCode', label: 'BDE Code', visible: false, category: 'core' },
    { key: 'partnerCode', label: 'Partner Code', visible: false, category: 'core' },

    // Personal Information
    { key: 'studentName', label: 'Student Name', visible: true, category: 'core' },
    { key: 'mobileNumber', label: 'Mobile Number', visible: false, category: 'core' },
    { key: 'mobileCountryCode', label: 'Mobile Country Code', visible: false, category: 'core' },
    { key: 'email', label: 'Email', visible: false, category: 'core' },

    // Academic Information
    { key: 'destinationCountry', label: 'Destination Countries', visible: true, category: 'academic' },
    { key: 'finalCountry', label: 'Final Country', visible: false, category: 'academic' },
    { key: 'course', label: 'Program / Course', visible: true, category: 'academic' },
    { key: 'degreeType', label: 'Degree Type', visible: false, category: 'academic' },
    { key: 'intake', label: 'Intake', visible: false, category: 'academic' },
    { key: 'testsInterestedIn', label: 'Tests Interested In', visible: false, category: 'academic' },
    { key: 'universitiesOfInterest', label: 'Universities of Interest', visible: false, category: 'academic' },
    { key: 'finalUniversity', label: 'Final University', visible: false, category: 'academic' },

    // Financial Information
    { key: 'fundingPlan', label: 'Funding Plan', visible: false, category: 'academic' },

    // Signup & Customer Status
    { key: 'signupStatus', label: 'Signup Status', visible: false, category: 'core' },
    { key: 'customerId', label: 'Customer ID', visible: false, category: 'core' },

    // Ownership & Assignment
    { key: 'leadOwnerTeam', label: 'Lead Owner Team', visible: false, category: 'ownership' },
    { key: 'leadOwner', label: 'Lead Owner', visible: false, category: 'ownership' },
    { key: 'leadAssignedAt', label: 'Lead Assigned At', visible: false, category: 'ownership' },
    { key: 'leadAssignedBy', label: 'Lead Assigned By', visible: false, category: 'ownership' },

    // Qualification
    { key: 'qualificationStatus', label: 'Qualification Status', visible: false, category: 'qualification' },
    { key: 'qualifiedBy', label: 'Qualified By', visible: false, category: 'qualification' },
    { key: 'qualificationCompletedAt', label: 'Qualification Completed At', visible: false, category: 'qualification' },
    { key: 'qualificationNotes', label: 'Qualification Notes', visible: false, category: 'qualification' },
    { key: 'educationLoan', label: 'Education Loan', visible: false, category: 'qualification' },
    { key: 'claimStatus', label: 'Claim Status', visible: false, category: 'qualification' },

    // Calling Operational
    { key: 'callingStatus', label: 'Calling Status', visible: true, category: 'calling' },
    { key: 'noOfAttempts', label: 'No. of Attempts', visible: false, category: 'calling' },
    { key: 'lastCallAt', label: 'Last Call At', visible: false, category: 'calling' },
    { key: 'lastCallOutcome', label: 'Last Call Outcome', visible: false, category: 'calling' },
    { key: 'nextCall', label: 'Next Call At', visible: true, category: 'calling' },
    { key: 'priority', label: 'Priority', visible: true, category: 'calling' },

    // Lead Journey & Status
    { key: 'journeyStage', label: 'Lead Stage', visible: true, category: 'core' },
    { key: 'leadStatus', label: 'Lead Status', visible: true, category: 'core' },
    { key: 'closureReason', label: 'Closure Reason', visible: false, category: 'core' },
    { key: 'closedAt', label: 'Closed At', visible: false, category: 'core' },
    { key: 'closedBy', label: 'Closed By', visible: false, category: 'core' },
    { key: 'closureNotes', label: 'Closure Notes', visible: false, category: 'core' },

    // KPI & SLA
    { key: 'kpiStatus', label: 'SLA Status', visible: true, category: 'calling' },
    { key: 'lastActionAt', label: 'Last Action At', visible: false, category: 'calling' },
    { key: 'lastActionBy', label: 'Last Action By', visible: false, category: 'calling' },
    { key: 'noActionSince', label: 'No Action Since', visible: false, category: 'calling' },
    { key: 'escalationStatus', label: 'Escalation Status', visible: false, category: 'calling' },
    { key: 'escalatedTo', label: 'Escalated To', visible: false, category: 'calling' },
    { key: 'kpiOverdueMinutes', label: 'KPI Overdue Minutes', visible: false, category: 'calling' },

    // Products
    { key: 'products', label: 'Products', visible: true, category: 'products' },
    { key: 'educationLoanProduct', label: 'Education Loan', visible: false, category: 'products' },
    { key: 'refinanceProduct', label: 'Refinance', visible: false, category: 'products' },
    { key: 'testPrepProduct', label: 'Test Prep', visible: false, category: 'products' },
    { key: 'testVoucherProduct', label: 'Test Voucher', visible: false, category: 'products' },
    { key: 'admissionsProduct', label: 'Admissions', visible: false, category: 'products' },
    { key: 'accommodationProduct', label: 'Accommodation', visible: false, category: 'products' },
    { key: 'esimProduct', label: 'eSIM', visible: false, category: 'products' },
    { key: 'travelFlightsProduct', label: 'Travel / Flights', visible: false, category: 'products' },
    { key: 'bankAccountProduct', label: 'Bank Account', visible: false, category: 'products' },
    { key: 'creditCardProduct', label: 'Credit Card', visible: false, category: 'products' },
    { key: 'moneyTransferProduct', label: 'Money Transfer', visible: false, category: 'products' },
    { key: 'nreNroProduct', label: 'NRE/NRO Account', visible: false, category: 'products' },
    { key: 'insuranceProduct', label: 'Insurance', visible: false, category: 'products' },
  ];

  const defaultPartnerColumns: ColumnConfig[] = [
    { key: 'businessName', label: 'Business Name', visible: true },
    { key: 'partnerCode', label: 'Partner Code', visible: true },
    { key: 'partnerType', label: 'Type', visible: true },
    { key: 'ownerName', label: 'Owner', visible: true },
    { key: 'totalLeadsGenerated', label: 'Leads Generated', visible: true },
    { key: 'leadsConverted', label: 'Leads Converted', visible: true },
    { key: 'status', label: 'Status', visible: true },
  ];

  const defaultColumns = mode === 'partner' ? defaultPartnerColumns : defaultLeadColumns;
  const [columns, setColumns] = useState<ColumnConfig[]>(defaultColumns);

  const handleToggleRowSelection = (leadId: string) => {
    if (!onLeadSelectionChange) return;
    const newSelection = selectedLeadIds.includes(leadId)
      ? selectedLeadIds.filter(id => id !== leadId)
      : [...selectedLeadIds, leadId];
    onLeadSelectionChange(newSelection);
  };

  const handleSelectAll = () => {
    if (!onLeadSelectionChange) return;
    const allIds = filteredLeads.map((item: any) => item.id);
    if (selectedLeadIds.length === allIds.length) {
      onLeadSelectionChange([]);
    } else {
      onLeadSelectionChange(allIds);
    }
  };

  // Filter and sort data based on mode
  const filteredLeads = useMemo(() => {
    if (mode === 'partner' && partners.length > 0) {
      // Partner mode filtering and sorting
      return partners.sort((a, b) => {
        if (sortBy === 'nextCall') {
          // Sort by total leads generated for partners
          return sortOrder === 'asc' 
            ? a.totalLeadsGenerated - b.totalLeadsGenerated 
            : b.totalLeadsGenerated - a.totalLeadsGenerated;
        } else {
          return sortOrder === 'asc' 
            ? (a.businessName || '').localeCompare(b.businessName || '') 
            : (b.businessName || '').localeCompare(a.businessName || '');
        }
      }) as any;
    }

    // Lead mode filtering and sorting
    return leads.filter((lead) => {
      // Apply text search across all searchable fields
      if (tableSearch.trim()) {
        const q = tableSearch.toLowerCase();
        const matchesName = lead.studentName.toLowerCase().includes(q);
        const matchesId = lead.id.toLowerCase().includes(q);
        const matchesUniv = lead.finalUniversity?.toLowerCase().includes(q) || lead.universitiesOfInterest.some(u => u.toLowerCase().includes(q));
        const matchesPhone = lead.mobileNumber?.includes(q);
        const matchesCountry = lead.destinationCountry.toLowerCase().includes(q);
        const matchesCourse = lead.courseOfInterest?.toLowerCase().includes(q);
        
        if (!matchesName && !matchesId && !matchesUniv && !matchesPhone && !matchesCountry && !matchesCourse) {
          return false;
        }
      }

      // Calculate priority for filtering
      if (columnFilters['priority']) {
        let score = 0;
        if (lead.kpiStatus === 'Overdue') score = 400;
        else if (lead.callingStatus === 'Callback Scheduled') score = 200;
        else if (lead.callingStatus === 'Not Attempted') score = 100;
        else score = 50;
        
        const priority = score >= 300 ? 'URGENT' : 'DUE';
        if (priority !== columnFilters['priority']) {
          return false;
        }
      }

      // Apply column filters for all filterable columns
      if (columnFilters['journeyStage'] && lead.journeyStage !== columnFilters['journeyStage']) {
        return false;
      }
      if (columnFilters['leadStatus'] && lead.leadStatus !== columnFilters['leadStatus']) {
        return false;
      }
      if (columnFilters['kpiStatus'] && lead.kpiStatus !== columnFilters['kpiStatus']) {
        return false;
      }
      if (columnFilters['products']) {
        const hasProduct = lead.productOpportunities.some(p => p.product === columnFilters['products']);
        if (!hasProduct) return false;
      }
      if (columnFilters['callingStatus'] && lead.callingStatus !== columnFilters['callingStatus']) {
        return false;
      }
      if (columnFilters['claimStatus'] && (lead.claimStatus || 'Not Claimed') !== columnFilters['claimStatus']) {
        return false;
      }
      if (columnFilters['id'] && !lead.id.toLowerCase().includes(columnFilters['id'].toLowerCase())) {
        return false;
      }
      if (columnFilters['studentName'] && !lead.studentName.toLowerCase().includes(columnFilters['studentName'].toLowerCase())) {
        return false;
      }
      if (columnFilters['destinationCountry'] && lead.destinationCountry !== columnFilters['destinationCountry']) {
        return false;
      }
      if (columnFilters['course'] && lead.courseOfInterest !== columnFilters['course']) {
        return false;
      }
      if (columnFilters['noOfAttempts'] && lead.noOfAttempts.toString() !== columnFilters['noOfAttempts']) {
        return false;
      }
      if (columnFilters['lastCallOutcome'] && lead.lastCallOutcome !== columnFilters['lastCallOutcome']) {
        return false;
      }
      return true;
    }).sort((a, b) => {
      if (sortBy === 'nextCall') {
        const dateA = a.nextCallAt ? new Date(a.nextCallAt).getTime() : 0;
        const dateB = b.nextCallAt ? new Date(b.nextCallAt).getTime() : 0;
        return sortOrder === 'asc' ? dateA - dateB : dateB - dateA;
      } else {
        return sortOrder === 'asc' 
          ? (a.studentName || '').localeCompare(b.studentName || '') 
          : (b.studentName || '').localeCompare(a.studentName || '');
      }
    });
  }, [leads, columnFilters, tableSearch, sortBy, sortOrder, mode, partners]);

  const toggleSort = (type: 'nextCall' | 'name') => {
    if (sortBy === type) {
      setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(type);
      setSortOrder('asc');
    }
  };

  const handleToggleColumn = (key: string) => {
    setColumns(prev => prev.map(col => col.key === key ? { ...col, visible: !col.visible } : col));
  };

  const visibleColumns = columns.filter(c => c.visible);

  const renderAdditionalColumnData = (lead: StudentLead, columnKey: string) => {
    switch(columnKey) {
      case 'destinationCountry':
        return <span className="text-slate-700">{lead.destinationCountry}</span>;
      case 'course':
        return <span className="text-slate-700">{lead.courseOfInterest || '—'}</span>;
      case 'noOfAttempts':
        return <span className="text-slate-700 font-medium">{lead.noOfAttempts}</span>;
      case 'lastCallOutcome':
        return <span className="text-slate-700">{lead.lastCallOutcome || '—'}</span>;
      case 'priority':
        // Calculate priority based on SLA status and calling status
        let score = 0;
        if (lead.kpiStatus === 'Overdue') score = 400;
        else if (lead.callingStatus === 'Callback Scheduled') score = 200;
        else if (lead.callingStatus === 'Not Attempted') score = 100;
        else score = 50;
        
        const isPriority = score >= 300;
        return (
          <span className={`text-xs font-bold px-2 py-1 rounded-full ${isPriority ? 'bg-rose-100 text-rose-700 border border-rose-200' : 'bg-amber-100 text-amber-700 border border-amber-200'}`}>
            {isPriority ? 'URGENT' : 'DUE'}
          </span>
        );
      case 'kpiStatus':
        const statusClass = lead.kpiStatus === 'Overdue' ? 'bg-rose-100 text-rose-800 border-rose-200' : lead.kpiStatus === 'On Track' ? 'bg-emerald-50 text-emerald-800 border-emerald-200' : 'bg-slate-100 text-slate-700 border-slate-200';
        return (
          <span className={`inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-md border ${statusClass}`}>
            {lead.kpiStatus}
          </span>
        );
      case 'claimStatus':
        const claimClass = lead.claimStatus === 'Claimed' ? 'bg-emerald-100 text-emerald-800 border-emerald-200' : 'bg-slate-100 text-slate-700 border-slate-200';
        return (
          <span className={`inline-flex items-center text-[11px] font-semibold px-2 py-0.5 rounded-md border ${claimClass}`}>
            {lead.claimStatus || 'Not Claimed'}
          </span>
        );
      default:
        return null;
    }
  };

  const formatNextCall = (dateStr?: string, kpiStatus?: KPIStatus, overdueMinutes?: number) => {
    if (!dateStr) {
      return (
        <div className="flex flex-col">
          <span className="text-xs text-slate-500 font-medium">Not Scheduled</span>
          <span className="text-[11px] text-slate-400">Queue</span>
        </div>
      );
    }
    const d = new Date(dateStr);
    const isValid = !isNaN(d.getTime());
    const timeFormatted = isValid ? d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Today';

    if (kpiStatus === 'Overdue') {
      return (
        <div className="flex flex-col">
          <span className="text-xs font-semibold text-[#2563EB]">
            {overdueMinutes ? `${overdueMinutes}m overdue` : 'KPI Overdue'}
          </span>
          <span className="text-[11px] text-slate-400">
            Due {timeFormatted}
          </span>
        </div>
      );
    }

    return (
      <div className="flex flex-col">
        <span className="text-xs text-slate-700 font-medium">Today {timeFormatted}</span>
        <span className="text-[11px] text-slate-400">On Track</span>
      </div>
    );
  };

  const getCallingStatusDot = (status: CallingStatus) => {
    switch(status) {
      case 'Not Attempted':
        return <span className="w-1.5 h-1.5 rounded-full bg-[#2563EB]" />;
      case 'Callback Scheduled':
        return <span className="w-1.5 h-1.5 rounded-full bg-[#FF5722]" />;
      case 'Connected':
        return <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />;
      default:
        return <span className="w-1.5 h-1.5 rounded-full bg-slate-400" />;
    }
  };

  return (
    <div id="actionable-lead-table-container" className="bg-white rounded-xl border border-slate-200/80 shadow-2xs overflow-hidden">
      {/* Table Toolbar & Filters */}
      <div className="px-4 py-3 border-b border-slate-200/80 flex flex-wrap items-center justify-between gap-3 bg-white">
        <div className="flex items-center gap-3 flex-wrap flex-1">
          {/* Detailed Search Input */}
          <div className="relative flex-1 max-w-sm">
            <input
              type="text"
              placeholder="Search by name, ID, university, phone, country, course..."
              value={tableSearch}
              onChange={(e) => setTableSearch(e.target.value)}
              className="w-full px-4 py-2 text-sm border border-slate-200 rounded-lg bg-white focus:bg-white focus:border-slate-400 focus:outline-none focus:ring-1 focus:ring-slate-200 transition-all"
            />
            {tableSearch && (
              <button
                onClick={() => setTableSearch('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                ✕
              </button>
            )}
          </div>

          {/* Lead Count */}
          <span className="text-xs text-slate-500 font-medium whitespace-nowrap">{filteredLeads.length} {mode === 'partner' ? 'partners' : 'leads'}</span>

          {/* Active Filter Pill */}
          {kpiFilterLabel && (
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium bg-slate-100 text-slate-800 border border-slate-200">
              <span>{kpiFilterLabel}</span>
              <button 
                onClick={onClearKpiFilter}
                className="hover:text-[#2563EB] cursor-pointer"
                title="Clear filter"
              >
                ✕
              </button>
            </div>
          )}

          {/* Assign Button (when leads selected) */}
          {selectedLeadIds.length > 0 && onBulkAssign && mode === 'lead' && (
            <button
              onClick={() => onBulkAssign(selectedLeadIds)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors cursor-pointer"
            >
              <Users size={14} />
              <span>Assign ({selectedLeadIds.length})</span>
            </button>
          )}
        </div>

        {/* Sort & Column Filter */}
        <div className="flex items-center gap-3 text-xs text-slate-500">
          <button
            onClick={() => toggleSort('nextCall')}
            className="text-xs text-slate-600 hover:text-slate-900 font-medium flex items-center gap-1 cursor-pointer"
          >
            <ArrowUpDown className="w-3 h-3" />
            <span>Sort by Call ({sortOrder})</span>
          </button>
          
          <div className="relative">
            <button
              onClick={() => setIsColumnFilterOpen(!isColumnFilterOpen)}
              className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold text-slate-700 bg-slate-50 border border-slate-200 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
              title="Select columns"
            >
              <Columns className="w-3.5 h-3.5 text-slate-500" />
              <span>Columns ({visibleColumns.length})</span>
            </button>

            {isColumnFilterOpen && (
              <div className="absolute right-0 top-full mt-1 w-64 bg-white border border-slate-200 rounded-lg shadow-xl z-40 p-3 animate-in fade-in zoom-in-95 duration-100">
                <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-100">
                  <span className="text-xs font-bold text-slate-900">Show/Hide Columns</span>
                  <button
                    onClick={() => setIsColumnFilterOpen(false)}
                    className="text-slate-400 hover:text-slate-600 cursor-pointer"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>

                <div className="space-y-1.5 max-h-48 overflow-y-auto">
                  {[...columns].sort((a, b) => a.label.localeCompare(b.label)).map(col => (
                    <label 
                      key={col.key}
                      className="flex items-center gap-2 p-1.5 rounded hover:bg-slate-50 cursor-pointer select-none"
                    >
                      <input
                        type="checkbox"
                        checked={col.visible}
                        onChange={() => handleToggleColumn(col.key)}
                        className="w-3.5 h-3.5 text-[#2563EB] rounded border-slate-300 focus:ring-[#2563EB]"
                      />
                      <span className={`text-xs ${col.visible ? 'text-slate-900 font-medium' : 'text-slate-400'}`}>
                        {col.label}
                      </span>
                    </label>
                  ))}
                </div>

                <div className="mt-2 pt-2 border-t border-slate-100">
                  <button
                    onClick={() => setIsColumnFilterOpen(false)}
                    className="w-full px-2.5 py-1 text-xs font-semibold text-white bg-[#2563EB] rounded hover:bg-[#1E40AF] transition-colors cursor-pointer"
                  >
                    Done
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Clean, High-Density Table */}
      <div className="overflow-x-auto">
        <table id="rm-leads-data-table" className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-slate-200/70 text-[11px] font-semibold text-slate-400 uppercase tracking-wider bg-slate-50/50">
              {visibleColumns.map((col) => {
                let width = 'min-w-[140px]';
                if (col.key === 'checkbox') width = 'w-12 text-center';
                else if (col.key === 'priority') width = 'w-20 text-center';
                else if (col.key === 'id') width = 'w-28';
                else if (col.key === 'studentName') width = 'min-w-[220px]';
                else if (col.key === 'journeyStage') width = 'min-w-[140px]';
                else if (col.key === 'callingStatus') width = 'min-w-[130px]';
                else if (col.key === 'nextCall') width = 'min-w-[150px]';
                else if (col.key === 'products') width = 'min-w-[220px]';
                else if (col.key === 'kpiStatus') width = 'min-w-[120px]';
                else if (col.key === 'leadStatus') width = 'min-w-[120px]';
                else if (col.key === 'claimStatus') width = 'min-w-[120px]';

                // Checkbox column header
                if (col.key === 'checkbox') {
                  return (
                    <th key={col.key} className={`py-2.5 px-4 ${width}`}>
                      {onLeadSelectionChange && mode === 'lead' && (
                        <input
                          type="checkbox"
                          checked={selectedLeadIds.length > 0 && selectedLeadIds.length === filteredLeads.length}
                          onChange={handleSelectAll}
                          className="w-4 h-4 text-[#2563EB] rounded border-slate-300 focus:ring-[#2563EB] cursor-pointer"
                        />
                      )}
                    </th>
                  );
                }

                const getFilterOptions = () => {
                  switch (col.key) {
                    case 'priority':
                      return ['URGENT', 'DUE'];
                    case 'journeyStage':
                      return ['Counseling', 'Application', 'Admission Confirmed', 'Visa', 'Pre-Departure', 'Travel'];
                    case 'kpiStatus':
                      return ['Overdue', 'On Track'];
                    case 'leadStatus':
                      return ['Active', 'On Hold', 'Closed', 'Archived'];
                    case 'callingStatus':
                      return ['Not Attempted', 'Callback Scheduled', 'Connected', 'RNR'];
                    case 'products':
                      return ['Education Loan', 'Bank Account', 'Credit Card', 'Insurance', 'eSIM', 'Money Transfer'];
                    case 'claimStatus':
                      return ['Claimed', 'Not Claimed'];
                    case 'destinationCountry':
                      return [...new Set(leads.map(l => l.destinationCountry))].sort();
                    case 'course':
                      return [...new Set(leads.map(l => l.courseOfInterest).filter(Boolean))].sort();
                    case 'lastCallOutcome':
                      return [...new Set(leads.map(l => l.lastCallOutcome).filter(Boolean))].sort();
                    case 'noOfAttempts':
                      return [...new Set(leads.map(l => l.noOfAttempts.toString()))].sort();
                    default:
                      return [];
                  }
                };

                const isFilterable = ['priority', 'journeyStage', 'kpiStatus', 'leadStatus', 'products', 'callingStatus', 'claimStatus', 'destinationCountry', 'course', 'lastCallOutcome', 'noOfAttempts', 'id', 'studentName'].includes(col.key);
                const filterOptions = getFilterOptions();
                const isTextFilter = ['id', 'studentName'].includes(col.key);
                
                return (
                  <th key={col.key} className={`py-2.5 px-4 ${width} relative group`}>
                    <div className="flex items-center gap-0.5">
                      <span>{col.label}</span>
                      {isFilterable && (
                        <div className="relative">
                          <button
                            className="text-slate-300 group-hover:text-slate-400 hover:text-slate-600 transition-colors p-0.5"
                            title="Filter this column"
                          >
                            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
                            </svg>
                          </button>
                          <div className="hidden group-hover:block absolute left-0 top-full mt-0.5 bg-white border border-slate-200 rounded-lg shadow-lg z-50 p-2 min-w-max max-h-64 overflow-y-auto">
                            <div className="text-xs font-semibold text-slate-700 px-2 py-1 sticky top-0 bg-white">Filter</div>
                            {isTextFilter ? (
                              <input
                                type="text"
                                placeholder={`Search ${col.label.toLowerCase()}...`}
                                value={columnFilters[col.key] || ''}
                                onChange={(e) => setColumnFilters(prev => ({ ...prev, [col.key]: e.target.value }))}
                                className="w-full px-2 py-1 text-xs border border-slate-200 rounded mb-1 focus:outline-none focus:border-slate-400"
                              />
                            ) : (
                              <>
                                <button
                                  onClick={() => setColumnFilters(prev => {
                                    const newFilters = { ...prev };
                                    delete newFilters[col.key];
                                    return newFilters;
                                  })}
                                  className={`block w-full text-left px-2 py-1 text-xs rounded hover:bg-slate-100 ${!columnFilters[col.key] ? 'font-bold text-slate-900' : 'text-slate-600'}`}
                                >
                                  All
                                </button>
                                {filterOptions.map(option => (
                                  <button
                                    key={option}
                                    onClick={() => setColumnFilters(prev => ({ ...prev, [col.key]: option }))}
                                    className={`block w-full text-left px-2 py-1 text-xs rounded hover:bg-slate-100 ${columnFilters[col.key] === option ? 'font-bold text-slate-900' : 'text-slate-600'}`}
                                  >
                                    {option}
                                  </button>
                                ))}
                              </>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  </th>
                );
              })}
              <th className="py-2.5 px-4 text-right min-w-[170px]">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-xs">
            {filteredLeads.length === 0 ? (
              <tr>
                <td colSpan={visibleColumns.length + 1} className="py-12 text-center text-slate-400">
                  No {mode === 'partner' ? 'partners' : 'leads'} found matching current filter
                </td>
              </tr>
            ) : (
              filteredLeads.map((item: any) => {
                if (mode === 'partner') {
                  const partner = item as Partner;
                  return (
                    <tr 
                      key={partner.id}
                      onClick={() => onSelectPartner?.(partner)}
                      className="hover:bg-slate-50/70 transition-colors cursor-pointer group"
                    >
                      {visibleColumns.map((col) => {
                        if (col.key === 'businessName') {
                          return (
                            <td key={col.key} className="py-3 px-4">
                              <div className="font-semibold text-slate-900 group-hover:text-[#2563EB] transition-colors">
                                {partner.businessName}
                              </div>
                            </td>
                          );
                        } else if (col.key === 'partnerCode') {
                          return (
                            <td key={col.key} className="py-3 px-4 font-mono text-xs font-semibold text-slate-800">
                              {partner.partnerCode}
                            </td>
                          );
                        } else if (col.key === 'partnerType') {
                          return (
                            <td key={col.key} className="py-3 px-4">
                              <span className="inline-block px-2 py-0.5 rounded text-[11px] font-medium bg-slate-100 text-slate-700">
                                {partner.partnerType}
                              </span>
                            </td>
                          );
                        } else if (col.key === 'ownerName') {
                          return (
                            <td key={col.key} className="py-3 px-4 text-slate-700">
                              {partner.ownerName}
                            </td>
                          );
                        } else if (col.key === 'totalLeadsGenerated') {
                          return (
                            <td key={col.key} className="py-3 px-4 font-medium text-slate-900">
                              {partner.totalLeadsGenerated}
                            </td>
                          );
                        } else if (col.key === 'leadsConverted') {
                          return (
                            <td key={col.key} className="py-3 px-4 font-medium text-emerald-600">
                              {partner.leadsConverted}
                            </td>
                          );
                        } else if (col.key === 'status') {
                          return (
                            <td key={col.key} className="py-3 px-4">
                              <span className={`inline-flex items-center text-[11px] font-medium px-2 py-0.5 rounded-md border ${
                                partner.status === 'Active'
                                  ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                                  : partner.status === 'Pending Head' || partner.status === 'Pending Manager'
                                  ? 'bg-amber-50 text-amber-800 border-amber-200'
                                  : 'bg-slate-100 text-slate-700 border-slate-200'
                              }`}>
                                {partner.status}
                              </span>
                            </td>
                          );
                        }
                        return <td key={col.key} className="py-3 px-4 text-slate-700">—</td>;
                      })}

                      {/* Actions column - always visible */}
                      <td className="py-3 px-4 text-right" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center justify-end gap-1.5">
                          {/* View Arrow */}
                          <button
                            onClick={() => onSelectPartner?.(partner)}
                            className="p-1 text-slate-400 hover:text-slate-700 cursor-pointer"
                          >
                            <ChevronRight className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                }

                // Lead mode rendering
                const lead = item as StudentLead;
                return (
                  <tr 
                    key={lead.id}
                    id={`lead-row-${lead.id}`}
                    className="hover:bg-slate-50/70 transition-colors group"
                  >
                    {visibleColumns.map((col) => {
                      if (col.key === 'checkbox') {
                        return (
                          <td key={col.key} className="py-3 px-4 text-center" onClick={(e) => e.stopPropagation()}>
                            {onLeadSelectionChange && (
                              <input
                                type="checkbox"
                                checked={selectedLeadIds.includes(lead.id)}
                                onChange={() => handleToggleRowSelection(lead.id)}
                                className="w-4 h-4 text-[#2563EB] rounded border-slate-300 focus:ring-[#2563EB] cursor-pointer"
                              />
                            )}
                          </td>
                        );
                      } else if (col.key === 'priority') {
                        return (
                          <td key={col.key} className="py-3 px-4 text-center cursor-pointer" onClick={() => onSelectLead(lead)}>
                            {renderAdditionalColumnData(lead, col.key)}
                          </td>
                        );
                      } else if (col.key === 'id') {
                        return (
                          <td key={col.key} className="py-3 px-4 font-mono text-xs font-semibold text-slate-800 cursor-pointer" onClick={() => onSelectLead(lead)}>
                            {lead.id}
                          </td>
                        );
                      } else if (col.key === 'studentName') {
                        return (
                          <td key={col.key} className="py-3 px-4 cursor-pointer" onClick={() => onSelectLead(lead)}>
                            <span className="font-semibold text-slate-900 group-hover:text-[#2563EB] transition-colors">
                              {lead.studentName}
                            </span>
                          </td>
                        );
                      } else if (col.key === 'journeyStage') {
                        return (
                          <td key={col.key} className="py-3 px-4 cursor-pointer" onClick={() => onSelectLead(lead)}>
                            <span className="inline-block px-2 py-0.5 rounded text-[11px] font-medium bg-slate-100 text-slate-700">
                              {lead.journeyStage}
                            </span>
                          </td>
                        );
                      } else if (col.key === 'callingStatus') {
                        return (
                          <td key={col.key} className="py-3 px-4 cursor-pointer" onClick={() => onSelectLead(lead)}>
                            <span className={`inline-flex items-center gap-1 text-[11px] font-medium px-2 py-0.5 rounded-md border ${
                              lead.callingStatus === 'Callback Scheduled'
                                ? 'bg-amber-50 text-amber-800 border-amber-200'
                                : lead.callingStatus === 'Connected'
                                ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                                : lead.callingStatus === 'RNR'
                                ? 'bg-rose-50 text-rose-800 border-rose-200'
                                : 'bg-slate-100 text-slate-700 border-slate-200'
                            }`}>
                              {getCallingStatusDot(lead.callingStatus)}
                              <span>{lead.callingStatus}</span>
                            </span>
                          </td>
                        );
                      } else if (col.key === 'nextCall') {
                        return (
                          <td key={col.key} className="py-3 px-4 cursor-pointer" onClick={() => onSelectLead(lead)}>
                            {formatNextCall(lead.nextCallAt, lead.kpiStatus, lead.kpiOverdueMinutes)}
                          </td>
                        );
                      } else if (col.key === 'products') {
                        return (
                          <td key={col.key} className="py-3 px-4 cursor-pointer" onClick={() => onSelectLead(lead)}>
                            <div className="flex flex-wrap gap-1 max-w-[220px]">
                              {lead.productOpportunities.slice(0, 3).map((prod) => (
                                <span
                                  key={prod.id}
                                  className="inline-flex items-center text-[10px] px-1.5 py-0.5 rounded bg-slate-50 border border-slate-200/80 text-slate-600"
                                >
                                  <span className="truncate max-w-[75px] font-medium">{prod.product.replace('Education Loan', 'Loan').replace('Bank Account', 'Bank')}</span>
                                </span>
                              ))}
                              {lead.productOpportunities.length > 3 && (
                                <span className="text-[10px] text-slate-400 px-1 py-0.5">
                                  +{lead.productOpportunities.length - 3}
                                </span>
                              )}
                            </div>
                          </td>
                        );
                      } else if (col.key === 'kpiStatus') {
                        return (
                          <td key={col.key} className="py-3 px-4 cursor-pointer" onClick={() => onSelectLead(lead)}>
                            {renderAdditionalColumnData(lead, col.key)}
                          </td>
                        );
                      } else {
                        // Additional columns
                        return (
                          <td key={col.key} className="py-3 px-4 text-slate-700 cursor-pointer" onClick={() => onSelectLead(lead)}>
                            {renderAdditionalColumnData(lead, col.key)}
                          </td>
                        );
                      }
                    })}

                    {/* Actions column - always visible */}
                    <td className="py-3 px-4 text-right" onClick={(e) => e.stopPropagation()}>
                      <div className="flex items-center justify-end gap-1.5">
                        {/* Claim button: Only show if showClaimButton is true */}
                        {showClaimButton && onClaimLead && (
                          <button
                            id={`btn-claim-${lead.id}`}
                            onClick={() => onClaimLead(lead)}
                            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 transition-colors cursor-pointer"
                          >
                            <Check className="w-3 h-3" />
                            <span>Claim</span>
                          </button>
                        )}

                        {/* Call button: Solid Zolve Red */}
                        {!showClaimButton && (
                          <button
                            id={`btn-call-${lead.id}`}
                            onClick={() => onSelectLead(lead)}
                            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-semibold text-white bg-[#2563EB] hover:bg-[#1E40AF] transition-colors cursor-pointer"
                          >
                            <Phone className="w-3 h-3 fill-white" />
                            <span>Call</span>
                          </button>
                        )}

                        {/* Quick Outcome button */}
                        {!showClaimButton && (
                          <button
                            id={`btn-quick-log-${lead.id}`}
                            onClick={() => onQuickLogOutcome(lead)}
                            className="px-2.5 py-1 rounded-md text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 transition-colors cursor-pointer"
                          >
                            Log
                          </button>
                        )}

                        {/* View Arrow */}
                        <button
                          id={`btn-view-${lead.id}`}
                          onClick={() => onSelectLead(lead)}
                          className="p-1 text-slate-400 hover:text-slate-700 cursor-pointer"
                        >
                          <ChevronRight className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

    </div>
  );
};
