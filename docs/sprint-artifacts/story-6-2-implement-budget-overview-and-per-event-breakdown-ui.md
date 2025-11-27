# Story 6.2 – Implement Budget Overview and Per-Event Breakdown UI

## 1. Story Summary

**As a** couple (and our parents)  
**I want** a clear budget overview and per-event breakdown  
**So that** we can see how much we planned vs actually spent, and where the money is going.

Epic: **Epic 6 – Budget & Payments Overview** ([`epics.md`](docs/epics.md:245–272))  
Depends on:  
- [`story-2-2-implement-step-2-multi-event-setup.md`](docs/sprint-artifacts/story-2-2-implement-step-2-multi-event-setup.md:1)  
- [`story-4-1-implement-vendor-directory-and-basic-linking.md`](docs/sprint-artifacts/story-4-1-implement-vendor-directory-and-basic-linking.md:1)  
- [`story-6-1-implement-budget-entities-and-linking-to-events-and-vendors.md`](docs/sprint-artifacts/story-6-1-implement-budget-entities-and-linking-to-events-and-vendors.md:1)  

---

## 2. Business & Product Rationale

From PRD ([`prd.md`](docs/prd.md:349–408)):

- Couples and parents care about:
  - **Total budget vs actual**.
  - **Per-event** spend (e.g., Poruwa vs Reception).
  - **Per-category** spend (e.g., decor vs catering).
- Pain points:
  - Spreadsheets are hard to keep updated.
  - No single view of:
    - “How much have we spent so far?”
    - “Which event is most expensive?”
    - “Which categories are over budget?”

wedX should:

- Provide a **Budget Overview** that:
  - Summarizes totals.
  - Breaks down by event and category.
  - Surfaces overspend/underspend.

From UX ([`ux-design-specification.md`](docs/ux-design-specification.md:391–440)):

- Budget UX principles:
  - “High-level first, details later.”
  - “Parents can understand it” – simple charts and tables.
  - “No shame” – neutral, supportive language and colors.

From Epics ([`epics.md`](docs/epics.md:245–272)):

- After core budget entities (Story 6.1), Epic 6 requires:
  - A **Budget Overview UI** that:
    - Uses `BudgetLineItem` data.
    - Provides per-event and per-category breakdowns.

This story (6.2) focuses on the **overview and breakdown UI**, not payments or alerts.

---

## 3. Scope

### In Scope

1. Implement a **Budget Overview page**:

   - Route: `/budget` (enhancing the MVP from Story 6.1).
   - Sections:
     - Overall summary.
     - Per-event breakdown.
     - Per-category breakdown.
     - Line items table (from 6.1, refined).

2. Implement **aggregations** on the backend or frontend:

   - Totals:
     - Planned vs actual.
   - Grouped by:
     - Event.
     - Category.

3. Integrate **budget snippets** into:

   - Event detail pages (`/events/[eventId]`).
   - Today dashboard (optional hook).

### Out of Scope

- Payment schedules and installments.
- Alerts and AI-based suggestions.
- Multi-currency handling beyond a single currency per wedding.

This story is about **making budget data understandable and navigable**.

---

## 4. Technical Requirements

### 4.1 Data Sources

From Story 6.1 ([`story-6-1-implement-budget-entities-and-linking-to-events-and-vendors.md`](docs/sprint-artifacts/story-6-1-implement-budget-entities-and-linking-to-events-and-vendors.md:80–152)):

- `BudgetCategory`
- `BudgetLineItem` with:
  - `categoryId`
  - Optional `eventId`
  - Optional `vendorId`
  - `plannedAmount`
  - `actualAmount`
  - `currency`

From other epics:

- `Event` (Story 2.2).
- `Vendor` (Story 4.1).

### 4.2 Aggregation API (Optional but Recommended)

Implement a dedicated aggregation endpoint:

- `GET /api/weddings/:id/budget/overview`

- Returns:

  ```ts
  interface BudgetOverviewResponse {
    currency: string;
    totals: {
      planned: number;
      actual: number;
    };
    byCategory: {
      categoryId: string;
      categoryName: string;
      planned: number;
      actual: number;
    }[];
    byEvent: {
      eventId: string | null; // null for global/non-event-specific
      eventName: string;
      planned: number;
      actual: number;
    }[];
  }
  ```

Implementation options:

- Backend aggregation (preferred for performance).
- Or frontend aggregation using `GET /api/weddings/:id/budget/line-items`.

### 4.3 Budget Overview UI

Enhance `app/budget/page.tsx` from Story 6.1:

1. **Layout**

   - Use AppShell.
   - Page sections:

     - Header:
       - Title: “Budget Overview”.
       - Currency label.
     - Summary cards.
     - Per-event breakdown.
     - Per-category breakdown.
     - Line items table (from 6.1).

2. **Summary Cards**

   - Use shadcn `Card` components.

   - Cards:

     1. **Total Planned**

        - Label: “Planned total”.
        - Value: sum of `plannedAmount`.

     2. **Total Actual**

        - Label: “Actual total”.
        - Value: sum of `actualAmount` (treat missing as 0).

     3. **Difference**

        - Label: “Difference”.
        - Value: `actual - planned`.
        - Color:
          - Neutral if close to 0.
          - Warning if significantly over planned.

