<?php

namespace App\Domain\User\Support;

use App\Domain\User\Enums\UserRole;
use App\Domain\User\Exceptions\ForbiddenUserOperationException;
use App\Domain\User\Models\User;

final class PermissionGuard
{
    public const SUPER_ADMIN_EMAIL = 'nsalas@tenri.cl';

    public static function isSuperAdmin(User $user): bool
    {
        $permissions = $user->permissions !== null
            ? $user->permissions
            : ($user->role?->permissions ?? []);

        return is_array($permissions)
            && isset($permissions['all'])
            && $permissions['all'] === true;
    }

    public static function ensureCanModifyTarget(User $actor, User $target, array $incoming): void
    {
        $actorIsSuper = self::isSuperAdmin($actor);
        $targetIsSuperEmail = $target->email === self::SUPER_ADMIN_EMAIL;

        if ($targetIsSuperEmail && !$actorIsSuper) {
            throw new ForbiddenUserOperationException(
                'Operación denegada. Solo el Super Administrador puede modificar esta cuenta.'
            );
        }

        if ($targetIsSuperEmail
            && array_key_exists('role_id', $incoming)
            && (int) $incoming['role_id'] !== UserRole::Admin->value
        ) {
            throw new ForbiddenUserOperationException(
                'Operación denegada. El Super Admin principal no puede ser degradado.'
            );
        }

        if ($actorIsSuper) {
            return;
        }

        if (array_key_exists('role_id', $incoming)
            && (int) $incoming['role_id'] === UserRole::Admin->value
        ) {
            throw new ForbiddenUserOperationException(
                'Acceso denegado. No puedes asignar el rol de Super Administrador.'
            );
        }

        if (array_key_exists('permissions', $incoming) && $incoming['permissions'] !== null) {
            $newPerms = $incoming['permissions'];
            if (is_array($newPerms) && isset($newPerms['all']) && $newPerms['all'] === true) {
                throw new ForbiddenUserOperationException(
                    'Acceso denegado. No puedes otorgar el permiso de Acceso Total.'
                );
            }
        }

        $targetPerms = is_array($target->permissions) ? $target->permissions : [];
        if (isset($targetPerms['all']) && $targetPerms['all'] === true) {
            throw new ForbiddenUserOperationException(
                'Acceso denegado. No puedes modificar a un usuario con Acceso Total.'
            );
        }
    }
}
