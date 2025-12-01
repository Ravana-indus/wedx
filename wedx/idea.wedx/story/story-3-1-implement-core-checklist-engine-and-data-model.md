# Story 3.1 – Implement Core Checklist Engine and Data Model

Status: done

## 1. Story Summary

**As a** couple (and our families)  
**I want** structured checklists that reflect our specific wedding type, events, and rituals  
**So that** we don’t miss critical tasks or items and can track progress with confidence.

Epic: **Epic 3 – Checklists & Jewelry Module** ([`epics.md`](docs/epics.md:146–176))  

---

## 2. Business & Product Rationale

From PRD ([`prd.md`](docs/prd.md:177–236)):

- Checklists are a **core value driver**:
  - They must be **culturally aware** (Hindu, Buddhist, Christian, Muslim, Civil, Mixed).
  - They must adapt to:
    - Events configured (Engagement, Poruwa, Nikah, Mehendi, Homecoming, Reception, etc.).
    - Rituals selected (from Epic 2, Story 2.4).
  - They must support:
    - Tasks (actions to do).
    - Items (things to procure/prepare), including **jewelry**.

From UX ([`ux-design-specification.md`](docs/ux-design-specification.md:221–280)):

- Checklists should:
  - Feel **organized, not overwhelming**.
  - Be grouped by:
    - Time (e.g., “6+ months before”, “1 week before”, “On the day”).
    - Event (e.g., “Poruwa Ceremony”, “Reception”).
    - Category (e.g., “Jewelry”, “Documents”, “Vendors”).
  - Support:
    - Marking items as done.
    - Assigning to people (later stories).
    - Notes and attachments (later stories).

From Epics ([`epics.md`](docs/epics.md:146–176)):

- Epic 3 introduces:
  - A **checklist engine** that can:
    - Generate tasks/items from templates based on wedding configuration.
    - Persist and track completion state.
  - A **jewelry module** that:
    - Treats jewelry as a first-class checklist category.

This story (3.1) focuses on the **core engine and data model**, not the full UI.

---

## 3. Scope

### In Scope

1. Define and implement the **data model** for checklists:

   - Core entities:
     - Checklist templates.
     - Checklist instances (per wedding).
     - Checklist items (tasks/items).
     - Optional: categories and groups.

2. Implement the **checklist generation engine**:

   - Input:
     - Wedding configuration from Epics 1 & 2:
       - Wedding type and traditions.
       - Events.
       - Rituals.
       - Vibe/theme (optional for now).
   - Output:
     - A set of checklist items for the wedding, grouped appropriately.

3. Implement **persistence and basic APIs**:

   - CRUD for checklist instances and items.
   - Endpoint to (re)generate checklist for a wedding.

4. Provide **basic integration points** for future UI:

   - API responses shaped for:
     - Today dashboard widgets (Epic 2).
     - Checklist pages (future Story 3.2+).

### Out of Scope

- Full checklist UI (pages, filters, drag-and-drop).
- Assignment of tasks to people.
- Notifications and reminders.
- Deep jewelry-specific UI (that will be a later story in Epic 3).

This story is about **backend and domain model foundation** plus minimal wiring.

---

## 4. Technical Requirements

### 4.1 Data Model

From architecture ([`architecture.md`](docs/architecture.md:199–260)) and PRD ([`prd.md`](docs/prd.md:177–236)):

Introduce or refine the following entities (names can be adapted to your stack):

1. **ChecklistTemplate**

   - Represents a reusable template item that can be instantiated for a wedding.
   - Fields (conceptual):

     ```ts
     interface ChecklistTemplate {
       id: string;
       key: string; // e.g. 'poruwa-ceremony-bride-jewelry'
       title: string;
       description?: string;
       type: 'task' | 'item';
       category: 'jewelry' | 'documents' | 'vendors' | 'logistics' | 'guests' | 'budget' | 'other';
       timeBucket: '6_plus_months' | '3_6_months' | '1_3_months' | '1_month' | '1_week' | 'day_of' | 'after';
       weddingTypes?: string[]; // e.g. ['buddhist', 'mixed']
       eventTypes?: string[];   // e.g. ['poruwa', 'reception']
       ritualKeys?: string[];   // e.g. ['poruwa-main-ceremony']
       isJewelry?: boolean;
       priority?: 'low' | 'medium' | 'high';
     }
     ```

   - Storage:
     - Seeded in the database or stored as static JSON/config in the codebase (e.g., [`lib/checklists/templates.ts`](lib/checklists/templates.ts:1)).

