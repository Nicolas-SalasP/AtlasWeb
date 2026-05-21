<?php

namespace App\Http\Requests\Order;

use App\Domain\Order\Enums\OrderStatus;
use App\Domain\Order\Enums\ShippingProvider;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateOrderRequest extends FormRequest
{
    public function authorize(): bool
    {
        $user = $this->user();

        return $user !== null && (int) $user->role_id === 1;
    }

    public function rules(): array
    {
        return [
            'status'            => ['sometimes', 'string', Rule::in(OrderStatus::values())],
            'notes'             => ['sometimes', 'nullable', 'string', 'max:5000'],
            'shipping_provider' => ['sometimes', 'nullable', 'string', Rule::in(ShippingProvider::values())],
            'tracking_number'   => ['sometimes', 'nullable', 'string', 'max:100'],
        ];
    }

    public function messages(): array
    {
        return [
            'status.in'            => 'El estado solicitado no es válido.',
            'shipping_provider.in' => 'El courier indicado no está soportado.',
        ];
    }
}
