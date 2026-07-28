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
        echo "\n---> HALO BOSQUE, SEEDER KATEGORI JALAN NIH! <---\n"; // Tambahkan ini
        $categories = [
            'Elektronik',           // Akan mendapat ID 1
            'Dokumen',              // Akan mendapat ID 2
            'Kendaraan',            // Akan mendapat ID 3
            'Lainnya',              // Akan mendapat ID 4
            'Dompet & Uang',        // Akan mendapat ID 5
            'Kunci',                // Akan mendapat ID 6
            'Pakaian & Aksesoris'   // Akan mendapat ID 7
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
