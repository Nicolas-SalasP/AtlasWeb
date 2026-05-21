<?php

namespace Database\Seeders;

use App\Domain\Order\Enums\OrderStatus;
use App\Domain\Order\Models\Order;
use App\Domain\Order\Models\OrderItem;
use App\Domain\Payment\Enums\PaymentMethod;
use App\Domain\Product\Models\Product;
use App\Domain\User\Models\User;
use Illuminate\Database\Seeder;

class OrderSeeder extends Seeder
{
    public function run(): void
    {
        $insuban = User::where('email', 'contacto@insuban.cl')->first();
        $tsuki = User::where('email', 'ventas@tsuki.cl')->first();

        if (!$insuban || !$tsuki) {
            return;
        }

        $orders = [
            [
                'order_number'    => 'ORD-DEMO0001',
                'user'            => $insuban,
                'status'          => OrderStatus::Paid,
                'payment_method'  => PaymentMethod::Webpay->value,
                'days_ago'        => 25,
                'shipping_cost'   => 4500,
                'commune'         => 'Las Condes',
                'region'          => 'Metropolitana de Santiago',
                'items'           => [
                    ['sku' => 'CAM-HL-004', 'qty' => 1],
                    ['sku' => 'CBL-UTP-CAT6', 'qty' => 1],
                ],
            ],
            [
                'order_number'    => 'ORD-DEMO0002',
                'user'            => $insuban,
                'status'          => OrderStatus::Delivered,
                'payment_method'  => PaymentMethod::Transfer->value,
                'days_ago'        => 15,
                'shipping_cost'   => 4500,
                'commune'         => 'Las Condes',
                'region'          => 'Metropolitana de Santiago',
                'items'           => [
                    ['sku' => 'MK-HAP-AC3', 'qty' => 2],
                ],
            ],
            [
                'order_number'    => 'ORD-DEMO0003',
                'user'            => $tsuki,
                'status'          => OrderStatus::Paid,
                'payment_method'  => PaymentMethod::Webpay->value,
                'days_ago'        => 8,
                'shipping_cost'   => 3500,
                'commune'         => 'Providencia',
                'region'          => 'Metropolitana de Santiago',
                'items'           => [
                    ['sku' => 'TAT-INK-BLK', 'qty' => 5],
                ],
            ],
            [
                'order_number'    => 'ORD-DEMO0004',
                'user'            => $tsuki,
                'status'          => OrderStatus::Pending,
                'payment_method'  => PaymentMethod::Transfer->value,
                'days_ago'        => 2,
                'shipping_cost'   => 3500,
                'commune'         => 'Providencia',
                'region'          => 'Metropolitana de Santiago',
                'items'           => [
                    ['sku' => 'AUD-MIC-SM58', 'qty' => 1],
                ],
            ],
            [
                'order_number'    => 'ORD-DEMO0005',
                'user'            => $insuban,
                'status'          => OrderStatus::Shipped,
                'payment_method'  => PaymentMethod::Webpay->value,
                'days_ago'        => 4,
                'shipping_cost'   => 4500,
                'commune'         => 'Las Condes',
                'region'          => 'Metropolitana de Santiago',
                'items'           => [
                    ['sku' => 'CAM-IP-DOME', 'qty' => 3],
                ],
            ],
        ];

        foreach ($orders as $data) {
            $existing = Order::where('order_number', $data['order_number'])->first();
            if ($existing) {
                continue;
            }

            $subtotal = 0;
            $itemsToCreate = [];

            foreach ($data['items'] as $line) {
                $product = Product::where('sku', $line['sku'])->first();
                if (!$product) {
                    continue;
                }

                $lineTotal = (int) $product->price * (int) $line['qty'];
                $subtotal += $lineTotal;

                $itemsToCreate[] = [
                    'product_id'   => $product->id,
                    'service_id'   => null,
                    'product_name' => $product->name,
                    'sku_snapshot' => $product->sku,
                    'quantity'     => $line['qty'],
                    'unit_price'   => (int) $product->price,
                    'total_line'   => $lineTotal,
                    'item_status'  => 'sold',
                ];
            }

            if (empty($itemsToCreate)) {
                continue;
            }

            $createdAt = now()->subDays($data['days_ago']);

            $order = Order::create([
                'order_number'      => $data['order_number'],
                'user_id'           => $data['user']->id,
                'rut'               => $data['user']->rut,
                'subtotal'          => $subtotal,
                'shipping_cost'     => $data['shipping_cost'],
                'total'             => $subtotal + $data['shipping_cost'],
                'status'            => $data['status'],
                'payment_method'    => $data['payment_method'],
                'shipping_address'  => 'Dirección de demo seedeada',
                'customer_data'     => [
                    'nombre'  => $data['user']->name,
                    'email'   => $data['user']->email,
                    'rut'     => $data['user']->rut,
                    'comuna'  => $data['commune'],
                    'region'  => $data['region'],
                ],
                'terms_accepted_at' => $createdAt,
                'terms_accepted_ip' => '127.0.0.1',
                'created_at'        => $createdAt,
                'updated_at'        => $createdAt,
            ]);

            foreach ($itemsToCreate as $item) {
                OrderItem::create(array_merge($item, ['order_id' => $order->id]));
            }
        }
    }
}
