<?php

namespace App\Http\Controllers;

use App\Models\SystemSetting;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;

class SettingController extends Controller
{
    public function index()
    {
        // Retorna un objeto clave:valor simple { "store_name": "Atlas...", ... }
        $settings = SystemSetting::all()->pluck('value', 'key');
        return response()->json($settings);
    }

    public function update(Request $request)
    {
        $data = $request->except(['password_current', 'password_new']);

        foreach ($data as $key => $value) {
            SystemSetting::updateOrCreate(
                ['key' => $key],
                ['value' => $value]
            );
        }

        if ($request->filled('password_new')) {
            $user = $request->user();
            
            if (!Hash::check($request->password_current, $user->password)) {
                return response()->json(['message' => 'La contraseña actual es incorrecta'], 400);
            }

            $user->update(['password' => Hash::make($request->password_new)]);
        }

        return response()->json(['message' => 'Configuración guardada']);
    }
}