<?php

use Illuminate\Support\Facades\Route;
use Modules\Item\Http\Controllers\ItemController;

Route::middleware(['auth:sanctum'])->prefix('v1')->group(function () {
    Route::apiResource('items', ItemController::class)->names('item');
    Route::post('/', [ItemController::class, 'store']); // buat laporan 
    Route::get('/', [ItemController::class, 'index']); // ambil semua laporan 
});
