import { defineConfig, devices } from '@playwright/test';

const baseURL = process.env.E2E_BASE_URL || process.env.PLAYWRIGHT_BASE_URL || 'http://127.0.0.1:4173';
export default defineConfig({
  testDir: './tests/e2e', fullyParallel: true, retries: 0,
  reporter: [['list'], ['json', { outputFile: 'test-results/alphaci-e2e.json' }]],
  use: { baseURL, trace: 'retain-on-failure' },
  projects: [{ name: 'chromium', use: { ...devices['Desktop Chrome'] } }],
  webServer: process.env.E2E_BASE_URL || process.env.PLAYWRIGHT_BASE_URL ? undefined : {
    command: 'npm run dev -- --port 4173', url: baseURL, reuseExistingServer: !process.env.CI,
  },
});
