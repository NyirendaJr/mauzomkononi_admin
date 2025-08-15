<?php

namespace App\Http\Resources\Api\Category;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class CategoryResource extends JsonResource
{

    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'name' => $this->name,
            // 'description' => $this->description,
            'image' => $this->image,
            'image_url' => $this->image_url,
            'is_active' => $this->is_active,
            'warehouse_id' => $this->warehouse_id,
            'warehouse' => [
                'id' => $this->warehouse->id,
                'name' => $this->warehouse->name,
                'code' => $this->warehouse->code,
            ],
            // 'products_count' => $this->when(
            //     $this->relationLoaded('products'),
            //     fn() => $this->products->count()
            // ),
            'created_at' => $this->created_at?->toISOString(),
            'updated_at' => $this->updated_at?->toISOString(),
        ];
    }
}
