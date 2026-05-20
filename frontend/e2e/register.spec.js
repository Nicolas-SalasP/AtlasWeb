import { test, expect } from '@playwright/test';

function computeDv(body) {
    let sum = 0;
    let multiplier = 2;
    for (let i = body.length - 1; i >= 0; i--) {
        sum += parseInt(body[i], 10) * multiplier;
        multiplier = multiplier === 7 ? 2 : multiplier + 1;
    }
    const remainder = 11 - (sum % 11);
    if (remainder === 11) return '0';
    if (remainder === 10) return 'K';
    return String(remainder);
}

function generateRut() {
    const body = String(Math.floor(Math.random() * (25_000_000 - 10_000_000)) + 10_000_000);
    const dv = computeDv(body);
    return `${body.replace(/\B(?=(\d{3})+(?!\d))/g, '.')}-${dv}`;
}

function makeUser() {
    const nonce = `${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
    return {
        name: `Test E2E ${nonce}`,
        email: `e2e-reg-${nonce}@test.cl`,
        rut: generateRut(),
        password: 'password123',
    };
}

test.describe('Registro - flujo completo', () => {
    test('permite registrar un usuario nuevo y redirige', async ({ page }) => {
        const user = makeUser();

        await page.goto('/registro');
        await page.locator('input[name="name"]').fill(user.name);
        await page.locator('input[name="rut"]').fill(user.rut);
        await page.locator('input[name="email"], input[type="email"]').first().fill(user.email);
        await page.locator('input[type="password"]').first().fill(user.password);
        await page.locator('input[type="password"]').nth(1).fill(user.password);

        const checkbox = page.locator('input[type="checkbox"]').first();
        if (await checkbox.isVisible({ timeout: 2_000 }).catch(() => false)) {
            await checkbox.check();
        }

        await page.locator('button[type="submit"]').first().click();

        await expect(page).not.toHaveURL(/.*\/registro/, { timeout: 20_000 });
    });

    test('rechaza registro con email ya existente', async ({ page }) => {
        await page.goto('/registro');
        await page.locator('input[name="name"]').fill('Usuario Existente');
        await page.locator('input[name="rut"]').fill(generateRut());
        await page.locator('input[name="email"], input[type="email"]').first().fill('nicolas@tenri.cl');
        await page.locator('input[type="password"]').first().fill('password123');
        await page.locator('input[type="password"]').nth(1).fill('password123');

        const checkbox = page.locator('input[type="checkbox"]').first();
        if (await checkbox.isVisible({ timeout: 2_000 }).catch(() => false)) {
            await checkbox.check();
        }

        await page.locator('button[type="submit"]').first().click();

        await page.waitForTimeout(2_000);
        await expect(page).toHaveURL(/.*\/registro/);
    });

    test('rechaza registro con password demasiado corta', async ({ page }) => {
        const user = makeUser();

        await page.goto('/registro');
        await page.locator('input[name="name"]').fill(user.name);
        await page.locator('input[name="rut"]').fill(user.rut);
        await page.locator('input[name="email"], input[type="email"]').first().fill(user.email);
        await page.locator('input[type="password"]').first().fill('corta');
        await page.locator('input[type="password"]').nth(1).fill('corta');

        const checkbox = page.locator('input[type="checkbox"]').first();
        if (await checkbox.isVisible({ timeout: 2_000 }).catch(() => false)) {
            await checkbox.check();
        }

        await page.locator('button[type="submit"]').first().click();

        await page.waitForTimeout(2_000);
        await expect(page).toHaveURL(/.*\/registro/);
    });

    test('rechaza registro con passwords que no coinciden', async ({ page }) => {
        const user = makeUser();

        await page.goto('/registro');
        await page.locator('input[name="name"]').fill(user.name);
        await page.locator('input[name="rut"]').fill(user.rut);
        await page.locator('input[name="email"], input[type="email"]').first().fill(user.email);
        await page.locator('input[type="password"]').first().fill('password123');
        await page.locator('input[type="password"]').nth(1).fill('diferente456');

        const checkbox = page.locator('input[type="checkbox"]').first();
        if (await checkbox.isVisible({ timeout: 2_000 }).catch(() => false)) {
            await checkbox.check();
        }

        await page.locator('button[type="submit"]').first().click();

        await page.waitForTimeout(2_000);
        await expect(page).toHaveURL(/.*\/registro/);
    });
});
