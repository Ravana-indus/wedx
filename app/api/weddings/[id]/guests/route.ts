import { NextRequest } from "next/server";
import { badRequest, notFound, ok } from "@/lib/api/responses";
import { addGuest, findHousehold, listGuests } from "@/lib/guests/store";

export async function GET(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  const guests = listGuests(params.id);
  return ok({ guests });
}

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch (error) {
    return badRequest("Invalid JSON body", error);
  }

  if (!body.firstName && !body.displayName) {
    return badRequest("Guest name is required");
  }

  if (body.householdId && typeof body.householdId === "string") {
    const household = findHousehold(body.householdId);
    if (!household) return notFound("Household not found");
  }

  const guest = addGuest(params.id, {
    householdId:
      typeof body.householdId === "string" ? body.householdId : undefined,
    firstName:
      typeof body.firstName === "string" && body.firstName.trim()
        ? body.firstName
        : typeof body.displayName === "string"
          ? body.displayName
          : "Guest",
    lastName: typeof body.lastName === "string" ? body.lastName : undefined,
    displayName:
      typeof body.displayName === "string" ? body.displayName : undefined,
    email: typeof body.email === "string" ? body.email : undefined,
    phone: typeof body.phone === "string" ? body.phone : undefined,
    whatsappNumber:
      typeof body.whatsappNumber === "string"
        ? body.whatsappNumber
        : undefined,
    role: typeof body.role === "string" ? body.role : undefined,
    side: typeof body.side === "string" ? body.side : undefined,
    isChild: typeof body.isChild === "boolean" ? body.isChild : undefined,
    notes: typeof body.notes === "string" ? body.notes : undefined,
  });

  return ok(guest, 201);
}
