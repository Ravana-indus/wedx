# Story 2.3 – Implement Step 3 – Vibe & Theme Selection

## 1. Story Summary

**As a** couple  
**I want** to define the overall vibe and visual theme for my wedding  
**So that** wedX can tailor checklists, inspiration, and AI suggestions to match our style.

Epic: **Epic 2 – Wedding Wizard & Control Room** ([`epics.md`](docs/epics.md:131–145))  

---

## 2. Business & Product Rationale

From PRD ([`prd.md`](docs/prd.md:64–82)):

- The product must support:
  - Different **vibes** (e.g., classic, modern, minimal, luxury, boho, rustic).
  - Different **color palettes** and **mood directions**.
- This information is used to:
  - Personalize checklists and recommendations.
  - Filter inspiration content.
  - Guide AI suggestions for rituals, decor, and vendors.

From UX ([`ux-design-specification.md`](docs/ux-design-specification.md:39–60,119–142)):

- Wizard is **wizard-first, then dashboard**:
  - Step 3 should feel like a **fun, visual step** where couples choose cards that represent their style.
  - It should be approachable for both couples and parents, with clear language and examples.

From Epics ([`epics.md`](docs/epics.md:131–145)):

- Story 2.3 is the **Vibe & Theme Selection** step:
  - Couples choose:
    - Overall vibe (1–2 primary vibes).
    - Color palette (predefined or custom).
    - Optional mood tags (e.g., “intimate”, “grand”, “destination”).

This story turns the abstract idea of “our dream wedding” into structured **style metadata** that downstream modules (checklists, vendors, AI) can use.

---

## 3. Scope

### In Scope

1. Implement **Wizard Step 3 – Vibe & Theme Selection** UI and flow:

   - Full-screen wizard step with:
     - Title and short description.
     - Vibe selection (card-based).
     - Color palette selection (swatches).
     - Optional mood tags (chips/toggles).
     - Optional free-text notes.

2. Persist vibe & theme choices in the backend:

   - Store structured fields on the wedding or a related settings entity, such as:
     - `vibe_primary`
     - `vibe_secondary` (optional)
     - `color_palette_key`
     - `color_palette_custom` (optional JSON or hex list)
     - `mood_tags` (array)
     - `style_notes` (text)

3. Ensure the configuration is **reversible and persistent**:

   - If the user navigates away and returns to Step 3:
     - Their previously selected vibes, colors, and tags are loaded and shown.

4. Wire this step into the **wizard flow**:

   - Route: e.g., `/wizard/step-3`.
   - Integrate with wizard layout and navigation:
     - “Back” to Step 2 (Multi-Event Setup).
     - “Next” to Step 4 (Rituals Configuration or Today Dashboard intro, depending on epic breakdown).

### Out of Scope

- Detailed per-event decor or theme configuration.
- AI generation of themes or palettes (Epic 7).
- Vendor matching based on vibe (Epic 4).
- Budget implications of theme choices (Epic 6).

---

## 4. Technical Requirements

### 4.1 Routing & Layout

From architecture ([`architecture.md`](docs/architecture.md:65–79)) and UX ([`ux-design-specification.md`](docs/ux-design-specification.md:79–88,119–142)):

- Add Step 3 under the existing wizard route segment:

  - `app/wizard/step-3/page.tsx` – Vibe & Theme Selection step.

- Use the same wizard layout as Steps 1 and 2:

  - `app/wizard/layout.tsx`:
    - Step title and description area.
    - Main content area for vibe/theme UI.
    - Footer with navigation controls (Back, Next, maybe “Save & exit”).

- Navigation:

  - “Back” → `/wizard/step-2`.
  - “Next” → `/wizard/step-4` (Rituals or next step placeholder, per epics).

### 4.2 Vibe & Theme Options

Define a **fixed set of vibes** and **color palettes** aligned with PRD and UX:

- Example vibes (configurable list):

  - Classic / Traditional
  - Modern / Minimal
  - Luxury / Glam
  - Rustic / Boho
  - Beach / Destination
  - Intimate / Home

- Example color palettes:

  - Blush & Gold
  - Emerald & Ivory
  - Navy & Silver
  - Terracotta & Cream
  - Custom (user-defined)

- Mood tags (chips):

  - “Intimate”
  - “Grand”
  - “Family-focused”
  - “Party-heavy”
  - “Spiritual”
  - “Destination”

Implementation detail:

- Store these options in a config file, e.g.:
  - [`lib/config/vibe-options.ts`](lib/config/vibe-options.ts:1)
  - [`lib/config/color-palettes.ts`](lib/config/color-palettes.ts:1)

### 4.3 UI Behavior

- Vibe selection:

  - Card-based UI using shadcn components:
    - `Card`, `CardHeader`, `CardTitle`, `CardDescription`.
  - Allow:
    - Exactly one **primary vibe** (required).
    - Optionally one **secondary vibe** (optional).
  - Visual feedback:
    - Selected cards highlighted with border and background.

- Color palette selection:

  - Swatch-based UI:
    - Each palette card shows 3–5 color blocks.
  - Allow:
    - Exactly one palette selection.
    - “Custom” option:
      - If selected, show inputs for custom colors (e.g., 3 hex inputs).

- Mood tags:

  - Chip/toggle UI:
    - Use `Badge` or `Toggle`-style components.
  - Allow multiple selections.

- Notes:

  - Optional `Textarea` for free-text notes like:
    - “We want a very simple, intimate home ceremony with pastel colors.”

