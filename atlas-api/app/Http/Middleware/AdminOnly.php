<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class AdminOnly
{
    public function handle(Request $request, Closure $next, $requiredPermission = null): Response
    {
        $user = $request->user();
        if (!$user || $user->role_id == 2) {
            return response()->json([
                'message' => 'Acceso denegado. Se requieren privilegios de Administrador.'
            ], 403);
        }

        $rolePerms = is_string($user->role->permissions) 
            ? json_decode($user->role->permissions, true) 
            : ($user->role->permissions ?? []);

        $userPerms = is_string($user->permissions) 
            ? json_decode($user->permissions, true) 
            : ($user->permissions ?? []);

        $permissions = !empty($userPerms) ? $userPerms : $rolePerms;

        if (isset($permissions['all']) && $permissions['all'] === true) {
            return $next($request);
        }

        if ($requiredPermission) {
            if (!isset($permissions[$requiredPermission]) || $permissions[$requiredPermission] !== true) {
                return response()->json([
                    'message' => 'Acceso denegado. No tienes permisos para esta acción específica.'
                ], 403);
            }
        }

        return $next($request);
    }
}