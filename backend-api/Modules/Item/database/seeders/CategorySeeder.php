<?php

namespace Modules\Item\Database\Seeders;

use Illuminate\Database\Seeder;
use Modules\Item\Models\Category;
use Illuminate\Support\Str;

class CategorySeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $categories = [
            'Barang Elektronik',
            'Dokumen & Surat',
            'Dompet & Uang',
            'Kunci',
            'Pakaian & Aksesoris',
            'Lainnya'
        ];

        foreach ($categories as $category) {
            Category::create([
                // 'id' => Str::uuid(), // karena di models category sudah menggunakan trait use HasUuids
                'name' => $category,
                'slug' => Str::slug($category)
            ]);
        }
    }
}
