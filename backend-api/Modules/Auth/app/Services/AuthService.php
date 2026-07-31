<?php

namespace Modules\Auth\Services;

use App\Models\User;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Mail;
use Modules\Auth\Emails\VerificationEmail;
use Exception;

class AuthService
{
    /**
     * Kirim Kode OTP Verifikasi Email Kampus
     */
    public function sendOtpEmail(string $email): void
    {
        $otp = (string) rand(100000, 999999);

        // Simpan OTP di Cache 10 Menit
        Cache::put('otp_' . $email, $otp, now()->addMinutes(10));

        // Kirim Email
        Mail::to($email)->send(new VerificationEmail($otp));
    }

    /**
     * Mendaftarkan Pengguna Mahasiswa Baru
     */
    public function registerUser(array $data): User
    {
        $user = User::create([
            'name' => $data['name'],
            'nim' => $data['nim'],
            'email' => $data['email'],
            'password' => Hash::make($data['password']),
            'role' => 'mahasiswa',
            'department' => $data['department'],
        ]);

        $this->sendOtpEmail($user->email);

        return $user;
    }

    /**
     * Verifikasi Email menggunakan Kode OTP 6 Digit
     */
    public function verifyEmailOtp(string $email, string $otp): User
    {
        $cachedOtp = Cache::get('otp_' . $email);

        if (!$cachedOtp || $cachedOtp !== $otp) {
            throw new Exception('Kode verifikasi (OTP) tidak valid atau sudah kedaluwarsa.');
        }

        $user = User::where('email', $email)->first();

        if (!$user) {
            throw new Exception('Pengguna dengan email ini tidak ditemukan.');
        }

        $user->update(['email_verified_at' => now()]);
        Cache::forget('otp_' . $email);

        return $user;
    }

    /**
     * Authenticate User (Login Check & Token Generation)
     */
    public function authenticate(string $email, string $password): array
    {
        $user = User::where('email', $email)->first();

        if (!$user || !Hash::check($password, $user->password)) {
            throw new Exception('Email atau password salah.', 401);
        }

        if (!$user->email_verified_at) {
            throw new Exception('Silakan verifikasi email Anda terlebih dahulu.', 403);
        }

        if ($user->isSuspended()) {
            $formattedUntil = $user->suspended_until
                ? $user->suspended_until->translatedFormat('d F Y \j\a\m H:i') . ' WIB'
                : 'Permanen';
            $reason = $user->suspend_reason ?? 'Pelanggaran ketentuan tata tertib obrolan & informasi di sistem Lost & Found UISI';

            throw new Exception("Akun Anda sedang DITANGGUHKAN (SUSPEND) sampai {$formattedUntil}.\n\nAlasan Suspend: {$reason}", 403);
        }

        $token = $user->createToken('auth_token')->plainTextToken;

        return [
            'token' => $token,
            'user' => $user,
        ];
    }
}
