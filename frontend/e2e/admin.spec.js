import { test, expect } from '@playwright/test';

test.describe('Panel Admin - control de acceso', () => {
    test('admin puede acceder al panel /admin', async ({ page }) => {
        await page.goto('/admin');
        await page.waitForLoadState('domcontentloaded');
        await expect(page).toHaveURL(/.*\/admin/, { timeout: 8_000 });
    });

    test('admin puede acceder a /admin/usuarios', async ({ page }) => {
        await page.goto('/admin/usuarios');
        await page.waitForLoadState('domcontentloaded');
        await expect(page).toHaveURL(/.*\/admin\/usuarios/, { timeout: 8_000 });
    });

    test('admin puede acceder a /admin/pedidos', async ({ page }) => {
        await page.goto('/admin/pedidos');
        await page.waitForLoadState('domcontentloaded');
        await expect(page).toHaveURL(/.*\/admin\/pedidos/, { timeout: 8_000 });
    });

    test('admin puede acceder a /admin/productos', async ({ page }) => {
        await page.goto('/admin/productos');
        await page.waitForLoadState('domcontentloaded');
        await expect(page).toHaveURL(/.*\/admin\/productos/, { timeout: 8_000 });
    });

    test('admin puede acceder a /admin/tickets', async ({ page }) => {
        await page.goto('/admin/tickets');
        await page.waitForLoadState('domcontentloaded');
        await expect(page).toHaveURL(/.*\/admin\/tickets/, { timeout: 8_000 });
    });
});