2. **Checklist**

   - Represents a checklist instance for a specific wedding.
   - Fields:

     ```ts
     interface Checklist {
       id: string;
       weddingId: string;
       name: string; // e.g. 'Global Wedding Checklist'
       createdAt: Date;
       updatedAt: Date;
     }
     ```

3. **ChecklistItem**

   - Represents a concrete task/item for a specific wedding.
   - Fields:

     ```ts
     interface ChecklistItem {
       id: string;
       checklistId: string;
       templateId?: string; // link back to template if applicable
       title: string;
       description?: string;
       type: 'task' | 'item';
       category: string;
       timeBucket: string;
       eventId?: string; // link to events table
       ritualId?: string; // link to rituals table
       isJewelry: boolean;
       status: 'todo' | 'in_progress' | 'done';
       dueDate?: Date;
       notes?: string;
       orderIndex: number;
     }
     ```

4. **Optional Supporting Entities**

   - `ChecklistCategory` or enums for categories/time buckets can be implemented as code-level enums rather than tables.

### 4.2 Checklist Generation Engine

Implement a service/module, e.g.:

- [`lib/checklists/generator.ts`](lib/checklists/generator.ts:1)

Responsibilities:

1. **Input Data Fetching**

   - Given a `weddingId`, fetch:

     - Wedding core data:
       - Type/traditions.
       - Date (if available).
     - Events:
       - From `events` table (Story 2.2).
     - Rituals:
       - From `rituals` table (Story 2.4).
     - Style (optional for now):
       - From `wedding_settings` (Story 2.3).

2. **Template Selection**

   - Load all `ChecklistTemplate` entries.
   - Filter templates based on:

     - `weddingTypes`:
       - Include if empty or contains the wedding’s type(s).
     - `eventTypes`:
       - For each event, include templates whose `eventTypes` contain the event type.
     - `ritualKeys`:
       - For each ritual, include templates whose `ritualKeys` contain the ritual key.

3. **Instance Creation**

   - For each selected template, create a `ChecklistItem`:

     - Link to:
       - `checklistId` (global wedding checklist).
       - `eventId` (if event-specific).
       - `ritualId` (if ritual-specific).
     - Copy:
       - `title`, `description`, `type`, `category`, `timeBucket`, `isJewelry`, `priority`.
     - Initialize:
       - `status = 'todo'`.
       - `orderIndex` based on time bucket and category.

4. **Idempotency / Regeneration**

   - Decide on regeneration strategy:

     - Option A: One-time generation:
       - Generate once when wizard completes.
       - Later changes to events/rituals do not auto-regenerate (future story).
     - Option B: Regeneration endpoint:
       - Allow re-running generation:
         - Either clear and recreate items.
         - Or merge new items while preserving user-completed ones.

   - For this story, implement a **simple regeneration** strategy:
     - Endpoint that:
       - Deletes existing items for the wedding’s checklist.
       - Recreates from templates.
       - (Document that this will reset completion state; future stories can refine.)

### 4.3 APIs

Implement backend endpoints (paths can be adapted to your conventions):

1. **Generate Checklist**

   - `POST /api/weddings/:id/checklists/generate`

   - Behavior:
     - If no checklist exists for the wedding:
       - Create a `Checklist` record.
     - Run the generator to create `ChecklistItem` records.
     - Return the generated checklist and items.

2. **Get Checklist**

   - `GET /api/weddings/:id/checklists`

   - Returns:
     - Checklist metadata.
     - Items grouped by:
       - Time bucket.
       - Category.
       - Event.

3. **Update Checklist Item**

   - `PATCH /api/checklist-items/:id`

   - Allows updating:
     - `status`
     - `notes`
     - `dueDate`

   - This will be used by future UI stories.

4. **(Optional) Bulk Update**

   - `PATCH /api/weddings/:id/checklists/items` for bulk updates (optional for this story).

### 4.4 Integration Points

- Today dashboard (Epic 2, Story 2.5/2.6):

  - Can call `GET /api/weddings/:id/checklists` to show:
    - “Next 3 actions” from checklist items.
  - For this story, ensure the API shape supports:
    - Filtering by time bucket and status.

- Future Checklist UI (Epic 3, Story 3.2+):

  - Will use:
    - `GET /api/weddings/:id/checklists`
    - `PATCH /api/checklist-items/:id`

---

## 5. Dependencies & Relationships

### 5.1 Upstream Dependencies

- **Epic 1**:

  - Foundation, AppShell, and Auth shell must be in place.
  - Auth ensures `weddingId` is available in the session/context.

