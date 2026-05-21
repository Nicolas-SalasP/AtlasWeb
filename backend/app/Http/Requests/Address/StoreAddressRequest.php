<?php

namespace App\Http\Requests\Address;

use Illuminate\Foundation\Http\FormRequest;

class StoreAddressRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user() !== null;
    }

    public function rules(): array
    {
        return [
            'alias'      => ['required', 'string', 'max:50'],
            'address'    => ['required', 'string', 'max:255'],
            'number'     => ['required', 'string', 'max:20'],
            'depto'      => ['nullable', 'string', 'max:20'],
            'region'     => ['nullable', 'string', 'max:100'],
            'commune'    => ['nullable', 'string', 'max:100'],
            'is_default' => ['sometimes', 'boolean'],
        ];
    }
}
