# Requirements Document

## Introduction

The RM-facing Monetization Center is a new workspace for discovering, claiming, and managing product opportunities. The first release uses current mock or in-memory data and existing assignment and product APIs where possible. The supplied Nexus screenshot is a visual reference for a left-side navigation shell, not an exact reproduction.

## Glossary

- **Monetization Center**: RM workspace for discovering, claiming, managing, and tracking product opportunities.
- **Relationship Manager (RM)**: User who manages lead product opportunities.
- **Current RM**: Authenticated RM using the Monetization Center.
- **Lead Pool**: View of product opportunities available for the Current RM to claim.
- **My Leads**: View of leads where the Current RM owns at least one product opportunity.
- **Product Opportunity**: A lead's opportunity for one specific product, such as Education Loan or Credit Card.
- **Product Tab**: View of Product Opportunities owned by the Current RM for one product.
- **Existing Lead Detail Experience**: The existing LeadDetailView or LeadDetailViewRefactored flow and its supported lead actions.
- **Existing RM Dashboard**: RmDashboard and its current metrics and behavior.
- **Existing APIs**: Current assignment and product APIs backed by the application's mock or in-memory data.

## Requirements

### Requirement 1: Monetization Center Navigation

**User Story:** As an RM, I want one workspace for monetization work, so that I can move between performance tracking and product opportunities from a consistent shell.

#### Acceptance Criteria

1. WHEN the Current RM opens the Monetization Center, THE Monetization Center SHALL display a left-side Primary Navigation with Dashboard, Lead Pool, and My Leads as lead-management items.
2. WHEN the Current RM views the Primary Navigation, THE Monetization Center SHALL display a separate Products section containing Education Loan and Credit Card for the first release.
3. WHEN the Current RM selects a navigation item, THE Monetization Center SHALL show a clear active state for the selected item.
4. THE Monetization Center SHALL use the Nexus screenshot as visual reference for left-side navigation hierarchy and layout without requiring an exact reproduction.
5. WHEN the Current RM changes navigation sections, THE Monetization Center SHALL preserve the selected section and the lead context required to return to the prior view.

### Requirement 2: Lead Pool

**User Story:** As an RM, I want to see product opportunities available to me, so that I can choose new work to claim.

#### Acceptance Criteria

1. WHEN the Current RM opens Lead Pool, THE Lead Pool SHALL show available Product Opportunities that the Current RM can claim.
2. WHEN a Product Opportunity is owned by an RM, THE Lead Pool SHALL exclude that Product Opportunity from the Current RM's available opportunities.
3. WHEN the Current RM selects an available Product Opportunity, THE Monetization Center SHALL provide access to the associated lead information needed before claiming.
4. WHEN the Current RM claims an available Product Opportunity, THE Monetization Center SHALL claim only the selected Product Opportunity without a confirmation step.
5. WHEN the Lead Pool contains no available Product Opportunities, THE Lead Pool SHALL show an empty state explaining that no opportunities are currently available.

### Requirement 3: Product-Opportunity Ownership

**User Story:** As an RM, I want ownership to apply to a specific product opportunity, so that different RMs can manage different products for the same lead.

#### Acceptance Criteria

1. THE Monetization Center SHALL represent ownership independently for each Product Opportunity on a lead.
2. WHEN one lead has Education Loan and Credit Card Product Opportunities, THE Monetization Center SHALL allow the Education Loan opportunity and Credit Card opportunity to have different RM owners.
3. WHEN the Current RM claims a Product Opportunity, THE Monetization Center SHALL associate the Current RM with that Product Opportunity only.
4. WHEN a claim succeeds, THE Monetization Center SHALL immediately remove the Product Opportunity from Lead Pool and show the associated lead in My Leads when the Current RM owns no other opportunity on that lead.
5. WHEN a Product Opportunity cannot be claimed, THE Monetization Center SHALL explain the failure and preserve the Product Opportunity's current owner and claim state.

### Requirement 4: My Leads

**User Story:** As an RM, I want to see leads in which I own work, so that I can manage my active portfolio.

#### Acceptance Criteria

