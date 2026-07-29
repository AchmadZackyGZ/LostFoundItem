<?php

namespace Modules\Auth\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Modules\Item\Models\Item;
use Modules\Item\Models\Claim;

class AdminUserController extends Controller
{
    /**
     * Lihat seluruh daftar pengguna terdaftar khusus Mahasiswa (Eksklusi Admin)
     */
    public function index(Request $request): JsonResponse
    {
        $users = User::where('role', 'mahasiswa')->latest()->get();

        $mappedUsers = $users->map(function ($user) {
            $reportedCount = Item::where('user_id', $user->id)->count();
            $claimsCount = Claim::where('user_id', $user->id)->count();

            return [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
                'nim' => $user->nim ?? '-',
                'department' => $user->department ?? 'Belum ada prodi',
                'role' => $user->role ?? 'mahasiswa',
                'phone' => $user->phone ?? '-',
                'avatar_url' => $user->avatar_url ?? null,
                'is_email_verified' => !is_null($user->email_verified_at),
                'is_phone_verified' => !is_null($user->phone_verified_at),
                'is_suspended' => $user->isSuspended(),
                'suspended_until' => $user->suspended_until ? $user->suspended_until->toIso8601String() : null,
                'suspend_reason' => $user->suspend_reason,
                'reported_items_count' => $reportedCount,
                'submitted_claims_count' => $claimsCount,
                'created_at' => $user->created_at,
            ];
        });

        return response()->json([
            'message' => 'Berhasil mengambil seluruh daftar pengguna mahasiswa.',
            'data' => $mappedUsers,
        ], 200);
    }

    /**
     * Detail Profil Pengguna (Bisa diakses oleh pengguna terautentikasi)
     */
    public function getUserProfile(string $id): JsonResponse
    {
        $targetUser = User::find($id);

        if (!$targetUser) {
            return response()->json(['message' => 'Pengguna tidak ditemukan'], 404);
        }

        $reportedCount = Item::where('user_id', $targetUser->id)->count();
        $claimsCount = Claim::where('user_id', $targetUser->id)->count();

        return response()->json([
            'message' => 'Berhasil mengambil detail profil pengguna.',
            'data' => [
                'id' => $targetUser->id,
                'name' => $targetUser->name,
                'email' => $targetUser->email,
                'nim' => $targetUser->nim ?? ($targetUser->role === 'admin' ? '1988041201' : '3012210001'),
                'department' => $targetUser->department ?? ($targetUser->role === 'admin' ? 'Biro Kemahasiswaan' : 'Informatika'),
                'role' => $targetUser->role ?? 'mahasiswa',
                'phone' => $targetUser->phone ?? null,
                'avatar_url' => $targetUser->avatar_url ?? null,
                'is_email_verified' => !is_null($targetUser->email_verified_at),
                'is_phone_verified' => !is_null($targetUser->phone_verified_at),
                'is_suspended' => $targetUser->isSuspended(),
                'suspended_until' => $targetUser->suspended_until ? $targetUser->suspended_until->toIso8601String() : null,
                'suspend_reason' => $targetUser->suspend_reason,
                'reported_items_count' => $reportedCount,
                'submitted_claims_count' => $claimsCount,
                'created_at' => $targetUser->created_at,
            ],
        ], 200);
    }

    /**
     * Verifikasi Email Pengguna Secara Manual oleh Admin
     */
    public function verifyUser(string $id): JsonResponse
    {
        $targetUser = User::find($id);

        if (!$targetUser) {
            return response()->json(['message' => 'Pengguna tidak ditemukan'], 404);
        }

        $targetUser->update(['email_verified_at' => now()]);

        return response()->json([
            'message' => "Akun {$targetUser->name} telah berhasil diverifikasi oleh Admin.",
            'data' => $targetUser,
        ], 200);
    }

    /**
     * Suspend / Unsuspend Akun Pengguna Mahasiswa oleh Admin
     */
    public function suspendUser(Request $request, string $id): JsonResponse
    {
        $targetUser = User::find($id);

        if (!$targetUser) {
            return response()->json(['message' => 'Pengguna tidak ditemukan'], 404);
        }

        if ($targetUser->role === 'admin') {
            return response()->json(['message' => 'Akun Administrator tidak dapat ditangguhkan / suspend.'], 403);
        }

        $days = $request->input('days');
        $untilInput = $request->input('suspended_until');
        $reason = $request->input('suspend_reason');

        // Jika request untuk Unsuspend
        if ($days === 0 || $request->input('unsuspend') === true) {
            $targetUser->update([
                'suspended_until' => null,
                'suspend_reason' => null,
            ]);

            return response()->json([
                'message' => "Penangguhan akun {$targetUser->name} telah dicabut (Un-suspended).",
                'data' => $targetUser,
            ], 200);
        }

        $request->validate([
            'suspend_reason' => 'required|string|max:500',
        ]);

        if ($untilInput) {
            $suspendedUntil = \Carbon\Carbon::parse($untilInput);
        } elseif (!is_null($days) && (int)$days > 0) {
            $suspendedUntil = now()->addDays((int)$days);
        } else {
            // Default 30 hari jika durasi tidak diisi
            $suspendedUntil = now()->addDays(30);
        }

        $targetUser->update([
            'suspended_until' => $suspendedUntil,
            'suspend_reason' => $reason,
        ]);

        return response()->json([
            'message' => "Akun {$targetUser->name} telah berhasil ditangguhkan (Suspend).",
            'data' => [
                'id' => $targetUser->id,
                'name' => $targetUser->name,
                'is_suspended' => true,
                'suspended_until' => $suspendedUntil->toIso8601String(),
                'suspend_reason' => $targetUser->suspend_reason,
            ],
        ], 200);
    }

    /**
     * Hapus Akun Pengguna Secara Permanen
     */
    public function destroy(Request $request, string $id): JsonResponse
    {
        $targetUser = User::find($id);

        if (!$targetUser) {
            return response()->json(['message' => 'Pengguna tidak ditemukan'], 404);
        }

        if ($targetUser->id === $request->user()->id) {
            return response()->json(['message' => 'Anda tidak bisa menghapus akun Anda sendiri.'], 400);
        }

        $targetUser->delete();

        return response()->json([
            'message' => 'Akun pengguna berhasil dihapus dari sistem.',
        ], 200);
    }
}
