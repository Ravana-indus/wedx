# wedX UX Design Specification

_Created on 2025-11-25 by BMad_
_Generated using BMad Method - Create UX Design Workflow v1.0_

---

## Executive Summary

wedX is a web-based Wedding & Events OS for Sri Lanka that guides local and diaspora couples from cultural setup to day-to-day planning. The core experience combines a cultural wizard that configures events, rituals, and constraints with a planner workspace that turns timelines, checklists, jewelry, guests, vendors, and payments into a single calm, coordinated surface that still feels playful and celebratory.

---

## 1. Design System Foundation

### 1.1 Design System Choice

The wedX web app uses a shadcn/ui-style component system on top of Tailwind CSS as its primary design system.

- Base: shadcn/ui (Radix primitives) for accessible, composable components.  
- Styling: Tailwind utility classes with a wedX design token layer (colors, spacing, typography).  
- Rationale: balances speed (ready-made components) with brand flexibility so wedX can feel playful and celebratory without looking like a generic SaaS dashboard.  
- Alternatives considered: Material UI (too “Google admin” leaning) and a fully custom system (unnecessary overhead for v1).

---

## 2. Core User Experience

### 2.1 Defining Experience

North star: “It’s the app where you can plan your Sri Lankan wedding very easily without missing anything.”

The core UX is **wizard-first, then dashboard**:

- First serious session: a full-screen cultural wizard walks couples through wedding type, events, vibe, rituals, and planning constraints. The outcome is a multi-event timeline plus seeded checklists so the couple feels less overwhelmed.  
- After the wizard: wedX drops couples into a “Today” dashboard that shows tasks, upcoming events, vendor conversations, budget, and inspiration in one calm control room.  
- Daily heartbeat: most days users live in “Today”, “Checklist”, “Guests & Seating”, and “Vendors”, with the AI Planner used to decide “what’s next” and check for gaps.

### 2.2 Novel UX Patterns

wedX relies on proven UX patterns (wizard flows, dashboards, lists, cards), but introduces two notable patterns tailored to Sri Lankan weddings:

- **Hybrid vendor “WhatsApp bridge”**: instead of forcing all vendors into a partner marketplace, wedX acknowledges low-tech vendors. Couples log WhatsApp conversations (via screenshot uploads) into structured vendor cards, turning informal chats into trackable commitments and tasks.  
- **AI Planner as co-pilot, not chatbot**: the AI surface is directly wired into events, checklists, vendors, and budget. Suggestions always resolve into concrete actions (tasks, notes, changes), avoiding free-floating “chat” that doesn’t move the plan forward.  

These patterns sit on top of standard web primitives (lists, drawers, toasts) so implementation stays straightforward while the experience feels purpose-built.

---

## 3. Visual Foundation

### 3.1 Color System

The visual system aims to feel like a calm, trustworthy coordinator with celebratory accents, not a corporate admin tool.

- **Palette (example tokens)**  
  - Primary: warm coral/rose (`primary`) for key actions and highlights (celebratory, wedding-appropriate).  
  - Accent: soft gold (`accent`) for important milestones and financial highlights (payments, deposits).  
  - Support: teal/emerald (`support`) for success and “on-track” indicators.  
  - Neutrals: a cool gray scale (`neutral-50`–`neutral-900`) for backgrounds, borders, and text, keeping content easy to scan.  
  - States: semantic colors for `success`, `warning`, `danger`, `info` consistent across toasts, pills, and banners.

- **Typography**  
  - Headings: modern humanist sans (e.g., Inter/Plus Jakarta Sans) with medium weight; clear hierarchy from H1 (page titles) to H4 (section titles).  
  - Body: same family, regular weight for paragraphs and labels; slightly larger base size to keep dense lists readable.  
  - Usage: headings reserved for structure; avoid over-using bold in body to keep the UI calm.

- **Spacing & layout**  
  - Base unit: 8px spacing grid, with 4px used for fine adjustments.  
  - Cards and sections use generous padding (16–24px) to reduce cognitive load, especially for long checklists.  
  - Density: dashboard and lists favor “balanced” density—powerful enough for planners and parents, but never visually noisy.

**Interactive Visualizations:**

- Color Theme Explorer: [ux-color-themes.html](./ux-color-themes.html)

---

## 4. Design Direction

### 4.1 Chosen Design Approach

The primary design direction for wedX is a **wizard-first, dashboard-driven OS**:

