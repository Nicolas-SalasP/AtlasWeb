import js from '@eslint/js'
import globals from 'globals'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'
import { defineConfig, globalIgnores } from 'eslint/config'

export default defineConfig([
  // e2e y playwright son Node.js — no aplican reglas de browser
  globalIgnores(['dist', 'e2e/**', 'playwright.config.js']),

  {
    files: ['**/*.{js,jsx}'],
    extends: [
      js.configs.recommended,
      reactHooks.configs.flat.recommended,
      reactRefresh.configs.vite,
    ],
    languageOptions: {
      ecmaVersion: 2020,
      globals: globals.browser,
      parserOptions: {
        ecmaVersion: 'latest',
        ecmaFeatures: { jsx: true },
        sourceType: 'module',
      },
    },
    rules: {
      // Variables sin usar: ignorar mayúsculas/guión bajo Y nombres estándar de catch
      'no-unused-vars': ['error', {
        varsIgnorePattern: '^[A-Z_]',
        argsIgnorePattern: '^_',
        // error, err, e son nombres de catch válidos aunque no se usen
        caughtErrorsIgnorePattern: '^(_|error|err|e)$',
      }],
      // Hooks: solo advertencias (son optimizaciones, no bugs)
      'react-hooks/exhaustive-deps': 'warn',
      // Contextos exportan hooks y componentes juntos — solo warning
      'react-refresh/only-export-components': ['warn', { allowConstantExport: true }],
      // Boolean() redundante — solo warning, no bloquea build
      'no-extra-boolean-cast': 'warn',
    },
  },
])
