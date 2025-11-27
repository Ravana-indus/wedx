# Story 4.1 – Implement Vendor Directory and Basic Linking

## 1. Story Summary

**As a** couple  
**I want** a simple way to see and save potential wedding vendors in one place  
**So that** I can start planning which vendors to contact and link them to my events later.

Epic: **Epic 4 – Vendors & WhatsApp Bridge** ([`epics.md`](docs/epics.md:177–214))  

---

## 2. Business & Product Rationale

From PRD ([`prd.md`](docs/prd.md:237–292)):

- Vendors (photographers, decorators, bands, venues, etc.) are a major part of wedding planning.
- Couples often:
  - Discover vendors via social media, friends, or directories.
  - Save screenshots and links in scattered places (WhatsApp, Notes, etc.).
- wedX should:
  - Provide a **central vendor directory** for the wedding.
  - Allow couples to **bookmark** vendors they are considering.
  - Eventually integrate with WhatsApp for communication (later stories).

From UX ([`ux-design-specification.md`](docs/ux-design-specification.md:281–340)):

- Vendor UX principles:
  - “Start simple” – a **lightweight vendor list** before complex CRM features.
  - “Link to events” – vendors should be associated with specific events (e.g., Poruwa, Reception).
  - “Bridge to WhatsApp” – later, couples should be able to message vendors directly.

From Epics ([`epics.md`](docs/epics.md:177–214)):

- Epic 4 introduces:
  - Vendor directory and linking to events.
  - WhatsApp bridge and communication tracking (later stories).

This story (4.1) focuses on the **foundational vendor directory and basic linking**, without WhatsApp integration yet.

---

## 3. Scope

### In Scope

1. Define and implement the **vendor data model**:

   - Core vendor entity.
   - Relationship between vendors and weddings.
   - Relationship between vendors and events (basic linking).

2. Implement **backend APIs** for:

   - Creating and managing vendors for a wedding.
   - Linking vendors to events.

3. Implement a **basic Vendor Directory UI**:

   - Route: `/vendors`.
   - List of vendors for the current wedding.
   - Ability to:
     - Add a vendor (name, category, contact info, links).
     - View vendor details.
     - Link vendor to one or more events.

4. Integrate with **Events** (Epic 2):

   - Show linked vendors on event detail pages (even as a simple list).

### Out of Scope

- WhatsApp integration (sending messages, syncing conversations).
- Advanced vendor CRM features (pipelines, statuses, quotes).
- Vendor discovery marketplace (global vendor search).

This story is about **getting vendor data into wedX and linking it to events**.

---

## 4. Technical Requirements

### 4.1 Data Model

From architecture ([`architecture.md`](docs/architecture.md:199–260)) and PRD ([`prd.md`](docs/prd.md:237–292)):

Introduce or refine the following entities:

1. **Vendor**

   ```ts
   interface Vendor {
     id: string;
     weddingId: string; // vendors are scoped to a wedding for now
     name: string;
     category: 'photographer' | 'videographer' | 'decor' | 'venue' | 'band' | 'makeup' | 'planner' | 'catering' | 'other';
     phone?: string;
     email?: string;
     whatsappNumber?: string;
     websiteUrl?: string;
     instagramHandle?: string;
     notes?: string;
     createdAt: Date;
     updatedAt: Date;
   }
   ```

   - Storage:
     - `vendors` table/collection.

2. **VendorEventLink**

   - Many-to-many relationship between vendors and events.

   ```ts
   interface VendorEventLink {
     id: string;
     vendorId: string;
     eventId: string;
     roleLabel?: string; // e.g. 'Main photographer', 'Secondary band'
   }
   ```

   - Storage:
     - `vendor_events` or `event_vendors` table/collection.

3. **Future-proofing for WhatsApp**

   - Do **not** implement WhatsApp message tables yet, but:
     - Include `whatsappNumber` on `Vendor`.
     - This will be used in later stories for the WhatsApp bridge.

### 4.2 APIs

Implement backend endpoints (paths can be adapted to your conventions):

1. **List Vendors for a Wedding**

   - `GET /api/weddings/:id/vendors`

   - Returns:

     ```ts
     interface GetVendorsResponse {
       vendors: Vendor[];
     }
     ```

2. **Create Vendor**

   - `POST /api/weddings/:id/vendors`

   - Request body:

     ```ts
     interface CreateVendorRequest {
       name: string;
       category: string;
       phone?: string;
       email?: string;
       whatsappNumber?: string;
       websiteUrl?: string;
       instagramHandle?: string;
       notes?: string;
     }
     ```

   - Response:
     - Created `Vendor`.

3. **Update Vendor**

   - `PATCH /api/vendors/:vendorId`

   - Allows updating:
     - Contact info.
     - Category.
     - Notes.

4. **Delete Vendor** (optional for this story)

   - `DELETE /api/vendors/:vendorId`

5. **Link Vendor to Events**

   - `POST /api/vendors/:vendorId/events`

   - Request body:

     ```ts
     interface LinkVendorToEventsRequest {
       eventIds: string[];
       roleLabel?: string; // optional default role for all links
     }
     ```

   - Behavior:
     - Create or update `VendorEventLink` records.

6. **Get Vendors for an Event**

   - `GET /api/events/:eventId/vendors`

   - Returns:

     ```ts
     interface GetEventVendorsResponse {
       vendors: (Vendor & { roleLabel?: string })[];
     }
     ```

### 4.3 Vendor Directory UI

From UX ([`ux-design-specification.md`](docs/ux-design-specification.md:281–340)) and AppShell (Epic 1):

