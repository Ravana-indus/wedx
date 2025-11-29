import {
  addOrUpdateInvitations,
  invitationSummary,
  listInvitations,
  updateInvitation,
} from "@/lib/invitations/store";

describe("invitation store", () => {
  it("creates and lists invitations per event", () => {
    const created = addOrUpdateInvitations("w1", "event-1", [
      { inviteLevel: "guest", guestId: "g1", status: "invited" },
    ]);
    expect(created[0].eventId).toBe("event-1");
    const list = listInvitations("w1", "event-1");
    expect(list.map((i) => i.id)).toContain(created[0].id);
  });

  it("updates invitation status and summary", () => {
    const [inv] = addOrUpdateInvitations("w2", "event-2", [
      { inviteLevel: "guest", guestId: "g2", status: "invited", attendingCount: 2 },
    ]);
    const updated = updateInvitation(inv.id, (i) => ({ ...i, status: "accepted" }))!;
    expect(updated.status).toBe("accepted");
    const summary = invitationSummary("w2", "event-2");
    expect(summary.accepted).toBeGreaterThanOrEqual(1);
    expect(summary.attendingCount).toBeGreaterThan(0);
  });
});