3. **Per-Event Breakdown**

   - Section: “By event”.

   - UI options:

     - Simple table:

       - Columns:
         - Event name (or “Global / Not tied to event”).
         - Planned.
         - Actual.
         - Difference.

     - Optional bar chart (if you want to add a simple chart library later).

   - Data:

     - From `BudgetOverviewResponse.byEvent`.

   - Interactions:

     - Clicking an event row:
       - Filters line items table to that event.
       - Or navigates to `/events/[eventId]#budget` (if you add an anchor).

4. **Per-Category Breakdown**

   - Section: “By category”.

   - UI:

     - Table:

       - Columns:
         - Category name.
         - Planned.
         - Actual.
         - Difference.

     - Optional stacked bar or donut chart.

   - Data:

     - From `BudgetOverviewResponse.byCategory`.

   - Interactions:

     - Clicking a category row:
       - Filters line items table to that category.

5. **Line Items Table (Refinement)**

   - Reuse table from Story 6.1, with:

     - Filters:
       - By event.
       - By category.
       - By vendor.

     - Columns:
       - Name.
       - Category.
       - Event.
       - Vendor.
       - Planned.
       - Actual.
       - Difference.

   - Filtering behavior:

     - When user clicks an event or category in breakdown sections:
       - Apply corresponding filter to line items table.

### 4.4 Event Detail Integration

From Story 2.6 ([`story-2-6-implement-today-dashboard-deep-dive-and-navigation.md`](docs/sprint-artifacts/story-2-6-implement-today-dashboard-deep-dive-and-navigation.md:120–214)):

- On `/events/[eventId]/page.tsx`:

  - Add a **Budget snippet** section:

    - Show:

      - Planned total for this event.
      - Actual total for this event.
      - Difference.

    - Data:

      - Filter `BudgetLineItem` by `eventId` and aggregate, or:
      - Use `GET /api/weddings/:id/budget/overview` and pick the event entry.

    - Link:

      - “View full budget” → `/budget?eventId=...` (pre-filtered).

### 4.5 Today Dashboard Integration (Optional Hook)

From Today dashboard stories (2.5, 2.6):

- On `/today`:

  - Add a **Budget card** (optional for this story, but design for it):

    - Show:

      - Total planned vs actual.
      - Simple message:
        - “You’ve planned LKR X and spent LKR Y so far.”

    - Link:

      - “Open budget overview” → `/budget`.

---

## 5. Dependencies & Relationships

### 5.1 Upstream Dependencies

- **Story 6.1 – Budget Entities and Linking**:

  - Provides:
    - `BudgetCategory` and `BudgetLineItem`.
    - `/budget` MVP page.

- **Epic 2 – Events**:

  - Provides:
    - Events to group budget by.

- **Epic 4 – Vendors**:

  - Provides:
    - Vendors to show in line items.

- **Epic 1 – AppShell**:

  - Provides:
    - Layout and navigation.

### 5.2 Downstream Dependencies

This story is a foundation for:

- Later Epic 6 stories:

  - Payments & installments:
    - Will add payment status and due dates to line items.
  - Alerts and AI suggestions:
    - Will use aggregated budget data to:
      - Highlight overspending.
      - Suggest adjustments.

- **Epic 7 – AI Planner & Ritual Intelligence**:

  - Uses budget overview to:
    - Suggest trade-offs (e.g., reduce decor to increase photography budget).

If this story is incomplete, budget data will exist but remain hard to interpret, reducing its practical value.

---

## 6. Acceptance Criteria

From [`epics.md`](docs/epics.md:245–272) plus technical elaboration:

1. **Aggregations available**

   - Either via:
     - `GET /api/weddings/:id/budget/overview`, or
     - Frontend aggregation of `BudgetLineItem`s.
   - Aggregations include:
     - Overall totals (planned, actual).
     - Per-event totals.
     - Per-category totals.

2. **Budget Overview page**

   - When I navigate to `/budget`:
     - I see:
       - Summary cards for total planned, total actual, and difference.
       - A per-event breakdown section.
       - A per-category breakdown section.
       - A line items table.
   - Clicking an event or category row:
     - Filters the line items table accordingly.

3. **Line items table filters**

   - I can filter line items by:
     - Event.
     - Category.
     - Vendor.
   - Filters update the table without a full page reload.

4. **Event detail budget snippet**

   - On `/events/[eventId]`:
     - I see a budget snippet for that event:
       - Planned total.
       - Actual total.
       - Difference.
     - I can click a link to open `/budget` pre-filtered for that event.

5. **UX alignment**

   - Budget Overview:
     - Uses wedX design system (Tailwind + shadcn/ui).
     - Is simple and readable.
     - Uses neutral, supportive language and colors.
   - Parents and non-technical users can:
     - Understand the main numbers.
     - Navigate to details if needed.

---

## 7. Definition of Done (Story 6.2)

Story 6.2 is **Done** when:

1. Budget aggregations (overall, per-event, per-category) are implemented and tested.
2. `/budget` page shows:
   - Summary cards.
   - Per-event and per-category breakdowns.
   - Filterable line items table.
3. Event detail pages show a budget snippet and link to the budget overview.
4. Implementation follows architecture and UX conventions (Next.js App Router, Tailwind, shadcn/ui).
5. `docs/sprint-artifacts/sprint-status.yaml` is updated to move:
   - `6-2-implement-budget-overview-and-per-event-breakdown-ui` from `backlog` → `drafted` (once this story file exists) and later `done` when implemented.