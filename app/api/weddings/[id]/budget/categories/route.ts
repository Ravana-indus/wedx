import { NextRequest } from "next/server";
import { ok } from "@/lib/api/responses";
import { getBudgetCategoriesForWedding } from "@/lib/budget/store";

// GET /api/weddings/:id/budget/categories
export async function GET(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const weddingId = params.id;
    
    // Get budget categories for this wedding
    const categories = await getBudgetCategoriesForWedding(weddingId);
    
    return ok({ categories });
  } catch (error) {
    console.error('Error fetching budget categories:', error);
    return ok({ error: 'Failed to fetch budget categories' }, 500);
  }
}