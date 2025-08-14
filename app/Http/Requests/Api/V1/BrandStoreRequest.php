<?php

namespace App\Http\Requests\Api\V1;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class BrandStoreRequest extends FormRequest
{

    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        $user = auth()->user();
        $warehouseId = app()->bound('current_warehouse')
            ? app('current_warehouse')->id
            : ($user?->current_warehouse_id ?? null);

        $uniquePerWarehouse = Rule::unique('brands', 'name');

        if ($warehouseId) {
            $uniquePerWarehouse = $uniquePerWarehouse->where(fn ($q) => $q->where('warehouse_id', $warehouseId));
        }

        return [
            'name' => ['required', 'string', 'max:255', $uniquePerWarehouse],
            'description' => ['nullable', 'string', 'max:1000'],
            'is_active' => ['boolean'],
            'image' => ['nullable', 'image', 'max:2048'],
        ];
    }
}
