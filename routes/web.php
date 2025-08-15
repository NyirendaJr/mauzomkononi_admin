<?php

use Illuminate\Support\Facades\Route;
use Inertia\Inertia;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\Modules\ModulesController;

Route::get('/', function () {
    return Inertia::render('welcome');
})->name('home');

Route::get('/color-demo', function () {
    return Inertia::render('color-demo');
})->name('color-demo');

Route::middleware(['auth', 'verified'])->group(function () {
    Route::get('/modules', [ModulesController::class, 'index'])->name('modules.index');
    
    // Settings module routes
    Route::prefix('modules/settings')->name('modules.settings.')->group(function () {
        Route::get('/', [App\Http\Controllers\Modules\Settings\SettingsController::class, 'index'])->name('index');
        Route::get('/permissions', [App\Http\Controllers\Modules\Settings\SettingsController::class, 'permissions'])->name('permissions');
        Route::get('/roles', [App\Http\Controllers\Modules\Settings\SettingsController::class, 'roles'])->name('roles');
    });
    
    // Inventory module routes
    Route::prefix('modules/inventory')->name('modules.inventory.')->group(function () {
        Route::get('/', [App\Http\Controllers\Modules\Inventory\InventoryController::class, 'index'])->name('index');
        Route::get('/brands', [App\Http\Controllers\Modules\Inventory\InventoryController::class, 'brands'])->name('brands');
        Route::get('/categories', [App\Http\Controllers\Modules\Inventory\InventoryController::class, 'categories'])->name('categories');
        Route::get('/products', [App\Http\Controllers\Modules\Inventory\InventoryController::class, 'products'])->name('products');
        Route::get('/suppliers', [App\Http\Controllers\Modules\Inventory\InventoryController::class, 'suppliers'])->name('suppliers');
        Route::get('/customers', [App\Http\Controllers\Modules\Inventory\InventoryController::class, 'customers'])->name('customers');
    });
    


    
    //Route::post('/permissions', [App\Http\Controllers\WebPermissionController::class, 'store'])->name('permissions.store');
    //Route::get('/permissions/{id}', [App\Http\Controllers\WebPermissionController::class, 'show'])->name('permissions.show');
    //Route::put('/permissions/{id}', [App\Http\Controllers\WebPermissionController::class, 'update'])->name('permissions.update');
    //Route::delete('/permissions/{id}', [App\Http\Controllers\WebPermissionController::class, 'destroy'])->name('permissions.destroy');
    //Route::delete('/permissions', [App\Http\Controllers\WebPermissionController::class, 'destroyMultiple'])->name('permissions.destroyMultiple');
    //Route::get('/permissions/modules/list', [App\Http\Controllers\WebPermissionController::class, 'getModules'])->name('permissions.modules');
    //Route::get('/permissions/guards/list', [App\Http\Controllers\WebPermissionController::class, 'getGuards'])->name('permissions.guards');
    //Route::post('/permissions/sync', [App\Http\Controllers\WebPermissionController::class, 'syncPermissions'])->name('permissions.sync');

});

require __DIR__.'/settings.php';
require __DIR__.'/auth.php';
