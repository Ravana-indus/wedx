import { WeddingParticipant } from "./types";

const memoryStore = new Map<string, WeddingParticipant[]>();

function generateId(prefix: string) {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return `${prefix}_${crypto.randomUUID()}`;
  }
  return `${prefix}_${Math.random().toString(36).slice(2, 10)}`;
}

function seedDefaults(weddingId: string): WeddingParticipant[] {
  return [
    {
      id: generateId("participant"),
      weddingId,
      name: "Bride",
      role: "bride",
      isPrimary: true,
    },
    {
      id: generateId("participant"),
      weddingId,
      name: "Groom",
      role: "groom",
      isPrimary: true,
    },
    {
      id: generateId("participant"),
      weddingId,
      name: "Parent",
      role: "bride-parent",
      isPrimary: false,
    },
  ];
}

export function ensureParticipants(weddingId: string): WeddingParticipant[] {
  if (!memoryStore.has(weddingId)) {
    memoryStore.set(weddingId, seedDefaults(weddingId));
  }
  return memoryStore.get(weddingId)!;
}

export function listParticipants(weddingId: string): WeddingParticipant[] {
  return ensureParticipants(weddingId);
}

export function findParticipant(
  weddingId: string,
  participantId?: string | null
): WeddingParticipant | undefined {
  if (!participantId) return undefined;
  return listParticipants(weddingId).find((p) => p.id === participantId);
}
