<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class AdminAccountSeeder extends Seeder
{
    /**
     * Run the database seeds for admin account.
     */
    public function run(): void
    {
        User::updateOrCreate(
            ['email' => 'admin.lostfound@uisi.ac.id'],
            [
                'name' => 'Administrator Kampus',
                'password' => Hash::make('rahasiaadmin123'),
                'role' => 'admin',
                'email_verified_at' => now(),
                'phone_verified_at' => now(),
            ]
        );

        $this->command->info('✅ Pengecekan Akun Admin: Selesai (Email & Role Admin telah diverifikasi).');
    }
}
