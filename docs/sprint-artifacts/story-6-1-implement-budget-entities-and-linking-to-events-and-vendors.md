# Story 6.1 – Implement Budget Entities and Linking to Events and Vendors

## 1. Story Summary

**As a** couple  
**I want** a structured way to track our wedding budget, actual spend, and links to events and vendors  
**So that** we can see where our money is going and avoid overspending.

Epic: **Epic 6 – Budget & Payments Overview** ([`epics.md`](docs/epics.md:245–272))  

---

## 2. Business & Product Rationale

From PRD ([`prd.md`](docs/prd.md:349–408)):

- Budget is a **top anxiety driver** for couples and parents:
  - Multiple events.
  - Many vendors.
  - Hidden costs (taxes, service charges, overtime).
- Today:
  - Budgets are tracked in spreadsheets or not at all.
  - It’s hard to see:
    - Planned vs actual.
    - Per-event and per-category breakdowns.

wedX should:

- Provide a **budget model** that:
  - Links to events and vendors.
  - Tracks planned vs actual amounts.
  - Supports categories (venue, catering, decor, etc.).

From UX ([`ux-design-specification.md`](docs/ux-design-specification.md:391–440)):

- Budget UX principles:
  - “High-level first, details later” – show summary before line-item complexity.
  - “Parents can understand it” – clear categories and totals.
  - “No shame” – neutral, supportive language.

From Epics ([`epics.md`](docs/epics.md:245–272)):

- Epic 6 introduces:
  - Budget entities.
  - Links to events and vendors.
  - Later: payments, installments, and alerts.

This story (6.1) focuses on the **core budget entities and linking**, not full UI or payment flows yet.

---

## 3. Scope

### In Scope

1. Define and implement the **Budget data model**:

   - `BudgetCategory`.
   - `BudgetLineItem` (per event/vendor/category).

2. Implement **backend APIs** for:

   - Creating and managing budget categories and line items.
   - Linking line items to events and vendors.

3. Provide a **minimal internal Budget view**:

   - Route: `/budget` (skeleton).
   - List of budget line items with:
     - Category.
     - Event.
     - Vendor.
     - Planned vs actual amounts.

### Out of Scope

- Detailed budget UI (charts, filters, advanced interactions).
- Payment tracking (installments, due dates).
- Alerts and AI-based budget suggestions.

This story is about **establishing the budget domain model and basic linking**.

---

## 4. Technical Requirements

### 4.1 Data Model

From architecture ([`architecture.md`](docs/architecture.md:199–260)), PRD ([`prd.md`](docs/prd.md:349–408)), and previous epics:

Existing entities:

- `Event` (Story 2.2).
- `Vendor` (Story 4.1).
- `ChecklistItem` (Story 3.1) – may later link to budget.

Introduce:

1. **BudgetCategory**

   ```ts
   interface BudgetCategory {
     id: string;
     weddingId: string;
     key: string;        // e.g. 'venue', 'catering', 'decor', 'photography'
     name: string;       // display name
     orderIndex: number;
     createdAt: Date;
     updatedAt: Date;
   }
   ```

   - Storage:
     - `budget_categories` table/collection.

   - Seed categories (configurable), e.g.:

     - Venue
     - Catering
     - Decor & Flowers
     - Photography & Videography
     - Music & Entertainment
     - Attire & Jewelry
     - Invitations & Stationery
     - Gifts & Favors
     - Transport
     - Other

2. **BudgetLineItem**

   ```ts
   interface BudgetLineItem {
     id: string;
     weddingId: string;
     categoryId: string;
     eventId?: string;      // optional: which event this relates to
     vendorId?: string;     // optional: linked vendor
     name: string;          // e.g. 'Reception venue', 'Poruwa decor'
     description?: string;
     plannedAmount: number; // planned budget
     actualAmount?: number; // actual spend
     currency: string;      // e.g. 'LKR'
     notes?: string;
     createdAt: Date;
     updatedAt: Date;
   }
   ```

   - Storage:
     - `budget_line_items` table/collection.

3. **Future-proofing for Payments**

   - Do **not** implement payments yet, but:
     - Keep `BudgetLineItem` flexible enough to add:
       - `paymentStatus`, `paidAmount`, `dueDate`, etc. later.

### 4.2 APIs

Implement backend endpoints:

1. **List Budget Categories**

   - `GET /api/weddings/:id/budget/categories`

   - Returns:

     ```ts
     interface GetBudgetCategoriesResponse {
       categories: BudgetCategory[];
     }
     ```

2. **Create/Update Budget Category** (optional for this story)

   - `POST /api/weddings/:id/budget/categories`
   - `PATCH /api/budget/categories/:categoryId`

3. **List Budget Line Items**

   - `GET /api/weddings/:id/budget/line-items`

   - Query params (optional):

     - `eventId`
     - `vendorId`
     - `categoryId`

   - Returns:

     ```ts
     interface GetBudgetLineItemsResponse {
       lineItems: (BudgetLineItem & {
         category: BudgetCategory;
         event?: Event;
         vendor?: Vendor;
       })[];
     }
     ```

