# wedX Decision Architecture

_Created on 2025-11-25 by BMad_  
_Track: BMad Method – Greenfield | Project type: Software_

---

## 1. Executive Summary

wedX is a web-based Wedding & Events OS for Sri Lanka. The architecture is a pragmatic, scale-adaptive web stack:

- **Frontend**: Next.js (App Router) + React + TypeScript + Tailwind + shadcn/ui, delivering the wizard-first onboarding and dashboard UX.  
- **Backend/API**: A single backend service initially (Supabase/Postgres or similar managed DB + simple Node/Edge functions) exposing a modest REST/JSON API for weddings, events, guests, vendors, tasks, payments metadata, and AI integration.  
- **Data**: A relational schema that mirrors the PRD entities (Wedding, Event, Ritual, ChecklistItem, JewelryItem, Vendor, Guest, BudgetLine, Conversation).  
- **AI/Integrations**: A dedicated “AI Orchestrator” layer that uses the same APIs as the frontend and coordinates with external providers (OpenAI, WhatsApp bridge, image-generation) behind clean interfaces.

The architecture is intentionally “boring”: a single web app and one primary backend that can split into services only when usage demands it. The main goal is consistency for AI agents implementing wedX: every FR maps cleanly to API endpoints, data models, and UI surfaces, with naming and patterns fixed in advance.

---

## 2. Project Initialization

Initial project creation should follow a Next.js + Tailwind + shadcn/ui starter, e.g.:

```bash
npx create-next-app@latest wedx \
  --typescript \
  --tailwind \
  --eslint \
  --app
```

Then integrate shadcn/ui and base components:

```bash
npx shadcn-ui@latest init
```

This provides:

- App Router structure for feature-based routing.  
- Tailwind configuration aligned with wedX tokens.  
- Accessible, composable UI primitives for buttons, cards, dialogs, forms, tabs, and toasts.  

Backend and database bootstrapping can be done via an external service (e.g., Supabase) or a Node/Express/Fastify API with Postgres; the key is a single relational database and a single API surface at the start.

---

## 3. Decision Summary (High-Level)

- **Frontend framework**: Next.js (React, TypeScript, App Router).  
- **Styling / design system**: Tailwind CSS + shadcn/ui + wedX design tokens.  
- **Runtime deployment**: Vercel or similar for the web app; managed Postgres backend.  
- **API style**: JSON REST API for core resources (weddings, events, rituals, tasks, vendors, guests, budget lines, files).  
- **Auth**: Managed auth (as provided by hosting platform or Supabase), with standard JWT-based sessions and role mapping (Owner, Collaborator, Vendor).  
- **Data store**: Relational DB (Postgres) with clear foreign-key relations mirroring the PRD.  
- **AI integration**: Backends call AI providers; frontend never calls AI APIs directly.  
- **WhatsApp bridge**: Treated as an external integration; frontend uploads screenshots and metadata, backend stores normalized records.  
- **File storage**: Cloud object storage for images and attachments (screenshots, documents).  

These decisions are enough for agents to begin implementation in a consistent way while leaving room to evolve into services (e.g., a dedicated payment service or analytics service) later.

---

## 4. Project Structure (Conceptual)

At a high level, the codebase is structured into feature-oriented modules:

- `app/` – Next.js route segments:
  - `wizard/` – step-by-step setup flows for wedding type, events, vibe, rituals, constraints.  
  - `dashboard/` – Today view, event timeline, quick modules.  
  - `checklist/` – Master + event-specific checklists.  
  - `events/` – Event list and event detail (Overview, Rituals, Checklist, Vendors, Notes).  
  - `guests/` – Guest list, RSVPs, simple seating management.  
  - `vendors/` – Partner marketplace and WhatsApp vendors.  
  - `budget/` – Budget overview and transaction log.  
  - `ai/` – AI Planner UI.  
  - `inspiration/` – Inspiration feed.  
  - `settings/` – Wedding details, collaborators, preferences.

- `components/` – Reusable UI and domain components (as described in the UX spec).  
- `lib/` – Shared utilities:
  - `api/` – typed API client wrappers.  
  - `models/` – TypeScript types mirroring backend entities.  
  - `auth/`, `validation/`, `formatting/` (dates, money).  

