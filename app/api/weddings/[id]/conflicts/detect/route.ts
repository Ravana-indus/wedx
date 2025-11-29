import { NextRequest, NextResponse } from 'next/server';
import { conflictDetector } from '@/lib/ai/conflict-detector';

// POST /api/weddings/[id]/conflicts/detect
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const weddingId = params.id;
    const body = await request.json();
    
    const { events, vendors, weddingType, culturalPreferences } = body;
    
    if (!events || !Array.isArray(events)) {
      return NextResponse.json(
        { error: 'Events array is required' },
        { status: 400 }
      );
    }
    
    if (!vendors || !Array.isArray(vendors)) {
      return NextResponse.json(
        { error: 'Vendors array is required' },
        { status: 400 }
      );
    }
    
    if (!weddingType) {
      return NextResponse.json(
        { error: 'Wedding type is required' },
        { status: 400 }
      );
    }
    
    // Detect conflicts
    const response = conflictDetector.detectConflicts({
      weddingId,
      events,
      vendors,
      weddingType,
      culturalPreferences: culturalPreferences || []
    });
    
    return NextResponse.json(response);
  } catch (error) {
    console.error('Error detecting conflicts:', error);
    return NextResponse.json(
      { error: 'Failed to detect conflicts' },
      { status: 500 }
    );
  }
}