"use client";

import { useEffect, useMemo, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { listHouseholds } from "@/lib/api/guests";
import {
  fetchRsvpSummary,
  listInvitations,
  saveInvitations,
  statusOptions,
  updateInvitation,
} from "@/lib/api/invitations";
import { GuestEventInvitation } from "@/lib/invitations/types";
import { HouseholdWithGuests } from "@/lib/guests/types";

const defaultEvents = [
  { id: "event-1", name: "Poruwa Ceremony" },
  { id: "event-2", name: "Reception" },
  { id: "event-3", name: "Homecoming" },
];

type InvitationRow = GuestEventInvitation & {
  householdName?: string;
  guestName?: string;
};

export default function InvitationsPage() {
  const [eventId, setEventId] = useState(defaultEvents[0].id);
  const [households, setHouseholds] = useState<HouseholdWithGuests[]>([]);
  const [invitations, setInvitations] = useState<InvitationRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [summary, setSummary] = useState<any>(null);

  const householdOptions = useMemo(
    () => households.filter((h) => h.id !== "ungrouped"),
    [households]
  );
  const guestOptions = useMemo(
    () => householdOptions.flatMap((h) => h.guests || []),
    [householdOptions]
  );

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const [hh, invs, summ] = await Promise.all([
          listHouseholds(),
          listInvitations(eventId),
          fetchRsvpSummary(eventId),
        ]);
        if (cancelled) return;
        setHouseholds(hh);
        setInvitations(
          invs.map((inv) => ({
            ...inv,
            householdName: hh.find((h) => h.id === inv.householdId)?.name,
            guestName: hh.flatMap((h) => h.guests || []).find((g) => g.id === inv.guestId)?.displayName || hh.flatMap((h) => h.guests || []).find((g) => g.id === inv.guestId)?.firstName,
          }))
        );
        setSummary(summ);
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : "Failed to load invitations");
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [eventId]);

  const addInvitation = async (payload: Partial<GuestEventInvitation>) => {
    setSaving(true);
    try {
      const created = await saveInvitations(eventId, [payload]);
      setInvitations((prev) => [
        ...prev,
        {
          ...created[0],
          householdName: householdOptions.find((h) => h.id === created[0].householdId)?.name,
          guestName: guestOptions.find((g) => g.id === created[0].guestId)?.displayName || guestOptions.find((g) => g.id === created[0].guestId)?.firstName,
        },
      ]);
      const summ = await fetchRsvpSummary(eventId);
      setSummary(summ);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to add invitation");
    } finally {
      setSaving(false);
    }
  };

  const updateStatus = async (invitation: InvitationRow, status: GuestEventInvitation["status"], attendingCount?: number) => {
    try {
      const updated = await updateInvitation(invitation.id, { status, attendingCount });
      setInvitations((prev) =>
        prev.map((i) => (i.id === invitation.id ? { ...i, ...updated } : i))
      );
      const summ = await fetchRsvpSummary(eventId);
      setSummary(summ);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update invitation");
    }
  };

  return (
    <section className="space-y-4">
      <div className="space-y-1">
        <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Invitations & RSVP</p>
        <h1 className="text-2xl font-semibold tracking-tight">Per-event invitations</h1>
        <p className="text-sm text-muted-foreground max-w-3xl">
          Select an event, initialize invitations, and track RSVP status and counts.
        </p>
      </div>

      {error && <div className="text-sm text-red-700">{error}</div>}

      <div className="flex flex-wrap items-center gap-3 text-sm">
        <label className="flex items-center gap-2">
          <span className="text-xs text-muted-foreground">Event</span>
          <select
            className="rounded border px-3 py-2"
            value={eventId}
            onChange={(e) => setEventId(e.target.value)}
          >
            {defaultEvents.map((event) => (
              <option key={event.id} value={event.id}>
                {event.name}
              </option>
            ))}
          </select>
        </label>
        {summary && (
          <span className="text-xs text-muted-foreground">
            Invited {summary.invited} · Accepted {summary.accepted} · Declined {summary.declined} · Maybe {summary.maybe} · Attending {summary.attendingCount}
          </span>
        )}
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Add invitation</CardTitle>
          <CardDescription className="text-sm">Select a guest or household and set status/counts.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3 md:grid-cols-4 text-sm">
            <div className="space-y-1 md:col-span-2">
              <label className="text-xs font-medium text-muted-foreground" htmlFor="invite-guest">Guest (optional)</label>
              <select
                id="invite-guest"
                className="w-full rounded border px-3 py-2"
                onChange={(e) =>
                  addInvitation({
                    guestId: e.target.value || undefined,
                    inviteLevel: e.target.value ? "guest" : "household",
                    status: "invited",
                    eventId,
                    weddingId: "demo-wedding",
                  })
                }
              >
                <option value="">Select guest</option>
                {guestOptions.map((g) => (
                  <option key={g.id} value={g.id}>
                    {g.displayName || g.firstName}
                  </option>
                ))}
              </select>
            </div>
            <div className="space-y-1 md:col-span-2">
              <label className="text-xs font-medium text-muted-foreground" htmlFor="invite-household">Household (optional)</label>
              <select
                id="invite-household"
                className="w-full rounded border px-3 py-2"
                onChange={(e) =>
                  addInvitation({
                    householdId: e.target.value || undefined,
                    inviteLevel: "household",
                    status: "invited",
                    eventId,
                    weddingId: "demo-wedding",
                  })
                }
              >
                <option value="">Select household</option>
                {householdOptions.map((h) => (
                  <option key={h.id} value={h.id}>
                    {h.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Invitations for this event</CardTitle>
          <CardDescription className="text-sm">Change status and counts inline.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {loading ? (
            <div className="text-sm text-muted-foreground">Loading invitations…</div>
          ) : invitations.length === 0 ? (
            <div className="text-sm text-muted-foreground">No invitations yet. Add guests or households above.</div>
          ) : (
            <div className="space-y-2">
              {invitations.map((invitation) => (
                <div key={invitation.id} className="flex flex-wrap items-center justify-between gap-2 rounded border p-3 text-sm">
                  <div className="space-y-1">
                    <div className="font-medium">
                      {invitation.guestName || invitation.householdName || "Invitation"}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      Level: {invitation.inviteLevel}
                    </div>
                  </div>
                  <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                    <label className="flex items-center gap-1">
                      <span>Status</span>
                      <select
                        aria-label={`Status for ${invitation.id}`}
                        className="rounded border px-2 py-1"
                        value={invitation.status}
                        onChange={(e) =>
                          updateStatus(invitation, e.target.value as GuestEventInvitation["status"])
                        }
                      >
                        {statusOptions().map((opt) => (
                          <option key={opt.value} value={opt.value}>
                            {opt.label}
                          </option>
                        ))}
                      </select>
                    </label>
                    <label className="flex items-center gap-1">
                      <span>Invited</span>
                      <Input
                        type="number"
                        className="h-8 w-16"
                        value={invitation.invitedCount ?? ""}
                        onChange={(e) =>
                          updateStatus(
                            invitation,
                            invitation.status,
                            invitation.attendingCount
                          )
                        }
                        placeholder="0"
                      />
                    </label>
                    <label className="flex items-center gap-1">
                      <span>Attending</span>
                      <Input
                        type="number"
                        className="h-8 w-16"
                        value={invitation.attendingCount ?? ""}
                        onChange={(e) =>
                          updateStatus(
                            invitation,
                            invitation.status,
                            Number(e.target.value)
                          )
                        }
                        placeholder="0"
                      />
                    </label>
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