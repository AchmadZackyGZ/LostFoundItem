<?php

namespace Modules\Item\Http\Controllers;

use App\Http\Controllers\Controller;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Modules\Item\Http\Requests\StoreClaimRequest;
use Modules\Item\Models\Claim;
use Modules\Item\Models\Item;

class ClaimController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        return view('item::index');
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        return view('item::create');
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
            'status' => 'pending_claim'
        ]);

        return response()->json([
            'message' => 'Klaim berhasil diajukan. Menunggu konfirmasi pemilik postingan.',
            'data' => $claim
        ], 201);
    }

    /**
     * Show the specified resource.
     */
    public function show($id)
    {
        return view('item::show');
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit($id)
    {
        return view('item::edit');
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, $id) {}

    /**
     * Remove the specified resource from storage.
     */
    public function destroy($id) {}
}
