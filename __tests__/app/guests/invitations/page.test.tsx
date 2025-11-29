import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import InvitationsPage from "@/app/guests/invitations/page";
import { listHouseholds } from "@/lib/api/guests";
import {
  fetchRsvpSummary,
  listInvitations,
  saveInvitations,
  updateInvitation,
} from "@/lib/api/invitations";

jest.mock("@/lib/api/guests", () => ({
  listHouseholds: jest.fn(),
}));

jest.mock("@/lib/api/invitations", () => ({
  listInvitations: jest.fn(),
  saveInvitations: jest.fn(),
  updateInvitation: jest.fn(),
  fetchRsvpSummary: jest.fn(),
  statusOptions: jest.requireActual("@/lib/api/invitations").statusOptions,
}));

const households = [
  {
    id: "h1",
    weddingId: "demo-wedding",
    name: "Perera Family",
    guests: [
      {
        id: "g1",
        weddingId: "demo-wedding",
        householdId: "h1",
        firstName: "Sunil",
        displayName: "Uncle Sunil",
        createdAt: "2025-11-29T00:00:00.000Z",
        updatedAt: "2025-11-29T00:00:00.000Z",
      },
    ],
    createdAt: "2025-11-29T00:00:00.000Z",
    updatedAt: "2025-11-29T00:00:00.000Z",
  },
];

const invitations = [
  {
    id: "i1",
    weddingId: "demo-wedding",
    eventId: "event-1",
    guestId: "g1",
    inviteLevel: "guest" as const,
    status: "invited" as const,
    createdAt: "2025-11-29T00:00:00.000Z",
    lastUpdatedAt: "2025-11-29T00:00:00.000Z",
  },
];

describe("InvitationsPage", () => {
  const user = userEvent.setup();

  beforeEach(() => {
    (listHouseholds as jest.Mock).mockResolvedValue(households);
    (listInvitations as jest.Mock).mockResolvedValue(invitations);
    (fetchRsvpSummary as jest.Mock).mockResolvedValue({ invited: 1, accepted: 0, declined: 0, maybe: 0, not_invited: 0, attendingCount: 0 });
    (saveInvitations as jest.Mock).mockResolvedValue([
      {
        ...invitations[0],
        id: "i2",
        guestId: "g1",
      },
    ]);
    (updateInvitation as jest.Mock).mockResolvedValue({ ...invitations[0], status: "accepted" });
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  it("renders invitations and summary", async () => {
    render(<InvitationsPage />);
    expect(await screen.findByText("Per-event invitations")).toBeInTheDocument();
    await waitFor(() => expect(listInvitations).toHaveBeenCalled());
    await screen.findByText(/Invited 1/i);
  });

  it("adds invitation for a guest", async () => {
    render(<InvitationsPage />);
    await screen.findByText("Perera Family");
    await user.selectOptions(screen.getByLabelText("Guest (optional)"), "g1");
    await waitFor(() => expect(saveInvitations).toHaveBeenCalled());
  });

  it("updates invitation status", async () => {
    render(<InvitationsPage />);
    await screen.findByText("Perera Family");
    await user.selectOptions(screen.getByLabelText(/Status for/), "accepted");
    await waitFor(() => expect(updateInvitation).toHaveBeenCalled());
  });
});
