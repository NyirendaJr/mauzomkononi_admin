<?php

namespace Database\Seeders;

use App\Models\Category;
use App\Models\Warehouse;
use Illuminate\Database\Seeder;

class CategorySeeder extends Seeder
{
    public function run(): void
    {
        // Prefer current warehouse context if available
        $warehouse = app()->bound('current_warehouse') ? app('current_warehouse') : Warehouse::query()->first();
        if (!$warehouse) {
            return;
        }

        $categories = [
            'Electronics',
            'Home & Kitchen',
            'Fashion',
            'Health & Beauty',
            'Sports & Outdoors',
            'Books',
            'Toys & Games',
        ];

        foreach ($categories as $name) {
            Category::query()->firstOrCreate(
                [
                    'name' => $name,
                    'warehouse_id' => $warehouse->id,
                ],
                [
                    'image' => null,
                ]
            );
        }

        // Nested example: Phones/Laptops/Cameras under Electronics
        $electronics = Category::query()->where('name', 'Electronics')->where('warehouse_id', $warehouse->id)->first();
        if ($electronics) {
            foreach (['Phones', 'Laptops', 'Cameras'] as $child) {
                Category::query()->firstOrCreate(
                    [
                        'name' => $child,
                        'warehouse_id' => $warehouse->id,
                    ],
                    [
                        'image' => null,
                        'parent_id' => $electronics->id,
                    ]
                );
            }
        }
    }
}


