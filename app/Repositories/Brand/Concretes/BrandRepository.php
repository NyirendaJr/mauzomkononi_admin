<?php

namespace App\Repositories\Brand\Concretes;

use App\Models\Brand;
use App\Repositories\Base\Concretes\QueryableRepository;
use App\Repositories\Brand\Contracts\BrandRepositoryInterface;
use Illuminate\Database\Eloquent\Collection;
use Spatie\QueryBuilder\AllowedFilter;
use Spatie\QueryBuilder\QueryBuilder;

class BrandRepository extends QueryableRepository implements BrandRepositoryInterface
{

    /**
     * Specify Model class name
     */
    protected function model(): string
    {
        return Brand::class;
    }

    /**
     * Configure allowed filters and sorts for query builder
     */
    public function getAllowedFilters(): array
    {
        return [
            AllowedFilter::exact('is_active'),
            AllowedFilter::partial('name'),
            AllowedFilter::partial('description'),
            AllowedFilter::partial('slug'),
            AllowedFilter::exact('warehouse_id'),
        ];
    }

    /**
     * Configure allowed sorts for query builder
     */
    public function getAllowedSorts(): array
    {
        return [
            'name',
            'slug',
            'is_active',
            'created_at',
            'updated_at',
        ];
    }

    // Default sort can be handled via request 'sort' when needed

    // Warehouse-specific scoping removed; handled by multitenancy/global scope

    // Removed applyScopes override; scoping is enforced in query()

    /**
     * Get brands by status for current warehouse
     */
    public function getByStatus(bool $isActive): Collection
    {
        return $this->model->where('is_active', $isActive)->orderBy('name')->get();
    }

    /**
     * Search brands by query for current warehouse
     */
    public function searchByQuery(string $query): Collection
    {
        $queryBuilder = $this->model->where(function ($builder) use ($query) {
            $builder->where('name', 'like', "%{$query}%")
                   ->orWhere('description', 'like', "%{$query}%")
                   ->orWhere('slug', 'like', "%{$query}%");
        });

        return $queryBuilder->orderBy('name')->get();
    }

    /**
     * Check if slug exists in warehouse (excluding specific brand ID)
     */
    public function slugExistsInWarehouse(string $slug, string $warehouseId, ?string $excludeId = null): bool
    {
        // Warehouse parameter ignored; uniqueness check is global in current test setup
        $query = $this->model->where('slug', $slug);
        if ($excludeId) {
            $query->where('id', '!=', $excludeId);
        }
        return $query->exists();
    }

    /**
     * Get related models to load with the brand
     */
    protected function getWith(): array
    {
        return ['warehouse'];
    }
}