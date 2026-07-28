<?php

namespace Modules\Notification\Services;

use Modules\Notification\Contracts\NotificationServiceInterface;
use Modules\Notification\Notifications\ItemStatusChangedNotification;
use Modules\Notification\Notifications\NewClaimReceivedNotification;
use Modules\Notification\Notifications\ClaimStatusUpdatedNotification;
use Modules\Notification\Notifications\NewDiscussionNotification;

class DatabaseNotificationService implements NotificationServiceInterface
{
    /**
     * {@inheritdoc}
     */
    public function notifyItemStatusChanged(
        object $user,
        string $status,
        array $itemData,
        ?string $reason = null,
    ): void {
        // Memanggil class Notifikasi Laravel yang spesifik
        $user->notify(new ItemStatusChangedNotification($status, $itemData, $reason));
    }

    /**
     * {@inheritdoc}
     */
    public function notifyNewClaimReceived(object $itemOwner, array $claimData): void
    {
        $itemOwner->notify(new NewClaimReceivedNotification($claimData));
    }

    /**
     * {@inheritdoc}
     */
    public function notifyClaimStatusUpdated(
        object $claimer,
        string $status,
        array $claimData,
        ?string $reason = null,
    ): void {
        $claimer->notify(new ClaimStatusUpdatedNotification($status, $claimData, $reason));
    }

    /**
     * {@inheritdoc}
     */
    public function notifyNewDiscussion(object $itemOwner, array $discussionData): void
    {
        $itemOwner->notify(new NewDiscussionNotification($discussionData));
    }
}
