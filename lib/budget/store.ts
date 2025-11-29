// Budget store for wedX - data access functions

import { 
  BudgetCategory,
  BudgetLineItem,
  BudgetLineItemWithData,
  DEFAULT_BUDGET_CATEGORIES
} from './types';

// In-memory storage for now - will be replaced with database calls
const budgetCategories = new Map<string, BudgetCategory>();
const budgetLineItems = new Map<string, BudgetLineItem>();

// Helper function to generate IDs
function generateId(): string {
  return Math.random().toString(36).substring(2, 15);
}

// Initialize default budget categories for a wedding
export async function initializeBudgetCategories(weddingId: string): Promise<BudgetCategory[]> {
  const categories: BudgetCategory[] = [];
  
  for (const categoryData of DEFAULT_BUDGET_CATEGORIES) {
    const category: BudgetCategory = {
      id: generateId(),
      weddingId,
      key: categoryData.key,
      name: categoryData.name,
      orderIndex: categoryData.orderIndex,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    budgetCategories.set(category.id, category);
    categories.push(category);
  }
  
  return categories;
}

// Budget Category operations
export async function getBudgetCategoriesForWedding(weddingId: string): Promise<BudgetCategory[]> {
  const categories = Array.from(budgetCategories.values())
    .filter(category => category.weddingId === weddingId)
    .sort((a, b) => a.orderIndex - b.orderIndex);
  
  // If no categories exist, initialize them
  if (categories.length === 0) {
    return initializeBudgetCategories(weddingId);
  }
  
  return categories;
}

export async function getBudgetCategoryById(categoryId: string): Promise<BudgetCategory | null> {
  return budgetCategories.get(categoryId) || null;
}

// Budget Line Item operations
export async function getBudgetLineItemsForWedding(weddingId: string): Promise<BudgetLineItemWithData[]> {
  const items = Array.from(budgetLineItems.values())
    .filter(item => item.weddingId === weddingId);
  
  // For now, return basic structure - in real implementation would join with category data
  return items.map(item => ({
    ...item,
    category: budgetCategories.get(item.categoryId) || {
      id: item.categoryId,
      weddingId,
      key: 'unknown',
      name: 'Unknown Category',
      orderIndex: 999,
      createdAt: new Date(),
      updatedAt: new Date()
    },
    event: undefined, // Would be populated from event store in real implementation
    vendor: undefined // Would be populated from vendor store in real implementation
  }));
}

export async function getBudgetLineItemsByEvent(weddingId: string, eventId: string): Promise<BudgetLineItemWithData[]> {
  const items = Array.from(budgetLineItems.values())
    .filter(item => item.weddingId === weddingId && item.eventId === eventId);
  
  return items.map(item => ({
    ...item,
    category: budgetCategories.get(item.categoryId) || {
      id: item.categoryId,
      weddingId,
      key: 'unknown',
      name: 'Unknown Category',
      orderIndex: 999,
      createdAt: new Date(),
      updatedAt: new Date()
    },
    event: undefined,
    vendor: undefined
  }));
}

export async function getBudgetLineItemsByCategory(weddingId: string, categoryId: string): Promise<BudgetLineItemWithData[]> {
  const items = Array.from(budgetLineItems.values())
    .filter(item => item.weddingId === weddingId && item.categoryId === categoryId);
  
  return items.map(item => ({
    ...item,
    category: budgetCategories.get(item.categoryId) || {
      id: item.categoryId,
      weddingId,
      key: 'unknown',
      name: 'Unknown Category',
      orderIndex: 999,
      createdAt: new Date(),
      updatedAt: new Date()
    },
    event: undefined,
    vendor: undefined
  }));
}

export async function getBudgetLineItemById(lineItemId: string): Promise<BudgetLineItem | null> {
  return budgetLineItems.get(lineItemId) || null;
}
export async function getBudgetLineItemWithDetails(lineItemId: string): Promise<BudgetLineItemWithData | null> {
  const lineItem = budgetLineItems.get(lineItemId);
  if (!lineItem) return null;

  const category = await getBudgetCategoryById(lineItem.categoryId);
  if (!category) return null;

  return {
    ...lineItem,
    category,
    event: undefined,
    vendor: undefined
  };
}

export async function createBudgetLineItem(
  weddingId: string,
  data: {
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
): Promise<BudgetLineItem> {
  // Validate category exists
  const category = await getBudgetCategoryById(data.categoryId);
  if (!category) {
    throw new Error('Budget category not found');
  }

  const lineItem: BudgetLineItem = {
    id: generateId(),
    weddingId,
    categoryId: data.categoryId,
    eventId: data.eventId,
    vendorId: data.vendorId,
    name: data.name,
    description: data.description,
    plannedAmount: data.plannedAmount,
    actualAmount: data.actualAmount,
    currency: data.currency,
    notes: data.notes,
    createdAt: new Date(),
    updatedAt: new Date()
  };
  
  budgetLineItems.set(lineItem.id, lineItem);
  return lineItem;
}

export async function updateBudgetLineItem(
  lineItemId: string,
  data: {
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
): Promise<BudgetLineItem | null> {
  const lineItem = budgetLineItems.get(lineItemId);
  if (!lineItem) return null;
  
  // Validate new category if provided
  if (data.categoryId) {
    const category = await getBudgetCategoryById(data.categoryId);
    if (!category) {
      throw new Error('Budget category not found');
    }
  }
  
  const updatedLineItem: BudgetLineItem = {
    ...lineItem,
    ...data,
    updatedAt: new Date()
  };
  
  budgetLineItems.set(lineItemId, updatedLineItem);
  return updatedLineItem;
}

export async function deleteBudgetLineItem(lineItemId: string): Promise<boolean> {
  return budgetLineItems.delete(lineItemId);
}

// Budget aggregation functions
export async function getBudgetOverview(weddingId: string): Promise<{
  currency: string;
  totals: { planned: number; actual: number };
  byCategory: Array<{ categoryId: string; categoryName: string; planned: number; actual: number }>;
  byEvent: Array<{ eventId: string | null; eventName: string; planned: number; actual: number }>;
}> {
  const lineItems = await getBudgetLineItemsForWedding(weddingId);
  
  if (lineItems.length === 0) {
    return {
      currency: 'LKR', // Default currency
      totals: { planned: 0, actual: 0 },
      byCategory: [],
      byEvent: []
    };
  }
  
  // Determine currency (use first item's currency or default)
  const currency = lineItems[0]?.currency || 'LKR';
  
  // Calculate totals
  const totals = {
    planned: lineItems.reduce((sum, item) => sum + item.plannedAmount, 0),
    actual: lineItems.reduce((sum, item) => sum + (item.actualAmount || 0), 0)
  };
  
  // Group by category
  const byCategoryMap = new Map<string, { categoryId: string; categoryName: string; planned: number; actual: number }>();
  
  lineItems.forEach(item => {
    const categoryKey = item.category.id;
    const existing = byCategoryMap.get(categoryKey);
    
    if (existing) {
      existing.planned += item.plannedAmount;
      existing.actual += (item.actualAmount || 0);
    } else {
      byCategoryMap.set(categoryKey, {
        categoryId: item.category.id,
        categoryName: item.category.name,
        planned: item.plannedAmount,
        actual: item.actualAmount || 0
      });
    }
  });
  
  const byCategory = Array.from(byCategoryMap.values())
    .sort((a, b) => a.categoryName.localeCompare(b.categoryName));
  
  // Group by event
  const byEventMap = new Map<string | null, { eventId: string | null; eventName: string; planned: number; actual: number }>();
  
  lineItems.forEach(item => {
    const eventKey = item.eventId || null;
    const eventName = item.event?.name || 'General / Not event-specific';
    const existing = byEventMap.get(eventKey);
    
    if (existing) {
      existing.planned += item.plannedAmount;
      existing.actual += (item.actualAmount || 0);
    } else {
      byEventMap.set(eventKey, {
        eventId: eventKey,
        eventName: eventName,
        planned: item.plannedAmount,
        actual: item.actualAmount || 0
      });
    }
  });
  
  const byEvent = Array.from(byEventMap.values())
    .sort((a, b) => a.eventName.localeCompare(b.eventName));
  
  return {
    currency,
    totals,
    byCategory,
    byEvent
  };
}

// Helper function to get budget summary for a specific event
export async function getEventBudgetSummary(weddingId: string, eventId: string): Promise<{
  planned: number;
  actual: number;
  difference: number;
}> {
  const lineItems = await getBudgetLineItemsByEvent(weddingId, eventId);
  
  const planned = lineItems.reduce((sum, item) => sum + item.plannedAmount, 0);
  const actual = lineItems.reduce((sum, item) => sum + (item.actualAmount || 0), 0);
  
  return {
    planned,
    actual,
    difference: actual - planned
  };
}

// BudgetStore class for easier testing and usage
export class BudgetStore {
  async getCategories(weddingId: string): Promise<BudgetCategory[]> {
    return getBudgetCategoriesForWedding(weddingId);
  }

  async createLineItem(weddingId: string, data: {
    categoryId: string;
    eventId?: string;
    vendorId?: string;
    name: string;
    description?: string;
    plannedAmount: number;
    actualAmount?: number;
    currency: string;
    notes?: string;
  }): Promise<BudgetLineItemWithData> {
    const item = await createBudgetLineItem(weddingId, data);
    const details = await getBudgetLineItemWithDetails(item.id);
    if (!details) {
      throw new Error('Failed to create line item with details');
    }
    return details;
  }

  async getLineItems(weddingId: string, filters?: {
    categoryId?: string;
    eventId?: string;
    vendorId?: string;
  }): Promise<BudgetLineItemWithData[]> {
    // Get all line items and filter them
    const allItems = await getBudgetLineItemsForWedding(weddingId);
    if (!filters) return allItems;
    
    return allItems.filter((item: BudgetLineItemWithData) => {
      if (filters.categoryId && item.categoryId !== filters.categoryId) return false;
      if (filters.eventId && item.eventId !== filters.eventId) return false;
      if (filters.vendorId && item.vendorId !== filters.vendorId) return false;
      return true;
    });
  }

  async updateLineItem(lineItemId: string, data: {
    categoryId?: string;
    eventId?: string;
    vendorId?: string;
    name?: string;
    description?: string;
    plannedAmount?: number;
    actualAmount?: number;
    currency?: string;
    notes?: string;
  }): Promise<BudgetLineItemWithData> {
    await updateBudgetLineItem(lineItemId, data);
    const updated = await getBudgetLineItemWithDetails(lineItemId);
    if (!updated) {
      throw new Error('Line item not found after update');
    }
    return updated;
  }

  async deleteLineItem(lineItemId: string): Promise<void> {
    await deleteBudgetLineItem(lineItemId);
  }

  async getEventBudgetSummary(weddingId: string, eventId: string): Promise<{
    planned: number;
    actual: number;
    difference: number;
    currency: string;
  }> {
    const summary = await getEventBudgetSummary(weddingId, eventId);
    return {
      ...summary,
      currency: 'LKR' // Default currency for now
    };
  }

  async getBudgetOverview(weddingId: string): Promise<{
    currency: string;
    totals: {
      planned: number;
      actual: number;
    };
    byCategory: Array<{
      categoryId: string;
      categoryName: string;
      planned: number;
      actual: number;
    }>;
    byEvent: Array<{
      eventId: string | null;
      eventName: string;
      planned: number;
      actual: number;
    }>;
  }> {
    return getBudgetOverview(weddingId);
  }
}