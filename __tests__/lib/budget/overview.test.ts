import { BudgetStore } from '@/lib/budget/store';

describe('Budget Overview and Breakdowns', () => {
  let store: BudgetStore;
  const weddingId = 'test-wedding-123';
  const eventId = 'test-event-456';

  beforeEach(async () => {
    store = new BudgetStore();
    
    // Initialize categories
    await store.getCategories(weddingId);
  });

  describe('Event Budget Summary', () => {
    it('should calculate event budget summary correctly', async () => {
      // Create budget items for the event
      await store.createLineItem(weddingId, {
        categoryId: (await store.getCategories(weddingId))[0].id, // venue
        eventId: eventId,
        name: 'Reception Hall',
        plannedAmount: 500000,
        actualAmount: 480000,
        currency: 'LKR'
      });

      await store.createLineItem(weddingId, {
        categoryId: (await store.getCategories(weddingId))[1].id, // catering
        eventId: eventId,
        name: 'Buffet Dinner',
        plannedAmount: 300000,
        actualAmount: 320000,
        currency: 'LKR'
      });

      await store.createLineItem(weddingId, {
        categoryId: (await store.getCategories(weddingId))[2].id, // decor
        eventId: eventId,
        name: 'Flowers',
        plannedAmount: 150000,
        currency: 'LKR'
        // no actual amount yet
      });

      const summary = await store.getEventBudgetSummary(weddingId, eventId);
      
      expect(summary.planned).toBe(950000); // 500k + 300k + 150k
      expect(summary.actual).toBe(800000);   // 480k + 320k + 0
      expect(summary.difference).toBe(-150000); // 800k - 950k
    });

    it('should handle events with no budget items', async () => {
      const summary = await store.getEventBudgetSummary(weddingId, 'non-existent-event');
      
      expect(summary.planned).toBe(0);
      expect(summary.actual).toBe(0);
      expect(summary.difference).toBe(0);
    });
  });

  describe('Budget Overview with Breakdowns', () => {
    beforeEach(async () => {
      const categories = await store.getCategories(weddingId);
      
      // Create items in different categories and events
      await store.createLineItem(weddingId, {
        categoryId: categories[0].id, // venue
        eventId: 'poruwa-event',
        name: 'Poruwa Setup',
        plannedAmount: 200000,
        actualAmount: 180000,
        currency: 'LKR'
      });

      await store.createLineItem(weddingId, {
        categoryId: categories[0].id, // venue
        eventId: 'reception-event',
        name: 'Reception Hall',
        plannedAmount: 500000,
        actualAmount: 480000,
        currency: 'LKR'
      });

      await store.createLineItem(weddingId, {
        categoryId: categories[1].id, // catering
        eventId: 'reception-event',
        name: 'Buffet Dinner',
        plannedAmount: 300000,
        actualAmount: 320000,
        currency: 'LKR'
      });

      await store.createLineItem(weddingId, {
        categoryId: categories[2].id, // decor
        name: 'General Decor',
        plannedAmount: 100000,
        actualAmount: 90000,
        currency: 'LKR'
      });
    });

    it('should provide correct budget overview with breakdowns', async () => {
      const overview = await store.getBudgetOverview(weddingId);
      
      expect(overview.currency).toBe('LKR');
      expect(overview.totals.planned).toBe(1100000); // 200k + 500k + 300k + 100k
      expect(overview.totals.actual).toBe(1070000);   // 180k + 480k + 320k + 90k
      
      // Check category breakdown
      expect(overview.byCategory).toHaveLength(3);
      const venueCategory = overview.byCategory.find(c => c.categoryName === 'Venue & Location');
      expect(venueCategory?.planned).toBe(700000); // 200k + 500k
      expect(venueCategory?.actual).toBe(660000);   // 180k + 480k
      
      // Check event breakdown
      expect(overview.byEvent).toHaveLength(3); // poruwa, reception, general
      const receptionEvent = overview.byEvent.find(e => e.eventName === 'Reception');
      expect(receptionEvent?.planned).toBe(800000); // 500k + 300k
      expect(receptionEvent?.actual).toBe(800000);   // 480k + 320k
    });
  });

  describe('Interactive Filtering', () => {
    beforeEach(async () => {
      const categories = await store.getCategories(weddingId);
      
      // Create items for testing filtering
      await store.createLineItem(weddingId, {
        categoryId: categories[0].id, // venue
        eventId: 'event-1',
        name: 'Venue Item 1',
        plannedAmount: 100000,
        actualAmount: 90000,
        currency: 'LKR'
      });

      await store.createLineItem(weddingId, {
        categoryId: categories[1].id, // catering
        eventId: 'event-1',
        name: 'Catering Item 1',
        plannedAmount: 50000,
        actualAmount: 55000,
        currency: 'LKR'
      });

      await store.createLineItem(weddingId, {
        categoryId: categories[0].id, // venue
        eventId: 'event-2',
        name: 'Venue Item 2',
        plannedAmount: 200000,
        currency: 'LKR'
      });
    });

    it('should filter line items by category', async () => {
      const categories = await store.getCategories(weddingId);
      const venueCategory = categories.find(c => c.key === 'venue');
      
      const filteredItems = await store.getLineItems(weddingId, {
        categoryId: venueCategory?.id
      });
      
      expect(filteredItems).toHaveLength(2);
      expect(filteredItems.every(item => item.category.key === 'venue')).toBe(true);
    });

    it('should filter line items by event', async () => {
      const filteredItems = await store.getLineItems(weddingId, {
        eventId: 'event-1'
      });
      
      expect(filteredItems).toHaveLength(2);
      expect(filteredItems.every(item => item.eventId === 'event-1')).toBe(true);
    });

    it('should combine multiple filters', async () => {
      const categories = await store.getCategories(weddingId);
      const venueCategory = categories.find(c => c.key === 'venue');
      
      const filteredItems = await store.getLineItems(weddingId, {
        categoryId: venueCategory?.id,
        eventId: 'event-1'
      });
      
      expect(filteredItems).toHaveLength(1);
      expect(filteredItems[0].name).toBe('Venue Item 1');
    });
  });
});