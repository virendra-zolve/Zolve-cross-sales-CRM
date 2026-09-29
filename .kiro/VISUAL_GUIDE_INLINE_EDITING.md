# Visual Guide - Inline Table Editing

## The Feature at a Glance

### Before (Static Table)
```
┌────────────────────────────────────────────────────┐
│ Lead ID │ Name        │ Status    │ Stage │ Calling│
├─────────┼─────────────┼───────────┼───────┼────────┤
│ L000123 │ John Smith  │ Active    │ Visa  │ Not Att
│ L000124 │ Sarah Jones │ Closed    │ Travel│ Connect
│ L000125 │ Mike Brown  │ Active    │ Admit │ Callback
└────────────────────────────────────────────────────┘
(Can only view, must navigate to detail to edit)
```

### After (With Inline Editing)
```
┌────────────────────────────────────────────────────┐
│ Lead ID │ Name        │ Status    │ Stage │ Calling│
├─────────┼─────────────┼───────────┼───────┼────────┤
│ L000123 │ John Smith  │ [Active ▼]│ Visa  │ NotAtt│
│         │             │ Active    │       │       │
│         │             │ Closed    │       │       │ ← Click to edit
│         │             │ Archived  │       │       │
│ L000124 │ Sarah Jones │ Closed    │ Travel│ Connect
│ L000125 │ Mike Brown  │ Active    │ Admit │ Callback
└────────────────────────────────────────────────────┘
(Click any badge to edit inline)
```

## Interaction Sequence

### Scenario: Change a lead's status from Active to Closed

**Step 1: User sees the table**
```
┌─────────────────────────────────────┐
│ Lead Status: ✓ Active               │
│ (Green badge with checkmark)        │
└─────────────────────────────────────┘
```

**Step 2: User clicks on the status badge**
```
┌──────────────────────────────────────┐
│ Lead Status: [Active        ▼]       │
│ (Dropdown appears, blue border)      │
└──────────────────────────────────────┘
   Cursor: pointer
   Border: 2px solid #2563EB
   Focus: blue ring around dropdown
```

**Step 3: User sees dropdown options**
```
┌──────────────────────────────────────┐
│ Lead Status: [Active        ▼]       │
│ ┌──────────────────────────────────┐ │
│ │ Active          (selected)       │ │
│ │ Closed                           │ │
│ │ Archived                         │ │
│ └──────────────────────────────────┘ │
└──────────────────────────────────────┘
```

**Step 4: User selects "Closed"**
```
┌──────────────────────────────────────┐
│ Lead Status: Closed (being updated...) 
│ (Temporarily shows selected value)  │
└──────────────────────────────────────┘
   onUpdateLead callback fires
   API call to database
```

**Step 5: Result - Status updated**
```
┌──────────────────────────────────────┐
│ Lead Status: ✗ Closed                │
│ (Red badge now, dropdown closed)     │
│ ✓ Update successful                  │
└──────────────────────────────────────┘
```

## Visual States

### View Mode (Default)
```
LEAD STATUS:
┌───────────────┐
│ Active ✓      │  (Green badge)
│ Closed ✗      │  (Red badge)
│ Archived      │  (Gray badge)
└───────────────┘
Cursor: pointer
Hover: darker shade
```

### Edit Mode (When Clicked)
```
LEAD STATUS:
┌────────────────────────────────────┐
│ [Active              ▼]            │  (Dropdown)
├────────────────────────────────────┤
│ Active         (pre-selected)       │
│ Closed                              │
│ Archived                            │
└────────────────────────────────────┘
Border: 2px solid #2563EB (blue)
Focus: ring-2 ring-[#2563EB]
```

## The Three Editable Columns

### 1️⃣ Lead Status Column
**Visual:**
```
GREEN badge  →  ✓ Active
RED badge    →  ✗ Closed
GRAY badge   →  ◯ Archived
```

**Click → Dropdown**
```
Green badge click
           ↓
Select from:
- Active
- Closed
- Archived
           ↓
New color shows
```

### 2️⃣ Journey Stage Column
**Visual:**
```
Gray badge showing current stage
- Counseling
- Application
- Admission Confirmed
- Visa
- Pre-Departure
- Travel
```

**Click → Dropdown**
```
Badge click
    ↓
6-stage dropdown
    ↓
New stage shows
```

### 3️⃣ Calling Status Column
**Visual:**
```
🔵 Blue dot   →  Not Attempted (blue badge)
🟠 Orange dot →  Callback Scheduled (orange badge)
🟢 Green dot  →  Connected (green badge)
🔴 Red dot    →  RNR (red badge)
```

**Click → Dropdown**
```
Colored badge click
           ↓
Select calling status
           ↓
New color & icon
```

