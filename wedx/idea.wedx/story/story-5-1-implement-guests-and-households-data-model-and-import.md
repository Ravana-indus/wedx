# Story 5.1 – Implement Guests and Households Data Model and Import
Status: review

## 1. Story Summary

**As a** couple  
**I want** to store all our guests and family households in wedX  
**So that** we can manage invitations, RSVPs, and seating in one place instead of scattered spreadsheets.

Epic: **Epic 5 – Guests, Invitations & RSVP** ([`epics.md`](docs/epics.md:215–244))  

---

## 2. Business & Product Rationale

From PRD ([`prd.md`](docs/prd.md:293–348)):

- Guest management is currently done in:
  - Excel/Google Sheets.
  - WhatsApp lists.
  - Paper notes.
- Pain points:
  - Duplicated or missing guests.
  - No clear view of who belongs to which household.
  - Hard to coordinate invitations and RSVPs across multiple events.

wedX should:

- Provide a **structured guest model**:
  - Individual guests.
  - Households/families.
- Support:
  - Import from CSV/Excel.
  - Later: invitations, RSVPs, seating, and communication.

From UX ([`ux-design-specification.md`](docs/ux-design-specification.md:341–390)):

- Guest UX principles:
  - “Think in households, not just individuals.”
  - “Make import forgiving” – handle messy spreadsheets.
  - “Parents can help manage guests” – clear labels and simple flows.

From Epics ([`epics.md`](docs/epics.md:215–244)):

- Epic 5 introduces:
  - Guests & households.
  - Invitations & RSVP flows.
  - Seating and per-event attendance.

This story (5.1) focuses on the **core data model and import**, not invitations or RSVP UI yet.

---

## 3. Scope

### In Scope

1. Define and implement the **Guests & Households data model**:

   - `Household` (family unit).
   - `Guest` (individual person).
   - Relationship between guests and households.
   - Relationship between guests and the wedding.

2. Implement **backend APIs** for:

   - Creating and managing households and guests.
   - Bulk import of guests from CSV.

3. Provide a **basic Guests management UI**:

   - Route: `/guests`.
   - Table/list of guests with household grouping.
   - Simple “Add guest” and “Add household” forms.

4. Implement **CSV import**:

   - Upload a CSV file.
   - Map columns to fields.
   - Create households and guests accordingly.

### Out of Scope

- Invitations and RSVP flows (email/WhatsApp).
- Per-event attendance and seating plans.
- Guest-facing RSVP pages.

This story is about **getting guest data into wedX in a structured way**.

---

## 4. Technical Requirements

### 4.1 Data Model

From architecture ([`architecture.md`](docs/architecture.md:199–260)) and PRD ([`prd.md`](docs/prd.md:293–348)):

Introduce or refine the following entities:

1. **Household**

   ```ts
   interface Household {
     id: string;
     weddingId: string;
     name: string;          // e.g. 'Perera Family', 'John & Mary'
     addressLine1?: string;
     addressLine2?: string;
     city?: string;
     region?: string;
     postalCode?: string;
     country?: string;
     notes?: string;
     createdAt: Date;
     updatedAt: Date;
   }
   ```

   - Storage:
     - `households` table/collection.

2. **Guest**

   ```ts
   interface Guest {
     id: string;
     weddingId: string;
     householdId?: string;
     firstName: string;
     lastName?: string;
     displayName?: string;      // e.g. 'Uncle Sunil'
     email?: string;
     phone?: string;
     whatsappNumber?: string;
     role?: 'family' | 'friend' | 'colleague' | 'vendor' | 'other';
     side?: 'bride' | 'groom' | 'both' | 'other';
     isChild?: boolean;
     notes?: string;
     createdAt: Date;
     updatedAt: Date;
   }
   ```

   - Storage:
     - `guests` table/collection.

3. **Future-proofing for Invitations & RSVP**

   - Do **not** implement invitations/RSVP tables yet, but:
     - Ensure `Guest` has:
       - `email`, `phone`, `whatsappNumber` for future communication.
     - Later stories will add:
       - `GuestInvitation`, `GuestEventAttendance`, etc.

### 4.2 APIs

Implement backend endpoints (paths can be adapted to your conventions):

1. **List Households & Guests**

   - `GET /api/weddings/:id/households`

   - Returns:

     ```ts
     interface GetHouseholdsResponse {
       households: (Household & { guests: Guest[] })[];
     }
     ```

   - Optionally support pagination and search.

