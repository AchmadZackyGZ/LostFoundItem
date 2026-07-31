<?php

namespace Modules\Item\Http\Controllers;

use App\Http\Controllers\Controller;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Modules\Item\Http\Requests\StoreClaimRequest;
use Modules\Item\Services\ClaimService;
use Exception;

class ClaimController extends Controller
{
    private ClaimService $claimService;

    public function __construct(ClaimService $claimService)
    {
        $this->claimService = $claimService;
    }

    /**
     * Pengajuan Klaim Barang oleh Mahasiswa (REST Endpoint)
     */
    public function store(StoreClaimRequest $request, string $itemId): JsonResponse
    {
        try {
            $proofImage = $request->hasFile('proof_image') ? $request->file('proof_image') : null;

            $claim = $this->claimService->submitClaim(
                $itemId,
                $request->user(),
                $request->proof_description,
                $proofImage
            );

            return response()->json([
                'message' => 'Klaim berhasil diajukan. Silakan tunggu verifikasi bukti kepemilikan oleh Admin',
                'data' => $claim
            ], 201);
        } catch (Exception $e) {
            $code = $e->getCode() >= 400 && $e->getCode() < 600 ? $e->getCode() : 500;
            return response()->json(['message' => $e->getMessage()], $code);
        }
    }

    /**
     * Riwayat Klaim oleh Pengguna Login
     */
    public function myClaims(Request $request): JsonResponse
    {
        $claims = $this->claimService->getUserClaims($request->user()->id);

        $mappedClaims = $claims->map(function ($claim) {
            return [
                'id' => $claim->id,
                'item_id' => $claim->item_id,
                'item_title' => $claim->item->title ?? 'Barang sudah dihapus',
                'proof_description' => $claim->proof_description,
                'proof_image_path' => $claim->proof_image_path,
                'status' => $claim->status,
                'created_at' => $claim->created_at,
            ];
        });

        return response()->json([
            'message' => 'Berhasil mengambil riwayat klaim Anda',
            'data' => $mappedClaims
        ], 200);
    }
}
