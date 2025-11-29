# Ad-Hoc Code Review: Completed Epics 1-7

**Reviewer:** BMad (Master)
**Date:** 2025-11-29
**Review Type:** Ad-Hoc Review of Implemented Epics
**Files Reviewed:**
- `app/wizard/step-1/page.tsx` (Wedding Type)
- `app/wizard/step-2/page.tsx` (Events)
- `app/wizard/step-3/page.tsx` (Vibe/Theme)
- `app/wizard/step-4/page.tsx` (Rituals)
- `app/dashboard/page.tsx` (Today Dashboard)
- `app/(app)/checklist/page.tsx` (Checklists)
- `app/(app)/vendors/page.tsx` (Vendors)
- `app/(app)/guests/page.tsx` (Guests)
- `app/(app)/ai/page.tsx` (AI Planner)

**Outcome:** **Changes Requested**

---

## Summary
The codebase implements the core features defined in Epics 1-7 reasonably well. The UI is consistent with the design direction (Next.js + Tailwind + shadcn/ui). The wizard flow, dashboard, and main functional areas (checklists, vendors, guests) are functional and use a clean, component-based structure.

However, there are several **critical findings**, particularly regarding "Task completion validation" where placeholder/mock data is used instead of real backend integration in several places (Wizard steps), and missing error handling in API interactions. While some mocking is acceptable for an MVP if backend is lagging, the `sprint-status` marks these as "done" which implies implementation completeness that isn't fully reflected in the code (specifically for data persistence in Wizard).

## Key Findings

### HIGH Severity
1.  **Mock Data / Missing Persistence in Wizard (Epics 2.1 - 2.5)**
    -   **Issue:** `app/wizard/step-1/page.tsx` through `step-4` use `setTimeout` to simulate API calls. There is no actual persistence to a backend or database. The state is local to the component and lost on refresh/navigation (except where some minimal state might be passed, but it looks largely ephemeral).
    -   **Evidence:** `// TODO: replace with real PATCH /api/weddings/:id` in `step-1`, `step-2`, `step-3`, `step-4`.
    -   **Impact:** Users cannot actually save their wedding setup. The "onboarding" flow is effectively a demo, not a functional feature.
    -   **Recommendation:** Implement the actual API calls to persist this data, or clearly label these stories as "frontend-only prototype" (which contradicts "done").

2.  **Missing Input Validation**
    -   **Issue:** While some basic UI validation exists (disabling "Next" button), there's no robust server-side or Zod-based schema validation visible in the reviewed files. Input fields often lack max-length or format constraints (e.g., phone numbers).
    -   **Evidence:** `app/(app)/guests/page.tsx` manually checks `!guestForm.firstName.trim()`, but no robust validation lib is used.
    -   **Impact:** Data integrity issues and potential security vulnerabilities.

### MEDIUM Severity
1.  **Hardcoded / "Mock" Context in Rituals**
    -   **Issue:** `app/wizard/step-4/page.tsx` uses `useMockWizardContext`. It does not pull the actual events configured in Step 2.
    -   **Evidence:** `function useMockWizardContext() { ... const events = [...] }`
    -   **Impact:** The wizard flow is disjointed; events added in Step 2 won't appear in Step 4.

2.  **Inline Types vs Shared Types**
    -   **Issue:** Types like `WeddingBaseType` are defined in multiple files (`app/wizard/step-1/page.tsx`, `app/wizard/step-4/page.tsx`).
    -   **Impact:** Maintenance burden. If one changes, others break or diverge.
    -   **Recommendation:** Move shared types to `lib/types` or `lib/models`.

3.  **Error Handling UI**
    -   **Issue:** Error states are simple text divs. No structured error boundaries or toast notifications for API failures in some components (though some use `setError`).
    -   **Recommendation:** Standardize on `sonner` or `useToast` for all async error reporting.

### LOW Severity
1.  **Console Logs / TODOs**
    -   **Issue:** Several `TODO` comments remain in the code.
    -   **Recommendation:** Convert critical TODOs to backlog items or resolve them.

---

## Acceptance Criteria Coverage (Sample)

| Epic/Story | Feature | Status | Evidence |
| :--- | :--- | :--- | :--- |
| 1.1 | Next.js Setup | **Implemented** | `package.json`, `app/layout.tsx` exist. |
| 2.1 | Wedding Type | **Partial** | UI exists, but persistence is mocked. |
| 2.2 | Event Setup | **Partial** | UI exists, persistence mocked. |
| 2.4 | Rituals | **Partial** | UI exists, persistence mocked, context disconnected. |
| 3.1 | Checklist Engine | **Implemented** | `checklist/page.tsx` calls `ensureChecklist` API. |
| 4.1 | Vendors | **Implemented** | `vendors/page.tsx` calls `listVendors` API. |
| 5.1 | Guests | **Implemented** | `guests/page.tsx` calls `listHouseholds` API. |
| 7.1 | AI Planner | **Implemented** | `ai/page.tsx` calls `callAiPlanner` (with mock fallback). |

---

## Action Items

### Critical (Must Fix for "Done")
- [ ] [High] Implement real API persistence for Wizard Steps 1-4 (replace `setTimeout`).
- [ ] [High] Connect Wizard Step 4 (Rituals) to read real Events data from Step 2 persistence (remove `useMockWizardContext`).
- [ ] [High] Move `WeddingBaseType` and other shared types to a common `lib/types` file and import them.

### Improvements
- [ ] [Med] Add Zod schema validation for forms (Guests, Vendors).
- [ ] [Med] Standardize error reporting using Toasts instead of inline text where appropriate.
- [ ] [Low] Remove `TODO` comments by implementing the missing logic or tracking in backlog.

---
**Reviewer Note:** The "dashboard" and "checklist/vendor/guest" pages look much closer to "real" implementations because they seem to call `lib/api/*` functions. The Wizard is the main area of concern where it feels like a prototype.
