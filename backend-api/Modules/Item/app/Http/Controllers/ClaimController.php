<?php

namespace Modules\Item\Http\Controllers;

use App\Http\Controllers\Controller;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Modules\Item\Http\Requests\StoreClaimRequest;
use Modules\Item\Models\Claim;
use Modules\Item\Models\Item;
use Modules\Notification\Contracts\NotificationServiceInterface;

class ClaimController extends Controller
{
    private NotificationServiceInterface $notificationService;

    public function __construct(NotificationServiceInterface $notificationService)
    {
        $this->notificationService = $notificationService;
    }
    /**
     * Store a newly created resource in storage.
     */
    public function store(StoreClaimRequest $request, string $itemId): JsonResponse
    {
        $item = Item::find($itemId);

        if (!$item) {
            return response()->json([
                'message' => 'Barang Tidak Ditemukan'
            ], 404);
        }

        // logc validasi klaim ke diri sendiri
        if ($item->user_id === $request->user()->id) {
            return response()->json([
                'message' => 'Akses ditolak: Anda tidak bisa mengajukan klaim untuk laporan barang Anda sendiri.'
            ], 403); // Status 403 (Forbidden) sangat tepat untuk pelanggaran hak akses
        }

        if ($item->status !== 'active') {
            return response()->json([
                'message' => 'Barang ini sudah dalam proses klaim atau sudah dikembalikan.'
            ], 400);
        }

        // Upload foto bukti ke Cloudinary (Folder terpisah: claims)
        $proofImageUrl = null;
        if ($request->hasFile('proof_image')) {
            $uploadedFileUrl = cloudinary()->upload($request->file('proof_image')->getRealPath(), [
                'folder' => 'lost_found_uisi/claims'
            ])->getSecurePath();

            $proofImageUrl = $uploadedFileUrl;
        }

        // 1. Buat record Klaim (Gunakan field yang BENAR: proof_description)
        $claim = Claim::create([
            'item_id' => $item->id,
            'user_id' => $request->user()->id,
            'proof_image_path' => $proofImageUrl,
            'proof_description' => $request->proof_description, // <-- Diperbaiki disini
            'status' => 'pending',
        ]);

        // 2. Ubah status barang menjadi pending_claim (Mengunci barang)
        $item->update([
            'status' => 'is_pending'
        ]);

        // 3. Kirim Notifikasi via Contract (Modular Monolith)
        $this->notificationService->send(
            $request->user()->id,
            'Pengajuan Klaim Terkirim',
            "Klaim anda untuk {$item->title} telah diajukan dan menunggu verifikasi admin.",
            'claim',
            "/items/{$item->id}"
        );

        return response()->json([
            'message' => 'Klaim berhasil diajukan. Silakan tunggu verifikasi bukti kepemilikan oleh Admin',
            'data' => $claim
        ], 201);
    }

    public function myClaims(Request $request): JsonResponse
    {
        $userId = $request->user()->id;

        // Tarik data klaim beserta detail barang yang diklaim
        $claims = Claim::where('user_id', $userId)
            ->with('item')
            ->latest()
            ->get();

        $mappedClaims = $claims->map(function ($claim) {
            return [
                'id' => $claim->id,
                'item_id' => $claim->item_id,
                'item_title' => $claim->item->title ?? 'Barang sudah dihapus',
                'proof_description' => $claim->proof_description,
                'proof_image_path' => $claim->proof_image_path,
                'status' => $claim->status, // Akan berisi: pending, approved, atau rejected
                'created_at' => $claim->created_at,
            ];
        });

        return response()->json([
            'message' => 'Berhasil mengambil riwayat klaim Anda',
            'data' => $mappedClaims
        ], 200);
    }
}
