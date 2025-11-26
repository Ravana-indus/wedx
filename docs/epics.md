# wedX - Epic Breakdown

**Author:** BMad  
**Date:** 2025-11-25  
**Project Level:** 1  
**Target Scale:** Greenfield product, single-region launch with future expansion

---

## Overview

This document breaks the wedX PRD into user-value-focused epics and stories. It assumes:

- PRD: `docs/prd.md` and the extended planning in `docs/plan.md`.  
- UX: `docs/ux-design-specification.md`.  
- Architecture: `docs/architecture.md`.

Epics are grouped by **user value**, not technical layers. Epic 1 is the allowed foundation exception; every subsequent epic yields a meaningful, usable slice of value for couples and their collaborators.

---

## Functional Requirements Inventory

High-level capability areas from the PRD/plan:

- Cultural wizard & multi-event setup (wedding type, events, rituals, constraints).  
- Master checklists & modules, including the Jewelry module.  
- Vendor marketplace and WhatsApp bridge.  
- Guest management, invitations, RSVP, and basic seating.  
- Budget & payments tracking.  
- Post-wedding wrap-up and honeymoon.  
- AI engine (planning, conflict detection, suggestions, WhatsApp text, honeymoon itinerary).  
- Collaboration roles and permissions.

---

## FR Coverage Map (High-Level)

- **Epic 1 – Foundation & Project Initialization**  
  - Supports all FRs implicitly (project setup, environments, CI, base UX shell).

- **Epic 2 – Wedding Wizard & Control Room**  
  - Covers wizard-related FRs (type, events, vibe, rituals, constraints) and initial “Today” dashboard state.

- **Epic 3 – Checklists & Jewelry Module**  
  - Covers master categories, sub-checklists, and jewelry-specific flows.

- **Epic 4 – Vendors & WhatsApp Bridge**  
  - Covers partner marketplace flows and logging non-partner vendors via WhatsApp screenshots.

- **Epic 5 – Guests, Invitations & RSVP**  
  - Covers guest list, RSVP collection, and basic table assignment structure.

- **Epic 6 – Budget & Payments Overview**  
  - Covers budget categories, committed vs remaining view, and transaction tracking.

- **Epic 7 – AI Planner & Ritual Intelligence (Core)**  
  - Covers main AI Planner surface, ritual-based task generation, conflict detection.

Additional growth epics (post-MVP) can extend this with advanced seating, deep fintech, and honeymoon automation.

---

## Epic 1: Foundation & Project Initialization

Goal: Create a stable, boring base for wedX so every subsequent epic can build on a consistent stack and deployment model.

### Story 1.1: Initialize Next.js + Tailwind + shadcn/ui Project

As a developer,  
I want a preconfigured Next.js + Tailwind + shadcn/ui project,  
So that implementation work starts from a consistent, production-ready base.

**Acceptance Criteria:**
- Given the wedX repo, when the app is bootstrapped, then it uses Next.js (App Router) with TypeScript and Tailwind configured.  
- Given shadcn/ui installation, when running the dev server, then base components (Button, Input, Card, Dialog, Tabs, Toast) are available and themed with wedX colors.  
- Given the architecture.md guidance, when I inspect the project, then there is an `app/` directory and a `components/` and `lib/` structure matching the feature-oriented approach.

**Prerequisites:** None (first setup story).  
**Technical Notes:** Follow architecture.md for stack and decision patterns; add minimal AppShell with dummy content.

### Story 1.2: Implement App Shell with Sidebar & Top Bar

As a couple using wedX,  
I want a consistent shell with navigation and context,  
So that all major features feel like part of a single “wedding OS”.

**Acceptance Criteria:**
- Given the app is running, when I visit the root path, then I see a layout with top bar (logo, countdown placeholder, profile) and left sidebar navigation (Today, Checklist, Events, Guests, Vendors, Budget, AI Planner, Inspiration, Settings).  
- When I resize between desktop and mobile widths, then the shell adapts (sidebar collapses appropriately, navigation remains available).  
- When I click between nav items, then the content changes while the shell stays stable.

