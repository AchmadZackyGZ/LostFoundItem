<?php

use Illuminate\Support\Facades\Route;
use Modules\Notification\Http\Controllers\NotificationController;

Route::middleware(['auth:sanctum'])->prefix('v1/notifications')->group(function () {
    Route::get('/', [NotificationController::class, 'index']);
    Route::get('/notifications', [NotificationController::class, 'index']);
    Route::get('/notifications/unread-count', [NotificationController::class, 'unreadCount']);
    Route::put('/{id}/read', [NotificationController::class, 'markAsRead']);
    Route::put('/read-all', [NotificationController::class, 'markAllAsRead']);
});
