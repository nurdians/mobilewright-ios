import type { Locator, Screen } from 'mobilewright';
import { BasePage } from './BasePage';

/**
 * Menu screen: list of orderable items grouped under section headers
 * ("MAIN DISHES", "DRINKS") with a cart button in the navigation bar.
 *
 * Note: Milliways items are plain StaticText (no list/cell roles), so items
 * are located by their visible name.
 */
export class MenuPage extends BasePage {
  constructor(screen: Screen) {
    super(screen);
  }

  get root(): Locator {
    return this.screen.getByText('MAIN DISHES');
  }

  itemByName(name: string): Locator {
    return this.screen.getByText(name, { exact: true });
  }

  /** Cart button: shows accessible name "Shopping Cart" when empty, or the item count (e.g. "1") when filled. */
  get cartButton(): Locator {
    return this.screen.getByRole('button', { name: /Shopping Cart|^\d+$/ });
  }

  get backButton(): Locator {
    return this.screen.getByRole('button', { name: 'Back' });
  }

  async openItem(name: string): Promise<void> {
    await this.itemByName(name).tap();
  }

  async openCart(): Promise<void> {
    await this.cartButton.tap();
  }
}
