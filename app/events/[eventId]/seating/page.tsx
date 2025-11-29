'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Plus, Users, AlertCircle } from 'lucide-react';

interface SeatingTable {
  id: string;
  name: string;
  capacity?: number;
  section?: string;
  notes?: string;
  assignedCount: number;
}

interface Guest {
  id: string;
  name: string;
  household?: { id: string; name: string };
  side?: 'bride' | 'groom' | 'both';
  invitation?: {
    status: string;
    dietary?: string;
  };
}

export default function SeatingPage() {
  const params = useParams();
  const eventId = params.eventId as string;
  
  const [tables, setTables] = useState<SeatingTable[]>([]);
  const [guests, setGuests] = useState<Guest[]>([]);
  const [assignments, setAssignments] = useState<Record<string, string>>({}); // guestId -> tableId
  const [selectedTable, setSelectedTable] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [showAddTable, setShowAddTable] = useState(false);
  const [newTable, setNewTable] = useState({ name: '', capacity: '', section: '', notes: '' });

  useEffect(() => {
    fetchSeatingData();
  }, [eventId]);

  const fetchSeatingData = async () => {
    try {
      setLoading(true);
      
      // Fetch tables
      const tablesRes = await fetch(`/api/events/${eventId}/seating-tables`);
      const tablesData = await tablesRes.json();
      if (tablesData.data) {
        setTables(tablesData.data.tables);
      }
      
      // Fetch guests
      const guestsRes = await fetch(`/api/events/${eventId}/attending-guests`);
      const guestsData = await guestsRes.json();
      if (guestsData.data) {
        setGuests(guestsData.data.guests);
      }
      
      // Fetch assignments
      const assignmentsRes = await fetch(`/api/events/${eventId}/seating-assignments`);
      const assignmentsData = await assignmentsRes.json();
      if (assignmentsData.data) {
        const assignmentMap: Record<string, string> = {};
        assignmentsData.data.assignments.forEach((assignment: any) => {
          assignmentMap[assignment.guest.id] = assignment.table.id;
        });
        setAssignments(assignmentMap);
      }
    } catch (error) {
      console.error('Error fetching seating data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddTable = async () => {
    if (!newTable.name.trim()) return;
    
    try {
      const res = await fetch(`/api/events/${eventId}/seating-tables`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: newTable.name,
          capacity: newTable.capacity ? parseInt(newTable.capacity) : undefined,
          section: newTable.section || undefined,
          notes: newTable.notes || undefined
        })
      });
      
      if (res.ok) {
        const data = await res.json();
        setTables([...tables, data.data]);
        setNewTable({ name: '', capacity: '', section: '', notes: '' });
        setShowAddTable(false);
      }
    } catch (error) {
      console.error('Error adding table:', error);
    }
  };

  const handleAssignGuest = async (guestId: string, tableId: string) => {
    try {
      const res = await fetch(`/api/events/${eventId}/seating-assignments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          assignments: [{ guestId, tableId }]
        })
      });
      
      if (res.ok) {
        setAssignments({ ...assignments, [guestId]: tableId });
      }
    } catch (error) {
      console.error('Error assigning guest:', error);
    }
  };

  const unassignedGuests = guests.filter(guest => !assignments[guest.id]);
  const assignedGuests = guests.filter(guest => assignments[guest.id]);
  const selectedTableGuests = selectedTable 
    ? assignedGuests.filter(guest => assignments[guest.id] === selectedTable)
    : [];

  const getCapacityStatus = (table: SeatingTable) => {
    if (!table.capacity) return null;
    const isOverCapacity = table.assignedCount > table.capacity;
    return {
      isOverCapacity,
      text: `${table.assignedCount}/${table.capacity}`
    };
  };

  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-muted-foreground">Loading seating data...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Seating Management</h1>
        <p className="text-muted-foreground">Manage tables and assign guests for this event</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Tables Panel */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Tables</CardTitle>
                <CardDescription>Manage seating tables and capacity</CardDescription>
              </div>
              <Dialog open={showAddTable} onOpenChange={setShowAddTable}>
                <DialogTrigger asChild>
                  <Button size="sm">
                    <Plus className="h-4 w-4 mr-1" />
                    Add Table
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Add New Table</DialogTitle>
                    <DialogDescription>Create a new seating table for this event</DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div>
                      <label htmlFor="table-name" className="text-sm font-medium">Table Name *</label>
                      <Input
                        id="table-name"
                        value={newTable.name}
                        onChange={(e) => setNewTable({ ...newTable, name: e.target.value })}
                        placeholder="e.g., Table 1, Family Table A"
                      />
                    </div>
                    <div>
                      <label htmlFor="table-capacity" className="text-sm font-medium">Capacity (optional)</label>
                      <Input
                        id="table-capacity"
                        type="number"
                        value={newTable.capacity}
                        onChange={(e) => setNewTable({ ...newTable, capacity: e.target.value })}
                        placeholder="Maximum number of guests"
                      />
                    </div>
                    <div>
                      <label htmlFor="table-section" className="text-sm font-medium">Section (optional)</label>
                      <Input
                        id="table-section"
                        value={newTable.section}
                        onChange={(e) => setNewTable({ ...newTable, section: e.target.value })}
                        placeholder="e.g., Front, Balcony, VIP"
                      />
                    </div>
                    <div>
                      <label htmlFor="table-notes" className="text-sm font-medium">Notes (optional)</label>
                      <Input
                        id="table-notes"
                        value={newTable.notes}
                        onChange={(e) => setNewTable({ ...newTable, notes: e.target.value })}
                        placeholder="Special requirements or notes"
                      />
                    </div>
                  </div>
                  <DialogFooter>
                    <Button variant="outline" onClick={() => setShowAddTable(false)}>
                      Cancel
                    </Button>
                    <Button onClick={handleAddTable} disabled={!newTable.name.trim()}>
                      Add Table
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {tables.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Users className="h-12 w-12 mx-auto mb-2 opacity-50" />
                  <p>No tables created yet</p>
                  <p className="text-sm">Click "Add Table" to get started</p>
                </div>
              ) : (
                tables.map((table) => {
                  const capacityStatus = getCapacityStatus(table);
                  return (
                    <div
                      key={table.id}
                      className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                        selectedTable === table.id ? 'border-primary bg-primary/5' : 'border-border hover:bg-accent'
                      }`}
                      onClick={() => setSelectedTable(table.id)}
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="font-medium">{table.name}</h4>
                          {table.section && (
                            <p className="text-sm text-muted-foreground">{table.section}</p>
                          )}
                        </div>
                        <div className="text-right">
                          {capacityStatus && (
                            <div className="flex items-center gap-1">
                              {capacityStatus.isOverCapacity && (
                                <AlertCircle className="h-4 w-4 text-destructive" />
                              )}
                              <span className={`px-2 py-1 rounded text-xs ${
                                capacityStatus.isOverCapacity ? 'bg-red-100 text-red-800' : 'bg-gray-100 text-gray-800'
                              }`}>
                                {capacityStatus.text}
                              </span>
                            </div>
                          )}
                          <p className="text-sm text-muted-foreground">
                            {table.assignedCount} assigned
                          </p>
                        </div>
                      </div>
                      {(table as any).notes && (
                        <p className="text-sm text-muted-foreground mt-1">{(table as any).notes}</p>
                      )}
                    </div>
                  );
                })
              )}
            </div>
          </CardContent>
        </Card>

        {/* Guests Panel */}
        <Card>
          <CardHeader>
            <CardTitle>Guests</CardTitle>
            <CardDescription>Assign guests to tables</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {/* Unassigned Guests */}
              <div>
                <h3 className="font-medium mb-2">Unassigned Guests ({unassignedGuests.length})</h3>
                <div className="space-y-2">
                  {unassignedGuests.length === 0 ? (
                    <p className="text-sm text-muted-foreground">All guests are assigned to tables</p>
                  ) : (
                    unassignedGuests.map((guest) => (
                      <div key={guest.id} className="flex items-center justify-between p-2 border rounded">
                        <div>
                          <p className="font-medium">{guest.name}</p>
                          {guest.household && (
                            <p className="text-sm text-muted-foreground">{guest.household.name}</p>
                          )}
                        </div>
                        <select
                          className="w-32 px-3 py-2 border rounded-md"
                          onChange={(e) => handleAssignGuest(guest.id, e.target.value)}
                          defaultValue=""
                        >
                          <option value="" disabled>Assign to...</option>
                          {tables.map((table) => (
                            <option key={table.id} value={table.id}>
                              {table.name}
                            </option>
                          ))}
                        </select>
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* Selected Table Guests */}
              {selectedTable && (
                <div>
                  <h3 className="font-medium mb-2">
                    {tables.find(t => t.id === selectedTable)?.name} Guests
                  </h3>
                  <div className="space-y-2">
                    {selectedTableGuests.length === 0 ? (
                      <p className="text-sm text-muted-foreground">No guests assigned to this table</p>
                    ) : (
                      selectedTableGuests.map((guest) => (
                        <div key={guest.id} className="flex items-center justify-between p-2 border rounded">
                          <div>
                            <p className="font-medium">{guest.name}</p>
                            {guest.household && (
                              <p className="text-sm text-muted-foreground">{guest.household.name}</p>
                            )}
                          </div>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleAssignGuest(guest.id, '')}
                          >
                            Remove
                          </Button>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}