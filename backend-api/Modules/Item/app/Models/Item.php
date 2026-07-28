<?php

namespace Modules\Item\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;
// use Modules\Item\Database\Factories\ItemFactory;

class Item extends Model
{
    use HasFactory;
    use HasUuids;

    /**
     * The attributes that are mass assignable.
     */
    protected $fillable = [
        'user_id', // Tetap diisi agar bisa menyimpan ID, tapi TIDAK ADA relasi belongsTo(User)
        'category_id',
        'type',
        'title',
        'description',
        'location',
        'date',
        'image_path',
        'status',
        'is_urgent'
    ];

    // Relasi Internal Modul: Barang ini milik kategori apa
    public function category()
    {
        return $this->belongsTo(Category::class);
    }

    // Relasi Internal Modul: Barang ini punya klaim apa saja
    public function claims()
    {
        return $this->hasMany(Claim::class);
    }

    // Relasi Internal Modul: Barang ini punya diskusi/komentar apa saja
    public function discussions()
    {
        return $this->hasMany(Discussion::class);
    }

    // protected static function newFactory(): ItemFactory
    // {
    //     // return ItemFactory::new();
    // }
}
