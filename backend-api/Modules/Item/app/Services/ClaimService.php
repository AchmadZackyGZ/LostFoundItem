<?php

namespace Modules\Item\Services;

use Modules\Item\Models\Claim;
use Modules\Item\Models\Item;
use App\Models\User;
use CloudinaryLabs\CloudinaryLaravel\Facades\Cloudinary;
use Modules\Notification\Contracts\NotificationServiceInterface;
use Exception;

class ClaimService
{
    private NotificationServiceInterface $notificationService;

    public function __construct(NotificationServiceInterface $notificationService)
    {
        $this->notificationService = $notificationService;
    }

    /**
     * Membuat pengajuan klaim barang baru oleh mahasiswa
     */
    public function submitClaim(string $itemId, User $user, string $proofDescription, $proofImageFile = null): Claim
    {
        $item = Item::find($itemId);

        if (!$item) {
            throw new Exception('Barang Tidak Ditemukan', 404);
        }

        if ($item->user_id === $user->id) {
            throw new Exception('Akses ditolak: Anda tidak bisa mengajukan klaim untuk laporan barang Anda sendiri.', 403);
        }

        if ($item->status !== 'active') {
            throw new Exception('Barang ini sudah dalam proses klaim atau sudah dikembalikan.', 400);
        }

        $proofImageUrl = null;
        if ($proofImageFile) {
            $proofImageUrl = Cloudinary::upload($proofImageFile->getRealPath(), [
                'folder' => 'lost_found_uisi/claims',
            ])->getSecurePath();
        }

        $claim = Claim::create([
            'item_id' => $item->id,
            'user_id' => $user->id,
            'proof_image_path' => $proofImageUrl,
            'proof_description' => $proofDescription,
            'status' => 'pending',
        ]);

        $item->update(['status' => 'is_pending']);

        // Kirim Notifikasi
        $this->notificationService->send(
            $user->id,
            'Pengajuan Klaim Terkirim',
            "Klaim Anda untuk {$item->title} telah diajukan dan menunggu verifikasi Admin.",
            'claim',
            "/items/{$item->id}"
        );

        return $claim;
    }

    /**
     * Mengambil riwayat klaim oleh pengguna tertentu
     */
    public function getUserClaims(string $userId)
    {
        return Claim::where('user_id', $userId)
            ->with('item')
            ->latest()
            ->get();
    }

    /**
     * Admin: Setujui Klaim Barang
     */
    public function approveClaim(string $claimId): Claim
    {
        $claim = Claim::with('item')->findOrFail($claimId);
        $claim->update(['status' => 'approved']);

        if ($claim->item) {
            $claim->item->update(['status' => 'completed']);
        }

        $this->notificationService->send(
            $claim->user_id,
            'Klaim Disetujui! 🎉',
            "Klaim Anda untuk barang {$claim->item->title} telah DISETUJUI oleh Admin Kampus.",
            'claim_approved',
            "/items/{$claim->item_id}"
        );

        return $claim;
    }

    /**
     * Admin: Tolak Klaim Barang
     */
    public function rejectClaim(string $claimId, ?string $reason = null): Claim
    {
        $claim = Claim::with('item')->findOrFail($claimId);
        $claim->update(['status' => 'rejected']);

        if ($claim->item && $claim->item->status === 'is_pending') {
            $claim->item->update(['status' => 'active']);
        }

        $this->notificationService->send(
            $claim->user_id,
            'Klaim Ditolak',
            "Klaim Anda untuk barang {$claim->item->title} ditolak oleh Admin. " . ($reason ? "Alasan: {$reason}" : ""),
            'claim_rejected',
            "/items/{$claim->item_id}"
        );

        return $claim;
    }
}
