<?php

namespace Modules\Item\Http\Controllers;

use App\Http\Controllers\Controller;
use Illuminate\Http\JsonResponse;
use Modules\Item\Http\Requests\StoreDiscussionRequest;
use Modules\Item\Services\DiscussionService;
use Exception;

class DiscussionController extends Controller
{
    // Inject Service
    private DiscussionService $discussionService;

    // Constructor Dependency Injection
    public function __construct(DiscussionService $discussionService)
    {
        $this->discussionService = $discussionService;
    }

    /**
     * Kirim Komentar Diskusi Baru (REST Endpoint)
     */
    public function store(StoreDiscussionRequest $request, string $itemId): JsonResponse
    {
        try {
            $user = $request->user();
            $discussion = $this->discussionService->postMessage(
                $itemId,
                $user,
                $request->message
            );

            return response()->json([
                'message' => 'Komentar berhasil ditambahkan.',
                'data' => [
                    'id' => $discussion->id,
                    'item_id' => $discussion->item_id,
                    'message' => $discussion->message,
                    'created_at' => $discussion->created_at,
                    'user' => [
                        'id' => $user->id,
                        'name' => $user->name,
                        'email' => $user->email ?? '-',
                        'department' => $user->department ?? 'Informatika',
                        'role' => $user->role ?? 'Mahasiswa',
                        'nim' => $user->nim ?? '-',
                        'avatar_url' => $user->avatar_url ?? null,
                    ]
                ]
            ], 201);
        } catch (Exception $e) {
            $code = $e->getCode() >= 400 && $e->getCode() < 600 ? $e->getCode() : 500;
            return response()->json(['message' => $e->getMessage()], $code);
        }
    }
}