2. **Create Household**

   - `POST /api/weddings/:id/households`

   - Request body:

     ```ts
     interface CreateHouseholdRequest {
       name: string;
       addressLine1?: string;
       addressLine2?: string;
       city?: string;
       region?: string;
       postalCode?: string;
       country?: string;
       notes?: string;
     }
     ```

3. **Update Household**

   - `PATCH /api/households/:householdId`

4. **Create Guest**

   - `POST /api/weddings/:id/guests`

   - Request body:

     ```ts
     interface CreateGuestRequest {
       householdId?: string;
       firstName: string;
       lastName?: string;
       displayName?: string;
       email?: string;
       phone?: string;
       whatsappNumber?: string;
       role?: string;
       side?: string;
       isChild?: boolean;
       notes?: string;
     }
     ```

5. **Update Guest**

   - `PATCH /api/guests/:guestId`

6. **Delete Guest/Household** (optional for this story)

   - `DELETE /api/guests/:guestId`
   - `DELETE /api/households/:householdId`

### 4.3 CSV Import

Implement a CSV import endpoint and UI:

1. **Endpoint**

   - `POST /api/weddings/:id/guests/import`

   - Accepts:
     - `multipart/form-data` with a CSV file.
   - Server-side:
     - Parse CSV.
     - Map columns to fields (see below).
     - Create households and guests.

2. **Column Mapping**

   - Support flexible column names, e.g.:

     - Household name:
       - `household`, `family`, `family_name`
     - Guest name:
       - `first_name`, `last_name`, `name`
     - Contact:
       - `email`, `phone`, `whatsapp`
     - Side:
       - `side`, `bride_or_groom`
     - Role:
       - `role`, `relationship`

   - Implement a simple mapping UI or use a default mapping with documented expected headers.

3. **Import Rules**

   - For each row:

     - Determine or create `Household`:
       - If household name present:
         - Find existing household with same name (case-insensitive) for this wedding.
         - If not found, create new.
     - Create `Guest`:
       - Link to `householdId` if available.
       - Populate fields from columns.

   - Return:
     - Summary of import:
       - Number of households created.
       - Number of guests created.
       - Any rows skipped with reasons.

### 4.4 Guests Management UI

From UX ([`ux-design-specification.md`](docs/ux-design-specification.md:341–390)) and AppShell (Epic 1):

1. **Route & Layout**

   - `app/guests/page.tsx` – Guests management page.
   - Uses main AppShell:
     - Sidebar with “Guests” item.
     - Top bar with wedding name.

2. **Household & Guest List**

   - Display households as expandable sections:

     - Each household row:
       - Name.
       - Number of guests.
       - Side (if applicable).
       - City (optional).
     - Expand to show guests:

       - Guest rows:
         - Name (displayName or first+last).
         - Role (family/friend/etc.).
         - Side (bride/groom/both).
         - Contact (phone/email).
         - Child indicator.

   - Use shadcn components:
     - `Accordion` or `Table` + nested rows.
     - `Button`, `Input`, `Select`.

3. **Add Household & Guest**

   - “Add household” button:

     - Opens dialog with household form.
     - On submit:
       - `POST /api/weddings/:id/households`.
       - Refresh list.

   - “Add guest” button:

     - At top-level (for ungrouped guests) and within each household.
     - Opens dialog with guest form.
     - On submit:
       - `POST /api/weddings/:id/guests`.

4. **CSV Import UI**

   - On `/guests` page:

     - “Import from CSV” button.
     - Opens dialog:
       - File upload input.
       - Short instructions:
         - Expected columns.
         - Sample template link (e.g., download from [`docs/guests-import-template.csv`](docs/guests-import-template.csv:1) if you add one later).
       - On submit:
         - Upload to `POST /api/weddings/:id/guests/import`.
         - Show summary of import.

---

## 5. Dependencies & Relationships

### 5.1 Upstream Dependencies

- **Epic 1 – Foundation & AppShell**:

  - Provides:
    - Auth and `weddingId` context.
    - AppShell layout and navigation.

- **Epic 2 – Events**:

  - Provides:
    - Events that guests will later be invited to.
  - Not strictly required for this story, but important for future RSVP stories.

- **Epic 3 – Checklists** (optional):

  - Some checklist items may later reference guest counts.

