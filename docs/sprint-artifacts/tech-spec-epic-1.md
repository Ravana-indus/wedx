# Epic 1 – Foundation & Project Initialization  
wedX Technical Specification – Epic 1

Author: BMad (Scrum Master + Tech Context)  
Date: 2025-11-26  
Source Docs:  
- PRD: docs/prd.md  
- Architecture: docs/architecture.md  
- UX: docs/ux-design-specification.md  
- Epics: docs/epics.md  

---

## 1. Epic Overview

### 1.1 Epic Definition

**Epic 1 – Foundation & Project Initialization**  
Goal (from [`epics.md`](docs/epics.md:64)):  
> Create a stable, boring base for wedX so every subsequent epic can build on a consistent stack and deployment model.

This epic is the **technical foundation** for the entire product. It does not directly deliver end-user functional value like checklists or vendors, but it is the **only allowed “horizontal” epic**. All later epics (wizard, checklists, vendors, guests, budget, AI) assume that Epic 1 has been implemented correctly.

### 1.2 Scope

In scope for Epic 1:

1. **Project bootstrap and tooling**
   - Next.js (App Router) + React + TypeScript.
   - Tailwind CSS configured with wedX tokens.
   - shadcn/ui initialized and wired into the design system.
   - Basic linting, formatting, and project scripts.

2. **App shell and navigation**
   - Layout with top bar and left sidebar.
   - Route structure aligned with architecture and UX:
     - Today / Dashboard
     - Checklist
     - Events
     - Guests
     - Vendors
     - Budget
     - AI Planner
     - Inspiration
     - Settings

3. **Authentication shell (placeholder)**
   - Protected routes for core surfaces.
   - Placeholder auth screen and wiring to chosen auth provider (can be mocked).
   - Role-aware structure (Owner, Collaborator, Vendor) prepared but not fully implemented.

Out of scope for Epic 1:

- Actual wizard steps (Epic 2).
- Real checklist logic and data (Epic 3).
- Vendor marketplace and WhatsApp bridge (Epic 4).
- Guests, RSVP, seating (Epic 5).
- Budget logic and transactions (Epic 6).
- AI Planner and conflict detection (Epic 7).
- Production-grade CI/CD and observability (can be stubbed or minimal).

---

## 2. Context & Constraints

### 2.1 Product Context (from PRD)

From [`prd.md`](docs/prd.md:32–48):

- Phase 1 MVP focuses on:
  - Wizard & Timeline (FR‑001–FR‑005).
  - Smart Planning (FR‑006–FR‑008, including Jewelry module).
  - Marketplace & WhatsApp Bridge (FR‑009–FR‑011).
  - Day-of timeline.
  - AI features (Nano Banana, conflict detection).

Epic 1 does **not** implement these features directly, but must:

- Provide a **stable app shell** and routing so these features can be added as vertical slices.
- Ensure the stack and structure are consistent with the architecture and UX decisions.

### 2.2 Architectural Constraints

From [`architecture.md`](docs/architecture.md:10–18, 49–61, 65–93):

- **Frontend**: Next.js (App Router) + React + TypeScript + Tailwind + shadcn/ui.
- **Backend/API**: Single backend service (Node/Edge functions or Supabase) with JSON REST APIs.
- **Data**: Relational schema (Postgres) mirroring PRD entities.
- **AI/Integrations**: Backend-only integration; frontend never calls AI providers directly.
- **Project structure**:
  - `app/` – feature-based route segments.
  - `components/` – reusable UI and domain components.
  - `lib/` – shared utilities, typed API clients, models, auth, validation.

Epic 1 must:

- Use **App Router** (not Pages Router).
- Follow **feature-oriented structure** (no giant “shared” dumping ground).
- Respect naming conventions:
  - React components: PascalCase.
  - Files: kebab-case.
  - API routes: plural nouns.

### 2.3 UX Constraints

From [`ux-design-specification.md`](docs/ux-design-specification.md:27–38, 79–88, 120–138, 162–176):

- UX is **wizard-first, then dashboard**.
- Shell:
  - Left sidebar navigation.
  - Top bar with logo, countdown placeholder, profile.
  - Three-column layout on desktop (sidebar + main + right rail).
- Design system:
  - shadcn/ui + Tailwind with wedX tokens.
  - Calm, trustworthy base with celebratory accents.
