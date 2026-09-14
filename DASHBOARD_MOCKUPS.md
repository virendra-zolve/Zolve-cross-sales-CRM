# RBAC Dashboard Mockups - Zolve Partner Portal

## Overview
Created 4 new role-based dashboard views based on the RBAC PRD V1.0, following the hierarchy:
**Agent (RM) → Team Lead → Manager → Head → Director**

Plus a specialized **BDE (Business Development Executive)** view for partner onboarding.

---

## 1. RM/Agent Dashboard (Operational)
**Role:** Agent (RM/Caller)  
**Scope:** Own leads only

### KPI Cards (4)
- **My Active Leads** - Leads assigned to me
- **New Leads** - Assigned today
- **Calls Due Today** - Callback & follow-up calls
- **Needs Action** - Pending qualifications

### Components
- Leads requiring action (priority-sorted by SLA status)
- Recent activity log (real-time audit of actions)
- Quick call & outcome logging

---

## 2. Team Lead Dashboard (Management)
**Role:** Team Lead (Manager in current system)  
**Scope:** Own + Team leads

### Features
- Team performance metrics
- Team member roster with individual stats
- KPI monitoring for team members
- Lead reassignment across team
- Escalation & deadline extension capabilities

---

## 3. Manager Dashboard (Strategic)
**Role:** Manager  
**Scope:** Team + Location + All (with restrictions)

### KPI Cards (6)
- **Total Pipeline** - All leads in organization
- **Active Leads** - Currently working
- **Qualified** - Qualified for loans
- **At Risk** - SLA breached / escalated
- **Closed Leads** - Completed
- **Avg Connect Rate** - Team metric

### Components
- **Team Overview** - Card view of team members with leads/connect rate
- **Lead Table** - Filter tabs: All / At Risk / Closed
- **Location Performance** - Breakdown by geographic regions
  - Delhi NCR, Mumbai, Bangalore with metrics

---

## 4. Head Dashboard (Executive)
**Role:** Head (Director level - no name yet in hierarchy)  
**Scope:** All data access

### KPI Cards (8)
- Pipeline
- Active
- Qualified  
- At Risk
- Closed
- Closure Rate %
- Escalated Issues (red alert)
- Team Size

### Components
- **Escalated Issues Section** (red banner) - Requires immediate action
- **Team Performance** - Top 5 performers with individual metrics
  - Leads count, Connect %, Capacity %
- **Leads Table** - Full visibility
- **System Admin Actions**
  - Manage Users
  - View Reports  
  - Export Data
  - Audit Trail

---

## 5. Director Dashboard (Executive Level)
Same as Head Dashboard - full exec-level visibility with strategic metrics

---

## 6. BDE Dashboard (Onboarding Specialist)
**Role:** BDE (Business Development Executive - Partner onboarding)  
**Scope:** Inbound/Partner-sourced leads

### KPI Cards (4)
- **Inbound Leads** - Partners onboarded
- **Pending Qualification** - In qualification phase
- **Ready for Assignment** - Qualified & unassigned
- **Conversion Rate %** - Inbound → Qualified

### Components
- **Period Filters** - Today / This Week / This Month
- **Inbound Leads Table** - Partners' leads
- **Partner Programs Section**
  - Active partner networks
  - Commission structures
  - Monthly lead volume per program
  - Create New Partner button

---

## Technical Implementation

### New Components Created
```
src/components/
├── HeadDashboard.tsx          (Manager-level strategic view)
├── DirectorDashboard.tsx      (Executive-level view)
└── BdeDashboard.tsx           (Partner onboarding view)
```

### App.tsx Integration
- Added `currentRole` state: `'agent' | 'team_lead' | 'manager' | 'head' | 'director' | 'bde'`
- Added `handleSwitchRole()` handler for role switching
- Role Switcher UI bar showing all 6 roles (for demo/testing)
- Conditional rendering of dashboards based on `currentView`

### Role Switching Flow
```
RM (Agent)      → 'dashboard'
Team Lead       → 'manager'
Manager         → 'head'
Head            → 'director'
Director        → 'director'
BDE             → 'bde'
```

---

## Data Visibility Rules (Per PRD)

| Role | Own | Team | Location | All |
|------|-----|------|----------|-----|
| Agent | ✓ | - | - | - |
| Team Lead | ✓ | ✓ | - | - |
| Manager | ✓ | ✓ | ✓ | △ |
| Head | - | ✓ | ✓ | ✓ |
| Director | - | ✓ | ✓ | ✓ |
| BDE | △ | - | - | △ (partners only) |

---

## Key Metrics by Role

**Agent:** Operational metrics (calls, attempts, outcomes)  
**Team Lead:** Team management (member performance, KPI)  
**Manager:** Regional performance & location breakdown  
**Head/Director:** Pipeline health, escalations, closure rates  
**BDE:** Inbound conversion, partner performance, commissions

---

## Next Steps

1. **Add Team Member Data** - Populate `teamMembers` prop with actual data
2. **Implement RBAC Enforcement** - Filter leads by role scope in data layer
3. **Add User Management UI** - For Director/Head to manage users
4. **Connect to Backend API** - Replace mock data with real API calls
5. **Role-Based Lead Actions** - Disable/enable actions based on role (edit, reassign, close, etc.)

---

## Demo
Switch between roles using the role switcher bar at the top of the page to see different dashboard views.
