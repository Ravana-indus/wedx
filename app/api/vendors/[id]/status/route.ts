import { NextRequest } from "next/server";
import { badRequest, notFound, ok } from "@/lib/api/responses";
import { findVendor, updateVendor } from "@/lib/vendors/store";
import {
  isValidStatus,
  normalizePriority,
  normalizeStatus,
} from "@/lib/vendors/status";

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const vendorId = params.id;
  const located = findVendor(vendorId);
  if (!located) {
    return notFound("Vendor not found");
  }

  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch (error) {
    return badRequest("Invalid JSON body", error);
  }

  if (typeof body.status !== "string") {
    return badRequest("status is required");
  }

  if (!isValidStatus(body.status)) {
    return badRequest("Invalid status value");
  }

  const status = normalizeStatus(body.status);
  const priority = normalizePriority(body.priority);

  const updated = updateVendor(vendorId, (vendor) => ({
    ...vendor,
    status,
    priority: priority ?? vendor.priority,
    updatedAt: new Date().toISOString(),
  }));

  if (!updated) {
    return notFound("Vendor not found");
  }

  return ok(updated);
}
