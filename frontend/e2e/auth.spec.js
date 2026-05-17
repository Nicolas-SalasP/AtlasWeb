import { test, expect } from '@playwright/test';

const USER_EMAIL = process.env.E2E_USER_EMAIL || 'nicolas@tenri.cl';
const USER_PASSWORD = process.env.E2E_USER_PASSWORD || 'password';
const BACKEND_URL = process.env.E2E_BACKEND_URL || 'http://localhost:8001';

test.describe('Autenticacion - flujo SPA con sesion web', () => {
    test('rechaza login con credenciales invalidas', async ({ page }) => {
        await page.goto('/login');

        await page.locator('input[type="email"], input[name="email"]').first().fill('noexiste@test.cl');
        await page.locator('input[type="password"]').first().fill('credencialesMalas');
        await page.locator('button[type="submit"]').first().click();

        await page.waitForTimeout(2_000);
        const url = page.url();
        expect(url).toContain('/login');
    });

    test('permite login con credenciales validas y redirige fuera de login', async ({ page }) => {
        const apiCalls = [];
        page.on('response', async (response) => {
            if (response.url().includes('/api/login') || response.url().includes('/sanctum/csrf-cookie')) {
                let body = '';
                try { body = await response.text(); } catch (e) { body = '(no body)'; }
                apiCalls.push({
                    url: response.url(),
                    status: response.status(),
                    body: body.slice(0, 300),
                });
            }
        });

        await page.goto('/login');

        await page.locator('input[type="email"], input[name="email"]').first().fill(USER_EMAIL);
        await page.locator('input[type="password"]').first().fill(USER_PASSWORD);
        await page.locator('button[type="submit"]').first().click();

        try {
            await page.waitForURL((url) => !url.pathname.includes('/login'), { timeout: 15_000 });
        } catch (err) {
            const diagnostico = apiCalls.length === 0
                ? `\n\nDIAGNOSTICO: el frontend NO hizo ninguna llamada a ${BACKEND_URL}/api/login.\n` +
                  `Probables causas:\n` +
                  `  1. El frontend pega a otro puerto (revisa axiosConfig.js / .env del frontend).\n` +
                  `  2. El boton 'Iniciar sesion' no dispara el submit (revisa el handler en Login.jsx).\n`
                : `\n\nDIAGNOSTICO - calls API capturadas:\n` +
                  apiCalls.map(c => `  [${c.status}] ${c.url}\n    Body: ${c.body}`).join('\n') +
                  `\n\nInterpretacion:\n` +
                  `  - status 401 -> credenciales incorrectas (revisa seeder y BD).\n` +
                  `  - status 419 -> CSRF mismatch (revisa SANCTUM_STATEFUL_DOMAINS en backend/.env).\n` +
                  `  - status 422 -> validacion fallo (revisa el body).\n` +
                  `  - status 500 -> error backend (revisa storage/logs/laravel.log).\n` +
                  `  - status 200 pero sigue en /login -> el frontend no redirige (revisa AuthContext.jsx login()).\n`;

            throw new Error(`Login no redirigio fuera de /login en 15s.${diagnostico}`);
        }

        await expect(page).not.toHaveURL(/.*\/login/);
    });

    test('rechaza login con email mal formado (validacion frontend)', async ({ page }) => {
        await page.goto('/login');

        await page.locator('input[type="email"], input[name="email"]').first().fill('no-es-email');
        await page.locator('input[type="password"]').first().fill('algo');
        await page.locator('button[type="submit"]').first().click();

        await page.waitForTimeout(1_500);
        const url = page.url();
        expect(url).toContain('/login');
    });

    test('login con email en mayusculas funciona (case-insensitive)', async ({ page }) => {
        await page.goto('/login');

        await page.locator('input[type="email"], input[name="email"]').first().fill(USER_EMAIL.toUpperCase());
        await page.locator('input[type="password"]').first().fill(USER_PASSWORD);
        await page.locator('button[type="submit"]').first().click();

        await page.waitForURL((url) => !url.pathname.includes('/login'), { timeout: 15_000 });
        await expect(page).not.toHaveURL(/.*\/login/);
    });
});
