# Setup de tests — Tenri backend

## Por defecto: SQLite in-memory (rápido, recomendado para CI/local)

El archivo `.env.testing` viene configurado con SQLite `:memory:`. Cada test
crea una BD nueva en RAM y la destruye al terminar. **Es 10-50× más rápido
que MySQL** y NO requiere setup de servidor.

Requisitos:
- Extensiones PHP `pdo_sqlite` y `sqlite3` habilitadas (en XAMPP suelen estar
  activadas por defecto; si no, descomentá las líneas correspondientes
  en `D:\xampp\php\php.ini`).

Para correr:
```cmd
cd backend
php artisan test
```

## Alternativa: MySQL

Si querés correr los tests contra una BD MySQL real (útil cuando hay
funcionalidad específica de MySQL como JSON path queries, full text search,
etc.), tenés que:

1. Crear una BD vacía dedicada para tests (NO usés tu BD de dev):
   ```sql
   CREATE DATABASE sistema_contable_laravel_test CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
   ```

2. Editar `.env.testing` y reemplazar:
   ```
   DB_CONNECTION=sqlite
   DB_DATABASE=:memory:
   DB_FOREIGN_KEYS=true
   ```
   Por:
   ```
   DB_CONNECTION=mysql
   DB_HOST=127.0.0.1
   DB_PORT=3306
   DB_DATABASE=sistema_contable_laravel_test
   DB_USERNAME=root
   DB_PASSWORD=
   ```

3. Correr los tests:
   ```cmd
   php artisan test
   ```

Los tests usan `RefreshDatabase` que recrea el schema completo en cada test
mediante `migrate:fresh`. NO va a tocar tu BD de dev.

## Advertencia importante

NUNCA configurés `.env.testing` con la BD de producción ni la de desarrollo.
`RefreshDatabase` borra TODAS las tablas al iniciar cada test.
