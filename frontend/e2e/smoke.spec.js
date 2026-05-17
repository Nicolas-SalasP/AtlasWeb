import { test, expect } from '@playwright/test';

test.describe('@smoke - Sistema vivo', () => {
    test('la app carga la home', async ({ page }) => {
        await page.goto('/');
        await page.waitForLoadState('networkidle');
        const body = await page.locator('body').textContent();
        expect(body).toBeTruthy();
        expect(body.length).toBeGreaterThan(50);
    });

    test('la pagina de login se renderiza correctamente', async ({ page }) => {
        await page.goto('/login');

        const inputEmail = page.locator('input[type="email"], input[name="email"]').first();
        await expect(inputEmail).toBeVisible({ timeout: 5_000 });

        const inputPassword = page.locator('input[type="password"]').first();
        await expect(inputPassword).toBeVisible();

        const botonSubmit = page.locator('button[type="submit"]').first();
        await expect(botonSubmit).toBeVisible();
    });

    test('la pagina de registro se renderiza correctamente', async ({ page }) => {
        await page.goto('/registro');

        const inputEmail = page.locator('input[type="email"], input[name="email"]').first();
        await expect(inputEmail).toBeVisible({ timeout: 5_000 });

        const inputPassword = page.locator('input[type="password"]').first();
        await expect(inputPassword).toBeVisible();
    });
});
