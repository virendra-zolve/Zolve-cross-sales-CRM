import React, { useState, useMemo } from 'react';
import { INITIAL_LEADS } from './data/initialLeads';
import { StudentLead, LeadStatus, KPIStatus, CallLogItem, ActivityItem, AssignmentHistory, Partner, TeamMember } from './types';
import { Header } from './components/Header';
import { RmDashboard } from './components/RmDashboard';
import { TeamLeadDashboard } from './components/TeamLeadDashboard';
import { HeadDashboard } from './components/HeadDashboard';
import { BdeDashboard } from './components/BdeDashboard';
import { ManagerDashboard } from './components/ManagerDashboard';
import { QualificationDashboard } from './components/QualificationDashboard';
import { LeadTable } from './components/LeadTable';
import { TeamManagementPage } from './components/TeamManagementPage';
import { PartnerManagementPage } from './components/PartnerManagementPage';
import { TeamMemberDetailView } from './components/TeamMemberDetailView';
import { PartnerDetailView } from './components/PartnerDetailView';
import { LeadDetailViewRefactored } from './components/LeadDetailViewRefactored';
import { EducationLoanDetailView } from './components/EducationLoanDetailView';
import EducationLoanJourneyPage from './components/EducationLoanJourneyPage';
import { BulkUploadModal } from './components/BulkUploadModal';
import { NewLeadModal } from './components/NewLeadModal';
import { CreateLeadChoiceModal } from './components/CreateLeadChoiceModal';
import { OnboardPartnerModal } from './components/OnboardPartnerModal';
import { PartnerOnboardingModal } from './components/PartnerOnboardingModal';
import { CommissionEditorModal } from './components/CommissionEditorModal';
import { partnersDb } from './api/partnersApi';
import { TeamOnboardingModal } from './components/TeamOnboardingModal';
import { ArrowLeft, Filter } from 'lucide-react';
import { searchLeads } from './utils/filterHelpers';
import { isLeadOverdue } from './utils/slaHelpers';
import { createLeadAssignment, createBulkAssignment } from './utils/assignmentHelpers';

// Dummy active Team Leads under Manager Virendra (Delhi NCR) and the agents that report to them.
// Names match the leadOwner values used in INITIAL_LEADS so the Manager rollup shows real counts.
const DUMMY_ACTIVE_TEAM: TeamMember[] = [
  // Team Lead 1: owns leads assigned to "Priya Patel" and "Rohan Mehta"
  {
    id: 'tm_tl_001',
    userId: 'user_tl001',
    name: 'Priya Patel',
    email: 'priya.patel@zolve.com',
    phone: '9000000001',
    role: 'Team Lead',
    experienceLevel: 'Lead',
    location: 'Delhi NCR',
    locationId: 'loc_001',
    managerId: 'mgr_virendra',
    managerName: 'Manager Virendra',
    product: 'Education Loan',
    monthlyTarget: 60,
    capacityPercent: 75,
    employmentType: 'Full-time',
    joiningDate: new Date(Date.now() - 180 * 24 * 60 * 60 * 1000).toISOString(),
    createdAt: new Date(Date.now() - 180 * 24 * 60 * 60 * 1000).toISOString(),
    createdBy: 'Head',
    status: 'Active',
    approvalHistory: [],
  },
  {
    id: 'tm_ag_001',
    userId: 'user_ag001',
    name: 'Rohan Mehta',
    email: 'rohan.mehta@zolve.com',
    phone: '9000000002',
    role: 'Agent',
    experienceLevel: 'Senior',
    location: 'Delhi NCR',
    locationId: 'loc_001',
    managerId: 'user_tl001',
    managerName: 'Priya Patel',
    product: 'Education Loan',
    monthlyTarget: 25,
    capacityPercent: 82,
    employmentType: 'Full-time',
    joiningDate: new Date(Date.now() - 120 * 24 * 60 * 60 * 1000).toISOString(),
    createdAt: new Date(Date.now() - 120 * 24 * 60 * 60 * 1000).toISOString(),
    createdBy: 'Priya Patel',
    status: 'Active',
    approvalHistory: [],
  },
  // Team Lead 2: owns leads assigned to "Ankit Verma" and "Sneha Rao"
  {
    id: 'tm_tl_002',
    userId: 'user_tl002',
    name: 'Ankit Verma',
    email: 'ankit.verma@zolve.com',
    phone: '9000000003',
    role: 'Team Lead',
    experienceLevel: 'Lead',
    location: 'Delhi NCR',
    locationId: 'loc_001',
    managerId: 'mgr_virendra',
    managerName: 'Manager Virendra',
    product: 'Bank Account',
    monthlyTarget: 55,
    capacityPercent: 68,
    employmentType: 'Full-time',
    joiningDate: new Date(Date.now() - 200 * 24 * 60 * 60 * 1000).toISOString(),
    createdAt: new Date(Date.now() - 200 * 24 * 60 * 60 * 1000).toISOString(),
    createdBy: 'Head',
    status: 'Active',
    approvalHistory: [],
  },
  {
    id: 'tm_ag_002',
    userId: 'user_ag002',
    name: 'Sneha Rao',
    email: 'sneha.rao@zolve.com',
    phone: '9000000004',
    role: 'Agent',
    experienceLevel: 'Mid',
    location: 'Delhi NCR',
    locationId: 'loc_001',
    managerId: 'user_tl002',
    managerName: 'Ankit Verma',
    product: 'Admissions',
    monthlyTarget: 20,
    capacityPercent: 60,
    employmentType: 'Full-time',
    joiningDate: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString(),
    createdAt: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString(),
    createdBy: 'Ankit Verma',
    status: 'Active',
    approvalHistory: [],
  },
  // Team Lead 3: owns leads assigned to "Vikas" and "Virendra (You)"
  {
    id: 'tm_tl_003',
    userId: 'user_tl003',
    name: 'Vikas',
    email: 'vikas@zolve.com',
    phone: '9000000005',
    role: 'Team Lead',
    experienceLevel: 'Lead',
    location: 'Delhi NCR',
    locationId: 'loc_001',
    managerId: 'mgr_virendra',
    managerName: 'Manager Virendra',
    product: 'Education Loan',
    monthlyTarget: 70,
    capacityPercent: 85,
    employmentType: 'Full-time',
    joiningDate: new Date(Date.now() - 240 * 24 * 60 * 60 * 1000).toISOString(),
    createdAt: new Date(Date.now() - 240 * 24 * 60 * 60 * 1000).toISOString(),
    createdBy: 'Head',
    status: 'Active',
    approvalHistory: [],
  },
  {
    id: 'tm_ag_003',
    userId: 'user_ag003',
    name: 'Virendra (You)',
    email: 'virendra@zolve.com',
    phone: '9000000006',
    role: 'Agent',
    experienceLevel: 'Senior',
    location: 'Delhi NCR',
    locationId: 'loc_001',
    managerId: 'user_tl003',
    managerName: 'Vikas',
    product: 'Education Loan',
    monthlyTarget: 30,
    capacityPercent: 90,
    employmentType: 'Full-time',
    joiningDate: new Date(Date.now() - 150 * 24 * 60 * 60 * 1000).toISOString(),
    createdAt: new Date(Date.now() - 150 * 24 * 60 * 60 * 1000).toISOString(),
    createdBy: 'Vikas',
    status: 'Active',
    approvalHistory: [],
  },
];

// Dummy data for team member approvals
const DUMMY_PENDING_TEAM_MEMBERS: TeamMember[] = [
  {
    id: 'tm_pending_001',
    userId: 'user_pm001',
    name: 'Priya Singh',
    email: 'priya.singh@zolve.com',
    phone: '9876543210',
    role: 'Agent',
    experienceLevel: 'Senior',
    location: 'Delhi NCR',
    locationId: 'loc_001',
    managerId: 'mgr_001',
    managerName: 'Manager Virendra',
    product: 'Education Loan',
    monthlyTarget: 25,
    capacityPercent: 80,
    employmentType: 'Full-time',
    joiningDate: new Date().toISOString(),
    createdAt: new Date().toISOString(),
    createdBy: 'Manager Virendra',
    status: 'Pending Approval',
    approvalHistory: [
      {
        timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
        action: 'submitted',
        actor: 'Manager Virendra',
        actorRole: 'Manager',
      },
    ],
  },
  {
    id: 'tm_pending_002',
    userId: 'user_pm002',
    name: 'Rajesh Kumar',
    email: 'rajesh.kumar@zolve.com',
    phone: '9876543211',
    role: 'Agent',
    experienceLevel: 'Mid',
    location: 'Mumbai',
    locationId: 'loc_002',
    managerId: 'mgr_002',
    managerName: 'Manager Rajesh',
    product: 'Test Prep',
    monthlyTarget: 30,
    capacityPercent: 60,
    employmentType: 'Full-time',
    joiningDate: new Date().toISOString(),
    createdAt: new Date().toISOString(),
    createdBy: 'Manager Rajesh',
    status: 'Pending Approval',
    approvalHistory: [
      {
        timestamp: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
        action: 'submitted',
        actor: 'Manager Rajesh',
        actorRole: 'Manager',
      },
    ],
  },
  {
    id: 'tm_pending_003',
    userId: 'user_pm003',
    name: 'Anjali Verma',
    email: 'anjali.verma@zolve.com',
    phone: '9876543212',
    role: 'Agent',
    experienceLevel: 'Junior',
    location: 'Bangalore',
    locationId: 'loc_003',
    managerId: 'mgr_003',
    managerName: 'Manager Priya',
    product: 'Education Loan',
    monthlyTarget: 15,
    capacityPercent: 50,
    employmentType: 'Full-time',
    joiningDate: new Date().toISOString(),
    createdAt: new Date().toISOString(),
    createdBy: 'Manager Priya',
    status: 'Pending Approval',
    approvalHistory: [
      {
        timestamp: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
        action: 'submitted',
        actor: 'Manager Priya',
        actorRole: 'Manager',
      },
    ],
  },
];

