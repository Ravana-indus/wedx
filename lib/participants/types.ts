export type WeddingParticipantRole =
  | "bride"
  | "groom"
  | "bride-parent"
  | "groom-parent"
  | "sibling"
  | "friend"
  | "other";

export type WeddingParticipant = {
  id: string;
  weddingId: string;
  name: string;
  role: WeddingParticipantRole;
  contactEmail?: string;
  contactPhone?: string;
  isPrimary?: boolean;
};
