# Story 2.6 – Implement Today Dashboard Deep Dive and Navigation

## 1. Story Summary

**As a** couple  
**I want** to drill down from the Today dashboard into detailed views (events, wizard, and future modules)  
**So that** I can move smoothly from high-level overview to specific planning tasks.

Epic: **Epic 2 – Wedding Wizard & Control Room** ([`epics.md`](docs/epics.md:131–145))  

---

## 2. Business & Product Rationale

From PRD ([`prd.md`](docs/prd.md:143–176)):

- The Today dashboard is the **control room** for the wedding:
  - It should not be a dead-end.
  - It must provide clear paths into:
    - Events.
    - Checklists.
    - Vendors.
    - Budget.
    - Guests.
    - AI planner (later epics).

From UX ([`ux-design-specification.md`](docs/ux-design-specification.md:177–220)):

- Navigation principles:
  - “One tap from Today to anything important.”
  - “Always know where you are and how to get back.”
  - “Parents should not get lost.”

From Epics ([`epics.md`](docs/epics.md:131–145)):

- Story 2.6 is the **Today Dashboard Deep Dive & Navigation** story:
  - It extends the initial Today dashboard (Story 2.5) with:
    - Clickable cards and links.
    - Routing to detailed views.
    - A consistent navigation model between Today, wizard, and core modules.

This story ensures that the Today dashboard is a **functional hub**, not just a static summary.

---

## 3. Scope

### In Scope

1. Enhance the **Today dashboard** (from Story 2.5) with deep links:

   - Make cards and list items clickable:
     - Events overview → Events page / specific event.
     - Next actions → relevant routes (wizard, events, checklists placeholder).
     - Setup status → wizard steps.

2. Implement or wire up **detail routes** (even as placeholders):

   - `/events` – events list view.
   - `/events/[eventId]` – event detail view (basic shell).
   - `/wizard/step-1`…`/wizard/step-4` – ensure navigation back into wizard works from Today.
   - Any other key routes referenced by Today cards (e.g., `/checklist`, `/vendors`, `/budget`) as simple placeholder pages if not yet implemented.

3. Ensure **navigation consistency**:

   - From Today to detail views and back.
   - From wizard completion to Today.
   - From sidebar to Today and other modules.

4. Add **basic breadcrumbs or contextual cues** where needed:

   - So users know they came from Today and can get back.

### Out of Scope

- Full implementation of Events, Checklists, Vendors, Budget, Guests, or AI modules.
- Complex breadcrumb systems or advanced navigation patterns.
- Deep linking from external notifications (e.g., WhatsApp) – later epics.

This story focuses on **wiring and UX flow**, not full feature depth.

---

## 4. Technical Requirements

### 4.1 Routing & Pages

From architecture ([`architecture.md`](docs/architecture.md:65–79,151–190)):

- Ensure the following routes exist (even as minimal shells):

  - Today:
    - `/today` or `/dashboard/today` (from Story 2.5).

  - Events:
    - `app/events/page.tsx` – events list.
    - `app/events/[eventId]/page.tsx` – event detail.

  - Wizard:
    - `app/wizard/step-1/page.tsx`
    - `app/wizard/step-2/page.tsx`
    - `app/wizard/step-3/page.tsx`
    - `app/wizard/step-4/page.tsx`

  - Core modules (placeholders if not implemented yet):
    - `app/checklist/page.tsx`
    - `app/vendors/page.tsx`
    - `app/budget/page.tsx`
    - `app/guests/page.tsx`
    - `app/ai/page.tsx`
    - `app/inspiration/page.tsx`
    - `app/settings/page.tsx`

- All these routes should use the main AppShell layout (from Story 1.2), except the wizard which uses its own wizard layout.

### 4.2 Today Dashboard Click Targets

Extend the Today dashboard (Story 2.5) so that:

- **Events Overview Card**:

  - Each event row is clickable:
    - Click → `/events/[eventId]`.
  - “View all events” link:
    - Click → `/events`.

- **Next Actions Card**:

  - Each action item has a primary CTA:
    - “Invite your partner” → placeholder route (e.g., `/settings` or `/guests`).
    - “Review your events” → `/events`.
    - “Explore checklists” → `/checklist` (placeholder page).

- **Setup Status Card**:

  - “Edit setup” link:
    - Click → `/wizard/step-1` or the first incomplete step.
  - If wizard is incomplete:
    - Show a list of steps with links:
      - “Complete Step 2 – Events” → `/wizard/step-2`, etc.

### 4.3 Events List & Detail Shells

Implement minimal but coherent shells:

- `/events`:

  - Use AppShell layout.
  - Show:
    - Page title: “Events”.
    - List of events (name, date, location).
    - Each row clickable → `/events/[eventId]`.
  - Data:
    - Fetch from `GET /api/weddings/:id/events`.

