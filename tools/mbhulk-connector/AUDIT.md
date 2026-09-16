# Phase A audit (this checkout)

Inspected 2026-09-16 against `github.com/amritsarvivo15-cloud/Nishant` (current workspace).

## Finding

The files named in the request are **not in this repository**:

- `src/lib/sync-engine.ts`
- `src/lib/worker-controller.ts`
- `src/lib/probe.server.ts`
- `src/lib/extractor.ts`
- `src/lib/extract-listener.ts`
- `src/lib/validate.ts`
- `src/lib/store.ts`
- `src/lib/orgs.ts`
- `src/components/sync-view.tsx`

This checkout is the Dr. Suraj Kataria Vite portfolio (`package.json` name `dr.-suraj-kataria-portfolio`). There is no Playwright app, no MBHulk URL helpers, and no spend schema here.

A related public app (`nishantchawla99-netizen/Nixantintel-`, “Radar 365 by NiXant Intelligence OS”) uses Excel/CSV GMV import (`parseGmvValue`, `PortfolioRecord.org`) rather than a live MBHulk worker. It was not cloned into this workspace and was not modified.

A Grok App Builder `package.json` (`app-builder-workspace`) was provided separately: it already lists Playwright `^1.62.0`, TanStack Start, and `src/lib/*` helpers. That sandbox is **not** this GitHub checkout. The hosted Grok preview worker still cannot see an office Chrome SSO session; that is why this connector is local/office-side.

## 1. How the current sync engine would work (from the requested architecture)

In that architecture, a **sync engine** would:

1. Take a queue of org IDs + a date range.
2. Ask a **worker controller** to open/drive MBHulk.
3. Use a **probe** to confirm the worker is reachable.
4. Listen for extracted payloads (`extract-listener`).
5. Parse DOM or network (`extractor`).
6. **Validate** org/date/value ownership (`validate`).
7. Persist into a **store**.

None of that code is present here, so this connector does not call it.

## 2. Browser-side vs server-side

| Side | Typical role | This repo |
| --- | --- | --- |
| Browser (user’s office Chrome) | Holds SSO cookies, org context, Spend Report UI | Not available to a remote Grok/cloud worker |
| App frontend (`sync-view`) | Start/stop sync, show progress | Not present |
| Server worker | Automate MBHulk if it shared the user’s session | Not present; a hosted worker cannot see office Chrome |

## 3. Why a Grok-hosted worker cannot use the office MBHulk session

Authentication for MBHulk lives in the **user’s browser profile** (cookies, SSO, device/network trust). A hosted worker runs on another machine/IP with an empty browser. It cannot read the office session without exporting cookies (which this project must not do). Therefore the first proof has to be an **office-side / local** Playwright process using a persistent profile that the user logs into.

## 4. Extraction/validation that can be reused

Not importable from this tree. This connector copies the **honesty rules** that a `validate.ts` / extractor should have:

- requested vs loaded Org ID
- requested vs report dates
- refuse stale previous-org data
- `null` for unknown; `0` only if explicit
- prefer structured XHR/fetch JSON, then DOM

`parseGmvValue` from Nixantintel is conceptually reusable but lives in another repo.

## 5. What was preserved

- Entire existing portfolio UI (`App.tsx`, Vite app) is unchanged.
- No 49-org queue, Stagehand, Browserbase, Account 360, or dashboard redesign.

## 6. Smallest local Playwright architecture

```
npm run mbhulk:discover
  -> tools/mbhulk-connector (Playwright, headed, persistent profile)
  -> one orgId + start/end
  -> sanitized network log + optional DOM extract
  -> JSON result or explicit failure
```

Queue integration waits until this one-org proof is approved.
