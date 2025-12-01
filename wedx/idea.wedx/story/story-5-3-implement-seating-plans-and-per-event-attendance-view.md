# Story 5.3 – Implement Seating Plans and Per-Event Attendance View
Status: ready-for-dev

## 1. Story Summary

**As a** couple  
**I want** to plan seating for each event and see exactly who is attending where  
**So that** we can coordinate tables, sections, and capacities without messy spreadsheets.

Epic: **Epic 5 – Guests, Invitations & RSVP** ([`epics.md`](docs/epics.md:215–244))  
Depends on:  
- [`story-2-2-implement-step-2-multi-event-setup.md`](docs/sprint-artifacts/story-2-2-implement-step-2-multi-event-setup.md:1)  
- [`story-5-1-implement-guests-and-households-data-model-and-import.md`](docs/sprint-artifacts/story-5-1-implement-guests-and-households-data-model-and-import.md:1)  
- [`story-5-2-implement-invitations-and-rsvp-per-event.md`](docs/sprint-artifacts/story-5-2-implement-invitations-and-rsvp-per-event.md:1)  

---

## 2. Business & Product Rationale

From PRD ([`prd.md`](docs/prd.md:293–348)):

- Seating is one of the most stressful parts of wedding planning:
  - Multiple events with different guest lists.
  - Constraints:
    - Family politics.
    - Elderly/children placement.
    - VIP tables.
- Today, couples use:
  - Excel + hand-drawn diagrams.
  - Last-minute changes on paper.

wedX should:

- Provide a **structured seating model** per event.
- Make it easy to:
  - See who is attending each event.
  - Assign guests to tables/sections.
  - Track capacity vs RSVP counts.

From UX ([`ux-design-specification.md`](docs/ux-design-specification.md:341–390)):

- Seating UX principles:
  - “Start with lists, not drag-and-drop” – basic list-based assignment first.
  - “Make constraints visible” – show capacity vs assigned.
  - “Parents can help” – simple, clear UI.

From Epics ([`epics.md`](docs/epics.md:215–244)):

- Epic 5 includes:
  - Guests & households.
  - Invitations & RSVP.
  - Seating and per-event attendance.

This story (5.3) focuses on **data model + basic list-based seating UI**, not advanced visual layouts.

---

## 3. Scope

### In Scope

1. Define and implement the **Seating data model**:

   - `SeatingTable` (or `SeatingSection`) per event.
   - `SeatingAssignment` linking guests to tables.

2. Implement **backend APIs** for:

   - Creating and managing tables per event.
   - Assigning guests to tables.
   - Viewing per-event attendance and seating.

3. Provide a **Seating & Attendance UI**:

   - Route: `/events/[eventId]/seating` or a tab within the event detail page.
   - List-based interface to:
     - See attending guests.
     - Assign them to tables.
     - View capacity vs assigned counts.

### Out of Scope

- Drag-and-drop floorplan editor.
- Visual table layouts (round/rectangular diagrams).
- Guest-facing seat selection.

This story is about **making seating manageable in a structured, list-based way**.

---

## 4. Technical Requirements

### 4.1 Data Model

From architecture ([`architecture.md`](docs/architecture.md:199–260)), PRD ([`prd.md`](docs/prd.md:293–348)), and Stories 5.1–5.2:

Existing entities:

- `Event` (Story 2.2).
- `Guest`, `Household` (Story 5.1).
- `GuestEventInvitation` with RSVP status (Story 5.2).

Introduce:

1. **SeatingTable**

   ```ts
   interface SeatingTable {
     id: string;
     weddingId: string;
     eventId: string;
     name: string;          // e.g. 'Table 1', 'Family Table A'
     capacity?: number;     // max seats
     section?: string;      // e.g. 'Front', 'Balcony', 'VIP'
     notes?: string;
     createdAt: Date;
     updatedAt: Date;
   }
   ```

   - Storage:
     - `seating_tables` table/collection.

2. **SeatingAssignment**

   ```ts
   interface SeatingAssignment {
     id: string;
     weddingId: string;
     eventId: string;
     tableId: string;
     guestId: string;
     notes?: string;        // e.g. 'Needs wheelchair access'
     createdAt: Date;
     updatedAt: Date;
   }
   ```

   - Storage:
     - `seating_assignments` table/collection.