### 5.2 Downstream Dependencies

This story is a foundation for:

- **Epic 5 later stories**:

  - Invitations & RSVP:
    - Sending invitations to guests/households.
    - Tracking responses per event.
  - Seating:
    - Assigning guests to tables and sections.
  - Communication:
    - WhatsApp/email flows for guests.

- **Epic 6 – Budget & Payments Overview**:

  - Uses guest counts to:
    - Estimate catering and venue costs.

- **Epic 7 – AI Planner & Ritual Intelligence**:

  - Uses guest data to:
    - Suggest capacity planning.
    - Highlight over/under-invitation.

If this story is incomplete, all guest-related flows (invitations, RSVP, seating, budget) will be blocked or forced to rely on ad-hoc data.

---

## 6. Acceptance Criteria

From [`epics.md`](docs/epics.md:215–244) plus technical elaboration:

1. **Data model implemented**

   - `households` and `guests` tables/collections exist with fields described above.
   - Guests are linked to weddings (and optionally households).

2. **APIs work**

   - `GET /api/weddings/:id/households` returns households with nested guests.
   - `POST /api/weddings/:id/households` creates a household.
   - `POST /api/weddings/:id/guests` creates a guest (with optional `householdId`).
   - `PATCH /api/households/:householdId` and `PATCH /api/guests/:guestId` update records.

3. **CSV import works**

   - When I upload a CSV via `/guests`:
     - Rows are parsed.
     - Households and guests are created according to mapping rules.
     - I see a summary of:
       - Households created.
       - Guests created.
       - Any errors.

4. **Guests UI works**

   - When I navigate to `/guests`:
     - I see households and their guests.
     - I can add a household via a form.
     - I can add a guest (with or without a household).
   - Data persists and reloads correctly.

5. **UX alignment**

   - Guests & households UI:
     - Uses wedX design system (Tailwind + shadcn/ui).
     - Is understandable to both couples and parents.
   - CSV import:
     - Provides clear instructions and feedback.

---

## 7. Definition of Done (Story 5.1)

Story 5.1 is **Done** when:

1. Guests & households data model and migrations are implemented.
2. CRUD APIs for households and guests are implemented and tested.
3. CSV import endpoint is implemented and can create households and guests from a sample file.
4. `/guests` page exists with:
   - Household + guest listing.
   - Add household/guest forms.
   - CSV import UI.
5. Implementation follows architecture and UX conventions (Next.js App Router, Tailwind, shadcn/ui).
6. `docs/sprint-artifacts/sprint-status.yaml` is updated to move:
   - `5-1-implement-guests-and-households-data-model-and-import` from `backlog` → `drafted` (once this story file exists) and later `done` when implemented.

### Dev Agent Record

#### Context Reference
- docs/sprint-artifacts/5-1-guest-list-table-import.context.xml

#### Debug Log
- Added in-memory households/guests model and CSV importer to seed data with summary/errors; ensured household name reuse and wedding scoping.
- Exposed REST endpoints for listing households with nested guests, creating/updating households and guests, and importing CSV via multipart or text.
- Built `/guests` page with add household/guest forms, ungrouped guest handling, CSV import UI, and grouped household/guest display.
- Added client helpers and tests for store, import, and UI flows; test suite passes (act warnings persist from existing suites).

#### Completion Notes
- Guests foundation delivered: CRUD APIs, CSV import, and /guests management UI using Tailwind + shadcn primitives. Data persists in in-memory store with standard {data,error} envelope.
- Tests: `npm test -- --runInBand` (pass; existing React act warnings remain).

#### File List
- docs/sprint-artifacts/story-5-1-implement-guests-and-households-data-model-and-import.md
- docs/sprint-artifacts/sprint-status.yaml
- docs/sprint-artifacts/5-1-guest-list-table-import.context.xml
- lib/guests/types.ts
- lib/guests/store.ts
- lib/guests/import.ts
- lib/api/guests.ts
- app/api/weddings/[id]/households/route.ts
- app/api/weddings/[id]/guests/route.ts
- app/api/weddings/[id]/guests/import/route.ts
- app/api/households/[id]/route.ts
- app/api/guests/[id]/route.ts
- app/guests/page.tsx
- __tests__/lib/guests/store.test.ts
- __tests__/lib/guests/import.test.ts
- __tests__/app/guests/page.test.tsx
