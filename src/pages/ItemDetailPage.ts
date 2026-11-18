import type { Locator, Screen } from 'mobilewright';
import { BasePage } from './BasePage';

/** Item detail sheet: title, price, quantity stepper, add-to-order button. */
export class ItemDetailPage extends BasePage {
  constructor(screen: Screen) {
    super(screen);
  }

  get root(): Locator {
    return this.addToCartButton;
  }

  get addToCartButton(): Locator {
    return this.screen.getByRole('button', { name: 'Add to Order' });
  }

  get increaseButton(): Locator {
    return this.screen.getByRole('button', { name: '+' });
  }

  get decreaseButton(): Locator {
    return this.screen.getByRole('button', { name: '−' });
  }

  /** The quantity currently shown in the stepper (plain StaticText "1", "2", …). */
  quantity(): Locator {
    return this.screen.getByText(/^\d+$/);
  }

  async increaseQuantity(times = 1): Promise<void> {
    for (let i = 0; i < times; i++) {
      await this.increaseButton.tap();
    }
  }

  /** Add to order → returns to the menu with the cart badge incremented. */
  async addToCart(): Promise<void> {
    await this.addToCartButton.tap();
  }

  async close(): Promise<void> {
    await this.screen.getByRole('button', { name: 'Close' }).tap();
  }
}
