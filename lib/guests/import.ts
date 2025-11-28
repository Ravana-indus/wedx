import { addGuest, findOrCreateHouseholdByName } from "./store";
import { Guest } from "./types";

type ParsedRow = Record<string, string>;

const householdKeys = ["household", "family", "family_name"];
const firstNameKeys = ["first_name", "firstname", "first", "name"];
const lastNameKeys = ["last_name", "lastname", "last", "surname"];
const displayKeys = ["display", "display_name", "nickname", "preferred_name"];
const emailKeys = ["email", "mail"];
const phoneKeys = ["phone", "phone_number", "mobile"];
const whatsappKeys = ["whatsapp", "whatsapp_number"];
const sideKeys = ["side", "bride_or_groom"];
const roleKeys = ["role", "relationship"];
const childKeys = ["is_child", "child"];
const notesKeys = ["notes", "note", "comments"];

function parseCSV(text: string): ParsedRow[] {
  const lines = text.split(/\r?\n/).filter((line) => line.trim().length > 0);
  if (lines.length === 0) return [];
  const headers = lines[0]
    .split(",")
    .map((h) => h.trim().toLowerCase());
  return lines.slice(1).map((line) => {
    const values = line.split(",");
    const row: ParsedRow = {};
    headers.forEach((header, idx) => {
      row[header] = (values[idx] ?? "").trim();
    });
    return row;
  });
}

function pick(row: ParsedRow, keys: string[]) {
  for (const key of keys) {
    if (row[key]) return row[key];
  }
  return undefined;
}

function toBoolean(value: string | undefined) {
  if (!value) return undefined;
  const normalized = value.trim().toLowerCase();
  return ["yes", "y", "true", "1"].includes(normalized);
}

export function importGuestsFromCSV(
  weddingId: string,
  csvText: string
): {
  householdsCreated: number;
  guestsCreated: number;
  errors: string[];
} {
  const rows = parseCSV(csvText);
  let householdsCreated = 0;
  let guestsCreated = 0;
  const errors: string[] = [];
  const householdCache = new Map<string, string>();

  rows.forEach((row, index) => {
    const householdName = pick(row, householdKeys)?.trim();
    const firstName = pick(row, firstNameKeys)?.trim();
    const lastName = pick(row, lastNameKeys)?.trim();
    const displayName = pick(row, displayKeys)?.trim();
    const email = pick(row, emailKeys)?.trim();
    const phone = pick(row, phoneKeys)?.trim();
    const whatsappNumber = pick(row, whatsappKeys)?.trim();
    const side = pick(row, sideKeys)?.trim();
    const role = pick(row, roleKeys)?.trim();
    const isChild = toBoolean(pick(row, childKeys));
    const notes = pick(row, notesKeys)?.trim();

    if (!firstName && !displayName) {
      errors.push(`Row ${index + 2}: missing name`);
      return;
    }

    let householdId: string | undefined;
    if (householdName) {
      const key = householdName.toLowerCase();
      if (householdCache.has(key)) {
        householdId = householdCache.get(key);
      } else {
        const household = findOrCreateHouseholdByName(weddingId, householdName);
        householdId = household.id;
        if (!householdCache.has(key)) {
          householdCache.set(key, householdId);
          householdsCreated += 1;
        }
      }
    }

    const guestInput: Omit<Guest, "id" | "createdAt" | "updatedAt" | "weddingId"> = {
      householdId,
      firstName: firstName || displayName || "Guest",
      lastName,
      displayName,
      email,
      phone,
      whatsappNumber,
      side,
      role,
      isChild,
      notes,
    };

    addGuest(weddingId, guestInput);
    guestsCreated += 1;
  });

  return { householdsCreated, guestsCreated, errors };
}
