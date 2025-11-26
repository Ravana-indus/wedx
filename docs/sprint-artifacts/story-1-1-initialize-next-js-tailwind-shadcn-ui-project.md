# Story 1.1 – Initialize Next.js + Tailwind + shadcn/ui Project

## 1. Story Summary

**As a** developer  
**I want** a preconfigured Next.js + Tailwind + shadcn/ui project  
**So that** implementation work starts from a consistent, production-ready base.

Epic: **Epic 1 – Foundation & Project Initialization** ([`epics.md`](docs/epics.md:64))  
Tech Context: [`tech-spec-epic-1.md`](docs/sprint-artifacts/tech-spec-epic-1.md:64–116)

---

## 2. Business & Product Rationale

- The PRD defines a multi-epic MVP (wizard, checklists, vendors, guests, budget, AI) that all depend on a **single, boring, stable web stack** ([`architecture.md`](docs/architecture.md:10–18, 49–61)).
- Epic 1 is the only allowed “horizontal” epic; all other epics are vertical slices. If this foundation is inconsistent, every later epic becomes harder and riskier.
- This story ensures:
  - A **consistent project structure** for all agents.
  - A **shared design system** (Tailwind + shadcn/ui + wedX tokens).
  - A **Next.js App Router** baseline that matches the UX and architecture decisions.

---

## 3. Scope

### In Scope

1. Create a new Next.js project using **App Router** with:
   - TypeScript
   - Tailwind CSS
   - ESLint

2. Integrate **shadcn/ui**:
   - Initialize the library.
   - Install core primitives:
     - Button, Input, Card, Dialog, Tabs, Toast (minimum set from [`epics.md`](docs/epics.md:74–77)).

3. Configure **Tailwind + shadcn/ui** to use wedX design tokens:
   - Colors (primary, accent, support, neutrals).
   - Typography and spacing consistent with UX spec ([`ux-design-specification.md`](docs/ux-design-specification.md:50–72)).

4. Establish base project structure:
   - `app/` (App Router).
   - `components/` (UI + layout).
   - `lib/` (config, models, utilities).

5. Provide a **demo page** that:
   - Renders a small set of shadcn components using wedX theme.
   - Confirms that Tailwind and shadcn/ui are wired correctly.

### Out of Scope

- App shell layout and navigation (covered by Story 1.2).
- Authentication and protected routes (Story 1.3).
- Any backend or database setup beyond what is strictly necessary to run the Next.js app.

---

## 4. Technical Requirements

### 4.1 Project Bootstrap

Follow [`architecture.md`](docs/architecture.md:21–38):

1. Create the project:

   ```bash
   npx create-next-app@latest wedx \
     --typescript \
     --tailwind \
     --eslint \
     --app
   ```

2. Initialize shadcn/ui:

   ```bash
   npx shadcn-ui@latest init
   ```

3. Ensure:

   - `app/` directory exists and uses App Router.
   - TypeScript is enabled and builds cleanly.
   - Tailwind is configured and working.

### 4.2 Directory & Naming Conventions

From [`architecture.md`](docs/architecture.md:65–93, 170–179):

- **Directories**:
  - `app/` – route segments (wizard, dashboard, checklist, etc. later).
  - `components/` – reusable UI and domain components.
  - `lib/` – shared utilities, config, models.

- **Naming**:
  - React components: PascalCase (`ExampleCard`).
  - Files: kebab-case (`example-card.tsx`).
  - Keep structure feature-oriented, not type-oriented.

### 4.3 Design System Wiring

From [`ux-design-specification.md`](docs/ux-design-specification.md:50–72, 120–138):

- Tailwind config:
  - Define wedX color tokens:
    - `primary` (warm coral/rose).
    - `accent` (soft gold).
    - `support` (teal/emerald).
    - Neutral scale (`neutral-50`–`neutral-900`).
  - Set base font family and sizes.

- shadcn/ui theme:
  - Map wedX tokens to CSS variables used by shadcn components.
  - Ensure:
    - `Button`, `Card`, `Tabs`, `Dialog`, `Toast` use wedX colors and spacing.

### 4.4 Demo Page

Create a simple demo page (e.g., `/design-system-demo` or the root page initially) that:

- Renders:
  - A primary `Button`.
  - A `Card` with heading and body text.
  - A `Tabs` component with two tabs.
  - A `Dialog` that can be opened.
  - A `Toast` triggered by a button.

- Uses wedX tokens:
  - Primary color for main actions.
  - Neutral background and text.
  - Spacing consistent with the 8px grid.

This page is for **visual verification** only and can be removed or hidden later.

---

## 5. Dependencies & Relationships

### 5.1 Upstream Dependencies

- None in terms of code; this is the first implementation story.
- Conceptual dependencies:
  - Architecture decisions in [`architecture.md`](docs/architecture.md:49–61, 141–150).
  - UX design system decisions in [`ux-design-specification.md`](docs/ux-design-specification.md:14–24, 50–72).

### 5.2 Downstream Dependencies

This story is a prerequisite for:

- Story 1.2 – App Shell with Sidebar & Top Bar.
- Story 1.3 – Authentication Shell.
- All Epic 2–7 stories (wizard, checklists, vendors, guests, budget, AI).

If this story is incomplete or inconsistent, all later stories will be harder to implement and test.

---

## 6. Acceptance Criteria

From [`epics.md`](docs/epics.md:74–80) plus technical elaboration:

1. **Next.js + Tailwind + TS baseline**
   - Given the wedX repo,
     - When I run `npm install` and `npm run dev`,
     - Then a Next.js App Router app starts without TypeScript or ESLint errors.
   - Tailwind classes are applied correctly (e.g., background, text colors, spacing).

2. **shadcn/ui installed and themed**
   - Given shadcn/ui installation,
     - When I render Button, Input, Card, Dialog, Tabs, Toast on the demo page,
     - Then they:
       - Render without runtime errors.
       - Use wedX colors and typography (not default shadcn theme).

3. **Project structure matches architecture**
   - Given the architecture.md guidance,
     - When I inspect the project,
     - Then:
       - There is an `app/` directory using App Router.
       - There are `components/` and `lib/` directories.
       - File and component naming follow the conventions in [`architecture.md`](docs/architecture.md:170–179).

4. **Demo page for visual verification**
   - When I open the demo page in a browser,
     - Then I see:
       - A primary button using wedX primary color.
       - A card with wedX typography and spacing.
       - Tabs switching content.
       - A dialog that opens and closes correctly.
       - A toast that appears and dismisses.

5. **Ready for Epic 1.2 and 1.3**
   - The codebase is in a state where:
     - AppShell and navigation (Story 1.2) can be added without restructuring.
     - Auth shell (Story 1.3) can wrap routes without major refactors.

---

## 7. Definition of Done (Story 1.1)

Story 1.1 is **Done** when:

1. The project builds and runs locally with:
   - Next.js App Router.
   - TypeScript.
   - Tailwind.
   - shadcn/ui.

2. The design system is wired:
   - wedX tokens are defined and used by shadcn components.
   - Demo page visually confirms the theme.

3. The project structure and naming follow the architecture conventions.

4. This story spec is reflected in the actual implementation and:
   - `docs/sprint-artifacts/sprint-status.yaml` is updated to mark:
     - `1-1-initialize-next-js-tailwind-shadcn-ui-project` as at least `drafted` (once this story file exists) and later `done` when implemented.