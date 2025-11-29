import { 
  RitualTaskGenerationRequest, 
  RitualTaskGenerationResponse,
  ConflictDetectionRequest,
  ConflictDetectionResponse 
} from '@/lib/ai/ritual-types';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || '';

/**
 * Generate ritual-based tasks for a wedding
 */
export async function generateRitualTasks(
  weddingId: string,
  request: Omit<RitualTaskGenerationRequest, 'weddingId'>
): Promise<RitualTaskGenerationResponse> {
  try {
    const response = await fetch(`${API_BASE_URL}/api/weddings/${weddingId}/ritual-tasks/generate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        ...request,
        weddingId
      }),
    });

    if (!response.ok) {
      throw new Error(`Failed to generate ritual tasks: ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error generating ritual tasks:', error);
    // Return mock data for development
    return getMockRitualTaskResponse();
  }
}

/**
 * Detect conflicts in wedding planning
 */
export async function detectConflicts(
  weddingId: string,
  request: Omit<ConflictDetectionRequest, 'weddingId'>
): Promise<ConflictDetectionResponse> {
  try {
    const response = await fetch(`${API_BASE_URL}/api/weddings/${weddingId}/conflicts/detect`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        ...request,
        weddingId
      }),
    });

    if (!response.ok) {
      throw new Error(`Failed to detect conflicts: ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error detecting conflicts:', error);
    // Return mock data for development
    return getMockConflictDetectionResponse();
  }
}

/**
 * Get conflicts for a wedding
 */
export async function getWeddingConflicts(weddingId: string): Promise<ConflictDetectionResponse> {
  try {
    const response = await fetch(`${API_BASE_URL}/api/weddings/${weddingId}/conflicts`);

    if (!response.ok) {
      throw new Error(`Failed to get conflicts: ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error getting conflicts:', error);
    // Return mock data for development
    return getMockConflictDetectionResponse();
  }
}

/**
 * Resolve a conflict
 */
export async function resolveConflict(
  weddingId: string,
  conflictId: string,
  resolutionId: string
): Promise<{ success: boolean; message: string }> {
  try {
    const response = await fetch(`${API_BASE_URL}/api/weddings/${weddingId}/conflicts/${conflictId}/resolve`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        resolutionId
      }),
    });

    if (!response.ok) {
      throw new Error(`Failed to resolve conflict: ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error resolving conflict:', error);
    return {
      success: false,
      message: 'Failed to resolve conflict'
    };
  }
}

/**
 * Dismiss a conflict
 */
export async function dismissConflict(
  weddingId: string,
  conflictId: string,
  reason?: string
): Promise<{ success: boolean; message: string }> {
  try {
    const response = await fetch(`${API_BASE_URL}/api/weddings/${weddingId}/conflicts/${conflictId}/dismiss`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        reason
      }),
    });

    if (!response.ok) {
      throw new Error(`Failed to dismiss conflict: ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error dismissing conflict:', error);
    return {
      success: false,
      message: 'Failed to dismiss conflict'
    };
  }
}

/**
 * Get ritual timeline for a wedding
 */
export async function getRitualTimeline(
  weddingId: string,
  rituals: string[],
  weddingDate: string
) {
  try {
    const response = await fetch(`${API_BASE_URL}/api/weddings/${weddingId}/ritual-tasks/timeline`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        rituals,
        weddingDate
      }),
    });

    if (!response.ok) {
      throw new Error(`Failed to get ritual timeline: ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error getting ritual timeline:', error);
    // Return mock data for development
    return getMockRitualTimeline();
  }
}

// Mock data for development
export function getMockRitualTaskResponse(): RitualTaskGenerationResponse {
  return {
    tasks: [
      {
        id: 'ritual-task-1',
        title: 'Book Poruwa ceremony venue',
        description: 'Reserve a venue that can accommodate the traditional Poruwa setup with adequate space for guests',
        category: 'logistics',
        priority: 'high',
        ritualType: 'poruwa',
        estimatedDaysBeforeEvent: 90,
        recommendedVendorTypes: ['venue', 'event_planner'],
        culturalNotes: 'The venue should have space for the traditional Poruwa structure and guest seating'
      },
      {
        id: 'ritual-task-2',
        title: 'Hire Poruwa ceremony officiant (Nekath Nilame)',
        description: 'Book an experienced officiant who can conduct the traditional Poruwa ceremony',
        category: 'ritual',
        priority: 'high',
        ritualType: 'poruwa',
        estimatedDaysBeforeEvent: 60,
        recommendedVendorTypes: ['officiant', 'religious_services'],
        culturalNotes: 'The Nekath Nilame should be well-versed in traditional Sinhalese customs'
      }
    ],
    conflicts: [],
    recommendations: [
      'Consider consulting with an experienced astrologer for auspicious timing',
      'Ensure the Poruwa structure faces the correct direction according to tradition'
    ],
    culturalNotes: [
      'The Poruwa ceremony is a sacred tradition that symbolizes the union of two families',
      'Traditional attire adds authenticity and respect to the ceremony'
    ]
  };
}

export function getMockConflictDetectionResponse(): ConflictDetectionResponse {
  return {
    conflicts: [
      {
        id: 'conflict-1',
        type: 'timing',
        severity: 'critical',
        title: 'Event Timing Conflict',
        description: 'Poruwa Ceremony and Reception have overlapping schedules on 2024-06-15',
        affectedEvents: ['event-1', 'event-2'],
        affectedVendors: ['vendor-1', 'vendor-2'],
        resolutionOptions: [
          {
            id: 'resolution-1',
            type: 'reschedule',
            title: 'Reschedule Events',
            description: 'Move Reception to avoid overlap with Poruwa Ceremony',
            estimatedEffort: 'medium',
            actionRequired: 'Contact venues and vendors to check availability for new timing',
            autoResolvable: false
          }
        ],
        createdAt: new Date().toISOString(),
        status: 'active'
      }
    ],
    warnings: [
      '1 critical conflict requires immediate attention',
      'Consider spreading events across multiple days to avoid timing conflicts'
    ],
    suggestions: [
      'Book vendors well in advance and confirm availability for all events',
      'Regularly review and update your wedding timeline'
    ],
    riskAssessment: {
      overallRisk: 'medium',
      criticalIssues: 1,
      warnings: 1,
      recommendations: 2
    }
  };
}

export function getMockRitualTimeline() {
  return [
    {
      ritual: 'poruwa',
      tasks: [
        {
          task: {
            id: 'ritual-task-1',
            title: 'Book Poruwa ceremony venue',
            category: 'logistics',
            priority: 'high',
            estimatedDaysBeforeEvent: 90
          },
          dueDate: '2024-03-15T00:00:00.000Z',
          status: 'upcoming'
        }
      ]
    }
  ];
}