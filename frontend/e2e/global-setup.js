import { chromium } from '@playwright/test';
import { mkdirSync } from 'fs';
import { config as loadEnv } from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
loadEnv({ path: path.resolve(__dirname, '..', '.env.e2e') });

const BASE_URL = process.env.E2E_BASE_URL || 'http://localhost:5173';
const ADMIN_EMAIL = process.env.E2E_USER_EMAIL || 'nicolas@tenri.cl';
const ADMIN_PASSWORD = process.env.E2E_USER_PASSWORD || 'password';
const CLIENT_EMAIL = process.env.E2E_CLIENT_EMAIL || 'contacto@insuban.cl';
const CLIENT_PASSWORD = process.env.E2E_CLIENT_PASSWORD || 'password';

async function doLogin(page, email, password) {
    await page.goto(`${BASE_URL}/login`);
    await page.locator('input[type="email"], input[name="email"]').first().waitFor({ state: 'visible', timeout: 10_000 });
    await page.locator('input[type="email"], input[name="email"]').first().fill(email);
    await page.locator('input[type="password"]').first().fill(password);
    const rememberCheckbox = page.locator('input[type="checkbox"]').first();
    await rememberCheckbox.check({ force: true }).catch(() => {});
    const loginResponsePromise = page.waitForResponse(response => 
        response.url().includes('/login') && response.status() === 200
    );
    await page.locator('button[type="submit"]').first().click();
    await loginResponsePromise;
    await page.waitForURL((url) => !url.pathname.includes('/login'), { timeout: 20_000 });
    await page.waitForTimeout(2000);
}

async function globalSetup() {
    mkdirSync(path.resolve(__dirname, '.auth'), { recursive: true });

    const browser = await chromium.launch();

    // SETUP ADMIN
    const adminContext = await browser.newContext();
    const adminPage = await adminContext.newPage();
    await doLogin(adminPage, ADMIN_EMAIL, ADMIN_PASSWORD);
    await adminContext.storageState({ path: path.resolve(__dirname, '.auth/admin.json') });
    await adminContext.close();

    // SETUP CLIENTE
    const clientContext = await browser.newContext();
    const clientPage = await clientContext.newPage();
    await doLogin(clientPage, CLIENT_EMAIL, CLIENT_PASSWORD);
    await clientContext.storageState({ path: path.resolve(__dirname, '.auth/client.json') });
    await clientContext.close();

    await browser.close();
}

export default globalSetup;