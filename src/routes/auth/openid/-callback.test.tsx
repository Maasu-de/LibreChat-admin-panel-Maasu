import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import {
  createMemoryHistory,
  createRootRoute,
  createRoute,
  createRouter,
  Outlet,
  RouterProvider,
} from '@tanstack/react-router';
import { cleanup, render, screen, waitFor } from '@testing-library/react';
import { afterEach, beforeEach, expect, it, vi } from 'vitest';
import { Route as CallbackRoute } from './callback';
import { NavigationChrome } from '@/components/navigation-transition';
import { navigationBootstrapScript, resetNavigation } from '@/utils';
import '@/locales/i18n';

vi.hoisted(() => {
  process.env.SESSION_SECRET = 'test-session-secret-that-is-long-enough';
});
vi.mock('@tanstack/react-start', () => ({
  createServerFn: () => ({
    handler: (handler: (...args: never[]) => unknown) => handler,
    inputValidator: () => ({ handler: (handler: (...args: never[]) => unknown) => handler }),
  }),
}));

beforeEach(() => {
  vi.stubGlobal('scrollTo', vi.fn());
  vi.stubGlobal('matchMedia', () => ({ matches: false }));
  window.history.replaceState(null, '', '/auth/openid/callback');
  document.cookie = 'governance-navigation=groups; Path=/';
  new Function(navigationBootstrapScript('groups'))();
  expect(document.documentElement.dataset.navigationState).toBe('incoming');
});
afterEach(() => {
  cleanup();
  resetNavigation();
  vi.unstubAllGlobals();
});

it('reveals the real callback error and login link before the transition timeout', async () => {
  const root = createRootRoute({
    component: () => (
      <>
        <NavigationChrome />
        <Outlet />
      </>
    ),
  });
  const callback = createRoute({
    getParentRoute: () => root,
    path: '/auth/openid/callback',
    loader: () => ({ error: 'invalid_code' as const }),
    component: CallbackRoute.options.component,
  });
  const router = createRouter({
    routeTree: root.addChildren([callback]),
    history: createMemoryHistory({ initialEntries: ['/auth/openid/callback'] }),
  });
  await router.load();
  render(
    <QueryClientProvider client={new QueryClient()}>
      <RouterProvider router={router} />
    </QueryClientProvider>,
  );
  expect(await screen.findByRole('alert')).toHaveTextContent(/authentication failed/i);
  expect(screen.getByRole('link', { name: /back to login/i })).toBeInTheDocument();
  await waitFor(() => expect(document.documentElement.dataset.navigationState).toBeUndefined());
  expect(document.cookie).not.toContain('governance-navigation=');
});
