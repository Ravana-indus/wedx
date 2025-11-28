import { NextRequest } from "next/server";
import { badRequest, notFound, ok } from "@/lib/api/responses";
import { findGuest, findHousehold, updateGuest } from "@/lib/guests/store";

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch (error) {
    return badRequest("Invalid JSON body", error);
  }

  if (body.householdId && typeof body.householdId === "string") {
    const household = findHousehold(body.householdId);
    if (!household) return notFound("Household not found");
  }

  const updated = updateGuest(params.id, (guest) => ({
    ...guest,
    householdId:
      typeof body.householdId === "string"
        ? body.householdId
        : guest.householdId,
    firstName:
      typeof body.firstName === "string" && body.firstName.trim()
        ? body.firstName
        : guest.firstName,
    lastName: typeof body.lastName === "string" ? body.lastName : guest.lastName,
    displayName:
      typeof body.displayName === "string" ? body.displayName : guest.displayName,
    email: typeof body.email === "string" ? body.email : guest.email,
    phone: typeof body.phone === "string" ? body.phone : guest.phone,
    whatsappNumber:
      typeof body.whatsappNumber === "string"
        ? body.whatsappNumber
        : guest.whatsappNumber,
    role: typeof body.role === "string" ? body.role : guest.role,
    side: typeof body.side === "string" ? body.side : guest.side,
    isChild:
      typeof body.isChild === "boolean" ? body.isChild : guest.isChild,
    notes: typeof body.notes === "string" ? body.notes : guest.notes,
  }));

  if (!updated) return notFound("Guest not found");
  return ok(updated);
}

export async function GET(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  const found = findGuest(params.id);
  if (!found) return notFound("Guest not found");
  return ok(found.guest);
}
