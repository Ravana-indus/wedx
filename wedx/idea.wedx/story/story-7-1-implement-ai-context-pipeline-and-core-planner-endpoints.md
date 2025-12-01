# Story 7.1 – Implement AI Context Pipeline and Core Planner Endpoints

## 1. Story Summary

**As a** couple using wedX  
**I want** the AI planner to understand my full wedding context (type, events, rituals, guests, vendors, budget, etc.)  
**So that** it can give relevant, culturally aware suggestions instead of generic advice.

Epic: **Epic 7 – AI Planner & Ritual Intelligence** ([`epics.md`](docs/epics.md:273–312))  

---

## 2. Business & Product Rationale

From PRD ([`prd.md`](docs/prd.md:409–480)):

- AI is a **key differentiator** for wedX:
  - It should feel like a knowledgeable planner who:
    - Understands Sri Lankan and regional wedding traditions.
    - Knows the couple’s specific configuration.
    - Can reason across checklists, vendors, guests, budget, and rituals.
- Without the right context:
  - AI becomes generic and untrustworthy.
  - Couples will ignore its suggestions.

From UX ([`ux-design-specification.md`](docs/ux-design-specification.md:441–520)):

- AI UX principles:
  - “Context first, magic second” – AI must clearly show what it knows.
  - “Explain your reasoning” – suggestions should be traceable to data.
  - “Respect culture” – rituals and family dynamics must be handled carefully.

From Epics ([`epics.md`](docs/epics.md:273–312)):

- Epic 7 introduces:
  - An **AI context pipeline** that aggregates data from all core modules.
  - Core AI planner endpoints that:
    - Accept a structured context payload.
    - Return suggestions and insights.

This story (7.1) focuses on the **backend context pipeline and API surface**, not the full AI UX or prompt design.

---

## 3. Scope

### In Scope

1. Define and implement a **unified AI context model**:

   - Aggregates data from:
     - Wedding core (type, date, vibe).
     - Events and rituals.
     - Checklists and jewelry.
     - Vendors and communications.
     - Guests and RSVP.
     - Budget.

2. Implement **backend endpoints** for:

   - Building and returning the AI context for a wedding.
   - Providing core planner entry points that:
     - Accept a question or task.
     - Return a structured response (without yet wiring to a real LLM, if needed).

3. Ensure the context model is **extensible and versioned**:

   - So future AI features can evolve without breaking existing clients.

### Out of Scope

- Actual LLM integration and prompt engineering (can be stubbed or abstracted).
- Full AI UX (chat UI, explanation UI).
- Real-time streaming responses.

This story is about **getting the data into the right shape and exposing it via stable APIs**.

---

## 4. Technical Requirements

### 4.1 Unified AI Context Model

Define a TypeScript interface (or equivalent) for the AI context, e.g. in:

- [`lib/ai/context.ts`](lib/ai/context.ts:1)

```ts
export interface AiWeddingContextV1 {
  version: 'v1';
  wedding: {
    id: string;
    name?: string;
    date?: string; // ISO
    weddingType?: string; // e.g. 'buddhist', 'hindu', 'christian', 'mixed'
    weddingTypePrimary?: string | null;
    weddingTypeSecondary?: string | null;
    locationCountry?: string;
    vibePrimary?: string | null;
    vibeSecondary?: string | null;
    colorPaletteKey?: string | null;
    moodTags?: string[];
  };
  events: {
    id: string;
    name: string;
    type?: string; // normalized type key, e.g. 'poruwa', 'reception'
    date?: string;
    timeStart?: string;
    timeEnd?: string;
    location?: string;
    guestEstimate?: number | null;
  }[];
  rituals: {
    id: string;
    eventId: string;
    name: string;
    tradition?: string;
    orderIndex?: number;
    durationMinutes?: number | null;
  }[];
  checklists: {
    items: {
      id: string;
      title: string;
      description?: string;
      type: 'task' | 'item';
      category: string;
      timeBucket?: string;
      eventId?: string;
      ritualId?: string;
      isJewelry: boolean;
      jewelryType?: string;
      jewelryOwner?: string;
      status: 'todo' | 'in_progress' | 'done';
      assigneeRole?: string | null;
    }[];
  };
  vendors: {
    vendors: {
      id: string;
      name: string;
      category: string;
      status?: 'discovered' | 'shortlisted' | 'contacted' | 'quoted' | 'booked' | 'backup' | 'dropped';
      linkedEventIds: string[];
      hasWhatsApp: boolean;
      lastContactedAt?: string | null;
    }[];
  };
  guests: {
    households: {
      id: string;
      name: string;
      city?: string;
      side?: 'bride' | 'groom' | 'both' | 'other';
    }[];
    guests: {
      id: string;
      householdId?: string;
      displayName: string;
      role?: string;
      side?: 'bride' | 'groom' | 'both' | 'other';
      isChild?: boolean;
    }[];
    invitations: {
      id: string;
      eventId: string;
      householdId?: string;
      guestId?: string;
      inviteLevel: 'household' | 'guest';
      status: 'not_invited' | 'invited' | 'declined' | 'accepted' | 'maybe';
      invitedCount?: number | null;
      attendingCount?: number | null;
    }[];
  };
  seating: {
    tables: {
      id: string;
      eventId: string;
      name: string;
      capacity?: number | null;
      section?: string | null;
    }[];
    assignments: {
      id: string;
      eventId: string;
      tableId: string;
      guestId: string;
    }[];
  };
  budget: {
    currency: string;
    lineItems: {
      id: string;
      name: string;
      categoryKey: string;
      eventId?: string;
      vendorId?: string;
      plannedAmount: number;
      actualAmount?: number | null;
    }[];
  };
}
```

