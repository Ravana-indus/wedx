import { NextRequest } from "next/server";
import { badRequest, ok } from "@/lib/api/responses";
import { 
  getSeatingAssignmentsForEvent,
  upsertSeatingAssignments
} from "@/lib/seating/store";
import { UpsertSeatingAssignmentsRequest } from "@/lib/seating/types";

// GET /api/events/[eventId]/seating-assignments
export async function GET(
  _req: NextRequest,
  { params }: { params: { eventId: string } }
) {
  try {
    const { eventId } = params;
    const assignments = await getSeatingAssignmentsForEvent(eventId);
    
    return ok({ 
      eventId,
      assignments 
    });
  } catch (error) {
    console.error('Error fetching seating assignments:', error);
    return badRequest('Failed to fetch seating assignments');
  }
}

// POST /api/events/[eventId]/seating-assignments
export async function POST(
  req: NextRequest,
  { params }: { params: { eventId: string } }
) {
  try {
    const { eventId } = params;
    const body = await req.json();
    
    // Validate request body
    if (!body.assignments || !Array.isArray(body.assignments)) {
      return badRequest('Assignments array is required');
    }

    // Validate each assignment
    for (const assignment of body.assignments) {
      if (!assignment.guestId || !assignment.tableId) {
        return badRequest('Each assignment must have guestId and tableId');
      }
    }

    const data: UpsertSeatingAssignmentsRequest = {
      assignments: body.assignments.map((a: any) => ({
        guestId: a.guestId,
        tableId: a.tableId,
        notes: a.notes
      }))
    };

    // For now, use a mock weddingId - in real implementation would get from session
    const weddingId = 'mock-wedding-id';
    const assignments = await upsertSeatingAssignments(weddingId, eventId, data);
    
    return ok(assignments);
  } catch (error) {
    console.error('Error creating seating assignments:', error);
    return badRequest('Failed to create seating assignments');
  }
}