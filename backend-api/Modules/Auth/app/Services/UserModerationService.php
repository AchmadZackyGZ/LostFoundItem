<?php

namespace Modules\Auth\Services;

use App\Models\User;
use Carbon\Carbon;
use Exception;

class UserModerationService
{
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
}
