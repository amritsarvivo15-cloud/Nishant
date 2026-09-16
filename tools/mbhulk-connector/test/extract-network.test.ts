import assert from "node:assert/strict";
import test from "node:test";
import { extractSpendFromJson } from "../src/extract-network.ts";

test("extracts spend metrics from a nested authenticated JSON payload", () => {
  const payload = {
    status: "OK",
    data: {
      orgId: "127055",
      orgName: "Example Corp",
      startDate: "2026-09-01",
      endDate: "2026-09-15",
      totalGMV: 125000,
      flightGMV: 80000,
      hotelGMV: 45000,
      flightBookings: 12,
      hotelBookings: 4,
    },
  };
  const extracted = extractSpendFromJson(payload, "127055");
  assert.ok(extracted);
  assert.equal(extracted?.orgId, "127055");
  assert.equal(extracted?.totalGMV, 125000);
  assert.equal(extracted?.flightGMV, 80000);
  assert.equal(extracted?.hotelGMV, 45000);
  assert.equal(extracted?.flightBookings, 12);
  assert.equal(extracted?.hotelBookings, 4);
});

test("does not invent GMV when the payload has no spend fields", () => {
  const extracted = extractSpendFromJson({ ok: true, ping: "pong" }, "127055");
  assert.equal(extracted, null);
});