- `/events/[eventId]`:

  - Use AppShell layout.
  - Show:
    - Event name.
    - Date, time, location.
    - Simple sections for:
      - “Rituals” (link back to wizard Step 4 or future rituals editor).
      - “Vendors” (placeholder).
      - “Checklist” (placeholder).
  - Data:
    - Fetch from `GET /api/events/:id` or from events list.

These shells will be expanded in later epics but must be navigable now.

### 4.4 Wizard & Today Integration

Ensure:

- From wizard completion (Step 4 “Finish”):

  - Redirect to Today dashboard (`/today`).

- From Today:

  - “Edit setup” and step links navigate back into wizard.
  - When returning to wizard:
    - Pre-populate fields with saved data (handled by previous stories).

- Optional:

  - Track `wizard_completed` and `last_completed_step` in backend or local state to drive Setup Status card.

### 4.5 Navigation & UX Consistency

From UX ([`ux-design-specification.md`](docs/ux-design-specification.md:79–118,177–220)):

- Sidebar:

  - Ensure Today, Events, Checklist, Vendors, Budget, Guests, AI, Inspiration, Settings items:
    - Are present.
    - Navigate to the correct routes (even if some are placeholders).

- Top bar:

  - Keep consistent across Today, Events, and other core pages.

- Breadcrumbs / Back links:

  - On `/events/[eventId]`:
    - Show a simple “Back to events” link.
    - Optionally “Back to Today” link or rely on sidebar.

- Visual cues:

  - Active sidebar item should reflect current route.
  - Today dashboard should feel like the “home” of the app.

---

## 5. Dependencies & Relationships

### 5.1 Upstream Dependencies

- **Story 1.2 – AppShell**:
  - Provides the main layout and sidebar navigation.
- **Story 2.1 – 2.4**:
  - Provide wizard data (wedding type, events, vibe, rituals).
- **Story 2.5 – Today Dashboard Initial Experience**:
  - Provides the base Today dashboard UI and summary cards.

- Data model and API basics:
  - `weddings`, `events`, `wedding_settings`, and `rituals` endpoints exist or are stubbed.

### 5.2 Downstream Dependencies

This story is a foundation for:

- **Epic 3 – Checklists & Jewelry Module**:
  - Will plug checklist widgets and deep links into Today and Events.
- **Epic 4 – Vendors & WhatsApp Bridge**:
  - Will plug vendor widgets and deep links into Today and Events.
- **Epic 6 – Budget & Payments Overview**:
  - Will plug budget widgets and deep links into Today and Events.
- **Epic 7 – AI Planner & Ritual Intelligence**:
  - Will surface AI suggestions and alerts on Today and event detail pages.

If this story is incomplete, users will have difficulty navigating from Today to detailed planning views, and future modules will lack a coherent navigation framework.

---

## 6. Acceptance Criteria

From [`epics.md`](docs/epics.md:131–145) plus technical elaboration:

1. **Clickable Today dashboard**

   - When I view the Today dashboard,
     - Then I can click:
       - Events in the Events overview card to open their detail pages.
       - “View all events” to open the Events list.
       - Next actions to open relevant routes.
       - Setup status links to open wizard steps.

2. **Events list and detail shells**

   - When I navigate to `/events`,
     - Then I see a list of my events with basic details.
     - Each event is clickable and opens `/events/[eventId]`.
   - When I navigate to `/events/[eventId]`,
     - Then I see a basic event detail page with:
       - Event name, date, time, location.
       - Placeholder sections for rituals, vendors, and checklist.

3. **Wizard & Today integration**

   - When I finish the wizard and click “Finish”,
     - Then I am redirected to the Today dashboard.
   - From the Today dashboard,
     - I can click “Edit setup” and be taken back into the wizard (Step 1 or first incomplete step).

4. **Sidebar navigation**

   - Sidebar items (Today, Events, Checklist, Vendors, Budget, Guests, AI, Inspiration, Settings):
     - Navigate to the correct routes (placeholders allowed for non-implemented modules).
     - Reflect the active route visually.

5. **Navigation consistency**

   - From any core page (Today, Events, etc.),
     - I can always get back to Today via sidebar.
   - I never land on a blank or 404 page when using links from Today.

6. **UX alignment**

   - Navigation flows are:
     - Predictable.
     - Easy to understand for both couples and parents.
   - The Today dashboard feels like the central hub of the app.

---

## 7. Definition of Done (Story 2.6)

Story 2.6 is **Done** when:

1. Today dashboard cards and links are fully clickable and route to appropriate pages.
2. Events list and event detail pages exist and are reachable from Today.
3. Wizard completion redirects to Today, and Today can send users back into the wizard.
4. Sidebar navigation is wired to all key modules (with placeholders where necessary).
5. Navigation is consistent and free of dead-ends or 404s for all links exposed from Today.
6. Implementation follows architecture and UX conventions (Next.js App Router, Tailwind, shadcn/ui).
7. `docs/sprint-artifacts/sprint-status.yaml` is updated to move:
   - `2-6-implement-today-dashboard-deep-dive-and-navigation` from `backlog` → `drafted` (once this story file exists) and later `done` when implemented.