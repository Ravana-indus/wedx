import { Vendor } from "@/lib/vendors/types";

const DEFAULT_WEDDING_ID = "demo-wedding";

async function fetchJson<T>(url: string, init?: RequestInit): Promise<T> {
  const res = await fetch(url, init);
  if (!res.ok) {
    throw new Error(`Request failed: ${res.status} ${res.statusText}`);
  }
  const json = await res.json();
  return json.data as T;
}

export async function listVendors(
  weddingId: string = DEFAULT_WEDDING_ID
): Promise<Vendor[]> {
  const res = await fetchJson<{ vendors: Vendor[] }>(
    `/api/weddings/${weddingId}/vendors`
  );
  return res.vendors;
}

export async function createVendor(
  input: Partial<Vendor>,
  weddingId: string = DEFAULT_WEDDING_ID
): Promise<Vendor> {
  return fetchJson<Vendor>(`/api/weddings/${weddingId}/vendors`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(input),
  });
}

export async function updateVendor(
  vendorId: string,
  input: Partial<Vendor>
): Promise<Vendor> {
  return fetchJson<Vendor>(`/api/vendors/${vendorId}`, {
    method: "PATCH",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(input),
  });
}

export async function listVendorsForEvent(
  eventId: string,
  weddingId: string = DEFAULT_WEDDING_ID
): Promise<Vendor[]> {
  // event-linked endpoint uses shared store; weddingId retained for forward compatibility
  const res = await fetchJson<{ vendors: Vendor[] }>(
    `/api/events/${eventId}/vendors`
  );
  return res.vendors.filter((v) => v.weddingId === weddingId);
}

export async function updateVendorStatus(
  vendorId: string,
  input: { status: Vendor["status"]; priority?: Vendor["priority"] }
): Promise<Vendor> {
  return fetchJson<Vendor>(`/api/vendors/${vendorId}/status`, {
    method: "PATCH",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(input),
  });
}

export async function logWhatsApp(
  vendorId: string,
  payload: { eventId?: string; participantId?: string; message?: string }
): Promise<{ vendor?: Vendor; link: string }> {
  return fetchJson<{ vendor?: Vendor; link: string }>(
    `/api/vendors/${vendorId}/whatsapp`,
    {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(payload),
    }
  );
}
