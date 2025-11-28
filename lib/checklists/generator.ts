import { checklistTemplates } from "./templates";
import {
  Checklist,
  ChecklistItem,
  ChecklistTemplate,
  WeddingContext,
  WeddingEvent,
  WeddingRitual,
} from "./types";
import {
  createChecklist,
  saveChecklist,
  summarizeChecklist,
  getChecklistRecord,
} from "./store";

type GenerateResult = {
  checklist: Checklist;
  items: ChecklistItem[];
};

function generateId(prefix: string) {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return `${prefix}_${crypto.randomUUID()}`;
  }
  return `${prefix}_${Math.random().toString(36).slice(2, 10)}`;
}

function matchesWeddingType(
  template: ChecklistTemplate,
  weddingType?: string
): boolean {
  if (!template.weddingTypes || template.weddingTypes.length === 0) return true;
  if (!weddingType) return false;
  return template.weddingTypes.includes(weddingType.toLowerCase());
}

function buildItemsForTemplates(params: {
  templates: ChecklistTemplate[];
  weddingId: string;
  checklistId: string;
  events: WeddingEvent[];
  rituals: WeddingRitual[];
}) {
  const { templates, weddingId, checklistId, events, rituals } = params;
  const now = new Date().toISOString();
  const items: ChecklistItem[] = [];

  templates.forEach((template, index) => {
    // Event-specific templates
    const matchedEvents =
      template.eventTypes && template.eventTypes.length > 0
        ? events.filter(
            (event) =>
              event.type && template.eventTypes!.includes(event.type.toLowerCase())
          )
        : [undefined];

    // Ritual-specific templates
    const matchedRituals =
      template.ritualKeys && template.ritualKeys.length > 0
        ? rituals.filter((ritual) => template.ritualKeys!.includes(ritual.key))
        : [undefined];

    matchedEvents.forEach((event) => {
      matchedRituals.forEach((ritual) => {
        // If template expects ritual and event but none match, skip
        if (
          template.ritualKeys &&
          template.ritualKeys.length > 0 &&
          !ritual
        ) {
          return;
        }
        if (
          template.eventTypes &&
          template.eventTypes.length > 0 &&
          !event
        ) {
          return;
        }

        items.push({
          id: generateId("chk_item"),
          checklistId,
          templateId: template.id,
          title: template.title,
          description: template.description,
          type: template.type,
          category: template.category,
          timeBucket: template.timeBucket,
          eventId: event?.id,
          ritualId: ritual?.id,
          isJewelry: Boolean(template.isJewelry),
          jewelryType: template.jewelryType,
          jewelryOwner: template.defaultOwner,
          assigneeId: null,
          assigneeRole: null,
          status: "todo",
          dueDate: null,
          notes: null,
          orderIndex: index,
          priority: template.priority,
          createdAt: now,
          updatedAt: now,
        });
      });
    });
  });

  return items;
}

export function generateChecklist(context: WeddingContext): GenerateResult {
  const { weddingId, weddingType, events = [], rituals = [] } = context;
  const checklist =
    getChecklistRecord(weddingId)?.checklist ?? createChecklist(weddingId);

  const filteredTemplates = checklistTemplates.filter((template) =>
    matchesWeddingType(template, weddingType)
  );

  const items = buildItemsForTemplates({
    templates: filteredTemplates,
    weddingId,
    checklistId: checklist.id,
    events,
    rituals,
  });

  const result = { checklist, items };
  saveChecklist(weddingId, checklist, items);
  return result;
}

export function getChecklistSummary(weddingId: string) {
  const record = getChecklistRecord(weddingId);
  if (!record) return undefined;
  return summarizeChecklist(record);
}
