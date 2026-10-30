import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { expect, test } from '@playwright/test';

const sidebarCss = readFileSync(
  fileURLToPath(new URL('../src/components/governance/sidebar.css', import.meta.url)),
  'utf8',
);

for (const width of [390, 833, 834, 1280]) {
  test(`governed shell keeps long content scrollable at ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 844 });
    // Minimal shell fixture with the flex/overflow utilities used by AppLayout,
    // AccessPage and GroupsTab. Responsive layout comes from the production CSS.
    await page.setContent(`
      <style>
        * { box-sizing: border-box; }
        body { margin: 0; }
        .shell { height: 100vh; overflow: hidden; }
        .column { display: flex; min-width: 0; flex: 1; flex-direction: column; }
        header { height: 72px; flex-shrink: 0; }
        main { display: flex; min-height: 0; flex: 1; flex-direction: column; overflow: auto; }
        .access, .inner { display: flex; min-height: 0; flex: 1; flex-direction: column; overflow: hidden; }
        .groups { display: flex; min-height: 0; flex: 1; flex-direction: column; overflow-y: auto; }
        .row { height: 70px; flex-shrink: 0; }
        ${sidebarCss}
      </style>
      <div class="shell governance-app-shell">
        <aside class="governance-sidebar" popover="manual"></aside>
        <div class="column">
          <header>Groups & Membership</header>
          <main>
            <div class="access admin-content-page"><div class="inner"><div class="groups">
              ${Array.from({ length: 30 }, (_, index) => `<div class="row">Group ${index + 1}</div>`).join('')}
              <button class="row" id="pagination">Next page</button>
            </div></div></div>
          </main>
        </div>
      </div>
    `);
    const list = page.locator('.groups');
    const dimensions = await list.evaluate((element) => ({
      clientHeight: element.clientHeight,
      scrollHeight: element.scrollHeight,
    }));
    expect(dimensions.scrollHeight).toBeGreaterThan(dimensions.clientHeight);
    await list.evaluate((element) => {
      element.scrollTop = element.scrollHeight;
    });
    await expect(page.getByRole('button', { name: 'Next page' })).toBeInViewport();
    expect(
      await page.locator('.column').evaluate((element) => element.clientHeight),
    ).toBeLessThanOrEqual(844);
  });
}
