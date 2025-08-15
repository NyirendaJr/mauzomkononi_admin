<?php

namespace App\Http\Controllers\Api\Internal;

use App\Http\Controllers\Api\BaseApiController;
use App\Http\Resources\Api\Brand\BrandResource;
use App\Http\Resources\Api\Category\CategoryResource;
use App\Services\Contracts\CategoryServiceInterface;
use App\Services\Contracts\PermissionHelperServiceInterface;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class CategoryController extends BaseApiController
{
    public function __construct(
        private readonly CategoryServiceInterface $categoryService,
        private readonly PermissionHelperServiceInterface $permissionHelper
    ) {}

    public function index(Request $request): JsonResponse
    {
        $categories = $this->categoryService->getFilteredCategories($request, $request->get('per_page', 15));
        return $this->successResponse(CategoryResource::collection($categories));
    }

    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'name' => ['required','string','max:255'],
            'parent_id' => ['nullable','uuid','exists:categories,id'],
            'image' => ['nullable','image','max:2048'],
        ]);

        $category = $this->categoryService->createCategory($validated);
        return $this->createdResponse($category);
    }

    public function show(string $id): JsonResponse
    {
        $category = $this->categoryService->getCategoryById($id);
        return $this->successResponse($category);
    }

    public function update(Request $request, string $id): JsonResponse
    {
        $validated = $request->validate([
            'name' => ['sometimes','string','max:255'],
            'parent_id' => ['nullable','uuid','exists:categories,id'],
            'image' => ['nullable','image','max:2048'],
        ]);

        $category = $this->categoryService->updateCategory($id, $validated);
        return $this->successResponse($category);
    }

    public function destroy(string $id): JsonResponse
    {
        $this->categoryService->deleteCategory($id);
        return $this->successResponse(['message' => 'Category deleted successfully']);
    }
}


