"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

type WeddingBaseType =
  | "hindu"
  | "christian"
  | "buddhist"
  | "muslim"
  | "civil"
  | "mixed"
  | "other";

type EventId = string;

interface EventSummary {
  id: EventId;
  name: string;
  typeKey: string; // normalized key used for ritual suggestions, e.g. "poruwa", "reception"
}

type RitualTradition =
  | "hindu"
  | "buddhist"
  | "christian"
  | "muslim"
  | "civil"
  | "mixed"
  | "other";

interface RitualTemplate {
  key: string;
  name: string;
  tradition: RitualTradition;
  defaultDurationMinutes?: number;
  recommendedEventTypes: string[]; // e.g. ["poruwa", "reception"]
}

// For Story 2.4 we inline a small mock template set.
// In a full implementation this would live in lib/config/ritual-templates.ts.
const RITUAL_TEMPLATES: RitualTemplate[] = [
  {
    key: "buddhist-poruwa-main",
    name: "Poruwa ceremony",
    tradition: "buddhist",
    defaultDurationMinutes: 45,
    recommendedEventTypes: ["poruwa"],
  },
  {
    key: "buddhist-poruwa-blessings",
    name: "Blessings & chanting",
    tradition: "buddhist",
    defaultDurationMinutes: 20,
    recommendedEventTypes: ["poruwa"],
  },
  {
    key: "muslim-nikah-main",
    name: "Nikah ceremony",
    tradition: "muslim",
    defaultDurationMinutes: 40,
    recommendedEventTypes: ["nikah"],
  },
  {
    key: "hindu-mehendi-main",
    name: "Mehendi",
    tradition: "hindu",
    defaultDurationMinutes: 120,
    recommendedEventTypes: ["mehendi"],
  },
  {
    key: "hindu-haldi-main",
    name: "Haldi",
    tradition: "hindu",
    defaultDurationMinutes: 60,
    recommendedEventTypes: ["haldi"],
  },
  {
    key: "hindu-sangeet-main",
    name: "Sangeet",
    tradition: "hindu",
    defaultDurationMinutes: 180,
    recommendedEventTypes: ["sangeet"],
  },
  {
    key: "generic-ring-exchange",
    name: "Ring exchange",
    tradition: "civil",
    defaultDurationMinutes: 15,
    recommendedEventTypes: ["engagement", "reception"],
  },
  {
    key: "generic-first-dance",
    name: "First dance",
    tradition: "civil",
    defaultDurationMinutes: 10,
    recommendedEventTypes: ["reception"],
  },
  {
    key: "generic-cake-cutting",
    name: "Cake cutting",
    tradition: "civil",
    defaultDurationMinutes: 15,
    recommendedEventTypes: ["reception", "homecoming"],
  },
];

interface RitualState {
  id?: string;
  eventId: EventId;
  name: string;
  tradition: RitualTradition;
  durationMinutes?: number;
  notes?: string;
  included: boolean;
  isSuggested?: boolean;
  orderIndex: number;
  templateKey?: string;
}

type EventRitualsState = Record<EventId, RitualState[]>;

interface WizardContextMock {
  weddingType: WeddingBaseType;
  events: EventSummary[];
}

// For Story 2.4 we mock upstream data instead of calling real APIs.
function useMockWizardContext(): WizardContextMock {
  // In a real implementation, this would come from backend:
  // - wedding type from /api/weddings/:id
  // - events from /api/weddings/:id/events
  const weddingType: WeddingBaseType = "buddhist";

  const events: EventSummary[] = [
    { id: "event-1", name: "Poruwa Ceremony", typeKey: "poruwa" },
    { id: "event-2", name: "Reception", typeKey: "reception" },
    { id: "event-3", name: "Homecoming", typeKey: "homecoming" },
  ];

  return { weddingType, events };
}

