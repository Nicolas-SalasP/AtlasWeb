<?php

use App\Domain\User\Models\User;
use App\Http\Controllers\Api\Admin\AdminBankReceiptController;
use App\Http\Controllers\Api\Admin\AdminDashboardController;
use App\Http\Controllers\Api\Admin\AdminOrderController;
use App\Http\Controllers\Api\Admin\AdminProductController;
use App\Http\Controllers\Api\Admin\AdminServiceController;
use App\Http\Controllers\Api\Admin\AdminSettingController;
use App\Http\Controllers\Api\Admin\AdminTicketController;
use App\Http\Controllers\Api\Admin\AdminUserController;
use App\Http\Controllers\Api\AddressController;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\BillingProfileController;
use App\Http\Controllers\Api\ContactController;
use App\Http\Controllers\Api\OrderController;
use App\Http\Controllers\Api\PaymentController;
use App\Http\Controllers\Api\ProfileController;
use App\Http\Controllers\Api\PublicCategoryController;
use App\Http\Controllers\Api\PublicProductController;
use App\Http\Controllers\Api\PublicServiceController;
use App\Http\Controllers\Api\AdminErpPlansController;
use App\Http\Controllers\Api\ErpInternalController;
use App\Http\Controllers\Api\IndicadoresController;
use App\Http\Controllers\Api\SystemStatusController;
use App\Http\Controllers\Api\TicketController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Route;

$loginLimit = app()->isProduction() ? 'throttle:5,1' : 'throttle:100,1';
$forgotLimit = app()->isProduction() ? 'throttle:3,1' : 'throttle:100,1';
$contactLimit = app()->isProduction() ? 'throttle:5,1' : 'throttle:100,1';

Route::post('/register', [AuthController::class, 'register']);
Route::post('/login', [AuthController::class, 'login'])->middleware($loginLimit);
Route::post('/forgot-password', [AuthController::class, 'sendResetLink'])->middleware($forgotLimit);
Route::post('/reset-password', [AuthController::class, 'resetPassword']);

Route::get('/products', [PublicProductController::class, 'index']);
Route::get('/products/{id}', [PublicProductController::class, 'show'])->whereNumber('id');
Route::get('/services/catalog', [PublicServiceController::class, 'indexPublic']);
Route::get('/categories', [PublicCategoryController::class, 'index']);

Route::get('/system-status', [SystemStatusController::class, 'publicStatus']);
Route::get('/indicadores/uf', [IndicadoresController::class, 'uf']);

Route::post('/orders', [OrderController::class, 'store']);
Route::any('/webpay/return', [PaymentController::class, 'commitWebpay']);

Route::post('/contacto', [ContactController::class, 'submit'])->middleware($contactLimit);

Route::middleware(['erp.api.key'])->post('/internal/erp/validate-login', function (Request $request) {
    $user = User::where('email', $request->email)->first();
    if (!$user || !Hash::check($request->password, $user->password)) {
        return response()->json(['success' => false, 'message' => 'Credenciales inválidas'], 401);
    }

    return response()->json([
        'success' => true,
        'user' => [
            'atlas_id' => $user->id,
            'name' => $user->name,
            'email' => $user->email,
            'rut' => $user->rut ?? null,
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
    Route::get('/tickets/{id}', [TicketController::class, 'show'])->whereNumber('id');
    Route::post('/tickets', [TicketController::class, 'store']);
    Route::post('/tickets/{id}/reply', [TicketController::class, 'reply'])->whereNumber('id');

    Route::post('/payment/transfer', [PaymentController::class, 'payWithTransfer']);
    Route::post('/payment/webpay', [PaymentController::class, 'initWebpay']);

    Route::get('/billing-profiles', [BillingProfileController::class, 'index']);
    Route::post('/billing-profiles', [BillingProfileController::class, 'store']);
    Route::put('/billing-profiles/{id}', [BillingProfileController::class, 'update'])->whereNumber('id');
    Route::delete('/billing-profiles/{id}', [BillingProfileController::class, 'destroy'])->whereNumber('id');

    Route::prefix('admin')->group(function () {
        Route::get('/dashboard', [AdminDashboardController::class, 'index'])->middleware('admin');
        Route::get('/notifications-summary', [AdminDashboardController::class, 'notifications'])->middleware('admin');

        Route::middleware(['admin:manage_settings'])->group(function () {
            Route::get('/settings', [AdminSettingController::class, 'index']);
            Route::post('/settings', [AdminSettingController::class, 'update']);
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

        Route::middleware(['admin'])->group(function () {
            Route::get('/erp-plans', [AdminErpPlansController::class, 'index']);
            Route::put('/erp-plans/{service}', [AdminErpPlansController::class, 'update']);
            Route::get('/erp-plans/online-users', [AdminErpPlansController::class, 'onlineUsers']);
        });

        Route::middleware(['admin:manage_services'])->group(function () {
            Route::get('/services', [AdminServiceController::class, 'index']);
            Route::get('/services/{id}', [AdminServiceController::class, 'show'])->whereNumber('id');
            Route::post('/services', [AdminServiceController::class, 'store']);
            Route::put('/services/{id}', [AdminServiceController::class, 'update'])->whereNumber('id');
            Route::delete('/services/{id}', [AdminServiceController::class, 'destroy'])->whereNumber('id');
        });

        Route::middleware(['admin:view_tickets'])->group(function () {
            Route::get('/tickets', [AdminTicketController::class, 'index']);
            Route::put('/tickets/{id}/status', [AdminTicketController::class, 'updateStatus'])->whereNumber('id');
            Route::put('/tickets/{id}/assign', [AdminTicketController::class, 'assign'])->whereNumber('id');
        });

        Route::middleware(['admin:view_orders'])->group(function () {
            Route::get('/orders', [AdminOrderController::class, 'index']);
            Route::get('/orders/{id}', [AdminOrderController::class, 'show'])->whereNumber('id');
            Route::put('/orders/{id}', [AdminOrderController::class, 'update'])->whereNumber('id');

            Route::get('/bank-receipts/unmatched', [AdminBankReceiptController::class, 'unmatched']);
            Route::post('/bank-receipts/{id}/match', [AdminBankReceiptController::class, 'manualMatch'])->whereNumber('id');
        });
    });
});
