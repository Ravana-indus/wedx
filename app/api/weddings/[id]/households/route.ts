import { NextRequest } from "next/server";
import { badRequest, ok } from "@/lib/api/responses";
import {
  addHousehold,
  listGuests,
  listHouseholdsWithGuests,
} from "@/lib/guests/store";

export async function GET(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  const households = listHouseholdsWithGuests(params.id);
  const unassigned = listGuests(params.id).filter((g) => !g.householdId);
  if (unassigned.length > 0) {
    households.push({
      id: "ungrouped",
      weddingId: params.id,
      name: "Ungrouped guests",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      guests: unassigned,
    });
  }
  return ok({ households });
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

  if (!body.name || typeof body.name !== "string") {
    return badRequest("Household name is required");
  }

  const household = addHousehold(params.id, {
    name: body.name.trim(),
    addressLine1:
      typeof body.addressLine1 === "string" ? body.addressLine1 : undefined,
    addressLine2:
      typeof body.addressLine2 === "string" ? body.addressLine2 : undefined,
    city: typeof body.city === "string" ? body.city : undefined,
    region: typeof body.region === "string" ? body.region : undefined,
    postalCode:
      typeof body.postalCode === "string" ? body.postalCode : undefined,
    country: typeof body.country === "string" ? body.country : undefined,
    notes: typeof body.notes === "string" ? body.notes : undefined,
  });

  return ok(household, 201);
}
