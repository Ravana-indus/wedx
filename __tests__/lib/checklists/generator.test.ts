import {
  generateChecklist,
  getChecklistSummary,
} from "@/lib/checklists/generator";
import {
  findItemById,
  updateChecklistItems,
} from "@/lib/checklists/store";

const baseWedding = {
  weddingId: "wedding-1",
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

describe("Checklist generation and API surfaces", () => {
  it("generates checklist items filtered by events and rituals", async () => {
    const result = generateChecklist(baseWedding);

    const titles = result.items.map((i) => i.title);

    expect(titles).toEqual(
      expect.arrayContaining([
        "Confirm budget ranges and owners",
        "Estimate guest counts per event",
        "Prepare Poruwa ritual items (oil lamp, sheaves, tray)",
        "Prepare Thali ceremony items (chain, flowers, tray)",
        "Reception photography shot list",
        "Purchase gold for Thali/Thirumangalyam",
      ])
    );

    const summary = getChecklistSummary(baseWedding.weddingId);
    expect(summary).toBeDefined();
    expect(summary?.groups.byEvent["event-poruwa"].count).toBeGreaterThan(0);
    expect(summary?.groups.byEvent["event-reception"].count).toBeGreaterThan(0);
  });

  it("summaries group items by category and event", async () => {
    const generated = generateChecklist({
      ...baseWedding,
      weddingId: "wedding-summary",
    });
    const summary = getChecklistSummary("wedding-summary");
    expect(summary?.groups.byCategory.jewelry.count).toBeGreaterThan(0);
    expect(summary?.groups.byEvent["event-poruwa"].count).toBeGreaterThan(0);
    expect(summary?.items.length).toBe(generated.items.length);
  });

  it("updates checklist item status and notes via store helper", async () => {
    const generated = generateChecklist({
      ...baseWedding,
      weddingId: "wedding-patch",
    });
    const targetItem = generated.items[0];

    updateChecklistItems("wedding-patch", (items) =>
      items.map((item) =>
        item.id === targetItem.id
          ? {
              ...item,
              status: "done",
              notes: "completed",
              dueDate: "2025-12-01",
              jewelryOwner: "bride-family",
              jewelryType: "necklace",
            }
          : item
      )
    );

    const located = findItemById(targetItem.id);
    expect(located?.item.status).toBe("done");
    expect(located?.item.notes).toBe("completed");
    expect(located?.item.dueDate).toBe("2025-12-01");
    expect(located?.item.jewelryOwner).toBe("bride-family");
    expect(located?.item.jewelryType).toBe("necklace");
  });
});
