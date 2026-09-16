import fs from "node:fs/promises";
import { chromium, type BrowserContext, type Page } from "playwright";
import { persistStorageState, writeDebugArtifacts } from "./artifacts.ts";
import { extractSpendFromDom, pageSuggestsAuthenticatedApp } from "./extract-dom.ts";
import { extractSpendFromJson } from "./extract-network.ts";
import { NetworkObserver } from "./network-observer.ts";
import type { DiscoverArgs, FailurePayload, SanitizedNetworkEntry, SpendReportResult } from "./types.ts";
import { DiscoverError } from "./types.ts";
import { orgCandidateUrls, spendReportCandidateUrls, urlContainsOrgId, urlLooksLikeLogin } from "./urls.ts";
import { attachVerification, validateSpendResult } from "./validate.ts";

async function launchContext(args: DiscoverArgs): Promise<BrowserContext> {
  await fs.mkdir(args.profileDir, { recursive: true });
  // Persistent profile holds the office session. Playwright does not accept
  // `storageState` on launchPersistentContext; we still write a gitignored
  // storage-state.json after login as a portable backup of the same profile.
  return chromium.launchPersistentContext(args.profileDir, {
    headless: !args.headed,
    viewport: { width: 1440, height: 900 },
    ignoreHTTPSErrors: false,
    args: args.headed ? [] : ["--disable-gpu"],
  });
}

async function waitForAuthentication(page: Page, timeoutMs: number): Promise<void> {
  const started = Date.now();
  process.stderr.write(
    "Waiting for you to complete the normal office MBHulk login in the browser window...\n" +
      "Session cookies/storage stay on this machine only. Nothing is printed or committed.\n",
  );
  while (Date.now() - started < timeoutMs) {
    if (await pageSuggestsAuthenticatedApp(page)) return;
    await page.waitForTimeout(1500);
  }
  throw new DiscoverError(
    "AUTH_TIMEOUT",
    "Timed out waiting for an authenticated MBHulk session. Complete login in the headed browser and retry.",
  );
}

async function clickFirstVisible(page: Page, locators: string[]): Promise<boolean> {
  for (const selector of locators) {
    const loc = page.locator(selector).first();
    if (await loc.isVisible().catch(() => false)) {
      await loc.click({ timeout: 5000 }).catch(() => undefined);
      return true;
    }
  }
  return false;
}

async function trySwitchOrg(page: Page, args: DiscoverArgs): Promise<void> {
  if (urlContainsOrgId(page.url(), args.orgId)) return;

  const orgField = page
    .locator(
      [
        `input[name*="org" i]`,
        `input[placeholder*="org" i]`,
        `input[aria-label*="org" i]`,
        `input[id*="org" i]`,
      ].join(", "),
    )
    .first();

  if (await orgField.isVisible().catch(() => false)) {
    await orgField.fill(args.orgId).catch(() => undefined);
    await clickFirstVisible(page, [
      'button:has-text("Go")',
      'button:has-text("Switch")',
      'button:has-text("Search")',
      'button:has-text("Select")',
      'button[type="submit"]',
    ]);
    await page.waitForTimeout(1500);
  }

  const option = page.getByText(args.orgId, { exact: false }).first();
  if (await option.isVisible().catch(() => false)) {
    await option.click({ timeout: 3000 }).catch(() => undefined);
  }

  if (!urlContainsOrgId(page.url(), args.orgId) && !(await page.getByText(args.orgId).first().isVisible().catch(() => false))) {
    for (const candidate of orgCandidateUrls(args.baseUrl, args.orgId)) {
      await page.goto(candidate, { waitUntil: "domcontentloaded", timeout: 30_000 }).catch(() => undefined);
      await page.waitForTimeout(800);
      if (urlContainsOrgId(page.url(), args.orgId)) break;
      if (await page.getByText(args.orgId).first().isVisible().catch(() => false)) break;
    }
  }
}

async function tryOpenSpendReport(page: Page, args: DiscoverArgs): Promise<void> {
  const spendLink = page.getByRole("link", { name: /spend\s*report/i }).first();
  const spendButton = page.getByRole("button", { name: /spend\s*report/i }).first();
  const spendText = page.getByText(/spend\s*report/i).first();
  if (await spendLink.isVisible().catch(() => false)) {
    await spendLink.click();
  } else if (await spendButton.isVisible().catch(() => false)) {
    await spendButton.click();
  } else if (await spendText.isVisible().catch(() => false)) {
    await spendText.click();
  } else {
    for (const candidate of spendReportCandidateUrls(args.baseUrl, args.orgId, args.start, args.end)) {
      await page.goto(candidate, { waitUntil: "domcontentloaded", timeout: 30_000 }).catch(() => undefined);
      const body = ((await page.locator("body").innerText().catch(() => "")) || "").toLowerCase();
      if (body.includes("spend") || /report/.test(body)) break;
    }
  }
  await page.waitForTimeout(1000);
}

