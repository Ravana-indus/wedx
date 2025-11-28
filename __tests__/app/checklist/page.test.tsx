/**
 * Checklist UI tests focus on rendering, grouping, and basic filtering logic.
 * API calls are mocked via global fetch to keep tests fast and deterministic.
 */
import { act } from "react-dom/test-utils";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import ChecklistPage from "@/app/checklist/page";
import {
  ensureChecklist,
  fetchParticipants,
  updateChecklistItem,
} from "@/lib/api/checklists";
jest.mock("next/navigation", () => ({
  useSearchParams: () => new URLSearchParams(""),
}));
jest.mock("@/lib/api/checklists", () => ({
  ensureChecklist: jest.fn(),
  fetchParticipants: jest.fn(),
  updateChecklistItem: jest.fn(),
}));
import { ChecklistSummary } from "@/lib/checklists/types";
import { WeddingParticipant } from "@/lib/participants/types";

const participants: WeddingParticipant[] = [
  {
    id: "p1",
    weddingId: "demo-wedding",
    name: "Bride",
    role: "bride",
    isPrimary: true,
  },
  {
    id: "p2",
    weddingId: "demo-wedding",
    name: "Groom",
    role: "groom",
  },
];

const mockSummary: ChecklistSummary = {
  checklist: {
    id: "chk_1",
    weddingId: "demo-wedding",
    name: "Global Wedding Checklist",
    createdAt: "2025-11-29T00:00:00.000Z",
    updatedAt: "2025-11-29T00:00:00.000Z",
  },
  items: [
    {
      id: "item-1",
      checklistId: "chk_1",
      title: "Purchase gold for Thali/Thirumangalyam",
      description: "Jewelry critical path",
      type: "item",
      category: "jewelry",
      timeBucket: "3_6_months",
      eventId: "event-poruwa",
      ritualId: "ritual-poruwa",
      isJewelry: true,
      assigneeId: "p1",
      assigneeRole: "bride",
      status: "todo",
      dueDate: null,
      notes: null,
      orderIndex: 0,
      priority: "high",
      createdAt: "2025-11-29T00:00:00.000Z",
      updatedAt: "2025-11-29T00:00:00.000Z",
    },
    {
      id: "item-2",
      checklistId: "chk_1",
      title: "Reception photography shot list",
      description: "",
      type: "task",
      category: "photography",
      timeBucket: "1_3_months",
      eventId: "event-reception",
      ritualId: undefined,
      isJewelry: false,
      assigneeId: null,
      assigneeRole: null,
      status: "in_progress",
      dueDate: null,
      notes: null,
      orderIndex: 1,
      priority: "medium",
      createdAt: "2025-11-29T00:00:00.000Z",
      updatedAt: "2025-11-29T00:00:00.000Z",
    },
  ],
  groups: {
    byTimeBucket: {
      "6_plus_months": { count: 0, completed: 0, items: [] },
      "3_6_months": { count: 1, completed: 0, items: [] },
      "1_3_months": { count: 1, completed: 0, items: [] },
      "1_month": { count: 0, completed: 0, items: [] },
      "1_week": { count: 0, completed: 0, items: [] },
      day_of: { count: 0, completed: 0, items: [] },
      after: { count: 0, completed: 0, items: [] },
    },
    byCategory: {
      jewelry: { count: 1, completed: 0, items: [] },
      photography: { count: 1, completed: 0, items: [] },
      venue: { count: 0, completed: 0, items: [] },
      catering: { count: 0, completed: 0, items: [] },
      decor_flowers: { count: 0, completed: 0, items: [] },
      attire_makeup: { count: 0, completed: 0, items: [] },
      rituals: { count: 0, completed: 0, items: [] },
      documents_legal: { count: 0, completed: 0, items: [] },
      transport: { count: 0, completed: 0, items: [] },
      invitations_rsvp: { count: 0, completed: 0, items: [] },
      guests: { count: 0, completed: 0, items: [] },
      budget: { count: 0, completed: 0, items: [] },
      logistics: { count: 0, completed: 0, items: [] },
      post_wedding: { count: 0, completed: 0, items: [] },
      other: { count: 0, completed: 0, items: [] },
    },
    byEvent: {
      "event-poruwa": { count: 1, completed: 0, items: [] },
      "event-reception": { count: 1, completed: 0, items: [] },
    },
  },
};

describe("ChecklistPage", () => {
  beforeEach(() => {
    (ensureChecklist as jest.Mock).mockResolvedValue(mockSummary);
    (fetchParticipants as jest.Mock).mockResolvedValue(participants);
    (updateChecklistItem as jest.Mock).mockImplementation((_, payload) => ({
      ...mockSummary.items[0],
      ...payload,
    }));
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  it("renders grouped checklist items", async () => {
    render(<ChecklistPage />);

    await waitFor(() => expect(ensureChecklist).toHaveBeenCalled());
    expect(
      await screen.findByText("Purchase gold for Thali/Thirumangalyam")
    ).toBeInTheDocument();
    expect(
      await screen.findByText("Reception photography shot list")
    ).toBeInTheDocument();
    const headings = await screen.findAllByText("3–6 months before");
    expect(headings.length).toBeGreaterThan(0);
  });

  it("filters by category", async () => {
    render(<ChecklistPage />);
    await screen.findByText("3–6 months before");

    await screen.findByRole("option", { name: "jewelry" });
    await userEvent.selectOptions(screen.getByLabelText("Category"), "jewelry");
    expect(
      screen.getByText("Purchase gold for Thali/Thirumangalyam")
    ).toBeInTheDocument();
    expect(
      screen.queryByText("Reception photography shot list")
    ).not.toBeInTheDocument();
  });

  it("filters by assignee", async () => {
    render(<ChecklistPage />);
    await screen.findByText("Purchase gold for Thali/Thirumangalyam");

    await userEvent.selectOptions(screen.getByLabelText("Assignee"), "p1");
    expect(
      screen.getByText("Purchase gold for Thali/Thirumangalyam")
    ).toBeInTheDocument();
    expect(
      screen.queryByText("Reception photography shot list")
    ).not.toBeInTheDocument();
  });

  it("updates status via toggle", async () => {
    render(<ChecklistPage />);
    await screen.findByText("Purchase gold for Thali/Thirumangalyam");

    const toggleButtons = screen.getAllByRole("button", { name: "Toggle status" });
    await userEvent.click(toggleButtons[0]);

    await waitFor(() => expect(updateChecklistItem).toHaveBeenCalled());
  });

  it("updates assignee via dropdown", async () => {
    render(<ChecklistPage />);
    await screen.findByText("Purchase gold for Thali/Thirumangalyam");

    const select = screen.getAllByLabelText("Assign to")[0];
    await userEvent.selectOptions(select, "p2");

    await waitFor(() =>
      expect(updateChecklistItem).toHaveBeenCalledWith("item-1", {
        assigneeId: "p2",
        assigneeRole: "groom",
      })
    );
  });
});
