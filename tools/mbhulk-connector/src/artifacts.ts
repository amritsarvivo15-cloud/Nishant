import fs from "node:fs/promises";
import path from "node:path";
import type { BrowserContext, Page } from "playwright";
import type { SanitizedNetworkEntry } from "./types.ts";

export async function writeDebugArtifacts(opts: {
  debugDir: string;
  reason: string;
  page?: Page;
  network?: SanitizedNetworkEntry[];
  extra?: Record<string, unknown>;
}): Promise<string> {
  const stamp = new Date().toISOString().replace(/[:.]/g, "-");
  const dir = path.join(opts.debugDir, stamp);
  await fs.mkdir(dir, { recursive: true });
  await fs.writeFile(path.join(dir, "failure-reason.txt"), opts.reason, "utf8");
  if (opts.network) {
    await fs.writeFile(path.join(dir, "network.json"), JSON.stringify(opts.network, null, 2), "utf8");
  }
  if (opts.extra) {
    await fs.writeFile(path.join(dir, "extra.json"), JSON.stringify(opts.extra, null, 2), "utf8");
  }
  if (opts.page) {
    try {
      await opts.page.screenshot({ path: path.join(dir, "screenshot.png"), fullPage: true });
    } catch {
      await fs.writeFile(path.join(dir, "screenshot-failed.txt"), "screenshot capture failed", "utf8");
    }
  }
  return dir;
}

export async function persistStorageState(context: BrowserContext, storageStatePath: string): Promise<void> {
  await fs.mkdir(path.dirname(storageStatePath), { recursive: true });
  await context.storageState({ path: storageStatePath });
}
