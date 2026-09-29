# Implementation Plan: Dashboard UI Redesign

## Overview

This implementation plan converts the dashboard UI redesign into actionable coding tasks. The approach is organized in phases that build incrementally: first establishing foundational design system components, then building navigation and layouts, then integrating these into specific dashboard views, and finally wiring up product and table views. The focus is on delivering consistent visual design and user experience across all dashboard roles (RM, Team Lead, BDE, Head).

Each task includes specific code artifacts to create or modify, clear acceptance criteria tied to requirements, and integration with existing dashboard components. The implementation prioritizes semantic HTML, accessibility, and responsive design from the start.

---

## Tasks

- [x] 1. Set up design system constants and Tailwind configuration
  - Create `src/styles/designTokens.ts` with all color tokens, spacing values, and typography constants
  - Update `tailwind.config.ts` with brand colors (orange #FF6B35, neutrals, semantic colors) and responsive breakpoints
  - Define shadow, border-radius, and spacing system as Tailwind extensions
  - Ensure TypeScript types for all design tokens are exported for component use
  - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5, 3.6_

- [x] 2. Create foundational reusable UI components
  - [ ] 2.1 Implement Button component with all variants
    - Create `src/components/ui/Button.tsx` with `variant` prop supporting primary, secondary, tertiary, danger
    - Support `size` prop (sm, md, lg) with consistent padding and typography
    - Implement disabled and loading states with proper styling and cursor states
    - Add icon support with optional left/right placement
    - _Requirements: 9.1, 9.2, 9.3, 9.4, 9.5, 9.6, 9.7, 9.8_
  
  - [ ]* 2.2 Write property test for Button component visual consistency
    - **Property 11: Primary Button Visual Affordance**
    - **Validates: Requirements 9.1, 9.2, 9.3, 9.4**
  
  - [ ] 2.3 Implement PriorityButton component for high/medium/low actions
    - Create `src/components/ui/PriorityButton.tsx` with `priority` prop (high, medium, low)
    - Map priority levels to colors: high=#DC2626 (red), medium=#F59E0B (amber), low=#9CA3AF (gray)
    - Support same size and icon props as Button component
    - _Requirements: 9.1, 9.2, 9.3_
  
  - [ ]* 2.4 Write unit tests for PriorityButton rendering
    - Test high priority renders red background
    - Test medium priority renders amber background
    - Test low priority renders gray background
    - _Requirements: 9.1, 9.2, 9.3_
  
  - [ ] 2.5 Implement Card component with variants
    - Create `src/components/ui/Card.tsx` with `variant` prop (default, elevated, flat)
    - Apply consistent white background, border, shadow, and padding (16-24px)
    - Support `clickable` prop for interactive cards with hover effects
    - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.5, 2.6, 2.7, 2.8_
  
  - [ ]* 2.6 Write property test for Card shadow and spacing consistency
    - **Property 2: Card Shadow and Spacing Consistency**
    - **Validates: Requirements 2.1, 2.2, 2.3, 2.4, 2.5_
  
  - [ ] 2.7 Implement Badge component for status indicators
    - Create `src/components/ui/Badge.tsx` with `status` prop (active, inactive, qualified, pending, breached, due)
    - Map status values to correct background colors with white or dark text
    - Support priority-based badges (priority-high, priority-medium, priority-low)
    - _Requirements: 3.5, 4.3_
  
  - [ ]* 2.8 Write unit tests for Badge status colors
    - Test all status values render correct colors
    - Test all priority levels render correct colors
    - _Requirements: 3.5, 4.3_
  
  - [ ] 2.9 Implement KpiCard component for dashboard metrics
    - Create `src/components/ui/KpiCard.tsx` with props for label, value, trend (optional), icon, color
    - Display label in small light gray uppercase text
    - Display value in large bold orange or dark gray
    - Display trend with up/down arrow and percentage (green for up, red for down)
    - _Requirements: 5.1, 5.2, 5.3, 5.4, 5.5, 5.6, 5.7_
  
  - [ ]* 2.10 Write property test for KPI card display completeness
    - **Property 6: KPI Card Display Completeness**
    - **Validates: Requirements 5.1, 5.2, 5.3, 5.4_

- [ ] 3. Create navigation and layout components
  - [ ] 3.1 Implement Sidebar navigation component
    - Create `src/components/ui/Sidebar.tsx` with fixed left positioning (width 80-100px)
    - Display Zolve logo/branding at top in compact form (60-70px height)
    - Create NavigationItem sub-component with icon, label, and active state
    - Implement tooltip on hover showing menu label (200-300ms delay)
    - Support click to set active item and integrate with routing
    - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5, 1.6, 1.7, 1.8_
  
  - [ ]* 3.2 Write unit tests for Sidebar navigation interaction
    - Test sidebar displays all navigation items
    - Test tooltip appears on hover
    - Test active state updates on click
    - _Requirements: 1.1, 1.3, 1.6_
  
  - [ ] 3.3 Implement Hamburger menu for mobile sidebar collapse
    - Create hamburger button trigger for mobile screens (<768px)
    - Build slide-out drawer (200-250px width) overlaying content
    - Implement drawer close on navigation click or X button
    - Add backdrop overlay with appropriate z-index
    - _Requirements: 1.9, 12.1_
  
  - [ ]* 3.4 Write unit tests for mobile hamburger menu
    - Test hamburger visible on mobile screens
    - Test drawer opens on click
    - Test drawer closes on item click or X button
    - _Requirements: 1.9, 12.1_
  
  - [ ] 3.5 Implement DashboardLayout wrapper component
    - Create `src/components/layouts/DashboardLayout.tsx` with Sidebar and main content area
    - Apply left margin (ml-20 md:ml-24 lg:ml-28) to account for sidebar width
    - Set background color to neutral gray (#F5F5F5 or #FAFAFA)
    - Maintain consistent spacing and padding for main content
    - _Requirements: 2.1, 2.5, 2.8, 8.1, 8.2, 8.3_
  
  - [ ]* 3.6 Write property test for layout sidebar consistency
    - **Property 1: Sidebar Navigation Consistency**
    - **Validates: Requirements 1.1, 1.2, 8.1, 8.4_
  
  - [ ] 3.7 Implement Breadcrumb navigation component
    - Create `src/components/ui/Breadcrumb.tsx` with array of breadcrumb items
    - Display as `Dashboard > Section > Current Page` format
    - Make all items except last clickable for navigation
    - Style with light gray text and orange active item
    - _Requirements: 8.1_
  
  - [ ] 3.8 Implement Tooltip component
    - Create `src/components/ui/Tooltip.tsx` with delay and positioning
    - Display text label above or beside trigger element
    - Style with dark text, light background, 8px border-radius
    - Support arrow pointing to trigger element
    - _Requirements: 1.3_

- [ ] 4. Implement dashboard content section components
  - [ ] 4.1 Create KPI grid section for dashboard top
    - Build KPI grid layout (4 columns on desktop, 2 on tablet, 1 on mobile)
    - Integrate calculateDashboardMetrics() to populate KPI values
    - Display KPI cards for: Total Leads, New Leads This Week, Calls Due Today, Pending Actions
    - _Requirements: 5.1, 5.2, 5.3, 5.4, 5.5, 5.6, 5.7_
  
  - [ ]* 4.2 Write property test for KPI grid responsive layout
    - **Property 16: Responsive Layout Adaptation**
    - **Validates: Requirements 12.1, 12.2, 12.4_
  
  - [ ] 4.3 Create Product Performance card component
    - Build `src/components/ui/ProductCard.tsx` with product metrics display
    - Show: product name, total opportunities, qualified count, transaction count, revenue
    - Include trend indicator (up/down with percentage)
    - Apply clickable card styling with hover effects
    - _Requirements: 10.1, 10.2, 10.3_
  
  - [ ]* 4.4 Write unit tests for ProductCard display
    - Test all product metrics display correctly
    - Test card is clickable and hover effect visible
    - _Requirements: 10.1, 10.2, 10.3_
  
  - [ ] 4.5 Create Product Performance grid section
    - Build grid layout for product cards (4 columns on desktop, 2-3 on tablet)
    - Integrate product data from existing dashboard components
    - Implement click handler to navigate to product detail
    - _Requirements: 10.1, 10.4, 10.5, 10.6_
  
  - [ ] 4.6 Implement Lead Card component
    - Create `src/components/ui/LeadCard.tsx` with lead information display
    - Display: name (bold title), status badge, assigned RM, product, creation date, last activity
    - Show SLA status and call status inline with icons
    - Apply hover effects (shadow increase, slight scale)
    - _Requirements: 4.1, 4.2, 4.3, 4.4, 4.5, 4.6, 4.7_
  
  - [ ]* 4.7 Write property test for Lead Card information display
    - **Property 4: Lead Card Information Display**
    - **Validates: Requirements 4.1, 4.2, 4.3, 4.6_
  
  - [ ]* 4.8 Write unit tests for Lead Card interactivity
    - Test clicking lead card navigates to detail view
    - Test all lead information displays correctly
    - Test hover effect shows shadow increase
    - _Requirements: 4.4, 4.5_
  
  - [ ] 4.9 Create Lead Card list section for dashboard
    - Build list or card grid of leads requiring action
    - Filter and sort leads based on dashboard logic (due SLA, new, etc.)
    - Integrate with lead detail navigation
    - _Requirements: 4.1, 4.4, 4.5, 4.6_

- [ ] 5. Refactor existing dashboard views with new design system
  - [ ] 5.1 Update RmDashboard to use new components
    - Replace KPI display with new KpiCard grid
    - Add Product Performance card section
    - Replace lead display with new LeadCard components
    - Apply DashboardLayout wrapper and design tokens
    - _Requirements: 3.1, 5.1, 5.2, 8.1, 8.2, 8.3, 8.4, 8.5_
  
  - [ ]* 5.2 Write integration tests for RmDashboard layout
    - Test all KPI cards display with correct values
    - Test product cards display and are clickable
    - Test lead cards display and are clickable
    - _Requirements: 8.1, 8.2, 8.3_
  
  - [ ] 5.3 Update TeamLeadDashboard to use new components
    - Apply same KPI grid, product section, and lead card layout as RmDashboard
    - Display team-specific metrics if applicable
    - Apply DashboardLayout wrapper and consistent styling
    - _Requirements: 3.1, 5.1, 5.2, 8.1, 8.2, 8.3, 8.4, 8.5_
  
  - [ ]* 5.4 Write integration tests for TeamLeadDashboard layout
    - Test layout consistency with RmDashboard
    - Test team-specific metrics display correctly
    - _Requirements: 8.1, 8.2, 8.3_
  
  - [ ] 5.5 Update BdeDashboard to use new components
    - Apply KPI grid with BDE-specific metrics
    - Add Product Performance section
    - Apply DashboardLayout and design tokens
    - _Requirements: 3.1, 5.1, 5.2, 8.1, 8.2, 8.3_
  
  - [ ] 5.6 Update HeadDashboard to use new components
    - Apply KPI grid with organizational-level metrics
    - Add Product Performance section with company-wide data
    - Apply DashboardLayout and design tokens
    - _Requirements: 3.1, 5.1, 5.2, 8.1, 8.2, 8.3_

- [ ] 6. Implement Lead Detail View redesign
  - [ ] 6.1 Create LeadDetailHeader component
    - Build header section with light gray background (light tint of #F5F5F5)
    - Display lead name (large bold text), status badge, key summary info
    - Add breadcrumb navigation back to previous page
    - _Requirements: 6.1, 6.2_
  
  - [ ] 6.2 Implement Section component wrapper for detail sections
    - Create `src/components/ui/Section.tsx` with collapsible header
    - Support title, expand/collapse toggle (chevron icon), and section content
    - Display action buttons specific to section (Edit, Add, etc.)
    - Apply consistent card styling and typography
    - _Requirements: 6.3, 6.4, 6.5_
  
  - [ ]* 6.3 Write unit tests for Section component expand/collapse
    - Test chevron toggle expands/collapses content
    - Test multiple sections maintain independent state
    - _Requirements: 6.3, 6.4_
  
  - [ ] 6.4 Update LeadProfileSection to use new Section component
    - Wrap existing section content in new Section component
    - Apply consistent typography and spacing from design system
    - _Requirements: 6.3, 6.4, 6.5_
  
  - [ ] 6.5 Update LeadAcademicSection to use new Section component
    - Wrap existing section content in new Section component
    - Apply consistent typography and spacing
    - _Requirements: 6.3, 6.4, 6.5_
  
  - [ ] 6.6 Update LeadFinancialSection to use new Section component
    - Wrap existing section content in new Section component
    - Apply consistent typography and spacing
    - _Requirements: 6.3, 6.4, 6.5_
  
  - [ ] 6.7 Update LeadDocumentsSection to use new Section component
    - Wrap existing section content in new Section component
    - Apply consistent typography and spacing
    - _Requirements: 6.3, 6.4, 6.5_
  
  - [ ] 6.8 Update LeadCallingSection to use new Section component
    - Wrap existing section content in new Section component
    - Apply consistent typography and spacing
    - _Requirements: 6.3, 6.4, 6.5_
  
  - [ ] 6.9 Update LeadProductsSection to use new Section component
    - Wrap existing section content in new Section component
    - Apply consistent typography and spacing
    - _Requirements: 6.3, 6.4, 6.5_
  
  - [ ] 6.10 Create quick actions sidebar for lead detail view
    - Build vertical sidebar with action buttons (Assign, Create Opportunity, Log Call, Add Document)
    - Position on right side of content area or below on mobile
    - Apply secondary button styling with full width
    - _Requirements: 6.7, 6.8_
  
  - [ ]* 6.11 Write property test for lead detail section organization
    - **Property 8: Lead Detail Section Organization**
    - **Validates: Requirements 6.3, 6.4, 6.5_
  
  - [ ] 6.12 Wire up lead detail header separation visual
    - Apply light background color to distinguish header from detail sections
    - Test visual distinction is clear
    - _Requirements: 6.1, 6.2_
  
  - [ ]* 6.13 Write property test for lead detail header separation
    - **Property 7: Lead Detail Header Separation**
    - **Validates: Requirements 6.1, 6.2_

- [ ] 7. Implement table and list view styling
  - [ ] 7.1 Create Table component with consistent styling
    - Create `src/components/ui/Table.tsx` with proper HTML table structure
    - Apply light gray header background (#F5F5F5) with bold text
    - Apply white row backgrounds with light gray hover state
    - Support left-aligned text, right-aligned numbers
    - _Requirements: 7.1, 7.2, 7.3, 7.4, 7.5, 7.6, 7.7, 7.8_
  
  - [ ]* 7.2 Write property test for table header and row styling
    - **Property 9: Table Header and Row Styling**
    - **Validates: Requirements 7.1, 7.2, 7.3, 7.4, 7.5_
  
  - [ ]* 7.3 Write unit tests for Table component rendering
    - Test header renders with correct styling
    - Test rows render with consistent padding
    - Test hover state displays correctly
    - _Requirements: 7.1, 7.2, 7.3, 7.4, 7.5_
  
  - [ ] 7.4 Implement LeadTable wrapper for dashboard table display
    - Use new Table component for lead data display
    - Integrate sorting and filtering (if existing)
    - Apply consistent spacing and typography
    - _Requirements: 7.1, 7.2, 7.3, 7.4, 7.5, 7.6, 7.7, 7.8_
  
  - [ ] 7.5 Create responsive table adapter for mobile
    - For screens < 768px, convert table to card-based list view
    - Each row becomes a card with key information
    - Apply consistent card styling and spacing
    - _Requirements: 7.1, 12.1, 12.2, 12.3_

- [ ] 8. Implement Product Performance page redesign
  - [ ] 8.1 Create ProductDetailModal or ProductDetailPage
    - Display drill-down data for selected product
    - Show opportunities table with opportunity details
    - Show transactions table with transaction details
    - Show related leads information
    - _Requirements: 10.4, 10.5, 10.6_
  
  - [ ]* 8.2 Write unit tests for product detail view display
    - Test all product metrics display
    - Test tables display with correct styling
    - Test tables use new Table component styling
    - _Requirements: 10.4, 10.5, 10.6_
  
  - [ ] 8.3 Update ProductPerformancePage layout
    - Display product cards in grid (4 columns desktop, 2-3 tablet, 1 mobile)
    - Wire up product card click to open drill-down view
    - Apply DashboardLayout and design tokens
    - _Requirements: 10.1, 10.2, 10.3, 10.4, 10.5, 10.6_

- [ ] 9. Implement information architecture and content grouping
  - [ ] 9.1 Create section grouping visual patterns
    - Apply consistent spacing between section groups
    - Use card boundaries to visually separate related content
    - Ensure alignment and hierarchy communicate relationships
    - _Requirements: 11.1, 11.2, 11.3, 11.4, 11.5_
  
  - [ ]* 9.2 Write property test for information architecture consistency
    - **Property 15: Information Architecture Visual Grouping**
    - **Validates: Requirements 11.1, 11.2, 11.3, 11.4_
  
  - [ ] 9.3 Wire up all dashboard sections with information hierarchy
    - Ensure most important info (KPIs) appears at top
    - Secondary content (products, leads) below
    - Consistent scanning pattern across all views
    - _Requirements: 11.1, 11.2, 11.3, 11.4, 11.5_

- [ ] 10. Implement responsive design and mobile adaptation
  - [ ] 10.1 Implement responsive breakpoints in components
    - Test all components at 320px, 640px, 1024px, 1440px viewports
    - Apply Tailwind responsive classes (sm:, md:, lg:, xl:)
    - Ensure no layout breaks or horizontal scrolling
    - _Requirements: 12.1, 12.2, 12.3, 12.4, 12.5_
  
  - [ ]* 10.2 Write property test for responsive layout adaptation
    - **Property 16: Responsive Layout Adaptation**
    - **Validates: Requirements 12.1, 12.2, 12.4_
  
  - [ ] 10.3 Implement touch target sizing validation
    - Ensure all buttons and interactive elements >= 44x44px on mobile
    - Test touch targets on actual mobile devices or emulator
    - _Requirements: 12.4, 17_
  
  - [ ]* 10.4 Write property test for touch target sizing
    - **Property 17: Touch Target Sizing on Mobile**
    - **Validates: Requirements 12.4_
  
  - [ ]* 10.5 Write property test for viewport reflow smoothness
    - **Property 18: Viewport Reflow Smoothness**
    - **Validates: Requirements 12.5_
  
  - [ ] 10.6 Test sidebar collapse on mobile
    - Verify sidebar becomes hamburger menu < 768px
    - Test drawer opens/closes properly
    - Test drawer overlay closes on click outside
    - _Requirements: 1.9, 12.1, 12.2_

- [ ] 11. Implement accessibility and semantic HTML
  - [ ] 11.1 Add semantic HTML to all components
    - Use proper heading hierarchy (h1-h6)
    - Use semantic tags (header, nav, main, section, article, footer)
    - Use form tags for all form controls with associated labels
    - _Requirements: 13.1_
  
  - [ ]* 11.2 Write property test for semantic HTML and ARIA usage
    - **Property 19: Semantic HTML and ARIA Usage**
    - **Validates: Requirements 13.1, 13.2, 13.3_
  
  - [ ] 11.3 Add ARIA labels to icon-based elements
    - Add aria-label to all sidebar navigation icons
    - Add aria-label to all icon buttons
    - Add title attributes as fallback
    - _Requirements: 13.2, 13.3_
  
  - [ ]* 11.4 Write unit tests for ARIA attributes
    - Test all icon elements have aria-label
    - Test all interactive elements have accessible labels
    - _Requirements: 13.2, 13.3_
  
  - [ ] 11.5 Implement color + text for status indication
    - Ensure all badges use both color and text
    - Ensure all status indicators use color + icon/text
    - Never rely on color alone for meaning
    - _Requirements: 13.5, 20_
  
  - [ ]* 11.6 Write property test for color plus text status indication
    - **Property 20: Color Plus Text for Status Indication**
    - **Validates: Requirements 13.5_
  
  - [ ] 11.7 Implement keyboard navigation coverage
    - Ensure Tab key navigates through all interactive elements
    - Ensure Shift+Tab navigates backwards
    - Test on all dashboard views
    - _Requirements: 13.6, 21_
  
  - [ ]* 11.8 Write property test for keyboard navigation
    - **Property 21: Keyboard Navigation Full Coverage**
    - **Validates: Requirements 13.6_
  
  - [ ] 11.9 Implement modal focus management
    - Trap focus within modals (only modal elements are tab-reachable)
    - Restore focus to trigger element when modal closes
    - _Requirements: 13.7, 22_
  
  - [ ]* 11.10 Write property test for modal focus management
    - **Property 22: Modal Focus Management**
    - **Validates: Requirements 13.7_

- [ ] 12. Implement color token consistency across all components
  - [ ] 12.1 Apply color tokens from design system to all components
    - Replace all hardcoded color values with design token constants
    - Use Tailwind color classes with custom color mapping
    - Verify all components use correct semantic colors
    - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5, 3.6_
  
  - [ ]* 12.2 Write property test for color token consistency
    - **Property 3: Color Token Consistency**
    - **Validates: Requirements 3.1, 3.2, 3.3, 3.4, 3.5, 3.6_

- [ ] 13. Implement dashboard view navigation consistency
  - [ ] 13.1 Wire up sidebar navigation to all dashboard views
    - Ensure Dashboard menu item routes to correct role-based view
    - Ensure Leads menu item routes to all leads view
    - Ensure Team Management item routes to team view (Team Leads only)
    - Ensure Products item routes to product performance page
    - _Requirements: 8.1, 8.2, 8.3, 8.4, 8.5_
  
  - [ ]* 13.2 Write property test for navigation consistency
    - **Property 10: Navigation Consistency Round-Trip**
    - **Validates: Requirements 8.1, 8.2, 8.3, 8.4_
  
  - [ ] 13.3 Update App.tsx routing to integrate new navigation
    - Connect sidebar routes to dashboard components
    - Ensure breadcrumb updates on navigation
    - Test navigation flow between all views
    - _Requirements: 8.1, 8.2, 8.3_

- [ ] 14. Implement button affordance and state management
  - [ ] 14.1 Add loading states to primary buttons
    - Display spinner icon during async operations
    - Disable button during loading
    - Show disabled cursor
    - _Requirements: 9.5_
  
  - [ ]* 14.2 Write unit tests for button loading states
    - Test loading spinner displays
    - Test button disabled during loading
    - _Requirements: 9.5_
  
  - [ ] 14.3 Add focus indicators to all interactive elements
    - Implement visible focus ring (orange, 2px)
    - Test focus visible on keyboard Tab
    - Ensure focus ring meets color contrast requirements
    - _Requirements: 9.4, 13.6_
  
  - [ ]* 14.4 Write property test for button affordance
    - **Property 11: Primary Button Visual Affordance**
    - **Validates: Requirements 9.1, 9.2, 9.3, 9.4_
  
  - [ ]* 14.5 Write property test for button state transition
    - **Property 12: Button State Transition**
    - **Validates: Requirements 9.8_

- [ ] 15. Create design system component barrel export
  - [ ] 15.1 Create index.ts in src/components/ui/
    - Export all UI components from single barrel import
    - Enable: `import { Button, Card, Badge, ... } from 'src/components/ui'`
    - Keep exports organized and documented
    - _Requirements: All_

- [ ] 16. Checkpoint - Verify design system implementation
  - Ensure all reusable components are created and exported
  - Run build to verify TypeScript compilation
  - Manually test component rendering and styling
  - Verify Tailwind classes apply correctly
  - Ask the user if questions arise.

- [ ] 17. Implement color consistency validation across dashboards
  - [ ] 17.1 Test RmDashboard uses consistent colors
    - Verify all primary actions use orange
    - Verify all status badges use correct colors
    - Verify text uses correct semantic colors
    - _Requirements: 3.1, 3.5, 5.1_
  
  - [ ] 17.2 Test TeamLeadDashboard uses consistent colors
    - Verify color consistency matches RmDashboard
    - _Requirements: 3.1, 3.5, 8.1, 8.2, 8.3_
  
  - [ ] 17.3 Test BdeDashboard uses consistent colors
    - Verify color consistency matches other dashboards
    - _Requirements: 3.1, 3.5, 8.1, 8.2, 8.3_
  
  - [ ] 17.4 Test HeadDashboard uses consistent colors
    - Verify color consistency matches other dashboards
    - _Requirements: 3.1, 3.5, 8.1, 8.2, 8.3_

- [ ] 18. Comprehensive testing and validation
  - [ ]* 18.1 Write integration tests for complete dashboard flow
    - Test navigating between dashboard views
    - Test clicking on leads and products
    - Test responsive behavior at all breakpoints
    - _Requirements: 8.1, 8.2, 8.3, 8.4, 8.5, 12.1, 12.2, 12.3_
  
  - [ ]* 18.2 Perform manual accessibility audit
    - Test keyboard navigation end-to-end
    - Test screen reader compatibility (NVDA or VoiceOver)
    - Verify color contrast meets WCAG AA
    - Check for page structure and heading hierarchy
    - _Requirements: 13.1, 13.2, 13.3, 13.4, 13.5, 13.6, 13.7_
  
  - [ ]* 18.3 Perform manual responsive design testing
    - Test on mobile devices (iPhone, Android)
    - Test on tablet (iPad, Android tablet)
    - Test on desktop at multiple resolutions
    - Verify no horizontal scrolling
    - _Requirements: 12.1, 12.2, 12.3, 12.4, 12.5_
  
  - [ ]* 18.4 Test browser compatibility
    - Test Chrome, Firefox, Safari, Edge
    - Verify responsive design works across browsers
    - Verify color rendering is consistent
    - _Requirements: 3.1, 3.5, 12.1, 12.2_

- [ ] 19. Final checkpoint - Ensure all tests pass and design is complete
  - Ensure all unit tests pass
  - Ensure all property tests pass
  - Ensure all integration tests pass
  - Run build one final time to verify no errors
  - Ask the user if questions arise.

---

## Notes

- All components should be TypeScript with proper prop interfaces
- Use Tailwind CSS for styling with custom design tokens
- Use Lucide React for all icons
- All components should support accessibility from the start (semantic HTML, ARIA labels, keyboard navigation)
- Test-related tasks marked with `*` are optional and can be skipped for faster MVP delivery
- Each task builds on previous tasks—maintain integration as you progress
- Refer to design document for detailed styling specifications and component patterns
- Design tokens file should be the single source of truth for colors, spacing, and typography

