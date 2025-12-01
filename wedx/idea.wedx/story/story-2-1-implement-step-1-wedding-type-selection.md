# Story 2.1 – Implement Step 1 – Wedding Type Selection

## 1. Story Summary

**As a** couple  
**I want** to choose the type of wedding we’re planning  
**So that** wedX can load relevant events and rituals.

Epic: **Epic 2 – Wedding Wizard & Control Room** ([`epics.md`](docs/epics.md:112–131))  

---

## 2. Business & Product Rationale

From PRD ([`prd.md`](docs/prd.md:48–63)):

- **FR‑001 (Wedding Types)**: System must support selection of Hindu, Christian, Buddhist, Muslim, Civil, Mixed, and Custom.
- **FR‑002 (Event Logic)** and **FR‑004 (Ritual Injection)** depend on knowing the wedding type to:
  - Suggest appropriate events (Engagement, Poruwa, Nikah, Homecoming, etc.).
  - Inject culturally relevant rituals (Thali ceremony, Poruwa rituals, Nikah ceremony, etc.).

From Epics ([`epics.md`](docs/epics.md:112–131)):

- Epic 2’s goal is to configure the core of the wedding (type, events, vibe, rituals, constraints) and feed a clear control room (Today dashboard).
- Story 2.1 is the **first step** in the wizard and unlocks:
  - Event suggestions (Story 2.2).
  - Ritual configuration (Story 2.4).
  - Budget & collaborators tailoring (Story 2.5).

From UX ([`ux-design-specification.md`](docs/ux-design-specification.md:27–38,97–118)):

- The UX is **wizard-first**:
  - Full-screen, low-chrome steps.
  - One key decision per step.
  - Clear progress and reversibility.

This story delivers the **first wizard step** that captures wedding type in a way that is:

- Clear and friendly for couples.
- Structured enough for downstream logic (events, rituals, AI).

---

## 3. Scope

### In Scope

1. Implement **Wizard Step 1 – Wedding Type Selection** UI and flow:

   - Full-screen wizard step with:
     - Title and short description.
     - Card options for:
       - Hindu
       - Christian
       - Buddhist
       - Muslim
       - Civil
       - Mixed
       - Other
     - “Next” and “Back/Exit” controls (Back can be disabled if this is the first step).

2. Handle **Mixed** and **Other** types:

   - Mixed:
     - Allow specifying primary and secondary traditions (e.g., Hindu + Christian).
   - Other:
     - Provide a free-text field to describe the wedding type.

3. Persist the selection in the backend data model:

   - Store wedding type and related metadata in a `wedding_settings` or `weddings`-related model, consistent with:
     - PRD entities ([`prd.md`](docs/prd.md:105–120)).
     - Architecture data model ([`architecture.md`](docs/architecture.md:199–217)).

4. Ensure the selection is **reversible and persistent**:

   - If the user navigates away and returns to the wizard:
     - Their previous selection is loaded and shown.
   - Changes are saved on “Next” (and optionally on change).

5. Wire this step into the **wizard flow**:

   - Route: e.g., `/wizard/step-1` or `/wizard/type`.
   - Integrate with the wizard layout and navigation (progress indicator, etc.), assuming Epic 1 shell is in place.

### Out of Scope

- Implementing Step 2 (Multi-Event Setup), Step 3 (Vibe), Step 4 (Rituals), Step 5 (Budget & People) – covered by Stories 2.2–2.5.
- Generating events or rituals based on the selection (Stories 2.2 and 2.4).
- AI behavior or recommendations (Epic 7).
- Today dashboard behavior (Story 2.6).

---

## 4. Technical Requirements

### 4.1 Routing & Layout

From architecture ([`architecture.md`](docs/architecture.md:65–79)) and UX ([`ux-design-specification.md`](docs/ux-design-specification.md:79–88,97–118)):

- Add a wizard route segment under `app/`:

  - Example:
    - `app/wizard/layout.tsx` – wizard layout (full-screen, low-chrome).
    - `app/wizard/step-1/page.tsx` – Wedding Type Selection step.

- Wizard layout should:
  - Use the same design system (shadcn/ui + Tailwind).
  - Provide:
    - Step title and description area.
    - Main content area for cards and inputs.
    - Footer with navigation controls (Back, Next, maybe “Save & exit”).

- For this story, it is acceptable to:
  - Implement only Step 1 route and layout.
  - Stub out navigation to Step 2 (e.g., link to `/wizard/step-2` even if not implemented yet).

### 4.2 UI Behavior

From Epics ([`epics.md`](docs/epics.md:116–127)) and UX:

- Card options:

  - Each wedding type is represented as a selectable card with:
    - Title (e.g., “Hindu”).
    - Short description or icon (optional).
  - Only one base type can be selected at a time (except Mixed, which allows specifying two traditions).

- Mixed:

  - When “Mixed” is selected:
    - Show controls to choose:
      - Primary tradition.
      - Secondary tradition.
    - These can be dropdowns or chips with the same base types.

- Other:

  - When “Other” is selected:
    - Show a text input for free-form description.

