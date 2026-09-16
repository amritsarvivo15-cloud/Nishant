import type { Page } from "playwright";
import { parseExplicitNumber } from "./honesty.ts";

export interface DomSpendExtract {
  loadedOrgId: string | null;
  loadedOrgName: string | null;
  periodStart: string | null;
  periodEnd: string | null;
  totalGMV: number | null;
  flightGMV: number | null;
  hotelGMV: number | null;
  flightBookings: number | null;
  hotelBookings: number | null;
  evidence: string[];
}

type MetricField = "totalGMV" | "flightGMV" | "hotelGMV" | "flightBookings" | "hotelBookings";

const LABEL_PATTERNS: Array<{ field: MetricField; pattern: RegExp }> = [
  { field: "totalGMV", pattern: /total\s*(gmv|spend|amount)/i },
  { field: "flightGMV", pattern: /(flight|air)\s*(gmv|spend|amount)/i },
  { field: "hotelGMV", pattern: /(hotel|stay)\s*(gmv|spend|amount)/i },
  { field: "flightBookings", pattern: /(flight|air)\s*(bookings?|txn|transactions?|count)/i },
  { field: "hotelBookings", pattern: /(hotel|stay)\s*(bookings?|txn|transactions?|count)/i },
];

function nearbyNumber(label: string, blob: string): number | null {
  const idx = blob.toLowerCase().indexOf(label.toLowerCase());
  if (idx < 0) return null;
  const window = blob.slice(idx, idx + 180);
  const match = window.match(/₹\s*[\d,]+(?:\.\d+)?|[\d,]+(?:\.\d+)?/);
  if (!match) return null;
  return parseExplicitNumber(match[0]);
}

export async function extractSpendFromDom(page: Page, requestedOrgId: string): Promise<DomSpendExtract> {
  const bodyText = ((await page.locator("body").innerText().catch(() => "")) || "").replace(/\s+/g, " ");
  const evidence: string[] = [];

  const url = page.url();
  let loadedOrgId: string | null = null;
  try {
    const parsed = new URL(url);
    loadedOrgId =
      parsed.searchParams.get("orgId") ||
      parsed.searchParams.get("orgID") ||
      parsed.searchParams.get("org_id") ||
      parsed.pathname.split("/").find((p) => /^\d{4,}$/.test(p)) ||
      null;
  } catch {
    loadedOrgId = null;
  }

  if (new RegExp(`\\b${requestedOrgId}\\b`).test(bodyText)) {
    loadedOrgId = loadedOrgId ?? requestedOrgId;
    evidence.push("requested org id found in page text");
  }

  const orgNameMatch = bodyText.match(/organisation[:\s]+([A-Za-z0-9 .,&'-]{3,80})/i)
    || bodyText.match(/organization[:\s]+([A-Za-z0-9 .,&'-]{3,80})/i);
  const loadedOrgName = orgNameMatch ? orgNameMatch[1].trim() : null;

  const result: DomSpendExtract = {
    loadedOrgId,
    loadedOrgName,
    periodStart: null,
    periodEnd: null,
    totalGMV: null,
    flightGMV: null,
    hotelGMV: null,
    flightBookings: null,
    hotelBookings: null,
    evidence,
  };

  const dateInputs = page.locator('input[type="date"]');
  const dateCount = await dateInputs.count().catch(() => 0);
  if (dateCount >= 1) {
    result.periodStart = (await dateInputs.nth(0).inputValue().catch(() => "")) || null;
  }
  if (dateCount >= 2) {
    result.periodEnd = (await dateInputs.nth(1).inputValue().catch(() => "")) || null;
  }

  for (const { field, pattern } of LABEL_PATTERNS) {
    const labelMatch = bodyText.match(pattern);
    if (!labelMatch) continue;
    const value = nearbyNumber(labelMatch[0], bodyText);
    if (value === null) continue;
    result[field] = value;
    evidence.push(`dom:${field}=${value} via "${labelMatch[0]}"`);
  }

  return result;
}

export async function pageSuggestsAuthenticatedApp(page: Page): Promise<boolean> {
  const url = page.url();
  if (/login|signin|sso/i.test(url)) return false;
  const text = ((await page.locator("body").innerText().catch(() => "")) || "").toLowerCase();
  if (!text) return false;
  if (/(sign in|log in|login with|enter password|otp)/i.test(text) && text.length < 2500) return false;
  const appHints = /(spend|organisation|organization|dashboard|report|mybiz|hulk|booking)/i;
  return appHints.test(text) || appHints.test(url);
}
