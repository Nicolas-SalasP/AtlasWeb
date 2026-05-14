<?php

namespace App\Http\Requests\Auth;

use Illuminate\Foundation\Http\FormRequest;

class ConfirmOrderClaimRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user() !== null;
    }

    public function rules(): array
    {
        return [
            'historical_email' => ['required', 'email'],
            'otp'              => ['required', 'integer', 'digits:6'],
        ];
    }
}
