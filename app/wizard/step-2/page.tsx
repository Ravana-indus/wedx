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

type EventForm = {
  id: string;
  name: string;
  location: string;
  date: string;
  timeStart: string;
  timeEnd: string;
  guestEstimate: string;
  isIncluded: boolean;
  isSuggested: boolean;
  isCustom: boolean;
};

const COMMON_EVENTS = [
  "Engagement",
  "Reception",
  "Pre-shoot",
  "Welcome Dinner",
  "After-party",
];

const CULTURAL_EVENTS: Record<WeddingBaseType, string[]> = {
  hindu: ["Mehendi", "Haldi", "Sangeet", "Homecoming"],
  christian: ["Homecoming"],
  buddhist: ["Poruwa", "Homecoming"],
  muslim: ["Nikah", "Homecoming"],
  civil: [],
  mixed: [],
  other: [],
};

function getMockWeddingType(): WeddingBaseType {
  // Placeholder: in a real implementation we would fetch this from backend
  // For Story 2.2 we assume a default type to demonstrate suggested events.
  return "buddhist";
}

function buildSuggestedEvents(weddingType: WeddingBaseType): EventForm[] {
  const base: EventForm[] = [];

  COMMON_EVENTS.forEach((name, index) => {
    base.push({
      id: `common-${index}`,
      name,
      location: "",
      date: "",
      timeStart: "",
      timeEnd: "",
      guestEstimate: "",
      isIncluded: true,
      isSuggested: true,
      isCustom: false,
    });
  });

  const cultural = CULTURAL_EVENTS[weddingType] ?? [];
  cultural.forEach((name, index) => {
    base.push({
      id: `cultural-${index}`,
      name,
      location: "",
      date: "",
      timeStart: "",
      timeEnd: "",
      guestEstimate: "",
      isIncluded: true,
      isSuggested: true,
      isCustom: false,
    });
  });

  return base;
}

