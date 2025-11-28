export function normalizePhoneForWa(phone?: string) {
  if (!phone) return "";
  return phone.replace(/[^0-9]/g, "").replace(/^0+/, "");
}

export function buildWhatsAppLink(phone?: string, message?: string) {
  const normalized = normalizePhoneForWa(phone);
  if (!normalized) return "";
  const text = encodeURIComponent(message ?? "");
  const base = `https://wa.me/${normalized}`;
  return text ? `${base}?text=${text}` : base;
}
