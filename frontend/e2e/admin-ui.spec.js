import { test, expect } from '@playwright/test';

test.describe('Panel Admin - Interfaz y Componentes', () => {
    test.use({ storageState: 'e2e/.auth/admin.json' });

    test('la vista de pedidos carga una tabla de datos', async ({ page }) => {
        await page.goto('/admin/pedidos');
        await page.waitForLoadState('networkidle');

        await expect(page.locator('h1, h2').filter({ hasText: /Centro de Operaciones/i })).toBeVisible();

        const tableElement = page.locator('table');
        const listElement = page.locator('ul');
        
        expect(await tableElement.isVisible() || await listElement.isVisible()).toBeTruthy();
    });

    test('la vista de productos muestra boton para crear nuevo', async ({ page }) => {
        await page.goto('/admin/productos');
        await page.waitForLoadState('networkidle');

        const createBtn = page.locator('button, a').filter({ hasText: /Crear|Nuevo|Añadir/i }).first();
        await expect(createBtn).toBeVisible();
    });

    test('la vista de configuracion del sistema carga sin crashear', async ({ page }) => {
        await page.goto('/admin/configuracion');
        await page.waitForLoadState('domcontentloaded');
        
        await expect(page).not.toHaveURL(/.*\/login/);
        await expect(page).not.toHaveURL('http://localhost:5173/');
        
        await expect(page.locator('text=/Configuración del Sistema/i').first()).toBeVisible();
    });
});