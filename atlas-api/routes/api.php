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


/*
|--------------------------------------------------------------------------
| API Routes - Atlas Digital Tech
|--------------------------------------------------------------------------
*/

// Rutas Públicas
Route::post('/login', [AuthController::class, 'login']);

// Rutas Protegidas (Requieren Token)
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

    // Clientes
    Route::get('/admin/users', [UserController::class, 'index']);
    Route::get('/admin/users/{id}', [UserController::class, 'show']);
    Route::put('/admin/users/{id}', [UserController::class, 'update']);

    // Ordenes / Pedidos
    Route::get('/admin/orders', [OrderController::class, 'index']);

    // Productos
    Route::get('/admin/products', [ProductController::class, 'index']);
    Route::post('/admin/products', [ProductController::class, 'store']);
    Route::post('/admin/products/{id}', [ProductController::class, 'update']);
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


});