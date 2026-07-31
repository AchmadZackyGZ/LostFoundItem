<?php

namespace Modules\Auth\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Mail;
use Modules\Auth\Emails\VerificationEmail;
use Modules\Auth\Http\Requests\LoginRequest;
use Modules\Auth\Http\Requests\RegisterRequest;
use Modules\Auth\Services\AuthService;
use Exception;

class AuthController extends Controller
{
    private AuthService $authService;

    public function __construct(AuthService $authService)
    {
        $this->authService = $authService;
    }

    public function register(RegisterRequest $request): JsonResponse
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|string|email|max:255|unique:users',
            'password' => 'required|string|min:8|confirmed',
            'nim' => 'required|string|unique:users',
            'department' => 'required|string',
        ]);

        try {
            $user = $this->authService->registerUser($request->all());

            return response()->json([
                'message' => 'Registrasi berhasil. Silakan cek email kampus Anda untuk memasukkan kode verifikasi 6 digit. Jangan lupa check di folder spam ya',
                'email' => $user->email
            ], 201);
        } catch (Exception $e) {
            return response()->json(['message' => $e->getMessage()], 400);
        }
    }

    public function verifyEmail(Request $request): JsonResponse
    {
        $request->validate([
            'email' => 'required|email',
            'otp' => 'required|string|size:6'
        ]);

        try {
            $this->authService->verifyEmailOtp($request->email, $request->otp);
            return response()->json(['message' => 'Email berhasil diverifikasi. Silakan login.']);
        } catch (Exception $e) {
            return response()->json(['message' => $e->getMessage()], 400);
        }
    }

    public function resendVerification(Request $request): JsonResponse
    {
        $request->validate(['email' => 'required|email']);

        $user = User::where('email', $request->email)->first();

        if (!$user) {
            return response()->json(['message' => 'Akun tidak ditemukan.'], 404);
        }

        if ($user->email_verified_at) {
            return response()->json(['message' => 'Akun sudah diverifikasi sebelumnya.'], 400);
        }

        $this->authService->sendOtpEmail($request->email);

        return response()->json(['message' => 'Kode verifikasi yang baru telah dikirim ke email Anda.']);
    }

    public function login(LoginRequest $request): JsonResponse
    {
        try {
            $res = $this->authService->authenticate($request->email, $request->password);
            $user = $res['user'];

            Auth::login($user);
            $request->session()->regenerate();

            return response()->json([
                'message' => 'Login berhasil.',
                'access_token' => $res['token'],
                'token_type' => 'Bearer',
                'user' => $user
            ]);
        } catch (Exception $e) {
            $code = $e->getCode() >= 400 && $e->getCode() < 600 ? $e->getCode() : 400;
            return response()->json(['message' => $e->getMessage()], $code);
        }
    }

    public function logout(Request $request): JsonResponse
    {
        if ($request->user()->currentAccessToken()) {
            $request->user()->currentAccessToken()->delete();
        }
        return response()->json(['message' => 'Logout berhasil.']);
    }

    public function updateProfile(Request $request): JsonResponse
    {
        $user = $request->user();

        $validated = $request->validate([
            'name' => 'sometimes|string|max:255',
            'department' => 'sometimes|string|max:255',
            'phone' => 'sometimes|nullable|string|max:30',
        ]);

        $user->update($validated);

        return response()->json([
            'message' => 'Profil berhasil diperbarui.',
            'user' => $user
        ], 200);
    }

    public function updatePassword(Request $request): JsonResponse
    {
        $request->validate([
            'current_password' => 'required|string',
            'new_password' => 'required|string|min:8|confirmed',
        ]);

        $user = $request->user();

        if (!Hash::check($request->current_password, $user->password)) {
            return response()->json([
                'message' => 'Password saat ini tidak sesuai.'
            ], 400);
        }

        $user->update([
            'password' => Hash::make($request->new_password)
        ]);

        return response()->json([
            'message' => 'Password berhasil diperbarui.'
        ], 200);
    }

    public function sendPhoneOtp(Request $request): JsonResponse
    {
        $request->validate([
            'phone' => 'required|string|max:30',
        ]);

        $user = $request->user();
        $rawPhone = trim($request->phone);

        $phone = preg_replace('/[^0-9]/', '', $rawPhone);
        if (str_starts_with($phone, '0')) {
            $phone = '62' . substr($phone, 1);
        }

        $otp = (string) rand(100000, 999999);

        Cache::put('otp_phone_' . $user->id, [
            'phone' => $phone,
            'otp' => $otp,
        ], now()->addMinutes(10));

        $fonnteToken = trim(env('FONNTE_TOKEN'));
        $waSent = false;
        $fonnteError = null;

        if (!empty($fonnteToken)) {
            try {
                $response = \Illuminate\Support\Facades\Http::withHeaders([
                    'Authorization' => $fonnteToken,
                ])->post('https://api.fonnte.com/send', [
                    'target' => $phone,
                    'message' => "*[TraceBack - Lost & Found UISI]*\n\nKode OTP Verifikasi WhatsApp Anda adalah: *{$otp}*\n\nKode ini berlaku selama 10 menit. Jangan bagikan kode ini kepada siapapun.",
                ]);

                $resData = $response->json();
                if ($response->successful() && isset($resData['status']) && $resData['status'] === true) {
                    $waSent = true;
                } else {
                    $fonnteError = $resData['reason'] ?? 'Gagal mengirim WA';
                }
            } catch (\Throwable $e) {
                $fonnteError = $e->getMessage();
            }
        }

        try {
            Mail::to($user->email)->send(new VerificationEmail($otp));
        } catch (\Throwable $e) {
            \Illuminate\Support\Facades\Log::error("Email OTP Error: " . $e->getMessage());
        }

        return response()->json([
            'message' => $waSent
                ? "Kode OTP 6-digit telah berhasil dikirim ke WhatsApp {$phone}."
                : "Kode OTP 6-digit telah dikirim ke WhatsApp {$phone} dan Email kampus Anda ({$user->email}).",
            'phone' => $phone,
            'wa_sent' => $waSent,
            'fonnte_error' => $fonnteError,
        ], 200);
    }

    public function verifyPhoneOtp(Request $request): JsonResponse
    {
        $request->validate([
            'otp' => 'required|string|size:6',
        ]);

        $user = $request->user();
        $cachedData = Cache::get('otp_phone_' . $user->id);

        if (!$cachedData || $cachedData['otp'] !== $request->otp) {
            return response()->json([
                'message' => 'Kode OTP tidak valid atau sudah kedaluwarsa.'
            ], 400);
        }

        $user->phone = $cachedData['phone'];
        $user->phone_verified_at = now();
        $user->save();

        Cache::forget('otp_phone_' . $user->id);

        if (app()->bound(\Modules\Notification\Contracts\NotificationServiceInterface::class)) {
            app(\Modules\Notification\Contracts\NotificationServiceInterface::class)->send(
                $user->id,
                'Nomor Telepon Terhubung',
                "Nomor WhatsApp/HP {$user->phone} telah berhasil terverifikasi dan terhubung ke akun Anda.",
                'system',
                '/profile'
            );
        }

        return response()->json([
            'message' => 'Nomor telepon berhasil terverifikasi dan terhubung ke akun Anda!',
            'user' => $user,
        ], 200);
    }

    public function updateAvatar(Request $request): JsonResponse
    {
        $request->validate([
            'avatar' => 'required|image|mimes:jpeg,png,jpg,webp|max:5120',
        ]);

        $user = $request->user();

        if ($request->hasFile('avatar')) {
            $uploadedFileUrl = cloudinary()->upload($request->file('avatar')->getRealPath(), [
                'folder' => 'lost_found_uisi/avatars'
            ])->getSecurePath();

            $user->avatar_url = $uploadedFileUrl;
            $user->save();
        }

        return response()->json([
            'message' => 'Foto profil berhasil diperbarui.',
            'avatar_url' => $user->avatar_url,
            'user' => $user
        ], 200);
    }
}
