import { parseDiscoverArgs } from "./args.ts";
import { discoverOneOrg } from "./discover.ts";
import { DiscoverError } from "./types.ts";

function printUsage(): void {
  process.stderr.write(`Office-side MBHulk one-org discoverer.

Usage:
  npm run mbhulk:discover -- --orgId=127055 --start=2026-09-01 --end=2026-09-15

Optional:
  --baseUrl=https://mbhulk.makemytrip.com
  --headed=true|false
  --waitForManual=true|false
  --profileDir=...
  --storageState=...

Do not pass passwords. Log in in the headed browser on first run.
Session files are local and gitignored.
`);
}

const argv = process.argv.slice(2);
if (argv.includes("--help") || argv.includes("-h")) {
  printUsage();
  process.exit(0);
}

try {
  const args = parseDiscoverArgs(argv);
  const result = await discoverOneOrg(args);
  process.stdout.write(`${JSON.stringify(result, null, 2)}\n`);
  if ("ok" in result && result.ok === false) process.exit(2);
  if ("verification" in result && result.verification !== "passed") process.exit(2);
} catch (err) {
  if (err instanceof DiscoverError) {
    process.stdout.write(
      `${JSON.stringify(
        {
          ok: false,
          error: { code: err.code, message: err.message, details: err.details },
          orgId: null,
          periodStart: null,
          periodEnd: null,
          fetchedAt: new Date().toISOString(),
        },
        null,
        2,
      )}\n`,
    );
    process.exit(2);
  }
  throw err;
}
