import Link from "next/link";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default function DashboardPage() {
  // For Story 2.5 we use mocked / placeholder data.
  // Later stories will hydrate this from real APIs (wedding, events, settings).
  const weddingName = "Your Wedding";
  const weddingType = "Buddhist–Christian mixed wedding";
  const weddingDateLabel = "Date to be confirmed";
  const daysToGoLabel = "Set your date to see a countdown";
  const eventsCount = 3;

  const events = [
    { id: "event-1", name: "Poruwa Ceremony", dateLabel: "TBD", status: "Configured" },
    { id: "event-2", name: "Reception", dateLabel: "TBD", status: "Configured" },
    { id: "event-3", name: "Homecoming", dateLabel: "TBD", status: "Draft" },
  ];

  const hasEvents = events.length > 0;

  return (
    <section className="space-y-6">
      {/* Summary header */}
      <div className="space-y-1">
        <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
          Today
        </p>
        <h1 className="text-2xl font-semibold tracking-tight">
          Welcome back, let's plan this calmly
        </h1>
        <p className="text-sm text-muted-foreground max-w-2xl">
          This is your control room for the wedding. We'll keep things
          simple: a clear summary, a few next actions, and a quick view of your
          events. As you add more details, this page will grow with you.
        </p>
      </div>

      {/* Summary strip */}
      <Card className="border-dashed bg-muted/40">
        <CardContent className="flex flex-col gap-4 pt-4 md:flex-row md:items-center md:justify-between">
          <div className="space-y-1">
            <div className="text-xs font-medium uppercase tracking-[0.18em] text-muted-foreground">
              Wedding overview
            </div>
            <div className="text-sm font-semibold text-foreground">
              {weddingName}
            </div>
            <div className="text-xs text-muted-foreground">
              {weddingType}
            </div>
          </div>
          <div className="flex flex-wrap gap-4 text-xs">
            <div className="space-y-0.5">
              <div className="text-[0.7rem] uppercase tracking-[0.16em] text-muted-foreground">
                Date
              </div>
              <div className="rounded-full border bg-background px-3 py-1">
                {weddingDateLabel}
              </div>
              <div className="text-[0.7rem] text-muted-foreground">
                {daysToGoLabel}
              </div>
            </div>
            <div className="space-y-0.5">
              <div className="text-[0.7rem] uppercase tracking-[0.16em] text-muted-foreground">
                Events
              </div>
              <div className="rounded-full border bg-background px-3 py-1">
                {eventsCount} events configured
              </div>
              <div className="text-[0.7rem] text-muted-foreground">
                You can refine details any time.
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Main grid */}
      <div className="grid gap-4 md:grid-cols-[minmax(0,2fr)_minmax(0,1.4fr)]">
        {/* Left column – Next actions + Setup status */}
        <div className="space-y-4">
          {/* Next actions card */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Next 3 actions</CardTitle>
              <CardDescription className="text-sm">
                A short, calm list of things that will move your planning
                forward today.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <ol className="space-y-2 text-sm">
                <li className="flex items-start gap-2">
                  <span className="mt-0.5 h-5 w-5 shrink-0 rounded-full border bg-background text-center text-[0.7rem] leading-5 text-muted-foreground">
                    1
                  </span>
                  <div>
                    <div className="font-medium">
                      Invite your partner to join wedX
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Share access so you can plan together and keep everyone on
                      the same page.
                    </p>
                    <div className="mt-1">
                      <button
                        type="button"
                        className="text-xs font-medium text-wedx-primary-700 underline-offset-2 hover:underline"
                      >
                        Copy invite link (placeholder)
                      </button>
                    </div>
                  </div>
                </li>
                <li className="flex items-start gap-2">
                  <span className="mt-0.5 h-5 w-5 shrink-0 rounded-full border bg-background text-center text-[0.7rem] leading-5 text-muted-foreground">
                    2
                  </span>
                  <div>
                    <div className="font-medium">
                      Review your events and add missing details
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Check that each ceremony and celebration is listed with
                      the right name and rough timing.
                    </p>
                    <div className="mt-1">
                      <Link
                        href="/events"
                        className="text-xs font-medium text-wedx-primary-700 underline-offset-2 hover:underline"
                      >
                        Go to events
                      </Link>
                    </div>
                  </div>
                </li>
                <li className="flex items-start gap-2">
                  <span className="mt-0.5 h-5 w-5 shrink-0 rounded-full border bg-background text-center text-[0.7rem] leading-5 text-muted-foreground">
                    3
                  </span>
                  <div>
                    <div className="font-medium">
                      Explore checklists for your main ceremony
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Soon you'll see tailored checklists here. For now,
                      you can preview the checklist area.
                    </p>
                    <div className="mt-1">
                      <Link
                        href="/checklist"
                        className="text-xs font-medium text-wedx-primary-700 underline-offset-2 hover:underline"
                      >
                        Open checklist hub
                      </Link>
                    </div>
                  </div>
                </li>
              </ol>
            </CardContent>
          </Card>

          {/* Setup status card */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Setup status</CardTitle>
              <CardDescription className="text-sm">
                Your onboarding wizard is complete. You can always adjust your
                setup later.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <div className="flex items-center gap-2 rounded-md border border-emerald-200 bg-emerald-50 px-3 py-2 text-emerald-800">
                <span className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-emerald-600 text-[0.7rem] font-semibold text-white">
                  ✓
                </span>
                <div>
                  <div className="font-medium">Onboarding complete</div>
                  <p className="text-xs text-emerald-900/80">
                    We've captured your wedding type, events, vibe, and
                    key rituals. Next, we'll help you turn this into clear
                    tasks.
                  </p>
                </div>
              </div>
              <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-muted-foreground">
                <span>Need to change something from the wizard?</span>
                <Link
                  href="/wizard/step-1"
                  className="font-medium text-wedx-primary-700 underline-offset-2 hover:underline"
                >
                  Edit setup
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right column – Events overview */}
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Your events</CardTitle>
              <CardDescription className="text-sm">
                A quick snapshot of the main ceremonies and celebrations in your
                plan.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {hasEvents ? (
                <>
                  <div className="text-xs text-muted-foreground">
                    {eventsCount} events configured. You can refine names,
                    dates, and timings as you go.
                  </div>
                  <ul className="space-y-2 text-sm">
                    {events.slice(0, 5).map((event) => (
                      <li
                        key={event.id}
                        className="flex items-center justify-between rounded-md border bg-background px-3 py-2 text-xs"
                      >
                        <div className="space-y-0.5">
                          <div className="font-medium text-foreground">
                            {event.name}
                          </div>
                          <div className="text-[0.7rem] text-muted-foreground">
                            {event.dateLabel}
                          </div>
                        </div>
                        <div className="flex flex-col items-end gap-1">
                          <span className="inline-flex items-center rounded-full border bg-wedx-neutral-50 px-2 py-0.5 text-[0.65rem] text-muted-foreground">
                            {event.status}
                          </span>
                        </div>
                      </li>
                    ))}
                  </ul>
                  <div className="pt-1 text-xs">
                    <Link
                      href="/events"
                      className="font-medium text-wedx-primary-700 underline-offset-2 hover:underline"
                    >
                      View all events
                    </Link>
                  </div>
                </>
              ) : (
                <div className="space-y-2 text-sm">
                  <p className="text-muted-foreground">
                    You haven't added any events yet.
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Start with the wizard to set up your main ceremonies, or
                    add an event manually from the Events page.
                  </p>
                  <div className="flex flex-wrap gap-2 text-xs">
                    <Link
                      href="/wizard/step-2"
                      className="font-medium text-wedx-primary-700 underline-offset-2 hover:underline"
                    >
                      Open wizard events step
                    </Link>
                    <span className="text-muted-foreground">·</span>
                    <Link
                      href="/events"
                      className="font-medium text-wedx-primary-700 underline-offset-2 hover:underline"
                    >
                      Go to events
                    </Link>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* AI Planner Card */}
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">AI Planner</CardTitle>
              <CardDescription className="text-sm">
                Get personalized suggestions for your wedding planning based on your current progress.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-2 rounded-md border bg-blue-50 px-3 py-2 text-blue-800">
                  <span className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-blue-600 text-[0.7rem] font-semibold text-white">
                    ✨
                  </span>
                  <div>
                    <div className="font-medium">Ready to help</div>
                    <p className="text-xs text-blue-900/80">
                      Ask about checklists, vendors, budget, or any wedding planning questions.
                    </p>
                  </div>
                </div>
                <div className="text-xs text-muted-foreground">
                  Quick suggestions based on your wedding setup:
                </div>
                <ul className="space-y-1 text-xs">
                  <li className="flex items-start gap-2">
                    <span className="mt-0.5 h-4 w-4 shrink-0 rounded-full border bg-background text-center text-[0.6rem] leading-4 text-muted-foreground">
                      ?
                    </span>
                    <span>What should we focus on this week?</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="mt-0.5 h-4 w-4 shrink-0 rounded-full border bg-background text-center text-[0.6rem] leading-4 text-muted-foreground">
                      ?
                    </span>
                    <span>Which vendors should we book next?</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="mt-0.5 h-4 w-4 shrink-0 rounded-full border bg-background text-center text-[0.6rem] leading-4 text-muted-foreground">
                      ?
                    </span>
                    <span>Are there any budget concerns?</span>
                  </li>
                </ul>
              </div>
              <div className="pt-1 text-xs">
                <Link
                  href="/ai"
                  className="font-medium text-wedx-primary-700 underline-offset-2 hover:underline"
                >
                  Open AI Planner
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  );
}

