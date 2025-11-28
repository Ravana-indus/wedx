import { NextRequest } from "next/server";
import { badRequest, notFound, ok } from "@/lib/api/responses";
import {
  ChecklistItemStatus,
  ChecklistItem,
} from "@/lib/checklists/types";
import {
  findItemById,
  updateChecklistItems,
} from "@/lib/checklists/store";

type PatchBody = {
  status?: ChecklistItemStatus;
  notes?: string | null;
  dueDate?: string | null;
  jewelryOwner?: string | null;
  jewelryType?: string | null;
  assigneeId?: string | null;
  assigneeRole?: string | null;
};

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const itemId = params.id;
  let body: PatchBody;

  try {
    body = await req.json();
  } catch (error) {
    return badRequest("Invalid JSON body", error);
  }

  if (!body || (!body.status && !body.notes && !("dueDate" in body))) {
    const hasJewelryOwner = "jewelryOwner" in body;
    const hasJewelryType = "jewelryType" in body;
    const hasAssignee = "assigneeId" in body || "assigneeRole" in body;
    if (!hasJewelryOwner && !hasJewelryType && !hasAssignee) {
      return badRequest(
        "Provide at least one of status, notes, dueDate, jewelryOwner, jewelryType, or assignee"
      );
    }
  }

  if (body.status) {
    const allowed: ChecklistItemStatus[] = ["todo", "in_progress", "done"];
    if (!allowed.includes(body.status)) {
      return badRequest("Invalid status value");
    }
  }

  const located = findItemById(itemId);
  if (!located) {
    return notFound("Checklist item not found");
  }

  const updatedRecord = updateChecklistItems(
    located.weddingId,
    (items: ChecklistItem[]) =>
      items.map((item) =>
        item.id === itemId
          ? {
              ...item,
              status: body.status ?? item.status,
              notes:
                body.notes === undefined
                  ? item.notes ?? null
                  : body.notes,
              dueDate:
                body.dueDate === undefined
                  ? item.dueDate ?? null
                  : body.dueDate,
              jewelryOwner:
                body.jewelryOwner === undefined
                  ? item.jewelryOwner ?? null
                  : body.jewelryOwner,
              jewelryType:
                body.jewelryType === undefined
                  ? item.jewelryType ?? null
                  : body.jewelryType,
              assigneeId:
                body.assigneeId === undefined
                  ? item.assigneeId ?? null
                  : body.assigneeId,
              assigneeRole:
                body.assigneeRole === undefined
                  ? item.assigneeRole ?? null
                  : body.assigneeRole,
              updatedAt: new Date().toISOString(),
            }
          : item
      )
  );

  if (!updatedRecord) {
    return notFound("Checklist item not found");
  }

  const updatedItem = updatedRecord.items.find((item) => item.id === itemId);
  return ok(updatedItem!);
}
