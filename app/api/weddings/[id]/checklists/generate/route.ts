import { NextRequest } from "next/server";
import { generateChecklist } from "@/lib/checklists/generator";
import { ok, badRequest } from "@/lib/api/responses";
import { WeddingContext, WeddingEvent, WeddingRitual } from "@/lib/checklists/types";

type GenerateBody = {
  weddingType?: string;
  events?: WeddingEvent[];
  rituals?: WeddingRitual[];
};

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const weddingId = params.id;
  let body: GenerateBody = {};

  try {
    body = await req.json();
  } catch (error) {
    return badRequest("Invalid JSON body", error);
  }

  const context: WeddingContext = {
    weddingId,
    weddingType: body.weddingType,
    events: body.events ?? [],
    rituals: body.rituals ?? [],
  };

  const result = generateChecklist(context);

  return ok({
    checklist: result.checklist,
    items: result.items,
  });
}
