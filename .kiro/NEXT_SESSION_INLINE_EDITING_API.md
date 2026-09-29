# Next Session: Wire Up Inline Editing to API

**Current Status:** ✅ UI Implementation Complete  
**Next Step:** Connect to LeadsDatabase API  
**Estimated Time:** 30-60 minutes

## What's Done

The inline editing feature is fully implemented in LeadTable:
- ✅ Click on Lead Status badge to edit
- ✅ Click on Journey Stage badge to edit
- ✅ Click on Calling Status badge to edit
- ✅ Dropdowns appear with all valid options
- ✅ Selection fires `onUpdateLead` callback
- ✅ All TypeScript types are correct
- ✅ Build passes with 0 errors

## What Needs to be Done

Wire up the `onUpdateLead` callback to actually call the LeadsDatabase API and update the leads.

## Implementation Plan

### Step 1: Import LeadsDatabase

In the component that renders `<LeadTable>` (likely RmDashboard, TeamLeadDashboard, etc.):

```typescript
import { LeadsDatabase } from '../api/leadsApi';

// Create instance (or use singleton if you have one)
const leadsDb = new LeadsDatabase();
```

### Step 2: Implement onUpdateLead Handler

```typescript
const handleUpdateLead = async (updatedLead: StudentLead) => {
  try {
    // Show loading state (optional)
    setIsLoading(true);
    
    // Call API to update lead
    const result = await leadsDb.updateLeadProfile(updatedLead.id, {
      // Pass only the fields that changed
      // For status update:
      leadStatus: updatedLead.leadStatus,
      // For stage update:
      journeyStage: updatedLead.journeyStage,
      // For calling status:
      callingStatus: updatedLead.callingStatus,
    });
    
    // Update local state with result from API
    setLeads(leads.map(l => l.id === result.id ? result : l));
    
    // Show success notification
    showNotification('Lead updated successfully', 'success');
    
  } catch (error) {
    // Show error notification
    showNotification(`Failed to update lead: ${error.message}`, 'error');
    
    // Optionally revert UI change
    // setLeads([...originalLeads]);
    
  } finally {
    setIsLoading(false);
  }
};
```

### Step 3: Pass Handler to LeadTable

```typescript
<LeadTable
  leads={leads}
  onSelectLead={handleSelectLead}
  onInitiateCall={handleInitiateCall}
  onQuickLogOutcome={handleQuickLogOutcome}
  onUpdateLead={handleUpdateLead}  // ← Add this line
  // ... other props
/>
```

## API Methods Reference

### Update Lead Status
```typescript
// Method doesn't exist yet - use updateLeadProfile
await leadsDb.updateLeadProfile(leadId, {
  leadStatus: 'Active' | 'Closed' | 'Archived'
});
```

### Update Journey Stage
```typescript
await leadsDb.updateLeadProfile(leadId, {
  journeyStage: 'Counseling' | 'Application' | ...
});
```

### Update Calling Status
```typescript
// Method doesn't exist yet - need to add or use updateLeadProfile
await leadsDb.updateLeadProfile(leadId, {
  callingStatus: 'Not Attempted' | 'Callback Scheduled' | ...
});
```

## Check LeadsDatabase API

First, verify which update methods exist in `src/api/leadsApi.ts`:

```typescript
// Open the file and look for methods like:
- updateLeadProfile()
- updateLeadStatus()
- updateCallingStatus()
- updateLead()
- etc.
```

If methods don't exist for all three fields, you may need to:
1. Add new methods to LeadsDatabase
2. Or use a generic update method if available

## Enhancement: Show Loading State

While API call is in progress, you can disable the dropdown:

```typescript
const handleUpdateLead = async (updatedLead: StudentLead) => {
  try {
    // Disable editing while updating
    setEditingCell(null);
    setIsUpdating(true);
    
    const result = await leadsDb.updateLeadProfile(...);
    
    // Update UI
    setLeads(leads.map(l => l.id === result.id ? result : l));
    
  } finally {
    setIsUpdating(false);
  }
};
```

Then in LeadTable:

```typescript
<LeadTable
  leads={leads}
  onUpdateLead={isUpdating ? undefined : handleUpdateLead}
  // Disable editing during update
/>
```

## Enhancement: Optimistic Updates

Show change immediately in UI, revert if API fails:

```typescript
const handleUpdateLead = async (updatedLead: StudentLead) => {
  // Optimistic update - show new value immediately
  setLeads(leads.map(l => l.id === updatedLead.id ? updatedLead : l));
  
  try {
    // Then confirm with API
    const result = await leadsDb.updateLeadProfile(...);
    
    // Update with API response (in case there are side effects)
    setLeads(leads.map(l => l.id === result.id ? result : l));
    
  } catch (error) {
    // Revert on error
    setLeads(leads);
    showNotification(`Failed to update lead: ${error.message}`, 'error');
  }
};
```

