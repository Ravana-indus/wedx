# Story 3.4 – Implement Checklist Collaboration and Assignments (Basics)
Status: review

## 1. Story Summary

**As a** couple and our families  
**I want** to assign checklist items to specific people and see who is responsible for what  
**So that** we can collaborate on planning without confusion or duplicated effort.

Epic: **Epic 3 – Checklists & Jewelry Module** ([`epics.md`](docs/epics.md:146–176))  
Depends on:  
- [`story-3-1-implement-core-checklist-engine-and-data-model.md`](docs/sprint-artifacts/story-3-1-implement-core-checklist-engine-and-data-model.md:1)  
- [`story-3-2-implement-checklist-ui-and-filtering.md`](docs/sprint-artifacts/story-3-2-implement-checklist-ui-and-filtering.md:1)  
- [`story-3-3-implement-jewelry-checklists-and-tracking.md`](docs/sprint-artifacts/story-3-3-implement-jewelry-checklists-and-tracking.md:1)  

---

## 2. Business & Product Rationale

From PRD ([`prd.md`](docs/prd.md:177–236)):

- Wedding planning is **inherently collaborative**:
  - Couples, parents, siblings, and sometimes friends all contribute.
  - Confusion about “who is doing what” leads to:
    - Missed tasks.
    - Duplicated work.
    - Stress and conflict.

From UX ([`ux-design-specification.md`](docs/ux-design-specification.md:221–280)):

- Collaboration principles:
  - “Make it obvious who owns each task.”
  - “Make it easy to reassign without drama.”
  - “Parents should feel included, not sidelined.”

From Epics ([`epics.md`](docs/epics.md:146–176)):

- Epic 3 includes:
  - Basic **assignment** of checklist items to people.
  - Later epics (e.g., Epic 4, Epic 7) will build on this for:
    - Vendor coordination.
    - Notifications and AI suggestions.

This story (3.4) focuses on **basic assignments and collaboration metadata** for checklist items, without implementing full notifications or advanced collaboration features.

---

## 3. Scope

### In Scope

1. Extend the **checklist data model** to support assignments:

   - Add fields to `ChecklistItem` for:
     - `assigneeId` (link to a user/participant).
     - `assigneeRole` (e.g., “Bride”, “Groom”, “Bride’s parent”, “Groom’s parent”, “Friend”).

2. Implement **basic participant model** (if not already present):

   - A minimal representation of people involved in planning:
     - `wedding_participants` or similar.

3. Update **APIs** to support reading and updating assignments.

4. Enhance the **Checklist UI** to:

   - Display who is assigned to each item.
   - Allow changing the assignee via a simple dropdown.

5. Provide **basic filters** for assignments:

   - Filter checklist by assignee (e.g., “Show my tasks”).

### Out of Scope

- Inviting new users via email/WhatsApp.
- Real-time collaboration indicators.
- Notifications and reminders.
- Complex permission models.

This story is about **making ownership visible and editable** at the checklist level.

---

## 4. Technical Requirements

### 4.1 Data Model – Participants

Introduce a minimal participant model if not already defined in architecture ([`architecture.md`](docs/architecture.md:199–260)):

- **WeddingParticipant**

  ```ts
  interface WeddingParticipant {
    id: string;
    weddingId: string;
    name: string;
    role: 'bride' | 'groom' | 'bride-parent' | 'groom-parent' | 'sibling' | 'friend' | 'other';
    contactEmail?: string;
    contactPhone?: string;
    isPrimary?: boolean; // e.g., main account holder(s)
  }
  ```

- Storage:

  - `wedding_participants` table/collection.

- Seed:

  - At minimum, create participants for:
    - Primary couple (bride/groom or partner A/B).
    - Optionally parents if captured in onboarding (can be added later).

### 4.2 Data Model – ChecklistItem Extensions

Extend `ChecklistItem` (from Story 3.1 and 3.3) with assignment fields:

