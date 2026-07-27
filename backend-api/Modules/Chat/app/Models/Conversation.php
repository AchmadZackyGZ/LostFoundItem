<?php

namespace Modules\Chat\Models;

use App\Models\User;
use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Modules\Item\Models\Item;

// use Modules\Chat\Database\Factories\ConversationFactory;

class Conversation extends Model
{
    use HasFactory, HasUuids;

    /**
     * The attributes that are mass assignable.
     */
    protected $fillable = [
        'item_id',
        'finder_id',
        'owner_id',
    ];

    public function item()
    {
        return $this->belongsTo(Item::class, 'item_id');
    }

    public function finder()
    {
        return $this->belongsTo(User::class, 'finder_id');
    }

    public function owner()
    {
        return $this->belongsTo(User::class, 'owner_id');
    }

    // 🔗 Relasi ke banyak Pesan (Messages)
    public function messages()
    {
        return $this->hasMany(Message::class, 'conversation_id');
    }

    // protected static function newFactory(): ConversationFactory
    // {
    //     // return ConversationFactory::new();
    // }
}