**Prerequisites:** Story 1.1.  
**Technical Notes:** Use shadcn Tabs/Sheet for mobile nav; follow UX spec shell shape.

### Story 1.3: Configure Authentication Shell (Placeholder)

As a couple,  
I want wedX to require authentication for my wedding,  
So that my data is private and scoped to my account.

**Acceptance Criteria:**
- Given the app is deployed to a dev environment, when I access a protected route (Today, Checklist, etc.), then I am either authenticated or redirected to a placeholder auth screen.  
- When I am “logged in” via the chosen auth provider, then routes load in the context of my account.  
- Auth wiring follows the patterns chosen in architecture.md (even if the actual auth provider is mocked at first).

**Prerequisites:** Story 1.1.  
**Technical Notes:** Actual provider selection and full flows can be completed in a future story; this story ensures the app is ready for multi-user behavior.

---

## Epic 2: Wedding Wizard & Control Room

Goal: Let couples configure the core of their wedding (type, events, vibe, rituals, constraints) and immediately see this reflected in a clear control room (Today dashboard).

### Story 2.1: Implement Step 1 – Wedding Type Selection

As a couple,  
I want to choose the type of wedding we’re planning,  
So that wedX can load relevant events and rituals.

**Acceptance Criteria:**
- When I start the wizard, I see card options for Hindu, Christian, Buddhist, Muslim, Civil, Mixed, and Other.  
- When I choose “Mixed”, I can specify primary and secondary traditions.  
- When I choose “Other”, I can describe the wedding type in a free-text field.  
- My selection persists if I navigate back and forth within the wizard.

**Prerequisites:** Epic 1 shell and basic routing.  
**Technical Notes:** Store selection in a `wedding_settings` model linked to the current wedding.

### Story 2.2: Implement Step 2 – Multi-Event Setup

As a couple,  
I want to configure all events in my celebration with basic details,  
So that wedX can build a timeline and per-event checklists.

**Acceptance Criteria:**
- The wizard Step 2 shows common event suggestions (Engagement, Mehendi/Henna, Haldi, Kalyanam, Poruwa, Church, Nikah, Homecoming, Reception, Pre-shoot, Welcome dinner, After-party).  
- I can toggle events on/off and add custom events.  
- For each selected event I can set name, location (or mark TBD), date, time (start–end), and guest estimate.  
- Events appear in a reorderable list and are saved in the backend as `events` linked to the wedding.

**Prerequisites:** Story 2.1.  
**Technical Notes:** Ensure date/time handling respects the wedding’s timezone.

### Story 2.3: Implement Step 3 – Vibe & Theme Capture

As a couple,  
I want to express the vibe and theme of our wedding,  
So that wedX can tune inspiration and vendor suggestions.

**Acceptance Criteria:**
- I can choose from predefined vibe tags (Traditional, Cultural, Minimal, Modern glam, Luxury, Pastel, Bold, Western, Destination, Garden/outdoor).  
- I can type a free-text theme description (e.g., “Intimate coastal Poruwa with pastel florals”).  
- The chosen tags and description are saved and later visible in Settings and Influence the Inspiration and AI Planner surfaces.

**Prerequisites:** Story 2.1.  
**Technical Notes:** Store as structured tags plus a description field on the wedding or a separate `wedding_profile`.

### Story 2.4: Implement Step 4 – Rituals Configuration

As a couple,  
I want to review and customise the rituals for each event,  
So that wedX can generate accurate ritual checklists and timelines.

**Acceptance Criteria:**
- Based on wedding type and events, I see suggested rituals per event (e.g., Thali ceremony, Poruwa rituals, Nikah ceremony).  
- For each event, I can add/remove/reorder rituals and attach notes per ritual.  
- Changes are persisted as `rituals` records linked to events, with order indices.

**Prerequisites:** Stories 2.1 and 2.2.  
**Technical Notes:** Separate base ritual catalog (static data) from user-specific ritual instances.

### Story 2.5: Implement Step 5 – Budget, Management & Collaborators

As a couple,  
I want to define our budget, constraints, and who is planning,  
So that wedX can tailor tasks and warnings appropriately.

