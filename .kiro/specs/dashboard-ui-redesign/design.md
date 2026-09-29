# Dashboard UI Redesign - Design Document

## Overview

This document specifies the complete visual design system and architectural patterns for the Zolve RM dashboard UI redesign. The redesign applies ICICI Bank's clean, minimal design aesthetic across all dashboard views (RmDashboard, TeamLeadDashboard, BdeDashboard, HeadDashboard) and supporting pages (lead detail views, product performance, tables).

The design system is centered on:
- Clean typography with clear hierarchy
- Card-based layouts with generous white space
- Icon-driven sidebar navigation
- Neutral color palette with orange accents
- Responsive, accessible components
- Consistency across all dashboard roles

This document provides implementation-ready specifications for developers to build components that satisfy all requirements.

---

## Architecture

### Component Hierarchy

The dashboard UI is organized into five layers:

```
Application Layer (App.tsx)
    ↓
Layout Layer (DashboardLayout)
    ├── Sidebar Navigation
    ├── Main Content Area
    └── Header (sticky)
        ↓
    Dashboard/Page Layer
    ├── RmDashboard
    ├── TeamLeadDashboard
    ├── BdeDashboard
    ├── HeadDashboard
    └── Supporting Pages (LeadDetail, ProductPerformance, AllLeads)
        ↓
    Section Components
    ├── KPI Cards
    ├── Lead Cards
    ├── Data Tables
    ├── Product Cards
    └── Detail Sections (Profile, Academic, Financial, Documents, Calling, Products)
        ↓
    Reusable Components
    ├── Button (Primary, Secondary)
    ├── Card
    ├── Badge
    ├── Table
    ├── Modal
    ├── Toast/Notification
    └── Form Controls
```

### Sidebar Navigation Structure

The sidebar is a fixed, vertical navigation element (80-100px wide) positioned on the left side of all dashboard views.

