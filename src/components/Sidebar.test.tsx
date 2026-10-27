import { useSyncExternalStore } from 'react';
import { ClickUIProvider } from '@clickhouse/click-ui';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { cleanup, fireEvent, render, screen, within } from '@testing-library/react';
import {
  createMemoryHistory,
  createRootRoute,
  createRoute,
  createRouter,
  RouterProvider,
} from '@tanstack/react-router';
import { getSidebarCollapsed, subscribeToSidebar, toggleSidebar } from '@/utils';
import { ThemeProvider } from '@/contexts/ThemeContext';
import { SystemCapabilities } from '@/constants';
import { Sidebar } from './Sidebar';
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
  localStorage.clear();
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
    const governed = pilotEnabled && gatewayConfigured;
    const collapsed = useSyncExternalStore(subscribeToSidebar, () => getSidebarCollapsed(governed));
    return (
      <Sidebar
        user={{ name: 'Demo Tester', email: 'demo@example.test' }}
        collapsed={collapsed}
        onToggle={() => toggleSidebar(governed)}
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
  const queryClient = new QueryClient({ defaultOptions: { queries: { staleTime: Infinity } } });
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

  it('retains the standalone Groups fallback when no gateway is configured', async () => {
    await renderSidebar(true, false);

    const navigation = within(await screen.findByRole('navigation'));
    expect(navigation.getByRole('link', { name: 'Groups & Membership' })).toHaveAttribute(
      'href',
      '/access?tab=groups',
    );
    expect(screen.queryByRole('link', { name: 'Configuration' })).not.toBeInTheDocument();
    expect(screen.queryByRole('link', { name: 'Grants' })).not.toBeInTheDocument();
  });

  it('keeps the Governance navigation and marks only Groups as active', async () => {
    await renderSidebar(true, true);
    const navigation = within(await screen.findByRole('navigation'));
    expect(
      navigation.getAllByRole('link').map((link) => [link.textContent, link.getAttribute('href')]),
    ).toEqual([
      ['Overview', 'https://gateway.example/admin'],
      ['Governance Policy', 'https://gateway.example/admin/policies'],
      ['Confidential Terms', 'https://gateway.example/admin/termlists'],
      ['Groups & Membership', '/access?tab=groups'],
      ['Audit Log', 'https://gateway.example/admin/audit'],
      ['Cost & Usage', 'https://gateway.example/admin/finance'],
      ['Chat', 'https://gateway.example/api/auth/open-chat'],
      ['Homepage', 'https://gateway.example'],
    ]);
    expect(navigation.getByRole('link', { name: 'Groups & Membership' })).toHaveAttribute(
      'aria-current',
      'page',
    );
    expect(
      navigation.getAllByRole('link').filter((link) => link.hasAttribute('aria-current')),
    ).toHaveLength(1);
    expect(screen.queryByRole('link', { name: 'Configuration' })).not.toBeInTheDocument();
  });

  it('starts expanded, persists collapse, and responds to changes from another tab', async () => {
    await renderSidebar(true, true);
    const sidebar = await screen.findByRole('complementary', { name: 'Admin panel' });
    expect(sidebar).not.toHaveClass('is-collapsed');
    fireEvent.click(screen.getByRole('button', { name: 'Collapse sidebar' }));
    expect(localStorage.getItem('gateway-admin:sidebar-collapsed')).toBe('true');
    expect(sidebar).toHaveClass('is-collapsed');
    expect(screen.getByRole('link', { name: 'Governance Policy' })).toHaveAttribute(
      'title',
      'Governance Policy',
    );
    localStorage.setItem('gateway-admin:sidebar-collapsed', 'false');
    fireEvent(window, new StorageEvent('storage', { key: 'gateway-admin:sidebar-collapsed' }));
    expect(sidebar).not.toHaveClass('is-collapsed');
    expect(localStorage.getItem('admin-panel:sidebar-collapsed')).toBeNull();
  });

  it('opens the account menu and closes it with Escape', async () => {
    await renderSidebar(true, true);
    const trigger = await screen.findByRole('button', { name: 'Account menu for Demo Tester' });
    fireEvent.click(trigger);
    expect(screen.getByRole('menu', { name: 'Account' })).toBeInTheDocument();
    fireEvent.keyDown(document, { key: 'Escape' });
    expect(screen.queryByRole('menu')).not.toBeInTheDocument();
    expect(trigger).toHaveFocus();
  });
});