4. **Create Budget Line Item**

   - `POST /api/weddings/:id/budget/line-items`

   - Request body:

     ```ts
     interface CreateBudgetLineItemRequest {
       categoryId: string;
       eventId?: string;
       vendorId?: string;
       name: string;
       description?: string;
       plannedAmount: number;
       actualAmount?: number;
       currency: string;
       notes?: string;
     }
     ```

5. **Update Budget Line Item**

   - `PATCH /api/budget/line-items/:lineItemId`

   - Allows updating:
     - `categoryId`, `eventId`, `vendorId`
     - `name`, `description`
     - `plannedAmount`, `actualAmount`
     - `currency`
     - `notes`

6. **Delete Budget Line Item** (optional)

   - `DELETE /api/budget/line-items/:lineItemId`

### 4.3 Minimal Budget View UI

From UX ([`ux-design-specification.md`](docs/ux-design-specification.md:391–440)) and AppShell:

1. **Route & Layout**

   - `app/budget/page.tsx` – Budget overview page.
   - Uses main AppShell:
     - Sidebar with “Budget” item.
     - Top bar with wedding name.

2. **Budget Line Items Table (MVP)**

   - Columns:

     - Name.
     - Category.
     - Event.
     - Vendor.
     - Planned amount.
     - Actual amount.
     - Difference (actual – planned).

   - Data:

     - `GET /api/weddings/:id/budget/line-items`.

   - Basic interactions:

     - “Add line item” button:
       - Opens dialog with:
         - Category select.
         - Event select (optional).
         - Vendor select (optional).
         - Name, description.
         - Planned amount, currency.
       - On submit:
         - `POST /api/weddings/:id/budget/line-items`.
         - Refresh list.

     - Inline edit or detail dialog for:
       - Actual amount.
       - Notes.

3. **Linking to Events and Vendors**

   - Event column:

     - Show event name.
     - Click → `/events/[eventId]`.

   - Vendor column:

     - Show vendor name.
     - Click → `/vendors` (with filter) or `/vendors/[vendorId]` if you add a detail route.

4. **Summary (Optional for this Story)**

   - At top of page:

     - Show simple totals:
       - Total planned.
       - Total actual.
       - Difference.

   - This can be computed on the frontend from line items.

---

## 5. Dependencies & Relationships

### 5.1 Upstream Dependencies

- **Epic 1 – Foundation & AppShell**:

  - Provides:
    - Auth and `weddingId`.
    - AppShell layout and navigation.

- **Epic 2 – Events**:

  - Provides:
    - Events to link budget items to.

- **Epic 4 – Vendors & WhatsApp Bridge**:

  - Provides:
    - Vendors to link budget items to.

- **Epic 3 – Checklists** (optional):

  - Some checklist items may later be linked to budget line items.

### 5.2 Downstream Dependencies

This story is a foundation for:

- Later Epic 6 stories:

  - Payments & installments.
  - Budget alerts and AI suggestions.
  - Per-event and per-category charts.

- **Epic 7 – AI Planner & Ritual Intelligence**:

  - Uses budget data to:
    - Suggest optimizations.
    - Highlight overspending risks.

If this story is incomplete, budget-related features will lack a consistent data model and UI entry point.

---

## 6. Acceptance Criteria

From [`epics.md`](docs/epics.md:245–272) plus technical elaboration:

1. **Budget data model implemented**

   - `budget_categories` and `budget_line_items` tables/collections exist with fields described above.
   - Line items link correctly to:
     - `weddingId`
     - `categoryId`
     - Optional `eventId` and `vendorId`.

2. **APIs work**

   - `GET /api/weddings/:id/budget/categories` returns seeded categories.
   - `GET /api/weddings/:id/budget/line-items` returns line items with category, event, and vendor info.
   - `POST /api/weddings/:id/budget/line-items` creates a line item.
   - `PATCH /api/budget/line-items/:lineItemId` updates a line item.

3. **Budget UI exists (MVP)**

   - When I navigate to `/budget`:
     - I see a table of budget line items (empty state if none).
     - I can add a new line item via a form.
     - I can edit actual amount and notes for existing items.
   - Event and vendor columns:
     - Show names and link to their respective pages.

4. **UX alignment**

   - Budget UI:
     - Uses wedX design system (Tailwind + shadcn/ui).
     - Is simple and non-intimidating.
   - Labels and copy:
     - Are clear and understandable to both couples and parents.

---

## 7. Definition of Done (Story 6.1)

Story 6.1 is **Done** when:

1. Budget categories and line items data model and migrations are implemented.
2. CRUD APIs for budget line items (and read for categories) are implemented and tested.
3. `/budget` page exists with:
   - Line item listing.
   - Add/edit line item flows.
4. Line items can be linked to events and vendors, and those links are visible in the UI.
5. Implementation follows architecture and UX conventions (Next.js App Router, Tailwind, shadcn/ui).
6. `docs/sprint-artifacts/sprint-status.yaml` is updated to move:
   - `6-1-implement-budget-entities-and-linking-to-events-and-vendors` from `backlog` → `drafted` (once this story file exists) and later `done` when implemented.