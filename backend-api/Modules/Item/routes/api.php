<?php

use Illuminate\Support\Facades\Route;
use Modules\Item\Http\Controllers\AdminClaimController;
use Modules\Item\Http\Controllers\ItemController;
use Modules\Item\Http\Controllers\DiscussionController;
use Modules\Item\Http\Controllers\ClaimController;

Route::middleware(['auth:sanctum'])->prefix('v1')->group(function () {

    // RUTE SPESIFIK (Wajib di atas)
    Route::get('/my-items', [ItemController::class, 'myItems']);
    Route::get('/my-claims', [ClaimController::class, 'myClaims']);

    Route::get('/dashboard/stats', [ItemController::class, 'getDashboardStats']);
    Route::get('/items/recent', [ItemController::class, 'getRecentItems']);

    Route::get('/categories', [ItemController::class, 'getCategories']);

    // RUTE REKURSIF KELOLA ITEM
    Route::apiResource('items', ItemController::class)->names('item');

    // Route Diskusi & Klaim pada Item
    Route::post('/items/{id}/discussions', [DiscussionController::class, 'store']);
    Route::post('/items/{id}/claims', [ClaimController::class, 'store']);
});


/*
|--------------------------------------------------------------------------
| API ROLE ADMIN
|--------------------------------------------------------------------------
*/
Route::middleware(['auth:sanctum', 'role:admin'])->prefix('v1/admin')->group(function () {

    Route::get('/items/pending', [ItemController::class, 'getPendingItems']);

    // Lihat semua antrean klaim
    Route::get('/claims', [AdminClaimController::class, 'index']);

    // Tombol Setuju & Tolak Klaim
    Route::put('/claims/{id}/approve', [AdminClaimController::class, 'approve']);
    Route::put('/claims/{id}/reject', [AdminClaimController::class, 'reject']);
    Route::put('/items/{id}/approve', [ItemController::class, 'approvePendingItem']);
});
