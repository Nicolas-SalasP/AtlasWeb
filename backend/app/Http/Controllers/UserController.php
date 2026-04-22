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

        $userPerms = is_string($currentUser->permissions) ? json_decode($currentUser->permissions, true) : ($currentUser->permissions ?? []);
        $rolePerms = is_string($currentUser->role->permissions) ? json_decode($currentUser->role->permissions, true) : ($currentUser->role->permissions ?? []);
        $currentPermissions = ($currentUser->permissions !== null) ? $userPerms : $rolePerms;
        
        $isSuperAdmin = isset($currentPermissions['all']) && $currentPermissions['all'] === true;

        if ($userToUpdate->email === 'nsalas@tenri.cl' && !$isSuperAdmin) {
            return response()->json(['message' => 'Operación denegada. Solo el Super Administrador puede modificar esta cuenta.'], 403);
        }

        if ($userToUpdate->email === 'nsalas@tenri.cl' && $request->has('role_id') && $request->role_id != 1) {
            return response()->json(['message' => 'Operación denegada. El Super Admin principal no puede ser degradado.'], 403);
        }

        if (!$isSuperAdmin) {
            if ($request->has('role_id') && $request->role_id == 1) {
                return response()->json(['message' => 'Acceso denegado. No puedes asignar el rol de Super Administrador.'], 403);
            }

            if ($request->has('permissions') && $request->permissions !== null) {
                $newPerms = is_string($request->permissions) ? json_decode($request->permissions, true) : $request->permissions;
                if (isset($newPerms['all']) && $newPerms['all'] === true) {
                    return response()->json(['message' => 'Acceso denegado. No puedes otorgar el permiso de Acceso Total.'], 403);
                }
            }
            
            $targetPerms = is_string($userToUpdate->permissions) ? json_decode($userToUpdate->permissions, true) : ($userToUpdate->permissions ?? []);
            if (isset($targetPerms['all']) && $targetPerms['all'] === true) {
                return response()->json(['message' => 'Acceso denegado. No puedes modificar a un usuario con Acceso Total.'], 403);
            }
        }

        $request->validate([
            'name' => 'required|string',
            'email' => 'required|email|unique:users,email,'.$id,
            'role_id' => 'required|integer',
            'is_active' => 'required|boolean',
            'permissions' => 'nullable' 
        ]);

        $dataToUpdate = $request->only([
            'name', 
            'email', 
            'is_active', 
            'company_name', 
            'phone'
        ]);

        if ($request->has('role_id')) {
            $dataToUpdate['role_id'] = $request->role_id;
        }
        if ($request->exists('permissions')) {
            $dataToUpdate['permissions'] = $request->permissions;
        }

        $userToUpdate->update($dataToUpdate);

        return response()->json($userToUpdate);
    }
}