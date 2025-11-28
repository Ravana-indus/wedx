import { NextRequest } from "next/server";
import { badRequest, ok } from "@/lib/api/responses";
import { addVendor, listVendors } from "@/lib/vendors/store";
import {
  isValidStatus,
  normalizePriority,
  normalizeStatus,
} from "@/lib/vendors/status";

export async function GET(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  const vendors = listVendors(params.id);
  return ok({ vendors });
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
    return badRequest("Vendor name is required");
  }

  if (body.status && !isValidStatus(body.status)) {
    return badRequest("Invalid status value");
  }

  const vendor = addVendor(params.id, {
    name: body.name,
    category: typeof body.category === "string" ? body.category : undefined,
    contactName:
      typeof body.contactName === "string" ? body.contactName : undefined,
    contactPhone:
      typeof body.contactPhone === "string" ? body.contactPhone : undefined,
    whatsappNumber:
      typeof body.whatsappNumber === "string"
        ? body.whatsappNumber
        : undefined,
    websiteUrl:
      typeof body.websiteUrl === "string" ? body.websiteUrl : undefined,
    instagramHandle:
      typeof body.instagramHandle === "string"
        ? body.instagramHandle
        : undefined,
    notes: typeof body.notes === "string" ? body.notes : undefined,
    status: normalizeStatus(body.status),
    priority: normalizePriority(body.priority),
    linkedEventIds: Array.isArray(body.linkedEventIds)
      ? body.linkedEventIds.filter((id) => typeof id === "string")
      : [],
  });

  return ok(vendor);
}
