<?php

use Illuminate\Support\Facades\Route;
use Modules\Auth\Http\Controllers\AuthController;

Route::prefix('auth')->group(function () {
    Route::post('/register', [AuthController::class, 'register']);
    Route::post('/login', [AuthController::class, 'login']);

    // Route untuk verifikasi OTP
    Route::post('/verify-email', [AuthController::class, 'verifyEmail']);

    // Route Resend Email dengan Throttle (1 = max hit, 1 = dalam hitungan 1 menit)
    Route::post('/resend-verification', [AuthController::class, 'resendVerification'])
        ->middleware('throttle:1,1');

    Route::middleware('auth:sanctum')->group(function () {
        Route::post('/logout', [AuthController::class, 'logout']);
        Route::get('/me', function (\Illuminate\Http\Request $request) {
            return response()->json($request->user());
        });
        Route::put('/profile', [AuthController::class, 'updateProfile']);
        Route::post('/profile/avatar', [AuthController::class, 'updateAvatar']);
        Route::put('/password', [AuthController::class, 'updatePassword']);
        Route::post('/phone/send-otp', [AuthController::class, 'sendPhoneOtp']);
        Route::post('/phone/verify-otp', [AuthController::class, 'verifyPhoneOtp']);
    });
});
