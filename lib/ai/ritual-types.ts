// Types for ritual-based task generation and conflict detection

export interface RitualTask {
  id: string;
  title: string;
  description: string;
  category: 'ritual' | 'vendor' | 'logistics' | 'attire' | 'food' | 'decoration';
  priority: 'high' | 'medium' | 'low';
  ritualType: string;
  estimatedDaysBeforeEvent: number;
  recommendedVendorTypes?: string[];
  checklistItemIds?: string[];
  dependencies?: string[]; // Task IDs that must be completed first
  culturalNotes?: string;
}

export interface RitualTemplate {
  ritualType: string;
  displayName: string;
  description: string;
  tasks: RitualTask[];
  timingConstraints?: {
    minDaysBeforeWedding?: number;
    maxDaysBeforeWedding?: number;
    auspiciousDates?: string[]; // ISO date strings
    avoidDates?: string[]; // ISO date strings
  };
  vendorRequirements?: {
    requiredTypes: string[];
    optionalTypes: string[];
    culturalPreferences?: string[];
  };
}

export interface Conflict {
  id: string;
  type: 'timing' | 'vendor' | 'resource' | 'cultural';
  severity: 'warning' | 'critical';
  title: string;
  description: string;
  affectedEvents: string[];
  affectedVendors: string[];
  resolutionOptions: ConflictResolutionOption[];
  createdAt: string;
  status: 'active' | 'resolved' | 'dismissed';
}

export interface ConflictResolutionOption {
  id: string;
  type: 'reschedule' | 'change_vendor' | 'add_resource' | 'dismiss';
  title: string;
  description: string;
  estimatedEffort: 'low' | 'medium' | 'high';
  actionRequired?: string;
  autoResolvable?: boolean;
}

export interface TimingConflict extends Conflict {
  type: 'timing';
  conflictingEvents: {
    eventId: string;
    eventName: string;
    startTime: string;
    endTime: string;
    overlapDuration: number; // in minutes
  }[];
  recommendedSlots?: {
    date: string;
    startTime: string;
    endTime: string;
    reason: string;
  }[];
}

export interface VendorConflict extends Conflict {
  type: 'vendor';
  vendorId: string;
  vendorName: string;
  conflictingBookings: {
    eventId: string;
    eventName: string;
    serviceType: string;
    date: string;
    time: string;
  }[];
  alternativeVendors?: {
    vendorId: string;
    vendorName: string;
    matchScore: number;
    availability: string[];
  }[];
}

export interface CulturalConflict extends Conflict {
  type: 'cultural';
  tradition: string;
  violation: string;
  culturalContext: string;
  alternativeSuggestions: string[];
}

export interface RitualTaskGenerationRequest {
  weddingId: string;
  rituals: string[]; // List of ritual types
  weddingDate: string; // ISO date string
  currentEvents: Array<{
    id: string;
    name: string;
    date: string;
    startTime?: string;
    endTime?: string;
  }>;
  currentVendors: Array<{
    id: string;
    name: string;
    serviceTypes: string[];
    bookedEvents: string[];
  }>;
}

export interface RitualTaskGenerationResponse {
  tasks: RitualTask[];
  conflicts: Conflict[];
  recommendations: string[];
  culturalNotes: string[];
}

export interface ConflictDetectionRequest {
  weddingId: string;
  events: Array<{
    id: string;
    name: string;
    date: string;
    startTime?: string;
    endTime?: string;
    vendorIds: string[];
  }>;
  vendors: Array<{
    id: string;
    name: string;
    serviceTypes: string[];
    availability: string[];
    culturalSpecialties?: string[];
  }>;
  weddingType: string;
  culturalPreferences?: string[];
}

export interface ConflictDetectionResponse {
  conflicts: Conflict[];
  warnings: string[];
  suggestions: string[];
  riskAssessment: {
    overallRisk: 'low' | 'medium' | 'high';
    criticalIssues: number;
    warnings: number;
    recommendations: number;
  };
}

// Common ritual types for Sri Lankan weddings
export const COMMON_RITUALS = {
  PORUWA: 'poruwa',
  HOME_COMING: 'home_coming',
  RECEPTION: 'reception',
  REGISTER_MARRIAGE: 'register_marriage',
  RELIGIOUS_CEREMONY: 'religious_ceremony',
  ENGAGEMENT: 'engagement',
  NALANGU: 'nalangu',
  JAYAMANGALA_GATHA: 'jayamangala_gatha',
  ASHTAKA: 'ashtaka',
  KANDYAN_DANCE: 'kandyan_dance',
  MAGUL_BERA: 'magul_bera'
} as const;

export type RitualType = typeof COMMON_RITUALS[keyof typeof COMMON_RITUALS];