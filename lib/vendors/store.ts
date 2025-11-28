import { normalizePriority, normalizeStatus } from "./status";
import { Vendor } from "./types";

const memoryStore = new Map<string, Vendor[]>();

function generateId(prefix: string) {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return `${prefix}_${crypto.randomUUID()}`;
  }
  return `${prefix}_${Math.random().toString(36).slice(2, 10)}`;
}

function ensureList(weddingId: string) {
  if (!memoryStore.has(weddingId)) {
    memoryStore.set(weddingId, []);
  }
}

function withDefaults(vendor: Vendor): Vendor {
  return {
    ...vendor,
    status: normalizeStatus(vendor.status),
    priority: normalizePriority(vendor.priority),
    linkedEventIds: vendor.linkedEventIds ?? [],
  };
}

export function listVendors(weddingId: string): Vendor[] {
  ensureList(weddingId);
  return memoryStore.get(weddingId)!.map(withDefaults);
}

export function addVendor(
  weddingId: string,
  input: Omit<
    Vendor,
    | "id"
    | "createdAt"
    | "updatedAt"
    | "weddingId"
    | "status"
    | "priority"
    | "linkedEventIds"
  > &
    Partial<Pick<Vendor, "status" | "priority" | "linkedEventIds">>
): Vendor {
  ensureList(weddingId);
  const timestamp = new Date().toISOString();
  const vendor: Vendor = {
    id: generateId("vendor"),
    weddingId,
    createdAt: timestamp,
    updatedAt: timestamp,
    status: normalizeStatus(input.status),
    priority: normalizePriority(input.priority),
    linkedEventIds: input.linkedEventIds ?? [],
    ...input,
  };
  memoryStore.get(weddingId)!.push(vendor);
  return vendor;
}

export function findVendor(
  vendorId: string
): { weddingId: string; vendor: Vendor } | undefined {
  for (const [weddingId, vendors] of memoryStore.entries()) {
    const vendor = vendors.find((v) => v.id === vendorId);
    if (vendor) return { weddingId, vendor: withDefaults(vendor) };
  }
  return undefined;
}

export function updateVendor(
  vendorId: string,
  updater: (vendor: Vendor) => Vendor
): Vendor | undefined {
  const located = findVendor(vendorId);
  if (!located) return undefined;
  const { weddingId } = located;
  memoryStore.set(
    weddingId,
    memoryStore.get(weddingId)!.map((v) => {
      if (v.id !== vendorId) return v;
      const updated = updater(v);
      return withDefaults(updated);
    })
  );
  return findVendor(vendorId)?.vendor;
}

export function listVendorsForEvent(
  weddingId: string,
  eventId: string
): Vendor[] {
  return listVendors(weddingId).filter((v) =>
    (v.linkedEventIds ?? []).includes(eventId)
  );
}
