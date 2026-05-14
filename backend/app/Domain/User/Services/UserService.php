<?php

namespace App\Domain\User\Services;

use App\Domain\User\DTOs\UpdateUserData;
use App\Domain\User\Exceptions\EmailAlreadyTakenException;
use App\Domain\User\Exceptions\UserNotFoundException;
use App\Domain\User\Models\User;
use App\Domain\User\Support\PermissionGuard;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Collection;

class UserService
{
    public function listAllForAdmin(): Collection
    {
        return User::withCount('tickets')
            ->with([
                'billingProfiles' => fn ($q) => $q->where('is_default', true),
                'role',
            ])
            ->orderByDesc('created_at')
            ->get()
            ->each(function (User $user) {
                $defaultProfile = $user->billingProfiles->first();
                $user->setAttribute('company_name', $defaultProfile?->business_name);
            });
    }

    public function paginateForAdmin(array $filters = [], int $perPage = 25): LengthAwarePaginator
    {
        $query = User::withCount('tickets')
            ->with([
                'billingProfiles' => fn ($q) => $q->where('is_default', true),
                'role',
            ])
            ->orderByDesc('created_at');

        $this->applyFilters($query, $filters);

        $paginator = $query->paginate($perPage);

        $paginator->getCollection()->each(function (User $user) {
            $defaultProfile = $user->billingProfiles->first();
            $user->setAttribute('company_name', $defaultProfile?->business_name);
        });

        return $paginator;
    }

    public function findDetail(int $id): User
    {
        $user = User::with([
            'role',
            'tickets' => fn ($q) => $q->orderByDesc('created_at'),
            'orders'  => fn ($q) => $q->orderByDesc('created_at'),
        ])->find($id);

        if (!$user) {
            throw new UserNotFoundException($id);
        }

        return $user;
    }

    public function updateAsAdmin(User $actor, int $targetId, UpdateUserData $data): User
    {
        $target = User::find($targetId);

        if (!$target) {
            throw new UserNotFoundException($targetId);
        }

        $incoming = [
            'role_id'     => $data->roleIdProvided ? $data->roleId : null,
            'permissions' => $data->permissionsProvided ? $data->permissions : null,
        ];

        if (!$data->roleIdProvided) {
            unset($incoming['role_id']);
        }
        if (!$data->permissionsProvided) {
            unset($incoming['permissions']);
        }

        PermissionGuard::ensureCanModifyTarget($actor, $target, $incoming);

        if ($data->email !== $target->email
            && User::where('email', $data->email)->where('id', '!=', $target->id)->exists()
        ) {
            throw new EmailAlreadyTakenException($data->email);
        }

        $target->name = $data->name;
        $target->email = $data->email;
        $target->is_active = $data->isActive;

        if ($data->phoneProvided) {
            $target->phone = $data->phone;
        }

        if ($data->roleIdProvided) {
            $target->role_id = $data->roleId;
        }

        if ($data->permissionsProvided) {
            $target->permissions = $data->permissions;
        }

        $target->save();

        return $target->fresh('role');
    }

    private function applyFilters(Builder $query, array $filters): void
    {
        if (!empty($filters['q'])) {
            $needle = trim((string) $filters['q']);
            $query->where(function (Builder $q) use ($needle) {
                $q->where('name', 'like', "%{$needle}%")
                    ->orWhere('email', 'like', "%{$needle}%")
                    ->orWhere('rut', 'like', "%{$needle}%");
            });
        }

        if (array_key_exists('role_id', $filters) && $filters['role_id'] !== '' && $filters['role_id'] !== null) {
            $query->where('role_id', (int) $filters['role_id']);
        }

        if (array_key_exists('is_active', $filters) && $filters['is_active'] !== '' && $filters['is_active'] !== null) {
            $query->where('is_active', filter_var($filters['is_active'], FILTER_VALIDATE_BOOLEAN));
        }
    }
}
