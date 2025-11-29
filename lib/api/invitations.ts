import { GuestEventInvitation, InvitationStatus } from "@/lib/invitations/types";

const DEFAULT_WEDDING_ID = "demo-wedding";

async function fetchJson<T>(url: string, init?: RequestInit): Promise<T> {
  const res = await fetch(url, init);
  if (!res.ok) {
    throw new Error(`Request failed: ${res.status} ${res.statusText}`);
  }
  const json = await res.json();
  return json.data as T;
}

export async function listInvitations(eventId: string) {
  return fetchJson<{ invitations: GuestEventInvitation[] }>(
    `/api/events/${eventId}/invitations`
  ).then((r) => r.invitations);
}

export async function saveInvitations(
  eventId: string,
  invitations: Partial<GuestEventInvitation>[]
): Promise<GuestEventInvitation[]> {
  return fetchJson<{ invitations: GuestEventInvitation[] }>(
    `/api/events/${eventId}/invitations`,
    {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ invitations }),
    }
  ).then((r) => r.invitations);
}

export async function updateInvitation(
  id: string,
  payload: Partial<Pick<GuestEventInvitation, "status" | "invitedCount" | "attendingCount" | "notes">>
) {
  return fetchJson<GuestEventInvitation>(`/api/invitations/${id}`, {
    method: "PATCH",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(payload),
  });
}

export async function fetchRsvpSummary(eventId: string) {
  return fetchJson<{ invited: number; accepted: number; declined: number; maybe: number; not_invited: number; attendingCount: number }>(
    `/api/events/${eventId}/rsvp-summary`
  );
}

export function statusOptions(): { value: InvitationStatus; label: string }[] {
  return [
    { value: "not_invited", label: "Not invited" },
    { value: "invited", label: "Invited" },
    { value: "accepted", label: "Accepted" },
    { value: "declined", label: "Declined" },
    { value: "maybe", label: "Maybe" },
  ];
}
