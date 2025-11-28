"use client";

import { useEffect, useState } from "react";
import { listVendorsForEvent } from "@/lib/api/vendors";
import { Vendor } from "@/lib/vendors/types";
import { buildWhatsAppLink } from "@/lib/vendors/whatsapp";
import { VENDOR_STATUS_OPTIONS, statusTone } from "@/lib/vendors/status";

export default function VendorsForEvent({ eventId }: { eventId: string }) {
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    if (!eventId) return;
    (async () => {
      try {
        const list = await listVendorsForEvent(eventId);
        if (!cancelled) setVendors(list);
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : "Failed to load vendors");
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [eventId]);

  if (!eventId) return null;
  if (loading) return <div>Loading vendors…</div>;
  if (error) return <div className="text-red-700">Failed to load vendors: {error}</div>;
  if (vendors.length === 0)
    return (
      <div className="space-y-1">
        <p className="text-muted-foreground">No vendors linked yet.</p>
        <p>
          <a className="text-wedx-primary-700 underline" href="/vendors">
            Open vendor directory
          </a>{" "}
          to link vendors to this event.
        </p>
      </div>
    );

  return (
    <ul className="space-y-1">
      {vendors.map((vendor) => (
        <li key={vendor.id} className="flex items-center gap-2">
          <span className="font-medium text-foreground">{vendor.name}</span>
          {vendor.category && (
            <span className="rounded-full border px-2 py-0.5 text-[11px] text-muted-foreground">
              {vendor.category}
            </span>
          )}
          <span
            className={`rounded-full px-2 py-0.5 text-[11px] font-medium ${statusTone(
              vendor.status
            )}`}
          >
            {
              VENDOR_STATUS_OPTIONS.find((option) => option.value === vendor.status)
                ?.label ?? vendor.status
            }
          </span>
          {vendor.whatsappNumber && (
            <a
              href={buildWhatsAppLink(vendor.whatsappNumber)}
              className="rounded-full border px-2 py-0.5 text-[11px] text-wedx-primary-700 underline-offset-2 hover:underline"
              target="_blank"
              rel="noreferrer"
            >
              WhatsApp: {vendor.whatsappNumber}
            </a>
          )}
        </li>
      ))}
    </ul>
  );
}
