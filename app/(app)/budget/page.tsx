'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Plus, Calculator } from 'lucide-react';

interface BudgetCategory {
  id: string;
  name: string;
  key: string;
}

interface BudgetLineItem {
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

export default function BudgetPage() {
  const [categories, setCategories] = useState<BudgetCategory[]>([]);
  const [lineItems, setLineItems] = useState<BudgetLineItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddItem, setShowAddItem] = useState(false);
  const [newItem, setNewItem] = useState({
    name: '',
    categoryId: '',
    plannedAmount: '',
    actualAmount: '',
    currency: 'LKR',
    eventId: '',
    vendorId: '',
    description: '',
    notes: ''
  });

  // For now, use mock wedding ID - in real implementation would get from auth/session
  const weddingId = 'mock-wedding-id';

  useEffect(() => {
    fetchBudgetData();
  }, []);

  const fetchBudgetData = async () => {
    try {
      setLoading(true);
      
      // Fetch categories
      const categoriesRes = await fetch(`/api/weddings/${weddingId}/budget/categories`);
      const categoriesData = await categoriesRes.json();
      if (categoriesData.data) {
        setCategories(categoriesData.data.categories);
      }
      
      // Fetch line items
      const itemsRes = await fetch(`/api/weddings/${weddingId}/budget/line-items`);
      const itemsData = await itemsRes.json();
      if (itemsData.data) {
        setLineItems(itemsData.data.lineItems);
      }
    } catch (error) {
      console.error('Error fetching budget data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddItem = async () => {
    if (!newItem.name.trim() || !newItem.categoryId || !newItem.plannedAmount) return;
    
    try {
      const res = await fetch(`/api/weddings/${weddingId}/budget/line-items`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: newItem.name,
          categoryId: newItem.categoryId,
          plannedAmount: parseFloat(newItem.plannedAmount),
          actualAmount: newItem.actualAmount ? parseFloat(newItem.actualAmount) : undefined,
          currency: newItem.currency,
          eventId: newItem.eventId || undefined,
          vendorId: newItem.vendorId || undefined,
          description: newItem.description || undefined,
          notes: newItem.notes || undefined
        })
      });
      
      if (res.ok) {
        const data = await res.json();
        setLineItems([...lineItems, data.data]);
        setNewItem({
          name: '',
          categoryId: '',
          plannedAmount: '',
          actualAmount: '',
          currency: 'LKR',
          eventId: '',
          vendorId: '',
          description: '',
          notes: ''
        });
        setShowAddItem(false);
      }
    } catch (error) {
      console.error('Error adding budget item:', error);
    }
  };

  const formatCurrency = (amount: number, currency: string) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  const getDifferenceColor = (planned: number, actual: number) => {
    const difference = actual - planned;
    if (Math.abs(difference) < planned * 0.05) return 'text-gray-600';
    if (difference > 0) return 'text-red-600';
    return 'text-green-600';
  };

  // Calculate simple totals
  const totalPlanned = lineItems.reduce((sum, item) => sum + item.plannedAmount, 0);
  const totalActual = lineItems.reduce((sum, item) => sum + (item.actualAmount || 0), 0);

  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-muted-foreground">Loading budget data...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Budget</h1>
        <p className="text-muted-foreground">Track your wedding budget and expenses</p>
      </div>

      {/* Simple Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Total Planned</CardTitle>
            <CardDescription className="text-xs">Your budget plan</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(totalPlanned, 'LKR')}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Total Actual</CardTitle>
            <CardDescription className="text-xs">What you've spent</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(totalActual, 'LKR')}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Remaining</CardTitle>
            <CardDescription className="text-xs">Budget left</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(totalPlanned - totalActual, 'LKR')}
            </div>
            <div className={`text-sm mt-1 ${getDifferenceColor(totalPlanned, totalActual)}`}>
              {totalActual > totalPlanned ? 'Over budget' : 'On track'}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Budget Line Items Table */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Budget Line Items</CardTitle>
              <CardDescription>{lineItems.length} items</CardDescription>
            </div>
            <Dialog open={showAddItem} onOpenChange={setShowAddItem}>
              <DialogTrigger asChild>
                <Button size="sm">
                  <Plus className="h-4 w-4 mr-1" />
                  Add Item
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>Add Budget Item</DialogTitle>
                  <DialogDescription>Add a new budget line item</DialogDescription>
                </DialogHeader>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium">Item Name *</label>
                    <Input
                      value={newItem.name}
                      onChange={(e) => setNewItem({ ...newItem, name: e.target.value })}
                      placeholder="e.g., Reception venue, Catering"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium">Category *</label>
                    <select
                      className="w-full px-3 py-2 border rounded-md"
                      value={newItem.categoryId}
                      onChange={(e) => setNewItem({ ...newItem, categoryId: e.target.value })}
                    >
                      <option value="">Select category</option>
                      {categories.map((category) => (
                        <option key={category.id} value={category.id}>
                          {category.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="text-sm font-medium">Planned Amount *</label>
                    <Input
                      type="number"
                      value={newItem.plannedAmount}
                      onChange={(e) => setNewItem({ ...newItem, plannedAmount: e.target.value })}
                      placeholder="0"
                      min="0"
                      step="0.01"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium">Actual Amount</label>
                    <Input
                      type="number"
                      value={newItem.actualAmount}
                      onChange={(e) => setNewItem({ ...newItem, actualAmount: e.target.value })}
                      placeholder="0"
                      min="0"
                      step="0.01"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium">Currency</label>
                    <Input
                      value={newItem.currency}
                      onChange={(e) => setNewItem({ ...newItem, currency: e.target.value })}
                      placeholder="LKR"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium">Description</label>
                    <Input
                      value={newItem.description}
                      onChange={(e) => setNewItem({ ...newItem, description: e.target.value })}
                      placeholder="Optional description"
                    />
                  </div>
                  <div className="col-span-2">
                    <label className="text-sm font-medium">Notes</label>
                    <Input
                      value={newItem.notes}
                      onChange={(e) => setNewItem({ ...newItem, notes: e.target.value })}
                      placeholder="Optional notes"
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setShowAddItem(false)}>
                    Cancel
                  </Button>
                  <Button onClick={handleAddItem} disabled={!newItem.name.trim() || !newItem.categoryId || !newItem.plannedAmount}>
                    Add Item
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent>
          {lineItems.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Calculator className="h-12 w-12 mx-auto mb-2 opacity-50" />
              <p>No budget items yet</p>
              <p className="text-sm">Click "Add Item" to get started</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Item</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Event</TableHead>
                  <TableHead className="text-right">Planned</TableHead>
                  <TableHead className="text-right">Actual</TableHead>
                  <TableHead className="text-right">Difference</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {lineItems.map((item) => {
                  const difference = (item.actualAmount || 0) - item.plannedAmount;
                  
                  return (
                    <TableRow key={item.id}>
                      <TableCell>
                        <div>
                          <div className="font-medium">{item.name}</div>
                          {item.description && (
                            <div className="text-sm text-muted-foreground">{item.description}</div>
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
                      <TableCell className="text-right">
                        {formatCurrency(item.plannedAmount, item.currency)}
                      </TableCell>
                      <TableCell className="text-right">
                        {item.actualAmount !== undefined 
                          ? formatCurrency(item.actualAmount, item.currency)
                          : '-'
                        }
                      </TableCell>
                      <TableCell className={`text-right ${getDifferenceColor(item.plannedAmount, item.actualAmount || 0)}`}>
                        {item.actualAmount !== undefined 
                          ? formatCurrency(difference, item.currency)
                          : '-'
                        }
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
