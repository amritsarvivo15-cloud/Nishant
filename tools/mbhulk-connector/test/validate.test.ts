import assert from "node:assert/strict";
import test from "node:test";
import { validateSpendResult } from "../src/validate.ts";

test("passes when org, dates, and a metric match", () => {
  const result = validateSpendResult({
    requestedOrgId: "127055",
    loadedOrgId: "127055",
    requestedStart: "2026-09-01",
    requestedEnd: "2026-09-15",
    reportPeriodStart: "2026-09-01",
    reportPeriodEnd: "2026-09-15",
    totalGMV: 0,
    flightGMV: null,
    hotelGMV: null,
    flightBookings: null,
    hotelBookings: null,
    source: "network",
  });
  assert.equal(result.ok, true);
});

test("fails org mismatch and does not treat missing metrics as zero", () => {
  const mismatch = validateSpendResult({
    requestedOrgId: "127055",
    loadedOrgId: "999",
    requestedStart: "2026-09-01",
    requestedEnd: "2026-09-15",
    reportPeriodStart: null,
    reportPeriodEnd: null,
    totalGMV: 10,
    flightGMV: null,
    hotelGMV: null,
    flightBookings: null,
    hotelBookings: null,
    source: "dom",
  });
  assert.equal(mismatch.ok, false);
  assert.ok(mismatch.issues.some((i) => i.code === "ORG_MISMATCH"));

  const empty = validateSpendResult({
    requestedOrgId: "127055",
    loadedOrgId: "127055",
    requestedStart: "2026-09-01",
    requestedEnd: "2026-09-15",
    reportPeriodStart: "2026-09-01",
    reportPeriodEnd: "2026-09-15",
    totalGMV: null,
    flightGMV: null,
    hotelGMV: null,
    flightBookings: null,
    hotelBookings: null,
    source: "network",
  });
  assert.equal(empty.ok, false);
  assert.ok(empty.issues.some((i) => i.code === "NO_METRICS"));
});

test("fails stale previous org", () => {
  const result = validateSpendResult({
    requestedOrgId: "127055",
    loadedOrgId: "127055",
    requestedStart: "2026-09-01",
    requestedEnd: "2026-09-15",
    reportPeriodStart: "2026-09-01",
    reportPeriodEnd: "2026-09-15",
    totalGMV: 1,
    flightGMV: null,
    hotelGMV: null,
    flightBookings: null,
    hotelBookings: null,
    source: "network",
    stalePreviousOrgId: "111",
  });
  assert.equal(result.ok, false);
  assert.ok(result.issues.some((i) => i.code === "STALE_PREVIOUS_RESULT"));
});
