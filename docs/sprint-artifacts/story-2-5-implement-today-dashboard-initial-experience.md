# Story 2.5 – Implement Today Dashboard Initial Experience

## 1. Story Summary

**As a** couple  
**I want** a clear “Today” dashboard after finishing the wizard  
**So that** I can immediately see what to do next and feel in control of the planning.

Epic: **Epic 2 – Wedding Wizard & Control Room** ([`epics.md`](docs/epics.md:131–145))  

---

## 2. Business & Product Rationale

From PRD ([`prd.md`](docs/prd.md:143–176)):

- After the initial wizard, couples should land on a **control room / Today dashboard** that:
  - Summarizes key information from the wizard:
    - Wedding type and date.
    - Number of events.
    - High-level vibe/theme.
  - Highlights **immediate next actions**.
  - Reduces anxiety by making the plan feel structured and manageable.

From UX ([`ux-design-specification.md`](docs/ux-design-specification.md:177–220)):

- The Today dashboard is the **primary home** after onboarding:
  - It should feel like a calm, reassuring command center.
  - It should be understandable to both couples and parents.
  - It should avoid overwhelming users with too many widgets at once.

From Epics ([`epics.md`](docs/epics.md:131–145)):

- Story 2.5 is the **Today Dashboard Initial Experience**:
  - It connects the wizard to the ongoing product experience.
  - It shows a small, curated set of cards and actions based on wizard data.

This story ensures that finishing the wizard leads to a **useful, actionable landing page**, not a dead end.

---

## 3. Scope

### In Scope

1. Implement the **Today dashboard route and layout**:

   - Route: `/today` (or `/dashboard/today` if nested under dashboard).
   - Use the main AppShell (sidebar + top bar) from Epic 1.

2. Display a **summary header** based on wizard data:

   - Wedding type and date.
   - Number of events configured.
   - High-level vibe/theme.

3. Show a **small set of initial cards/widgets**:

   - “Next 3 actions” (static or lightly rule-based for now).
   - “Events overview” (count and quick links).
   - “Wizard completion status” (e.g., “Onboarding complete” or “X steps remaining” if wizard is incomplete).

4. Wire navigation from the wizard:

   - After completing Step 4 (Rituals Configuration) or the final wizard step:
     - Redirect to Today dashboard.
   - Provide a way to return to the wizard from Today (e.g., “Edit setup” link).

### Out of Scope

- Full checklist integration (Epic 3).
- Detailed timeline views (Epic 3).
- Vendor widgets (Epic 4).
- Budget widgets (Epic 6).
- AI-driven cards (Epic 7).

This story focuses on a **minimal but coherent** initial Today dashboard.

---

## 4. Technical Requirements

### 4.1 Routing & Layout

From architecture ([`architecture.md`](docs/architecture.md:65–79,151–190)) and UX ([`ux-design-specification.md`](docs/ux-design-specification.md:79–118,177–220)):

- Route:

  - Add a Today dashboard page:
    - `app/today/page.tsx` **or**
    - `app/dashboard/today/page.tsx` (depending on final routing convention).

- Layout:

  - Use the main AppShell from Story 1.2:
    - Sidebar with navigation (Today, Checklist, Events, Guests, Vendors, Budget, AI, Inspiration, Settings).
    - Top bar with wedding name, user menu, and possibly date countdown.

- Navigation:

  - From wizard:
    - After final step (currently Step 4), navigate to `/today`.
  - From sidebar:
    - “Today” item should route to this page.

### 4.2 Data Sources

Use data captured in previous wizard steps:

- From Step 1 (Story 2.1):

  - Wedding type (and primary/secondary traditions).
  - Possibly wedding date (if captured there or in a related step).

- From Step 2 (Story 2.2):

  - Events list:
    - Count of events.
    - Names and dates.

- From Step 3 (Story 2.3):

  - Vibe & theme:
    - Primary/secondary vibe.
    - Color palette.
    - Mood tags.

- From Step 4 (Story 2.4):

  - Rituals (for future use; may not be heavily surfaced yet).

Implementation:

- Add a backend endpoint or reuse existing ones to fetch a **Today dashboard view model**, or:
  - Compose the data on the frontend by calling:
    - `GET /api/weddings/:id`
    - `GET /api/weddings/:id/events`
    - `GET /api/weddings/:id/settings` (style)
    - `GET /api/weddings/:id/rituals` (optional for this story)

- For this story, a simple composition on the frontend is acceptable.

### 4.3 UI Behavior

#### 4.3.1 Summary Header

- Show:

  - Wedding name (if available) or “Your Wedding”.
  - Wedding type (e.g., “Hindu–Christian mixed wedding”).
  - Wedding date (if known) and countdown (e.g., “230 days to go”).
  - Number of events (e.g., “5 events configured”).

- Visual design:

  - Use wedX design system:
    - Soft background.
    - Clear typography.
    - Possibly an icon or small illustration.

#### 4.3.2 Initial Cards/Widgets

Implement at least these cards:

1. **Next Actions Card**

   - Title: “Next 3 actions”.
   - Content:
     - For now, static or lightly rule-based items, e.g.:
       - “Invite your partner to join wedX.”
       - “Review your events and add missing details.”
       - “Explore checklists for your main ceremony.”
   - Each item can be a link or button to the relevant section (even if some are placeholders).

