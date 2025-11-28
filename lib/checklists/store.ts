import {
  Checklist,
  ChecklistItem,
  ChecklistSummary,
  TimeBucket,
  ChecklistCategory,
} from "./types";

type ChecklistRecord = {
  checklist: Checklist;
  items: ChecklistItem[];
};

const memoryStore = new Map<string, ChecklistRecord>();

function generateId(prefix: string) {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return `${prefix}_${crypto.randomUUID()}`;
  }
  return `${prefix}_${Math.random().toString(36).slice(2, 10)}`;
}

export function createChecklist(weddingId: string): Checklist {
  const timestamp = new Date().toISOString();
  return {
    id: generateId("chk"),
    weddingId,
    name: "Global Wedding Checklist",
    createdAt: timestamp,
    updatedAt: timestamp,
  };
}

export function saveChecklist(
  weddingId: string,
  checklist: Checklist,
  items: ChecklistItem[]
) {
  memoryStore.set(weddingId, { checklist, items });
}

export function getChecklistRecord(
  weddingId: string
): ChecklistRecord | undefined {
  return memoryStore.get(weddingId);
}

export function upsertChecklist(
  weddingId: string,
  checklist: Checklist,
  items: ChecklistItem[]
) {
  saveChecklist(weddingId, checklist, items);
  return memoryStore.get(weddingId)!;
}

export function updateChecklistItems(
  weddingId: string,
  updater: (items: ChecklistItem[]) => ChecklistItem[]
): ChecklistRecord | undefined {
  const existing = memoryStore.get(weddingId);
  if (!existing) return undefined;
  const updatedItems = updater(existing.items);
  const updatedChecklist = {
    ...existing.checklist,
    updatedAt: new Date().toISOString(),
  };
  memoryStore.set(weddingId, {
    checklist: updatedChecklist,
    items: updatedItems,
  });
  return memoryStore.get(weddingId);
}

export function findItemById(
  itemId: string
): { weddingId: string; item: ChecklistItem } | undefined {
  for (const [weddingId, record] of memoryStore.entries()) {
    const item = record.items.find((entry) => entry.id === itemId);
    if (item) {
      return { weddingId, item };
    }
  }
  return undefined;
}

export function summarizeChecklist(record: ChecklistRecord): ChecklistSummary {
  const initTimeBucket = (): {
    count: number;
    completed: number;
    items: ChecklistItem[];
  } => ({ count: 0, completed: 0, items: [] });

  const initCategory = initTimeBucket;
  const initEvent = initTimeBucket;

  const byTimeBucket: ChecklistSummary["groups"]["byTimeBucket"] = {
    "6_plus_months": initTimeBucket(),
    "3_6_months": initTimeBucket(),
    "1_3_months": initTimeBucket(),
    "1_month": initTimeBucket(),
    "1_week": initTimeBucket(),
    "day_of": initTimeBucket(),
    after: initTimeBucket(),
  };

  const allCategories: ChecklistCategory[] = [
    "venue",
    "catering",
    "decor_flowers",
    "photography",
    "attire_makeup",
    "jewelry",
    "rituals",
    "documents_legal",
    "transport",
    "invitations_rsvp",
    "guests",
    "budget",
    "logistics",
    "post_wedding",
    "other",
  ];

  const byCategory: ChecklistSummary["groups"]["byCategory"] =
    allCategories.reduce((acc, category) => {
      acc[category] = initCategory();
      return acc;
    }, {} as ChecklistSummary["groups"]["byCategory"]);

  const byEvent: ChecklistSummary["groups"]["byEvent"] = {};

  const jewelrySummary: {
    total: number;
    completed: number;
    byEvent: Record<string, { total: number; completed: number }>;
  } = { total: 0, completed: 0, byEvent: {} };

  record.items.forEach((item) => {
    const isDone = item.status === "done";

    const tb = byTimeBucket[item.timeBucket];
    tb.count += 1;
    if (isDone) tb.completed += 1;
    tb.items.push(item);

    const cat = byCategory[item.category];
    cat.count += 1;
    if (isDone) cat.completed += 1;
    cat.items.push(item);

    if (item.eventId) {
      if (!byEvent[item.eventId]) {
        byEvent[item.eventId] = { count: 0, completed: 0, items: [] };
      }
      byEvent[item.eventId].count += 1;
      if (isDone) byEvent[item.eventId].completed += 1;
      byEvent[item.eventId].items.push(item);
    }

    if (item.isJewelry) {
      jewelrySummary.total += 1;
      if (isDone) jewelrySummary.completed += 1;
      if (item.eventId) {
        if (!jewelrySummary.byEvent[item.eventId]) {
          jewelrySummary.byEvent[item.eventId] = { total: 0, completed: 0 };
        }
        jewelrySummary.byEvent[item.eventId].total += 1;
        if (isDone) jewelrySummary.byEvent[item.eventId].completed += 1;
      }
    }
  });

  return {
    checklist: record.checklist,
    items: record.items,
    groups: { byTimeBucket, byCategory, byEvent, jewelry: jewelrySummary },
  };
}
