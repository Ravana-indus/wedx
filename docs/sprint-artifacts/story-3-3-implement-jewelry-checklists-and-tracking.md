# Story 3.3 – Implement Jewelry Checklists and Tracking

## 1. Story Summary

**As a** couple and our families  
**I want** a dedicated way to track all required jewelry items across events and rituals  
**So that** we don’t miss culturally important pieces and can coordinate who is responsible for what.

Epic: **Epic 3 – Checklists & Jewelry Module** ([`epics.md`](docs/epics.md:146–176))  
Depends on:  
- [`story-3-1-implement-core-checklist-engine-and-data-model.md`](docs/sprint-artifacts/story-3-1-implement-core-checklist-engine-and-data-model.md:1)  
- [`story-3-2-implement-checklist-ui-and-filtering.md`](docs/sprint-artifacts/story-3-2-implement-checklist-ui-and-filtering.md:1)  

---

## 2. Business & Product Rationale

From PRD ([`prd.md`](docs/prd.md:205–236)):

- Jewelry is a **high-stakes, culturally sensitive** part of many weddings:
  - Different traditions (Hindu, Buddhist, Christian, Muslim, Mixed) have specific jewelry expectations.
  - Families often coordinate:
    - Who provides which pieces.
    - When and where they are needed.
- Missing or mismanaging jewelry can cause:
  - Emotional stress.
  - Cultural embarrassment.
  - Financial risk.

From UX ([`ux-design-specification.md`](docs/ux-design-specification.md:221–280)):

- Jewelry must be:
  - Treated as a **first-class checklist category**, not buried in generic tasks.
  - Presented in a way that:
    - Parents can understand and help manage.
    - Couples can see at a glance what is covered and what is missing.

From Epics ([`epics.md`](docs/epics.md:146–176)):

- Epic 3 explicitly calls out a **Jewelry Module**:
  - Built on top of the core checklist engine.
  - Provides:
    - Jewelry-specific templates.
    - Views and filters.
    - Tracking of who is responsible (later stories).

This story (3.3) focuses on **jewelry-specific checklist templates, data, and UI views**.

---

## 3. Scope

### In Scope

1. Extend the **checklist templates** (Story 3.1) with jewelry-specific entries:

   - Per tradition (Hindu, Buddhist, Christian, Muslim, Mixed).
   - Per event/ritual (e.g., Poruwa, Nikah, Homecoming, Reception).
   - Marked with `category = 'jewelry'` and `isJewelry = true`.

2. Implement **jewelry-focused views** in the Checklist UI (Story 3.2):

   - A dedicated **Jewelry tab or filter preset** on `/checklist`.
   - A **Jewelry summary section**:
     - Total jewelry items.
     - Completed vs remaining.
     - Grouped by event.

3. Add **basic jewelry-specific fields** to checklist items:

   - Optional fields such as:
     - `jewelryOwner` (e.g., “Bride’s family”, “Groom’s family”, “Vendor”).
     - `jewelryType` (e.g., “Necklace”, “Earrings”, “Ring set”, “Headpiece”).

4. Support **editing jewelry metadata** in the UI:

   - For jewelry items:
     - View and edit `jewelryOwner`.
     - View and edit `jewelryType`.
     - Notes (already supported in Story 3.2).

### Out of Scope

- Complex jewelry inventory management (photos, insurance, valuations).
- Assigning jewelry items to specific people with notifications.
- Vendor integration for jewelry rentals/purchases (Epic 4).

This story is about **making jewelry visible and trackable** within the checklist system.

---

## 4. Technical Requirements

### 4.1 Template Extensions

From Story 3.1 ([`story-3-1-implement-core-checklist-engine-and-data-model.md`](docs/sprint-artifacts/story-3-1-implement-core-checklist-engine-and-data-model.md:80–152)):

- Extend `ChecklistTemplate` to include jewelry metadata (if not already present):

  ```ts
  interface ChecklistTemplate {
    id: string;
    key: string;
    title: string;
    description?: string;
    type: 'task' | 'item';
    category: 'jewelry' | 'documents' | 'vendors' | 'logistics' | 'guests' | 'budget' | 'other';
    timeBucket: '6_plus_months' | '3_6_months' | '1_3_months' | '1_month' | '1_week' | 'day_of' | 'after';
    weddingTypes?: string[];
    eventTypes?: string[];
    ritualKeys?: string[];
    isJewelry?: boolean;
    jewelryType?: string;   // e.g. 'necklace', 'earrings', 'ring-set'
    defaultOwner?: string;  // e.g. 'bride-family', 'groom-family'
    priority?: 'low' | 'medium' | 'high';
  }
  ```

