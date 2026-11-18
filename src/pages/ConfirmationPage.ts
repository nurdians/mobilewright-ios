import type { Locator, Screen } from 'mobilewright';
import { BasePage } from './BasePage';

/** Order confirmation shown after a successful Place Order. */
export class ConfirmationPage extends BasePage {
  constructor(screen: Screen) {
    super(screen);
  }

  get root(): Locator {
    return this.confirmationMessage;
  }

  get confirmationMessage(): Locator {
    return this.screen.getByText(/is on its way/);
  }

  get closeButton(): Locator {
    return this.screen.getByRole('button', { name: 'Close' });
  }

  async close(): Promise<void> {
    await this.closeButton.tap();
  }
}
