const SENSITIVE_HEADER = /^(cookie|set-cookie|authorization|proxy-authorization|x-api-key|x-auth-token|x-csrf-token|x-access-token|x-session|csrf|x-amz-security-token)$/i;
const SENSITIVE_QUERY = /^(token|access_token|refresh_token|id_token|session|sessionid|sid|jsessionid|auth|authorization|jwt|password|passwd|secret|code|otp)$/i;
const SENSITIVE_KEY = /(cookie|authorization|token|password|passwd|secret|session|jwt|otp|credential|set-cookie)/i;

export function sanitizeUrl(raw: string): string {
  try {
    const url = new URL(raw);
    for (const key of [...url.searchParams.keys()]) {
      if (SENSITIVE_QUERY.test(key)) url.searchParams.set(key, "[redacted]");
    }
    return url.toString();
  } catch {
    return raw.replace(/(token|session|jwt|password)=([^&]+)/gi, "$1=[redacted]");
  }
}

export function sanitizeHeaders(headers: Record<string, string> | undefined): Record<string, string> {
  const out: Record<string, string> = {};
  if (!headers) return out;
  for (const [key, value] of Object.entries(headers)) {
    if (SENSITIVE_HEADER.test(key)) continue;
    out[key] = value;
  }
  return out;
}

function redactValue(key: string, value: unknown, depth: number): unknown {
  if (SENSITIVE_KEY.test(key)) return "[redacted]";
  return sanitizeJson(value, depth);
}

export function sanitizeJson(value: unknown, depth = 0): unknown {
  if (depth > 6) return "[truncated-depth]";
  if (value == null) return value;
  if (typeof value === "string") {
    if (value.length > 400) return `${value.slice(0, 400)}…[truncated]`;
    return value;
  }
  if (typeof value === "number" || typeof value === "boolean") return value;
  if (Array.isArray(value)) {
    return value.slice(0, 20).map((item) => sanitizeJson(item, depth + 1));
  }
  if (typeof value === "object") {
    const entries = Object.entries(value as Record<string, unknown>).slice(0, 40);
    const out: Record<string, unknown> = {};
    for (const [key, nested] of entries) {
      out[key] = redactValue(key, nested, depth + 1);
    }
    if (Object.keys(value as object).length > 40) out._truncatedKeys = true;
    return out;
  }
  return String(value);
}

export function collectKeys(value: unknown, acc: string[] = [], depth = 0): string[] {
  if (depth > 8 || value == null) return acc;
  if (Array.isArray(value)) {
    for (const item of value.slice(0, 5)) collectKeys(item, acc, depth + 1);
    return acc;
  }
  if (typeof value === "object") {
    for (const [key, nested] of Object.entries(value as Record<string, unknown>)) {
      if (!acc.includes(key)) acc.push(key);
      collectKeys(nested, acc, depth + 1);
    }
  }
  return acc;
}

export function parseJsonSafe(text: string): unknown | undefined {
  const trimmed = text.trim();
  if (!trimmed) return undefined;
  if (!(trimmed.startsWith("{") || trimmed.startsWith("["))) return undefined;
  try {
    return JSON.parse(trimmed) as unknown;
  } catch {
    return undefined;
  }
}

export function spendCandidateScore(keys: string[], url: string): number {
  const hay = `${keys.join(" ")} ${url}`.toLowerCase();
  let score = 0;
  const hits = [
    ["gmv", 6],
    ["spend", 5],
    ["flight", 2],
    ["hotel", 2],
    ["booking", 2],
    ["orgid", 3],
    ["organisation", 2],
    ["organization", 2],
    ["startdate", 2],
    ["enddate", 2],
    ["fromdate", 1],
    ["todate", 1],
  ] as const;
  for (const [needle, weight] of hits) {
    if (hay.includes(needle)) score += weight;
  }
  return score;
}
