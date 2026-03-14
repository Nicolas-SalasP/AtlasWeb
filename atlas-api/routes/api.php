<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\TicketController;
use App\Http\Controllers\UserController;
use App\Http\Controllers\OrderController;
use App\Http\Controllers\ProductController;
use App\Http\Controllers\CategoryController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\SettingController;
use App\Http\Controllers\PaymentController;
use App\Http\Controllers\ProfileController;
use App\Http\Controllers\ServiceController;
use App\Http\Controllers\AddressController;

/*
|--------------------------------------------------------------------------
| API Routes - Atlas Digital Tech
|--------------------------------------------------------------------------
*/

// ==============================================================================
// RUTAS PÚBLICAS (No requieren Login)
// ==============================================================================

// Autenticación
Route::post('/register', [AuthController::class, 'register']);
Route::post('/login', [AuthController::class, 'login'])->middleware('throttle:5,1');
Route::post('/forgot-password', [AuthController::class, 'sendResetLink'])->middleware('throttle:3,1');
Route::post('/reset-password', [AuthController::class, 'resetPassword']);

// Catálogo Público
Route::get('/products', [ProductController::class, 'indexPublic']);
Route::get('/services/catalog', [ServiceController::class, 'indexPublic']);

// Categorías
Route::get('/categories', [CategoryController::class, 'index']);

// Sistema & Configuración Pública
Route::get('/system-status', [SettingController::class, 'publicStatus']);

// Checkout & Pagos (Guest & User)
Route::post('/orders', [OrderController::class, 'store']);
Route::any('/webpay/return', [PaymentController::class, 'commitWebpay']);


// ==============================================================================
// RUTAS PROTEGIDAS (Requieren Login - auth:sanctum)
// ==============================================================================
Route::middleware('auth:sanctum')->group(function () {

    // --- USUARIO GENERAL (CLIENTE Y ADMIN) ---
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::get('/user', function (Request $request) {
        return $request->user();
    });
    Route::get('/me', [AuthController::class, 'me']);

    // Perfil de Usuario
    Route::prefix('profile')->group(function () {
        Route::get('/', [ProfileController::class, 'show']);
        Route::put('/update', [ProfileController::class, 'update']);
        Route::put('/password', [ProfileController::class, 'changePassword']);
        Route::post('/email/request', [ProfileController::class, 'requestEmailChange']);
        Route::post('/email/verify', [ProfileController::class, 'verifyEmailChange'])->middleware('throttle:5,1');
        Route::post('/claim-orders/request-otp', [AuthController::class, 'requestOrderClaimOtp'])->middleware('throttle:3,10');
        Route::post('/claim-orders/confirm', [AuthController::class, 'confirmOrderClaim'])->middleware('throttle:5,1');
        
        // Datos del Dashboard Cliente
        Route::get('/subscription', [ProfileController::class, 'getSubscription']);
        Route::get('/tickets-summary', [ProfileController::class, 'getTicketsSummary']);
        Route::get('/security-logs', [ProfileController::class, 'getSecurityLogs']);
    });

    // Gestión de Direcciones (Viene de tu rama DEV)
    Route::get('/addresses', [AddressController::class, 'index']);
    Route::post('/addresses', [AddressController::class, 'store']);
    Route::delete('/addresses/{id}', [AddressController::class, 'destroy']);
    Route::put('/addresses/{id}/default', [AddressController::class, 'setDefault']);

    // Órdenes (Listar y Detalle blindado - Viene de MAIN)
    Route::get('/orders', [OrderController::class, 'index']);
    Route::get('/orders/{id}', [OrderController::class, 'show']);
    Route::put('/orders/{id}', [OrderController::class, 'update']);

    // Tickets (Lado Cliente)
    Route::get('/tickets', [TicketController::class, 'index']);
    Route::get('/tickets/{id}', [TicketController::class, 'show']);
    Route::post('/tickets', [TicketController::class, 'store']);
    Route::post('/tickets/{id}/reply', [TicketController::class, 'reply']);

    // Pagos (Requieren Auth para asociar al usuario)
    Route::post('/payment/transfer', [PaymentController::class, 'payWithTransfer']);
    Route::post('/payment/webpay', [PaymentController::class, 'initWebpay']);


    // ==============================================================================
    // ZONA ADMINISTRADOR (Requieren Login + Rol Admin)
    // ==============================================================================
    Route::prefix('admin')->group(function () {
        // 1. Dashboard
        Route::get('/dashboard', [DashboardController::class, 'index'])->middleware('admin');
        Route::get('/notifications-summary', [DashboardController::class, 'getNotificationsSummary'])->middleware('admin');

        // 2. Configuración Global (Solo permiso: manage_settings)
        Route::middleware(['admin:manage_settings'])->group(function () {
            Route::get('/settings', [SettingController::class, 'index']);
            Route::post('/settings', [SettingController::class, 'update']);
        });

        // 3. Gestión de Usuarios y Clientes (Solo permiso: view_users)
        Route::middleware(['admin:view_users'])->group(function () {
            Route::get('/users', [UserController::class, 'index']);
            Route::get('/users/{id}', [UserController::class, 'show']);
            Route::put('/users/{id}', [UserController::class, 'update']);
        });

        // 4. Gestión de Productos (Solo permiso: manage_products)
        Route::middleware(['admin:manage_products'])->group(function () {
            Route::get('/products', [ProductController::class, 'index']);
            Route::post('/products', [ProductController::class, 'store']);
            Route::put('/products/{id}', [ProductController::class, 'update']);
            Route::delete('/products/{id}', [ProductController::class, 'destroy']);
            Route::delete('/product-images/{id}', [ProductController::class, 'destroyImage']);
            Route::post('/product-images/{id}/cover', [ProductController::class, 'setCover']);
        });

        // 5. Gestión de Servicios (Solo permiso: manage_services)
        Route::middleware(['admin:manage_services'])->group(function () {
            Route::apiResource('/services', ServiceController::class);
        });

        // 6. Gestión de Tickets de Soporte (Solo permiso: view_tickets)
        Route::middleware(['admin:view_tickets'])->group(function () {
            Route::get('/tickets', [TicketController::class, 'indexAll']);
            Route::put('/tickets/{id}/status', [TicketController::class, 'updateStatus']);
        });

        // 7. Gestión de Pedidos y Comprobantes (Solo permiso: view_orders)
        Route::middleware(['admin:view_orders'])->group(function () {
            // Órdenes
            Route::get('/orders', [OrderController::class, 'indexAll']);
            Route::put('/orders/{id}', [OrderController::class, 'update']);

            // Comprobantes Bancarios en Standby
            Route::get('/bank-receipts/unmatched', [\App\Http\Controllers\BankReceiptController::class, 'getUnmatched']);
            Route::post('/bank-receipts/{id}/match', [\App\Http\Controllers\BankReceiptController::class, 'manualMatch']);
        });
    });

});