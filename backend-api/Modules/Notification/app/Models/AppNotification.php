<?php

namespace Modules\Notification\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;
// use Modules\Notification\Database\Factories\AppNotificationFactory;
use App\Models\User;

class AppNotification extends Model
{
    use HasFactory, HasUuids;

    /**
     * The attributes that are mass assignable.
     */
    protected $fillable = [
        'user_id',
        'title',
        'message',
        'type',
        'action_url',
        'is_read',
    ];

    /**
     * 🔗 Relasi ke Pemilik Notifikasi
     */
    public function user()
    {
        return $this->belongsTo(User::class, 'user_id');
    }

    // protected static function newFactory(): AppNotificationFactory
    // {
    //     // return AppNotificationFactory::new();
    // }
}
