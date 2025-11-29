export type InvitationStatus =
  | "not_invited"
  | "invited"
  | "declined"
  | "accepted"
  | "maybe";

export type GuestEventInvitation = {
  id: string;
  weddingId: string;
  eventId: string;
  householdId?: string;
  guestId?: string;
  inviteLevel: "household" | "guest";
  status: InvitationStatus;
  invitedCount?: number;
  attendingCount?: number;
  notes?: string;
  lastUpdatedAt: string;
  createdAt: string;
};
