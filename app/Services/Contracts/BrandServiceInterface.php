<?php

namespace App\Services\Contracts;

use Illuminate\Database\Eloquent\Collection;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Http\Request;
use Illuminate\Pagination\LengthAwarePaginator;

interface BrandServiceInterface
{
    public function getFilteredBrands(?Request $request = null, int $perPage = 15): LengthAwarePaginator;
    public function getAllBrandsForCurrentWarehouse(): Collection;
    public function getBrandById(string $id): ?Model;
    public function createBrand(array $data): Model;
    public function updateBrand(string $id, array $data): Model;
    public function deleteBrand(string $id): bool;
    public function toggleBrandStatus(string $id): Model;
}