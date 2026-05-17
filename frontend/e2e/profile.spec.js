import { test, expect } from '@playwright/test';

const USER_EMAIL = process.env.E2E_USER_EMAIL || 'nicolas@tenri.cl';
const USER_PASSWORD = process.env.E2E_USER_PASSWORD || 'password';

async function login(page) {
    await page.goto('/login');
    const emailInput = page.locator('input[type="email"], input[name="email"]').first();
    await emailInput.waitFor({ state: 'visible', timeout: 5_000 });
    await emailInput.fill(USER_EMAIL);

    await page.locator('input[type="password"]').first().fill(USER_PASSWORD);
    await page.locator('button[type="submit"]').first().click();

    await expect(page).not.toHaveURL(/.*\/login/, { timeout: 15_000 });
}

test.describe('Perfil de usuario tras login', () => {
    test.beforeEach(async ({ page }) => {
        await login(page);
    });

    test('puede acceder a /perfil y muestra datos del usuario', async ({ page }) => {
        await page.goto('/perfil');
        await page.waitForLoadState('networkidle');

        const body = await page.locator('body').textContent();
        expect(body).toContain(USER_EMAIL.toLowerCase());
    });

    test('puede hacer logout y la sesion no persiste', async ({ page, request }) => {
        await page.goto('/perfil');
        await page.waitForLoadState('networkidle');

        const backendUrl = process.env.E2E_BACKEND_URL || 'http://localhost:8001';

        await page.evaluate(async (url) => {
            const xsrf = document.cookie
                .split(';')
                .map((c) => c.trim())
                .find((c) => c.startsWith('XSRF-TOKEN='))
                ?.split('=')[1];

            await fetch(`${url}/api/logout`, {
                method: 'POST',
                credentials: 'include',
                headers: {
                    Accept: 'application/json',
                    'X-XSRF-TOKEN': xsrf ? decodeURIComponent(xsrf) : '',
                },
            });
        }, backendUrl);

        const meStatus = await page.evaluate(async (url) => {
            const r = await fetch(`${url}/api/me`, { credentials: 'include' });
            return r.status;
        }, backendUrl);

        expect([401, 403]).toContain(meStatus);
    });
});
