# Project Structure

## Organization Philosophy

**Feature-First & Modular**: The codebase is structured into self-contained feature modules (`wizard`, `checklist`, `vendors`) to allow multiple agents/developers to work independently without conflict.

## Directory Patterns

### Feature Routes
**Location**: `app/[feature]/`  
**Purpose**: Next.js App Router segments for specific features.  
**Example**: `app/wizard/`, `app/dashboard/`, `app/checklist/`

### Domain Components
**Location**: `components/[feature]/`  
**Purpose**: UI components specific to a business domain.  
**Example**: `components/budget/BudgetTracker.tsx`, `components/guests/GuestList.tsx`

### Shared Utilities
**Location**: `lib/`  
**Purpose**: Core logic, API wrappers, and types shared across features.  
**Example**: `lib/api/`, `lib/models/`, `lib/utils.ts`

### Documentation
**Location**: `docs/`  
**Purpose**: PRDs, Architecture decisions, and Design specs.  
**Example**: `docs/prd.md`, `docs/architecture.md`

## Naming Conventions

- **Files**: `kebab-case` (e.g., `event-card.tsx`, `today-tasks.tsx`)
- **Components**: `PascalCase` (e.g., `EventCard`, `TodayTasks`)
- **Functions/Variables**: `camelCase`
- **REST Endpoints**: `kebab-case` (plural nouns, e.g., `/api/events`)
- **DB Tables**: `snake_case` (plural, e.g., `checklist_items`)

## Import Organization

```typescript
// Prefer absolute imports with aliases
import { Button } from "@/components/ui/button"
import { getWedding } from "@/lib/api/wedding"
```

**Path Aliases**:
- `@/*`: Maps to the project root (usually `./` or `./src`).

## Code Organization Principles

- **Colocation**: Tests live alongside their source files (e.g., `file.test.tsx`).
- **Abstraction**: API clients wrapper (`lib/api`) isolate frontend from backend implementation details.
- **Consistency**: Every FR maps to a UI module, API surface, and persistence model.

---
_Document patterns, not file trees. New files following patterns shouldn't require updates_
