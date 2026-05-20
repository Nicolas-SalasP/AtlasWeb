import { test, expect } from '@playwright/test';

const USER_EMAIL = process.env.E2E_USER_EMAIL || 'nicolas@tenri.cl';

test.describe('Perfil de usuario tras login', () => {
    test.use({ storageState: 'e2e/.auth/admin.json' });

    test('puede acceder a /perfil y muestra datos del usuario', async ({ page }) => {
        await page.goto('/perfil');
        await page.waitForURL(/.*\/perfil/, { timeout: 10_000 });
        await page.waitForLoadState('networkidle');

        const body = await page.locator('body').textContent();
        expect(body).toContain(USER_EMAIL.toLowerCase());
    });

    test('puede hacer logout y la sesion no persiste', async ({ page }) => {
        await page.goto('/perfil');
        await page.waitForURL(/.*\/perfil/, { timeout: 10_000 });
        await page.waitForLoadState('networkidle');

        const logoutBtn = page.getByRole('button', { name: /cerrar sesi|logout|salir/i });

        if (await logoutBtn.isVisible({ timeout: 3_000 }).catch(() => false)) {
            await logoutBtn.click();
            await page.waitForTimeout(500);
        } else {
            await page.evaluate(async () => {
                const xsrf = document.cookie
                    .split(';')
                    .map((c) => c.trim())
                    .find((c) => c.startsWith('XSRF-TOKEN='))
                    ?.split('=')[1];

                await fetch('/api/logout', {
                    method: 'POST',
                    credentials: 'include',
                    headers: {
                        Accept: 'application/json',
                        'X-XSRF-TOKEN': xsrf ? decodeURIComponent(xsrf) : '',
                    },
                });
            });
            await page.waitForTimeout(500);
        }

        await page.goto('/perfil');
        await expect(page).toHaveURL(/.*\/login/, { timeout: 10_000 });
    });
});
