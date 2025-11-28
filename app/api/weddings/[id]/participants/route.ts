import { NextRequest } from "next/server";
import { ok } from "@/lib/api/responses";
import { listParticipants } from "@/lib/participants/store";

export async function GET(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  const participants = listParticipants(params.id);
  return ok({ participants });
}
