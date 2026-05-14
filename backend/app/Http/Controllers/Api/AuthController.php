<?php

namespace App\Http\Controllers\Api;

use App\Domain\User\DTOs\LoginCredentials;
use App\Domain\User\DTOs\RegisterUserData;
use App\Domain\User\Enums\AccessAction;
use App\Domain\User\Exceptions\InvalidCredentialsException;
use App\Domain\User\Exceptions\InvalidOtpException;
use App\Domain\User\Models\User;
use App\Domain\User\Services\AccessLogService;
use App\Domain\User\Services\AuthService;
use App\Domain\User\Services\OrderClaimService;
use App\Http\Controllers\Controller;
use App\Http\Requests\Auth\ConfirmOrderClaimRequest;
use App\Http\Requests\Auth\LoginRequest;
use App\Http\Requests\Auth\RegisterRequest;
use App\Http\Requests\Auth\RequestOrderClaimOtpRequest;
use App\Http\Requests\Auth\ResetPasswordRequest;
use App\Http\Requests\Auth\SendResetLinkRequest;
use App\Http\Resources\User\UserResource;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;
use Illuminate\Validation\ValidationException;
use Throwable;

class AuthController extends Controller
{
    public function __construct(
        private readonly AuthService $authService,
        private readonly OrderClaimService $orderClaimService,
        private readonly AccessLogService $accessLogService,
    ) {
    }

    public function register(RegisterRequest $request): JsonResponse
    {
        $data = RegisterUserData::fromValidated($request->validated(), $request->ip());

        try {
            $user = $this->authService->register($data);
        } catch (Throwable $e) {
            Log::error('Error en registro: ' . $e->getMessage());

            return response()->json(['message' => 'No se pudo crear la cuenta'], 500);
        }

        Auth::login($user);

        $this->accessLogService->log($user->id, AccessAction::RegisterSuccess, $request);

        $claimable = $this->orderClaimService->detectClaimableEmails($user);

        return response()->json([
            'message' => 'Cuenta creada exitosamente',
            'data'    => [
                'user'                 => (new UserResource($user->load('role')))->toArray($request),
                'role'                 => 'cliente',
                'requires_order_claim' => !empty($claimable),
                'claimable_emails'     => $claimable,
            ],
        ], 201);
    }

    public function login(LoginRequest $request): JsonResponse
    {
        $credentials = LoginCredentials::fromValidated($request->validated());

        try {
            $user = $this->authService->attemptSpaLogin($credentials, $request);
        } catch (InvalidCredentialsException) {
            $this->accessLogService->log(null, AccessAction::LoginFailure, $request);

            return response()->json(['message' => 'Credenciales inválidas'], 401);
        }

        $this->accessLogService->log($user->id, AccessAction::LoginSuccess, $request);

        $claimable = $this->orderClaimService->detectClaimableEmails($user);

        return response()->json([
            'message' => 'Login exitoso',
            'data'    => [
                'user'                 => (new UserResource($user->load('role')))->toArray($request),
                'requires_order_claim' => !empty($claimable),
                'claimable_emails'     => $claimable,
            ],
        ]);
    }

    public function logout(Request $request): JsonResponse
    {
        $user = $request->user();

        if ($user instanceof User) {
            $this->accessLogService->log($user->id, AccessAction::Logout, $request);
        }

        $this->authService->logout($request);

        return response()->json(['message' => 'Sesión cerrada exitosamente']);
    }

    public function me(Request $request): JsonResponse
    {
        $user = $request->user();

        if (!$user instanceof User) {
            return response()->json(['message' => 'No autorizado'], 401);
        }

        return response()->json(
            (new UserResource($user->load('role')))->toArray($request)
        );
    }

    public function sendResetLink(SendResetLinkRequest $request): JsonResponse
    {
        $email = strtolower(trim((string) $request->validated()['email']));

        $user = $this->authService->sendPasswordResetLink($email);

        if ($user) {
            $this->accessLogService->log($user->id, AccessAction::PasswordResetRequested, $request);
        }

        return response()->json([
            'message' => 'Si el correo está en nuestra base de datos, recibirás un enlace de recuperación pronto.',
        ]);
    }

    public function resetPassword(ResetPasswordRequest $request): JsonResponse
    {
        try {
            $user = $this->authService->resetPassword($request->validated());
        } catch (ValidationException $e) {
            throw $e;
        }

        $this->accessLogService->log($user->id, AccessAction::PasswordReset, $request);

        return response()->json([
            'message' => 'Tu contraseña ha sido restablecida exitosamente.',
        ]);
    }

    public function requestOrderClaimOtp(RequestOrderClaimOtpRequest $request): JsonResponse
    {
        $user = $request->user();

        if ($user instanceof User) {
            $this->orderClaimService->requestOtp($user, (string) $request->validated()['historical_email']);
        }

        return response()->json([
            'message' => 'Si hay órdenes asociadas, hemos enviado un código.',
        ], 200);
    }

    public function confirmOrderClaim(ConfirmOrderClaimRequest $request): JsonResponse
    {
        $user = $request->user();

        if (!$user instanceof User) {
            return response()->json(['message' => 'No autorizado'], 401);
        }

        try {
            $linked = $this->orderClaimService->confirmAndLink(
                user: $user,
                historicalEmail: (string) $request->validated()['historical_email'],
                otp: (int) $request->validated()['otp'],
            );
        } catch (InvalidOtpException $e) {
            return response()->json(['message' => $e->getMessage()], 400);
        }

        if ($linked > 0) {
            $this->accessLogService->log($user->id, AccessAction::OrderClaimSuccess, $request);
        }

        return response()->json([
            'message'        => "Se han vinculado {$linked} órdenes a tu cuenta exitosamente.",
            'updated_orders' => $linked,
        ]);
    }
}
