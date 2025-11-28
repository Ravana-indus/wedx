import { NextRequest } from "next/server";
import { badRequest, notFound, ok } from "@/lib/api/responses";
import { logWhatsAppCommunication } from "@/lib/vendors/communications";
import { findVendor } from "@/lib/vendors/store";
import { buildWhatsAppLink } from "@/lib/vendors/whatsapp";

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const vendorId = params.id;
  const vendor = findVendor(vendorId)?.vendor;
  if (!vendor) return notFound("Vendor not found");

  let body: Record<string, unknown> = {};
  try {
    body = await req.json();
  } catch {
    // body optional; ignore
  }

  const eventId =
    typeof body.eventId === "string" && body.eventId.trim()
      ? body.eventId
      : undefined;
  const participantId =
    typeof body.participantId === "string" && body.participantId.trim()
      ? body.participantId
      : undefined;

  const result = logWhatsAppCommunication({
    vendorId,
    eventId,
    participantId,
  });
  if (!result) return badRequest("Failed to log communication");

  const link = buildWhatsAppLink(vendor.whatsappNumber, body.message as string);
  return ok({ vendor: result.vendor, log: result.log, link });
}
