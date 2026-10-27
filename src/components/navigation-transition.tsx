import { useEffect } from 'react';
import { GovernanceIcon as Icon } from './governance/Icon';
import { finishNavigation, installNavigationProgress } from '@/utils';
import { useLocalize } from '@/hooks';
import './navigation-transition.css';
const links = [
  ['overview', 'com_nav_dashboard', 'overview'],
  ['policies', 'com_nav_governance_policy', 'shield'],
  ['termlists', 'com_nav_confidential_terms', 'term-list'],
  ['groups', 'com_groups_membership', 'users'],
  ['audit', 'com_nav_governance_audit', 'audit'],
  ['finance', 'com_nav_cost_usage', 'usage'],
] as const;

export function NavigationReady() {
  useEffect(finishNavigation, []);
  return null;
}

export function NavigationChrome() {
  const localize = useLocalize();
  useEffect(installNavigationProgress, []);
  return (
    <>
      <div className="navigation-progress" role="status" aria-live="polite">
        <span className="sr-only">{localize('com_navigation_loading')}</span>
      </div>
      <div className="navigation-shell" aria-hidden="true">
        <aside className="navigation-shell-rail">
          <div className="navigation-shell-brand">
            <i className="navigation-shell-logo" />
            <span>{localize('com_nav_admin')}</span>
            <b className="navigation-shell-toggle">
              <Icon name="slide-out" />
            </b>
          </div>
          <div className="navigation-shell-links">
            {links.map(([section, label, icon]) => (
              <div key={section} className="navigation-shell-link" data-section={section}>
                <Icon name={icon} />
                <span>{localize(label)}</span>
              </div>
            ))}
          </div>
          <div className="navigation-shell-links navigation-shell-destinations">
            <div className="navigation-shell-link">
              <Icon name="chat" />
              <span>{localize('com_nav_chat')}</span>
            </div>
            <div className="navigation-shell-link">
              <Icon name="home" />
              <span>{localize('com_nav_gateway')}</span>
            </div>
          </div>
          <div className="navigation-shell-profile">
            <i className="navigation-shell-avatar" />
            <div className="navigation-shell-profile-lines">
              <span />
              <span />
            </div>
          </div>
        </aside>
        <div>
          <header className="navigation-shell-header">
            <div className="navigation-shell-header-inner">
              <span className="navigation-shell-mobile-menu" />
              <h1 />
            </div>
          </header>
          <div className="navigation-shell-content">
            <div className="navigation-shell-skeleton" />
            <div className="navigation-shell-skeleton" />
            <div className="navigation-shell-skeleton" />
          </div>
        </div>
      </div>
    </>
  );
}
