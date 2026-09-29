# Inline Editing Test Guide

**Feature:** Click on editable cells in LeadTable to edit Lead Status, Journey Stage, and Calling Status

**Status:** ✅ Implemented and ready to test

## How to Test

### 1. Start the Dev Server
```bash
npm run dev
# Server runs on http://localhost:5173
```

### 2. Navigate to the Leads Dashboard
- Open http://localhost:5173
- Login or navigate to the lead management view
- You should see the lead table with multiple columns

### 3. Test Inline Editing

#### Test Lead Status Column
1. **Find a lead row** in the table
2. **Click on the Lead Status cell** (green badge showing "Active", "Closed", or "Archived")
3. **Expected:** Dropdown select appears with blue border
4. **Options available:**
   - Active (Green)
   - Closed (Red)
   - Archived (Gray)
5. **Select a different status** from the dropdown
6. **Expected:** 
   - Cell value updates
   - `onUpdateLead` callback is triggered
   - Dropdown closes

#### Test Journey Stage Column
1. **Find a lead row** in the table
2. **Click on the Journey Stage cell** (gray badge showing the stage)
3. **Expected:** Dropdown select appears with blue border
4. **Options available:**
   - Counseling
   - Application
   - Admission Confirmed
   - Visa
   - Pre-Departure
   - Travel
5. **Select a different stage** from the dropdown
6. **Expected:**
   - Cell value updates
   - `onUpdateLead` callback is triggered
   - Dropdown closes

#### Test Calling Status Column
1. **Find a lead row** in the table
2. **Click on the Calling Status cell** (colored badge with dot indicator)
3. **Expected:** Dropdown select appears with blue border
4. **Options available:**
   - Not Attempted (Blue dot)
   - Callback Scheduled (Orange dot)
   - Connected (Green dot)
   - RNR (Red dot)
5. **Select a different status** from the dropdown
6. **Expected:**
   - Cell value updates with correct color
   - Status dot changes color
   - `onUpdateLead` callback is triggered
   - Dropdown closes

### 4. Test Exit Behavior

#### Close Without Saving
1. **Click to edit a cell** (dropdown appears)
2. **Click outside the dropdown** (e.g., on another cell or table background)
3. **Expected:** Dropdown closes without saving

#### Press Escape (if implemented)
1. **Click to edit a cell**
2. **Press Escape key**
3. **Expected:** Dropdown closes without saving

### 5. Test Multiple Edits
1. **Edit one lead's status**
2. **Without refreshing, edit another lead's status**
3. **Expected:** Both edits work independently

### 6. Test Visual Feedback
1. **Hover over an editable cell** (not in edit mode)
2. **Expected:** Cell background changes slightly, cursor shows pointer
3. **Click the cell**
4. **Expected:** Dropdown appears with clear blue border
5. **Focus is on the select dropdown** (should be highlighted)

## Technical Validation

### Check DevTools Console
- No TypeScript errors
- No React warnings about missing props
- `onUpdateLead` callback logs should appear when editing

### Check Network Tab
- If API integration is wired up, you should see network requests when editing
- If no API integration yet, check browser console for callback logs

## Expected Behavior Summary

| Action | Expected Result |
|--------|-----------------|
| Click editable cell | Dropdown appears with blue border |
| Change dropdown value | `onUpdateLead` callback fires |
| Click outside dropdown | Dropdown closes, change saved |
| Hover on cell | Background highlights, cursor changes to pointer |
| Multiple edits | Each edit works independently |
| Tab between cells | Standard table navigation works |

## Troubleshooting

### Dropdown Not Appearing
- Check browser console for errors
- Verify cell has `py-3 px-4` padding
- Ensure z-index isn't being overridden
- Check if table has `overflow: hidden` that's clipping dropdown

### Changes Not Saving
- Verify `onUpdateLead` prop is passed to LeadTable component
- Check browser console for callback logs
- Check if parent component is updating state with new lead data

### Wrong Cell Being Edited
- Check `editingCell` state in React DevTools
- Verify `lead.id` is unique in each row
- Check that cell click handler isn't bubbling up

### Dropdown Styling Issues
- Check Tailwind CSS is loading
- Verify `border-[#2563EB]` color is rendering (Zolve Blue)
- Check if CSS classes are being overridden by global styles

## Integration Checklist

- [ ] Dev server running on http://localhost:5173
- [ ] Lead table is visible
- [ ] Can see all 3 editable columns (Lead Status, Journey Stage, Calling Status)
- [ ] Can click cells to open dropdowns
- [ ] Dropdowns have correct options
- [ ] Selecting dropdown option calls `onUpdateLead`
- [ ] Multiple leads can be edited in sequence
- [ ] Colors and styling are correct
- [ ] No console errors or warnings

## Next Steps

Once inline editing is working:

1. **Wire up API integration** - Call LeadsDatabase.updateLead() in onUpdateLead callback
2. **Add loading state** - Show spinner while API call is in progress
3. **Add error handling** - Show notification if update fails
4. **Add keyboard support** - Escape to cancel, Enter to confirm
5. **Extend to more columns** - Add Priority, Assigned RM, etc.

## Performance Considerations

- Editing state tracked per lead + field (minimal re-renders)
- Only the edited cell updates (other rows unaffected)
- No unnecessary prop updates or re-renders
- Callback-based architecture for parent control

## Accessibility Notes

- Dropdown has auto-focus when opened
- Keyboard navigation works with Tab key
- Color + text indicators for status (not color alone)
- Semantic HTML with proper select elements
- Escape key support (optional enhancement)

---

**Happy Testing!** 🎉

If you find any issues, check the browser console first for error messages.
