/**
 * AI Planner types for wedX
 */

export interface AiPlannerRequest {
  question: string;
  focus?: 'checklists' | 'vendors' | 'budget' | 'guests' | 'rituals' | 'overall';
}

export interface AiPlannerResponse {
  suggestions: AiPlannerSuggestion[];
  notes?: string;
  relatedEntities?: RelatedEntity[];
}

export interface AiPlannerSuggestion {
  id: string;
  title: string;
  description: string;
  category: 'checklist' | 'vendor' | 'budget' | 'guest' | 'ritual' | 'other';
  priority: 'high' | 'medium' | 'low';
  relatedIds?: RelatedIds;
}

export interface RelatedIds {
  checklistItemIds?: string[];
  eventIds?: string[];
  vendorIds?: string[];
  guestIds?: string[];
  budgetLineItemIds?: string[];
}

export interface RelatedEntity {
  type: 'event' | 'task' | 'vendor' | 'guest' | 'budget' | 'ritual';
  id: string;
  name: string;
  context: string;
}

export interface FocusArea {
  value: 'overall' | 'checklists' | 'vendors' | 'budget' | 'guests' | 'rituals';
  label: string;
  description: string;
}

export const FOCUS_AREAS: FocusArea[] = [
  {
    value: 'overall',
    label: 'Overall',
    description: 'Get suggestions across all areas'
  },
  {
    value: 'checklists',
    label: 'Checklists',
    description: 'Focus on tasks and checklist items'
  },
  {
    value: 'vendors',
    label: 'Vendors',
    description: 'Focus on vendor-related suggestions'
  },
  {
    value: 'budget',
    label: 'Budget',
    description: 'Focus on budget and financial suggestions'
  },
  {
    value: 'guests',
    label: 'Guests',
    description: 'Focus on guest management suggestions'
  },
  {
    value: 'rituals',
    label: 'Rituals',
    description: 'Focus on ceremony and ritual suggestions'
  }
];

export const DEFAULT_QUESTIONS = [
  "What should we focus on this week?",
  "What are we missing for the Poruwa ceremony?",
  "Which vendors should we book next?",
  "Are there any budget concerns we should address?",
  "What guests need follow-up?",
  "What rituals need preparation?"
];