import {
  addVendor,
  findVendor,
  listVendors,
  listVendorsForEvent,
  updateVendor,
} from "@/lib/vendors/store";

describe("vendor store", () => {
  it("adds and lists vendors", () => {
    const v = addVendor("w1", { name: "Vendor A" });
    const list = listVendors("w1");
    expect(list).toEqual(expect.arrayContaining([v]));
    expect(list[0].status).toBe("shortlisted");
  });

  it("updates vendor fields and event links", () => {
    const v = addVendor("w2", { name: "Vendor B", linkedEventIds: ["event-1"] });
    const updated = updateVendor(v.id, (vendor) => ({
      ...vendor,
      category: "decor",
      linkedEventIds: ["event-1", "event-2"],
      status: "contacted",
    }));
    expect(updated?.category).toBe("decor");
    expect(updated?.status).toBe("contacted");
    expect(updated?.linkedEventIds).toEqual(["event-1", "event-2"]);
    expect(findVendor(v.id)?.vendor.category).toBe("decor");
    const byEvent = listVendorsForEvent("w2", "event-2");
    expect(byEvent.map((i) => i.id)).toContain(v.id);
  });
});
