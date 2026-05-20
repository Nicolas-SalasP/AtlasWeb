<?php

namespace App\Http\Controllers\Api;

use App\Domain\User\DTOs\ChangePasswordData;
use App\Domain\User\DTOs\UpdateProfileData;
use App\Domain\User\Enums\AccessAction;
use App\Domain\User\Exceptions\EmailAlreadyTakenException;
use App\Domain\User\Exceptions\IncorrectPasswordException;
use App\Domain\User\Exceptions\InvalidOtpException;
use App\Domain\User\Models\User;
use App\Domain\User\Services\AccessLogService;
use App\Domain\User\Services\ProfileService;
use App\Http\Controllers\Controller;
use App\Http\Requests\Profile\ChangePasswordRequest;
use App\Http\Requests\Profile\RequestEmailChangeRequest;
use App\Http\Requests\Profile\UpdateProfileRequest;
use App\Http\Requests\Profile\VerifyEmailChangeRequest;
use App\Http\Resources\User\AccessLogResource;
use App\Http\Resources\User\UserResource;
use App\Domain\Catalog\Models\Service;
use App\Domain\Order\Enums\OrderStatus;
use App\Domain\Order\Models\OrderItem;
use App\Domain\Ticket\Models\Ticket;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\ValidationException;

class ProfileController extends Controller
{
    public function __construct(
        private readonly ProfileService $profileService,
        private readonly AccessLogService $accessLogService,
    ) {
    }

    public function show(Request $request): JsonResponse
    {
        $user = $request->user();

        if (!$user instanceof User) {
            return response()->json(['message' => 'No autorizado'], 401);
        }

        return response()->json(
            (new UserResource($user->load('role')))->toArray($request)
        );
    }

    public function update(UpdateProfileRequest $request): JsonResponse
    {
        $user = $request->user();

        if (!$user instanceof User) {
            return response()->json(['message' => 'No autorizado'], 401);
        }

        $data = UpdateProfileData::fromValidated($request->validated());
        $user = $this->profileService->updateProfile($user, $data);

        return response()->json([
            'message' => 'Perfil actualizado correctamente',
            'user'    => (new UserResource($user->load('role')))->toArray($request),
        ]);
    }

    public function changePassword(ChangePasswordRequest $request): JsonResponse
    {
        $user = $request->user();

        if (!$user instanceof User) {
            return response()->json(['message' => 'No autorizado'], 401);
        }

        $data = ChangePasswordData::fromValidated($request->validated());

        try {
            $this->profileService->changePassword($user, $data);
        } catch (IncorrectPasswordException $e) {
            throw ValidationException::withMessages([
                'current_password' => [$e->getMessage()],
            ]);
        }

        $this->accessLogService->log($user->id, AccessAction::PasswordChanged, $request);

        return response()->json(['message' => 'Contraseña actualizada correctamente.']);
    }

    public function requestEmailChange(RequestEmailChangeRequest $request): JsonResponse
    {
        $user = $request->user();

        if (!$user instanceof User) {
            return response()->json(['message' => 'No autorizado'], 401);
        }

        try {
            $this->profileService->requestEmailChange($user, (string) $request->validated()['new_email']);
        } catch (EmailAlreadyTakenException $e) {
            return response()->json(['message' => $e->getMessage()], 422);
        }

        $this->accessLogService->log($user->id, AccessAction::EmailChangeRequested, $request);

        return response()->json([
            'message' => 'Hemos enviado un código de verificación a tu nuevo correo.',
        ]);
    }

    public function verifyEmailChange(VerifyEmailChangeRequest $request): JsonResponse
    {
        $user = $request->user();

        if (!$user instanceof User) {
            return response()->json(['message' => 'No autorizado'], 401);
        }

        try {
            $user = $this->profileService->verifyEmailChange($user, (int) $request->validated()['code']);
        } catch (InvalidOtpException $e) {
            return response()->json(['message' => $e->getMessage()], 400);
        } catch (EmailAlreadyTakenException $e) {
            return response()->json(['message' => $e->getMessage()], 422);
        }

        $this->accessLogService->log($user->id, AccessAction::EmailChanged, $request);

        return response()->json([
            'message' => 'Correo actualizado exitosamente.',
            'user'    => (new UserResource($user->load('role')))->toArray($request),
        ]);
    }

    public function getSubscription(Request $request): JsonResponse
    {
        $user = $request->user();

        if (!$user instanceof User) {
            return response()->json(['message' => 'No autorizado'], 401);
        }

        $item = OrderItem::whereHas('order', function ($q) use ($user) {
            $q->where('user_id', $user->id)
                ->where('status', OrderStatus::Paid->value);
        })
            ->whereNotNull('service_id')
            ->whereHas('service', function ($q) {
                $q->where('slug', 'like', 'erp-%');
            })
            ->with(['service', 'order'])
            ->latest('id')
            ->first();

        if (!$item || !$item->service instanceof Service) {
            return response()->json(['status' => 'inactive']);
        }

        $service = $item->service;
        $order   = $item->order;

        $nextBilling = $order->created_at
            ? $order->created_at->addDays($service->duration_days ?? 30)->format('Y-m-d')
            : null;

        return response()->json([
            'status'            => 'active',
            'plan_name'         => $service->name,
            'plan_slug'         => $service->slug,
            'price_label'       => $service->price_label,
            'next_billing_date' => $nextBilling,
            'amount'            => $service->price,
            'features'          => $service->features ?? [],
        ]);
    }

    public function getTicketsSummary(Request $request): JsonResponse
    {
        $user = $request->user();

        if (!$user instanceof User) {
            return response()->json(['message' => 'No autorizado'], 401);
        }

        $tickets = Ticket::where('user_id', $user->id)
            ->withCount('messages')
            ->orderByDesc('created_at')
            ->take(10)
            ->get();

        $statusAbiertos = ['nuevo', 'abierto', 'esperando_cliente'];
        $statusCerrados = ['resuelto', 'cerrado'];

        $stats = [
            'total'  => Ticket::where('user_id', $user->id)->count(),
            'open'   => Ticket::where('user_id', $user->id)->whereIn('status', $statusAbiertos)->count(),
            'closed' => Ticket::where('user_id', $user->id)->whereIn('status', $statusCerrados)->count(),
        ];

        return response()->json([
            'tickets' => \App\Http\Resources\Ticket\TicketResource::collection($tickets)->toArray($request),
            'stats'   => $stats,
        ]);
    }

    public function getSecurityLogs(Request $request): JsonResponse
    {
        $user = $request->user();

        if (!$user instanceof User) {
            return response()->json(['message' => 'No autorizado'], 401);
        }

        $logs = $this->accessLogService->getRecentForUser($user->id, 5);

        return response()->json(
            AccessLogResource::collection($logs)->toArray($request)
        );
    }
}
