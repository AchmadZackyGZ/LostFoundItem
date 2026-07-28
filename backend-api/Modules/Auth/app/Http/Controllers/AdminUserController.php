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
