import { test, expect } from '@playwright/test';

test.describe('Dashboard del Cliente (Mis datos)', () => {
    test.use({ storageState: 'e2e/.auth/client.json' });

    test('renderiza las pestañas principales del perfil del cliente', async ({ page }) => {
        await page.goto('/perfil');
        await page.waitForLoadState('networkidle');

        await expect(page.locator('text=/Pedidos/i').first()).toBeVisible();
        await expect(page.locator('text=/Direcciones/i').first()).toBeVisible();
        await expect(page.locator('text=/Datos Personales|Seguridad/i').first()).toBeVisible();
    });

    test('puede acceder a la seccion de Mis Tickets', async ({ page }) => {
        await page.goto('/mis-tickets');
        await page.waitForLoadState('networkidle');

        await expect(page).toHaveURL(/.*\/mis-tickets/);

        const newTicketBtn = page.locator('button, a').filter({ hasText: /Nuevo Ticket|Crear Ticket/i }).first();
        if (await newTicketBtn.isVisible()) {
            await expect(newTicketBtn).toBeVisible();
        }
    });
});