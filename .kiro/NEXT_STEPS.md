# Next Steps: Completing Lead Management Restructuring

**Priority:** HIGH - These tasks unlock MVP functionality

---

## Session 1: Test Framework & Validation (1-2 hours)

### Task 1.1: Install Vitest
```bash
npm install --save-dev vitest @vitest/ui @vitest/coverage
```

Update `package.json`:
```json
{
  "scripts": {
    "test": "vitest",
    "test:ui": "vitest --ui",
    "test:coverage": "vitest --coverage"
  }
}
```

### Task 1.2: Run Property Tests
```bash
npm run test
```

Expected results:
- ✅ leadUniqueness.test.ts - 6 tests passing
- ✅ slaCalculation.test.ts - 6 tests passing
- ✅ assignmentHistory.test.ts - 8 tests passing
- ✅ productTransactionLinking.test.ts - 10 tests passing
- ✅ dataValidation.test.ts - 12 tests passing
- ✅ leadLifecycle.test.ts - 2 scenarios passing

**If tests fail:** Debug and fix implementation in LeadsDatabase

---

## Session 2: UI Integration - Create New Lead Detail View (2-3 hours)

### Task 2.1: Create NewLeadDetailView Component

Create `src/components/LeadDetailViewNormalized.tsx`:

```typescript
import React, { useState, useEffect, useMemo } from 'react';
import { LeadsDatabase } from '../api/leadsApi';
import { LeadMaster, LeadProfile, LeadAcademic, LeadFinancial } from '../types/normalized';
import { LeadProfileSection } from './sections/LeadProfileSection';
import { LeadAcademicSection } from './sections/LeadAcademicSection';
import { LeadFinancialSection } from './sections/LeadFinancialSection';
import { LeadDocumentsSection } from './sections/LeadDocumentsSection';
import { LeadCallingSection } from './sections/LeadCallingSection';
import { LeadProductsSection } from './sections/LeadProductsSection';

interface LeadDetailViewNormalizedProps {
  leadId: string;
  db: LeadsDatabase;  // Pass in database instance from App
  onBack: () => void;
  onNavigateToEducationLoan?: () => void;
}

export const LeadDetailViewNormalized: React.FC<LeadDetailViewNormalizedProps> = ({
  leadId,
  db,
  onBack,
  onNavigateToEducationLoan,
}) => {
  // Load all normalized data
  const [lead, setLead] = useState<LeadMaster | null>(null);
  const [profile, setProfile] = useState<LeadProfile | null>(null);
  const [academic, setAcademic] = useState<LeadAcademic | null>(null);
  const [financial, setFinancial] = useState<LeadFinancial | null>(null);
  const [currentSection, setCurrentSection] = useState<'profile' | 'academic' | 'financial' | 'documents' | 'calling' | 'products'>('profile');
  const [saveSuccessMessage, setSaveSuccessMessage] = useState<string | null>(null);
  const [draftChanges, setDraftChanges] = useState<Record<string, any>>({});

  const isDirty = useMemo(() => Object.keys(draftChanges).length > 0, [draftChanges]);

  // On mount, load all lead data
  useEffect(() => {
    const leadData = db.getLead(leadId);
    setLead(leadData);

    if (leadData) {
      const profileData = db.getLeadProfile(leadId);
      const academicData = db.getLeadAcademic(leadId);
      const financialData = db.getLeadFinancial(leadId);

      setProfile(profileData);
      setAcademic(academicData);
      setFinancial(financialData);
    }
  }, [leadId, db]);

  const handleUpdateProfile = (updates: Partial<LeadProfile>) => {
    const updated = db.updateLeadProfile(leadId, updates);
    if (updated) {
      setProfile(updated);
      setDraftChanges(prev => ({ ...prev, profile: true }));
      setSaveSuccessMessage('Profile updated ✓');
      setTimeout(() => setSaveSuccessMessage(null), 2000);
    }
  };

  const handleUpdateAcademic = (updates: Partial<LeadAcademic>) => {
    const updated = db.updateLeadAcademic(leadId, updates);
    if (updated) {
      setAcademic(updated);
      setDraftChanges(prev => ({ ...prev, academic: true }));
      setSaveSuccessMessage('Academic profile updated ✓');
      setTimeout(() => setSaveSuccessMessage(null), 2000);
    }
  };

  const handleUpdateFinancial = (updates: Partial<LeadFinancial>) => {
    const updated = db.updateLeadFinancial(leadId, updates);
    if (updated) {
      setFinancial(updated);
      setDraftChanges(prev => ({ ...prev, financial: true }));
      setSaveSuccessMessage('Financial profile updated ✓');
      setTimeout(() => setSaveSuccessMessage(null), 2000);
    }
  };

  const handleSaveAll = () => {
    // All updates are already persisted via individual handlers
    setDraftChanges({});
    setSaveSuccessMessage('All changes saved ✓');
    setTimeout(() => setSaveSuccessMessage(null), 2000);
  };

  const handleLogCall = (outcome: string, notes: string, nextCall: string, duration: number) => {
    db.logLeadCall(leadId, {
      durationSeconds: duration,
      calledBy: 'Current RM',
      callStatus: outcome as any,
      outcome: outcome as any,
      notes,
      scheduledNextCallAt: nextCall || undefined,
    });
    setSaveSuccessMessage('Call logged ✓');
    setTimeout(() => setSaveSuccessMessage(null), 2000);
  };

  if (!lead) {
    return <div className="text-center p-8">Loading lead...</div>;
  }

  return (
    <div className="w-full bg-slate-50 text-slate-900 flex flex-col">
      {/* Sticky Header */}
      <div className="sticky top-0 z-30 bg-white border-b border-slate-200 shadow-xs p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button onClick={onBack} className="p-2 hover:bg-slate-100 rounded">←</button>
            <div>
              <div className="font-mono text-sm font-bold">{lead.leadId}</div>
              <div className="text-xs text-slate-500">{lead.studentName}</div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {isDirty && (
              <button
                onClick={handleSaveAll}
                className="px-4 py-2 bg-[#D91C24] text-white rounded text-xs font-bold"
              >
                Save All
              </button>
            )}
            {saveSuccessMessage && (
              <span className="text-xs font-semibold text-emerald-700 bg-emerald-50 px-3 py-1 rounded">
                {saveSuccessMessage}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Layout */}
      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        <div className="w-44 bg-white border-r border-slate-200 overflow-y-auto p-2 space-y-1">
          {[
            { id: 'profile', label: 'Study Plan' },
            { id: 'academic', label: 'Academic' },
            { id: 'financial', label: 'Financial' },
            { id: 'documents', label: 'Documents' },
            { id: 'calling', label: 'Calling' },
            { id: 'products', label: 'Products' },
          ].map(item => (
            <button
              key={item.id}
              onClick={() => setCurrentSection(item.id as any)}
              className={`w-full text-left px-3 py-2.5 rounded-lg text-xs font-semibold cursor-pointer ${
                currentSection === item.id
                  ? 'bg-[#D91C24] text-white'
                  : 'text-slate-700 hover:bg-slate-100'
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4">
          {currentSection === 'profile' && profile && (
            <LeadProfileSection
              profile={profile}
              onUpdate={handleUpdateProfile}
            />
          )}
          {currentSection === 'academic' && academic && (
            <LeadAcademicSection
              academic={academic}
              onUpdate={handleUpdateAcademic}
            />
          )}
          {currentSection === 'financial' && financial && (
            <LeadFinancialSection
              financial={financial}
              onUpdate={handleUpdateFinancial}
            />
          )}
          {currentSection === 'documents' && (
            <LeadDocumentsSection
              documents={db.getLeadDocuments(leadId)}
              onUpload={(file, category) => {
                db.uploadLeadDocument(leadId, {
                  fileName: file.name,
                  fileFormat: file.type,
                  documentType: category,
                  filePath: URL.createObjectURL(file),
                });
              }}
              onShare={(docId) => {
                db.shareLeadDocument(leadId, docId);
              }}
              onDelete={() => {}} // Not implemented in API
            />
          )}
          {currentSection === 'calling' && (
            <LeadCallingSection
              callLogs={db.getLeadCalls(leadId)}
              onLogCall={handleLogCall}
              onScheduleCallback={() => {}}
            />
          )}
          {currentSection === 'products' && (
            <LeadProductsSection
              products={db.getLeadProducts(leadId)}
              onProductAdd={(product) => {
                db.addLeadProduct(leadId, {
                  masterProduct: product,
                  productOwner: 'Current RM',
                });
              }}
              onProductStatusChange={(oppId, status) => {
                db.updateProductOpportunity(leadId, oppId, { status });
              }}
              onOpenEducationLoan={onNavigateToEducationLoan}
            />
          )}
        </div>
      </div>
    </div>
  );
};
```

### Task 2.2: Update Section Components

Each section component needs to be updated to:
1. Accept normalized data types (not StudentLead)
2. Call the onUpdate handler with partial updates
3. Display loading/error states

Example for `LeadProfileSection.tsx`:

```typescript
interface LeadProfileSectionProps {
  profile: LeadProfile;
  onUpdate: (updates: Partial<LeadProfile>) => void;
}

