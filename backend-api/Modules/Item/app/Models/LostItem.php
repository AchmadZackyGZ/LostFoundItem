<?php

namespace Modules\Item\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;
// use Modules\Item\Database\Factories\LostItemFactory;

class LostItem extends Model
{
    use HasFactory;

    /**
     * The attributes that are mass assignable.
     */
    protected $fillable = [
        'user_id',
        'title',
        'description',
        'category',
        'location_lost',
        'incident_time',
        'photo_url',
        'status',
    ];

    // protected static function newFactory(): LostItemFactory
    // {
    //     // return LostItemFactory::new();
    // }
}
