<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Middleware\EnsureWarehouseContext;
// Removed Spatie multitenancy middleware

/*
|--------------------------------------------------------------------------
| Internal API Routes (Sanctum Authentication)
|--------------------------------------------------------------------------
|
| These routes are for internal SPA authentication using Laravel Sanctum.
| They are protected by the 'auth:sanctum' middleware and use session-based
| authentication for the frontend application.
|
*/

// Internal authentication routes (Sanctum)
Route::post('/auth/login', [App\Http\Controllers\Api\Internal\AuthController::class, 'login']);
Route::post('/auth/register', [App\Http\Controllers\Api\Internal\AuthController::class, 'register']);
Route::post('/auth/logout', [App\Http\Controllers\Api\Internal\AuthController::class, 'logout'])->middleware('auth:sanctum');

Route::middleware('auth:sanctum')->get('/user', function (Request $request) {
    return $request->user();
});

// Internal API routes for the SPA
Route::middleware(['auth:sanctum', EnsureWarehouseContext::class])->group(function () {
    // User management
    Route::get('/users', [App\Http\Controllers\Api\Internal\UserController::class, 'index']);
    Route::get('/users/{user}', [App\Http\Controllers\Api\Internal\UserController::class, 'show']);
    Route::post('/users', [App\Http\Controllers\Api\Internal\UserController::class, 'store']);
    Route::put('/users/{user}', [App\Http\Controllers\Api\Internal\UserController::class, 'update']);
    Route::delete('/users/{user}', [App\Http\Controllers\Api\Internal\UserController::class, 'destroy']);

    // Permission management
    Route::get('/permissions', [App\Http\Controllers\Api\Internal\PermissionController::class, 'index']);
    Route::get('/permissions/all', [App\Http\Controllers\Api\Internal\PermissionController::class, 'all']);
    Route::get('/permissions/{permission}', [App\Http\Controllers\Api\Internal\PermissionController::class, 'show']);
    Route::post('/permissions', [App\Http\Controllers\Api\Internal\PermissionController::class, 'store']);
    Route::put('/permissions/{permission}', [App\Http\Controllers\Api\Internal\PermissionController::class, 'update']);
    Route::delete('/permissions/{permission}', [App\Http\Controllers\Api\Internal\PermissionController::class, 'destroy']);
    Route::get('/permissions/by-module/{module}', [App\Http\Controllers\Api\Internal\PermissionController::class, 'getByModule']);
    Route::get('/permissions/by-guard/{guard}', [App\Http\Controllers\Api\Internal\PermissionController::class, 'getByGuard']);
    Route::get('/permissions/modules', [App\Http\Controllers\Api\Internal\PermissionController::class, 'getModules']);
    Route::get('/permissions/guards', [App\Http\Controllers\Api\Internal\PermissionController::class, 'getGuards']);

    // Role management
    Route::get('/roles', [App\Http\Controllers\Api\Internal\RoleController::class, 'index']);
    Route::get('/roles/guards', [App\Http\Controllers\Api\Internal\RoleController::class, 'guards']);
    Route::get('/roles/{role}', [App\Http\Controllers\Api\Internal\RoleController::class, 'show']);
    Route::post('/roles', [App\Http\Controllers\Api\Internal\RoleController::class, 'store']);
    Route::put('/roles/{role}', [App\Http\Controllers\Api\Internal\RoleController::class, 'update']);
    Route::delete('/roles/{role}', [App\Http\Controllers\Api\Internal\RoleController::class, 'destroy']);
    Route::post('/roles/{role}/permissions', [App\Http\Controllers\Api\Internal\RoleController::class, 'assignPermissions']);
    Route::delete('/roles/{role}/permissions', [App\Http\Controllers\Api\Internal\RoleController::class, 'removePermissions']);
    
    // Warehouse management
    Route::get('/warehouses', [App\Http\Controllers\Api\Internal\WarehouseController::class, 'index']);
    Route::get('/warehouses/current', [App\Http\Controllers\Api\Internal\WarehouseController::class, 'current']);
    Route::post('/warehouses/switch', [App\Http\Controllers\Api\Internal\WarehouseController::class, 'switch']);
    Route::get('/warehouses/{warehouse}', [App\Http\Controllers\Api\Internal\WarehouseController::class, 'show']);
    
    // Brand management (Inventory Module)
    Route::prefix('brands')->name('brands.')->group(function () {
        Route::get('/', [App\Http\Controllers\Api\Internal\BrandController::class, 'index'])->name('index');
        Route::get('/all', [App\Http\Controllers\Api\Internal\BrandController::class, 'all'])->name('all');
        Route::get('/{brand}', [App\Http\Controllers\Api\Internal\BrandController::class, 'show'])->name('show');
        Route::post('/', [App\Http\Controllers\Api\Internal\BrandController::class, 'store'])->name('store');
        Route::put('/{brand}', [App\Http\Controllers\Api\Internal\BrandController::class, 'update'])->name('update');
        Route::delete('/{brand}', [App\Http\Controllers\Api\Internal\BrandController::class, 'destroy'])->name('destroy');
        Route::post('/{brand}/toggle-status', [App\Http\Controllers\Api\Internal\BrandController::class, 'toggleStatus'])->name('toggle-status');
        Route::get('/by-status/{status}', [App\Http\Controllers\Api\Internal\BrandController::class, 'getByStatus'])->name('by-status');
    });
});
