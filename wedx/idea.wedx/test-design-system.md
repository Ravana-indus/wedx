# wedX System-Level Test Design (MVP)

**Date:** 2025-11-25  
**Author:** BMad (Test Architecture – Murat)  
**Status:** Draft

---

## 1. Scope & Intent

Scope: system-level test design for the first usable wedX slice:

- Web app only (Next.js + Tailwind + shadcn/ui).  
- Core flows from PRD/plan: wizard → dashboard, checklists & jewelry, vendors & WhatsApp bridge, guests & RSVP & basic seating, budget overview, AI Planner basics.  
- No real payment processing or advanced fintech/escrow yet (tracked as future, higher-risk epics).

Goal: define a minimal but rigorous test design that:

- Protects the critical user journeys for couples, parents, and vendors.  
- Uses test levels (unit/integration/E2E) appropriately.  
- Uses P0/P1 priority to keep CI fast while still de-risking wedX for real weddings.

---

## 2. Risk Assessment (System-Level)

High-level risks, scored qualitatively:

- **R-01 – Timeline / ritual misconfiguration (BUS/DATA)**  
  - Risk: Wizard or rituals misconfigured → missing tasks / wrong sequence on the day.  
  - Impact: high (ceremony failures, trust loss).  
  - Priority: P0.

- **R-02 – Checklist gaps, especially Jewelry module (BUS/DATA)**  
  - Risk: Missing or incorrect jewelry tasks (e.g., Thali gold, rentals) → real financial/cultural damage.  
  - Impact: high; differentiator feature.  
  - Priority: P0.

- **R-03 – Guest count / RSVP / seating mismatch (BUS)**  
  - Risk: Guest list, RSVP, and seating get out of sync → overcrowding, missed guests.  
  - Impact: high–medium; socially visible failure.  
  - Priority: P1.

- **R-04 – Losing vendor conversations (WhatsApp bridge) (DATA/OPS)**  
  - Risk: Screenshots or notes not saved → lost quotes/agreements.  
  - Impact: high; money and trust.  
  - Priority: P0.

- **R-05 – Budget view misleading (BUS/DATA)**  
  - Risk: Planned/committed/remaining calculations wrong → bad financial decisions.  
  - Impact: high–medium; early versions mostly informational.  
  - Priority: P1.

- **R-06 – AI Planner suggesting actions that don’t align with data (TECH/BUS)**  
  - Risk: AI suggests tasks that aren’t persisted or mismatch state → confusion, distrust.  
  - Impact: high; affects perceived intelligence.  
  - Priority: P1.

- **R-07 – Basic auth/session issues (SEC/OPS)**  
  - Risk: Access to wedding plan without proper auth, or session loss.  
  - Impact: high; privacy and trust.  
  - Priority: P0.

These risks drive the P0/P1 scenarios below.

---

## 3. Test Level Strategy

Use the Test Levels Framework:

- **Unit tests** – pure logic:  
  - Wizard helpers (event ordering, ritual mapping).  
  - Checklist generation (from rituals and constraints).  
  - Budget aggregation functions.  

- **Integration/API tests** – boundaries between services and DB:  
  - Creating weddings, events, rituals, guests, vendors, budget lines.  
  - Linking WhatsApp entries to vendors/events.  
  - AI Planner endpoints returning consistent, structured suggestions.  

- **E2E tests** – user journeys through the UI (Playwright/Cypress):  
  - P0/P1 journeys enumerated below.

Default rule: business logic belongs primarily in unit/integration tests; critical user flows get an additional thin E2E layer.

---

## 4. P0 Scenarios (Critical – Must Automate First)

P0 scenarios are candidates for short, stable E2E tests plus deeper API/unit coverage.

### P0-01 – End-to-end wizard → dashboard (base wedding setup)

- Level: E2E + API.  
- Journey:  
  1. New user authenticates (or mock auth) and starts a new wedding.  
  2. Completes wizard Steps 1–5 with a realistic Sri Lankan multi-event setup (e.g., Mixed Hindu/Buddhist, Poruwa + Homecoming + Reception).  
  3. Lands on Today dashboard.  
- Assertions:  
  - Wedding record exists; events persisted with correct names, dates, and ordering.  
  - Rituals are attached to events.  
  - Today dashboard shows tasks seeded from this configuration.  

### P0-02 – Ritual-driven checklist generation for a key ceremony

- Level: E2E + unit.  
- Journey:  
  1. From Events → Rituals, enable Thali ceremony (or similar).  
  2. Trigger ritual-based task generation (if separate) or rely on automatic mapping.  
- Assertions:  
  - Checklist contains expected tasks for that ritual (e.g., Thali gold, backup chain, priest scheduling).  
  - Tasks are correctly linked to the event and visible in both Rituals and Checklist views.

### P0-03 – Jewelry module integrity

- Level: E2E + API.  
- Journey:  
  1. Open Jewelry module.  
  2. Add entries for rings, Thali, rentals with key dates and statuses.  
  3. Navigate to relevant checklists and Today dashboard.  
