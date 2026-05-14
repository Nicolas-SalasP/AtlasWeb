<?php

namespace App\Http\Requests\User;

use App\Domain\User\Enums\UserRole;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateUserRequest extends FormRequest
{
    public function authorize(): bool
    {
        $user = $this->user();

        return $user !== null && (int) $user->role_id === UserRole::Admin->value;
    }

    protected function prepareForValidation(): void
    {
        if ($this->has('permissions')) {
            $this->merge(['permissions' => $this->normalizePermissions($this->input('permissions'))]);
        }
    }

    public function rules(): array
    {
        $targetId = $this->route('id');

        return [
            'name'        => ['required', 'string', 'max:255'],
            'email'       => ['required', 'email', 'max:255', Rule::unique('users', 'email')->ignore($targetId)],
            'is_active'   => ['required', 'boolean'],
            'role_id'     => ['sometimes', 'integer', 'exists:roles,id'],
            'permissions' => ['sometimes', 'nullable', 'array'],
            'phone'       => ['sometimes', 'nullable', 'string', 'max:30'],
        ];
    }

    private function normalizePermissions(mixed $value): mixed
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
