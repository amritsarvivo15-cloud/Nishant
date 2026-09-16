import type { SpendReportResult, ValidationIssue, ValidationResult } from "./types.ts";

const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/;

function issue(code: string, message: string): ValidationIssue {
  return { code, message };
}

function normalizeDate(value: string | null | undefined): string | null {
  if (!value) return null;
  const trimmed = value.trim();
  if (ISO_DATE.test(trimmed)) return trimmed;
  const parsed = new Date(trimmed);
  if (Number.isNaN(parsed.getTime())) return null;
  return parsed.toISOString().slice(0, 10);
}

export function datesMatch(requested: string, observed: string | null): boolean {
  const obs = normalizeDate(observed);
  if (!obs) return false;
  return obs === requested;
}

export function validateSpendResult(input: {
  requestedOrgId: string;
  loadedOrgId: string | null;
  requestedStart: string;
  requestedEnd: string;
  reportPeriodStart: string | null;
  reportPeriodEnd: string | null;
  totalGMV: number | null;
  flightGMV: number | null;
  hotelGMV: number | null;
  flightBookings: number | null;
  hotelBookings: number | null;
  source: "network" | "dom" | null;
  stalePreviousOrgId?: string | null;
}): ValidationResult {
  const issues: ValidationIssue[] = [];

  if (!input.requestedOrgId) {
    issues.push(issue("ORG_MISSING", "Requested Org ID is empty."));
  }
  if (!input.loadedOrgId) {
    issues.push(issue("LOADED_ORG_UNKNOWN", "Could not verify the organization actually loaded in MBHulk."));
  } else if (input.loadedOrgId !== input.requestedOrgId) {
    issues.push(
      issue(
        "ORG_MISMATCH",
        `Requested Org ID ${input.requestedOrgId} but the page/response loaded ${input.loadedOrgId}.`,
      ),
    );
  }

  if (input.stalePreviousOrgId && input.stalePreviousOrgId !== input.requestedOrgId) {
    issues.push(
      issue(
        "STALE_PREVIOUS_RESULT",
        `A previous org (${input.stalePreviousOrgId}) is still present; refusing to reuse that data.`,
      ),
    );
  }

  if (input.reportPeriodStart && !datesMatch(input.requestedStart, input.reportPeriodStart)) {
    issues.push(
      issue(
        "START_DATE_MISMATCH",
        `Requested start ${input.requestedStart} but report shows ${input.reportPeriodStart}.`,
      ),
    );
  }
  if (input.reportPeriodEnd && !datesMatch(input.requestedEnd, input.reportPeriodEnd)) {
    issues.push(
      issue(
        "END_DATE_MISMATCH",
        `Requested end ${input.requestedEnd} but report shows ${input.reportPeriodEnd}.`,
      ),
    );
  }

  const metrics = [
    input.totalGMV,
    input.flightGMV,
    input.hotelGMV,
    input.flightBookings,
    input.hotelBookings,
  ];
  if (metrics.every((m) => m === null)) {
    issues.push(
      issue(
        "NO_METRICS",
        "No spend metrics were extracted. Unknown stays unknown; zeros were not invented.",
      ),
    );
  }

  if (!input.source) {
    issues.push(issue("NO_SOURCE", "Neither a structured network response nor DOM extraction succeeded."));
  }

  return { ok: issues.length === 0, issues };
}

export function attachVerification(result: Omit<SpendReportResult, "verification">, issues: ValidationIssue[]): SpendReportResult {
  return {
    ...result,
    verification: issues.length === 0 ? "passed" : "failed",
    notes: [...result.notes, ...issues.map((i) => `${i.code}: ${i.message}`)],
  };
}
