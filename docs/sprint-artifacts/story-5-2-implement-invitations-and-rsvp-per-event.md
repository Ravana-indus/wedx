# Story 5.2 – Implement Invitations and RSVP per Event

## 1. Story Summary

**As a** couple  
**I want** to send invitations and track RSVPs for each event in our wedding  
**So that** we know who is coming where, can plan seating and catering, and avoid confusion.

Epic: **Epic 5 – Guests, Invitations & RSVP** ([`epics.md`](docs/epics.md:215–244))  
Depends on:  
- [`story-2-2-implement-step-2-multi-event-setup.md`](docs/sprint-artifacts/story-2-2-implement-step-2-multi-event-setup.md:1)  
- [`story-5-1-implement-guests-and-households-data-model-and-import.md`](docs/sprint-artifacts/story-5-1-implement-guests-and-households-data-model-and-import.md:1)  

---

## 2. Business & Product Rationale

From PRD ([`prd.md`](docs/prd.md:293–348)):

- Weddings often have **multiple events** (Engagement, Poruwa/Nikah, Homecoming, Reception, etc.).
- Not every guest is invited to every event.
- Pain points today:
  - Separate spreadsheets per event.
  - Manual counting of RSVPs.
  - Confusion about who is invited where.

wedX should:

- Allow couples to:
  - Define which guests/households are invited to which events.
  - Send invitations (initially via shareable links or manual channels).
  - Track RSVPs per event.

From UX ([`ux-design-specification.md`](docs/ux-design-specification.md:341–390)):

- RSVP UX principles:
  - “Think in events” – per-event attendance.
  - “Think in households” – one response can cover multiple guests.
  - “Make it easy for parents” – simple, clear invitation and RSVP flows.

From Epics ([`epics.md`](docs/epics.md:215–244)):

- Epic 5 includes:
  - Guests & households (Story 5.1).
  - Invitations & RSVP per event (this story).
  - Later: seating and per-event logistics.

This story (5.2) focuses on **data model + basic internal UI** for invitations and RSVP, not full guest-facing portals yet.

---

## 3. Scope

### In Scope

1. Define and implement the **Invitations & RSVP data model**:

   - `GuestEventInvitation` (per guest/household per event).
   - RSVP status and counts.

2. Implement **backend APIs** for:

   - Creating invitations per event.
   - Updating RSVP status and counts.

3. Provide a **basic Invitations & RSVP management UI**:

   - Route: `/guests/invitations` or a tab within `/guests`.
   - Per-event view of invited guests and RSVP status.

4. Integrate **RSVP counts** into:

   - Event detail pages (`/events/[eventId]`).
   - Today dashboard (later stories can consume).

### Out of Scope

- Guest-facing RSVP pages and links.
- Email/WhatsApp invitation sending flows.
- Seating plan UI.

This story is about **internal tracking of invitations and RSVPs per event**.

---

## 4. Technical Requirements

### 4.1 Data Model

From architecture ([`architecture.md`](docs/architecture.md:199–260)), PRD ([`prd.md`](docs/prd.md:293–348)), and Story 5.1:

Existing entities:

- `Household` ([`story-5-1-implement-guests-and-households-data-model-and-import.md`](docs/sprint-artifacts/story-5-1-implement-guests-and-households-data-model-and-import.md:80–112))
- `Guest`
- `Event` (from Story 2.2)

Introduce:

1. **GuestEventInvitation**

   ```ts
   interface GuestEventInvitation {
     id: string;
     weddingId: string;
     eventId: string;
     householdId?: string;   // if invitation is at household level
     guestId?: string;       // if invitation is per individual
     inviteLevel: 'household' | 'guest';
     status: 'not_invited' | 'invited' | 'declined' | 'accepted' | 'maybe';
     invitedCount?: number;  // for households: number of people invited
     attendingCount?: number; // for households: number confirmed attending
     notes?: string;
     lastUpdatedAt: Date;
     createdAt: Date;
   }
   ```

   - Storage:
     - `guest_event_invitations` table/collection.

   - Rules:
     - Either `householdId` or `guestId` must be set (not both, unless you explicitly support both).
     - `inviteLevel` indicates which is used.

