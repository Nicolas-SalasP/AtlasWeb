<?php

namespace App\Http\Requests\Ticket;

use App\Domain\Ticket\Enums\TicketCategory;
use App\Domain\Ticket\Enums\TicketPriority;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreTicketRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user() !== null;
    }

    public function rules(): array
    {
        return [
            'asunto'        => ['required', 'string', 'max:255'],
            'categoria'     => ['required', 'string', Rule::in(TicketCategory::values())],
            'prioridad'     => ['required', 'string', Rule::in(TicketPriority::values())],
            'mensaje'       => ['required', 'string', 'max:10000'],
            'attachments'   => ['nullable', 'array', 'max:5'],
            'attachments.*' => ['file', 'mimes:jpeg,jpg,png,webp,pdf,doc,docx', 'max:10240'],
        ];
    }

    public function messages(): array
    {
        return [
            'categoria.in'        => 'La categoría seleccionada no es válida.',
            'prioridad.in'        => 'La prioridad seleccionada no es válida.',
            'attachments.*.mimes' => 'Solo se permiten imágenes (JPG, PNG, WEBP) o documentos (PDF, DOC, DOCX).',
            'attachments.*.max'   => 'Cada archivo no debe superar 10 MB.',
            'attachments.max'     => 'No puedes adjuntar más de 5 archivos por mensaje.',
        ];
    }
}
