<?php

namespace App\Http\Requests\Order;

use Illuminate\Foundation\Http\FormRequest;

class StoreOrderRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'items'              => ['required', 'array', 'min:1'],
            'items.*.id'         => ['required'],
            'items.*.quantity'   => ['required', 'integer', 'min:1', 'max:999'],
            'customer_data'      => ['required', 'array'],
            'customer_data.region' => ['required', 'string', 'max:100'],
            'customer_data.email'  => ['nullable', 'email', 'max:255'],
            'customer_data.nombre' => ['nullable', 'string', 'max:255'],
            'customer_data.rut'    => ['nullable', 'string', 'max:20'],
            'customer_data.phone'  => ['nullable', 'string', 'max:30'],
            'terms_accepted'     => ['required', 'accepted'],
            'shipping_address'   => ['nullable', 'string', 'max:500'],
            'notes'              => ['nullable', 'string', 'max:1000'],
        ];
    }

    public function messages(): array
    {
        return [
            'terms_accepted.accepted' => 'Debes aceptar los términos y condiciones para procesar la compra.',
            'items.required'          => 'El carrito está vacío.',
            'items.min'               => 'Debes incluir al menos un producto o servicio.',
        ];
    }
}
