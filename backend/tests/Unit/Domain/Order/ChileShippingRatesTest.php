<?php

namespace Tests\Unit\Domain\Order;

use App\Domain\Order\Support\ChileShippingRates;
use PHPUnit\Framework\TestCase;

class ChileShippingRatesTest extends TestCase
{
    public function test_metropolitana_has_cheapest_rate(): void
    {
        $this->assertSame(3990, ChileShippingRates::for('Metropolitana'));
    }

    public function test_magallanes_has_expensive_rate(): void
    {
        $this->assertSame(12990, ChileShippingRates::for('Magallanes'));
    }

    public function test_aysen_has_expensive_rate(): void
    {
        $this->assertSame(12990, ChileShippingRates::for('Aysén'));
    }

    public function test_valparaiso_has_correct_rate(): void
    {
        $this->assertSame(5990, ChileShippingRates::for('Valparaíso'));
    }

    public function test_biobio_has_correct_rate(): void
    {
        $this->assertSame(6990, ChileShippingRates::for('Biobío'));
    }

    public function test_unknown_region_returns_default_rate(): void
    {
        $this->assertSame(7990, ChileShippingRates::for('Region Inexistente'));
    }

    public function test_empty_string_returns_default_rate(): void
    {
        $this->assertSame(7990, ChileShippingRates::for(''));
    }

    public function test_supported_regions_contains_all_main_regions(): void
    {
        $regions = ChileShippingRates::supportedRegions();

        $this->assertContains('Metropolitana', $regions);
        $this->assertContains('Valparaíso', $regions);
        $this->assertContains('Biobío', $regions);
        $this->assertContains('Magallanes', $regions);
        $this->assertContains('Aysén', $regions);
    }

    public function test_supported_regions_returns_array(): void
    {
        $this->assertIsArray(ChileShippingRates::supportedRegions());
        $this->assertNotEmpty(ChileShippingRates::supportedRegions());
    }

    public function test_supported_regions_has_at_least_16_regions(): void
    {
        $this->assertGreaterThanOrEqual(16, count(ChileShippingRates::supportedRegions()));
    }

    public function test_ohiggins_with_apostrophe(): void
    {
        $this->assertSame(5990, ChileShippingRates::for("O'Higgins"));
    }

    public function test_all_rates_are_positive_integers(): void
    {
        foreach (ChileShippingRates::supportedRegions() as $region) {
            $rate = ChileShippingRates::for($region);
            $this->assertIsInt($rate);
            $this->assertGreaterThan(0, $rate);
        }
    }

    public function test_region_lookup_is_case_sensitive(): void
    {
        $this->assertSame(3990, ChileShippingRates::for('Metropolitana'));
        $this->assertSame(7990, ChileShippingRates::for('metropolitana'));
        $this->assertSame(7990, ChileShippingRates::for('METROPOLITANA'));
    }
}