- **First-run experience**: wizard screens are full-width, low-chrome, and focused on one decision at a time, echoing fintech onboarding (Wise/Revolut) but tuned for events: wedding type, events, vibe, rituals, constraints.  
- **Dashboard**: three-column layout on desktop (sidebar + main + right rail) with clear hierarchy—Today’s tasks at the top, event timeline in the middle, and quick modules at the bottom; AI Planner, vendor conversations, and inspiration live in the right rail.  
- **Tone**: structurally calm (clean grid, clear sectioning) with microcopy, icons, and occasional illustration carrying the playful, celebratory feel.

Alternative directions (more minimal or more maximalist) were considered, but this approach best balances family trust, planning complexity, and emotional warmth.

**Interactive Mockups:**

- Design Direction Showcase: [ux-design-directions.html](./ux-design-directions.html)

---

## 5. User Journey Flows

### 5.1 Critical User Paths

The UX is anchored around a handful of critical journeys:

1. **First planning session (wizard)**  
   - Landing → Step 1 (Wedding type) → Step 2 (Events) → Step 3 (Vibe) → Step 4 (Rituals) → Step 5 (Budget & People) → “Create my wedding control room” → Today dashboard.  

2. **Daily planning loop**  
   - Open wedX → Today dashboard → review Today’s tasks & timeline → complete tasks or click through to Events/Checklist → consult AI Planner when unsure what’s next.  

3. **Vendor acquisition and tracking**  
   - From Checklist or Vendors → browse partner marketplace → shortlist & request quotes → book vendors and attach to events → for non-partner vendors, log WhatsApp conversations with screenshots and turn them into structured vendor entries and tasks.  

4. **Guest management and seating (MVP)**  
   - From Today or sidebar → Guests & Seating → import/add guests → track RSVPs and dietary needs → assign tables with simple table/guest lists, ready for later visual layouts.  

5. **Budget & payments**  
   - From Today or Vendors → Budget & Payments → review planned vs committed vs remaining → see upcoming payments → reconcile deposits and refunds with vendor records.

These flows are kept short and reversible, with clear “back” options and consistent detail drawers instead of frequent full page navigations.

---

## 6. Component Library

### 6.1 Component Strategy

The component library layers wedX-specific components on top of shadcn/ui primitives to maximise reuse and coherence:

- **Foundation (shadcn/ui)**: core primitives such as `Button`, `Input`, `Select`, `Dialog`, `Tabs`, `Card`, `Toast`, and `Form` provide accessible building blocks.  
- **Layout & structure**: `AppShell`, `TopBar`, `SidebarNav`, `PageHeader`, and `SectionHeader` establish consistent layouts for dashboard, detail pages, and wizard screens.  
- **Domain components**:  
  - Dashboard: `TodayTasks`, `EventTimeline`, `QuickModuleCard`.  
  - Events: `EventCard`, `EventStatusBar`, `EventDetailTabs`.  
  - Checklist: `TaskRow`, `TaskList`, `TaskDrawer`.  
  - Guests: `GuestRow`, `GuestTable`, `TableSummaryCard`.  
  - Vendors: `VendorCard`, `VendorPartnerList`, `WhatsappVendorRow`.  
  - Budget: `BudgetSummaryCard`, `BudgetCategoryRow`, `TransactionTable`.  
  - AI: `ChatWindow`, `MessageBubble`, `QuickPromptChips`.  
- **Pattern components**: `StatusPill`, `Tag/Chip`, `InlineAlert`, `MetricCard`, and `ProgressBar` ensure consistent visual language for state and emphasis.

This structure lets design and engineering share a single UI kit that maps directly to the key screens defined in this spec.

---

## 7. UX Pattern Decisions

### 7.1 Consistency Rules

wedX uses a small set of opinionated UX patterns across all screens:

- **Buttons**: one clear primary action per section (filled, warm primary), with outline secondary buttons and ghost tertiary buttons; destructive actions are red and rare.  
- **Forms**: labels sit above inputs; required fields are marked with an asterisk and clear helper text; validation runs on blur and on submit with inline errors plus a summary cue.  
- **Feedback**: success and info messages use toasts; warnings and “you’re missing something important” use inline banners; errors appear both inline and as concise toasts when global.  
- **Overlays**: dialogs and side drawers are used instead of frequent full-page navigations; focus is always trapped within modals with Esc/back behaviour consistent across the app.  
- **Navigation**: the left sidebar is the primary nav; “Back” links in content return to logical parents (e.g., Events list), not just browser history; URLs reflect entities (events, vendors, guests) to support deep linking.  
- **Empty states**: every empty view explains why it’s empty and offers a next step (e.g., “Finish the wizard to unlock personalised inspiration”).  
- **Notifications**: toasts appear at the top-right, auto-dismiss for success/info, and persist longer for errors and critical budget/vendor issues.  
- **Date & time**: consistent `DD MMM YYYY` formatting with visible timezone where relevant; all pickers default to the wedding’s primary timezone (configured in Settings).

