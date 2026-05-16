# Tests E2E - Playwright

Tests end-to-end con Playwright para flujos de Tenri Spa que requieren
sesión web real (login/logout SPA con cookies + Sanctum).

Viven dentro de `frontend/` para reutilizar el `node_modules` existente
y porque testean flows que naturalmente pertenecen al frontend (UI +
backend integrados).

## Por qué Playwright y no PHPUnit

`AuthService::attemptSpaLogin` y `AuthService::logout` invocan
`$request->session()`. En producción funciona bien (frontend manda
cookies, Sanctum activa StartSession middleware). En tests `postJson()`
de PHPUnit simula request stateless sin cookies → el middleware de
sesión nunca corre → explota con `Session store not set on request`.

Playwright simula un navegador real con cookies persistentes, así que
el flujo SPA completo (CSRF token, session cookie, login, logout)
funciona como en producción.

## Setup inicial (primera vez)

Desde `frontend/`:

```cmd
cd frontend
npm install
npm run test:e2e:install
```

`npm install` instala Playwright como devDependency (junto a Vite y
React). `npm run test:e2e:install` descarga el binario de Chromium
(~150MB, se guarda fuera de `node_modules` en
`%LOCALAPPDATA%\ms-playwright\`).

## Pre-requisitos

Los tests asumen:
1. Backend con MySQL local con la BD configurada en `backend/.env`.
2. PHP en el PATH para que `php artisan serve` funcione.
3. Node.js y npm.

El `playwright.config.ts` arranca AMBOS servidores automáticamente vía
`webServer`, así que no es necesario tenerlos corriendo manualmente.

**Importante**: los tests E2E corren contra la BD real de desarrollo,
no contra un schema aislado. Los usuarios creados quedan en la BD con
prefijo `e2e-` para identificarlos. Para limpiarlos cuando se acumulan:

```sql
DELETE FROM users WHERE email LIKE 'e2e-%@test.cl';
DELETE FROM access_logs WHERE user_id NOT IN (SELECT id FROM users);
```

## Cómo correr

Desde `frontend/`:

```cmd
:: Todos los tests con browser headless
npm run test:e2e

:: UI interactiva (recomendado para desarrollo)
npm run test:e2e:ui

:: Ver el browser mientras corre
npm run test:e2e:headed

:: Modo debug paso a paso
npm run test:e2e:debug

:: Ver el último reporte HTML
npm run test:e2e:report
```

## Estructura

```
frontend/
├── package.json              ← agrega @playwright/test + scripts test:e2e:*
├── src/                      ← código React (intacto)
├── node_modules/             ← compartido con Vite/React/etc
└── tests-e2e/
    ├── playwright.config.ts  ← arranca backend (../../backend) y frontend (..)
    ├── tsconfig.json
    ├── helpers/
    │   └── auth.ts           ← makeTestUser, registerUser, loginViaUI
    └── auth/
        ├── login.spec.ts     ← 6 tests del flujo de login
        └── logout.spec.ts    ← 3 tests del flujo de logout
```

## Selectores

Los tests usan selectores semánticos por accesibilidad:
- `getByLabel(/email|correo/i)` para inputs
- `getByRole('button', { name: /iniciar sesi/i })` para botones

Esto los hace resilientes a cambios visuales del UI. Si rompen es
porque cambió un label o aria-label, no un className.

## Limitaciones conocidas

- Cada test crea usuarios únicos con `Date.now()` para evitar colisiones.
- Los datos persisten en la BD entre runs (no hay RefreshDatabase).
- En CI hace falta una BD de testing dedicada y `--workers=1`.
