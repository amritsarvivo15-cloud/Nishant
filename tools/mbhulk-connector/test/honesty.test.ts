import assert from "node:assert/strict";
import test from "node:test";
import { parseExplicitNumber } from "../src/honesty.ts";

test("explicit zero is zero", () => {
  assert.equal(parseExplicitNumber(0), 0);
  assert.equal(parseExplicitNumber("0"), 0);
  assert.equal(parseExplicitNumber("₹0"), 0);
  assert.equal(parseExplicitNumber("0.0"), 0);
});

test("missing stays null and is not coerced to zero", () => {
  assert.equal(parseExplicitNumber(null), null);
  assert.equal(parseExplicitNumber(undefined), null);
  assert.equal(parseExplicitNumber(""), null);
  assert.equal(parseExplicitNumber("—"), null);
  assert.equal(parseExplicitNumber("n/a"), null);
  assert.equal(parseExplicitNumber("unknown"), null);
});

test("parses explicit currency amounts", () => {
  assert.equal(parseExplicitNumber("₹1,234.50"), 1234.5);
  assert.equal(parseExplicitNumber(99000), 99000);
});