3. **Derived Constraints**

   - Capacity checks:
     - Number of assignments per table should not exceed `capacity` (if set).
   - Attendance:
     - Only guests with `GuestEventInvitation.status` in `['invited', 'accepted', 'maybe']` should be assignable (configurable).

### 4.2 APIs

Implement backend endpoints:

1. **List Seating Tables for an Event**

   - `GET /api/events/:eventId/seating-tables`

   - Returns:

     ```ts
     interface GetSeatingTablesResponse {
       eventId: string;
       tables: (SeatingTable & { assignedCount: number })[];
     }
     ```

2. **Create/Update/Delete Seating Table**

   - `POST /api/events/:eventId/seating-tables`

     ```ts
     interface CreateSeatingTableRequest {
       name: string;
       capacity?: number;
       section?: string;
       notes?: string;
     }
     ```

   - `PATCH /api/seating-tables/:tableId`
   - `DELETE /api/seating-tables/:tableId`

3. **List Assignable Guests for an Event**

   - `GET /api/events/:eventId/attending-guests`

   - Returns guests with invitations for that event:

     ```ts
     interface EventAttendingGuestsResponse {
       eventId: string;
       guests: (Guest & {
         household?: Household;
         invitation?: GuestEventInvitation;
       })[];
     }
     ```

   - Filter by:
     - `status` in `['invited', 'accepted', 'maybe']` (configurable).

4. **List Seating Assignments for an Event**

   - `GET /api/events/:eventId/seating-assignments`

   - Returns:

     ```ts
     interface EventSeatingAssignmentsResponse {
       eventId: string;
       assignments: (SeatingAssignment & {
         guest: Guest;
         table: SeatingTable;
       })[];
     }
     ```

5. **Create/Update Seating Assignments**

   - `POST /api/events/:eventId/seating-assignments`

   - Request body:

     ```ts
     interface UpsertSeatingAssignmentsRequest {
       assignments: {
         guestId: string;
         tableId: string;
         notes?: string;
       }[];
     }
     ```

   - Behavior:
     - For each `(eventId, guestId)`:
       - Create or update `SeatingAssignment` with given `tableId`.

   - Optional capacity check:
     - Reject or warn if table capacity would be exceeded.

6. **Remove Seating Assignment**

   - `DELETE /api/seating-assignments/:assignmentId`

### 4.3 Seating & Attendance UI

From UX ([`ux-design-specification.md`](docs/ux-design-specification.md:341–390)) and Event detail flows (Story 2.6):

1. **Route & Layout**

   - Option A: Dedicated route:

     - `app/events/[eventId]/seating/page.tsx`

   - Option B: Tab within event detail:

     - Tabs: “Overview”, “Vendors”, “RSVP”, “Seating”.

   - Layout:

     - Use AppShell.
     - Show event name and date at top.

2. **Panels**

   - Left panel: **Tables**

     - List of tables for the event:
       - Name.
       - Capacity.
       - Assigned count.
       - Section.
     - Actions:
       - “Add table” button (dialog with name, capacity, section).
       - Edit/delete table.

   - Right panel: **Guests & Assignments**

     - Two main views:
       1. **Unassigned guests**:
          - List of guests attending the event but not assigned to any table.
       2. **Table detail**:
          - When a table is selected:
            - Show guests assigned to that table.

3. **Assigning Guests to Tables**

   - Interaction options:

     - Minimum: dropdown on each guest row:
       - “Assign to table…” select.
     - Optional: drag-and-drop between “Unassigned” and table lists.

   - On assignment change:

     - Call `POST /api/events/:eventId/seating-assignments` with updated mapping.
     - Optimistically update UI.

4. **Capacity Feedback**

   - For each table:

     - Show `assignedCount / capacity` (if capacity set).
     - If `assignedCount > capacity`:
       - Highlight in warning color.

5. **Guest Info in Seating View**

   - For each guest row:

     - Show:
       - Name.
       - Household (e.g., “Perera Family”).
       - Side (bride/groom/both).
       - RSVP status (from `GuestEventInvitation`).
       - Notes icon (if guest has notes).

   - Optional filters:

     - By side (bride/groom/both).
     - By RSVP status (accepted/maybe/invited).

### 4.4 Event Detail & Today Dashboard Integration

From Story 2.6 and Today dashboard stories:

