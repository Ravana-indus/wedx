import { NextRequest } from "next/server";
import { badRequest, notFound, ok } from "@/lib/api/responses";
import { updateHousehold } from "@/lib/guests/store";

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

  const updated = updateHousehold(params.id, (household) => ({
    ...household,
    name: typeof body.name === "string" ? body.name : household.name,
    addressLine1:
      typeof body.addressLine1 === "string"
        ? body.addressLine1
        : household.addressLine1,
    addressLine2:
      typeof body.addressLine2 === "string"
        ? body.addressLine2
        : household.addressLine2,
    city: typeof body.city === "string" ? body.city : household.city,
    region: typeof body.region === "string" ? body.region : household.region,
    postalCode:
      typeof body.postalCode === "string"
        ? body.postalCode
        : household.postalCode,
    country:
      typeof body.country === "string" ? body.country : household.country,
    notes: typeof body.notes === "string" ? body.notes : household.notes,
  }));

  if (!updated) return notFound("Household not found");
  return ok(updated);
}
