<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class AdminAccountSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // firstOrCreate akan mencari data berdasarkan array pertama.
        // Jika KETEMU, proses pembuatan data diabaikan (di-skip).
        // Jika TIDAK KETEMU, data baru akan dibuat dari gabungan array pertama & kedua.

        User::firstOrCreate(
            ['email' => 'admin.lostfound@uisi.ac.id'], // 🔑 Syarat Pencarian (Kunci)
            [
                'name' => 'Administrator Kampus',
                'password' => Hash::make('rahasiaadmin123'),
                'role' => 'admin', // Pastikan kolom role sudah ada di tabel users

                // Tambahkan field lain yang wajib (not null) di tabel Anda di bawah ini:
                // 'phone_number' => '081234567890',
            ]
        );

        $this->command->info('✅ Pengecekan Akun Admin: Selesai (Telah dibuat / Sudah ada).');
    }
}