2. **Events Overview Card**

   - Title: “Your events”.
   - Content:
     - Number of events.
     - List of 3–5 events with:
       - Name.
       - Date.
       - Simple status (e.g., “Configured”).
   - Link: “View all events” → `/events` (or equivalent).

3. **Wizard Status Card**

   - Title: “Setup status”.
   - Content:
     - If wizard is complete:
       - “Onboarding complete – you can always edit your setup.”
     - If wizard is incomplete (e.g., user skipped a step):
       - Show which steps are remaining.
   - Link: “Edit setup” → `/wizard/step-1` or the first incomplete step.

#### 4.3.3 Empty States

- If some data is missing (e.g., no events yet):

  - Show friendly empty states:
    - “You haven’t added any events yet. Start with the wizard or add an event manually.”

### 4.4 Data Model & Persistence

From architecture ([`architecture.md`](docs/architecture.md:199–217)):

- No new core tables are strictly required for this story.
- You may add:

  - A simple `wizard_progress` field or table to track:
    - `wizard_completed` (boolean).
    - `last_completed_step` (number or key).

- API:

  - Optionally add:
    - `GET /api/weddings/:id/today` – returns a composed Today dashboard view model.
    - `PATCH /api/weddings/:id/wizard-progress` – updates wizard completion state.

- For this story, you can also:

  - Infer wizard completion from existing data (e.g., presence of required fields).
  - Hardcode “Onboarding complete” once Step 4 is saved.

### 4.5 State Management & Navigation

- State:

  - Local state for:
    - Today view model (summary + cards).
  - Use React Query or similar (if present) or simple `useEffect` + `fetch`.

- Navigation:

  - From wizard:
    - After Step 4 “Finish”:
      - Save data.
      - Redirect to `/today`.
  - From Today:
    - Links to:
      - Wizard (edit setup).
      - Events page.
      - Future checklists page.

---

## 5. Dependencies & Relationships

### 5.1 Upstream Dependencies

- **Story 2.1 – Wedding Type Selection**:
  - Provides wedding type and possibly date.
- **Story 2.2 – Multi-Event Setup**:
  - Provides events list and dates.
- **Story 2.3 – Vibe & Theme Selection**:
  - Provides style metadata for summary.
- **Story 2.4 – Rituals Configuration**:
  - Provides rituals for future widgets (not heavily used yet).
- **Epic 1 stories**:
  - AppShell and auth must be in place so Today dashboard is behind auth and uses the shared layout.

### 5.2 Downstream Dependencies

This story is a foundation for:

- **Epic 3 – Checklists & Jewelry Module**:
  - Today dashboard will later surface checklist summaries.
- **Epic 4 – Vendors & WhatsApp Bridge**:
  - Vendor-related cards will appear here.
- **Epic 6 – Budget & Payments Overview**:
  - Budget summary cards will appear here.
- **Epic 7 – AI Planner & Ritual Intelligence**:
  - AI suggestions and alerts will surface on Today.

If this story is incomplete, users will lack a coherent home after onboarding, and downstream modules will have no obvious place to surface their value.

---

## 6. Acceptance Criteria

From [`epics.md`](docs/epics.md:131–145) plus technical elaboration:

1. **Today dashboard route and layout**

   - When I navigate to `/today` (or `/dashboard/today`),
     - Then I see the main AppShell with sidebar and top bar.
     - The main content area shows the Today dashboard, not a blank page.

2. **Summary header**

   - When I have completed the wizard (Steps 1–4),
     - Then the Today dashboard header shows:
       - My wedding type.
       - My wedding date (if known).
       - The number of events configured.
     - If some data is missing, I see a friendly message or placeholder.

3. **Initial cards/widgets**

   - I see at least:
     - A “Next 3 actions” card with actionable items.
     - An “Events overview” card with event count and a short list.
     - A “Setup status” card indicating whether onboarding is complete.

4. **Wizard completion flow**

   - When I finish the last wizard step and click “Finish”,
     - Then I am redirected to the Today dashboard.
   - From the Today dashboard,
     - I can click a link to return to the wizard to edit my setup.

5. **Empty states**

   - If I have not configured events or other data,
     - Then I see clear, friendly empty states with guidance on what to do next.

6. **Data model alignment**

   - The Today dashboard uses existing entities (`weddings`, `events`, `wedding_settings`, etc.) and does not introduce conflicting models.

7. **UX alignment**

   - The Today dashboard:
     - Uses wedX design system (colors, typography, spacing).
     - Feels calm and reassuring, not cluttered.
     - Is understandable to both couples and parents.

---

## 7. Definition of Done (Story 2.5)

Story 2.5 is **Done** when:

1. Today dashboard route exists and is wired into the AppShell navigation.
2. The dashboard header shows key summary information from the wizard.
3. Initial cards/widgets (Next actions, Events overview, Setup status) are implemented with reasonable content.
4. Wizard completion redirects to the Today dashboard.
5. Users can navigate back to the wizard from Today to edit their setup.
6. Implementation follows architecture and UX conventions (Next.js App Router, Tailwind, shadcn/ui).
7. `docs/sprint-artifacts/sprint-status.yaml` is updated to move:
   - `2-5-implement-today-dashboard-initial-experience` from `backlog` → `drafted` (once this story file exists) and later `done` when implemented.