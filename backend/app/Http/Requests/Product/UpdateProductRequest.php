<?php

namespace App\Http\Requests\Product;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateProductRequest extends FormRequest
{
    public function authorize(): bool
    {
        $user = $this->user();

        return $user !== null && (int) $user->role_id === 1;
    }

    protected function prepareForValidation(): void
    {
        if ($this->has('specs')) {
            $this->merge(['specs' => $this->normalizeSpecs($this->input('specs'))]);
        }

        if ($this->has('is_visible')) {
            $this->merge(['is_visible' => filter_var($this->input('is_visible'), FILTER_VALIDATE_BOOLEAN)]);
        }
    }

    public function rules(): array
    {
        $productId = $this->route('id');

        return [
            'sku'           => ['sometimes', 'string', 'max:60', Rule::unique('products', 'sku')->ignore($productId)],
            'name'          => ['sometimes', 'string', 'max:200'],
            'description'   => ['sometimes', 'nullable', 'string', 'max:5000'],
            'price'         => ['sometimes', 'numeric', 'min:0'],
            'cost_price'    => ['sometimes', 'nullable', 'numeric', 'min:0'],
            'stock_current' => ['sometimes', 'integer', 'min:0'],
            'stock_alert'   => ['sometimes', 'integer', 'min:0'],
            'category_id'   => ['sometimes', 'integer', 'exists:categories,id'],
            'is_visible'    => ['sometimes', 'boolean'],
            'specs'         => ['sometimes', 'nullable', 'array'],
            'images'        => ['nullable', 'array'],
            'images.*'      => ['image', 'mimes:jpeg,png,jpg,webp', 'max:2048'],
        ];
    }

    public function messages(): array
    {
        return [
            'sku.unique'         => 'Ya existe un producto con este SKU.',
            'category_id.exists' => 'La categoría seleccionada no existe.',
            'images.*.image'     => 'Cada archivo subido debe ser una imagen válida.',
            'images.*.max'       => 'Cada imagen no debe superar 2 MB.',
        ];
    }

    private function normalizeSpecs(mixed $value): mixed
    {
        if (is_array($value)) {
            return $value;
        }

        if (!is_string($value)) {
            return $value;
        }

        $decoded = json_decode($value, true);

        if (is_string($decoded)) {
            $decoded = json_decode($decoded, true);
        }

        return is_array($decoded) ? $decoded : null;
    }
}