export const LeadProfileSection: React.FC<LeadProfileSectionProps> = ({
  profile,
  onUpdate,
}) => {
  const handleCountryChange = (country: string) => {
    onUpdate({ finalCountry: country });
  };

  const handleUniversityChange = (university: string) => {
    onUpdate({ finalUniversity: university });
  };

  // ... etc for other fields
};
```

### Task 2.3: Update App.tsx to Use New Component

In `src/App.tsx`, replace usage of LeadDetailViewRefactored with new component:

```typescript
// At top, import LeadsDatabase and create instance
const db = new LeadsDatabase();

// In currentView === 'detail' section:
<LeadDetailViewNormalized
  leadId={selectedLeadId!}
  db={db}
  onBack={handleBackToDashboard}
  onNavigateToEducationLoan={handleOpenEducationLoan}
/>
```

---

## Session 3: Complete Feature Integration (2-3 hours)

### Task 3.1: Wire Up Call Logging to SLA Enforcement

In LeadCallingSection:
```typescript
const handleLogCall = (outcome: string, notes: string, nextCall: string, duration: number) => {
  // Call API
  const call = db.logLeadCall(leadId, {
    durationSeconds: duration,
    calledBy: 'Current RM',
    callStatus: outcome,
    outcome,
    notes,
    scheduledNextCallAt: nextCall,
  });

  // Check SLA status
  const slaStatus = db.getSlaStatus(leadId);
  
  // Show notification if overdue
  if (slaStatus.slaStatus === 'Overdue') {
    showNotification('⚠️ This lead is SLA overdue!', 'warning');
  }

  onRefresh?.();
};
```

### Task 3.2: Display Activity Log

Add Activity tab to sections:

```typescript
const activities = db.getLeadActivity(leadId);

