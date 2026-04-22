<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\Log;
use App\Mail\ContactMessage;

class ContactController extends Controller
{
    public function submit(Request $request)
    {
        $validated = $request->validate([
            'nombre' => 'required|string|max:255',
            'email' => 'required|email|max:255',
            'telefono' => 'nullable|string|max:20',
            'asunto' => 'required|string|max:100',
            'mensaje' => 'required|string|max:2000',
        ]);

        try {
            Mail::to('no-reply@tenri.cl')
                ->cc($validated['email'])
                ->send(new ContactMessage($validated));

            return response()->json([
                'success' => true,
                'message' => 'Mensaje enviado correctamente'
            ], 200);

        } catch (\Exception $e) {
            Log::error('Error de Correo: ' . $e->getMessage()); 
            return response()->json([
                'success' => false,
                'message' => 'Error real: ' . $e->getMessage() 
            ], 500);
        }
    }
}