1. WHEN the Current RM opens My Leads, THE My Leads view SHALL show each lead for which the Current RM owns at least one Product Opportunity.
2. WHEN the Current RM owns multiple Product Opportunities on one lead, THE My Leads view SHALL show that lead once and SHALL expose the owned Product Opportunities in the lead context.
3. WHEN no Product Opportunity on a lead is owned by the Current RM, THE My Leads view SHALL exclude that lead from the Current RM's portfolio.
4. WHEN the Current RM selects a lead in My Leads, THE Monetization Center SHALL open the Existing Lead Detail Experience with the selected lead context.
5. WHEN the Current RM owns no Product Opportunities, THE My Leads view SHALL show an empty state explaining that claiming an opportunity adds its lead to the portfolio.
6. WHEN existing lead data provides active, pending-action, or completed states, THE My Leads view SHALL display those states for the Current RM's owned opportunities.

### Requirement 5: Product Tabs

**User Story:** As an RM, I want product-specific views of my owned opportunities, so that I can focus work by product.

#### Acceptance Criteria

1. WHEN the Current RM opens Education Loan, THE Education Loan Product Tab SHALL show only Education Loan Product Opportunities owned by the Current RM.
2. WHEN the Current RM opens Credit Card, THE Credit Card Product Tab SHALL show only Credit Card Product Opportunities owned by the Current RM.
3. WHEN the Current RM selects a Product Opportunity in a Product Tab, THE Monetization Center SHALL preserve the associated lead context and open the Existing Lead Detail Experience.
4. WHEN a Product Tab has no Product Opportunities owned by the Current RM, THE Product Tab SHALL show a product-specific empty state.
5. WHEN the Current RM views a Product Tab, THE Product Tab SHALL retain existing product actions and relevant product journey access supported by the Existing Lead Detail Experience.

### Requirement 6: RM Dashboard

**User Story:** As an RM, I want the Monetization Center Dashboard to summarize my work, so that I can prioritize follow-up and track performance.

#### Acceptance Criteria

1. WHEN the Current RM opens Dashboard, THE Monetization Center Dashboard SHALL reuse or adapt the Existing RM Dashboard.
2. THE Monetization Center Dashboard SHALL retain the Existing RM Dashboard's current metrics and behavior as the source of truth.
3. WHEN an Existing RM Dashboard metric supports navigation, THE Monetization Center Dashboard SHALL provide a clear path to the related lead or product view.
4. WHEN the Existing RM Dashboard displays lead or product information, THE Monetization Center Dashboard SHALL apply the Current RM context without changing the metric definitions.

### Requirement 7: Existing Flow Compatibility

**User Story:** As an RM, I want the new shell to preserve useful existing capabilities, so that adopting the Monetization Center does not interrupt lead management.

#### Acceptance Criteria

1. THE Monetization Center SHALL reuse or adapt LeadTable, AllLeadsView, and the Existing Lead Detail Experience where those components provide the required lead views and actions.
2. THE Monetization Center SHALL retain access to ProductPerformancePage and EducationLoanJourneyPage where those existing views support product performance or Education Loan work.
3. WHEN the Current RM opens lead details from My Leads or a Product Tab, THE Existing Lead Detail Experience SHALL remain compatible with its existing lead actions and navigation behavior.
4. THE Monetization Center SHALL preserve existing lead information and in-scope actions unless an equivalent approved Monetization Center path is provided.
5. WHEN the first release reads or updates claim and product state, THE Monetization Center SHALL use Existing APIs and current mock or in-memory data where those capabilities are available.

### Requirement 8: Empty and Error States

**User Story:** As an RM, I want clear feedback when a queue has no work or an action fails, so that I know what to do next.

#### Acceptance Criteria

1. WHEN Lead Pool has no available Product Opportunities, THE Monetization Center SHALL present the Lead Pool empty state.
2. WHEN My Leads has no leads containing a Product Opportunity owned by the Current RM, THE Monetization Center SHALL present the My Leads empty state.
3. WHEN Education Loan has no Product Opportunities owned by the Current RM, THE Monetization Center SHALL present the Education Loan empty state.
4. WHEN Credit Card has no Product Opportunities owned by the Current RM, THE Monetization Center SHALL present the Credit Card empty state.
5. WHEN a claim or data operation returns an error, THE Monetization Center SHALL show a descriptive error state and SHALL preserve the last known ownership state.
