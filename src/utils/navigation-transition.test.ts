// @vitest-environment jsdom
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import {
  finishNavigation,
  installNavigationProgress,
  navigationBootstrapScript,
  resetNavigation,
} from './navigation-transition';

beforeEach(() => {
  vi.useFakeTimers();
  window.history.replaceState(null, '', '/admin/audit');
  document.body.innerHTML = '';
  resetNavigation();
  localStorage.clear();
  vi.stubGlobal('matchMedia', () => ({ matches: false }));
});
afterEach(() => {
  resetNavigation();
  vi.useRealTimers();
  vi.unstubAllGlobals();
});

function link() {
  const anchor = document.createElement('a');
  anchor.href = 'http://localhost:3090/access?tab=groups';
  anchor.dataset.navigationDestination = 'groups';
  anchor.innerHTML = '<span>Groups</span>';
  document.body.append(anchor);
  return anchor;
}
function click(anchor: HTMLAnchorElement, options: MouseEventInit = {}) {
  const event = new MouseEvent('click', { bubbles: true, cancelable: true, button: 0, ...options });
  // Prevent JSDOM's unimplemented native navigation after the document listener runs.
  window.addEventListener('click', (e) => e.preventDefault(), { once: true });
  anchor.querySelector('span')!.dispatchEvent(event);
}

describe('cross-app navigation feedback', () => {
  it('marks a normal link click without preventing native navigation', () => {
    const stop = installNavigationProgress();
    click(link());
    expect(document.documentElement.dataset.navigationState).toBe('outgoing');
    expect(document.cookie).toContain('governance-navigation=groups');
    stop();
  });
  it.each([
    { ctrlKey: true },
    { metaKey: true },
    { shiftKey: true },
    { altKey: true },
    { button: 1 },
  ])('leaves modified clicks alone: %j', (options) => {
    const stop = installNavigationProgress();
    click(link(), options);
    expect(document.documentElement.hasAttribute('data-navigation-state')).toBe(false);
    stop();
  });
  it.each(['blank', 'download', 'local', 'prevented'])(
    'does not start progress for %s navigation',
    (mode) => {
      const anchor = link();
      if (mode === 'blank') anchor.target = '_blank';
      if (mode === 'download') anchor.download = 'file';
      if (mode === 'local') delete anchor.dataset.navigationDestination;
      if (mode === 'prevented') anchor.addEventListener('click', (event) => event.preventDefault());
      const stop = installNavigationProgress();
      click(anchor);
      expect(document.documentElement.hasAttribute('data-navigation-state')).toBe(false);
      stop();
    },
  );
  it.each(['gateway', 'groups'] as const)(
    'restores incoming chrome before hydration in %s',
    (app) => {
      const destination = app === 'groups' ? 'groups' : 'audit';
      window.history.replaceState(null, '', app === 'groups' ? '/access' : '/admin/audit');
      document.cookie = `governance-navigation=${destination}; Path=/`;
      localStorage.setItem('gateway-admin:sidebar-collapsed', 'true');
      new Function(navigationBootstrapScript(app))();
      expect(document.documentElement.dataset.navigationState).toBe('incoming');
      expect(document.documentElement.dataset.navigationDestination).toBe(destination);
      expect(document.documentElement.dataset.navigationCollapsed).toBe('true');
      finishNavigation();
      vi.runOnlyPendingTimers();
      expect(document.documentElement.hasAttribute('data-navigation-state')).toBe(false);
      expect(document.cookie).not.toContain('governance-navigation=');
    },
  );
  it('never covers the Governance sign-in page', () => {
    window.history.replaceState(null, '', '/login');
    document.cookie = 'governance-navigation=audit; Path=/';
    new Function(navigationBootstrapScript('gateway'))();
    expect(document.documentElement.hasAttribute('data-navigation-state')).toBe(false);
    expect(document.cookie).not.toContain('governance-navigation=');
  });
  it('keeps Groups chrome through the existing SSO callback', () => {
    window.history.replaceState(null, '', '/auth/openid/callback');
    document.cookie = 'governance-navigation=groups; Path=/';
    new Function(navigationBootstrapScript('groups'))();
    expect(document.documentElement.dataset.navigationState).toBe('incoming');
  });
  it('clears an abandoned transition and a restored Back/Forward page', () => {
    const stop = installNavigationProgress();
    click(link());
    vi.advanceTimersByTime(15000);
    expect(document.documentElement.hasAttribute('data-navigation-state')).toBe(false);
    click(link());
    window.dispatchEvent(new PageTransitionEvent('pageshow', { persisted: true }));
    expect(document.documentElement.hasAttribute('data-navigation-state')).toBe(false);
    stop();
  });
  it('reveals authentication and permission errors immediately', () => {
    document.documentElement.dataset.navigationState = 'incoming';
    document.body.innerHTML = '<div role="alert">Access denied</div>';
    const stop = installNavigationProgress();
    expect(document.documentElement.dataset.navigationState).toBe('finishing');
    stop();
  });
  it('does not wait for an animation when reduced motion is requested', () => {
    vi.stubGlobal('matchMedia', () => ({ matches: true }));
    document.documentElement.dataset.navigationState = 'incoming';
    finishNavigation();
    vi.advanceTimersByTime(0);
    expect(document.documentElement.hasAttribute('data-navigation-state')).toBe(false);
  });
});
