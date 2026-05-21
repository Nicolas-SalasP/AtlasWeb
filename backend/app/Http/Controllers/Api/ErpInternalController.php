<?php

namespace App\Http\Controllers\Api;

use App\Domain\Catalog\Models\Service;
use App\Domain\Order\Enums\OrderStatus;
use App\Domain\Order\Models\OrderItem;
use App\Domain\User\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;

class ErpInternalController
{
    public function validateLogin(Request $request): JsonResponse
    {
        $request->validate([
            'email'    => ['required', 'email'],
            'password' => ['required', 'string'],
        ]);

        $user = User::where('email', $request->email)->first();

        if (!$user || !Hash::check($request->password, $user->password)) {
            return response()->json([
                'success' => false,
                'message' => 'Credenciales inválidas',
            ], 401);
        }

        $plan = $this->resolveActivePlan($user);

        return response()->json([
            'success' => true,
            'user'    => [
                'tenri_user_id' => $user->id,
                'name'          => $user->name,
                'email'         => $user->email,
                'rut'           => $user->rut,
                'password_hash' => $user->password,
                'is_active'     => true,
            ],
            'plan'    => $plan,
        ]);
    }

    public function validateToken(Request $request): JsonResponse
    {
        $request->validate([
            'tenri_user_id' => ['required', 'integer'],
        ]);

        $user = User::find($request->tenri_user_id);

        if (!$user) {
            return response()->json([
                'valid'   => false,
                'message' => 'Usuario no encontrado',
            ], 404);
        }

        $plan = $this->resolveActivePlan($user);

        $hasPaidPlan = $plan['plan_slug'] !== 'erp-starter'
            || $this->hasAnyErpOrder($user);

        return response()->json([
            'valid'     => true,
            'is_active' => true,
            'user'      => [
                'tenri_user_id' => $user->id,
                'name'          => $user->name,
                'email'         => $user->email,
            ],
            'plan'      => $plan,
        ]);
    }

    public function syncPassword(Request $request): JsonResponse
    {
        $request->validate([
            'tenri_user_id' => ['required', 'integer'],
            'password_hash' => ['required', 'string'],
        ]);

        $exists = DB::table('users')
            ->where('id', $request->tenri_user_id)
            ->exists();

        if (!$exists) {
            return response()->json(['success' => false, 'message' => 'Usuario no encontrado'], 404);
        }

        DB::table('users')
            ->where('id', $request->tenri_user_id)
            ->update(['password' => $request->password_hash]);

        return response()->json(['success' => true]);
    }

    public function userInfo(int $tenriUserId): JsonResponse
    {
        $user = User::find($tenriUserId);

        if (!$user) {
            return response()->json(['success' => false, 'message' => 'Usuario no encontrado'], 404);
        }

        $plan = $this->resolveActivePlan($user);

        return response()->json([
            'success' => true,
            'user'    => [
                'tenri_user_id' => $user->id,
                'name'          => $user->name,
                'email'         => $user->email,
                'rut'           => $user->rut,
                'password_hash' => $user->password,
                'is_active'     => true,
            ],
            'plan'    => $plan,
        ]);
    }

    private function resolveActivePlan(User $user): array
    {
        $item = OrderItem::whereHas('order', function ($q) use ($user) {
            $q->where('user_id', $user->id)
                ->where('status', OrderStatus::Paid->value);
        })
            ->whereNotNull('service_id')
            ->whereHas('service', function ($q) {
                $q->where('slug', 'like', 'erp-%');
            })
            ->with('service')
            ->latest('id')
            ->first();

        if (!$item || !$item->service instanceof Service) {
            return [
                'plan_slug'   => 'erp-starter',
                'module_keys' => [],
                'rol_erp'     => 'Auditor',
            ];
        }

        $service = $item->service;

        return [
            'plan_slug'   => $service->slug,
            'module_keys' => $service->module_keys ?? [],
            'rol_erp'     => $service->slug === 'erp-starter' ? 'Auditor' : 'Administrador',
        ];
    }

    private function hasAnyErpOrder(User $user): bool
    {
        return OrderItem::whereHas('order', function ($q) use ($user) {
            $q->where('user_id', $user->id)
                ->where('status', OrderStatus::Paid->value);
        })
            ->whereNotNull('service_id')
            ->whereHas('service', function ($q) {
                $q->where('slug', 'like', 'erp-%');
            })
            ->exists();
    }
}