**Acceptance Criteria:**
- I can specify approximate budget range, guest count, and constraints (short timeline, strict budget, heavy family involvement, etc.).  
- I can set planning responsibility (self, with parents, planner) and a diaspora toggle.  
- I see a simple UI to mark which roles (partner, parents, planner) will be invited later.  
- These settings are saved and influence checklist generation and AI Planner behavior.

**Prerequisites:** Story 2.1.  
**Technical Notes:** Map these fields into `wedding_settings` and/or a config table.

### Story 2.6: Today Dashboard – Initial Control Room

As a couple,  
I want a clear “Today” dashboard that summarises tasks and events,  
So that I always know what matters right now.

**Acceptance Criteria:**
- After completing the wizard, I am redirected to a Today dashboard showing:  
  - Today’s tasks (initially seeded from wizard choices).  
  - Upcoming events with readiness indicators.  
  - Quick access cards for Guests, Budget, and AI Planner.  
- When I revisit wedX later, the same dashboard is the default landing page.  
- The dashboard layout matches the UX spec (3-column desktop layout, sensible mobile behaviour).

**Prerequisites:** Stories in Epic 1 and Epic 2 up to 2.5.  
**Technical Notes:** Today’s tasks can come from a simple rules engine mapping settings to checklist items.

---

## Epic 3: Checklists & Jewelry Module

Goal: Turn the PRD’s checklist system into actionable, structured work surfaces, with special focus on the Jewelry module as a differentiator.

### Story 3.1: Master Checklist Categories & List View

As a couple,  
I want all planning tasks grouped by sensible categories,  
So that I can see the scope and progress of my wedding plan.

**Acceptance Criteria:**
- The Checklist screen shows master categories (Venue & Location, Catering, Décor & Flowers, Photography & Videography, Attire & Makeup, Jewellery Preparation, Rituals, Entertainment & Music, Documents & Legal, Transport, Gifts & Souvenirs, Invitations & RSVP, Guest Management, Budget & Payments, Logistics, Post-Wedding, Honeymoon).  
- Each category displays counts (completed/total).  
- I can filter tasks by event and time (e.g., “This month”).

**Prerequisites:** Epic 2 completed.  
**Technical Notes:** Implement a `checklist_categories` table with seeded defaults.

### Story 3.2: Checklist Items with Status & Due Dates

As a couple,  
I want each checklist item to have status and due dates,  
So that I can track progress and avoid last-minute surprises.

**Acceptance Criteria:**
- Checklist items display status (Not started, In progress, Done) and optional due dates.  
- I can mark items complete; they update in Today’s tasks and event readiness.  
- I can assign tasks to roles (e.g., “Parents”, “Planner”).

**Prerequisites:** Story 3.1.  
**Technical Notes:** Implement `checklist_items` with foreign keys to category, wedding, optional event.

### Story 3.3: Jewelry Module – Entity & UI

As a couple,  
I want a dedicated Jewelry section,  
So that I don’t miss critical jewelry tasks (e.g., Thali gold, rentals).

**Acceptance Criteria:**
- There is a Jewelry section under Checklist (or a dedicated tab) that lists rings, Thali/Thirumangalyam, bridal sets, groom items, and rentals.  
- Each jewelry item shows its status (e.g., “bought”, “to rent”, “returned”), key dates (pickup, return), and notes.  
- Jewelry items are linked back into the main checklist (e.g., “Gold purchase for Thali”).

**Prerequisites:** Story 3.1.  
**Technical Notes:** Implement `jewelry_items` table and tie items to relevant checklists and events.

### Story 3.4: Ritual-Driven Checklist Auto-Generation

As a couple,  
I want ritual-specific tasks to be auto-generated,  
So that nothing is forgotten for each key ceremony.

**Acceptance Criteria:**
- For each ritual chosen in the wizard, wedX generates a small checklist (e.g., Thali ceremony tasks).  
- I can see ritual-linked items in both the Rituals and Checklist sections.  
- Removing a ritual can either archive or remove its tasks with a confirmation.

