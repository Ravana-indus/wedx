# Story 7.2 – Implement AI Planner UI and Today Dashboard Integration

## 1. Story Summary

**As a** couple using wedX  
**I want** an AI planner surface inside the app and on the Today dashboard  
**So that** I can ask questions like “What should we focus on this week?” and get context-aware, actionable suggestions.

Epic: **Epic 7 – AI Planner & Ritual Intelligence** ([`epics.md`](docs/epics.md:273–312))  
Depends on:  
- [`story-2-5-implement-today-dashboard-initial-experience.md`](docs/sprint-artifacts/story-2-5-implement-today-dashboard-initial-experience.md:1)  
- [`story-2-6-implement-today-dashboard-deep-dive-and-navigation.md`](docs/sprint-artifacts/story-2-6-implement-today-dashboard-deep-dive-and-navigation.md:1)  
- [`story-3-1-implement-core-checklist-engine-and-data-model.md`](docs/sprint-artifacts/story-3-1-implement-core-checklist-engine-and-data-model.md:1)  
- [`story-4-1-implement-vendor-directory-and-basic-linking.md`](docs/sprint-artifacts/story-4-1-implement-vendor-directory-and-basic-linking.md:1)  
- [`story-5-1-implement-guests-and-households-data-model-and-import.md`](docs/sprint-artifacts/story-5-1-implement-guests-and-households-data-model-and-import.md:1)  
- [`story-6-2-implement-budget-overview-and-per-event-breakdown-ui.md`](docs/sprint-artifacts/story-6-2-implement-budget-overview-and-per-event-breakdown-ui.md:1)  
- [`story-7-1-implement-ai-context-pipeline-and-core-planner-endpoints.md`](docs/sprint-artifacts/story-7-1-implement-ai-context-pipeline-and-core-planner-endpoints.md:1)  

---

## 2. Business & Product Rationale

From PRD ([`prd.md`](docs/prd.md:409–480)):

- Couples feel overwhelmed by:
  - Many moving parts (events, vendors, guests, budget, rituals).
  - Not knowing **what to do next**.
- AI should:
  - Turn the complex context into **simple, prioritized suggestions**.
  - Live where users already are:
    - Today dashboard.
    - Key planning pages.

From UX ([`ux-design-specification.md`](docs/ux-design-specification.md:441–520)):

- AI UX principles:
  - “One tap to clarity” – AI should be reachable from Today.
  - “Show your work” – suggestions should be traceable to data (checklists, vendors, etc.).
  - “Non-intrusive” – AI helps, but doesn’t nag.

From Epics ([`epics.md`](docs/epics.md:273–312)):

- After the AI context pipeline and planner endpoints (Story 7.1), Epic 7 requires:
  - An **AI Planner UI**:
    - A place to ask questions.
    - A way to view and act on suggestions.
  - Integration into the **Today dashboard**.

This story (7.2) focuses on the **frontend UI and wiring** to the planner endpoints, not advanced AI reasoning.

---

## 3. Scope

### In Scope

1. Implement an **AI Planner page**:

   - Route: `/ai` (or `/planner`).
   - UI to:
     - Ask a question.
     - Choose a focus area.
     - Display structured suggestions from the planner API.

2. Integrate **AI suggestions into the Today dashboard**:

   - A Today card that:
     - Shows top 2–3 suggestions.
     - Links to the full AI Planner page.

3. Provide **basic actions** on suggestions:

   - For example:
     - Navigate to related checklist, event, vendor, or budget views.

### Out of Scope

- Full conversational chat history.
- Advanced explanation UI (e.g., “why did you suggest this?”).
- Real-time streaming responses.

This story is about **making the AI planner visible and usable in the core UI**.

---

## 4. Technical Requirements

### 4.1 AI Planner Page

Route and layout:

- `app/ai/page.tsx` – AI Planner page.
- Uses main AppShell:
  - Sidebar with “AI Planner” or “AI” item.
  - Top bar with wedding name.

