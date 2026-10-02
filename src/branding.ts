export const adminPanelName = 'AIMO Engineering Admin Panel';

const basePath = (import.meta.env.VITE_BASE_PATH || '').replace(/\/$/, '');

export const brandAssets = {
  wordmark: `${basePath}/aimo-logo.svg`,
  mark: `${basePath}/aimo-logo.svg`,
  favicon: `${basePath}/aimo-logo.svg`,
  manifest: `${basePath}/manifest.json`,
};
