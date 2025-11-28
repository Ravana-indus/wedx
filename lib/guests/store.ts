import { Guest, Household, HouseholdWithGuests } from "./types";

const householdStore = new Map<string, Household[]>();
const guestStore = new Map<string, Guest[]>();

function generateId(prefix: string) {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return `${prefix}_${crypto.randomUUID()}`;
  }
  return `${prefix}_${Math.random().toString(36).slice(2, 10)}`;
}

function ensureWeddingStores(weddingId: string) {
  if (!householdStore.has(weddingId)) householdStore.set(weddingId, []);
  if (!guestStore.has(weddingId)) guestStore.set(weddingId, []);
}

export function listHouseholds(weddingId: string): Household[] {
  ensureWeddingStores(weddingId);
  return householdStore.get(weddingId)!;
}

export function listGuests(weddingId: string): Guest[] {
  ensureWeddingStores(weddingId);
  return guestStore.get(weddingId)!;
}

export function listHouseholdsWithGuests(weddingId: string): HouseholdWithGuests[] {
  const households = listHouseholds(weddingId);
  const guests = listGuests(weddingId);
  return households.map((household) => ({
    ...household,
    guests: guests.filter((guest) => guest.householdId === household.id),
  }));
}

export function addHousehold(
  weddingId: string,
  input: Omit<Household, "id" | "createdAt" | "updatedAt" | "weddingId">
): Household {
  ensureWeddingStores(weddingId);
  const timestamp = new Date().toISOString();
  const household: Household = {
    id: generateId("household"),
    weddingId,
    createdAt: timestamp,
    updatedAt: timestamp,
    ...input,
  };
  householdStore.get(weddingId)!.push(household);
  return household;
}

export function findHousehold(
  householdId: string
): { weddingId: string; household: Household } | undefined {
  for (const [weddingId, households] of householdStore.entries()) {
    const household = households.find((h) => h.id === householdId);
    if (household) return { weddingId, household };
  }
  return undefined;
}

export function updateHousehold(
  householdId: string,
  updater: (household: Household) => Household
): Household | undefined {
  const located = findHousehold(householdId);
  if (!located) return undefined;
  const { weddingId } = located;
  householdStore.set(
    weddingId,
    householdStore.get(weddingId)!.map((h) =>
      h.id === householdId ? updater({ ...h, updatedAt: new Date().toISOString() }) : h
    )
  );
  return findHousehold(householdId)?.household;
}

export function addGuest(
  weddingId: string,
  input: Omit<Guest, "id" | "createdAt" | "updatedAt" | "weddingId">
): Guest {
  ensureWeddingStores(weddingId);
  const timestamp = new Date().toISOString();
  const guest: Guest = {
    id: generateId("guest"),
    weddingId,
    createdAt: timestamp,
    updatedAt: timestamp,
    ...input,
  };
  guestStore.get(weddingId)!.push(guest);
  return guest;
}

export function findGuest(
  guestId: string
): { weddingId: string; guest: Guest } | undefined {
  for (const [weddingId, guests] of guestStore.entries()) {
    const guest = guests.find((g) => g.id === guestId);
    if (guest) return { weddingId, guest };
  }
  return undefined;
}

export function updateGuest(
  guestId: string,
  updater: (guest: Guest) => Guest
): Guest | undefined {
  const located = findGuest(guestId);
  if (!located) return undefined;
  const { weddingId } = located;
  guestStore.set(
    weddingId,
    guestStore.get(weddingId)!.map((g) =>
      g.id === guestId ? updater({ ...g, updatedAt: new Date().toISOString() }) : g
    )
  );
  return findGuest(guestId)?.guest;
}

export function findOrCreateHouseholdByName(
  weddingId: string,
  name: string
): Household {
  ensureWeddingStores(weddingId);
  const existing = listHouseholds(weddingId).find(
    (h) => h.name.trim().toLowerCase() === name.trim().toLowerCase()
  );
  if (existing) return existing;
  return addHousehold(weddingId, { name: name.trim() });
}