```ts
interface ChecklistItem {
  id: string;
  checklistId: string;
  templateId?: string;
  title: string;
  description?: string;
  type: 'task' | 'item';
  category: string;
  timeBucket: string;
  eventId?: string;
  ritualId?: string;
  isJewelry: boolean;
  jewelryType?: string;
  jewelryOwner?: string;
  assigneeId?: string;   // FK to WeddingParticipant
  assigneeRole?: string; // cached role label for quick display
  status: 'todo' | 'in_progress' | 'done';
  dueDate?: Date;
  notes?: string;
  orderIndex: number;
}
```

- Migration:

  - Add `assigneeId` and `assigneeRole` fields to persistence.

- Generation:

  - For initial generation (Story 3.1), you can:
    - Leave `assigneeId` null.
    - Optionally set `assigneeRole` based on template hints (e.g., “bride-family” → “Bride’s family”).

### 4.3 APIs

Update or add endpoints:

1. **Get Participants**

   - `GET /api/weddings/:id/participants`

   - Returns:

     ```ts
     interface GetParticipantsResponse {
       participants: WeddingParticipant[];
     }
     ```

2. **Update Checklist Item Assignment**

   - Extend existing endpoint:

     - `PATCH /api/checklist-items/:id`

   - Allow updating:

     - `assigneeId`
     - `assigneeRole`

3. **Checklist Retrieval**

   - `GET /api/weddings/:id/checklists`

   - Ensure response includes:

     - `assigneeId`
     - `assigneeRole`

No separate assignment-specific endpoint is required for this story.

### 4.4 Checklist UI – Assignment Display & Editing

From Story 3.2 ([`story-3-2-implement-checklist-ui-and-filtering.md`](docs/sprint-artifacts/story-3-2-implement-checklist-ui-and-filtering.md:120–214)):

1. **Display Assignee in Item Row**

   - For each checklist item row:

     - Show a small label or avatar-like chip with:
       - Participant name (or role) if `assigneeId` is set.
       - “Unassigned” if no assignee.

   - Use shadcn components:
     - `Badge`, `Avatar`, or `DropdownMenu`.

2. **Edit Assignee**

   - Interaction:

     - Clicking the assignee label opens a dropdown:
       - List of participants from `GET /api/weddings/:id/participants`.
       - Option “Unassigned”.

   - On selection:

     - Call `PATCH /api/checklist-items/:id` with:
       - `assigneeId`
       - `assigneeRole` (derived from participant role).

   - Optimistic UI update:
     - Show new assignee immediately.

3. **Assignment in Item Details Panel**

   - In the item details view (accordion or side panel):

     - Show a more detailed assignment section:
       - Current assignee.
       - Role.
       - Optional note like “Assigned by [user] on [date]” (can be omitted for now).

### 4.5 Filters – “My Tasks” and By Assignee

Extend filters from Story 3.2:

- Add **Assignee filter**:

  - Dropdown or chips:

    - “All assignees”
    - “Unassigned”
    - Each participant (by name/role).
    - “Me” (if current user is mapped to a participant).

- Behavior:

  - When a specific assignee is selected:
    - Show only items where `assigneeId` matches.
  - When “Unassigned” is selected:
    - Show only items with `assigneeId` null.

- URL support:

  - `/checklist?assigneeId=...` or `/checklist?assignee=me`

  - Initialize filters from URL search params.

---

## 5. Dependencies & Relationships

### 5.1 Upstream Dependencies

- **Story 3.1 – Core Checklist Engine and Data Model**:

  - Provides:
    - Checklist and checklist item entities.
    - Generation and retrieval APIs.

- **Story 3.2 – Checklist UI and Filtering**:

  - Provides:
    - `/checklist` page.
    - Base filters and item interactions.

- **Story 3.3 – Jewelry Checklists and Tracking** (optional but recommended):

  - Provides:
    - Jewelry-specific items that may be assigned to specific family members.

- **User/Participant model**:

  - Basic user authentication and wedding context from Epic 1.

### 5.2 Downstream Dependencies

This story is a foundation for:

- Future collaboration features:

  - Notifications and reminders for assigned tasks.
  - Activity feeds (“who completed what”).
  - Role-based views (e.g., “Parent view”).

- **Epic 4 – Vendors & WhatsApp Bridge**:

  - Vendor-related tasks may be assigned to specific people.

