# Story 4.2 – Implement WhatsApp Bridge for Vendor Communication (Basics)

## 1. Story Summary

**As a** couple  
**I want** to contact my vendors via WhatsApp directly from wedX  
**So that** I can keep communication organized and avoid hunting through random chats.

Epic: **Epic 4 – Vendors & WhatsApp Bridge** ([`epics.md`](docs/epics.md:177–214))  
Depends on:  
- [`story-4-1-implement-vendor-directory-and-basic-linking.md`](docs/sprint-artifacts/story-4-1-implement-vendor-directory-and-basic-linking.md:1)  

---

## 2. Business & Product Rationale

From PRD ([`prd.md`](docs/prd.md:237–292)):

- Most vendor communication in Sri Lankan and regional weddings happens on **WhatsApp**.
- Pain points today:
  - Chats are mixed with personal conversations.
  - It’s hard to remember which vendor was contacted for which event.
  - Couples and parents lose track of agreements and follow-ups.

wedX should:

- Provide a **bridge** between the Vendor Directory and WhatsApp:
  - Start WhatsApp conversations from vendor records.
  - (Later) track communication and reminders.

From UX ([`ux-design-specification.md`](docs/ux-design-specification.md:281–340)):

- WhatsApp bridge principles:
  - “Don’t fight WhatsApp” – use it as-is, don’t replace it.
  - “Make it easier to find the right chat” – start chats from the right context (vendor + event).
  - “Keep it simple at first” – basic deep links before advanced syncing.

From Epics ([`epics.md`](docs/epics.md:177–214)):

- Epic 4 includes:
  - Vendor directory and linking (Story 4.1).
  - WhatsApp bridge for vendor communication (this story).
  - Later: richer communication tracking and reminders.

This story (4.2) focuses on **basic WhatsApp deep-linking and minimal tracking**, not full message sync.

---

## 3. Scope

### In Scope

1. Add **WhatsApp deep-link actions** for vendors:

   - From Vendor Directory (`/vendors`).
   - From Event detail pages (`/events/[eventId]` → Vendors section).

2. Implement a **minimal communication log model**:

   - Track that a WhatsApp conversation was initiated from wedX:
     - Which vendor.
     - Which event (if any).
     - When.
     - Who initiated it (participant).

3. Provide **UI affordances**:

   - “Message on WhatsApp” buttons/icons.
   - A simple “Last contacted” indicator per vendor.

### Out of Scope

- Full WhatsApp message sync or reading chat history.
- Automated reminders or follow-ups.
- Multi-channel communication (email/SMS) – later stories.

This story is about **launching WhatsApp from the right context and logging that it happened**.

---

## 4. Technical Requirements

### 4.1 Data Model – Communication Log

Introduce a minimal communication log entity:

- **VendorCommunicationLog**

  ```ts
  interface VendorCommunicationLog {
    id: string;
    weddingId: string;
    vendorId: string;
    eventId?: string;        // optional: which event this relates to
    participantId?: string;  // who initiated (from WeddingParticipant)
    channel: 'whatsapp';
    direction: 'outbound';   // for now, only outbound from wedX
    createdAt: Date;
  }
  ```

- Storage:

  - `vendor_communications` table/collection.

- Purpose:

  - Track that wedX initiated a WhatsApp conversation.
  - Provide “Last contacted” and basic analytics later.

### 4.2 WhatsApp Deep Link Construction

Use standard WhatsApp deep link formats:

- For mobile and desktop:

  - `https://wa.me/<phoneNumber>?text=<encodedMessage>`

- `phoneNumber`:

  - Use `Vendor.whatsappNumber` (from Story 4.1).
  - Ensure it is stored in international format where possible (e.g., `+9477XXXXXXX` → `9477XXXXXXX` for wa.me).

- `text`:

  - Pre-fill a contextual message, e.g.:

    > Hi <VendorName>, this is <CoupleName> from wedX.  
    > We’re planning our <WeddingType> on <WeddingDate> and would love to discuss <EventName>.

  - Use data from:
    - `weddings` (name, date, type).
    - `events` (if launched from an event context).

Implementation:

- Add a small utility, e.g.:

  - [`lib/vendors/whatsapp-link.ts`](lib/vendors/whatsapp-link.ts:1)

  ```ts
  export function buildVendorWhatsAppLink(params: {
    phone: string;
    vendorName: string;
    coupleName?: string;
    weddingType?: string;
    weddingDate?: string;
    eventName?: string;
  }): string {
    const base = 'https://wa.me/';
    const normalizedPhone = params.phone.replace(/[^\d]/g, '');
    const messageLines = [
      `Hi ${params.vendorName}, this is ${params.coupleName ?? 'a couple'} from wedX.`,
      params.weddingType && params.weddingDate
        ? `We’re planning our ${params.weddingType} on ${params.weddingDate}.`
        : undefined,
      params.eventName
        ? `We’d love to discuss ${params.eventName}.`
        : undefined,
    ].filter(Boolean);
    const text = encodeURIComponent(messageLines.join(' '));
    return `${base}${normalizedPhone}?text=${text}`;
  }
  ```

### 4.3 APIs

Implement a small logging endpoint:

1. **Log WhatsApp Initiation**

   - `POST /api/vendors/:vendorId/whatsapp-log`

   - Request body:

     ```ts
     interface LogWhatsAppRequest {
       eventId?: string;
     }
     ```

   - Server-side:

     - Determine `weddingId` and `participantId` from auth/session.
     - Create `VendorCommunicationLog` with:
       - `channel = 'whatsapp'`
       - `direction = 'outbound'`
       - `createdAt = now`.

   - Response:

     ```ts
     interface LogWhatsAppResponse {
       success: boolean;
     }
     ```

