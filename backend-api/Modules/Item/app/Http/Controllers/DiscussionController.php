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

        // 🚫 SEPERTI USER REQUEST: Notifikasi diskusi/komentar tidak dikirimkan agar lonceng & toast tidak penuh
        // if ($item->user_id !== $userId) {
        //     $this->notificationService->send(
        //         $item->user_id,
        //         'Balasan Diskusi Baru',
        //         "Seseorang membalas komentar anda pada item {$item->title}.",
        //         'discussion',
        //         "/items/{$item->id}"
        //     );
        // }

        $user = $request->user();

        $discussionData = [
            'id' => $discussion->id,
            'item_id' => $item->id,
            'message' => $discussion->message,
            'created_at' => $discussion->created_at,
            'user' => [
                'id' => $user->id,
                'name' => $user->name,
                'avatar_url' => $user->avatar_url ?? null,
            ]
        ];

        // 📡 WEBSOCKET REALTIME BROADCASTING (PUSHER CHANNELS AP1)
        $pusherKey = env('PUSHER_APP_KEY', 'b829baf1ed757a809bf3');
        $pusherSecret = env('PUSHER_APP_SECRET', '62959d7a0d92acbd7334');
        $pusherId = env('PUSHER_APP_ID', '2180462');
        $pusherCluster = env('PUSHER_APP_CLUSTER', 'ap1');

        if ($pusherKey && $pusherSecret && $pusherId) {
            try {
                $options = ['cluster' => $pusherCluster, 'useTLS' => true];
                $pusher = new \Pusher\Pusher($pusherKey, $pusherSecret, $pusherId, $options);
                $pusher->trigger("item-discussion-{$item->id}", 'new-discussion', $discussionData);
            } catch (\Throwable $e) {
                \Illuminate\Support\Facades\Log::error('Pusher trigger error: ' . $e->getMessage());
            }
        }

        return response()->json([
            'message' => 'Komentar berhasil ditambahkan.',
            'data' => $discussionData
        ], 201);
    }
}
