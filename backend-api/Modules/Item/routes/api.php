<?php

use Illuminate\Support\Facades\Route;
use Modules\Item\Http\Controllers\ItemController;
use Modules\Item\Http\Controllers\DiscussionController;
use Modules\Item\Http\Controllers\ClaimController;

Route::middleware(['auth:sanctum'])->prefix('v1')->group(function () {
    Route::apiResource('items', ItemController::class)->names('item');
    Route::post('/', [ItemController::class, 'store']); // buat laporan 
    Route::get('/', [ItemController::class, 'index']); // ambil semua laporan 

    Route::get('/{id}', [ItemController::class, 'show']); // Lihat detail barang & komentar
    Route::post('/{id}/discussions', [DiscussionController::class, 'store']); // Kirim komentar

    // Route Klaim
    Route::post('/{id}/claims', [ClaimController::class, 'store']);
});
