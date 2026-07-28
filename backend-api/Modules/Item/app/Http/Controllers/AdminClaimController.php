<?php

namespace Modules\Item\Http\Controllers;

use App\Http\Controllers\Controller;
use Illuminate\Http\JsonResponse;
use Modules\Item\Models\Claim;
use Modules\Auth\Contracts\AuthClientInterface;
use Modules\Notification\Contracts\NotificationServiceInterface;

class AdminClaimController extends Controller
{
    private NotificationServiceInterface $notificationService;
    private AuthClientInterface $authClient;

    public function __construct(
        NotificationServiceInterface $notificationService,
        AuthClientInterface $authClient
    ) {
        $this->notificationService = $notificationService;
        $this->authClient = $authClient;
    }

    // 1. LIHAT SEMUA KLAIM (Hanya untuk Admin)
    public function index(): JsonResponse
    {
        $claims = Claim::with(['item'])->latest()->get();

        $mappedClaims = $claims->map(function ($claim) {
            $user = $this->authClient->getUserById($claim->user_id);
            return [
                'id' => $claim->id,
                'item_id' => $claim->item_id,
                'user_id' => $claim->user_id,
                'proof_description' => $claim->proof_description,
                'proof_image_path' => $claim->proof_image_path,
                'status' => $claim->status,
                'created_at' => $claim->created_at,
                'item' => $claim->item,
                'user' => [
                    'id' => $user['id'] ?? $claim->user_id,
                    'name' => $user['name'] ?? 'Pengguna UISI',
                    'email' => $user['email'] ?? '-',
                    'avatar_url' => $user['avatar_url'] ?? null,
                ]
            ];
        });

        return response()->json([
            'message' => 'Berhasil mengambil seluruh data klaim.',
            'data' => $mappedClaims
        ], 200);
    }

    // 2. TERIMA KLAIM (Approve)
    public function approve(string $id): JsonResponse
    {
        $claim = Claim::find($id);

        if (!$claim) {
            return response()->json(['message' => 'Data klaim tidak ditemukan'], 404);
        }

        // Ubah status klaim jadi disetujui
        $claim->update(['status' => 'approved']);

        // Ubah status barang utama jadi 'completed' (Selesai/Sudah dikembalikan)
        if ($claim->item) {
            $claim->item->update(['status' => 'completed']);

            // Kirim Notifikasi via Contract (Modular Monolith)
            $this->notificationService->send(
                $claim->user_id,
                'Klaim Barang Disetujui',
                "Klaim Anda untuk '{$claim->item->title}' telah diverifikasi dan disetujui oleh admin.",
                'claim',
                "/items/{$claim->item_id}"
            );
        }

        return response()->json([
            'message' => 'Klaim berhasil DISETUJUI. Status barang telah diperbarui menjadi Selesai.',
            'data' => $claim
        ], 200);
    }

    // 3. TOLAK KLAIM (Reject)
    public function reject(string $id): JsonResponse
    {
        $claim = Claim::find($id);

        if (!$claim) {
            return response()->json(['message' => 'Data klaim tidak ditemukan'], 404);
        }

        // Ubah status klaim jadi ditolak
        $claim->update(['status' => 'rejected']);

        // KEMBALIKAN status barang menjadi 'active' agar bisa diklaim oleh orang lain
        if ($claim->item) {
            $claim->item->update(['status' => 'active']);

            // Kirim Notifikasi via Contract (Modular Monolith)
            $this->notificationService->send(
                $claim->user_id,
                'Klaim Barang Ditolak',
                "Klaim Anda untuk '{$claim->item->title}' telah ditolak oleh admin.",
                'claim',
                "/items/{$claim->item_id}"
            );
        }

        return response()->json([
            'message' => 'Klaim berhasil DITOLAK. Barang kembali berstatus aktif di publik.',
            'data' => $claim
        ], 200);
    }
}