export default function MultiEventSetupStepPage() {
  const router = useRouter();

  const [events, setEvents] = React.useState<EventForm[]>([]);
  const [loading, setLoading] = React.useState(false);
  const [saving, setSaving] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    let isMounted = true;

    async function loadInitial() {
      setLoading(true);
      setError(null);
      try {
        // TODO: replace with real API call:
        // const wedding = await fetch(...);
        // const existingEvents = await fetch(...);
        // For now we mock wedding type and suggested events.
        const weddingType = getMockWeddingType();
        const suggested = buildSuggestedEvents(weddingType);

        if (!isMounted) return;
        setEvents(suggested);
      } catch (e) {
        if (!isMounted) return;
        setError(
          "We couldn’t load your events. You can still configure them and continue."
        );
        // Fallback to a generic suggested list
        setEvents(buildSuggestedEvents("civil"));
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    loadInitial();
    return () => {
      isMounted = false;
    };
  }, []);

  const handleToggleInclude = (id: string) => {
    setEvents((prev) =>
      prev.map((event) =>
        event.id === id ? { ...event, isIncluded: !event.isIncluded } : event
      )
    );
  };

  const handleFieldChange = (
    id: string,
    field: keyof Pick<
      EventForm,
      "name" | "location" | "date" | "timeStart" | "timeEnd" | "guestEstimate"
    >,
    value: string
  ) => {
    setEvents((prev) =>
      prev.map((event) =>
        event.id === id ? { ...event, [field]: value } : event
      )
    );
  };

  const handleAddCustomEvent = () => {
    const newEvent: EventForm = {
      id: `custom-${Date.now()}`,
      name: "",
      location: "",
      date: "",
      timeStart: "",
      timeEnd: "",
      guestEstimate: "",
      isIncluded: true,
      isSuggested: false,
      isCustom: true,
    };

    setEvents((prev) => [...prev, newEvent]);
  };

  const handleRemoveCustomEvent = (id: string) => {
    setEvents((prev) => prev.filter((event) => event.id !== id));
  };

  const isValid = React.useMemo(() => {
    const included = events.filter((e) => e.isIncluded);
    if (included.length === 0) return false;
    return included.every((e) => e.name.trim().length > 0);
  }, [events]);

  const handleNext = async () => {
    if (!isValid || saving) return;

    setSaving(true);
    setError(null);

    try {
      // TODO: replace with real persistence:
      // await api.events.bulkUpsert(weddingId, eventsPayload);
      await new Promise((resolve) => setTimeout(resolve, 400));

      router.push("/wizard/step-3");
    } catch (e) {
      setError("We couldn’t save your events. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  const handleBack = () => {
    router.push("/wizard/step-1");
  };

  const disabled = !isValid || saving || loading;

  return (
    <div className="flex h-full flex-col gap-6">
      {/* Title + description */}
      <div className="space-y-2">
        <h1 className="text-2xl font-semibold tracking-tight text-wedx-primary-800">
          Let's map out your events
        </h1>
        <p className="text-sm text-muted-foreground max-w-xl">
          Turn your wedding type into a concrete set of events. You can toggle
          suggestions on or off, add your own events, and fill in basic details.
        </p>
      </div>

      {/* Error banner */}
      {error && (
        <div className="rounded-md border border-destructive/40 bg-destructive/5 px-3 py-2 text-sm text-destructive">
          {error}
        </div>
      )}

      {/* Event list */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-medium text-muted-foreground">
            Suggested events
          </h2>
          <Button
            type="button"
            size="sm"
            variant="outline"
            onClick={handleAddCustomEvent}
          >
            Add custom event
          </Button>
        </div>

        <div className="flex flex-col gap-3">
          {events.map((event) => {
            const hasName = event.name.trim().length > 0;
            const showWarning =
              event.isIncluded &&
              (!event.date || !event.timeStart || !event.timeEnd);

            return (
              <Card
                key={event.id}
                className={cn(
                  "border transition-colors",
                  event.isIncluded
                    ? "border-wedx-primary-100 bg-wedx-primary-50/40"
                    : "border-dashed border-muted bg-background"
                )}
              >
                <CardHeader className="flex flex-row items-start justify-between gap-3 pb-3">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => handleToggleInclude(event.id)}
                        className={cn(
                          "inline-flex h-5 w-5 items-center justify-center rounded border text-[0.65rem] font-medium",
                          event.isIncluded
                            ? "border-wedx-primary-500 bg-wedx-primary-500 text-white"
                            : "border-muted bg-background text-muted-foreground"
                        )}
                        aria-pressed={event.isIncluded ? "true" : "false"}
                      >
                        {event.isIncluded ? "✓" : ""}
                      </button>
                      <Input
                        value={event.name}
                        onChange={(e) =>
                          handleFieldChange(event.id, "name", e.target.value)
                        }
                        placeholder={
                          event.isCustom ? "Custom event name" : "Event name"
                        }
                        className="h-8 max-w-xs text-sm"
                      />
                      {event.isSuggested && (
                        <span className="rounded-full bg-wedx-neutral-100 px-2 py-0.5 text-[0.65rem] font-medium text-muted-foreground">
                          Suggested
                        </span>
                      )}
                    </div>
                    <CardDescription className="text-[0.7rem]">
                      {event.isIncluded
                        ? "Included in your plan"
                        : "Excluded – toggle on to include in your plan"}
                    </CardDescription>
                  </div>

                  {event.isCustom && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7 text-xs text-muted-foreground hover:text-destructive"
                      onClick={() => handleRemoveCustomEvent(event.id)}
                    >
                      ×
                    </Button>
                  )}
                </CardHeader>

                <CardContent className="space-y-3">
                  <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
                    <div className="space-y-1">
                      <div className="text-[0.7rem] font-medium text-muted-foreground">
                        Location
                      </div>
                      <Input
                        value={event.location}
                        onChange={(e) =>
                          handleFieldChange(
                            event.id,
                            "location",
                            e.target.value
                          )
                        }
                        placeholder="Venue or TBD"
                        className="h-8 text-xs"
                      />
                    </div>

                    <div className="space-y-1">
                      <div className="text-[0.7rem] font-medium text-muted-foreground">
                        Date
                      </div>
                      <Input
                        type="date"
                        value={event.date}
                        onChange={(e) =>
                          handleFieldChange(event.id, "date", e.target.value)
                        }
                        className="h-8 text-xs"
                      />
                    </div>

                    <div className="space-y-1">
                      <div className="text-[0.7rem] font-medium text-muted-foreground">
                        Time (start – end)
                      </div>
                      <div className="flex items-center gap-1">
                        <Input
                          type="time"
                          value={event.timeStart}
                          onChange={(e) =>
                            handleFieldChange(
                              event.id,
                              "timeStart",
                              e.target.value
                            )
                          }
                          className="h-8 text-xs"
                        />
                        <span className="text-[0.7rem] text-muted-foreground">
                          to
                        </span>
                        <Input
                          type="time"
                          value={event.timeEnd}
                          onChange={(e) =>
                            handleFieldChange(
                              event.id,
                              "timeEnd",
                              e.target.value
                            )
                          }
                          className="h-8 text-xs"
                        />
                      </div>
                    </div>

                    <div className="space-y-1">
                      <div className="text-[0.7rem] font-medium text-muted-foreground">
                        Guest estimate
                      </div>
                      <Input
                        type="number"
                        min={0}
                        value={event.guestEstimate}
                        onChange={(e) =>
                          handleFieldChange(
                            event.id,
                            "guestEstimate",
                            e.target.value
                          )
                        }
                        placeholder="Optional"
                        className="h-8 text-xs"
                      />
                    </div>
                  </div>

                  {event.isIncluded && !hasName && (
                    <div className="text-[0.7rem] text-destructive">
                      Event name is required for included events.
                    </div>
                  )}

                  {event.isIncluded && showWarning && hasName && (
                    <div className="text-[0.7rem] text-amber-600">
                      You can continue without date/time, but adding them will
                      help us build a better timeline.
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}

          {events.length === 0 && !loading && (
            <Card className="border-dashed">
              <CardHeader>
                <CardTitle className="text-sm">No events yet</CardTitle>
                <CardDescription className="text-xs">
                  Start by adding a custom event. Suggested events will appear
                  here once your wedding type is configured.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button type="button" size="sm" onClick={handleAddCustomEvent}>
                  Add your first event
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
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
