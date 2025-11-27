# Story 3.2 – Implement Checklist UI and Filtering

## 1. Story Summary

**As a** couple (and our families)  
**I want** an organized checklist interface that reflects our specific wedding configuration  
**So that** we can easily see what needs to be done, filter by what matters, and track progress.

Epic: **Epic 3 – Checklists & Jewelry Module** ([`epics.md`](docs/epics.md:146–176))  
Depends on: **Story 3.1 – Implement Core Checklist Engine and Data Model** ([`story-3-1-implement-core-checklist-engine-and-data-model.md`](docs/sprint-artifacts/story-3-1-implement-core-checklist-engine-and-data-model.md:1))  

---

## 2. Business & Product Rationale

From PRD ([`prd.md`](docs/prd.md:177–236)):

- Checklists are only valuable if:
  - They are **readable and navigable**.
  - Users can **filter** by:
    - Time (when to do things).
    - Event (which ceremony/party it belongs to).
    - Category (e.g., jewelry, documents, vendors).
  - Users can **mark items as done** and see progress.

From UX ([`ux-design-specification.md`](docs/ux-design-specification.md:221–280)):

- Checklist UX principles:
  - “Never overwhelm the couple” – show a **focused subset** by default (e.g., “This week”).
  - “Parents can understand it” – clear labels, no jargon.
  - “Progress feels motivating” – visible completion indicators.

From Epics ([`epics.md`](docs/epics.md:146–176)):

- After the core engine (Story 3.1), Epic 3 requires:
  - A **Checklist UI** that:
    - Surfaces generated items.
    - Supports filtering and basic interactions.
  - This UI will later be extended with:
    - Jewelry-specific views.
    - Assignments.
    - Notifications.

This story (3.2) focuses on the **first usable checklist interface**.

---

## 3. Scope

### In Scope

1. Implement a **Checklist page** under the main AppShell:

   - Route: `/checklist`.
   - Uses the global wedding checklist generated in Story 3.1.

2. Display checklist items with **grouping and filtering**:

   - Group by:
     - Time bucket (e.g., “6+ months before”, “1 week before”, “On the day”).
   - Filter by:
     - Event.
     - Category.
     - Status (todo / in progress / done).

3. Support **basic interactions**:

   - Mark item as done / not done.
   - View item details (description, notes).
   - Edit notes (inline or in a side panel).

4. Integrate with **Today dashboard**:

   - Today dashboard “Next actions” card can deep-link into `/checklist` with filters applied (e.g., “This week”).

### Out of Scope

- Assigning items to people.
- Due date editing and reminders.
- Drag-and-drop reordering.
- Dedicated jewelry-only views (later Epic 3 stories).

This story is about **making the generated checklist usable** day-to-day.

---

## 4. Technical Requirements

### 4.1 Routing & Layout

From architecture ([`architecture.md`](docs/architecture.md:151–190)) and UX ([`ux-design-specification.md`](docs/ux-design-specification.md:79–118,221–280)):

- Route:

  - `app/checklist/page.tsx` – main checklist page.

- Layout:

  - Use the main AppShell from Story 1.2:
    - Sidebar with navigation (Today, Checklist, Events, Guests, Vendors, Budget, AI, Inspiration, Settings).
    - Top bar with wedding name and user menu.

- Navigation:

  - Sidebar “Checklist” item routes to `/checklist`.
  - Today dashboard “Next actions” card links to `/checklist` (optionally with query params for filters).

### 4.2 Data Fetching

Use the APIs defined in Story 3.1:

- `GET /api/weddings/:id/checklists`

  - Returns:
    - Checklist metadata.
    - Items with:
      - `id`
      - `title`
      - `description`
      - `type`
      - `category`
      - `timeBucket`
      - `eventId`
      - `status`
      - `isJewelry`
      - `dueDate`
      - `notes`
      - `orderIndex`

- `PATCH /api/checklist-items/:id`

  - Used to:
    - Update `status`.
    - Update `notes`.

Frontend implementation:

- Add a client module, e.g.:

  - [`lib/api/checklists.ts`](lib/api/checklists.ts:1)

- Use React Query or similar (if present) or `useEffect` + `fetch` to:
  - Load checklist items on page load.
  - Optimistically update status and notes.

### 4.3 UI Structure

Use shadcn/ui + Tailwind for components.

#### 4.3.1 Filters Panel

- Position:

  - Left side or top of the checklist page.

- Filters:

  1. **Time bucket** (radio or tabs):

     - Options:
       - “All”
       - “6+ months before”
       - “3–6 months before”
       - “1–3 months before”
       - “1 month before”
       - “1 week before”
       - “On the day”
       - “After”

  2. **Event** (select):

     - Options:
       - “All events”
       - Each event from `events` table (Story 2.2).

  3. **Category** (multi-select or chips):

     - Options:
       - Jewelry
       - Documents
       - Vendors
       - Logistics
       - Guests
       - Budget
       - Other

  4. **Status** (checkboxes):

     - “To do”
     - “In progress”
     - “Done”

- Implementation:

  - Use shadcn components:
    - `Select`, `Checkbox`, `Badge`, `Tabs` or `SegmentedControl` pattern.

