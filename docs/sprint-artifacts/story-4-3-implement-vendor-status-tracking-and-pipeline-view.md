# Story 4.3 – Implement Vendor Status Tracking and Pipeline View
Status: review

## 1. Story Summary

**As a** couple  
**I want** to track the status of each vendor (shortlisted, contacted, booked, etc.) in a clear pipeline  
**So that** I can see where we stand with every vendor category and avoid gaps or double-bookings.

Epic: **Epic 4 – Vendors & WhatsApp Bridge** ([`epics.md`](docs/epics.md:177–214))  
Depends on:  
- [`story-4-1-implement-vendor-directory-and-basic-linking.md`](docs/sprint-artifacts/story-4-1-implement-vendor-directory-and-basic-linking.md:1)  
- [`story-4-2-implement-whatsapp-bridge-for-vendor-communication-basics.md`](docs/sprint-artifacts/story-4-2-implement-whatsapp-bridge-for-vendor-communication-basics.md:1)  

---

## 2. Business & Product Rationale

From PRD ([`prd.md`](docs/prd.md:237–292)):

- Vendor planning is not just about storing contacts:
  - Couples move vendors through stages:
    - Discovered → Shortlisted → Contacted → Quoted → Booked → Backup.
  - Without a clear view:
    - It’s easy to forget who has been contacted.
    - Couples may overbook or miss critical categories.

From UX ([`ux-design-specification.md`](docs/ux-design-specification.md:281–340)):

- Vendor UX principles:
  - “Show the pipeline at a glance” – a simple, Kanban-like view.
  - “Make status changes easy” – drag-and-drop or quick dropdowns.
  - “Parents can understand it” – clear labels, not sales jargon.

From Epics ([`epics.md`](docs/epics.md:177–214)):

- Epic 4 includes:
  - Vendor directory and WhatsApp bridge.
  - A **pipeline view** to track vendor status across categories and events.

This story (4.3) focuses on **status tracking and a basic pipeline UI** for vendors.

---

## 3. Scope

### In Scope

1. Extend the **vendor data model** with status fields:

   - Status (e.g., shortlisted, contacted, quoted, booked, backup, dropped).
   - Optional priority.

2. Implement **APIs** to update vendor status.

3. Implement a **Vendor Pipeline view**:

   - Route: `/vendors/pipeline` or a tab within `/vendors`.
   - Columns for each status.
   - Cards for vendors that can be moved between columns.

4. Integrate **status indicators** into:

   - Vendor Directory list (`/vendors`).
   - Event detail vendor section (`/events/[eventId]`).

### Out of Scope

- Complex CRM features (multi-pipeline, custom stages).
- Automated reminders based on status.
- Financial integration (quotes, contracts) – later epics.

This story is about **making vendor progress visible and editable**.

---

## 4. Technical Requirements

### 4.1 Data Model – Vendor Status

Extend `Vendor` (from Story 4.1) with status fields:

```ts
interface Vendor {
  id: string;
  weddingId: string;
  name: string;
  category: 'photographer' | 'videographer' | 'decor' | 'venue' | 'band' | 'makeup' | 'planner' | 'catering' | 'other';
  phone?: string;
  email?: string;
  whatsappNumber?: string;
  websiteUrl?: string;
  instagramHandle?: string;
  notes?: string;
  status: 'discovered' | 'shortlisted' | 'contacted' | 'quoted' | 'booked' | 'backup' | 'dropped';
  priority?: 'low' | 'medium' | 'high';
  createdAt: Date;
  updatedAt: Date;
}
```

- Migration:

  - Add `status` (default `discovered` or `shortlisted`) and `priority` fields to persistence.

- Initialization:

  - Existing vendors default to `shortlisted` or `discovered`.

### 4.2 APIs

Extend vendor APIs from Story 4.1:

1. **Update Vendor Status**

   - `PATCH /api/vendors/:vendorId/status`

   - Request body:

     ```ts
     interface UpdateVendorStatusRequest {
       status: 'discovered' | 'shortlisted' | 'contacted' | 'quoted' | 'booked' | 'backup' | 'dropped';
       priority?: 'low' | 'medium' | 'high';
     }
     ```

   - Response:
     - Updated `Vendor`.

2. **Vendor List with Status**

   - `GET /api/weddings/:id/vendors` already exists; ensure it returns:
     - `status`
     - `priority`

No additional endpoints are strictly required for this story.

### 4.3 Vendor Pipeline UI

1. **Route & Layout**

   - Option A: Separate route:

     - `app/vendors/pipeline/page.tsx`

   - Option B: Tab within `/vendors`:

     - Use tabs to switch between:
       - “List”
       - “Pipeline”

   - Layout:

     - Use AppShell (sidebar + top bar).
     - Main content: horizontal columns for each status.

2. **Columns (Statuses)**

   - Columns for:

     - Discovered
     - Shortlisted
     - Contacted
     - Quoted
     - Booked
     - Backup
     - Dropped (optional, can be collapsed)

   - Each column shows:

     - Column title.
     - Count of vendors in that status.

3. **Vendor Cards**

   - For each vendor:

     - Show:
       - Name.
       - Category.
       - Linked events count (if any).
       - Priority (badge).
       - WhatsApp indicator (if `whatsappNumber` exists).
     - Actions:
       - Quick WhatsApp button (reusing Story 4.2 behavior).
       - Click to open vendor detail.

4. **Status Changes**

   - Interaction options:

     - Minimum: status dropdown on each card.
     - Optional: drag-and-drop between columns (if you want to implement DnD).

   - On status change:

     - Call `PATCH /api/vendors/:vendorId/status`.
     - Optimistically update UI.

