import { NextRequest } from "next/server";
import { badRequest, ok } from "@/lib/api/responses";
import { addOrUpdateInvitations, listInvitations } from "@/lib/invitations/store";
import { listGuests, listHouseholds } from "@/lib/guests/store";

const DEFAULT_WEDDING_ID = "demo-wedding";

export async function GET(
  _req: NextRequest,
  { params }: { params: { eventId: string } }
) {
  const invitations = listInvitations(DEFAULT_WEDDING_ID, params.eventId).map((inv) => {
    const households = listHouseholds(DEFAULT_WEDDING_ID);
    const guests = listGuests(DEFAULT_WEDDING_ID);
    return {
      ...inv,
      household: households.find((h) => h.id === inv.householdId),
      guest: guests.find((g) => g.id === inv.guestId),
    };
  });
  return ok({ invitations });
}

export async function POST(
  req: NextRequest,
  { params }: { params: { eventId: string } }
) {
  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch (error) {
    return badRequest("Invalid JSON body", error);
  }

  if (!Array.isArray(body.invitations)) {
    return badRequest("invitations array is required");
  }

  const invitations = addOrUpdateInvitations(
    DEFAULT_WEDDING_ID,
    params.eventId,
    body.invitations as any[]
  );
  return ok({ invitations }, 201);
}
