<?php

namespace Modules\Chat\Http\Controllers;

use App\Http\Controllers\Controller;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Modules\Chat\Services\ChatService;
use Modules\Item\Contracts\ItemServiceInterface;
use Exception;

class ChatController extends Controller
{
    protected ItemServiceInterface $itemService;
    protected ChatService $chatService;

    public function __construct(
        ItemServiceInterface $itemService,
        ChatService $chatService
    ) {
        $this->itemService = $itemService;
        $this->chatService = $chatService;
    }

    /**
     * Memulai atau Membuka Ruang Obrolan
     */
    public function initiateConversation(Request $request, string $itemId): JsonResponse
    {
        $item = $this->itemService->findItemById($itemId);

        if (!$item) {
            return response()->json(['message' => 'Barang tidak ditemukan'], 404);
        }

        try {
            $conversation = $this->chatService->initiateConversation(
                $itemId,
                $request->user()->id,
                $item->user_id
            );

            return response()->json([
                'message' => 'Ruang obrolan berhasil dimuat.',
                'data' => $conversation
            ], 200);
        } catch (Exception $e) {
            $code = $e->getCode() >= 400 && $e->getCode() < 600 ? $e->getCode() : 500;
            return response()->json(['message' => $e->getMessage()], $code);
        }
    }

    /**
     * Mengirim Pesan
     */
    public function sendMessage(Request $request, string $conversationId): JsonResponse
    {
        $request->validate(['message' => 'required|string']);

        try {
            $message = $this->chatService->sendMessage(
                $conversationId,
                $request->user()->id,
                $request->message
            );

            return response()->json([
                'message' => 'Pesan terkirim.',
                'data' => $message
            ], 201);
        } catch (Exception $e) {
            $code = $e->getCode() >= 400 && $e->getCode() < 600 ? $e->getCode() : 500;
            return response()->json(['message' => $e->getMessage()], $code);
        }
    }

    /**
     * Mengambil Riwayat Pesan (Chat History)
     */
    public function getMessages(Request $request, string $conversationId): JsonResponse
    {
        try {
            $messages = $this->chatService->getMessages(
                $conversationId,
                $request->user()->id
            );

            return response()->json([
                'message' => 'Berhasil mengambil riwayat pesan.',
                'data' => $messages
            ], 200);
        } catch (Exception $e) {
            $code = $e->getCode() >= 400 && $e->getCode() < 600 ? $e->getCode() : 500;
            return response()->json(['message' => $e->getMessage()], $code);
        }
    }

    /**
     * Daftar Semua Obrolan User
     */
    public function myConversations(Request $request): JsonResponse
    {
        $conversations = $this->chatService->getUserConversations($request->user()->id);

        return response()->json([
            'message' => 'Berhasil mengambil daftar obrolan Anda.',
            'data' => $conversations
        ], 200);
    }
}
