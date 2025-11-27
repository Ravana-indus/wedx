import Link from "next/link";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default function ChecklistPage() {
  return (
    <section className="space-y-6">
      <div className="space-y-1">
        <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
          Checklist
        </p>
        <h1 className="text-2xl font-semibold tracking-tight">
          Checklist hub (placeholder)
        </h1>
        <p className="text-sm text-muted-foreground max-w-2xl">
          This is a simple placeholder for your wedding checklists. In future
          stories, you'll see tasks here that are generated from your
          events, rituals, and preferences.
        </p>
      </div>

      <Card className="border-dashed">
        <CardHeader>
          <CardTitle className="text-base">What you'll see here</CardTitle>
          <CardDescription className="text-sm">
            For Story 2.6, this page exists so navigation from Today and Events
            never lands on a dead end.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3 text-sm text-muted-foreground">
          <ul className="list-disc space-y-1 pl-5 text-xs">
            <li>High-level checklist categories (ceremony, outfits, decor…)</li>
            <li>Tasks grouped by event and ritual</li>
            <li>Status, due dates, and gentle reminders</li>
          </ul>
          <p className="text-xs">
            For now, you can return to the Today dashboard to continue planning.
          </p>
          <Link
            href="/dashboard"
            className="text-xs font-medium text-wedx-primary-700 underline-offset-2 hover:underline"
          >
            Back to Today
          </Link>
        </CardContent>
      </Card>
    </section>
  );
}