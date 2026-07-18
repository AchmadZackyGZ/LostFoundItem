<?php

namespace Modules\Notification\Services;

use Modules\Notification\Contracts\NotificationServiceInterface;
use Modules\Notification\Models\AppNotification;

class NotificationService implements NotificationServiceInterface
{
    public function send(string $userId, string $title, string $message): void
    {
        // Modul ini mengurus databasenya sendiri
        AppNotification::create([
            'user_id' => $userId,
            'title' => $title,
            'message' => $message,
        ]);
    }
}
