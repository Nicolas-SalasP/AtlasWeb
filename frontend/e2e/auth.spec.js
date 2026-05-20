import { test, expect } from '@playwright/test';

const USER_EMAIL = process.env.E2E_USER_EMAIL || 'nicolas@tenri.cl';
const USER_PASSWORD = process.env.E2E_USER_PASSWORD || 'password';

test.use({ storageState: { cookies: [], origins: [] } });

test.describe('Autenticacion - flujo SPA con sesion web', () => {
    test('rechaza login con credenciales invalidas', async ({ page }) => {
        await page.goto('/login');

        await page.locator('input[type="email"], input[name="email"]').first().fill('noexiste@test.cl');
        await page.locator('input[type="password"]').first().fill('credencialesMalas');
        await page.locator('button[type="submit"]').first().click();

        await page.waitForTimeout(2_000);
        expect(page.url()).toContain('/login');
    });

    test('permite login con credenciales validas y redirige fuera de login', async ({ page }) => {
        const allRequests = [];
        const allResponses = [];
        const consoleMessages = [];

        page.on('request', (req) => {
            if (req.url().includes('localhost:8000') || req.url().includes('localhost:5173/api')) {
                allRequests.push(`${req.method()} ${req.url()}`);
            }
        });

        page.on('response', async (res) => {
            const url = res.url();
            if (url.includes('/api/') || url.includes('/sanctum/')) {
                let body = '';
                try { body = (await res.text()).slice(0, 300); } catch {}
                allResponses.push(`[${res.status()}] ${url} → ${body}`);
            }
        });

        page.on('console', (msg) => { consoleMessages.push(`[${msg.type()}] ${msg.text()}`); });
        page.on('pageerror', (err) => { consoleMessages.push(`[pageerror] ${err.message}`); });

        await page.goto('/login');
        await page.locator('input[type="email"], input[name="email"]').first()
            .waitFor({ state: 'visible', timeout: 5_000 });
        await page.locator('input[type="email"], input[name="email"]').first().fill(USER_EMAIL);
        await page.locator('input[type="password"]').first().fill(USER_PASSWORD);
        await page.locator('button[type="submit"]').first().click();

        try {
            await page.waitForURL((url) => !url.pathname.includes('/login'), { timeout: 20_000 });
        } catch {
            throw new Error(
                `\n\n❌ Login no redirigió fuera de /login en 20s.\n\n` +
                `📡 Requests:\n${allRequests.map(r => '  ' + r).join('\n') || '  (ninguno)'}\n\n` +
                `📨 Responses:\n${allResponses.map(r => '  ' + r).join('\n') || '  (ninguno)'}\n\n` +
                `🖥️ Consola:\n${consoleMessages.filter(m => !m.includes('[log]')).map(m => '  ' + m).join('\n') || '  (ninguna)'}\n\n` +
                `🔍 URL actual: ${page.url()}\n`
            );
        }

        await expect(page).not.toHaveURL(/.*\/login/);
    });

    test('rechaza login con email mal formado (validacion frontend)', async ({ page }) => {
        await page.goto('/login');
        await page.locator('input[type="email"], input[name="email"]').first().fill('no-es-email');
        await page.locator('input[type="password"]').first().fill('algo');
        await page.locator('button[type="submit"]').first().click();

        await page.waitForTimeout(1_500);
        expect(page.url()).toContain('/login');
    });

    test('login con email en mayusculas funciona (case-insensitive)', async ({ page }) => {
        await page.goto('/login');
        await page.locator('input[type="email"], input[name="email"]').first()
            .waitFor({ state: 'visible', timeout: 5_000 });
        await page.locator('input[type="email"], input[name="email"]').first().fill(USER_EMAIL.toUpperCase());
        await page.locator('input[type="password"]').first().fill(USER_PASSWORD);
        await page.locator('button[type="submit"]').first().click();

        await page.waitForURL((url) => !url.pathname.includes('/login'), { timeout: 20_000 });
        await expect(page).not.toHaveURL(/.*\/login/);
    });
});
