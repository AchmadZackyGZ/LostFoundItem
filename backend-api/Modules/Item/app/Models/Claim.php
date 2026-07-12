<?php

namespace Modules\Item\Models;

use App\Models\User;
use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;
// use Modules\Item\Database\Factories\ClaimFactory;

class Claim extends Model
{
    use HasFactory;
    use HasUuids;

    /**
     * The attributes that are mass assignable.
     */
    protected $fillable = [
        'item_id',
        'user_id', // Sama, hanya simpan ID, tanpa relasi ke Model User
        'proof_description',
        'proof_image_path',
        'status'
    ];

    // Relasi Internal Modul: Komentar ini ada di barang mana
    public function item()
    {
        return $this->belongsTo(Item::class);
    }

    // protected static function newFactory(): ClaimFactory
    // {
    //     // return ClaimFactory::new();
    // }
}
