import { test, expect } from '../../src/fixtures/test';
import { products } from '../../src/data/products';

// Record video only when this test fails.
test.use({ video: 'retain-on-failure' });

test.describe('smoke', () => {
  test('app launches and shows the menu', async ({ pages, screen }) => {
    // Home / welcome screen
    await pages.home.waitForVisible();

    // Navigate to the menu
    await pages.home.openMenu();
    await pages.menu.waitForVisible();
    await expect(pages.menu.itemByName(products.firstAvailable)).toBeVisible();

    await screen.screenshot();
  });
});
