import type { Locator } from 'mobilewright';

/**
 * Base class for all page objects.
 * Holds the Mobilewright `screen` handle and shared helpers.
 *
 * Locator strategy (highest priority first):
 *   getByTestId > getByRole > getByLabel > getByText > getByType (raw native type)
 */
export abstract class BasePage {
  constructor(protected readonly screen: import('mobilewright').Screen) {}

  /** The element that identifies this screen — override in subclasses. */
  abstract get root(): Locator;

  /** Wait until the page's primary element is visible. */
  async waitForVisible(timeout = 10_000): Promise<void> {
    await this.root.waitFor({ state: 'visible', timeout });
  }

  async screenshot(): Promise<void> {
    await this.screen.screenshot();
  }
}
