import { NextRequest } from "next/server";
import { ok } from "@/lib/api/responses";
import { getBudgetOverview } from "@/lib/budget/store";

// GET /api/weddings/:id/budget/overview
export async function GET(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const weddingId = params.id;
    
    // Get budget overview for this wedding
    const overview = await getBudgetOverview(weddingId);
    
    return ok(overview);
  } catch (error) {
    console.error('Error fetching budget overview:', error);
    return ok({ error: 'Failed to fetch budget overview' }, 500);
  }
}