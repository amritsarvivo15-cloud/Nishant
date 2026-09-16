# Local MBHulk one-org proof connector

Office-side Playwright proof for **one Org ID + one date range**. It does not change the existing UI.

## Run

From the repository root (after `npm install` in `tools/mbhulk-connector`):

```bash
npm run mbhulk:discover -- --orgId=127055 --start=2026-09-01 --end=2026-09-15
```

First run opens headed Chromium with a persistent local profile. Complete the normal office MBHulk login yourself. Session state stays in gitignored files under `tools/mbhulk-connector/.profile` and `tools/mbhulk-connector/.auth`.

If your portal host is not the default, pass `--baseUrl=` or `MBHULK_BASE_URL`.

Do not put passwords in source or environment variables.

## Output

Prints one JSON object: either verified spend fields (`verification: "passed"`) or an explicit sanitized failure (`ok: false`). Missing numbers stay `null`. `0` is used only when MBHulk explicitly returned zero.

On failure, sanitized artifacts may be written to `artifacts/mbhulk-debug/` (gitignored).

## Tests (no live MBHulk session)

```bash
npm --prefix tools/mbhulk-connector test
```
