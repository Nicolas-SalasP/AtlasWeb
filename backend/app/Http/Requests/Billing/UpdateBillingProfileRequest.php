<?php

namespace App\Http\Requests\Billing;

use Illuminate\Foundation\Http\FormRequest;

class UpdateBillingProfileRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user() !== null;
    }

    public function rules(): array
    {
        return [
            'rut'           => ['sometimes', 'string', 'max:20'],
            'business_name' => ['sometimes', 'string', 'max:255'],
            'business_line' => ['sometimes', 'string', 'max:255'],
            'address'       => ['sometimes', 'string', 'max:255'],
            'city'          => ['sometimes', 'nullable', 'string', 'max:255'],
            'email_dte'     => ['sometimes', 'nullable', 'email', 'max:255'],
            'is_default'    => ['sometimes', 'boolean'],
        ];
    }

    public function messages(): array
    {
        return [
            'email_dte.email' => 'El correo DTE no tiene un formato válido.',
        ];
    }
}
