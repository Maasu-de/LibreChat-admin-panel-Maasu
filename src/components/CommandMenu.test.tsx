import { render, screen, fireEvent, cleanup } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { ClickUIProvider } from '@clickhouse/click-ui';
import { CommandMenu } from './CommandMenu';

const { navigate } = vi.hoisted(() => ({ navigate: vi.fn() }));
vi.mock('@tanstack/react-router', () => ({ useRouter: () => ({ navigate }) }));
vi.mock('@/hooks', () => ({
  useLocalize: () => (key: string) => key,
  usePilotMode: () => true,
  useSearchIndex: () => ({ items: [] }),
}));
vi.mock('@/contexts/ThemeContext', () => ({ useTheme: () => ({ setTheme: vi.fn() }) }));

afterEach(() => { cleanup(); vi.unstubAllGlobals(); });

describe('governed command navigation', () => {
  it('exposes Groups and hides other administrative destinations', () => {
    vi.stubGlobal('ResizeObserver', class { observe() {} unobserve() {} disconnect() {} });
    HTMLElement.prototype.scrollIntoView = vi.fn();
    render(<ClickUIProvider theme="dark"><CommandMenu open onOpenChange={vi.fn()} /></ClickUIProvider>);
    for (const key of ['com_nav_dashboard', 'com_nav_configuration', 'com_nav_grants', 'com_nav_help', 'com_access_tab_roles']) {
      expect(screen.queryByText(key)).not.toBeInTheDocument();
    }
    fireEvent.click(screen.getByText('com_groups_membership'));
    expect(navigate).toHaveBeenCalledWith({ to: '/access', search: { tab: 'groups' } });
  });
});
