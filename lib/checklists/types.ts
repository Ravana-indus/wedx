export type ChecklistCategory =
  | "venue"
  | "catering"
  | "decor_flowers"
  | "photography"
  | "attire_makeup"
  | "jewelry"
  | "rituals"
  | "documents_legal"
  | "transport"
  | "invitations_rsvp"
  | "guests"
  | "budget"
  | "logistics"
  | "post_wedding"
  | "other";

export type TimeBucket =
  | "6_plus_months"
  | "3_6_months"
  | "1_3_months"
  | "1_month"
  | "1_week"
  | "day_of"
  | "after";

export type ChecklistTemplate = {
  id: string;
  key: string;
  title: string;
  description?: string;
  type: "task" | "item";
  category: ChecklistCategory;
  timeBucket: TimeBucket;
  weddingTypes?: string[];
  eventTypes?: string[];
  ritualKeys?: string[];
  isJewelry?: boolean;
  jewelryType?: string;
  defaultOwner?: string;
  priority?: "low" | "medium" | "high";
};

export type WeddingEvent = {
  id: string;
  name: string;
  type?: string;
};

export type WeddingRitual = {
  id: string;
  key: string;
  eventId?: string;
};

export type WeddingContext = {
  weddingId: string;
  weddingType?: string;
  events?: WeddingEvent[];
  rituals?: WeddingRitual[];
};

export type Checklist = {
  id: string;
  weddingId: string;
  name: string;
  createdAt: string;
  updatedAt: string;
};

export type ChecklistItemStatus = "todo" | "in_progress" | "done";

export type ChecklistItem = {
  id: string;
  checklistId: string;
  templateId?: string;
  title: string;
  description?: string;
  type: "task" | "item";
  category: ChecklistCategory;
  timeBucket: TimeBucket;
  eventId?: string;
  ritualId?: string;
  isJewelry: boolean;
  jewelryType?: string;
  jewelryOwner?: string;
  assigneeId?: string | null;
  assigneeRole?: string | null;
  status: ChecklistItemStatus;
  dueDate?: string | null;
  notes?: string | null;
  orderIndex: number;
  priority?: "low" | "medium" | "high";
  createdAt: string;
  updatedAt: string;
};

export type ChecklistSummary = {
  checklist: Checklist;
  items: ChecklistItem[];
  groups: {
    byTimeBucket: Record<
      TimeBucket,
      { count: number; completed: number; items: ChecklistItem[] }
    >;
    byCategory: Record<
      ChecklistCategory,
      { count: number; completed: number; items: ChecklistItem[] }
    >;
    byEvent: Record<
      string,
      { count: number; completed: number; items: ChecklistItem[] }
    >;
    jewelry?: {
      total: number;
      completed: number;
      byEvent: Record<string, { total: number; completed: number }>;
    };
  };
};
