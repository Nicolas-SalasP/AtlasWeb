<?php

namespace App\Http\Requests\Service;

use App\Domain\User\Enums\UserRole;
use Illuminate\Foundation\Http\FormRequest;

class StoreServiceRequest extends FormRequest
{
    public function authorize(): bool
    {
        $user = $this->user();

        return $user !== null && (int) $user->role_id === UserRole::Admin->value;
    }

    protected function prepareForValidation(): void
    {
        if ($this->has('features')) {
            $this->merge(['features' => $this->normalizeFeatures($this->input('features'))]);
        }

        if ($this->has('is_active')) {
            $this->merge(['is_active' => filter_var($this->input('is_active'), FILTER_VALIDATE_BOOLEAN)]);
        }
    }

    public function rules(): array
    {
        return [
            'name'          => ['required', 'string', 'max:200'],
            'price'         => ['required', 'integer', 'min:0'],
            'duration_days' => ['required', 'integer', 'min:1'],
            'description'   => ['nullable', 'string', 'max:5000'],
            'features'      => ['nullable', 'array'],
            'is_active'     => ['sometimes', 'boolean'],
            'image'         => ['nullable', 'image', 'mimes:jpeg,png,jpg,webp', 'max:2048'],
        ];
    }

    public function messages(): array
    {
        return [
            'image.image'   => 'El archivo subido debe ser una imagen válida.',
            'image.mimes'   => 'La imagen debe ser JPG, PNG o WEBP.',
            'image.max'     => 'La imagen no debe superar 2 MB.',
        ];
    }

    private function normalizeFeatures(mixed $value): mixed
    {
        if (is_array($value) || $value === null) {
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
