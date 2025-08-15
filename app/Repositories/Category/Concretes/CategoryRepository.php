<?php

namespace App\Repositories\Category\Concretes;

use App\Models\Category;
use App\Repositories\Base\Concretes\QueryableRepository;
use App\Repositories\Category\Contracts\CategoryRepositoryInterface;
use Illuminate\Database\Eloquent\Collection;
use Spatie\QueryBuilder\AllowedFilter;

class CategoryRepository extends QueryableRepository implements CategoryRepositoryInterface
{
    protected function model(): string
    {
        return Category::class;
    }

    public function getAllowedFilters(): array
    {
        return [
            AllowedFilter::exact('id'),
            AllowedFilter::partial('name'),
            AllowedFilter::exact('warehouse_id'),
            AllowedFilter::exact('parent_id'),
        ];
    }

    public function getAllowedSorts(): array
    {
        return [
            'name', 
            'created_at'
        ];
    }

    public function getAllowedIncludes(): array
    {
        return [];
    }
}