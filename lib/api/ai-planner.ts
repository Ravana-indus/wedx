import { AiPlannerRequest, AiPlannerResponse } from '@/lib/ai/types';

/**
 * Call the AI planner API to get suggestions based on user question and wedding context
 */
export async function callAiPlanner(
  weddingId: string,
  body: AiPlannerRequest
): Promise<AiPlannerResponse> {
  try {
    const res = await fetch(`/api/weddings/${weddingId}/ai/planner`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });

    if (!res.ok) {
      const errorData = await res.json().catch(() => ({ error: 'Unknown error' }));
      throw new Error(errorData.error || `AI planner request failed: ${res.status}`);
    }

    const data = await res.json();
    
    // Validate response structure
    if (!data.data || !Array.isArray(data.data.suggestions)) {
      throw new Error('Invalid AI planner response format');
    }

    return data.data;
  } catch (error) {
    if (error instanceof Error) {
      throw error;
    }
    throw new Error('Failed to connect to AI planner service');
  }
}

/**
 * Get quick AI suggestions for Today dashboard (lightweight version)
 */
export async function getQuickAiSuggestions(
  weddingId: string,
  question: string = "What should we focus on this week?"
): Promise<AiPlannerResponse> {
  return callAiPlanner(weddingId, {
    question,
    focus: 'overall'
  });
}

/**
 * Mock AI planner response for development/testing
 */
export function getMockAiPlannerResponse(): AiPlannerResponse {
  return {
    suggestions: [
      {
        id: 'suggestion-1',
        title: 'Book your main venue',
        description: 'Your wedding is in 6 months. Popular venues get booked early, especially for weekend dates.',
        category: 'vendor',
        priority: 'high',
        relatedIds: {
          vendorIds: ['venue-vendor-1']
        }
      },
      {
        id: 'suggestion-2',
        title: 'Finalize guest list',
        description: 'You have 150 invited guests but only 120 confirmed. Consider following up with the remaining 30 guests.',
        category: 'guest',
        priority: 'medium',
        relatedIds: {
          guestIds: ['guest-1', 'guest-2', 'guest-3']
        }
      },
      {
        id: 'suggestion-3',
        title: 'Review catering budget',
        description: 'Your catering budget is at 85% of planned amount. Consider adjusting menu options or guest count.',
        category: 'budget',
        priority: 'medium',
        relatedIds: {
          budgetLineItemIds: ['catering-budget-1']
        }
      }
    ],
    notes: 'Based on your current wedding timeline and progress, these are the most important items to address.',
    relatedEntities: [
      {
        type: 'vendor',
        id: 'venue-vendor-1',
        name: 'Grand Ballroom Hotel',
        context: 'Main reception venue'
      }
    ]
  };
}

/**
 * Get default questions for AI planner
 */
export function getDefaultQuestions(): string[] {
  return [
    "What should we focus on this week?",
    "What are we missing for the Poruwa ceremony?",
    "Which vendors should we book next?",
    "Are there any budget concerns we should address?",
    "What guests need follow-up?",
    "What rituals need preparation?"
  ];
}