<?php

namespace App\Http\Controllers;

use App\Models\SystemSetting;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Cache;

class SettingController extends Controller
{
    public function index()
    {
        $settings = SystemSetting::all()->pluck('value', 'key');
        return response()->json($settings);
    }

    public function update(Request $request)
    {
        // --- SEGURIDAD: Whitelist de configuraciones permitidas ---
        $allowedSettings = [
            'maintenance_mode',
            'webpay_enabled',
            'bank_name',
            'bank_account_type',
            'bank_account_number',
            'bank_rut',
            'bank_email'
        ];

        $data = $request->only($allowedSettings);

        foreach ($data as $key => $value) {
            if ($value !== null) {
                SystemSetting::updateOrCreate(
                    ['key' => $key],
                    ['value' => $value]
                );
            }
        }
        
        Cache::forget('system_maintenance_status');
        if ($request->filled('password_new')) {
            $request->validate([
                'password_current' => 'required',
                'password_new' => 'required|min:8'
            ]);

            $user = $request->user();
            
            if (!Hash::check($request->password_current, $user->password)) {
                return response()->json(['message' => 'La contraseña actual es incorrecta'], 400);
            }

            $user->update(['password' => Hash::make($request->password_new)]);
        }

        return response()->json(['message' => 'Configuración guardada de manera segura']);
    }

    public function publicStatus()
    {
        $maintenance = Cache::remember('system_maintenance_status', 60, function () {
            return SystemSetting::where('key', 'maintenance_mode')->value('value');
        });

        return response()->json([
            'maintenance_mode' => $maintenance
        ]);
    }
}