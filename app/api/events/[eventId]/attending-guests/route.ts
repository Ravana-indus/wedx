import { NextRequest } from "next/server";
import { badRequest, ok } from "@/lib/api/responses";

// Mock data for now - in real implementation would fetch from guest store
const mockGuests = [
  {
    id: 'guest-1',
    name: 'John Smith',
    household: { id: 'household-1', name: 'Smith Family' },
    side: 'bride' as const,
    invitation: {
      id: 'invitation-1',
      status: 'accepted' as const,
      dietary: 'None',
      plusOne: false
    }
  },
  {
    id: 'guest-2',
    name: 'Sarah Johnson',
    household: { id: 'household-2', name: 'Johnson Family' },
    side: 'groom' as const,
    invitation: {
      id: 'invitation-2',
      status: 'accepted' as const,
      dietary: 'Vegetarian',
      plusOne: false
    }
  },
  {
    id: 'guest-3',
    name: 'Michael Brown',
    household: { id: 'household-3', name: 'Brown Family' },
    side: 'bride' as const,
    invitation: {
      id: 'invitation-3',
      status: 'maybe' as const,
      dietary: 'None',
      plusOne: true
    }
  },
  {
    id: 'guest-4',
    name: 'Emily Davis',
    household: { id: 'household-4', name: 'Davis Family' },
    side: 'groom' as const,
    invitation: {
      id: 'invitation-4',
      status: 'invited' as const,
      dietary: 'Gluten-free',
      plusOne: false
    }
  }
];

// GET /api/events/[eventId]/attending-guests
export async function GET(
  _req: NextRequest,
  { params }: { params: { eventId: string } }
) {
  try {
    const { eventId } = params;
    
    // Filter guests who are attending (invited, accepted, or maybe)
    const attendingGuests = mockGuests.filter(guest => 
      guest.invitation && ['invited', 'accepted', 'maybe'].includes(guest.invitation.status)
    );
    
    return ok({ 
      eventId,
      guests: attendingGuests
    });
  } catch (error) {
    console.error('Error fetching attending guests:', error);
    return badRequest('Failed to fetch attending guests');
  }
}