- **Epic 2**:

  - Story 2.1 – Wedding Type Selection:
    - Provides wedding type/traditions.
  - Story 2.2 – Multi-Event Setup:
    - Provides events for event-specific checklist items.
  - Story 2.4 – Rituals Configuration:
    - Provides rituals for ritual-specific checklist items.
  - Story 2.3 – Vibe & Theme Selection (optional for now):
    - May influence some templates (e.g., decor-heavy vs minimal).

- Data model and API basics:
  - `weddings`, `events`, `rituals`, and `wedding_settings` tables and endpoints exist or are stubbed.

### 5.2 Downstream Dependencies

This story is a foundation for:

- **Story 3.2 – Checklist UI & Filtering**:
  - Uses the checklist engine’s data model and APIs.
- **Jewelry-specific stories in Epic 3**:
  - Use `category = 'jewelry'` and `isJewelry = true` to drive specialized UI.
- **Epic 4 – Vendors & WhatsApp Bridge**:
  - Uses checklist items to drive vendor tasks and communication.
- **Epic 6 – Budget & Payments Overview**:
  - Uses checklist items to infer budget categories and progress.
- **Epic 7 – AI Planner & Ritual Intelligence**:
  - Uses checklist templates and items as a knowledge base.

If this story is incomplete or inconsistent, all checklist-related UX and AI features will be blocked or unreliable.

---

## 6. Acceptance Criteria

From [`epics.md`](docs/epics.md:146–176) plus technical elaboration:

1. **Data model implemented**

   - Database (or equivalent persistence) includes:
     - `checklists` table/collection.
     - `checklist_items` table/collection.
   - Entities support:
     - Linking to `weddingId`, `eventId`, `ritualId`.
     - Categorization by type, category, time bucket.
     - Jewelry flag.

2. **Templates defined**

   - There is a seed set of `ChecklistTemplate` entries (or config) that:
     - Cover at least:
       - Global wedding tasks.
       - Event-specific tasks for 1–2 key event types (e.g., Poruwa, Reception).
       - A few jewelry-related items.
     - Are filterable by wedding type, event type, and ritual keys.

3. **Generation endpoint works**

   - When I call `POST /api/weddings/:id/checklists/generate` for a wedding that has:
     - A type.
     - At least one event.
     - At least one ritual.
   - Then:
     - A checklist is created (if not existing).
     - Checklist items are generated based on templates.
     - The response includes the generated items.

4. **Checklist retrieval works**

   - When I call `GET /api/weddings/:id/checklists`,
     - Then I receive:
       - Checklist metadata.
       - Items grouped or groupable by time bucket, category, and event.

5. **Item update works**

   - When I call `PATCH /api/checklist-items/:id` to change `status` or `notes`,
     - Then the item is updated and persisted.
     - Subsequent `GET` calls reflect the change.

6. **Integration readiness**

   - The Today dashboard can:
     - Fetch checklist data and display at least a simple “Next actions” list (even if not fully wired in this story).
   - Future checklist UI stories can:
     - Use the APIs without requiring major refactors.

7. **Technical quality**

   - Code follows architecture conventions:
     - Next.js App Router.
     - `lib/` for domain logic (e.g., `lib/checklists/generator.ts`).
     - `app/api/` for route handlers (if using Next.js API routes).
   - Types are defined (TypeScript) and reused across frontend and backend where applicable.

---

## 7. Definition of Done (Story 3.1)

Story 3.1 is **Done** when:

1. Checklist data model (checklists + checklist_items + templates/config) is implemented and migrated.
2. Checklist generation engine exists and can generate items for a wedding based on type, events, and rituals.
3. API endpoints for generating, retrieving, and updating checklist items are implemented and tested.
4. At least a minimal seed set of templates exists, including some jewelry-related items.
5. The Today dashboard and future checklist UI can consume the APIs without major changes.
6. Implementation follows architecture and UX conventions where applicable.
7. `docs/sprint-artifacts/sprint-status.yaml` is updated to move:
   - `3-1-implement-core-checklist-engine-and-data-model` from `backlog` → `drafted` (once this story file exists) and later `done` when implemented.

### Dev Agent Record

#### Context Reference
- docs/sprint-artifacts/3-1-implement-core-checklist-engine-and-data-model.context.xml

#### Implementation Notes
- Added checklist domain types, seed templates (global/event/ritual/jewelry), and generation logic with grouping helpers under `lib/checklists`.
- Exposed REST endpoints for checklist generation, retrieval, and item updates using Next.js App Router (`app/api/weddings/[id]/checklists` and `app/api/checklist-items/[id]`).
- Implemented in-memory store placeholder (per-boot) pending persistent DB wiring; APIs return `{ data, error }` envelope per architecture conventions.
- Added Jest coverage for generator/grouping and stabilized design-system tests.
