import { NextRequest } from "next/server";
import { badRequest, ok } from "@/lib/api/responses";
import {
  getSeatingTablesForEvent,
  createSeatingTable
} from "@/lib/seating/store";
import { CreateSeatingTableRequest } from "@/lib/seating/types";

// GET /api/events/[eventId]/seating-tables
export async function GET(
  _req: NextRequest,
  { params }: { params: { eventId: string } }
) {
  try {
    const { eventId } = params;
    const tables = await getSeatingTablesForEvent(eventId);
    
    return ok({
      eventId,
      tables
    });
  } catch (error) {
    console.error('Error fetching seating tables:', error);
    return badRequest('Failed to fetch seating tables');
  }
}

// POST /api/events/[eventId]/seating-tables
export async function POST(
  req: NextRequest,
  { params }: { params: { eventId: string } }
) {
  try {
    const { eventId } = params;
    const body = await req.json();
    
    // Validate request body
    if (!body.name || typeof body.name !== 'string') {
      return badRequest('Table name is required');
    }

    const data: CreateSeatingTableRequest = {
      name: body.name,
      capacity: body.capacity ? parseInt(body.capacity) : undefined,
      section: body.section,
      notes: body.notes
    };

    // For now, use a mock weddingId - in real implementation would get from session
    const weddingId = 'mock-wedding-id';
    const table = await createSeatingTable(weddingId, eventId, data);
    
    return ok(table, 201);
  } catch (error) {
    console.error('Error creating seating table:', error);
    return badRequest('Failed to create seating table');
  }
}