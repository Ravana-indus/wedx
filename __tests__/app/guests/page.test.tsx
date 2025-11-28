import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import GuestsPage from "@/app/guests/page";
import {
  createGuest,
  createHousehold,
  importGuests,
  listHouseholds,
} from "@/lib/api/guests";

jest.mock("@/lib/api/guests", () => ({
  listHouseholds: jest.fn(),
  createHousehold: jest.fn(),
  createGuest: jest.fn(),
  importGuests: jest.fn(),
}));

const households = [
  {
    id: "h1",
    weddingId: "demo-wedding",
    name: "Perera Family",
    city: "Colombo",
    notes: "",
    createdAt: "2025-11-29T00:00:00.000Z",
    updatedAt: "2025-11-29T00:00:00.000Z",
    guests: [
      {
        id: "g1",
        weddingId: "demo-wedding",
        householdId: "h1",
        firstName: "Sunil",
        lastName: "Perera",
        displayName: "Uncle Sunil",
        role: "family",
        side: "groom",
        phone: "+94 77 123 4567",
        createdAt: "2025-11-29T00:00:00.000Z",
        updatedAt: "2025-11-29T00:00:00.000Z",
      },
    ],
  },
];

describe("GuestsPage", () => {
  const user = userEvent.setup();

  beforeEach(() => {
    (listHouseholds as jest.Mock).mockResolvedValue(households);
    (createHousehold as jest.Mock).mockResolvedValue({ ...households[0], id: "h2", name: "Fernando" });
    (createGuest as jest.Mock).mockResolvedValue({
      id: "g2",
      weddingId: "demo-wedding",
      householdId: "h1",
      firstName: "Amaya",
      createdAt: "2025-11-29T00:00:00.000Z",
      updatedAt: "2025-11-29T00:00:00.000Z",
    });
    (importGuests as jest.Mock).mockResolvedValue({
      householdsCreated: 1,
      guestsCreated: 2,
      errors: [],
    });
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  it("renders households and guests", async () => {
    render(<GuestsPage />);
    expect((await screen.findAllByText("Perera Family")).length).toBeGreaterThan(0);
    expect(screen.getByText("Uncle Sunil")).toBeInTheDocument();
  });

  it("adds household from form", async () => {
    render(<GuestsPage />);
    await screen.findAllByText("Perera Family");
    await user.type(screen.getByLabelText("Household name"), "Fernando");
    await user.click(screen.getByText("Save household"));
    await waitFor(() => expect(createHousehold).toHaveBeenCalled());
  });

  it("adds guest from form", async () => {
    render(<GuestsPage />);
    await screen.findAllByText("Perera Family");
    await user.type(screen.getByLabelText("First name"), "Amaya");
    await user.selectOptions(screen.getByLabelText("Household (optional)"), "h1");
    await user.click(screen.getByText("Save guest"));
    await waitFor(() =>
      expect(createGuest).toHaveBeenCalledWith(
        expect.objectContaining({ firstName: "Amaya", householdId: "h1" })
      )
    );
  });

  it("imports CSV and refreshes list", async () => {
    const file = new File(["household,first_name\nPerera,Sunil"], "guests.csv", { type: "text/csv" });
    render(<GuestsPage />);
    await screen.findAllByText("Perera Family");
    const input = screen.getByLabelText(/file/i) as HTMLInputElement;
    await user.upload(input, file);
    await user.click(screen.getByText("Import CSV"));
    await waitFor(() => expect(importGuests).toHaveBeenCalled());
  });
});
