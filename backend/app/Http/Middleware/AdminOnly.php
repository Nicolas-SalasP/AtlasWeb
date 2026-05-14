<?php

namespace App\Http\Middleware;

use App\Domain\User\Enums\UserRole;
use App\Domain\User\Models\User;
use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class AdminOnly
{
    public function handle(Request $request, Closure $next, ?string $requiredPermission = null): Response
    {
        $user = $request->user();

        if (!$user instanceof User || (int) $user->role_id === UserRole::Cliente->value) {
            return response()->json([
                'message' => 'Acceso denegado. Se requieren privilegios de Administrador.',
            ], 403);
        }

        $permissions = $this->resolvePermissions($user);

        if (isset($permissions['all']) && $permissions['all'] === true) {
            return $next($request);
        }

        if ($requiredPermission !== null) {
            if (!isset($permissions[$requiredPermission]) || $permissions[$requiredPermission] !== true) {
                return response()->json([
                    'message' => 'Acceso denegado. No tienes permisos para esta acción específica.',
                ], 403);
            }

            return $next($request);
        }

        if (empty($permissions)) {
            return response()->json([
                'message' => 'Acceso denegado. Tu cuenta administrativa no tiene permisos habilitados.',
            ], 403);
        }

        return $next($request);
    }

    private function resolvePermissions(User $user): array
    {
        $userPerms = is_array($user->permissions) ? $user->permissions : [];

        if ($user->permissions !== null) {
            return $userPerms;
        }

        $rolePerms = is_array($user->role?->permissions) ? $user->role->permissions : [];

        return $rolePerms;
    }
}
