<?php

namespace Modules\Auth\Services;

use App\Models\User;
use Modules\Item\Models\Item;
use Modules\Item\Models\Claim;
use Carbon\Carbon;
use Exception;

class UserModerationService
{
    /**
     * Ambil seluruh pengguna ber-role mahasiswa
     */
    public function getStudentUsers()
    {
        return User::where('role', 'mahasiswa')->latest()->get();
    }

    /**
     * Detail Profil Pengguna beserta jumlah laporan & klaim
     */
    public function getUserProfile(string $id): array
    {
        $targetUser = User::find($id);

        if (!$targetUser) {
            throw new Exception('Pengguna tidak ditemukan', 404);
        }

        $reportedCount = Item::where('user_id', $targetUser->id)->count();
        $claimsCount = Claim::where('user_id', $targetUser->id)->count();

        return [
            'user' => $targetUser,
            'reported_items_count' => $reportedCount,
            'submitted_claims_count' => $claimsCount,
        ];
    }

    /**
     * Verifikasi Email Pengguna secara manual oleh Admin
     */
    public function verifyUserEmail(string $id): User
    {
        $targetUser = User::find($id);

        if (!$targetUser) {
            throw new Exception('Pengguna tidak ditemukan', 404);
        }

        $targetUser->update(['email_verified_at' => now()]);
        return $targetUser;
    }

    /**
     * Suspend atau Unsuspend Akun Pengguna Mahasiswa oleh Admin
     */
    public function suspendUser(string $userId, ?int $days, ?string $untilInput, ?string $reason, bool $isUnsuspend = false): User
    {
        $targetUser = User::find($userId);

        if (!$targetUser) {
            throw new Exception('Pengguna tidak ditemukan', 404);
        }

        if ($targetUser->role === 'admin') {
            throw new Exception('Akun Administrator tidak dapat ditangguhkan / suspend.', 403);
        }

        // Pencabutan Suspend (Unsuspend)
        if ($days === 0 || $isUnsuspend) {
            $targetUser->update([
                'suspended_until' => null,
                'suspend_reason' => null,
            ]);

            return $targetUser;
        }

        if ($untilInput) {
            $suspendedUntil = Carbon::parse($untilInput);
        } elseif (!is_null($days) && (int)$days > 0) {
            $suspendedUntil = now()->addDays((int)$days);
        } else {
            $suspendedUntil = now()->addDays(30);
        }

        $targetUser->update([
            'suspended_until' => $suspendedUntil,
            'suspend_reason' => $reason ?? 'Pelanggaran ketentuan obrolan & informasi sistem Lost & Found UISI',
        ]);

        return $targetUser;
    }

    /**
     * Hapus Akun Pengguna Permanen
     */
    public function deleteUserAccount(string $id, string $currentAdminId): bool
    {
        $targetUser = User::find($id);

        if (!$targetUser) {
            throw new Exception('Pengguna tidak ditemukan', 404);
        }

        if ($targetUser->id === $currentAdminId) {
            throw new Exception('Anda tidak bisa menghapus akun Anda sendiri.', 400);
        }

        return $targetUser->delete();
    }
}
