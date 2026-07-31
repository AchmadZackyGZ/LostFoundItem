<?php

namespace Modules\Item\Http\Controllers;

use App\Http\Controllers\Controller;
use Illuminate\Http\JsonResponse;
use Modules\Item\Models\Claim;
use Modules\Item\Services\ClaimService;
use Modules\Auth\Contracts\AuthClientInterface;
use Exception;

class AdminClaimController extends Controller
{
    private ClaimService $claimService;
    private AuthClientInterface $authClient;

    public function __construct(
        ClaimService $claimService,
        AuthClientInterface $authClient
    ) {
        $this->claimService = $claimService;
        $this->authClient = $authClient;
    }

    /**
     * Lihat Seluruh Antrean Klaim (Admin Endpoint)
     */
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

    /**
     * Terima / Setujui Klaim (Approve)
     */
    public function approve(string $id): JsonResponse
    {
        try {
            $claim = $this->claimService->approveClaim($id);
            return response()->json([
                'message' => 'Klaim berhasil DISETUJUI. Status barang telah diperbarui menjadi Selesai.',
                'data' => $claim
            ], 200);
        } catch (Exception $e) {
            $code = $e->getCode() >= 400 && $e->getCode() < 600 ? $e->getCode() : 500;
            return response()->json(['message' => $e->getMessage()], $code);
        }
    }  

    /**
     * Tolak Klaim (Reject)
     */
    public function reject(string $id): JsonResponse
    {
        try {
            $claim = $this->claimService->rejectClaim($id);
            return response()->json([
                'message' => 'Klaim berhasil DITOLAK. Barang kembali berstatus aktif di publik.',
                'data' => $claim
            ], 200);
        } catch (Exception $e) {
            $code = $e->getCode() >= 400 && $e->getCode() < 600 ? $e->getCode() : 500;
            return response()->json(['message' => $e->getMessage()], $code);
        }
    }
}
