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
    /**
     * BrandService constructor.
     */
    public function __construct(protected BrandRepositoryInterface $brandRepository)
    {
        $this->setRepository($brandRepository);
    }

    /**
     * Get filtered brands with pagination for current warehouse
     */
    public function getFilteredBrands(?Request $request = null, int $perPage = 15): LengthAwarePaginator
    {
        // Warehouse scoping is handled by global scope/tenancy; just paginate with filters
        return $this->repository->paginateFiltered($perPage);
    }

    /**
     * Get all brands for current warehouse (without pagination)
     */
    public function getAllBrandsForCurrentWarehouse(): Collection
    {
        // Global scope/tenancy handles scoping automatically
        return Brand::query()->orderBy('name')->get();
    }

    /**
     * Get brand by ID (warehouse scoped)
     */
    public function getBrandById(string $id): ?Model
    {
        try {
            $brand = Brand::query()->findOrFail($id);
            return $brand;
        } catch (ModelNotFoundException) {
            throw new ModelNotFoundException('Brand not found');
        }
    }

    /**
     * Create brand for current warehouse
     */
    public function createBrand(array $data): Model
    {
        // Auto-generate slug if not provided
        if (empty($data['slug'])) {
            $data['slug'] = Str::slug($data['name']);
        }

        // Ensure slug is unique within the warehouse
        $baseSlug = $data['slug'];
        $counter = 1;
        while (Brand::query()->where('slug', $data['slug'])->exists()) {
            $data['slug'] = $baseSlug . '-' . $counter;
            $counter++;
        }

        // Default status
        $data['is_active'] = $data['is_active'] ?? true;

        return Brand::create($data);
    }

    /**
     * Update brand (warehouse scoped)
     */
    public function updateBrand(string $id, array $data): Model
    {
        $brand = $this->getBrandById($id);

        // Auto-generate slug if not provided but name is being updated
        if (empty($data['slug']) && isset($data['name'])) {
            $data['slug'] = Str::slug($data['name']);
        }

        // Ensure slug is unique (excluding current brand)
        if (isset($data['slug'])) {
            $baseSlug = $data['slug'];
            $counter = 1;
            while (Brand::query()->where('slug', $data['slug'])->where('id', '!=', $brand->id)->exists()) {
                $data['slug'] = $baseSlug . '-' . $counter;
                $counter++;
            }
        }

        $brand->update($data);
        return $brand->fresh();
    }

    /**
     * Delete brand (warehouse scoped)
     */
    public function deleteBrand(string $id): bool
    {
        $brand = $this->getBrandById($id);

        // Check if brand has associated products
        if ($brand->products()->exists()) {
            throw new \InvalidArgumentException('Cannot delete brand that has associated products');
        }

        return $brand->delete();
    }

    /**
     * Toggle brand status (warehouse scoped)
     */
    public function toggleBrandStatus(string $id): Model
    {
        $brand = $this->getBrandById($id);
        $brand->update(['is_active' => !$brand->is_active]);
        return $brand->fresh();
    }

    /**
     * Get brands by status for current warehouse
     */
    public function getBrandsByStatus(bool $isActive): Collection
    {
        return Brand::query()->where('is_active', $isActive)->orderBy('name')->get();
    }

    /**
     * Search brands by name for current warehouse
     */
    public function searchBrands(string $query): Collection
    {
        return Brand::query()
                   ->where(function ($queryBuilder) use ($query) {
                       $queryBuilder->where('name', 'like', "%{$query}%")
                                   ->orWhere('description', 'like', "%{$query}%")
                                   ->orWhere('slug', 'like', "%{$query}%");
                   })
                   ->orderBy('name')
                   ->get();
    }
}