<?php

namespace Modules\Item\Services;

use Modules\Item\Models\Discussion;
use Modules\Item\Models\Item;
use App\Models\User;
use Pusher\Pusher;
use Exception;

class DiscussionService
{
    /**
     * Simpan Komentar / Pesan Diskusi Baru & Broadcast via Pusher WebSocket
     */
    public function postMessage(string $itemId, User $user, string $message): Discussion
    {
        $item = Item::find($itemId);

        if (!$item) {
            throw new Exception('Barang tidak ditemukan', 404);
        }

        if ($user->isSuspended()) {
            $until = $user->suspended_until ? $user->suspended_until->translatedFormat('d F Y H:i') . ' WIB' : 'Permanen';
            throw new Exception("Akun Anda sedang ditangguhkan (Suspend) sampai {$until}.\nAlasan: " . ($user->suspend_reason ?? 'Pelanggaran ketentuan obrolan'), 403);
        }

        $discussion = Discussion::create([
            'item_id' => $item->id,
            'user_id' => $user->id,
            'message' => $message,
        ]);

        $discussion->load('user');

        // Broadcast Real-Time via Pusher WebSocket Client secara Dinamis dari .env / Config
        $pusherKey = config('broadcasting.connections.pusher.key') ?: env('PUSHER_APP_KEY');
        $pusherSecret = config('broadcasting.connections.pusher.secret') ?: env('PUSHER_APP_SECRET');
        $pusherId = config('broadcasting.connections.pusher.app_id') ?: env('PUSHER_APP_ID');
        $pusherCluster = config('broadcasting.connections.pusher.options.cluster') ?: env('PUSHER_APP_CLUSTER', 'ap1');

        if ($pusherKey && $pusherSecret && $pusherId) {
            try {
                $pusher = new Pusher(
                    $pusherKey,
                    $pusherSecret,
                    $pusherId,
                    [
                        'cluster' => $pusherCluster,
                        'useTLS' => true,
                    ]
                );

                $pusher->trigger("item-discussion.{$itemId}", 'discussion-posted', [
                    'discussion' => [
                        'id' => $discussion->id,
                        'item_id' => $discussion->item_id,
                        'message' => $discussion->message,
                        'created_at' => $discussion->created_at->toIso8601String(),
                        'user' => [
                            'id' => $discussion->user->id,
                            'name' => $discussion->user->name,
                            'email' => $discussion->user->email,
                            'department' => $discussion->user->department ?? 'Informatika',
                            'role' => $discussion->user->role ?? 'mahasiswa',
                            'nim' => $discussion->user->nim ?? ($discussion->user->role === 'admin' ? '1988041201' : '3012210001'),
                            'avatar_url' => $discussion->user->avatar_url ?? null,
                        ],
                    ]
                ]);
            } catch (Exception $e) {
                logger()->error('Pusher broadcast failed: ' . $e->getMessage());
            }
        }

        return $discussion;
    }

    /**
     * Ambil seluruh komentar diskusi untuk item tertentu
     */
    public function getItemDiscussions(string $itemId)
    {
        return Discussion::where('item_id', $itemId)
            ->with('user')
            ->orderBy('created_at', 'asc')
            ->get();
    }
}
