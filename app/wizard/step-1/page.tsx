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

const BASE_TYPES: {
  id: WeddingBaseType;
  title: string;
  description: string;
}[] = [
  {
    id: "hindu",
    title: "Hindu",
    description: "Traditional Hindu wedding with rituals like Poruwa / Thali.",
  },
  {
    id: "christian",
    title: "Christian",
    description: "Church or chapel ceremony with Christian traditions.",
  },
  {
    id: "buddhist",
    title: "Buddhist",
    description: "Temple or hall ceremony with Buddhist rituals.",
  },
  {
    id: "muslim",
    title: "Muslim",
    description: "Nikah and related Islamic wedding traditions.",
  },
  {
    id: "civil",
    title: "Civil",
    description: "Registry or simple civil ceremony.",
  },
  {
    id: "mixed",
    title: "Mixed",
    description: "Blending two traditions (e.g., Hindu + Christian).",
  },
  {
    id: "other",
    title: "Other",
    description: "Something different – tell us in your own words.",
  },
];

const MIXED_TRADITIONS: {
  id: Exclude<WeddingBaseType, "mixed" | "other">;
  label: string;
}[] = [
  { id: "hindu", label: "Hindu" },
  { id: "christian", label: "Christian" },
  { id: "buddhist", label: "Buddhist" },
  { id: "muslim", label: "Muslim" },
  { id: "civil", label: "Civil" },
];

interface WeddingTypeState {
  wedding_type: WeddingBaseType | null;
  wedding_type_primary: Exclude<WeddingBaseType, "mixed" | "other"> | null;
  wedding_type_secondary: Exclude<WeddingBaseType, "mixed" | "other"> | null;
  wedding_type_other_description: string;
}

