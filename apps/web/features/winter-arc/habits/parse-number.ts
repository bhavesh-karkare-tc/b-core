/** Parse typed text: comma or dot decimals; empty → null. */
export function parseNumber(raw: string, decimals: boolean): number | null {
  const cleaned = raw.replace(",", ".").replace(decimals ? /[^\d.]/g : /\D/g, "");
  if (cleaned === "" || cleaned === ".") return null;
  const n = Number(cleaned);
  return Number.isFinite(n) ? n : null;
}
