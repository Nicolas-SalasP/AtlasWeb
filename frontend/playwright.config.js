import { defineConfig, devices } from '@playwright/test';
import { config as loadEnv } from 'dotenv';
import path from 'path';

loadEnv({ path: path.resolve(process.cwd(), '.env.e2e') });

export default defineConfig({
    testDir: './e2e',
    globalSetup: './e2e/global-setup.js',
    fullyParallel: true,
    forbidOnly: !!process.env.CI,
    retries: process.env.CI ? 2 : 0,
    workers: 1,
    reporter: process.env.CI
        ? [['github'], ['html', { outputFolder: 'playwright-report' }]]
        : 'html',

    use: {
        baseURL: process.env.E2E_BASE_URL || 'http://localhost:5173',
        storageState: 'e2e/.auth/admin.json',
        trace: 'on-first-retry',
        screenshot: 'only-on-failure',
        video: 'retain-on-failure',
    },

    projects: [
        {
            name: 'chromium',
            use: { ...devices['Desktop Chrome'] },
        },
    ],
    webServer: undefined,
});
