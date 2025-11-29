import { NextRequest } from "next/server";
import { badRequest, notFound, ok } from "@/lib/api/responses";
import { 
  getBudgetLineItemById,
  updateBudgetLineItem,
  deleteBudgetLineItem
} from "@/lib/budget/store";

// GET /api/budget/line-items/[lineItemId]
export async function GET(
  _req: NextRequest,
  { params }: { params: { lineItemId: string } }
) {
  try {
    const { lineItemId } = params;
    const lineItem = await getBudgetLineItemById(lineItemId);
    
    if (!lineItem) {
      return notFound('Budget line item not found');
    }
    
    return ok(lineItem);
  } catch (error) {
    console.error('Error fetching budget line item:', error);
    return badRequest('Failed to fetch budget line item');
  }
}

// PATCH /api/budget/line-items/[lineItemId]
export async function PATCH(
  req: NextRequest,
  { params }: { params: { lineItemId: string } }
) {
  try {
    const { lineItemId } = params;
    const body = await req.json();
    
    // Validate that line item exists
    const existingLineItem = await getBudgetLineItemById(lineItemId);
    if (!existingLineItem) {
      return notFound('Budget line item not found');
    }

    const data: {
      categoryId?: string;
      eventId?: string;
      vendorId?: string;
      name?: string;
      description?: string;
      plannedAmount?: number;
      actualAmount?: number;
      currency?: string;
      notes?: string;
    } = {};
    
    if (body.name !== undefined) {
      if (typeof body.name !== 'string' || !body.name.trim()) {
        return badRequest('Line item name must be a non-empty string');
      }
      data.name = body.name;
    }
    
    if (body.categoryId !== undefined) {
      if (typeof body.categoryId !== 'string') {
        return badRequest('Category ID must be a string');
      }
      data.categoryId = body.categoryId;
    }
    
    if (body.plannedAmount !== undefined) {
      if (typeof body.plannedAmount !== 'number' || body.plannedAmount < 0) {
        return badRequest('Planned amount must be a non-negative number');
      }
      data.plannedAmount = body.plannedAmount;
    }
    
    if (body.actualAmount !== undefined) {
      if (typeof body.actualAmount !== 'number' || body.actualAmount < 0) {
        return badRequest('Actual amount must be a non-negative number');
      }
      data.actualAmount = body.actualAmount;
    }
    
    if (body.currency !== undefined) {
      if (typeof body.currency !== 'string') {
        return badRequest('Currency must be a string');
      }
      data.currency = body.currency;
    }
    
    if (body.eventId !== undefined) {
      data.eventId = body.eventId;
    }
    
    if (body.vendorId !== undefined) {
      data.vendorId = body.vendorId;
    }
    
    if (body.description !== undefined) {
      data.description = body.description;
    }
    
    if (body.notes !== undefined) {
      data.notes = body.notes;
    }

    const updatedLineItem = await updateBudgetLineItem(lineItemId, data);
    
    if (!updatedLineItem) {
      return badRequest('Failed to update budget line item');
    }
    
    return ok(updatedLineItem);
  } catch (error) {
    console.error('Error updating budget line item:', error);
    if (error instanceof Error && error.message.includes('not found')) {
      return notFound(error.message);
    }
    return badRequest('Failed to update budget line item');
  }
}

// DELETE /api/budget/line-items/[lineItemId]
export async function DELETE(
  _req: NextRequest,
  { params }: { params: { lineItemId: string } }
) {
  try {
    const { lineItemId } = params;
    
    // Validate that line item exists
    const existingLineItem = await getBudgetLineItemById(lineItemId);
    if (!existingLineItem) {
      return notFound('Budget line item not found');
    }

    const success = await deleteBudgetLineItem(lineItemId);
    
    if (!success) {
      return badRequest('Failed to delete budget line item');
    }
    
    return ok({ message: 'Budget line item deleted successfully' });
  } catch (error) {
    console.error('Error deleting budget line item:', error);
    return badRequest('Failed to delete budget line item');
  }
}