/**
 * MBHulk URL helpers.
 *
 * The Spend Intelligence tree this connector was requested against is not in
 * this Git checkout (see tools/mbhulk-connector/AUDIT.md). These helpers are
 * the smallest local equivalent: configurable base URL + candidate paths.
 * Discovery still verifies the loaded org/report instead of trusting a URL.
 */

export function joinUrl(baseUrl: string, pathname: string, query: Record<string, string> = {}): string {
  const url = new URL(pathname.replace(/^\//, ""), baseUrl.endsWith("/") ? baseUrl : `${baseUrl}/`);
  for (const [key, value] of Object.entries(query)) {
    url.searchParams.set(key, value);
  }
  return url.toString();
}

export function loginCandidateUrls(baseUrl: string): string[] {
  return [baseUrl, joinUrl(baseUrl, "/login"), joinUrl(baseUrl, "/signin")];
}

export function orgCandidateUrls(baseUrl: string, orgId: string): string[] {
  return [
    joinUrl(baseUrl, "/", { orgId }),
    joinUrl(baseUrl, "/", { orgID: orgId }),
    joinUrl(baseUrl, `/org/${orgId}`),
    joinUrl(baseUrl, `/organisation/${orgId}`),
    joinUrl(baseUrl, `/organization/${orgId}`),
    joinUrl(baseUrl, "/dashboard", { orgId }),
    joinUrl(baseUrl, "/home", { orgId }),
  ];
}

export function spendReportCandidateUrls(
  baseUrl: string,
  orgId: string,
  start: string,
  end: string,
): string[] {
  const dateQuery = { orgId, startDate: start, endDate: end, fromDate: start, toDate: end };
  return [
    joinUrl(baseUrl, "/spend-report", dateQuery),
    joinUrl(baseUrl, "/spendReport", dateQuery),
    joinUrl(baseUrl, "/reports/spend", dateQuery),
    joinUrl(baseUrl, "/report/spend", dateQuery),
    joinUrl(baseUrl, `/org/${orgId}/spend-report`, { startDate: start, endDate: end }),
    joinUrl(baseUrl, `/organisation/${orgId}/spend-report`, { start: start, end }),
  ];
}

export function urlLooksLikeLogin(url: string): boolean {
  return /login|signin|sso|auth|oauth/i.test(url);
}

export function urlContainsOrgId(url: string, orgId: string): boolean {
  if (!orgId) return false;
  try {
    const parsed = new URL(url);
    for (const value of parsed.searchParams.values()) {
      if (value === orgId) return true;
    }
    return parsed.pathname.split("/").includes(orgId);
  } catch {
    return url.includes(orgId);
  }
}
