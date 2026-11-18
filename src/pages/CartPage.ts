import type { Locator, Screen } from 'mobilewright';
import { BasePage } from './BasePage';

/** "Your Order" screen: line items, total, coupon field, place-order button. */
export class CartPage extends BasePage {
  constructor(screen: Screen) {
    super(screen);
  }

  get root(): Locator {
    return this.screen.getByText('Your Order', { exact: true });
  }

  get placeOrderButton(): Locator {
    return this.screen.getByRole('button', { name: 'Place Order' });
  }

  get emptyCartMessage(): Locator {
    return this.screen.getByText('Your order is empty');
  }

  get totalLabel(): Locator {
    return this.screen.getByText('Total', { exact: true });
  }

  get couponField(): Locator {
    return this.screen.getByRole('textfield', { name: 'Coupon code' });
  }

  itemRow(name: string): Locator {
    return this.screen.getByText(name, { exact: true });
  }

  /** Line like "1 × ₭28,00". */
  itemQuantityLine(quantity: number): Locator {
    return this.screen.getByText(new RegExp(`^${quantity} ×`));
  }

  async placeOrder(): Promise<void> {
    await this.placeOrderButton.tap();
  }

  /** Navigate back to the menu (NavigationBar "Milliways" / Back). */
  async backToMenu(): Promise<void> {
    await this.screen.getByRole('button', { name: 'Milliways' }).tap();
  }
}