2. **Future-proofing for Guest-facing RSVP**

   - Do **not** implement tokens/links yet, but:
     - Keep `GuestEventInvitation` flexible enough to add:
       - `rsvpToken`, `rsvpSource`, etc. later.

### 4.2 APIs

Implement backend endpoints (paths can be adapted):

1. **List Invitations for an Event**

   - `GET /api/events/:eventId/invitations`

   - Returns:

     ```ts
     interface EventInvitationsResponse {
       eventId: string;
       invitations: (GuestEventInvitation & {
         household?: Household;
         guest?: Guest;
       })[];
     }
     ```

2. **Create/Update Invitations for an Event**

   - `POST /api/events/:eventId/invitations`

   - Request body:

     ```ts
     interface UpsertEventInvitationsRequest {
       invitations: {
         householdId?: string;
         guestId?: string;
         inviteLevel: 'household' | 'guest';
         status: 'not_invited' | 'invited' | 'declined' | 'accepted' | 'maybe';
         invitedCount?: number;
         attendingCount?: number;
         notes?: string;
       }[];
     }
     ```

   - Behavior:
     - For each entry:
       - Create or update `GuestEventInvitation` for that (eventId, householdId/guestId) pair.

3. **Update Single Invitation**

   - `PATCH /api/invitations/:invitationId`

   - Allows updating:
     - `status`
     - `invitedCount`
     - `attendingCount`
     - `notes`

4. **Aggregate RSVP Counts per Event**

   - `GET /api/events/:eventId/rsvp-summary`

   - Returns:

     ```ts
     interface EventRsvpSummary {
       eventId: string;
       invitedTotal: number;
       attendingTotal: number;
       declinedTotal: number;
       maybeTotal: number;
     }
     ```

   - This can be used by:
     - Event detail pages.
     - Today dashboard.

### 4.3 Invitations & RSVP Management UI

From UX ([`ux-design-specification.md`](docs/ux-design-specification.md:341–390)) and AppShell:

1. **Route & Layout**

   - Option A: Separate route:

     - `app/guests/invitations/page.tsx`

   - Option B: Tab within `/guests`:

     - Tabs: “Guests”, “Invitations & RSVP”.

   - Layout:

     - Use AppShell.
     - Main content: event selector + invitations table.

2. **Event Selector**

   - At top of page:

     - Dropdown of events (from `events` table).
     - When an event is selected:
       - Load invitations for that event via `GET /api/events/:eventId/invitations`.

3. **Invitations Table**

   - Rows:

     - One row per household or guest, depending on `inviteLevel`.
     - Columns:
       - Name (household or guest).
       - Side (bride/groom/both).
       - Role (family/friend/etc.).
       - Status (select).
       - Invited count (for households).
       - Attending count (for households).
       - Notes.

   - Status editing:

     - Use a `Select` component with options:
       - Not invited
       - Invited
       - Accepted
       - Declined
       - Maybe

     - On change:
       - `PATCH /api/invitations/:invitationId`.

   - Counts editing:

     - For households:
       - `invitedCount` and `attendingCount` as numeric inputs.
       - On blur or save:
         - `PATCH /api/invitations/:invitationId`.

4. **Bulk Invitation Creation**

   - Provide a way to **initialize invitations** for an event:

     - Button: “Initialize invitations for this event”.
     - Behavior:
       - For all households (or guests) in the wedding:
         - Create `GuestEventInvitation` with:
           - `status = 'not_invited'`.
           - `inviteLevel = 'household'` by default.
       - Then allow editing per row.

   - Endpoint:
     - Could reuse `POST /api/events/:eventId/invitations` with a special payload or a dedicated endpoint.

5. **RSVP Summary Display**

   - At top or side of the page:

     - Show summary from `GET /api/events/:eventId/rsvp-summary`:
       - “Invited: X”
       - “Accepted: Y”
       - “Declined: Z”
       - “Maybe: W”

   - Optional progress bar for attending vs invited.

