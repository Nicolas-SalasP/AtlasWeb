<?php

namespace App\Domain\Catalog\Services;

use App\Domain\Catalog\DTOs\CreateServiceData;
use App\Domain\Catalog\DTOs\UpdateServiceData;
use App\Domain\Catalog\Exceptions\OfferingNotFoundException;
use App\Domain\Catalog\Models\Service;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Support\Facades\DB;
use Throwable;

class CatalogService
{
    public function __construct(private readonly ServiceImageService $imageService)
    {
    }

    public function findById(int $id): Service
    {
        $service = Service::find($id);

        if (!$service) {
            throw new OfferingNotFoundException($id);
        }

        return $service;
    }

    public function listActive(): Collection
    {
        return Service::where('is_active', true)
            ->orderBy('id')
            ->get();
    }

    public function listAll(): Collection
    {
        return Service::orderBy('id')->get();
    }

    public function create(CreateServiceData $data): Service
    {
        $uploadedUrl = null;

        try {
            if ($data->image !== null) {
                $uploadedUrl = $this->imageService->store($data->image);
            }

            return DB::transaction(function () use ($data, $uploadedUrl) {
                return Service::create([
                    'name'          => $data->name,
                    'description'   => $data->description,
                    'price'         => $data->price,
                    'duration_days' => $data->durationDays,
                    'features'      => $data->features ?? [],
                    'is_active'     => $data->isActive,
                    'image_url'     => $uploadedUrl,
                ]);
            });
        } catch (Throwable $e) {
            if ($uploadedUrl !== null) {
                $this->imageService->deletePhysical($uploadedUrl);
            }
            throw $e;
        }
    }

    public function update(int $id, UpdateServiceData $data): Service
    {
        $service = $this->findById($id);
        $newImageUrl = null;
        $previousImageUrl = $service->image_url;

        try {
            if ($data->image !== null) {
                $newImageUrl = $this->imageService->store($data->image);
            }

            $updated = DB::transaction(function () use ($service, $data, $newImageUrl) {
                if ($data->name !== null) {
                    $service->name = $data->name;
                }
                if ($data->price !== null) {
                    $service->price = $data->price;
                }
                if ($data->durationDays !== null) {
                    $service->duration_days = $data->durationDays;
                }
                if ($data->descriptionProvided) {
                    $service->description = $data->description;
                }
                if ($data->featuresProvided) {
                    $service->features = $data->features ?? [];
                }
                if ($data->isActive !== null) {
                    $service->is_active = $data->isActive;
                }
                if ($newImageUrl !== null) {
                    $service->image_url = $newImageUrl;
                }

                $service->save();

                return $service->fresh();
            });
        } catch (Throwable $e) {
            if ($newImageUrl !== null) {
                $this->imageService->deletePhysical($newImageUrl);
            }
            throw $e;
        }

        if ($newImageUrl !== null && $previousImageUrl !== null && $previousImageUrl !== $newImageUrl) {
            $this->imageService->deletePhysical($previousImageUrl);
        }

        return $updated;
    }

    public function delete(int $id): void
    {
        $service = $this->findById($id);
        $imageUrl = $service->image_url;

        DB::transaction(function () use ($service) {
            $service->delete();
        });

        $this->imageService->deletePhysical($imageUrl);
    }
}
