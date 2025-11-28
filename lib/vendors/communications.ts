import { Vendor } from "./types";
import { findVendor, updateVendor } from "./store";

export type VendorCommunicationLog = {
  id: string;
  weddingId: string;
  vendorId: string;
  eventId?: string;
  participantId?: string;
  channel: "whatsapp";
  direction: "outbound";
  createdAt: string;
};

const communicationStore = new Map<string, VendorCommunicationLog[]>();

function generateId(prefix: string) {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return `${prefix}_${crypto.randomUUID()}`;
  }
  return `${prefix}_${Math.random().toString(36).slice(2, 10)}`;
}

export function logWhatsAppCommunication(params: {
  vendorId: string;
  eventId?: string;
  participantId?: string;
}): { vendor?: Vendor; log: VendorCommunicationLog } | undefined {
  const located = findVendor(params.vendorId);
  if (!located) return undefined;
  const { weddingId } = located;
  const log: VendorCommunicationLog = {
    id: generateId("comm"),
    weddingId,
    vendorId: params.vendorId,
    eventId: params.eventId,
    participantId: params.participantId,
    channel: "whatsapp",
    direction: "outbound",
    createdAt: new Date().toISOString(),
  };
  if (!communicationStore.has(weddingId)) {
    communicationStore.set(weddingId, []);
  }
  communicationStore.get(weddingId)!.push(log);
  const vendor = updateVendor(params.vendorId, (v) => ({
    ...v,
    lastContactedAt: log.createdAt,
  }));
  return { vendor, log };
}

export function listCommunications(weddingId: string) {
  return communicationStore.get(weddingId) ?? [];
}
