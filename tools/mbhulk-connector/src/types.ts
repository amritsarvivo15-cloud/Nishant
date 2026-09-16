export type ExtractSource = "network" | "dom";

export type VerificationStatus = "passed" | "failed";

/**
 * One-org Spend Report result. Fields that could not be read stay null.
 * Zero is stored only when MBHulk explicitly returned zero.
 */
export interface SpendReportResult {
  orgId: string;
  loadedOrgId: string | null;
  loadedOrgName: string | null;
  periodStart: string;
  periodEnd: string;
  reportPeriodStart: string | null;
  reportPeriodEnd: string | null;
  totalGMV: number | null;
  flightGMV: number | null;
  hotelGMV: number | null;
  flightBookings: number | null;
  hotelBookings: number | null;
  source: ExtractSource;
  verification: VerificationStatus;
  fetchedAt: string;
  networkRequestUrl: string | null;
  notes: string[];
}

export interface DiscoverArgs {
  orgId: string;
  start: string;
  end: string;
  baseUrl: string;
  headed: boolean;
  loginTimeoutMs: number;
  reportTimeoutMs: number;
  profileDir: string;
  storageStatePath: string;
  debugDir: string;
  waitForManual: boolean;
}

export interface SanitizedNetworkEntry {
  id: number;
  at: string;
  method: string;
  url: string;
  resourceType: string;
  status: number | null;
  contentType: string | null;
  requestPayloadPreview: unknown;
  responsePreview: unknown;
  responseKeys: string[];
  byteLength: number | null;
  jsonLikely: boolean;
  spendCandidateScore: number;
}

export interface ValidationIssue {
  code: string;
  message: string;
}

export interface ValidationResult {
  ok: boolean;
  issues: ValidationIssue[];
}

export class DiscoverError extends Error {
  readonly code: string;
  readonly details: Record<string, unknown>;

  constructor(code: string, message: string, details: Record<string, unknown> = {}) {
    super(message);
    this.name = "DiscoverError";
    this.code = code;
    this.details = details;
  }
}

export interface FailurePayload {
  ok: false;
  error: {
    code: string;
    message: string;
    details: Record<string, unknown>;
  };
  orgId: string | null;
  periodStart: string | null;
  periodEnd: string | null;
  fetchedAt: string;
}
