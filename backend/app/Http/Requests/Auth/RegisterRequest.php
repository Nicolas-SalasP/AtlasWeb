<?php

namespace App\Http\Requests\Auth;

use Illuminate\Foundation\Http\FormRequest;

class RegisterRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'name'         => ['required', 'string', 'max:255'],
            'email'        => ['required', 'string', 'email', 'max:255', 'unique:users,email'],
            'rut'          => ['required', 'string', 'max:20', 'unique:users,rut'],
            'password'     => ['required', 'string', 'min:8', 'confirmed'],
            'accept_terms' => ['required', 'accepted'],
        ];
    }

    public function messages(): array
    {
        return [
            'name.required'         => 'El nombre es obligatorio.',
            'email.required'        => 'El correo es obligatorio.',
            'email.email'           => 'Ingresa un correo válido.',
            'email.unique'          => 'Este correo ya está registrado.',
            'rut.required'          => 'El RUT es obligatorio.',
            'rut.unique'            => 'Este RUT ya está registrado en el sistema.',
            'password.required'     => 'La contraseña es obligatoria.',
            'password.min'          => 'La contraseña debe tener al menos 8 caracteres.',
            'password.confirmed'    => 'Las contraseñas no coinciden.',
            'accept_terms.required' => 'Debes aceptar los Términos y Condiciones y Políticas de Privacidad.',
            'accept_terms.accepted' => 'Debes aceptar los Términos y Condiciones y Políticas de Privacidad.',
        ];
    }
}