- Seed jewelry templates in config, e.g.:

  - [`lib/checklists/jewelry-templates.ts`](lib/checklists/jewelry-templates.ts:1)

- Examples:

  - For a Buddhist Poruwa ceremony:
    - “Poruwa ceremony – bride’s necklace set”
    - “Poruwa ceremony – bangles and earrings”
  - For a Hindu wedding:
    - “Mehendi – light jewelry set”
    - “Main ceremony – full bridal jewelry set”
  - For a Christian wedding:
    - “Church ceremony – bridal jewelry”
  - For Homecoming/Reception:
    - “Homecoming – jewelry set”
    - “Reception – jewelry set”

### 4.2 ChecklistItem Extensions

Extend `ChecklistItem` (Story 3.1) with jewelry-specific fields:

```ts
interface ChecklistItem {
  id: string;
  checklistId: string;
  templateId?: string;
  title: string;
  description?: string;
  type: 'task' | 'item';
  category: string;
  timeBucket: string;
  eventId?: string;
  ritualId?: string;
  isJewelry: boolean;
  jewelryType?: string;   // e.g. 'necklace', 'earrings'
  jewelryOwner?: string;  // e.g. 'bride-family', 'groom-family', 'vendor'
  status: 'todo' | 'in_progress' | 'done';
  dueDate?: Date;
  notes?: string;
  orderIndex: number;
}
```

- Migration:

  - Add `jewelryType` and `jewelryOwner` columns/fields to the persistence layer.

- Generation:

  - When generating items from templates:
    - Copy `jewelryType` and `defaultOwner` into `ChecklistItem`.

### 4.3 APIs

Update APIs from Story 3.1:

- `GET /api/weddings/:id/checklists`

  - Ensure jewelry fields are included in the response:
    - `isJewelry`
    - `jewelryType`
    - `jewelryOwner`

- `PATCH /api/checklist-items/:id`

  - Allow updating:
    - `status`
    - `notes`
    - `jewelryOwner`
    - (Optionally) `jewelryType` if you want it editable.

No new endpoints are strictly required for this story.

### 4.4 Checklist UI – Jewelry Views

From Story 3.2 ([`story-3-2-implement-checklist-ui-and-filtering.md`](docs/sprint-artifacts/story-3-2-implement-checklist-ui-and-filtering.md:120–214)):

1. **Jewelry Filter Preset**

   - On `/checklist`, add a quick filter or tab:

     - “All”
     - “Jewelry”
     - “Documents”
     - “Vendors”
     - etc.

   - When “Jewelry” is selected:
     - Apply `category = 'jewelry'` or `isJewelry = true` filter automatically.

2. **Jewelry Summary Section**

   - At the top of the checklist page (or in a right rail), show:

     - Total jewelry items.
     - Completed vs remaining (e.g., “3 of 10 jewelry items done”).
     - Breakdown by event:
       - “Poruwa Ceremony – 2/5 items done”
       - “Reception – 1/3 items done”

   - Implementation:

     - Compute aggregates on the frontend from fetched items.
     - Optionally, add a small chart or progress bars.

3. **Jewelry Item Row Enhancements**

   - For items where `isJewelry = true`:

     - Show a jewelry icon or badge (e.g., “Jewelry”).
     - Show `jewelryOwner` (e.g., “Bride’s family”) as a small label.
     - Show `jewelryType` (e.g., “Necklace set”).

4. **Jewelry Item Details Editing**

   - In the item details panel (from Story 3.2):

     - Add fields for:
       - `jewelryOwner`:
         - Dropdown with options:
           - “Bride’s family”
           - “Groom’s family”
           - “Couple”
           - “Vendor”
           - “Other”
       - `jewelryType`:
         - Dropdown or free text:
           - “Necklace”
           - “Earrings”
           - “Ring set”
           - “Headpiece”
           - “Bangles”
           - “Other”

     - On save:
       - Call `PATCH /api/checklist-items/:id` with updated fields.

### 4.5 URL-based Jewelry View

Support a URL preset for jewelry:

