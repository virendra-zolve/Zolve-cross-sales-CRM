# Dashboard UI Redesign Requirements

## Introduction

This specification defines the complete visual and user experience redesign of the Zolve RM dashboard. The redesign transforms the current interface to match ICICI Bank's clean, minimal design system while maintaining all existing functionality. The new design emphasizes clean typography, generous white space, icon-based navigation, card-based layouts, and a neutral color scheme with orange accents.

This redesign applies to all dashboard views: RmDashboard, TeamLeadDashboard, BdeDashboard, and HeadDashboard, as well as all supporting pages (lead detail views, product performance, table views).

## Glossary

- **Dashboard**: The main interface view used by Relationship Managers, Team Leads, BDEs, and Heads
- **Sidebar Navigation**: Left-aligned vertical navigation menu with icon-based items
- **Card-Based Layout**: Content organized into distinct, visually separated white cards with subtle shadows
- **Information Hierarchy**: Visual prioritization using typography weight, size, and spacing
- **White Space**: Empty space between elements and sections for visual clarity
- **Neutral Background**: Light gray or off-white background (e.g., #F5F5F5, #FAFAFA)
- **Orange Accent**: Brand-primary orange used for highlights, CTAs, and emphasis (e.g., #FF6B35, #E74C3C)
- **Icon-Based Menu**: Navigation items represented primarily by icons with optional labels
- **ICICI Aesthetic**: Minimal, professional design with clean lines, clear typography, and restrained color use
- **Section Component**: Modular UI unit that displays related information (profile, academic, financial, etc.)
- **Lead Detail View**: Full-page interface for viewing and managing a single lead record
- **RmDashboard**: Dashboard for Relationship Managers showing assigned leads and KPIs
- **TeamLeadDashboard**: Dashboard for Team Leads showing team performance and lead assignments
- **BdeDashboard**: Dashboard for Business Development Executives showing sales metrics
- **HeadDashboard**: Dashboard for organizational heads showing high-level metrics and reporting

## Requirements

### Requirement 1: Sidebar Navigation Structure

**User Story:** As any dashboard user, I want to navigate between dashboard sections and pages using a clean, icon-based sidebar, so that I can quickly access different parts of the application without clutter.

#### Acceptance Criteria

1. THE Sidebar Navigation SHALL display vertically on the left side of the dashboard with a fixed width of 80-100px
2. WHEN the user is on any dashboard page, THE Sidebar Navigation SHALL show icon-based menu items with no text labels by default
3. WHEN the user hovers over a sidebar icon, THE Sidebar Navigation SHALL display a tooltip showing the menu item label
4. THE Sidebar Navigation SHALL use a white or very light gray background (#FFFFFF or #F9F9F9)
5. THE Sidebar Navigation SHALL display the Zolve logo/branding at the top in a compact form
6. WHEN the user clicks on a sidebar menu item, THE Navigation SHALL update the active state indicator (highlight or underline) for that item
7. THE Sidebar Navigation items SHALL include at minimum: Dashboard, Leads, Team Management, Products, Reports
8. THE Sidebar Navigation items SHALL use recognizable icons (e.g., home icon for Dashboard, person icon for Leads, people icon for Team Management)
9. WHEN the user is viewing mobile or narrow screens, THE Sidebar Navigation MAY collapse to icon-only or use a hamburger menu alternative

### Requirement 2: Card-Based Content Layout

**User Story:** As a dashboard user, I want to see related information organized into distinct visual cards with good spacing, so that I can quickly understand data grouping and scan information efficiently.

#### Acceptance Criteria

1. THE Dashboard Layout SHALL organize all content into individual cards with clear visual boundaries
2. EACH Card SHALL have a white or near-white background (#FFFFFF) with a subtle shadow (e.g., box-shadow: 0 1px 3px rgba(0,0,0,0.08))
3. EACH Card SHALL have consistent padding of 16-24px on all sides
4. EACH Card SHALL use a border-radius of 4-8px for slightly rounded corners
5. THE Dashboard Layout SHALL maintain consistent spacing (16px or 24px) between adjacent cards
6. WHERE a card contains a title or heading, THE Card SHALL display this heading at the top with bold typography and adequate visual separation from the content below
7. WHEN a card contains multiple sections or subsections, THE Card MAY use divider lines (light gray borders) to separate them internally
8. THE Dashboard Layout SHALL use sufficient white space around and between cards to avoid visual overcrowding

### Requirement 3: Color Scheme and Visual Hierarchy

**User Story:** As a dashboard user, I want a clean, professional color palette that uses minimal colors with clear emphasis, so that important information stands out and the interface feels professional.

#### Acceptance Criteria

1. THE Color Scheme SHALL use a neutral background color (#F5F5F5, #FAFAFA, or similar light gray)
2. THE Color Scheme SHALL use white (#FFFFFF) for card backgrounds
3. THE Color Scheme SHALL use dark gray (#333333, #424242, or similar) for primary text
4. THE Color Scheme SHALL use light gray (#999999, #AAAAAA, or similar) for secondary text and labels
5. THE Color Scheme SHALL use orange (#FF6B35, #E74C3C, #FF6B9D, or similar brand orange) as the primary accent color
6. WHEN highlighting CTAs, important metrics, or active states, THE Interface SHALL use the orange accent color
7. WHEN displaying error or warning states, THE Interface SHALL use appropriate semantic colors (red for errors, yellow for warnings) but keep the palette minimal
8. THE Typography SHALL use bold (600-700 weight) for primary headings and key metrics
9. THE Typography SHALL use regular (400 weight) for body text and descriptions
10. THE Typography SHALL use a clean, sans-serif font (e.g., Inter, Segoe UI, or system font stack)

### Requirement 4: Lead Information Display Cards

**User Story:** As an RM or Team Lead, I want to see lead information organized into clean, scannable cards with clear visual hierarchy, so that I can quickly understand lead status and key details.

#### Acceptance Criteria

1. WHEN viewing the lead list or dashboard, EACH Lead Card SHALL display: lead name, status badge, assigned RM, assigned product, creation date, and last activity date
2. EACH Lead Card SHALL use a title-style display for the lead name (bold, larger font size)
3. EACH Status Badge SHALL use a color code (e.g., orange for "Active", gray for "Inactive", green for "Qualified")
4. EACH Lead Card SHALL have a subtle hover effect (e.g., slight shadow increase, background color change) to indicate interactivity
5. WHEN a lead card is clicked, THE Interface SHALL navigate to the full lead detail view
6. THE Lead Card layout SHALL maintain consistent spacing and alignment across all lead cards in a list or grid view
7. THE Lead Card SHALL display metrics inline using a clear visual hierarchy (e.g., metric label above value with smaller, lighter text for label)

### Requirement 5: Dashboard KPI and Metrics Display

**User Story:** As a dashboard user, I want to see key performance indicators displayed prominently with clear labeling and visual emphasis, so that I can quickly assess performance at a glance.

#### Acceptance Criteria

1. WHEN viewing any dashboard, THE KPI Section SHALL display metrics in cards with the metric value prominently displayed in a large, bold font
2. EACH KPI Card SHALL include: metric label, current value, and optional trend indicator (up/down arrow with percentage)
3. THE KPI Value SHALL be displayed in orange or bold dark gray to emphasize importance
4. THE KPI Label SHALL be displayed in smaller, light gray text below or to the side of the value
5. WHEN a trend is displayed, THE Trend Indicator SHALL use green for positive change and red for negative change
6. THE KPI Cards SHALL be arranged in a grid or row layout with consistent spacing
7. WHERE multiple KPIs exist for a single concept (e.g., total leads, qualified leads), THE Dashboard SHALL organize them visually to show the relationship

### Requirement 6: Lead Detail View Redesign

**User Story:** As an RM, I want to view detailed information about a lead in a clean, organized layout with section-based components, so that I can easily access all relevant information and perform actions.

#### Acceptance Criteria

1. WHEN viewing a lead detail page, THE Page Layout SHALL display a header section with the lead name, status, and key summary information
2. THE Lead Header SHALL use a light background color (light gray or light orange tint) to visually separate it from the main content
3. WHEN scrolling through the lead detail view, THE Page Layout SHALL organize information into expandable/collapsible section cards (Profile, Academic, Financial, Documents, Calling, Products)
4. EACH Section Card SHALL have a bold title and an expand/collapse toggle (chevron icon or similar)
5. EACH Section Card SHALL display relevant information with clear labels and values using consistent typography
6. WHEN a section is expanded, THE Section Card MAY display action buttons specific to that section (e.g., "Add Document", "Log Call")
7. THE Lead Detail View SHALL display a sidebar or footer with quick action buttons (e.g., Assign, Create Opportunity, Log Call) aligned vertically or horizontally
8. WHEN the user takes an action (add, edit, save), THE Interface SHALL provide clear feedback (toast notification, inline confirmation, or similar)

### Requirement 7: Table and List View Styling

**User Story:** As a dashboard user, I want tables and list views to follow the clean design system with proper spacing and visual hierarchy, so that I can quickly scan and compare information.

#### Acceptance Criteria

1. WHEN viewing any data table, THE Table SHALL have a white background (#FFFFFF) with a subtle outer border (light gray, 1px)
2. THE Table Header Row SHALL have a light gray background (#F5F5F5 or similar) with bold text
3. THE Table Header Row labels SHALL be left-aligned with adequate padding (12-16px)
4. THE Table Data Rows SHALL alternate with white backgrounds (no row striping needed if spacing is sufficient)
5. THE Table Data Rows SHALL have adequate vertical padding (10-14px) for readability
6. WHEN hovering over a table row, THE Row SHALL display a subtle background color change (light gray or light orange tint)
7. THE Table Cells SHALL use left alignment for text and right alignment for numeric values
8. WHEN a cell contains long text, THE Cell SHALL truncate or wrap the text appropriately without breaking the layout

### Requirement 8: Navigation Consistency Across Dashboard Views

**User Story:** As any user, I want consistent navigation, layout, and styling across all dashboard views (RM, Team Lead, BDE, Head), so that I can move between roles without confusion.

#### Acceptance Criteria

1. ACROSS All Dashboard Views, THE Sidebar Navigation SHALL remain consistent in position, styling, and available menu items
2. ACROSS All Dashboard Views, THE Main Content Area SHALL maintain consistent background color, card styling, and spacing
3. ACROSS All Dashboard Views, THE Header/Logo area SHALL be displayed in the same location and style
4. WHEN switching between dashboard roles or pages, THE Page Layout SHALL not cause jarring visual shifts or reflows
5. ACROSS All Dashboard Views, THE Button Styles, input fields, and form controls SHALL use consistent styling

### Requirement 9: Call-to-Action Buttons and Interactive Elements

**User Story:** As a dashboard user, I want clear, visually prominent call-to-action buttons that indicate their purpose and state, so that I can easily identify and interact with important actions.

#### Acceptance Criteria

1. THE Primary CTA Button SHALL have an orange background (#FF6B35 or similar) with white text
2. THE Primary CTA Button SHALL display text-transform: none with clear, concise label (e.g., "Create Lead", "Assign", "Log Call")
3. THE Primary CTA Button SHALL have adequate padding (10-14px horizontal, 8-12px vertical) and a border-radius matching the design system
4. WHEN the user hovers over a Primary CTA Button, THE Button SHALL display a darker orange background or subtle shadow increase
5. WHEN the user clicks a Primary CTA Button, THE Button MAY display a loading state (spinner or disabled state)
6. THE Secondary Button SHALL have a light gray or white background with dark text and a subtle border
7. THE Secondary Button SHALL have consistent styling with Primary buttons but distinct visual appearance
8. WHEN a button is in a disabled state, THE Button SHALL display a grayed-out appearance with reduced opacity or disabled cursor

### Requirement 10: Product Performance Page Redesign

**User Story:** As a dashboard user, I want to view product performance metrics in a clean card-based layout with drill-down capability, so that I can analyze product-specific data efficiently.

#### Acceptance Criteria

1. WHEN viewing the Product Performance page, THE Page Layout SHALL display product cards in a grid or list format
2. EACH Product Card SHALL display: product name, total opportunities, qualified count, transaction count, and revenue metrics
3. EACH Product Card SHALL use the card styling consistent with the overall design system (white background, shadow, padding)
4. WHEN clicking on a Product Card, THE Interface SHALL navigate to a detailed product view or open a modal with drill-down data
5. WHEN viewing product-specific data, THE Drill-Down View SHALL display tables with opportunities, transactions, and related lead information
6. THE Product Drill-Down View SHALL maintain the same card-based styling and color scheme as the main dashboard
7. WHEN filtering or sorting product data, THE Interface SHALL provide clear visual feedback (updated counts, highlighted filters)

### Requirement 11: Information Architecture and Content Grouping

**User Story:** As a dashboard user, I want related information to be visually grouped together, so that I can quickly understand which data belongs together and navigate logically.

#### Acceptance Criteria

1. THE Dashboard Layout SHALL use visual grouping (cards, sections, spacing) to organize related information
2. WHEN content spans multiple cards or sections, THE Layout SHALL use consistent spacing and alignment to indicate relationships
3. THE Page Hierarchy SHALL display the most important information at the top and secondary information below
4. WHEN a page has multiple sections (e.g., Profile, Academic, Financial), THE Sections SHALL be visually distinct but unified in styling
5. WHEN navigating between pages or views, THE Information Architecture SHALL remain consistent and predictable

### Requirement 12: Responsive Design and Mobile Considerations

**User Story:** As a user accessing the dashboard on different screen sizes, I want the layout to adapt gracefully while maintaining the clean design and functionality, so that I can work efficiently on any device.

#### Acceptance Criteria

1. WHEN viewing the dashboard on screens smaller than 1024px, THE Sidebar Navigation MAY collapse to icon-only or move to a top navigation bar
2. WHEN viewing the dashboard on mobile screens (smaller than 768px), THE Card-Based Layout SHALL stack vertically with full width
3. WHEN a table exists on mobile screens, THE Table SHALL either adapt to a horizontal scroll view or convert to a card-based list display
4. WHEN buttons and interactive elements are displayed on mobile, THE Touch Target Size SHALL be at least 44x44px for accessibility
5. WHEN the viewport is resized, THE Layout SHALL reflow smoothly without breaking or causing scroll issues

### Requirement 13: Accessibility and Semantic HTML

**User Story:** As a user relying on assistive technologies, I want the dashboard to be fully accessible with proper semantic markup and ARIA labels, so that I can navigate and understand all content.

#### Acceptance Criteria

1. ALL Text Content SHALL use appropriate semantic HTML tags (h1-h6 for headings, p for paragraphs, etc.)
2. ALL Interactive Elements (buttons, links, form inputs) SHALL have clear, descriptive labels and ARIA attributes
3. WHEN an icon is used as the primary affordance (e.g., sidebar icon), THE Icon SHALL have an accompanying aria-label or title attribute
4. ALL Form Controls SHALL have associated labels (using <label> elements with proper for attribute)
5. THE Color Scheme SHALL not rely solely on color to convey meaning (e.g., status badges SHALL use both color and text)
6. ALL Content SHALL be keyboard navigable without mouse required
7. WHEN a modal or overlay is displayed, THE Focus SHALL be trapped within the modal and restored appropriately when closed

