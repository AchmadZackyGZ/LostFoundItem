<?php

namespace Modules\Notification\Contracts;

interface NotificationServiceInterface
{
    /**
     * Kirim notifikasi ke user tertentu.
     */
    public function send(string $userId, string $title, string $message, ?string $type = 'info', ?string $actionUrl = null): void;
}
