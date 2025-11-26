# Story 1.3 – Configure Authentication Shell (Placeholder)

## 1. Story Summary

**As a** couple  
**I want** wedX to require authentication for my wedding  
**So that** my data is private and scoped to my account.

Epic: **Epic 1 – Foundation & Project Initialization** ([`epics.md`](docs/epics.md:96–108))  
Tech Context: [`tech-spec-epic-1.md`](docs/sprint-artifacts/tech-spec-epic-1.md:96–152)

---

## 2. Business & Product Rationale

From [`epics.md`](docs/epics.md:96–108):

- wedX will handle sensitive personal and financial information:
  - Guest lists and family relationships.
  - Budget and payments.
  - Vendor contracts and WhatsApp conversations.
- Even in MVP, couples must feel that:
  - Their data is **private**.
  - Access is **scoped** to their wedding and collaborators.

From architecture ([`architecture.md`](docs/architecture.md:55,141–148,223–229)):

- Auth is a **core cross-cutting concern**:
  - Managed auth provider (e.g., Supabase, platform auth).
  - Role-based access (Owner, Collaborator, Vendor).
  - API-level access checks.

This story does **not** implement full production auth, but it:

- Establishes an **auth boundary** around core app routes.
- Provides a **placeholder auth experience**.
- Prepares the codebase for a real provider in later epics.

---

## 3. Scope

### In Scope

1. Introduce an **authentication shell** with:

   - A dedicated `/auth` route for login.
   - A simple placeholder login UI.
   - A minimal session mechanism (mocked or simple provider integration).

2. Protect core app routes:

   - `/dashboard`, `/checklist`, `/events`, `/guests`, `/vendors`, `/budget`, `/ai`, `/inspiration`, `/settings`
   - If user is not “authenticated”:
     - Redirect to `/auth`.
   - If user is authenticated:
     - Render the AppShell and page content.

3. Prepare for **role-based access**:

   - Define role types:
     - `owner`, `collaborator`, `vendor`.
   - Store role in session (even if only `owner` is used initially).

4. Ensure the auth implementation follows architecture constraints:

   - No secrets in the frontend.
   - Auth logic encapsulated behind hooks/components so provider can be swapped later.

### Out of Scope

- Full production auth provider configuration (e.g., OAuth flows, password reset).
- Detailed role-based permissions (e.g., vendor vs parent vs planner).
- Multi-tenant wedding selection UI.
- Backend enforcement of auth (this story focuses on frontend shell and structure).

---

## 4. Technical Requirements

### 4.1 Auth Provider Strategy (Placeholder)

From [`architecture.md`](docs/architecture.md:55,141–148,223–229):

- Auth should be **managed** and **backend-enforced** in the long term.
- For this story, acceptable approaches:

  1. **Mocked auth**:
     - Use a simple in-memory or localStorage-based flag to represent “logged in”.
     - Provide a “Sign in” button that sets this flag.
     - Provide a “Sign out” button that clears it.

  2. **Minimal real provider** (optional, if chosen):
     - Wire to a simple provider (e.g., Supabase auth) with email/password or magic link.
     - Still keep logic encapsulated so it can be evolved later.

- Regardless of approach:
  - Encapsulate auth logic in `lib/auth/` and hooks/components.
  - Do not scatter auth checks across the app.

### 4.2 Route Protection

Implement a **guard** for core app routes:

- Suggested pattern (App Router):

  - Create a wrapper layout for protected routes, e.g.:

    - `app/(app)/layout.tsx`:
      - Checks auth state.
      - If not authenticated:
        - Redirect to `/auth`.
      - If authenticated:
        - Render `AppShell` and children.

- Protected routes:

  - `/dashboard`
  - `/checklist`
  - `/events`
  - `/guests`
  - `/vendors`
  - `/budget`
  - `/ai`
  - `/inspiration`
  - `/settings`

- Public routes:

  - `/auth`
  - Landing/marketing pages (if any).

Implementation details:

- Create an `useAuth` hook in `lib/auth/use-auth.ts` that exposes:
  - `user` (or `null`).
  - `role`.
  - `login()` and `logout()` functions.
- In the protected layout:
  - Use `useAuth` to determine whether to render children or redirect.

### 4.3 Auth Page (`/auth`)

Create `app/auth/page.tsx`:

- Layout:

  - Centered card with:
    - wedX logo/brand.
    - Short explanation:
      - “This is a placeholder authentication screen for wedX MVP.”
    - A primary “Continue” or “Sign in” button.

