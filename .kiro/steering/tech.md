# Technology Stack

## Architecture

A pragmatic, scale-adaptive web stack designed as a single application with clear "feature modules".
- **Frontend**: Next.js (App Router) for wizard-first onboarding and dashboard UX.
- **Backend**: Single service (Node/Edge) exposing REST/JSON APIs.
- **Data**: Relational schema (Postgres) mirroring PRD entities.
- **AI**: Dedicated "AI Orchestrator" layer leveraging backend APIs.

## Core Technologies

- **Language**: TypeScript (Strict Mode)
- **Framework**: Next.js 15+ (App Router), React 18+
- **Styling**: Tailwind CSS, shadcn/ui (Radix UI), Lucide React
- **Runtime**: Node.js 20+ / Edge Runtime
- **Database**: PostgreSQL (Managed/Supabase)
- **Testing**: Jest

## Key Libraries

- `shadcn/ui` & `radix-ui`: Accessible UI primitives.
- `tailwind-merge` & `clsx`: Class utility management.
- `lucide-react`: Iconography.

## Development Standards

### Type Safety
- Strict TypeScript usage.
- No `any`; use specific types or generics.
- Shared models in `lib/models/`.

### Code Quality
- ESLint & Prettier for formatting and linting.
- Modular architecture: Feature-based organization.

### Testing
- Jest for unit and integration testing.
- Colocated tests (e.g., `component.test.tsx` next to `component.tsx`).

## Key Technical Decisions

- **"Boring" Architecture**: Monolithic first, splitting into services only when demanded by scale.
- **Feature Modules**: Code is organized by feature (`wizard`, `dashboard`, `vendors`) rather than technical type.
- **AI Abstraction**: Frontend never calls AI directly; all AI interaction goes through backend services.
- **WhatsApp Integration**: Treated as an external integration storing normalized records, not raw logs.

---
_Document standards and patterns, not every dependency_
