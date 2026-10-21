import { useSyncExternalStore } from 'react';
import { act, cleanup, fireEvent, render, screen, within } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import {
  createMemoryHistory,
  createRootRoute,
  createRoute,
  createRouter,
  RouterProvider,
} from '@tanstack/react-router';
import { ThemeProvider } from '@/contexts/ThemeContext';
import {
  getSidebarCollapsed,
  getSidebarServerSnapshot,
  subscribeToSidebar,
  toggleSidebar,
} from '@/utils';
import { GovernanceSidebar } from './Sidebar';
import '@/locales/i18n';

const { logout } = vi.hoisted(() => ({ logout: vi.fn() }));
vi.mock('@/server', () => ({ adminLogoutFn: logout }));

beforeEach(() => {
  localStorage.clear();
  vi.stubGlobal(
    'matchMedia',
    vi.fn(() => ({ matches: false, addEventListener: vi.fn(), removeEventListener: vi.fn() })),
  );
  logout.mockResolvedValue({ error: true });
});
afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
  vi.clearAllMocks();
});

async function renderSidebar() {
  function Fixture() {
    const collapsed = useSyncExternalStore(
      subscribeToSidebar,
      getSidebarCollapsed,
      getSidebarServerSnapshot,
    );
    return (
      <ThemeProvider>
        <GovernanceSidebar
          user={{ name: 'Alex Admin', email: 'alex@example.com' }}
          navigation={{
            gatewayUrl: 'https://governance.example',
            governanceAdminUrl: 'https://governance.example/admin',
            chatUrl: 'https://governance.example/api/auth/open-chat',
          }}
          collapsed={collapsed}
          onToggle={toggleSidebar}
        />
      </ThemeProvider>
    );
  }
  const root = createRootRoute({ component: Fixture });
  const groups = createRoute({
    getParentRoute: () => root,
    path: '/access',
    validateSearch: (search: Record<string, string>) => ({ tab: search.tab || 'groups' }),
  });
  const login = createRoute({ getParentRoute: () => root, path: '/login' });
  const router = createRouter({
    routeTree: root.addChildren([groups, login]),
    basepath: '/groups-admin',
    history: createMemoryHistory({ initialEntries: ['/groups-admin/access?tab=groups'] }),
  });
  await router.load();
  render(<RouterProvider router={router} />);
  await screen.findByRole('navigation', { name: 'Administration' });
  return router;
}

describe('Governance sidebar in the group-management fork', () => {
  it('matches the Governance navigation order and targets, retaining the local Groups route and base path', async () => {
    await renderSidebar();
    const links = within(screen.getByRole('navigation', { name: 'Administration' })).getAllByRole(
      'link',
    );
    expect(links.map((link) => [link.textContent, link.getAttribute('href')])).toEqual([
      ['Overview', 'https://governance.example/admin'],
      ['Cost & Usage', 'https://governance.example/admin/finance'],
      ['Policy Configurator', 'https://governance.example/admin/policies'],
      ['Groups & Membership', '/groups-admin/access?tab=groups'],
      ['Audit Log', 'https://governance.example/admin/audit'],
      ['Chat', 'https://governance.example/api/auth/open-chat'],
      ['Homepage', 'https://governance.example'],
    ]);
    expect(links.filter((link) => link.getAttribute('aria-current') === 'page')).toEqual([
      links[3],
    ]);
    expect(links[3]).toHaveClass('active');
    expect(screen.getByRole('link', { name: 'Governance Admin Panel' })).toHaveAttribute(
      'href',
      'https://governance.example/admin',
    );
    expect(screen.queryByRole('link', { name: 'Chat Admin' })).not.toBeInTheDocument();
  });

  it('starts expanded and persists collapse using Governance Admin’s preference', async () => {
    await renderSidebar();
    fireEvent.click(screen.getByRole('button', { name: 'Collapse sidebar' }));
    expect(localStorage.getItem('gateway-admin:sidebar-collapsed')).toBe('true');
    expect(screen.getByRole('complementary', { name: 'Admin panel' })).toHaveClass('is-collapsed');
    expect(screen.getByRole('button', { name: 'Expand sidebar' })).toHaveAttribute(
      'aria-expanded',
      'false',
    );
    expect(screen.getByRole('link', { name: 'Cost & Usage' })).toHaveAttribute(
      'title',
      'Cost & Usage',
    );
    act(() => {
      localStorage.setItem('gateway-admin:sidebar-collapsed', 'false');
      window.dispatchEvent(new StorageEvent('storage', { key: 'gateway-admin:sidebar-collapsed' }));
    });
    expect(screen.getByRole('button', { name: 'Collapse sidebar' })).toHaveAttribute(
      'aria-expanded',
      'true',
    );
  });

  it('provides the same account menu, theme settings, Escape handling, and sign-out operation', async () => {
    await renderSidebar();
    const trigger = screen.getByRole('button', { name: 'Account menu for Alex Admin' });
    fireEvent.click(trigger);
    const menu = screen.getByRole('menu', { name: 'Account' });
    expect(within(menu).getByText('alex@example.com')).toBeInTheDocument();
    expect(screen.getByRole('menuitem', { name: 'Settings' })).toHaveFocus();
    fireEvent.keyDown(document, { key: 'Escape' });
    expect(screen.queryByRole('menu')).not.toBeInTheDocument();
    expect(trigger).toHaveFocus();

    fireEvent.click(trigger);
    fireEvent.click(screen.getByRole('menuitem', { name: 'Settings' }));
    expect(screen.queryByRole('menu')).not.toBeInTheDocument();
    expect(screen.getByRole('dialog', { name: 'Settings' })).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Dark' }));
    expect(localStorage.getItem('theme')).toBe('dark');
    fireEvent.click(screen.getByRole('button', { name: 'Close settings' }));

    fireEvent.click(trigger);
    fireEvent.click(screen.getByRole('menuitem', { name: 'Sign out' }));
    expect(logout).toHaveBeenCalledOnce();
  });
});
