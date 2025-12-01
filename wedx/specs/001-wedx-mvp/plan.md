# Implementation Plan: Wedx MVP

**Branch**: `001-wedx-mvp` | **Date**: 2025-11-30 | **Spec**: `/specs/001-wedx-mvp/spec.md`
**Input**: Feature specification from `/specs/001-wedx-mvp/spec.md`

## Summary

Wedx is a unified, AI-driven wedding planning platform for the Sri Lankan market. The MVP focuses on a "Cultural Wizard" for onboarding, a smart checklist system, and a vendor marketplace with a "WhatsApp Bridge". The WhatsApp Bridge uses deep links with contextual pre-filled messages and logs initiations, avoiding complex full-sync integration for MVP. The UI adopts a "Calm Coordinator" aesthetic with a specific color palette and modern typography.

## Technical Context

**Language/Version**: TypeScript (Node.js 18+, React 18+)
**Primary Dependencies**: Next.js 14+ (App Router), Tailwind CSS, shadcn/ui, Supabase (Postgres + Auth + Storage), OpenAI API (for AI features)
**Design System**: 
- **Base**: shadcn/ui + Tailwind CSS.
- **Colors**: Primary (Warm Coral/Rose), Accent (Soft Gold), Support (Teal/Emerald), Neutrals (Cool Gray).
- **Typography**: Inter or Plus Jakarta Sans (Modern Humanist Sans).
- **Layout**: 3-Column Dashboard (Sidebar, Main, Right Rail).
**Storage**: PostgreSQL (Supabase), Object Storage (Supabase Storage)
**Testing**: Vitest (Unit), Playwright (E2E)
**Target Platform**: Web (Responsive Mobile-First), Vercel Deployment
**Project Type**: Web application (Next.js Monolithic)
**Performance Goals**: Fast initial load (<1.5s LCP), smooth wizard transitions, offline-capable timeline.
**Constraints**: "Offline-first" timeline requires PWA capabilities. Cultural logic complexity requires flexible data model.
**Scale/Scope**: MVP for Wedding Couples and Vendors.

## Constitution Check

*GATE: Constitution is currently a template. Proceeding with industry best practices.*

## Project Structure

### Documentation (this feature)

```text
specs/001-wedx-mvp/
├── plan.md              # This file
├── research.md          # Phase 0 output
├── data-model.md        # Phase 1 output
├── quickstart.md        # Phase 1 output
├── contracts/           # Phase 1 output
└── tasks.md             # Phase 2 output
```

### Source Code (repository root)

```text
# Next.js App Router Structure
wedx/
├── app/
│   ├── (auth)/         # Authentication routes
│   ├── (dashboard)/    # Main app routes
│   ├── (wizard)/       # Onboarding wizard
│   ├── api/            # Backend API routes
│   ├── layout.tsx
│   └── page.tsx
├── components/
│   ├── ui/             # shadcn/ui
│   └── domain/         # Feature components (vendors, checklist, etc.)
├── lib/
│   ├── db/             # Database schema/client
│   ├── hooks/
│   ├── utils.ts
│   └── types/
├── public/
├── styles/
├── .env.example
├── next.config.js
├── package.json
└── tsconfig.json
```

**Structure Decision**: Monolithic Next.js application using App Router as defined in `architecture.md`.

## Complexity Tracking

N/A