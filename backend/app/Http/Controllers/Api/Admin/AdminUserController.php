<?php

namespace App\Http\Controllers\Api\Admin;

use App\Domain\User\DTOs\UpdateUserData;
use App\Domain\User\Exceptions\EmailAlreadyTakenException;
use App\Domain\User\Exceptions\ForbiddenUserOperationException;
use App\Domain\User\Exceptions\UserNotFoundException;
use App\Domain\User\Models\User;
use App\Domain\User\Services\UserService;
use App\Http\Controllers\Controller;
use App\Http\Requests\User\UpdateUserRequest;
use App\Http\Resources\User\UserResource;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Throwable;

class AdminUserController extends Controller
{
    public function __construct(private readonly UserService $userService)
    {
    }

    public function index(Request $request): JsonResponse
    {
        $perPage = (int) $request->query('per_page', 0);

        if ($perPage > 0) {
            $perPage = max(1, min($perPage, 100));
            $filters = $request->only(['q', 'role_id', 'is_active']);

            $paginator = $this->userService->paginateForAdmin($filters, $perPage);
            $paginator->setCollection(
                $paginator->getCollection()->map(fn (User $user) => (new UserResource($user))->toArray($request))
            );

            return response()->json($paginator);
        }

        $users = $this->userService->listAllForAdmin();

        return response()->json(
            UserResource::collection($users)->toArray($request)
        );
    }

    public function show(Request $request, int $id): JsonResponse
    {
        try {
            $user = $this->userService->findDetail($id);
        } catch (UserNotFoundException $e) {
            return response()->json(['message' => $e->getMessage()], 404);
        }

        return response()->json(
            (new UserResource($user))->toArray($request)
        );
    }

    public function update(UpdateUserRequest $request, int $id): JsonResponse
    {
        $actor = $request->user();

        if (!$actor instanceof User) {
            return response()->json(['message' => 'No autorizado'], 401);
        }

        $data = UpdateUserData::fromValidated($request->validated());

        try {
            $user = $this->userService->updateAsAdmin($actor, $id, $data);
        } catch (UserNotFoundException $e) {
            return response()->json(['message' => $e->getMessage()], 404);
        } catch (ForbiddenUserOperationException $e) {
            return response()->json(['message' => $e->getMessage()], 403);
        } catch (EmailAlreadyTakenException $e) {
            return response()->json(['message' => $e->getMessage()], 422);
        } catch (Throwable $e) {
            Log::error("Error actualizando usuario {$id}: " . $e->getMessage());

            return response()->json(['message' => 'Error al actualizar el usuario'], 500);
        }

        return response()->json(
            (new UserResource($user))->toArray($request)
        );
    }
}
