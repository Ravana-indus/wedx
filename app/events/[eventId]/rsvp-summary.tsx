"use client";

import { useEffect, useState } from "react";
import { fetchRsvpSummary } from "@/lib/api/invitations";

export default function RsvpSummary({ eventId }: { eventId: string }) {
  const [summary, setSummary] = useState<{
    invited: number;
    accepted: number;
    declined: number;
    maybe: number;
    not_invited: number;
    attendingCount: number;
  } | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    if (!eventId) return;
    (async () => {
      try {
        const data = await fetchRsvpSummary(eventId);
        if (!cancelled) setSummary(data);
      } catch (err) {
        if (!cancelled) setError("Failed to load RSVP summary");
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [eventId]);

  if (!eventId) return null;
  if (error) return <div className="text-red-700">{error}</div>;
  if (!summary) return <div>Loading…</div>;

  return (
    <div className="space-y-1">
      <div>Invited: {summary.invited}</div>
      <div>Accepted: {summary.accepted}</div>
      <div>Declined: {summary.declined}</div>
      <div>Maybe: {summary.maybe}</div>
      <div>Attending count: {summary.attendingCount}</div>
    </div>
  );
}