**Prerequisites:** Story 2.4 and core checklist stories.  
**Technical Notes:** Implement a mapping table from ritual type to template tasks.

---

## Epic 4: Vendors & WhatsApp Bridge

Goal: Make vendor discovery and communication trackable, both for partner vendors and WhatsApp-only vendors.

### Story 4.1: Partner Vendor Listing & Shortlist

As a couple,  
I want a curated vendor list with filters,  
So that I can quickly shortlist and compare options.

**Acceptance Criteria:**
- Vendors screen shows a “Find vendors” tab with filters (category, location, budget, vibe tags).  
- Vendor cards show name, price band, rating (if available), and tags (“Partner”).  
- I can shortlist vendors; shortlisted items appear in “My vendors”.

**Prerequisites:** Foundation and Navigation stories.  
**Technical Notes:** Initially vendors can be seed data; later integrate a real vendor backend.

### Story 4.2: My Vendors – Partner Flows

As a couple,  
I want a clear view of my shortlisted and booked partner vendors,  
So that I know who is handling what and what’s pending.

**Acceptance Criteria:**
- “My vendors” tab shows partner vendors by status (Shortlisted, Negotiating, Booked).  
- Clicking a vendor opens a detail drawer with notes and links to associated events and budget lines.  
- I can mark a vendor as booked and attach to specific events.

**Prerequisites:** Story 4.1.  
**Technical Notes:** Implement `vendors` and `vendor_leads` tables with status fields.

### Story 4.3: WhatsApp Vendors – Screenshot Logging

As a couple,  
I want to log WhatsApp conversations with non-partner vendors,  
So that I can track quotes and commitments that happen outside wedX.

**Acceptance Criteria:**
- “WhatsApp vendors” section lets me create entries with a label and associated event.  
- I can upload one or more screenshots per entry.  
- I can mark the status (Awaiting reply, Negotiating, Booked, Dropped) and add notes.

**Prerequisites:** Vendor module basic wiring.  
**Technical Notes:** Use object storage for screenshots and `vendor_whatsapp_entries` for metadata.

---

## Epic 5: Guests, Invitations & RSVP (MVP)

Goal: Support guest list creation, invitations, and RSVP tracking as a coherent flow.

### Story 5.1: Guest List Table & Import

As a couple,  
I want to build a single guest list,  
So that all invitations and seating come from one source.

**Acceptance Criteria:**
- Guests screen shows a table of guests with columns: Name, Side (Bride/Groom/Parents), RSVP status, dietary, notes.  
- I can manually add guests and bulk import via CSV.  
- Basic validation ensures required fields (e.g., name).

**Prerequisites:** Foundation and basic Checklist.  
**Technical Notes:** Implement `guests` table; mapping to `wedding_id` and “side”.

### Story 5.2: RSVP Tracking

As a couple,  
I want to track who has responded and their preferences,  
So that we know final numbers and requirements.

**Acceptance Criteria:**
- Guests have RSVP statuses (Not invited / Invited / Accepted / Declined / Maybe).  
- I can view counts per status and filter by event if needed.  
- I can record dietary preferences per guest.

**Prerequisites:** Story 5.1.  
**Technical Notes:** No external RSVP portal required in MVP; manual updates accepted.

### Story 5.3: Basic Seating Assignment

As a couple,  
I want to assign guests to tables,  
So that logistics and printouts are possible, even before full visual seating.

**Acceptance Criteria:**
- Seating tab shows a list of tables with capacities and current assignments.  
- I can create tables and assign guests to tables via simple controls.  
- I can see unassigned guests and percentages of seats filled.

**Prerequisites:** Story 5.1.  
**Technical Notes:** Implement `tables` and `table_assignments` tables; no drag-and-drop yet.

---

## Epic 6: Budget & Payments Overview

Goal: Give a clear view of planned vs committed vs remaining budget without full fintech integration.

### Story 6.1: Budget Summary View

As a couple,  
I want to see planned vs committed vs remaining budget,  
So that I can make decisions about spend.

