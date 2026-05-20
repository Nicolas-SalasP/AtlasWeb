<?php

namespace App\Domain\Erp\DTOs;

use App\Domain\Catalog\Models\Service;
use App\Domain\User\Models\User;

final class ProvisionErpUserData
{
    public function __construct(
        public readonly int $tenriUserId,
        public readonly string $email,
        public readonly string $name,
        public readonly ?string $rut,
        public readonly string $passwordHash,
        public readonly string $planSlug,
        public readonly array $moduleKeys,
        public readonly string $rolErp,
    ) {
    }

    public static function fromUserAndService(User $user, Service $service): self
    {
        return new self(
            tenriUserId: $user->id,
            email: $user->email,
            name: $user->name,
            rut: $user->rut,
            passwordHash: $user->password,
            planSlug: $service->slug ?? 'erp-starter',
            moduleKeys: $service->module_keys ?? [],
            rolErp: self::resolveRol($service->slug),
        );
    }

    public function toPayload(): array
    {
        return [
            'tenri_user_id' => $this->tenriUserId,
            'email' => $this->email,
            'name' => $this->name,
            'rut' => $this->rut,
            'password_hash' => $this->passwordHash,
            'plan_slug' => $this->planSlug,
            'module_keys' => $this->moduleKeys,
            'rol_erp' => $this->rolErp,
        ];
    }

    private static function resolveRol(?string $slug): string
    {
        if ($slug === 'erp-starter') {
            return 'Auditor';
        }

        return 'Administrador';
    }
}
