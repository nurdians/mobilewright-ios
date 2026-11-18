import { test, expect } from '../../src/fixtures/test';
import { products, cartScenarios } from '../../src/data/products';

// Record video only when these tests fail.
test.use({ video: 'retain-on-failure' });

test.describe('e2e ordering flow', () => {
  test('add item to cart and place order', async ({ pages, screen }) => {
    await pages.home.waitForVisible();
    await pages.home.openMenu();

    await pages.menu.waitForVisible();
    await pages.menu.openItem(products.firstAvailable);

    await pages.itemDetail.waitForVisible();
    await pages.itemDetail.addToCart();

    // After adding, the app returns to the menu with an incremented cart badge.
    await pages.menu.openCart();

    await pages.cart.waitForVisible();
    await expect(pages.cart.itemRow(products.firstAvailable)).toBeVisible();
    await expect(pages.cart.totalLabel).toBeVisible();

    await pages.cart.placeOrder();

    await pages.confirmation.waitForVisible();
    await expect(pages.confirmation.confirmationMessage).toContainText('on its way');
    await screen.screenshot();
  });

  test('multi quantity updates the cart', async ({ pages }) => {
    const { quantity } = cartScenarios.multiQuantity;

    await pages.home.waitForVisible();
    await pages.home.openMenu();

    await pages.menu.waitForVisible();
    await pages.menu.openItem(products.firstAvailable);

    await pages.itemDetail.waitForVisible();
    await pages.itemDetail.increaseQuantity(quantity - 1);
    await expect(pages.itemDetail.quantity()).toHaveText(String(quantity));
    await pages.itemDetail.addToCart();

    await pages.menu.openCart();

    await pages.cart.waitForVisible();
    await expect(pages.cart.itemQuantityLine(quantity)).toBeVisible();
  });
});
