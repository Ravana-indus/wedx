import * as React from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export function RightRail() {
  return (
    <div className="flex h-full flex-col gap-4 p-4">
      <Card className="border-dashed border-wedx-neutral-200 bg-background/80">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm">AI Planner (Coming Soon)</CardTitle>
          <CardDescription className="text-xs">
            This right rail will host AI suggestions, conflict warnings, and
            smart shortcuts tied to your wedding.
          </CardDescription>
        </CardHeader>
        <CardContent className="text-xs text-muted-foreground space-y-1">
          <p>Examples:</p>
          <ul className="list-disc pl-4 space-y-1">
            <li>“You&apos;re missing a florist for Homecoming.”</li>
            <li>“Guests from London arrive one day before Mehendi.”</li>
            <li>“Budget warning: venue + catering exceed target.”</li>
          </ul>
        </CardContent>
      </Card>

      <Card className="border-dashed border-wedx-neutral-200 bg-background/80">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm">Vendors & Inspiration</CardTitle>
          <CardDescription className="text-xs">
            Later, this rail surfaces vendor updates, pinned inspiration, and
            quick actions.
          </CardDescription>
        </CardHeader>
        <CardContent className="text-xs text-muted-foreground">
          <p>
            For Story 1.2 this is a placeholder to validate the three-column
            layout on desktop.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}

