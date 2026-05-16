import { Page, APIRequestContext, expect } from '@playwright/test';

export const BACKEND_URL = process.env.BACKEND_URL ?? 'http://127.0.0.1:8001';
export const FRONTEND_URL = process.env.FRONTEND_URL ?? 'http://localhost:5173/';

export interface TestUser {
  name: string;
  email: string;
  rut: string;
  password: string;
}

function computeDv(body: string): string {
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

function generateUniqueRut(): string {
  const min = 10_000_000;
  const max = 25_000_000;
  const body = String(Math.floor(Math.random() * (max - min)) + min);
  const dv = computeDv(body);
  const formatted = body.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
  return `${formatted}-${dv}`;
}

export function makeTestUser(label = ''): TestUser {
  const nonce = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}${label}`;
  return {
    name: `Test User ${nonce}`,
    email: `e2e-${nonce}@test.cl`,
    rut: generateUniqueRut(),
    password: 'password123',
  };
}

export async function registerUser(request: APIRequestContext, user: TestUser): Promise<void> {
  const response = await request.post(`${BACKEND_URL}/api/register`, {
    headers: { Accept: 'application/json' },
    data: {
      name: user.name,
      email: user.email,
      rut: user.rut,
      password: user.password,
      password_confirmation: user.password,
      accept_terms: true,
    },
  });

  expect(
    response.ok(),
    `Register failed for ${user.email} (rut: ${user.rut}): ${await response.text()}`
  ).toBeTruthy();
}

export async function loginViaUI(page: Page, email: string, password: string): Promise<void> {
  await page.goto(`${FRONTEND_URL}/login`);
  await page.getByLabel(/email|correo/i).fill(email);
  await page.getByLabel(/password|contraseña/i).first().fill(password);
  await page.getByRole('button', { name: /iniciar sesi|login|entrar/i }).click();
}

export async function logoutViaUI(page: Page): Promise<void> {
  const logoutBtn = page.getByRole('button', { name: /cerrar sesi|logout/i });
  if (await logoutBtn.isVisible({ timeout: 2_000 }).catch(() => false)) {
    await logoutBtn.click();
  } else {
    await page.goto(FRONTEND_URL);
    await page.evaluate(async (backendUrl) => {
      await fetch(`${backendUrl}/api/logout`, { method: 'POST', credentials: 'include' });
    }, BACKEND_URL);
  }
}

export async function getCsrfCookie(request: APIRequestContext): Promise<void> {
  await request.get(`${BACKEND_URL}/sanctum/csrf-cookie`);
}