async function tryApplyDatesAndRun(page: Page, args: DiscoverArgs): Promise<void> {
  const startBox = page
    .locator(
      [
        'input[type="date"]',
        'input[name*="start" i]',
        'input[placeholder*="start" i]',
        'input[aria-label*="start" i]',
        'input[id*="start" i]',
      ].join(", "),
    )
    .first();
  const endBox = page
    .locator(
      [
        'input[name*="end" i]',
        'input[placeholder*="end" i]',
        'input[aria-label*="end" i]',
        'input[id*="end" i]',
        'input[type="date"]',
      ].join(", "),
    )
    .nth(1);

  if (await startBox.isVisible().catch(() => false)) {
    await startBox.fill(args.start).catch(() => undefined);
  }
  if (await endBox.isVisible().catch(() => false)) {
    await endBox.fill(args.end).catch(() => undefined);
  }

  await clickFirstVisible(page, [
    'button:has-text("Run")',
    'button:has-text("Generate")',
    'button:has-text("Search")',
    'button:has-text("Apply")',
    'button:has-text("Submit")',
    'button:has-text("Get Report")',
    'button:has-text("View")',
  ]);
}

function failure(code: string, message: string, args: DiscoverArgs, details: Record<string, unknown> = {}): FailurePayload {
  return {
    ok: false,
    error: { code, message, details },
    orgId: args.orgId,
    periodStart: args.start,
    periodEnd: args.end,
    fetchedAt: new Date().toISOString(),
  };
}

function extractFromObserver(observer: NetworkObserver, orgId: string) {
  for (const entry of observer.bestSpendCandidates()) {
    const payload = entry.responsePreview;
    const extracted = extractSpendFromJson(payload, orgId);
    if (!extracted) continue;
    if (extracted.orgId && extracted.orgId !== orgId) continue;
    return { extracted, entry };
  }
  return null;
}

