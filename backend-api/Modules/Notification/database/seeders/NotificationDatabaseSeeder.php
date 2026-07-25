<?php

namespace Modules\Notification\Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\User;
use Modules\Notification\Models\AppNotification;

class NotificationDatabaseSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $users = User::all();

        foreach ($users as $user) {
            AppNotification::firstOrCreate([
                'user_id' => $user->id,
                'title' => 'Laporan Barang Hilang Dibuat',
            ], [
                'message' => 'Anda melaporkan kehilangan Dompet Kulit Coklat di area Lobby Utama.',
                'type' => 'report',
                'action_url' => '/items',
                'is_read' => true,
                'created_at' => now(),
            ]);

            AppNotification::firstOrCreate([
                'user_id' => $user->id,
                'title' => 'Klaim Barang Disetujui',
            ], [
                'message' => 'Klaim anda untuk Kunci Mobil Honda telah diverifikasi dan disetujui oleh admin.',
                'type' => 'claim',
                'action_url' => '/activity',
                'is_read' => true,
                'created_at' => now()->subHours(5),
            ]);

            AppNotification::firstOrCreate([
                'user_id' => $user->id,
                'title' => 'Balasan Diskusi Baru',
            ], [
                'message' => 'Petugas keamanan membalas komentar anda pada item Laptop Asus ROG yang ditemukan.',
                'type' => 'discussion',
                'action_url' => '/items',
                'is_read' => false,
                'created_at' => now()->subDay(),
            ]);

            AppNotification::firstOrCreate([
                'user_id' => $user->id,
                'title' => 'Pembaruan Sistem TraceBack',
            ], [
                'message' => 'Sistem telah diperbarui untuk meningkatkan kecepatan pencarian inventaris kampus.',
                'type' => 'system',
                'action_url' => '#',
                'is_read' => true,
                'created_at' => now()->subDays(3),
            ]);
        }
    }
}
