<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\Request;

class UserController extends Controller
{
    public function index(Request $request)
    {

        $users = User::withCount('tickets')
            ->orderBy('created_at', 'desc')
            ->get();

        return response()->json($users);
    }

    public function show(Request $request, $id)
    {
        $user = User::with([
            'tickets' => function($query) {
                $query->orderBy('created_at', 'desc');
            },
            'orders' => function($query) {
                $query->orderBy('created_at', 'desc');
            }
        ])->find($id);

        if (!$user) {
            return response()->json(['message' => 'Usuario no encontrado'], 404);
        }

        return response()->json($user);
    }

    public function update(Request $request, $id)
    {
        $userToUpdate = User::find($id);
        if (!$userToUpdate) return response()->json(['message' => 'Usuario no encontrado'], 404);

        $currentUser = $request->user();

        // 1. Detectar si el usuario que ejecuta la acción es un Super Admin (Evaluando permisos, no solo el ID)
        $userPerms = is_string($currentUser->permissions) ? json_decode($currentUser->permissions, true) : ($currentUser->permissions ?? []);
        $rolePerms = is_string($currentUser->role->permissions) ? json_decode($currentUser->role->permissions, true) : ($currentUser->role->permissions ?? []);
        $currentPermissions = ($currentUser->permissions !== null) ? $userPerms : $rolePerms;
        
        $isSuperAdmin = isset($currentPermissions['all']) && $currentPermissions['all'] === true;

        // 2. Proteger la integridad de la cuenta maestra
        if ($userToUpdate->email === 'nsalas@tenri.cl' && !$isSuperAdmin) {
            return response()->json(['message' => 'Operación denegada. Solo el Super Administrador puede modificar esta cuenta.'], 403);
        }

        if ($userToUpdate->email === 'nsalas@tenri.cl' && $request->has('role_id') && $request->role_id != 1) {
            return response()->json(['message' => 'Operación denegada. El Super Admin principal no puede ser degradado.'], 403);
        }

        // 3. Bloqueo de escalado de privilegios
        if (!$isSuperAdmin) {
            if (($request->has('role_id') && $request->role_id != $userToUpdate->role_id) || $request->has('permissions')) {
                return response()->json(['message' => 'Acceso denegado. No tienes autorización para modificar roles o privilegios de seguridad.'], 403);
            }
        }

        $request->validate([
            'name' => 'required|string',
            'email' => 'required|email|unique:users,email,'.$id,
            'role_id' => 'required|integer',
            'is_active' => 'required|boolean',
            'permissions' => 'nullable' 
        ]);

        // 4. Asignación Masiva Segura (Mass Assignment)
        $dataToUpdate = $request->only([
            'name', 
            'email', 
            'is_active', 
            'company_name', 
            'phone'
        ]);
        if ($isSuperAdmin) {
            if ($request->has('role_id')) {
                $dataToUpdate['role_id'] = $request->role_id;
            }
            if ($request->exists('permissions')) {
                $dataToUpdate['permissions'] = $request->permissions;
            }
        }

        $userToUpdate->update($dataToUpdate);

        return response()->json($userToUpdate);
    }
}