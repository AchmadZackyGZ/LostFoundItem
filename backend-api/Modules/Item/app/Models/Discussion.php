<?php

namespace Modules\Item\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Concerns\HasUuids;
// use Modules\Item\Database\Factories\DiscussionFactory;

class Discussion extends Model
{
    use HasFactory;
    use HasUuids;

    /**
     * The attributes that are mass assignable.
     */
    protected $fillable = [
        'item_id',
        'user_id',
        'message',
    ];

    // protected static function newFactory(): DiscussionFactory
    // {
    //     // return DiscussionFactory::new();
    // }
}
