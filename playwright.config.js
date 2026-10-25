import { defineConfig, devices } from '@playwright/test';

/**
 * Playwright E2E configuration for Karali Fabrication (Vite static build/dev).
 * Uses system Microsoft Edge (Chromium) by default on Windows so tests run
 * reproducibly without requiring a separate multi-hundred-MB browser download,
 * while remaining compatible with standard Chromium in CI (`CI=true`).
 */
const browserChannel = process.env.CI ? undefined : 'msedge';

export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: [['list']],
  use: {
    baseURL: 'http://127.0.0.1:4173',
    trace: 'on-first-retry',
  },
  projects: [
    {
      name: 'desktop-chromium',
      use: {
        ...devices['Desktop Chrome'],
        channel: browserChannel,
        viewport: { width: 1280, height: 800 },
      },
    },
    {
      name: 'mobile-chromium',
      use: {
        ...devices['Pixel 7'],
        channel: browserChannel,
      },
    },
  ],
  webServer: {
    command: 'npm run preview -- --host 127.0.0.1 --port 4173 --strictPort',
    url: 'http://127.0.0.1:4173',
    reuseExistingServer: !process.env.CI,
    timeout: 30000,
  },
});
