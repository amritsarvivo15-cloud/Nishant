import assert from "node:assert/strict";
import test from "node:test";
import { parseDiscoverArgs } from "../src/args.ts";
import { DiscoverError } from "../src/types.ts";

test("parses org and dates from argv", () => {
  const args = parseDiscoverArgs([
    "--orgId=127055",
    "--start=2026-09-01",
    "--end=2026-09-15",
    "--headed=false",
  ]);
  assert.equal(args.orgId, "127055");
  assert.equal(args.start, "2026-09-01");
  assert.equal(args.end, "2026-09-15");
  assert.equal(args.headed, false);
  assert.equal(args.baseUrl, "https://mbhulk.makemytrip.com");
});

test("refuses to hardcode a missing org id", () => {
  assert.throws(
    () => parseDiscoverArgs(["--start=2026-09-01", "--end=2026-09-15"]),
    (err: unknown) => err instanceof DiscoverError && err.code === "MISSING_ORG_ID",
  );
});