### 4.4 Event Detail Integration

From Story 2.6 ([`story-2-6-implement-today-dashboard-deep-dive-and-navigation.md`](docs/sprint-artifacts/story-2-6-implement-today-dashboard-deep-dive-and-navigation.md:120–214)):

- On `/events/[eventId]/page.tsx`:

  - Add an **RSVP section**:

    - Show summary:
      - “Invited: X”
      - “Attending: Y”
      - “Declined: Z”
    - Link: “Manage invitations & RSVP” → `/guests/invitations?eventId=...`.

  - Data:
    - `GET /api/events/:eventId/rsvp-summary`.

This ensures event owners can quickly see RSVP status from the event view.

---

## 5. Dependencies & Relationships

### 5.1 Upstream Dependencies

- **Story 2.2 – Multi-Event Setup**:

  - Provides events to which invitations are attached.

- **Story 5.1 – Guests & Households**:

  - Provides guests and households to invite.

- **Epic 1 – Foundation & AppShell**:

  - Provides:
    - Auth and `weddingId`.
    - AppShell layout and navigation.

### 5.2 Downstream Dependencies

This story is a foundation for:

- **Later Epic 5 stories**:

  - Guest-facing RSVP pages:
    - Links per household/guest.
    - Self-service RSVP updates.
  - Seating plans:
    - Use `attendingCount` per event to plan tables.

- **Epic 6 – Budget & Payments Overview**:

  - Uses RSVP counts to:
    - Refine catering and venue cost estimates.

- **Epic 7 – AI Planner & Ritual Intelligence**:

  - Uses RSVP data to:
    - Suggest capacity adjustments.
    - Highlight under/over-attendance risks.

If this story is incomplete, invitations and RSVP will remain manual, and downstream planning features will lack reliable attendance data.

---

## 6. Acceptance Criteria

From [`epics.md`](docs/epics.md:215–244) plus technical elaboration:

1. **Data model implemented**

   - `guest_event_invitations` table/collection exists with fields described above.
   - Invitations link correctly to:
     - `weddingId`
     - `eventId`
     - `householdId` or `guestId`.

2. **APIs work**

   - `GET /api/events/:eventId/invitations` returns invitations with nested household/guest info.
   - `POST /api/events/:eventId/invitations` can create/update invitations in bulk.
   - `PATCH /api/invitations/:invitationId` updates status and counts.
   - `GET /api/events/:eventId/rsvp-summary` returns correct aggregates.

3. **Invitations & RSVP UI works**

   - When I navigate to `/guests/invitations` (or the Invitations tab):
     - I can select an event.
     - I see a table of households/guests with status and counts.
   - I can:
     - Initialize invitations for an event.
     - Change status per row.
     - Edit invited/attending counts for households.
   - Changes persist and reload correctly.

4. **Event detail integration**

   - On `/events/[eventId]`:
     - I see RSVP summary for that event.
     - I can click a link to manage invitations & RSVP for that event.

5. **UX alignment**

   - Invitations & RSVP UI:
     - Uses wedX design system (Tailwind + shadcn/ui).
     - Is understandable to both couples and parents.
   - Status labels and counts are:
     - Clear and non-technical.

---

## 7. Definition of Done (Story 5.2)

Story 5.2 is **Done** when:

1. Invitations & RSVP data model and migrations are implemented.
2. APIs for listing, creating/updating, and summarizing invitations per event are implemented and tested.
3. `/guests/invitations` (or equivalent) UI exists and supports per-event invitation and RSVP management.
4. Event detail pages show RSVP summary and link to the invitations UI.
5. Implementation follows architecture and UX conventions (Next.js App Router, Tailwind, shadcn/ui).
6. `docs/sprint-artifacts/sprint-status.yaml` is updated to move:
   - `5-2-implement-invitations-and-rsvp-per-event` from `backlog` → `drafted` (once this story file exists) and later `done` when implemented.