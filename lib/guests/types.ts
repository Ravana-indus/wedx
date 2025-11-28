export type Household = {
  id: string;
  weddingId: string;
  name: string;
  addressLine1?: string;
  addressLine2?: string;
  city?: string;
  region?: string;
  postalCode?: string;
  country?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
};

export type Guest = {
  id: string;
  weddingId: string;
  householdId?: string;
  firstName: string;
  lastName?: string;
  displayName?: string;
  email?: string;
  phone?: string;
  whatsappNumber?: string;
  role?: string;
  side?: string;
  isChild?: boolean;
  notes?: string;
  createdAt: string;
  updatedAt: string;
};

export type HouseholdWithGuests = Household & { guests: Guest[] };
