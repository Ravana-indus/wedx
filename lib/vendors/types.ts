export type VendorStatus =
  | "discovered"
  | "shortlisted"
  | "contacted"
  | "quoted"
  | "booked"
  | "backup"
  | "dropped";

export type VendorPriority = "low" | "medium" | "high";

export type Vendor = {
  id: string;
  weddingId: string;
  name: string;
  category?: string;
  contactName?: string;
  contactPhone?: string;
  whatsappNumber?: string;
  websiteUrl?: string;
  instagramHandle?: string;
  notes?: string;
  status: VendorStatus;
  priority?: VendorPriority;
  linkedEventIds?: string[];
  lastContactedAt?: string;
  createdAt: string;
  updatedAt: string;
};