// Dummy data for partner approvals
const DUMMY_PENDING_PARTNERS: Partner[] = [
  {
    id: 'partner_pending_001',
    partnerCode: 'PART_00101',
    businessName: 'Delhi Education Consultants Pvt Ltd',
    ownerName: 'Vikram Sharma',
    ownerEmail: 'vikram@deleduc.com',
    ownerPhone: '9999888877',
    contactPersonName: 'Amit Singh',
    contactPersonEmail: 'amit@deleduc.com',
    contactPersonPhone: '9999888878',
    partnerType: 'Education Loan',
    status: 'Pending Head',
    locationId: 'loc_001',
    locationName: 'Delhi NCR',
    bdeUserId: 'bde_001',
    bdeName: 'BDE User',
    managerId: 'mgr_001',
    managerName: 'Manager Virendra',
    sourceCode: 'DEL_PARTNER',
    createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    pan: 'ABCDE1234F',
    panNumber: '12345',
    gst: 'GST12345678',
    gstNumber: '87654',
    registeredAddress: {
      addressLine1: '123 Education Street',
      street: 'Education Street',
      city: 'Delhi',
      state: 'Delhi',
      pincode: '110001',
      country: 'India',
    },
    eligibleProducts: ['Education Loan', 'Test Prep', 'Admissions'],
    documents: [
      {
        type: 'PAN',
        fileName: 'pan_certificate.pdf',
        fileUrl: '#',
        uploadedAt: new Date().toISOString(),
        uploadedBy: 'BDE User',
      },
      {
        type: 'GST',
        fileName: 'gst_certificate.pdf',
        fileUrl: '#',
        uploadedAt: new Date().toISOString(),
        uploadedBy: 'BDE User',
      },
      {
        type: 'CIN',
        fileName: 'cin_certificate.pdf',
        fileUrl: '#',
        uploadedAt: new Date().toISOString(),
        uploadedBy: 'BDE User',
      },
    ],
    commissions: [
      { product: 'Education Loan', type: 'Percentage', value: 2.5 },
      { product: 'Test Prep', type: 'Percentage', value: 5 },
      { product: 'Admissions', type: 'Percentage', value: 3 },
    ],
    totalLeadsGenerated: 0,
    leadsConverted: 0,
    activeLeads: 0,
    approvalHistory: [
      {
        timestamp: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
        action: 'submitted',
        actor: 'BDE User',
        actorRole: 'BDE',
      },
    ],
  },
  {
    id: 'partner_pending_002',
    partnerCode: 'PART_00102',
    businessName: 'Mumbai Study Abroad Services',
    ownerName: 'Neha Patel',
    ownerEmail: 'neha@mumbaiabroad.com',
    ownerPhone: '9999777766',
    contactPersonName: 'Priya Nair',
    contactPersonEmail: 'priya@mumbaiabroad.com',
    contactPersonPhone: '9999777765',
    partnerType: 'Education Loan',
    status: 'Pending Head',
    locationId: 'loc_002',
    locationName: 'Mumbai',
    bdeUserId: 'bde_002',
    bdeName: 'BDE User 2',
    managerId: 'mgr_002',
    managerName: 'Manager Rajesh',
    sourceCode: 'MUM_PARTNER',
    createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
    pan: 'XYZAB5678G',
    panNumber: '56789',
    gst: 'GST87654321',
    gstNumber: '12345',
    registeredAddress: {
      addressLine1: '456 Study Lane',
      street: 'Study Lane',
      city: 'Mumbai',
      state: 'Maharashtra',
      pincode: '400001',
      country: 'India',
    },
    eligibleProducts: ['Education Loan', 'Test Prep'],
    documents: [
      {
        type: 'PAN',
        fileName: 'pan_cert_mumbai.pdf',
        fileUrl: '#',
        uploadedAt: new Date().toISOString(),
        uploadedBy: 'BDE User 2',
      },
      {
        type: 'GST',
        fileName: 'gst_cert_mumbai.pdf',
        fileUrl: '#',
        uploadedAt: new Date().toISOString(),
        uploadedBy: 'BDE User 2',
      },
    ],
    commissions: [
      { product: 'Education Loan', type: 'Percentage', value: 2 },
      { product: 'Test Prep', type: 'Percentage', value: 4.5 },
    ],
    totalLeadsGenerated: 0,
    leadsConverted: 0,
    activeLeads: 0,
    approvalHistory: [
      {
        timestamp: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
        action: 'submitted',
        actor: 'BDE User 2',
        actorRole: 'BDE',
      },
    ],
  },
  {
    id: 'partner_pending_003',
    partnerCode: 'PART_00103',
    businessName: 'Bangalore Global Education Hub',
    ownerName: 'Arjun Menon',
    ownerEmail: 'arjun@bangalorege.com',
    ownerPhone: '9999666655',
    contactPersonName: 'Sandhya Desai',
    contactPersonEmail: 'sandhya@bangalorege.com',
    contactPersonPhone: '9999666654',
    partnerType: 'Accommodation',
    status: 'Pending Head',
    locationId: 'loc_003',
    locationName: 'Bangalore',
    bdeUserId: 'bde_003',
    bdeName: 'BDE User 3',
    managerId: 'mgr_003',
    managerName: 'Manager Priya',
    sourceCode: 'BNG_PARTNER',
    createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    pan: 'MNOPQ9012H',
    panNumber: '90123',
    gst: 'GST11223344',
    gstNumber: '44332',
    registeredAddress: {
      addressLine1: '789 Global Plaza',
      street: 'Global Plaza',
      city: 'Bangalore',
      state: 'Karnataka',
      pincode: '560001',
      country: 'India',
    },
    eligibleProducts: ['Education Loan', 'Admissions', 'Accommodation'],
    documents: [
      {
        type: 'PAN',
        fileName: 'pan_bangalore.pdf',
        fileUrl: '#',
        uploadedAt: new Date().toISOString(),
        uploadedBy: 'BDE User 3',
      },
      {
        type: 'GST',
        fileName: 'gst_bangalore.pdf',
        fileUrl: '#',
        uploadedAt: new Date().toISOString(),
        uploadedBy: 'BDE User 3',
      },
      {
        type: 'Agreement',
        fileName: 'partnership_agreement.pdf',
        fileUrl: '#',
        uploadedAt: new Date().toISOString(),
        uploadedBy: 'BDE User 3',
      },
    ],
    commissions: [
      { product: 'Education Loan', type: 'Percentage', value: 3.5 },
      { product: 'Admissions', type: 'Percentage', value: 4 },
      { product: 'Accommodation', type: 'Percentage', value: 2.5 },
    ],
    totalLeadsGenerated: 0,
    leadsConverted: 0,
    activeLeads: 0,
    approvalHistory: [
      {
        timestamp: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
        action: 'submitted',
        actor: 'BDE User 3',
        actorRole: 'BDE',
      },
    ],
  },
  {
    id: 'partner_active_001',
    partnerCode: 'KC_OVERSEAS_P01',
    businessName: 'Pune Overseas Advisors LLP',
    ownerName: 'Rohit Deshmukh',
    ownerEmail: 'rohit@puneoverseas.com',
    ownerPhone: '9812345670',
    contactPersonName: 'Sneha Kulkarni',
    contactPersonEmail: 'sneha@puneoverseas.com',
    contactPersonPhone: '9812345671',
    partnerType: 'Education Loan',
    status: 'Active',
    locationId: 'loc_001',
    locationName: 'Pune',
    bdeUserId: 'bde_001',
    bdeName: 'BDE User',
    managerId: 'mgr_001',
    managerName: 'Manager Virendra',
    sourceCode: 'PUN_PARTNER',
    createdAt: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString(),
    pan: 'PQRST4567K',
    gst: 'GST27PQRST45',
    registeredAddress: {
      addressLine1: '12 FC Road',
      street: 'FC Road',
      city: 'Pune',
      state: 'Maharashtra',
      pincode: '411004',
      country: 'India',
    },
    eligibleProducts: ['Education Loan', 'Accommodation'],
    documents: [
      { type: 'PAN', fileName: 'pan_pune.pdf', fileUrl: '#', uploadedAt: new Date().toISOString(), uploadedBy: 'BDE User' },
      { type: 'Agreement', fileName: 'agreement_pune.pdf', fileUrl: '#', uploadedAt: new Date().toISOString(), uploadedBy: 'BDE User' },
    ],
    commissions: [
      { product: 'Education Loan', type: 'Percentage', value: 1.2 },
      { product: 'Accommodation', type: 'Fixed', value: 500 },
    ],
    totalLeadsGenerated: 142,
    leadsConverted: 38,
    activeLeads: 24,
    approvalHistory: [
      { timestamp: new Date(Date.now() - 61 * 24 * 60 * 60 * 1000).toISOString(), action: 'submitted', actor: 'BDE User', actorRole: 'BDE' },
      { timestamp: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString(), action: 'approved', actor: 'Head User', actorRole: 'Head' },
    ],
  },
  {
    id: 'partner_active_002',
    partnerCode: 'EDWISE_MUM_02',
    businessName: 'Hyderabad Fintech Partners',
    ownerName: 'Kiran Rao',
    ownerEmail: 'kiran@hydfintech.com',
    ownerPhone: '9898989801',
    contactPersonName: 'Lakshmi Reddy',
    contactPersonEmail: 'lakshmi@hydfintech.com',
    contactPersonPhone: '9898989802',
    partnerType: 'Bank Account',
    status: 'Active',
    locationId: 'loc_004',
    locationName: 'Hyderabad',
    bdeUserId: 'bde_002',
    bdeName: 'BDE User 2',
    managerId: 'mgr_002',
    managerName: 'Manager Rajesh',
    sourceCode: 'HYD_PARTNER',
    createdAt: new Date(Date.now() - 45 * 24 * 60 * 60 * 1000).toISOString(),
    pan: 'LMNOP1234Q',
    gst: 'GST36LMNOP12',
    registeredAddress: {
      addressLine1: '45 Hitech City Road',
      street: 'Hitech City',
      city: 'Hyderabad',
      state: 'Telangana',
      pincode: '500081',
      country: 'India',
    },
    eligibleProducts: ['Bank Account', 'Credit Card', 'eSIM'],
    documents: [
      { type: 'PAN', fileName: 'pan_hyd.pdf', fileUrl: '#', uploadedAt: new Date().toISOString(), uploadedBy: 'BDE User 2' },
      { type: 'Agreement', fileName: 'agreement_hyd.pdf', fileUrl: '#', uploadedAt: new Date().toISOString(), uploadedBy: 'BDE User 2' },
    ],
    commissions: [
      { product: 'Bank Account', type: 'Fixed', value: 300 },
      { product: 'Credit Card', type: 'Fixed', value: 750 },
      { product: 'eSIM', type: 'Fixed', value: 120 },
    ],
    totalLeadsGenerated: 310,
    leadsConverted: 96,
    activeLeads: 51,
    approvalHistory: [
      { timestamp: new Date(Date.now() - 46 * 24 * 60 * 60 * 1000).toISOString(), action: 'submitted', actor: 'BDE User 2', actorRole: 'BDE' },
      { timestamp: new Date(Date.now() - 45 * 24 * 60 * 60 * 1000).toISOString(), action: 'approved', actor: 'Head User', actorRole: 'Head' },
    ],
  },
  {
    id: 'partner_active_003',
    partnerCode: 'PC00013',
    businessName: 'Chennai Study Links',
    ownerName: 'Suresh Iyer',
    ownerEmail: 'suresh@chennaistudy.com',
    ownerPhone: '9444000011',
    contactPersonName: 'Divya Krishnan',
    contactPersonEmail: 'divya@chennaistudy.com',
    contactPersonPhone: '9444000012',
    partnerType: 'Insurance',
    status: 'Active',
    locationId: 'loc_005',
    locationName: 'Chennai',
    bdeUserId: 'bde_003',
    bdeName: 'BDE User 3',
    managerId: 'mgr_003',
    managerName: 'Manager Priya',
    sourceCode: 'CHN_PARTNER',
    createdAt: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString(),
    pan: 'RSTUV6789W',
    registeredAddress: {
      addressLine1: '78 Anna Salai',
      street: 'Anna Salai',
      city: 'Chennai',
      state: 'Tamil Nadu',
      pincode: '600002',
      country: 'India',
    },
    eligibleProducts: ['Education Loan', 'Insurance'],
    documents: [
      { type: 'PAN', fileName: 'pan_chn.pdf', fileUrl: '#', uploadedAt: new Date().toISOString(), uploadedBy: 'BDE User 3' },
      { type: 'Agreement', fileName: 'agreement_chn.pdf', fileUrl: '#', uploadedAt: new Date().toISOString(), uploadedBy: 'BDE User 3' },
    ],
    commissions: [
      { product: 'Education Loan', type: 'Percentage', value: 1.5 },
      { product: 'Insurance', type: 'Percentage', value: 8 },
    ],
    totalLeadsGenerated: 205,
    leadsConverted: 44,
    activeLeads: 18,
    approvalHistory: [
      { timestamp: new Date(Date.now() - 91 * 24 * 60 * 60 * 1000).toISOString(), action: 'submitted', actor: 'BDE User 3', actorRole: 'BDE' },
      { timestamp: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString(), action: 'approved', actor: 'Head User', actorRole: 'Head' },
    ],
  },
  {
    id: 'partner_active_004',
    partnerCode: 'PC00014',
    businessName: 'Kolkata Global Reach',
    ownerName: 'Anirban Ghosh',
    ownerEmail: 'anirban@kolkatareach.com',
    ownerPhone: '9830000022',
    contactPersonName: 'Riya Sen',
    contactPersonEmail: 'riya@kolkatareach.com',
    contactPersonPhone: '9830000023',
    partnerType: 'eSIM',
    status: 'Active',
    locationId: 'loc_006',
    locationName: 'Kolkata',
    bdeUserId: 'bde_001',
    bdeName: 'BDE User',
    managerId: 'mgr_001',
    managerName: 'Manager Virendra',
    sourceCode: 'KOL_PARTNER',
    createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
    pan: 'WXYZA2345B',
    gst: 'GST19WXYZA23',
    registeredAddress: {
      addressLine1: '9 Park Street',
      street: 'Park Street',
      city: 'Kolkata',
      state: 'West Bengal',
      pincode: '700016',
      country: 'India',
    },
    eligibleProducts: ['Education Loan', 'eSIM', 'Accommodation'],
    documents: [
      { type: 'PAN', fileName: 'pan_kol.pdf', fileUrl: '#', uploadedAt: new Date().toISOString(), uploadedBy: 'BDE User' },
      { type: 'Agreement', fileName: 'agreement_kol.pdf', fileUrl: '#', uploadedAt: new Date().toISOString(), uploadedBy: 'BDE User' },
    ],
    commissions: [
      { product: 'Education Loan', type: 'Percentage', value: 1.75 },
      { product: 'eSIM', type: 'Fixed', value: 100 },
      { product: 'Accommodation', type: 'Fixed', value: 450 },
    ],
    totalLeadsGenerated: 88,
    leadsConverted: 19,
    activeLeads: 12,
    approvalHistory: [
      { timestamp: new Date(Date.now() - 31 * 24 * 60 * 60 * 1000).toISOString(), action: 'submitted', actor: 'BDE User', actorRole: 'BDE' },
      { timestamp: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(), action: 'approved', actor: 'Head User', actorRole: 'Head' },
    ],
  },
  {
    id: 'partner_active_005',
    partnerCode: 'PC00015',
    businessName: 'Ahmedabad Edu Connect',
    ownerName: 'Mehul Shah',
    ownerEmail: 'mehul@ahmedabadedu.com',
    ownerPhone: '9825000033',
    contactPersonName: 'Pooja Mehta',
    contactPersonEmail: 'pooja@ahmedabadedu.com',
    contactPersonPhone: '9825000034',
    partnerType: 'Education Loan',
    status: 'Active',
    locationId: 'loc_007',
    locationName: 'Ahmedabad',
    bdeUserId: 'bde_002',
    bdeName: 'BDE User 2',
    managerId: 'mgr_002',
    managerName: 'Manager Rajesh',
    sourceCode: 'AMD_PARTNER',
    createdAt: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000).toISOString(),
    pan: 'BCDEF3456G',
    registeredAddress: {
      addressLine1: '21 CG Road',
      street: 'CG Road',
      city: 'Ahmedabad',
      state: 'Gujarat',
      pincode: '380009',
      country: 'India',
    },
    eligibleProducts: ['Education Loan'],
    documents: [
      { type: 'PAN', fileName: 'pan_amd.pdf', fileUrl: '#', uploadedAt: new Date().toISOString(), uploadedBy: 'BDE User 2' },
      { type: 'Agreement', fileName: 'agreement_amd.pdf', fileUrl: '#', uploadedAt: new Date().toISOString(), uploadedBy: 'BDE User 2' },
    ],
    commissions: [
      { product: 'Education Loan', type: 'Percentage', value: 1.3 },
    ],
    totalLeadsGenerated: 54,
    leadsConverted: 9,
    activeLeads: 7,
    approvalHistory: [
      { timestamp: new Date(Date.now() - 21 * 24 * 60 * 60 * 1000).toISOString(), action: 'submitted', actor: 'BDE User 2', actorRole: 'BDE' },
      { timestamp: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000).toISOString(), action: 'approved', actor: 'Head User', actorRole: 'Head' },
    ],
  },
  {
    id: 'partner_rejected_001',
    partnerCode: 'PART_00106',
    businessName: 'Jaipur Quick Loans',
    ownerName: 'Deepak Agarwal',
    ownerEmail: 'deepak@jaipurloans.com',
    ownerPhone: '9414000044',
    contactPersonName: 'Nisha Jain',
    contactPersonEmail: 'nisha@jaipurloans.com',
    contactPersonPhone: '9414000045',
    partnerType: 'Education Loan',
    status: 'Rejected by Head',
    locationId: 'loc_008',
    locationName: 'Jaipur',
    bdeUserId: 'bde_003',
    bdeName: 'BDE User 3',
    managerId: 'mgr_003',
    managerName: 'Manager Priya',
    sourceCode: 'JAI_PARTNER',
    createdAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
    pan: 'HIJKL7890M',
    headRejectionReason: 'Incomplete documentation and PAN mismatch.',
    registeredAddress: {
      addressLine1: '5 MI Road',
      street: 'MI Road',
      city: 'Jaipur',
      state: 'Rajasthan',
      pincode: '302001',
      country: 'India',
    },
    eligibleProducts: ['Education Loan'],
    documents: [
      { type: 'PAN', fileName: 'pan_jai.pdf', fileUrl: '#', uploadedAt: new Date().toISOString(), uploadedBy: 'BDE User 3' },
    ],
    commissions: [
      { product: 'Education Loan', type: 'Percentage', value: 2 },
    ],
    totalLeadsGenerated: 0,
    leadsConverted: 0,
    activeLeads: 0,
    approvalHistory: [
      { timestamp: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(), action: 'submitted', actor: 'BDE User 3', actorRole: 'BDE' },
      { timestamp: new Date(Date.now() - 9 * 24 * 60 * 60 * 1000).toISOString(), action: 'rejected', actor: 'Head User', actorRole: 'Head', reason: 'Incomplete documentation and PAN mismatch.' },
    ],
  },

  // ===== Head Office + Branch sample partners =====
  {
    id: 'partner_ho_001',
    partnerCode: 'PC00021',
    businessName: 'Global Edu Group (HO)',
    ownerName: 'Rajeev Nair',
    ownerEmail: 'rajeev@globaledu.com',
    ownerPhone: '9811100001',
    contactPersonName: 'Rajeev Nair',
    contactPersonEmail: 'rajeev@globaledu.com',
    contactPersonPhone: '9811100001',
    partnerType: 'Education Loan',
    status: 'Active',
    officeType: 'Head Office',
    locationId: 'loc_001',
    locationName: 'Delhi NCR',
    bdeUserId: 'bde_001',
    bdeName: 'BDE User',
    managerId: 'mgr_001',
    managerName: 'Manager Virendra',
    sourceCode: 'GEG_HO',
    createdAt: new Date(Date.now() - 120 * 24 * 60 * 60 * 1000).toISOString(),
    pan: 'AAGCG1234H',
    gst: '07AAGCG1234H1Z2',
    cin: 'U80301DL2015PTC111111',
    registeredAddress: { addressLine1: '1 Connaught Place', street: 'CP', city: 'New Delhi', state: 'Delhi', pincode: '110001', country: 'India' },
    eligibleProducts: ['Education Loan', 'Accommodation', 'Insurance'],
    documents: [
      { type: 'PAN', fileName: 'pan_geg.pdf', fileUrl: '#', uploadedAt: new Date().toISOString(), uploadedBy: 'BDE User' },
      { type: 'Agreement', fileName: 'agr_geg.pdf', fileUrl: '#', uploadedAt: new Date().toISOString(), uploadedBy: 'BDE User' },
    ],
    commissions: [
      { product: 'Education Loan', type: 'Percentage', value: 1.5 },
      { product: 'Insurance', type: 'Percentage', value: 7 },
    ],
    totalLeadsGenerated: 420, leadsConverted: 118, activeLeads: 60,
    approvalHistory: [
      { timestamp: new Date(Date.now() - 121 * 24 * 60 * 60 * 1000).toISOString(), action: 'submitted', actor: 'BDE User', actorRole: 'BDE' },
      { timestamp: new Date(Date.now() - 120 * 24 * 60 * 60 * 1000).toISOString(), action: 'approved', actor: 'Head User', actorRole: 'Head' },
    ],
  },
  {
    id: 'partner_ho_002',
    partnerCode: 'PC00022',
    businessName: 'Westline Overseas (HO)',
    ownerName: 'Farah Khan',
    ownerEmail: 'farah@westline.com',
    ownerPhone: '9811100002',
    contactPersonName: 'Farah Khan',
    contactPersonEmail: 'farah@westline.com',
    contactPersonPhone: '9811100002',
    partnerType: 'Education Loan',
    status: 'Active',
    officeType: 'Head Office',
    locationId: 'loc_002',
    locationName: 'Mumbai',
    bdeUserId: 'bde_002',
    bdeName: 'BDE User 2',
    managerId: 'mgr_002',
    managerName: 'Manager Rajesh',
    sourceCode: 'WL_HO',
    createdAt: new Date(Date.now() - 100 * 24 * 60 * 60 * 1000).toISOString(),
    pan: 'AABCW5678K',
    gst: '27AABCW5678K1Z4',
    registeredAddress: { addressLine1: '88 Marine Drive', street: 'Marine Drive', city: 'Mumbai', state: 'Maharashtra', pincode: '400020', country: 'India' },
    eligibleProducts: ['Education Loan', 'eSIM', 'Bank Account'],
    documents: [
      { type: 'PAN', fileName: 'pan_wl.pdf', fileUrl: '#', uploadedAt: new Date().toISOString(), uploadedBy: 'BDE User 2' },
      { type: 'Agreement', fileName: 'agr_wl.pdf', fileUrl: '#', uploadedAt: new Date().toISOString(), uploadedBy: 'BDE User 2' },
    ],
    commissions: [
      { product: 'Education Loan', type: 'Percentage', value: 1.6 },
      { product: 'eSIM', type: 'Fixed', value: 110 },
    ],
    totalLeadsGenerated: 265, leadsConverted: 70, activeLeads: 33,
    approvalHistory: [
      { timestamp: new Date(Date.now() - 101 * 24 * 60 * 60 * 1000).toISOString(), action: 'submitted', actor: 'BDE User 2', actorRole: 'BDE' },
      { timestamp: new Date(Date.now() - 100 * 24 * 60 * 60 * 1000).toISOString(), action: 'approved', actor: 'Head User', actorRole: 'Head' },
    ],
  },
  {
    id: 'partner_br_001',
    partnerCode: 'PC00023',
    businessName: 'Global Edu Group — Noida Branch',
    ownerName: 'Rajeev Nair',
    ownerEmail: 'rajeev@globaledu.com',
    ownerPhone: '9811100001',
    contactPersonName: 'Sunil Verma',
    contactPersonEmail: 'noida@globaledu.com',
    contactPersonPhone: '9811100011',
    partnerType: 'Education Loan',
    status: 'Active',
    officeType: 'Branch',
    parentPartnerId: 'partner_ho_001',
    locationId: 'loc_001',
    locationName: 'Noida',
    bdeUserId: 'bde_001',
    bdeName: 'BDE User',
    managerId: 'mgr_001',
    managerName: 'Manager Virendra',
    sourceCode: 'GEG_NOIDA',
    createdAt: new Date(Date.now() - 40 * 24 * 60 * 60 * 1000).toISOString(),
    pan: 'AAGCG1234H', // inherited from parent HO
    gst: '09AAGCG1234H1Z0',
    registeredAddress: { addressLine1: 'Sector 62', street: 'Sector 62', city: 'Noida', state: 'Uttar Pradesh', pincode: '201301', country: 'India' },
    eligibleProducts: ['Education Loan'],
    documents: [
      { type: 'PAN', fileName: 'pan_geg.pdf', fileUrl: '#', uploadedAt: new Date().toISOString(), uploadedBy: 'BDE User' },
    ],
    commissions: [
      { product: 'Education Loan', type: 'Percentage', value: 1.5 },
    ],
    totalLeadsGenerated: 76, leadsConverted: 18, activeLeads: 11,
    approvalHistory: [
      { timestamp: new Date(Date.now() - 41 * 24 * 60 * 60 * 1000).toISOString(), action: 'submitted', actor: 'BDE User', actorRole: 'BDE' },
      { timestamp: new Date(Date.now() - 40 * 24 * 60 * 60 * 1000).toISOString(), action: 'approved', actor: 'Head User', actorRole: 'Head' },
    ],
  },
  {
    id: 'partner_br_002',
    partnerCode: 'PC00024',
    businessName: 'Global Edu Group — Gurugram Branch',
    ownerName: 'Rajeev Nair',
    ownerEmail: 'rajeev@globaledu.com',
    ownerPhone: '9811100001',
    contactPersonName: 'Meera Joshi',
    contactPersonEmail: 'gurugram@globaledu.com',
    contactPersonPhone: '9811100012',
    partnerType: 'Education Loan',
    status: 'Active',
    officeType: 'Branch',
    parentPartnerId: 'partner_ho_001',
    locationId: 'loc_001',
    locationName: 'Gurugram',
    bdeUserId: 'bde_001',
    bdeName: 'BDE User',
    managerId: 'mgr_001',
    managerName: 'Manager Virendra',
    sourceCode: 'GEG_GGN',
    createdAt: new Date(Date.now() - 25 * 24 * 60 * 60 * 1000).toISOString(),
    pan: 'AAGCG1234H', // inherited from parent HO
    gst: '06AAGCG1234H1Z8',
    registeredAddress: { addressLine1: 'Cyber Hub', street: 'DLF Phase 2', city: 'Gurugram', state: 'Haryana', pincode: '122002', country: 'India' },
    eligibleProducts: ['Education Loan', 'Accommodation'],
    documents: [
      { type: 'PAN', fileName: 'pan_geg.pdf', fileUrl: '#', uploadedAt: new Date().toISOString(), uploadedBy: 'BDE User' },
    ],
    commissions: [
      { product: 'Education Loan', type: 'Percentage', value: 1.5 },
    ],
    totalLeadsGenerated: 44, leadsConverted: 9, activeLeads: 6,
    approvalHistory: [
      { timestamp: new Date(Date.now() - 26 * 24 * 60 * 60 * 1000).toISOString(), action: 'submitted', actor: 'BDE User', actorRole: 'BDE' },
      { timestamp: new Date(Date.now() - 25 * 24 * 60 * 60 * 1000).toISOString(), action: 'approved', actor: 'Head User', actorRole: 'Head' },
    ],
  },
  {
    id: 'partner_br_003',
    partnerCode: 'PC00025',
    businessName: 'Westline Overseas — Pune Branch',
    ownerName: 'Farah Khan',
    ownerEmail: 'farah@westline.com',
    ownerPhone: '9811100002',
    contactPersonName: 'Amit Patwardhan',
    contactPersonEmail: 'pune@westline.com',
    contactPersonPhone: '9811100013',
    partnerType: 'eSIM',
    status: 'Active',
    officeType: 'Branch',
    parentPartnerId: 'partner_ho_002',
    locationId: 'loc_002',
    locationName: 'Pune',
    bdeUserId: 'bde_002',
    bdeName: 'BDE User 2',
    managerId: 'mgr_002',
    managerName: 'Manager Rajesh',
    sourceCode: 'WL_PUNE',
    createdAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(),
    pan: 'AABCW5678K', // inherited from parent HO
    gst: '27AABCW5678K2Z3',
    registeredAddress: { addressLine1: 'Baner Road', street: 'Baner', city: 'Pune', state: 'Maharashtra', pincode: '411045', country: 'India' },
    eligibleProducts: ['Education Loan', 'eSIM'],
    documents: [
      { type: 'PAN', fileName: 'pan_wl.pdf', fileUrl: '#', uploadedAt: new Date().toISOString(), uploadedBy: 'BDE User 2' },
    ],
    commissions: [
      { product: 'Education Loan', type: 'Percentage', value: 1.6 },
    ],
    totalLeadsGenerated: 31, leadsConverted: 5, activeLeads: 4,
    approvalHistory: [
      { timestamp: new Date(Date.now() - 16 * 24 * 60 * 60 * 1000).toISOString(), action: 'submitted', actor: 'BDE User 2', actorRole: 'BDE' },
      { timestamp: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(), action: 'approved', actor: 'Head User', actorRole: 'Head' },
    ],
  },
];

