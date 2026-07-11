<?php

namespace Modules\Auth\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Cache;
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
        $user = User::create([
            'name' => $request->name,
            'email' => $request->email,
            'password' => Hash::make($request->password),
            'role' => 'mahasiswa', // Default role sesuai PRD
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


    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        return view('auth::index');
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        return view('auth::create');
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request) {}

    /**
     * Show the specified resource.
     */
    public function show($id)
    {
        return view('auth::show');
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit($id)
    {
        return view('auth::edit');
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, $id) {}

    /**
     * Remove the specified resource from storage.
     */
    public function destroy($id) {}
}