**Sidebar Specifications:**
- **Width:** 80-100px (typically 88px for icon-only state)
- **Position:** Fixed, left side, full viewport height
- **Background:** White (#FFFFFF) or very light gray (#F9F9F9)
- **Border:** Subtle right border, light gray (1px, #E5E7EB)
- **z-index:** 20 (below header/modals)

**Sidebar Components:**
1. **Logo Area** (top, 60-70px height)
   - Compact Zolve branding
   - Background: Light orange tint or white
   - Padding: 12-16px

2. **Navigation Items**
   - Icon-only display by default
   - Icons: 24px, dark gray (#424242)
   - Background: Transparent by default
   - Hover: Light gray background (#F5F5F5)
   - Active: Left border highlight (3px, orange #FF6B35) + light orange background

3. **Navigation Items Include:**
   - Dashboard (home icon)
   - Leads (person icon)
   - Team Management (people icon)
   - Products (layers icon)
   - Reports (bar-chart icon)
   - Settings (gear icon, optional)

4. **Tooltip on Hover**
   - Text label appears on hover
   - Position: Right of icon, slight delay (200-300ms)
   - Style: Dark text, light background, 8px border-radius

**Mobile Behavior:**
- On screens < 768px: Collapse to hamburger menu or hide
- Hamburger icon in top-left, opens slide-out drawer
- Drawer width: 200-250px, overlays content

---

## Components and Interfaces

### 1. Reusable Button Component

```typescript
interface ButtonProps {
  variant: 'primary' | 'secondary' | 'tertiary' | 'danger';
  size: 'sm' | 'md' | 'lg';
  disabled?: boolean;
  loading?: boolean;
  icon?: React.ReactNode;
  children: React.ReactNode;
  onClick?: () => void;
  className?: string;
}
```

**Button Styles:**

**Primary Button**
- Background: Orange (#FF6B35)
- Text: White (#FFFFFF), bold (600 weight)
- Padding: 10px horizontal, 8px vertical (md size)
- Border-radius: 6px
- Shadow: None by default, `0 1px 2px rgba(0,0,0,0.1)` on hover
- Hover: Darker orange (#E85A24)
- Focus: Orange ring (2px, 2px offset)
- Disabled: Grayed out (opacity 0.5, cursor not-allowed)
- Loading: Show spinner, disabled state

**Secondary Button**
- Background: Light gray (#F3F4F6)
- Text: Dark gray (#374151), regular (500 weight)
- Border: 1px solid #D1D5DB
- Padding: 10px horizontal, 8px vertical
- Border-radius: 6px
- Hover: #E5E7EB background
- Focus: Gray ring

**Tertiary Button**
- Background: Transparent
- Text: Dark gray (#374151)
- Border: None
- Hover: Light background (#F9FAFB)

**Danger Button**
- Background: Red (#DC2626)
- Text: White (#FFFFFF)
- Hover: Darker red (#B91C1C)

**Priority Buttons**
- **High Priority**: Red background (#DC2626), white text, conveys urgency
  - Hover: Darker red (#991B1B)
  - Used for: Critical actions, SLA breaches, urgent leads
  
- **Medium Priority**: Orange background (#F59E0B), dark text (#374151), conveys importance
  - Hover: Darker orange (#D97706)
  - Used for: Standard lead actions, normal workflow
  
- **Low Priority**: Gray background (#9CA3AF), dark text (#374151), conveys secondary importance
  - Hover: Darker gray (#6B7280)
  - Used for: Optional actions, secondary workflows, archival

**Danger Button**
- Background: Red (#DC2626)
- Text: White (#FFFFFF)
- Hover: Darker red (#B91C1C)

**Priority Buttons**
- **High Priority**: Red background (#DC2626), white text, conveys urgency
  - Hover: Darker red (#991B1B)
  - Used for: Critical actions, SLA breaches, urgent leads
  
- **Medium Priority**: Orange background (#F59E0B), dark text (#374151), conveys importance
  - Hover: Darker orange (#D97706)
  - Used for: Standard lead actions, normal workflow
  
- **Low Priority**: Gray background (#9CA3AF), dark text (#374151), conveys secondary importance
  - Hover: Darker gray (#6B7280)
  - Used for: Optional actions, secondary workflows, archival

### 2. Priority Button Component

```typescript
interface PriorityButtonProps {
  priority: 'high' | 'medium' | 'low';
  size: 'sm' | 'md' | 'lg';
  disabled?: boolean;
  loading?: boolean;
  icon?: React.ReactNode;
  children: React.ReactNode;
  onClick?: () => void;
  className?: string;
}

// Usage Example:
<PriorityButton priority="high">Urgent Action</PriorityButton>
<PriorityButton priority="medium">Standard Action</PriorityButton>
<PriorityButton priority="low">Optional Action</PriorityButton>
```

**Color Mapping:**
- `priority="high"` → #DC2626 red, white text, dark hover state (#991B1B)
- `priority="medium"` → #F59E0B amber, dark text, darker hover state (#D97706)
- `priority="low"` → #9CA3AF gray, dark text, darker hover state (#6B7280)

### 2. Card Component

```typescript
interface CardProps {
  variant?: 'default' | 'elevated' | 'flat';
  padding?: 'sm' | 'md' | 'lg';
  clickable?: boolean;
  children: React.ReactNode;
  className?: string;
}
```

**Card Specifications:**
- **Background:** White (#FFFFFF)
- **Border:** 1px light gray (#E5E7EB) or none
- **Border-radius:** 6-8px
- **Shadow:** 0 1px 3px rgba(0,0,0,0.08) (default)
- **Padding:** 20px (md, default)
- **Spacing between cards:** 16-24px
- **Hover (if clickable):** Subtle shadow increase, slight scale (1.01)
- **Transition:** 150ms ease-out

**Variants:**
- `default`: Subtle shadow, light border
- `elevated`: Stronger shadow (0 4px 6px rgba(0,0,0,0.1))
- `flat`: No shadow, light border only

### 3. Badge Component

```typescript
interface BadgeProps {
  status: 'active' | 'inactive' | 'qualified' | 'pending' | 'breached' | 'due';
  children: React.ReactNode;
  size?: 'sm' | 'md';
}
```

**Badge Colors:**
- **active:** Orange background (#FF6B35), white text
- **inactive:** Gray background (#9CA3AF), white text
- **qualified:** Green background (#10B981), white text
- **pending:** Yellow background (#F59E0B), dark text
- **breached:** Red background (#EF4444), white text
- **due:** Orange background (#FF6B35), white text
- **priority-high:** Red background (#DC2626), white text (for high-priority indicators)
- **priority-medium:** Orange background (#F59E0B), dark text (for medium-priority indicators)
- **priority-low:** Gray background (#9CA3AF), white text (for low-priority indicators)

**Badge Specifications:**
- Border-radius: 12px (pill-shaped)
- Padding: 4px 10px (sm), 6px 12px (md)
- Font size: 12px (sm), 13px (md)
- Font weight: 500
- Display: Inline-flex for alignment

### 4. KPI Card Component

```typescript
interface KpiCardProps {
  label: string;
  value: string | number;
  trend?: { direction: 'up' | 'down'; percentage: number };
  icon?: React.ReactNode;
  color?: 'default' | 'orange' | 'blue';
  size?: 'sm' | 'md' | 'lg';
}
```

**KPI Card Layout:**
```
┌─────────────────────┐
│ 📊 Label            │  (optional icon + label)
│                     │
│     1,234           │  (large, bold value)
│    ↑ +12.5%         │  (optional trend)
└─────────────────────┘
```

**KPI Card Specifications:**
- **Background:** White card with subtle shadow
- **Label:** 12px, light gray (#6B7280), uppercase tracking
- **Value:** 32-40px, bold (700 weight), dark gray (#1F2937)
- **Trend:** 12px regular, green (#10B981) for up, red (#EF4444) for down
- **Padding:** 16-20px
- **Grid layout:** Typically 4 columns on desktop, 2 on tablet, 1 on mobile

### 5. Lead Card Component

```typescript
interface LeadCardProps {
  lead: Lead;
  onClick: () => void;
  showActions?: boolean;
}
```

**Lead Card Layout:**
```
┌─────────────────────────────────────────┐
│ Rahul Sharma                 Active     │  (name, status badge)
│                                         │
│ RM: Virendra Singh | Product: Edu Loan │  (metadata)
│ Created: 15 Dec 2024 | Last: 2 hrs ago │  (dates)
│                                         │
│ SLA: Due in 12 hrs | Call: Not Attempted│  (status indicators)
└─────────────────────────────────────────┘
```

**Lead Card Specifications:**
- **Header:** Bold name (18px, #1F2937), status badge right-aligned
- **Metadata rows:** 13px, light gray (#6B7280), 8px line-height
- **Status indicators:** Icon + text, 12px regular
- **Hover:** Slight shadow increase, cursor pointer
- **Padding:** 16px
- **Border-radius:** 6px

### 6. Table Component

```typescript
interface TableProps {
  columns: ColumnDef[];
  data: any[];
  sortable?: boolean;
  filterable?: boolean;
  selectable?: boolean;
  rowsPerPage?: number;
}
```

**Table Specifications:**
- **Background:** White (#FFFFFF)
- **Border:** 1px light gray (#E5E7EB) around entire table
- **Header Row:**
  - Background: Light gray (#F9FAFB)
  - Text: 12px, bold (600), dark gray (#374151)
  - Padding: 12-16px
  - Border-bottom: 1px light gray
- **Data Rows:**
  - Padding: 10-14px
  - Text: 13px, regular (400), #374151
  - Border-bottom: 1px light gray (#F3F4F6)
  - Hover: Light background (#F9FAFB)
- **Cell Alignment:**
  - Text: Left-aligned
  - Numbers: Right-aligned
  - Dates: Left-aligned
- **Alternating rows:** Optional, typically not needed with good spacing

### 7. Sidebar/Drawer Component (for sections)

```typescript
interface SidebarProps {
  actions: Array<{ label: string; icon: ReactNode; onClick: () => void }>;
  position?: 'left' | 'right';
}
```

**Sidebar Specifications:**
- **Position:** Right side of lead detail view (or left on mobile)
- **Width:** 220-280px
- **Background:** White or light gray
- **Border-left:** 1px light gray
- **Action buttons:** Full-width, stacked vertically
- **Button style:** Secondary or tertiary, left-aligned icon + label

### 8. Modal/Dialog Component

```typescript
interface ModalProps {
  title: string;
  children: React.ReactNode;
  onClose: () => void;
  actions?: Array<ButtonProps>;
  size?: 'sm' | 'md' | 'lg';
}
```

**Modal Specifications:**
- **Background overlay:** Dark gray, 50% opacity
- **Modal background:** White (#FFFFFF)
- **Border-radius:** 8px
- **Shadow:** 0 10px 40px rgba(0,0,0,0.15)
- **Max-width:** 90% viewport or 480px (sm), 640px (md), 800px (lg)
- **Padding:** 24px
- **Title:** 18px bold, #1F2937
- **Content:** 14px regular, #4B5563
- **Actions:** Right-aligned, gap 8px

---

## Data Models

### Dashboard KPI Metrics

```typescript
interface DashboardMetrics {
  totalActiveLeads: number;
  newLeadsThisWeek: number;
  callsDueToday: number;
  pendingActions: number;
  qualified: number;
  notQualified: number;
  breachedSla: number;
  dueSla: number;
  assignmentPending: number;
}
```

### Lead Display Model

```typescript
interface LeadDisplayModel {
  id: string;
  name: string;
  status: 'active' | 'inactive' | 'qualified' | 'rejected';
  assignedRm: string;
  product: string;
  createdDate: Date;
  lastActivityDate: Date;
  slaBadge: 'breached' | 'due' | 'ok' | 'pending';
  slaTimeRemaining?: string;
  callStatus: 'not_attempted' | 'attempted' | 'callback_scheduled' | 'completed';
  qualification: 'qualified' | 'not_qualified' | 'pending';
  opportunities: number;
}
```

### Product Performance Model

```typescript
interface ProductMetrics {
  productName: string;
  totalOpportunities: number;
  qualifiedCount: number;
  transactionCount: number;
  revenue: number;
  conversionRate: number;
  trend: { direction: 'up' | 'down'; percentage: number };
}
```

---

## Design System

### Color Tokens

**Neutrals:**
```
Primary Background: #FFFFFF (white)
Secondary Background: #F9FAFB (very light gray)
Tertiary Background: #F3F4F6 (light gray)
Border Color: #E5E7EB (light border)
Surface Hover: #F9FAFB
Text Primary: #1F2937 (very dark gray)
Text Secondary: #6B7280 (medium gray)
Text Tertiary: #9CA3AF (light gray)
Text Disabled: #D1D5DB
```

**Semantic:**
```
Primary (Accent): #FF6B35 (orange)
Primary Hover: #E85A24 (darker orange)
Success: #10B981 (green)
Warning: #F59E0B (amber)
Error: #EF4444 (red)
Info: #3B82F6 (blue)
Breach: #DC2626 (darker red)
Priority High: #DC2626 (red - urgent)
Priority Medium: #F59E0B (amber - standard)
Priority Low: #9CA3AF (gray - secondary)
```

### Typography

**Font Family:** Inter, Segoe UI, or system font stack
```css
font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Inter, sans-serif;
```

**Font Sizes & Weights:**
```
Display (h1): 32px, bold (700), line-height 1.2
Heading 1 (h2): 24px, bold (700), line-height 1.3
Heading 2 (h3): 20px, bold (700), line-height 1.4
Heading 3 (h4): 16px, bold (600), line-height 1.5
Body Large: 16px, regular (400), line-height 1.5
Body: 14px, regular (400), line-height 1.5
Body Small: 13px, regular (400), line-height 1.5
Label: 12px, regular (400) or bold (600), uppercase, tracking 0.5px
Caption: 11px, regular (400), line-height 1.4
```

**Usage:**
- Dashboard title: Display or h1
- Section titles: h3
- Card titles: h4
- Labels on KPI cards: Label (uppercase)
- Body text: Body or Body Small
- Metadata/descriptions: Body Small, secondary text color

### Spacing System

```
0: 0px
1: 2px
2: 4px
3: 6px
4: 8px
5: 12px
6: 16px
7: 20px
8: 24px
9: 32px
10: 40px
11: 48px
```

**Usage:**
- **Padding inside cards:** 6 (16px) or 8 (24px)
- **Gap between cards:** 6 (16px) or 8 (24px)
- **Gap between components:** 3-4 (6-8px)
- **Margins:** 6 (16px) or 8 (24px)

### Shadow System

```
Subtle: box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
Light: box-shadow: 0 1px 3px rgba(0, 0, 0, 0.08);
Medium: box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
Strong: box-shadow: 0 10px 15px rgba(0, 0, 0, 0.1);
Heavy: box-shadow: 0 10px 40px rgba(0, 0, 0, 0.15);
```

**Usage:**
- Cards (default): Light shadow
- Cards (hover): Medium shadow
- Modals: Heavy shadow
- Dropdowns: Medium shadow

### Border Radius

```
None: 0px (for full-width elements)
Small: 4px (small components)
Default: 6px (standard components, buttons)
Medium: 8px (cards, modals)
Large: 12px (large modals)
Full: 9999px (pills, badges)
```

### Responsive Breakpoints

```
Mobile: < 640px (sm)
Tablet: 640px - 1024px (md, lg)
Desktop: ≥ 1024px (xl, 2xl)
```

**Layout Adjustments:**
- **Mobile (< 768px):**
  - Sidebar: Collapse to hamburger
  - Cards: Full width, stack vertically
  - Tables: Horizontal scroll or card view
  - KPI grid: 2 columns or 1 column
  
- **Tablet (768px - 1024px):**
  - Sidebar: Icon-only
  - Cards: 2-3 columns
  - KPI grid: 2 columns
  
- **Desktop (≥ 1024px):**
  - Sidebar: Full width
  - Cards: 3-4 columns
  - KPI grid: 4 columns

---

## Layout Patterns

### Dashboard Layout Pattern

```
┌─────────────────────────────────────────────────────────┐
│ Header (sticky, z-30)                                   │
├──────┬──────────────────────────────────────────────────┤
│      │ Main Content Area                                 │
│ Side │ ┌────────────────────────────────────────────┐   │
│ bar  │ │ KPI Section (4 columns)                    │   │
│      │ │ □ Total Leads  □ New Leads  □ Due Today   │   │
│ (80- │ │ □ Actions                                  │   │
│ 100  │ ├────────────────────────────────────────────┤   │
│ px)  │ │ Product Performance (4 columns)            │   │
│      │ │ □ Edu Loan  □ Bank Acct  □ Credit Card   │   │
│      │ │ □ Forex                                    │   │
│      │ ├────────────────────────────────────────────┤   │
│      │ │ Leads Requiring Action (full width)       │   │
│      │ │ ┌──────────────────────────────────────┐  │   │
│      │ │ │ Lead Card Row (scrollable)           │  │   │
│      │ │ │ Lead | Status | SLA | Action         │  │   │
│      │ │ └──────────────────────────────────────┘  │   │
│      │ │ ┌──────────────────────────────────────┐  │   │
│      │ │ │ Table View Alternative               │  │   │
│      │ │ └──────────────────────────────────────┘  │   │
│      │ ├────────────────────────────────────────────┤   │
│      │ │ Recent Activity (full width table)    │   │
│      │ └────────────────────────────────────────────┘   │
└──────┴──────────────────────────────────────────────────┘
```

### Lead Detail Layout Pattern

```
┌─────────────────────────────────────────────────────────┐
│ Header (sticky)                                         │
├──────┬──────────────────────────────────────────────────┤
│      │ Lead Header (light bg)                           │
│ Side │ ┌────────────────────────────────────────────┐   │
│ bar  │ │ Name | Status Badge | Quick Summary       │   │
│      │ └────────────────────────────────────────────┘   │
│      │ Scrollable Sections:                             │
│      │ ┌────────────────────────────────────────────┐   │
│      │ │ Profile Section                            │   │
│      │ │ ✓ Section title + collapse toggle          │   │
│      │ │ Fields, values, edit button                │   │
│      │ └────────────────────────────────────────────┘   │
│      │ ┌────────────────────────────────────────────┐   │
│      │ │ Academic Section                           │   │
│      │ │ ✓ Section title + collapse toggle          │   │
│      │ │ Fields, values, edit button                │   │
│      │ └────────────────────────────────────────────┘   │
│ (88  │ ┌────────────────────────────────────────────┐   │
│ px)  │ │ Financial Section                          │   │
│      │ │ ✓ Section title + collapse toggle          │   │
│      │ │ Fields, values, edit button                │   │
│      │ └────────────────────────────────────────────┘   │
│      │ ... (Documents, Calling, Products sections)     │
│      │                                                  │
│      │ ┌──────────────┐ (Quick actions sidebar)        │
│      │ │ Assign Lead  │                                │
│      │ ├──────────────┤                                │
│      │ │ Create Opp   │                                │
│      │ ├──────────────┤                                │
│      │ │ Log Call     │                                │
│      │ ├──────────────┤                                │
│      │ │ Add Document │                                │
│      │ └──────────────┘                                │
└──────┴──────────────────────────────────────────────────┘
```

### Section Component Pattern

```
┌─────────────────────────────────────┐
│ ▼ Section Title       [Edit Button] │  (collapsible header)
├─────────────────────────────────────┤
│ Field Label        Value             │
├─────────────────────────────────────┤
│ Field Label        Value             │
├─────────────────────────────────────┤
│ Field Label        Value             │
│                                     │
│ [Action Button] [Secondary Button]  │  (section-specific actions)
└─────────────────────────────────────┘
```

---

## CSS/Tailwind Implementation Guidelines

### Tailwind Configuration

**Color Mapping:**
```javascript
colors: {
  'brand-orange': '#FF6B35',
  'brand-orange-dark': '#E85A24',
  'neutral-bg': '#F5F5F5',
  'card-bg': '#FFFFFF',
  'text-primary': '#1F2937',
  'text-secondary': '#6B7280',
  'text-tertiary': '#9CA3AF',
  'border': '#E5E7EB',
  // ... semantic colors
}
```

### Card Component CSS

```tailwind
@apply bg-white rounded-lg shadow-sm border border-gray-200
```

Hover state:
```tailwind
@apply hover:shadow-md hover:scale-[1.01] transition-all duration-150
```

### Button Component CSS

Primary:
```tailwind
@apply bg-brand-orange text-white px-4 py-2 rounded-lg font-semibold
@apply hover:bg-brand-orange-dark focus:ring-2 focus:ring-brand-orange
@apply disabled:opacity-50 disabled:cursor-not-allowed
```

### KPI Card CSS

```tailwind
@apply bg-white rounded-lg shadow-sm p-5 border border-gray-200
```

Label:
```tailwind
@apply text-xs font-semibold text-gray-500 uppercase tracking-wide
```

Value:
```tailwind
@apply text-4xl font-bold text-gray-900 mt-2
```

### Table Header CSS

```tailwind
@apply bg-gray-50 px-4 py-3 text-left text-xs font-semibold text-gray-700
@apply border-b border-gray-200
```

### Section Divider CSS

```tailwind
@apply border-t border-gray-200 mt-4 pt-4
```

### Responsive Sidebar CSS

```tailwind
@apply fixed left-0 top-0 w-20 bg-white border-r border-gray-200
@apply md:w-24 lg:w-28
@apply z-20 h-full overflow-y-auto
```

Main content area:
```tailwind
@apply ml-20 md:ml-24 lg:ml-28
```

Mobile hamburger trigger:
```tailwind
@apply md:hidden
```

---

## Icon System

### Icon Library: Lucide React

**Primary Icons (Navigation):**
- Dashboard: `Home`
- Leads: `User`
- Team: `Users`
- Products: `Layers`
- Reports: `BarChart3`
- Settings: `Settings`

**Status Icons:**
- Active: `CheckCircle2` (green)
- Inactive: `Circle` (gray)
- Breach: `AlertTriangle` (red)
- Pending: `Clock` (orange)
- Phone: `Phone`
- Document: `FileText`

**Action Icons:**
- Edit: `Edit2`
- Delete: `Trash2`
- Save: `Save`
- Close: `X`
- Menu: `Menu`
- Search: `Search`
- Filter: `Filter`
- Download: `Download`
- Upload: `Upload`

**Standard Sizes:**
```
Navigation icons: 24px
Status/inline icons: 16-20px
Button icons: 16px
Large icons (hero): 32-48px
```

**Color:**
- Default: `#424242` (dark gray)
- Active/Highlight: `#FF6B35` (orange)
- Success: `#10B981` (green)
- Warning: `#F59E0B` (amber)
- Error: `#EF4444` (red)

---

## Navigation Structure

### Primary Navigation (Sidebar)

1. **Dashboard**
   - Icon: Home
   - Routes to main dashboard based on user role
   - Shows metrics and lead list

2. **Leads**
   - Icon: User/Person
   - Routes to All Leads View
   - Filtered by assigned leads

3. **Team Management**
   - Icon: Users/People
   - Routes to team view (Team Leads only)
   - Shows team members and their performance

4. **Products**
   - Icon: Layers
   - Routes to Product Performance page
   - Shows product-level metrics

5. **Reports**
   - Icon: BarChart3
   - Routes to reporting/analytics page
   - Shows trends and insights

6. **Settings**
   - Icon: Settings (optional)
   - Routes to user settings/preferences

### Breadcrumb Navigation (Header)

Pattern: `Dashboard > Lead Management > [Lead Name]`

- Top-left in header
- Only shown on detail pages
- Links back to previous views
- Last item is non-clickable (current page)

### Tab Navigation (within sections)

Used in:
- Product Performance: Product selection tabs
- Lead Detail: Section tabs or expand/collapse
- Reports: Time period tabs (Today, Week, Month)

Tab styling:
- Active: Orange underline, bold text
- Inactive: Gray text, light underline
- Hover: Light background

---

## Integration with Existing React Components

### Component Consumption Pattern

All reusable components should be placed in `src/components/ui/`:

```
src/components/ui/
├── Button.tsx
├── Card.tsx
├── Badge.tsx
├── KpiCard.tsx
├── LeadCard.tsx
├── Table.tsx
├── Modal.tsx
├── Sidebar.tsx
├── Nav.tsx
└── index.ts (barrel export)
```

### Usage in Dashboard Components

Example integration in RmDashboard:

```typescript
import { Card, KpiCard, LeadCard, Button } from './ui';

export const RmDashboard = () => {
  return (
    <div className="ml-20 bg-gray-50 min-h-screen">
      {/* KPI Section */}
      <div className="grid grid-cols-4 gap-6 p-6">
        <KpiCard 
          label="Total Leads"
          value={metrics.totalActiveLeads}
          trend={{ direction: 'up', percentage: 12 }}
        />
        {/* ... more KPI cards */}
      </div>

      {/* Product Section */}
      <div className="px-6 pb-6">
        <h2 className="text-xl font-bold mb-4">Product Performance</h2>
        <div className="grid grid-cols-4 gap-4">
          {products.map(p => (
            <Card key={p.id} clickable onClick={() => selectProduct(p.id)}>
              <h3 className="font-bold">{p.name}</h3>
              {/* ... product content */}
            </Card>
          ))}
        </div>
      </div>

      {/* Leads Section */}
      <div className="px-6">
        {actionableLeads.map(lead => (
          <LeadCard 
            key={lead.id}
            lead={lead}
            onClick={() => selectLead(lead.id)}
          />
        ))}
      </div>
    </div>
  );
};
```

### Section Component Pattern

All section components (Profile, Academic, etc.) should follow:

```typescript
interface SectionProps {
  lead: Lead;
  onEdit?: () => void;
  onSave?: (data: any) => void;
}

export const ProfileSection: React.FC<SectionProps> = ({ lead, onEdit, onSave }) => {
  const [expanded, setExpanded] = useState(true);
  
  return (
    <Card className="mb-4">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-bold flex items-center gap-2">
          <button onClick={() => setExpanded(!expanded)}>
            {expanded ? <ChevronDown /> : <ChevronRight />}
          </button>
          Profile
        </h3>
        {expanded && <Button variant="secondary" size="sm" onClick={onEdit}>Edit</Button>}
      </div>
      
      {expanded && (
        <>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-gray-600">Name</span>
              <span className="font-medium">{lead.name}</span>
            </div>
            {/* ... more fields */}
          </div>
          <div className="mt-4 flex gap-2">
            <Button variant="primary" onClick={() => onSave(data)}>Save</Button>
            <Button variant="secondary" onClick={() => setEditing(false)}>Cancel</Button>
          </div>
        </>
      )}
    </Card>
  );
};
```

---

## Correctness Properties

*A property is a characteristic or behavior that should hold true across all valid executions of a system—essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.*

### Property 1: Sidebar Navigation Consistency

**For any** user on any dashboard view, the sidebar navigation SHALL remain in a fixed position on the left side with consistent width, background color, and icon styling across all views, ensuring no visual shift or layout reflow when navigating between dashboard roles.

**Validates: Requirements 1.1, 1.2, 8.1, 8.4**

### Property 2: Card Shadow and Spacing Consistency

**For any** card component displayed in any dashboard view, the card SHALL have a consistent background color (#FFFFFF), shadow (0 1px 3px rgba(0,0,0,0.08)), border-radius (6-8px), and padding (16-24px), with consistent spacing (16-24px) between adjacent cards.

**Validates: Requirements 2.1, 2.2, 2.3, 2.4, 2.5**

### Property 3: Color Token Consistency

**For any** visual element in the dashboard using semantic colors (primary text, secondary text, orange accent, status colors), the rendered color SHALL match the specified color token from the design system, ensuring consistent appearance across all components and views.

**Validates: Requirements 3.1, 3.2, 3.3, 3.4, 3.5, 3.6**

### Property 4: Lead Card Information Display

**For any** lead card displayed in a lead list or dashboard, the card SHALL display all required information (lead name, status badge, assigned RM, product, creation date, last activity date) with consistent typography hierarchy and layout alignment.

**Validates: Requirements 4.1, 4.2, 4.3, 4.6**

### Property 5: Lead Card Interactive Behavior

**For any** lead card in the interface, clicking on the card SHALL navigate to the full lead detail view, and hovering over the card SHALL display a subtle shadow increase or background change indicating interactivity.

**Validates: Requirements 4.4, 4.5**

### Property 6: KPI Card Display Completeness

**For any** KPI card displayed in a dashboard, the card SHALL show the metric label (small, light gray text), metric value (large, bold text), and optional trend indicator (up/down arrow with percentage), with the value displayed in orange or bold dark gray to emphasize importance.

**Validates: Requirements 5.1, 5.2, 5.3, 5.4**

### Property 7: Lead Detail Header Separation

**For any** lead detail page, the lead header section (containing name, status, and summary information) SHALL have a visually distinct background color (light gray or light orange tint) that separates it from the main card-based content below, making the header visually distinguishable.

**Validates: Requirements 6.1, 6.2**

### Property 8: Lead Detail Section Organization

**For any** lead detail view with multiple section components (Profile, Academic, Financial, Documents, Calling, Products), each section SHALL be organized into a separate card with a bold title, expand/collapse toggle, and consistent styling matching the card design system.

**Validates: Requirements 6.3, 6.4, 6.5**

### Property 9: Table Header and Row Styling

**For any** data table displayed in the dashboard, the table header row SHALL have a light gray background (#F5F5F5) with bold text, adequate padding (12-16px), and left-aligned labels, while data rows SHALL have white backgrounds with adequate vertical padding (10-14px) and left-aligned text.

**Validates: Requirements 7.1, 7.2, 7.3, 7.4, 7.5**

### Property 10: Navigation Consistency Round-Trip

**For any** user navigating between dashboard views (RM → TeamLead → BDE → Head and back), the main content area background color, card styling, spacing, and sidebar position SHALL remain consistent, with no jarring visual shifts or layout reflows.

**Validates: Requirements 8.1, 8.2, 8.3, 8.4**

### Property 11: Primary Button Visual Affordance

**For any** primary CTA button in the dashboard, the button SHALL have an orange background (#FF6B35), white text, adequate padding (10-14px horizontal, 8-12px vertical), rounded corners (6px border-radius), and SHALL display a darker orange background on hover to indicate interactivity.

**Validates: Requirements 9.1, 9.2, 9.3, 9.4**

### Property 12: Button State Transition

**For any** button in a disabled state, the button SHALL display a grayed-out appearance (reduced opacity or color saturation), disabled cursor (not-allowed), and be non-interactive, preventing accidental clicks or interactions.

**Validates: Requirements 9.8**

### Property 13: Product Performance Card Display

**For any** product card displayed in the Product Performance page, the card SHALL display product name, total opportunities, qualified count, transaction count, and revenue metrics in a consistent card-based layout matching the overall design system.

**Validates: Requirements 10.1, 10.2, 10.3**

### Property 14: Product Performance Drill-Down Navigation

**For any** product card in the Product Performance view, clicking on the card SHALL navigate to a detailed product view or open a modal displaying drill-down data (tables with opportunities, transactions, lead information) while maintaining consistent card-based styling and color scheme.

**Validates: Requirements 10.4, 10.5, 10.6**

### Property 15: Information Architecture Visual Grouping

**For any** dashboard page with multiple content sections, related information SHALL be visually grouped using consistent card styling, spacing, and alignment, indicating logical relationships between data elements and enabling quick visual scanning.

**Validates: Requirements 11.1, 11.2, 11.3, 11.4**

### Property 16: Responsive Layout Adaptation

**For any** viewport width smaller than 1024px, the sidebar navigation SHALL adapt (collapse to hamburger or icon-only), and card-based layouts SHALL maintain readability with appropriate spacing and font sizing adjustments, ensuring no broken layouts or missing content.

**Validates: Requirements 12.1, 12.2, 12.4**

### Property 17: Touch Target Sizing on Mobile

**For any** interactive element (button, link, form input) displayed on mobile screens (< 768px), the touch target size SHALL be at least 44x44 pixels, enabling easy interaction without accidental clicks on adjacent elements.

**Validates: Requirements 12.4**

### Property 18: Viewport Reflow Smoothness

**For any** viewport resize operation (e.g., desktop to tablet to mobile), the layout SHALL reflow smoothly without content jumping, overlapping, or horizontal scroll bars appearing, maintaining visual stability during responsive transitions.

**Validates: Requirements 12.5**

### Property 19: Semantic HTML and ARIA Usage

**For any** icon used as a primary affordance (e.g., sidebar navigation icon), the icon element SHALL have an accompanying `aria-label` or `title` attribute providing a descriptive text equivalent, and all interactive elements SHALL have proper semantic HTML tags and ARIA attributes.

**Validates: Requirements 13.1, 13.2, 13.3**

### Property 20: Color Plus Text for Status Indication

**For any** status indication (badge, indicator, or highlight), the design SHALL not rely solely on color to convey meaning; instead, status SHALL be communicated using both color AND descriptive text label (e.g., "Active", "Qualified", "Breached"), ensuring accessibility for color-blind users.

**Validates: Requirements 13.5**

### Property 21: Keyboard Navigation Full Coverage

**For any** dashboard page or component, all interactive elements (buttons, links, form inputs, menu items, cards) SHALL be reachable and usable via keyboard navigation without mouse required, with visible focus indicators for keyboard users.

**Validates: Requirements 13.6**

### Property 22: Modal Focus Management

**For any** modal or overlay displayed in the dashboard, keyboard focus SHALL be trapped within the modal (only modal elements are tab-reachable), and when the modal is closed, focus SHALL be restored to the previously focused element on the main page.

**Validates: Requirements 13.7**

---

## Error Handling

### Error States and Display

All error conditions should display user-friendly messages using:

1. **Toast Notifications** (for non-critical errors)
   - Position: Top-right corner
   - Duration: 4-5 seconds auto-dismiss
   - Colors: Red background for errors, amber for warnings
   - Example: "Failed to save lead details. Please try again."

2. **Inline Form Errors** (for form validation)
   - Red text below field
   - Red border on input field
   - Clear, specific error message
   - Example: "Email must be a valid format"

3. **Modal Error Dialogs** (for critical errors)
   - Modal title: "Error" or specific error type
   - Error description and recovery steps
   - Primary action: "Retry" or "Go Back"
   - Secondary action: "Cancel" or "Contact Support"

### Error Categories

**Validation Errors:**
- Missing required fields
- Invalid format (email, phone)
- Range violations (dates, amounts)

**Data Errors:**
- Lead not found
- Insufficient permissions
- Concurrent modification (someone else edited)

**System Errors:**
- API timeout
- Server 500 error
- Network connectivity issues

**UI State Errors:**
- Modal focus trap errors
- Layout reflow issues
- Navigation state mismatches

---

## Testing Strategy

### Unit Testing Approach

Unit tests validate specific component behavior with concrete examples:

**Component Tests (Jest + React Testing Library):**
- Button component: Primary, Secondary, Disabled, Loading states
- Card component: Default, Elevated, Flat variants
- Badge component: All status colors
- Modal: Open, close, focus trap behavior
- Sidebar: Navigation items, hover tooltips, active state

**Example:**
```typescript
describe('PrimaryButton', () => {
  it('renders with orange background and white text', () => {
    render(<Button variant="primary">Click me</Button>);
    expect(screen.getByRole('button')).toHaveClass('bg-brand-orange text-white');
  });

  it('displays darker orange on hover', () => {
    const { rerender } = render(<Button variant="primary">Click me</Button>);
    // Simulate hover and verify style change
  });

  it('disables interaction when disabled prop is true', () => {
    render(<Button disabled>Click me</Button>);
    expect(screen.getByRole('button')).toBeDisabled();
  });
});
```

### Property-Based Testing Approach

Property tests validate universal design system rules across all inputs:

**Property 1: Card Consistency**
```typescript
// Feature: dashboard-ui-redesign, Property 2: Card Shadow and Spacing Consistency
test('all cards maintain consistent styling', () => {
  fc.assert(
    fc.property(fc.array(fc.string()), (titles) => {
      const cards = titles.map(t => render(<Card>{t}</Card>));
      
      cards.forEach(card => {
        expect(card).toHaveStyle({
          backgroundColor: '#FFFFFF',
          borderRadius: '6px',
          boxShadow: '0 1px 3px rgba(0,0,0,0.08)'
        });
      });
      
      return true;
    }),
    { numRuns: 100 }
  );
});
```

**Property 2: Color Token Consistency**
```typescript
// Feature: dashboard-ui-redesign, Property 3: Color Token Consistency
test('all status badges use correct colors', () => {
  const statusColorMap = {
    active: '#FF6B35',
    inactive: '#9CA3AF',
    qualified: '#10B981',
    breached: '#DC2626'
  };
  
  fc.assert(
    fc.property(
      fc.oneof(
        fc.constant('active'),
        fc.constant('inactive'),
        fc.constant('qualified'),
        fc.constant('breached')
      ),
      (status) => {
        const { container } = render(<Badge status={status}>Status</Badge>);
        const bg = window.getComputedStyle(container.firstChild).backgroundColor;
        
        expect(bg).toBe(statusColorMap[status]);
        return true;
      }
    ),
    { numRuns: 100 }
  );
});
```

**Property 3: Responsive Layout**
```typescript
// Feature: dashboard-ui-redesign, Property 16: Responsive Layout Adaptation
test('layout adapts correctly at all breakpoints', () => {
  const breakpoints = [320, 640, 1024, 1440];
  
  fc.assert(
    fc.property(fc.oneof(...breakpoints.map(fc.constant)), (width) => {
      global.innerWidth = width;
      window.dispatchEvent(new Event('resize'));
      
      const { container } = render(<Dashboard />);
      
      if (width < 1024) {
        // Sidebar should be collapsed or hamburger visible
        expect(container.querySelector('[role="navigation"]')).toHaveClass('md:hidden');
      } else {
        // Sidebar should be visible
        expect(container.querySelector('[role="navigation"]')).not.toHaveClass('md:hidden');
      }
      
      return true;
    }),
    { numRuns: 100 }
  );
});
```

**Property 4: Button Affordance**
```typescript
// Feature: dashboard-ui-redesign, Property 11: Primary Button Visual Affordance
test('primary buttons provide consistent affordance', () => {
  fc.assert(
    fc.property(fc.string(), (label) => {
      const { rerender } = render(<Button variant="primary">{label}</Button>);
      const button = screen.getByRole('button');
      
      // Base state
      expect(button).toHaveStyle({
        backgroundColor: '#FF6B35',
        color: '#FFFFFF'
      });
      
      // Hover state (simulated by user interaction)
      userEvent.hover(button);
      expect(button).toHaveStyle('backgroundColor: #E85A24');
      
      return true;
    }),
    { numRuns: 100 }
  );
});
```

### Integration Testing Approach

Integration tests verify component interactions:

**Lead Card Click Navigation:**
```typescript
test('clicking lead card navigates to detail view', () => {
  const lead = { id: '1', name: 'Rahul Sharma', status: 'active' };
  const onSelect = jest.fn();
  
  render(<LeadCard lead={lead} onClick={onSelect} />);
  
  userEvent.click(screen.getByText('Rahul Sharma'));
  
  expect(onSelect).toHaveBeenCalledWith(lead);
});
```

**Modal Focus Trap:**
```typescript
// Feature: dashboard-ui-redesign, Property 22: Modal Focus Management
test('modal traps focus and restores on close', () => {
  const { rerender } = render(
    <>
      <button>Outside button</button>
      <Modal isOpen={true}>
        <button>Modal button 1</button>
        <button>Modal button 2</button>
      </Modal>
    </>
  );
  
  // Tab through modal elements
  const buttons = screen.getAllByRole('button').slice(1); // Skip outside button
  buttons.forEach(btn => {
    // Focus should cycle only within modal
  });
  
  // Close modal and focus should restore
  rerender(
    <>
      <button>Outside button</button>
    </>
  );
  
  expect(document.activeElement).toBe(screen.getByText('Outside button'));
});
```

### Visual Regression Testing (Recommended)

Use snapshot testing for visual consistency:

```typescript
test('dashboard layout matches snapshot', () => {
  const { container } = render(<Dashboard leads={mockLeads} />);
  expect(container).toMatchSnapshot();
});
```

### Accessibility Testing (Manual + Automated)

**Automated with jest-axe:**
```typescript
test('dashboard has no accessibility violations', async () => {
  const { container } = render(<Dashboard />);
  const results = await axe(container);
  expect(results).toHaveNoViolations();
});
```

**Manual checklist:**
- [ ] Keyboard navigation works without mouse
- [ ] Screen reader announces all content
- [ ] Color contrast meets WCAG AA standards
- [ ] Focus indicators are visible
- [ ] Touch targets are 44x44px minimum on mobile
- [ ] No flashing content that could trigger seizures
- [ ] Form labels are properly associated with inputs

---

## Implementation Checklist

### Phase 1: Foundation Components
- [ ] Button component (all variants)
- [ ] Card component (all variants)
- [ ] Badge component (all statuses)
- [ ] KPI Card component
- [ ] Color token constants

### Phase 2: Navigation
- [ ] Sidebar Navigation component
- [ ] Hamburger menu for mobile
- [ ] Tooltip on hover
- [ ] Breadcrumb component

### Phase 3: Dashboard Layout
- [ ] DashboardLayout wrapper (sidebar + content)
- [ ] Main content background and spacing
- [ ] Responsive breakpoints
- [ ] Mobile adaptation

### Phase 4: Dashboard Content
- [ ] KPI card grid
- [ ] Lead card component and list
- [ ] Product card component and grid
- [ ] Recent activity list

### Phase 5: Lead Detail
- [ ] Lead detail header
- [ ] Section components (expandable)
- [ ] Quick actions sidebar
- [ ] Edit/save workflows

### Phase 6: Tables and Lists
- [ ] Table component with styling
- [ ] List view alternative for mobile
- [ ] Sorting and filtering
- [ ] Pagination

### Phase 7: Polish and Testing
- [ ] Hover and focus states
- [ ] Loading states
- [ ] Error states
- [ ] Accessibility audit
- [ ] Cross-browser testing
- [ ] Mobile device testing
- [ ] Unit and property tests

---

## Design Handoff Notes

### For Frontend Developers

1. **Use the Tailwind configuration provided** to ensure color consistency
2. **All components should be in `src/components/ui/`** and exported via barrel export
3. **Keep components as simple as possible**—avoid over-engineering
4. **Use Lucide React for all icons**—consistency in icon library
5. **Test responsive behavior on real devices** (not just browser DevTools)
6. **Follow the spacing system strictly**—no arbitrary margins/padding
7. **Document all component props and variants**
8. **Use TypeScript interfaces** for all props
9. **Implement error states** for all interactive components
10. **Accessibility is not optional**—include ARIA labels and semantic HTML

### For QA/Testing

1. **Test all four dashboard roles** (RM, TeamLead, BDE, Head)
2. **Verify responsive breakpoints** (320px, 640px, 1024px, 1440px)
3. **Check keyboard navigation** on all pages
4. **Verify color contrast** against WCAG AA
5. **Test with screen readers** (NVDA, JAWS, VoiceOver)
6. **Validate all interactive elements** have hover/focus/active states
7. **Verify animations** are smooth and not disruptive
8. **Check print stylesheet** (optional but recommended)

### For Product/Design

1. **Design is finalized** and locked—changes should go through a new spec
2. **All colors and spacing should match the design system**
3. **Component variations** are well-defined and should not drift
4. **Accessibility is built-in**—no design should require manual testing
5. **Responsive behavior** is specified per breakpoint

---

## Design System Dependencies

### Required Libraries
- **React:** 19.0.1+
- **Tailwind CSS:** 4.1.14+
- **Lucide React:** 0.546.0+ (icons)

### Optional but Recommended
- **Radix UI:** For accessible component primitives
- **Framer Motion:** For animations (already in package.json)
- **Headless UI:** For accessible components

### Testing Libraries
- **React Testing Library:** Unit and integration tests
- **Vitest:** Test runner
- **jest-axe:** Accessibility testing
- **fast-check:** Property-based testing

---