Key points:

- **Versioned** (`version: 'v1'`) to allow future changes.
- **Normalized IDs**:
  - Use the same IDs as in core tables.
- **Lightweight**:
  - Include only fields that are useful for AI reasoning.
  - Avoid raw internal fields that add noise.

### 4.2 Context Builder Service

Implement a service that builds `AiWeddingContextV1` from the database, e.g.:

- [`lib/ai/context-builder.ts`](lib/ai/context-builder.ts:1)

Responsibilities:

1. **Fetch core data** for a given `weddingId`:

   - Wedding core:
     - From `weddings` and `wedding_settings` (type, date, vibe, palette, mood tags).
   - Events:
     - From `events` (Story 2.2).
   - Rituals:
     - From `rituals` (Story 2.4).
   - Checklists:
     - From `checklists` and `checklist_items` (Story 3.1–3.4).
   - Vendors:
     - From `vendors`, `vendor_events`, `vendor_communications` (Stories 4.1–4.3).
   - Guests & invitations:
     - From `households`, `guests`, `guest_event_invitations` (Stories 5.1–5.2).
   - Seating:
     - From `seating_tables`, `seating_assignments` (Story 5.3).
   - Budget:
     - From `budget_categories`, `budget_line_items` (Stories 6.1–6.2).

2. **Normalize and map** to `AiWeddingContextV1`:

   - Map internal enums/keys to stable strings.
   - Ensure optional fields are `null` or omitted where appropriate.
   - Handle missing data gracefully (e.g., no budget yet).

3. **Performance considerations**:

   - Use batched queries to avoid N+1 issues.
   - Optionally cache the context per `weddingId` for a short TTL (e.g., 1–5 minutes) if needed later.

### 4.3 AI Context API

Expose an API endpoint to retrieve the AI context:

- `GET /api/weddings/:id/ai/context`

Behavior:

- Authenticated request with access to `weddingId`.
- Calls the context builder.
- Returns:

  ```ts
  interface GetAiContextResponse {
    context: AiWeddingContextV1;
  }
  ```

Usage:

- Internal tools.
- AI planner endpoints (below).
- Debugging and validation.

### 4.4 Core AI Planner Endpoints (Stubbed)

Define core planner endpoints that **consume** the context and **return structured suggestions**, even if the actual AI call is stubbed initially.

1. **General Planner Endpoint**

   - `POST /api/weddings/:id/ai/planner`

   - Request:

     ```ts
     interface AiPlannerRequest {
       question: string; // e.g. "What should we focus on this week?"
       focus?: 'checklists' | 'vendors' | 'budget' | 'guests' | 'rituals' | 'overall';
     }
     ```

   - Behavior:

     - Fetch `AiWeddingContextV1` for the wedding.
     - (For now) call a stubbed planner service that:
       - Returns a static or rule-based response using context.
       - Later, this will call an LLM with a prompt.

   - Response (shape to be stable and LLM-friendly):

     ```ts
     interface AiPlannerSuggestion {
       id: string;
       title: string;
       description: string;
       category: 'checklist' | 'vendor' | 'budget' | 'guest' | 'ritual' | 'other';
       relatedIds?: {
         checklistItemIds?: string[];
         eventIds?: string[];
         vendorIds?: string[];
         guestIds?: string[];
       };
       priority: 'low' | 'medium' | 'high';
     }

     interface AiPlannerResponse {
       contextVersion: 'v1';
       suggestions: AiPlannerSuggestion[];
       notes?: string; // optional explanation
     }
     ```

2. **Ritual Intelligence Endpoint (Skeleton)**

   - `POST /api/weddings/:id/ai/rituals`

   - Request:

     ```ts
     interface AiRitualsRequest {
       mode: 'validate' | 'suggest-missing' | 'explain';
     }
     ```

   - Behavior:

     - Fetch `AiWeddingContextV1`.
     - Focus on `weddingType`, `events`, and `rituals`.

   - Response (skeleton):

     ```ts
     interface AiRitualInsight {
       id: string;
       type: 'missing_ritual' | 'conflict' | 'info';
       message: string;
       relatedEventId?: string;
       relatedRitualIds?: string[];
       severity?: 'info' | 'warning' | 'critical';
     }

     interface AiRitualsResponse {
       contextVersion: 'v1';
       insights: AiRitualInsight[];
     }
     ```