1. **Event Detail Page (`/events/[eventId]`)**

   - Add a **Seating summary** section:

     - Show:
       - Number of tables.
       - Total capacity (sum of capacities).
       - Number of assigned guests.
       - RSVP attending count (from Story 5.2).
     - Link: “Manage seating” → `/events/[eventId]/seating`.

2. **Today Dashboard (optional hook)**

   - For events happening soon (e.g., within 30 days):

     - Show a card:
       - “Seating for [EventName]”
       - “Attending: X, Assigned: Y”
       - Link to seating page.

---

## 5. Dependencies & Relationships

### 5.1 Upstream Dependencies

- **Story 2.2 – Multi-Event Setup**:

  - Provides events to which seating is attached.

- **Story 5.1 – Guests & Households**:

  - Provides guests and households.

- **Story 5.2 – Invitations & RSVP per Event**:

  - Provides RSVP status and attending counts.

- **Epic 1 – Foundation & AppShell**:

  - Provides:
    - Auth and `weddingId`.
    - AppShell layout and navigation.

### 5.2 Downstream Dependencies

This story is a foundation for:

- Future Epic 5 stories:

  - Visual seating layouts and drag-and-drop floorplans.
  - Export/printable seating charts.

- **Epic 6 – Budget & Payments Overview**:

  - Uses per-event attendance and seating to:
    - Refine catering and venue cost estimates.

- **Epic 7 – AI Planner & Ritual Intelligence**:

  - Uses seating data to:
    - Suggest adjustments (e.g., over-capacity tables).
    - Highlight unassigned VIPs.

If this story is incomplete, couples will still rely on external tools for seating, and downstream planning features will lack structured seating data.

---

## 6. Acceptance Criteria

From [`epics.md`](docs/epics.md:215–244) plus technical elaboration:

1. **Data model implemented**

   - `seating_tables` and `seating_assignments` tables/collections exist with fields described above.
   - Seating tables link correctly to:
     - `weddingId`
     - `eventId`
   - Seating assignments link correctly to:
     - `weddingId`
     - `eventId`
     - `tableId`
     - `guestId`

2. **APIs work**

   - `GET /api/events/:eventId/seating-tables` returns tables with assigned counts.
   - `POST /api/events/:eventId/seating-tables` creates tables.
   - `PATCH /api/seating-tables/:tableId` updates tables.
   - `GET /api/events/:eventId/attending-guests` returns guests eligible for seating.
   - `GET /api/events/:eventId/seating-assignments` returns assignments with guest and table info.
   - `POST /api/events/:eventId/seating-assignments` creates/updates assignments.
   - `DELETE /api/seating-assignments/:assignmentId` removes assignments.

3. **Seating UI works**

   - When I navigate to the seating view for an event:
     - I see a list of tables with capacity and assigned counts.
     - I see a list of attending guests who are unassigned.
   - I can:
     - Add/edit/delete tables.
     - Assign guests to tables.
     - Move guests between tables or back to unassigned.
   - Capacity warnings are shown when a table is over capacity.

4. **Event detail integration**

   - On `/events/[eventId]`:
     - I see a seating summary (tables, capacity, assigned vs attending).
     - I can click “Manage seating” to go to the seating view.

5. **UX alignment**

   - Seating UI:
     - Uses wedX design system (Tailwind + shadcn/ui).
     - Is list-based and understandable to both couples and parents.
   - Capacity and assignment information is:
     - Clear.
     - Not visually overwhelming.

---

## 7. Definition of Done (Story 5.3)

Story 5.3 is **Done** when:

1. Seating data model and migrations are implemented.
2. APIs for tables, assignments, and attending guests are implemented and tested.
3. Per-event seating UI exists and supports table management and guest assignment.
4. Event detail pages show seating summary and link to the seating UI.
5. Implementation follows architecture and UX conventions (Next.js App Router, Tailwind, shadcn/ui).
6. `docs/sprint-artifacts/sprint-status.yaml` is updated to move:
   - `5-3-implement-seating-plans-and-per-event-attendance-view` from `backlog` → `drafted` (once this story file exists) and later `done` when implemented.

### Dev Agent Record

#### Context Reference
- docs/sprint-artifacts/5-3-basic-seating-assignment.context.xml

#### File List
- docs/sprint-artifacts/story-5-3-implement-seating-plans-and-per-event-attendance-view.md
- docs/sprint-artifacts/sprint-status.yaml
- docs/sprint-artifacts/5-3-basic-seating-assignment.context.xml
