# Implementation Tasks: Wedx MVP

**Spec**: `/specs/001-wedx-mvp/spec.md`
**Plan**: `/specs/001-wedx-mvp/plan.md`

## Phase 1: Foundation & Wizard
- [ ] **Initialize Project** (Story 1.1): Setup Next.js 14, Tailwind, shadcn/ui with "wedX tokens" (Coral/Gold/Teal).
- [ ] **App Shell** (Story 1.2): Implement Sidebar and Top Bar navigation.
- [ ] **Auth Shell** (Story 1.3): Configure Supabase Auth and protected routes.
- [ ] **Wizard Step 1** (Story 2.1): Implement Wedding Type selection.
- [ ] **Wizard Step 2** (Story 2.2): Implement Multi-Event setup.
- [ ] **Wizard Step 3** (Story 2.3): Implement Vibe/Theme selection.
- [ ] **Wizard Step 4** (Story 2.4): Implement Rituals configuration (with presets).
- [ ] **Dashboard** (Story 2.5): Implement "Today" dashboard initial view.
- [ ] **Dashboard Detail** (Story 2.6): Implement deep-dive navigation.

## Phase 2: Checklist
- [ ] **Checklist Core** (Story 3.1): Implement engine and data model.
- [ ] **Checklist UI** (Story 3.2): Implement filtering and list views.
- [ ] **Collaboration** (Story 3.4): Implement assignments and simple permissions.

## Phase 3: Vendors & WhatsApp Bridge
- [ ] **Vendor Directory** (Story 4.1): Implement listing and basic linking.
- [ ] **WhatsApp Bridge** (Story 4.2): Implement "Message on WhatsApp" deep-link generation and `VendorCommunicationLog`.
- [ ] **Vendor Pipeline** (Story 4.3): Implement status tracking (New -> Contacted -> Booked).

## Phase 4: Guests & Events
- [ ] **Guest Data** (Story 5.1): Implement Guests/Households model and import.
- [ ] **Invitations** (Story 5.2): Implement Invitation and RSVP tracking per event.
- [ ] **Seating** (Story 5.3): Implement basic list-based seating plans.

## Phase 5: Budget
- [ ] **Budget Data** (Story 6.1): Implement Budget entities and vendor linking.
- [ ] **Budget UI** (Story 6.2): Implement Overview and per-event breakdown.

## Phase 6: AI Integration
- [ ] **AI Pipeline** (Story 7.1): Implement Context Pipeline and Planner endpoints.
- [ ] **AI UI** (Story 7.2): Implement Planner UI on Dashboard.
- [ ] **Ritual Intelligence** (Story 7.3): Implement validation and suggestions.