- Backend (whether in the same repo or separate):
  - `src/api/` – HTTP handlers grouped by resource (weddings, events, guests, vendors, tasks, budget, ai).  
  - `src/db/` – DB schema and data-access layer.  
  - `src/integrations/` – AI provider, WhatsApp bridge, payments.  
  - `src/services/` – orchestration logic (e.g., generating checklists from wizard answers, conflict detection, honeymoon planning).

This is a single-application architecture with clear “feature modules,” easy for multiple AI agents to work on independently without clashing.

---

## 5. FR Category to Architecture Mapping (Selected Highlights)

This is not a full matrix, but the mapping is straightforward:

- **Wizard & Timeline (FR‑001–FR‑005)**  
  - UI: `app/wizard/` pages, wizard layout components.  
  - API: `/api/weddings`, `/api/events`, `/api/rituals`, `/api/settings`.  
  - DB: `weddings`, `events`, `rituals`, `wedding_settings`.

- **Master Checklist & Modules (FR‑006–FR‑008)**  
  - UI: `app/checklist/` with category and event filters.  
  - API: `/api/tasks`, `/api/checklists`.  
  - DB: `checklist_categories`, `checklist_items`, `checklist_assignments`.

- **Vendor Marketplace & WhatsApp Bridge (FR‑009–FR‑011)**  
  - UI: `app/vendors/` plus right-rail surface on Today.  
  - API: `/api/vendors`, `/api/vendor-conversations`.  
  - DB: `vendors`, `vendor_leads`, `vendor_conversations`, `vendor_whatsapp_entries`.  
  - Integration: separate WhatsApp integration module that stores normalized records, not raw chat logs.

- **Guest & Table Management (FR‑012–FR‑015)**  
  - UI: `app/guests/`.  
  - API: `/api/guests`, `/api/tables`.  
  - DB: `guests`, `guest_groups`, `tables`, `table_assignments`.

- **Invitations & RSVP (FR‑016–FR‑017)**  
  - UI: sub-pages in `app/guests/` or `app/invitations/`.  
  - API: `/api/invitations`, `/api/rsvp`.  
  - DB: `invitations`, `rsvp_responses`.

- **Post-Wedding & Honeymoon (FR‑018–FR‑020)**  
  - UI: post-wedding section in `app/budget/` and `app/events/`.  
  - API: `/api/returns`, `/api/honeymoon-plans`.  
  - DB: `returns`, `honeymoon_plans`.

- **AI Engine (FR‑021–FR‑023)**  
  - UI: `app/ai/` and right-rail AI Planner.  
  - API: `/api/ai/planner`, `/api/ai/image`, `/api/ai/conflicts`.  
  - DB: `ai_suggestions`, `conflict_logs`, plus stable references to entities.

Every FR in the PRD maps to at least one UI module, API surface, and persistence model.

---

## 6. Technology Stack Details

- **Frontend**: Next.js, React, TypeScript, Tailwind, shadcn/ui.  
- **Backend**: Node (Edge/runtime or Node server), REST handlers or serverless functions exposing JSON APIs.  
- **Database**: Postgres (managed).  
- **Storage**: Object storage for files (screenshots, images).  
- **Auth**: Hosted auth provider or integrated auth from the backend platform (e.g., Supabase auth).  
- **AI**: Integration via backend modules; the frontend never holds API keys.

All choices are intended to be widely supported, well-documented, and friendly to incremental refactors as wedX grows.

---

## 7. Integration Points

- **WhatsApp Bridge**  
  - Frontend: upload screenshot + metadata for a vendor.  
  - Backend: normalizes each entry into `vendor_whatsapp_entries` and optionally uses AI to extract structured data (names, dates, quotes).  

- **AI Providers**  
  - Backends expose stable endpoints for planning and image generation (e.g., `/api/ai/planner` and `/api/ai/image`), hiding provider-specific details.  
  - All AI suggestions are linked back to DB entities so they’re auditable and reversible.

- **Payments**  
  - Phase 1: track payments as metadata only (Budget & Payments UI).  
  - Phase 2: integrate with a payment provider behind a dedicated `payments` module and a limited set of backend endpoints.

