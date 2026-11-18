/**
 * Test data for the Milliways demo app menu.
 * Verified against the app via `npx mobilewright inspect` (18 Nov 2026).
 */
export const products = {
  firstAvailable: 'Soup of the Day',
  expensive: 'Pan Galactic Gargle Blaster',
  /** Unit price of Soup of the Day as displayed in the app. */
  firstAvailablePrice: '₭28,00',
} as const;

export const cartScenarios = {
  singleItem: { quantity: 1 },
  multiQuantity: { quantity: 3 },
} as const;
