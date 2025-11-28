"use client";

import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  ChecklistItem,
  ChecklistSummary,
  TimeBucket,
} from "@/lib/checklists/types";
import {
  ensureChecklist,
  fetchParticipants,
  updateChecklistItem,
} from "@/lib/api/checklists";
import { WeddingParticipant } from "@/lib/participants/types";

type Filters = {
  timeBucket: TimeBucket | "all";
  category: string | "all";
  status: "all" | "todo" | "in_progress" | "done";
  eventId: string | "all";
  jewelryOnly: boolean;
  assignee: "all" | "unassigned" | "me" | string;
};

const timeBucketLabels: Record<TimeBucket, string> = {
  "6_plus_months": "6+ months before",
  "3_6_months": "3–6 months before",
  "1_3_months": "1–3 months before",
  "1_month": "1 month before",
  "1_week": "1 week before",
  "day_of": "On the day",
  after: "After",
};

export default function ChecklistPage() {
  const searchParams = useSearchParams();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [summary, setSummary] = useState<ChecklistSummary | null>(null);
  const [participants, setParticipants] = useState<WeddingParticipant[]>([]);
  const [currentParticipantId, setCurrentParticipantId] = useState<string | null>(
    null
  );
  const [filters, setFilters] = useState<Filters>({
    timeBucket:
      (searchParams?.get?.("timeBucket") as Filters["timeBucket"]) ?? "all",
    category: (searchParams?.get?.("category") as Filters["category"]) ?? "all",
    status: (searchParams?.get?.("status") as Filters["status"]) ?? "all",
    eventId: (searchParams?.get?.("eventId") as Filters["eventId"]) ?? "all",
    jewelryOnly:
      searchParams?.get?.("jewelry") === "true" ||
      searchParams?.get?.("category") === "jewelry",
    assignee:
      (searchParams?.get?.("assignee") as Filters["assignee"]) ??
      ((searchParams?.get?.("assigneeId") as string | null) ?? "all"),
  });
  const [notesDraft, setNotesDraft] = useState<Record<string, string>>({});
  const [updating, setUpdating] = useState<Record<string, boolean>>({});

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const data = await ensureChecklist();
        if (!cancelled) {
          setSummary(data);
          setError(null);
        }
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : "Failed to load");
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const list = await fetchParticipants();
        if (cancelled) return;
        setParticipants(list);
        const primary = list.find((p) => p.isPrimary) ?? list[0];
        setCurrentParticipantId(primary ? primary.id : null);
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : "Failed to load participants");
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const filteredItems = useMemo(() => {
    if (!summary) return [];
    return summary.items.filter((item) => {
      if (filters.jewelryOnly && !item.isJewelry) return false;
      if (filters.timeBucket !== "all" && item.timeBucket !== filters.timeBucket)
        return false;
      if (filters.category !== "all" && item.category !== filters.category)
        return false;
      if (filters.status !== "all" && item.status !== filters.status)
        return false;
      if (filters.eventId !== "all" && item.eventId !== filters.eventId)
        return false;
      if (filters.assignee === "unassigned" && item.assigneeId) return false;
      if (filters.assignee === "me") {
        if (currentParticipantId && item.assigneeId !== currentParticipantId)
          return false;
        if (!currentParticipantId && item.assigneeId) return false;
      }
      if (
        filters.assignee !== "all" &&
        filters.assignee !== "unassigned" &&
        filters.assignee !== "me"
      ) {
        if (item.assigneeId !== filters.assignee) return false;
      }
      return true;
    });
  }, [summary, filters, currentParticipantId]);

  const groupedByTimeBucket = useMemo(() => {
    const groups: Record<TimeBucket, ChecklistItem[]> = {
      "6_plus_months": [],
      "3_6_months": [],
      "1_3_months": [],
      "1_month": [],
      "1_week": [],
      "day_of": [],
      after: [],
    };
    filteredItems.forEach((item) => {
      groups[item.timeBucket].push(item);
    });
    return groups;
  }, [filteredItems]);

  const categories = useMemo(() => {
    if (!summary) return [];
    const set = new Set(summary.items.map((i) => i.category));
    return Array.from(set);
  }, [summary]);

  const getAssigneeLabel = (item: ChecklistItem) => {
    const participant = participants.find((p) => p.id === item.assigneeId);
    if (participant) return participant.name;
    if (item.assigneeRole) return item.assigneeRole;
    return "Unassigned";
  };

  const events = useMemo(() => {
    if (!summary) return [];
    const set = new Map<string, string>();
    summary.items.forEach((item) => {
      if (item.eventId) {
        set.set(item.eventId, item.eventId);
      }
    });
    return Array.from(set.entries()).map(([id]) => ({ id, name: id }));
  }, [summary]);

  const toggleStatus = async (item: ChecklistItem) => {
    const nextStatus = item.status === "done" ? "todo" : "done";
    setUpdating((prev) => ({ ...prev, [item.id]: true }));
    try {
      const updated = await updateChecklistItem(item.id, { status: nextStatus });
      setSummary((prev) =>
        prev
          ? {
              ...prev,
              items: prev.items.map((i) => (i.id === item.id ? updated : i)),
            }
          : prev
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update item");
    } finally {
      setUpdating((prev) => ({ ...prev, [item.id]: false }));
    }
  };

  const updateAssignee = async (
    item: ChecklistItem,
    participantId: string | "unassigned"
  ) => {
    setUpdating((prev) => ({ ...prev, [item.id]: true }));
    const participant =
      participantId === "unassigned"
        ? undefined
        : participants.find((p) => p.id === participantId);

    try {
      const updated = await updateChecklistItem(item.id, {
        assigneeId: participant?.id ?? null,
        assigneeRole: participant?.role ?? null,
      });
      setSummary((prev) =>
        prev
          ? {
              ...prev,
              items: prev.items.map((i) => (i.id === item.id ? updated : i)),
            }
          : prev
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update assignee");
    } finally {
      setUpdating((prev) => ({ ...prev, [item.id]: false }));
    }
  };

  const saveNotes = async (item: ChecklistItem) => {
    const draft = notesDraft[item.id];
    setUpdating((prev) => ({ ...prev, [item.id]: true }));
    try {
      const updated = await updateChecklistItem(item.id, { notes: draft });
      setSummary((prev) =>
        prev
          ? {
              ...prev,
              items: prev.items.map((i) => (i.id === item.id ? updated : i)),
            }
          : prev
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save notes");
    } finally {
      setUpdating((prev) => ({ ...prev, [item.id]: false }));
    }
  };

  return (
    <section className="space-y-4">
      <div className="space-y-1">
        <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
          Checklist
        </p>
        <h1 className="text-2xl font-semibold tracking-tight">
          Checklist hub
        </h1>
        <p className="text-sm text-muted-foreground max-w-3xl">
          Filter by time, event, category, or status. Mark items done and keep
          notes so everyone stays aligned.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            Filters
            <button
              type="button"
              className={`rounded-full border px-2 py-0.5 text-[12px] font-medium ${
                filters.jewelryOnly
                  ? "bg-wedx-accent-100 text-wedx-accent-700"
                  : "bg-muted text-muted-foreground"
              }`}
              onClick={() =>
                setFilters((prev) => ({
                  ...prev,
                  jewelryOnly: !prev.jewelryOnly,
                  category: !prev.jewelryOnly ? "jewelry" : prev.category,
                }))
              }
            >
              {filters.jewelryOnly ? "Jewelry view" : "All items"}
            </button>
          </CardTitle>
          <CardDescription className="text-sm">
            Narrow tasks by time, event, category, and status.
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-3 md:grid-cols-5 text-sm">
          <div className="space-y-1">
            <label
              htmlFor="timeBucket"
              className="text-xs font-medium text-muted-foreground"
            >
              Time bucket
            </label>
            <select
              id="timeBucket"
              className="w-full rounded border px-3 py-2 text-sm"
              value={filters.timeBucket}
              onChange={(e) =>
                setFilters((prev) => ({
                  ...prev,
                  timeBucket: e.target.value as Filters["timeBucket"],
                }))
              }
            >
              <option value="all">All</option>
              {Object.entries(timeBucketLabels).map(([key, label]) => (
                <option key={key} value={key}>
                  {label}
                </option>
              ))}
            </select>
          </div>
          <div className="space-y-1">
            <label
              htmlFor="event"
              className="text-xs font-medium text-muted-foreground"
            >
              Event
            </label>
            <select
              id="event"
              className="w-full rounded border px-3 py-2 text-sm"
              value={filters.eventId}
              onChange={(e) =>
                setFilters((prev) => ({
                  ...prev,
                  eventId: e.target.value as Filters["eventId"],
                }))
              }
            >
              <option value="all">All events</option>
              {events.map((event) => (
                <option key={event.id} value={event.id}>
                  {event.name}
                </option>
              ))}
            </select>
          </div>
          <div className="space-y-1">
            <label
              htmlFor="category"
              className="text-xs font-medium text-muted-foreground"
            >
              Category
            </label>
            <select
              id="category"
              className="w-full rounded border px-3 py-2 text-sm"
              value={filters.category}
              onChange={(e) =>
                setFilters((prev) => ({
                  ...prev,
                  category: e.target.value as Filters["category"],
                }))
              }
            >
              <option value="all">All categories</option>
              {categories.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>
          <div className="space-y-1">
            <label
              htmlFor="status"
              className="text-xs font-medium text-muted-foreground"
            >
              Status
            </label>
            <select
              id="status"
              className="w-full rounded border px-3 py-2 text-sm"
              value={filters.status}
              onChange={(e) =>
                setFilters((prev) => ({
                  ...prev,
                  status: e.target.value as Filters["status"],
                }))
              }
            >
              <option value="all">All</option>
              <option value="todo">To do</option>
              <option value="in_progress">In progress</option>
              <option value="done">Done</option>
            </select>
          </div>
          <div className="space-y-1">
            <label
              htmlFor="assignee"
              className="text-xs font-medium text-muted-foreground"
            >
              Assignee
            </label>
            <select
              id="assignee"
              className="w-full rounded border px-3 py-2 text-sm"
              value={filters.assignee}
              onChange={(e) =>
                setFilters((prev) => ({
                  ...prev,
                  assignee: e.target.value as Filters["assignee"],
                }))
              }
            >
              <option value="all">All</option>
              <option value="unassigned">Unassigned</option>
              <option value="me">My tasks</option>
              {participants.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </select>
          </div>
        </CardContent>
      </Card>

      {loading ? (
        <Card className="border-dashed">
          <CardContent className="py-6 text-sm text-muted-foreground">
            Loading checklist…
          </CardContent>
        </Card>
      ) : error ? (
        <Card className="border-dashed">
          <CardContent className="py-6 text-sm text-red-700">
            {error}
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {summary?.groups.jewelry && (
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base">Jewelry summary</CardTitle>
                <CardDescription className="text-xs">
                  {summary.groups.jewelry.completed} / {summary.groups.jewelry.total} jewelry items done
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-2 text-xs text-muted-foreground">
                {Object.entries(summary.groups.jewelry.byEvent).map(
                  ([eventId, stats]) => (
                    <div key={eventId} className="flex items-center justify-between">
                      <span>Event: {eventId}</span>
                      <span>
                        {stats.completed} / {stats.total} done
                      </span>
                    </div>
                  )
                )}
                {Object.keys(summary.groups.jewelry.byEvent).length === 0 && (
                  <div>No jewelry items linked to events yet.</div>
                )}
              </CardContent>
            </Card>
          )}
          {Object.entries(groupedByTimeBucket).map(([bucket, items]) => {
            if (items.length === 0) return null;
            return (
              <Card key={bucket}>
                <CardHeader className="pb-2">
                  <CardTitle className="text-base">
                    {timeBucketLabels[bucket as TimeBucket]}
                  </CardTitle>
                  <CardDescription className="text-xs">
                    {items.filter((i) => i.status === "done").length} /{" "}
                    {items.length} completed
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  {items.map((item) => (
                    <div
                      key={item.id}
                      className="rounded-md border p-3 text-sm shadow-xs bg-background"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <button
                              type="button"
                              onClick={() => toggleStatus(item)}
                              disabled={updating[item.id]}
                              className="h-4 w-4 rounded border border-muted-foreground/50 bg-white"
                              aria-label="Toggle status"
                            >
                              {item.status === "done" ? "✓" : ""}
                            </button>
                            <span className="font-medium">{item.title}</span>
                            {item.isJewelry && (
                              <span className="rounded-full bg-wedx-accent-100 px-2 py-0.5 text-[11px] text-wedx-accent-700">
                                Jewelry
                              </span>
                            )}
                          </div>
                        <div className="flex flex-wrap gap-2 text-xs text-muted-foreground">
                          <span className="rounded-full border px-2 py-0.5">
                            {item.category}
                          </span>
                          {item.isJewelry && item.jewelryType && (
                            <span className="rounded-full border px-2 py-0.5">
                              Type: {item.jewelryType}
                            </span>
                          )}
                          {item.eventId && (
                            <span className="rounded-full border px-2 py-0.5">
                              Event: {item.eventId}
                            </span>
                          )}
                          <span className="rounded-full border px-2 py-0.5">
                            Status: {item.status}
                          </span>
                          <span className="rounded-full border px-2 py-0.5">
                            Assignee: {getAssigneeLabel(item)}
                          </span>
                          {item.isJewelry && (
                            <span className="rounded-full border px-2 py-0.5">
                              Owner: {item.jewelryOwner ?? "Unassigned"}
                            </span>
                          )}
                        </div>
                      </div>
                      {item.description && (
                        <span className="text-xs text-muted-foreground max-w-xs">
                          {item.description}
                          </span>
                        )}
                      </div>
                      <div className="mt-3 space-y-2">
                        <div className="grid gap-2 md:grid-cols-2">
                          <div className="space-y-1">
                            <label
                              className="text-xs font-medium text-muted-foreground"
                              htmlFor={`assignee-${item.id}`}
                            >
                              Assign to
                            </label>
                            <select
                              className="w-full rounded border px-3 py-2 text-sm"
                              id={`assignee-${item.id}`}
                              value={item.assigneeId ?? ""}
                              onChange={(e) =>
                                updateAssignee(
                                  item,
                                  e.target.value ? e.target.value : "unassigned"
                                )
                              }
                              disabled={updating[item.id]}
                            >
                              <option value="">Unassigned</option>
                              {participants.map((participant) => (
                                <option key={participant.id} value={participant.id}>
                                  {participant.name} ({participant.role})
                                </option>
                              ))}
                            </select>
                          </div>
                          {item.isJewelry && (
                            <div className="space-y-1">
                              <label className="text-xs font-medium text-muted-foreground">
                                Jewelry owner
                              </label>
                              <select
                                className="w-full rounded border px-3 py-2 text-sm"
                                value={item.jewelryOwner ?? ""}
                                onChange={(e) =>
                                  setSummary((prev) =>
                                    prev
                                      ? {
                                          ...prev,
                                          items: prev.items.map((i) =>
                                            i.id === item.id
                                              ? { ...i, jewelryOwner: e.target.value }
                                              : i
                                          ),
                                        }
                                      : prev
                                  )
                                }
                              >
                                <option value="">Unassigned</option>
                                <option value="bride-family">Bride's family</option>
                                <option value="groom-family">Groom's family</option>
                                <option value="couple">Couple</option>
                                <option value="vendor">Vendor</option>
                                <option value="other">Other</option>
                              </select>
                            </div>
                          )}
                        </div>
                        {item.isJewelry && (
                          <div className="grid gap-2 md:grid-cols-2">
                            <div className="space-y-1">
                              <label className="text-xs font-medium text-muted-foreground">
                                Jewelry type
                              </label>
                              <select
                                className="w-full rounded border px-3 py-2 text-sm"
                                value={item.jewelryType ?? ""}
                                onChange={(e) =>
                                  setSummary((prev) =>
                                    prev
                                      ? {
                                          ...prev,
                                          items: prev.items.map((i) =>
                                            i.id === item.id
                                              ? { ...i, jewelryType: e.target.value }
                                              : i
                                          ),
                                        }
                                      : prev
                                  )
                                }
                              >
                                <option value="">Not set</option>
                                <option value="necklace">Necklace</option>
                                <option value="earrings">Earrings</option>
                                <option value="ring-set">Ring set</option>
                                <option value="headpiece">Headpiece</option>
                                <option value="bangles">Bangles</option>
                                <option value="set">Jewelry set</option>
                                <option value="light-set">Light set</option>
                                <option value="rental-set">Rental set</option>
                                <option value="other">Other</option>
                              </select>
                            </div>
                          </div>
                        )}
                        <label className="text-xs font-medium text-muted-foreground">
                          Notes
                        </label>
                        <Input
                          value={notesDraft[item.id] ?? item.notes ?? ""}
                          onChange={(e) =>
                            setNotesDraft((prev) => ({
                              ...prev,
                              [item.id]: e.target.value,
                            }))
                          }
                          placeholder="Add a note"
                        />
                        <div className="flex items-center gap-2 text-xs">
                          <button
                            type="button"
                            onClick={() => saveNotes(item)}
                            disabled={updating[item.id]}
                            className="rounded border px-2 py-1 text-[12px] font-medium hover:bg-muted"
                          >
                            Save notes
                          </button>
                          {item.isJewelry && (
                            <button
                              type="button"
                              onClick={async () => {
                                setUpdating((prev) => ({ ...prev, [item.id]: true }));
                                try {
                                  const updated = await updateChecklistItem(item.id, {
                                    jewelryOwner: item.jewelryOwner ?? null,
                                    jewelryType: item.jewelryType ?? null,
                                  });
                                  setSummary((prev) =>
                                    prev
                                      ? {
                                          ...prev,
                                          items: prev.items.map((i) =>
                                            i.id === item.id ? updated : i
                                          ),
                                        }
                                      : prev
                                  );
                                } finally {
                                  setUpdating((prev) => ({ ...prev, [item.id]: false }));
                                }
                              }}
                              disabled={updating[item.id]}
                              className="rounded border px-2 py-1 text-[12px] font-medium hover:bg-muted"
                            >
                              Save jewelry metadata
                            </button>
                          )}
                          {item.notes && (
                            <span className="text-muted-foreground">
                              Saved: {item.notes}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            );
          })}
          {filteredItems.length === 0 && (
            <Card className="border-dashed">
              <CardContent className="py-6 text-sm text-muted-foreground">
                No checklist items match these filters.
              </CardContent>
            </Card>
          )}
        </div>
      )}
    </section>
  );
}
