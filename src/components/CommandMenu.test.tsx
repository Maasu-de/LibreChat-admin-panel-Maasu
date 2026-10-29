import { render, screen, fireEvent, cleanup } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { ClickUIProvider } from '@clickhouse/click-ui';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import {
  createMemoryHistory,
  createRootRoute,
  createRoute,
  createRouter,
  RouterProvider,
} from '@tanstack/react-router';
import { ThemeProvider } from '@/contexts/ThemeContext';
import { CommandMenu } from './CommandMenu';
import '@/locales/i18n';

beforeEach(() => {
  vi.stubGlobal('ResizeObserver', class { observe() {} unobserve() {} disconnect() {} });
  vi.stubGlobal(
    'matchMedia',
    vi.fn(() => ({
      matches: false,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
    })),
  );
  HTMLElement.prototype.scrollIntoView = vi.fn();
});

afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
});

function show() {
  const root = createRootRoute();
  const app = createRoute({
    getParentRoute: () => root,
    id: '_app',
    beforeLoad: () => ({ pilotEnabled: true, user: { id: 'command-user' } }),
  });
  const access = createRoute({
    getParentRoute: () => app,
    path: '/access',
    component: () => <CommandMenu open onOpenChange={vi.fn()} />,
  });
  const router = createRouter({
    routeTree: root.addChildren([app.addChildren([access])]),
    history: createMemoryHistory({ initialEntries: ['/access'] }),
  });
  const queryClient = new QueryClient({ defaultOptions: { queries: { staleTime: Infinity } } });

  return router.load().then(() => {
    render(
      <QueryClientProvider client={queryClient}>
        <ClickUIProvider theme="dark">
          <ThemeProvider>
            <RouterProvider router={router} />
          </ThemeProvider>
        </ClickUIProvider>
      </QueryClientProvider>,
    );
    return router;
  });
}

describe('governed command navigation', () => {
  it('exposes Groups and hides other administrative destinations', async () => {
    const router = await show();
    const navigate = vi.spyOn(router, 'navigate');

    for (const label of ['Overview', 'Configuration', 'Grants', 'Help', 'Roles']) {
      expect(screen.queryByText(label)).not.toBeInTheDocument();
    }
    fireEvent.click(screen.getByText('Groups & Membership'));
    expect(navigate).toHaveBeenCalledWith({ to: '/access', search: { tab: 'groups' } });
  });
});
