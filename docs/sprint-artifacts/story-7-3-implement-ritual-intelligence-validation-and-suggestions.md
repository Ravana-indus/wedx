# Story 7.3 – Implement Ritual Intelligence Validation and Suggestions

## 1. Story Summary

**As a** couple (and our families)  
**I want** wedX to validate our rituals plan and suggest missing or conflicting rituals  
**So that** we can be confident that our ceremony respects our traditions and nothing important is forgotten.

Epic: **Epic 7 – AI Planner & Ritual Intelligence** ([`epics.md`](docs/epics.md:273–312))  
Depends on:  
- [`story-2-1-implement-step-1-wedding-type-selection.md`](docs/sprint-artifacts/story-2-1-implement-step-1-wedding-type-selection.md:1)  
- [`story-2-2-implement-step-2-multi-event-setup.md`](docs/sprint-artifacts/story-2-2-implement-step-2-multi-event-setup.md:1)  
- [`story-2-4-implement-step-4-rituals-configuration.md`](docs/sprint-artifacts/story-2-4-implement-step-4-rituals-configuration.md:1)  
- [`story-7-1-implement-ai-context-pipeline-and-core-planner-endpoints.md`](docs/sprint-artifacts/story-7-1-implement-ai-context-pipeline-and-core-planner-endpoints.md:1)  

---

## 2. Business & Product Rationale

From PRD ([`prd.md`](docs/prd.md:409–480)):

- Rituals are **deeply cultural and emotional**:
  - Buddhist Poruwa, Hindu ceremonies, Nikah, Christian sacraments, Civil ceremonies, Mixed traditions.
- Pain points:
  - Families worry about:
    - Missing important rituals.
    - Combining traditions respectfully in mixed weddings.
  - Couples often rely on:
    - Fragmented advice from relatives.
    - Incomplete online lists.

wedX should:

- Provide **Ritual Intelligence** that:
  - Validates the configured rituals against:
    - Wedding type.
    - Events.
  - Suggests:
    - Missing rituals.
    - Potential conflicts or redundancies.
  - Explains suggestions in **clear, respectful language**.

From UX ([`ux-design-specification.md`](docs/ux-design-specification.md:441–520)):

- Ritual UX principles:
  - “Respect culture first” – suggestions must be careful and optional.
  - “Explain, don’t dictate” – always explain why a ritual is suggested or flagged.
  - “Parents can understand it” – use familiar terms and avoid jargon.

From Epics ([`epics.md`](docs/epics.md:273–312)):

- Epic 7 includes:
  - Ritual validation and suggestions based on:
    - Wedding type.
    - Events.
    - Configured rituals.

This story (7.3) focuses on **Ritual Intelligence logic and UI**, building on the AI context and ritual endpoint skeleton from Story 7.1.

---

## 3. Scope

### In Scope

1. Implement **Ritual Intelligence logic** (rule-based and/or AI-assisted) that:

   - Validates configured rituals against:
     - Wedding type.
     - Event types.
   - Produces:
     - Missing ritual suggestions.
     - Conflict/duplication warnings.
     - Informational notes.

2. Wire this logic into the **AI rituals endpoint**:

   - `POST /api/weddings/:id/ai/rituals` (from Story 7.1).

3. Implement a **Ritual Intelligence UI**:

   - Entry point from:
     - Wizard Step 4 (Rituals Configuration).
     - A dedicated AI Rituals view (e.g., `/ai/rituals` or a section on `/ai`).

4. Ensure suggestions are **non-destructive and optional**:

   - Users can:
     - Accept suggestions.
     - Dismiss or ignore them.

### Out of Scope

- Full LLM-based ritual reasoning (beyond a first integration if you choose).
- Automatic modification of rituals without user confirmation.
- Multi-language ritual explanations.

This story is about **making ritual validation visible and helpful**, not about fully automating ritual planning.

---

## 4. Technical Requirements

### 4.1 Ritual Knowledge Base (Rule Layer)

Create a **ritual templates/knowledge base** that encodes expected rituals per tradition and event type, e.g.:

- [`lib/rituals/knowledge-base.ts`](lib/rituals/knowledge-base.ts:1)

Example structure:

```ts
export type WeddingTradition =
  | 'buddhist'
  | 'hindu'
  | 'christian'
  | 'muslim'
  | 'civil'
  | 'mixed'
  | 'other';

export interface RitualExpectation {
  key: string; // e.g. 'buddhist-poruwa-main-ceremony'
  name: string;
  tradition: WeddingTradition;
  recommendedEventTypes: string[]; // e.g. ['poruwa']
  required?: boolean; // culturally central
  description?: string;
  notesForMixed?: string; // guidance for mixed weddings
}

export const RITUAL_EXPECTATIONS: RitualExpectation[] = [
  // Examples (to be expanded):
  {
    key: 'buddhist-poruwa-main-ceremony',
    name: 'Poruwa main ceremony',
    tradition: 'buddhist',
    recommendedEventTypes: ['poruwa'],
    required: true,
    description: 'Core Poruwa ceremony with traditional vows and offerings.',
  },
  {
    key: 'muslim-nikah-main-ceremony',
    name: 'Nikah main ceremony',
    tradition: 'muslim',
    recommendedEventTypes: ['nikah'],
    required: true,
  },
  // ...
];
```

