import { test, expect } from '../../src/fixtures/test';

// Record video only when this test fails.
test.use({ video: 'retain-on-failure' });

test.describe('regression', () => {
  test('empty cart checkout does not crash', async ({ pages, screen }) => {
    // KNOWN BUG (intentional in the Milliways demo app): Place Order with an
    // empty cart crashes the app back to the iOS home screen.
    // test.fail() marks this as an expected failure — if the app is ever
    // fixed, this test flips to failing and signals the fix.
    test.fail();

    await pages.home.waitForVisible();
    await pages.home.openMenu();

    await pages.menu.waitForVisible();
    await pages.menu.openCart();

    // Empty cart state
    await pages.cart.waitForVisible();
    await expect(pages.cart.emptyCartMessage).toBeVisible();

    // Attempt checkout with an empty cart — the app must stay alive.
    await pages.cart.placeOrder();
    await expect(pages.cart.emptyCartMessage).toBeVisible();
    await screen.screenshot();
  });
});