- Responsiveness:
  - Mobile: sidebar collapses; bottom nav or hamburger.
  - Desktop: full shell visible.

Epic 1 must:

- Implement the **AppShell** that matches this UX:
  - Layout primitives.
  - Navigation behavior.
  - Responsive breakpoints.

---

## 3. Stories in Epic 1 – Technical Breakdown

Epic 1 contains three stories (from [`epics.md`](docs/epics.md:68–108)):

- Story 1.1: Initialize Next.js + Tailwind + shadcn/ui Project
- Story 1.2: Implement App Shell with Sidebar & Top Bar
- Story 1.3: Configure Authentication Shell (Placeholder)

### 3.1 Story 1.1 – Initialize Next.js + Tailwind + shadcn/ui Project

**User Story** (from [`epics.md`](docs/epics.md:68–80)):

> As a developer,  
> I want a preconfigured Next.js + Tailwind + shadcn/ui project,  
> So that implementation work starts from a consistent, production-ready base.

#### 3.1.1 Technical Objectives

1. Create a Next.js App Router project with TypeScript and Tailwind.
2. Integrate shadcn/ui and configure base components.
3. Establish the base project structure:
   - `app/`
   - `components/`
   - `lib/`
4. Wire Tailwind and shadcn/ui to wedX design tokens (colors, typography, spacing).

#### 3.1.2 Implementation Details

**Project bootstrap** (from [`architecture.md`](docs/architecture.md:21–38)):

- Command:

  ```bash
  npx create-next-app@latest wedx \
    --typescript \
    --tailwind \
    --eslint \
    --app
  ```

- Then integrate shadcn/ui:

  ```bash
  npx shadcn-ui@latest init
  ```

**Directory structure**:

- `app/`
  - `(shell)/layout.tsx` – global layout with AppShell.
  - `page.tsx` – redirect or render Today dashboard placeholder.
- `components/`
  - `ui/` – shadcn/ui wrappers.
  - `layout/` – AppShell, SidebarNav, TopBar.
- `lib/`
  - `config/site.ts` – site metadata.
  - `utils/` – helpers (e.g., cn, formatting).
  - `models/` – TS types for core entities (Wedding, Event, etc.) as stubs.

**Design system wiring** (from [`ux-design-specification.md`](docs/ux-design-specification.md:50–72)):

- Tailwind config:
  - Define wedX color tokens (primary, accent, support, neutrals).
  - Set base font family and sizes.
- shadcn/ui theme:
  - Map tokens to CSS variables.
  - Ensure Button, Card, Dialog, Tabs, Toast use wedX colors.

#### 3.1.3 Acceptance Criteria (Technical)

Derived from [`epics.md`](docs/epics.md:74–80) and architecture:

1. **Next.js + Tailwind + TS**:
   - `npm run dev` starts a Next.js App Router app.
   - Tailwind classes are applied correctly.
   - TypeScript compilation passes.

2. **shadcn/ui available**:
   - At least these components are installed and themed:
     - Button, Input, Card, Dialog, Tabs, Toast.
   - A sample page demonstrates them with wedX colors.

3. **Structure matches architecture**:
   - `app/`, `components/`, and `lib/` exist and follow the feature-oriented approach described in [`architecture.md`](docs/architecture.md:65–93).

---

### 3.2 Story 1.2 – Implement App Shell with Sidebar & Top Bar

**User Story** (from [`epics.md`](docs/epics.md:82–95)):

> As a couple using wedX,  
> I want a consistent shell with navigation and context,  
> So that all major features feel like part of a single “wedding OS”.

#### 3.2.1 Technical Objectives

1. Implement a reusable **AppShell** component that:
   - Renders top bar and sidebar.
   - Provides main content area and optional right rail.
2. Implement **responsive navigation**:
   - Desktop: persistent sidebar.
   - Mobile: collapsible sidebar / sheet.
3. Wire navigation items to route segments (even if content is placeholder).

#### 3.2.2 Implementation Details

**AppShell layout** (from [`ux-design-specification.md`](docs/ux-design-specification.md:79–88, 120–138, 162–170)):

- Components:
  - `AppShell` – wraps pages with:
    - `TopBar`
    - `SidebarNav`
    - `MainContent`
    - `RightRail` (placeholder for AI, vendors, inspiration).
  - `TopBar`:
    - Logo.
    - Countdown placeholder.
    - Profile/avatar menu.
  - `SidebarNav`:
    - Nav items:
      - Today
      - Checklist
      - Events
      - Guests
      - Vendors
      - Budget
      - AI Planner
      - Inspiration
      - Settings

