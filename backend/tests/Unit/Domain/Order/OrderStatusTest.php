<?php

namespace Tests\Unit\Domain\Order;

use App\Domain\Order\Enums\OrderStatus;
use PHPUnit\Framework\TestCase;

class OrderStatusTest extends TestCase
{
    public function test_has_all_expected_statuses(): void
    {
        $expected = ['pending', 'paid', 'preparing', 'shipped', 'delivered', 'cancelled', 'refunded'];
        $actual = array_map(fn (OrderStatus $s) => $s->value, OrderStatus::cases());

        sort($expected);
        sort($actual);

        $this->assertEquals($expected, $actual);
    }

    public function test_pending_status_has_correct_label(): void
    {
        $this->assertEquals('Pendiente de pago', OrderStatus::Pending->label());
    }

    public function test_paid_status_has_correct_label(): void
    {
        $this->assertEquals('Pagado', OrderStatus::Paid->label());
    }

    public function test_preparing_status_has_correct_label(): void
    {
        $this->assertEquals('En preparación', OrderStatus::Preparing->label());
    }

    public function test_shipped_status_has_correct_label(): void
    {
        $this->assertEquals('Enviado', OrderStatus::Shipped->label());
    }

    public function test_delivered_status_has_correct_label(): void
    {
        $this->assertEquals('Entregado', OrderStatus::Delivered->label());
    }

    public function test_cancelled_is_terminal(): void
    {
        $this->assertTrue(OrderStatus::Cancelled->isTerminal());
    }

    public function test_refunded_is_terminal(): void
    {
        $this->assertTrue(OrderStatus::Refunded->isTerminal());
    }

    public function test_pending_is_not_terminal(): void
    {
        $this->assertFalse(OrderStatus::Pending->isTerminal());
    }

    public function test_paid_is_not_terminal(): void
    {
        $this->assertFalse(OrderStatus::Paid->isTerminal());
    }

    public function test_delivered_is_not_terminal(): void
    {
        $this->assertFalse(OrderStatus::Delivered->isTerminal());
    }

    public function test_cancelled_reverses_stock(): void
    {
        $this->assertTrue(OrderStatus::Cancelled->reversesStock());
    }

    public function test_refunded_reverses_stock(): void
    {
        $this->assertTrue(OrderStatus::Refunded->reversesStock());
    }

    public function test_paid_does_not_reverse_stock(): void
    {
        $this->assertFalse(OrderStatus::Paid->reversesStock());
    }

    public function test_values_returns_array_of_strings(): void
    {
        $values = OrderStatus::values();

        $this->assertIsArray($values);
        $this->assertContains('pending', $values);
        $this->assertContains('paid', $values);

        foreach ($values as $value) {
            $this->assertIsString($value);
        }
    }

    public function test_can_be_constructed_from_valid_string(): void
    {
        $this->assertSame(OrderStatus::Pending, OrderStatus::from('pending'));
        $this->assertSame(OrderStatus::Paid, OrderStatus::from('paid'));
    }

    public function test_try_from_returns_null_for_invalid_string(): void
    {
        $this->assertNull(OrderStatus::tryFrom('invalid_status'));
        $this->assertNull(OrderStatus::tryFrom(''));
        $this->assertNull(OrderStatus::tryFrom('open'));
    }
}
