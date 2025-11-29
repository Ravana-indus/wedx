import { NextRequest } from "next/server";
import { ok } from "@/lib/api/responses";
import { invitationSummary } from "@/lib/invitations/store";

const DEFAULT_WEDDING_ID = "demo-wedding";

export async function GET(
  _req: NextRequest,
  { params }: { params: { eventId: string } }
) {
  const summary = invitationSummary(DEFAULT_WEDDING_ID, params.eventId);
  return ok(summary);
}
