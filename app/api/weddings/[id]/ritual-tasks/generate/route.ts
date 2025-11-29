import { NextRequest, NextResponse } from 'next/server';
import { ritualTaskGenerator } from '@/lib/ai/ritual-task-generator';

// POST /api/weddings/[id]/ritual-tasks/generate
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const weddingId = params.id;
    const body = await request.json();
    
    const { rituals, weddingDate, currentEvents, currentVendors } = body;
    
    if (!rituals || !Array.isArray(rituals) || rituals.length === 0) {
      return NextResponse.json(
        { error: 'Rituals array is required' },
        { status: 400 }
      );
    }
    
    if (!weddingDate) {
      return NextResponse.json(
        { error: 'Wedding date is required' },
        { status: 400 }
      );
    }
    
    // Generate ritual tasks
    const response = ritualTaskGenerator.generateTasks({
      weddingId,
      rituals,
      weddingDate,
      currentEvents: currentEvents || [],
      currentVendors: currentVendors || []
    });
    
    return NextResponse.json(response);
  } catch (error) {
    console.error('Error generating ritual tasks:', error);
    return NextResponse.json(
      { error: 'Failed to generate ritual tasks' },
      { status: 500 }
    );
  }
}