# Story 1.2 – Implement App Shell with Sidebar & Top Bar

## 1. Story Summary

**As a** couple using wedX  
**I want** a consistent shell with navigation and context  
**So that** all major features feel like part of a single “wedding OS”.

Epic: **Epic 1 – Foundation & Project Initialization** ([`epics.md`](docs/epics.md:82–95))  
Tech Context: [`tech-spec-epic-1.md`](docs/sprint-artifacts/tech-spec-epic-1.md:82–152)

---

## 2. Business & Product Rationale

From [`epics.md`](docs/epics.md:82–92):

- The shell is the **frame** for all future experiences:
  - Wizard (Epic 2).
  - Checklists & Jewelry (Epic 3).
  - Vendors & WhatsApp bridge (Epic 4).
  - Guests & RSVP (Epic 5).
  - Budget (Epic 6).
  - AI Planner (Epic 7).
- A stable, consistent shell:
  - Reduces cognitive load for couples and parents.
  - Makes the app feel like a single “wedding OS” instead of many disconnected tools.
  - Provides a predictable place for navigation, status, and key actions.

From UX ([`ux-design-specification.md`](docs/ux-design-specification.md:79–88,120–138,162–170)):

- UX is **wizard-first, then dashboard**, but the **AppShell** is the persistent frame:
  - Left sidebar navigation.
  - Top bar with logo, countdown placeholder, and profile.
  - Three-column layout on desktop (sidebar + main + right rail).
  - Responsive behavior for mobile and tablet.

This story turns the raw Next.js + Tailwind + shadcn/ui project from Story 1.1 into a **user-facing shell** that all later epics can plug into.

---

## 3. Scope

### In Scope

1. Implement a reusable **AppShell** layout component that includes:
   - **TopBar**:
     - wedX logo placeholder.
     - Countdown placeholder (e.g., “X days to wedding”).
     - Profile/avatar area.
   - **SidebarNav**:
     - Navigation items:
       - Today
       - Checklist
       - Events
       - Guests
       - Vendors
       - Budget
       - AI Planner
       - Inspiration
       - Settings
   - **Main content area** for page content.
   - **Right rail** placeholder (for AI, vendors, inspiration later).

2. Wire **Next.js App Router** layouts to use AppShell:
   - Core routes:
     - `/dashboard` (Today)
     - `/checklist`
     - `/events`
     - `/guests`
     - `/vendors`
     - `/budget`
     - `/ai`
     - `/inspiration`
     - `/settings`
   - Each route renders placeholder content inside the shared shell.

3. Implement **responsive behavior**:
   - Desktop (≥1024px):
     - Persistent sidebar.
     - Main + right rail visible.
   - Tablet (768–1024px):
     - Collapsible sidebar.
     - Two-column layout where possible.
   - Mobile (<768px):
     - Sidebar collapses into a drawer/sheet or bottom nav.
     - Navigation remains accessible via a clear control (e.g., menu button).

4. Apply **wedX design system**:
   - Use shadcn/ui + Tailwind with wedX tokens for:
     - Sidebar items.
     - Top bar.
     - Layout spacing and typography.

### Out of Scope

- Actual wizard steps and flows (Epic 2).
- Real Today dashboard content (Epic 2.6).
- Real checklist, events, vendors, guests, budget, AI logic (Epics 3–7).
- Authentication and route protection (Story 1.3).

---

## 4. Technical Requirements

### 4.1 Layout & Components

From architecture ([`architecture.md`](docs/architecture.md:65–93)) and UX ([`ux-design-specification.md`](docs/ux-design-specification.md:120–138)):

**Core components** (suggested locations):

- `components/layout/app-shell.tsx`
- `components/layout/top-bar.tsx`
- `components/layout/sidebar-nav.tsx`
- `components/layout/right-rail.tsx` (placeholder)

**AppShell responsibilities**:

- Render:
  - `TopBar` at the top.
  - `SidebarNav` on the left (desktop).
  - `MainContent` in the center.
  - `RightRail` on the right (desktop).
- Accept `children` for main content.
- Handle responsive layout using Tailwind breakpoints.

**TopBar**:

- Left:
  - wedX logo placeholder (text or simple mark).
- Center:
  - Countdown placeholder (e.g., “120 days to wedding” hard-coded for now).
- Right:
  - Profile/avatar placeholder (e.g., initials circle or generic icon).

**SidebarNav**:

- Navigation items (labels and routes):

  | Label       | Route          |
  |------------|----------------|
  | Today      | `/dashboard`   |
  | Checklist  | `/checklist`   |
  | Events     | `/events`      |
  | Guests     | `/guests`      |
  | Vendors    | `/vendors`     |
  | Budget     | `/budget`      |
  | AI Planner | `/ai`          |
  | Inspiration| `/inspiration` |
  | Settings   | `/settings`    |

- Use shadcn/ui primitives (e.g., `Button` or `NavigationMenu`-style components) styled as a vertical nav.
- Highlight the active route.

**RightRail**:

- Placeholder content:
  - e.g., “Right rail: AI Planner, vendor updates, inspiration will appear here.”
- Can be a simple column with cards.

### 4.2 Routing & Layout Integration