- Validation:

  - At minimum:
    - Primary vibe is required.
    - Color palette is required (including “Custom” as a valid choice).
  - “Next” disabled until required fields are set.

- UX details:

  - Use wedX design system (Tailwind + shadcn).
  - Keep the step visually rich but not overwhelming.

### 4.4 Data Model & Persistence

From architecture ([`architecture.md`](docs/architecture.md:199–217)):

- Extend `weddings` or `wedding_settings` with style fields:

  - `vibe_primary` (string, enum-like)
  - `vibe_secondary` (string, nullable)
  - `color_palette_key` (string)
  - `color_palette_custom` (JSON or text, optional)
  - `mood_tags` (string array)
  - `style_notes` (text)

- API:

  - Implement or use an endpoint like:
    - `PATCH /api/weddings/:id/settings` or
    - `PATCH /api/weddings/:id`

  - Request payload example:

    ```ts
    interface WeddingStylePayload {
      vibe_primary: string;
      vibe_secondary?: string | null;
      color_palette_key: string;
      color_palette_custom?: string[]; // hex codes
      mood_tags: string[];
      style_notes?: string;
    }
    ```

- Frontend:

  - Add a typed client in:
    - [`lib/api/wedding-style.ts`](lib/api/wedding-style.ts:1)

  - On load:
    - Fetch existing style settings for the current wedding.
    - Pre-populate UI with saved values.

  - On “Next”:
    - Validate required fields.
    - Save style settings via API.
    - Navigate to Step 4.

### 4.5 State Management & Navigation

- State:

  - Local state for:
    - `vibePrimary`
    - `vibeSecondary`
    - `colorPaletteKey`
    - `colorPaletteCustom` (array of hex strings)
    - `moodTags` (set/array)
    - `styleNotes`

- Navigation:

  - “Next”:
    - Validates required fields.
    - Saves to backend.
    - Navigates to `/wizard/step-4`.
  - “Back”:
    - Navigates to `/wizard/step-2` without losing unsaved changes if possible (or warn if unsaved).

---

## 5. Dependencies & Relationships

### 5.1 Upstream Dependencies

- **Story 2.1 – Wedding Type Selection**:
  - Wedding type may influence default vibe suggestions (e.g., traditional vs modern).
- **Story 2.2 – Multi-Event Setup**:
  - Not strictly required for this step, but wizard flow expects Step 2 before Step 3.
- **Epic 1 stories**:
  - Foundation, AppShell, and Auth shell must be in place so wizard is behind auth and uses the shared layout.

- Data model and API basics:
  - `weddings` and `wedding_settings` tables and endpoints exist or are stubbed.

### 5.2 Downstream Dependencies

This story is a prerequisite for:

- **Epic 3 – Checklists & Jewelry Module**:
  - Uses vibe/theme to prioritize and filter tasks.
- **Epic 4 – Vendors & WhatsApp Bridge**:
  - Uses vibe/theme to suggest vendors and communication templates.
- **Epic 6 – Budget & Payments Overview**:
  - Uses vibe/theme to estimate budget ranges (e.g., luxury vs minimal).
- **Epic 7 – AI Planner & Ritual Intelligence**:
  - Uses vibe/theme as key input for AI suggestions and conflict detection.

If this story is incomplete or inconsistent, downstream personalization and AI features will be generic or misaligned with the couple’s expectations.

---

## 6. Acceptance Criteria

From [`epics.md`](docs/epics.md:131–145) plus technical elaboration:

1. **Vibe selection**

   - When I open the wizard Step 3 route (e.g., `/wizard/step-3`),
     - Then I see a set of vibe cards (e.g., Classic, Modern, Luxury, Rustic, etc.).
     - I can select exactly one primary vibe (required).
     - I can optionally select a secondary vibe.

2. **Color palette selection**

   - When I view the color palette section,
     - Then I see multiple predefined palettes as swatches.
     - I can select exactly one palette.
     - If I choose “Custom”, I can define my own colors (e.g., via hex inputs).

3. **Mood tags and notes**

   - I can toggle multiple mood tags on/off.
   - I can optionally enter free-text notes about our style.

4. **Validation and UX**

   - “Next” is disabled until:
     - A primary vibe is selected.
     - A color palette is selected (including “Custom”).
   - The UI uses wedX design system components and feels visually consistent with other steps.

5. **Persistence**

   - When I configure vibe & theme and click “Next”,
     - Then my selections are saved to the backend.
   - When I leave the wizard and return to Step 3,
     - Then my previously selected vibes, colors, tags, and notes are loaded and shown.

6. **Navigation**

   - “Back” takes me to Step 2 (Multi-Event Setup) without breaking the wizard.
   - “Next” takes me to Step 4 (Rituals or next step placeholder).

7. **Data model alignment**

   - Style fields are stored in a way that matches the architecture’s data model and can be consumed by downstream modules.

---

## 7. Definition of Done (Story 2.3)

Story 2.3 is **Done** when:

1. Wizard Step 3 route exists and renders the Vibe & Theme Selection UI.
2. Vibe, color palette, mood tags, and notes can be selected and edited.
3. Required fields are validated and enforced before proceeding.
4. Style data is saved to backend and persists across sessions.
5. Navigation between Step 2, Step 3, and Step 4 works as expected.
6. Implementation follows architecture and UX conventions (Next.js App Router, Tailwind, shadcn/ui).
7. `docs/sprint-artifacts/sprint-status.yaml` is updated to move:
   - `2-3-implement-step-3-vibe-and-theme-selection` from `backlog` → `drafted` (once this story file exists) and later `done` when implemented.