export default function WeddingTypeStepPage() {
  const router = useRouter();

  const [state, setState] = React.useState<WeddingTypeState>({
    wedding_type: null,
    wedding_type_primary: null,
    wedding_type_secondary: null,
    wedding_type_other_description: "",
  });

  const [loading, setLoading] = React.useState(false);
  const [saving, setSaving] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  // Placeholder: in a real implementation we would fetch from /api/weddings/:id
  React.useEffect(() => {
    let isMounted = true;

    async function loadInitial() {
      setLoading(true);
      setError(null);
      try {
        // TODO: replace with real API call when backend is ready.
        // For Story 2.1 we can keep this as a no-op or mock.
        if (!isMounted) return;
      } catch (e) {
        if (!isMounted) return;
        setError(
          "We couldn’t load your wedding settings. You can still choose a type and continue."
        );
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    loadInitial();
    return () => {
      isMounted = false;
    };
  }, []);

  const handleSelectBaseType = (type: WeddingBaseType) => {
    setError(null);
    setState((prev) => ({
      ...prev,
      wedding_type: type,
      // Reset mixed/other-specific fields when switching away
      wedding_type_primary: type === "mixed" ? prev.wedding_type_primary : null,
      wedding_type_secondary:
        type === "mixed" ? prev.wedding_type_secondary : null,
      wedding_type_other_description:
        type === "other" ? prev.wedding_type_other_description : "",
    }));
  };

  const handleMixedPrimaryChange = (
    value: Exclude<WeddingBaseType, "mixed" | "other">
  ) => {
    setError(null);
    setState((prev) => ({
      ...prev,
      wedding_type_primary: value,
      // Prevent primary and secondary from being identical
      wedding_type_secondary:
        prev.wedding_type_secondary === value
          ? null
          : prev.wedding_type_secondary,
    }));
  };

  const handleMixedSecondaryChange = (
    value: Exclude<WeddingBaseType, "mixed" | "other">
  ) => {
    setError(null);
    setState((prev) => ({
      ...prev,
      wedding_type_secondary: value,
      wedding_type_primary:
        prev.wedding_type_primary === value ? null : prev.wedding_type_primary,
    }));
  };

  const handleOtherDescriptionChange = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    setError(null);
    setState((prev) => ({
      ...prev,
      wedding_type_other_description: event.target.value,
    }));
  };

  const isValid = React.useMemo(() => {
    if (!state.wedding_type) return false;

    if (state.wedding_type === "mixed") {
      return Boolean(
        state.wedding_type_primary && state.wedding_type_secondary
      );
    }

    if (state.wedding_type === "other") {
      return state.wedding_type_other_description.trim().length > 0;
    }

    return true;
  }, [state]);

  const handleNext = async () => {
    if (!isValid || saving) return;

    setSaving(true);
    setError(null);

    try {
      // TODO: replace with real PATCH /api/weddings/:id or /settings
      // For now we just simulate a short delay and navigate.
      await new Promise((resolve) => setTimeout(resolve, 400));

      // Navigate to Step 2 placeholder route
      router.push("/wizard/step-2");
    } catch (e) {
      setError("We couldn’t save your selection. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  const handleBack = () => {
    // For Story 2.1, we can either disable or send back to dashboard.
    // Here we send to dashboard as a reasonable default.
    router.push("/dashboard");
  };

  const disabled = !isValid || saving || loading;

  return (
    <div className="flex h-full flex-col gap-6">
      {/* Title + description */}
      <div className="space-y-2">
        <h1 className="text-2xl font-semibold tracking-tight text-wedx-primary-800">
          What kind of wedding are you planning?
        </h1>
        <p className="text-sm text-muted-foreground max-w-xl">
          This helps wedX suggest the right events and rituals. You can always
          change this later if your plans evolve.
        </p>
      </div>

      {/* Error banner */}
      {error && (
        <div className="rounded-md border border-destructive/40 bg-destructive/5 px-3 py-2 text-sm text-destructive">
          {error}
        </div>
      )}

      {/* Cards grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {BASE_TYPES.map((option) => {
          const isSelected = state.wedding_type === option.id;

          return (
            <button
              key={option.id}
              type="button"
              onClick={() => handleSelectBaseType(option.id)}
              className={cn(
                "text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-wedx-primary-500 focus-visible:ring-offset-2 rounded-xl",
                "transition-transform hover:-translate-y-0.5"
              )}
            >
              <Card
                className={cn(
                  "h-full border-2 transition-colors",
                  isSelected
                    ? "border-wedx-primary-500 bg-wedx-primary-50/60"
                    : "border-transparent hover:border-wedx-neutral-200"
                )}
              >
                <CardHeader className="space-y-1 pb-3">
                  <CardTitle className="text-base font-semibold">
                    {option.title}
                  </CardTitle>
                  <CardDescription className="text-xs">
                    {option.description}
                  </CardDescription>
                </CardHeader>
              </Card>
            </button>
          );
        })}
      </div>

      {/* Mixed / Other details */}
      {state.wedding_type === "mixed" && (
        <Card className="mt-2 border-dashed border-wedx-support-300 bg-wedx-support-50/40">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-semibold">
              Tell us which two traditions you’re blending
            </CardTitle>
            <CardDescription className="text-xs">
              This helps us suggest the right combination of events and rituals.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-3 md:flex-row">
            <div className="flex-1 space-y-1">
              <div className="text-xs font-medium text-muted-foreground">
                Primary tradition
              </div>
              <div className="flex flex-wrap gap-2">
                {MIXED_TRADITIONS.map((t) => {
                  const selected = state.wedding_type_primary === t.id;
                  return (
                    <Button
                      key={t.id}
                      type="button"
                      size="sm"
                      variant={selected ? "default" : "outline"}
                      className={cn(
                        "rounded-full px-3 py-1 text-xs",
                        selected &&
                          "bg-wedx-support-600 hover:bg-wedx-support-700 border-wedx-support-700"
                      )}
                      onClick={() => handleMixedPrimaryChange(t.id)}
                    >
                      {t.label}
                    </Button>
                  );
                })}
              </div>
            </div>
            <div className="flex-1 space-y-1">
              <div className="text-xs font-medium text-muted-foreground">
                Secondary tradition
              </div>
              <div className="flex flex-wrap gap-2">
                {MIXED_TRADITIONS.map((t) => {
                  const selected = state.wedding_type_secondary === t.id;
                  return (
                    <Button
                      key={t.id}
                      type="button"
                      size="sm"
                      variant={selected ? "default" : "outline"}
                      className={cn(
                        "rounded-full px-3 py-1 text-xs",
                        selected &&
                          "bg-wedx-support-600 hover:bg-wedx-support-700 border-wedx-support-700"
                      )}
                      onClick={() => handleMixedSecondaryChange(t.id)}
                    >
                      {t.label}
                    </Button>
                  );
                })}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {state.wedding_type === "other" && (
        <Card className="mt-2 border-dashed border-wedx-accent-300 bg-wedx-accent-50/40">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-semibold">
              Describe your wedding in your own words
            </CardTitle>
            <CardDescription className="text-xs">
              A short description is enough – for example, “Destination beach
              ceremony with a simple blessing”.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Input
              value={state.wedding_type_other_description}
              onChange={handleOtherDescriptionChange}
              placeholder="e.g. Sri Lankan + European fusion beach wedding"
            />
          </CardContent>
        </Card>
      )}

      {/* Spacer to push footer controls down on tall screens */}
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
