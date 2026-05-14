<?php

namespace App\Http\Resources\User;

use App\Domain\User\Models\AccessLog;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class AccessLogResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        /** @var AccessLog $log */
        $log = $this->resource;

        $location = 'Ubicación desconocida';
        if (!empty($log->city)) {
            $location = $log->city . (!empty($log->region) ? ", {$log->region}" : '');
        }

        return [
            'id'         => $log->id,
            'ip'         => $log->ip_address,
            'location'   => $location,
            'action'     => $log->action,
            'device'     => 'Navegador Web',
            'date'       => $log->created_at?->diffForHumans(),
            'exact_date' => $log->created_at?->format('d/m/Y H:i'),
        ];
    }
}
