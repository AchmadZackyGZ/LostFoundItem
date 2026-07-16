<?php

namespace Modules\Item\Models;

use App\Models\User;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;
// use Modules\Item\Database\Factories\ItemClaimAndInfoFactory;

class ItemClaimAndInfo extends Model
{
    use HasFactory;

    /**
     * The attributes that are mass assignable.
     */
    protected $fillable = [
        'submitted_by_user_id',
        'lost_item_id',
        'found_item_id',
        'message',
        'contact_info',
        'status',
    ];

    public function submitter()
    {
        return $this->belongsTo(User::class, 'submitted_by_user_id', 'id');
    }

    public function lostItem()
    {
        return $this->belongsTo(LostItem::class, 'lost_item_id', 'id');
    }

    public function foundItem()
    {
        return $this->belongsTo(FoundItem::class, 'found_item_id', 'id');
    }

    // protected static function newFactory(): ItemClaimAndInfoFactory
    // {
    //     // return ItemClaimAndInfoFactory::new();
    // }
}
