<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Symfony\Component\HttpFoundation\Response;
use App\Models\Warehouse;

class EnsureWarehouseContext
{
    /**
     * Handle an incoming request.
     */
    public function handle(Request $request, Closure $next): Response
    {
        if (Auth::check()) {
            $user = Auth::user();
            
            // If user doesn't have a current warehouse set, set the first available one
            if (!$user->current_warehouse_id && $user->activeWarehouses()->exists()) {
                $firstWarehouse = $user->activeWarehouses()->first();
                $user->switchToWarehouse($firstWarehouse);
            }
            
            // Make current warehouse available globally
            if ($user->currentWarehouse) {
                app()->instance('current_warehouse', $user->currentWarehouse);
            }
        }

        return $next($request);
    }
}
