"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { buildWhatsAppLink } from "@/lib/vendors/whatsapp";
import {
  VENDOR_STATUS_OPTIONS,
  priorityTone,
  statusTone,
} from "@/lib/vendors/status";
import { listVendors, updateVendorStatus } from "@/lib/api/vendors";
import { Vendor } from "@/lib/vendors/types";

const defaultEvents = [
  { id: "event-1", name: "Poruwa Ceremony" },
  { id: "event-2", name: "Reception" },
  { id: "event-3", name: "Homecoming" },
];

export default function VendorPipelinePage() {
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<{ category: string; eventId: string }>(
    { category: "", eventId: "" }
  );

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const list = await listVendors();
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
  }, []);

  const visibleVendors = useMemo(() => {
    return vendors.filter((vendor) => {
      const matchesCategory =
        !filters.category || vendor.category === filters.category;
      const matchesEvent =
        !filters.eventId || (vendor.linkedEventIds ?? []).includes(filters.eventId);
      return matchesCategory && matchesEvent;
    });
  }, [vendors, filters]);

  const grouped = useMemo(() => {
    return VENDOR_STATUS_OPTIONS.reduce<Record<string, Vendor[]>>(
      (acc, option) => {
        acc[option.value] = visibleVendors.filter(
          (vendor) => vendor.status === option.value
        );
        return acc;
      },
      {}
    );
  }, [visibleVendors]);

  const handleStatusChange = async (
    vendor: Vendor,
    status: Vendor["status"]
  ) => {
    setVendors((prev) =>
      prev.map((item) => (item.id === vendor.id ? { ...item, status } : item))
    );
    try {
      const updated = await updateVendorStatus(vendor.id, { status });
      setVendors((prev) =>
        prev.map((item) => (item.id === vendor.id ? updated : item))
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update status");
    }
  };

  const categories = Array.from(
    new Set(vendors.map((vendor) => vendor.category).filter(Boolean))
  ) as string[];

  return (
    <section className="space-y-4">
      <div className="space-y-1">
        <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
          Vendor Pipeline
        </p>
        <div className="flex flex-wrap items-center gap-3">
          <h1 className="text-2xl font-semibold tracking-tight">
            Status by stage
          </h1>
          <Link className="text-sm text-wedx-primary-700 underline" href="/vendors">
            Back to vendor directory
          </Link>
        </div>
        <p className="text-sm text-muted-foreground max-w-3xl">
          Track vendors through each stage and move them between columns as you reach out,
          collect quotes, or book.
        </p>
      </div>

      <div className="flex flex-wrap gap-3 text-sm">
        <label className="flex items-center gap-2">
          <span className="text-xs text-muted-foreground">Category</span>
          <select
            className="rounded border px-3 py-2"
            value={filters.category}
            onChange={(e) =>
              setFilters((prev) => ({ ...prev, category: e.target.value }))
            }
          >
            <option value="">All</option>
            {categories.map((category) => (
              <option key={category} value={category}>
                {category}
              </option>
            ))}
          </select>
        </label>
        <label className="flex items-center gap-2">
          <span className="text-xs text-muted-foreground">Event</span>
          <select
            className="rounded border px-3 py-2"
            value={filters.eventId}
            onChange={(e) =>
              setFilters((prev) => ({ ...prev, eventId: e.target.value }))
            }
          >
            <option value="">All</option>
            {defaultEvents.map((event) => (
              <option key={event.id} value={event.id}>
                {event.name}
              </option>
            ))}
          </select>
        </label>
      </div>

      {error && <div className="text-sm text-red-700">{error}</div>}
      {loading ? (
        <div className="text-sm text-muted-foreground">Loading pipeline…</div>
      ) : (
        <div className="flex gap-4 overflow-x-auto pb-4">
          {VENDOR_STATUS_OPTIONS.map((status) => {
            const items = grouped[status.value] ?? [];
            return (
              <div
                key={status.value}
                className="min-w-[230px] flex-1 rounded border bg-white"
              >
                <div className="flex items-center justify-between border-b px-3 py-2 text-sm font-medium">
                  <span>{status.label}</span>
                  <span className="rounded-full bg-muted px-2 py-0.5 text-[11px] text-muted-foreground">
                    {items.length}
                  </span>
                </div>
                <div className="space-y-3 p-3">
                  {items.length === 0 ? (
                    <p className="text-xs text-muted-foreground">No vendors</p>
                  ) : (
                    items.map((vendor) => (
                      <div key={vendor.id} className="rounded border px-3 py-2 text-sm shadow-sm">
                        <div className="flex items-start justify-between gap-2">
                          <div className="space-y-1">
                            <div className="font-medium">{vendor.name}</div>
                            <div className="flex flex-wrap items-center gap-2 text-[11px] text-muted-foreground">
                              {vendor.category && <span className="rounded-full border px-2 py-0.5">{vendor.category}</span>}
                              {vendor.priority && (
                                <span className={`rounded-full px-2 py-0.5 font-medium ${priorityTone(vendor.priority)}`}>
                                  {vendor.priority} priority
                                </span>
                              )}
                              {vendor.whatsappNumber && (
                                <a
                                  href={buildWhatsAppLink(vendor.whatsappNumber)}
                                  className="text-wedx-primary-700 underline-offset-2 hover:underline"
                                  target="_blank"
                                  rel="noreferrer"
                                >
                                  WhatsApp
                                </a>
                              )}
                            </div>
                            <div className="flex flex-wrap gap-1 text-[11px] text-muted-foreground">
                              <span className="rounded-full border px-2 py-0.5">
                                {vendor.linkedEventIds?.length ?? 0} events
                              </span>
                            </div>
                          </div>
                          <div className="flex flex-col items-end gap-1 text-[11px] text-muted-foreground">
                            <select
                              aria-label={`Move ${vendor.name}`}
                              className="rounded border px-2 py-1"
                              value={vendor.status}
                              onChange={(e) =>
                                handleStatusChange(
                                  vendor,
                                  e.target.value as Vendor["status"]
                                )
                              }
                            >
                              {VENDOR_STATUS_OPTIONS.map((option) => (
                                <option key={option.value} value={option.value}>
                                  {option.label}
                                </option>
                              ))}
                            </select>
                            <span
                              className={`rounded-full px-2 py-0.5 font-medium ${statusTone(
                                vendor.status
                              )}`}
                            >
                              {status.label}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
}
