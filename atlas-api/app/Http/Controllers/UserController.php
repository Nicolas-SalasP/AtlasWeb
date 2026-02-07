<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\Request;

class UserController extends Controller
{
    public function index(Request $request)
    {
        if ($request->user()->role_id !== 1) {
            return response()->json(['message' => 'No autorizado'], 403);
        }

        $users = User::withCount('tickets')
            ->orderBy('created_at', 'desc')
            ->get();

        return response()->json($users);
    }

    public function show(Request $request, $id)
    {
        if ($request->user()->role_id !== 1) {
            return response()->json(['message' => 'No autorizado'], 403);
        }

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
        if ($request->user()->role_id !== 1) return response()->json(['message' => 'No autorizado'], 403);

        $user = User::find($id);
        if (!$user) return response()->json(['message' => 'Usuario no encontrado'], 404);

        $request->validate([
            'name' => 'required|string',
            'email' => 'required|email|unique:users,email,'.$id,
            'role_id' => 'required|integer',
            'is_active' => 'required|boolean'
        ]);

        $user->update($request->only(['name', 'email', 'role_id', 'is_active', 'company_name', 'phone']));

        return response()->json($user);
    }
}