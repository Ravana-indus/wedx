import { NextRequest } from "next/server";
import { getChecklistSummary } from "@/lib/checklists/generator";
import { ok, notFound } from "@/lib/api/responses";

export async function GET(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  const summary = getChecklistSummary(params.id);
  if (!summary) {
    return notFound("Checklist not generated yet for this wedding");
  }

  return ok(summary);
}
