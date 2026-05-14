<?php

use App\Domain\User\Models\User;
use App\Http\Controllers\Api\Admin\AdminOrderController;
use App\Http\Controllers\Api\Admin\AdminProductController;
use App\Http\Controllers\Api\Admin\AdminUserController;
use App\Http\Controllers\Api\AddressController;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\OrderController;
use App\Http\Controllers\Api\ProfileController;
use App\Http\Controllers\Api\PublicCategoryController;
use App\Http\Controllers\Api\PublicProductController;
use App\Http\Controllers\BankReceiptController;
use App\Http\Controllers\BillingProfileController;
use App\Http\Controllers\ContactController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\PaymentController;
use App\Http\Controllers\ServiceController;
use App\Http\Controllers\SettingController;
use App\Http\Controllers\TicketController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Route;

Route::post('/register', [AuthController::class, 'register']);
Route::post('/login', [AuthController::class, 'login'])->middleware('throttle:5,1');
Route::post('/forgot-password', [AuthController::class, 'sendResetLink'])->middleware('throttle:3,1');
Route::post('/reset-password', [AuthController::class, 'resetPassword']);

Route::get('/products', [PublicProductController::class, 'index']);
Route::get('/products/{id}', [PublicProductController::class, 'show'])->whereNumber('id');
Route::get('/services/catalog', [ServiceController::class, 'indexPublic']);

Route::get('/categories', [PublicCategoryController::class, 'index']);

Route::get('/system-status', [SettingController::class, 'publicStatus']);

Route::post('/orders', [OrderController::class, 'store']);
Route::any('/webpay/return', [PaymentController::class, 'commitWebpay']);

Route::post('/contacto', [ContactController::class, 'submit']);

Route::middleware(['erp.api.key'])->post('/internal/erp/validate-login', function (Request $request) {
    $user = User::where('email', $request->email)->first();
    if (!$user || !Hash::check($request->password, $user->password)) {
        return response()->json(['success' => false, 'message' => 'Credenciales inválidas'], 401);
    }

    return response()->json([
        'success' => true,
        'user'    => [
            'atlas_id'  => $user->id,
            'name'      => $user->name,
            'email'     => $user->email,
            'rut'       => $user->rut ?? null,
            'is_active' => true,
        ],
    ]);
});

Route::middleware('auth:sanctum')->group(function () {
    Route::post('/logout', [AuthController::class, 'logout']);

    Route::get('/user', function (Request $request) {
        return $request->user();
    });
    Route::get('/me', [AuthController::class, 'me']);

    Route::prefix('profile')->group(function () {
        Route::get('/', [ProfileController::class, 'show']);
        Route::put('/update', [ProfileController::class, 'update']);
        Route::put('/password', [ProfileController::class, 'changePassword']);
        Route::post('/email/request', [ProfileController::class, 'requestEmailChange']);
        Route::post('/email/verify', [ProfileController::class, 'verifyEmailChange'])->middleware('throttle:5,1');
        Route::post('/claim-orders/request-otp', [AuthController::class, 'requestOrderClaimOtp'])->middleware('throttle:3,10');
        Route::post('/claim-orders/confirm', [AuthController::class, 'confirmOrderClaim'])->middleware('throttle:5,1');

        Route::get('/subscription', [ProfileController::class, 'getSubscription']);
        Route::get('/tickets-summary', [ProfileController::class, 'getTicketsSummary']);
        Route::get('/security-logs', [ProfileController::class, 'getSecurityLogs']);
    });

    Route::get('/addresses', [AddressController::class, 'index']);
    Route::post('/addresses', [AddressController::class, 'store']);
    Route::delete('/addresses/{id}', [AddressController::class, 'destroy'])->whereNumber('id');
    Route::put('/addresses/{id}/default', [AddressController::class, 'setDefault'])->whereNumber('id');

    Route::get('/orders', [OrderController::class, 'index']);
    Route::get('/orders/{id}', [OrderController::class, 'show'])->whereNumber('id');

    Route::get('/tickets', [TicketController::class, 'index']);
    Route::get('/tickets/{id}', [TicketController::class, 'show']);
    Route::post('/tickets', [TicketController::class, 'store']);
    Route::post('/tickets/{id}/reply', [TicketController::class, 'reply']);

    Route::post('/payment/transfer', [PaymentController::class, 'payWithTransfer']);
    Route::post('/payment/webpay', [PaymentController::class, 'initWebpay']);

    Route::get('/billing-profiles', [BillingProfileController::class, 'index']);
    Route::post('/billing-profiles', [BillingProfileController::class, 'store']);
    Route::put('/billing-profiles/{id}', [BillingProfileController::class, 'update']);
    Route::delete('/billing-profiles/{id}', [BillingProfileController::class, 'destroy']);

    Route::prefix('admin')->group(function () {
        Route::get('/dashboard', [DashboardController::class, 'index'])->middleware('admin');
        Route::get('/notifications-summary', [DashboardController::class, 'getNotificationsSummary'])->middleware('admin');

        Route::middleware(['admin:manage_settings'])->group(function () {
            Route::get('/settings', [SettingController::class, 'index']);
            Route::post('/settings', [SettingController::class, 'update']);
        });

        Route::middleware(['admin:view_users'])->group(function () {
            Route::get('/users', [AdminUserController::class, 'index']);
            Route::get('/users/{id}', [AdminUserController::class, 'show'])->whereNumber('id');
            Route::put('/users/{id}', [AdminUserController::class, 'update'])->whereNumber('id');
        });

        Route::middleware(['admin:manage_products'])->group(function () {
            Route::get('/products', [AdminProductController::class, 'index']);
            Route::get('/products/{id}', [AdminProductController::class, 'show'])->whereNumber('id');
            Route::post('/products', [AdminProductController::class, 'store']);
            Route::put('/products/{id}', [AdminProductController::class, 'update'])->whereNumber('id');
            Route::delete('/products/{id}', [AdminProductController::class, 'destroy'])->whereNumber('id');
            Route::delete('/products/{id}/force', [AdminProductController::class, 'forceDestroy'])->whereNumber('id');
            Route::delete('/product-images/{id}', [AdminProductController::class, 'destroyImage'])->whereNumber('id');
            Route::post('/product-images/{id}/cover', [AdminProductController::class, 'setCover'])->whereNumber('id');
        });

        Route::middleware(['admin:manage_services'])->group(function () {
            Route::apiResource('/services', ServiceController::class);
        });

        Route::middleware(['admin:view_tickets'])->group(function () {
            Route::get('/tickets', [TicketController::class, 'indexAll']);
            Route::put('/tickets/{id}/status', [TicketController::class, 'updateStatus']);
        });

        Route::middleware(['admin:view_orders'])->group(function () {
            Route::get('/orders', [AdminOrderController::class, 'index']);
            Route::get('/orders/{id}', [AdminOrderController::class, 'show'])->whereNumber('id');
            Route::put('/orders/{id}', [AdminOrderController::class, 'update'])->whereNumber('id');

            Route::get('/bank-receipts/unmatched', [BankReceiptController::class, 'getUnmatched']);
            Route::post('/bank-receipts/{id}/match', [BankReceiptController::class, 'manualMatch'])->whereNumber('id');
        });
    });
});
