<?php

namespace App\Http\Controllers\Api\Internal;

use App\Http\Controllers\Api\BaseApiController;
use App\Http\Resources\Api\Brand\BrandResource;
use App\Services\Contracts\BrandServiceInterface;
use App\Services\Contracts\PermissionHelperServiceInterface;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use App\Http\Requests\Api\V1\BrandUpdateRequest;
use App\Http\Requests\Api\V1\BrandStoreRequest;

class BrandController extends BaseApiController
{
    public function __construct(
        private readonly BrandServiceInterface $brandService,
        private readonly PermissionHelperServiceInterface $permissionHelper
    ) {}


    public function index(Request $request): JsonResponse
    {
        //$this->permissionHelper->checkPermission('brand_view');
        
        try {
            $brands = $this->brandService->getFilteredBrands($request, $request->get('per_page', 15));
            return $this->successResponse(BrandResource::collection($brands));
        } catch (\Exception $e) {
            return $this->errorResponse('Failed to fetch brands: ' . $e->getMessage(), 500);
        }
    }


    public function all(): JsonResponse
    {
        $this->permissionHelper->checkPermission('brand_view');
        
        try {
            $brands = $this->brandService->getAllBrandsForCurrentWarehouse();
            return $this->successResponse(BrandResource::collection($brands));
        } catch (\Exception $e) {
            return $this->errorResponse('Failed to fetch brands: ' . $e->getMessage(), 500);
        }
    }


    public function show(string $id): JsonResponse
    {
        $this->permissionHelper->checkPermission('brand_view');
        
        try {
            $brand = $this->brandService->getBrandById($id);
            return $this->successResponse(new BrandResource($brand));
        } catch (\Illuminate\Database\Eloquent\ModelNotFoundException $e) {
            return $this->notFoundResponse('Brand not found');
        } catch (\Exception $e) {
            return $this->errorResponse('Failed to fetch brand: ' . $e->getMessage(), 500);
        }
    }


    public function store(BrandStoreRequest $request): JsonResponse
    {
        //$this->permissionHelper->checkPermission('brand_create');
        $brand = $this->brandService->createBrand($request->validated());

        return $this->createdResponse(new BrandResource($brand));
    
    }


    public function update(BrandUpdateRequest $request, string $id): JsonResponse
    {
        //$this->permissionHelper->checkPermission('brand_edit');

        $brand = $this->brandService->updateBrand($id, $request->validated());
        return $this->successResponse(new BrandResource($brand));
    }


    public function destroy(string $id): JsonResponse
    {
        //$this->permissionHelper->checkPermission('brand_delete');

        $this->brandService->deleteBrand($id);
        return $this->successResponse(['message' => 'Brand deleted successfully']);
    }


    public function toggleStatus(string $id): JsonResponse
    {
        //$this->permissionHelper->checkPermission('brand_edit');

        $brand = $this->brandService->toggleBrandStatus($id);
        return $this->successResponse(new BrandResource($brand));
    }

    /**
     * Get brands by status.
     */
    public function getByStatus(Request $request): JsonResponse
    {
        $this->permissionHelper->checkPermission('brand_view');
        
        try {
            $validated = $request->validate([
                'status' => 'required|boolean'
            ]);

            $brands = $this->brandService->getBrandsByStatus($validated['status']);
            return $this->successResponse(BrandResource::collection($brands));
        } catch (\Illuminate\Validation\ValidationException $e) {
            return $this->validationErrorResponse('Invalid status value');
        } catch (\Exception $e) {
            return $this->errorResponse('Failed to fetch brands by status: ' . $e->getMessage(), 500);
        }
    }
}