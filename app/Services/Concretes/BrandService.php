<?php

namespace App\Services\Concretes;

use App\Models\Brand;
use App\Repositories\Brand\Contracts\BrandRepositoryInterface;
use App\Services\Base\Concretes\BaseService;
use App\Services\Contracts\BrandServiceInterface;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\ModelNotFoundException;
use Illuminate\Http\Request;
use Illuminate\Pagination\LengthAwarePaginator;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Str;

class BrandService extends BaseService implements BrandServiceInterface
{

    public function __construct(protected BrandRepositoryInterface $brandRepository)
    {
        $this->setRepository($brandRepository);
    }

    public function getFilteredBrands(?Request $request = null, int $perPage = 15): LengthAwarePaginator
    {
        return $this->repository->paginateFiltered($perPage);
    }

    public function getAllBrandsForCurrentWarehouse(): Collection
    {
        return Brand::query()->orderBy('name')->get();
    }

    public function getBrandById(string $id): ?Model
    {
        try {
            $brand = Brand::query()->findOrFail($id);
            return $brand;
        } catch (ModelNotFoundException) {
            throw new ModelNotFoundException('Brand not found');
        }
    }

    public function createBrand(array $data): Model
    {
        $data['is_active'] = $data['is_active'] ?? true;

        if (isset($data['image']) && $data['image'] instanceof \Illuminate\Http\UploadedFile) {
            $path = $data['image']->store('brands', 'public');
            $data['image'] = $path;
        }

        return Brand::create($data);
    }

    public function updateBrand(string $id, array $data): Model
    {
        $brand = $this->getBrandById($id);

        if (isset($data['image']) && $data['image'] instanceof \Illuminate\Http\UploadedFile) {
            $path = $data['image']->store('brands', 'public');
            $data['image'] = $path;
        }

        $brand->update($data);
        return $brand->fresh();
    }

    public function deleteBrand(string $id): bool
    {
        $brand = $this->getBrandById($id);

        // Check if brand has associated products
        if ($brand->products()->exists()) {
            throw new \InvalidArgumentException('Cannot delete brand that has associated products');
        }

        return $brand->delete();
    }

    public function toggleBrandStatus(string $id): Model
    {
        $brand = $this->getBrandById($id);
        $brand->update(['is_active' => !$brand->is_active]);
        return $brand->fresh();
    }
}