# Story 2.4 – Implement Step 4 – Rituals Configuration

## 1. Story Summary

**As a** couple (and our families)  
**I want** to configure the key rituals for each event in our celebration  
**So that** wedX can generate accurate, culturally aligned checklists and timelines.

Epic: **Epic 2 – Wedding Wizard & Control Room** ([`epics.md`](docs/epics.md:131–145))  

---

## 2. Business & Product Rationale

From PRD ([`prd.md`](docs/prd.md:83–104,121–142)):

- The product must support:
  - Different **religious and cultural traditions** (Hindu, Buddhist, Christian, Muslim, Civil, Mixed).
  - **Rituals** that vary by tradition and event (e.g., Poruwa ceremony, Nikah, Mehendi, Homecoming).
- Rituals drive:
  - Detailed checklists (tasks, items, jewelry).
  - Timelines (what happens when, and in what order).
  - Vendor requirements (e.g., officiant, band, photographer coverage).

From UX ([`ux-design-specification.md`](docs/ux-design-specification.md:61–78,143–176)):

- Ritual configuration must:
  - Be understandable to both couples and parents.
  - Avoid overwhelming users with jargon.
  - Provide sensible defaults based on wedding type and events.

From Epics ([`epics.md`](docs/epics.md:131–145)):

- Story 2.4 is the **Rituals Configuration** step:
  - Couples (and parents) confirm which rituals they will perform for each event.
  - They can add or remove rituals and adjust basic details.
  - This feeds into:
    - Checklists (Epic 3).
    - Vendor planning (Epic 4).
    - AI ritual intelligence (Epic 7).

This story turns the combination of **wedding type** (Story 2.1) and **events** (Story 2.2) into a structured set of **rituals** that downstream modules can use.

---

## 3. Scope

### In Scope

1. Implement **Wizard Step 4 – Rituals Configuration** UI and flow:

   - Full-screen wizard step with:
     - Title and short description.
     - Per-event ritual configuration:
       - For each event (from Step 2), show suggested rituals.
       - Allow toggling rituals on/off.
       - Allow adding custom rituals.
       - Allow basic configuration per ritual (e.g., notes, approximate duration).

2. Suggested rituals logic:

   - Based on:
     - Wedding type (from Step 1).
     - Event type/name (from Step 2).
   - Provide a sensible default list of rituals per event.

3. Persist rituals in the backend data model:

   - Create or update `rituals` (or equivalent) records linked to:
     - `wedding_id`
     - `event_id`
   - Store:
     - Ritual name.
     - Tradition/type.
     - Order within event.
     - Notes and optional metadata.

4. Ensure configuration is **reversible and persistent**:

   - If the user navigates away and returns to Step 4:
     - Their previously configured rituals are loaded and shown.

5. Wire this step into the **wizard flow**:

   - Route: e.g., `/wizard/step-4`.
   - Integrate with wizard layout and navigation:
     - “Back” to Step 3 (Vibe & Theme).
     - “Next” to Step 5 (Today Dashboard intro / summary).

### Out of Scope

- Full checklist generation (Epic 3) – this story only ensures rituals are configured and persisted.
- Detailed per-ritual item lists (e.g., every jewelry piece) – that belongs to Epic 3.
- AI-based ritual recommendations beyond static rules (Epic 7).
- Vendor assignment to rituals (Epic 4).

---

## 4. Technical Requirements

### 4.1 Routing & Layout

From architecture ([`architecture.md`](docs/architecture.md:65–79)) and UX ([`ux-design-specification.md`](docs/ux-design-specification.md:79–88,143–176)):

- Add Step 4 under the existing wizard route segment:

  - `app/wizard/step-4/page.tsx` – Rituals Configuration step.

- Use the same wizard layout as previous steps:

  - `app/wizard/layout.tsx`:
    - Step title and description area.
    - Main content area for rituals UI.
    - Footer with navigation controls (Back, Next, maybe “Save & exit”).

- Navigation:

  - “Back” → `/wizard/step-3`.
  - “Next” → `/wizard/step-5` (Today Dashboard intro / summary, or next step placeholder).

