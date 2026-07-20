<?php

namespace Modules\Item\Http\Controllers;

use App\Http\Controllers\Controller;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Modules\Item\Http\Requests\StoreDiscussionRequest;
use Modules\Item\Models\Discussion;
use Modules\Item\Models\Item;

class DiscussionController extends Controller
{
    public function store(StoreDiscussionRequest $request, string $itemId): JsonResponse
    {
        // Pastikan barangnya ada
        $item = Item::find($itemId);

        if (!$item) {
            return response()->json(['message' => 'Barang tidak ditemukan'], 404);
        }

        // Simpan komentar
        $discussion = Discussion::create([
            'item_id' => $item->id,
            'user_id' => $request->user()->id, // UUID user yang login
            'message' => $request->message,
        ]);

        return response()->json([
            'message' => 'Komentar berhasil ditambahkan.',
            'data' => $discussion
        ], 201);
    }
}
