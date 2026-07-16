<?php

namespace Modules\Notification\Contracts;

interface NotificationServiceInterface
{
    /**
     * Notifikasi saat status item berubah
     * (misal: pending -> published, atau pending -> rejected oleh admin)
     *
     * @param object $user         User penerima notifikasi (pemilik item)
     * @param string $status       Status baru item (published, rejected, dll)
     * @param array  $itemData     Data ringkas item (id, title, type, dll)
     * @param string|null $reason  Alasan penolakan (jika status = rejected)
     */
    public function notifyItemStatusChanged(
        object $user,
        string $status,
        array $itemData,
        ?string $reason = null,
    ): void;

    /**
     * Notifikasi ke pemilik item bahwa ada orang yang mengklaim barangnya
     *
     * @param object $itemOwner   Pemilik item yang diklaim
     * @param array  $claimData   Data ringkas klaim (id, claimer_name, proof_description)
     */
    public function notifyNewClaimReceived(
        object $itemOwner,
        array $claimData,
    ): void;

    /**
     * Notifikasi ke pengklaim bahwa klaimnya telah diproses admin
     * (disetujui atau ditolak)
     *
     * @param object      $claimer   User yang melakukan klaim
     * @param string      $status    Status klaim (approved / rejected)
     * @param array       $claimData Data ringkas klaim
     * @param string|null $reason    Alasan penolakan (jika rejected)
     */
    public function notifyClaimStatusUpdated(
        object $claimer,
        string $status,
        array $claimData,
        ?string $reason = null,
    ): void;

    /**
     * Notifikasi ke pemilik item bahwa ada diskusi/komentar baru
     *
     * @param object $itemOwner       Pemilik item
     * @param array  $discussionData  Data ringkas diskusi (id, message, commenter_name)
     */
    public function notifyNewDiscussion(
        object $itemOwner,
        array $discussionData,
    ): void;
}
