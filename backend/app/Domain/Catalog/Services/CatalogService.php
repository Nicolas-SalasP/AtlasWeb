<?php

namespace App\Domain\Catalog\Services;

use App\Domain\Catalog\Exceptions\OfferingNotFoundException;
use App\Models\Service;

class CatalogService
{
    public function findById(int $id): Service
    {
        $service = Service::find($id);

        if (!$service) {
            throw new OfferingNotFoundException($id);
        }

        return $service;
    }
}