This knowledge base will be used by the Ritual Intelligence logic to:

- Determine which rituals are **expected** for a given wedding type and event configuration.
- Compare against actual configured rituals.

### 4.2 Ritual Intelligence Logic

Implement a service, e.g.:

- [`lib/ai/ritual-intelligence.ts`](lib/ai/ritual-intelligence.ts:1)

Inputs:

- `AiWeddingContextV1` (from Story 7.1).
- `AiRitualsRequest`:

  ```ts
  interface AiRitualsRequest {
    mode: 'validate' | 'suggest-missing' | 'explain';
  }
  ```

Outputs:

- `AiRitualsResponse` with `AiRitualInsight[]` (from Story 7.1):

  ```ts
  interface AiRitualInsight {
    id: string;
    type: 'missing_ritual' | 'conflict' | 'info';
    message: string;
    relatedEventId?: string;
    relatedRitualIds?: string[];
    severity?: 'info' | 'warning' | 'critical';
  }
  ```

Core logic (rule-based baseline):

1. **Determine primary traditions**

   - From `context.wedding.weddingType`, `weddingTypePrimary`, `weddingTypeSecondary`.
   - For `mixed`, include both primary and secondary traditions.

2. **Map events to normalized types**

   - Use `events[].type` (e.g., `poruwa`, `nikah`, `reception`, `homecoming`).
   - If not present, infer from event names using simple heuristics (optional).

3. **Compare expectations vs actual rituals**

   - For each `RitualExpectation` whose `tradition` matches the wedding’s traditions:

     - For each `recommendedEventTypes`:
       - Check if there is an event of that type.
       - If yes:
         - Check if `context.rituals` contains a ritual for that event whose name or key is similar (string match or mapping).
         - If not:
           - Emit `missing_ritual` insight:
             - `message`: “For a Buddhist Poruwa ceremony, it is common to include ‘Poruwa main ceremony’. Consider adding this ritual to your Poruwa event.”
             - `relatedEventId`: event id.
             - `severity`: `warning` or `info`.

4. **Detect simple conflicts/duplications**

   - Examples:

     - Same ritual name attached to multiple events where it should be unique.
     - Rituals from different traditions attached to the same event in a way that might be confusing (e.g., both full Poruwa and full Nikah in one event without clear separation).

   - Emit `conflict` insights with careful, non-judgmental language.

5. **Informational insights**

   - Provide `info` insights such as:

     - “You have configured a Poruwa ceremony without a reception. This is uncommon but valid; ensure your guests understand the flow.”
     - “You have configured both Poruwa and Nikah ceremonies; consider spacing them to allow guests to move comfortably.”

6. **Optional AI/LLM enhancement**

   - If you choose to integrate an LLM in this story:

     - Pass `AiWeddingContextV1` and a summary of rule-based findings to the LLM.
     - Ask it to:
       - Refine messages.
       - Add culturally sensitive explanations.
     - Ensure the final output still conforms to `AiRitualsResponse`.

### 4.3 Wire into AI Rituals Endpoint

Update the endpoint from Story 7.1:

- `POST /api/weddings/:id/ai/rituals`

Implementation:

1. Fetch `AiWeddingContextV1` via context builder.
2. Call ritual intelligence service:

   ```ts
   const response = await ritualIntelligence.analyze(context, request);
   ```

3. Return `AiRitualsResponse` to the client.

Ensure:

- Errors are handled gracefully.
- If context is incomplete (e.g., no rituals yet), return helpful `info` insights instead of failing.

### 4.4 Ritual Intelligence UI

Integrate Ritual Intelligence into the UI in two places:

#### 4.4.1 Wizard Step 4 – Rituals Configuration

From Story 2.4 ([`story-2-4-implement-step-4-rituals-configuration.md`](docs/sprint-artifacts/story-2-4-implement-step-4-rituals-configuration.md:1)):

- On `app/wizard/step-4/page.tsx`:

  - Add a **“Check my rituals with AI”** section or button:

    - Button label: “Check rituals with AI”.
    - On click:
      - Call `POST /api/weddings/:id/ai/rituals` with `mode = 'validate'`.
      - Show loading state.
      - Render insights in a panel.

  - Insights panel:

    - Group insights by type:

      - Missing rituals.
      - Conflicts.
      - Info.

    - For each insight:

      - Show:
        - Icon based on `severity` (info/warning/critical).
        - Message.
      - If `relatedEventId` present:
        - Show event name.
      - If `relatedRitualIds` present:
        - Highlight those rituals in the UI (optional).

    - Provide actions:

      - For `missing_ritual`:
        - “Add ritual” button:
          - Pre-fills a new ritual row with suggested name and tradition.
      - For `conflict`:
        - “Review rituals” button:
          - Scrolls to relevant event/rituals.