## Color Scheme

### Lead Status Colors
```
Active:   🟢 bg-emerald-50   text-emerald-800   border-emerald-200
Closed:   🔴 bg-rose-50      text-rose-800      border-rose-200
Archived: ⚪ bg-slate-100    text-slate-700     border-slate-200
```

### Journey Stage Colors
```
All stages: ⚪ bg-slate-100   text-slate-700     border-slate-200
```

### Calling Status Colors
```
Not Attempted:       🔵 bg-slate-100   text-slate-700      border-slate-200
Callback Scheduled:  🟠 bg-amber-50    text-amber-800      border-amber-200
Connected:           🟢 bg-emerald-50  text-emerald-800    border-emerald-200
RNR:                 🔴 bg-rose-50     text-rose-800       border-rose-200
```

## User Experience Flow

```
┌─────────────────────────────────────────────────────┐
│ User opens dashboard with lead table                │
├─────────────────────────────────────────────────────┤
│ User sees: [Active] [Visa] [Connected]              │
│            (badges with colors & text)              │
├─────────────────────────────────────────────────────┤
│ User hovers over badge                              │
│ → Cursor changes to: pointer                        │
│ → Badge background slightly changes                 │
├─────────────────────────────────────────────────────┤
│ User clicks badge                                   │
│ → Dropdown appears with blue border                 │
│ → Focus automatically on select                     │
│ → All options visible                               │
├─────────────────────────────────────────────────────┤
│ User selects new value from dropdown                │
│ → Change fires immediately (onChange event)         │
│ → onUpdateLead callback triggered                   │
│ → Dropdown closes                                   │
│ → Cell shows new value                              │
├─────────────────────────────────────────────────────┤
│ Behind the scenes:                                  │
│ → API call to LeadsDatabase                         │
│ → Database updated                                  │
│ → Activity log created                              │
│ → UI state refreshed                                │
├─────────────────────────────────────────────────────┤
│ User can immediately edit another lead              │
│ OR navigate away                                    │
│ (All changes preserved)                             │
└─────────────────────────────────────────────────────┘
```

## Comparison: Before vs After

### Before (Old Way)
```
1. Click cell → Nothing happens
2. Click "View" button → Opens detail page
3. Scroll to status field
4. Click to edit
5. Select new value
6. Click "Save"
7. Wait for page to reload
8. Go back to list
Result: 8 actions, page reload
```

### After (Inline Editing)
```
1. Click cell → Dropdown appears
2. Select value
Result: 2 actions, instant update
```

## Responsive Behavior

### Desktop (Full Dropdowns)
```
┌──────────────────────────────────────────┐
│ [Active ▼]   [Visa ▼]   [Connected ▼]   │
│  Active       Counseling  Not Attempted  │
│  Closed       Application Callback       │
│  Archived     Admission   Connected      │
└──────────────────────────────────────────┘
```

### Tablet (Same Behavior)
```
┌────────────────────────────┐
│ [Active ▼]  [Visa ▼]       │
│  Active      Counseling    │
│  Closed      Application   │
│  Archived    Admission     │
└────────────────────────────┘
```

### Mobile (Touch-Friendly)
```
┌─────────────────────┐
│ [Active ▼]          │
│  Active             │
│  Closed             │
│  Archived           │
├─────────────────────┤
│ (Native select picker on some phones)
└─────────────────────┘
```

## Accessibility Features

### Keyboard Navigation
```
Tab     → Move to next cell
Tab     → Move back to previous cell
Enter   → Open dropdown on focused cell
↑ ↓     → Navigate dropdown options
Enter   → Select highlighted option
Escape  → Close dropdown (planned)
```

### Screen Reader Support
```
<td onClick="...">
  <span role="button" tabindex="0">
    Active ← Read as "button, Active"
  </span>
</td>

<select autoFocus>
  <option>Active</option>      ← Read as "option, Active"
  <option>Closed</option>
</select>
```

### Color Contrast
```
✓ All text meets WCAG AA (4.5:1 contrast ratio)
✓ Status indicated by color AND text
✓ Icons paired with text labels
✓ Focus indicators visible (blue ring)
```

## Quick Stats

| Metric | Value |
|--------|-------|
| Time to edit | 2 clicks |
| Fields editable | 3 columns |
| Options per column | 3-6 values |
| Page reloads needed | 0 |
| Navigation clicks | 2-3 (vs 8 before) |
| Speed improvement | 75% faster |

---

## Key Takeaway

**From:** Static table, click button to view/edit, navigate to detail page, scroll, wait for page reload  
**To:** Click badge → select value → instant update, back to list  

**Result:** Faster workflow, better UX, more productivity for RMs & Team Leads 🚀
