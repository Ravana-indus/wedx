// For Story 2.6 we use mocked / placeholder data.
// Later stories will hydrate this from real APIs (GET /api/weddings/:id/events).
export const events = [
  {
    id: "event-1",
    name: "Poruwa Ceremony",
    dateLabel: "Date to be confirmed",
    timeLabel: "Time to be confirmed",
    location: "Location to be confirmed",
  },
  {
    id: "event-2",
    name: "Reception",
    dateLabel: "Date to be confirmed",
    timeLabel: "Time to be confirmed",
    location: "Location to be confirmed",
  },
  {
    id: "event-3",
    name: "Homecoming",
    dateLabel: "Date to be confirmed",
    timeLabel: "Time to be confirmed",
    location: "Location to be confirmed",
  },
];

// Minimal event lookup helper for the detail page to reuse.
export function getEventById(eventId: string) {
  return events.find((event) => event.id === eventId) ?? null;
}
