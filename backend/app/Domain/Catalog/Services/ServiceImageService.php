<?php

namespace App\Domain\Catalog\Services;

use App\Domain\Catalog\Exceptions\ServiceImageUploadException;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use Throwable;

class ServiceImageService
{
    public function store(UploadedFile $file): string
    {
        try {
            $filename = Str::random(20) . '.' . $file->getClientOriginalExtension();
            $path = $file->storeAs('services', $filename, 'public');

            if ($path === false) {
                throw new ServiceImageUploadException("No se pudo almacenar el archivo {$file->getClientOriginalName()}");
            }

            return '/storage/' . $path;
        } catch (ServiceImageUploadException $e) {
            throw $e;
        } catch (Throwable $e) {
            throw new ServiceImageUploadException($e->getMessage(), $e);
        }
    }

    public function deletePhysical(?string $url): void
    {
        if ($url === null || $url === '') {
            return;
        }

        $relative = str_replace('/storage/', '', $url);

        if (Storage::disk('public')->exists($relative)) {
            Storage::disk('public')->delete($relative);
        }
    }
}
