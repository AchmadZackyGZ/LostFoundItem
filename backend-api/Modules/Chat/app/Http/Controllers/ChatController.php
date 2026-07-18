<?php

namespace Modules\Chat\Http\Controllers;

use App\Http\Controllers\Controller;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Modules\Chat\Models\Conversation;
use Modules\Chat\Models\Message;
use Modules\Item\Models\Item;

class ChatController extends Controller
{
    // 1. MEMULAI ATAU MEMBUKA RUANG OBROLAN (Sihir Tokopedia)
    public function initiateConversation(Request $request, string $itemId): JsonResponse
    {
        $item = Item::find($itemId);

        if (!$item) {
            return response()->json(['message' => 'Barang tidak ditemukan'], 404);
        }

        $userId = $request->user()->id; // Orang yang mau nge-chat (Finder/Seeker)
        $ownerId = $item->user_id; // Orang yang memposting barang

        // 🚨 Cegah user chat dirinya sendiri
        if ($userId === $ownerId) {
            return response()->json(['message' => 'Anda tidak bisa chat dengan diri sendiri.'], 400);
        }

        // 🔍 Cek apakah mereka sudah punya room chat untuk barang ini
        $conversation = Conversation::where('item_id', $itemId)
            ->where(function ($query) use ($userId, $ownerId) {
                $query->where('finder_id', $userId)->where('owner_id', $ownerId)
                    ->orWhere('finder_id', $ownerId)->where('owner_id', $userId);
            })->first();

        // 🛠️ Jika belum ada, buatkan Room baru
        if (!$conversation) {
            $conversation = Conversation::create([
                'item_id' => $itemId,
                'finder_id' => $userId,
                'owner_id' => $ownerId,
            ]);
        }

        return response()->json([
            'message' => 'Ruang obrolan berhasil dimuat.',
            'data' => $conversation
        ], 200);
    }

    // 2. MENGIRIM PESAN
    public function sendMessage(Request $request, string $conversationId): JsonResponse
    {
        $request->validate(['message' => 'required|string']);

        $conversation = Conversation::find($conversationId);

        if (!$conversation) {
            return response()->json(['message' => 'Ruang obrolan tidak ditemukan'], 404);
        }

        $userId = $request->user()->id;

        // 🚨 Pastikan user adalah bagian dari chat ini (Bukan penyusup)
        if ($conversation->finder_id !== $userId && $conversation->owner_id !== $userId) {
            return response()->json(['message' => 'Akses ditolak.'], 403);
        }

        $message = Message::create([
            'conversation_id' => $conversation->id,
            'sender_id' => $userId,
            'message' => $request->message,
            'is_read' => false
        ]);

        return response()->json([
            'message' => 'Pesan terkirim.',
            'data' => $message
        ], 201);
    }

    // 3. MENGAMBIL RIWAYAT PESAN (Chat History)
    public function getMessages(Request $request, string $conversationId): JsonResponse
    {
        $conversation = Conversation::find($conversationId);

        if (!$conversation) {
            return response()->json(['message' => 'Ruang obrolan tidak ditemukan'], 404);
        }

        // 🚨 Gembok Privasi
        $userId = $request->user()->id;
        if ($conversation->finder_id !== $userId && $conversation->owner_id !== $userId) {
            return response()->json(['message' => 'Akses ditolak.'], 403);
        }

        // Tarik pesan urut dari yang paling lama ke terbaru (seperti WhatsApp)
        $messages = Message::where('conversation_id', $conversationId)
            ->with('sender:id,name') // Bawa nama pengirim
            ->orderBy('created_at', 'asc')
            ->get();

        return response()->json([
            'message' => 'Berhasil mengambil riwayat pesan.',
            'data' => $messages
        ], 200);
    }

    // 4. DAFTAR SEMUA OBROLAN USER (Untuk Halaman "Inbox" di Frontend)
    public function myConversations(Request $request): JsonResponse
    {
        $userId = $request->user()->id;

        // Tarik semua room dimana user adalah finder ATAU owner
        $conversations = Conversation::where('finder_id', $userId)
            ->orWhere('owner_id', $userId)
            ->with(['item:id,title,image_path', 'finder:id,name', 'owner:id,name'])
            ->latest() // Urutkan room terbaru
            ->get();

        return response()->json([
            'message' => 'Berhasil mengambil daftar obrolan Anda.',
            'data' => $conversations
        ], 200);
    }
}
