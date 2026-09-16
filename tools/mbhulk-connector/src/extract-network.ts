import { firstDefinedNumber, parseExplicitNumber, pickByKeys, walkRecords } from "./honesty.ts";

export interface NetworkSpendExtract {
  orgId: string | null;
  orgName: string | null;
  periodStart: string | null;
  periodEnd: string | null;
  totalGMV: number | null;
  flightGMV: number | null;
  hotelGMV: number | null;
  flightBookings: number | null;
  hotelBookings: number | null;
  matchedPath: string | null;
}

function asIsoDate(value: unknown): string | null {
  if (value == null) return null;
  const str = String(value).trim();
  const iso = str.match(/^(\d{4}-\d{2}-\d{2})/);
  if (iso) return iso[1];
  const dmy = str.match(/^(\d{1,2})[/-](\d{1,2})[/-](\d{4})$/);
  if (dmy) {
    const dd = dmy[1].padStart(2, "0");
    const mm = dmy[2].padStart(2, "0");
    return `${dmy[3]}-${mm}-${dd}`;
  }
  const parsed = new Date(str);
  if (!Number.isNaN(parsed.getTime()) && /20\d{2}/.test(str)) {
    return parsed.toISOString().slice(0, 10);
  }
  return null;
}

function scoreRecord(record: Record<string, unknown>, requestedOrgId: string): number {
  let score = 0;
  const keys = Object.keys(record).map((k) => k.toLowerCase());
  const blob = keys.join(" ");
  if (/(gmv|spend)/.test(blob)) score += 5;
  if (/(flight|air)/.test(blob)) score += 2;
  if (/hotel/.test(blob)) score += 2;
  if (/(booking|txn|transaction)/.test(blob)) score += 1;
  const orgValues = pickByKeys(record, ["orgId", "orgID", "org_id", "organisationId", "organizationId", "corporateId"]);
  if (orgValues.some((v) => String(v) === requestedOrgId)) score += 8;
  return score;
}

export function extractSpendFromJson(payload: unknown, requestedOrgId: string): NetworkSpendExtract | null {
  let bestScore = -1;
  let bestRecord: Record<string, unknown> | null = null;
  let bestPath = "";

  walkRecords(payload, (record, path) => {
    const score = scoreRecord(record, requestedOrgId);
    if (score < 5) return;
    if (score > bestScore) {
      bestScore = score;
      bestRecord = record;
      bestPath = path;
    }
  });

  if (!bestRecord) return null;

  const record = bestRecord;
  const orgIdRaw = firstString(
    pickByKeys(record, ["orgId", "orgID", "org_id", "organisationId", "organizationId", "corporateId", "org"]),
  );
  const orgName = firstString(pickByKeys(record, ["orgName", "organisationName", "organizationName", "corporateName", "name"]));

  return {
    orgId: orgIdRaw ? String(orgIdRaw) : null,
    orgName: orgName ? String(orgName) : null,
    periodStart: asIsoDate(
      firstDefined(pickByKeys(record, ["periodStart", "startDate", "fromDate", "from", "bookingStartDate", "start"])),
    ),
    periodEnd: asIsoDate(
      firstDefined(pickByKeys(record, ["periodEnd", "endDate", "toDate", "to", "bookingEndDate", "end"])),
    ),
    totalGMV: firstDefinedNumber(
      pickByKeys(record, ["totalGMV", "totalGmv", "gmv", "totalSpend", "spend", "grandTotal", "totalAmount", "netSpend"]),
    ),
    flightGMV: firstDefinedNumber(
      pickByKeys(record, ["flightGMV", "flightGmv", "airGMV", "flightSpend", "airSpend", "flightAmount"]),
    ),
    hotelGMV: firstDefinedNumber(
      pickByKeys(record, ["hotelGMV", "hotelGmv", "hotelSpend", "staySpend", "hotelAmount"]),
    ),
    flightBookings: parseCount(
      firstDefined(pickByKeys(record, ["flightBookings", "airBookings", "flightCount", "flightTxn", "flightTransactions"])),
    ),
    hotelBookings: parseCount(
      firstDefined(pickByKeys(record, ["hotelBookings", "stayBookings", "hotelCount", "hotelTxn", "hotelTransactions"])),
    ),
    matchedPath: bestPath,
  };
}

function firstDefined(values: unknown[]): unknown {
  return values.find((v) => v !== undefined && v !== null && v !== "");
}

function firstString(values: unknown[]): string | null {
  const v = firstDefined(values);
  return v == null ? null : String(v);
}

function parseCount(value: unknown): number | null {
  const n = parseExplicitNumber(value);
  if (n === null) return null;
  return n;
}
