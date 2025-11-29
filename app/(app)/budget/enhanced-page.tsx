'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { SummaryCards } from '@/components/budget/summary-cards';
import { PerEventBreakdown } from '@/components/budget/per-event-breakdown';
import { PerCategoryBreakdown } from '@/components/budget/per-category-breakdown';
import { EnhancedLineItemsTable } from '@/components/budget/enhanced-line-items-table';

interface BudgetCategory {
  id: string;
  name: string;
}

interface EventSummary {
  id: string;
  name: string;
}

interface VendorSummary {
  id: string;
  name: string;
}

interface BudgetLineItemWithData {
  id: string;
  name: string;
  description?: string;
  category: BudgetCategory;
  event?: { id: string; name: string };
  vendor?: { id: string; name: string };
  plannedAmount: number;
  actualAmount?: number;
  currency: string;
  notes?: string;
}

interface BudgetOverview {
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
}

interface Filters {
  eventId?: string;
  categoryId?: string;
  vendorId?: string;
  search?: string;
}

export default function EnhancedBudgetPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  const [overview, setOverview] = useState<BudgetOverview | null>(null);
  const [lineItems, setLineItems] = useState<BudgetLineItemWithData[]>([]);
  const [categories, setCategories] = useState<BudgetCategory[]>([]);
  const [events, setEvents] = useState<EventSummary[]>([]);
  const [vendors, setVendors] = useState<VendorSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Filter state
  const [filters, setFilters] = useState<Filters>({});
  const [showAddItem, setShowAddItem] = useState(false);

  // For now, use mock wedding ID - in real implementation would get from auth/session
  const weddingId = 'mock-wedding-id';

  // Load initial data and URL params
  useEffect(() => {
    loadInitialData();
  }, []);

  useEffect(() => {
    // Update filters from URL params
    const urlFilters: Filters = {};
    const eventId = searchParams.get('eventId');
    const categoryId = searchParams.get('categoryId');
    const vendorId = searchParams.get('vendorId');
    const search = searchParams.get('search');
    
    if (eventId) urlFilters.eventId = eventId;
    if (categoryId) urlFilters.categoryId = categoryId;
    if (vendorId) urlFilters.vendorId = vendorId;
    if (search) urlFilters.search = search;
    
    setFilters(urlFilters);
  }, [searchParams]);

  const loadInitialData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Load budget overview
      const overviewRes = await fetch(`/api/weddings/${weddingId}/budget/overview`);
      const overviewData = await overviewRes.json();
      if (overviewData.data) {
        setOverview(overviewData.data);
      }
      
      // Load categories
      const categoriesRes = await fetch(`/api/weddings/${weddingId}/budget/categories`);
      const categoriesData = await categoriesRes.json();
      if (categoriesData.data) {
        setCategories(categoriesData.data.categories);
      }
      
      // Load line items
      const itemsRes = await fetch(`/api/weddings/${weddingId}/budget/line-items`);
      const itemsData = await itemsRes.json();
      if (itemsData.data) {
        setLineItems(itemsData.data.lineItems);
      }
      
      // Mock events and vendors for now - would come from real APIs
      setEvents([
        { id: 'event-1', name: 'Poruwa Ceremony' },
        { id: 'event-2', name: 'Reception' },
        { id: 'event-3', name: 'Homecoming' }
      ]);
      
      setVendors([
        { id: 'vendor-1', name: 'Grand Hotel' },
        { id: 'vendor-2', name: 'Serendib Caterers' },
        { id: 'vendor-3', name: 'Bloom Decorations' }
      ]);
      
    } catch (error) {
      console.error('Error loading budget data:', error);
      setError('Failed to load budget data');
    } finally {
      setLoading(false);
    }
  };

  const updateURLParams = useCallback((newFilters: Filters) => {
    const params = new URLSearchParams();
    
    Object.entries(newFilters).forEach(([key, value]) => {
      if (value && value.trim()) {
        params.set(key, value);
      }
    });
    
    const url = params.toString() ? `/budget?${params.toString()}` : '/budget';
    router.replace(url);
  }, [router]);

  const handleFiltersChange = (newFilters: Filters) => {
    setFilters(newFilters);
    updateURLParams(newFilters);
  };

  const handleEventClick = (eventId: string | null) => {
    const newFilters = { ...filters };
    if (eventId) {
      newFilters.eventId = eventId;
    } else {
      delete newFilters.eventId;
    }
    handleFiltersChange(newFilters);
  };

  const handleCategoryClick = (categoryId: string) => {
    const newFilters = { ...filters };
    if (filters.categoryId === categoryId) {
      delete newFilters.categoryId;
    } else {
      newFilters.categoryId = categoryId;
    }
    handleFiltersChange(newFilters);
  };

  const handleAddItem = () => {
    setShowAddItem(true);
    // In real implementation, this would open a dialog or navigate to add item page
  };

  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-muted-foreground">Loading budget data...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-destructive">{error}</div>
        </div>
      </div>
    );
  }

  if (!overview) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-muted-foreground">No budget data available</div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">Budget Overview</h1>
        <p className="text-muted-foreground">
          Track your wedding budget across events and categories
        </p>
      </div>

      {/* Summary Cards */}
      <SummaryCards 
        totals={overview.totals} 
        currency={overview.currency}
      />

      {/* Breakdown Tables */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <PerEventBreakdown
          byEvent={overview.byEvent}
          onEventClick={handleEventClick}
          currency={overview.currency}
          activeEventId={filters.eventId}
        />
        
        <PerCategoryBreakdown
          byCategory={overview.byCategory}
          onCategoryClick={handleCategoryClick}
          currency={overview.currency}
          activeCategoryId={filters.categoryId}
        />
      </div>

      {/* Enhanced Line Items Table */}
      <EnhancedLineItemsTable
        lineItems={lineItems}
        categories={categories}
        events={events}
        vendors={vendors}
        filters={filters}
        onFiltersChange={handleFiltersChange}
        onAddItem={handleAddItem}
        currency={overview.currency}
      />
    </div>
  );
}