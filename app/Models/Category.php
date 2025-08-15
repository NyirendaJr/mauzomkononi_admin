<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use App\Traits\BelongsToWarehouse;

class Category extends Model
{
    use HasFactory;
    use HasUuids;
    use BelongsToWarehouse;

    protected $fillable = [
        'name',
        'image',
        'warehouse_id'
    ];

    public array $searchable = [
        'name',
    ];

    public function products()
    {
        return $this->hasMany(Product::class);
    }
}
