<?php

namespace App\Domain\Order\Services;

use App\Domain\Catalog\Services\CatalogService;
use App\Domain\Order\DTOs\CreateOrderData;
use App\Domain\Order\DTOs\UpdateOrderData;
use App\Domain\Order\Enums\OrderStatus;
use App\Domain\Order\Exceptions\InvalidOrderTransitionException;
use App\Domain\Order\Exceptions\OrderNotFoundException;
use App\Domain\Order\Exceptions\UnauthorizedOrderAccessException;
use App\Domain\Order\Models\Order;
use App\Domain\Order\Models\OrderStatusLog;
use App\Domain\Order\Support\ChileShippingRates;
use App\Domain\Order\Support\OrderStateMachine;
use App\Domain\Payment\Enums\PaymentMethod;
use App\Domain\Product\Services\ProductService;
use App\Domain\User\Models\User;
use DateTimeInterface;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class OrderService
{
    public function __construct(
        private readonly ProductService $productService,
        private readonly CatalogService $catalogService,
    ) {
    }

    public function paginateForUser(int $userId, int $perPage = 20): LengthAwarePaginator
    {
        return Order::with('items.product')
            ->where('user_id', $userId)
            ->orderByDesc('created_at')
            ->paginate($perPage);
    }

    public function paginateAll(array $filters = [], int $perPage = 25): LengthAwarePaginator
    {
        $query = Order::with(['user', 'items.product'])
            ->orderByDesc('created_at');

        $this->applyFilters($query, $filters);

        return $query->paginate($perPage);
    }

    public function listForUser(int $userId): Collection
    {
        return Order::with('items.product')
            ->where('user_id', $userId)
            ->orderByDesc('created_at')
            ->get();
    }

    public function listAll(array $filters = []): Collection
    {
        $query = Order::with(['user', 'items.product'])
            ->orderByDesc('created_at');

        $this->applyFilters($query, $filters);

        return $query->get();
    }

    public function findFor(int $orderId, User $viewer): Order
    {
        $order = Order::with(['user', 'items.product', 'statusLogs.user'])->find($orderId);

        if (!$order) {
            throw new OrderNotFoundException($orderId);
        }

        $isAdmin = (int) $viewer->role_id === 1;
        $isOwner = (int) $order->user_id === (int) $viewer->id;

        if (!$isAdmin && !$isOwner) {
            throw new UnauthorizedOrderAccessException();
        }

        return $order;
    }

    public function findByIdOrFail(int $orderId): Order
    {
        $order = Order::find($orderId);

        if (!$order) {
            throw new OrderNotFoundException($orderId);
        }

        return $order;
    }

    public function findByTransactionToken(string $token): ?Order
    {
        return Order::where('transaction_token', $token)->first();
    }

    public function findUnclaimedByRut(string $rut): Collection
    {
        if ($rut === '') {
            return new Collection();
        }

        return Order::where('rut', $rut)
            ->whereNull('user_id')
            ->get();
    }

    public function findUnclaimedByRutAndEmail(string $rut, string $email): Collection
    {
        if ($rut === '' || $email === '') {
            return new Collection();
        }

        $needle = strtolower($email);

        return Order::where('rut', $rut)
            ->whereNull('user_id')
            ->get()
            ->filter(function (Order $order) use ($needle) {
                $orderEmail = $order->customer_data['email'] ?? null;
                if (!is_string($orderEmail)) {
                    return false;
                }

                return strtolower($orderEmail) === $needle;
            })
            ->values();
    }

    public function linkUnclaimedOrders(int $userId, string $rut, string $email): int
    {
        if ($rut === '' || $email === '') {
            return 0;
        }

        $matches = $this->findUnclaimedByRutAndEmail($rut, $email);

        if ($matches->isEmpty()) {
            return 0;
        }

        return DB::transaction(function () use ($matches, $userId) {
            $count = 0;

            foreach ($matches as $order) {
                $order->update(['user_id' => $userId]);
                $count++;
            }

            return $count;
        });
    }

    public function pendingTransfersByAmount(int $amount): Collection
    {
        return Order::with('user')
            ->where('status', OrderStatus::Pending)
            ->where('payment_method', PaymentMethod::Transfer->value)
            ->where('total', $amount)
            ->get();
    }

    public function attachPaymentMethod(int $orderId, PaymentMethod $method, ?string $transactionToken = null): Order
    {
        return DB::transaction(function () use ($orderId, $method, $transactionToken) {
            $order = Order::lockForUpdate()->find($orderId);

            if (!$order) {
                throw new OrderNotFoundException($orderId);
            }

            if ($order->status->isTerminal() || $order->status === OrderStatus::Paid) {
                throw new InvalidOrderTransitionException($order->status, $order->status);
            }

            $order->payment_method = $method->value;

            if ($transactionToken !== null) {
                $order->transaction_token = $transactionToken;
            }

            $order->save();

            return $order->fresh(['user', 'items.product']);
        });
    }

    public function create(CreateOrderData $data): Order
    {
        return DB::transaction(function () use ($data) {
            $itemsToInsert = [];
            $subtotal = 0;
            $hasPhysicalProduct = false;

            foreach ($data->items as $item) {
                $rawId = (string) ($item['id'] ?? '');
                $quantity = (int) ($item['quantity'] ?? 0);

                if ($quantity < 1) {
                    continue;
                }

                if (str_starts_with($rawId, 'service-')) {
                    $serviceId = (int) str_replace('service-', '', $rawId);
                    $service = $this->catalogService->findById($serviceId);

                    $lineTotal = (int) $service->price * $quantity;
                    $itemsToInsert[] = [
                        'product_id'   => null,
                        'service_id'   => $service->id,
                        'product_name' => $service->name,
                        'sku_snapshot' => 'SRV-' . $service->id,
                        'quantity'     => $quantity,
                        'unit_price'   => (int) $service->price,
                        'total_line'   => $lineTotal,
                        'item_status'  => 'active',
                    ];
                    $subtotal += $lineTotal;

                    continue;
                }

                $hasPhysicalProduct = true;

                $product = $this->productService->reserveStock(
                    productId: (int) $rawId,
                    quantity: $quantity,
                    actorUserId: $data->userId,
                    reason: 'Reserva por creación de orden',
                );

                $lineTotal = (int) $product->price * $quantity;
                $itemsToInsert[] = [
                    'product_id'   => $product->id,
                    'service_id'   => null,
                    'product_name' => $product->name,
                    'sku_snapshot' => $product->sku,
                    'quantity'     => $quantity,
                    'unit_price'   => (int) $product->price,
                    'total_line'   => $lineTotal,
                    'item_status'  => 'sold',
                ];
                $subtotal += $lineTotal;
            }

            $region = $data->customerData['region'] ?? 'Metropolitana';
            $shippingCost = $hasPhysicalProduct ? ChileShippingRates::for($region) : 0;

            $cleanAddress = trim(strip_tags((string) ($data->shippingAddress ?? '')));
            $cleanNotes = trim(strip_tags((string) ($data->notes ?? '')));
            $cleanCustomerData = $this->sanitizeCustomerData($data->customerData);

            $order = Order::create([
                'user_id'           => $data->userId,
                'order_number'      => $this->generateOrderNumber(),
                'status'            => OrderStatus::Pending,
                'subtotal'          => $subtotal,
                'shipping_cost'     => $shippingCost,
                'total'             => $subtotal + $shippingCost,
                'shipping_address'  => $cleanAddress !== '' ? $cleanAddress : null,
                'customer_data'     => $cleanCustomerData,
                'notes'             => $cleanNotes !== '' ? $cleanNotes : null,
                'rut'               => $cleanCustomerData['rut'] ?? null,
                'terms_accepted_at' => now(),
                'terms_accepted_ip' => $data->clientIp,
            ]);

            foreach ($itemsToInsert as $itemData) {
                $order->items()->create($itemData);
            }

            return $order->load(['user', 'items.product']);
        });
    }

    public function update(int $orderId, UpdateOrderData $data): Order
    {
        return DB::transaction(function () use ($orderId, $data) {
            $order = Order::with('items')->lockForUpdate()->find($orderId);

            if (!$order) {
                throw new OrderNotFoundException($orderId);
            }

            $oldStatus = $order->status;
            $statusChanged = $data->statusProvided
                && $data->status !== null
                && $data->status !== $oldStatus;

            if ($statusChanged) {
                if (!OrderStateMachine::canTransition($oldStatus, $data->status)) {
                    throw new InvalidOrderTransitionException($oldStatus, $data->status);
                }

                if ($data->status->reversesStock() && !$oldStatus->reversesStock()) {
                    $reason = $data->status === OrderStatus::Cancelled
                        ? 'Restauración por anulación de orden'
                        : 'Restauración por reembolso de orden';

                    foreach ($order->items as $item) {
                        if ($item->product_id) {
                            $this->productService->restoreStock(
                                productId: (int) $item->product_id,
                                quantity: (int) $item->quantity,
                                orderId: (int) $order->id,
                                actorUserId: $data->actorUserId,
                                reason: $reason,
                            );
                        }
                    }
                }

                $order->status = $data->status;
            }

            if ($data->notesProvided) {
                $order->notes = $data->notes !== null && $data->notes !== '' ? $data->notes : null;
            }

            if ($data->shippingProviderProvided) {
                $order->shipping_provider = $data->shippingProvider;
            }

            if ($data->trackingNumberProvided) {
                $order->tracking_number = $data->trackingNumber !== null && $data->trackingNumber !== ''
                    ? $data->trackingNumber
                    : null;
            }

            $order->save();

            if ($statusChanged) {
                OrderStatusLog::create([
                    'order_id'    => $order->id,
                    'user_id'     => $data->actorUserId,
                    'from_status' => $oldStatus,
                    'to_status'   => $data->status,
                    'actor_name'  => $data->actorName,
                ]);
            }

            return $order->load(['user', 'items.product', 'statusLogs.user']);
        });
    }

    public function markAsPaidFromBankTransfer(
        Order $order,
        string $transferReference,
        DateTimeInterface $transferDate,
        ?int $actorUserId = null,
        ?string $actorName = null,
        ?string $auditReason = null,
    ): Order {
        return DB::transaction(function () use ($order, $transferReference, $transferDate, $actorUserId, $actorName, $auditReason) {
            $order = Order::lockForUpdate()->findOrFail($order->id);

            if ($order->status === OrderStatus::Paid) {
                return $order->load(['user', 'items.product', 'statusLogs.user']);
            }

            $oldStatus = $order->status;

            if (!OrderStateMachine::canTransition($oldStatus, OrderStatus::Paid)) {
                throw new InvalidOrderTransitionException($oldStatus, OrderStatus::Paid);
            }

            $order->status = OrderStatus::Paid;
            $order->transfer_reference = $transferReference;
            $order->transfer_date = $transferDate;
            $order->save();

            OrderStatusLog::create([
                'order_id'    => $order->id,
                'user_id'     => $actorUserId,
                'from_status' => $oldStatus,
                'to_status'   => OrderStatus::Paid,
                'actor_name'  => $actorName,
                'reason'      => $auditReason,
            ]);

            return $order->load(['user', 'items.product', 'statusLogs.user']);
        });
    }

    public function markAsPaidFromWebpay(Order $order, array $payload, ?int $actorUserId = null): Order
    {
        return DB::transaction(function () use ($order, $payload, $actorUserId) {
            $order = Order::lockForUpdate()->findOrFail($order->id);

            if ($order->status === OrderStatus::Paid) {
                return $order->load(['user', 'items.product', 'statusLogs.user']);
            }

            $oldStatus = $order->status;

            if (!OrderStateMachine::canTransition($oldStatus, OrderStatus::Paid)) {
                throw new InvalidOrderTransitionException($oldStatus, OrderStatus::Paid);
            }

            $order->status = OrderStatus::Paid;
            $order->payment_data = $payload;
            $order->save();

            OrderStatusLog::create([
                'order_id'    => $order->id,
                'user_id'     => $actorUserId,
                'from_status' => $oldStatus,
                'to_status'   => OrderStatus::Paid,
                'actor_name'  => null,
                'reason'      => 'Pago confirmado vía Webpay',
            ]);

            return $order->load(['user', 'items.product', 'statusLogs.user']);
        });
    }

    public function failWebpayPayment(Order $order, array $payload): Order
    {
        return DB::transaction(function () use ($order, $payload) {
            $order = Order::lockForUpdate()->findOrFail($order->id);
            $oldStatus = $order->status;

            $order->payment_data = $payload;

            if (OrderStateMachine::canTransition($oldStatus, OrderStatus::Cancelled)) {
                $order->status = OrderStatus::Cancelled;
                $order->save();

                OrderStatusLog::create([
                    'order_id'    => $order->id,
                    'user_id'     => null,
                    'from_status' => $oldStatus,
                    'to_status'   => OrderStatus::Cancelled,
                    'actor_name'  => null,
                    'reason'      => 'Pago Webpay rechazado o cancelado por el cliente',
                ]);
            } else {
                $order->save();
            }

            return $order->load(['user', 'items.product', 'statusLogs.user']);
        });
    }

    private function generateOrderNumber(): string
    {
        do {
            $candidate = 'ORD-' . strtoupper(Str::random(8));
        } while (Order::where('order_number', $candidate)->exists());

        return $candidate;
    }

    private function sanitizeCustomerData(array $data): array
    {
        $clean = [];

        foreach ($data as $key => $value) {
            if (is_string($value)) {
                $stripped = strip_tags($value);
                $stripped = preg_replace('/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/u', '', $stripped) ?? '';
                $clean[$key] = trim($stripped);
            } elseif (is_array($value)) {
                $clean[$key] = $this->sanitizeCustomerData($value);
            } else {
                $clean[$key] = $value;
            }
        }

        return $clean;
    }

    private function applyFilters(Builder $query, array $filters): void
    {
        if (!empty($filters['status'])) {
            $rawValues = is_array($filters['status'])
                ? $filters['status']
                : explode(',', (string) $filters['status']);

            $valid = [];
            foreach ($rawValues as $raw) {
                $case = OrderStatus::tryFrom(trim((string) $raw));
                if ($case !== null) {
                    $valid[] = $case->value;
                }
            }

            if (!empty($valid)) {
                $query->whereIn('status', $valid);
            }
        }

        if (!empty($filters['from'])) {
            $query->whereDate('created_at', '>=', $filters['from']);
        }

        if (!empty($filters['to'])) {
            $query->whereDate('created_at', '<=', $filters['to']);
        }

        if (!empty($filters['q'])) {
            $needle = trim((string) $filters['q']);
            $query->where(function (Builder $qq) use ($needle) {
                $qq->where('order_number', 'like', "%{$needle}%")
                    ->orWhereHas('user', function (Builder $u) use ($needle) {
                        $u->where('name', 'like', "%{$needle}%")
                            ->orWhere('email', 'like', "%{$needle}%");
                    });
            });
        }
    }
}