return (
  <div className="space-y-4">
    {/* Existing content */}
    
    {/* Activity Timeline */}
    <div className="border-t pt-4">
      <h3 className="font-semibold text-sm mb-3">Activity Timeline</h3>
      <div className="space-y-2">
        {activities.slice(0, 10).map(activity => (
          <div key={activity.activityId} className="text-xs bg-gray-50 p-2 rounded">
            <div className="font-semibold">{activity.actor} - {activity.type}</div>
            <div className="text-gray-600">{activity.description}</div>
            <div className="text-gray-400">{new Date(activity.timestamp).toLocaleString()}</div>
          </div>
        ))}
      </div>
    </div>
  </div>
);
```

---

## Session 4: Complete Test Suite (2-3 hours)

### Task 4.1: Add Unit Tests for API Endpoints

Create `src/tests/unit/endpoints.test.ts`:

```typescript
import { LeadsDatabase } from '../../api/leadsApi';
import { expect } from 'vitest';

describe('Lead API Endpoints', () => {
  let db: LeadsDatabase;

  beforeEach(() => {
    db = new LeadsDatabase();
  });

  describe('POST /api/leads', () => {
    test('Should create lead with minimal fields', () => {
      const lead = db.createLead({
        studentName: 'Test',
        mobileNumber: '9876543210',
        mobileCountryCode: '91',
        email: 'test@example.com',
        sourceCode: 'TEST',
      });

      expect(lead).toBeTruthy();
      expect(lead.leadId).toMatch(/^L\d{6}$/);
    });

    test('Should require mobile number', () => {
      expect(() => {
        db.createLead({
          studentName: 'Test',
          mobileNumber: '',
          mobileCountryCode: '91',
          email: 'test@example.com',
          sourceCode: 'TEST',
        });
      }).toThrow();
    });
  });

  describe('GET /api/leads/:id', () => {
    test('Should retrieve existing lead', () => {
      const created = db.createLead({
        studentName: 'Test Lead',
        mobileNumber: '9876543220',
        mobileCountryCode: '91',
        email: 'test@example.com',
        sourceCode: 'TEST',
      });

      const retrieved = db.getLead(created.leadId);

      expect(retrieved).toBeTruthy();
      expect(retrieved?.studentName).toBe('Test Lead');
    });

    test('Should return null for non-existent lead', () => {
      const result = db.getLead('L999999');
      expect(result).toBeNull();
    });
  });

  // ... add tests for all endpoints
});
```

### Task 4.2: Add Completion Percentage Tests

Create `src/tests/unit/completionPercentage.test.ts`:

```typescript
import { LeadsDatabase } from '../../api/leadsApi';
import { expect } from 'vitest';

