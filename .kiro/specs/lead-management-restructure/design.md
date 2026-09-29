# Lead Management System Restructuring - Technical Design

## Overview

This document provides the technical implementation design for restructuring the monolithic `StudentLead` object into a normalized database schema with 12 specialized tables. The restructuring enables cleaner separation of concerns, improved data organization, and UI sections aligned with business workflows.

### Current State Problem

The existing `StudentLead` type combines:
- Lead core identification (name, contact, source)
- Study plan and journey stage
- Academic history and test scores
- Financial profile and funding plan
- Assignment and ownership history
- Calling activity and SLA tracking
- Product opportunities and transactions
- Audit trails and notes

This monolithic approach creates tight coupling, difficult maintenance, and complex UI components.

### Target State Solution

Split `StudentLead` into 12 specialized tables with clear relationships and separation of concerns.



---

## Data Model Design

### Core Tables & Relationships

```
lead_master (core identification)
  ├── lead_profile (1:1) - Study plan & journey
  ├── lead_academic (1:1) - Education history  
  ├── lead_financial (1:1) - Funding & co-applicant
  ├── lead_assignment (1:many) - Ownership history
  ├── lead_qualification (1:many) - Qualification records
  ├── lead_call (1:many) - Call history (immutable)
  ├── lead_product_opportunity (1:many) - Products
  │   └── lead_transaction (1:many) - Sales
  ├── lead_document (1:many) - Files
  ├── lead_activity (1:many) - Audit log (immutable)
  ├── lead_priority (1:many) - Priority history
  └── lead_status_history (1:many) - Status changes (immutable)
```

### Table Descriptions

| Table | Purpose | Cardinality | Mutable |
|-------|---------|-------------|---------|
| lead_master | Current lead snapshot | 1 per lead | Yes (updated_at) |
| lead_profile | Study plan details | 1:1 | Yes |
| lead_academic | Education & tests | 1:1 | Yes |
| lead_financial | Funding & co-applicant | 1:1 | Yes |
| lead_assignment | Assignment history | 1:many | No (status only) |
| lead_qualification | Qualification attempts | 1:many | No (immutable) |
| lead_call | Call history | 1:many | No (immutable) |
| lead_product_opportunity | Product pipeline | 1:many | Yes (status updates) |
| lead_transaction | Completed sales | 1:many | No (immutable) |
| lead_document | File repository | 1:many | Yes |
| lead_activity | Audit log | 1:many | No (immutable) |
| lead_priority | Priority history | 1:many | No (immutable) |

### Key TypeScript Interfaces

```typescript
// Lead_Master - Core identification (never changes after creation)
interface LeadMaster {
  lead_id: string; // L000001 - PRIMARY KEY
  student_name: string;
  mobile_number: string; // UNIQUE normalized
  mobile_country_code: string; // Default: '91'
  email?: string;
  source_code: string; // Partner/channel
  partner_code?: string;
  bde_code?: string;
  current_lead_status: LeadStatus;
  is_duplicate?: boolean;
  created_at: string; // Immutable
  updated_at: string; // Auto-updated
}

// Lead_Profile - Study plan (frequently updated)
interface LeadProfile {
  profile_id: string; // PRIMARY KEY
  lead_id: string; // FK to LeadMaster
  final_country?: string;
  universities_of_interest: string[];
  final_university?: string;
  degree_type?: 'Bachelor\'s' | 'Master\'s' | 'PhD' | 'Diploma' | 'Other';
  course_name?: string;
  target_intake?: string; // e.g. 'Fall 2024'
  tests_interested_in: string[];
  journey_stage: JourneyStage;
  readiness_passport_valid: boolean;
  readiness_admit_letter_received: boolean;
  readiness_funding_ready: boolean;
  readiness_english_test_passed: boolean;
  updated_at: string;
  updated_by: string;
}

// Lead_Call - Call history (immutable)
interface LeadCall {
  call_id: string; // PRIMARY KEY
  lead_id: string; // FK
  called_at: string; // ISO timestamp
  called_by: string; // RM name
  call_duration_seconds: number;
  call_status: 'Not Attempted' | 'Connected' | 'RNR' | 'Switch Off' | 'Busy' | 'Callback Scheduled' | 'Not Interested' | 'Invalid Number';
  call_outcome: 'Connected' | 'Converted' | 'Deferred' | 'RNR' | 'Switch Off' | 'Busy' | 'Callback Requested' | 'Not Interested' | 'Invalid Number' | 'Other';
  call_notes?: string;
  scheduled_next_call_at?: string;
  attempt_number: number; // Counter
  created_at: string; // Immutable
}

// Lead_Activity - Audit log (immutable)
interface LeadActivity {
  activity_id: string; // PRIMARY KEY
  lead_id: string; // FK
  timestamp: string; // ISO - immutable
  actor: string; // User or 'System'
  activity_type: 'call' | 'stage_change' | 'product_update' | 'assignment' | 'qualification' | 'profile_update' | 'document_upload' | 'system' | 'note_added';
  title: string;
  description: string;
  related_id?: string; // Links to Call/Assignment/Product ID
  created_at: string; // Immutable
}
```

