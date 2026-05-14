<?php

namespace App\Http\Requests\Ticket;

use App\Domain\Ticket\Enums\TicketStatus;
use App\Domain\User\Enums\UserRole;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateTicketStatusRequest extends FormRequest
{
    public function authorize(): bool
    {
        $user = $this->user();

        return $user !== null && (int) $user->role_id === UserRole::Admin->value;
    }

    public function rules(): array
    {
        return [
            'status' => ['required', 'string', Rule::in(TicketStatus::values())],
        ];
    }

    public function messages(): array
    {
        return [
            'status.in' => 'El estado solicitado no es válido.',
        ];
    }
}
