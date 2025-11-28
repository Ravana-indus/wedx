import {
  addGuest,
  addHousehold,
  findGuest,
  findHousehold,
  listGuests,
  listHouseholds,
  listHouseholdsWithGuests,
  updateGuest,
  updateHousehold,
} from "@/lib/guests/store";

describe("guests store", () => {
  it("adds households and guests and nests correctly", () => {
    const household = addHousehold("w1", { name: "Perera Family" });
    const guest = addGuest("w1", { firstName: "Sunil", householdId: household.id });
    expect(listHouseholds("w1")).toEqual(expect.arrayContaining([household]));
    expect(listGuests("w1")).toEqual(expect.arrayContaining([guest]));
    const householdsWithGuests = listHouseholdsWithGuests("w1");
    expect(householdsWithGuests[0].guests.map((g) => g.id)).toContain(guest.id);
  });

  it("updates households and guests", () => {
    const household = addHousehold("w2", { name: "Fernando" });
    const guest = addGuest("w2", { firstName: "Asha", householdId: household.id });
    const updatedHousehold = updateHousehold(household.id, (h) => ({ ...h, city: "Colombo" }));
    const updatedGuest = updateGuest(guest.id, (g) => ({ ...g, role: "family" }));
    expect(updatedHousehold?.city).toBe("Colombo");
    expect(updatedGuest?.role).toBe("family");
    expect(findHousehold(household.id)?.household.city).toBe("Colombo");
    expect(findGuest(guest.id)?.guest.role).toBe("family");
  });
});
