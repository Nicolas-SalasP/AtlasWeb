<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\TicketController;
use App\Http\Controllers\UserController;
use App\Http\Controllers\OrderController;
use App\Http\Controllers\ProductController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\SettingController;
use App\Http\Controllers\PaymentController;
use App\Http\Controllers\ProfileController;

/*
|--------------------------------------------------------------------------
| API Routes - Atlas Digital Tech
|--------------------------------------------------------------------------
*/

// Rutas Públicas
Route::post('/login', [AuthController::class, 'login']);
Route::get('/products', [ProductController::class, 'indexPublic']);
Route::get('/system-status', [SettingController::class, 'publicStatus']);
Route::any('/webpay/return', [PaymentController::class, 'commitWebpay']);
Route::post('/orders', [OrderController::class, 'store']);

// Rutas Protegidas
Route::middleware('auth:sanctum')->group(function () {

    // Auth
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::get('/me', [AuthController::class, 'me']);

    // Tickets (Soporte)
    Route::get('/tickets', [TicketController::class, 'index']);
    Route::post('/tickets', [TicketController::class, 'store']);
    Route::post('/tickets/{id}/reply', [TicketController::class, 'reply']);
    Route::get('/admin/tickets', [TicketController::class, 'indexAll']);
    Route::put('/admin/tickets/{id}/status', [TicketController::class, 'updateStatus']);

    // Administrador de Usuarios
    Route::get('/admin/users', [UserController::class, 'index']);
    Route::get('/admin/users/{id}', [UserController::class, 'show']);
    Route::put('/admin/users/{id}', [UserController::class, 'update']);

    // Ordenes / Pedidos (Admin)
    Route::get('/admin/orders', [OrderController::class, 'index']);

    // Productos (Admin)
    Route::get('/admin/products', [ProductController::class, 'index']);
    Route::post('/admin/products', [ProductController::class, 'store']);
    Route::put('/admin/products/{id}', [ProductController::class, 'update']);
    Route::delete('/admin/products/{id}', [ProductController::class, 'destroy']);
    Route::delete('/admin/product-images/{id}', [ProductController::class, 'destroyImage']);
    Route::post('/admin/product-images/{id}/cover', [ProductController::class, 'setCover']);

    Route::get('/categories', function () {
        return \App\Models\Category::all();
    });

    // Dashboard
    Route::get('/admin/dashboard', [DashboardController::class, 'index']);

    // Config
    Route::get('/admin/settings', [SettingController::class, 'index']);
    Route::post('/admin/settings', [SettingController::class, 'update']);

    // Clientes

    // Ordenes
    Route::post('/orders', [OrderController::class, 'store']);

    // Pagos
    Route::post('/payment/transfer', [PaymentController::class, 'payWithTransfer']);
    Route::post('/payment/webpay', [PaymentController::class, 'initWebpay']);

    Route::prefix('profile')->group(function () {
        Route::get('/', [ProfileController::class, 'show']);
        Route::put('/update', [ProfileController::class, 'update']);
        Route::put('/password', [ProfileController::class, 'changePassword']);
        Route::post('/email/request', [ProfileController::class, 'requestEmailChange']);
        Route::post('/email/verify', [ProfileController::class, 'verifyEmailChange']);
        Route::get('/orders', [ProfileController::class, 'getOrders']);
        Route::get('/subscription', [ProfileController::class, 'getSubscription']);
        Route::get('/tickets-summary', [ProfileController::class, 'getTicketsSummary']);
        Route::get('/security-logs', [ProfileController::class, 'getSecurityLogs']);
    });
});