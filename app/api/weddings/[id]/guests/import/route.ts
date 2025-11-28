import { NextRequest } from "next/server";
import { badRequest, ok } from "@/lib/api/responses";
import { importGuestsFromCSV } from "@/lib/guests/import";

async function readCsvFromRequest(req: NextRequest): Promise<string | null> {
  const contentType = req.headers.get("content-type") || "";
  if (contentType.includes("multipart/form-data")) {
    const formData = await req.formData();
    const file = formData.get("file");
    if (file && typeof file === "object" && "text" in file) {
      return await (file as File).text();
    }
    return null;
  }

  if (contentType.includes("text/csv") || contentType.includes("text/plain")) {
    return await req.text();
  }

  return null;
}

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const csvText = await readCsvFromRequest(req);
  if (!csvText) return badRequest("CSV file is required (text/csv or multipart form)");

  const summary = importGuestsFromCSV(params.id, csvText);
  return ok(summary, 201);
}