**Routing** (from [`architecture.md`](docs/architecture.md:65–79)):

- `app/dashboard/` – Today dashboard (placeholder content).
- `app/checklist/`
- `app/events/`
- `app/guests/`
- `app/vendors/`
- `app/budget/`
- `app/ai/`
- `app/inspiration/`
- `app/settings/`

Each route:

- Uses the shared AppShell layout.
- Renders a simple placeholder page with a heading and description.

**Responsiveness**:

- Desktop (≥1024px):
  - Sidebar fixed on the left.
  - Main content and right rail visible.
- Mobile (<768px):
  - Sidebar hidden by default.
  - Hamburger or bottom nav to open navigation (use shadcn Sheet/Drawer).
- Tablet (768–1024px):
  - Collapsible sidebar; two-column layout where possible.

#### 3.2.3 Acceptance Criteria (Technical)

From [`epics.md`](docs/epics.md:88–95) and UX spec:

1. **Shell stability**:
   - Navigating between Today, Checklist, Events, Guests, Vendors, Budget, AI Planner, Inspiration, Settings:
     - The shell (top bar + sidebar) remains constant.
     - Only the main content area changes.

2. **Responsive behavior**:
   - On desktop:
     - Sidebar is visible and fixed.
   - On mobile:
     - Sidebar collapses; navigation remains accessible via a clear control (e.g., menu button).
   - Layout matches the 3-column intent on desktop (even if right rail is placeholder).

3. **Visual alignment**:
   - Shell uses the design system tokens (colors, typography, spacing).
   - No obvious visual regressions against the UX spec.

---

### 3.3 Story 1.3 – Configure Authentication Shell (Placeholder)

**User Story** (from [`epics.md`](docs/epics.md:96–108)):

> As a couple,  
> I want wedX to require authentication for my wedding,  
> So that my data is private and scoped to my account.

#### 3.3.1 Technical Objectives

1. Introduce an **auth boundary**:
   - Protected routes for core app surfaces.
   - Public routes for landing / marketing (if any).
2. Implement a **placeholder auth screen**:
   - Simple login UI.
   - Mocked or minimal provider integration.
3. Prepare for **role-based access**:
   - Owner, Collaborator, Vendor roles (even if not fully enforced yet).

#### 3.3.2 Implementation Details

**Auth provider** (from [`architecture.md`](docs/architecture.md:55, 141–148)):

- Use a managed auth solution (e.g., Supabase auth or platform auth).
- For Epic 1:
  - It is acceptable to:
    - Mock auth with a simple “Sign in” button that sets a session cookie or local state.
    - Or wire to a real provider with minimal configuration.

**Protected routes**:

- Wrap core routes (`/dashboard`, `/checklist`, `/events`, `/guests`, `/vendors`, `/budget`, `/ai`, `/inspiration`, `/settings`) with an auth guard:
  - If not authenticated:
    - Redirect to `/auth` (placeholder auth page).
  - If authenticated:
    - Render AppShell and page content.

**Auth shell**:

- `app/auth/page.tsx`:
  - Simple layout with:
    - wedX branding.
    - Explanation that this is a placeholder auth.
    - A “Continue” or “Sign in” button that simulates login.

**Role structure**:

- Define TS types in `lib/models/auth.ts`:
  - `UserRole = 'owner' | 'collaborator' | 'vendor'`.
- For Epic 1:
  - It is enough to:
    - Store a default role (e.g., `owner`) in session.
    - Use this later for access control.

#### 3.3.3 Acceptance Criteria (Technical)

From [`epics.md`](docs/epics.md:102–108) and architecture:

1. **Protected routes**:
   - When accessing a protected route without being “logged in”:
     - User is redirected to `/auth`.
   - After “logging in”:
     - Protected routes load in the context of the current account.

2. **Auth wiring follows architecture**:
   - Auth logic is implemented in a way that can be swapped to a real provider later without rewriting the entire app.
   - No auth secrets are exposed in the frontend.

3. **Multi-user readiness**:
   - The app structure supports multiple weddings and users (even if only one is used in dev).
   - Role types are defined and can be used in later epics.

---

## 4. Interfaces & Integration Points

Epic 1 introduces or prepares the following interfaces:

1. **Frontend route contracts**:
   - `/dashboard`, `/checklist`, `/events`, `/guests`, `/vendors`, `/budget`, `/ai`, `/inspiration`, `/settings`, `/auth`.
   - These routes will be used by later epics to implement features.

2. **Component contracts**:
   - `AppShell`, `TopBar`, `SidebarNav`, `PageHeader`, `SectionHeader`.
   - Domain components will plug into these layouts.

3. **Auth boundary**:
   - A single place where auth is checked before rendering core surfaces.
   - Later epics will rely on this to ensure data is scoped to the correct wedding and user.

4. **Design system**:
   - Tailwind config and shadcn/ui theme act as the base for all UI work.

---

## 5. Traceability Mapping

### 5.1 PRD → Epic 1 → Stories

While Epic 1 is foundational, it still supports PRD requirements indirectly:

- **FR‑006–FR‑008 (Checklists & Jewelry)**:
  - Requires a stable app shell and navigation (Story 1.2).
- **FR‑009–FR‑011 (Vendor Marketplace & WhatsApp Bridge)**:
  - Requires vendor routes and layout (Story 1.2).
- **FR‑012–FR‑017 (Guests, Tables, Invitations, RSVP)**:
  - Requires guests and events routes (Story 1.2).
- **FR‑021–FR‑023 (AI Engine)**:
  - Requires AI Planner route and right rail (Story 1.2).
- **Security & privacy expectations**:
  - Supported by auth shell (Story 1.3).

### 5.2 Epics → Stories → Technical Components

- **Epic 1**:
  - Story 1.1 → Project bootstrap, design system, base structure.
  - Story 1.2 → AppShell, navigation, route skeletons.
  - Story 1.3 → Auth boundary, placeholder auth UI.

Each story maps to concrete components and files, making it easy for dev agents to implement and for QA to verify.

---

## 6. Risks & Open Questions

### 6.1 Risks

1. **Over-engineering the foundation**:
   - Risk: Spending too long perfecting the shell before delivering user-visible value.
   - Mitigation: Keep Epic 1 focused on minimal but solid foundations; avoid premature optimization.

2. **Auth provider choice churn**:
   - Risk: Changing auth provider later could cause rewrites.
   - Mitigation: Encapsulate auth logic behind a small set of hooks and components.

3. **Design system drift**:
   - Risk: Components diverge from UX spec if tokens and patterns are not enforced.
   - Mitigation: Centralize tokens and use shared components for layout and patterns.

### 6.2 Open Questions

1. Which auth provider will be used in production (Supabase, Auth0, platform auth)?
2. Will backend live in the same repo as the frontend or separate from day one?
3. How much CI/CD is required in Epic 1 vs later epics?

---

## 7. Technical Acceptance Criteria Summary

Epic 1 is considered **technically complete** when:

1. **Project Bootstrap**
   - Next.js App Router + TypeScript + Tailwind project runs successfully.
   - shadcn/ui is integrated and themed with wedX tokens.
   - `app/`, `components/`, and `lib/` follow the architecture’s feature-oriented structure.

2. **App Shell**
   - AppShell with TopBar and SidebarNav is implemented.
   - Navigation between core sections works and keeps the shell stable.
   - Layout is responsive and matches the UX intent (desktop 3-column, mobile collapsed).

3. **Auth Shell**
   - Protected routes redirect unauthenticated users to `/auth`.
   - Placeholder auth flow allows entering the app as a “logged-in” user.
   - Auth wiring follows architecture patterns and is ready for a real provider.

4. **Traceability & Readiness**
   - Routes and components required by later epics exist as placeholders.
   - The codebase adheres to naming and structure conventions from [`architecture.md`](docs/architecture.md:170–195).
   - This document (`tech-spec-epic-1.md`) is kept in sync with implementation decisions.

---

## 8. Next Steps After Epic 1

Once Epic 1 is implemented:

1. Use `docs/sprint-artifacts/sprint-status.yaml` to:
   - Move Epic 1 stories from `backlog` → `in-progress` → `done`.
2. Proceed to **Epic 2 – Wedding Wizard & Control Room**:
   - Implement wizard flows using the shell and routes created in Epic 1.
3. Use `*create-story` and `*story-ready-for-dev` workflows:
   - Generate detailed story specs and mark them ready for development, using this tech spec as context.

This Epic 1 Technical Specification is the single source of truth for how the foundation of wedX should be implemented and validated.