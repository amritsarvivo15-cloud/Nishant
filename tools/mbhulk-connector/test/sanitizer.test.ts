import assert from "node:assert/strict";
import test from "node:test";
import { collectKeys, sanitizeHeaders, sanitizeJson, sanitizeUrl, spendCandidateScore } from "../src/sanitizer.ts";

test("sanitizeUrl redacts token query params", () => {
  const out = sanitizeUrl("https://mbhulk.example/api?orgId=127055&access_token=abc&foo=bar");
  assert.match(out, /orgId=127055/);
  assert.match(out, /access_token=%5Bredacted%5D|access_token=\[redacted\]/);
  assert.doesNotMatch(out, /abc/);
});

test("sanitizeHeaders drops cookies and authorization", () => {
  const out = sanitizeHeaders({
    cookie: "session=secret",
    authorization: "Bearer secret",
    "content-type": "application/json",
  });
  assert.deepEqual(out, { "content-type": "application/json" });
});

test("sanitizeJson redacts token keys and truncates", () => {
  const out = sanitizeJson({ sessionToken: "nope", gmv: 12, nested: { password: "x" } }) as Record<string, unknown>;
  assert.equal(out.sessionToken, "[redacted]");
  assert.equal(out.gmv, 12);
  assert.equal((out.nested as Record<string, unknown>).password, "[redacted]");
});

test("spendCandidateScore ranks spend JSON", () => {
  const keys = collectKeys({ orgId: "1", totalGMV: 1, flightSpend: 2 });
  assert.ok(spendCandidateScore(keys, "/spend-report") > spendCandidateScore(["ok"], "/health"));
});
