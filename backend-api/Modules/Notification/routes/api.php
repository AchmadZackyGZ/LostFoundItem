<?php

use Illuminate\Support\Facades\Route;
use Modules\Notification\Http\Controllers\NotificationController;

Route::middleware(['auth:sanctum'])->prefix('v1')->group(function () {
    /* Changed by: Zacky */
    /* Route::get('/', [NotificationController::class, 'index']); */
    Route::get('/notifications', [NotificationController::class, 'index']);
    /* Changed by: Zacky */
    /* Route::apiResource('notifications', NotificationController::class)->names('notification'); */
    Route::get('/notifications/unread-count', [NotificationController::class, 'unreadCount']);
    Route::post('/notifications/{id}/read', [NotificationController::class, 'markAsRead']);
    Route::post('/notifications/read-all', [NotificationController::class, 'markAllAsRead']);
    Route::put('/{id}/read', [NotificationController::class, 'markAsRead']);
});