UI structure:

1. **Header**

   - Title: “AI Planner”.
   - Subtitle: short explanation, e.g.:
     - “Ask wedX what to focus on next. Suggestions are based on your events, rituals, checklists, vendors, guests, and budget.”

2. **Question Input**

   - Components (shadcn/ui):

     - `Textarea` or `Input` for the question.
     - `Select` or segmented control for `focus`:
       - Overall
       - Checklists
       - Vendors
       - Budget
       - Guests
       - Rituals

   - Default question (placeholder):

     - “What should we focus on this week?”

   - On submit:

     - Call `POST /api/weddings/:id/ai/planner` with:

       ```ts
       {
         question: string;
         focus?: 'checklists' | 'vendors' | 'budget' | 'guests' | 'rituals' | 'overall';
       }
       ```

     - Show loading state.

3. **Suggestions List**

   - Display `AiPlannerResponse.suggestions` from Story 7.1 ([`story-7-1-implement-ai-context-pipeline-and-core-planner-endpoints.md`](docs/sprint-artifacts/story-7-1-implement-ai-context-pipeline-and-core-planner-endpoints.md:80–176)).

   - Each suggestion card:

     - Title.
     - Description.
     - Category badge (checklist/vendor/budget/guest/ritual/other).
     - Priority indicator (low/medium/high).
     - Related links:
       - If `relatedIds.checklistItemIds` present:
         - Link: “Open checklist” → `/checklist` (optionally with filters).
       - If `relatedIds.eventIds` present:
         - Link: “View event” → `/events/[eventId]`.
       - If `relatedIds.vendorIds` present:
         - Link: “View vendors” → `/vendors` (with filter).
       - If `relatedIds.guestIds` present:
         - Link: “View guests” → `/guests` (with filter).

   - Empty state:

     - If `suggestions` is empty:
       - Show a friendly message:
         - “No suggestions yet. Try asking a more specific question, like ‘What are we missing for the Poruwa ceremony?’”

4. **Notes / Explanation**

   - If `AiPlannerResponse.notes` is present:
     - Show it in a small info box below the suggestions.

Implementation details:

- Add a frontend client module, e.g.:

  - [`lib/api/ai-planner.ts`](lib/api/ai-planner.ts:1)

  ```ts
  export async function callAiPlanner(
    weddingId: string,
    body: AiPlannerRequest
  ): Promise<AiPlannerResponse> {
    const res = await fetch(`/api/weddings/${weddingId}/ai/planner`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
    if (!res.ok) throw new Error('AI planner request failed');
    return res.json();
  }
  ```

### 4.2 Today Dashboard Integration

From Stories 2.5 and 2.6:

- Today dashboard route: `/today` (or `/dashboard/today`).
- Already has cards for:
  - Next actions.
  - Events overview.
  - Setup status.

Add an **AI Planner card**:

1. **Placement**

   - In the Today dashboard layout, add a card in the main grid, e.g.:

     - Title: “AI Planner”.
     - Subtitle: “Get suggestions based on your current plan.”

2. **Content**

   - Option A (simple):

     - Static text:
       - “Ask wedX what to focus on next.”
     - Button:
       - “Open AI Planner” → `/ai`.

   - Option B (if you want to call the planner):

     - On Today load:
       - Optionally call `POST /api/weddings/:id/ai/planner` with a default question:
         - “What should we focus on this week?”
       - Show top 1–2 suggestions (titles only).
       - Link: “See all suggestions” → `/ai`.

   - For this story, Option A is sufficient; Option B can be a stretch goal.

3. **Interaction**

   - Clicking the card or button navigates to `/ai`.

### 4.3 Navigation & Sidebar

Update AppShell navigation (from Story 1.2):

- Add an “AI” or “AI Planner” item in the sidebar:

  - Label: “AI Planner”.
  - Icon: something neutral (e.g., sparkles or lightbulb).
  - Route: `/ai`.

