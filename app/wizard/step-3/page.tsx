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

type VibeId = "classic" | "modern" | "luxury" | "rustic" | "beach" | "intimate";

type ColorPaletteKey =
  | "blush-gold"
  | "emerald-ivory"
  | "navy-silver"
  | "terracotta-cream"
  | "custom";

type MoodTagId =
  | "intimate"
  | "grand"
  | "family-focused"
  | "party-heavy"
  | "spiritual"
  | "destination";

interface VibeOption {
  id: VibeId;
  title: string;
  description: string;
}

interface ColorPaletteOption {
  key: ColorPaletteKey;
  label: string;
  colors: string[]; // hex codes
}

interface MoodTagOption {
  id: MoodTagId;
  label: string;
}

const VIBE_OPTIONS: VibeOption[] = [
  {
    id: "classic",
    title: "Classic / Traditional",
    description: "Timeless, ceremonial, rooted in tradition.",
  },
  {
    id: "modern",
    title: "Modern / Minimal",
    description: "Clean lines, simple decor, less is more.",
  },
  {
    id: "luxury",
    title: "Luxury / Glam",
    description: "High impact, statement decor, premium feel.",
  },
  {
    id: "rustic",
    title: "Rustic / Boho",
    description: "Earthy, relaxed, lots of texture and greenery.",
  },
  {
    id: "beach",
    title: "Beach / Destination",
    description: "Sun, sand, and travel-friendly celebrations.",
  },
  {
    id: "intimate",
    title: "Intimate / Home",
    description: "Small, cozy, often at home or a familiar venue.",
  },
];

const COLOR_PALETTES: ColorPaletteOption[] = [
  {
    key: "blush-gold",
    label: "Blush & Gold",
    colors: ["#F9E3E8", "#F5C6CB", "#D4AF37"],
  },
  {
    key: "emerald-ivory",
    label: "Emerald & Ivory",
    colors: ["#0F5132", "#198754", "#F8F9FA"],
  },
  {
    key: "navy-silver",
    label: "Navy & Silver",
    colors: ["#0B1F3B", "#1F3B5B", "#CED4DA"],
  },
  {
    key: "terracotta-cream",
    label: "Terracotta & Cream",
    colors: ["#E07A5F", "#F2CC8F", "#F4F1DE"],
  },
  {
    key: "custom",
    label: "Custom palette",
    colors: ["#FFFFFF", "#FFFFFF", "#FFFFFF"],
  },
];

const MOOD_TAGS: MoodTagOption[] = [
  { id: "intimate", label: "Intimate" },
  { id: "grand", label: "Grand" },
  { id: "family-focused", label: "Family-focused" },
  { id: "party-heavy", label: "Party-heavy" },
  { id: "spiritual", label: "Spiritual" },
  { id: "destination", label: "Destination" },
];

interface WeddingStyleState {
  vibePrimary: VibeId | null;
  vibeSecondary: VibeId | null;
  colorPaletteKey: ColorPaletteKey | null;
  colorPaletteCustom: string[]; // hex codes
  moodTags: MoodTagId[];
  styleNotes: string;
}

