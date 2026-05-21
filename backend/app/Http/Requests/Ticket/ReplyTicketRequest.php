<?php

namespace App\Http\Requests\Ticket;

use Illuminate\Foundation\Http\FormRequest;

class ReplyTicketRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user() !== null;
    }

    public function rules(): array
    {
        return [
            'mensaje'       => ['required_without:attachments', 'nullable', 'string', 'max:10000'],
            'attachments'   => ['nullable', 'array', 'max:5'],
            'attachments.*' => ['file', 'mimes:jpeg,jpg,png,webp,pdf,doc,docx', 'max:10240'],
        ];
    }

    public function messages(): array
    {
        return [
            'mensaje.required_without' => 'Debes ingresar un mensaje o adjuntar al menos un archivo.',
            'attachments.*.mimes'      => 'Solo se permiten imágenes (JPG, PNG, WEBP) o documentos (PDF, DOC, DOCX).',
            'attachments.*.max'        => 'Cada archivo no debe superar 10 MB.',
            'attachments.max'          => 'No puedes adjuntar más de 5 archivos por mensaje.',
        ];
    }
}
