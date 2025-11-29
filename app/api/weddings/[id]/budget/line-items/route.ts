import { NextRequest } from "next/server";
import { ok, badRequest } from "@/lib/api/responses";
import { 
  getBudgetLineItemsForWedding, 
  createBudgetLineItem 
} from "@/lib/budget/store";
import { BudgetLineItem } from "@/lib/budget/types";

// GET /api/weddings/:id/budget/line-items
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const weddingId = params.id;
    const searchParams = request.nextUrl.searchParams;
    
    // Get optional filters from query params
    const eventId = searchParams.get('eventId') || undefined;
    const vendorId = searchParams.get('vendorId') || undefined;
    const categoryId = searchParams.get('categoryId') || undefined;
    
    // Get budget line items for this wedding with optional filters
    const lineItems = await getBudgetLineItemsForWedding(weddingId);
    
    // Apply filters if provided
    let filteredItems = lineItems;
    if (eventId) {
      filteredItems = filteredItems.filter(item => item.eventId === eventId);
    }
    if (vendorId) {
      filteredItems = filteredItems.filter(item => item.vendorId === vendorId);
    }
    if (categoryId) {
      filteredItems = filteredItems.filter(item => item.categoryId === categoryId);
    }
    
    return ok({ lineItems: filteredItems });
  } catch (error) {
    console.error('Error fetching budget line items:', error);
    return ok({ error: 'Failed to fetch budget line items' }, 500);
  }
}

// POST /api/weddings/:id/budget/line-items
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const weddingId = params.id;
    
    let body: Record<string, unknown>;
    try {
      body = await request.json();
    } catch (error) {
      return badRequest("Invalid JSON body", error);
    }

    // Validate required fields
    if (!body.categoryId || typeof body.categoryId !== 'string') {
      return badRequest("Category ID is required");
    }
    if (!body.name || typeof body.name !== 'string') {
      return badRequest("Name is required");
    }
    if (typeof body.plannedAmount !== 'number' || body.plannedAmount < 0) {
      return badRequest("Planned amount must be a positive number");
    }
    if (!body.currency || typeof body.currency !== 'string') {
      return badRequest("Currency is required");
    }

    // Create the budget line item
    const lineItem = await createBudgetLineItem(weddingId, {
      categoryId: body.categoryId as string,
      eventId: body.eventId as string | undefined,
      vendorId: body.vendorId as string | undefined,
      name: body.name as string,
      description: body.description as string | undefined,
      plannedAmount: body.plannedAmount as number,
      actualAmount: body.actualAmount as number | undefined,
      currency: body.currency as string,
      notes: body.notes as string | undefined
    });

    return ok(lineItem, 201);
  } catch (error) {
    console.error('Error creating budget line item:', error);
    if (error instanceof Error && error.message === 'Budget category not found') {
      return badRequest("Budget category not found");
    }
    return ok({ error: 'Failed to create budget line item' }, 500);
  }
}