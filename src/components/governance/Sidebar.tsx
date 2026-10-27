import { createPortal } from 'react-dom';
import { useEffect, useRef, useState } from 'react';
import { Link, useRouter } from '@tanstack/react-router';
import type * as t from '@/types';
import { closeGovernanceDrawer, cn, getInitials, GOVERNANCE_DRAWER_ID } from '@/utils';
import { SettingsDialog } from '@/components/SettingsDialog';
import { adminLogoutFn } from '@/server';
import { GovernanceIcon } from './Icon';
import { useLocalize } from '@/hooks';
import './sidebar.css';

const primaryLinks = [
  ['com_nav_dashboard', '', 'overview'],
  ['com_nav_governance_policy', '/policies', 'shield'],
  ['com_nav_confidential_terms', '/termlists', 'term-list'],
  ['com_groups_membership', '/access', 'users'],
  ['com_nav_governance_audit', '/audit', 'audit'],
  ['com_nav_cost_usage', '/finance', 'usage'],
] as const;

export function GovernanceSidebar({ user, navigation, collapsed, onToggle }: t.SidebarProps) {
  const localize = useLocalize();
  const router = useRouter();
  const [menuOpen, setMenuOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [menuPosition, setMenuPosition] = useState({ left: 0, bottom: 0 });
  const triggerRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const name = user?.name || user?.email || localize('com_account_administrator');
  const email = user?.email || localize('com_account_email_unavailable');
  const brand = localize('com_nav_governance_admin_panel');

  useEffect(() => {
    if (!menuOpen) return;
    menuRef.current?.querySelector<HTMLButtonElement>('[role="menuitem"]')?.focus();
    const closeOnOutsideClick = (event: PointerEvent) => {
      const target = event.target as Node;
      if (!menuRef.current?.contains(target) && !triggerRef.current?.contains(target)) {
        setMenuOpen(false);
      }
    };
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key !== 'Escape') return;
      setMenuOpen(false);
      triggerRef.current?.focus();
    };
    const closeOnMovement = () => setMenuOpen(false);
    document.addEventListener('pointerdown', closeOnOutsideClick);
    document.addEventListener('keydown', closeOnEscape);
    window.addEventListener('resize', closeOnMovement);
    window.addEventListener('scroll', closeOnMovement, true);
    return () => {
      document.removeEventListener('pointerdown', closeOnOutsideClick);
      document.removeEventListener('keydown', closeOnEscape);
      window.removeEventListener('resize', closeOnMovement);
      window.removeEventListener('scroll', closeOnMovement, true);
    };
  }, [menuOpen]);

  useEffect(() => setMenuOpen(false), [collapsed]);

  function toggleMenu() {
    if (menuOpen) {
      setMenuOpen(false);
      return;
    }
    const rect = triggerRef.current?.getBoundingClientRect();
    if (!rect) return;
    const menuWidth = Math.min(240, window.innerWidth - 16);
    setMenuPosition({
      left: Math.max(8, Math.min(rect.left, window.innerWidth - menuWidth - 8)),
      bottom: window.innerHeight - rect.top + 8,
    });
    setMenuOpen(true);
  }

  async function handleLogout() {
    setIsLoggingOut(true);
    try {
      const result = await adminLogoutFn();
      if (!result.error && result.redirect) {
        window.location.href = result.redirect;
        return;
      }
      await router.invalidate();
      await router.navigate({ to: '/login', search: { redirect: '/' } });
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      setIsLoggingOut(false);
    }
  }

  return (
    <>
      <aside
        id={GOVERNANCE_DRAWER_ID}
        popover="auto"
        className={cn('governance-sidebar', collapsed && 'is-collapsed')}
        aria-label={localize('com_a11y_admin_panel')}
      >
        <div className="governance-sidebar-top">
          <a
            className="governance-brand"
            href={navigation.governanceAdminUrl}
            aria-label={brand}
            title={collapsed ? brand : undefined}
          >
            <span className="governance-brand-logo governance-brand-logo-long" aria-hidden="true" />
            <span
              className="governance-brand-logo governance-brand-logo-small"
              aria-hidden="true"
            />
            <span className="governance-brand-title">{localize('com_nav_admin')}</span>
          </a>
          <button
            className="governance-sidebar-toggle"
            type="button"
            onClick={onToggle}
            aria-label={localize(collapsed ? 'com_nav_expand_sidebar' : 'com_nav_collapse_sidebar')}
            title={localize(collapsed ? 'com_nav_expand_sidebar' : 'com_nav_collapse_sidebar')}
            aria-expanded={!collapsed}
          >
            <GovernanceIcon name={collapsed ? 'slide-in' : 'slide-out'} />
          </button>
        </div>
        <nav aria-label={localize('com_nav_administration')}>
          <div className="governance-sidebar-primary">
            {primaryLinks.map(([labelKey, path, icon]) => {
              const label = localize(labelKey);
              const content = (
                <>
                  <GovernanceIcon name={icon} />
                  <span className="governance-sidebar-label">{label}</span>
                </>
              );
              const accessibleLabel = collapsed ? label : undefined;
              if (path === '/access') {
                return (
                  <Link
                    key={path}
                    to="/access"
                    search={{ tab: 'groups' }}
                    onClick={closeGovernanceDrawer}
                    className="active"
                    aria-current="page"
                    aria-label={accessibleLabel}
                    title={accessibleLabel}
                  >
                    {content}
                  </Link>
                );
              }
              return (
                <a
                  key={path}
                  href={`${navigation.governanceAdminUrl}${path}`}
                  aria-label={accessibleLabel}
                  title={accessibleLabel}
                >
                  {content}
                </a>
              );
            })}
          </div>
          <div className="governance-sidebar-destinations">
            {navigation.chatUrl && (
              <a
                href={navigation.chatUrl}
                aria-label={collapsed ? localize('com_nav_chat') : undefined}
                title={collapsed ? localize('com_nav_chat') : undefined}
              >
                <GovernanceIcon name="chat" />
                <span className="governance-sidebar-label">{localize('com_nav_chat')}</span>
              </a>
            )}
            {navigation.gatewayUrl && (
              <a
                href={navigation.gatewayUrl}
                aria-label={collapsed ? localize('com_nav_gateway') : undefined}
                title={collapsed ? localize('com_nav_gateway') : undefined}
              >
                <GovernanceIcon name="home" strokeWidth={2} />
                <span className="governance-sidebar-label">{localize('com_nav_gateway')}</span>
              </a>
            )}
          </div>
        </nav>
        <div className="governance-sidebar-profile">
          <div className="governance-sidebar-profile-identity">
            <button
              ref={triggerRef}
              className="governance-sidebar-profile-trigger"
              type="button"
              onClick={toggleMenu}
              aria-label={localize('com_account_menu_for', { name })}
              aria-haspopup="menu"
              aria-expanded={menuOpen}
            >
              <span className="governance-sidebar-profile-avatar" aria-hidden="true">
                {getInitials(name)}
              </span>
            </button>
            <div className="governance-sidebar-profile-details">
              <span className="governance-sidebar-profile-name">{name}</span>
              <span className="governance-sidebar-profile-email">{email}</span>
            </div>
          </div>
        </div>
      </aside>
      {menuOpen &&
        createPortal(
          <div
            ref={menuRef}
            className="governance-user-menu"
            role="menu"
            aria-label={localize('com_account')}
            style={menuPosition}
          >
            <div className="governance-user-menu-heading" role="presentation">
              <strong>{name}</strong>
              <span>{email}</span>
            </div>
            <button
              className="governance-user-menu-item"
              role="menuitem"
              type="button"
              onClick={() => {
                setMenuOpen(false);
                setSettingsOpen(true);
              }}
            >
              <GovernanceIcon name="account-settings" />
              {localize('com_ui_settings')}
            </button>
            <button
              className="governance-user-menu-item"
              role="menuitem"
              type="button"
              onClick={handleLogout}
              disabled={isLoggingOut}
            >
              <GovernanceIcon name="sign-out" />
              {localize(isLoggingOut ? 'com_ui_signing_out' : 'com_ui_sign_out')}
            </button>
          </div>,
          document.querySelector<HTMLElement>('.governance-sidebar:popover-open') ?? document.body,
        )}
      <SettingsDialog open={settingsOpen} onClose={() => setSettingsOpen(false)} />
    </>
  );
}
