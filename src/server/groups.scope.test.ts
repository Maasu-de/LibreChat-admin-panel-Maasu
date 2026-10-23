import { afterEach, beforeEach, expect, it, vi } from 'vitest';
import { getEffectiveCapabilitiesFn } from './capabilities';
import { searchUsersFn } from './users';

const { apiFetch } = vi.hoisted(() => ({ apiFetch: vi.fn() }));
vi.mock('@tanstack/react-start', () => ({
  createServerFn: () => ({
    handler: (handler: (...args: unknown[]) => unknown) => handler,
    inputValidator: () => ({ handler: (handler: (...args: unknown[]) => unknown) => handler }),
  }),
}));
vi.mock('./utils/api', () => ({ apiFetch, extractApiError: vi.fn() }));

beforeEach(() => {
  apiFetch.mockReset();
});
afterEach(() => {
  vi.unstubAllEnvs();
});

it.each([true, false])('uses the appropriate capability endpoint with pilot=%s', async (pilot) => {
  vi.stubEnv('GOVERNANCE_PILOT_ENABLED', String(pilot));
  apiFetch.mockResolvedValue(Response.json({ capabilities: ['read:groups', 'manage:groups'] }));
  await getEffectiveCapabilitiesFn();
  expect(apiFetch).toHaveBeenCalledWith(
    pilot ? '/api/admin/groups/capabilities' : '/api/admin/grants/effective',
  );
});

it.each([true, false])(
  'uses the appropriate candidate search endpoint with pilot=%s',
  async (pilot) => {
    vi.stubEnv('GOVERNANCE_PILOT_ENABLED', String(pilot));
    apiFetch.mockResolvedValue(Response.json({ users: [] }));
    await searchUsersFn({ data: { query: 'Alex & Lee' } });
    expect(apiFetch).toHaveBeenCalledWith(
      `${pilot ? '/api/admin/groups/users/search' : '/api/admin/users/search'}?q=Alex%20%26%20Lee`,
    );
  },
);
