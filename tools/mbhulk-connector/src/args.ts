import path from "node:path";
import { fileURLToPath } from "node:url";
import type { DiscoverArgs } from "./types.ts";
import { DiscoverError } from "./types.ts";

const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/;

function readFlag(argv: string[], name: string): string | undefined {
  const prefix = `--${name}=`;
  for (let i = 0; i < argv.length; i += 1) {
    const token = argv[i];
    if (token.startsWith(prefix)) return token.slice(prefix.length);
    if (token === `--${name}`) {
      const next = argv[i + 1];
      if (next && !next.startsWith("--")) return next;
      return "";
    }
  }
  return undefined;
}

function hasFlag(argv: string[], name: string): boolean {
  return argv.includes(`--${name}`) || argv.some((t) => t.startsWith(`--${name}=`));
}

function parseBoolean(raw: string | undefined, fallback: boolean): boolean {
  if (raw === undefined) return fallback;
  const v = raw.trim().toLowerCase();
  if (v === "" || v === "true" || v === "1" || v === "yes") return true;
  if (v === "false" || v === "0" || v === "no") return false;
  return fallback;
}

export function connectorRoot(): string {
  return path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
}

export function parseDiscoverArgs(argv: string[], cwd = process.cwd()): DiscoverArgs {
  const orgId = (readFlag(argv, "orgId") ?? readFlag(argv, "org-id") ?? "").trim();
  const start = (readFlag(argv, "start") ?? "").trim();
  const end = (readFlag(argv, "end") ?? "").trim();
  const baseUrl = (
    readFlag(argv, "baseUrl") ??
    readFlag(argv, "base-url") ??
    process.env.MBHULK_BASE_URL ??
    "https://mbhulk.makemytrip.com"
  )
    .trim()
    .replace(/\/$/, "");

  if (!orgId) {
    throw new DiscoverError(
      "MISSING_ORG_ID",
      "Pass a single Org ID, e.g. --orgId=127055. Org IDs are not hardcoded.",
    );
  }
  if (!ISO_DATE.test(start)) {
    throw new DiscoverError(
      "MISSING_START_DATE",
      "Pass --start=YYYY-MM-DD (example: --start=2026-09-01).",
    );
  }
  if (!ISO_DATE.test(end)) {
    throw new DiscoverError(
      "MISSING_END_DATE",
      "Pass --end=YYYY-MM-DD (example: --end=2026-09-15).",
    );
  }
  if (start > end) {
    throw new DiscoverError("INVALID_DATE_RANGE", "start must be on or before end.", {
      start,
      end,
    });
  }

  const headedDefault = process.env.CI === "1" ? false : true;
  const headed = parseBoolean(readFlag(argv, "headed"), headedDefault);
  const waitForManual = hasFlag(argv, "waitForManual") || hasFlag(argv, "wait-for-manual")
    ? parseBoolean(readFlag(argv, "waitForManual") ?? readFlag(argv, "wait-for-manual") ?? "true", true)
    : true;

  const root = connectorRoot();
  const profileDir =
    readFlag(argv, "profileDir") ??
    process.env.MBHULK_PROFILE_DIR ??
    path.join(root, ".profile");
  const storageStatePath =
    readFlag(argv, "storageState") ??
    process.env.MBHULK_STORAGE_STATE ??
    path.join(root, ".auth", "storage-state.json");
  const debugDir =
    readFlag(argv, "debugDir") ??
    path.join(cwd, "artifacts", "mbhulk-debug");

  return {
    orgId,
    start,
    end,
    baseUrl,
    headed,
    loginTimeoutMs: Number(readFlag(argv, "loginTimeoutMs") ?? 10 * 60 * 1000),
    reportTimeoutMs: Number(readFlag(argv, "reportTimeoutMs") ?? 5 * 60 * 1000),
    profileDir,
    storageStatePath,
    debugDir,
    waitForManual,
  };
}
