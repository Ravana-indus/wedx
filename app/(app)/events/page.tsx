import Link from "next/link";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { events } from "@/lib/events/data";

export default function EventsPage() {
  const hasEvents = events.length > 0;

  return (
    <section className="space-y-6">
      <div className="space-y-1">
        <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
          Events
        </p>
        <h1 className="text-2xl font-semibold tracking-tight">
          Your wedding events
        </h1>
        <p className="text-sm text-muted-foreground max-w-2xl">
          This is a simple overview of the main ceremonies and celebrations in
          your plan. Later, you'll be able to manage timelines, rituals,
          vendors, and checklists from here.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Events list</CardTitle>
          <CardDescription className="text-sm">
            These events were configured during the onboarding wizard. You can
            refine names, dates, and locations later.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {hasEvents ? (
            <ul className="divide-y rounded-md border bg-background text-sm">
              {events.map((event) => (
                <li key={event.id}>
                  <Link
                    href={`/events/${event.id}`}
                    className="flex items-center justify-between gap-3 px-3 py-2 hover:bg-muted/60"
                  >
                    <div className="space-y-0.5">
                      <div className="font-medium text-foreground">
                        {event.name}
                      </div>
                      <div className="flex flex-wrap gap-2 text-[0.7rem] text-muted-foreground">
                        <span>{event.dateLabel}</span>
                        <span>·</span>
                        <span>{event.timeLabel}</span>
                        <span>·</span>
                        <span>{event.location}</span>
                      </div>
                    </div>
                    <span className="text-[0.7rem] font-medium text-wedx-primary-700 underline-offset-2">
                      View details
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          ) : (
            <div className="space-y-2 text-sm">
              <p className="text-muted-foreground">
                You haven't added any events yet.
              </p>
              <p className="text-xs text-muted-foreground">
                Start with the wizard to set up your main ceremonies, or add an
                event manually (coming soon).
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </section>
  );
}