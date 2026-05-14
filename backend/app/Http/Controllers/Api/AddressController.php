<?php

namespace App\Http\Controllers\Api;

use App\Domain\User\DTOs\AddressData;
use App\Domain\User\Exceptions\AddressNotFoundException;
use App\Domain\User\Models\User;
use App\Domain\User\Services\AddressService;
use App\Http\Controllers\Controller;
use App\Http\Requests\Address\StoreAddressRequest;
use App\Http\Resources\User\AddressResource;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class AddressController extends Controller
{
    public function __construct(private readonly AddressService $addressService)
    {
    }

    public function index(Request $request): JsonResponse
    {
        $user = $request->user();

        if (!$user instanceof User) {
            return response()->json(['message' => 'No autorizado'], 401);
        }

        $addresses = $this->addressService->listForUser($user);

        return response()->json(
            AddressResource::collection($addresses)->toArray($request)
        );
    }

    public function store(StoreAddressRequest $request): JsonResponse
    {
        $user = $request->user();

        if (!$user instanceof User) {
            return response()->json(['message' => 'No autorizado'], 401);
        }

        $data = AddressData::fromValidated($request->validated());
        $address = $this->addressService->createForUser($user, $data);

        return response()->json(
            (new AddressResource($address))->toArray($request),
            201
        );
    }

    public function destroy(Request $request, int $id): JsonResponse
    {
        $user = $request->user();

        if (!$user instanceof User) {
            return response()->json(['message' => 'No autorizado'], 401);
        }

        try {
            $this->addressService->deleteForUser($user, $id);
        } catch (AddressNotFoundException $e) {
            return response()->json(['message' => $e->getMessage()], 404);
        }

        return response()->json(['message' => 'Dirección eliminada']);
    }

    public function setDefault(Request $request, int $id): JsonResponse
    {
        $user = $request->user();

        if (!$user instanceof User) {
            return response()->json(['message' => 'No autorizado'], 401);
        }

        try {
            $address = $this->addressService->setDefaultForUser($user, $id);
        } catch (AddressNotFoundException $e) {
            return response()->json(['message' => $e->getMessage()], 404);
        }

        return response()->json(
            (new AddressResource($address))->toArray($request)
        );
    }
}
