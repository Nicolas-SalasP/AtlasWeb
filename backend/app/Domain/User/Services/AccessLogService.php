<?php

namespace App\Domain\User\Services;

use App\Domain\User\Enums\AccessAction;
use App\Domain\User\Models\AccessLog;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Throwable;

class AccessLogService
{
    public function log(?int $userId, AccessAction $action, Request $request): void
    {
        try {
            AccessLog::create([
                'user_id'    => $userId,
                'ip_address' => $request->ip(),
                'action'     => $action->value,
                'user_agent' => substr((string) $request->userAgent(), 0, 500),
                'created_at' => now(),
            ]);
        } catch (Throwable $e) {
            Log::error('Error guardando AccessLog: ' . $e->getMessage());
        }
    }

    public function getRecentForUser(int $userId, int $limit = 5): Collection
    {
        return AccessLog::where('user_id', $userId)
            ->orderByDesc('created_at')
            ->take($limit)
            ->get();
    }
}
