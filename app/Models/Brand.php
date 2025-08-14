<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use App\Traits\BelongsToWarehouse;
use Illuminate\Support\Facades\Storage;

class Brand extends Model
{
    use HasFactory;
    use HasUuids;
    use BelongsToWarehouse;

    // public function __construct(
    //     public readonly UploadFileServiceInterface $uploadFileService
    // ){}

    protected $fillable = [
        'name',
        'description',
        'image',
        'is_active',
        'warehouse_id'
    ];

    /**
     * Fields that can be searched globally
     */
    public array $searchable = [
        'name',
        'description'
    ];

    protected $casts = [
        'is_active' => 'boolean',
    ];

    public function products()
    {
        return $this->hasMany(Product::class);
    }

    public function warehouse()
    {
        return $this->belongsTo(Warehouse::class);
    }

    public function getImageUrlAttribute()
    {
        if ($this->image === null) {
            return asset('images/brand.png');
        }

        // Fallback storage URL generation; adjust disk/path as needed
        return Storage::url($this->image);
    }
}
