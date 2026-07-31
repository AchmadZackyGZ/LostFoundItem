<?php

namespace Modules\Item\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Concerns\HasUuids;
use App\Models\User;

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

    /**
     * Relasi ke Model User (Pelapor/Komentator)
     */
    public function user()
    {
        return $this->belongsTo(User::class, 'user_id');
    }
}