- **Epic 7 – AI Planner & Ritual Intelligence**:

  - AI can:
    - Suggest reassignments.
    - Highlight overloaded participants.

If this story is incomplete, checklist collaboration remains ad-hoc, and later collaboration features will lack a consistent assignment model.

---

## 6. Acceptance Criteria

From [`epics.md`](docs/epics.md:146–176) plus technical elaboration:

1. **Participant model**

   - `wedding_participants` (or equivalent) exists with:
     - At least participants for the primary couple.
   - `GET /api/weddings/:id/participants` returns participants for the wedding.

2. **Checklist item assignment fields**

   - `ChecklistItem` records include:
     - `assigneeId`
     - `assigneeRole`
   - These fields are persisted in the database.

3. **Assignment editing**

   - On `/checklist`, for any item:
     - When I click the assignee label and choose a participant,
       - Then the item shows the new assignee.
       - A `PATCH /api/checklist-items/:id` request is sent.
       - On reload, the assignment persists.

4. **Assignment display**

   - Each checklist item row shows:
     - The current assignee (name or role) or “Unassigned”.
   - In the item details view, I can see:
     - Assignee and role.

5. **Assignee filtering**

   - On `/checklist`, I can filter by:
     - “All assignees”
     - “Unassigned”
     - Specific participant.
   - When I open `/checklist?assignee=me` (or similar),
     - Then I see only items assigned to me (assuming mapping between user and participant).

6. **UX alignment**

   - Assignment UI:
     - Is simple and non-intimidating.
     - Uses wedX design system (Tailwind + shadcn/ui).
     - Is understandable to both couples and parents.

---

## 7. Definition of Done (Story 3.4)

Story 3.4 is **Done** when:

1. Participant model and API are implemented for weddings.
2. Checklist items support assignment fields and persist them.
3. `/checklist` displays assignees for each item.
4. Users can change assignees via the UI, with changes persisted via API.
5. Checklist can be filtered by assignee, including a “My tasks” or equivalent view.
6. Implementation follows architecture and UX conventions (Next.js App Router, Tailwind, shadcn/ui).
7. `docs/sprint-artifacts/sprint-status.yaml` is updated to move:
   - `3-4-implement-checklist-collaboration-and-assignments-basics` from `backlog` → `drafted` (once this story file exists) and later `done` when implemented.

### Dev Agent Record

#### Context Reference
- docs/sprint-artifacts/3-4-implement-checklist-collaboration-and-assignments-basics.context.xml

#### Debug Log
- Plan: add participant model/API, extend checklist types and PATCH surface with assignee fields, surface assignment display/editing and filters in UI, and cover with tests.
- Implemented in-memory participant store and GET participants endpoint to seed couple/parent defaults.
- Extended checklist items (types, generator, PATCH) with assigneeId/assigneeRole; client API updated to patch assignees.
- Checklist UI now loads participants, shows assignee chips, supports assignee filter (all/unassigned/me/participant), and inline assignment dropdown per item; wiring persists via PATCH.
- Added tests for filtering and assignment update interactions; full suite run with existing act warnings noted.

#### Completion Notes
- Assignment basics delivered: participants endpoint, checklist item assignee fields, UI display/edit, and filters including “My tasks”.
- In-memory participant defaults seeded for demo; assignment PATCH persists assigneeId/assigneeRole and updates UI optimistically.
- Tests: `npm test -- --runInBand` (pass; legacy React act warnings remain).

#### File List
- app/checklist/page.tsx
- app/api/checklist-items/[id]/route.ts
- app/api/weddings/[id]/participants/route.ts
- lib/api/checklists.ts
- lib/checklists/generator.ts
- lib/checklists/types.ts
- lib/participants/store.ts
- lib/participants/types.ts
- __tests__/app/checklist/page.test.tsx
- docs/sprint-artifacts/sprint-status.yaml
- docs/sprint-artifacts/story-3-4-implement-checklist-collaboration-and-assignments-basics.md

#### Change Log
- 2025-11-29: Added participant/assignee support across checklist APIs and UI with tests; marked story ready for review.
