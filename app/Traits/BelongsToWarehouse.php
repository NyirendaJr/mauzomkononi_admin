<?php

namespace App\Traits;

use App\Models\Warehouse;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Support\Facades\Auth;
use Illuminate\Database\Eloquent\Model;

/**
 * Trait BelongsToWarehouse
 * 
 * This trait provides common functionality for models that belong to a warehouse.
 * It includes the relationship definition and common scopes.
 */
trait BelongsToWarehouse
{
    /**
     * Automatically scope queries to the current warehouse when available.
     */
    public static function bootBelongsToWarehouse(): void
    {
        static::addGlobalScope('current_warehouse', function (Builder $builder) {
            // Prefer the bound current warehouse instance set by middleware
            $warehouse = app()->bound('current_warehouse') ? app('current_warehouse') : null;
            $warehouseId = $warehouse?->id;

            if ($warehouseId) {
                $table = $builder->getModel()->getTable();
                $builder->where($table . '.warehouse_id', $warehouseId);
            }
        });

        // Automatically set warehouse_id on create/save if not provided
        $ensureWarehouse = function (Model $model): void {
            if (!$model->getAttribute('warehouse_id')) {
                $warehouse = app()->bound('current_warehouse') ? app('current_warehouse') : null;
                $user = Auth::user();
                $currentWarehouseId = $warehouse?->id ?? ($user?->current_warehouse_id ?? null);
                if ($currentWarehouseId) {
                    $model->setAttribute('warehouse_id', $currentWarehouseId);
                }
            }
        };

        static::creating($ensureWarehouse);
        static::saving($ensureWarehouse);
    }

    /**
     * Get the warehouse that owns this model
     */
    public function warehouse(): BelongsTo
    {
        return $this->belongsTo(Warehouse::class);
    }

    /**
     * Scope to filter by warehouse
     */
    public function scopeForWarehouse($query, $warehouseId)
    {
        return $query->where('warehouse_id', $warehouseId);
    }

    /**
     * Scope to filter by current user's warehouse
     */
    public function scopeForCurrentWarehouse($query)
    {
        $user = Auth::user();
        if ($user && $user->current_warehouse_id) {
            return $query->where('warehouse_id', $user->current_warehouse_id);
        }
        
        return $query;
    }

    /**
     * Scope to filter by warehouses accessible to current user
     */
    public function scopeForUserWarehouses($query)
    {
        $user = Auth::user();
        if ($user) {
            $warehouseIds = $user->warehouses()->pluck('warehouses.id');
            return $query->whereIn('warehouse_id', $warehouseIds);
        }
        
        return $query;
    }

    /**
     * Check if this model belongs to the specified warehouse
     */
    public function belongsToWarehouse($warehouseId): bool
    {
        return $this->warehouse_id == $warehouseId;
    }

    /**
     * Check if this model belongs to the current user's warehouse
     */
    public function belongsToCurrentWarehouse(): bool
    {
        $user = Auth::user();
        return $user && $this->belongsToWarehouse($user->current_warehouse_id);
    }

    /**
     * Check if this model is accessible to the current user
     */
    public function isAccessibleToCurrentUser(): bool
    {
        $user = Auth::user();
        if (!$user) {
            return false;
        }

        $warehouseIds = $user->warehouses()->pluck('warehouses.id')->toArray();
        return in_array($this->warehouse_id, $warehouseIds);
    }
}
