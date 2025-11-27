"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

interface WizardLayoutProps {
  children: React.ReactNode;
}

const steps = [
  { id: 1, label: "Wedding type" },
  { id: 2, label: "Events" },
  { id: 3, label: "Vibe & theme" },
  { id: 4, label: "Rituals" },
  { id: 5, label: "Budget & people" },
];

export default function WizardLayout({ children }: WizardLayoutProps) {
  // For Story 2.1 we keep this static; later stories can wire real progress.
  const currentStep = 1;

  return (
    <div className="min-h-screen bg-wedx-neutral-50 text-foreground flex flex-col">
      {/* Header */}
      <header className="border-b bg-background/80 backdrop-blur">
        <div className="mx-auto flex h-16 w-full max-w-5xl items-center justify-between px-4 md:px-6">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-full bg-wedx-primary-500 flex items-center justify-center text-xs font-semibold text-white">
              wed
            </div>
            <div className="flex flex-col">
              <span className="text-sm font-semibold tracking-tight text-wedx-primary-700">
                wedX
              </span>
              <span className="text-xs text-muted-foreground">
                Wedding setup wizard
              </span>
            </div>
          </div>
          {/* Exit placeholder – wired later to dashboard/landing */}
          <Button variant="ghost" size="sm">
            Save & exit
          </Button>
        </div>
      </header>

      {/* Progress indicator */}
      <div className="border-b bg-background/60">
        <div className="mx-auto flex w-full max-w-5xl items-center gap-3 px-4 py-3 md:px-6">
          <div className="flex flex-1 items-center gap-2 overflow-x-auto">
            {steps.map((step) => {
              const isActive = step.id === currentStep;
              const isCompleted = step.id < currentStep;

              return (
                <div
                  key={step.id}
                  className={cn(
                    "flex items-center gap-2 rounded-full border px-3 py-1 text-xs md:text-sm whitespace-nowrap",
                    isActive &&
                      "border-wedx-primary-500 bg-wedx-primary-50 text-wedx-primary-700",
                    isCompleted &&
                      "border-wedx-support-500 bg-wedx-support-50 text-wedx-support-700",
                    !isActive &&
                      !isCompleted &&
                      "border-muted text-muted-foreground"
                  )}
                >
                  <span className="inline-flex h-5 w-5 items-center justify-center rounded-full border bg-background text-[0.7rem] font-medium">
                    {step.id}
                  </span>
                  <span>{step.label}</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Main content area */}
      <main className="flex-1">
        <div className="mx-auto flex h-full w-full max-w-5xl flex-col px-4 py-6 md:px-6 md:py-10">
          {children}
        </div>
      </main>

      {/* Footer shell – actual buttons live in each step */}
      <footer className="border-t bg-background/80">
        <div className="mx-auto flex w-full max-w-5xl items-center justify-between px-4 py-3 md:px-6">
          <div className="text-xs text-muted-foreground">
            Step {currentStep} of {steps.length}
          </div>
          <div className="text-xs text-muted-foreground">
            Your choices are saved as you go.
          </div>
        </div>
      </footer>
    </div>
  );
}
