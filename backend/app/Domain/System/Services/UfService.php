<?php

namespace App\Domain\System\Services;

use App\Domain\System\Enums\SettingKey;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class UfService
{
    private const CACHE_KEY = 'uf_valor_diario';
    private const CACHE_TTL = 60 * 60 * 24;
    private const API_URL   = 'https://mindicador.cl/api/uf';

    public function valorHoy(): float
    {
        return Cache::remember(self::CACHE_KEY, self::CACHE_TTL, function () {
            return $this->fetchDesdeApi() ?? $this->fallbackDesdeBd();
        });
    }

    public function clpDesdeUf(float $uf): int
    {
        return (int) round($uf * $this->valorHoy());
    }

    public function refrescar(): float
    {
        Cache::forget(self::CACHE_KEY);

        $valor = $this->fetchDesdeApi();

        if ($valor !== null) {
            $this->guardarEnBd($valor);
            Cache::put(self::CACHE_KEY, $valor, self::CACHE_TTL);

            return $valor;
        }

        return $this->fallbackDesdeBd();
    }

    public function info(): array
    {
        $valor = $this->valorHoy();
        $cacheTtl = Cache::getStore()->get(self::CACHE_KEY) !== null;

        return [
            'valor'   => $valor,
            'clp'     => number_format($valor, 2, ',', '.'),
            'fuente'  => 'mindicador.cl',
            'cached'  => $cacheTtl,
        ];
    }

    private function fetchDesdeApi(): ?float
    {
        try {
            $response = Http::timeout(5)->get(self::API_URL);

            if (!$response->successful()) {
                return null;
            }

            $data = $response->json();
            $valor = $data['serie'][0]['valor'] ?? null;

            if ($valor === null || !is_numeric($valor)) {
                return null;
            }

            $valor = (float) $valor;
            $this->guardarEnBd($valor);

            return $valor;
        } catch (\Throwable $e) {
            Log::warning('UfService: no se pudo obtener UF desde mindicador.cl', [
                'error' => $e->getMessage(),
            ]);

            return null;
        }
    }

    private function fallbackDesdeBd(): float
    {
        try {
            $setting = \App\Domain\System\Models\Setting::where('key', SettingKey::UfValue->value)->first();

            if ($setting && is_numeric($setting->value)) {
                return (float) $setting->value;
            }
        } catch (\Throwable) {
        }

        return 40307.0;
    }

    private function guardarEnBd(float $valor): void
    {
        try {
            \App\Domain\System\Models\Setting::updateOrCreate(
                ['key' => SettingKey::UfValue->value],
                ['value' => (string) $valor]
            );
        } catch (\Throwable $e) {
            Log::warning('UfService: no se pudo guardar UF en BD', ['error' => $e->getMessage()]);
        }
    }
}
