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

    protected function model(): string
    {
        return Brand::class;
    }

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

    protected function getWith(): array
    {
        return ['warehouse'];
    }
}