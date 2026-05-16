import { test, expect } from '@playwright/test';
import { registerUser, makeTestUser, getCsrfCookie, BACKEND_URL, FRONTEND_URL } from '../helpers/auth';

test.describe('Login - flujo SPA con sesión web', () => {
  test('inicia sesión con credenciales válidas y persiste la sesión', async ({ page, request }) => {
    const user = makeTestUser('-login-1');
    await registerUser(request, user);

    await page.goto(`${FRONTEND_URL}/login`);
    await page.getByLabel(/email|correo/i).fill(user.email);
    await page.getByLabel(/password|contraseña/i).first().fill(user.password);
    await page.getByRole('button', { name: /iniciar sesi|login|entrar/i }).click();

    await expect(page).not.toHaveURL(/\/login/, { timeout: 10_000 });

    const meResponse = await page.evaluate(async (backendUrl) => {
      const r = await fetch(`${backendUrl}/api/me`, { credentials: 'include' });
      return { status: r.status, body: await r.text() };
    }, BACKEND_URL);

    expect(meResponse.status).toBe(200);
    expect(meResponse.body).toContain(user.email);
  });

  test('login es case-insensitive en email', async ({ page, request }) => {
    const user = makeTestUser('-login-case');
    await registerUser(request, user);

    await page.goto(`${FRONTEND_URL}/login`);
    await page.getByLabel(/email|correo/i).fill(user.email.toUpperCase());
    await page.getByLabel(/password|contraseña/i).first().fill(user.password);
    await page.getByRole('button', { name: /iniciar sesi|login|entrar/i }).click();

    await expect(page).not.toHaveURL(/\/login/, { timeout: 10_000 });
  });

  test('email con espacios al final aún funciona (DTO normaliza)', async ({ page, request }) => {
    const user = makeTestUser('-login-trim');
    await registerUser(request, user);

    await page.goto(`${FRONTEND_URL}/login`);
    await page.getByLabel(/email|correo/i).fill(`  ${user.email}  `);
    await page.getByLabel(/password|contraseña/i).first().fill(user.password);
    await page.getByRole('button', { name: /iniciar sesi|login|entrar/i }).click();

    await expect(page).not.toHaveURL(/\/login/, { timeout: 10_000 });
  });

  test('password no aparece en respuesta de login ni después', async ({ request }) => {
    const user = makeTestUser('-login-leak');
    await registerUser(request, user);

    await getCsrfCookie(request);
    const loginResponse = await request.post(`${BACKEND_URL}/api/login`, {
      headers: { Accept: 'application/json' },
      data: { email: user.email, password: user.password },
    });

    expect(loginResponse.ok()).toBeTruthy();
    const body = (await loginResponse.text()).toLowerCase();
    expect(body).not.toContain(user.password.toLowerCase());
    expect(body).not.toContain('$2y$');
  });

  test('registra "Inicio de Sesión Exitoso" en access_logs tras login exitoso', async ({ page, request }) => {
    const user = makeTestUser('-login-log');
    await registerUser(request, user);

    await page.goto(`${FRONTEND_URL}/login`);
    await page.getByLabel(/email|correo/i).fill(user.email);
    await page.getByLabel(/password|contraseña/i).first().fill(user.password);
    await page.getByRole('button', { name: /iniciar sesi|login|entrar/i }).click();

    await expect(page).not.toHaveURL(/\/login/, { timeout: 10_000 });

    const logsResponse = await page.evaluate(async (backendUrl) => {
      const r = await fetch(`${backendUrl}/api/profile/security-logs`, { credentials: 'include' });
      return await r.json();
    }, BACKEND_URL);

    const actions = (logsResponse as Array<{ action: string }>).map((log) => log.action);
    expect(actions).toContain('Inicio de Sesión Exitoso');
  });

  test('registra "Intento de Login Fallido" en access_logs tras password incorrecta', async ({ page, request }) => {
    const user = makeTestUser('-login-fail');
    await registerUser(request, user);

    await page.goto(`${FRONTEND_URL}/login`);
    await page.getByLabel(/email|correo/i).fill(user.email);
    await page.getByLabel(/password|contraseña/i).first().fill('wrong-password');
    await page.getByRole('button', { name: /iniciar sesi|login|entrar/i }).click();

    await page.waitForTimeout(1_000);

    await page.getByLabel(/password|contraseña/i).first().fill(user.password);
    await page.getByRole('button', { name: /iniciar sesi|login|entrar/i }).click();
    await expect(page).not.toHaveURL(/\/login/, { timeout: 10_000 });

    const logsResponse = await page.evaluate(async (backendUrl) => {
      const r = await fetch(`${backendUrl}/api/profile/security-logs`, { credentials: 'include' });
      return await r.json();
    }, BACKEND_URL);

    const actions = (logsResponse as Array<{ action: string }>).map((log) => log.action);
    expect(actions).toContain('Intento de Login Fallido');
  });
});
