<?php

namespace App\Services\Concretes;

use App\Repositories\Category\Contracts\CategoryRepositoryInterface;
use App\Services\Base\Concretes\BaseService;
use App\Services\Contracts\CategoryServiceInterface;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\ModelNotFoundException;
use Illuminate\Http\Request;
use Illuminate\Pagination\LengthAwarePaginator;

class CategoryService extends BaseService implements CategoryServiceInterface
{
    public function __construct(protected CategoryRepositoryInterface $categoryRepository)
    {
        $this->setRepository($this->categoryRepository);
    }

    public function getCategories(): Collection
    {
        return $this->repository->getFiltered();
    }

    public function getAllCategories(): Collection
    {
        return $this->repository->all();
    }

    public function getFilteredCategories(?Request $request = null, int $perPage = 15): LengthAwarePaginator
    {
        return $this->repository->paginateFiltered($perPage);
    }

    public function getCategoryById(string $id): ?Model
    {
        try {
            return $this->repository->findOrFail($id);
        } catch (ModelNotFoundException) {
            throw new ModelNotFoundException('Category not found');
        }
    }

    public function createCategory(array $data): Model
    {
        return $this->repository->create($data);
    }

    public function updateCategory(string $id, array $data): Model
    {
        try {
            return $this->repository->update($id, $data);
        } catch (ModelNotFoundException) {
            throw new ModelNotFoundException('Category not found');
        }
    }

    public function deleteCategory(string $id): bool
    {
        try {
            $this->repository->delete($id);
            return true;
        } catch (ModelNotFoundException) {
            throw new ModelNotFoundException('Category not found');
        }
    }

    public function getActiveCategories(): Collection
    {
        return $this->repository->getFiltered()->where('parent_id', null);
    }
}