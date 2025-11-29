import { NextRequest } from "next/server";
import { ok } from "@/lib/api/responses";
import { listVendorsForEvent } from "@/lib/vendors/store";

export async function GET(
  _req: NextRequest,
  { params }: { params: { eventId: string } }
) {
  // events are linked to vendors by linkedEventIds; wedding context is implicit in vendor records
  // return all vendors across weddings that include this event ID
  // (demo scope: single wedding per session, so this is acceptable)
  const vendors = listVendorsForEvent("demo-wedding", params.eventId);
  return ok({ vendors });
}