- `/checklist?category=jewelry` or `/checklist?jewelry=true`

Implementation:

- In `app/checklist/page.tsx`:

  - If `category=jewelry` or `jewelry=true` in search params:
    - Initialize filters to show only jewelry items.
    - Optionally auto-select the “Jewelry” tab.

This allows:

- Today dashboard or future jewelry-specific entry points to deep-link into the jewelry view.

---

## 5. Dependencies & Relationships

### 5.1 Upstream Dependencies

- **Story 3.1 – Core Checklist Engine and Data Model**:

  - Provides:
    - Checklist templates and items.
    - Generation logic.
    - Base fields for `isJewelry`.

- **Story 3.2 – Checklist UI and Filtering**:

  - Provides:
    - `/checklist` page.
    - Filters and grouping.
    - Item details and notes editing.

- **Epic 2 – Wizard & Control Room**:

  - Provides:
    - Wedding type.
    - Events.
    - Rituals.
  - Jewelry templates may depend on:
    - Rituals (e.g., Poruwa-specific jewelry).

### 5.2 Downstream Dependencies

This story is a foundation for:

- Future Epic 3 stories:

  - Assigning jewelry responsibilities to specific people.
  - Uploading photos or documents for jewelry items.
  - Generating jewelry-specific reports or export.

- **Epic 4 – Vendors & WhatsApp Bridge**:

  - Jewelry items may:
    - Link to jewelry vendors.
    - Trigger WhatsApp reminders.

- **Epic 7 – AI Planner & Ritual Intelligence**:

  - AI can:
    - Suggest missing jewelry items.
    - Highlight conflicts or gaps.

If this story is incomplete, jewelry remains buried in generic checklists, reducing the perceived value of wedX for culturally rich weddings.

---

## 6. Acceptance Criteria

From [`epics.md`](docs/epics.md:146–176) plus technical elaboration:

1. **Jewelry templates exist**

   - There is a seed set of jewelry-specific `ChecklistTemplate` entries that:
     - Cover at least:
       - Buddhist Poruwa ceremony.
       - One Hindu ceremony.
       - One Christian ceremony.
       - Homecoming/Reception.
     - Are marked with:
       - `category = 'jewelry'`
       - `isJewelry = true`
       - Appropriate `weddingTypes`, `eventTypes`, and `ritualKeys`.

2. **Jewelry items are generated**

   - When I generate a checklist for a wedding with relevant events/rituals,
     - Then jewelry items appear in the generated `ChecklistItem`s with:
       - `isJewelry = true`
       - `jewelryType` and `jewelryOwner` (defaulted where applicable).

3. **Jewelry view on `/checklist`**

   - When I navigate to `/checklist` and select the “Jewelry” filter/tab,
     - Then I see only jewelry items.
   - When I open `/checklist?category=jewelry` (or `?jewelry=true`),
     - Then the checklist initializes in jewelry-only mode.

4. **Jewelry summary**

   - On the checklist page, I can see:
     - Total jewelry items.
     - Completed vs remaining.
     - Breakdown by event (e.g., Poruwa, Reception).

5. **Jewelry metadata editing**

   - For a jewelry item:
     - I can view and edit:
       - `jewelryOwner`.
       - `jewelryType`.
     - On save:
       - Changes are persisted via `PATCH /api/checklist-items/:id`.
       - Reloading the page shows updated values.

6. **UX alignment**

   - Jewelry is clearly surfaced as a first-class category:
     - Badges/icons.
     - Dedicated filter/tab.
   - The UI remains:
     - Understandable to both couples and parents.
     - Consistent with wedX design system.

---

## 7. Definition of Done (Story 3.3)

Story 3.3 is **Done** when:

1. Jewelry-specific checklist templates are defined and used by the generator.
2. Checklist items include jewelry metadata fields and are persisted.
3. `/checklist` supports a jewelry-focused view via filters and URL presets.
4. Jewelry summary metrics are visible on the checklist page.
5. Users can edit jewelry owner/type for jewelry items, with changes persisted.
6. Implementation follows architecture and UX conventions (Next.js App Router, Tailwind, shadcn/ui).
7. `docs/sprint-artifacts/sprint-status.yaml` is updated to move:
   - `3-3-implement-jewelry-checklists-and-tracking` from `backlog` → `drafted` (once this story file exists) and later `done` when implemented.