5. **Filtering**

   - Optional filters at top:

     - By category (photographer, decor, etc.).
     - By event (vendors linked to a specific event).

### 4.4 Integration into Existing Views

1. **Vendor Directory List (`/vendors`)**

   - Add a **Status column**:

     - Show status as a badge (e.g., “Shortlisted”, “Booked”).
     - Color-code statuses:
       - Booked: success/green.
       - Contacted/Quoted: info/blue.
       - Shortlisted: neutral.
       - Dropped: muted/red.

   - Allow inline status change via dropdown in the row (optional).

2. **Event Detail Vendors Section (`/events/[eventId]`)**

   - For each vendor:

     - Show status badge.
     - This helps couples see:
       - Which vendors are already booked for that event.
       - Which are still in early stages.

---

## 5. Dependencies & Relationships

### 5.1 Upstream Dependencies

- **Story 4.1 – Vendor Directory and Basic Linking**:

  - Provides:
    - Vendor model and CRUD.
    - `/vendors` page.
    - Vendor–event linking.

- **Story 4.2 – WhatsApp Bridge**:

  - Provides:
    - WhatsApp deep-link actions.
    - Communication logging.

- **Epic 2 – Events**:

  - Provides:
    - Events and event detail pages.

### 5.2 Downstream Dependencies

This story is a foundation for:

- Future Epic 4 stories:

  - Reminders and follow-ups based on vendor status.
  - Budget integration (e.g., tracking booked vendors vs planned budget).

- **Epic 6 – Budget & Payments Overview**:

  - Uses vendor status to:
    - Distinguish between planned vs confirmed expenses.

- **Epic 7 – AI Planner & Ritual Intelligence**:

  - AI can:
    - Suggest next actions (e.g., “You have no booked photographer yet”).
    - Highlight gaps in the pipeline.

If this story is incomplete, couples will lack a clear overview of vendor progress, and later automation features will have no status data to work with.

---

## 6. Acceptance Criteria

From [`epics.md`](docs/epics.md:177–214) plus technical elaboration:

1. **Vendor status fields**

   - `Vendor` records include:
     - `status`
     - `priority` (optional).
   - Existing vendors default to a sensible status (e.g., `shortlisted`).

2. **Status update API**

   - When I call `PATCH /api/vendors/:vendorId/status` with a new status,
     - Then the vendor’s status is updated and persisted.
   - Subsequent `GET /api/weddings/:id/vendors` calls reflect the new status.

3. **Vendor Pipeline view**

   - When I navigate to the Vendor Pipeline (either `/vendors/pipeline` or a tab in `/vendors`),
     - Then I see columns for each status.
     - Vendors appear in the correct column based on their status.
   - When I change a vendor’s status (via dropdown or drag-and-drop),
     - Then the vendor moves to the corresponding column.
     - The change is persisted via API.

4. **Status in Vendor Directory and Event views**

   - On `/vendors`:
     - Each vendor row shows a status badge.
   - On `/events/[eventId]`:
     - Each vendor in the “Vendors for this event” section shows a status badge.

5. **UX alignment**

   - Status labels are:
     - Clear and non-technical.
     - Understandable to couples and parents.
   - The pipeline view:
     - Uses wedX design system (Tailwind + shadcn/ui).
     - Is not visually overwhelming.

---

## 7. Definition of Done (Story 4.3)

Story 4.3 is **Done** when:

1. Vendor model includes status and priority fields, with migrations applied.
2. Status update API is implemented and tested.
3. Vendor Pipeline view exists and correctly groups vendors by status.
4. Status is visible and editable from both the Vendor Directory and Event detail vendor sections.
5. Implementation follows architecture and UX conventions (Next.js App Router, Tailwind, shadcn/ui).
6. `docs/sprint-artifacts/sprint-status.yaml` is updated to move:
   - `4-3-implement-vendor-status-tracking-and-pipeline-view` from `backlog` → `drafted` (once this story file exists) and later `done` when implemented.

### Dev Agent Record

#### Context Reference
- docs/sprint-artifacts/4-3-implement-vendor-status-tracking-and-pipeline-view.context.xml

#### Debug Log
- Added vendor status/priority model support with validation helpers and defaults; updated in-memory store and vendor API surfaces to return status consistently and expose a dedicated PATCH /api/vendors/:id/status endpoint.
- Extended vendor directory UI with status badges, inline status dropdowns, priority chips, and initial status/priority selection in the add form; linked to new pipeline view.
- Built `/vendors/pipeline` Kanban-style view with status columns, category/event filters, status change controls, and WhatsApp/priority indicators.
- Surfaced status badges in event vendor listings so couples see booking progress per event.

#### Completion Notes
- Vendor pipeline and status tracking delivered: statuses persisted via new API, defaults applied to existing vendors, UI shows and edits status across vendors directory, pipeline, and event vendor lists.
- Tests: `npm test -- --runInBand` (pass; existing React act warnings remain).

#### File List
- docs/sprint-artifacts/story-4-3-implement-vendor-status-tracking-and-pipeline-view.md
- docs/sprint-artifacts/sprint-status.yaml
- lib/vendors/types.ts
- lib/vendors/status.ts
- lib/vendors/store.ts
- lib/api/vendors.ts
- app/api/weddings/[id]/vendors/route.ts
- app/api/vendors/[id]/route.ts
- app/api/vendors/[id]/status/route.ts
- app/vendors/page.tsx
- app/vendors/pipeline/page.tsx
- app/events/[eventId]/vendors-for-event.tsx
- __tests__/lib/vendors/store.test.ts
- __tests__/app/vendors/page.test.tsx
- __tests__/app/vendors/pipeline.test.tsx
