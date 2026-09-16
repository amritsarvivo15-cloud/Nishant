import type { Page, Request, Response } from "playwright";
import { collectKeys, parseJsonSafe, sanitizeJson, sanitizeUrl, spendCandidateScore } from "./sanitizer.ts";
import type { SanitizedNetworkEntry } from "./types.ts";

const IGNORED_TYPES = new Set(["image", "font", "stylesheet", "media", "ping", "favicon"]);

function headersToObject(headers: { name: string; value: string }[]): Record<string, string> {
  const out: Record<string, string> = {};
  for (const h of headers) out[h.name] = h.value;
  return out;
}

async function previewPostData(request: Request): Promise<unknown> {
  const raw = request.postData();
  if (!raw) return null;
  const json = parseJsonSafe(raw);
  if (json !== undefined) return sanitizeJson(json);
  if (raw.length > 300) return `${raw.slice(0, 300)}…[truncated]`;
  return raw;
}

export class NetworkObserver {
  private entries: SanitizedNetworkEntry[] = [];
  private nextId = 1;
  private enabled = true;

  constructor(private readonly page: Page) {}

  attach(): void {
    this.page.on("response", (response) => {
      void this.capture(response);
    });
  }

  snapshot(): SanitizedNetworkEntry[] {
    return [...this.entries];
  }

  bestSpendCandidates(minScore = 6): SanitizedNetworkEntry[] {
    return this.entries
      .filter((e) => e.jsonLikely && e.spendCandidateScore >= minScore)
      .sort((a, b) => b.spendCandidateScore - a.spendCandidateScore || b.id - a.id);
  }

  private async capture(response: Response): Promise<void> {
    if (!this.enabled) return;
    const request = response.request();
    const resourceType = request.resourceType();
    if (IGNORED_TYPES.has(resourceType)) return;

    const url = request.url();
    if (!/^https?:/i.test(url)) return;

    let contentType: string | null = null;
    let status: number | null = response.status();
    let bodyText = "";
    let byteLength: number | null = null;
    try {
      contentType = response.headers()["content-type"] ?? null;
      const buf = await response.body();
      byteLength = buf.byteLength;
      if (buf.byteLength > 0 && buf.byteLength < 1_500_000) {
        bodyText = buf.toString("utf8");
      }
    } catch {
      status = response.status();
    }

    const json = bodyText ? parseJsonSafe(bodyText) : undefined;
    const keys = json !== undefined ? collectKeys(json) : [];
    const jsonLikely = json !== undefined || /json/i.test(contentType ?? "");
    const sanitizedUrl = sanitizeUrl(url);

    const entry: SanitizedNetworkEntry = {
      id: this.nextId++,
      at: new Date().toISOString(),
      method: request.method(),
      url: sanitizedUrl,
      resourceType,
      status,
      contentType,
      requestPayloadPreview: await previewPostData(request),
      responsePreview: json !== undefined ? sanitizeJson(json) : bodyText ? sanitizeJson(bodyText.slice(0, 400)) : null,
      responseKeys: keys.slice(0, 80),
      byteLength,
      jsonLikely,
      spendCandidateScore: spendCandidateScore(keys, sanitizedUrl),
    };

    this.entries.push(entry);
    if (this.entries.length > 400) this.entries.splice(0, this.entries.length - 400);

    void headersToObject;
  }
}
