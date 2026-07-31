<?php

namespace Modules\Chat\Services;

use Modules\Chat\Models\Conversation;
use Modules\Chat\Models\Message;
use Exception;

class ChatService
{
    /**
     * Memulai atau Membuka Ruang Obrolan Percakapan
     */
    public function initiateConversation(string $itemId, string $userId, string $ownerId): Conversation
    {
        if ($userId === $ownerId) {
            throw new Exception('Anda tidak bisa chat dengan diri sendiri.', 400);
        }

        $conversation = Conversation::where('item_id', $itemId)
            ->where(function ($query) use ($userId, $ownerId) {
                $query->where('finder_id', $userId)->where('owner_id', $ownerId)
                    ->orWhere('finder_id', $ownerId)->where('owner_id', $userId);
            })->first();

        if (!$conversation) {
            $conversation = Conversation::create([
                'item_id' => $itemId,
                'finder_id' => $userId,
                'owner_id' => $ownerId,
            ]);
        }

        return $conversation;
    }

    /**
     * Mengirim Pesan Baru ke Ruang Obrolan
     */
    public function sendMessage(string $conversationId, string $userId, string $messageText): Message
    {
        $conversation = Conversation::find($conversationId);

        if (!$conversation) {
            throw new Exception('Ruang obrolan tidak ditemukan', 404);
        }

        if ($conversation->finder_id !== $userId && $conversation->owner_id !== $userId) {
            throw new Exception('Akses ditolak.', 403);
        }

        return Message::create([
            'conversation_id' => $conversation->id,
            'sender_id' => $userId,
            'message' => $messageText,
            'is_read' => false
        ]);
    }

    /**
     * Mengambil Riwayat Pesan dalam Percakapan
     */
    public function getMessages(string $conversationId, string $userId)
    {
        $conversation = Conversation::find($conversationId);

        if (!$conversation) {
            throw new Exception('Ruang obrolan tidak ditemukan', 404);
        }

        if ($conversation->finder_id !== $userId && $conversation->owner_id !== $userId) {
            throw new Exception('Akses ditolak.', 403);
        }

        return Message::where('conversation_id', $conversationId)
            ->with('sender:id,name')
            ->orderBy('created_at', 'asc')
            ->get();
    }

    /**
     * Daftar Semua Percakapan Pengguna
     */
    public function getUserConversations(string $userId)
    {
        return Conversation::where('finder_id', $userId)
            ->orWhere('owner_id', $userId)
            ->with(['item:id,title,image_path', 'finder:id,name', 'owner:id,name'])
            ->latest()
            ->get();
    }
}