- Validation:

  - User must select at least one type (or provide text for Other).
  - “Next” is disabled until the selection is valid.

- UX details:

  - Use shadcn components (e.g., `Card`, `Button`, `RadioGroup` or custom card selection).
  - Provide clear visual feedback for the selected card.

### 4.3 Data Model & Persistence

From PRD ([`prd.md`](docs/prd.md:105–120)) and architecture ([`architecture.md`](docs/architecture.md:199–217)):

- Entities:

  - `weddings`:
    - Fields like `type`, `primary_date`, `budget_range`, etc.
  - `wedding_settings` (or similar):
    - Additional configuration fields (e.g., diaspora flag, constraints).

- For this story, persist:

  - `wedding_type`:
    - Enum or string: `hindu`, `christian`, `buddhist`, `muslim`, `civil`, `mixed`, `other`.
  - `wedding_type_primary` (for Mixed).
  - `wedding_type_secondary` (for Mixed).
  - `wedding_type_other_description` (for Other).

- API:

  - Implement or use an endpoint like:
    - `PATCH /api/weddings/:id/settings` or
    - `PATCH /api/weddings/:id`
  - Request body includes the above fields.
  - Response returns updated wedding or settings object.

- Frontend:

  - Use a typed API client in `lib/api/` (per [`architecture.md`](docs/architecture.md:82–85)).
  - On load:
    - Fetch current wedding settings.
    - Pre-populate the UI.
  - On “Next”:
    - Save changes via API.
    - Navigate to Step 2.

### 4.4 State Management & Navigation

- State:

  - Local component state for current selection.
  - Synced with backend on:
    - Initial load (fetch).
    - “Next” click (save).

- Navigation:

  - “Next”:
    - Validates selection.
    - Saves to backend.
    - Navigates to `/wizard/step-2` (Multi-Event Setup).
  - “Back”:
    - If this is the first step, can:
      - Go back to a landing page, or
      - Be disabled.
  - “Exit” (optional):
    - Could return to `/dashboard` or a landing page.

---

## 5. Dependencies & Relationships

### 5.1 Upstream Dependencies

- **Epic 1 stories**:
  - Story 1.1 – Project initialized with Next.js + Tailwind + shadcn/ui.
  - Story 1.2 – AppShell and navigation implemented.
  - Story 1.3 – Auth shell in place (so wizard is behind auth).

- Data model and API basics:
  - `weddings` and/or `wedding_settings` tables and endpoints exist or are stubbed.

### 5.2 Downstream Dependencies

This story is a prerequisite for:

- **Story 2.2 – Multi-Event Setup**:
  - Uses wedding type to suggest events.
- **Story 2.4 – Rituals Configuration**:
  - Uses wedding type to suggest rituals.
- **Story 2.5 – Budget, Management & Collaborators**:
  - May tailor constraints based on type (e.g., diaspora, cultural expectations).
- **Epic 7 – AI Planner & Ritual Intelligence**:
  - Uses wedding type to tune AI suggestions.

If this story is incomplete or inconsistent, event and ritual logic will be unreliable.

---

## 6. Acceptance Criteria

From [`epics.md`](docs/epics.md:116–127) plus technical elaboration:

1. **Wedding type selection UI**

   - When I open the wizard Step 1 route (e.g., `/wizard/step-1`),
     - Then I see card options for:
       - Hindu, Christian, Buddhist, Muslim, Civil, Mixed, Other.
     - I can select exactly one base option at a time.

2. **Mixed and Other handling**

   - When I select “Mixed”,
     - Then I can specify primary and secondary traditions.
   - When I select “Other”,
     - Then I can describe the wedding type in a free-text field.

3. **Validation and navigation**

   - “Next” is disabled until:
     - A valid selection is made (and required extra fields for Mixed/Other are filled).
   - When I click “Next” with a valid selection,
     - Then my choice is saved to the backend.
     - I am navigated to Step 2 (or a placeholder route for Step 2).

4. **Persistence**

   - When I leave the wizard and return to Step 1,
     - Then my previous selection (including Mixed/Other details) is loaded and shown.

5. **Data model alignment**

   - The stored data for wedding type:
     - Uses a clear, documented schema (e.g., `wedding_type`, `wedding_type_primary`, `wedding_type_secondary`, `wedding_type_other_description`).
     - Is consistent with the architecture’s data model and naming conventions.

6. **UX alignment**

   - The step:
     - Uses wedX design system (colors, typography, spacing).
     - Feels like a full-screen, low-chrome wizard step.
     - Matches the “one decision per step” pattern from the UX spec.

---

## 7. Definition of Done (Story 2.1)

Story 2.1 is **Done** when:

1. Wizard Step 1 route exists and renders the wedding type selection UI.
2. Mixed and Other flows work as described.
3. Selection is validated, saved to backend, and persisted across sessions.
4. Navigation to Step 2 is wired (even if Step 2 is a placeholder).
5. Implementation follows architecture and UX conventions.
6. `docs/sprint-artifacts/sprint-status.yaml` is updated to move:
   - `2-1-implement-step-1-wedding-type-selection` from `backlog` → `drafted` (once this story file exists) and later `done` when implemented.