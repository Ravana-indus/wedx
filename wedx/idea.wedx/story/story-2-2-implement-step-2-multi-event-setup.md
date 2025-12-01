# Story 2.2 – Implement Step 2 – Multi-Event Setup

## 1. Story Summary

**As a** couple  
**I want** to configure all events in my celebration with basic details  
**So that** wedX can build a timeline and per-event checklists.

Epic: **Epic 2 – Wedding Wizard & Control Room** ([`epics.md`](docs/epics.md:131–145))  

---

## 2. Business & Product Rationale

From PRD ([`prd.md`](docs/prd.md:48–63)):

- **FR‑002 (Event Logic)**:
  - Based on wedding type, the system must auto-suggest events:
    - Common: Engagement, Reception, Pre-shoot, Welcome Dinner, After-party.
    - Cultural: Poruwa (Buddhist), Nikah (Muslim), Mehendi/Haldi/Sangeet (Hindu/North Indian), Homecoming (Sri Lankan).
  - Each event captures:
    - Location
    - Date
    - Time (Start–End)
    - Guest Count

From Epics ([`epics.md`](docs/epics.md:131–145)):

- Story 2.2 is the **Multi-Event Setup** step:
  - Couples toggle suggested events on/off.
  - Add custom events.
  - Provide basic details per event.
- This step feeds:
  - Event timeline views.
  - Per-event checklists.
  - Ritual configuration (Story 2.4).
  - Budget and vendor flows.

From UX ([`ux-design-specification.md`](docs/ux-design-specification.md:27–38,97–118)):

- Wizard is **wizard-first, then dashboard**:
  - Step 2 should feel like a focused, guided configuration of events.
  - It must remain understandable even for non-technical users and parents.

This story turns the abstract wedding type (from Story 2.1) into a **concrete list of events** with enough structure to drive timelines, checklists, and vendor planning.

---

## 3. Scope

### In Scope

1. Implement **Wizard Step 2 – Multi-Event Setup** UI and flow:

   - Full-screen wizard step with:
     - Title and short description.
     - Suggested events list (based on wedding type from Step 1).
     - Ability to:
       - Toggle suggested events on/off.
       - Add custom events.
       - Edit basic details per event:
         - Name
         - Location (or mark TBD)
         - Date
         - Time (start–end)
         - Guest estimate

2. Persist events in the backend data model:

   - Create or update `events` records linked to the current wedding, consistent with:
     - PRD entities ([`prd.md`](docs/prd.md:105–120)).
     - Architecture data model ([`architecture.md`](docs/architecture.md:199–217)).

3. Ensure the configuration is **reversible and persistent**:

   - If the user navigates away and returns to Step 2:
     - Their previously configured events are loaded and shown.
   - Changes are saved on “Next” (and optionally on change).

4. Wire this step into the **wizard flow**:

   - Route: e.g., `/wizard/step-2` or `/wizard/events`.
   - Integrate with wizard layout and navigation:
     - “Back” to Step 1.
     - “Next” to Step 3 (Vibe & Theme).

### Out of Scope

- Detailed per-event ritual configuration (Story 2.4).
- Checklist generation from events (Epic 3).
- Vendor assignment to events (Epic 4).
- Budget calculations (Epic 6).
- AI-based event suggestions beyond the static rules defined in PRD.

---

## 4. Technical Requirements

### 4.1 Routing & Layout

From architecture ([`architecture.md`](docs/architecture.md:65–79)) and UX ([`ux-design-specification.md`](docs/ux-design-specification.md:79–88,97–118)):

- Add Step 2 under the existing wizard route segment:

  - `app/wizard/step-2/page.tsx` – Multi-Event Setup step.

- Use the same wizard layout as Step 1:

  - `app/wizard/layout.tsx`:
    - Step title and description area.
    - Main content area for event list and editor.
    - Footer with navigation controls (Back, Next, maybe “Save & exit”).

- Navigation:

  - “Back” → `/wizard/step-1`.
  - “Next” → `/wizard/step-3` (Vibe & Theme), even if Step 3 is a placeholder.

### 4.2 Suggested Events Logic

From PRD ([`prd.md`](docs/prd.md:50–56)) and Epics ([`epics.md`](docs/epics.md:131–145)):

- Use the wedding type from Step 1 (Story 2.1) to determine suggested events:

  - Common events:
    - Engagement
    - Reception
    - Pre-shoot
    - Welcome Dinner
    - After-party

  - Cultural events (depending on type):
    - Poruwa (Buddhist)
    - Nikah (Muslim)
    - Mehendi/Haldi/Sangeet (Hindu/North Indian)
    - Homecoming (Sri Lankan)

- Implementation:

  - Fetch wedding type from backend (e.g., `wedding_type` and related fields).
  - Use a simple mapping function in the frontend or backend to produce a suggested event list.
  - Mark suggested events as “on” by default, but allow toggling off.

### 4.3 UI Behavior

- Event list:

  - For each event:
    - Checkbox or toggle to include/exclude.
    - Editable fields:
      - Name (text input).
      - Location (text input or “TBD” checkbox).
      - Date (date picker).
      - Time start/end (time pickers).
      - Guest estimate (number input).

- Custom events:

  - Provide an “Add custom event” button.
  - New events start with:
    - Empty name (required).
    - Location TBD.
    - No date/time.
    - Guest estimate optional.

- Validation:

  - At minimum:
    - Included events must have a name.
  - Optionally:
    - Warn if date/time is missing.
    - Warn if guest estimate is missing.