#### 4.3.2 Checklist List

- Grouping:

  - Primary grouping by **time bucket**.
  - Within each time bucket, sort by:
    - Category.
    - `orderIndex`.

- Item row:

  - Show:
    - Checkbox or toggle for status (todo/done).
    - Title.
    - Category badge.
    - Event name (if event-specific).
    - Jewelry indicator (icon or badge).
  - Clicking row:
    - Expands to show description and notes (accordion) or opens a side panel.

- Status interaction:

  - Clicking the status checkbox:
    - Toggles between `todo` and `done` (optionally `in_progress` via a dropdown).
    - Sends `PATCH /api/checklist-items/:id` with new status.
    - Optimistically updates UI.

#### 4.3.3 Item Details

- Options:

  - Inline expansion (accordion) or right-side drawer.

- Fields:

  - Description (read-only).
  - Notes (editable `Textarea`).
  - Due date (optional date picker – can be read-only or editable depending on scope).

- Notes editing:

  - On blur or “Save”:
    - `PATCH /api/checklist-items/:id` with updated `notes`.

### 4.4 URL-based Filtering

Support query parameters for deep links, e.g.:

- `/checklist?timeBucket=this_week`
- `/checklist?category=jewelry`
- `/checklist?eventId=evt_123`

Implementation:

- In `app/checklist/page.tsx`:

  - Read search params via Next.js hooks.
  - Initialize filter state from URL.
  - Optionally update URL when filters change (for shareable links).

This allows:

- Today dashboard “Next actions” card to link directly to a filtered view.

---

## 5. Dependencies & Relationships

### 5.1 Upstream Dependencies

- **Story 3.1 – Core Checklist Engine and Data Model**:

  - Must be implemented:
    - Data model.
    - Generation endpoint.
    - Retrieval and update APIs.

- **Epic 2 – Wizard & Control Room**:

  - Provides:
    - Wedding type.
    - Events.
    - Rituals.
  - Checklist engine uses these to generate items.

- **Epic 1 – AppShell**:

  - Provides:
    - Layout and navigation.
    - Auth context with `weddingId`.

### 5.2 Downstream Dependencies

This story is a foundation for:

- **Jewelry-specific stories in Epic 3**:

  - Will add:
    - Dedicated jewelry views.
    - Jewelry-specific filters and summaries.

- **Epic 4 – Vendors & WhatsApp Bridge**:

  - Will integrate:
    - Vendor-related checklist items.
    - Links from checklist items to vendor flows.

- **Epic 6 – Budget & Payments Overview**:

  - Will use:
    - Checklist items to infer budget categories and progress.

- **Epic 7 – AI Planner & Ritual Intelligence**:

  - Will:
    - Suggest checklist items.
    - Reprioritize or highlight critical tasks.

If this story is incomplete, users will not have a usable interface to interact with the generated checklist, blocking much of the perceived value of Epic 3.

---

## 6. Acceptance Criteria

From [`epics.md`](docs/epics.md:146–176) plus technical elaboration:

1. **Checklist page exists and loads data**

   - When I navigate to `/checklist` while authenticated,
     - Then I see:
       - The AppShell layout.
       - A checklist view populated with items generated for my wedding.

2. **Filtering works**

   - When I change filters (time bucket, event, category, status),
     - Then the list updates to show only matching items.
   - When I open `/checklist` with query params (e.g., `?category=jewelry`),
     - Then filters initialize accordingly and the list is filtered.

3. **Grouping and display**

   - Items are grouped by time bucket with clear headings.
   - Each item row shows:
     - Title.
     - Category.
     - Event (if applicable).
     - Status control.
     - Jewelry indicator (if `isJewelry` is true).

4. **Status updates**

   - When I toggle an item’s status between todo and done,
     - Then the UI updates immediately.
     - A request is sent to `PATCH /api/checklist-items/:id`.
     - On reload, the updated status persists.

5. **Item details and notes**

   - When I expand an item or open its details,
     - Then I can see description and notes.
   - When I edit notes and save,
     - Then the notes are persisted and visible on reload.

6. **Integration with Today dashboard**

   - From the Today dashboard “Next actions” card,
     - When I click a link to “View all tasks” or similar,
       - Then I am taken to `/checklist` (optionally with filters applied).

7. **UX alignment**

   - The checklist UI:
     - Uses wedX design system (Tailwind + shadcn/ui).
     - Is readable and not overwhelming.
     - Is understandable to both couples and parents.

---

## 7. Definition of Done (Story 3.2)

Story 3.2 is **Done** when:

1. `/checklist` route exists and uses the AppShell layout.
2. Checklist items are fetched from the backend and displayed with grouping and filtering.
3. Users can change filters and see the list update accordingly.
4. Users can mark items as done and edit notes, with changes persisted via APIs.
5. URL-based filters are supported for deep links from Today dashboard.
6. Implementation follows architecture and UX conventions.
7. `docs/sprint-artifacts/sprint-status.yaml` is updated to move:
   - `3-2-implement-checklist-ui-and-filtering` from `backlog` → `drafted` (once this story file exists) and later `done` when implemented.