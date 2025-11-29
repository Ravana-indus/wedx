"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  createGuest,
  createHousehold,
  importGuests,
  listHouseholds,
} from "@/lib/api/guests";
import { Guest, HouseholdWithGuests } from "@/lib/guests/types";

type HouseholdForm = {
  name: string;
  city: string;
  notes: string;
};

type GuestForm = {
  firstName: string;
  lastName: string;
  displayName: string;
  householdId: string;
  role: string;
  side: string;
  email: string;
  phone: string;
  whatsappNumber: string;
  isChild: boolean;
  notes: string;
};

export default function GuestsPage() {
  const [households, setHouseholds] = useState<HouseholdWithGuests[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [importing, setImporting] = useState(false);
  const [importSummary, setImportSummary] = useState<string | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [householdForm, setHouseholdForm] = useState<HouseholdForm>({
    name: "",
    city: "",
    notes: "",
  });
  const [guestForm, setGuestForm] = useState<GuestForm>({
    firstName: "",
    lastName: "",
    displayName: "",
    householdId: "",
    role: "",
    side: "",
    email: "",
    phone: "",
    whatsappNumber: "",
    isChild: false,
    notes: "",
  });

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const list = await listHouseholds();
        if (!cancelled) setHouseholds(list);
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : "Failed to load guests");
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const householdOptions = useMemo(
    () => households.filter((h) => h.id !== "ungrouped"),
    [households]
  );

  const handleAddHousehold = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!householdForm.name.trim()) return;
    setSaving(true);
    try {
      const created = await createHousehold({
        name: householdForm.name.trim(),
        city: householdForm.city.trim() || undefined,
        notes: householdForm.notes.trim() || undefined,
      });
      setHouseholds((prev) => [...prev, { ...created, guests: [] } as HouseholdWithGuests]);
      setHouseholdForm({ name: "", city: "", notes: "" });
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to add household");
    } finally {
      setSaving(false);
    }
  };

  const handleAddGuest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!guestForm.firstName.trim() && !guestForm.displayName.trim()) return;
    setSaving(true);
    try {
      const created = await createGuest({
        firstName: guestForm.firstName.trim(),
        lastName: guestForm.lastName.trim() || undefined,
        displayName: guestForm.displayName.trim() || undefined,
        householdId: guestForm.householdId || undefined,
        role: guestForm.role.trim() || undefined,
        side: guestForm.side.trim() || undefined,
        email: guestForm.email.trim() || undefined,
        phone: guestForm.phone.trim() || undefined,
        whatsappNumber: guestForm.whatsappNumber.trim() || undefined,
        isChild: guestForm.isChild,
        notes: guestForm.notes.trim() || undefined,
      });
      setHouseholds((prev) => {
        const next = [...prev];
        const targetId = created.householdId ?? "ungrouped";
        const existing = next.find((h) => h.id === targetId);
        if (existing) {
          existing.guests = [...(existing.guests || []), created as Guest];
        } else {
          next.push({
            id: targetId,
            weddingId: created.weddingId,
            name: "Ungrouped guests",
            createdAt: created.createdAt,
            updatedAt: created.updatedAt,
            guests: [created as Guest],
          });
        }
        return next;
      });
      setGuestForm({
        firstName: "",
        lastName: "",
        displayName: "",
        householdId: "",
        role: "",
        side: "",
        email: "",
        phone: "",
        whatsappNumber: "",
        isChild: false,
        notes: "",
      });
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to add guest");
    } finally {
      setSaving(false);
    }
  };

  const handleImport = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) return;
    setImporting(true);
    try {
      const summary = await importGuests(file);
      setImportSummary(
        `Imported ${summary.householdsCreated} households and ${summary.guestsCreated} guests` +
          (summary.errors.length ? `; errors: ${summary.errors.join("; ")}` : "")
      );
      const list = await listHouseholds();
      setHouseholds(list);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to import CSV");
    } finally {
      setImporting(false);
    }
  };

  return (
    <section className="space-y-4">
      <div className="space-y-1">
        <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
          Guests
        </p>
        <h1 className="text-2xl font-semibold tracking-tight">Guest list</h1>
        <p className="text-sm text-muted-foreground max-w-3xl">
          Manage households and guests, and import from CSV. Later stories will add invitations, RSVP, and seating.
        </p>
      </div>

      {error && <div className="text-sm text-red-700">{error}</div>}
      {importSummary && (
        <div className="text-sm text-emerald-700">{importSummary}</div>
      )}

      <div className="grid gap-4 md:grid-cols-3">
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle className="text-base">Add household</CardTitle>
            <CardDescription className="text-sm">
              Create a household to group guests together.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form className="grid gap-3 md:grid-cols-3 text-sm" onSubmit={handleAddHousehold}>
              <div className="space-y-1 md:col-span-2">
                <label className="text-xs font-medium text-muted-foreground" htmlFor="household-name">
                  Household name
                </label>
                <Input
                  id="household-name"
                  required
                  value={householdForm.name}
                  onChange={(e) =>
                    setHouseholdForm((prev) => ({ ...prev, name: e.target.value }))
                  }
                  placeholder="Perera Family"
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-medium text-muted-foreground" htmlFor="household-city">
                  City
                </label>
                <Input
                  id="household-city"
                  value={householdForm.city}
                  onChange={(e) =>
                    setHouseholdForm((prev) => ({ ...prev, city: e.target.value }))
                  }
                  placeholder="Colombo"
                />
              </div>
              <div className="space-y-1 md:col-span-3">
                <label className="text-xs font-medium text-muted-foreground" htmlFor="household-notes">
                  Notes
                </label>
                <Input
                  id="household-notes"
                  value={householdForm.notes}
                  onChange={(e) =>
                    setHouseholdForm((prev) => ({ ...prev, notes: e.target.value }))
                  }
                  placeholder="Parents handling invites"
                />
              </div>
              <div className="md:col-span-3 flex items-center gap-3">
                <button
                  type="submit"
                  disabled={saving}
                  className="rounded border px-3 py-2 text-sm font-medium hover:bg-muted"
                >
                  {saving ? "Saving…" : "Save household"}
                </button>
              </div>
            </form>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Import from CSV</CardTitle>
            <CardDescription className="text-sm">
              Upload a CSV with columns like household, first_name, last_name, email, phone, side.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <form className="space-y-3" onSubmit={handleImport}>
              <input
                type="file"
                accept=".csv,text/csv"
                aria-label="CSV file"
                onChange={(e) => setFile(e.target.files?.[0] ?? null)}
              />
              <button
                type="submit"
                disabled={!file || importing}
                className="rounded border px-3 py-2 text-sm font-medium hover:bg-muted"
              >
                {importing ? "Importing…" : "Import CSV"}
              </button>
            </form>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Add guest</CardTitle>
          <CardDescription className="text-sm">
            Add guests with or without a household.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form className="grid gap-3 md:grid-cols-3 text-sm" onSubmit={handleAddGuest}>
            <div className="space-y-1">
              <label className="text-xs font-medium text-muted-foreground" htmlFor="guest-first">
                First name
              </label>
              <Input
                id="guest-first"
                value={guestForm.firstName}
                onChange={(e) =>
                  setGuestForm((prev) => ({ ...prev, firstName: e.target.value }))
                }
                placeholder="Sunil"
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-medium text-muted-foreground" htmlFor="guest-last">
                Last name
              </label>
              <Input
                id="guest-last"
                value={guestForm.lastName}
                onChange={(e) =>
                  setGuestForm((prev) => ({ ...prev, lastName: e.target.value }))
                }
                placeholder="Perera"
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-medium text-muted-foreground" htmlFor="guest-display">
                Display name
              </label>
              <Input
                id="guest-display"
                value={guestForm.displayName}
                onChange={(e) =>
                  setGuestForm((prev) => ({ ...prev, displayName: e.target.value }))
                }
                placeholder="Uncle Sunil"
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-medium text-muted-foreground" htmlFor="guest-household">
                Household (optional)
              </label>
              <select
                id="guest-household"
                className="w-full rounded border px-3 py-2"
                value={guestForm.householdId}
                onChange={(e) =>
                  setGuestForm((prev) => ({ ...prev, householdId: e.target.value }))
                }
              >
                <option value="">No household</option>
                {householdOptions.map((h) => (
                  <option key={h.id} value={h.id}>
                    {h.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="space-y-1">
              <label className="text-xs font-medium text-muted-foreground" htmlFor="guest-role">
                Role/relationship
              </label>
              <Input
                id="guest-role"
                value={guestForm.role}
                onChange={(e) =>
                  setGuestForm((prev) => ({ ...prev, role: e.target.value }))
                }
                placeholder="Family, Friend"
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-medium text-muted-foreground" htmlFor="guest-side">
                Side
              </label>
              <Input
                id="guest-side"
                value={guestForm.side}
                onChange={(e) =>
                  setGuestForm((prev) => ({ ...prev, side: e.target.value }))
                }
                placeholder="Bride/Groom/Both"
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-medium text-muted-foreground" htmlFor="guest-email">
                Email
              </label>
              <Input
                id="guest-email"
                value={guestForm.email}
                onChange={(e) =>
                  setGuestForm((prev) => ({ ...prev, email: e.target.value }))
                }
                placeholder="sunil@example.com"
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-medium text-muted-foreground" htmlFor="guest-phone">
                Phone
              </label>
              <Input
                id="guest-phone"
                value={guestForm.phone}
                onChange={(e) =>
                  setGuestForm((prev) => ({ ...prev, phone: e.target.value }))
                }
                placeholder="+94 77 123 4567"
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-medium text-muted-foreground" htmlFor="guest-whatsapp">
                WhatsApp
              </label>
              <Input
                id="guest-whatsapp"
                value={guestForm.whatsappNumber}
                onChange={(e) =>
                  setGuestForm((prev) => ({ ...prev, whatsappNumber: e.target.value }))
                }
                placeholder="+94 77 123 4567"
              />
            </div>
            <div className="space-y-1 md:col-span-2">
              <label className="text-xs font-medium text-muted-foreground" htmlFor="guest-notes">
                Notes
              </label>
              <Input
                id="guest-notes"
                value={guestForm.notes}
                onChange={(e) =>
                  setGuestForm((prev) => ({ ...prev, notes: e.target.value }))
                }
                placeholder="Seating needs, dietary notes, children"
              />
            </div>
            <div className="md:col-span-3 flex items-center gap-3">
              <label className="flex items-center gap-2 text-xs text-muted-foreground">
                <input
                  type="checkbox"
                  checked={guestForm.isChild}
                  onChange={(e) =>
                    setGuestForm((prev) => ({ ...prev, isChild: e.target.checked }))
                  }
                />
                Child
              </label>
              <button
                type="submit"
                disabled={saving}
                className="rounded border px-3 py-2 text-sm font-medium hover:bg-muted"
              >
                {saving ? "Saving…" : "Save guest"}
              </button>
            </div>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Households & guests</CardTitle>
          <CardDescription className="text-sm">
            View grouped guests. Use the forms above to add more.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {loading ? (
            <div className="text-sm text-muted-foreground">Loading guests…</div>
          ) : households.length === 0 ? (
            <div className="text-sm text-muted-foreground">No guests yet. Add a household or guest above.</div>
          ) : (
            <div className="space-y-3">
              {households.map((household) => (
                <div key={household.id} className="rounded border p-3 text-sm">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="font-medium">{household.name}</div>
                      {household.city && (
                        <div className="text-xs text-muted-foreground">{household.city}</div>
                      )}
                      {household.notes && (
                        <div className="text-xs text-muted-foreground">{household.notes}</div>
                      )}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {household.guests?.length ?? 0} guests
                    </div>
                  </div>
                  <div className="mt-2 space-y-1">
                    {(household.guests ?? []).length === 0 ? (
                      <div className="text-xs text-muted-foreground">No guests in this household.</div>
                    ) : (
                      <ul className="space-y-1">
                        {(household.guests ?? []).map((guest) => (
                          <li key={guest.id} className="flex flex-wrap items-center gap-2 text-xs">
                            <span className="font-medium text-foreground">
                              {guest.displayName || `${guest.firstName}${guest.lastName ? " " + guest.lastName : ""}`}
                            </span>
                            {guest.role && (
                              <span className="rounded-full border px-2 py-0.5">{guest.role}</span>
                            )}
                            {guest.side && (
                              <span className="rounded-full border px-2 py-0.5">{guest.side}</span>
                            )}
                            {guest.phone && (
                              <span className="rounded-full border px-2 py-0.5">{guest.phone}</span>
                            )}
                            {guest.email && (
                              <span className="rounded-full border px-2 py-0.5">{guest.email}</span>
                            )}
                            {guest.isChild && (
                              <span className="rounded-full border px-2 py-0.5">Child</span>
                            )}
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </section>
  );
}