function suggestRitualsForEvent(
  weddingType: WeddingBaseType,
  event: EventSummary
): RitualState[] {
  const normalizedWeddingType: RitualTradition =
    weddingType === "other" ? "other" : (weddingType as RitualTradition);

  const templates = RITUAL_TEMPLATES.filter((template) => {
    const matchesTradition =
      template.tradition === normalizedWeddingType ||
      normalizedWeddingType === "mixed";
    const matchesEvent = template.recommendedEventTypes.includes(
      event.typeKey.toLowerCase()
    );
    return matchesTradition && matchesEvent;
  });

  return templates.map((template, index) => ({
    eventId: event.id,
    name: template.name,
    tradition: template.tradition,
    durationMinutes: template.defaultDurationMinutes,
    notes: "",
    included: true,
    isSuggested: true,
    orderIndex: index,
    templateKey: template.key,
  }));
}

export default function RitualsConfigurationStepPage() {
  const router = useRouter();
  const { weddingType, events } = useMockWizardContext();

  const [ritualsByEvent, setRitualsByEvent] = React.useState<EventRitualsState>(
    {}
  );
  const [loading, setLoading] = React.useState(false);
  const [saving, setSaving] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    let isMounted = true;

    async function loadInitial() {
      setLoading(true);
      setError(null);
      try {
        // TODO: replace with real API calls:
        // - GET /api/weddings/:id/events
        // - GET /api/weddings/:id/rituals
        // For Story 2.4 we:
        // - Use mocked events from useMockWizardContext
        // - Generate suggested rituals per event
        const initial: EventRitualsState = {};

        events.forEach((event) => {
          const suggested = suggestRitualsForEvent(weddingType, event);
          initial[event.id] = suggested;
        });

        if (!isMounted) return;
        setRitualsByEvent(initial);
      } catch (e) {
        if (!isMounted) return;
        setError(
          "We couldn’t load your rituals. You can still configure them and continue."
        );
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    loadInitial();
    return () => {
      isMounted = false;
    };
  }, [events, weddingType]);

  const handleToggleInclude = (eventId: EventId, index: number) => {
    setRitualsByEvent((prev) => {
      const list = prev[eventId] ?? [];
      const nextList = list.map((ritual, i) =>
        i === index ? { ...ritual, included: !ritual.included } : ritual
      );
      return { ...prev, [eventId]: nextList };
    });
  };

  const handleRitualFieldChange = <K extends keyof RitualState>(
    eventId: EventId,
    index: number,
    field: K,
    value: RitualState[K]
  ) => {
    setRitualsByEvent((prev) => {
      const list = prev[eventId] ?? [];
      const nextList = list.map((ritual, i) =>
        i === index ? { ...ritual, [field]: value } : ritual
      );
      return { ...prev, [eventId]: nextList };
    });
  };

  const handleAddCustomRitual = (eventId: EventId) => {
    setRitualsByEvent((prev) => {
      const list = prev[eventId] ?? [];
      const next: RitualState = {
        eventId,
        name: "",
        tradition:
          weddingType === "mixed" || weddingType === "other"
            ? "other"
            : (weddingType as RitualTradition),
        durationMinutes: undefined,
        notes: "",
        included: true,
        isSuggested: false,
        orderIndex: list.length,
      };
      return { ...prev, [eventId]: [...list, next] };
    });
  };

  const handleRemoveCustomRitual = (eventId: EventId, index: number) => {
    setRitualsByEvent((prev) => {
      const list = prev[eventId] ?? [];
      const target = list[index];
      if (!target || target.isSuggested) {
        return prev;
      }
      const nextList = list
        .filter((_, i) => i !== index)
        .map((ritual, i) => ({
          ...ritual,
          orderIndex: i,
        }));
      return { ...prev, [eventId]: nextList };
    });
  };

  const isValid = React.useMemo(() => {
    const allRituals = Object.values(ritualsByEvent).flat();
    const included = allRituals.filter((r) => r.included);
    if (included.length === 0) return false;
    return included.every((r) => r.name.trim().length > 0);
  }, [ritualsByEvent]);

  const handleNext = async () => {
    if (!isValid || saving) return;

    setSaving(true);
    setError(null);

    try {
      // TODO: replace with real persistence:
      // - PUT /api/weddings/:id/rituals (bulk upsert)
      // For Story 2.5 we simulate a short delay and then
      // treat this as the final step, redirecting to the Today dashboard.
      await new Promise((resolve) => setTimeout(resolve, 400));

      router.push("/dashboard");
    } catch (e) {
      setError("We couldn’t save your rituals. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  const handleBack = () => {
    router.push("/wizard/step-3");
  };

  const disabled = !isValid || saving || loading;

  return (
    <div className="flex h-full flex-col gap-6">
      {/* Title + description */}
      <div className="space-y-2">
        <h1 className="text-2xl font-semibold tracking-tight text-wedx-primary-800">
          Configure your key rituals
        </h1>
        <p className="text-sm text-muted-foreground max-w-xl">
          For each event, choose the rituals you plan to include. This helps
          wedX build accurate checklists and timelines that match your
          traditions.
        </p>
      </div>

      {/* Error banner */}
      {error && (
        <div className="rounded-md border border-destructive/40 bg-destructive/5 px-3 py-2 text-sm text-destructive">
          {error}
        </div>
      )}

      {/* Event + rituals list */}
      <div className="space-y-4">
        {events.map((event) => {
          const rituals = ritualsByEvent[event.id] ?? [];
          const hasIncluded = rituals.some((r) => r.included);

          return (
            <Card
              key={event.id}
              className={cn(
                "border transition-colors",
                hasIncluded
                  ? "border-wedx-primary-100 bg-wedx-primary-50/40"
                  : "border-dashed border-muted bg-background"
              )}
            >
              <CardHeader className="flex flex-row items-start justify-between gap-3 pb-3">
                <div className="space-y-1">
                  <CardTitle className="text-sm font-semibold">
                    {event.name}
                  </CardTitle>
                  <CardDescription className="text-xs">
                    Configure the rituals you plan to include for this event.
                  </CardDescription>
                </div>
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  onClick={() => handleAddCustomRitual(event.id)}
                >
                  Add custom ritual
                </Button>
              </CardHeader>

              <CardContent className="space-y-3">
                {rituals.length === 0 && (
                  <div className="text-xs text-muted-foreground">
                    No rituals yet. Start by adding a custom ritual for this
                    event.
                  </div>
                )}

                <div className="flex flex-col gap-2">
                  {rituals.map((ritual, index) => {
                    const showNameError =
                      ritual.included && ritual.name.trim().length === 0;

                    return (
                      <div
                        key={`${ritual.eventId}-${ritual.orderIndex}-${
                          ritual.templateKey ?? "custom"
                        }-${index}`}
                        className={cn(
                          "rounded-md border bg-background px-3 py-2 text-xs",
                          ritual.included
                            ? "border-wedx-primary-200"
                            : "border-dashed border-muted"
                        )}
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex flex-1 flex-col gap-1">
                            <div className="flex items-center gap-2">
                              <button
                                type="button"
                                onClick={() =>
                                  handleToggleInclude(event.id, index)
                                }
                                className={cn(
                                  "inline-flex h-5 w-5 items-center justify-center rounded border text-[0.65rem] font-medium",
                                  ritual.included
                                    ? "border-wedx-primary-500 bg-wedx-primary-500 text-white"
                                    : "border-muted bg-background text-muted-foreground"
                                )}
                                aria-pressed={
                                  ritual.included ? "true" : "false"
                                }
                              >
                                {ritual.included ? "✓" : ""}
                              </button>
                              <Input
                                value={ritual.name}
                                onChange={(e) =>
                                  handleRitualFieldChange(
                                    event.id,
                                    index,
                                    "name",
                                    e.target.value
                                  )
                                }
                                placeholder="Ritual name"
                                className="h-8 max-w-xs text-xs"
                              />
                              {ritual.isSuggested && (
                                <span className="rounded-full bg-wedx-neutral-100 px-2 py-0.5 text-[0.65rem] font-medium text-muted-foreground">
                                  Suggested
                                </span>
                              )}
                            </div>
                            <div className="flex flex-wrap items-center gap-3">
                              <div className="space-y-0.5">
                                <div className="text-[0.65rem] text-muted-foreground">
                                  Tradition
                                </div>
                                <div className="inline-flex items-center rounded-full border bg-wedx-neutral-50 px-2 py-0.5 text-[0.65rem] text-muted-foreground">
                                  {ritual.tradition.charAt(0).toUpperCase() +
                                    ritual.tradition.slice(1)}
                                </div>
                              </div>
                              <div className="space-y-0.5">
                                <div className="text-[0.65rem] text-muted-foreground">
                                  Approx. duration (minutes)
                                </div>
                                <Input
                                  type="number"
                                  min={0}
                                  value={
                                    ritual.durationMinutes !== undefined
                                      ? String(ritual.durationMinutes)
                                      : ""
                                  }
                                  onChange={(e) =>
                                    handleRitualFieldChange(
                                      event.id,
                                      index,
                                      "durationMinutes",
                                      e.target.value === ""
                                        ? undefined
                                        : Number(e.target.value)
                                    )
                                  }
                                  placeholder="Optional"
                                  className="h-8 w-24 text-xs"
                                />
                              </div>
                            </div>
                          </div>

                          {!ritual.isSuggested && (
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              className="h-6 w-6 text-xs text-muted-foreground hover:text-destructive"
                              onClick={() =>
                                handleRemoveCustomRitual(event.id, index)
                              }
                            >
                              ×
                            </Button>
                          )}
                        </div>

                        <div className="mt-2 space-y-1">
                          <div className="text-[0.65rem] text-muted-foreground">
                            Notes (optional)
                          </div>
                          <textarea
                            value={ritual.notes ?? ""}
                            onChange={(e) =>
                              handleRitualFieldChange(
                                event.id,
                                index,
                                "notes",
                                e.target.value
                              )
                            }
                            rows={2}
                            className="w-full rounded-md border bg-background px-2 py-1 text-[0.7rem] shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-wedx-primary-500 focus-visible:ring-offset-2"
                            placeholder="Any special instructions or family preferences..."
                          />
                        </div>

                        {showNameError && (
                          <div className="mt-1 text-[0.7rem] text-destructive">
                            Ritual name is required for included rituals.
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>

                {!hasIncluded && (
                  <div className="mt-1 text-[0.7rem] text-amber-600">
                    You currently have no rituals selected for this event.
                    That’s okay, but if this event usually has rituals (like
                    Poruwa or Nikah), consider adding at least one.
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}

        {events.length === 0 && !loading && (
          <Card className="border-dashed">
            <CardHeader>
              <CardTitle className="text-sm">No events configured</CardTitle>
              <CardDescription className="text-xs">
                Once you set up your events in Step 2, you'll be able to attach
                rituals to each one here.
              </CardDescription>
            </CardHeader>
          </Card>
        )}
      </div>

      {/* Spacer */}
      <div className="flex-1" />

      {/* Navigation controls */}
      <div className="flex items-center justify-between border-t bg-background/80 px-0 pt-3">
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={handleBack}
          disabled={saving || loading}
        >
          Back
        </Button>
        <div className="flex items-center gap-2">
          <Button
            type="button"
            variant="default"
            size="sm"
            onClick={handleNext}
            disabled={disabled}
          >
            {saving ? "Saving..." : "Next"}
          </Button>
        </div>
      </div>
    </div>
  );
}