3. **Implementation Detail**

   - For this story, the “AI” can be:

     - A stub that:
       - Returns empty arrays.
       - Or simple rule-based suggestions (e.g., if no photographer vendor is booked, suggest adding one).
     - The actual LLM integration will be a later story.

### 4.5 Internal Service Abstraction for AI Calls

Prepare an abstraction layer for AI calls, even if not fully implemented:

- [`lib/ai/client.ts`](lib/ai/client.ts:1)

```ts
export interface AiClient {
  planWithContext(
    context: AiWeddingContextV1,
    request: AiPlannerRequest
  ): Promise<AiPlannerResponse>;

  analyzeRituals(
    context: AiWeddingContextV1,
    request: AiRitualsRequest
  ): Promise<AiRitualsResponse>;
}

// For this story, implement a stub:
export const aiClient: AiClient = {
  async planWithContext(context, request) {
    // TODO: replace with real LLM integration in a later story
    return {
      contextVersion: context.version,
      suggestions: [],
      notes: 'AI planner stub: no suggestions yet.',
    };
  },
  async analyzeRituals(context, request) {
    return {
      contextVersion: context.version,
      insights: [],
    };
  },
};
```

This ensures:

- Future LLM integration is localized.
- API contracts remain stable.

---

## 5. Dependencies & Relationships

### 5.1 Upstream Dependencies

This story depends on data models and APIs from previous epics:

- **Epic 1 – Foundation & AppShell**:
  - Auth and `weddingId` context.

- **Epic 2 – Wizard & Events**:
  - Wedding type, events, rituals.

- **Epic 3 – Checklists & Jewelry**:
  - Checklist items, jewelry flags, assignments.

- **Epic 4 – Vendors & WhatsApp Bridge**:
  - Vendors, vendor–event links, communication logs.

- **Epic 5 – Guests, Invitations & RSVP**:
  - Households, guests, invitations, seating.

- **Epic 6 – Budget & Payments Overview**:
  - Budget categories and line items.

The context builder must be robust to **partial implementations** (e.g., if some modules are not fully implemented yet).

### 5.2 Downstream Dependencies

This story is a foundation for:

- Later Epic 7 stories:

  - Actual LLM integration and prompt design.
  - AI-driven suggestions in:
    - Today dashboard.
    - Checklists.
    - Vendors.
    - Budget.

- Cross-epic AI features:

  - “What should we do this week?” suggestions.
  - Ritual conflict detection and explanations.
  - Budget and vendor optimization hints.

If this story is incomplete, AI features will lack a reliable, structured context and will be difficult to implement consistently.

---

## 6. Acceptance Criteria

From [`epics.md`](docs/epics.md:273–312) plus technical elaboration:

1. **Unified context model**

   - `AiWeddingContextV1` is defined in code and:
     - Includes wedding, events, rituals, checklists, vendors, guests, seating, and budget.
     - Is versioned (`version: 'v1'`).

2. **Context builder works**

   - Given a `weddingId` with data in core modules:
     - The context builder returns a populated `AiWeddingContextV1`.
   - It handles missing/partial data gracefully (e.g., no budget yet).

3. **Context API**

   - `GET /api/weddings/:id/ai/context`:
     - Returns the unified context for the authenticated wedding.
     - Is usable for debugging and internal tools.

4. **Planner endpoints exist (stubbed)**

   - `POST /api/weddings/:id/ai/planner`:
     - Accepts a `question` and optional `focus`.
     - Returns a structured `AiPlannerResponse` (even if suggestions are empty).
   - `POST /api/weddings/:id/ai/rituals`:
     - Accepts a `mode`.
     - Returns a structured `AiRitualsResponse` (even if insights are empty).

5. **AI client abstraction**

   - An `AiClient` interface and stub implementation exist.
   - Planner endpoints use this abstraction, not direct LLM calls.

6. **Technical quality**

   - Code follows architecture conventions:
     - `lib/` for domain logic (`context.ts`, `context-builder.ts`, `client.ts`).
     - `app/api/` for route handlers (if using Next.js API routes).
   - Types are shared between backend and frontend where appropriate.

---

## 7. Definition of Done (Story 7.1)

Story 7.1 is **Done** when:

1. `AiWeddingContextV1` is implemented and documented in code.
2. The context builder can assemble this context from existing domain entities.
3. `GET /api/weddings/:id/ai/context` returns the unified context.
4. Core AI planner endpoints (`/ai/planner`, `/ai/rituals`) exist and return structured, stubbed responses.
5. An AI client abstraction is in place for future LLM integration.
6. Implementation follows architecture and UX conventions where applicable.
7. `docs/sprint-artifacts/sprint-status.yaml` is updated to move:
   - `7-1-implement-ai-context-pipeline-and-core-planner-endpoints` from `backlog` → `drafted` (once this story file exists) and later `done` when implemented.