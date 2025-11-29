import { NextRequest, NextResponse } from 'next/server';
import { getEventBudgetSummary } from '@/lib/budget/store';

export async function GET(
  request: NextRequest,
  { params }: { params: { eventId: string } }
) {
  try {
    const { eventId } = params;
    
    if (!eventId) {
      return NextResponse.json(
        { error: 'Event ID is required' },
        { status: 400 }
      );
    }

    // For now, use mock wedding ID - in real implementation would get from auth/session
    const weddingId = 'mock-wedding-id';
    
    const budgetSummary = await getEventBudgetSummary(weddingId, eventId);
    
    return NextResponse.json({
      data: {
        ...budgetSummary,
        currency: 'LKR' // Default currency for now
      }
    });
  } catch (error) {
    console.error('Error fetching event budget summary:', error);
    return NextResponse.json(
      { error: 'Failed to fetch event budget summary' },
      { status: 500 }
    );
  }
}