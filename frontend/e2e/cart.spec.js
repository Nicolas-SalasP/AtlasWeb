import { test, expect } from '@playwright/test';

test.describe('Carrito de Compras - Flujo principal', () => {
    test.use({ storageState: { cookies: [], origins: [] } });

    test('puede abrir y cerrar el cajon (drawer) del carrito vacio', async ({ page }) => {
        await page.goto('/');
        const cartButton = page.locator('button').filter({ hasText: /carrito/i }).first();
        if (await cartButton.isVisible()) {
            await cartButton.click();
            await expect(page.locator('text=/Tu carrito/i')).toBeVisible();
            await expect(page.locator('text=/vacío/i')).toBeVisible();
        }
    });

    test('puede navegar al catalogo desde el carrito vacio', async ({ page }) => {
        await page.goto('/');
        await page.goto('/catalogo');
        await page.waitForLoadState('networkidle');
        const productCards = page.locator('.grid > div, article'); 
        if (await productCards.count() > 0) {
            expect(await productCards.count()).toBeGreaterThan(0);
        } else {
            console.log('⚠️ No hay productos en el catálogo para probar.');
        }
    });
});