### 4.2 Ritual Suggestion Logic

Use a simple rules engine based on:

- Wedding type (from Step 1):
  - Hindu, Buddhist, Christian, Muslim, Civil, Mixed, Other.
- Event type/name (from Step 2):
  - Engagement, Poruwa, Nikah, Mehendi, Sangeet, Haldi, Homecoming, Reception, etc.

Implementation approach:

- Define a config mapping in code, e.g.:

  - [`lib/config/ritual-templates.ts`](lib/config/ritual-templates.ts:1)

- Example structure:

  ```ts
  interface RitualTemplate {
    key: string;
    name: string;
    tradition: 'hindu' | 'buddhist' | 'christian' | 'muslim' | 'civil' | 'mixed' | 'other';
    defaultDurationMinutes?: number;
    recommendedEventTypes: string[]; // e.g. ['poruwa', 'reception']
  }
  ```

- For each event:
  - Filter templates by:
    - Tradition matching wedding type (or one of the types for Mixed).
    - `recommendedEventTypes` containing the event type/name.
  - Mark these as suggested rituals.

### 4.3 UI Behavior

- Event-level grouping:

  - Display rituals grouped by event:
    - Accordion or section per event (e.g., “Poruwa Ceremony”, “Reception”).
  - Each event section shows:
    - Suggested rituals list.
    - “Add custom ritual” button.

- Ritual list per event:

  - For each ritual:
    - Checkbox/toggle to include/exclude.
    - Fields:
      - Name (text, required if included).
      - Tradition (read-only or selectable for custom rituals).
      - Approximate duration (optional, number in minutes).
      - Notes (optional textarea).

- Custom rituals:

  - “Add custom ritual”:
    - Adds a new ritual row with:
      - Empty name (required).
      - Tradition defaulted to wedding type (or “other”).
      - Optional duration and notes.

- Validation:

  - At minimum:
    - Included rituals must have a name.
  - Optional:
    - Warn if no rituals are selected for an event that typically has rituals (e.g., Poruwa, Nikah).

- UX details:

  - Use shadcn components:
    - `Accordion`, `Card`, `Input`, `Textarea`, `Checkbox`/`Switch`, `Button`.
  - Keep layout readable:
    - Event headers sticky or clearly separated.
    - Ritual rows compact but clear.

### 4.4 Data Model & Persistence

From architecture ([`architecture.md`](docs/architecture.md:199–217)) and PRD ([`prd.md`](docs/prd.md:121–142)):

- Entities (conceptual):

  - `rituals`:
    - `id`
    - `wedding_id`
    - `event_id`
    - `name`
    - `tradition` (enum/string)
    - `order_index`
    - `duration_minutes` (optional)
    - `notes` (optional)
    - `is_suggested` (optional flag)
    - `is_active` (boolean)

- For this story, persist:

  - All included rituals as `rituals` records.
  - Excluded suggested rituals:
    - Either not created, or marked as inactive.
  - Custom rituals:
    - Created as normal `rituals` with no `template_key` (if you add such a field).

- API:

  - Implement or use endpoints like:
    - `GET /api/weddings/:id/rituals`
    - `PUT /api/weddings/:id/rituals` (bulk upsert) or
    - `POST /api/rituals`, `PATCH /api/rituals/:id`, `DELETE /api/rituals/:id`

- Frontend:

  - Add a typed client in:
    - [`lib/api/rituals.ts`](lib/api/rituals.ts:1)

  - On load:
    - Fetch events for the wedding (from Step 2).
    - Fetch existing rituals for the wedding.
    - Merge:
      - Existing rituals override suggestions.
      - Add missing suggested rituals as inactive by default.

  - On “Next”:
    - Save the full ritual list (create/update/delete as needed).
    - Navigate to Step 5.

### 4.5 State Management & Navigation

- State:

  - Local state structure like:

    ```ts
    interface RitualState {
      id?: string;
      eventId: string;
      name: string;
      tradition: string;
      durationMinutes?: number;
      notes?: string;
      included: boolean;
      isSuggested?: boolean;
      orderIndex: number;
    }

    type EventRitualsState = Record<string, RitualState[]>; // keyed by eventId
    ```

