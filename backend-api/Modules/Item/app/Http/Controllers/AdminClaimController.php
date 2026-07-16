<?php

namespace Modules\Item\Http\Controllers;

use App\Http\Controllers\Controller;
use Illuminate\Http\JsonResponse;
use Modules\Item\Models\Claim;

class AdminClaimController extends Controller
{
    // 1. LIHAT SEMUA KLAIM (Hanya untuk Admin)
    public function index(): JsonResponse
    {
        // Tarik semua data klaim, urutkan dari yang terbaru, sertakan data barang dan usernya
        $claims = Claim::with(['item', 'user'])->latest()->get();

        return response()->json([
            'message' => 'Berhasil mengambil seluruh data klaim.',
            'data' => $claims
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
        $claim->item->update(['status' => 'completed']);

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
        $claim->item->update(['status' => 'active']);

        return response()->json([
            'message' => 'Klaim berhasil DITOLAK. Barang kembali berstatus aktif di publik.',
            'data' => $claim
        ], 200);
    }
}
