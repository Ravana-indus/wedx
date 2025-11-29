/**
 * Budget Category entity
 * Represents budget categories like Venue, Catering, Decor, etc.
 */
export interface BudgetCategory {
  id: string;
  weddingId: string;
  key: string;        // e.g. 'venue', 'catering', 'decor', 'photography'
  name: string;       // display name
  orderIndex: number;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Budget Line Item entity
 * Represents individual budget items linked to categories, events, and vendors
 */
export interface BudgetLineItem {
  id: string;
  weddingId: string;
  categoryId: string;
  eventId?: string;      // optional: which event this relates to
  vendorId?: string;     // optional: linked vendor
  name: string;          // e.g. 'Reception venue', 'Poruwa decor'
  description?: string;
  plannedAmount: number; // planned budget
  actualAmount?: number; // actual spend
  currency: string;      // e.g. 'LKR'
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Budget Category with populated data for API responses
 */
export interface BudgetCategoryWithData extends BudgetCategory {
  // Add any computed fields or relationships here
}

/**
 * Budget Line Item with populated category, event, and vendor data
 */
export interface BudgetLineItemWithData extends BudgetLineItem {
  category: BudgetCategory;
  event?: {
    id: string;
    name: string;
  };
  vendor?: {
    id: string;
    name: string;
  };
}

/**
 * API Response types
 */
export interface GetBudgetCategoriesResponse {
  categories: BudgetCategory[];
}

export interface GetBudgetLineItemsResponse {
  lineItems: BudgetLineItemWithData[];
}

export interface CreateBudgetLineItemRequest {
  categoryId: string;
  eventId?: string;
  vendorId?: string;
  name: string;
  description?: string;
  plannedAmount: number;
  actualAmount?: number;
  currency: string;
  notes?: string;
}

export interface UpdateBudgetLineItemRequest {
  categoryId?: string;
  eventId?: string;
  vendorId?: string;
  name?: string;
  description?: string;
  plannedAmount?: number;
  actualAmount?: number;
  currency?: string;
  notes?: string;
}

/**
 * Default budget categories to seed
 */
export const DEFAULT_BUDGET_CATEGORIES = [
  { key: 'venue', name: 'Venue', orderIndex: 1 },
  { key: 'catering', name: 'Catering', orderIndex: 2 },
  { key: 'decor-flowers', name: 'Decor & Flowers', orderIndex: 3 },
  { key: 'photography-videography', name: 'Photography & Videography', orderIndex: 4 },
  { key: 'music-entertainment', name: 'Music & Entertainment', orderIndex: 5 },
  { key: 'attire-jewelry', name: 'Attire & Jewelry', orderIndex: 6 },
  { key: 'invitations-stationery', name: 'Invitations & Stationery', orderIndex: 7 },
  { key: 'gifts-favors', name: 'Gifts & Favors', orderIndex: 8 },
  { key: 'transport', name: 'Transport', orderIndex: 9 },
  { key: 'other', name: 'Other', orderIndex: 10 },
];