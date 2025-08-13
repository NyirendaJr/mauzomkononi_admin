<?php

namespace App\Repositories\Brand\Contracts;

use App\Repositories\Base\Contracts\QueryableRepositoryInterface;
use Illuminate\Database\Eloquent\Collection;

interface BrandRepositoryInterface extends QueryableRepositoryInterface
{
    // Warehouse scoping handled globally via multitenancy; removed from repository contract

    /**
     * Get brands by status for current warehouse
     */
    public function getByStatus(bool $isActive): Collection;

    /**
     * Search brands by query for current warehouse
     */
    public function searchByQuery(string $query): Collection;

    /**
     * Check if slug exists in warehouse (excluding specific brand ID)
     */
    public function slugExistsInWarehouse(string $slug, string $warehouseId, ?string $excludeId = null): bool;
}