- UX details:

  - Use shadcn components (e.g., `Card`, `Input`, `Checkbox`, `Button`, `Popover`/`Calendar` for date).
  - Keep layout scannable:
    - Event name prominent.
    - Secondary fields grouped.

### 4.4 Data Model & Persistence

From architecture ([`architecture.md`](docs/architecture.md:199–217)):

- Entities:

  - `events`:
    - `id`
    - `wedding_id`
    - `name`
    - `date`
    - `time_start`
    - `time_end`
    - `location`
    - `guest_estimate`
    - `order_index` (for timeline ordering)
    - `is_suggested` (optional flag)
    - `is_active` or similar (if toggled off)

- For this story, persist:

  - All included events as `events` records.
  - Excluded suggested events:
    - Either not created, or marked as inactive.
  - Custom events:
    - Created as normal `events` with no `is_suggested` flag.

- API:

  - Implement or use endpoints like:
    - `GET /api/weddings/:id/events`
    - `PUT /api/weddings/:id/events` (bulk upsert) or
    - `POST /api/events`, `PATCH /api/events/:id`, `DELETE /api/events/:id`

- Frontend:

  - Use typed API client in `lib/api/events.ts`.
  - On load:
    - Fetch existing events for the wedding.
    - Merge with suggested events:
      - Existing events override suggestions.
  - On “Next”:
    - Save the full event list (create/update/delete as needed).
    - Navigate to Step 3.

### 4.5 State Management & Navigation

- State:

  - Local state for the list of events (suggested + existing + custom).
  - Track:
    - Inclusion (on/off).
    - Field values.
    - Dirty state (optional).

- Navigation:

  - “Next”:
    - Validates included events.
    - Saves to backend.
    - Navigates to `/wizard/step-3`.
  - “Back”:
    - Navigates to `/wizard/step-1` without losing unsaved changes if possible (or warn if unsaved).

---

## 5. Dependencies & Relationships

### 5.1 Upstream Dependencies

- **Story 2.1 – Wedding Type Selection**:
  - Wedding type must be captured and persisted.
- **Epic 1 stories**:
  - Foundation, AppShell, and Auth shell must be in place so wizard is behind auth and uses the shared layout.

- Data model and API basics:
  - `weddings` and `events` tables and endpoints exist or are stubbed.

### 5.2 Downstream Dependencies

This story is a prerequisite for:

- **Story 2.4 – Rituals Configuration**:
  - Uses events to attach rituals per event.
- **Epic 3 – Checklists & Jewelry Module**:
  - Uses events to filter and group tasks.
- **Epic 4 – Vendors & WhatsApp Bridge**:
  - Uses events to attach vendors and WhatsApp entries.
- **Epic 5 – Guests, Invitations & RSVP**:
  - Uses events for per-event attendance and seating.
- **Epic 6 – Budget & Payments Overview**:
  - Uses events for budget lines and payments.
- **Epic 7 – AI Planner & Ritual Intelligence**:
  - Uses events for timeline and conflict detection.

If this story is incomplete or inconsistent, all downstream flows that depend on events will be unreliable.

---

## 6. Acceptance Criteria

From [`epics.md`](docs/epics.md:131–145) plus technical elaboration:

1. **Suggested events appear based on wedding type**

   - When I open the wizard Step 2 route (e.g., `/wizard/step-2`),
     - Then I see a list of suggested events appropriate for my wedding type (from Step 1).
     - Each suggested event can be toggled on/off.

2. **Custom events can be added and edited**

   - When I click “Add custom event”,
     - Then a new event row appears where I can set:
       - Name (required).
       - Location (or mark TBD).
       - Date.
       - Time (start–end).
       - Guest estimate.

3. **Event details are editable and validated**

   - For each included event:
     - I can edit name, location, date, time, and guest estimate.
   - “Next” is disabled until:
     - All included events have a name.
   - Optional:
     - Warnings are shown for missing date/time or guest estimate.

4. **Persistence**

   - When I configure events and click “Next”,
     - Then my events are saved to the backend.
   - When I leave the wizard and return to Step 2,
     - Then my previously configured events (including custom ones) are loaded and shown.

5. **Navigation**

   - “Back” takes me to Step 1 (wedding type) without breaking the wizard.
   - “Next” takes me to Step 3 (Vibe & Theme), even if Step 3 is a placeholder.

6. **Data model alignment**

   - Events are stored in a way that matches the architecture’s data model:
     - Linked to `wedding_id`.
     - Fields for name, date, time, location, guest estimate, and ordering.

7. **UX alignment**

   - The step:
     - Uses wedX design system (colors, typography, spacing).
     - Feels like a full-screen, low-chrome wizard step.
     - Matches the “one major decision per step” pattern.

---

## 7. Definition of Done (Story 2.2)

Story 2.2 is **Done** when:

1. Wizard Step 2 route exists and renders the Multi-Event Setup UI.
2. Suggested events are generated based on wedding type and can be toggled.
3. Custom events can be added, edited, and removed.
4. Event data is validated, saved to backend, and persisted across sessions.
5. Navigation between Step 1, Step 2, and Step 3 works as expected.
6. Implementation follows architecture and UX conventions.
7. `docs/sprint-artifacts/sprint-status.yaml` is updated to move:
   - `2-2-implement-step-2-multi-event-setup` from `backlog` → `drafted` (once this story file exists) and later `done` when implemented.