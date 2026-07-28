<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class TestingAccountSeeder extends Seeder
{
    /**
     * Run the database seeds for testing accounts.
     */
    public function run(): void
    {
        $users = [
            [
                'email' => 'testing1@gmail.com',
                'name' => 'User Testing 1',
                'nim' => '202401001',
                'password' => Hash::make('password123'),
                'role' => 'mahasiswa',
                'department' => 'Informatika',
                'phone' => '6281234567891',
                'email_verified_at' => now(),
                'phone_verified_at' => now(),
            ],
            [
                'email' => 'testing2@gmail.com',
                'name' => 'User Testing 2',
                'nim' => '202401002',
                'password' => Hash::make('password123'),
                'role' => 'mahasiswa',
                'department' => 'Sistem Informasi',
                'phone' => '6281234567892',
                'email_verified_at' => now(),
                'phone_verified_at' => now(),
            ],
        ];

        foreach ($users as $userData) {
            User::updateOrCreate(
                ['email' => $userData['email']],
                $userData
            );
        }

        $this->command->info('✅ Berhasil membuat / meng-update 2 akun testing dengan email & WA terverifikasi.');
    }
}
