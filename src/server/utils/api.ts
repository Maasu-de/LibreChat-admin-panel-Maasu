import { ensureFreshBearer, refreshOn401 } from './refresh';
import { getServerApiUrl } from './url';

/** Skew window: refresh proactively when the bearer is within this of expiry. */
const PROACTIVE_REFRESH_SKEW_MS = 30_000;

/**
 * Make an authenticated request to the LibreChat API.
 *
 * Centralises bearer freshness: refreshes proactively when `expiresAt` is
 * within {@link PROACTIVE_REFRESH_SKEW_MS} of now, persists any rotated
 * refresh token to the session, and retries the original request once on a
 * 401 (so a token that expired between the freshness check and the request
 * landing still recovers without bubbling the failure up to the caller).
 *
 * @throws {Error} If no session bearer is available even after a refresh
 *   attempt.
 */
export async function apiFetch(path: string, init?: RequestInit): Promise<Response> {
  if (process.env.GOVERNANCE_PILOT_ENABLED === 'true' && !isGovernedApiAllowed(path, init?.method)) {
    return Response.json({ error: 'Unavailable in governed mode' }, { status: 403 });
  }
  const initialToken = await ensureFreshBearer(PROACTIVE_REFRESH_SKEW_MS);
  if (!initialToken) {
    throw new Error('No admin session token available');
  }

  const url = `${getServerApiUrl()}${path}`;
  const buildInit = (token: string): RequestInit => ({
    ...init,
    headers: {
      'Content-Type': 'application/json',
      ...init?.headers,
      Authorization: `Bearer ${token}`,
    },
  });

  const response = await fetch(url, buildInit(initialToken));
  if (response.status !== 401) {
    return response;
  }

  const refreshedToken = await refreshOn401();
  if (!refreshedToken) {
    return response;
  }
  return fetch(url, buildInit(refreshedToken));
}

/**
 * Extract an error message from a failed API response and throw.
 * Handles both `{ error }` and `{ message }` response shapes.
 */
export async function extractApiError(response: Response, fallback: string): Promise<never> {
  const body = await response.json().catch(() => ({}));
  const message =
    (body as { error?: string }).error ??
    (body as { message?: string }).message ??
    `${fallback}: ${response.status}`;
  throw new Error(message);
}

export function isGovernedApiAllowed(path: string, method = 'GET'): boolean {
  const pathname = path.split('?')[0];
  if (method === 'GET' && ['/api/admin/users/search', '/api/admin/grants/effective'].includes(pathname)) return true;
  if (/^\/api\/admin\/groups(?:\/[a-f0-9]{24}(?:\/members(?:\/[a-f0-9]{24})?)?)?$/.test(pathname)) {
    if (pathname.endsWith('/members')) return ['GET', 'POST'].includes(method);
    if (/\/members\//.test(pathname)) return method === 'DELETE';
    if (pathname === '/api/admin/groups') return ['GET', 'POST'].includes(method);
    return ['GET', 'PATCH', 'DELETE'].includes(method);
  }
  return false;
}