---

## API Endpoint Structure

### REST Endpoints by Domain

**Lead CRUD**
```
GET    /api/leads
POST   /api/leads
GET    /api/leads/:leadId
PUT    /api/leads/:leadId
DELETE /api/leads/:leadId (archive)
```

**Lead Sections**
```
GET    /api/leads/:leadId/profile
PUT    /api/leads/:leadId/profile

GET    /api/leads/:leadId/academic
PUT    /api/leads/:leadId/academic

GET    /api/leads/:leadId/financial
PUT    /api/leads/:leadId/financial

GET    /api/leads/:leadId/calls
POST   /api/leads/:leadId/calls

GET    /api/leads/:leadId/products
POST   /api/leads/:leadId/products
PUT    /api/leads/:leadId/products/:opportunityId

GET    /api/leads/:leadId/documents
POST   /api/leads/:leadId/documents (upload)
PATCH  /api/leads/:leadId/documents/:documentId/share

GET    /api/leads/:leadId/activity
```

### Backward Compatibility

```
GET    /api/leads/:leadId?format=legacy
       ↓ Returns reconstructed StudentLead object
       ↓ JOINs all normalized tables
       ↓ Used during UI migration phase
       ↓ Logs deprecation warning
```

---

## Component Refactoring Strategy

### Current LeadDetailView Issues

- 929 lines in single file
- 6+ logical concerns mixed together
- Complex state management
- Difficult to test sections independently
- Hard to modify without side effects

### New Component Structure

```
LeadDetailView (Container)
  ├── LeadHeader (sticky)
  │   ├── Back, ID, Name
  │   ├── Unsaved Indicator
  │   ├── Call Button
  │   └── Assign Button
  │
  ├── LeadSidebar (section menu)
  │   ├── Profile
  │   ├── Academic
  │   ├── Financial
  │   ├── Documents
  │   ├── Calling
  │   ├── Products
  │   └── Active Products List
  │
  └── LeadContent (section display)
      ├── LeadProfileSection
      ├── LeadAcademicSection
      ├── LeadFinancialSection
      ├── LeadDocumentsSection
      ├── LeadCallingSection
      └── LeadProductsSection
```

### New Section Components

**LeadProfileSection**
- Displays: Name, Phone, Email, Country, University, Intake, Journey Stage, Readiness Checklist
- Queries: GET /api/leads/{id}/profile
- Updates: PATCH /api/leads/{id}/profile
- Handles unsaved changes locally

**LeadAcademicSection**
- Displays: 10th, 12th, UG, PG, Tests, Work Experience, Achievements
- Queries: GET /api/leads/{id}/academic
- Updates: PUT /api/leads/{id}/academic
- Supports multiple test attempts

**LeadCallingSection**
- Displays: Call history table, Total attempts, Last call, Next scheduled call
- Queries: GET /api/leads/{id}/calls
- Updates: POST /api/leads/{id}/calls (new call)
- Shows SLA status and KPI indicator
- Handles "Log Call" and "Schedule Callback" actions

**LeadProductsSection**
- Displays: All 13 master products, Active products with status
- Queries: GET /api/leads/{id}/products
- Updates: POST (add), PUT (status change)
- Quick product toggles

### State Management: Context API

