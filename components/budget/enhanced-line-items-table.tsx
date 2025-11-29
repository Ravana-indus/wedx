import { useState, useEffect } from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';

import { Plus, Search, X } from 'lucide-react';

interface BudgetCategory {
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

interface Filters {
  eventId?: string;
  categoryId?: string;
  vendorId?: string;
  search?: string;
}

interface EnhancedLineItemsTableProps {
  lineItems: BudgetLineItemWithData[];
  categories: BudgetCategory[];
  events: Array<{ id: string; name: string }>;
  vendors: Array<{ id: string; name: string }>;
  filters: Filters;
  onFiltersChange: (filters: Filters) => void;
  onAddItem?: () => void;
  currency: string;
}

export function EnhancedLineItemsTable({
  lineItems,
  categories,
  events,
  vendors,
  filters,
  onFiltersChange,
  onAddItem,
  currency
}: EnhancedLineItemsTableProps) {
  const [localFilters, setLocalFilters] = useState<Filters>(filters);

  // Sync local filters with props
  useEffect(() => {
    setLocalFilters(filters);
  }, [filters]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency,
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  const getDifferenceColor = (planned: number, actual: number) => {
    const difference = (actual || 0) - planned;
    if (Math.abs(difference) < planned * 0.05) return 'text-gray-600';
    if (difference > 0) return 'text-red-600';
    return 'text-green-600';
  };

  const handleFilterChange = (key: keyof Filters, value: string | undefined) => {
    const newFilters = { ...localFilters, [key]: value };
    setLocalFilters(newFilters);
    onFiltersChange(newFilters);
  };

  const clearFilter = (key: keyof Filters) => {
    const newFilters = { ...localFilters };
    delete newFilters[key];
    setLocalFilters(newFilters);
    onFiltersChange(newFilters);
  };

  const clearAllFilters = () => {
    setLocalFilters({});
    onFiltersChange({});
  };

  const activeFiltersCount = Object.keys(localFilters).filter(key => 
    localFilters[key as keyof Filters] && localFilters[key as keyof Filters] !== ''
  ).length;

  const filteredLineItems = lineItems.filter(item => {
    if (localFilters.eventId && item.event?.id !== localFilters.eventId) return false;
    if (localFilters.categoryId && item.category.id !== localFilters.categoryId) return false;
    if (localFilters.vendorId && item.vendor?.id !== localFilters.vendorId) return false;
    if (localFilters.search) {
      const searchTerm = localFilters.search.toLowerCase();
      return (
        item.name.toLowerCase().includes(searchTerm) ||
        (item.description?.toLowerCase().includes(searchTerm) ?? false) ||
        (item.vendor?.name.toLowerCase().includes(searchTerm) ?? false)
      );
    }
    return true;
  });

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-lg">Budget Line Items</CardTitle>
            <CardDescription>
              {filteredLineItems.length} of {lineItems.length} items
              {activeFiltersCount > 0 && (
                <span className="ml-2">
                  (filtered by {activeFiltersCount} {activeFiltersCount === 1 ? 'criterion' : 'criteria'})
                </span>
              )}
            </CardDescription>
          </div>
          {onAddItem && (
            <Button onClick={onAddItem} size="sm">
              <Plus className="h-4 w-4 mr-1" />
              Add Item
            </Button>
          )}
        </div>

        {/* Filters */}
        <div className="space-y-4 pt-4">
          <div className="flex flex-col sm:flex-row gap-2 items-start sm:items-end">
            <div className="flex-1">
              <label className="text-sm font-medium mb-1 block">Search</label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search items, descriptions, or vendors..."
                  value={localFilters.search || ''}
                  onChange={(e) => handleFilterChange('search', e.target.value || undefined)}
                  className="pl-9"
                />
              </div>
            </div>
            
            <div className="w-full sm:w-48">
              <label className="text-sm font-medium mb-1 block">Event</label>
              <select
                className="w-full px-3 py-2 border rounded-md bg-background"
                value={localFilters.eventId || ''}
                onChange={(e) => handleFilterChange('eventId', e.target.value || undefined)}
              >
                <option value="">All events</option>
                {events.map((event) => (
                  <option key={event.id} value={event.id}>
                    {event.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="w-full sm:w-48">
              <label className="text-sm font-medium mb-1 block">Category</label>
              <select
                className="w-full px-3 py-2 border rounded-md bg-background"
                value={localFilters.categoryId || ''}
                onChange={(e) => handleFilterChange('categoryId', e.target.value || undefined)}
              >
                <option value="">All categories</option>
                {categories.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="w-full sm:w-48">
              <label className="text-sm font-medium mb-1 block">Vendor</label>
              <select
                className="w-full px-3 py-2 border rounded-md bg-background"
                value={localFilters.vendorId || ''}
                onChange={(e) => handleFilterChange('vendorId', e.target.value || undefined)}
              >
                <option value="">All vendors</option>
                {vendors.map((vendor) => (
                  <option key={vendor.id} value={vendor.id}>
                    {vendor.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Active filters */}
          {activeFiltersCount > 0 && (
            <div className="flex flex-wrap gap-2">
              <span className="text-sm text-muted-foreground">Active filters:</span>
              {localFilters.eventId && (
                <Badge variant="secondary" className="text-xs">
                  Event: {events.find(e => e.id === localFilters.eventId)?.name}
                  <button
                    onClick={() => clearFilter('eventId')}
                    className="ml-1 hover:bg-secondary/80 rounded-full p-0.5"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              )}
              {localFilters.categoryId && (
                <Badge variant="secondary" className="text-xs">
                  Category: {categories.find(c => c.id === localFilters.categoryId)?.name}
                  <button
                    onClick={() => clearFilter('categoryId')}
                    className="ml-1 hover:bg-secondary/80 rounded-full p-0.5"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              )}
              {localFilters.vendorId && (
                <Badge variant="secondary" className="text-xs">
                  Vendor: {vendors.find(v => v.id === localFilters.vendorId)?.name}
                  <button
                    onClick={() => clearFilter('vendorId')}
                    className="ml-1 hover:bg-secondary/80 rounded-full p-0.5"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              )}
              {localFilters.search && (
                <Badge variant="secondary" className="text-xs">
                  Search: "{localFilters.search}"
                  <button
                    onClick={() => clearFilter('search')}
                    className="ml-1 hover:bg-secondary/80 rounded-full p-0.5"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              )}
              <Button
                variant="ghost"
                size="sm"
                onClick={clearAllFilters}
                className="text-xs h-auto py-1"
              >
                Clear all
              </Button>
            </div>
          )}
        </div>
      </CardHeader>

      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Item</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Event</TableHead>
              <TableHead>Vendor</TableHead>
              <TableHead className="text-right">Planned</TableHead>
              <TableHead className="text-right">Actual</TableHead>
              <TableHead className="text-right">Difference</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredLineItems.map((item) => {
              const difference = (item.actualAmount || 0) - item.plannedAmount;
              
              return (
                <TableRow key={item.id}>
                  <TableCell>
                    <div>
                      <div className="font-medium">{item.name}</div>
                      {item.description && (
                        <div className="text-sm text-muted-foreground">{item.description}</div>
                      )}
                      {item.notes && (
                        <div className="text-xs text-muted-foreground mt-1">{item.notes}</div>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="secondary">{item.category.name}</Badge>
                  </TableCell>
                  <TableCell>
                    {item.event ? (
                      <Badge variant="outline">{item.event.name}</Badge>
                    ) : (
                      <span className="text-muted-foreground">General</span>
                    )}
                  </TableCell>
                  <TableCell>
                    {item.vendor ? (
                      <span className="text-sm">{item.vendor.name}</span>
                    ) : (
                      <span className="text-muted-foreground">-</span>
                    )}
                  </TableCell>
                  <TableCell className="text-right font-medium">
                    {formatCurrency(item.plannedAmount)}
                  </TableCell>
                  <TableCell className="text-right font-medium">
                    {item.actualAmount !== undefined 
                      ? formatCurrency(item.actualAmount)
                      : '-'
                    }
                  </TableCell>
                  <TableCell className={`text-right font-medium ${getDifferenceColor(item.plannedAmount, item.actualAmount || 0)}`}>
                    {item.actualAmount !== undefined 
                      ? `${difference >= 0 ? '+' : ''}${formatCurrency(difference)}`
                      : '-'
                    }
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
        
        {filteredLineItems.length === 0 && (
          <div className="text-center py-8 text-muted-foreground">
            {lineItems.length === 0 ? (
              <div>
                <p>No budget items yet</p>
                {onAddItem && (
                  <Button onClick={onAddItem} variant="outline" className="mt-2">
                    <Plus className="h-4 w-4 mr-1" />
                    Add your first item
                  </Button>
                )}
              </div>
            ) : (
              <div>
                <p>No items match your current filters</p>
                <Button onClick={clearAllFilters} variant="outline" className="mt-2">
                  Clear filters
                </Button>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}