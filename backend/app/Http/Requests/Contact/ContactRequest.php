<?php

namespace App\Http\Requests\Contact;

use Illuminate\Foundation\Http\FormRequest;

class ContactRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'nombre'   => ['required', 'string', 'max:255'],
            'email'    => ['required', 'email', 'max:255'],
            'telefono' => ['nullable', 'string', 'max:20'],
            'asunto'   => ['required', 'string', 'max:100'],
            'mensaje'  => ['required', 'string', 'max:2000'],
        ];
    }

    public function messages(): array
    {
        return [
            'nombre.required'  => 'El nombre es obligatorio.',
            'email.required'   => 'El correo es obligatorio.',
            'email.email'      => 'Ingresa un correo válido.',
            'asunto.required'  => 'El asunto es obligatorio.',
            'mensaje.required' => 'El mensaje es obligatorio.',
        ];
    }
}
