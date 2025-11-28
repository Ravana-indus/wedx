import Link from "next/link";
import { notFound } from "next/navigation";
import { getEventById } from "../page";
import VendorsForEvent from "./vendors-for-event";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

interface EventDetailPageProps {
  params: {
    eventId: string;
  };
}

// Minimal event detail shell for Story 2.6.
// Uses mocked data via getEventById and focuses on navigation and layout.
export default function EventDetailPage({ params }: EventDetailPageProps) {
  const event = getEventById(params.eventId);

  if (!event) {
    // In a real implementation we might show a nicer empty state.
    notFound();
  }

  return (
    <section className="space-y-6">
      {/* Breadcrumbs / back links */}
      <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
        <Link
          href="/events"
          className="underline-offset-2 hover:underline text-wedx-primary-700"
        >
          Back to events
        </Link>
        <span>·</span>
        <Link href="/dashboard" className="underline-offset-2 hover:underline">
          Back to Today
        </Link>
      </div>

      {/* Header */}
      <div className="space-y-1">
        <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
          Event
        </p>
        <h1 className="text-2xl font-semibold tracking-tight">{event?.name}</h1>
        <p className="text-sm text-muted-foreground max-w-2xl">
          This is a simple event overview. Later, you'll manage detailed
          timelines, rituals, vendors, and checklists from here.
        </p>
      </div>

      {/* Event summary card */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Event summary</CardTitle>
          <CardDescription className="text-sm">
            Basic details for this event. These will eventually sync with your
            full schedule and vendor plans.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-2 text-sm">
          <div className="flex flex-wrap gap-4 text-xs text-muted-foreground">
            <div>
              <div className="text-[0.7rem] uppercase tracking-[0.16em]">
                Date
              </div>
              <div className="mt-0.5 rounded-full border bg-background px-3 py-1 text-[0.75rem] text-foreground">
                {event?.dateLabel}
              </div>
            </div>
            <div>
              <div className="text-[0.7rem] uppercase tracking-[0.16em]">
                Time
              </div>
              <div className="mt-0.5 rounded-full border bg-background px-3 py-1 text-[0.75rem] text-foreground">
                {event?.timeLabel}
              </div>
            </div>
            <div>
              <div className="text-[0.7rem] uppercase tracking-[0.16em]">
                Location
              </div>
              <div className="mt-0.5 rounded-full border bg-background px-3 py-1 text-[0.75rem] text-foreground">
                {event?.location}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Placeholder sections for downstream stories */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card className="border-dashed">
          <CardHeader>
            <CardTitle className="text-sm">Rituals</CardTitle>
            <CardDescription className="text-xs">
              Later, this will show the rituals attached to this event.
            </CardDescription>
          </CardHeader>
          <CardContent className="text-xs text-muted-foreground space-y-2">
            <p>For now, you can configure rituals from the wizard's Step 4.</p>
            <Link
              href="/wizard/step-4"
              className="text-xs font-medium text-wedx-primary-700 underline-offset-2 hover:underline"
            >
              Go to rituals configuration
            </Link>
          </CardContent>
        </Card>

        <Card className="border-dashed">
          <CardHeader>
            <CardTitle className="text-sm">Vendors</CardTitle>
            <CardDescription className="text-xs">
              Vendors linked to this event.
            </CardDescription>
          </CardHeader>
          <CardContent className="text-xs text-muted-foreground space-y-2">
            <VendorsForEvent eventId={event?.id ?? ""} />
          </CardContent>
        </Card>

        <Card className="border-dashed">
          <CardHeader>
            <CardTitle className="text-sm">Checklist</CardTitle>
            <CardDescription className="text-xs">
              Placeholder for event-specific checklist items.
            </CardDescription>
          </CardHeader>
          <CardContent className="text-xs text-muted-foreground space-y-2">
            <p>
              Soon, you'll see tasks here that are generated from your rituals
              and preferences.
            </p>
            <Link
              href="/checklist"
              className="text-xs font-medium text-wedx-primary-700 underline-offset-2 hover:underline"
            >
              Open checklist hub
            </Link>
          </CardContent>
        </Card>
      </div>
    </section>
  );
}
