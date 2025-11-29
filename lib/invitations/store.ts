import { GuestEventInvitation, InvitationStatus } from "./types";

const invitationStore = new Map<string, GuestEventInvitation[]>();

function generateId(prefix: string) {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return `${prefix}_${crypto.randomUUID()}`;
  }
  return `${prefix}_${Math.random().toString(36).slice(2, 10)}`;
}

function ensureWedding(weddingId: string) {
  if (!invitationStore.has(weddingId)) invitationStore.set(weddingId, []);
}

export function listInvitations(
  weddingId: string,
  eventId: string
): GuestEventInvitation[] {
  ensureWedding(weddingId);
  return invitationStore.get(weddingId)!.filter((i) => i.eventId === eventId);
}

export function addOrUpdateInvitations(
  weddingId: string,
  eventId: string,
  inputs: Partial<GuestEventInvitation>[]
): GuestEventInvitation[] {
  ensureWedding(weddingId);
  const existing = invitationStore.get(weddingId)!;
  const updated: GuestEventInvitation[] = [];
  inputs.forEach((input) => {
    if (input.id) {
      const current = existing.find((i) => i.id === input.id);
      if (current) {
        const merged: GuestEventInvitation = {
          ...current,
          ...input,
          lastUpdatedAt: new Date().toISOString(),
        };
        updated.push(merged);
        return;
      }
    }
    const now = new Date().toISOString();
    const invitation: GuestEventInvitation = {
      id: generateId("invite"),
      weddingId,
      eventId,
      inviteLevel: input.inviteLevel ?? (input.householdId ? "household" : "guest"),
      status: (input.status as InvitationStatus) ?? "invited",
      invitedCount: input.invitedCount,
      attendingCount: input.attendingCount,
      householdId: input.householdId,
      guestId: input.guestId,
      notes: input.notes,
      createdAt: now,
      lastUpdatedAt: now,
    };
    updated.push(invitation);
  });

  const remaining = existing.filter((e) => updated.findIndex((u) => u.id === e.id) === -1);
  invitationStore.set(weddingId, [...remaining, ...updated]);
  return updated;
}

export function updateInvitation(
  id: string,
  updater: (invitation: GuestEventInvitation) => GuestEventInvitation
): GuestEventInvitation | undefined {
  for (const [weddingId, invitations] of invitationStore.entries()) {
    if (invitations.some((i) => i.id === id)) {
      const next = invitations.map((i) =>
        i.id === id ? { ...updater(i), lastUpdatedAt: new Date().toISOString() } : i
      );
      invitationStore.set(weddingId, next);
      return next.find((i) => i.id === id);
    }
  }
  return undefined;
}

export function getInvitation(id: string): GuestEventInvitation | undefined {
  for (const invitations of invitationStore.values()) {
    const found = invitations.find((i) => i.id === id);
    if (found) return found;
  }
  return undefined;
}

export function invitationSummary(weddingId: string, eventId: string) {
  const invitations = listInvitations(weddingId, eventId);
  const summary = {
    invited: 0,
    accepted: 0,
    declined: 0,
    maybe: 0,
    not_invited: 0,
    attendingCount: 0,
  };
  invitations.forEach((inv) => {
    summary[inv.status] = (summary[inv.status as keyof typeof summary] as number) + 1;
    if (inv.attendingCount) summary.attendingCount += inv.attendingCount;
    else if (inv.status === "accepted") summary.attendingCount += 1;
  });
  return summary;
}