export async function discoverOneOrg(args: DiscoverArgs): Promise<SpendReportResult | FailurePayload> {
  const started = Date.now();
  let context: BrowserContext | undefined;
  let page: Page | undefined;
  let observer: NetworkObserver | undefined;

  try {
    context = await launchContext(args);
    page = context.pages()[0] ?? (await context.newPage());
    observer = new NetworkObserver(page);
    observer.attach();

    await page.goto(args.baseUrl, { waitUntil: "domcontentloaded", timeout: 45_000 }).catch((err: unknown) => {
      throw new DiscoverError(
        "NAVIGATION_FAILED",
        `Could not open MBHulk at ${args.baseUrl}. Check --baseUrl / MBHULK_BASE_URL.`,
        { cause: err instanceof Error ? err.message : String(err) },
      );
    });

    if (!(await pageSuggestsAuthenticatedApp(page))) {
      if (!args.headed) {
        throw new DiscoverError(
          "AUTH_REQUIRED_HEADED",
          "No persisted office session was found. Re-run headed so you can log in through the normal MBHulk flow: npm run mbhulk:discover -- --orgId=... --start=... --end=... --headed=true",
        );
      }
      await waitForAuthentication(page, args.loginTimeoutMs);
    }

    await persistStorageState(context, args.storageStatePath);
    await trySwitchOrg(page, args);
    await tryOpenSpendReport(page, args);
    await tryApplyDatesAndRun(page, args);

    const reportDeadline = Date.now() + args.reportTimeoutMs;
    let networkHit = extractFromObserver(observer, args.orgId);

    if (!networkHit && args.waitForManual && args.headed) {
      process.stderr.write(
        "If the Spend Report is not running yet, generate it in the browser. Capturing fetch/XHR until data appears...\n",
      );
    }

    while (Date.now() < reportDeadline) {
      networkHit = extractFromObserver(observer, args.orgId);
      if (networkHit) break;
      const dom = await extractSpendFromDom(page, args.orgId);
      if (dom.totalGMV !== null || dom.flightGMV !== null || dom.hotelGMV !== null) break;
      await page.waitForTimeout(1500);
    }

    networkHit = extractFromObserver(observer, args.orgId);
    const dom = await extractSpendFromDom(page, args.orgId);

    const networkExtract = networkHit?.extracted ?? null;
    const source = networkExtract &&
      (networkExtract.totalGMV !== null ||
        networkExtract.flightGMV !== null ||
        networkExtract.hotelGMV !== null ||
        networkExtract.flightBookings !== null ||
        networkExtract.hotelBookings !== null)
      ? "network"
      : "dom";

    const loadedOrgId = networkExtract?.orgId ?? dom.loadedOrgId;
    const reportPeriodStart = networkExtract?.periodStart ?? dom.periodStart;
    const reportPeriodEnd = networkExtract?.periodEnd ?? dom.periodEnd;

    const metrics =
      source === "network" && networkExtract
        ? {
            totalGMV: networkExtract.totalGMV,
            flightGMV: networkExtract.flightGMV,
            hotelGMV: networkExtract.hotelGMV,
            flightBookings: networkExtract.flightBookings,
            hotelBookings: networkExtract.hotelBookings,
          }
        : {
            totalGMV: dom.totalGMV,
            flightGMV: dom.flightGMV,
            hotelGMV: dom.hotelGMV,
            flightBookings: dom.flightBookings,
            hotelBookings: dom.hotelBookings,
          };

    const validation = validateSpendResult({
      requestedOrgId: args.orgId,
      loadedOrgId,
      requestedStart: args.start,
      requestedEnd: args.end,
      reportPeriodStart,
      reportPeriodEnd,
      ...metrics,
      source: metrics.totalGMV === null &&
        metrics.flightGMV === null &&
        metrics.hotelGMV === null &&
        metrics.flightBookings === null &&
        metrics.hotelBookings === null
        ? null
        : source,
    });

    const elapsedMs = Date.now() - started;
    const notes = [
      `elapsedMs=${elapsedMs}`,
      `pageUrl=${page.url()}`,
      `loginUrlHint=${urlLooksLikeLogin(page.url())}`,
      `networkCandidates=${observer.bestSpendCandidates().length}`,
      ...(dom.evidence ?? []),
    ];

    if (!validation.ok) {
      const reason = validation.issues.map((i) => `${i.code}: ${i.message}`).join("\n");
      const dir = await writeDebugArtifacts({
        debugDir: args.debugDir,
        reason,
        page,
        network: observer.snapshot(),
        extra: {
          elapsedMs,
          pageUrl: page.url(),
          validation,
          networkHitUrl: networkHit?.entry.url ?? null,
        },
      });
      return failure("EXTRACTION_FAILED", reason, args, {
        debugDir: dir,
        elapsedMs,
        pageUrl: page.url(),
        issues: validation.issues,
        topNetworkCandidates: observer.bestSpendCandidates().slice(0, 8).map(summarizeEntry),
      });
    }

    const result = attachVerification(
      {
        orgId: args.orgId,
        loadedOrgId,
        loadedOrgName: networkExtract?.orgName ?? dom.loadedOrgName,
        periodStart: args.start,
        periodEnd: args.end,
        reportPeriodStart,
        reportPeriodEnd,
        ...metrics,
        source,
        fetchedAt: new Date().toISOString(),
        networkRequestUrl: networkHit?.entry.url ?? null,
        notes,
      },
      validation.issues,
    );

    await persistStorageState(context, args.storageStatePath);
    return result;
  } catch (err) {
    const code = err instanceof DiscoverError ? err.code : "UNEXPECTED";
    const message = err instanceof Error ? err.message : String(err);
    const details = err instanceof DiscoverError ? err.details : {};
    if (page && observer) {
      const dir = await writeDebugArtifacts({
        debugDir: args.debugDir,
        reason: `${code}: ${message}`,
        page,
        network: observer.snapshot(),
        extra: details,
      });
      details.debugDir = dir;
    }
    return failure(code, message, args, details);
  } finally {
    await context?.close().catch(() => undefined);
  }
}

function summarizeEntry(entry: SanitizedNetworkEntry) {
  return {
    method: entry.method,
    url: entry.url,
    status: entry.status,
    contentType: entry.contentType,
    resourceType: entry.resourceType,
    spendCandidateScore: entry.spendCandidateScore,
    responseKeys: entry.responseKeys.slice(0, 24),
  };
}