Using App Router (from [`architecture.md`](docs/architecture.md:65–79)):

- Define a shared layout for core app routes, e.g.:

  - `app/(app)/layout.tsx` using `AppShell`.
  - Or `app/dashboard/layout.tsx` that wraps children with `AppShell` and is reused by siblings.

- For each route:

  - `app/dashboard/page.tsx` – Today placeholder.
  - `app/checklist/page.tsx`
  - `app/events/page.tsx`
  - `app/guests/page.tsx`
  - `app/vendors/page.tsx`
  - `app/budget/page.tsx`
  - `app/ai/page.tsx`
  - `app/inspiration/page.tsx`
  - `app/settings/page.tsx`

Each page:

- Renders a simple heading and description inside the main content area.
- Confirms that navigation works and the shell remains stable.

### 4.3 Responsive Behavior

From UX ([`ux-design-specification.md`](docs/ux-design-specification.md:162–170)):

- **Desktop (≥1024px)**:
  - Sidebar fixed on the left.
  - Main content and right rail visible side-by-side.
- **Tablet (768–1024px)**:
  - Sidebar collapsible (e.g., can be toggled).
  - Right rail may become a collapsible drawer or stack below main content.
- **Mobile (<768px)**:
  - Sidebar hidden by default.
  - Use a menu button in TopBar to open a shadcn `Sheet`/`Drawer` with navigation.
  - Main content stacks vertically; right rail content can be moved below or into separate routes.

Implementation notes:

- Use Tailwind breakpoints (`md`, `lg`) to control layout.
- Use shadcn `Sheet` or `Dialog` for mobile nav.

### 4.4 Design System Application

From [`ux-design-specification.md`](docs/ux-design-specification.md:50–72,144–158):

- Apply wedX tokens:
  - Sidebar background: neutral tone.
  - Active nav item: primary color highlight.
  - Top bar: neutral background with subtle border/shadow.
- Use consistent spacing:
  - 8px grid (e.g., `p-2`, `p-4`, `gap-4`).
- Typography:
  - Page titles and section headers use heading styles defined in the design system.

---

## 5. Dependencies & Relationships

### 5.1 Upstream Dependencies

- **Story 1.1 – Initialize Next.js + Tailwind + shadcn/ui Project**:
  - Project must already exist with:
    - Next.js App Router.
    - Tailwind configured.
    - shadcn/ui initialized and themed.
  - Base structure (`app/`, `components/`, `lib/`) must be in place.

### 5.2 Downstream Dependencies

This story is a prerequisite for:

- **Story 1.3 – Configure Authentication Shell (Placeholder)**:
  - Auth will wrap the shell and routes implemented here.
- **Epic 2–7 stories**:
  - Wizard, checklists, vendors, guests, budget, AI Planner all assume this shell and navigation exist.

If this story is incomplete or inconsistent, later stories will need to rework layout and navigation, causing churn.

---

## 6. Acceptance Criteria

From [`epics.md`](docs/epics.md:88–95) plus technical elaboration:

1. **Shell stability across navigation**
   - Given the app is running,
     - When I visit `/dashboard`, `/checklist`, `/events`, `/guests`, `/vendors`, `/budget`, `/ai`, `/inspiration`, `/settings`,
     - Then:
       - The top bar and sidebar remain visible and unchanged.
       - Only the main content area changes per route.

2. **Responsive behavior**
   - When I resize between desktop and mobile widths:
     - On desktop:
       - Sidebar is visible and fixed on the left.
       - Main content and right rail are visible.
     - On mobile:
       - Sidebar is hidden by default.
       - A clear control (e.g., menu button) opens navigation (sheet/drawer).
       - Navigation remains accessible and usable.

3. **Navigation correctness**
   - Clicking each nav item:
     - Navigates to the correct route.
     - Highlights the active item.
   - Browser back/forward works as expected.

4. **Visual alignment with UX**
   - The shell:
     - Uses wedX colors and typography.
     - Respects spacing and layout guidelines from the UX spec.
   - There are no obvious visual regressions (e.g., unreadable text, broken layout).

5. **Ready for auth integration**
   - The shell and routes are structured so that:
     - A future auth guard (Story 1.3) can wrap them without major refactors.
     - Public vs protected routes can be clearly separated.

---

## 7. Definition of Done (Story 1.2)

Story 1.2 is **Done** when:

1. AppShell, TopBar, SidebarNav, and RightRail components are implemented and used by core routes.
2. All core routes (`/dashboard`, `/checklist`, `/events`, `/guests`, `/vendors`, `/budget`, `/ai`, `/inspiration`, `/settings`) render inside the shell with placeholder content.
3. Navigation works and the shell remains stable across route changes.
4. Responsive behavior matches the UX intent for mobile, tablet, and desktop.
5. Visual styling uses wedX design tokens and feels consistent with the UX spec.
6. The code structure follows architecture conventions (feature-oriented, naming rules).
7. `docs/sprint-artifacts/sprint-status.yaml` is updated to move:
   - `1-2-implement-app-shell-with-sidebar-top-bar` from `backlog` → `drafted` (once this story file exists) and later `done` when implemented.