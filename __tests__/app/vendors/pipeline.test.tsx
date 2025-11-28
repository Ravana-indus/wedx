import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import VendorPipelinePage from "@/app/vendors/pipeline/page";
import { listVendors, updateVendorStatus } from "@/lib/api/vendors";

jest.mock("next/link", () => ({
  __esModule: true,
  default: ({ children, ...props }: any) => <a {...props}>{children}</a>,
}));

jest.mock("@/lib/api/vendors", () => ({
  listVendors: jest.fn(),
  updateVendorStatus: jest.fn(),
}));

const vendors = [
  {
    id: "v1",
    weddingId: "demo-wedding",
    name: "Sunrise Photography",
    category: "photography",
    status: "shortlisted",
    linkedEventIds: ["event-1"],
    createdAt: "2025-11-29T00:00:00.000Z",
    updatedAt: "2025-11-29T00:00:00.000Z",
  },
  {
    id: "v2",
    weddingId: "demo-wedding",
    name: "Emerald Decor",
    category: "decor",
    status: "booked",
    linkedEventIds: ["event-2"],
    createdAt: "2025-11-29T00:00:00.000Z",
    updatedAt: "2025-11-29T00:00:00.000Z",
  },
];

describe("VendorPipelinePage", () => {
  const user = userEvent.setup();

  beforeEach(() => {
    (listVendors as jest.Mock).mockResolvedValue(vendors);
    (updateVendorStatus as jest.Mock).mockResolvedValue({ ...vendors[0], status: "booked" });
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  it("renders columns and groups vendors by status", async () => {
    render(<VendorPipelinePage />);
    expect(await screen.findByText("Status by stage")).toBeInTheDocument();
    await waitFor(() => expect(listVendors).toHaveBeenCalled());
    expect(await screen.findByText("Sunrise Photography")).toBeInTheDocument();
    expect(await screen.findByText("Emerald Decor")).toBeInTheDocument();
    expect(screen.getAllByText("Shortlisted").length).toBeGreaterThan(0);
  });

  it("changes vendor status from dropdown", async () => {
    render(<VendorPipelinePage />);
    const selector = await screen.findByLabelText("Move Sunrise Photography");
    await user.selectOptions(selector, "booked");
    await waitFor(() =>
      expect(updateVendorStatus).toHaveBeenCalledWith("v1", { status: "booked" })
    );
  });
});
