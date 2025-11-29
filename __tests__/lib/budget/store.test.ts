import { 
  BudgetStore,
  initializeBudgetCategories,
  getBudgetCategoriesForWedding,
  createBudgetLineItem,
  updateBudgetLineItem,
  deleteBudgetLineItem,
  getBudgetOverview
} from '@/lib/budget/store';
import { BudgetCategory, BudgetLineItem } from '@/lib/budget/types';

describe('Budget Store', () => {
  const testWeddingId = 'test-wedding-123';
  let testCategory: BudgetCategory;
  let testLineItem: BudgetLineItem;
  let budgetStore: BudgetStore;

  beforeEach(() => {
    budgetStore = new BudgetStore();
  });

  describe('Budget Categories', () => {
    it('should initialize default budget categories for a wedding', async () => {
      const categories = await initializeBudgetCategories(testWeddingId);
      
      expect(categories).toHaveLength(10); // 10 default categories
      expect(categories[0]).toMatchObject({
        weddingId: testWeddingId,
        key: 'venue',
        name: 'Venue',
        orderIndex: 1
      });
    });

    it('should get budget categories for a wedding', async () => {
      const categories = await getBudgetCategoriesForWedding(testWeddingId);
      
      expect(categories).toBeInstanceOf(Array);
      expect(categories.length).toBeGreaterThan(0);
      expect(categories[0]).toHaveProperty('id');
      expect(categories[0]).toHaveProperty('name');
      expect(categories[0]).toHaveProperty('key');
    });

    it('should return existing categories if already initialized', async () => {
      const categories1 = await getBudgetCategoriesForWedding(testWeddingId);
      const categories2 = await getBudgetCategoriesForWedding(testWeddingId);
      
      expect(categories1).toEqual(categories2);
    });
  });

  describe('Budget Line Items', () => {
    beforeEach(async () => {
      // Initialize categories first
      const categories = await initializeBudgetCategories(testWeddingId);
      testCategory = categories[0]; // Use first category
    });

    it('should create a budget line item', async () => {
      const lineItem = await createBudgetLineItem(testWeddingId, {
        categoryId: testCategory.id,
        name: 'Reception Venue',
        plannedAmount: 500000,
        currency: 'LKR',
        description: 'Main reception hall'
      });

      expect(lineItem).toMatchObject({
        weddingId: testWeddingId,
        categoryId: testCategory.id,
        name: 'Reception Venue',
        plannedAmount: 500000,
        currency: 'LKR',
        description: 'Main reception hall'
      });
      expect(lineItem.id).toBeDefined();
      expect(lineItem.createdAt).toBeInstanceOf(Date);
      testLineItem = lineItem;
    });

    it('should create a budget line item with optional fields', async () => {
      const lineItem = await createBudgetLineItem(testWeddingId, {
        categoryId: testCategory.id,
        name: 'Catering Service',
        plannedAmount: 300000,
        actualAmount: 280000,
        currency: 'LKR',
        eventId: 'event-123',
        vendorId: 'vendor-456',
        notes: 'Includes service charge'
      });

      expect(lineItem).toMatchObject({
        weddingId: testWeddingId,
        categoryId: testCategory.id,
        name: 'Catering Service',
        plannedAmount: 300000,
        actualAmount: 280000,
        currency: 'LKR',
        eventId: 'event-123',
        vendorId: 'vendor-456',
        notes: 'Includes service charge'
      });
    });

    it('should throw error if category does not exist', async () => {
      await expect(
        createBudgetLineItem(testWeddingId, {
          categoryId: 'non-existent-category',
          name: 'Test Item',
          plannedAmount: 100000,
          currency: 'LKR'
        })
      ).rejects.toThrow('Budget category not found');
    });

    it('should update a budget line item', async () => {
      const lineItem = await createBudgetLineItem(testWeddingId, {
        categoryId: testCategory.id,
        name: 'Original Name',
        plannedAmount: 100000,
        currency: 'LKR'
      });

      const updated = await updateBudgetLineItem(lineItem.id, {
        name: 'Updated Name',
        actualAmount: 95000,
        notes: 'Updated notes'
      });

      expect(updated).toMatchObject({
        id: lineItem.id,
        name: 'Updated Name',
        actualAmount: 95000,
        notes: 'Updated notes'
      });
    });

    it('should return null when updating non-existent line item', async () => {
      const updated = await updateBudgetLineItem('non-existent-id', {
        name: 'Updated Name'
      });

      expect(updated).toBeNull();
    });

    it('should delete a budget line item', async () => {
      const lineItem = await createBudgetLineItem(testWeddingId, {
        categoryId: testCategory.id,
        name: 'To be deleted',
        plannedAmount: 50000,
        currency: 'LKR'
      });

      const deleted = await deleteBudgetLineItem(lineItem.id);
      expect(deleted).toBe(true);

      // Verify it's actually deleted
      const remainingItems = await budgetStore.getLineItems(testWeddingId);
      expect(remainingItems.find(item => item.id === lineItem.id)).toBeUndefined();
    });

    it('should return false when deleting non-existent line item', async () => {
      const deleted = await deleteBudgetLineItem('non-existent-id');
      expect(deleted).toBe(false);
    });
  });

  describe('Budget Store Class', () => {
    beforeEach(async () => {
      // Initialize categories
      await initializeBudgetCategories(testWeddingId);
    });

    it('should get categories using BudgetStore', async () => {
      const categories = await budgetStore.getCategories(testWeddingId);
      expect(categories).toBeInstanceOf(Array);
      expect(categories.length).toBeGreaterThan(0);
    });

    it('should create line item with details using BudgetStore', async () => {
      const categories = await budgetStore.getCategories(testWeddingId);
      const lineItem = await budgetStore.createLineItem(testWeddingId, {
        categoryId: categories[0].id,
        name: 'Store Test Item',
        plannedAmount: 200000,
        currency: 'LKR'
      });

      expect(lineItem).toHaveProperty('category');
      expect(lineItem.category).toMatchObject(categories[0]);
    });

    it('should get filtered line items using BudgetStore', async () => {
      const categories = await budgetStore.getCategories(testWeddingId);
      
      // Create multiple items
      await budgetStore.createLineItem(testWeddingId, {
        categoryId: categories[0].id,
        name: 'Item 1',
        plannedAmount: 100000,
        currency: 'LKR'
      });

      await budgetStore.createLineItem(testWeddingId, {
        categoryId: categories[1].id,
        name: 'Item 2',
        plannedAmount: 150000,
        currency: 'LKR'
      });

      // Filter by category
      const filteredItems = await budgetStore.getLineItems(testWeddingId, {
        categoryId: categories[0].id
      });

      expect(filteredItems).toHaveLength(1);
      expect(filteredItems[0].name).toBe('Item 1');
    });

    it('should update line item using BudgetStore', async () => {
      const categories = await budgetStore.getCategories(testWeddingId);
      const lineItem = await budgetStore.createLineItem(testWeddingId, {
        categoryId: categories[0].id,
        name: 'Original Name',
        plannedAmount: 100000,
        currency: 'LKR'
      });

      const updated = await budgetStore.updateLineItem(lineItem.id, {
        name: 'Updated via Store',
        actualAmount: 90000
      });

      expect(updated.name).toBe('Updated via Store');
      expect(updated.actualAmount).toBe(90000);
    });

    it('should delete line item using BudgetStore', async () => {
      const categories = await budgetStore.getCategories(testWeddingId);
      const lineItem = await budgetStore.createLineItem(testWeddingId, {
        categoryId: categories[0].id,
        name: 'To be deleted via Store',
        plannedAmount: 75000,
        currency: 'LKR'
      });

      await budgetStore.deleteLineItem(lineItem.id);
      
      const items = await budgetStore.getLineItems(testWeddingId);
      expect(items.find(item => item.id === lineItem.id)).toBeUndefined();
    });
  });

  describe('Budget Overview', () => {
    beforeEach(async () => {
      // Initialize categories
      const categories = await initializeBudgetCategories(testWeddingId);
      
      // Create some test line items
      await createBudgetLineItem(testWeddingId, {
        categoryId: categories[0].id, // Venue
        name: 'Reception Hall',
        plannedAmount: 500000,
        actualAmount: 480000,
        currency: 'LKR'
      });

      await createBudgetLineItem(testWeddingId, {
        categoryId: categories[1].id, // Catering
        name: 'Catering Service',
        plannedAmount: 300000,
        actualAmount: 320000,
        currency: 'LKR'
      });

      await createBudgetLineItem(testWeddingId, {
        categoryId: categories[2].id, // Decor
        name: 'Flower Arrangements',
        plannedAmount: 150000,
        currency: 'LKR'
      });
    });

    it('should calculate budget overview correctly', async () => {
      const overview = await getBudgetOverview(testWeddingId);

      expect(overview.currency).toBe('LKR');
      expect(overview.totals.planned).toBe(950000); // 500k + 300k + 150k
      expect(overview.totals.actual).toBe(800000);   // 480k + 320k + 0
      expect(overview.byCategory).toHaveLength(3);
      expect(overview.byEvent).toHaveLength(1); // All items are general (no event)
    });

    it('should calculate budget overview using BudgetStore', async () => {
      const overview = await budgetStore.getBudgetOverview(testWeddingId);

      expect(overview.currency).toBe('LKR');
      expect(overview.totals.planned).toBe(950000);
      expect(overview.totals.actual).toBe(800000);
    });

    it('should handle empty budget overview', async () => {
      const emptyWeddingId = 'empty-wedding-123';
      const overview = await getBudgetOverview(emptyWeddingId);

      expect(overview.currency).toBe('LKR');
      expect(overview.totals.planned).toBe(0);
      expect(overview.totals.actual).toBe(0);
      expect(overview.byCategory).toEqual([]);
      expect(overview.byEvent).toEqual([]);
    });
  });

  describe('Event Budget Summary', () => {
    beforeEach(async () => {
      // Initialize categories
      const categories = await initializeBudgetCategories(testWeddingId);
      
      // Create event-specific line items
      await createBudgetLineItem(testWeddingId, {
        categoryId: categories[0].id,
        name: 'Event Venue',
        plannedAmount: 200000,
        actualAmount: 190000,
        currency: 'LKR',
        eventId: 'event-123'
      });

      await createBudgetLineItem(testWeddingId, {
        categoryId: categories[1].id,
        name: 'Event Catering',
        plannedAmount: 100000,
        currency: 'LKR',
        eventId: 'event-123'
      });
    });

    it('should calculate event budget summary', async () => {
      const summary = await budgetStore.getEventBudgetSummary(testWeddingId, 'event-123');

      expect(summary.planned).toBe(300000); // 200k + 100k
      expect(summary.actual).toBe(190000);   // 190k + 0
      expect(summary.difference).toBe(-110000);
      expect(summary.currency).toBe('LKR');
    });
  });
});