import { test as base, expect } from '@mobilewright/test';
import { HomePage } from '../pages/HomePage';
import { MenuPage } from '../pages/MenuPage';
import { ItemDetailPage } from '../pages/ItemDetailPage';
import { CartPage } from '../pages/CartPage';
import { ConfirmationPage } from '../pages/ConfirmationPage';

/** Collection of all page objects, handed to every test. */
export type Pages = {
  home: HomePage;
  menu: MenuPage;
  itemDetail: ItemDetailPage;
  cart: CartPage;
  confirmation: ConfirmationPage;
};

/**
 * Extended test with a `pages` fixture so tests never build page objects
 * themselves and never touch raw locators.
 */
export const test = base.extend<{ pages: Pages }>({
  pages: async ({ screen }, use) => {
    await use({
      home: new HomePage(screen),
      menu: new MenuPage(screen),
      itemDetail: new ItemDetailPage(screen),
      cart: new CartPage(screen),
      confirmation: new ConfirmationPage(screen),
    });
  },
});

export { expect };
