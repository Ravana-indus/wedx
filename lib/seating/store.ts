// Seating store for wedX - data access functions

import { 
  SeatingTable, 
  SeatingAssignment, 
  SeatingTableWithCount,
  SeatingAssignmentWithDetails,
  CreateSeatingTableRequest,
  UpdateSeatingTableRequest,
  UpsertSeatingAssignmentsRequest
} from './types';

// In-memory storage for now - will be replaced with database calls
const seatingTables = new Map<string, SeatingTable>();
const seatingAssignments = new Map<string, SeatingAssignment>();

// Helper function to generate IDs
function generateId(): string {
  return Math.random().toString(36).substring(2, 15);
}

// Seating Table operations
export async function getSeatingTablesForEvent(eventId: string): Promise<SeatingTableWithCount[]> {
  const tables = Array.from(seatingTables.values())
    .filter(table => table.eventId === eventId);
  
  return tables.map(table => ({
    ...table,
    assignedCount: getAssignedCountForTable(table.id)
  }));
}

export async function getSeatingTableById(tableId: string): Promise<SeatingTable | null> {
  return seatingTables.get(tableId) || null;
}

export async function createSeatingTable(
  weddingId: string,
  eventId: string, 
  data: CreateSeatingTableRequest
): Promise<SeatingTable> {
  const table: SeatingTable = {
    id: generateId(),
    weddingId,
    eventId,
    name: data.name,
    capacity: data.capacity,
    section: data.section,
    notes: data.notes,
    createdAt: new Date(),
    updatedAt: new Date()
  };
  
  seatingTables.set(table.id, table);
  return table;
}

export async function updateSeatingTable(
  tableId: string,
  data: UpdateSeatingTableRequest
): Promise<SeatingTable | null> {
  const table = seatingTables.get(tableId);
  if (!table) return null;
  
  const updatedTable: SeatingTable = {
    ...table,
    ...data,
    updatedAt: new Date()
  };
  
  seatingTables.set(tableId, updatedTable);
  return updatedTable;
}

export async function deleteSeatingTable(tableId: string): Promise<boolean> {
  // Delete all assignments for this table first
  const assignments = Array.from(seatingAssignments.values())
    .filter(assignment => assignment.tableId === tableId);
  
  assignments.forEach(assignment => {
    seatingAssignments.delete(assignment.id);
  });
  
  return seatingTables.delete(tableId);
}

// Seating Assignment operations
export async function getSeatingAssignmentsForEvent(eventId: string): Promise<SeatingAssignmentWithDetails[]> {
  const assignments = Array.from(seatingAssignments.values())
    .filter(assignment => assignment.eventId === eventId);
  
  // For now, return basic structure - in real implementation would join with guest data
  return assignments.map(assignment => ({
    ...assignment,
    guest: {
      id: assignment.guestId,
      name: `Guest ${assignment.guestId.substring(0, 8)}`, // Placeholder
      household: undefined,
      side: undefined
    },
    table: {
      id: assignment.tableId,
      name: seatingTables.get(assignment.tableId)?.name || 'Unknown Table',
      capacity: seatingTables.get(assignment.tableId)?.capacity
    }
  }));
}

export async function getSeatingAssignmentById(assignmentId: string): Promise<SeatingAssignment | null> {
  return seatingAssignments.get(assignmentId) || null;
}

export async function getSeatingAssignmentsForGuest(eventId: string, guestId: string): Promise<SeatingAssignment[]> {
  return Array.from(seatingAssignments.values())
    .filter(assignment => assignment.eventId === eventId && assignment.guestId === guestId);
}

export async function upsertSeatingAssignments(
  weddingId: string,
  eventId: string,
  data: UpsertSeatingAssignmentsRequest
): Promise<SeatingAssignment[]> {
  const results: SeatingAssignment[] = [];
  
  for (const assignmentData of data.assignments) {
    // Check if assignment already exists for this guest
    const existingAssignments = await getSeatingAssignmentsForGuest(eventId, assignmentData.guestId);
    
    if (existingAssignments.length > 0) {
      // Update existing assignment
      const existing = existingAssignments[0];
      const updated: SeatingAssignment = {
        ...existing,
        tableId: assignmentData.tableId,
        notes: assignmentData.notes,
        updatedAt: new Date()
      };
      seatingAssignments.set(existing.id, updated);
      results.push(updated);
    } else {
      // Create new assignment
      const newAssignment: SeatingAssignment = {
        id: generateId(),
        weddingId,
        eventId,
        tableId: assignmentData.tableId,
        guestId: assignmentData.guestId,
        notes: assignmentData.notes,
        createdAt: new Date(),
        updatedAt: new Date()
      };
      seatingAssignments.set(newAssignment.id, newAssignment);
      results.push(newAssignment);
    }
  }
  
  return results;
}

export async function deleteSeatingAssignment(assignmentId: string): Promise<boolean> {
  return seatingAssignments.delete(assignmentId);
}

// Helper functions
function getAssignedCountForTable(tableId: string): number {
  return Array.from(seatingAssignments.values())
    .filter(assignment => assignment.tableId === tableId).length;
}

export async function getAssignedCountForTables(tableIds: string[]): Promise<Map<string, number>> {
  const counts = new Map<string, number>();
  
  tableIds.forEach(tableId => {
    counts.set(tableId, getAssignedCountForTable(tableId));
  });
  
  return counts;
}

// Validation functions
export async function validateTableCapacity(tableId: string, newAssignmentCount: number): Promise<{ valid: boolean; message?: string }> {
  const table = seatingTables.get(tableId);
  if (!table) {
    return { valid: false, message: 'Table not found' };
  }
  
  if (table.capacity && newAssignmentCount > table.capacity) {
    return { 
      valid: false, 
      message: `Table "${table.name}" capacity (${table.capacity}) would be exceeded` 
    };
  }
  
  return { valid: true };
}