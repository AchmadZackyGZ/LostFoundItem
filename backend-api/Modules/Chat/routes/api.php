<?php

use Illuminate\Support\Facades\Route;
use Modules\Chat\Http\Controllers\ChatController;

Route::middleware(['auth:sanctum'])->prefix('v1')->group(function () {
    Route::apiResource('chats', ChatController::class)->names('chat');

    // 1. Tekan tombol "Chat" dari halaman detail barang
    Route::post('/items/{itemId}/conversations', [ChatController::class, 'initiateConversation']);

    // 2. Halaman Inbox (Melihat daftar semua chat milik user)
    Route::get('/conversations', [ChatController::class, 'myConversations']);

    // 3. Masuk ke dalam Room Chat (Lihat pesan & Balas pesan)
    Route::get('/conversations/{conversationId}/messages', [ChatController::class, 'getMessages']);
    Route::post('/conversations/{conversationId}/messages', [ChatController::class, 'sendMessage']);
});