export default function VibeAndThemeStepPage() {
  const router = useRouter();

  const [state, setState] = React.useState<WeddingStyleState>({
    vibePrimary: null,
    vibeSecondary: null,
    colorPaletteKey: null,
    colorPaletteCustom: ["", "", ""],
    moodTags: [],
    styleNotes: "",
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
        // For Story 2.3 we can keep this as a no-op or mock.
        if (!isMounted) return;
      } catch (e) {
        if (!isMounted) return;
        setError(
          "We couldn’t load your style settings. You can still choose a vibe and continue."
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

  const handleSelectPrimaryVibe = (id: VibeId) => {
    setError(null);
    setState((prev) => ({
      ...prev,
      vibePrimary: id,
      // If secondary equals new primary, clear secondary
      vibeSecondary: prev.vibeSecondary === id ? null : prev.vibeSecondary,
    }));
  };

  const handleSelectSecondaryVibe = (id: VibeId) => {
    setError(null);
    setState((prev) => ({
      ...prev,
      // Toggle behaviour for secondary
      vibeSecondary: prev.vibeSecondary === id ? null : id,
      // Ensure primary and secondary are not identical
      vibePrimary: prev.vibePrimary === id ? null : prev.vibePrimary,
    }));
  };

  const handleSelectPalette = (key: ColorPaletteKey) => {
    setError(null);
    setState((prev) => ({
      ...prev,
      colorPaletteKey: key,
    }));
  };

  const handleCustomColorChange = (index: number, value: string) => {
    setError(null);
    setState((prev) => {
      const next = [...prev.colorPaletteCustom];
      next[index] = value;
      return { ...prev, colorPaletteCustom: next };
    });
  };

  const handleToggleMoodTag = (id: MoodTagId) => {
    setError(null);
    setState((prev) => {
      const exists = prev.moodTags.includes(id);
      return {
        ...prev,
        moodTags: exists
          ? prev.moodTags.filter((tag) => tag !== id)
          : [...prev.moodTags, id],
      };
    });
  };

  const handleNotesChange = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
    setError(null);
    setState((prev) => ({
      ...prev,
      styleNotes: event.target.value,
    }));
  };

  const isValid = React.useMemo(() => {
    if (!state.vibePrimary) return false;
    if (!state.colorPaletteKey) return false;

    if (state.colorPaletteKey === "custom") {
      const hasAtLeastOneColor = state.colorPaletteCustom.some(
        (c) => c.trim().length > 0
      );
      if (!hasAtLeastOneColor) return false;
    }

    return true;
  }, [state]);

  const handleNext = async () => {
    if (!isValid || saving) return;

    setSaving(true);
    setError(null);

    try {
      // TODO: replace with real PATCH /api/weddings/:id/settings
      // For now we just simulate a short delay and navigate.
      await new Promise((resolve) => setTimeout(resolve, 400));

      router.push("/wizard/step-4");
    } catch (e) {
      setError("We couldn’t save your style choices. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  const handleBack = () => {
    router.push("/wizard/step-2");
  };

  const disabled = !isValid || saving || loading;

  return (
    <div className="flex h-full flex-col gap-6">
      {/* Title + description */}
      <div className="space-y-2">
        <h1 className="text-2xl font-semibold tracking-tight text-wedx-primary-800">
          Set the vibe and theme for your wedding
        </h1>
        <p className="text-sm text-muted-foreground max-w-xl">
          Choose the overall feel, colors, and mood so wedX can tailor
          checklists, inspiration, and suggestions to your style.
        </p>
      </div>

      {/* Error banner */}
      {error && (
        <div className="rounded-md border border-destructive/40 bg-destructive/5 px-3 py-2 text-sm text-destructive">
          {error}
        </div>
      )}

      {/* Vibe selection */}
      <section className="space-y-3">
        <div className="flex items-baseline justify-between gap-2">
          <div>
            <h2 className="text-sm font-semibold text-foreground">
              Overall vibe
            </h2>
            <p className="text-xs text-muted-foreground">
              Pick one primary vibe and, if you like, a secondary vibe that also
              feels right.
            </p>
          </div>
          <div className="text-[0.7rem] text-muted-foreground">
            Primary is required, secondary is optional.
          </div>
        </div>

        <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
          {VIBE_OPTIONS.map((vibe) => {
            const isPrimary = state.vibePrimary === vibe.id;
            const isSecondary = state.vibeSecondary === vibe.id;

            return (
              <Card
                key={vibe.id}
                className={cn(
                  "relative h-full border-2 transition-colors",
                  isPrimary
                    ? "border-wedx-primary-500 bg-wedx-primary-50/60"
                    : isSecondary
                    ? "border-wedx-support-400 bg-wedx-support-50/40"
                    : "border-transparent hover:border-wedx-neutral-200"
                )}
              >
                <CardHeader className="space-y-1 pb-3">
                  <div className="flex items-center justify-between gap-2">
                    <CardTitle className="text-base font-semibold">
                      {vibe.title}
                    </CardTitle>
                    <div className="flex gap-1">
                      <Button
                        type="button"
                        size="xs"
                        variant={isPrimary ? "default" : "outline"}
                        className={cn(
                          "h-6 rounded-full px-2 text-[0.65rem]",
                          isPrimary &&
                            "bg-wedx-primary-600 hover:bg-wedx-primary-700 border-wedx-primary-700"
                        )}
                        onClick={() => handleSelectPrimaryVibe(vibe.id)}
                      >
                        Primary
                      </Button>
                      <Button
                        type="button"
                        size="xs"
                        variant={isSecondary ? "default" : "outline"}
                        className={cn(
                          "h-6 rounded-full px-2 text-[0.65rem]",
                          isSecondary &&
                            "bg-wedx-support-600 hover:bg-wedx-support-700 border-wedx-support-700"
                        )}
                        onClick={() => handleSelectSecondaryVibe(vibe.id)}
                      >
                        Secondary
                      </Button>
                    </div>
                  </div>
                  <CardDescription className="text-xs">
                    {vibe.description}
                  </CardDescription>
                </CardHeader>
              </Card>
            );
          })}
        </div>
      </section>

      {/* Color palette selection */}
      <section className="space-y-3">
        <div className="flex items-baseline justify-between gap-2">
          <div>
            <h2 className="text-sm font-semibold text-foreground">
              Color palette
            </h2>
            <p className="text-xs text-muted-foreground">
              Choose a palette that feels right. You can also define your own
              custom colors.
            </p>
          </div>
          <div className="text-[0.7rem] text-muted-foreground">
            Required – including “Custom”.
          </div>
        </div>

        <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
          {COLOR_PALETTES.map((palette) => {
            const isSelected = state.colorPaletteKey === palette.key;

            return (
              <button
                key={palette.key}
                type="button"
                onClick={() => handleSelectPalette(palette.key)}
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
                  <CardHeader className="space-y-2 pb-3">
                    <CardTitle className="text-sm font-semibold">
                      {palette.label}
                    </CardTitle>
                    <div className="flex gap-1">
                      {palette.colors.map((color, index) => (
                        <div
                          key={index}
                          className="h-6 flex-1 rounded-md border"
                          style={{ backgroundColor: color }}
                        />
                      ))}
                    </div>
                  </CardHeader>
                </Card>
              </button>
            );
          })}
        </div>

        {state.colorPaletteKey === "custom" && (
          <Card className="mt-2 border-dashed border-wedx-accent-300 bg-wedx-accent-50/40">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-semibold">
                Define your custom colors
              </CardTitle>
              <CardDescription className="text-xs">
                Add a few key colors you have in mind – for example, your saree,
                suit, or decor colors.
              </CardDescription>
            </CardHeader>
            <CardContent className="grid gap-3 md:grid-cols-3">
              {state.colorPaletteCustom.map((value, index) => (
                <div key={index} className="space-y-1">
                  <div className="text-[0.7rem] font-medium text-muted-foreground">
                    Color {index + 1}
                  </div>
                  <Input
                    value={value}
                    onChange={(e) =>
                      handleCustomColorChange(index, e.target.value)
                    }
                    placeholder="#F5C6CB"
                    className="h-8 text-xs"
                  />
                </div>
              ))}
            </CardContent>
          </Card>
        )}
      </section>

      {/* Mood tags & notes */}
      <section className="grid gap-4 md:grid-cols-[minmax(0,2fr)_minmax(0,3fr)]">
        <div className="space-y-2">
          <h2 className="text-sm font-semibold text-foreground">Mood tags</h2>
          <p className="text-xs text-muted-foreground">
            Optional – pick a few words that describe how you want the wedding
            to feel.
          </p>
          <div className="flex flex-wrap gap-2 pt-1">
            {MOOD_TAGS.map((tag) => {
              const selected = state.moodTags.includes(tag.id);
              return (
                <Button
                  key={tag.id}
                  type="button"
                  size="sm"
                  variant={selected ? "default" : "outline"}
                  className={cn(
                    "rounded-full px-3 py-1 text-xs",
                    selected &&
                      "bg-wedx-support-600 hover:bg-wedx-support-700 border-wedx-support-700"
                  )}
                  onClick={() => handleToggleMoodTag(tag.id)}
                >
                  {tag.label}
                </Button>
              );
            })}
          </div>
        </div>

        <div className="space-y-2">
          <h2 className="text-sm font-semibold text-foreground">
            Notes about your style (optional)
          </h2>
          <p className="text-xs text-muted-foreground">
            Share anything else that captures your vision – for example, “simple
            home ceremony with pastel flowers and lots of family photos”.
          </p>
          <div className="mt-1">
            <textarea
              value={state.styleNotes}
              onChange={handleNotesChange}
              rows={4}
              className="w-full rounded-md border bg-background px-3 py-2 text-xs shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-wedx-primary-500 focus-visible:ring-offset-2"
              placeholder="Write a short description of your dream vibe..."
            />
          </div>
        </div>
      </section>

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
