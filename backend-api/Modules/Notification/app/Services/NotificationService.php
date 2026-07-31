<?php

namespace Modules\Notification\Services;

use Modules\Notification\Contracts\NotificationServiceInterface;
use Modules\Notification\Models\AppNotification;
use Exception;

class NotificationService implements NotificationServiceInterface
{
    /**
     * Kirim Notifikasi Baru
     */
    public function send(string $userId, string $title, string $message, ?string $type = 'info', ?string $actionUrl = null): void
    {
        AppNotification::create([
            'user_id' => $userId,
            'title' => $title,
            'message' => $message,
            'type' => $type ?? 'info',
            'action_url' => $actionUrl,
        ]);
    }

    /**
     * Ambil Seluruh Notifikasi Pengguna
     */
    public function getUserNotifications(string $userId)
    {
        return AppNotification::where('user_id', $userId)
            ->latest()
            ->get();
    }

    /**
     * Tandai Single Notifikasi Sebagai Dibaca
     */
    public function markAsRead(string $notificationId, string $userId): AppNotification
    {
        $notification = AppNotification::where('id', $notificationId)
            ->where('user_id', $userId)
            ->first();

        if (!$notification) {
            throw new Exception('Notifikasi tidak ditemukan', 404);
        }

        $notification->update(['is_read' => true]);
        return $notification;
    }

    /**
     * Tandai Semua Notifikasi Sebagai Dibaca
     */
    public function markAllAsRead(string $userId): bool
    {
        return AppNotification::where('user_id', $userId)
            ->where('is_read', false)
            ->update(['is_read' => true]) > 0;
    }
}
