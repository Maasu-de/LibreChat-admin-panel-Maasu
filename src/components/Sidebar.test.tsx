import { ClickUIProvider } from '@clickhouse/click-ui';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { cleanup, render, screen, within } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import {
  createMemoryHistory,
  createRootRoute,
  createRoute,
  createRouter,
  RouterProvider,
} from '@tanstack/react-router';
import { ThemeProvider } from '@/contexts/ThemeContext';
import { SystemCapabilities } from '@/constants';
import { Sidebar } from './Sidebar';
import '@/locales/i18n';

vi.mock('@/server', () => ({ adminLogoutFn: vi.fn(), getEffectiveCapabilitiesFn: vi.fn() }));

beforeEach(() => {
  vi.stubGlobal('scrollTo', vi.fn());
  vi.stubGlobal(
    'matchMedia',
    vi.fn(() => ({
      matches: false,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
    })),
  );
});

afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
});

async function renderSidebar(pilotEnabled: boolean, gatewayConfigured: boolean) {
  function Fixture() {
    return (
      <Sidebar
        collapsed={false}
        onToggle={() => {}}
        navigation={
          gatewayConfigured
            ? {
                gatewayUrl: 'https://gateway.example',
                governanceAdminUrl: 'https://gateway.example/admin',
                chatUrl: 'https://gateway.example/api/auth/open-chat',
              }
            : {}
        }
      />
    );
  }
  const root = createRootRoute();
  const app = createRoute({
    getParentRoute: () => root,
    id: '_app',
    beforeLoad: () => ({ pilotEnabled, user: { id: 'sidebar-user' } }),
    component: Fixture,
  });
  const configuration = createRoute({ getParentRoute: () => app, path: '/configuration' });
  const groups = createRoute({ getParentRoute: () => app, path: '/access' });
  const queryClient = new QueryClient();
  queryClient.setQueryData(['effectiveCapabilities', 'sidebar-user'], {
    available: true,
    capabilities: Object.values(SystemCapabilities),
  });
  const router = createRouter({
    routeTree: root.addChildren([app.addChildren([configuration, groups])]),
    history: createMemoryHistory({
      initialEntries: [pilotEnabled ? '/access?tab=groups' : '/configuration'],
    }),
  });
  await router.load();
  render(
    <QueryClientProvider client={queryClient}>
      <ClickUIProvider theme="dark">
        <ThemeProvider>
          <RouterProvider router={router} />
        </ThemeProvider>
      </ClickUIProvider>
    </QueryClientProvider>,
  );
}

describe('sidebar mode selection', () => {
  it.each([false, true])(
    'retains local navigation outside pilot mode with gateway=%s',
    async (gatewayConfigured) => {
      await renderSidebar(false, gatewayConfigured);

      expect(await screen.findByRole('link', { name: 'Configuration' })).toHaveAttribute(
        'aria-current',
        'page',
      );
      expect(screen.getByRole('link', { name: 'Access' })).not.toHaveAttribute('aria-current');
      expect(screen.getByRole('link', { name: 'Grants' })).toHaveAttribute('href', '/grants');
      expect(screen.getByRole('link', { name: 'Help' })).toHaveAttribute('href', '/help');
    },
  );

  it.each([false, true])(
    'exposes only local Groups in pilot mode with gateway=%s',
    async (gatewayConfigured) => {
      await renderSidebar(true, gatewayConfigured);

      const navigation = within(await screen.findByRole('navigation'));
      expect(navigation.getByRole('link', { name: 'Groups & Membership' })).toHaveAttribute(
        'href',
        '/access?tab=groups',
      );
      expect(screen.queryByRole('link', { name: 'Configuration' })).not.toBeInTheDocument();
      expect(screen.queryByRole('link', { name: 'Grants' })).not.toBeInTheDocument();
      if (gatewayConfigured) {
        expect(screen.getByRole('link', { name: 'Governance Policy' })).toHaveAttribute(
          'href',
          'https://gateway.example/admin/policies',
        );
      }
    },
  );
});
