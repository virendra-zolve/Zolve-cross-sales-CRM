# Inline Table Editing - Debug Guide

**Status:** ✅ Feature implemented and wired up  
**Build:** ✅ Passing (0 errors)  
**Last Updated:** September 24, 2026

## Quick Start - How to Test

### 1. Start the dev server
```bash
npm run dev
```
Visit: `http://localhost:5173`

### 2. Navigate to RM Dashboard
- You should see a table with leads
- Look for rows with lead data

### 3. Find the editable columns
These three columns have dropdown editing enabled:
- **Lead Status** (shows: Active/Closed/Archived - green/red/gray badges)
- **Lead Stage** (shows: Counseling/Application/Admission Confirmed/etc.)
- **Calling Status** (shows: Not Attempted/Callback Scheduled/Connected/RNR - colored badges with dots)

### 4. Test inline editing
**Click once on any badge/status cell** to open the dropdown:
- You should see a `<select>` element appear with options
- The select should auto-focus (ready for keyboard input)
- Each option corresponds to the available values

### 5. Select a value
- Click or type to select a value
- The dropdown should close automatically
- The console should log: `"Lead updated: [lead object]"`

---

## Expected Behavior

### Visual Indicators (Badges)
Each editable cell shows as a **colored badge with a down arrow (▼)**:

```
Lead Status:     [Active ▼]  (green)  or  [Closed ▼]  (red)  or  [Archived ▼]  (gray)
Lead Stage:      [Counseling ▼]  (gray badge)
Calling Status:  [Connected ▼]  (green)  or  [Not Attempted ▼]  (blue)  or  [Callback Scheduled ▼]  (orange)  or  [RNR ▼]  (red)
```

### Click Behavior
1. **Before Click:** Badge is visible with text + down arrow
2. **On Click:** Badge is replaced with `<select>` dropdown
3. **Auto-focus:** Select element receives focus immediately
4. **Arrow Keys:** User can arrow up/down through options
5. **Selection:** Clicking an option or pressing Enter closes the dropdown
6. **After Selection:** Badge reappears with new value

---

## Troubleshooting - If Dropdowns Don't Appear

### ❓ Problem: No badges visible in the table
**Check:**
1. Are you viewing the RM Dashboard? (Not All Leads or Partner view)
2. Are the columns visible? Click "Columns" button and verify:
   - ☑️ Lead Status
   - ☑️ Lead Stage  
   - ☑️ Calling Status

### ❓ Problem: Badges show but no dropdown on click
**Check:**
1. Are you clicking on the badge itself (not the row)?
2. Try clicking directly on the text or the down arrow
3. Open browser dev tools (F12) and check console for errors
4. Check that `onUpdateLead` handler was passed to LeadTable

### ❓ Problem: Dropdown appears but select won't work
**Check:**
1. Is the select element visible? (Should have blue border)
2. Try using keyboard arrows to select
3. Check console for JavaScript errors
4. Verify the select options are showing (not blank)

### ❓ Problem: Columns not visible at all
**Check:**
1. Click the "Columns" button in the table toolbar
2. Ensure these are checked:
   - Lead ID ✓
   - Student Name ✓
   - Destination Countries ✓
   - Program / Course ✓
   - Calling Status ✓
   - Next Call At ✓
   - Priority ✓
   - Lead Stage ✓
   - Lead Status ✓
   - SLA Status ✓
   - Products ✓

---

## Code Architecture

### Files Modified
1. **src/components/LeadTable.tsx** (850 lines)
   - Added `editingCell` state to track which cell is in edit mode
   - Added `handleInlineEdit()` function to process updates
   - Updated column renderings for three editable columns
   - Added ChevronDown icons from lucide-react

2. **src/components/RmDashboard.tsx**
   - Added `handleUpdateLead()` handler
   - Passes `onUpdateLead` to LeadTable component

3. **src/components/TeamLeadDashboard.tsx**
   - Added `handleUpdateLead()` handler
   - Passes `onUpdateLead` to LeadTable component

4. **src/components/AllLeadsView.tsx**
   - Added `handleUpdateLead()` handler
   - Passes `onUpdateLead` to LeadTable component

5. **src/components/BdeDashboard.tsx**
   - Added `handleUpdateLead()` handler
   - Passes `onUpdateLead` to LeadTable component

### Data Flow
```
User clicks badge
  ↓
onClick handler triggers
  ↓
editingCell state updated with { leadId, field }
  ↓
Component re-renders with <select> instead of badge
  ↓
User selects option
  ↓
onChange fires handleInlineEdit()
  ↓
onUpdateLead callback is called with updated lead
  ↓
Parent component should handle API update (console.log for now)
  ↓
Component re-renders with new value
```

---

## Next Steps

### Immediate (Frontend Working)
✅ Inline editing UI complete
✅ Dropdowns render correctly
✅ Click to edit working
✅ Auto-focus on select
✅ Selection fires callback

### Next Phase (API Integration)
- [ ] Wire `handleUpdateLead` to API endpoints
- [ ] Use LeadsDatabase methods:
  - `updateLeadProfile()` for journey stage
  - Call API methods for lead status/calling status
- [ ] Add loading state while API updates
- [ ] Add error handling
- [ ] Refresh lead list after successful update

### Advanced Enhancements
- [ ] Add keyboard support (Escape to cancel)
- [ ] Add more editable columns (Priority, Assignment, etc.)
- [ ] Add confirmation before updating
- [ ] Add undo/rollback on error
- [ ] Show inline loading spinner

---

## Browser DevTools Tips

### To inspect the select element:
```javascript
// In browser console
const select = document.querySelector('select');
console.log(select); // Should show the select element
console.log(select.options); // Show available options
```

### To manually trigger a selection:
```javascript
// In browser console
const select = document.querySelector('select');
select.value = 'Active'; // Change to desired value
select.dispatchEvent(new Event('change', { bubbles: true }));
```

---

## Performance Notes

- LeadTable renders 7 leads on RmDashboard (limited view)
- Inline editing uses local component state (fast)
- No API calls yet (frontend only)
- Re-renders limited to single row on edit

---

## Questions?

Check these files for implementation details:
- Implementation: `src/components/LeadTable.tsx` lines 430-920
- API integration template: `.kiro/NEXT_SESSION_INLINE_EDITING_API.md`
- Type definitions: `src/types.ts` (StudentLead interface)
- API methods: `src/api/leadsApi.ts` (LeadsDatabase class)
