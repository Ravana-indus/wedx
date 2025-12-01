# Research & Decisions: Wedx MVP

## 1. Offline Capabilities for Timeline
**Unknown**: How to implement "Offline-first" timeline in Next.js App Router?
**Research**:
- Next.js App Router Service Workers can be managed via `serwist` or `next-pwa`.
- Strategy: Cache the "Timeline" API response and static assets. Use `localStorage` for immediate read access to timeline data on load, then revalidate in background.
**Decision**: Use `serwist` for Service Worker generation. Implement a `useOfflineTimeline` hook that falls back to `localStorage` or IndexedDB.

## 2. Backend Infrastructure
**Unknown**: Node/Express vs Serverless/Supabase?
**Research**:
- Architecture doc suggests "boring" single backend but also mentions Supabase.
- MVP requires Auth, DB, Storage, and real-time (optional but good for chat).
**Decision**: **Supabase**.
- **Auth**: Supabase Auth (Email/Password + Socials).
- **DB**: Managed Postgres.
- **API**: Next.js API Routes (calling Supabase via `supabase-js` or Prisma). *Refinement*: Architecture says "API: Next.js API routes". We will use Supabase client in API routes to keep logic centralized.

## 3. WhatsApp Bridge (Non-Partner Vendors)
**Unknown**: Integration method.
**Research**:
- PRD FR-010 mentions "Screenshot Upload".
- **Story 4.2 Refinement**: The primary MVP interaction is **Deep Linking**.
- Flow: User clicks "Message on WhatsApp" -> System logs `VendorCommunicationLog` (outbound) -> Opens `wa.me` with pre-filled context (Event Name, Couple Name).
**Decision**: **Deep Link + Log**. Screenshot upload is a secondary validation step, but the core "Bridge" is the smart link generator.

## 4. AI Integration (Nano Banana)
**Unknown**: Image Gen provider.
**Research**:
- DALL-E 3 offers high quality but higher cost.
- Stable Diffusion via Replicate is cheaper/faster.
**Decision**: **OpenAI DALL-E 3** for MVP (simpler integration). Wrap in `/api/ai/image` endpoint.

## 5. Design System
**Unknown**: Styling strategy.
**Research**:
- **Story 1.1 Refinement**: Must use **shadcn/ui** customized with **wedX tokens**.
- **UX Spec**:
  - **Primary**: Warm Coral/Rose (Celebratory, Wedding-appropriate).
  - **Accent**: Soft Gold (Milestones, Payments).
  - **Support**: Teal/Emerald (Success, On-track).
  - **Neutrals**: Cool Gray Scale (`neutral-50`–`neutral-900`).
  - **Typography**: Inter or Plus Jakarta Sans (Medium headings, Regular body).
**Decision**: Implement `tailwind.config.js` with these specific color tokens and map shadcn/ui variables to them. Use Inter as the primary font family.