export type UserRole = "owner" | "collaborator" | "vendor";

export interface UserSession {
  id: string;
  role: UserRole;
  // Future fields: weddingId, email, name
}

