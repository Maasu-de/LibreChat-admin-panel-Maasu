import {
  createMemoryHistory,
  createRootRoute,
  createRoute,
  createRouter,
} from '@tanstack/react-router';
import { describe, it, expect } from 'vitest';
import { groupsRedirectRequired } from './governance';

describe('governed navigation', () => {
  it.each(['/', '/users', '/grants', '/configuration', '/help', '/missing'])(
    'redirects hidden route %s',
    (path) => {
      expect(groupsRedirectRequired(true, path, '')).toBe(true);
    },
  );
  it.each(['', '?tab=roles', '?tab=unknown'])('redirects hidden or missing tab %s', (search) => {
    expect(groupsRedirectRequired(true, '/access', search)).toBe(true);
  });
  it('opens Groups directly and retains ordinary navigation outside governed mode', () => {
    expect(groupsRedirectRequired(true, '/access', '?tab=groups')).toBe(false);
    expect(groupsRedirectRequired(false, '/grants', '')).toBe(false);
  });
});

it.each(['/', '/adminpanel', '/adminpanel/'])(
  'accepts Groups after the real router normalizes basepath %s',
  async (basepath) => {
    const root = createRootRoute();
    const decisions: boolean[] = [];
    const app = createRoute({
      getParentRoute: () => root,
      id: '_app',
      beforeLoad: ({ location }) => {
        decisions.push(groupsRedirectRequired(true, location.pathname, location.searchStr));
        return { pilotEnabled: true };
      },
    });
    const access = createRoute({ getParentRoute: () => app, path: '/access' });
    const prefix = basepath.replace(/\/$/, '');
    const publicUrl = `${prefix}/access?tab=groups`;
    const router = createRouter({
      basepath,
      routeTree: root.addChildren([app.addChildren([access])]),
      history: createMemoryHistory({ initialEntries: [publicUrl] }),
    });

    await router.load();

    expect(decisions).toEqual([false]);
    expect(router.state.location.pathname).toBe('/access');
    expect(router.history.location.href).toBe(publicUrl);
    expect(router.state.matches.at(-1)?.context).toMatchObject({ pilotEnabled: true });
  },
);
