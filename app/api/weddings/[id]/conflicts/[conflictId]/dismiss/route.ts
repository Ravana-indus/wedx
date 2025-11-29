import { NextRequest, NextResponse } from 'next/server';

// POST /api/weddings/[id]/conflicts/[conflictId]/dismiss
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string; conflictId: string } }
) {
  try {
    const weddingId = params.id;
    const conflictId = params.conflictId;
    const body = await request.json();
    
    const { reason } = body;
    
    if (!reason || reason.trim().length === 0) {
      return NextResponse.json(
        { error: 'Reason for dismissal is required' },
        { status: 400 }
      );
    }
    
    // In a real implementation, this would:
    // 1. Fetch the conflict from database
    // 2. Update the conflict status to 'dismissed'
    // 3. Store the dismissal reason
    // 4. Return success response
    
    // For now, return a mock success response
    return NextResponse.json({
      success: true,
      message: 'Conflict dismissed successfully',
      conflictId,
      dismissalReason: reason,
      dismissedAt: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error dismissing conflict:', error);
    return NextResponse.json(
      { error: 'Failed to dismiss conflict' },
      { status: 500 }
    );
  }
}