```typescript
// LeadContext provides:
export interface LeadContextType {
  lead: LeadMaster | null;
  profile: LeadProfile | null;
  calls: LeadCall[];
  products: LeadProductOpportunity[];
  // ... other data
  
  updateProfile: (updates: Partial<LeadProfile>) => Promise<void>;
  logCall: (callData: Partial<LeadCall>) => Promise<void>;
  addProduct: (product: MasterProduct) => Promise<void>;
  // ... other mutations
}

// Each section uses:
const context = useContext(LeadContext);
const { lead, profile, updateProfile } = context;

// Local draft state in each section:
const [draft, setDraft] = useState(profile);
const isDirty = JSON.stringify(draft) !== JSON.stringify(profile);
```

### Unsaved Changes Pattern

```typescript
// In each section component:
const useLeadSection = <T,>(
  initialData: T,
  onSave: (updates: T) => Promise<void>
) => {
  const [draft, setDraft] = useState(initialData);
  const isDirty = JSON.stringify(draft) !== JSON.stringify(initialData);
  
  const handleSave = async () => {
    await onSave(draft);
    // Parent context automatically updates initialData
  };
  
  return { draft, setDraft, isDirty, handleSave };
};
```

---

## Correctness Properties

*A property is a characteristic or behavior that should hold true across all valid executions of a system—essentially, a formal statement about what the system should do.*

### Property 1: Lead ID Uniqueness
For all leads created, each lead_id SHALL uniquely identify exactly one Lead_Master record.
**Validates: Requirements 1.1, 23.1-23.4**

### Property 2: Mobile Number Duplicate Detection  
For any two leads with identical normalized mobile numbers, the second SHALL be rejected as duplicate.
**Validates: Requirements 1.2, 23.2**

### Property 3: Lead Profile Round-Trip
For any Lead_Profile stored and retrieved, all fields SHALL be preserved without loss or transformation.
**Validates: Requirements 2.1, 31.1**

### Property 4: Profile Update Activity Logging
For any Lead_Profile update, a corresponding Lead_Activity record SHALL be created within 1 second.
**Validates: Requirements 2.2, 11.2**

### Property 5: Academic Data Persistence
For any Lead_Academic created, retrieving SHALL return exact same data as stored.
**Validates: Requirements 3.1, 31.1**

### Property 6: Multiple Test Attempts
For any Lead_Academic with multiple test_records, retrieving SHALL preserve all records in correct order.
**Validates: Requirements 3.2**

### Property 7: Single Active Assignment Invariant
For all leads, count(active_assignments) SHALL be at most 1.
**Validates: Requirements 5.2, 8**

### Property 8: Call Record Immutability
For any Lead_Call created, no updates or deletes SHALL be permitted (only create corrected records).
**Validates: Requirements 7.1, 26.1**

### Property 9: Call Attempt Counter Increment
For any Lead_Call created, the lead's attempt counter SHALL increment by exactly 1 (atomically).
**Validates: Requirements 7.2**

### Property 10: Single Qualified Status Per Lead
For all leads, count(qualifications where status='Qualified') SHALL be at most 1.
**Validates: Requirements 6.3**

### Property 11: SLA 48-Hour Calculation
For any lead, SLA_Due_At SHALL equal Created_At + 48h (new leads) or Last_Call_At + 48h (contacted leads).
**Validates: Requirements 15.1, 23**

### Property 12: Product to Transaction Linking
For any Lead_Product_Opportunity with status='Completed/Sold', a corresponding Lead_Transaction SHALL exist within 1 second.
**Validates: Requirements 8.4, 9.2**

### Property 13: Activity Log Immutability
For any Lead_Activity created, no updates or deletes SHALL be permitted.
**Validates: Requirements 11.3**

### Property 14: Activity Query Ordering
For any activity query, results SHALL be sorted in reverse chronological order (newest first).
**Validates: Requirements 11.4**

### Property 15: Lead Status Transition Validity
For any Lead_Status change, the transition SHALL be in allowed set; invalid transitions SHALL error.
**Validates: Requirements 13.1-13.8, 24.1**

---

## Error Handling

### Validation

```typescript
// Required field validation
- lead_id format (L000001)
- mobile_number format (10-15 digits)
- email format (optional but validated if present)
- journey_stage in enum
- lead_status in enum
```

### Concurrency & Atomicity

All multi-table operations use database transactions:
```typescript
BEGIN TRANSACTION
  INSERT lead_master
  INSERT lead_profile  
  INSERT lead_financial
  INSERT lead_activity
COMMIT OR ROLLBACK
```

