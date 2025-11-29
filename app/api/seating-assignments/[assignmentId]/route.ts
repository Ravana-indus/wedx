import { NextRequest } from "next/server";
import { badRequest, notFound, ok } from "@/lib/api/responses";
import { deleteSeatingAssignment } from "@/lib/seating/store";

// DELETE /api/seating-assignments/[assignmentId]
export async function DELETE(
  _req: NextRequest,
  { params }: { params: { assignmentId: string } }
) {
  try {
    const { assignmentId } = params;
    
    const success = await deleteSeatingAssignment(assignmentId);
    
    if (!success) {
      return notFound('Seating assignment not found');
    }
    
    return ok({ message: 'Seating assignment deleted successfully' });
  } catch (error) {
    console.error('Error deleting seating assignment:', error);
    return badRequest('Failed to delete seating assignment');
  }
}