import {
  createSeatingTable,
  getSeatingTablesForEvent,
  updateSeatingTable,
  deleteSeatingTable,
  upsertSeatingAssignments,
  getSeatingAssignmentsForEvent,
  validateTableCapacity
} from '@/lib/seating/store';
import { CreateSeatingTableRequest } from '@/lib/seating/types';

describe('Seating Store', () => {
  const weddingId = 'test-wedding-1';
  const eventId = 'test-event-1';
  
  beforeEach(() => {
    // Clear any existing data
    // Note: In real implementation, this would clear the database
  });

  describe('Seating Tables', () => {
    it('should create a seating table', async () => {
      const data: CreateSeatingTableRequest = {
        name: 'Table 1',
        capacity: 8,
        section: 'Front',
        notes: 'VIP table'
      };

      const table = await createSeatingTable(weddingId, eventId, data);
      
      expect(table).toBeDefined();
      expect(table.name).toBe('Table 1');
      expect(table.capacity).toBe(8);
      expect(table.section).toBe('Front');
      expect(table.notes).toBe('VIP table');
      expect(table.weddingId).toBe(weddingId);
      expect(table.eventId).toBe(eventId);
    });

    it('should get seating tables for an event', async () => {
      // Create multiple tables
      await createSeatingTable(weddingId, eventId, { name: 'Table 1', capacity: 8 });
      await createSeatingTable(weddingId, eventId, { name: 'Table 2', capacity: 10 });
      
      const tables = await getSeatingTablesForEvent(eventId);
      
      expect(tables).toHaveLength(2);
      expect(tables[0].assignedCount).toBe(0);
      expect(tables[1].assignedCount).toBe(0);
    });

    it('should update a seating table', async () => {
      const table = await createSeatingTable(weddingId, eventId, { name: 'Table 1', capacity: 8 });
      
      const updated = await updateSeatingTable(table.id, { 
        name: 'Updated Table 1',
        capacity: 10 
      });
      
      expect(updated).toBeDefined();
      expect(updated?.name).toBe('Updated Table 1');
      expect(updated?.capacity).toBe(10);
    });

    it('should delete a seating table', async () => {
      const table = await createSeatingTable(weddingId, eventId, { name: 'Table 1' });
      
      const success = await deleteSeatingTable(table.id);
      expect(success).toBe(true);
      
      const tables = await getSeatingTablesForEvent(eventId);
      expect(tables).toHaveLength(0);
    });
  });

  describe('Seating Assignments', () => {
    it('should create seating assignments', async () => {
      const table = await createSeatingTable(weddingId, eventId, { name: 'Table 1', capacity: 4 });
      
      const assignments = await upsertSeatingAssignments(weddingId, eventId, {
        assignments: [
          { guestId: 'guest-1', tableId: table.id },
          { guestId: 'guest-2', tableId: table.id }
        ]
      });
      
      expect(assignments).toHaveLength(2);
      expect(assignments[0].guestId).toBe('guest-1');
      expect(assignments[0].tableId).toBe(table.id);
      expect(assignments[1].guestId).toBe('guest-2');
      expect(assignments[1].tableId).toBe(table.id);
    });

    it('should get seating assignments for an event', async () => {
      const table = await createSeatingTable(weddingId, eventId, { name: 'Table 1' });
      await upsertSeatingAssignments(weddingId, eventId, {
        assignments: [
          { guestId: 'guest-1', tableId: table.id },
          { guestId: 'guest-2', tableId: table.id }
        ]
      });
      
      const assignments = await getSeatingAssignmentsForEvent(eventId);
      
      expect(assignments).toHaveLength(2);
      expect(assignments[0].guest.id).toBe('guest-1');
      expect(assignments[0].table.id).toBe(table.id);
    });

    it('should update existing assignment', async () => {
      const table1 = await createSeatingTable(weddingId, eventId, { name: 'Table 1' });
      const table2 = await createSeatingTable(weddingId, eventId, { name: 'Table 2' });
      
      // Create initial assignment
      await upsertSeatingAssignments(weddingId, eventId, {
        assignments: [{ guestId: 'guest-1', tableId: table1.id }]
      });
      
      // Update assignment to different table
      await upsertSeatingAssignments(weddingId, eventId, {
        assignments: [{ guestId: 'guest-1', tableId: table2.id }]
      });
      
      const assignments = await getSeatingAssignmentsForEvent(eventId);
      expect(assignments).toHaveLength(1);
      expect(assignments[0].guest.id).toBe('guest-1');
      expect(assignments[0].table.id).toBe(table2.id);
    });
  });

  describe('Capacity Validation', () => {
    it('should validate table capacity', async () => {
      const table = await createSeatingTable(weddingId, eventId, { name: 'Table 1', capacity: 2 });
      
      // This would be called internally in real implementation
      const validation = await validateTableCapacity(table.id, 3);
      expect(validation.valid).toBe(false);
      expect(validation.message).toContain('capacity');
    });
  });
});