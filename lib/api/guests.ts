import { Guest, HouseholdWithGuests } from "@/lib/guests/types";

const DEFAULT_WEDDING_ID = "demo-wedding";

async function fetchJson<T>(url: string, init?: RequestInit): Promise<T> {
  const res = await fetch(url, init);
  if (!res.ok) {
    throw new Error(`Request failed: ${res.status} ${res.statusText}`);
  }
  const json = await res.json();
  return json.data as T;
}

export async function listHouseholds(
  weddingId: string = DEFAULT_WEDDING_ID
): Promise<HouseholdWithGuests[]> {
  const res = await fetchJson<{ households: HouseholdWithGuests[] }>(
    `/api/weddings/${weddingId}/households`
  );
  return res.households;
}

export async function createHousehold(
  input: Partial<HouseholdWithGuests>,
  weddingId: string = DEFAULT_WEDDING_ID
) {
  return fetchJson(`/api/weddings/${weddingId}/households`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(input),
  });
}

export async function updateHousehold(
  householdId: string,
  input: Partial<HouseholdWithGuests>
) {
  return fetchJson(`/api/households/${householdId}`, {
    method: "PATCH",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(input),
  });
}

export async function createGuest(
  input: Partial<Guest>,
  weddingId: string = DEFAULT_WEDDING_ID
): Promise<Guest> {
  return fetchJson<Guest>(`/api/weddings/${weddingId}/guests`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(input),
  });
}

export async function updateGuest(guestId: string, input: Partial<Guest>) {
  return fetchJson(`/api/guests/${guestId}`, {
    method: "PATCH",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(input),
  });
}

export async function importGuests(
  file: File,
  weddingId: string = DEFAULT_WEDDING_ID
): Promise<{ householdsCreated: number; guestsCreated: number; errors: string[] }>
{
  const formData = new FormData();
  formData.append("file", file);
  return fetchJson(`/api/weddings/${weddingId}/guests/import`, {
    method: "POST",
    body: formData,
  });
}