- Behavior:

  - Clicking the button:
    - Calls `login()` from `useAuth`.
    - Sets a mock user (e.g., `{ id: 'demo-user', role: 'owner' }`).
    - Redirects to `/dashboard`.

- Optional:

  - Add a “Sign out” link in the AppShell (TopBar) that calls `logout()` and returns to `/auth`.

### 4.4 Role Structure

From [`architecture.md`](docs/architecture.md:55,170–179,223–229):

- Define types in `lib/models/auth.ts`:

  ```ts
  export type UserRole = 'owner' | 'collaborator' | 'vendor';

  export interface UserSession {
    id: string;
    role: UserRole;
    // optional: weddingId, email, name
  }
  ```

- For this story:

  - It is sufficient to:
    - Always log in as `role: 'owner'`.
    - Store session in memory or localStorage.

- Later epics will:

  - Use `role` to control access to certain features (e.g., vendor vs parent vs planner).

### 4.5 Encapsulation & Extensibility

To avoid future rewrites:

- Keep auth logic in:

  - `lib/auth/` (hooks, helpers).
  - `components/auth/` (UI components, if needed).

- Do **not**:

  - Hard-code auth checks in every page.
  - Mix auth logic with business logic.

- Ensure:

  - Replacing the mock provider with a real one requires changes only in `lib/auth` and minimal wiring in the layout.

---

## 5. Dependencies & Relationships

### 5.1 Upstream Dependencies

- **Story 1.1 – Initialize Next.js + Tailwind + shadcn/ui Project**:
  - Project and design system must exist.
- **Story 1.2 – Implement App Shell with Sidebar & Top Bar**:
  - AppShell and core routes must be in place so auth can wrap them.

### 5.2 Downstream Dependencies

This story is a prerequisite for:

- Any story that assumes authenticated access to data:
  - Wizard (Epic 2).
  - Checklists & Jewelry (Epic 3).
  - Vendors & WhatsApp bridge (Epic 4).
  - Guests & RSVP (Epic 5).
  - Budget (Epic 6).
  - AI Planner (Epic 7).

Later stories will:

- Rely on `useAuth` and `UserRole` to:
  - Scope data to the current wedding.
  - Control access to certain actions.

---

## 6. Acceptance Criteria

From [`epics.md`](docs/epics.md:102–108) plus technical elaboration:

1. **Protected routes redirect unauthenticated users**

   - Given the app is deployed to a dev environment,
     - When I access a protected route (e.g., `/dashboard`, `/checklist`),
     - Then I am redirected to `/auth` if I am not “logged in”.

2. **Auth flow allows access after login**

   - Given I am on `/auth`,
     - When I click the “Sign in” or “Continue” button,
     - Then:
       - A mock session is created (e.g., `role: 'owner'`).
       - I am redirected to `/dashboard`.
       - Subsequent visits to protected routes render the AppShell and page content.

3. **Auth wiring follows architecture patterns**

   - Auth logic is encapsulated in `lib/auth` and/or `components/auth`.
   - No secrets or provider keys are exposed in the frontend.
   - Replacing the mock provider with a real one later is straightforward.

4. **Multi-user readiness (structural)**

   - The session model supports:
     - A user ID.
     - A role.
     - (Optionally) a wedding ID.
   - Even if only a single user/wedding is used in dev, the structure is ready for multi-user behavior.

5. **User experience is coherent**

   - `/auth` page:
     - Uses wedX design system (colors, typography, spacing).
     - Clearly explains that this is a placeholder auth.
   - AppShell:
     - Shows a simple profile/avatar area that can later reflect real user data.
   - A “Sign out” action (optional but recommended) returns the user to `/auth`.

---

## 7. Definition of Done (Story 1.3)

Story 1.3 is **Done** when:

1. All core app routes are protected by an auth boundary.
2. `/auth` provides a working placeholder login experience.
3. After “login”, protected routes render the AppShell and content without redirect loops.
4. Auth logic is encapsulated and follows architecture conventions.
5. The session model supports roles and can be extended later.
6. `docs/sprint-artifacts/sprint-status.yaml` is updated to move:
   - `1-3-configure-authentication-shell-placeholder` from `backlog` → `drafted` (once this story file exists) and later `done` when implemented.

#### File List
- lib/models/auth.ts
- lib/auth/use-auth.tsx
- app/layout.tsx
- app/(app)/layout.tsx
- app/auth/page.tsx
- components/layout/top-bar.tsx

#### Change Log
- 2025-11-26: Implemented placeholder authentication shell with protected routes, mock session model, and `/auth` login experience for Story 1.3.

#### Status
Done