// Stamp a partner code + BDE code onto every lead (round-robin across the dummy
// Active partners) so each partner's Leads tab shows data. Leads that already
// carry a partnerCode keep it.
const PARTNER_CODE_POOL = DUMMY_PENDING_PARTNERS
  .filter((p) => p.status === 'Active')
  .map((p) => ({ partnerCode: p.partnerCode, bdeCode: p.bdeName || p.bdeUserId }));

function withPartnerAttribution(leads: StudentLead[]): StudentLead[] {
  if (PARTNER_CODE_POOL.length === 0) return leads;
  return leads.map((lead, i) => {
    if (lead.partnerCode) return lead; // keep existing attribution
    const pick = PARTNER_CODE_POOL[i % PARTNER_CODE_POOL.length];
    return { ...lead, partnerCode: pick.partnerCode, bdeCode: pick.bdeCode };
  });
}

export default function App() {
  const [leads, setLeads] = useState<StudentLead[]>(withPartnerAttribution(INITIAL_LEADS));
  const [partners, setPartners] = useState<Partner[]>(DUMMY_PENDING_PARTNERS);
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([...DUMMY_ACTIVE_TEAM, ...DUMMY_PENDING_TEAM_MEMBERS]);
  const [selectedLeadId, setSelectedLeadId] = useState<string | null>(null);
  const [currentView, setCurrentView] = useState<'dashboard' | 'head' | 'bde' | 'qualification' | 'manager' | 'leads_list' | 'detail' | 'education_loan' | 'education_loan_journey' | 'team_management' | 'partner_management' | 'team_member_detail' | 'partner_detail'>('dashboard' as any);
  const [lastDashboardView, setLastDashboardView] = useState<'dashboard' | 'head' | 'bde' | 'qualification' | 'manager' | 'partner_management'>('dashboard' as any);
  const [selectedEducationLoanApplicationId, setSelectedEducationLoanApplicationId] = useState<string | null>(null);
  const [selectedLoanProductFlow, setSelectedLoanProductFlow] = useState<any>(null);
  const [selectedTeamMemberId, setSelectedTeamMemberId] = useState<string | null>(null);
  const [selectedPartnerId, setSelectedPartnerId] = useState<string | null>(null);
  const [currentRole, setCurrentRole] = useState<'agent' | 'team_lead' | 'manager' | 'head' | 'bde' | 'qualification' | 'partner_mgmt'>('team_lead');
  const [kpiFilter, setKpiFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Modals state
  const [isChoiceModalOpen, setIsChoiceModalOpen] = useState(false);
  const [isBulkUploadOpen, setIsBulkUploadOpen] = useState(false);
  const [isNewLeadOpen, setIsNewLeadOpen] = useState(false);
  const [isOnboardPartnerOpen, setIsOnboardPartnerOpen] = useState(false);
  const [commissionEditorPartnerId, setCommissionEditorPartnerId] = useState<string | null>(null);
  const [isTeamOnboardingOpen, setIsTeamOnboardingOpen] = useState(false);

  // Call Modal state
  const [activeCallingLead, setActiveCallingLead] = useState<StudentLead | null>(null);
  const [isCallModalOpen, setIsCallModalOpen] = useState(false);
  const [isLiveCallMode, setIsLiveCallMode] = useState(true);

  // Current lead being viewed
  const currentLead = useMemo(() => {
    if (!selectedLeadId) return null;
    return leads.find((l) => l.id === selectedLeadId) || null;
  }, [leads, selectedLeadId]);

  // Overdue SLA leads count
  const overdueCount = useMemo(() => {
    return leads.filter(isLeadOverdue).length;
  }, [leads]);

  // Filtered leads by search & active criteria in All Leads view - using centralized helpers
  const displayLeads = useMemo(() => {
    // First apply search
    let filtered = searchLeads(leads, searchQuery);

    // Then apply KPI filter
    filtered = filtered.filter((lead) => {
      if (kpiFilter === 'new_leads') {
        return lead.callingStatus === 'Not Attempted' && lead.qualificationStatus === 'Pending';
      }
      if (kpiFilter === 'calls_due') {
        return lead.callingStatus === 'Callback Scheduled' || lead.callingStatus === 'Connected' || lead.nextCallAt;
      }
      if (kpiFilter === 'callbacks') {
        return lead.callingStatus === 'Callback Scheduled';
      }
      if (kpiFilter === 'sla_breached') {
        return isLeadOverdue(lead);
      }
      if (kpiFilter === 'overdue_kpi') {
        return lead.kpiStatus === 'Overdue';
      }
      if (kpiFilter === 'active') {
        return lead.leadStatus === 'Active';
      }
      if (kpiFilter.startsWith('product_')) {
        const prodName = kpiFilter.replace('product_', '').replace(/_/g, ' ').toLowerCase();
        return lead.productOpportunities.some(p => p.product.toLowerCase().includes(prodName));
      }
      return true;
    });

    return filtered;
  }, [leads, kpiFilter, searchQuery]);

  // Handlers
  const handleSelectLead = (lead?: StudentLead) => {
    if (!lead || !lead.id) return;
    setSelectedLeadId(lead.id);
    if (currentView === 'dashboard') {
      setLastDashboardView(currentView);
    }
    setCurrentView('detail');
    try {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch {
      // safe fallback
    }
  };

  const handleBackToDashboard = () => {
    setCurrentView(lastDashboardView);
  };

  const handleSwitchRole = (role: 'agent' | 'team_lead' | 'manager' | 'head' | 'bde' | 'qualification' | 'partner_mgmt') => {
    setCurrentRole(role);
    // Map role to appropriate dashboard view
    const viewMap: Record<string, 'dashboard' | 'head' | 'bde' | 'qualification' | 'manager' | 'partner_management'> = {
      agent: 'dashboard',
      team_lead: 'dashboard',
      manager: 'manager',
      head: 'head',
      bde: 'bde',
      qualification: 'qualification',
      partner_mgmt: 'partner_management',
    };
    setCurrentView(viewMap[role] as any);
    setLastDashboardView(viewMap[role] as any);
    setSelectedLeadId(null);
  };

  const handleNavigateToAllLeads = (filter = 'all') => {
    setKpiFilter(filter);
    setCurrentView('leads_list');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleInitiateCall = (lead: StudentLead) => {
    setActiveCallingLead(lead);
    setIsLiveCallMode(true);
    setIsCallModalOpen(true);
  };

  const handleReassignLead = (leadId: string, newOwner: string, reason = 'Manager manual reallocation') => {
    setLeads((prev) =>
      prev.map((lead) => {
        if (lead.id !== leadId) return lead;
        const derivedTeam = newOwner.includes('Ankit') ? 'Banking & Forex Team' : 'Education Loan Team';
        const { updatedLead } = createLeadAssignment(lead, newOwner, derivedTeam, reason, 'Manager Virendra');
        return updatedLead;
      })
    );
  };

  const handleBulkReassignLeads = (leadsToAssign: StudentLead[], assignment: { agentId?: string }) => {
    if (!assignment.agentId) return;
    const newOwner = assignment.agentId;
    const derivedTeam = newOwner.includes('Ankit') ? 'Banking & Forex Team' : newOwner.includes('John') ? 'Footwork' : 'Zolve';
    setLeads((prev) =>
      prev.map((lead) => {
        if (!leadsToAssign.find(l => l.id === lead.id)) return lead;
        const { updatedLead } = createLeadAssignment(lead, newOwner, derivedTeam, 'Bulk reallocation for workload balance', 'Manager Virendra');
        return updatedLead;
      })
    );
  };

  const handleOpenEducationLoan = (lead?: StudentLead) => {
    if (lead) {
      setSelectedLeadId(lead.id);
    } else if (!selectedLeadId && leads.length > 0) {
      const loanLead = leads.find((l) => l.educationLoan === 'Yes' || l.productOpportunities.some((p) => p.product === 'Education Loan')) || leads[0];
      setSelectedLeadId(loanLead.id);
    }
    setCurrentView('education_loan');
    try {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch {}
  };

  const handleOpenEducationLoanJourney = (
    lead: StudentLead,
    opportunityId: string,
    applicationId?: string,
    loanProductFlow?: any
  ) => {
    setSelectedLeadId(lead.id);
    setSelectedEducationLoanApplicationId(applicationId || null);
    setSelectedLoanProductFlow(loanProductFlow);
    setCurrentView('education_loan_journey');
    try {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch {}
  };

  const handleExtendKpiDeadline = (leadId: string, reason: string) => {
    setLeads((prev) =>
      prev.map((lead) => {
        if (lead.id !== leadId) return lead;
        const activity: ActivityItem = {
          id: `act_${Date.now()}`,
          timestamp: new Date().toISOString(),
          actor: 'Manager Virendra',
          type: 'system',
          title: 'KPI Deadline Extended by Manager',
          description: `Deadline extended. Reason: "${reason}". KPI status restored to On Track.`,
        };
        return {
          ...lead,
          kpiStatus: 'On Track',
          kpiOverdueMinutes: undefined,
          escalationStatus: 'Not Escalated',
          activities: [activity, ...lead.activities],
        };
      })
    );
  };

  const handleResolveEscalation = (leadId: string) => {
    setLeads((prev) =>
      prev.map((lead) => {
        if (lead.id !== leadId) return lead;
        return {
          ...lead,
          escalationStatus: 'Not Escalated',
        };
      })
    );
  };

  const handleCreateTeamMember = (newMember: TeamMember) => {
    setTeamMembers(prev => [newMember, ...prev]);
  };

  const handleApproveTeamMember = (memberId: string) => {
    setTeamMembers(prev =>
      prev.map(member => {
        if (member.id !== memberId) return member;
        return {
          ...member,
          status: 'Active' as const,
          headApprovedAt: new Date().toISOString(),
          headApprovedBy: 'Head',
          approvalHistory: [
            ...member.approvalHistory,
            {
              timestamp: new Date().toISOString(),
              action: 'approved' as const,
              actor: 'Head',
              actorRole: 'Head' as const,
            },
          ],
        };
      })
    );
  };

  const handleRejectTeamMember = (memberId: string, reason: string) => {
    setTeamMembers(prev =>
      prev.map(member => {
        if (member.id !== memberId) return member;
        return {
          ...member,
          status: 'Inactive' as const,
          headRejectionReason: reason,
          approvalHistory: [
            ...member.approvalHistory,
            {
              timestamp: new Date().toISOString(),
              action: 'rejected' as const,
              actor: 'Head',
              actorRole: 'Head' as const,
              reason,
            },
          ],
        };
      })
    );
  };

  const handleSaveCallOutcome = (
    leadId: string,
    outcome: string,
    notes: string,
    nextCallIso: string,
    newStatus: LeadStatus,
    durationSeconds: number
  ) => {
    setLeads((prevLeads) =>
      prevLeads.map((l) => {
        if (l.id !== leadId) return l;

        const newCallLog: CallLogItem = {
          id: `c_${Date.now()}`,
          timestamp: new Date().toISOString(),
          rmName: 'Virendra (You)',
          durationSeconds,
          outcome,
          notes,
          scheduledNextCall: nextCallIso,
        };

        const newActivity: ActivityItem = {
          id: `act_${Date.now()}`,
          timestamp: new Date().toISOString(),
          actor: 'Virendra (RM)',
          type: 'call',
          title: `Call Logged: ${outcome}`,
          description: `Duration: ${durationSeconds}s. Notes: "${notes || 'None'}". Next call scheduled.`,
        };

        return {
          ...l,
          callingStatus: outcome === 'Callback Requested' ? 'Callback Scheduled' : (outcome === 'Connected' ? 'Connected' : l.callingStatus),
          noOfAttempts: l.noOfAttempts + 1,
          lastCallAt: new Date().toISOString(),
          lastCallOutcome: outcome as any,
          kpiStatus: 'On Track' as KPIStatus, // Action resets SLA / KPI
          kpiOverdueMinutes: undefined,
          nextCallAt: nextCallIso,
          lastActionAt: new Date().toISOString(),
          lastActionBy: 'Virendra',
          leadStatus: newStatus,
          callLogs: [newCallLog, ...l.callLogs],
          activities: [newActivity, ...l.activities],
          notes: notes ? [notes, ...l.notes] : l.notes,
        };
      })
    );
  };

  const handleUpdateLead = (updatedLead: StudentLead) => {
    setLeads((prev) => prev.map((l) => (l.id === updatedLead.id ? updatedLead : l)));
  };

  const handleImportLeads = (newLeads: StudentLead[]) => {
    setLeads((prev) => [...newLeads, ...prev]);
    setKpiFilter('all');
  };

  const handleCreateLead = (newLead: StudentLead) => {
    setLeads((prev) => [newLead, ...prev]);
  };

  const getKpiFilterLabel = () => {
    switch (kpiFilter) {
      case 'new_leads':
        return 'New Leads';
      case 'calls_due':
        return 'Calls Due Today';
      case 'callbacks':
        return 'Callback Scheduled';
      case 'sla_breached':
        return 'SLA Breached';
      case 'overdue_kpi':
        return 'SLA Overdue';
      case 'active':
        return 'Active Pipeline';
      default:
        if (kpiFilter.startsWith('product_')) {
          return `Product: ${kpiFilter.replace('product_', '').replace(/_/g, ' ')}`;
        }
        return undefined;
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-900 flex flex-col font-sans antialiased">
      {/* Top Header */}
      <Header
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        onOpenBulkUpload={() => setIsBulkUploadOpen(true)}
        onOpenNewLead={() => setIsChoiceModalOpen(true)}
        activeOverdueCount={overdueCount}
        onSelectOverdueFilter={() => {
          if (currentView === 'dashboard') {
            handleNavigateToAllLeads('sla_breached');
          } else {
            setKpiFilter(kpiFilter === 'sla_breached' ? 'all' : 'sla_breached');
          }
        }}
        currentView={currentView as 'dashboard' | 'manager' | 'leads_list' | 'detail' | 'education_loan'}
        onChangeView={(view) => {
          setCurrentView(view as any);
          if (view === 'leads_list') setKpiFilter('all');
        }}
        onBackToDashboard={handleBackToDashboard}
      />

      {/* Role Switcher */}
      <div className="bg-white border-b border-slate-200 px-3 py-2 flex gap-1 overflow-x-auto sticky top-0 z-10">
        <div className="text-xs font-semibold text-slate-600 py-1.5 px-2 whitespace-nowrap">Switch Role:</div>
        {[
          { role: 'agent' as const, label: 'RM (Agent)' },
          { role: 'team_lead' as const, label: 'Team Lead' },
          { role: 'manager' as const, label: 'Manager' },
          { role: 'head' as const, label: 'Head' },
          { role: 'bde' as const, label: 'BDE' },
          { role: 'qualification' as const, label: 'Qualification' },
          { role: 'partner_mgmt' as const, label: 'Partner Management' },
        ].map(({ role, label }) => (
          <button
            key={role}
            onClick={() => handleSwitchRole(role)}
            className={`px-2.5 py-1.5 text-xs font-medium rounded-lg transition-all whitespace-nowrap ${
              currentRole === role
                ? 'bg-slate-900 text-white'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Main Content Area */}
      <main className="flex-1 w-full px-3 py-4">
        {currentView === 'dashboard' ? (
          currentRole === 'team_lead' ? (
            /* Team Lead Dashboard */
            <TeamLeadDashboard
              leads={leads}
              teamMembers={teamMembers}
              onSelectLead={handleSelectLead}
              onBulkAssignLeads={handleBulkReassignLeads}
              onViewLeadManagement={() => handleNavigateToAllLeads('all')}
              onViewTeamManagement={() => setCurrentView('team_management')}
              onViewPartnerManagement={() => setCurrentView('partner_management')}
            />
          ) : (
            /* Operational RM Dashboard V1 */
            <RmDashboard
              leads={leads}
              onSelectLead={handleSelectLead}
              onOpenNewLead={() => setIsChoiceModalOpen(true)}
              onOpenBulkUpload={() => setIsBulkUploadOpen(true)}
              onViewAllLeads={handleNavigateToAllLeads}
            />
          )
        ) : currentView === 'head' ? (
          /* Head Dashboard - Executive Overview */
          <HeadDashboard
            leads={leads}
            partners={partners}
            teamMembers={teamMembers}
            onViewAllLeads={() => handleNavigateToAllLeads('all')}
            onViewTeamManagement={() => setCurrentView('team_management')}
            onViewPartnerManagement={() => setCurrentView('partner_management')}
          />
        ) : currentView === 'bde' ? (
          /* BDE Dashboard - Partner Onboarding */
          <BdeDashboard
            leads={leads}
            partners={partners}
            onSelectLead={handleSelectLead}
            onCreateNewPartner={() => setIsOnboardPartnerOpen(true)}
          />
        ) : currentView === 'qualification' ? (
          /* Qualification Dashboard - Pending qualification queue */
          <QualificationDashboard
            leads={leads}
            onSelectLead={handleSelectLead}
          />
        ) : currentView === 'manager' ? (
          /* Manager Dashboard - Location-level rollup */
          <ManagerDashboard
            leads={leads}
            teamMembers={teamMembers}
            locationName="Delhi NCR"
            onSelectLead={handleSelectLead}
            onBulkAssignLeads={handleBulkReassignLeads}
            onViewLeadManagement={() => handleNavigateToAllLeads('all')}
            onViewTeamManagement={() => setCurrentView('team_management')}
            onViewPartnerManagement={() => setCurrentView('partner_management')}
          />
        ) : currentView === 'leads_list' ? (
          /* Full Lead Management Screen (Answers: "Show me all my leads") */
          <div className="space-y-4">
            {/* Financial Summary Boxes - Top of Lead Management */}
            <div className="grid grid-cols-3 gap-3">
              <div className="p-3 bg-gradient-to-br from-emerald-50 to-emerald-100 rounded-lg border border-emerald-200">
                <div className="text-xs font-semibold text-emerald-700 uppercase">Total Commission</div>
                <div className="text-2xl font-bold text-emerald-900 mt-1">₹44.2L</div>
              </div>
              <div className="p-3 bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg border border-blue-200">
                <div className="text-xs font-semibold text-blue-700 uppercase">Total Pipeline</div>
                <div className="text-2xl font-bold text-blue-900 mt-1">₹2.09 Cr</div>
              </div>
              <div className="p-3 bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg border border-purple-200">
                <div className="text-xs font-semibold text-purple-700 uppercase">Pending to Partners</div>
                <div className="text-2xl font-bold text-purple-900 mt-1">₹15.8L</div>
              </div>
            </div>

            {/* Context breadcrumb & switch back to Dashboard */}
            <div className="flex items-center justify-between bg-white border border-slate-200/80 rounded-xl p-3 shadow-xs">
              <div className="flex items-center gap-2">
                <button
                  onClick={handleBackToDashboard}
                  className="inline-flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-semibold text-slate-700 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-lg transition-colors cursor-pointer"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>← Back to Dashboard</span>
                </button>
                <span className="text-xs text-slate-400">|</span>
                <span className="text-xs font-bold text-slate-900">
                  Lead Management — All Active Leads (128)
                </span>
                {kpiFilter !== 'all' && (
                  <span className="inline-flex items-center gap-1 text-[11px] font-semibold bg-blue-50 text-[#2563EB] border border-blue-200 px-2 py-0.5 rounded-md">
                    <Filter className="w-3 h-3" />
                    <span>Filtered by: {getKpiFilterLabel()}</span>
                    <button
                      onClick={() => setKpiFilter('all')}
                      className="ml-1 hover:underline text-xs"
                    >
                      ✕
                    </button>
                  </span>
                )}
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setIsNewLeadOpen(true)}
                  className="px-3 py-1.5 text-xs font-semibold text-white bg-[#2563EB] hover:bg-[#1E40AF] rounded-lg transition-colors cursor-pointer"
                >
                  + Create Lead
                </button>
              </div>
            </div>

            {/* Clean, High-Density Master Table */}
            <LeadTable
              leads={displayLeads}
              onSelectLead={handleSelectLead}
              kpiFilterLabel={getKpiFilterLabel()}
              onClearKpiFilter={() => setKpiFilter('all')}
            />
          </div>
        ) : currentView === 'team_management' ? (
          /* Team Management Page */
          <TeamManagementPage
            teamMembers={teamMembers}
            onSelectTeamMember={(member) => {
              setSelectedTeamMemberId(member.id);
              setCurrentView('team_member_detail');
            }}
            onEditTeamMember={(member) => {
              alert(`Edit team member: ${member.name}`);
            }}
            onDeactivateTeamMember={(memberId) => {
              setTeamMembers(prev =>
                prev.map(m =>
                  m.id === memberId
                    ? { ...m, status: m.status === 'Active' ? 'Pending Approval' : 'Active' }
                    : m
                )
              );
            }}
            onReassignTeamMember={(memberId, newManagerId) => {
              alert(`Reassign member ${memberId} to manager ${newManagerId}`);
            }}
            onOpenTeamOnboarding={() => setIsTeamOnboardingOpen(true)}
          />
        ) : currentView === 'partner_management' ? (
          /* Partner Management Page */
          <PartnerManagementPage
            partners={partners}
            onSelectPartner={(partner) => {
              setSelectedPartnerId(partner.id);
              setCurrentView('partner_detail');
            }}
            onEditPartner={(partner) => {
              alert(`Edit partner: ${partner.businessName}`);
            }}
            onApprovePartner={(partnerId) => {
              setPartners(prev =>
                prev.map(p =>
                  p.id === partnerId
                    ? { ...p, headApprovedAt: new Date().toISOString(), headApprovedBy: 'Head', status: 'Active' }
                    : p
                )
              );
            }}
            onRejectPartner={(partnerId, reason) => {
              setPartners(prev =>
                prev.map(p =>
                  p.id === partnerId
                    ? { ...p, headRejectionReason: reason, status: 'Rejected by Head' }
                    : p
                )
              );
            }}
            onOpenPartnerOnboarding={() => setIsOnboardPartnerOpen(true)}
          />
        ) : currentView === 'team_member_detail' ? (
          /* Team Member Detail View */
          selectedTeamMemberId ? (
            <TeamMemberDetailView
              member={teamMembers.find(m => m.id === selectedTeamMemberId)!}
              memberLeads={leads.filter(l => l.leadOwner === selectedTeamMemberId)}
              onBack={() => setCurrentView('team_management')}
              onEdit={(member) => {
                alert(`Edit team member: ${member.name}`);
              }}
              onDeactivate={(memberId) => {
                setTeamMembers(prev =>
                  prev.map(m =>
                    m.id === memberId
                      ? { ...m, status: m.status === 'Active' ? 'Pending Approval' : 'Active' }
                      : m
                  )
                );
              }}
            />
          ) : (
            <div className="bg-white rounded-xl border border-slate-200 p-8 text-center">
              <p className="text-sm text-slate-600">Team member not found</p>
            </div>
          )
        ) : currentView === 'partner_detail' ? (
          /* Partner Detail View */
          selectedPartnerId ? (
            <PartnerDetailView
              partner={partners.find(p => p.id === selectedPartnerId)!}
              partnerLeads={leads.filter(l => l.partnerCode === partners.find(p => p.id === selectedPartnerId)?.partnerCode)}
              onBack={() => setCurrentView('partner_management')}
              onEdit={(partner) => {
                alert(`Edit partner: ${partner.businessName}`);
              }}
              onApprove={(partnerId) => {
                setPartners(prev =>
                  prev.map(p =>
                    p.id === partnerId
                      ? { ...p, headApprovedAt: new Date().toISOString(), headApprovedBy: 'Head', status: 'Active' }
                      : p
                  )
                );
              }}
              onReject={(partnerId, reason) => {
                setPartners(prev =>
                  prev.map(p =>
                    p.id === partnerId
                      ? { ...p, headRejectionReason: reason, status: 'Rejected by Head' }
                      : p
                  )
                );
              }}
              availableBds={[
                { id: 'bde_001', name: 'BDE User' },
                { id: 'bde_002', name: 'BDE User 2' },
                { id: 'bde_003', name: 'BDE User 3' },
              ]}
              onReassignBd={(partnerId, bdId, bdName) => {
                setPartners(prev =>
                  prev.map(p =>
                    p.id === partnerId
                      ? { ...p, bdeUserId: bdId, bdeName: bdName }
                      : p
                  )
                );
              }}
              onEditCommissions={(partner) => {
                setCommissionEditorPartnerId(partner.id);
              }}
              onSelectLead={(lead) => handleSelectLead(lead)}
              userRole={currentRole === 'head' ? 'head' : 'maker'}
              onReviewCommissionRequest={(partnerId, requestId, decision, comment) => {
                setPartners((prev) =>
                  prev.map((p) => {
                    if (p.id !== partnerId) return p;
                    const requests = (p.commissionChangeRequests || []).map((r) => {
                      if (r.id !== requestId) return r;
                      return {
                        ...r,
                        status: decision === 'approve' ? ('Approved' as const) : ('Rejected' as const),
                        reviewedBy: 'Head',
                        reviewedAt: new Date().toISOString(),
                        comment,
                      };
                    });
                    const approved = decision === 'approve'
                      ? requests.find((r) => r.id === requestId)
                      : undefined;
                    return {
                      ...p,
                      commissionChangeRequests: requests,
                      ...(approved
                        ? {
                            commissionSlabs: approved.proposedTerms,
                            commissions: approved.proposedTerms.map((c) => ({
                              product: c.product,
                              type: c.commissionType,
                              value: c.slabs[0]?.value ?? 0,
                            })),
                          }
                        : {}),
                    };
                  })
                );
              }}
            />
          ) : (
            <div className="bg-white rounded-xl border border-slate-200 p-8 text-center">
              <p className="text-sm text-slate-600">Partner not found</p>
            </div>
          )
        ) : currentView === 'education_loan_journey' ? (
          /* Dedicated Education Loan Journey - Multi-stage Application */
          currentLead ? (
            <EducationLoanJourneyPage
              lead={currentLead}
              opportunityId="opp_placeholder" // TODO: Pass actual opportunity ID
              applicationId={selectedEducationLoanApplicationId || undefined}
              loanProductFlow={selectedLoanProductFlow}
              onBack={() => setCurrentView('detail')}
            />
          ) : (
            <div className="bg-white rounded-xl border border-slate-200 p-8 text-center space-y-3">
              <p className="text-sm font-semibold text-slate-700">No lead selected for Education Loan Journey</p>
              <button
                onClick={handleBackToDashboard}
                className="px-4 py-2 bg-[#2563EB] text-white rounded-lg text-xs font-semibold cursor-pointer"
              >
                Return to Dashboard
              </button>
            </div>
          )
        ) : currentView === 'education_loan' ? (
          /* Dedicated Education Loan Processing & Underwriting View */
          currentLead ? (
            <EducationLoanDetailView
              lead={currentLead}
              onBack={() => setCurrentView('detail')}
              onUpdateLead={handleUpdateLead}
              onInitiateCall={handleInitiateCall}
            />
          ) : (
            <div className="bg-white rounded-xl border border-slate-200 p-8 text-center space-y-3">
              <p className="text-sm font-semibold text-slate-700">No lead selected for Education Loan View</p>
              <button
                onClick={handleBackToDashboard}
                className="px-4 py-2 bg-[#2563EB] text-white rounded-lg text-xs font-semibold cursor-pointer"
              >
                Return to Dashboard
              </button>
            </div>
          )
        ) : (
          /* Single Lead 360-degree Detail View */
          currentLead && (
            <LeadDetailViewRefactored
              lead={currentLead}
              onBack={handleBackToDashboard}
              onUpdateLead={handleUpdateLead}
              onOpenEducationLoan={handleOpenEducationLoan}
            />
          )
        )}
      </main>

      {/* Create Lead Choice Modal (Popup to select Bulk or Manual) */}
      <CreateLeadChoiceModal
        isOpen={isChoiceModalOpen}
        onClose={() => setIsChoiceModalOpen(false)}
        onSelectManual={() => setIsNewLeadOpen(true)}
        onSelectBulk={() => setIsBulkUploadOpen(true)}
      />

      {/* Bulk Upload CSV Modal */}
      <BulkUploadModal
        isOpen={isBulkUploadOpen}
        onClose={() => setIsBulkUploadOpen(false)}
        onImportLeads={handleImportLeads}
      />

      {/* New Lead Modal (Fast CRM intake with Self / Unassigned radio) */}
      <NewLeadModal
        isOpen={isNewLeadOpen}
        onClose={() => setIsNewLeadOpen(false)}
        onCreateLead={handleCreateLead}
        existingLeads={leads}
      />

      {/* Onboard Partner Modal (new normalized model with commission slabs) */}
      <PartnerOnboardingModal
        isOpen={isOnboardPartnerOpen}
        onClose={() => setIsOnboardPartnerOpen(false)}
        bdOwnerId="U1001"
        bdOwnerName="Arun"
        headOffices={partners.map((p) => ({
          id: p.id,
          name: p.businessName,
          panNumber: p.pan || p.panNumber || '',
          gstNumber: p.gst || p.gstNumber,
          cin: p.cin,
        }))}
        onSubmit={(master, commissions, documents) => {
          const res = partnersDb.createPartner({ ...master, submit: true, skipValidation: true });
          if (res.success && res.data) {
            const partnerId = res.data.id;
            commissions.forEach((c) =>
              partnersDb.setCommission(partnerId, {
                partnerId,
                product: c.product,
                tierMetric: c.tierMetric,
                commissionType: c.commissionType,
                effectiveFrom: c.effectiveFrom,
                status: 'Active',
                tiers: c.tiers,
              })
            );
            documents.forEach((d) =>
              partnersDb.addDocument(partnerId, {
                documentType: d.type,
                fileName: d.fileName,
                fileUrl: '#',
                uploadedBy: 'U1001',
              })
            );
          }
        }}
      />

      {/* Commission Editor Modal */}
      <CommissionEditorModal
        isOpen={commissionEditorPartnerId !== null}
        onClose={() => setCommissionEditorPartnerId(null)}
        partner={partners.find((p) => p.id === commissionEditorPartnerId) || null}
        userRole={currentRole === 'head' ? 'head' : 'maker'}
        hasPendingRequest={
          (partners.find((p) => p.id === commissionEditorPartnerId)?.commissionChangeRequests || [])
            .some((r) => r.status === 'Pending')
        }
        onSave={(partnerId, slabCommissions) => {
          setPartners((prev) =>
            prev.map((p) => {
              if (p.id !== partnerId) return p;

              if (currentRole === 'head') {
                // Head applies directly
                return {
                  ...p,
                  commissionSlabs: slabCommissions,
                  commissions: slabCommissions.map((c) => ({
                    product: c.product,
                    type: c.commissionType,
                    value: c.slabs[0]?.value ?? 0,
                  })),
                };
              }

              // Maker (BDE/TL) submits a change request for Head approval
              const request = {
                id: `ccr_${Date.now()}`,
                partnerId,
                status: 'Pending' as const,
                existingTerms: p.commissionSlabs || [],
                proposedTerms: slabCommissions,
                requestedBy: currentRole === 'bde' ? 'BDE User' : 'Team Lead',
                requestedByRole: (currentRole === 'bde' ? 'BDE' : 'TL') as 'BDE' | 'TL',
                requestedAt: new Date().toISOString(),
              };
              return {
                ...p,
                commissionChangeRequests: [...(p.commissionChangeRequests || []), request],
              };
            })
          );
        }}
      />

      {/* Team Onboarding Modal */}
      <TeamOnboardingModal
        isOpen={isTeamOnboardingOpen}
        onClose={() => setIsTeamOnboardingOpen(false)}
        onCreateTeamMember={handleCreateTeamMember}
        currentUserRole={currentRole === 'head' ? ('Head' as any) : 'Team Lead'}
        currentUserId="user_001"
        currentUserName={currentRole === 'head' ? 'Head User' : 'Manager Virendra'}
        locationId="loc_001"
        locationName="Delhi NCR"
        managerId="mgr_001"
        managerName="Manager Virendra"
        availableManagers={[
          { id: 'mgr_001', name: 'Manager Virendra' },
          { id: 'mgr_002', name: 'Manager Rajesh' },
          { id: 'mgr_003', name: 'Manager Priya' },
        ]}
      />
    </div>
  );
}