- Ensure active state is highlighted when on `/ai`.

### 4.4 Error Handling & Loading States

- On `/ai`:

  - While waiting for planner response:
    - Show a loading spinner or skeleton in the suggestions area.
  - On error:
    - Show a non-technical error message:
      - “We couldn’t get suggestions right now. Please try again in a moment.”

- On Today dashboard (if Option B is implemented):

  - If AI call fails:
    - Fallback to static card with “Open AI Planner” button.

---

## 5. Dependencies & Relationships

### 5.1 Upstream Dependencies

- **Story 7.1 – AI Context Pipeline and Core Planner Endpoints**:

  - Provides:
    - `AiWeddingContextV1`.
    - `POST /api/weddings/:id/ai/planner`.
    - `AiPlannerResponse` and `AiPlannerSuggestion` types.

- **Epic 2 – Today Dashboard**:

  - Stories 2.5 and 2.6 provide:
    - `/today` route.
    - Today dashboard layout.

- **Epic 1 – AppShell**:

  - Provides:
    - Sidebar navigation.
    - Layout for `/ai`.

- **Epics 2–6**:

  - Provide the underlying data that AI will eventually use:
    - Events, rituals, checklists, vendors, guests, budget.

### 5.2 Downstream Dependencies

This story is a foundation for:

- Later Epic 7 stories:

  - Richer AI UX:
    - Chat-like interface.
    - Explanations and “why” views.
  - AI-driven cards on:
    - Checklist page.
    - Vendors page.
    - Budget page.

- Cross-epic AI features:

  - “Smart next actions” on Today.
  - Ritual conflict warnings.
  - Budget optimization hints.

If this story is incomplete, AI will remain a backend-only capability with no visible surface for users.

---

## 6. Acceptance Criteria

From [`epics.md`](docs/epics.md:273–312) plus technical elaboration:

1. **AI Planner page exists**

   - When I navigate to `/ai` while authenticated:
     - I see:
       - A question input.
       - A focus selector.
       - A suggestions area.
   - When I submit a question:
     - A request is sent to `POST /api/weddings/:id/ai/planner`.
     - I see suggestions rendered as cards (even if empty in the stubbed implementation).
     - Errors are handled gracefully.

2. **Suggestions are actionable**

   - For suggestions that include `relatedIds`:
     - I see links/buttons that navigate to:
       - `/checklist` (for checklist-related).
       - `/events/[eventId]` (for event-related).
       - `/vendors` (for vendor-related).
       - `/guests` (for guest-related).

3. **Today dashboard integration**

   - On `/today`:
     - I see an AI Planner card.
     - The card includes at least:
       - A short description.
       - A button or link to open `/ai`.

4. **Navigation**

   - The sidebar includes an “AI Planner” (or “AI”) item.
   - Clicking it navigates to `/ai`.
   - The active state is correctly highlighted.

5. **UX alignment**

   - AI Planner UI:
     - Uses wedX design system (Tailwind + shadcn/ui).
     - Is simple and non-intimidating.
   - Copy and labels:
     - Emphasize help and guidance, not judgment.

---

## 7. Definition of Done (Story 7.2)

Story 7.2 is **Done** when:

1. `/ai` page is implemented with:
   - Question input.
   - Focus selector.
   - Suggestions list wired to the planner API.
2. Today dashboard includes an AI Planner card linking to `/ai`.
3. Sidebar navigation includes an AI Planner entry.
4. Suggestions (even if stubbed) are rendered in a structured, actionable way.
5. Error and loading states are handled gracefully.
6. Implementation follows architecture and UX conventions (Next.js App Router, Tailwind, shadcn/ui).
7. `docs/sprint-artifacts/sprint-status.yaml` is updated to move:
   - `7-2-implement-ai-planner-ui-and-today-dashboard-integration` from `backlog` → `drafted` (once this story file exists) and later `done` when implemented.