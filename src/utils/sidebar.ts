export const GOVERNANCE_DRAWER_ID = 'governance-sidebar';
const CHANGE_EVENT = 'gateway-admin:sidebar-change';

export function closeGovernanceDrawer() {
  const drawer = document.getElementById(GOVERNANCE_DRAWER_ID);
  if (drawer?.matches(':popover-open')) drawer.hidePopover();
}

export function subscribeToSidebar(callback: () => void) {
  window.addEventListener('storage', callback);
  window.addEventListener(CHANGE_EVENT, callback);
  return () => {
    window.removeEventListener('storage', callback);
    window.removeEventListener(CHANGE_EVENT, callback);
  };
}

function storageKey(governed: boolean) {
  return governed ? 'gateway-admin:sidebar-collapsed' : 'admin-panel:sidebar-collapsed';
}

export function getSidebarCollapsed(governed: boolean) {
  const value = localStorage.getItem(storageKey(governed));
  return value === null ? !governed : value === 'true';
}

export function toggleSidebar(governed: boolean) {
  localStorage.setItem(storageKey(governed), String(!getSidebarCollapsed(governed)));
  window.dispatchEvent(new Event(CHANGE_EVENT));
}
