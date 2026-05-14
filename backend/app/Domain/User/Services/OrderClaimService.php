<?php

namespace App\Domain\User\Services;

use App\Domain\Order\Services\OrderService;
use App\Domain\User\Exceptions\InvalidOtpException;
use App\Domain\User\Models\User;
use App\Domain\User\Support\EmailMasker;
use App\Mail\OrderClaimOtp;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Mail;

class OrderClaimService
{
    private const OTP_CACHE_PREFIX = 'order_claim_otp_';
    private const OTP_TTL_SECONDS = 900;

    public function __construct(private readonly OrderService $orderService)
    {
    }

    public function detectClaimableEmails(User $user): array
    {
        if (empty($user->rut)) {
            return [];
        }

        $unlinked = $this->orderService->findUnclaimedByRut($user->rut);

        $emails = [];
        foreach ($unlinked as $order) {
            $email = $order->customer_data['email'] ?? null;
            if (!$email) {
                continue;
            }

            $masked = EmailMasker::mask((string) $email);
            if ($masked !== null) {
                $emails[$masked] = true;
            }
        }

        return array_keys($emails);
    }

    public function requestOtp(User $user, string $historicalEmail): bool
    {
        if (empty($user->rut)) {
            return false;
        }

        $historicalEmail = strtolower(trim($historicalEmail));
        $matches = $this->orderService->findUnclaimedByRutAndEmail($user->rut, $historicalEmail);

        if ($matches->isEmpty()) {
            return false;
        }

        $otp = random_int(100000, 999999);
        $cacheKey = $this->buildCacheKey($user->id, $historicalEmail);

        Cache::put($cacheKey, $otp, self::OTP_TTL_SECONDS);

        Mail::to($historicalEmail)->send(new OrderClaimOtp($otp));

        return true;
    }

    public function confirmAndLink(User $user, string $historicalEmail, int $otp): int
    {
        $historicalEmail = strtolower(trim($historicalEmail));
        $cacheKey = $this->buildCacheKey($user->id, $historicalEmail);
        $cached = Cache::get($cacheKey);

        if ($cached === null || (int) $cached !== $otp) {
            throw new InvalidOtpException();
        }

        $linked = $this->orderService->linkUnclaimedOrders(
            userId: (int) $user->id,
            rut: (string) $user->rut,
            email: $historicalEmail,
        );

        Cache::forget($cacheKey);

        return $linked;
    }

    private function buildCacheKey(int $userId, string $email): string
    {
        return self::OTP_CACHE_PREFIX . $userId . '_' . $email;
    }
}
