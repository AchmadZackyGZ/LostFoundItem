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

class AuthController extends Controller
{
    private function sendOtpEmail(string $email): void
    {
        $otp = (string) rand(100000, 999999); // Generate 6 digit angka

        // Simpan OTP di memori Cache selama 10 Menit menggunakan email sebagai Kunci (Key)
        Cache::put('otp_' . $email, $otp, now()->addMinutes(10));

        // Kirim Email
        Mail::to($email)->send(new VerificationEmail($otp));
    }


    public function register(RegisterRequest $request): JsonResponse
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|string|email|max:255|unique:users',
            'password' => 'required|string|min:8|confirmed',
            'nim' => 'required|string|unique:users', // Komen dihapus
            'department' => 'required|string',
        ]);

        $user = User::create([
            'name' => $request->name,
            'nim' => $request->nim,
            'email' => $request->email,
            'password' => Hash::make($request->password),
            'role' => 'mahasiswa', // Default role sesuai PRD
            'department' => $request->department,
        ]);

        $this->sendOtpEmail($user->email);

        return response()->json([
            'message' => 'Registrasi berhasil. Silakan cek email kampus Anda untuk memasukkan kode verifikasi 6 digit. Jangan lupa check di folder spam ya',
            'email' => $user->email // Kirim balik email agar frontend mudah lanjut ke halaman verifikasi
        ], 201);
    }

    public function verifyEmail(Request $request): JsonResponse
    {
        $request->validate([
            'email' => 'required|email',
            'otp' => 'required|string|size:6'
        ]);

        $cachedOtp = Cache::get('otp_' . $request->email);

        if (!$cachedOtp || $cachedOtp !== $request->otp) {
            return response()->json(['message' => 'Kode verifikasi tidak valid atau sudah kedaluwarsa.'], 400);
        }

        // Jika benar, ubah status email_verified_at di tabel users
        $user = User::where('email', $request->email)->first();
        $user->email_verified_at = now();
        $user->save();

        // Hapus OTP dari Cache agar tidak bisa dipakai 2x
        Cache::forget('otp_' . $request->email);

        return response()->json(['message' => 'Email berhasil diverifikasi. Silakan login.']);
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

        $this->sendOtpEmail($request->email);

        return response()->json(['message' => 'Kode verifikasi yang baru telah dikirim ke email Anda.']);
    }

    public function login(LoginRequest $request): JsonResponse
    {
        $user = User::where('email', $request->email)->first();

        if (!$user || !Hash::check($request->password, $user->password)) {
            return response()->json(['message' => 'Email atau password salah.'], 401);
        }

        // Cek apakah email sudah diverifikasi sebelum mengizinkan login
        if (!$user->email_verified_at) {
            return response()->json(['message' => 'Silakan verifikasi email Anda terlebih dahulu.'], 403);
        }

        // Cek apakah akun sedang di-suspend oleh Admin
        if ($user->isSuspended()) {
            $formattedUntil = $user->suspended_until
                ? $user->suspended_until->translatedFormat('d F Y \j\a\m H:i') . ' WIB'
                : 'Permanen';
            $reason = $user->suspend_reason ?? 'Pelanggaran ketentuan tata tertib obrolan & informasi di sistem Lost & Found UISI';

            return response()->json([
                'message' => "Akun Anda sedang DITANGGUHKAN (SUSPEND) sampai {$formattedUntil}.\n\nAlasan Suspend: {$reason}",
                'is_suspended' => true,
                'suspended_until' => $user->suspended_until ? $user->suspended_until->toIso8601String() : null,
                'suspend_reason' => $user->suspend_reason,
            ], 403);
        }

        // 🔥 TAMBAHKAN 2 BARIS INI: Ini kunci utama untuk SPA Authentication (Next.js)
        // Mendaftarkan user ke session dan mencegah serangan session fixation
        Auth::login($user);
        $request->session()->regenerate();

        // Pembuatan token di bawah ini boleh tetap dibiarkan jika Anda 
        // berencana membuat versi Mobile App (React Native/Flutter) nantinya.
        $token = $user->createToken('auth_token')->plainTextToken;

        return response()->json([
            'message' => 'Login berhasil.',
            'access_token' => $token,
            'token_type' => 'Bearer',
            'user' => $user
        ]);
    }

    public function logout(Request $request): JsonResponse
    {
        $request->user()->currentAccessToken()->delete();
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

        // Format nomor Indonesia (contoh: 082228244745 -> 6282228244745)
        $phone = preg_replace('/[^0-9]/', '', $rawPhone);
        if (str_starts_with($phone, '0')) {
            $phone = '62' . substr($phone, 1);
        }

        $otp = (string) rand(100000, 999999);

        // Simpan OTP ke cache dengan key user ID selama 10 menit
        Cache::put('otp_phone_' . $user->id, [
            'phone' => $phone,
            'otp' => $otp,
        ], now()->addMinutes(10));

        // 1. Kirim via Fonnte WhatsApp API jika FONNTE_TOKEN tersedia di .env
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
                    \Illuminate\Support\Facades\Log::warning("Fonnte WA Response Warning: ", $resData ?? []);
                }
            } catch (\Throwable $e) {
                $fonnteError = $e->getMessage();
                \Illuminate\Support\Facades\Log::error("Fonnte WA OTP Exception: " . $e->getMessage());
            }
        }

        // 2. Kirim juga kode OTP ke email kampus pengguna yang terdaftar sebagai cadangan
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

        // OTP Valid: Update nomor HP dan status terverifikasi
        $user->phone = $cachedData['phone'];
        $user->phone_verified_at = now();
        $user->save();

        Cache::forget('otp_phone_' . $user->id);

        // Kirim Notifikasi via Contract jika modul Notification tersedia
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

    // kode kode dibawah hasil generate dari php laravel nya jadi jika kita frontend nya menggunakan .blade maka 
    // logic logic yang diatas itu diganti dibawah tapi kita menggunakan FE selain .blade jadi ini hanya deadcode saja 
    // /**
    //  * Display a listing of the resource.
    //  */
    // public function index()
    // {
    //     return view('auth::index');
    // }

    // /**
    //  * Show the form for creating a new resource.
    //  */
    // public function create()
    // {
    //     return view('auth::create');
    // }

    // /**
    //  * Store a newly created resource in storage.
    //  */
    // public function store(Request $request) {}

    // /**
    //  * Show the specified resource.
    //  */
    // public function show($id)
    // {
    //     return view('auth::show');
    // }

    // /**
    //  * Show the form for editing the specified resource.
    //  */
    // public function edit($id)
    // {
    //     return view('auth::edit');
    // }

    // /**
    //  * Update the specified resource in storage.
    //  */
    // public function update(Request $request, $id) {}

    // /**
    //  * Remove the specified resource from storage.
    //  */
    // public function destroy($id) {}
}
