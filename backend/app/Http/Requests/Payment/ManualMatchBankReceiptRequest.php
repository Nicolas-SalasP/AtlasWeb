<?php

namespace App\Http\Requests\Payment;

use App\Domain\User\Enums\UserRole;
use Illuminate\Foundation\Http\FormRequest;

class ManualMatchBankReceiptRequest extends FormRequest
{
    public function authorize(): bool
    {
        $user = $this->user();

        return $user !== null && (int) $user->role_id === UserRole::Admin->value;
    }

    public function rules(): array
    {
        return [
            'order_id' => ['required', 'integer', 'exists:orders,id'],
        ];
    }
}
