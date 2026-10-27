import { afterEach, beforeEach, expect, it, vi } from 'vitest';
import { getEffectiveCapabilitiesFn } from './capabilities';
import { searchUsersFn } from './users';

const { session, updateSession } = vi.hoisted(() => ({
  session: { data: { token: 'admin-token' } },
  updateSession: vi.fn(),
}));
vi.mock('./session', () => ({
  useAppSession: async () => ({ ...session, update: updateSession }),
}));

const fetchMock = vi.fn<typeof fetch>();

beforeEach(() => {
  session.data = { token: 'admin-token' };
  updateSession.mockReset();
  fetchMock.mockReset();
  vi.stubGlobal('fetch', fetchMock);
});
afterEach(() => {
  vi.unstubAllEnvs();
  vi.unstubAllGlobals();
});

it.each([true, false])('uses the appropriate capability endpoint with pilot=%s', async (pilot) => {
  vi.stubEnv('GOVERNANCE_PILOT_ENABLED', String(pilot));
  fetchMock.mockResolvedValue(Response.json({ capabilities: ['read:groups', 'manage:groups'] }));
  await getEffectiveCapabilitiesFn();
  expect(fetchMock.mock.calls[0][0]).toContain(
    pilot ? '/api/admin/groups/capabilities' : '/api/admin/grants/effective',
  );
});

it.each([true, false])(
  'uses the appropriate candidate search endpoint with pilot=%s',
  async (pilot) => {
    vi.stubEnv('GOVERNANCE_PILOT_ENABLED', String(pilot));
    fetchMock.mockResolvedValue(Response.json({ users: [] }));
    await searchUsersFn({ data: { query: 'Alex & Lee' } });
    expect(fetchMock.mock.calls[0][0]).toContain(
      `${pilot ? '/api/admin/groups/users/search' : '/api/admin/users/search'}?q=Alex%20%26%20Lee`,
    );
  },
);
