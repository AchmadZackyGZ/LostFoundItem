<?php

namespace Modules\Item\Http\Controllers;

use App\Http\Controllers\Controller;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Modules\Item\Http\Requests\StoreDiscussionRequest;
use Modules\Item\Models\Discussion;
use Modules\Item\Models\Item;
use Modules\Notification\Contracts\NotificationServiceInterface;

class DiscussionController extends Controller
{
    private NotificationServiceInterface $notificationService;

    public function __construct(NotificationServiceInterface $notificationService)
    {
        $this->notificationService = $notificationService;
    }

    public function store(StoreDiscussionRequest $request, string $itemId): JsonResponse
    {
        // Pastikan barangnya ada
        $item = Item::find($itemId);

        if (!$item) {
            return response()->json(['message' => 'Barang tidak ditemukan'], 404);
        }

        $userId = $request->user()->id;

        // Simpan komentar
        $discussion = Discussion::create([
            'item_id' => $item->id,
            'user_id' => $userId, // UUID user yang login
            'message' => $request->message,
        ]);

        // Kirim Notifikasi ke pembuat laporan jika bukan dirinya sendiri
        if ($item->user_id !== $userId) {
            $this->notificationService->send(
                $item->user_id,
                'Balasan Diskusi Baru',
                "Seseorang membalas komentar anda pada item {$item->title}.",
                'discussion',
                "/items/{$item->id}"
            );
        }

        return response()->json([
            'message' => 'Komentar berhasil ditambahkan.',
            'data' => $discussion
        ], 201);
    }
}
