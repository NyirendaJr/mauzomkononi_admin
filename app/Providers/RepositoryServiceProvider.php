<?php

namespace App\Providers;

use App\Repositories\User\Concretes\UserRepository;
use App\Repositories\User\Contracts\UserRepositoryInterface;
use App\Repositories\Permission\Concretes\PermissionRepository;
use App\Repositories\Permission\Contracts\PermissionRepositoryInterface;
use App\Repositories\Role\Concretes\RoleRepository;
use App\Repositories\Role\Contracts\RoleRepositoryInterface;
use App\Repositories\Brand\Concretes\BrandRepository;
use App\Repositories\Brand\Contracts\BrandRepositoryInterface;
use App\Repositories\Category\Concretes\CategoryRepository;
use App\Repositories\Category\Contracts\CategoryRepositoryInterface;
use Illuminate\Support\ServiceProvider;

class RepositoryServiceProvider extends ServiceProvider
{
    /**
     * Register services.
     */
    public function register(): void
    {
        // Register repository bindings here
        $this->app->bind(UserRepositoryInterface::class, UserRepository::class);
        $this->app->bind(PermissionRepositoryInterface::class, PermissionRepository::class);
        $this->app->bind(RoleRepositoryInterface::class, RoleRepository::class);
        $this->app->bind(BrandRepositoryInterface::class, BrandRepository::class);
        $this->app->bind(CategoryRepositoryInterface::class, CategoryRepository::class);
    }

    /**
     * Bootstrap services.
     *
     * @return void
     */
    public function boot()
    {
        //
    }
}
