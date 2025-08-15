<?php

namespace App\Http\Controllers\Modules\Inventory;

use App\Http\Controllers\Modules\Base\ModuleController;
use App\Services\Contracts\PermissionHelperServiceInterface;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use Inertia\Response;

class InventoryController extends ModuleController
{
    public function __construct(
        private PermissionHelperServiceInterface $permissionHelper
    ) {
        // No parent constructor call needed since Base\ModuleController doesn't have one
    }

    /**
     * Display the inventory dashboard
     */
    public function index(Request $request): Response
    {
        $user = Auth::user();
        
        // Check if user has access to any inventory-related permissions
        $this->permissionHelper->checkAnyPermission([
            'brand_view',
            'product_view', 
            'category_view',
            'unit_view',
            'warehouse_view',
            'supplier_view',
            'customer_view',
            'sale_view',
            'purchase_view'
        ]);
        
        $userPermissions = $this->permissionHelper->getUserPermissionsData($user);

        return Inertia::render('modules/inventory/index', [
            'userPermissions' => $userPermissions,
            'module' => $this->getModuleData(),
        ]);
    }


    public function brands(Request $request): Response
    {
        $this->permissionHelper->checkPermission('brand_view');

        return Inertia::render('modules/inventory/brands/index', [
            'module' => $this->getModuleData(),
        ]);
    }

    public function categories(Request $request): Response
    {
        $this->permissionHelper->checkPermission('category_view');

        return Inertia::render('modules/inventory/categories/index', [
            'module' => $this->getModuleData(),
        ]);
    }


    public function products(Request $request): Response
    {
        $user = Auth::user();
        $this->permissionHelper->checkPermission('product_view');
        $userPermissions = $this->permissionHelper->getUserPermissionsData($user);

        return Inertia::render('modules/inventory/products/index', [
            'userPermissions' => $userPermissions,
            'module' => $this->getModuleData(),
        ]);
    }

    /**
     * Display suppliers management
     */
    public function suppliers(Request $request): Response
    {
        $user = Auth::user();
        $this->permissionHelper->checkPermission('supplier_view');
        $userPermissions = $this->permissionHelper->getUserPermissionsData($user);

        return Inertia::render('modules/inventory/suppliers/index', [
            'userPermissions' => $userPermissions,
            'module' => $this->getModuleData(),
        ]);
    }

    /**
     * Display customers management
     */
    public function customers(Request $request): Response
    {
        $user = Auth::user();
        $this->permissionHelper->checkPermission('customer_view');
        $userPermissions = $this->permissionHelper->getUserPermissionsData($user);

        return Inertia::render('modules/inventory/customers/index', [
            'userPermissions' => $userPermissions,
            'module' => $this->getModuleData(),
        ]);
    }

    protected function getModuleId(): string
    {
        return 'inventory';
    }

    protected function getModuleName(): string
    {
        return 'Inventory Management';
    }

    protected function getModuleDescription(): string
    {
        return 'Complete inventory and stock management system';
    }

    protected function getModuleIcon(): string
    {
        return 'package';
    }

    protected function getModuleColor(): string
    {
        return 'blue';
    }

    protected function getModuleSubPages(): array
    {
        return [
            'brands' => [
                'name' => 'Brands',
                'route' => '/modules/inventory/brands',
                'permission' => 'brand_view',
            ],
            'products' => [
                'name' => 'Products',
                'route' => '/modules/inventory/products',
                'permission' => 'product_view',
            ],
            'suppliers' => [
                'name' => 'Suppliers',
                'route' => '/modules/inventory/suppliers',
                'permission' => 'supplier_view',
            ],
            'customers' => [
                'name' => 'Customers',
                'route' => '/modules/inventory/customers',
                'permission' => 'customer_view',
            ],
        ];
    }

    protected function getModuleData(): array
    {
        return [
            'title' => 'Inventory Management',
            'description' => 'Complete inventory and stock management system',
            'subPages' => $this->getModuleSubPages(),
        ];
    }
}
