<?php

namespace Modules\Chat\Models;

use App\Models\User;
use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;
// use Modules\Chat\Database\Factories\MessageFactory;

class Message extends Model
{
    use HasFactory, HasUuids;

    /**
     * The attributes that are mass assignable.
     */
    protected $fillable = [
        'conversation_id',
        'sender_id',
        'message',
        'is_read',
    ];

    // 🔗 Relasi balik ke Ruang Obrolan
    public function conversation()
    {
        return $this->belongsTo(Conversation::class, 'conversation_id');
    }

    // 🔗 Relasi ke Si Pengirim Pesan
    public function sender()
    {
        return $this->belongsTo(User::class, 'sender_id');
    }

    // protected static function newFactory(): MessageFactory
    // {
    //     // return MessageFactory::new();
    // }
}