- Navigation:

  - “Next”:
    - Validates included rituals.
    - Saves to backend.
    - Navigates to `/wizard/step-5`.
  - “Back”:
    - Navigates to `/wizard/step-3` without losing unsaved changes if possible (or warn if unsaved).

---

## 5. Dependencies & Relationships

### 5.1 Upstream Dependencies

- **Story 2.1 – Wedding Type Selection**:
  - Wedding type determines which ritual templates are relevant.
- **Story 2.2 – Multi-Event Setup**:
  - Events must exist so rituals can be attached to specific events.
- **Story 2.3 – Vibe & Theme Selection**:
  - Not strictly required for ritual logic, but wizard flow expects Step 3 before Step 4.
- **Epic 1 stories**:
  - Foundation, AppShell, and Auth shell must be in place so wizard is behind auth and uses the shared layout.

- Data model and API basics:
  - `weddings`, `events`, and `rituals` tables and endpoints exist or are stubbed.

### 5.2 Downstream Dependencies

This story is a prerequisite for:

- **Epic 3 – Checklists & Jewelry Module**:
  - Uses rituals to generate tasks and item lists.
- **Epic 4 – Vendors & WhatsApp Bridge**:
  - Uses rituals to determine vendor coverage and communication.
- **Epic 7 – AI Planner & Ritual Intelligence**:
  - Uses rituals as core input for AI suggestions and conflict detection.

If this story is incomplete or inconsistent, downstream checklists and AI features will be generic or misaligned with the couple’s actual rituals.

---

## 6. Acceptance Criteria

From [`epics.md`](docs/epics.md:131–145) plus technical elaboration:

1. **Per-event ritual suggestions**

   - When I open the wizard Step 4 route (e.g., `/wizard/step-4`),
     - Then I see my events from Step 2, each with a list of suggested rituals based on my wedding type.
     - Each suggested ritual can be toggled on/off.

2. **Custom rituals**

   - For any event,
     - When I click “Add custom ritual”,
       - Then a new ritual row appears where I can set:
         - Name (required).
         - Tradition (optional or defaulted).
         - Approximate duration (optional).
         - Notes (optional).

3. **Editing and validation**

   - For each included ritual:
     - I can edit name, duration, and notes.
   - “Next” is disabled until:
     - All included rituals have a name.
   - Optional:
     - A warning is shown if an event has no rituals selected where rituals are typically expected.

4. **Persistence**

   - When I configure rituals and click “Next”,
     - Then my rituals are saved to the backend.
   - When I leave the wizard and return to Step 4,
     - Then my previously configured rituals (including custom ones) are loaded and shown.

5. **Navigation**

   - “Back” takes me to Step 3 (Vibe & Theme) without breaking the wizard.
   - “Next” takes me to Step 5 (Today Dashboard intro / summary).

6. **Data model alignment**

   - Rituals are stored in a way that matches the architecture’s data model:
     - Linked to `wedding_id` and `event_id`.
     - Fields for name, tradition, order, duration, and notes.

7. **UX alignment**

   - The step:
     - Uses wedX design system (colors, typography, spacing).
     - Feels like a full-screen, low-chrome wizard step.
     - Is understandable to both couples and parents.

---

## 7. Definition of Done (Story 2.4)

Story 2.4 is **Done** when:

1. Wizard Step 4 route exists and renders the Rituals Configuration UI.
2. Rituals are suggested per event based on wedding type and event type.
3. Custom rituals can be added, edited, and removed.
4. Required fields are validated and enforced before proceeding.
5. Ritual data is saved to backend and persists across sessions.
6. Navigation between Step 3, Step 4, and Step 5 works as expected.
7. Implementation follows architecture and UX conventions (Next.js App Router, Tailwind, shadcn/ui).
8. `docs/sprint-artifacts/sprint-status.yaml` is updated to move:
   - `2-4-implement-step-4-rituals-configuration` from `backlog` → `drafted` (once this story file exists) and later `done` when implemented.