## Testing Checklist

After implementing API integration:

- [ ] Can click cell to edit
- [ ] Selecting value from dropdown triggers API call
- [ ] Lead updates in database
- [ ] UI updates with new value
- [ ] Can edit multiple leads in sequence
- [ ] Error handling works if API fails
- [ ] Loading state shows during update (if implemented)
- [ ] No console errors or warnings
- [ ] All three column types work (Status, Stage, Calling)

## Debugging Tips

### If update doesn't work:

1. **Check browser console** for errors
   ```javascript
   // Add logging in handler
   console.log('Updating lead:', updatedLead);
   console.log('API response:', result);
   ```

2. **Verify LeadsDatabase method exists**
   ```typescript
   // Look in src/api/leadsApi.ts for available methods
   // Search for: updateLeadProfile, updateLead, etc.
   ```

3. **Check network tab** (if using HTTP API)
   - Verify request is being sent
   - Check request payload is correct
   - Check response status

4. **Add debug breakpoints**
   ```typescript
   const handleUpdateLead = async (updatedLead) => {
     debugger; // ← Pauses here
     const result = await leadsDb.updateLeadProfile(...);
   };
   ```

## Possible Issues & Solutions

| Issue | Solution |
|-------|----------|
| "updateLeadProfile not found" | Search LeadsDatabase for correct method name |
| Update works but UI doesn't change | Check state is being set with new value |
| Old value shows again | Verify API response has correct data |
| Multiple updates conflict | Use optimistic updates or disable during update |
| Console errors about types | Check StudentLead interface for field types |

## Code Example: Complete Implementation

```typescript
// In RmDashboard.tsx or similar
import { useState } from 'react';
import { StudentLead } from '../types';
import { LeadsDatabase } from '../api/leadsApi';
import { LeadTable } from './LeadTable';

export const RmDashboard = () => {
  const [leads, setLeads] = useState<StudentLead[]>([]);
  const [isUpdating, setIsUpdating] = useState(false);
  const leadsDb = new LeadsDatabase();

  const handleUpdateLead = async (updatedLead: StudentLead) => {
    try {
      setIsUpdating(true);
      
      // Optimistic update
      setLeads(leads.map(l => 
        l.id === updatedLead.id ? updatedLead : l
      ));
      
      // Confirm with API
      const result = await leadsDb.updateLeadProfile(
        updatedLead.id,
        {
          leadStatus: updatedLead.leadStatus,
          journeyStage: updatedLead.journeyStage,
          callingStatus: updatedLead.callingStatus,
        }
      );
      
      // Update with response
      setLeads(leads.map(l => 
        l.id === result.id ? result : l
      ));
      
      console.log('✅ Lead updated:', result);
      
    } catch (error) {
      console.error('❌ Update failed:', error);
      // Revert optimistic update
      setLeads(leads);
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <LeadTable
      leads={leads}
      onUpdateLead={handleUpdateLead}
      // ... other props
    />
  );
};
```

## Next Steps After API Integration

1. **Add loading spinner** during API call
2. **Add success/error notifications**
3. **Add form validation** before allowing certain transitions
4. **Add keyboard support** (Escape to cancel, Enter to confirm)
5. **Extend to more columns** (Priority, Assignment, etc.)
6. **Add bulk edit** feature
7. **Add undo/redo** functionality

## Files to Modify

1. **Component using LeadTable** (e.g., RmDashboard.tsx)
   - Import LeadsDatabase
   - Implement handleUpdateLead
   - Pass to LeadTable

2. **src/api/leadsApi.ts** (if needed)
   - Add any missing update methods
   - Ensure all three fields can be updated

## Questions to Ask Before Starting

1. Does LeadsDatabase have methods for all three fields?
2. Should updates be optimistic or wait for API response?
3. Should there be loading state during update?
4. Should edits auto-close when value changes?
5. Should there be validation (e.g., status transition rules)?

## Success Criteria

✅ User clicks cell  
✅ Selects new value  
✅ API is called with updated lead  
✅ Database is updated  
✅ UI shows new value  
✅ No errors in console  
✅ Can repeat for multiple leads  

---

**Estimated Implementation Time:** 30-60 minutes  
**Difficulty Level:** Easy (straightforward callback wiring)  
**Code Changes:** ~20 lines in parent component

Good luck! The inline editing UI is ready - just needs the API connection. 🚀
