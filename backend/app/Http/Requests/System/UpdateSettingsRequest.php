<?php

namespace App\Http\Requests\System;

use App\Domain\User\Enums\UserRole;
use Illuminate\Foundation\Http\FormRequest;

class UpdateSettingsRequest extends FormRequest
{
    public function authorize(): bool
    {
        $user = $this->user();

        return $user !== null && (int) $user->role_id === UserRole::Admin->value;
    }

    public function rules(): array
    {
        return [
            'maintenance_mode'        => ['sometimes', 'boolean'],
            'webpay_enabled'          => ['sometimes', 'boolean'],
            'webpay_env'              => ['sometimes', 'nullable', 'string', 'in:integration,production'],
            'webpay_code'             => ['sometimes', 'nullable', 'string', 'max:50'],
            'webpay_api_key'          => ['sometimes', 'nullable', 'string', 'max:255'],
            'bank_name'               => ['sometimes', 'nullable', 'string', 'max:100'],
            'bank_account_type'       => ['sometimes', 'nullable', 'string', 'max:100'],
            'bank_account_number'     => ['sometimes', 'nullable', 'string', 'max:50'],
            'bank_rut'                => ['sometimes', 'nullable', 'string', 'max:20'],
            'bank_email'              => ['sometimes', 'nullable', 'email', 'max:255'],
            'store_name'              => ['sometimes', 'nullable', 'string', 'max:255'],
            'contact_email'           => ['sometimes', 'nullable', 'email', 'max:255'],
            'contact_phone'           => ['sometimes', 'nullable', 'string', 'max:50'],
            'free_shipping_threshold' => ['sometimes', 'nullable', 'integer', 'min:0'],
        ];
    }
}
