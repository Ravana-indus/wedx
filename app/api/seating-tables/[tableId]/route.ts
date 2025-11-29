import { NextRequest } from "next/server";
import { badRequest, notFound, ok } from "@/lib/api/responses";
import { 
  getSeatingTableById,
  updateSeatingTable,
  deleteSeatingTable
} from "@/lib/seating/store";
import { UpdateSeatingTableRequest } from "@/lib/seating/types";

// GET /api/seating-tables/[tableId]
export async function GET(
  _req: NextRequest,
  { params }: { params: { tableId: string } }
) {
  try {
    const { tableId } = params;
    const table = await getSeatingTableById(tableId);
    
    if (!table) {
      return notFound('Seating table not found');
    }
    
    return ok(table);
  } catch (error) {
    console.error('Error fetching seating table:', error);
    return badRequest('Failed to fetch seating table');
  }
}

// PATCH /api/seating-tables/[tableId]
export async function PATCH(
  req: NextRequest,
  { params }: { params: { tableId: string } }
) {
  try {
    const { tableId } = params;
    const body = await req.json();
    
    // Validate that table exists
    const existingTable = await getSeatingTableById(tableId);
    if (!existingTable) {
      return notFound('Seating table not found');
    }

    const data: UpdateSeatingTableRequest = {};
    
    if (body.name !== undefined) {
      if (typeof body.name !== 'string' || !body.name.trim()) {
        return badRequest('Table name must be a non-empty string');
      }
      data.name = body.name;
    }
    
    if (body.capacity !== undefined) {
      const capacity = parseInt(body.capacity);
      if (isNaN(capacity) || capacity < 0) {
        return badRequest('Capacity must be a non-negative number');
      }
      data.capacity = capacity;
    }
    
    if (body.section !== undefined) {
      data.section = body.section;
    }
    
    if (body.notes !== undefined) {
      data.notes = body.notes;
    }

    const updatedTable = await updateSeatingTable(tableId, data);
    
    if (!updatedTable) {
      return badRequest('Failed to update seating table');
    }
    
    return ok(updatedTable);
  } catch (error) {
    console.error('Error updating seating table:', error);
    return badRequest('Failed to update seating table');
  }
}

// DELETE /api/seating-tables/[tableId]
export async function DELETE(
  _req: NextRequest,
  { params }: { params: { tableId: string } }
) {
  try {
    const { tableId } = params;
    
    // Validate that table exists
    const existingTable = await getSeatingTableById(tableId);
    if (!existingTable) {
      return notFound('Seating table not found');
    }

    const success = await deleteSeatingTable(tableId);
    
    if (!success) {
      return badRequest('Failed to delete seating table');
    }
    
    return ok({ message: 'Seating table deleted successfully' });
  } catch (error) {
    console.error('Error deleting seating table:', error);
    return badRequest('Failed to delete seating table');
  }
}