<?php

use Illuminate\Support\Facades\Route;
use Modules\Item\Http\Controllers\ItemController;

Route::middleware(['auth', 'verified'])->group(function () {
    Route::resource('items', ItemController::class)->names('item');
});
