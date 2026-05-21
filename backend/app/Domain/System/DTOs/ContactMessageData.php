<?php

namespace App\Domain\System\DTOs;

final readonly class ContactMessageData
{
    public function __construct(
        public string $nombre,
        public string $email,
        public ?string $telefono,
        public string $asunto,
        public string $mensaje,
    ) {
    }

    public static function fromValidated(array $data): self
    {
        return new self(
            nombre: trim((string) $data['nombre']),
            email: strtolower(trim((string) $data['email'])),
            telefono: isset($data['telefono']) ? trim((string) $data['telefono']) : null,
            asunto: trim((string) $data['asunto']),
            mensaje: trim((string) $data['mensaje']),
        );
    }

    public function toMailableArray(): array
    {
        return [
            'nombre'   => $this->nombre,
            'email'    => $this->email,
            'telefono' => $this->telefono,
            'asunto'   => $this->asunto,
            'mensaje'  => $this->mensaje,
        ];
    }
}
