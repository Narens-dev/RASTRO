/**
 * Server-only upstream client for the RASTRO Express API (search, scoreEngine,
 * contract tracking, opportunities, AI summary — see repo root `src/`).
 *
 * Every `app/api/**` route handler proxies through this instead of the browser
 * calling Express directly — see obsidian/backend/api-architecture.md. The
 * upstream already returns plain JSON (not the `{ data }/{ error }` envelope);
 * this client re-throws upstream failures as `ApiError` so `handle()` maps them
 * into the standard envelope, and route handlers just return the parsed body.
 */

import { getServerEnv } from "@/env";
import { ApiError } from "@/lib/api";

export async function fetchRastroApi<T = unknown>(
  path: string,
  init?: RequestInit,
): Promise<T> {
  const { RASTRO_API_URL } = getServerEnv();
  const res = await fetch(`${RASTRO_API_URL}${path}`, {
    ...init,
    headers: { "content-type": "application/json", ...init?.headers },
    cache: "no-store",
  });

  const body = await res.json().catch(() => null);

  if (!res.ok) {
    const message =
      (body && typeof body === "object" && "error" in body
        ? String((body as { error?: unknown }).error)
        : undefined) ?? "Upstream request failed.";
    throw new ApiError(res.status, "upstream_error", message);
  }

  return body as T;
}