**Acceptance Criteria:**
- Budget screen shows cards: Planned, Committed, Remaining, Upcoming payments (next 30 days).  
- Values are aggregated from `budget_lines`.  
- The summary is visible as a quick module on Today.

**Prerequisites:** Checklist and Vendor basic flows.  
**Technical Notes:** Planned vs committed vs paid fields for each budget line.

### Story 6.2: Budget Lines & Transactions

As a couple,  
I want to log vendor payments and refunds,  
So that we can track outstanding balances and returns.

**Acceptance Criteria:**
- I can add budget lines with category, vendor, amount, due date, type (Deposit/Final/Refund).  
- I can mark lines as paid and see the effect on “Committed” and “Remaining”.  
- I can filter the transaction list by category and vendor.

**Prerequisites:** Story 6.1.  
**Technical Notes:** Implement `budget_lines` tied to vendors and events when applicable.

---

## Epic 7: AI Planner & Ritual Intelligence (Core)

Goal: Use AI to turn the PRD’s intelligence features into concrete experiences that work with the existing data model.

### Story 7.1: AI Planner Chat Surface

As a couple,  
I want to talk to an AI co-pilot inside wedX,  
So that I can ask “what’s next?” and get actionable answers.

**Acceptance Criteria:**
- AI Planner screen shows a chat interface with quick prompts (e.g., “Plan this week”, “Help with Poruwa prep”).  
- AI responses reference existing entities (events, tasks, vendors) rather than free text only.  
- I can convert AI suggestions into tasks or notes with one click.

**Prerequisites:** Core data entities created in earlier epics.  
**Technical Notes:** Backend endpoint `/api/ai/planner` hides provider details.

### Story 7.2: Ritual-Based Task Generation

As a couple,  
I want AI to expand rituals into tasks,  
So that our checklists are thorough without manual effort.

**Acceptance Criteria:**
- When I choose rituals in the wizard or modify them later, I can trigger a “Generate tasks” action.  
- wedX generates a set of tasks per ritual (based on templates and AI where needed).  
- Tasks appear in the appropriate categories and events.

**Prerequisites:** Story 2.4 and core checklist stories.  
**Technical Notes:** Combine static templates with AI for description refinements; keep deterministic IDs.

### Story 7.3: Conflict Detection (Time & Vendor)

As a couple,  
I want wedX to warn me about scheduling and vendor conflicts,  
So that nothing breaks on the day due to double-booking.

**Acceptance Criteria:**
- If two events overlap in time and share resources (e.g., same venue or vendor), I see a warning on Today and Events.  
- Conflicts are stored as structured records so they can be resolved and dismissed.

**Prerequisites:** Events, Vendors, and Checklist basics.  
**Technical Notes:** Implement conflict detection as a backend service or scheduled process; surface results via API.

---

## FR Coverage Matrix (Summary)

- Wizard & timeline FRs → Epic 2 (Stories 2.1–2.5) plus Epic 2.6 for control room.  
- Checklists & Jewelry FRs → Epic 3.1–3.4.  
- Vendor & WhatsApp FRs → Epic 4.1–4.3.  
- Guests, invitations, RSVP, seating FRs → Epic 5.1–5.3.  
- Budget & payments FRs → Epic 6.1–6.2.  
- AI engine FRs → Epic 7.1–7.3.  
- Collaboration FRs → touched in multiple epics (roles/permissions integrated into Guests, Vendors, Budget and Settings in implementation).

All core PRD capabilities have at least one epic and multiple stories where necessary; growth features (advanced seating, deep fintech, honeymoon automation) can be decomposed into additional epics when ready.

---

## Summary

This epic breakdown turns the wedX PRD, UX, and Architecture into a set of user-value-focused epics and stories that are:

- Vertically sliced (each epic and story delivers observable value).  
- Feasible for individual dev agents to implement in focused sessions.  
- Aligned with the UX spec and architecture decisions for Next.js + Tailwind + shadcn/ui and a simple Node/Postgres backend.  

Implementation teams and AI dev agents should use this document, together with the PRD, UX spec, and architecture.md, as the primary input for sprint planning and story-level implementation.

