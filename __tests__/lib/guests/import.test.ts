import { importGuestsFromCSV } from "@/lib/guests/import";
import { listHouseholdsWithGuests } from "@/lib/guests/store";

describe("guest CSV import", () => {
  it("creates households and guests from CSV", () => {
    const csv = [
      "household,first_name,last_name,email",
      "Perera,Sunil,Perera,sunil@example.com",
      "Perera,Amaya,Perera,amaya@example.com",
      "Fernando,Asha,,asha@example.com",
    ].join("\n");

    const summary = importGuestsFromCSV("w-csv", csv);
    expect(summary.guestsCreated).toBe(3);
    expect(summary.householdsCreated).toBe(2);
    expect(summary.errors.length).toBe(0);

    const households = listHouseholdsWithGuests("w-csv");
    const perera = households.find((h) => h.name === "Perera");
    expect(perera?.guests.length).toBe(2);
  });

  it("records errors for rows without names", () => {
    const csv = ["household,first_name", "", ","].join("\n");
    const summary = importGuestsFromCSV("w-csv2", csv);
    expect(summary.errors.length).toBeGreaterThan(0);
  });
});
