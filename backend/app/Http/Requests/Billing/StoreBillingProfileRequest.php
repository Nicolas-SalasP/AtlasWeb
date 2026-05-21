<?php

namespace App\Http\Requests\Billing;

use Illuminate\Foundation\Http\FormRequest;

class StoreBillingProfileRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user() !== null;
    }

    public function rules(): array
    {
        return [
            'rut'           => ['required', 'string', 'max:20'],
            'business_name' => ['required', 'string', 'max:255'],
            'business_line' => ['required', 'string', 'max:255'],
            'address'       => ['required', 'string', 'max:255'],
            'city'          => ['nullable', 'string', 'max:255'],
            'email_dte'     => ['nullable', 'email', 'max:255'],
            'is_default'    => ['sometimes', 'boolean'],
        ];
    }

    public function messages(): array
    {
        return [
            'rut.required'           => 'El RUT de la empresa es obligatorio.',
            'business_name.required' => 'La razón social es obligatoria.',
            'business_line.required' => 'El giro es obligatorio.',
            'address.required'       => 'La dirección es obligatoria.',
            'email_dte.email'        => 'El correo DTE no tiene un formato válido.',
        ];
    }
}
