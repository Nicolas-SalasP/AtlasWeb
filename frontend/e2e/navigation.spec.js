import { test, expect } from '@playwright/test';

const CLIENT_EMAIL = process.env.E2E_CLIENT_EMAIL || 'contacto@insuban.cl';
const CLIENT_PASSWORD = process.env.E2E_CLIENT_PASSWORD || 'password';

test.describe('@smoke Navegacion - rutas publicas accesibles sin login', () => {
    test.use({ storageState: { cookies: [], origins: [] } });

    test('home carga sin autenticacion', async ({ page }) => {
        await page.goto('/');
        await page.waitForLoadState('networkidle');
        await expect(page).not.toHaveURL(/.*\/login/);
    });

    test('catalogo carga sin autenticacion', async ({ page }) => {
        await page.goto('/catalogo');
        await page.waitForLoadState('networkidle');
        await expect(page).not.toHaveURL(/.*\/login/);
    });

    test('servicios carga sin autenticacion', async ({ page }) => {
        await page.goto('/servicios');
        await page.waitForLoadState('networkidle');
        await expect(page).not.toHaveURL(/.*\/login/);
    });

    test('contacto carga sin autenticacion', async ({ page }) => {
        await page.goto('/contacto');
        await page.waitForLoadState('networkidle');
        await expect(page).not.toHaveURL(/.*\/login/);
    });

    test('terminos y condiciones carga sin autenticacion', async ({ page }) => {
        await page.goto('/terminos-y-condiciones');
        await page.waitForLoadState('networkidle');
        await expect(page).not.toHaveURL(/.*\/login/);
    });
});

test.describe('Navegacion - rutas protegidas redirigen a login', () => {
    test.use({ storageState: { cookies: [], origins: [] } });

    test('no autenticado en /perfil redirige a /login', async ({ page }) => {
        await page.goto('/perfil');
        await expect(page).toHaveURL(/.*\/login/, { timeout: 8_000 });
    });

    test('no autenticado en /mis-tickets redirige a /login', async ({ page }) => {
        await page.goto('/mis-tickets');
        await expect(page).toHaveURL(/.*\/login/, { timeout: 8_000 });
    });

    test('no autenticado en /admin redirige a /login', async ({ page }) => {
        await page.goto('/admin');
        await expect(page).toHaveURL(/.*\/login/, { timeout: 8_000 });
    });
});

test.describe('Navegacion - cliente sin rol admin no puede acceder a admin', () => {
    test.use({ storageState: { cookies: [], origins: [] } });

    test('cliente autenticado en /admin es redirigido a /perfil', async ({ page }) => {
        await page.goto('/login');
        await page.locator('input[type="email"], input[name="email"]').first()
            .waitFor({ state: 'visible', timeout: 5_000 });
        await page.locator('input[type="email"], input[name="email"]').first().fill(CLIENT_EMAIL);
        await page.locator('input[type="password"]').first().fill(CLIENT_PASSWORD);
        await page.locator('button[type="submit"]').first().click();

        await expect(page).not.toHaveURL(/.*\/login/, { timeout: 20_000 });

        await page.goto('/admin');
        await expect(page).toHaveURL(/.*\/perfil/, { timeout: 8_000 });
    });
});