2. **Get Last Contacted Info (optional)**

   - `GET /api/vendors/:vendorId/last-contact`

   - Returns:

     ```ts
     interface LastContactResponse {
       lastContactedAt?: string; // ISO date
       lastChannel?: 'whatsapp';
     }
     ```

   - Alternatively, include this in `GET /api/weddings/:id/vendors` to avoid extra calls.

### 4.4 Vendor Directory UI – WhatsApp Actions

From Story 4.1 ([`story-4-1-implement-vendor-directory-and-basic-linking.md`](docs/sprint-artifacts/story-4-1-implement-vendor-directory-and-basic-linking.md:120–214)):

1. **WhatsApp Button in Vendor List**

   - In `/vendors` list:

     - For vendors with `whatsappNumber`:
       - Show a WhatsApp icon/button in the row.
       - On click:
         - Call `POST /api/vendors/:vendorId/whatsapp-log` (fire-and-forget).
         - Open WhatsApp deep link in a new tab/window.

   - Use shadcn components:
     - `Button` with icon.
     - Tooltip: “Message on WhatsApp”.

2. **Vendor Detail View**

   - In vendor detail panel/page:

     - Show a prominent “Message on WhatsApp” button if `whatsappNumber` exists.
     - Show “Last contacted” info if available:
       - e.g., “Last contacted 3 days ago via WhatsApp”.

### 4.5 Event Detail Integration – Contextual WhatsApp

From Story 2.6 ([`story-2-6-implement-today-dashboard-deep-dive-and-navigation.md`](docs/sprint-artifacts/story-2-6-implement-today-dashboard-deep-dive-and-navigation.md:120–214)):

- On `/events/[eventId]/page.tsx`, in the “Vendors for this event” section:

  - For each vendor:

    - Show a WhatsApp icon/button if `whatsappNumber` exists.
    - On click:
      - Call `POST /api/vendors/:vendorId/whatsapp-log` with `eventId`.
      - Build WhatsApp link with `eventName` context.
      - Open WhatsApp.

This ensures that WhatsApp conversations are initiated from the **event context**, not just globally.

---

## 5. Dependencies & Relationships

### 5.1 Upstream Dependencies

- **Story 4.1 – Vendor Directory and Basic Linking**:

  - Provides:
    - `Vendor` model with `whatsappNumber`.
    - `/vendors` page.
    - Vendor–event linking.

- **Epic 2 – Events**:

  - Provides:
    - Events and event detail pages.
    - Event names for contextual messages.

- **Epic 1 – Auth & Participants** (and Story 3.4 if implemented):

  - Provides:
    - Current user/participant context for logging `participantId`.

### 5.2 Downstream Dependencies

This story is a foundation for:

- Later Epic 4 stories:

  - Communication history views:
    - Show a timeline of WhatsApp contacts per vendor.
  - Reminders:
    - “You haven’t followed up with this vendor in 7 days.”

- **Epic 7 – AI Planner & Ritual Intelligence**:

  - AI can:
    - Suggest follow-ups based on communication gaps.
    - Prioritize vendors based on contact history.

If this story is incomplete, wedX cannot provide a smooth bridge between vendor records and WhatsApp, and later communication features will lack basic logging.

---

## 6. Acceptance Criteria

From [`epics.md`](docs/epics.md:177–214) plus technical elaboration:

1. **WhatsApp deep links from Vendor Directory**

   - When I view `/vendors` and a vendor has a WhatsApp number,
     - Then I see a WhatsApp icon/button in their row.
   - When I click the button,
     - Then WhatsApp opens (web or app) with:
       - The vendor’s number.
       - A pre-filled message including my wedding context (where available).

2. **WhatsApp deep links from Event detail**

   - When I view `/events/[eventId]` and see the “Vendors for this event” section,
     - Then for each vendor with a WhatsApp number,
       - I see a WhatsApp icon/button.
   - When I click it,
     - Then WhatsApp opens with:
       - Vendor’s number.
       - A pre-filled message that mentions the specific event.

3. **Communication logging**

   - When I click a WhatsApp button (from `/vendors` or `/events/[eventId]`),
     - Then a `VendorCommunicationLog` entry is created with:
       - `weddingId`, `vendorId`, optional `eventId`, `channel = 'whatsapp'`, `direction = 'outbound'`.
   - When I fetch vendor data (via `GET /api/weddings/:id/vendors` or a dedicated endpoint),
     - Then I can see `lastContactedAt` for each vendor (if any logs exist).

4. **UI feedback**

   - In the Vendor Directory and vendor detail view:
     - I can see “Last contacted” information for vendors I have messaged via wedX.
   - If a vendor has no WhatsApp number:
     - The WhatsApp button is disabled or hidden.

5. **UX alignment**

   - WhatsApp actions:
     - Use wedX design system (Tailwind + shadcn/ui).
     - Are clearly labeled and not confusing.
   - The flow:
     - Feels like a natural extension of existing WhatsApp usage.
     - Does not require users to change how they use WhatsApp.

---

## 7. Definition of Done (Story 4.2)

Story 4.2 is **Done** when:

1. `VendorCommunicationLog` data model and persistence are implemented.
2. WhatsApp deep-link generation is implemented and used in Vendor Directory and Event detail pages.
3. Clicking “Message on WhatsApp” logs an outbound communication and opens WhatsApp with a contextual message.
4. Vendor list/detail views show basic “Last contacted” information.
5. Implementation follows architecture and UX conventions (Next.js App Router, Tailwind, shadcn/ui).
6. `docs/sprint-artifacts/sprint-status.yaml` is updated to move:
   - `4-2-implement-whatsapp-bridge-for-vendor-communication-basics` from `backlog` → `drafted` (once this story file exists) and later `done` when implemented.