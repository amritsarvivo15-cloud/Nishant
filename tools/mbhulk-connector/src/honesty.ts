/**
 * Data honesty: never invent GMV. Zero is valid only when the source value
 * is explicitly numeric zero (or a string that is exactly a zero amount).
 */

const EXPLICIT_ZERO = /^(₹\s*)?0+(\.0+)?$/;

export function parseExplicitNumber(value: unknown): number | null {
  if (value == null) return null;
  if (typeof value === "boolean") return null;
  if (typeof value === "number") {
    if (!Number.isFinite(value)) return null;
    return value;
  }
  const str = String(value).trim();
  if (!str || str === "—" || str === "-" || str.toLowerCase() === "n/a" || str.toLowerCase() === "na") {
    return null;
  }
  if (EXPLICIT_ZERO.test(str.replace(/,/g, ""))) return 0;

  const cr = str.match(/^₹?\s*([\d,.]+)\s*(cr|crore)s?$/i);
  if (cr) {
    const n = Number(cr[1].replace(/,/g, ""));
    return Number.isFinite(n) ? n * 10_000_000 : null;
  }
  const lakh = str.match(/^₹?\s*([\d,.]+)\s*(l|lakh|lakhs)$/i);
  if (lakh) {
    const n = Number(lakh[1].replace(/,/g, ""));
    return Number.isFinite(n) ? n * 100_000 : null;
  }

  const cleaned = str.replace(/[₹,\s]/g, "");
  if (!/^[-+]?\d+(\.\d+)?$/.test(cleaned)) return null;
  const n = Number(cleaned);
  return Number.isFinite(n) ? n : null;
}

export function firstDefinedNumber(values: unknown[]): number | null {
  for (const value of values) {
    const parsed = parseExplicitNumber(value);
    if (parsed !== null) return parsed;
  }
  return null;
}

export function pickByKeys(record: Record<string, unknown>, names: string[]): unknown[] {
  const lower = new Map<string, unknown>();
  for (const [key, value] of Object.entries(record)) {
    lower.set(key.toLowerCase().replace(/[_\s-]/g, ""), value);
  }
  return names.map((name) => lower.get(name.toLowerCase().replace(/[_\s-]/g, ""))).filter((v) => v !== undefined);
}

export function asRecord(value: unknown): Record<string, unknown> | null {
  if (value && typeof value === "object" && !Array.isArray(value)) {
    return value as Record<string, unknown>;
  }
  return null;
}

export function walkRecords(value: unknown, visit: (record: Record<string, unknown>, path: string) => void, path = "$", depth = 0): void {
  if (depth > 10 || value == null) return;
  const rec = asRecord(value);
  if (rec) {
    visit(rec, path);
    for (const [key, nested] of Object.entries(rec)) {
      walkRecords(nested, visit, `${path}.${key}`, depth + 1);
    }
    return;
  }
  if (Array.isArray(value)) {
    value.slice(0, 50).forEach((item, i) => walkRecords(item, visit, `${path}[${i}]`, depth + 1));
  }
}