#### 4.4.2 Dedicated Ritual Intelligence View (Optional)

- Option A: Separate route:

  - `app/ai/rituals/page.tsx`

- Option B: Section on `/ai` (from Story 7.2):

  - Tab or section “Ritual Intelligence”.

UI:

- Similar to the wizard integration, but:

  - Shows a **global view** across all events.
  - Allows filtering insights by event or severity.

This is optional for this story but recommended for power users and debugging.

### 4.5 UX & Copy Guidelines

- Language:

  - Always frame insights as **suggestions**, not commands.
  - Use phrases like:
    - “It is common to…”
    - “You may want to consider…”
    - “Some families choose to…”

- Sensitivity:

  - Avoid implying that a plan is “wrong”.
  - For mixed weddings:
    - Emphasize flexibility and respect for both traditions.

- Visual design:

  - Use wedX design system (Tailwind + shadcn/ui).
  - Use icons and colors to differentiate:
    - Info vs warning vs critical.
  - Keep the panel scannable and not overwhelming.

---

## 5. Dependencies & Relationships

### 5.1 Upstream Dependencies

- **Story 2.1 – Wedding Type Selection**:
  - Provides wedding type and traditions.

- **Story 2.2 – Multi-Event Setup**:
  - Provides events and their types.

- **Story 2.4 – Rituals Configuration**:
  - Provides configured rituals per event.

- **Story 7.1 – AI Context Pipeline and Core Planner Endpoints**:
  - Provides:
    - `AiWeddingContextV1`.
    - `AiRitualsRequest` / `AiRitualsResponse`.
    - `/api/weddings/:id/ai/rituals` endpoint skeleton.

### 5.2 Downstream Dependencies

This story is a foundation for:

- Later Epic 7 stories:

  - Deeper AI reasoning about rituals (e.g., time sequencing, conflicts with vendor schedules).
  - Multi-language ritual explanations.
  - Integration of ritual insights into:
    - Checklists (auto-adding tasks).
    - Vendors (ensuring coverage for key rituals).

- Cross-epic features:

  - AI-driven checklist generation refinements based on ritual insights.
  - AI suggestions on Today dashboard for ritual-related tasks.

If this story is incomplete, wedX will lack a key differentiator in **culturally aware ritual guidance**, and AI will feel generic.

---

## 6. Acceptance Criteria

From [`epics.md`](docs/epics.md:273–312) plus technical elaboration:

1. **Ritual knowledge base**

   - A ritual expectations config exists (e.g., `RITUAL_EXPECTATIONS`) that:
     - Covers at least:
       - Buddhist Poruwa.
       - Muslim Nikah.
       - One Hindu ceremony.
       - One Christian ceremony.
     - Maps expectations to traditions and event types.

2. **Ritual Intelligence logic**

   - Given a wedding context with:
     - Wedding type.
     - Events.
     - Configured rituals.
   - The service can:
     - Identify at least some missing rituals for common configurations.
     - Identify simple conflicts/duplications.
     - Produce `AiRitualInsight[]` with appropriate `type`, `message`, and `severity`.

3. **AI rituals endpoint**

   - `POST /api/weddings/:id/ai/rituals`:
     - Accepts `mode`.
     - Returns `AiRitualsResponse` with insights.
     - Handles missing/partial data gracefully.

4. **Wizard Step 4 integration**

   - On `app/wizard/step-4/page.tsx`:
     - There is a “Check rituals with AI” action.
     - Clicking it:
       - Calls the rituals endpoint.
       - Displays insights in a panel.
     - For missing rituals:
       - There is a clear way to add or adjust rituals based on suggestions (even if it just scrolls to the relevant section).

5. **UX alignment**

   - Ritual insights:
     - Use respectful, non-judgmental language.
     - Are visually differentiated by severity.
   - The UI:
     - Uses wedX design system.
     - Is understandable to both couples and parents.

---

## 7. Definition of Done (Story 7.3)

Story 7.3 is **Done** when:

1. A ritual expectations knowledge base is implemented.
2. Ritual Intelligence logic can generate `AiRitualInsight[]` from `AiWeddingContextV1`.
3. `POST /api/weddings/:id/ai/rituals` is wired to this logic and returns structured insights.
4. Wizard Step 4 includes an AI-powered ritual check with a visible insights panel.
5. Implementation follows architecture and UX conventions (Next.js App Router, Tailwind, shadcn/ui).
6. `docs/sprint-artifacts/sprint-status.yaml` is updated to move:
   - `7-3-implement-ritual-intelligence-validation-and-suggestions` from `backlog` → `drafted` (once this story file exists) and later `done` when implemented.