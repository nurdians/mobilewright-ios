import { defineConfig } from 'mobilewright';
import { config } from './src/config/env.ts';

export default defineConfig({
  platform: 'ios',
  bundleId: config.bundleId,
  deviceName: /iPhone/,
  testDir: './tests',
  timeout: 30_000,
  retries: process.env.CI ? 1 : 0,
  reporter: [['list'], ['html', { open: 'never' }]],
  viewTree: 'on-failure',
  use: {
    actionTimeout: 10_000,
  },
  expect: {
    timeout: 10_000,
  },
});
