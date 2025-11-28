import { VendorPriority, VendorStatus } from "./types";

export const VENDOR_STATUS_OPTIONS: { value: VendorStatus; label: string }[] = [
  { value: "discovered", label: "Discovered" },
  { value: "shortlisted", label: "Shortlisted" },
  { value: "contacted", label: "Contacted" },
  { value: "quoted", label: "Quoted" },
  { value: "booked", label: "Booked" },
  { value: "backup", label: "Backup" },
  { value: "dropped", label: "Dropped" },
];

export const PRIORITY_OPTIONS: { value: VendorPriority; label: string }[] = [
  { value: "low", label: "Low" },
  { value: "medium", label: "Medium" },
  { value: "high", label: "High" },
];

export function isValidStatus(value: unknown): value is VendorStatus {
  return VENDOR_STATUS_OPTIONS.some((option) => option.value === value);
}

export function normalizeStatus(value: unknown): VendorStatus {
  return isValidStatus(value) ? value : "shortlisted";
}

export function normalizePriority(value: unknown): VendorPriority | undefined {
  return PRIORITY_OPTIONS.some((option) => option.value === value)
    ? (value as VendorPriority)
    : undefined;
}

export function statusTone(status: VendorStatus): string {
  switch (status) {
    case "booked":
      return "bg-emerald-100 text-emerald-800";
    case "contacted":
      return "bg-blue-100 text-blue-800";
    case "quoted":
      return "bg-amber-100 text-amber-800";
    case "backup":
      return "bg-purple-100 text-purple-800";
    case "dropped":
      return "bg-rose-100 text-rose-800";
    case "discovered":
      return "bg-slate-100 text-slate-800";
    case "shortlisted":
    default:
      return "bg-indigo-100 text-indigo-800";
  }
}

export function priorityTone(priority?: VendorPriority): string {
  switch (priority) {
    case "high":
      return "bg-rose-100 text-rose-800";
    case "medium":
      return "bg-amber-100 text-amber-800";
    case "low":
    default:
      return "bg-slate-100 text-slate-800";
  }
}
