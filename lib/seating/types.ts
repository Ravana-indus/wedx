// Seating types for wedX

export interface SeatingTable {
  id: string;
  weddingId: string;
  eventId: string;
  name: string;          // e.g. 'Table 1', 'Family Table A'
  capacity?: number;     // max seats
  section?: string;      // e.g. 'Front', 'Balcony', 'VIP'
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface SeatingAssignment {
  id: string;
  weddingId: string;
  eventId: string;
  tableId: string;
  guestId: string;
  notes?: string;        // e.g. 'Needs wheelchair access'
  createdAt: Date;
  updatedAt: Date;
}

// Extended types for API responses
export interface SeatingTableWithCount extends SeatingTable {
  assignedCount: number;
}

export interface SeatingAssignmentWithDetails extends SeatingAssignment {
  guest: {
    id: string;
    name: string;
    household?: {
      id: string;
      name: string;
    };
    side?: 'bride' | 'groom' | 'both';
  };
  table: {
    id: string;
    name: string;
    capacity?: number;
  };
}

// API Request/Response types
export interface CreateSeatingTableRequest {
  name: string;
  capacity?: number;
  section?: string;
  notes?: string;
}

export interface UpdateSeatingTableRequest {
  name?: string;
  capacity?: number;
  section?: string;
  notes?: string;
}

export interface UpsertSeatingAssignmentsRequest {
  assignments: {
    guestId: string;
    tableId: string;
    notes?: string;
  }[];
}

export interface GetSeatingTablesResponse {
  eventId: string;
  tables: SeatingTableWithCount[];
}

export interface EventAttendingGuestsResponse {
  eventId: string;
  guests: Array<{
    id: string;
    name: string;
    household?: {
      id: string;
      name: string;
    };
    side?: 'bride' | 'groom' | 'both';
    invitation?: {
      id: string;
      status: 'invited' | 'accepted' | 'maybe' | 'declined' | 'not_invited';
      dietary?: string;
      plusOne?: boolean;
    };
  }>;
}

export interface EventSeatingAssignmentsResponse {
  eventId: string;
  assignments: SeatingAssignmentWithDetails[];
}