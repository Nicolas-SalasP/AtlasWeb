import { defineConfig, devices } from '@playwright/test';

const FRONTEND_URL = process.env.FRONTEND_URL ?? 'http://127.0.0.1:5173';
const BACKEND_URL = process.env.BACKEND_URL ?? 'http://127.0.0.1:8000';

export default defineConfig({
  testDir: '.',
  testMatch: '**/*.spec.ts',
  fullyParallel: false,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: 1,
  reporter: [
    ['list'],
    ['html', { outputFolder: 'playwright-report', open: 'on-failure' }],
  ],
  use: {
    baseURL: FRONTEND_URL,
    trace: 'on',
    screenshot: 'only-on-failure',
    video: 'on',
    actionTimeout: 10_000,
    navigationTimeout: 30_000,
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
  webServer: [
    {
      command: 'php artisan serve --host=127.0.0.1 --port=8000',
      cwd: '../../backend',
      url: `${BACKEND_URL}/api/me`,
      reuseExistingServer: true,
      timeout: 60_000,
      stdout: 'pipe',
      stderr: 'pipe',
    },
    {
      command: 'pnpm dev --host 127.0.0.1 --port 5173',
      cwd: '..',
      url: FRONTEND_URL,
      reuseExistingServer: true,
      timeout: 60_000,
      stdout: 'pipe',
      stderr: 'pipe',
    },
  ],
});