- Assertions:  
  - Jewelry items persist and reload correctly.  
  - Related checklist items reflect jewelry status.  
  - No duplicate or orphan jewelry-linked tasks.

### P0-04 – WhatsApp vendor entry is persisted and readable

- Level: E2E + API.  
- Journey:  
  1. Open Vendors → WhatsApp vendors.  
  2. Create a new entry for a decorator vendor, upload a screenshot, add notes, and link to an event.  
  3. Refresh / re-open vendors.  
- Assertions:  
  - Entry is persisted with correct label, event link, and status.  
  - Screenshot can be retrieved (image loads).  
  - Notes and status are editable and saved.

### P0-05 – Basic auth/session protection

- Level: E2E + API.  
- Journey:  
  1. Attempt to access dashboard without being signed in → redirected to auth.  
  2. Sign in and access wedding; close browser tab.  
  3. Re-open app; verify session handling.  
- Assertions:  
  - No access to wedding data unauthenticated.  
  - Sessions are scoped to the correct user/wedding.  

---

## 5. P1 Scenarios (High – Core Journeys)

These should run on every PR to main and nightly in CI.

### P1-01 – Guest list creation and RSVP tracking

- Level: E2E + API.  
- Journey:  
  1. Create several guests with different “side” values (Bride/Groom/Parents).  
  2. Mark varied RSVP statuses and dietary preferences.  
  3. Filter and count guests by status.  
- Assertions:  
  - Counts by RSVP status are correct.  
  - Dietary info persists and is visible in guest detail.  

### P1-02 – Basic seating assignment

- Level: E2E.  
- Journey:  
  1. Create a few tables with capacities.  
  2. Assign guests to tables.  
  3. Reassign some guests to different tables.  
- Assertions:  
  - No guest appears on more than one table simultaneously.  
  - Capacity tracking per table is correct.  

### P1-03 – Budget summary accuracy

- Level: E2E + unit.  
- Journey:  
  1. Add budget lines for multiple categories with planned, committed, and paid amounts.  
  2. View Budget summary.  
- Assertions:  
  - Planned, committed, and remaining totals in the UI match the sum of underlying lines.  
  - Quick Budget module on Today shows the same numbers.  

### P1-04 – Partner vendor shortlist and booking

- Level: E2E.  
- Journey:  
  1. From Find vendors, shortlist a partner vendor.  
  2. Promote vendor to booked for a specific event.  
- Assertions:  
  - Vendor appears in My vendors with correct status.  
  - Event detail shows booked vendor in its Vendors tab.

### P1-05 – AI Planner basic integration

- Level: E2E + API.  
- Journey:  
  1. From Today, open AI Planner.  
  2. Ask “What should I do this week?” for a wedding with existing tasks.  
  3. Convert at least one suggestion into a new checklist item.  
- Assertions:  
  - Suggestions reference real events/tasks (not hallucinated entities).  
  - Converted suggestions appear in Checklist and Today.  

---

## 6. Non-Functional Smoke (Minimal)

Initial non-functional checks (to be deepened via `*nfr-assess` later):

- **Performance sanity**  
  - Basic page-load sanity on key routes (wizard start, Today, Checklist, Vendors, Guests) under typical test data.  
  - No obviously unbounded queries causing timeouts for a few hundred guests/events/tasks.  

- **Security basics**  
  - No access to another wedding’s data by manipulating IDs in URLs.  
  - File uploads (WhatsApp screenshots) validated and stored safely; no script execution.  

- **Reliability & data integrity**  
  - Refreshing pages during key flows (wizard, checklist edits, vendor updates) does not lose saved data.  
  - Core entities (wedding, events, rituals, guests, vendors, jewelry, budget lines) survive deploy/restart cycles.

These can be implemented as a small number of targeted integration/E2E tests and simple monitoring checks.

---

## 7. CI Execution Strategy (High-Level)

Based on risk and priority:

- **On every commit / quick feedback**  
  - P0 E2E suite: P0-01 to P0-05 (lean scenarios).  
  - Targeted unit tests for checklist generation, budget aggregation, and ritual mapping.  

- **On PR to main**  
  - P0 + P1 E2E suites (all scenarios above).  
  - Broader integration/API tests for entity creation and linking.  

- **Nightly / pre-release**  
  - Full regression including lower-priority flows (e.g., additional edge-case tests for guests, budget, and AI behaviour once added).

Tag tests with `@p0`, `@p1` etc., and use grep/tag filters in Playwright/Cypress to control which subset runs per pipeline stage.

---

## 8. Next Steps

- Flesh out detailed test cases per scenario (step-by-step) in the chosen E2E framework (Playwright/Cypress).  
- Design API and unit test suites aligned with these P0/P1 journeys.  
- Use `*trace` to map these scenarios back to PRD FRs and epics in `docs/epics.md` and to define the quality gate criteria for wedX MVP.

