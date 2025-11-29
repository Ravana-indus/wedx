import { GET } from '@/app/api/weddings/[id]/budget/categories/route';
import { NextRequest } from 'next/server';

// Mock the budget store
jest.mock('@/lib/budget/store', () => ({
  getBudgetCategoriesForWedding: jest.fn().mockResolvedValue([
    {
      id: 'cat-1',
      weddingId: 'test-wedding-123',
      key: 'venue',
      name: 'Venue',
      orderIndex: 1,
      createdAt: new Date('2024-01-01'),
      updatedAt: new Date('2024-01-01')
    },
    {
      id: 'cat-2',
      weddingId: 'test-wedding-123',
      key: 'catering',
      name: 'Catering',
      orderIndex: 2,
      createdAt: new Date('2024-01-01'),
      updatedAt: new Date('2024-01-01')
    }
  ])
}));

describe('Budget Categories API', () => {
  it('should return budget categories for a wedding', async () => {
    const request = new NextRequest('http://localhost:3000/api/weddings/test-wedding-123/budget/categories');
    const response = await GET(request, { params: { id: 'test-wedding-123' } });
    
    const data = await response.json();
    
    expect(response.status).toBe(200);
    expect(data.data).toBeDefined();
    expect(data.data.categories).toHaveLength(2);
    expect(data.data.categories[0]).toMatchObject({
      id: 'cat-1',
      name: 'Venue',
      key: 'venue'
    });
  });

  it('should handle errors gracefully', async () => {
    // Mock an error
    const { getBudgetCategoriesForWedding } = require('@/lib/budget/store');
    getBudgetCategoriesForWedding.mockRejectedValueOnce(new Error('Database error'));
    
    const request = new NextRequest('http://localhost:3000/api/weddings/test-wedding-123/budget/categories');
    const response = await GET(request, { params: { id: 'test-wedding-123' } });
    
    const data = await response.json();
    
    expect(response.status).toBe(500);
    expect(data.data.error).toBe('Failed to fetch budget categories');
  });
});