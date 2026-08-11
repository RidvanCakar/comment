export const SUPPORT_WHATSAPP = "905418015310";

export function whatsappUrl(message?: string) {
  const base = `https://wa.me/${SUPPORT_WHATSAPP}`;
  if (!message) return base;
  return `${base}?text=${encodeURIComponent(message)}`;
}

export function whatsappDisplayNumber() {
  return "0541 801 53 10";
}