1. **Route & Layout**

   - `app/vendors/page.tsx` – Vendor Directory page.
   - Uses main AppShell:
     - Sidebar with “Vendors” item.
     - Top bar with wedding name.

2. **Vendor List**

   - Display vendors in a table or card list:

     - Columns/fields:
       - Name.
       - Category.
       - Primary contact (phone/email).
       - WhatsApp indicator (if `whatsappNumber` present).
       - Linked events count.

   - Actions:
     - “Add vendor” button.
     - Click row to open vendor detail panel/page.

3. **Add/Edit Vendor Form**

   - Use shadcn components (`Dialog`, `Form`, `Input`, `Select`, `Textarea`).

   - Fields:
     - Name (required).
     - Category (select).
     - Phone.
     - Email.
     - WhatsApp number.
     - Website URL.
     - Instagram handle.
     - Notes.

   - On submit:
     - `POST /api/weddings/:id/vendors` (create) or `PATCH /api/vendors/:vendorId` (update).
     - Refresh list.

4. **Linking Vendors to Events**

   - In vendor detail view:

     - Show a multi-select of events (from `events` table, Story 2.2).
     - Allow selecting one or more events.
     - Optional role label per event (can be a simple text input or dropdown).

   - On save:
     - `POST /api/vendors/:vendorId/events` with selected `eventIds`.

   - Display linked events as chips/badges with event names.

### 4.4 Event Detail Integration

From Story 2.6 ([`story-2-6-implement-today-dashboard-deep-dive-and-navigation.md`](docs/sprint-artifacts/story-2-6-implement-today-dashboard-deep-dive-and-navigation.md:120–214)):

- On `/events/[eventId]/page.tsx`:

  - Add a **Vendors section**:

    - Title: “Vendors for this event”.
    - List of linked vendors:
      - Name.
      - Category.
      - Contact icons (phone, WhatsApp, website).
    - Link: “Manage vendors” → `/vendors` (optionally with query param to focus on this event).

  - Data:
    - `GET /api/events/:eventId/vendors`.

This ensures a basic **two-way link** between events and vendors.

---

## 5. Dependencies & Relationships

### 5.1 Upstream Dependencies

- **Epic 1 – Foundation & AppShell**:

  - Provides:
    - Auth and `weddingId` context.
    - AppShell layout and navigation.

- **Epic 2 – Wizard & Events**:

  - Story 2.2 – Multi-Event Setup:
    - Provides events to link vendors to.
  - Story 2.6 – Today Dashboard Deep Dive & Navigation:
    - Provides event detail shells where vendor info will appear.

- **Epic 3 – Checklists** (optional but related):

  - Vendor-related checklist items may later link to vendors.

### 5.2 Downstream Dependencies

This story is a foundation for:

- **Later Epic 4 stories**:

  - WhatsApp bridge:
    - Using `whatsappNumber` to initiate conversations.
    - Logging communication.
  - Vendor pipeline and statuses:
    - Tracking “shortlisted”, “contacted”, “booked”, etc.

- **Epic 6 – Budget & Payments Overview**:

  - Vendors will be linked to budget lines and payments.

- **Epic 7 – AI Planner & Ritual Intelligence**:

  - AI can:
    - Suggest vendors based on wedding type and vibe.
    - Highlight missing vendor categories.

If this story is incomplete, vendor-related features in later epics will lack a consistent data model and UI entry point.

---

## 6. Acceptance Criteria

From [`epics.md`](docs/epics.md:177–214) plus technical elaboration:

1. **Vendor data model**

   - `vendors` table/collection exists with fields:
     - `weddingId`, `name`, `category`, contact info, `whatsappNumber`, `websiteUrl`, `instagramHandle`, `notes`.
   - `vendor_events` (or equivalent) exists to link vendors to events.

2. **Vendor APIs**

   - `GET /api/weddings/:id/vendors` returns vendors for the wedding.
   - `POST /api/weddings/:id/vendors` creates a new vendor.
   - `PATCH /api/vendors/:vendorId` updates vendor details.
   - `POST /api/vendors/:vendorId/events` links vendor to events.
   - `GET /api/events/:eventId/vendors` returns vendors linked to an event.

3. **Vendor Directory UI**

   - When I navigate to `/vendors`:
     - I see a list of vendors for my wedding.
     - I can add a new vendor via a form.
     - I can edit an existing vendor’s details.
   - Vendor list shows:
     - Name, category, primary contact, and an indicator if WhatsApp is available.

4. **Event linking**

   - In the vendor detail view:
     - I can select one or more events to link the vendor to.
     - After saving, the vendor shows linked events as chips/badges.
   - On an event detail page (`/events/[eventId]`):
     - I see a “Vendors for this event” section listing linked vendors.

5. **UX alignment**

   - Vendor Directory and event vendor sections:
     - Use wedX design system (Tailwind + shadcn/ui).
     - Are simple and understandable to both couples and parents.
   - There are no dead-ends:
     - From an event, I can navigate to `/vendors` to manage vendors.
     - From `/vendors`, I can navigate to events.

---

## 7. Definition of Done (Story 4.1)

Story 4.1 is **Done** when:

1. Vendor and vendor-event data models are implemented and migrated.
2. Vendor CRUD and linking APIs are implemented and tested.
3. `/vendors` page exists with:
   - Vendor list.
   - Add/edit vendor forms.
   - Event linking UI.
4. Event detail pages show linked vendors in a dedicated section.
5. Implementation follows architecture and UX conventions (Next.js App Router, Tailwind, shadcn/ui).
6. `docs/sprint-artifacts/sprint-status.yaml` is updated to move:
   - `4-1-implement-vendor-directory-and-basic-linking` from `backlog` → `drafted` (once this story file exists) and later `done` when implemented.