---

## 8. Responsive Design & Accessibility

### 8.1 Responsive Strategy

wedX is designed as a desktop-first web app that remains highly usable on tablets and phones:

- **Breakpoints & layout**  
  - Mobile (<768px): sidebar collapses into a bottom nav or hamburger; Today dashboard stacks sections vertically; right-rail content (AI, vendors, inspiration) becomes inline sections or separate routes.  
  - Tablet (768–1024px): collapsible sidebar; two-column layouts where possible (main + secondary); right rail content can slide in as drawers.  
  - Desktop (≥1024px): full shell with sidebar, main, and right rail visible; key workflows (Today, Events detail, Vendors) assume this 3-column layout.

- **Accessibility (WCAG 2.1 AA target)**  
  - Color contrast: all text meets at least 4.5:1 contrast; interactive elements have clear focus states.  
  - Keyboard: all interactive elements are reachable and usable via keyboard alone; modals trap focus correctly.  
  - Semantics: ARIA roles and labels applied to navigation, dialogs, toasts, and complex components (e.g., tables, chat).  
  - Assistive technology: forms, errors, and status changes are announced to screen readers via live regions where appropriate.  
  - Testing: automated checks (Lighthouse/axe) plus manual keyboard and screen reader passes as part of design QA.

---

## 9. Implementation Guidance

### 9.1 Completion Summary

This UX Design Specification defines the core experience for wedX across wizard onboarding, the multi-event dashboard, vendor workflows, guest management, budgeting, and AI assistance.

- The **design system** (shadcn/ui + Tailwind) and **visual foundation** provide a coherent look and feel that can be implemented as a reusable UI kit.  
- The **screen-level specs** for Today, Events, Vendors, Guests, and Budget give designers and engineers a clear target for layout and interaction.  
- The **component strategy** and **pattern decisions** ensure consistency across new features, making future flows easier to design and build.  
- The **responsive and accessibility strategy** set expectations for a production-ready, inclusive web app suitable for real weddings.

Recommended next steps:

- Build the base component library (AppShell, navigation, cards, lists, forms, toasts) and wire up the Today dashboard using this spec.  
- Use this document as context for the architecture and epics/stories workflows so implementation planning aligns with the UX vision.

---

## Appendix

### Related Documents

- Product Requirements: `docs/prd.md`
- Product Brief: `N/A`
- Brainstorming: `N/A`

### Core Interactive Deliverables

This UX Design Specification was created through visual collaboration:

- **Color Theme Visualizer**: docs/ux-color-themes.html
  - Interactive HTML showing all color theme options explored
  - Live UI component examples in each theme
  - Side-by-side comparison and semantic color usage

- **Design Direction Mockups**: docs/ux-design-directions.html
  - Interactive HTML with 6-8 complete design approaches
  - Full-screen mockups of key screens
  - Design philosophy and rationale for each direction

### Optional Enhancement Deliverables

_This section will be populated if additional UX artifacts are generated through follow-up workflows._

<!-- Additional deliverables added here by other workflows -->

### Next Steps & Follow-Up Workflows

This UX Design Specification can serve as input to:

- **Wireframe Generation Workflow** - Create detailed wireframes from user flows
- **Figma Design Workflow** - Generate Figma files via MCP integration
- **Interactive Prototype Workflow** - Build clickable HTML prototypes
- **Component Showcase Workflow** - Create interactive component library
- **AI Frontend Prompt Workflow** - Generate prompts for v0, Lovable, Bolt, etc.
- **Solution Architecture Workflow** - Define technical architecture with UX context

### Version History

| Date       | Version | Changes                         | Author |
| ---------- | ------- | ------------------------------- | ------ |
| 2025-11-25 | 1.0     | Initial UX Design Specification | BMad   |

---

_This UX Design Specification was created through collaborative design facilitation, not template generation. All decisions were made with user input and are documented with rationale._
