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

        [$deviceType, $browser] = $this->parseUserAgent((string) ($log->user_agent ?? ''));

        return [
            'id'          => $log->id,
            'ip'          => $log->ip_address,
            'location'    => $location,
            'action'      => $log->action,
            'device'      => $deviceType,
            'browser'     => $browser,
            'user_agent'  => $log->user_agent,
            'date'        => $log->created_at?->diffForHumans(),
            'exact_date'  => $log->created_at?->format('d/m/Y H:i'),
            'created_at'  => $log->created_at?->toIso8601String(),
        ];
    }

    private function parseUserAgent(string $ua): array
    {
        if ($ua === '') {
            return ['Desconocido', null];
        }

        $deviceType = 'Desktop';
        if (preg_match('/iPad|Tablet/i', $ua)) {
            $deviceType = 'Tablet';
        } elseif (preg_match('/Mobile|Android|iPhone|iPod/i', $ua)) {
            $deviceType = 'Mobile';
        }

        $browser = null;
        if (stripos($ua, 'Edg/') !== false || stripos($ua, 'Edge/') !== false) {
            $browser = 'Edge';
        } elseif (stripos($ua, 'OPR/') !== false || stripos($ua, 'Opera') !== false) {
            $browser = 'Opera';
        } elseif (stripos($ua, 'Firefox') !== false) {
            $browser = 'Firefox';
        } elseif (stripos($ua, 'Chrome') !== false) {
            $browser = 'Chrome';
        } elseif (stripos($ua, 'Safari') !== false) {
            $browser = 'Safari';
        }

        return [$deviceType, $browser];
    }
}
