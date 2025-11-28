/**
 * Vendor directory tests mock API helpers to keep UI deterministic.
 */
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import VendorsPage from "@/app/vendors/page";
import {
  createVendor,
  listVendors,
  updateVendor,
  updateVendorStatus,
} from "@/lib/api/vendors";
jest.mock("@/lib/api/vendors", () => ({
  listVendors: jest.fn(),
  createVendor: jest.fn(),
  updateVendor: jest.fn(),
  updateVendorStatus: jest.fn(),
  logWhatsApp: jest.fn(),
}));

const vendor = {
  id: "v1",
  weddingId: "demo-wedding",
  name: "Sunrise Photography",
  category: "photography",
  contactPhone: "+94 77 123 4567",
  whatsappNumber: "+94 77 123 4567",
  websiteUrl: "https://example.com",
  instagramHandle: "@sunrise",
  linkedEventIds: ["event-1"],
  status: "shortlisted",
  priority: "high",
  createdAt: "2025-11-29T00:00:00.000Z",
  updatedAt: "2025-11-29T00:00:00.000Z",
};

describe("VendorsPage", () => {
  const user = userEvent.setup();
  beforeEach(() => {
    (listVendors as jest.Mock).mockResolvedValue([vendor]);
    (createVendor as jest.Mock).mockResolvedValue({ ...vendor, id: "v2" });
    (updateVendor as jest.Mock).mockResolvedValue({
      ...vendor,
      linkedEventIds: ["event-1", "event-2"],
    });
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  it("renders vendor list from API", async () => {
    render(<VendorsPage />);
    expect(await screen.findByText("Sunrise Photography")).toBeInTheDocument();
    expect(listVendors).toHaveBeenCalled();
  });

  it("creates vendor via form", async () => {
    render(<VendorsPage />);
    await waitFor(() => expect(listVendors).toHaveBeenCalled());

    await user.type(screen.getByLabelText("Name"), "Test Vendor");
    await user.click(screen.getByText("Save vendor"));

    await waitFor(() =>
      expect(createVendor).toHaveBeenCalledWith(
        expect.objectContaining({ name: "Test Vendor" })
      )
    );
  });

  it("updates event links", async () => {
    render(<VendorsPage />);
    await screen.findByText("Sunrise Photography");
    const checkbox = screen.getByLabelText("Reception for Sunrise Photography");
    await user.click(checkbox);
    await waitFor(() =>
      expect(updateVendor).toHaveBeenCalledWith("v1", {
        linkedEventIds: ["event-1", "event-2"],
      })
    );
  });

  it("changes vendor status via dropdown", async () => {
    (updateVendorStatus as jest.Mock).mockResolvedValue({ ...vendor, status: "booked" });
    render(<VendorsPage />);
    await screen.findByText("Sunrise Photography");
    await user.selectOptions(
      screen.getByLabelText("Status for Sunrise Photography"),
      "booked"
    );
    await waitFor(() =>
      expect(updateVendorStatus).toHaveBeenCalledWith("v1", { status: "booked" })
    );
  });

  it("opens WhatsApp link button when number exists", async () => {
    render(<VendorsPage />);
    await screen.findByText("Sunrise Photography");
    expect(screen.getByText("Message on WhatsApp")).toBeInTheDocument();
  });
});
