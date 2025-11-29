import { NextRequest } from "next/server";
import { badRequest, notFound, ok } from "@/lib/api/responses";
import { getInvitation, updateInvitation } from "@/lib/invitations/store";
import { InvitationStatus } from "@/lib/invitations/types";

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

  const status = body.status as InvitationStatus | undefined;
  if (!status && body.attendingCount === undefined && body.invitedCount === undefined) {
    return badRequest("No updatable fields provided");
  }

  const updated = updateInvitation(params.id, (inv) => ({
    ...inv,
    status: status ?? inv.status,
    invitedCount:
      typeof body.invitedCount === "number" ? body.invitedCount : inv.invitedCount,
    attendingCount:
      typeof body.attendingCount === "number" ? body.attendingCount : inv.attendingCount,
    notes: typeof body.notes === "string" ? body.notes : inv.notes,
  }));

  if (!updated) return notFound("Invitation not found");
  return ok(updated);
}

export async function GET(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  const invitation = getInvitation(params.id);
  if (!invitation) return notFound("Invitation not found");
  return ok(invitation);
}
