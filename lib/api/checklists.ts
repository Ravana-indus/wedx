import { ChecklistItem, ChecklistSummary } from "@/lib/checklists/types";
import { WeddingParticipant } from "@/lib/participants/types";

const DEFAULT_WEDDING_ID = "demo-wedding";

type GeneratePayload = {
  weddingType?: string;
  events?: { id: string; name: string; type?: string }[];
  rituals?: { id: string; key: string; eventId?: string }[];
};

const demoGeneratePayload: GeneratePayload = {
  weddingType: "buddhist",
  events: [
    { id: "event-poruwa", name: "Poruwa Ceremony", type: "poruwa" },
    { id: "event-reception", name: "Reception", type: "reception" },
  ],
  rituals: [
    { id: "ritual-poruwa", key: "poruwa-main", eventId: "event-poruwa" },
    { id: "ritual-thali", key: "thali-ceremony", eventId: "event-poruwa" },
  ],
};

async function fetchJson<T>(url: string, init?: RequestInit): Promise<T> {
  const res = await fetch(url, init);
  if (!res.ok) {
    throw new Error(`Request failed: ${res.status} ${res.statusText}`);
  }
  const json = await res.json();
  return json.data as T;
}

export async function ensureChecklist(
  weddingId: string = DEFAULT_WEDDING_ID
): Promise<ChecklistSummary> {
  try {
    return await fetchJson<ChecklistSummary>(
      `/api/weddings/${weddingId}/checklists`
    );
  } catch (error) {
    // Attempt generation, then refetch
    await fetchJson<{ checklist: unknown; items: ChecklistItem[] }>(
      `/api/weddings/${weddingId}/checklists/generate`,
      {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(demoGeneratePayload),
      }
    );
    return await fetchJson<ChecklistSummary>(
      `/api/weddings/${weddingId}/checklists`
    );
  }
}

export async function updateChecklistItem(
  itemId: string,
  payload: Partial<
    Pick<
      ChecklistItem,
      | "assigneeId"
      | "assigneeRole"
      | "status"
      | "notes"
      | "dueDate"
      | "jewelryOwner"
      | "jewelryType"
    >
  >
): Promise<ChecklistItem> {
  return fetchJson<ChecklistItem>(`/api/checklist-items/${itemId}`, {
    method: "PATCH",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(payload),
  });
}

export async function fetchParticipants(
  weddingId: string = DEFAULT_WEDDING_ID
): Promise<WeddingParticipant[]> {
  const res = await fetchJson<{ participants: WeddingParticipant[] }>(
    `/api/weddings/${weddingId}/participants`
  );
  return res.participants;
}
