export const adminPanelName = 'Maasu Admin Panel';

const basePath = (import.meta.env.VITE_BASE_PATH || '').replace(/\/$/, '');

export const brandAssets = {
  wordmark: `${basePath}/maasu-wordmark.svg`,
  mark: `${basePath}/maasu-mark.svg`,
  favicon: `${basePath}/favicon.svg`,
  manifest: `${basePath}/manifest.json`,
};
