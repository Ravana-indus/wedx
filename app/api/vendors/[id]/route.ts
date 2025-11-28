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

  const allowedKeys = [
    "name",
    "category",
    "contactName",
    "contactPhone",
    "whatsappNumber",
    "websiteUrl",
    "instagramHandle",
    "notes",
    "linkedEventIds",
    "status",
    "priority",
  ];
  const hasAllowed = Object.keys(body).some((key) =>
    allowedKeys.includes(key)
  );
  if (!hasAllowed) {
    return badRequest("No updatable fields provided");
  }

  if ("status" in body && !isValidStatus(body.status)) {
    return badRequest("Invalid status value");
  }

  const updated = updateVendor(vendorId, (vendor) => {
    const linkedEventIds = Array.isArray(body.linkedEventIds)
      ? body.linkedEventIds.filter((id) => typeof id === "string")
      : vendor.linkedEventIds;
    return {
      ...vendor,
      name: typeof body.name === "string" ? body.name : vendor.name,
      category:
        typeof body.category === "string" ? body.category : vendor.category,
      contactName:
        typeof body.contactName === "string"
          ? body.contactName
          : vendor.contactName,
      contactPhone:
        typeof body.contactPhone === "string"
          ? body.contactPhone
          : vendor.contactPhone,
      whatsappNumber:
        typeof body.whatsappNumber === "string"
          ? body.whatsappNumber
          : vendor.whatsappNumber,
      websiteUrl:
        typeof body.websiteUrl === "string"
          ? body.websiteUrl
          : vendor.websiteUrl,
      instagramHandle:
        typeof body.instagramHandle === "string"
          ? body.instagramHandle
          : vendor.instagramHandle,
      notes: typeof body.notes === "string" ? body.notes : vendor.notes,
      status: normalizeStatus(body.status ?? vendor.status),
      priority: normalizePriority(body.priority ?? vendor.priority),
      linkedEventIds,
      updatedAt: new Date().toISOString(),
    };
  });

  if (!updated) {
    return notFound("Vendor not found");
  }

  return ok(updated);
}
