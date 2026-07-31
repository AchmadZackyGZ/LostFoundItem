<?php

namespace Modules\Notification\Http\Controllers;

use App\Http\Controllers\Controller;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Modules\Notification\Services\NotificationService;
use Exception;

class NotificationController extends Controller
{
    private NotificationService $notificationService;

    public function __construct(NotificationService $notificationService)
    {
        $this->notificationService = $notificationService;
    }

    /**
     * Ambil Seluruh Notifikasi User Login
     */
    public function index(Request $request): JsonResponse
    {
        $notifications = $this->notificationService->getUserNotifications($request->user()->id);

        return response()->json([
            'message' => 'Berhasil mengambil notifikasi.',
            'data' => $notifications
        ], 200);
    }

    /**
     * Tandai Single Notifikasi Sudah Dibaca
     */
    public function markAsRead(Request $request, string $id): JsonResponse
    {
        try {
            $notification = $this->notificationService->markAsRead($id, $request->user()->id);

            return response()->json([
                'message' => 'Notifikasi ditandai telah dibaca.',
                'data' => $notification
            ], 200);
        } catch (Exception $e) {
            $code = $e->getCode() >= 400 && $e->getCode() < 600 ? $e->getCode() : 500;
            return response()->json(['message' => $e->getMessage()], $code);
        }
    }

    /**
     * Tandai Semua Notifikasi Sudah Dibaca
     */
    public function markAllAsRead(Request $request): JsonResponse
    {
        $this->notificationService->markAllAsRead($request->user()->id);

        return response()->json([
            'message' => 'Semua notifikasi ditandai telah dibaca.'
        ], 200);
    }
}