### Call Logging Error Scenarios

- **DuplicateCallError**: Call already logged (409 Conflict)
- **InvalidCallStatusError**: Invalid status value (400 Bad Request)
- **LeadNotFoundError**: Lead doesn't exist (404 Not Found)
- **SLACalculationError**: Non-blocking, logs warning (201 with partial_error)

### Migration Error Handling

- Validate all required fields before migration
- Skip invalid records with warnings
- Provide rollback capability
- Create backup of original StudentLead table

---

## Testing Strategy

### Unit Tests + Property-Based Tests

**Unit Tests** (specific examples):
- Creating lead with minimal fields
- Updating profile when journey stage is 'Visa'  
- Logging call with scheduled callback
- Rejecting invalid call status

**Property Tests** (universal properties):
- For all leads, mobile duplicate detection works
- For all calls, immutability maintained
- For all assignments, max 1 active
- For all qualifications, valid transitions only

### Test Configuration

Framework: **Vitest + fast-check**
```bash
npm install --save-dev vitest fast-check
```

Minimum iterations per property test: **100**

Tag format:
```typescript
// Feature: lead-management-restructure, Property N: [description]
await fc.assert(fc.asyncProperty(...), { numRuns: 100 });
```

### Coverage Targets

| Component | Unit | Property | Target |
|-----------|------|----------|--------|
| Lead Master | 8-12 | 2-3 | 95% |
| Lead Profile | 6-10 | 2-3 | 90% |
| Lead Call | 10-15 | 3-4 | 95% |
| Lead Assignment | 8-12 | 2-3 | 95% |
| SLA Calculation | 6-10 | 2-3 | 95% |
| Data Migration | 8-12 | 2 | 90% |

---

## Database Migration Strategy

### Phase 1: Schema Creation
Create all normalized tables with FK constraints and indexes.

### Phase 2: Data Migration Script
```
FOR EACH existing StudentLead:
  BEGIN TRANSACTION
    CREATE lead_master row
    CREATE lead_profile row
    CREATE lead_academic row
    CREATE lead_financial row
    MIGRATE assignments → lead_assignment
    MIGRATE calls → lead_call
    MIGRATE products → lead_product_opportunity
    CREATE initial lead_activity (migration marker)
  COMMIT
```

### Phase 3: Backward Compatibility
Provide `/api/leads/:id?format=legacy` endpoint that reconstructs StudentLead from normalized tables.

### Phase 4: Rollback Strategy
Keep StudentLead table as backup. If needed:
1. Stop application
2. Restore from backup
3. Drop normalized tables
4. Restart with old code

---

## SLA & KPI Implementation

### SLA Calculation

```typescript
// New leads: SLA_Due_At = Created_At + 48 hours
// After contact: SLA_Due_At = Last_Call_At + 48 hours
// if (now > SLA_Due_At) → is_overdue = true

// Escalation triggers if overdue
```

### KPI Status

- **On Track**: Last contacted within SLA window
- **Overdue**: No contact or call but SLA breached
- Hot leads: Strict 48-hour enforcement
- Warm leads: Standard enforcement after 60 min overdue
- Cold leads: Informational only

---

## Document Management

### Upload Flow
1. Validate file size (max 50MB)
2. Scan for viruses (async, non-blocking)
3. Generate secure file path
4. Upload to storage
5. Create Lead_Document record
6. Create Lead_Activity entry

### Sharing Audit Trail
- Log share date and recipient
- Create separate audit records
- Track who shared with whom and when

---

## Key Design Decisions

| Decision | Rationale | Trade-off |
|----------|-----------|-----------|
| Normalized schema | Clear separation of concerns | More complex queries |
| Lead_Master separate from Profile | Different update patterns | Extra table lookups |
| Immutable audit tables | Compliance & auditability | Larger database |
| Context API (not Redux) | Simpler, no dependencies | Not as scalable |
| Backward compatibility endpoint | Safe gradual migration | Extra API endpoint |
| Activity log for all mutations | Full audit trail | Performance overhead |

---

## Implementation Timeline

- **Week 1-2**: Database schema & migration script
- **Week 2-3**: Backend REST APIs & SLA logic  
- **Week 3-4**: Frontend section components
- **Week 4-5**: Migration testing & UAT
- **Week 5-6**: Gradual rollout & monitoring

---

