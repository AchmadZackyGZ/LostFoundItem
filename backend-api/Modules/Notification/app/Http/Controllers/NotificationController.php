<?php

namespace Modules\Notification\Http\Controllers;

use App\Http\Controllers\Controller;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Modules\Notification\Models\AppNotification;

class NotificationController extends Controller
{
    // 1. AMBIL SEMUA NOTIFIKASI USER
    public function index(Request $request): JsonResponse
    {
        $notifications = AppNotification::where('user_id', $request->user()->id)
            ->latest()
            ->get();

        return response()->json([
            'message' => 'Berhasil mengambil notifikasi.',
            'data' => $notifications
        ], 200);
    }

    // 2. TANDAI NOTIFIKASI SUDAH DIBACA
    public function markAsRead(Request $request, string $id): JsonResponse
    {
        $notification = AppNotification::where('id', $id)
            ->where('user_id', $request->user()->id)
            ->first();

        if (!$notification) {
            return response()->json(['message' => 'Notifikasi tidak ditemukan'], 404);
        }

        $notification->update(['is_read' => true]);

        return response()->json([
            'message' => 'Notifikasi ditandai telah dibaca.',
            'data' => $notification
        ], 200);
    }

    // 3. TANDAI SEMUA NOTIFIKASI SUDAH DIBACA
    public function markAllAsRead(Request $request): JsonResponse
    {
        AppNotification::where('user_id', $request->user()->id)
            ->where('is_read', false)
            ->update(['is_read' => true]);

        return response()->json([
            'message' => 'Semua notifikasi ditandai telah dibaca.'
        ], 200);
    }
}
