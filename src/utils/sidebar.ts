const SIDEBAR_STORAGE_KEY = 'gateway-admin:sidebar-collapsed';
const SIDEBAR_CHANGE_EVENT = 'gateway-admin:sidebar-change';

export function subscribeToSidebar(callback: () => void) {
  window.addEventListener('storage', callback);
  window.addEventListener(SIDEBAR_CHANGE_EVENT, callback);
  return () => {
    window.removeEventListener('storage', callback);
    window.removeEventListener(SIDEBAR_CHANGE_EVENT, callback);
  };
}

export function getSidebarCollapsed() {
  return localStorage.getItem(SIDEBAR_STORAGE_KEY) === 'true';
}

export function getSidebarServerSnapshot() {
  return false;
}

export function toggleSidebar() {
  localStorage.setItem(SIDEBAR_STORAGE_KEY, String(!getSidebarCollapsed()));
  window.dispatchEvent(new Event(SIDEBAR_CHANGE_EVENT));
}
