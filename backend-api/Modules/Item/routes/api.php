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

    Route::apiResource('items', ItemController::class)->names('item');
    Route::post('/', [ItemController::class, 'store']); // buat laporan 
    Route::get('/', [ItemController::class, 'index']); // ambil semua laporan 

    Route::get('/{id}', [ItemController::class, 'show']); // Lihat detail barang & komentar
    Route::post('/{id}/discussions', [DiscussionController::class, 'store']); // Kirim komentar

    // Route Klaim
    Route::post('/{id}/claims', [ClaimController::class, 'store']);
});


/*
|--------------------------------------------------------------------------
| API ROLE ADMIN
|--------------------------------------------------------------------------
*/
Route::middleware(['auth:sanctum', 'role:admin'])->prefix('v1/admin')->group(function () {

    // Lihat semua antrean klaim
    Route::get('/claims', [AdminClaimController::class, 'index']);

    // Tombol Setuju & Tolak Klaim
    Route::put('/claims/{id}/approve', [AdminClaimController::class, 'approve']);
    Route::put('/claims/{id}/reject', [AdminClaimController::class, 'reject']);
});
