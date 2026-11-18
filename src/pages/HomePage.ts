import type { Locator, Screen } from 'mobilewright';
import { BasePage } from './BasePage';

/** Launch / welcome screen shown when the app starts. */
export class HomePage extends BasePage {
  constructor(screen: Screen) {
    super(screen);
  }

  get root(): Locator {
    return this.screen.getByText('Welcome to Milliways');
  }

  get newOrderButton(): Locator {
    return this.screen.getByRole('button', { name: 'New Order' });
  }

  /** Start the ordering flow → navigates to the menu screen. */
  async openMenu(): Promise<void> {
    await this.newOrderButton.tap();
  }
}
