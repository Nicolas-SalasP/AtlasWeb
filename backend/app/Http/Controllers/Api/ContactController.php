<?php

namespace App\Http\Controllers\Api;

use App\Domain\System\DTOs\ContactMessageData;
use App\Domain\System\Services\ContactService;
use App\Http\Controllers\Controller;
use App\Http\Requests\Contact\ContactRequest;
use Illuminate\Http\JsonResponse;
use Throwable;

class ContactController extends Controller
{
    public function __construct(private readonly ContactService $contactService)
    {
    }

    public function submit(ContactRequest $request): JsonResponse
    {
        $data = ContactMessageData::fromValidated($request->validated());

        try {
            $this->contactService->send($data);
        } catch (Throwable) {
            return response()->json([
                'success' => false,
                'message' => 'No pudimos enviar tu mensaje. Por favor inténtalo nuevamente más tarde.',
            ], 500);
        }

        return response()->json([
            'success' => true,
            'message' => 'Mensaje enviado correctamente',
        ]);
    }
}