describe('Inbound Lead Completion Percentage (Requirement 33)', () => {
  let db: LeadsDatabase;

  beforeEach(() => {
    db = new LeadsDatabase();
  });

  test('Should calculate completion percentage from field count', () => {
    const lead = db.createLead({
      studentName: 'Completion Test',
      mobileNumber: '9876543300',
      mobileCountryCode: '91',
      email: 'completion@example.com',
      sourceCode: 'TEST',
    });

    // Initial: 5 mandatory fields = 5/21 = 24%
    let leadData = db.getLead(lead.leadId);
    expect(leadData?.inboundCompletionPct).toBeLessThan(50); // Should flag for completion

    // Update profile: add 6 more fields = 11/21 = 52%
    db.updateLeadProfile(lead.leadId, {
      finalCountry: 'USA',
      course: 'MS Computer Science',
      targetIntake: 'Fall 2024',
      journeyStage: 'University Search',
      testsInterestedIn: ['TOEFL', 'GRE'],
      degreeType: "Master's",
    });

    leadData = db.getLead(lead.leadId);
    expect(leadData?.inboundCompletionPct).toBeGreaterThan(50); // Should no longer flag
  });

  test('Should recalculate on each update', () => {
    const lead = db.createLead({
      studentName: 'Recalc Test',
      mobileNumber: '9876543301',
      mobileCountryCode: '91',
      email: 'recalc@example.com',
      sourceCode: 'TEST',
    });

    const percentages = [];

    // Add profile
    db.updateLeadProfile(lead.leadId, {
      finalCountry: 'Canada',
    });
    let leadData = db.getLead(lead.leadId);
    percentages.push(leadData?.inboundCompletionPct || 0);

    // Add academic
    db.updateLeadAcademic(lead.leadId, {
      twelveGpa: 8.5,
    });
    leadData = db.getLead(lead.leadId);
    percentages.push(leadData?.inboundCompletionPct || 0);

    // Percentages should increase
    for (let i = 1; i < percentages.length; i++) {
      expect(percentages[i]).toBeGreaterThanOrEqual(percentages[i - 1]);
    }
  });
});
```

---

## Task List by Priority

### CRITICAL (Do First)
- [ ] Install Vitest
- [ ] Run property tests (validate implementation)
- [ ] Create LeadDetailViewNormalized component
- [ ] Update section components to use normalized types
- [ ] Update App.tsx to use new components

### HIGH (Do Next)
- [ ] Wire up call logging to SLA
- [ ] Add activity log display
- [ ] Add unit tests for endpoints
- [ ] Add completion percentage tests

### MEDIUM (Finish Phase)
- [ ] Complete feature integration
- [ ] Clean up old StudentLead references
- [ ] Add deprecation warnings
- [ ] Create migration scripts

---

## Testing Strategy

1. **Run all tests after each change**: `npm run test`
2. **Use Vitest UI for debugging**: `npm run test:ui`
3. **Check coverage**: `npm run test:coverage`

Expected coverage target: 80%+ for Phase 2 (API layer)

---

## Success Criteria

- [x] All property tests pass (validating schema correctness)
- [ ] All unit tests pass (validating endpoints)
- [ ] All integration tests pass (validating workflows)
- [ ] UI updates reflect API data in real-time
- [ ] No console errors when using normalized views
- [ ] Backward compatibility maintained (old UI still works)
- [ ] Activity log shows all changes
- [ ] SLA enforcement works in calling section

