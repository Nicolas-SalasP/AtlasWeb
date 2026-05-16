import { test, expect } from '@playwright/test';
import { registerUser, makeTestUser, BACKEND_URL, FRONTEND_URL } from '../helpers/auth';

test.describe('Logout - flujo SPA con sesión web', () => {
  test('usuario autenticado puede hacer logout y respuesta es 200', async ({ page, request }) => {
    const user = makeTestUser('-logout-1');
    await registerUser(request, user);

    await page.goto(`${FRONTEND_URL}/login`);
    await page.getByLabel(/email|correo/i).fill(user.email);
    await page.getByLabel(/password|contraseña/i).first().fill(user.password);
    await page.getByRole('button', { name: /iniciar sesi|login|entrar/i }).click();
    await expect(page).not.toHaveURL(/\/login/, { timeout: 10_000 });

    const logoutResponse = await page.evaluate(async (backendUrl) => {
      const xsrf = document.cookie
        .split(';')
        .map((c) => c.trim())
        .find((c) => c.startsWith('XSRF-TOKEN='))
        ?.split('=')[1];

      const r = await fetch(`${backendUrl}/api/logout`, {
        method: 'POST',
        credentials: 'include',
        headers: {
          Accept: 'application/json',
          'X-XSRF-TOKEN': xsrf ? decodeURIComponent(xsrf) : '',
        },
      });
      return { status: r.status, body: await r.text() };
    }, BACKEND_URL);

    expect(logoutResponse.status).toBe(200);
    expect(logoutResponse.body).toContain('message');
  });

  test('logout registra "Cierre de Sesión" en access_logs', async ({ page, request }) => {
    const user = makeTestUser('-logout-log');
    await registerUser(request, user);

    await page.goto(`${FRONTEND_URL}/login`);
    await page.getByLabel(/email|correo/i).fill(user.email);
    await page.getByLabel(/password|contraseña/i).first().fill(user.password);
    await page.getByRole('button', { name: /iniciar sesi|login|entrar/i }).click();
    await expect(page).not.toHaveURL(/\/login/, { timeout: 10_000 });

    const logsBefore = await page.evaluate(async (backendUrl) => {
      const r = await fetch(`${backendUrl}/api/profile/security-logs`, { credentials: 'include' });
      return (await r.json()) as Array<{ action: string }>;
    }, BACKEND_URL);

    await page.evaluate(async (backendUrl) => {
      const xsrf = document.cookie
        .split(';')
        .map((c) => c.trim())
        .find((c) => c.startsWith('XSRF-TOKEN='))
        ?.split('=')[1];

      await fetch(`${backendUrl}/api/logout`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'X-XSRF-TOKEN': xsrf ? decodeURIComponent(xsrf) : '' },
      });
    }, BACKEND_URL);

    await page.goto(`${FRONTEND_URL}/login`);
    await page.getByLabel(/email|correo/i).fill(user.email);
    await page.getByLabel(/password|contraseña/i).first().fill(user.password);
    await page.getByRole('button', { name: /iniciar sesi|login|entrar/i }).click();
    await expect(page).not.toHaveURL(/\/login/, { timeout: 10_000 });

    const logsAfter = await page.evaluate(async (backendUrl) => {
      const r = await fetch(`${backendUrl}/api/profile/security-logs`, { credentials: 'include' });
      return (await r.json()) as Array<{ action: string }>;
    }, BACKEND_URL);

    const actionsAfter = logsAfter.map((log) => log.action);
    expect(actionsAfter).toContain('Cierre de Sesión');
    expect(logsAfter.length).toBeGreaterThan(logsBefore.length);
  });

  test('sesión no persiste tras logout: getMe retorna 401', async ({ page, request }) => {
    const user = makeTestUser('-logout-session');
    await registerUser(request, user);

    await page.goto(`${FRONTEND_URL}/login`);
    await page.getByLabel(/email|correo/i).fill(user.email);
    await page.getByLabel(/password|contraseña/i).first().fill(user.password);
    await page.getByRole('button', { name: /iniciar sesi|login|entrar/i }).click();
    await expect(page).not.toHaveURL(/\/login/, { timeout: 10_000 });

    await page.evaluate(async (backendUrl) => {
      const xsrf = document.cookie
        .split(';')
        .map((c) => c.trim())
        .find((c) => c.startsWith('XSRF-TOKEN='))
        ?.split('=')[1];

      await fetch(`${backendUrl}/api/logout`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'X-XSRF-TOKEN': xsrf ? decodeURIComponent(xsrf) : '' },
      });
    }, BACKEND_URL);

    const meStatus = await page.evaluate(async (backendUrl) => {
      const r = await fetch(`${backendUrl}/api/me`, { credentials: 'include' });
      return r.status;
    }, BACKEND_URL);

    expect([401, 403]).toContain(meStatus);
  });
});