---

## 8. Implementation Patterns (Consistency Rules)

These patterns are critical for AI agents working together:

- **Naming**  
  - REST endpoints: plural nouns, kebab-case where needed, e.g., `/api/events`, `/api/checklist-items`.  
  - DB tables: snake_case plurals (`weddings`, `events`, `checklist_items`).  
  - Foreign keys: `<entity>_id` (e.g., `wedding_id`, `event_id`).  
  - React components: PascalCase (`EventCard`, `TodayTasks`).  
  - Files: kebab-case (`event-card.tsx`, `today-tasks.tsx`).

- **Structure**  
  - Components organized by feature, not by technical type; each feature directory (`events`, `vendors`, etc.) contains its own `components` subfolder where needed.  
  - Tests live alongside their files (e.g., `event-card.test.tsx`).  

- **Data formats**  
  - API responses wrap data in `{ data, error }` with `error` null on success.  
  - Errors use `{ message, code, details? }`.  
  - Dates are ISO strings in JSON and formatted at the edge of the UI.  

- **UX behaviour**  
  - Loading: skeleton UIs for lists, spinners on buttons.  
  - Errors: inline messages near fields, with a toast for global failures.  
  - Modals: always trap focus; `Esc` closes non-critical dialogs.

These are “must follow” patterns for all agents implementing wedX features.

---

## 9. Data Architecture (High-Level)

Key tables (simplified):

- `weddings (id, owner_user_id, name, type, primary_date, budget_range, timezone, created_at, updated_at)`  
- `events (id, wedding_id, name, date, time_start, time_end, location, guest_estimate, budget_estimate)`  
- `rituals (id, event_id, name, order_index, notes, responsible_party)`  
- `checklist_categories (id, wedding_id, name, position)`  
- `checklist_items (id, wedding_id, category_id, event_id?, title, description, status, due_date, assignee_role)`  
- `jewelry_items (id, wedding_id, type, description, is_rental, custody_status, notes)`  
- `vendors (id, wedding_id?, name, type, is_partner, contact_info, notes)`  
- `vendor_leads (id, wedding_id, vendor_id?, channel, status, metadata)`  
- `vendor_whatsapp_entries (id, wedding_id, label, screenshot_url, extracted_text, status, notes)`  
- `guests (id, wedding_id, name, side, contact_info, rsvp_status, dietary, notes)`  
- `tables (id, wedding_id, name, capacity)`  
- `table_assignments (id, table_id, guest_id)`  
- `budget_lines (id, wedding_id, category, vendor_id?, amount_planned, amount_committed, amount_paid, due_date, type, notes)`  
- `conversations (id, wedding_id, type, external_id?, metadata)`  
- `ai_suggestions (id, wedding_id, context, suggestion_type, payload, created_at)`.

This schema ensures each FR has a clear home and supports the UX flows defined in the UX spec.

---

## 10. Security, Performance, and Deployment (Initial View)

- **Security**  
  - Auth required for all wedding data; roles for Owner, Collaborator (partner/parents), Vendor.  
  - Access checks at API layer (wedding ownership and role-based access).  
  - Sensitive integration secrets stored server-side only.

- **Performance**  
  - Indexed by `wedding_id` across primary tables.  
  - Use pagination for guest lists, vendor lists, and logs.  
  - Server-side rendering or static generation where appropriate to keep planner views responsive.

- **Deployment**  
  - Web app deployed to a managed platform (e.g., Vercel).  
  - Backend deployed either as serverless functions or a small Node service with a managed Postgres instance.  
  - Environment configuration managed via environment variables, no secrets in client.

---

## 11. Architecture Decision Record Summary

Key decisions:

- Use “boring” web stack (Next.js + Postgres) to accelerate initial delivery and keep complexity low.  
- Keep architecture monolithic but feature-modular until usage demands service decomposition.  
- Put AI and WhatsApp behind stable backend APIs so frontends stay simple and testable.  
- Fix naming, structure, and data format conventions to make multi-agent implementation consistent and safe.

This decision architecture is sufficient for AI agents and developers to begin implementation of wedX in a coherent, maintainable way, while leaving clear extension points for future growth.

