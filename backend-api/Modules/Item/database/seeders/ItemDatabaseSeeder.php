<?php

namespace Modules\Item\Database\Seeders;

use Illuminate\Database\Seeder;
use Modules\Item\Models\Category; // Import model Category
use Illuminate\Support\Str;       // Import Str untuk slug

class ItemDatabaseSeeder extends Seeder
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

        // Looping untuk insert langsung dari file Induk ini
        foreach ($categories as $category) {
            Category::create([
                'name' => $category,
                'slug' => Str::slug($category)
            ]);
        }
    }
}
