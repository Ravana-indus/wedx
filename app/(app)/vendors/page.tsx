"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Vendor } from "@/lib/vendors/types";
import {
  createVendor,
  listVendors,
  updateVendor,
  updateVendorStatus,
} from "@/lib/api/vendors";
import { logWhatsApp } from "@/lib/api/vendors";
import { buildWhatsAppLink } from "@/lib/vendors/whatsapp";
import {
  PRIORITY_OPTIONS,
  VENDOR_STATUS_OPTIONS,
  priorityTone,
  statusTone,
} from "@/lib/vendors/status";

type VendorForm = {
  name: string;
  category: string;
  contactPhone: string;
  whatsappNumber: string;
  websiteUrl: string;
  instagramHandle: string;
  linkedEventIds: string[];
  status: Vendor["status"];
  priority?: Vendor["priority"];
};

const defaultEvents = [
  { id: "event-1", name: "Poruwa Ceremony" },
  { id: "event-2", name: "Reception" },
  { id: "event-3", name: "Homecoming" },
];

export default function VendorsPage() {
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState<VendorForm>({
    name: "",
    category: "",
    contactPhone: "",
    whatsappNumber: "",
    websiteUrl: "",
    instagramHandle: "",
    linkedEventIds: [],
    status: "shortlisted",
    priority: undefined,
  });

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim()) return;
    setSaving(true);
    try {
      const created = await createVendor({
        name: form.name.trim(),
        category: form.category.trim() || undefined,
        contactPhone: form.contactPhone.trim() || undefined,
        whatsappNumber: form.whatsappNumber.trim() || undefined,
        websiteUrl: form.websiteUrl.trim() || undefined,
        instagramHandle: form.instagramHandle.trim() || undefined,
        status: form.status,
        priority: form.priority,
        linkedEventIds: form.linkedEventIds,
      });
      setVendors((prev) => [...prev, created]);
      setForm({
        name: "",
        category: "",
        contactPhone: "",
        whatsappNumber: "",
        websiteUrl: "",
        instagramHandle: "",
        linkedEventIds: [],
        status: "shortlisted",
        priority: undefined,
      });
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save vendor");
    } finally {
      setSaving(false);
    }
  };

  const toggleEventLink = async (vendor: Vendor, eventId: string) => {
    const current = vendor.linkedEventIds ?? [];
    const next = current.includes(eventId)
      ? current.filter((id) => id !== eventId)
      : [...current, eventId];
    try {
      const updated = await updateVendor(vendor.id, { linkedEventIds: next });
      setVendors((prev) =>
        prev.map((v) => (v.id === vendor.id ? updated : v))
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to link event");
    }
  };

  const openWhatsApp = async (vendor: Vendor) => {
    try {
      const result = await logWhatsApp(vendor.id, {
        message: `Hi ${vendor.name}, contacting from wedX about our wedding.`,
      });
      if (result.vendor) {
        setVendors((prev) =>
          prev.map((v) => (v.id === vendor.id ? { ...v, ...result.vendor } : v))
        );
      }
      if (result.link) {
        window.open(result.link, "_blank");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to start WhatsApp");
    }
  };

  const handleStatusChange = async (
    vendor: Vendor,
    status: Vendor["status"]
  ) => {
    try {
      const updated = await updateVendorStatus(vendor.id, { status });
      setVendors((prev) =>
        prev.map((v) => (v.id === vendor.id ? { ...v, ...updated } : v))
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update status");
    }
  };

  return (
    <section className="space-y-4">
      <div className="space-y-1">
        <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
          Vendors
        </p>
        <div className="flex flex-wrap items-center gap-3">
          <h1 className="text-2xl font-semibold tracking-tight">
            Vendor directory
          </h1>
          <Link
            href="/vendors/pipeline"
            className="text-sm font-medium text-wedx-primary-700 underline-offset-2 hover:underline"
          >
            View pipeline
          </Link>
        </div>
        <p className="text-sm text-muted-foreground max-w-3xl">
          Add vendors, track their contact info, and link them to your events. Use
          WhatsApp numbers to start chats in Story 4.2.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Add vendor</CardTitle>
          <CardDescription className="text-sm">
            Capture basic contact details and link to relevant events.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form className="grid gap-3 md:grid-cols-3 text-sm" onSubmit={handleSubmit}>
            <div className="space-y-1 md:col-span-3">
              <label className="text-xs font-medium text-muted-foreground" htmlFor="name">
                Name
              </label>
              <Input
                id="name"
                required
                value={form.name}
                onChange={(e) => setForm((prev) => ({ ...prev, name: e.target.value }))}
                placeholder="e.g., Sunrise Photography"
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-medium text-muted-foreground" htmlFor="category">
                Category
              </label>
              <Input
                id="category"
                value={form.category}
                onChange={(e) => setForm((prev) => ({ ...prev, category: e.target.value }))}
                placeholder="Photography, Decor, Band"
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-medium text-muted-foreground" htmlFor="phone">
                Contact phone
              </label>
              <Input
                id="phone"
                value={form.contactPhone}
                onChange={(e) =>
                  setForm((prev) => ({ ...prev, contactPhone: e.target.value }))
                }
                placeholder="+94 77 123 4567"
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-medium text-muted-foreground" htmlFor="whatsapp">
                WhatsApp number
              </label>
              <Input
                id="whatsapp"
                value={form.whatsappNumber}
                onChange={(e) =>
                  setForm((prev) => ({ ...prev, whatsappNumber: e.target.value }))
                }
                placeholder="+94 77 123 4567"
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-medium text-muted-foreground" htmlFor="website">
                Website URL
              </label>
              <Input
                id="website"
                value={form.websiteUrl}
                onChange={(e) =>
                  setForm((prev) => ({ ...prev, websiteUrl: e.target.value }))
                }
                placeholder="https://..."
              />
            </div>
            <div className="space-y-1">
              <label
                className="text-xs font-medium text-muted-foreground"
                htmlFor="instagram"
              >
                Instagram
              </label>
              <Input
                id="instagram"
                value={form.instagramHandle}
                onChange={(e) =>
                  setForm((prev) => ({ ...prev, instagramHandle: e.target.value }))
                }
                placeholder="@vendor"
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-medium text-muted-foreground" htmlFor="status">
                Status
              </label>
              <select
                id="status"
                className="w-full rounded border px-3 py-2 text-sm"
                value={form.status}
                onChange={(e) =>
                  setForm((prev) => ({ ...prev, status: e.target.value as Vendor["status"] }))
                }
              >
                {VENDOR_STATUS_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
            <div className="space-y-1">
              <label className="text-xs font-medium text-muted-foreground" htmlFor="priority">
                Priority (optional)
              </label>
              <select
                id="priority"
                className="w-full rounded border px-3 py-2 text-sm"
                value={form.priority ?? ""}
                onChange={(e) =>
                  setForm((prev) => ({
                    ...prev,
                    priority: (e.target.value || undefined) as Vendor["priority"],
                  }))
                }
              >
                <option value="">No priority</option>
                {PRIORITY_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
            <div className="space-y-2 md:col-span-3">
              <div className="text-xs font-medium text-muted-foreground">Link to events</div>
              <div className="flex flex-wrap gap-2">
                {defaultEvents.map((event) => {
                  const checked = form.linkedEventIds.includes(event.id);
                  return (
                    <label
                      key={event.id}
                      className="flex items-center gap-2 rounded border px-3 py-1 text-xs"
                    >
                      <input
                        type="checkbox"
                        className="h-3 w-3"
                        checked={checked}
                        onChange={() => {
                          setForm((prev) => ({
                            ...prev,
                            linkedEventIds: checked
                              ? prev.linkedEventIds.filter((id) => id !== event.id)
                              : [...prev.linkedEventIds, event.id],
                          }));
                        }}
                      />
                      {event.name}
                    </label>
                  );
                })}
              </div>
            </div>
            <div className="md:col-span-3 flex items-center gap-3">
              <button
                type="submit"
                disabled={saving}
                className="rounded border px-3 py-2 text-sm font-medium hover:bg-muted"
              >
                {saving ? "Saving…" : "Save vendor"}
              </button>
              {error && <span className="text-xs text-red-700">{error}</span>}
            </div>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Vendor list</CardTitle>
          <CardDescription className="text-sm">
            Shortlist and link vendors to events.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {loading ? (
            <div className="text-sm text-muted-foreground">Loading vendors…</div>
          ) : vendors.length === 0 ? (
            <div className="text-sm text-muted-foreground">
              No vendors added yet. Start by adding your first vendor above.
            </div>
          ) : (
            <div className="grid gap-3 md:grid-cols-2">
              {vendors.map((vendor) => (
                <div key={vendor.id} className="rounded border p-3 text-sm">
                  <div className="flex items-start justify-between gap-2">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{vendor.name}</span>
                        {vendor.category && (
                          <span className="rounded-full border px-2 py-0.5 text-[11px]">
                            {vendor.category}
                          </span>
                        )}
                        {vendor.priority && (
                          <span
                            className={`rounded-full px-2 py-0.5 text-[11px] font-medium ${priorityTone(
                              vendor.priority
                            )}`}
                          >
                            {vendor.priority} priority
                          </span>
                        )}
                      </div>
                      <div className="flex flex-wrap gap-2 text-xs text-muted-foreground">
                        {vendor.contactPhone && (
                          <span className="rounded-full border px-2 py-0.5">
                            Phone: {vendor.contactPhone}
                          </span>
                        )}
                        {vendor.whatsappNumber && (
                          <span className="rounded-full border px-2 py-0.5">
                            WhatsApp: {vendor.whatsappNumber}
                          </span>
                        )}
                        {vendor.websiteUrl && (
                          <span className="rounded-full border px-2 py-0.5">
                            Site: {vendor.websiteUrl}
                          </span>
                        )}
                        {vendor.instagramHandle && (
                          <span className="rounded-full border px-2 py-0.5">
                            IG: {vendor.instagramHandle}
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-2 text-right text-[11px] text-muted-foreground">
                      <div className="flex items-center gap-2">
                        <span
                          className={`rounded-full px-2 py-0.5 text-[11px] font-medium ${statusTone(
                            vendor.status
                          )}`}
                        >
                          {
                            VENDOR_STATUS_OPTIONS.find(
                              (option) => option.value === vendor.status
                            )?.label ?? vendor.status
                          }
                        </span>
                        <select
                          aria-label={`Status for ${vendor.name}`}
                          className="rounded border px-2 py-1 text-[11px]"
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
                      </div>
                      <div>
                        Added {new Date(vendor.createdAt).toLocaleDateString()}
                        {vendor.lastContactedAt && (
                          <span className="ml-2">
                            · Last contacted{" "}
                            {new Date(vendor.lastContactedAt).toLocaleDateString()}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="mt-2 space-y-1">
                    <div className="text-xs font-medium text-muted-foreground">
                      Linked events
                    </div>
                    <div className="flex flex-wrap gap-2">
                    {defaultEvents.map((event) => {
                      const checked = (vendor.linkedEventIds ?? []).includes(event.id);
                      return (
                        <label
                          key={event.id}
                          className="flex items-center gap-2 rounded border px-2 py-1 text-[12px]"
                        >
                          <input
                            type="checkbox"
                            className="h-3 w-3"
                            aria-label={`${event.name} for ${vendor.name}`}
                            checked={checked}
                            onChange={() => toggleEventLink(vendor, event.id)}
                          />
                          {event.name}
                        </label>
                        );
                      })}
                      {(vendor.linkedEventIds ?? []).length === 0 && (
                        <span className="text-xs text-muted-foreground">No events linked</span>
                      )}
                    </div>
                  </div>
                  {vendor.whatsappNumber && (
                    <div className="mt-3 flex flex-wrap items-center gap-2 text-xs">
                      <button
                        type="button"
                        onClick={() => openWhatsApp(vendor)}
                        className="rounded border px-3 py-1 text-[12px] font-medium hover:bg-muted"
                      >
                        Message on WhatsApp
                      </button>
                      <a
                        href={buildWhatsAppLink(vendor.whatsappNumber)}
                        className="text-wedx-primary-700 underline underline-offset-2"
                        target="_blank"
                        rel="noreferrer"
                      >
                        Open link
                      </a>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </section>
  );
}
