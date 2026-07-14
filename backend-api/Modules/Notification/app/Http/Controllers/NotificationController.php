<?php

namespace Modules\Notification\Http\Controllers;

// use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Routing\Controller;
use Illuminate\Support\Facades\Auth;
use App\Models\User;

class NotificationController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        $user = Auth::user();

        $perPage = $request->input('per_page', 15);
        $notifications = $user->notifications()->paginate($perPage);

        return response()->json([
            'success' => true,
            'data' => $notifications->map(function ($notif) {
                return [
                    'id' => $notif->id,
                    'data' => $notif->data,
                    'read_at' => $notif->read_at,
                    'created_at' => $notif->created_at->toISOString(),
                ];
            }),
            'meta' => [
                'unread_count' => $user->unreadNotifications->count(),
                'pagination' => [
                    'total' => $notifications->total(),
                    'per_page' => $notifications->perPage(),
                    'current_page' => $notifications->currentPage(),
                ],
            ],
        ]);
    }

    // Menandai satu notifikasi sebagai sudah dibaca
    public function markAsRead(string $id)
    {
        /** @var User $user */
        $user = Auth::user();
        $notification = $user->notifications()->find($id);

        if (!$notification) {
            return response()->json(['success' => false, 'message' => 'Notifikasi tidak ditemukan'], 404);
        }

        $notification->markAsRead();
        return response()->json(['success' => true, 'message' => 'Notifikasi ditandai telah dibaca']);
    }

    // Menandai SEMUA notifikasi sebagai sudah dibaca
    public function markAllAsRead()
    {
        /** @var User $user */
        $user = Auth::user();
        $user->unreadNotifications->markAsRead();
        return response()->json(['success' => true, 'message' => 'Semua notifikasi ditandai telah dibaca']);
    }

    // Mendapatkan jumlah notifikasi yang belum dibaca (untuk badge)
    public function unreadCount()
    {
        /** @var User $user */
        $user = Auth::user();
        return response()->json([
            'success' => true,
            'data' => [
                'count' => $user->unreadNotifications->count(),
            ],
        ]);
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        return view('notification::create');
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request) {}

    /**
     * Show the specified resource.
     */
    public function show($id)
    {
        return view('notification::show');
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit($id)
    {
        return view('notification::edit');
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
